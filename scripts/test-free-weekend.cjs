const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const assert = require('node:assert/strict');
const Stripe = require('stripe');
const cache = {};
const overrides = {};
function load(file, globals = {}) {
  const exports = {};
  const req = name => {
    if (overrides[name]) return overrides[name];
    if (name.startsWith('@/')) return cached(name.slice(2) + '.ts');
    if (name.startsWith('./')) return cached('lib/' + name.slice(2).replace(/\.ts$/, '') + '.ts');
    return require(name);
  };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  }).outputText, { exports, require: req, process, console, Date, URL, ...globals });
  return exports;
}
function cached(file) { return cache[file] ||= load(file); }
const pricing = cached('lib/weekendPricing.ts');
const validate = cached('lib/paidCheckoutValidation.ts').validatePaidCheckout;
const start = Date.parse(pricing.FREE_WEEKEND_START);
const end = Date.parse(pricing.FREE_WEEKEND_END);
let checks = 0;
for (const [product, family, price] of [['HUG','KK',799],['TUG','SK',499],['BUG','MK',199]]) {
  for (const [time, expected] of [[start-1,price],[start,0],[end-1,0],[end,price],[end+1,price]]) {
    assert.equal(pricing.weekendPricing(price,new Date(time)).amountCents,expected); checks++;
  }
  const option = { public_option_id:'option_1', kk_id_or_delivery_object_id:'ii_1', product_family:product, inventory_family:family,price_cents:price,payment_allowed:true };
  const session = { id:'cs_test_1', created:(end/1000)-1, status:'complete',payment_status:'no_payment_required',amount_total:0,currency:'usd',metadata:{public_option_id:'option_1',selected_hug_id:'ii_1',product_family:product,inventory_family:family,locked_price_cents:String(price),promotion_id:pricing.FREE_WEEKEND_ID}};
  assert.equal(validate(session,option),null);checks++;
  for (const bad of [{created:end/1000},{created:start/1000-1},{created:undefined},{status:'open'},{payment_status:'unpaid'},{amount_total:1},{currency:'eur'},{metadata:{...session.metadata,promotion_id:'forged'}},{metadata:{...session.metadata,selected_hug_id:'other'}}]) {
    assert.notEqual(validate({...session,...bad},option),null);checks++;
  }
  assert.notEqual(validate(session,null),null); checks++;
  assert.notEqual(validate(session,{...option,payment_allowed:false}),null); checks++;
  assert.equal(validate({...session,created:end/1000,payment_status:'paid',amount_total:price},option),null);checks++;
}
(async()=>{
  // Execute the real webhook handler with real Stripe signature verification.
  // Stub only storage and catalog; no customer data, grants, or live payments.
  const env={ STRIPE_SECRET_KEY:'sk_test_localonly',STRIPE_WEBHOOK_SECRET:'whsec_localonly' };
  const option={public_option_id:'option_1',kk_id_or_delivery_object_id:'ii_1',product_family:'HUG',inventory_family:'KK',price_cents:799,payment_allowed:true};
  const records=new Map(); let storageFails=false;
  overrides['next/server']={NextResponse:{json:(body,options={})=>({body,status:options.status||200})}};
  overrides['@/lib/publication-bridge/approvedPublicOptions']={findApprovedPublicOptionByPublicOptionId:()=>option};
  overrides['@/lib/h2PendingOrder']={consumePendingH2Order:async()=>({inventoryId:'ii_1',personalNote:'For you',publicProductName:'HUG',bfProfile:'k-kut',originDomain:'test.invalid'}),h2PendingOrderStoreConfigured:()=>true};
  overrides['@/lib/paidFulfillmentStore']={persistPaidFulfillment:async record=>{if(storageFails) throw Error('test_storage_failure');records.set(record.stripe_event_id,record);return 'durable_free_manual_fulfillment_recorded';}};
  const webhook=load('app/api/stripe/webhook/route.ts',{process:{env},console:{info(){},error(){}}});
  const session={id:'cs_test_1',created:start/1000,status:'complete',payment_status:'no_payment_required',amount_total:0,currency:'usd',client_reference_id:'H2_'+'a'.repeat(32),metadata:{public_option_id:'option_1',selected_hug_id:'ii_1',product_family:'HUG',inventory_family:'KK',locked_price_cents:'799',promotion_id:pricing.FREE_WEEKEND_ID,delivery_method:'share_link'}};
  async function deliver(object,signature=true){const payload=JSON.stringify({id:'evt_test_1',type:'checkout.session.completed',data:{object}});const sig=Stripe.webhooks.generateTestHeaderString({payload,secret:env.STRIPE_WEBHOOK_SECRET});return webhook.POST({headers:{get:()=>signature?sig:'invalid'},text:async()=>payload});}
  assert.equal((await deliver(session,false)).status,400);checks++;
  assert.equal((await deliver(session)).status,200);checks++;
  assert.equal(records.get('evt_test_1').status,'free_needs_manual_fulfillment');checks++;
  assert.equal(records.get('evt_test_1').amount_paid_usd,'0.00');checks++;
  assert.equal(records.get('evt_test_1').selected_hug_id,'ii_1');checks++;
  assert.equal((await deliver({...session,created:end/1000})).status,409);checks++;
  storageFails=true;assert.equal((await deliver(session)).status,500);checks++;
  // Real checkout route, mocked Stripe transport: inspect exact parameters sent.
  let sent; let enabled=true;
  overrides['@/lib/checkoutAvailability']={checkoutProductionEnvironment:()=>enabled};
  overrides['@/lib/checkoutPendingOrderAuthority']={createCheckoutPendingOrderAuthority:async()=>({ok:true,rollout:{enabled:true},clientReference:'H2_'+'a'.repeat(32),stripeSecretKey:'sk_test_localonly'})};
  overrides['next/server'].NextResponse.redirect=(url,status)=>({url:String(url),status});
  overrides.stripe=class {constructor(){this.checkout={sessions:{create:async params=>{sent=params;return {url:'https://checkout.stripe.com/test-only'};}}};}};
  for(const time of [end-1000,end,end+1000]) {
    class Clock extends Date {constructor(...args){super(...(args.length?args:[time]));} static now(){return time;}}
    cache['lib/weekendPricing.ts']=load('lib/weekendPricing.ts',{Date:Clock});
    const route=load('app/checkout/route.ts',{Date:Clock});
    const values={public_option_id:'option_1',ii:'ii_1',delivery_method:'share_link',personal_note:''};
    const request={url:'https://test.invalid/checkout',headers:{get:()=>null},formData:async()=>({get:key=>values[key]||null})};
    assert.equal((await route.POST(request)).status,303);checks++;
    assert.equal(sent.line_items[0].price_data.unit_amount,time<end?0:799);checks++;
    assert.equal(!!sent.payment_intent_data,time>=end);checks++;
    assert.equal(sent.metadata.locked_price_cents,'799');checks++;
  }
  console.log(`${checks} free-weekend boundary, price, approval, signature, and webhook assertions passed`);
})().catch(e=>{console.error(e);process.exitCode=1;});
