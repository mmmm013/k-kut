import assert from 'node:assert/strict';
import { buildFullMixListeningInventory } from '../lib/gpmx/fullmixListeningInventory.ts';

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
console.log('PASS: source failure, partial resolution, title independence, exact membership, and withdrawn link');
