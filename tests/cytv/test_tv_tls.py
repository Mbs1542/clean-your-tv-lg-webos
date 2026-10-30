"""TLS and pairing against a loopback TV; no device credentials or discovery."""
import datetime
import json
import logging
from pathlib import Path
import ssl
import tempfile
import threading
import unittest
from unittest.mock import patch

from cryptography import x509
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.x509.oid import NameOID
from websockets.exceptions import InvalidStatus
from websockets.datastructures import Headers
from websockets.http11 import Response
from websockets.sync.client import connect
from websockets.sync.server import serve

from cytv.tv import SSAP, tv_context
from cytv.errors import UserError


class TVTLSTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.directory = tempfile.TemporaryDirectory()
        cls.addClassCleanup(cls.directory.cleanup)
        root = Path(cls.directory.name)
        key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
        name = x509.Name([x509.NameAttribute(NameOID.COMMON_NAME, 'localhost')])
        now = datetime.datetime.now(datetime.timezone.utc)
        cert = (x509.CertificateBuilder().subject_name(name).issuer_name(name)
                .public_key(key.public_key()).serial_number(x509.random_serial_number())
                .not_valid_before(now - datetime.timedelta(minutes=1))
                .not_valid_after(now + datetime.timedelta(days=1)).sign(key, hashes.SHA256()))
        cls.cert_path, cls.key_path = root / 'cert.pem', root / 'key.pem'
        cls.cert_path.write_bytes(cert.public_bytes(serialization.Encoding.PEM))
        cls.key_path.write_bytes(key.private_bytes(serialization.Encoding.PEM,
                                 serialization.PrivateFormat.PKCS8, serialization.NoEncryption()))

    def pair_loopback(self, cipher=None, reject=False, saved=True):
        context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
        context.load_cert_chain(self.cert_path, self.key_path)
        # Sync peers start their readers before the WebSocket upgrade. Keep TLS 1.3
        # but avoid post-handshake tickets racing the client's first write.
        context.num_tickets = 0
        if cipher:
            context.minimum_version = context.maximum_version = ssl.TLSVersion.TLSv1_2
            context.set_ciphers(cipher)
        requests, negotiated, attempts = [], [], []

        def handle(ws):
            negotiated.append((ws.socket.version(), ws.socket.cipher()[0]))
            requests.append(json.loads(ws.recv(timeout=10)))
            response = {'type': 'error'} if reject else {
                'type': 'registered', 'payload': {'client-key': 'loopback-key'}}
            ws.send(json.dumps(response))

        logger = logging.getLogger('cytv-test-tls')
        with patch.object(logger, 'disabled', True), \
                serve(handle, '127.0.0.1', 0, ssl=context, open_timeout=10,
                      close_timeout=3, logger=logger) as server:
            thread = threading.Thread(target=server.serve_forever, daemon=True)
            thread.start()
            port = server.socket.getsockname()[1]

            def local_connect(uri, **kwargs):
                self.assertEqual(uri, 'wss://127.0.0.1:3001')
                self.assertIsNone(kwargs['proxy'])
                self.assertGreaterEqual(kwargs['ssl'].minimum_version, ssl.TLSVersion.TLSv1_2)
                self.assertGreaterEqual(kwargs['ssl'].security_level, 2)
                attempts.append(kwargs['ssl'])
                return connect(f'wss://127.0.0.1:{port}', **kwargs)

            try:
                with tempfile.TemporaryDirectory() as tmp, \
                        patch('websockets.sync.client.connect', side_effect=local_connect):
                    keyfile = Path(tmp) / 'ssap.json'
                    if saved:
                        keyfile.write_text(json.dumps({'key': 'saved-loopback-key'}))
                    if reject:
                        with self.assertRaisesRegex(UserError, 'rejected'):
                            with SSAP('127.0.0.1', tmp, lambda _: None):
                                self.fail('Rejected pairing must not succeed')
                        self.assertEqual(json.loads(keyfile.read_text()), {'key': 'saved-loopback-key'})
                    else:
                        with SSAP('127.0.0.1', tmp, lambda _: None) as tv:
                            self.assertEqual(tv.key, 'loopback-key')
                        self.assertEqual(json.loads(keyfile.read_text()), {'key': 'loopback-key'})
            finally:
                server.shutdown()
                thread.join(timeout=5)
                self.assertFalse(thread.is_alive())
        self.assertEqual(len(requests), 1)
        self.assertEqual(requests[0]['type'], 'register')
        if saved:
            self.assertEqual(requests[0]['payload']['client-key'], 'saved-loopback-key')
        else:
            self.assertNotIn('client-key', requests[0]['payload'])
        return attempts, negotiated

    def test_default_tls_pairs_without_compatibility_retry(self):
        for saved in (False, True):
            with self.subTest(saved=saved):
                attempts, _ = self.pair_loopback(saved=saved)
                self.assertEqual(len(attempts), 1)

    def test_rsa_only_tls12_retries_then_pairs_over_encrypted_websocket(self):
        for cipher in ('AES128-GCM-SHA256', 'AES256-GCM-SHA384'):
            for saved in (False, True):
                with self.subTest(cipher=cipher, saved=saved):
                    attempts, negotiated = self.pair_loopback(cipher, saved=saved)
                    self.assertEqual(len(attempts), 2)
                    self.assertEqual(negotiated, [('TLSv1.2', cipher)])

    def test_pairing_rejection_is_not_retried(self):
        attempts, _ = self.pair_loopback(reject=True)
        self.assertEqual(len(attempts), 1)

    def test_compatible_context_adds_only_rsa_aes_gcm_without_lowering_policy(self):
        normal, compatible = tv_context(), tv_context(compatible=True)
        normal_names = {c['name'] for c in normal.get_ciphers()}
        compatible_names = {c['name'] for c in compatible.get_ciphers()}
        self.assertEqual(compatible_names - normal_names,
                         {'AES128-GCM-SHA256', 'AES256-GCM-SHA384'})
        self.assertTrue(normal_names <= compatible_names)
        self.assertEqual(compatible.minimum_version, normal.minimum_version)
        self.assertGreaterEqual(compatible.minimum_version, ssl.TLSVersion.TLSv1_2)
        self.assertEqual(compatible.security_level, normal.security_level)

    def test_non_tls_connect_errors_are_not_retried(self):
        for error in (TimeoutError('timeout'), ConnectionRefusedError('refused'),
                      ValueError('invalid endpoint'),
                      InvalidStatus(Response(403, 'Forbidden', Headers()))):
            with self.subTest(error=type(error).__name__), tempfile.TemporaryDirectory() as tmp, \
                    patch('websockets.sync.client.connect', side_effect=error) as dial:
                with self.assertRaises(type(error)) as caught:
                    SSAP('127.0.0.1', tmp, lambda _: None).__enter__()
                self.assertIs(caught.exception, error)
                self.assertEqual(dial.call_count, 1)
                self.assertFalse((Path(tmp) / 'ssap.json').exists())

    def test_second_tls_failure_propagates_without_saving_a_key(self):
        first, second = ssl.SSLEOFError('first handshake'), ssl.SSLError('second handshake')
        with tempfile.TemporaryDirectory() as tmp, \
                patch('websockets.sync.client.connect', side_effect=[first, second]) as dial:
            with self.assertRaises(ssl.SSLError) as caught:
                SSAP('127.0.0.1', tmp, lambda _: None).__enter__()
            self.assertIs(caught.exception, second)
            self.assertEqual(dial.call_count, 2)
            self.assertFalse((Path(tmp) / 'ssap.json').exists())

    def test_tls_error_after_connect_does_not_restart_pairing(self):
        class Socket:
            closed = False
            def send(self, data):
                raise ssl.SSLError('TLS failure after connect')
            def close(self):
                self.closed = True
        socket = Socket()
        with tempfile.TemporaryDirectory() as tmp, \
                patch('websockets.sync.client.connect', return_value=socket) as dial:
            with self.assertRaises(ssl.SSLError):
                SSAP('127.0.0.1', tmp, lambda _: None).__enter__()
            self.assertTrue(socket.closed)
            self.assertEqual(dial.call_count, 1)
            self.assertFalse((Path(tmp) / 'ssap.json').exists())


if __name__ == '__main__':
    unittest.main()
