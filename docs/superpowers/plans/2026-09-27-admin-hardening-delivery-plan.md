# Private Admin, Hardening, and Delivery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the private operational console, harden storage/runtime boundaries, polish accessibility, verify the canonical data directory, and publish only the verified public project to GitHub.

**Architecture:** Keep the admin service and canonical data root on loopback in a local-only repository, derive every dashboard metric from SQLite/runtime state, and make backup/restore procedures explicit and recoverable. The public repository receives only UI/gateway/docs/tests and is published after secret/history and end-to-end gates pass.

**Tech Stack:** Node.js 24, `node:sqlite`, Windows PowerShell, vanilla HTML/CSS/JavaScript, `node:test`, Playwright Chromium, Git/Git Credential Manager, GitHub Actions/Pages.

**Spec:** `docs/superpowers/specs/2026-09-27-layered-productionization-design.md`

## Global Constraints

- Plans 1 and 2 are green before this plan begins.
- `D:\TOOL\admin-panel` remains local-only with no Git remote; its source, secrets, DB, cookies, media, and logs never enter `D:\TOOL\viralcrawl` history.
- Admin and public services bind `127.0.0.1` by default; no firewall, tunnel, public reverse proxy, or production payment gateway is created.
- Plan 1 has already standardized `%LOCALAPPDATA%\2TECHMN\Mnhut_2tech_Al`; every hardening and release check verifies both services still receive that explicit `VC_DATA_DIR`.
- GitHub Pages is an honest static shell only; full local functionality is not represented as hosted by Pages.
- No open-source license is added without a separate owner decision.

## Review Focus

- A config/encryption key is missing during restore: backup validation fails before replacing live data (Task 2).
- Spoofed forwarded headers on loopback/public gateway: ignored unless an explicitly configured trusted proxy is later enabled (Task 2).
- Public Git current/history contains a private artifact, secret-like value, SQLite header, cookie, or media binary: publishing stops (Task 5).
- GitHub Pages or local backend is unavailable: static UI reports disconnected state without login/balance/job claims (Task 4).

---

### Task 1: Complete server-derived admin operations

**Files:**
- Modify: `D:\TOOL\admin-panel\server.js:67-76`
- Modify: `D:\TOOL\admin-panel\js\admin.js`
- Modify: `D:\TOOL\admin-panel\css\admin.css`
- Create: `D:\TOOL\admin-panel\tests\admin-operations.test.js`

**Interfaces:**
- Produces: admin overview sections for users, sessions/traffic, ledger/purchases, vouchers, jobs/files, engine health, and configuration using existing/admin APIs only.
- Produces: every balance/plan/status/session/voucher mutation requires `reason` and records an audit event.
- Preserves: no admin response includes OAuth secret, gateway key, encryption key, session token, voucher plaintext after creation, or cookie plaintext.

- [ ] **Step 1: Write failing admin operation tests**

Assert the admin origin remains loopback-only behind its separate password/session, real metric totals come from seeded DB rows, user/provider/last-login fields are exact, and traffic IP/User-Agent comes from requests. Cover session revocation, ban cancellation, balance and plan reasons, voucher audit, job/file/engine error visibility, support-email/download-root/engine configuration, current-password verification for admin password changes, redacted config, and stable empty states. Assert no random IP/HWID/demo account appears.

- [ ] **Step 2: Run the test and verify RED**

Run: `node --test tests/admin-operations.test.js`

Expected: FAIL for missing views/reason/audit/redaction cases.

- [ ] **Step 3: Implement focused admin view models and routes**

Split `admin.js` renderers by existing tab responsibility if a function exceeds one screenful; keep the existing API helper and text escaping. Add only the minimum route data needed by the UI and paginate/cap large event/job tables.

- [ ] **Step 4: Run the complete private suite**

Run: `npm test`

Expected: all tests PASS.

- [ ] **Step 5: Commit the private task locally**

```powershell
git -C D:\TOOL\admin-panel add server.js js/admin.js css/admin.css tests/admin-operations.test.js
git -C D:\TOOL\admin-panel commit -m "feat: complete private operational console"
```

### Task 2: Protect configuration, backup, restore, and request identity

**Files:**
- Modify: `D:\TOOL\admin-panel\lib\store.js`
- Create: `D:\TOOL\admin-panel\lib\backup.js`
- Modify: `D:\TOOL\admin-panel\server.js`
- Create: `D:\TOOL\admin-panel\tests\backup-security.test.js`
- Modify: `D:\TOOL\admin-panel\lib\network-guard.js`

**Interfaces:**
- Produces: `createBackup(store, destination): BackupManifest` where the manifest is `{ version, createdAt, dataRootId, schemaVersion, files: Array<{ name, size, sha256 }> }` and contains SQLite plus encrypted/config key material needed for recovery, never public assets.
- Produces: `validateBackup(path): BackupManifest` and `restoreBackup(store, path): void` with pre-restore snapshot and atomic replacement.
- Produces: `applyWindowsPrivateAcl(paths, { execFileImpl }): Promise<Array<{ path, ok, skipped, errorCode }>>` for config/key/database/password/backup files.
- Produces: `clientAddress(req, { trustedProxyCidrs = [] }): string`; default ignores every forwarded header.

- [ ] **Step 1: Write failing backup/security tests**

Cover consistent SQLite snapshot, manifest hashes, missing/corrupt config/key, wrong data-root identity, restore rollback, pre-restore backup, no secret values in logs/API, Windows ACL command arguments without shell interpolation, spoofed `Forwarded`/`X-Forwarded-For`, and loopback default identity.

- [ ] **Step 2: Run the test and verify RED**

Run: `node --test tests/backup-security.test.js`

Expected: FAIL because the backup module/interfaces do not exist.

- [ ] **Step 3: Implement recoverable backup and private ACL handling**

Use SQLite backup/VACUUM semantics already supported by the runtime, a manifest with SHA-256 hashes and schema version, a temp directory on the same volume for atomic rename, and `icacls.exe` through `execFile` on Windows. Never accept a restore path from a public API.

- [ ] **Step 4: Wire admin-only backup/validate/restore actions**

Require admin session, CSRF, loopback host, explicit confirmation, and an audit reason. Accept only server-issued backup IDs beneath the configured backup root, never a browser-supplied filesystem path. Return file names/status, not secret content.

- [ ] **Step 5: Run the full private suite and commit**

Run: `npm test`

Expected: all tests PASS.

```powershell
git -C D:\TOOL\admin-panel add lib/store.js lib/backup.js lib/network-guard.js server.js tests/backup-security.test.js
git -C D:\TOOL\admin-panel commit -m "feat: harden private backup and secrets"
```

### Task 3: Finish responsive, accessible visual polish

**Files:**
- Modify: `D:\TOOL\viralcrawl\index.html`
- Modify: `D:\TOOL\viralcrawl\css\app.css`
- Modify: `D:\TOOL\viralcrawl\js\dom.mjs`
- Modify: all `D:\TOOL\viralcrawl\js\pages\*.mjs` only where accessibility behavior requires it
- Create: `D:\TOOL\viralcrawl\tests\e2e\accessibility-responsive.spec.mjs`

**Interfaces:**
- Preserves: page/API contracts from Plans 1 and 2.
- Produces: WCAG-oriented keyboard/focus/status semantics, light/dark/system themes, reduced motion, and desktop/tablet/mobile layouts without feature divergence.

- [ ] **Step 1: Write failing browser checks**

Test 360x800, 768x1024, and 1440x900 viewports; keyboard-only navigation; skip link; modal focus trap/restore; zoom-capable viewport; form labels/errors; `aria-live` job/support states; contrast-sensitive theme classes; reduced-motion pricing cards; and no horizontal overflow. Under route fixtures, exercise every enabled navigation item and primary action and require a real navigation, API request, dialog, or truthful status change; disabled staged controls must state why. Cycle job routes repeatedly and assert there is still one poller/subscription rather than accumulating timers or network work.

- [ ] **Step 2: Run the targeted E2E file and verify RED**

Run: `npm run test:e2e -- accessibility-responsive.spec.mjs`

Expected: current shell fails at least modal/focus/viewport assertions.

- [ ] **Step 3: Implement the minimum semantic/style fixes**

Keep the approved bright navy/emerald direction, avoid decorative motion without meaning, use real buttons/links, keep touch targets at least 44 CSS pixels, and do not duplicate mobile business logic.

- [ ] **Step 4: Run all public tests and commit**

Run public `npm test` and `npm run test:e2e`.

Expected: all unit and browser tests PASS.

```powershell
git add index.html css/app.css js tests/e2e/accessibility-responsive.spec.mjs
git commit -m "feat: polish accessible responsive interface"
```

### Task 4: Make documentation and Pages behavior truthful

**Files:**
- Modify: `D:\TOOL\viralcrawl\README.md`
- Modify: `D:\TOOL\viralcrawl\manifest.json`
- Modify: `D:\TOOL\viralcrawl\sw.js`
- Modify: `D:\TOOL\viralcrawl\.github\workflows\deploy.yml`
- Modify: `D:\TOOL\viralcrawl\deploy-to-github.ps1`
- Create: `D:\TOOL\viralcrawl\tests\pages-contract.test.mjs`

**Interfaces:**
- Produces: a Pages artifact allowlist containing public static assets only.
- Produces: disconnected-backend UI contract with no cached `/api/` responses and no fake account/balance/jobs.
- Documents: local full-function setup, OAuth redirect, engine install, voucher rules, internal-credit nonwithdrawal, legal download use, and private-admin boundary.

- [ ] **Step 1: Write failing Pages/deployment contract tests**

Assert all HTML-referenced static assets are in gateway, service-worker, and Pages allowlists; no private/admin/data/binary path is staged; API is network-only/no-store; subpath asset URLs work; disconnected Pages shows offline state; and deploy helper rejects dirty/uncommitted/non-main/credential-bearing remotes without force push.

- [ ] **Step 2: Run the test and verify RED**

Run: `node --test tests/pages-contract.test.mjs`

Expected: FAIL until allowlists and docs match the new modules.

- [ ] **Step 3: Update docs, metadata, cache, workflow, and deploy helper**

Keep action SHAs pinned, stage by explicit allowlist, and never copy `server.js`, launchers, tests, docs, hidden files, or sibling content into Pages unless the workflow contract explicitly requires a public asset.

- [ ] **Step 4: Run public tests and a local Pages-artifact inspection**

Run `npm test`, build the staging directory without publishing, then enumerate it and scan for secrets/private file signatures.

Expected: tests PASS and artifact contains public assets only.

- [ ] **Step 5: Commit the public documentation/deployment task**

```powershell
git add README.md manifest.json sw.js .github/workflows/deploy.yml deploy-to-github.ps1 tests/pages-contract.test.mjs
git commit -m "docs: align deployment with real product boundaries"
```

### Task 5: Run release gates and publish only the public repository

**Files:**
- Create: `D:\TOOL\viralcrawl\scripts\release-audit.ps1`
- Create: `D:\TOOL\viralcrawl\tests\release-audit.test.mjs`
- Modify: `D:\TOOL\viralcrawl\package.json`

**Interfaces:**
- Produces: `scripts/release-audit.ps1` with read-only checks by default and explicit `-Publish` to invoke the existing safe deploy helper only after every gate passes.
- Produces: machine-readable summary for tests, secret scan, tracked/history audit, artifact audit, remote check, and local service smoke.

- [ ] **Step 1: Write failing release-audit tests**

Create temporary Git fixtures containing a current secret, historical secret, SQLite header, Netscape cookie line, media binary, sibling admin artifact, dirty tree, divergent branch, and credential-bearing remote. Assert each blocks publishing; assert documented source-code references to the sibling boundary are allowlisted without weakening artifact detection; assert a clean fixture passes read-only audit without pushing.

- [ ] **Step 2: Run the test and verify RED**

Run: `node --test tests/release-audit.test.mjs`

Expected: FAIL because the audit script does not exist.

- [ ] **Step 3: Implement the read-only audit script**

Use explicit repository paths, `git ls-files`, object/history scanning, extension/signature rules, allowlisted false-positive handling, both public/private test commands, public E2E, syntax checks, Pages staging inspection, loopback health, and `git diff --check`. Never print secret values.

- [ ] **Step 4: Run final private/public verification**

Run private `npm test`. Run public `npm test`, `npm run test:e2e`, syntax checks, and `scripts/release-audit.ps1` as separate commands. Then manually verify the official Google redirect with configured owner credentials and one authorized real download when the environment permits.

Expected: every automated gate PASS; environmental skips state their exact reason.

- [ ] **Step 5: Commit the release gate**

```powershell
git add scripts/release-audit.ps1 tests/release-audit.test.mjs package.json package-lock.json
git commit -m "chore: gate public releases against private data"
```

- [ ] **Step 6: Re-run audit, then publish**

Run `scripts/release-audit.ps1 -Publish` only after confirming the public branch/remote and Git Credential Manager authentication. Do not initialize or add a remote to `D:\TOOL\admin-panel`. After push, verify the remote commit/workflow/Pages assets without exposing credentials.

- [ ] **Step 7: Record final evidence**

Capture public commit SHA, GitHub repository URL, workflow result, local test totals, Pages URL/status, local admin path, canonical data root, and any real-platform limitation. Confirm `git -C D:\TOOL\viralcrawl status --short --branch` is clean and `git -C D:\TOOL\admin-panel remote -v` remains empty.

Plan 3 is complete when the private console is operational and locally versioned, runtime data is recoverable and consistently located, the public UI is accessible and truthful, all release gates pass, and only the public repository has been pushed.
