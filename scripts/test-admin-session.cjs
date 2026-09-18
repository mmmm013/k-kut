const ts = require('typescript');
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = ts.transpileModule(fs.readFileSync('lib/admin/adminSession.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText;
const env = {};
const context = { exports: {}, require, Buffer, process: { env } };
vm.runInNewContext(source, context);
const auth = context.exports;
assert.equal(auth.trustedProtectedPreview(), false, 'Deployment alone must never authorize an owner');
assert.equal(auth.validAdminToken(''), false);
assert.equal(auth.validAdminSession(''), false);
env.ADMIN_PREVIEW_TOKEN = 'test-owner-secret';
assert.equal(auth.validAdminToken('wrong'), false);
assert.equal(auth.validAdminToken('test-owner-secret'), true);
const cookie = auth.adminSessionCookieValue();
assert.equal(auth.validAdminSession(cookie), true);
assert.equal(auth.validAdminSession(cookie + 'x'), false);
env.ADMIN_PREVIEW_TOKEN = 'rotated';
assert.equal(auth.validAdminSession(cookie), false);
console.log('8 owner authentication assertions passed');
