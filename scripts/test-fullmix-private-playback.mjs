import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import * as admin from '../lib/admin/adminSession.ts';

const previous = process.env.ADMIN_PREVIEW_TOKEN;
process.env.ADMIN_PREVIEW_TOKEN = 'test-only-owner-credential';
const signedCookie = admin.adminSessionCookieValue();
const events = [];
let currentMember = true;
const service = {
  from(name) {
    assert.equal(name, 'gpm_stl_current_split_inventory_v2');
    return { select() { return this; }, eq(column, value) {
      if (column === 'inventory_lane') assert.equal(value, 'FULLMIX');
      return this;
    }, async maybeSingle() { return {data: currentMember ? {disco_track_id: '123'} : null, error: null}; } };
  },
  storage: { from(bucket) {
    assert.equal(bucket, 'private-tracks');
    return { async createSignedUrl(path) {
      assert.equal(path, 'recorded-source.wav'); events.push('sign');
      return {data: {signedUrl: 'https://audio.example.invalid/test'}, error: null};
    }};
  }},
};
const code = ts.transpileModule(fs.readFileSync(new URL('../app/api/admin/stl-listen/audio/[id]/route.ts', import.meta.url), 'utf8'), {
  compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022},
}).outputText;
const module = {exports: {}};
class NextResponse extends Response {}
vm.runInNewContext(code, {
  exports: module.exports, module, Response, Headers, AbortSignal, URL,
  process: {env: {NEXT_PUBLIC_SUPABASE_URL: 'https://db.example.invalid', SUPABASE_SERVICE_ROLE_KEY: 'test-only-service'}},
  require(name) {
    if (name === '@supabase/supabase-js') return {createClient: () => service};
    if (name === 'next/server') return {NextResponse};
    if (name === '@/lib/admin/adminSession') return admin;
    if (name === '@/lib/gpmx/stlWavResolver') return {resolveGpmxWav: async () => null};
    if (name === '@/lib/gpmx/storedFullMixWavs') return {storedFullMixWavs: async (_service, ids) => {
      assert.equal(ids.join(','), '123'); events.push('private-lookup');
      return new Map([['123', {bucket: 'private-tracks', path: 'recorded-source.wav'}]]);
    }};
    throw new Error('Unexpected import: ' + name);
  },
  fetch: async (_url, options) => {
    events.push('audio-read');
    assert.equal(options.headers.range, 'bytes=0-11');
    return new Response('RIFF0000WAVE', {status: 206, headers: {'content-type': 'audio/wav', 'content-range': 'bytes 0-11/1024'}});
  },
});
const request = (token, cookie) => ({headers: new Headers({'range': 'bytes=0-11', ...(token ? {'x-admin-token': token} : {})}), cookies: {get: () => cookie ? {value: cookie} : undefined}});
try {
  for (const req of [request(), request('wrong'), request(null, 'forged')]) {
    events.length = 0;
    assert.equal((await module.exports.GET(req, {params: Promise.resolve({id: '123'})})).status, 401);
    assert.deepEqual(events, []);
  }
  for (const req of [request('test-only-owner-credential'), request(null, signedCookie)]) {
    events.length = 0;
    const response = await module.exports.GET(req, {params: Promise.resolve({id: '123'})});
    assert.equal(response.status, 206);
    assert.equal(await response.text(), 'RIFF0000WAVE');
    assert.equal(response.headers.get('cache-control'), 'private, no-store, max-age=0');
    assert.deepEqual(events, ['private-lookup', 'sign', 'audio-read']);
  }
  currentMember = false; events.length = 0;
  assert.equal((await module.exports.GET(request(null, signedCookie), {params: Promise.resolve({id: '123'})})).status, 404);
  assert.deepEqual(events, []);
  delete process.env.ADMIN_PREVIEW_TOKEN;
  assert.equal(admin.verifiedOwnerAccess('test-only-owner-credential', signedCookie), false);
  console.log('PASS: anonymous/forged credentials cannot access private audio; verified token/session can; current FullMix membership and private caching enforced');
} finally {
  if (previous === undefined) delete process.env.ADMIN_PREVIEW_TOKEN;
  else process.env.ADMIN_PREVIEW_TOKEN = previous;
}
