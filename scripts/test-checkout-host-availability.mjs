import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

// Isolated environment: no real keys, network requests, orders, or payments.
const env = {};
const modules = {};
function load(name) {
  const exports = {};
  const source = ts.transpileModule(fs.readFileSync(`lib/${name}.ts`, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  vm.runInNewContext(source, { exports, process: { env }, require: name => modules[name.replace('./', '')] });
  return exports;
}
modules.paymentRolloutStatus = load('paymentRolloutStatus');
const { checkoutAvailability } = load('checkoutAvailability');
let cases = 0;
for (const applicationEnv of [undefined, 'preview', 'production']) {
  for (const vercelEnv of [undefined, 'preview', 'production']) {
    for (const key of [undefined, 'test-placeholder-never-sent']) {
      for (const disabled of [undefined, '1']) {
        Object.assign(env, {
          K_KUT_DEPLOYMENT_ENV: applicationEnv,
          VERCEL_ENV: vercelEnv,
          STRIPE_SECRET_KEY: key,
          K_KUT_PAYMENT_LINKS_START_DATE: '2020-01-01',
          K_KUT_PAYMENT_LINKS_FORCE_DISABLE: disabled,
        });
        assert.equal(checkoutAvailability().enabled,
          (applicationEnv ?? vercelEnv) === 'production' && !!key && disabled !== '1');
        cases++;
      }
    }
  }
}
for (const start of [undefined, 'invalid', '2999-01-01']) {
  Object.assign(env, { K_KUT_DEPLOYMENT_ENV: 'production', STRIPE_SECRET_KEY: 'test-placeholder-never-sent', K_KUT_PAYMENT_LINKS_FORCE_DISABLE: '', K_KUT_PAYMENT_LINKS_START_DATE: start });
  assert.equal(checkoutAvailability().enabled, false);
  cases++;
}
console.log(`${cases} checkout host/credential/rollout combinations passed`);
