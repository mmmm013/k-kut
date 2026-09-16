import assert from 'node:assert/strict';
import { buildFullMixListeningInventory } from '../lib/gpmx/fullmixListeningInventory.ts';
import { storedFullMixWavs } from '../lib/gpmx/storedFullMixWavs.ts';

const members = Array.from({ length: 324 }, (_, index) => ({
  disco_track_id: String(index + 1),
  track_name: index === 0 ? 'Title containing INSTRO' : `Source ${index + 1}`,
}));

const disconnected = buildFullMixListeningInventory(members, new Map(), 'Share authority not configured');
assert.deepEqual(disconnected.items.map(row => row.disco_track_id), members.map(row => row.disco_track_id));
assert.equal(disconnected.total, 324);
assert.equal(disconnected.resolved, 0);
assert.equal(disconnected.unresolved, 324);
assert.ok(disconnected.items.every(row => row.wavReady === false));
assert.equal(disconnected.error, undefined);

const partial = buildFullMixListeningInventory(members, new Map([['1', {}], ['outside-current-fullmix', {}]]), null);
assert.equal(partial.total, 324);
assert.equal(partial.resolved, 1);
assert.equal(partial.unresolved, 323);
assert.equal(partial.items[0].resolved, 'GPMX_ORIGINAL_WAV');
assert.ok(partial.items.every(row => !('product_ready' in row) && !('approved' in row)));

const withdrawn = buildFullMixListeningInventory(members, new Map(), null);
assert.equal(withdrawn.items[0].wavReady, false);
assert.equal(withdrawn.total, 324);
const storage = buildFullMixListeningInventory(members, new Map([['1', {}]]), null, new Map([['1', {}], ['2', {}], ['outside', {}]]));
assert.equal(storage.total, 324);
assert.equal(storage.resolved, 1);
assert.equal(storage.items[0].resolved, 'GPMX_ORIGINAL_WAV');
assert.equal(storage.items[1].resolved, null);
assert.equal(storage.items[1].wavReady, false);
assert.equal(storage.items[1].storedCopyLocated, true);
let requestedIds;
const filters = [];
const mockRows = [
  { stl_track_id: '1', wav_bucket: 'tracks', wav_object_path: 'recorded.wav' },
  { stl_track_id: '2', wav_bucket: 'tracks', wav_object_path: 'absent.wav' },
  { stl_track_id: '3', wav_bucket: 'tracks', wav_object_path: 'one.wav' },
  { stl_track_id: '3', wav_bucket: 'tracks', wav_object_path: 'conflict.wav' },
  { stl_track_id: '4', wav_bucket: 'tracks', wav_object_path: 'preview.mp3' },
];
const query = {
  select() { return this; },
  in(column, ids) { assert.equal(column, 'stl_track_id'); requestedIds = ids; return this; },
  eq(column, value) { filters.push([column, value]); return this; },
  not() { return this; },
  then(resolve) { return Promise.resolve({data: mockRows, error: null}).then(resolve); },
};
const checkedPaths = [];
const references = await storedFullMixWavs({
  from(table) { assert.equal(table, 'gpmc_4pe_fm_registry_ee'); return query; },
  storage: { from(bucket) { assert.equal(bucket, 'tracks'); return { async info(path) {
    checkedPaths.push(path);
    return path === 'recorded.wav' ? {data: {size: 1234}, error: null} : {data: null, error: new Error('missing')};
  }}; }},
}, ['1', '2', '3', '4']);
assert.deepEqual(requestedIds, ['1', '2', '3', '4']);
assert.deepEqual(filters, [['fm_state', 'ACTIVE'], ['source_lane', 'FULLMIX']]);
assert.deepEqual([...references], [['1', {bucket: 'tracks', path: 'recorded.wav'}]]);
assert.deepEqual(checkedPaths.sort(), ['absent.wav', 'recorded.wav']);
console.log('PASS: source failure, partial resolution, title independence, exact membership, and withdrawn link');
