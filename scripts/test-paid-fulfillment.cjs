const ts = require('typescript');
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
function load(file, globals = {}) {
  const ctx = { exports: {}, ...globals };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText, ctx);
  return ctx.exports;
}
async function main() {
  const check = load('lib/paidCheckoutValidation.ts').validatePaidCheckout;
  let count = 0;
  for (const [product, family, price] of [['HUG', 'KK', 799], ['TUG', 'SK', 499], ['BUG', 'MK', 199]]) {
    const option = { public_option_id: 'option_123', kk_id_or_delivery_object_id: 'ii_123', product_family: product, inventory_family: family, price_cents: price, payment_allowed: true };
    const paid = { id: 'cs_test_123', payment_status: 'paid', amount_total: price, currency: 'usd', metadata: { public_option_id: 'option_123', selected_hug_id: 'ii_123', product_family: product, inventory_family: family, locked_price_cents: String(price) } };
    assert.equal(check(paid, option), null); count++;
    for (const change of [{ payment_status: 'unpaid' }, { amount_total: price + 1 }, { currency: 'eur' }, { metadata: { ...paid.metadata, selected_hug_id: 'wrong' } }]) {
      assert.notEqual(check({ ...paid, ...change }, option), null); count++;
    }
    assert.notEqual(check(paid, { ...option, payment_allowed: false }), null); count++;
    assert.notEqual(check(paid, null), null); count++;
  }
  const env = {};
  const writes = new Map();
  let fail = false;
  const store = load('lib/paidFulfillmentStore.ts', {
    process: { env },
    require: () => ({ createClient: () => ({
      from: name => { assert.equal(name, 'stripe_webhook_events'); return {
        upsert: async (row, options) => {
          assert.equal(options.onConflict, 'id');
          assert.equal(options.ignoreDuplicates, true);
          if (fail) return { error: { message: 'database unavailable' } };
          if (!writes.has(row.id)) writes.set(row.id, row);
          return { error: null };
        },
      }; },
    }) }),
  }).persistPaidFulfillment;
  const record = { stripe_event_id: 'evt_test_1', status: 'paid_needs_manual_fulfillment' };
  await assert.rejects(store(record), /not_configured/); count++;
  env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.invalid';
  env.SUPABASE_SERVICE_ROLE_KEY = 'test-only';
  assert.equal(await store(record), 'durable_paid_manual_fulfillment_recorded'); count++;
  await store(record);
  assert.equal(writes.size, 1); count++;
  assert.equal(writes.get('render_fulfillment_evt_test_1').processed_at, null); count++;
  fail = true;
  await assert.rejects(store(record), /write_failed/); count++;
  console.log(count + ' payment selection and durable retry assertions passed');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
