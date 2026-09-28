'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const http=require('node:http');
const {makeGateway}=require('../server');

const financeRoutes=[
 '/api/payment','/api/payment/','/api/payment/channels','/api/payment/banks',
 '/api/payment/create','/api/payment/transfer','/api/payment/transfers',
 '/api/payment/status/legacy-deposit','/api/payment/status/LEGACYREF',
 '/api/payment/simulate-confirm','/api/payment/webhook/bank-sync',
 '/api/payment/webhook/vnpay?vnp_TxnRef=LEGACYREF&vnp_ResponseCode=00&vnp_Amount=5000000',
 '/api/payment/vnpay/return?vnp_TxnRef=LEGACYREF&vnp_ResponseCode=00&vnp_Amount=5000000',
 '/api/payment/webhook/momo','/api/payment/withdraw','/api/payment/withdrawal',
 '/admin/deposits','/admin/deposits/legacy-deposit/approve','/admin/transfers',
 '/admin/withdrawals','/admin/payment-config'
];
const methods=['GET','HEAD','POST','PUT','PATCH','DELETE','OPTIONS','TRACE'];
async function fixture(t,configured=true){
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'2techmn-public-cutoff-'));
 const requests=[];
 const upstream=http.createServer((req,res)=>{requests.push({method:req.method,url:req.url,gatewayKey:req.headers['x-vc-gateway'],forwarded:[...['authorization','x-vc-config','x-forwarded-for','forwarded'].filter(key=>req.headers[key]!==undefined),...(req.headers.cookie?.includes('vc_admin=')?['vc_admin']:[])]});req.resume();res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({ok:true}));});
 await new Promise(resolve=>upstream.listen(0,'127.0.0.1',resolve));
 if(configured)fs.writeFileSync(path.join(dir,'config.json'),JSON.stringify({publicOrigin:'http://localhost:3000',gatewayKey:'fixture-gateway-key'}));
 const gateway=makeGateway({dataDir:dir,adminPort:upstream.address().port});
 await new Promise(resolve=>gateway.listen(0,'127.0.0.1',resolve));
 t.after(async()=>{await new Promise(resolve=>gateway.close(resolve));await new Promise(resolve=>upstream.close(resolve));assert.equal(path.dirname(path.resolve(dir)),path.resolve(os.tmpdir()));assert.match(path.basename(dir),/^2techmn-public-cutoff-/);fs.rmSync(dir,{recursive:true,force:true});});
 async function request(route,method='GET',extraHeaders={}){
  return new Promise((resolve,reject)=>{
   const req=http.request({hostname:'127.0.0.1',port:gateway.address().port,path:route,method,headers:{cookie:'vc_session=fixture-user; vc_admin=fixture-admin',origin:'http://localhost:3000','x-vc-csrf':'fixture-csrf','x-vc-gateway':'attacker-key',...extraHeaders}},res=>{const parts=[];res.on('data',chunk=>parts.push(chunk));res.on('end',()=>resolve({status:res.statusCode,body:Buffer.concat(parts).toString(),headers:res.headers}));});
   req.setTimeout(5000,()=>req.destroy(new Error('request timeout')));req.on('error',reject);req.end();
  });
 }
 return {request,requests};
}

test('public gateway rejects every removed finance route and method without contacting upstream',async t=>{
 const {request,requests}=await fixture(t),failures=[];
 for(const route of financeRoutes)for(const method of methods){
  const result=await request(route,method);
  if(result.status!==404)failures.push(`${method} ${route}: ${result.status}`);
  assert.equal(result.headers.location,undefined,route+' must not redirect to a provider result');
 }
 assert.deepEqual(failures,[]);assert.deepEqual(requests,[]);
});

test('finance routes remain 404 when private runtime config is unavailable',async t=>{
 const {request,requests}=await fixture(t,false),failures=[];
 for(const route of financeRoutes)for(const method of methods){
  const result=await request(route,method);if(result.status!==404)failures.push(`${method} ${route}: ${result.status}`);
 }
 assert.deepEqual(failures,[]);assert.deepEqual(requests,[]);
 assert.equal((await request('/api/health')).status,503);
});

test('gateway still forwards allowed APIs with its private gateway credential',async t=>{
 const {request,requests}=await fixture(t);
 assert.equal((await request('/api/health')).status,200);
 assert.deepEqual(requests,[{method:'GET',url:'/api/health',gatewayKey:'fixture-gateway-key',forwarded:[]}]);
});

test('gateway allows only exact public API methods and identifiers',async t=>{
 const {request,requests}=await fixture(t);
 const allowed=[['GET','/api/me'],['GET','/api/catalog'],['GET','/api/credits'],['GET','/api/credit-transactions'],['POST','/api/internal-checkouts'],['GET','/api/internal-checkouts/123e4567-e89b-42d3-a456-426614174000'],['POST','/api/internal-checkouts/123e4567-e89b-42d3-a456-426614174000/redeem'],['POST','/api/subscriptions/purchase'],['GET','/api/auth/apple'],['POST','/api/auth/apple/callback'],['GET','/api/auth/apple/callback?complete=link'],['GET','/api/auth/google'],['GET','/api/auth/callback'],['GET','/api/jobs'],['POST','/api/jobs'],['GET','/api/support/compose']];
 for(const [method,route]of allowed)assert.equal((await request(route,method)).status,200,`${method} ${route}`);
 assert.equal(requests.length,allowed.length);
 const denied=[['GET','/api/internal-checkouts'],['POST','/api/internal-checkouts/123e4567-e89b-42d3-a456-426614174000'],['GET','/api/internal-checkouts/not-an-id'],['POST','/api/internal-checkouts/not-an-id/redeem'],['GET','/api/subscriptions/purchase'],['POST','/api/purchase'],['GET','/api/transactions'],['GET','/api/payment/channels'],['POST','/api/payment/simulate-confirm'],['GET','/api/payment/vnpay/return'],['GET','/admin/overview'],['POST','/admin/login'],['GET','/admin/anything'],['GET','/api/admin/config'],['GET','/api/config'],['GET','/api/secrets'],['GET','/api/files/123e4567-e89b-42d3-a456-426614174000/extra']];
 for(const [method,route]of denied)assert.equal((await request(route,method)).status,404,`${method} ${route}`);
 assert.equal(requests.length,allowed.length);
});

test('gateway strips caller credentials and forwarding claims before proxying',async t=>{
 const {request,requests}=await fixture(t);
 assert.equal((await request('/api/me','GET',{authorization:'Bearer forged','x-vc-config':'private-value','x-forwarded-for':'8.8.8.8',forwarded:'for=8.8.8.8'})).status,200);
 assert.deepEqual(requests[0].forwarded,[]);
 assert.equal(requests[0].gatewayKey,'fixture-gateway-key');
});
