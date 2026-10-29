"""Root QA signing admission must bind trusted successful builds and exact archives."""
import copy,hashlib,importlib.util,io,tempfile,unittest,zipfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
spec=importlib.util.spec_from_file_location('root_candidate_feeds',ROOT/'scripts/root-candidate-feeds.py')
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)

class AdmissionTests(unittest.TestCase):
 def setUp(self):
  self.run={'id':12,'run_attempt':1,'head_sha':'a'*40,'head_branch':'release/next','head_repository':{'full_name':m.REPO},'event':'push','path':'.github/workflows/cytv.yml','status':'completed','conclusion':'success'}
  self.jobs=[{'name':name,'conclusion':'success'} for name in m.BUILD_JOBS]
  self.versions={'release':'1.5.0','cytv':'0.6.0','home':'1.6.0','helper':'0.6.20','root':'0.6.0','updater':'0.3.3','android':'0.5.0','android_version_code':15}
 def check(self,run=None,jobs=None,tag='v1.5.0',published=()):return m.validate_run(self.run if run is None else run,self.jobs if jobs is None else jobs,tag,self.versions,published)
 def test_complete_origin_build_is_admitted(self):self.assertEqual(self.check()['source'],'a'*40)
 def test_foreign_or_incomplete_runs_are_rejected(self):
  cases=[('head_branch','main'),('event','pull_request'),('path','.github/workflows/tests.yml'),('status','in_progress'),('conclusion','failure'),('run_attempt',0),('head_sha','bad'),('head_repository',{'full_name':'foreign/repo'})]
  for field,value in cases:
   run=copy.deepcopy(self.run);run[field]=value
   with self.subTest(field=field),self.assertRaises(ValueError):self.check(run=run)
 def test_missing_required_job_and_wrong_release_are_rejected(self):
  with self.assertRaises(ValueError):self.check(jobs=self.jobs[:-1])
  with self.assertRaises(ValueError):self.check(tag='v1.5.1')
  with self.assertRaises(ValueError):self.check(tag='v1.5.0',published=['v1.5.0'])
 def test_only_one_current_digest_bound_cli_artifact_is_accepted(self):
  artifact={'id':34,'name':'cytv-macos-arm64','expired':False,'size_in_bytes':50,'digest':'sha256:'+'b'*64,'workflow_run':{'id':12,'head_sha':'a'*40}}
  self.assertEqual(m.artifact_info([artifact],self.run)['id'],34)
  for entries in ([],[artifact,artifact],[dict(artifact,expired=True)],[dict(artifact,digest=None)],[dict(artifact,workflow_run={'id':999,'head_sha':'a'*40})]):
   with self.assertRaises(ValueError):m.artifact_info(entries,self.run)
 def test_exact_archive_digest_and_single_regular_cli_are_required(self):
  with tempfile.TemporaryDirectory() as tmp:
   archive=Path(tmp)/'cli.zip';out=Path(tmp)/'cli'
   with zipfile.ZipFile(archive,'w') as z:z.writestr('cytv',b'compiled fixture')
   digest=hashlib.sha256(archive.read_bytes()).hexdigest();m.read_cli_archive(archive,digest,out);self.assertEqual(out.read_bytes(),b'compiled fixture')
   with self.assertRaises(ValueError):m.read_cli_archive(archive,'0'*64,Path(tmp)/'wrong')
   with zipfile.ZipFile(archive,'w') as z:z.writestr('../cytv',b'outside')
   with self.assertRaises(ValueError):m.read_cli_archive(archive,hashlib.sha256(archive.read_bytes()).hexdigest(),Path(tmp)/'outside')

if __name__=='__main__':unittest.main()
