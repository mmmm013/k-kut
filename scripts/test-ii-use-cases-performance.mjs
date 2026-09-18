import {performance} from 'node:perf_hooks';
import {writeFileSync} from 'node:fs';
const base=process.env.KKUT_TEST_BASE_URL || 'http://127.0.0.1:3100';
const local=['localhost','127.0.0.1'].includes(new URL(base).hostname);
const rows=[];
async function request(path, options={}) {
 const t=performance.now();
 try { const r=await fetch(new URL(path,base),{redirect:'manual',signal:AbortSignal.timeout(60000),...options}); const body=await r.text();return {path,status:r.status,ms:Math.round((performance.now()-t)*10)/10,bytes:Buffer.byteLength(body),location:r.headers.get('location'),body}; }
 catch(e){return {path,status:0,ms:Math.round(performance.now()-t),error:e.message,body:''};}
}
function save(name,r,pass,detail=''){rows.push({name,...r,body:undefined,pass,detail});}
const themePaths=['bad-day','big-win','make-it-right','just-because-care','miss-them','first-day-nerves','proud-of-them','thinking-of-you','long-week','breakup-blues','new-baby','just-because-smile','friends'].map(x=>'/hugz/'+x);
const pages=[...themePaths,'/','/hug','/find','/find?mode=hug','/find?mode=tug','/find?mode=bug','/find?mode=invalid&q=zzzz_no_match','/find?q=thank+you','/find?q=%3Cscript%3Ealert(1)%3C%2Fscript%3E','/themes','/personal','/personal/apology','/personal/anniversary','/personal/birthday','/holiday','/wedding','/romance','/kupid','/hugz','/tug','/bug','/hugs','/hugs/comin-true','/browse','/privacy','/terms','/sms-optin','/order/success'];
for(const path of pages){const r=await request(path);save('page '+path,r,r.status>=200&&r.status<400);if(path==='/'||path==='/hug'){save('catalog-first '+path,r,r.body.includes('What would you like to say?')&&!r.body.includes('101 Comin')&&!r.body.split('<script')[0].includes('$$'));}}
const catalog=await request('/api/public-ii-catalog');
let records=[];try{const c=JSON.parse(catalog.body);records=c.records||[]; save('catalog contract',catalog,catalog.status===200&&c.inventoryCount===records.length&&new Set(records.map(r=>r.public_option_id)).size===records.length,`returned=${records.length}; status=${c.status}; purchasable=${c.purchasableCount}`);}catch{save('catalog contract',catalog,false);}
for(const record of records){const r=await request(record.audio_delivery_url,{headers:{Range:'bytes=0-1023'}});save('audio '+record.public_option_id,r,[200,206,307].includes(r.status));}
for(const path of ['/api/ii-delivery/__test_missing__','/hug/__test_missing__','/mkut/__test_missing__','/api/4pe/fulfillment','/api/admin/fullmix-kut-reviewq/queue','/checkout']){const r=await request(path);save('edge '+path,r,path.includes('ii-delivery')?r.status===404:path.includes('admin')?r.status===200:r.status>0&&r.status<500,r.body.startsWith('{')?r.body.slice(0,300):'');}
if(local){for(const body of ['{','{}',JSON.stringify({selected_hug_id:'test_nonexistent'})]){const r=await request('/api/4pe/fulfillment',{method:'POST',headers:{'Content-Type':'application/json'},body});save('4PE malformed/missing selection',r,r.status===400,r.body);}
const r=await request('/checkout',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:'public_option_id=__missing__&ii=__missing__'});save('checkout unavailable selection',r,r.status===303&&!!r.location,r.location);}
const loadPaths=['/','/hug','/find?mode=hug','/find?mode=tug','/find?mode=bug','/themes','/api/public-ii-catalog'];
const count=local?140:21, concurrency=local?5:2;const samples=[];let cursor=0;const started=performance.now();
await Promise.all(Array.from({length:concurrency},async()=>{while(cursor<count){const i=cursor++;const r=await request(loadPaths[i%loadPaths.length]);samples.push({path:r.path,status:r.status,ms:r.ms,bytes:r.bytes});}}));
const elapsedMs=performance.now()-started; const times=samples.map(r=>r.ms).sort((a,b)=>a-b);const percentile=p=>times[Math.ceil(times.length*p)-1];
const report={at:new Date().toISOString(),base,scope:'HTTP response checks and warm concurrent requests. Not browser paint metrics, audio timing, payment completion, or delivery completion.',checks:rows,performance:{requests:count,concurrency,elapsedMs:Math.round(elapsedMs),requestsPerSecond:Math.round(count*10000/elapsedMs)/10,p50Ms:percentile(.5),p95Ms:percentile(.95),p99Ms:percentile(.99),failures:samples.filter(x=>x.status<200||x.status>=400).length,samples},untested:['Paid checkout/webhook and receipt end-to-end','Successful recipient playback (catalog currently empty)','Completed 4PE delivery for each family/channel','Populated 324-source catalog load','Mobile layout and Web Vitals','Render idle cold start']};
writeFileSync(process.env.KKUT_TEST_REPORT || '/tmp/kkut-matrix.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({base,checks:rows.length,passed:rows.filter(x=>x.pass).length,failed:rows.filter(x=>!x.pass),performance:{...report.performance,samples:undefined}},null,2));

process.exitCode = rows.some(row => !row.pass) ? 1 : 0;
