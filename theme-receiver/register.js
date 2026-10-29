'use strict';
var core = require('./core');
var texts = {
  'caller-not-authorized':'Caller is not authorized', 'invalid-session':'Receiver session is unavailable',
  'session-expired':'Receiver session expired', 'receiver-busy':'Receiver is already active',
  'receiver-unavailable':'Receiver could not start', 'not-received':'No theme has been received',
  'invalid-offset':'Invalid read offset', 'invalid-request':'Invalid receiver request'
};
function register(service, options) {
  options = options || {};
  if (!options.appId || typeof options.appId !== 'string') throw new Error('appId required');
  var receiver = core.create(options);
  var methods = {themeReceiverStart:'start', themeReceiverStatus:'status', themeReceiverRead:'read', themeReceiverStop:'stop'};
  Object.keys(methods).forEach(function (method) {
    service.register(method, function (message) {
      function fail(code) { message.respond({returnValue:false, errorCode:code, errorText:texts[code] || 'Receiver request failed'}); }
      var id;
      try { id = message.ls2Message.applicationID(); } catch (_) { fail('caller-not-authorized'); return; }
      if (typeof id !== 'string' || id.split(' ')[0] !== options.appId) { fail('caller-not-authorized'); return; }
      var payload = message.payload || {}, operation = methods[method], result;
      if (operation !== 'start' && (typeof payload.sessionId !== 'string' || payload.sessionId.length > 128)) { fail('invalid-request'); return; }
      try { result = receiver[operation](payload.sessionId, payload.offset); }
      catch (e) { fail(texts[e.code] ? e.code : 'invalid-request'); return; }
      Promise.resolve(result).then(function (value) {
        var response = {returnValue:true};
        Object.keys(value || {}).forEach(function (key) { response[key] = value[key]; });
        message.respond(response);
      }, function (e) { fail(texts[e.code] ? e.code : 'receiver-unavailable'); });
    });
  });
  return receiver;
}
module.exports = register;
module.exports.register = register;
