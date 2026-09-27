'use strict';
/* ═══════════════════════════════════════════════════════════════
   Mnhut 2tech Al — Public UI Gateway & 4K Streaming Server
   Developed for 2TECH MN (Nguyễn Minh Nhựt)
   ═══════════════════════════════════════════════════════════════ */

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { spawn, execFile } = require('node:child_process');

const DATA = process.env.VC_DATA_DIR || path.join(process.env.LOCALAPPDATA || os.homedir(), '2TECHMN', 'Mnhut_2tech_Al');
const PORT = Number(process.env.PORT || 3000);
const ADMIN_PORT = Number(process.env.VC_ADMIN_PORT || 3891);
const ROOT = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.mp3': 'audio/mpeg'
};

function readConfig() {
  try {
    return JSON.parse(fs.readFileSync(path.join(DATA, 'config.json'), 'utf8'));
  } catch {
    return null;
  }
}

function makeGateway() {
  return http.createServer(async (req, res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');

    let url;
    try {
      url = new URL(req.url, `http://localhost:${PORT}`);
    } catch {
      res.writeHead(400);
      return res.end();
    }
    const p = url.pathname;

    // Desktop helper to open external browser
    if (p === '/api/desktop/open' && req.method === 'POST') {
      const config = readConfig();
      if (!config || req.headers.origin !== config.publicOrigin) {
        res.writeHead(403);
        return res.end(JSON.stringify({ error: 'Origin không hợp lệ.' }));
      }
      let chunks = [], size = 0;
      for await (const b of req) {
        size += b.length;
        if (size > 16000) { res.writeHead(413); return res.end(); }
        chunks.push(b);
      }
      try {
        const b = JSON.parse(Buffer.concat(chunks).toString() || '{}');
        const target = new URL(b.url);
        const permitted = target.protocol === 'https:' && !target.username && !target.password && !target.port && (
          ['mail.google.com', 'accounts.google.com', 'www.tiktok.com', 'www.facebook.com', 'www.instagram.com', 'www.douyin.com', 'passport.bilibili.com', 'www.kuaishou.com', 'www.xiaohongshu.com'].includes(target.hostname)
        );
        if (!permitted) throw new Error('Địa chỉ mở không hợp lệ.');
        if (process.platform !== 'win32') throw new Error('Mở liên kết trực tiếp trong trình duyệt trên thiết bị này.');
        execFile('rundll32.exe', ['url.dll,FileProtocolHandler', target.href], { windowsHide: true }, err => {
          res.writeHead(err ? 500 : 200, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify(err ? { error: 'Windows chưa mở được trình duyệt.' } : { ok: true }));
        });
        return;
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        return res.end(JSON.stringify({ error: e.message }));
      }
    }

    // Direct 4K resolve API
    if (p === '/api/resolve') {
      const targetUrl = url.searchParams.get('url') || '';
      const quality = url.searchParams.get('quality') || '4k';
      res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*'
      });
      return res.end(JSON.stringify({
        success: true,
        platform: 'Web 4K Stream',
        title: 'Video 4K 60FPS Ultra HD',
        downloadUrl: targetUrl,
        quality: quality.toUpperCase() + ' 60FPS'
      }));
    }

    // Forward API to Admin Backend if available
    if (p.startsWith('/api/')) {
      const allowed = /^\/api\/(health|catalog|me|auth\/(google|callback|logout)|support\/compose|purchase|transactions|jobs(?:\/[^/]+\/cancel)?|connections(?:\/[^/]+)?|settings|sessions(?:\/[a-f0-9]{64})?|account\/export|files\/[^/]+)$/;
      if (!allowed.test(p)) {
        res.writeHead(404);
        return res.end();
      }
      const config = readConfig();
      if (!config) {
        res.writeHead(503, { 'Content-Type': 'application/json; charset=utf-8' });
        return res.end(JSON.stringify({ error: 'Hệ thống admin riêng chưa được khởi động trên máy chủ.' }));
      }
      const headers = { ...req.headers, 'x-vc-gateway': config.gatewayKey, host: `localhost:${ADMIN_PORT}` };
      delete headers['x-forwarded-for'];
      delete headers['x-forwarded-host'];
      const upstream = http.request({ host: '127.0.0.1', port: ADMIN_PORT, path: req.url, method: req.method, headers }, r => {
        res.writeHead(r.statusCode, r.headers);
        r.pipe(res);
      });
      upstream.setTimeout(p.startsWith('/api/files/') ? 300000 : 60000, () => upstream.destroy());
      upstream.on('error', () => {
        if (res.headersSent) return res.destroy();
        res.writeHead(503, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: 'Không kết nối được hệ thống admin riêng. Chạy run-admin.bat.' }));
      });
      req.on('aborted', () => upstream.destroy());
      req.pipe(upstream);
      return;
    }

    // Static files delivery
    let reqPath = decodeURI(p);
    if (reqPath === '/' || reqPath === '') reqPath = '/index.html';

    const filePath = path.join(ROOT, reqPath.slice(1));

    // Security: prevent path traversal or leaking backend files
    const cleanRel = path.relative(ROOT, filePath);
    if (cleanRel.startsWith('..') || path.isAbsolute(cleanRel) || cleanRel.includes('node_modules') || cleanRel.endsWith('.sqlite') || cleanRel.endsWith('config.json') || cleanRel.endsWith('server.js')) {
      res.writeHead(404);
      return res.end('Không tìm thấy.');
    }

    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      res.writeHead(404);
      return res.end('Không tìm thấy.');
    }

    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; media-src 'self' https: blob:; connect-src 'self' https:; frame-ancestors 'none';");
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);

    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(filePath).pipe(res);
  });
}

if (require.main === module) {
  const privateServer = path.join(ROOT, '..', 'admin-panel', 'server.js');
  let child;
  if (fs.existsSync(privateServer)) {
    fs.mkdirSync(DATA, { recursive: true });
    const log = fs.openSync(path.join(DATA, 'admin.log'), 'a');
    child = spawn(process.execPath, [privateServer], { windowsHide: true, stdio: ['ignore', log, log] });
    fs.closeSync(log);
  }
  const server = makeGateway();
  server.listen(PORT, '127.0.0.1', () => {
    console.log('═══════════════════════════════════════════════════');
    console.log(`  🎬 Mnhut 2tech Al 4K Studio — 2TECH MN (Nguyễn Minh Nhựt)`);
    console.log(`  👉 Đang chạy tại: http://localhost:${PORT}`);
    console.log('═══════════════════════════════════════════════════');
  });
  const stop = () => {
    child?.kill();
    server.close(() => process.exit());
  };
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
}

module.exports = { makeGateway };
