'use strict';
// Public gateway. Private data and administrative routes stay in the sibling service.
const http=require('node:http'), fs=require('node:fs'), path=require('node:path'), os=require('node:os');
const {spawn,execFile}=require('node:child_process');
const DATA=process.env.VC_DATA_DIR||path.join(process.env.LOCALAPPDATA||os.homedir(),'2TECHMN','Mnhut_2tech_Al');
const ROOT=__dirname,PORT=Number(process.env.PORT||3000);
const STATIC=new Map([
  ['/','index.html'],['/index.html','index.html'],['/manifest.json','manifest.json'],
  ['/sw.js','sw.js'],['/assets/logo.svg','assets/logo.svg'],['/css/app.css','css/app.css'],
  ['/js/bootstrap.mjs','js/bootstrap.mjs'],
  ['/js/api-client.mjs','js/api-client.mjs'],
  ['/js/app-state.mjs','js/app-state.mjs'],
  ['/js/dom.mjs','js/dom.mjs'],
  ['/js/router.mjs','js/router.mjs'],
  ['/js/checkout-themes.mjs','js/checkout-themes.mjs'],
  ['/js/pages/dashboard.mjs','js/pages/dashboard.mjs'],
  ['/js/pages/download-link.mjs','js/pages/download-link.mjs'],
  ['/js/pages/downloaded.mjs','js/pages/downloaded.mjs'],
  ['/js/pages/history.mjs','js/pages/history.mjs'],
  ['/js/pages/pricing.mjs','js/pages/pricing.mjs'],
  ['/js/pages/settings.mjs','js/pages/settings.mjs'],
  ['/js/pages/support.mjs','js/pages/support.mjs'],
  ['/js/pages/unavailable.mjs','js/pages/unavailable.mjs'],
  ['/js/media-downloader.mjs','js/media-downloader.mjs']
]);
const MIME={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'application/javascript; charset=utf-8','.mjs':'application/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml'};
const CHECKOUT_ID='[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}';
const API_ROUTES=[
 ['GET',/^\/api\/(?:health|catalog|me|credits|credit-transactions|auth\/(?:google|apple|callback|apple\/callback)|support\/compose|jobs|connections|sessions|account\/export)$/],
 ['POST',/^\/api\/(?:auth\/(?:logout|apple\/callback)|jobs|internal-checkouts|subscriptions\/purchase)$/],
 ['PUT',/^\/api\/settings$/],
 ['GET',new RegExp(`^/api/internal-checkouts/${CHECKOUT_ID}$`)],
 ['POST',new RegExp(`^/api/internal-checkouts/${CHECKOUT_ID}/redeem$`)],
 ['POST',/^\/api\/jobs\/[a-zA-Z0-9-]+\/cancel$/],
 ['POST',/^\/api\/connections\/[a-z]+$/],
 ['DELETE',/^\/api\/connections\/[a-z]+$/],
 ['DELETE',/^\/api\/sessions\/[a-f0-9]{64}$/],
 ['GET',/^\/api\/files\/[a-zA-Z0-9-]+$/],
 ['HEAD',/^\/api\/files\/[a-zA-Z0-9-]+$/]
];
const allowedApi=(method,path)=>API_ROUTES.some(([verb,pattern])=>verb===method&&pattern.test(path));
const OPEN_HOSTS=new Set(['mail.google.com','accounts.google.com','www.youtube.com','www.tiktok.com','www.facebook.com','www.instagram.com','www.douyin.com','passport.bilibili.com','www.kuaishou.com','www.xiaohongshu.com','x.com','vimeo.com','www.reddit.com','www.twitch.tv','www.dailymotion.com','www.pinterest.com']);
function makeGateway(options={}) {
 const data=options.dataDir||DATA,root=options.root||ROOT,adminPort=Number(options.adminPort||process.env.VC_ADMIN_PORT||3891);
 const readConfig=()=>{try{return JSON.parse(fs.readFileSync(path.join(data,'config.json'),'utf8'));}catch{return null;}};
 return http.createServer(async(req,res)=>{
  res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');res.setHeader('Cache-Control','no-store');
  const json=(status,message)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8'});res.end(JSON.stringify(typeof message==='string'?{error:message}:message));};
  try {
   const config=readConfig();let host;
   try{host=new URL('http://'+req.headers.host);}catch{return json(400,'Host không hợp lệ.');}
   const configuredHost=config?new URL(config.publicOrigin).host:null;
   if(host.username||host.password||(!['localhost','127.0.0.1','[::1]'].includes(host.hostname)&&host.host!==configuredHost))return json(403,'Host không được phép.');
   const url=new URL(req.url,'http://localhost');let p;
   try{p=decodeURIComponent(url.pathname);}catch{return json(400,'Đường dẫn không hợp lệ.');}
   if(p==='/api/desktop/open') {
    if(req.method!=='POST')return json(405,'Cần phương thức POST.');
    if(!config||req.headers.origin!==config.publicOrigin)return json(403,'Origin không hợp lệ.');
    if(!String(req.headers['content-type']||'').startsWith('application/json'))return json(415,'Cần dữ liệu JSON.');
    const parts=[];let size=0;for await(const b of req){size+=b.length;if(size>16000)return json(413,'Dữ liệu quá lớn.');parts.push(b);}
    let target;try{target=new URL(JSON.parse(Buffer.concat(parts).toString('utf8')).url);}catch{return json(400,'Địa chỉ mở không hợp lệ.');}
    if(target.protocol!=='https:'||target.username||target.password||target.port||!OPEN_HOSTS.has(target.hostname)||target.href.length>14000)return json(400,'Địa chỉ mở không được phép.');
    if(process.platform!=='win32')return json(409,'Hãy mở liên kết trong trình duyệt trên thiết bị này.');
    return execFile('rundll32.exe',['url.dll,FileProtocolHandler',target.href],{windowsHide:true,timeout:10000},err=>json(err?500:200,err?'Windows chưa mở được trình duyệt.':{ok:true}));
   }
   if(p.startsWith('/api/')) {
    if(!allowedApi(req.method,p)||p!==url.pathname)return json(404,'API không tồn tại.');
    if(!config)return json(503,'Hệ thống admin riêng chưa khởi động. Chạy run.bat hoặc run-admin.bat.');
    const headers={host:`localhost:${adminPort}`,'x-vc-gateway':config.gatewayKey};
    for(const key of ['origin','x-vc-csrf','idempotency-key','content-type','content-length','accept','user-agent','range'])if(req.headers[key]!==undefined)headers[key]=req.headers[key];
    const publicCookies=String(req.headers.cookie||'').split(';').map(part=>part.trim()).filter(part=>/^(?:vc_session|vc_oauth|vc_apple_link)=/.test(part)).join('; ');
    if(publicCookies)headers.cookie=publicCookies;
    const upstream=http.request({hostname:'127.0.0.1',port:adminPort,path:req.url,method:req.method,headers},response=>{res.writeHead(response.statusCode,{...response.headers,'cache-control':'no-store'});response.pipe(res);});
    upstream.setTimeout(p.startsWith('/api/files/')?300000:60000,()=>upstream.destroy(new Error('timeout')));
    upstream.on('error',()=>res.headersSent?res.destroy():json(503,'Không kết nối được admin riêng. Kiểm tra run-admin.bat.'));
    req.on('aborted',()=>upstream.destroy());res.on('close',()=>{if(!res.writableEnded)upstream.destroy();});req.pipe(upstream);return;
   }
   const file=STATIC.get(p);if(!file)return json(404,'Không tìm thấy.');
   if(!['GET','HEAD'].includes(req.method)){res.setHeader('Allow','GET, HEAD');return json(405,'Phương thức không được phép.');}
   const absolute=path.join(root,file);if(!fs.existsSync(absolute)||!fs.statSync(absolute).isFile())return json(404,'Không tìm thấy.');
   res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; media-src 'self' blob:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self';");
   res.setHeader('Content-Type',MIME[path.extname(file)]||'application/octet-stream');if(p==='/sw.js')res.setHeader('Service-Worker-Allowed','/');
   if(req.method==='HEAD')return res.end();const stream=fs.createReadStream(absolute);stream.on('error',()=>res.headersSent?res.destroy():json(500,'Không đọc được tập tin.'));stream.pipe(res);
  }catch{if(!res.headersSent)json(500,'Gateway chưa xử lý được yêu cầu.');else res.destroy();}
 });
}
if(require.main===module) {
 let child;
 const launch=occupied=>{
  if(!occupied){const privateServer=path.join(ROOT,'..','admin-panel','server.js');if(fs.existsSync(privateServer)){fs.mkdirSync(DATA,{recursive:true});const log=fs.openSync(path.join(DATA,'admin.log'),'a');child=spawn(process.execPath,[privateServer],{windowsHide:true,env:{...process.env,VC_DATA_DIR:DATA},stdio:['ignore',log,log]});fs.closeSync(log);}}
  const server=makeGateway();server.on('error',err=>{console.error('Không khởi động được tool:',err.code);child?.kill();process.exitCode=1;});
  server.listen(PORT,'127.0.0.1',()=>console.log(`2TECH MN — NGUYỄN MINH NHỰT\nTool: http://localhost:${PORT}\nAdmin riêng: http://localhost:${Number(process.env.VC_ADMIN_PORT||3891)}`));
  const stop=()=>{child?.kill();server.close(()=>process.exit());};process.on('SIGINT',stop);process.on('SIGTERM',stop);
 };
 const probe=require('node:net').connect({host:'127.0.0.1',port:Number(process.env.VC_ADMIN_PORT||3891)});probe.setTimeout(1000);let started=false;
 const once=occupied=>{if(started)return;started=true;probe.destroy();launch(occupied);};probe.on('connect',()=>once(true));probe.on('error',()=>once(false));probe.on('timeout',()=>once(false));
}
module.exports={makeGateway,DATA};
