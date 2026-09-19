import assert from 'node:assert/strict';
import { validate4peIntakeEvidence as jsGate } from './lib/4pe-intake-evidence-gate.mjs';
import { validate4peIntakeEvidence as tsGate } from '../lib/kkr/intakeEvidenceGate.ts';

// Artificial range fixtures only; never song boundaries or production audio evidence.
function fixture() {
  return { full_lyric_read: true, lyric_authority_sha256: 'fixture', source_audio_sha256: 'fixture',
    lt_pix_track_id: 'fixture', in_pix_track_id: 'fixture', blks: [
      {id:'A', lines:['fixture','only'], vtp:{start_sec:2,end_sec:4}, intp:{start_sec:1,end_sec:5}, sister_pair_id:'A-pair',mgs:'fixture'},
      {id:'B', lines:['fixture','only'], vtp:{start_sec:8,end_sec:10}, intp:{start_sec:7,end_sec:11}, sister_pair_id:'B-pair',mgs:'fixture'}
    ]};
}
let checks = 0;
function check(edit, expected) {
  const data=fixture(); edit(data);
  const js=jsGate(data), ts=tsGate(data);
  assert.deepEqual(js, ts);
  if(expected === true) assert.equal(js.passed,true);
  else { assert.equal(js.passed,false); assert.ok(js.reasons.includes(expected),JSON.stringify(js)); }
  checks++;
}
check(()=>{},true);
check(d=>{d.blks[0].intp={start_sec:2,end_sec:4}},true);
check(d=>{d.blks[0].intp.start_sec=3},'blk_1_intp_does_not_embrace_vtp');
check(d=>{d.blks[0].intp.end_sec=3},'blk_1_intp_does_not_embrace_vtp');
for(const value of [null,undefined,'',false,NaN,Infinity,-1]) {
  check(d=>{d.blks[0].intp.start_sec=value},'blk_1_intp_missing_or_invalid');
}
check(d=>{d.blks[0].intp.end_sec=11},'blk_1_intp_embraces_another_vtp');
check(d=>{d.blks[1].sister_pair_id='A-pair'},'blk_2_sister_pair_reused');
check(d=>{d.blks[1].id='A'},'blk_2_id_reused');
check(d=>{d.blks[0]=null},'blk_1_id_missing');
check(d=>{d.blks[0].vtp={start_sec:4,end_sec:2}},'blk_1_vtp_missing_or_invalid');
check(d=>{d.blks[0].intp={start_sec:0,end_sec:5}},true);
console.log(`${checks} contract cases passed in both TypeScript and JavaScript gates. No audio QC or production boundaries asserted.`);
