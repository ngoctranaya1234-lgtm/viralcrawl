#!/usr/bin/env node
// scripts/verify-public-safety.mjs — Public safety & release gate validation
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('[Verify Public Safety] Starting release gate checks...');

let errors = [];

// 1. Check Root & Public Artifact Allowlist
const allowedRootFiles = new Set([
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
  'node_modules',
  '_site'
]);

const entries = fs.readdirSync(rootDir);
for (const entry of entries) {
  if (entry.startsWith('.git') || entry === '.worktrees' || entry === 'test-results' || entry === 'playwright-report') continue;
  const full = path.join(rootDir, entry);
  const stat = fs.statSync(full);
  if (stat.isDirectory()) {
    if (!allowedDirs.has(entry) && !entry.startsWith('.')) {
      errors.push(`Disallowed public directory: ${entry}`);
    }
  } else {
    if (!allowedRootFiles.has(entry) && !entry.endsWith('.md')) {
      errors.push(`Disallowed public root file: ${entry}`);
    }
  }
}

// 2. Reject Legacy and Disallowed Modules in js/
const jsDir = path.join(rootDir, 'js');
if (fs.existsSync(jsDir)) {
  const jsFiles = fs.readdirSync(jsDir);
  for (const f of jsFiles) {
    if (f === 'pages') continue;
    if (!f.endsWith('.mjs')) {
      errors.push(`Only .mjs files permitted in js/ (found: ${f})`);
    }
  }
}

// 3. Scan for Forbidden Finance and Demo Markers
const forbiddenPatterns = [
  { pattern: /VietQR/i, label: 'VietQR' },
  { pattern: /VNPay/i, label: 'VNPay' },
  { pattern: /Napas/i, label: 'Napas' },
  { pattern: /2momo/i, label: '2momo' },
  { pattern: /simulate-confirm/i, label: 'simulate-confirm' },
  { pattern: /createDeposit/i, label: 'createDeposit' },
  { pattern: /confirmDeposit/i, label: 'confirmDeposit' },
  { pattern: /createBankTransfer/i, label: 'createBankTransfer' },
  { pattern: /processBankWebhook/i, label: 'processBankWebhook' },
  { pattern: /transfer_out/i, label: 'transfer_out' },
  { pattern: /accountNumber/i, label: 'accountNumber' },
  { pattern: /cardNumber/i, label: 'cardNumber' },
  { pattern: /\bCVV\b/i, label: 'CVV' },
  { pattern: /\bOTP\b/i, label: 'OTP' },
  { pattern: /BroadcastChannel/i, label: 'BroadcastChannel' },
  { pattern: /Math\.random\(\)/, label: 'Math.random()' }
];

const filesToScan = [
  path.join(rootDir, 'index.html'),
  path.join(rootDir, 'sw.js')
];

function collectFiles(dir) {
  if (!fs.existsSync(dir)) return;
  for (const item of fs.readdirSync(dir)) {
    const p = path.join(dir, item);
    if (fs.statSync(p).isDirectory()) {
      collectFiles(p);
    } else if (p.endsWith('.mjs') || p.endsWith('.js') || p.endsWith('.css')) {
      filesToScan.push(p);
    }
  }
}

collectFiles(path.join(rootDir, 'js'));
collectFiles(path.join(rootDir, 'css'));

for (const file of filesToScan) {
  if (!fs.existsSync(file)) continue;
  const content = fs.readFileSync(file, 'utf8');
  for (const { pattern, label } of forbiddenPatterns) {
    if (pattern.test(content)) {
      errors.push(`Forbidden marker "${label}" found in ${path.relative(rootDir, file)}`);
    }
  }
}

// 4. Verify Service Worker Upgrades
const swFile = path.join(rootDir, 'sw.js');
if (fs.existsSync(swFile)) {
  const swContent = fs.readFileSync(swFile, 'utf8');
  if (!swContent.includes('2techmn-public-v5')) {
    errors.push('sw.js does not use current 2techmn-public-v5 cache name.');
  }
  if (swContent.includes('app.js') || swContent.includes('page-dashboard.js')) {
    errors.push('sw.js precaches deleted legacy files.');
  }
} else {
  errors.push('sw.js is missing.');
}

// 5. Staged Pages Artifact Check (if _site exists)
const stagedDir = path.join(rootDir, '_site');
if (fs.existsSync(stagedDir)) {
  const stagedEntries = fs.readdirSync(stagedDir);
  const allowedStaged = new Set(['index.html', 'manifest.json', 'sw.js', '.nojekyll', 'assets', 'css', 'js']);
  for (const entry of stagedEntries) {
    if (!allowedStaged.has(entry)) {
      errors.push(`Staged _site contains unauthorized file: ${entry}`);
    }
  }
}

// Result
if (errors.length > 0) {
  console.error('[Verify Public Safety] FAILED with the following violations:');
  for (const err of errors) {
    console.error(`  - ${err}`);
  }
  process.exit(1);
} else {
  console.log('[Verify Public Safety] ALL CHECKS PASSED cleanly.');
  process.exit(0);
}
