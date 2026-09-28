import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

test('staged public artifact contains only allowlisted files and directories', () => {
  const allowedExactFiles = new Set([
    'index.html',
    'manifest.json',
    'sw.js',
    'server.js',
    'package.json',
    'package-lock.json',
    'playwright.config.mjs',
    'README.md',
    'run.bat',
    'start-tool.ps1',
    'deploy-to-github.ps1',
    'push-to-github.bat',
    '.gitignore'
  ]);

  const allowedDirs = new Set([
    'assets',
    'css',
    'js',
    'tests',
    'scripts',
    'docs',
    '.github',
    'node_modules'
  ]);

  const entries = fs.readdirSync(rootDir);
  for (const entry of entries) {
    if (entry.startsWith('.git') || entry === '.worktrees' || entry === '_site' || entry === 'test-results' || entry === 'playwright-report') continue;
    const fullPath = path.join(rootDir, entry);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      assert.ok(
        allowedDirs.has(entry) || entry.startsWith('.'),
        `Directory ${entry} is not on the allowed public directories list`
      );
    } else {
      assert.ok(
        allowedExactFiles.has(entry) || entry.endsWith('.md'),
        `Root file ${entry} is not on the allowed public files list`
      );
    }
  }

  // Check js/ directory contents
  const jsDir = path.join(rootDir, 'js');
  if (fs.existsSync(jsDir)) {
    const jsFiles = fs.readdirSync(jsDir);
    for (const file of jsFiles) {
      if (file === 'pages') continue;
      assert.ok(
        file.endsWith('.mjs'),
        `Only modern .mjs modules are permitted in js/ (found: ${file})`
      );
    }
  }

  // Check js/pages/ directory contents
  const pagesDir = path.join(rootDir, 'js', 'pages');
  if (fs.existsSync(pagesDir)) {
    const pageFiles = fs.readdirSync(pagesDir);
    for (const file of pageFiles) {
      assert.ok(
        file.endsWith('.mjs'),
        `Only modern .mjs modules are permitted in js/pages/ (found: ${file})`
      );
    }
  }
});

test('public codebase contains zero forbidden financial or fake demo markers', () => {
  const forbiddenPatterns = [
    /VietQR/i,
    /VNPay/i,
    /Napas/i,
    /2momo/i,
    /simulate-confirm/i,
    /createDeposit/i,
    /confirmDeposit/i,
    /createBankTransfer/i,
    /processBankWebhook/i,
    /transfer_out/i,
    /accountNumber/i,
    /cardNumber/i,
    /\bCVV\b/i,
    /\bOTP\b/i,
    /BroadcastChannel/i,
    /Math\.random\(\)/
  ];

  const scanDirs = ['js', 'css'];
  const filesToScan = [
    path.join(rootDir, 'index.html'),
    path.join(rootDir, 'sw.js')
  ];

  for (const dir of scanDirs) {
    const fullDir = path.join(rootDir, dir);
    if (!fs.existsSync(fullDir)) continue;
    const walk = (d) => {
      const items = fs.readdirSync(d);
      for (const item of items) {
        const itemPath = path.join(d, item);
        if (fs.statSync(itemPath).isDirectory()) {
          walk(itemPath);
        } else if (item.endsWith('.js') || item.endsWith('.mjs') || item.endsWith('.css')) {
          filesToScan.push(itemPath);
        }
      }
    };
    walk(fullDir);
  }

  for (const file of filesToScan) {
    if (!fs.existsSync(file)) continue;
    const content = fs.readFileSync(file, 'utf8');
    for (const pattern of forbiddenPatterns) {
      const match = content.match(pattern);
      assert.equal(
        match,
        null,
        `File ${path.relative(rootDir, file)} contains forbidden pattern ${pattern}`
      );
    }
  }
});

test('service worker purges previous unsafe cache versions on activate', () => {
  const swPath = path.join(rootDir, 'sw.js');
  assert.ok(fs.existsSync(swPath), 'sw.js must exist');
  const swContent = fs.readFileSync(swPath, 'utf8');

  // Verify cache version is upgraded
  assert.ok(swContent.includes('2techmn-public-v5'), 'sw.js must use v5 cache name');

  // Verify activate purges old cache namespaces
  assert.ok(swContent.includes('mnhut-'), 'sw.js must purge legacy mnhut- caches');
  assert.ok(swContent.includes('viralcrawl-'), 'sw.js must purge legacy viralcrawl- caches');
  assert.ok(swContent.includes('2techmn-public-'), 'sw.js must purge older 2techmn-public- caches');

  // Verify deleted scripts are not precached
  assert.equal(swContent.includes('app.js'), false, 'sw.js must not precache app.js');
  assert.equal(swContent.includes('page-dashboard.js'), false, 'sw.js must not precache page-dashboard.js');
});

test('documentation accurately reflects truthful virtual credits and rejects currency claims', () => {
  const readmePath = path.join(rootDir, 'README.md');
  const opsPath = path.join(rootDir, 'docs', 'operations', 'internal-credits.md');

  assert.ok(fs.existsSync(readmePath), 'README.md must exist');
  assert.ok(fs.existsSync(opsPath), 'docs/operations/internal-credits.md must exist');

  const readme = fs.readFileSync(readmePath, 'utf8');
  const ops = fs.readFileSync(opsPath, 'utf8');

  // Must include exact welcome credit: 2,500,000 credit
  assert.ok(readme.includes('2.500.000 credit'), 'README must state 2.500.000 credit');
  assert.ok(ops.includes('2.500.000 credit'), 'Operator docs must state 2.500.000 credit');

  // Must include exact code value: 4,000,000 credit
  assert.ok(readme.includes('4.000.000 credit'), 'README must state 4.000.000 credit code value');
  assert.ok(ops.includes('4.000.000 credit'), 'Operator docs must state 4.000.000 credit code value');

  // Must include trial period: 1 tháng / ULTRA
  assert.ok(readme.includes('ULTRA'), 'README must mention ULTRA trial');
  assert.ok(ops.includes('ULTRA'), 'Operator docs must mention ULTRA trial');

  // Must include non-cash / non-withdrawable status
  assert.ok(readme.includes('không thể rút'), 'README must state credits cannot be withdrawn');
  assert.ok(ops.includes('không thể rút'), 'Operator docs must state credits cannot be withdrawn');

  // Must reject old claims: 2.000.000, VND/USD equivalence, real currency prices
  assert.equal(readme.includes('2.000.000'), false, 'README must not state old 2.000.000 credits');
  assert.equal(readme.includes('149.000'), false, 'README must not contain real currency prices');
  assert.equal(readme.includes('249.000'), false, 'README must not contain real currency prices');
  assert.equal(readme.includes('329.000'), false, 'README must not contain real currency prices');
});
