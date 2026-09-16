import copy
import importlib.util
import json
from pathlib import Path
import struct
import tempfile
import unittest
import wave

spec = importlib.util.spec_from_file_location('worker', Path(__file__).with_name('build-fullmix-inventory.py'))
worker = importlib.util.module_from_spec(spec)
spec.loader.exec_module(worker)


class FullMixWorkerTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.source = self.root / 'original.wav'
        self.samples = b''.join(struct.pack('<h', i - 50) for i in range(100))
        with wave.open(str(self.source), 'wb') as audio:
            audio.setparams((1, 2, 100, 100, 'NONE', 'not compressed'))
            audio.writeframes(self.samples)
        self.sha = worker.digest(self.source)
        self.member = {'source_track_id': '123', 'fm_id': 'fm-123', 'inventory_lane': 'FULLMIX',
                       'title': 'An instrumental-sounding title does not determine membership',
                       'local_source': {'path': 'original.wav', 'sha256': self.sha}}
        self.inventory = {'schema': 'FULLMIX_PRIVATE_BUILD_V1', 'current_fullmix_track_ids': ['123'],
                          'members': [self.member]}
        self.bundle = {'state': 'LOCKED', 'source_track_id': '123', 'fm_id': 'fm-123',
                       'source_sha256': self.sha, 'sample_rate': 100,
                       'blocks': [{'id': 'BLK1', 'start_frame': 7, 'end_frame': 29},
                                  {'id': 'BLK2', 'start_frame': 35, 'end_frame': 91}],
                       'kombos': [['BLK1', 'BLK2']]}

    def proof(self):
        refs = {}
        (self.root / 'transcript.txt').write_text('Test transcript fixture; not customer audio evidence.')
        for kind in ('source_authority', 'rights_lineage', 'complete_transcript', 'full_source_listening', 'locked_blk_map'):
            record = dict(self.bundle) if kind == 'locked_blk_map' else {
                'verification_state': 'VERIFIED', 'verification_record_ref': 'TEST-ONLY',
                'source_track_id': '123', 'fm_id': 'fm-123', 'source_sha256': self.sha}
            if kind == 'complete_transcript':
                record['transcript'] = {'path': 'transcript.txt', 'sha256': worker.digest(self.root / 'transcript.txt')}
            file = self.root / (kind + '.json')
            file.write_text(json.dumps(record))
            refs[kind] = {'path': file.name, 'sha256': worker.digest(file)}
        self.member['proof'] = refs

    def test_exact_samples_and_identical_replay(self):
        self.proof()
        receipt, first = worker.build(self.inventory, self.root, self.root / 'out', 1)
        self.assertEqual(receipt['capture_count'], 3)
        self.assertEqual(receipt['finished_ii_count'], 0)
        kk, _, kombo = receipt['members'][0]['captures']
        with wave.open(kk['path'], 'rb') as audio:
            self.assertEqual(audio.readframes(100), self.samples[7 * 2:29 * 2])
        with wave.open(kombo['path'], 'rb') as audio:
            self.assertEqual(audio.readframes(100), self.samples[7 * 2:91 * 2])
        _, replay = worker.build(self.inventory, self.root, self.root / 'out', 1)
        self.assertEqual(first, replay)
        self.assertEqual(worker.digest(self.source), self.sha)

    def test_conflicting_existing_capture_never_overwritten(self):
        target = self.root / 'out.wav'
        target.write_bytes(b'prior immutable identity')
        with self.assertRaisesRegex(worker.Hold, 'EXISTING_OUTPUT_CONFLICT'):
            worker.capture(self.source, target, 7, 29)
        self.assertEqual(target.read_bytes(), b'prior immutable identity')

    def test_all_324_members_survive_missing_sources_and_proof(self):
        members = [dict(self.member, source_track_id=str(i), fm_id='fm-' + str(i), local_source=None)
                   for i in range(324)]
        members[0]['local_source'] = self.member['local_source']
        inventory = dict(self.inventory, members=members, current_fullmix_track_ids=[str(i) for i in range(324)])
        receipt, _ = worker.build(inventory, self.root, self.root / 'out')
        self.assertEqual(receipt['inventory_count'], 324)
        self.assertEqual(receipt['source_copy_count'], 1)
        self.assertEqual(receipt['capture_count'], 0)
        self.assertTrue(all(m['inventory_active'] for m in receipt['members']))

    def test_instrumental_lane_and_identity_mismatch_rejected(self):
        invalid = copy.deepcopy(self.inventory)
        invalid['members'][0]['inventory_lane'] = 'INSTRO_ONLY'
        with self.assertRaisesRegex(worker.Hold, 'INSTRO_ONLY'):
            worker.validate_inventory(invalid, 1)
        invalid = copy.deepcopy(self.inventory)
        invalid['current_fullmix_track_ids'] = ['different']
        with self.assertRaisesRegex(worker.Hold, 'MEMBERSHIP_MISMATCH'):
            worker.validate_inventory(invalid, 1)

    def test_wrong_hash_and_unproven_boundaries_do_not_capture(self):
        self.member['local_source']['sha256'] = '0' * 64
        receipt, _ = worker.build(self.inventory, self.root, self.root / 'out', 1)
        self.assertEqual(receipt['members'][0]['reason'], 'EVIDENCE_HASH_CONFLICT')
        self.assertEqual(receipt['capture_count'], 0)
        self.bundle['source_sha256'] = '0' * 64
        with self.assertRaisesRegex(worker.Hold, 'BOUNDARY_SOURCE_HASH_CONFLICT'):
            worker.plan_captures(self.bundle, self.member, self.source)

    def test_noncontiguous_kombo_rejected(self):
        self.bundle['kombos'] = [['BLK2', 'BLK1']]
        with self.assertRaisesRegex(worker.Hold, 'NONCONTIGUOUS_KOMBO'):
            worker.plan_captures(self.bundle, self.member, self.source)

    def test_other_source_evidence_rejected(self):
        self.proof()
        file = self.root / 'rights_lineage.json'
        record = json.loads(file.read_text())
        record['source_track_id'] = 'other'
        file.write_text(json.dumps(record))
        self.member['proof']['rights_lineage']['sha256'] = worker.digest(file)
        receipt, _ = worker.build(self.inventory, self.root, self.root / 'out', 1)
        self.assertEqual(receipt['members'][0]['reason'], 'CROSS_SOURCE_RIGHTS_LINEAGE')
        self.assertEqual(receipt['capture_count'], 0)


if __name__ == '__main__':
    unittest.main()
