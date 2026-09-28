# Real Download Product Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the honest core shell from Plan 1 into a real plan-gated video job, connection, file, history, and settings product backed by yt-dlp/FFmpeg.

**Architecture:** Harden the existing private worker around durable job ownership, cleanup, cancellation, deletion, and validated cookies, then add focused public ES-module pages that consume those APIs. The browser polls bounded job snapshots; it never resolves media or manufactures metadata itself.

**Tech Stack:** Node.js 24, `node:sqlite`, yt-dlp, FFmpeg, guarded HTTP proxy, vanilla browser ES modules, `node:test`, Playwright Chromium.

**Spec:** `docs/superpowers/specs/2026-09-27-internal-credit-checkout-design.md`, `docs/superpowers/specs/2026-09-27-layered-productionization-design.md`

## Global Constraints

- Plan 1 (Internal Credit Core Remediation) is green and its API/state interfaces remain the integration boundary.
- Virtual credits (`{ unit: 'CREDIT', realMoney: false, withdrawable: false }`) are the sole entitlement currency; no real payment, currency symbols, or financial gateways are ever introduced.
- The private worker is the only component allowed to resolve/download media or handle cookie plaintext.
- Supported source quality is reported honestly; no code claims generic 4K/60FPS creation or watermark removal.
- DRM, private content without the user's authorized session, unsupported hosts, and deleted sources fail clearly.
- URLs, files, jobs, settings, connections, and desktop operations are owner-isolated on the server.
- Only current backend catalog limits authorize platform tier, batch size, daily jobs, height, audio, and concurrency.

## Review Focus

- URL aliases, credentials, ports, redirects, and DNS rebinding attempts: rejected before yt-dlp can reach a private/local address (Task 1).
- A user's plan expires while a job is queued: the worker fails it honestly before process launch (Task 1).
- Cancel arrives while yt-dlp exits/starts FFmpeg: final state stays canceled and the entire process tree is terminated (Task 2).
- A completed database row points to a missing file: it is not shown as downloadable and retry can create a new job (Task 3).
- Cookie upload has the wrong domain, is expired, is oversized, or worker crashes: reject it or remove every temporary plaintext file (Task 4).

---

### Task 1: Pin real job validation, fairness, and durable state

**Files:**
- Modify: `D:\TOOL\admin-panel\lib\catalog.js:2-29`
- Modify: `D:\TOOL\admin-panel\lib\downloads.js:46-109`
- Create: `D:\TOOL\admin-panel\tests\jobs.test.js`
- Modify: `D:\TOOL\admin-panel\tests\network-guard.test.js`

**Interfaces:**
- Produces: `validateJobRequest(user, { urls, quality }, { usedToday, activeCount }): ValidatedJob[]`.
- Produces: `createDownloads(store, dependencies = {})`, where dependencies may provide `spawnImpl`, `now`, `stat`, `statfs`, and `killTree` for deterministic tests.
- Preserves: `enqueue(user, urls, quality)`, `used(userId)`, `cancel(userId, id)`, `cancelUser(userId)`, `info()`, and `close()`.

- [ ] **Step 1: Write failing validation/fairness tests**

Assert host aliases/subdomains, embedded credentials, explicit ports, fragments, unsupported schemes, redirect-to-private-IP, batch boundary, daily boundary, expired plan, audio tier, height limit, subtitle/metadata settings, and duplicate behavior. Add a queue with one concurrency-blocked user ahead of another eligible user and assert the eligible job starts.

- [ ] **Step 2: Run the tests and verify RED**

Run: `node --test tests/jobs.test.js tests/network-guard.test.js`

Expected: at least fairness and dependency-injection cases FAIL.

- [ ] **Step 3: Implement validation and fair scheduling**

Move request rules into the pure validator, retain the guarded proxy for yt-dlp egress, and select the oldest eligible job per user rather than stopping at the first 100 rows. Re-check current account/plan immediately before process launch.

- [ ] **Step 4: Run focused and full private suites**

Run `node --test tests/jobs.test.js tests/network-guard.test.js`, then run `npm test`.

Expected: all tests PASS.

- [ ] **Step 5: Commit the private task locally**

```powershell
git -C D:\TOOL\admin-panel add lib/catalog.js lib/downloads.js tests/jobs.test.js tests/network-guard.test.js
git -C D:\TOOL\admin-panel commit -m "fix: enforce real download eligibility fairly"
```

### Task 2: Make cancellation, cleanup, retry, and storage limits real

**Files:**
- Modify: `D:\TOOL\admin-panel\lib\migrations.js`
- Modify: `D:\TOOL\admin-panel\lib\downloads.js`
- Create: `D:\TOOL\admin-panel\lib\process-tree.js`
- Create: `D:\TOOL\admin-panel\tests\download-lifecycle.test.js`

**Interfaces:**
- Produces: job columns `attempt_of`, `file_deleted_at`, and `worker_started_at` via migration version `2`; the same migration maps legacy `running|failed|cancelled` values into the approved `extracting|error|canceled` state vocabulary.
- Produces: `killProcessTree(child, { platform, execFileImpl }): Promise<void>`.
- Produces on downloads: `retry(userId, id): JobView`, `deleteFile(userId, id): void`, and `recover(): RecoveryReport`.
- Adds settings-backed host storage ceiling and preflight free-space check without accepting a client path.

- [ ] **Step 1: Write failing lifecycle tests**

Cover cancel-before-start, cancel during yt-dlp, cancel during FFmpeg transition, late `close` after cancel, child process descendants, timeout, missing engine, missing/zero-byte output, disk-full preflight, partial `.part` cleanup, plaintext cookie cleanup, interrupted-startup recovery, legacy-state migration, retry lineage, and deleting only the owned completed file.

- [ ] **Step 2: Run the lifecycle test and verify RED**

Run: `node --test tests/download-lifecycle.test.js`

Expected: FAIL for missing retry/delete/recovery/process-tree interfaces.

- [ ] **Step 3: Implement migration and lifecycle operations**

Make state transitions conditional SQL updates so terminal `canceled` cannot be overwritten, and permit only `queued -> extracting -> downloading -> processing -> completed` plus terminal `error|canceled` transitions. Mark `completed` only after the expected regular file exists and passes the basic nonzero-size validation. On Windows use `taskkill /PID <pid> /T /F` through `execFile`; on other platforms kill the owned process group. Cleanup is idempotent and constrained to validated per-job directories beneath the configured download root.

- [ ] **Step 4: Run focused and full private suites**

Run `node --test tests/download-lifecycle.test.js`, then run `npm test`.

Expected: all tests PASS and no test temp files remain.

- [ ] **Step 5: Commit the private task locally**

```powershell
git -C D:\TOOL\admin-panel add lib/migrations.js lib/downloads.js lib/process-tree.js tests/download-lifecycle.test.js
git -C D:\TOOL\admin-panel commit -m "feat: harden download job lifecycle"
```

### Task 3: Expose job, file, and local desktop operations safely

**Files:**
- Modify: `D:\TOOL\admin-panel\server.js:49-65`
- Modify: `D:\TOOL\admin-panel\tests\backend.test.js`
- Modify: `D:\TOOL\viralcrawl\server.js:7-42`
- Modify: `D:\TOOL\admin-panel\tests\gateway.test.js`
- Modify: `D:\TOOL\viralcrawl\js\api-client.mjs`
- Modify: `D:\TOOL\viralcrawl\tests\api-client.test.mjs`

**Interfaces:**
- Produces: `POST /api/jobs/:id/retry`, `DELETE /api/files/:id`, and `POST /api/files/:id/open-folder`.
- Extends `ApiClient` with `listJobs()`, `createJobs({ urls, quality })`, `cancelJob(id)`, `retryJob(id)`, `deleteFile(id)`, `fileUrl(id, { preview })`, and `openFileFolder(id)`.

- [ ] **Step 1: Write failing route/client tests**

Assert authentication, CSRF/origin, ownership, terminal-state rules, missing-file behavior, path traversal IDs, loopback-only folder opening, derived server path, no client filesystem path, correct file range behavior, and explicit gateway allowlisting. Assert a missing completed file is returned as `fileAvailable:false`.

- [ ] **Step 2: Run tests and verify RED**

Run private `node --test tests/backend.test.js tests/gateway.test.js`; run public `node --test tests/api-client.test.mjs`.

Expected: new routes/client methods FAIL.

- [ ] **Step 3: Implement server and client contracts**

Delegate lifecycle operations to Task 2, derive all paths from owned job records, bind desktop opening to local Windows only, and make delete idempotently mark `file_deleted_at` after a successful/missing-file cleanup.

- [ ] **Step 4: Run both complete suites**

Run private `npm test`.

Expected: the private suite PASS.

Run public `npm test`.

Expected: the public suite PASS.

- [ ] **Step 5: Commit repositories separately**

```powershell
git -C D:\TOOL\admin-panel add server.js tests/backend.test.js tests/gateway.test.js
git -C D:\TOOL\admin-panel commit -m "feat: expose owned job and file lifecycle"
git -C D:\TOOL\viralcrawl add server.js js/api-client.mjs tests/api-client.test.mjs
git -C D:\TOOL\viralcrawl commit -m "feat: connect job and file APIs"
```

### Task 4: Harden platform connection imports

**Files:**
- Modify: `D:\TOOL\admin-panel\lib\downloads.js:11-26,74-85`
- Modify: `D:\TOOL\admin-panel\server.js:58-60`
- Create: `D:\TOOL\admin-panel\tests\connections.test.js`
- Modify: `D:\TOOL\viralcrawl\js\api-client.mjs`
- Create: `D:\TOOL\viralcrawl\js\components\connection-panel.mjs`
- Create: `D:\TOOL\viralcrawl\tests\connections-ui.test.mjs`
- Modify: `D:\TOOL\viralcrawl\server.js`
- Modify: `D:\TOOL\viralcrawl\sw.js`

**Interfaces:**
- Produces: `parseNetscapeCookies(text, platform, { now }): { text, count, earliestExpiry }`.
- Extends `ApiClient` with `listConnections()`, `saveConnection(platform, cookies)`, `deleteConnection(platform)`, and `openOfficialLogin(platform)`.
- Produces: a settings/download connection panel that displays only platform, cookie count, updated time, and validation status; it does not add an eighth top-level navigation route.

- [ ] **Step 1: Write failing backend cookie tests**

Assert comments/blank lines, malformed columns, maximum 256 KiB body, wrong domains, public-suffix lookalikes, all-expired files, mixed valid/expired cookies, encryption at rest, no plaintext response/log/event, and temporary-file cleanup on spawn error/cancel/timeout/normal close.

- [ ] **Step 2: Run backend connection tests and verify RED**

Run: `node --test tests/connections.test.js`

Expected: size/domain/cleanup cases FAIL under current implementation.

- [ ] **Step 3: Implement strict parser and secret lifecycle**

Accept Netscape format only, normalize hostnames, require at least one nonexpired domain-matching cookie, bound stored ciphertext, and wrap temporary-file creation/removal in a single idempotent owner object used by every worker exit path.

- [ ] **Step 4: Write and run failing public connection UI tests**

Assert official HTTPS login URLs, file/text import, no password fields, no QR/sample-cookie controls, no plaintext re-rendering, delete confirmation, and actionable backend validation errors. Run `node --test tests/connections-ui.test.mjs`; expect FAIL before the page exists.

- [ ] **Step 5: Implement the page and API methods**

Render catalog platforms, plan locks, official login actions, and explicit authorized-cookie guidance. Use server state after save/delete, wipe textarea/file references on completion or cancel, and expose the module through gateway/PWA allowlists.

- [ ] **Step 6: Run full suites and commit separately**

Run private `npm test`; run public `npm test`. Expected: both PASS.

```powershell
git -C D:\TOOL\admin-panel add lib/downloads.js server.js tests/connections.test.js
git -C D:\TOOL\admin-panel commit -m "fix: secure platform cookie imports"
git -C D:\TOOL\viralcrawl add js/api-client.mjs js/components/connection-panel.mjs tests/connections-ui.test.mjs server.js sw.js
git -C D:\TOOL\viralcrawl commit -m "feat: add honest platform connections"
```

### Task 5: Build real download queue and progress UI

**Files:**
- Create: `D:\TOOL\viralcrawl\js\job-poller.mjs`
- Create: `D:\TOOL\viralcrawl\js\job-notifier.mjs`
- Create: `D:\TOOL\viralcrawl\js\pages\download.mjs`
- Create: `D:\TOOL\viralcrawl\tests\download-ui.test.mjs`
- Modify: `D:\TOOL\viralcrawl\js\bootstrap.mjs`
- Modify: `D:\TOOL\viralcrawl\css\app.css`
- Modify: `D:\TOOL\viralcrawl\server.js`
- Modify: `D:\TOOL\viralcrawl\sw.js`

**Interfaces:**
- Produces: `createJobPoller({ api, onSnapshot, documentRef, intervalMs }): { start, stop, refreshNow }`.
- Produces: `createJobNotifier({ NotificationImpl }): { requestPermission, observe, clear }`; it notifies only enabled users when a real job first enters `completed|error|canceled`.
- Produces: download page actions `submit`, `cancel`, and `retry`, all delegated to `ApiClient`.

- [ ] **Step 1: Write failing poller/download tests**

Assert URL trimming/deduplication, catalog batch boundary, quality options from current limits, exact backend errors, active-state polling, pause while hidden, immediate refresh after mutation, cancel/retry button state, no optimistic completion, and cleanup after route change. Assert notifications are absent when disabled/denied, fire once on a real terminal transition, and never invent a title or completion state.

- [ ] **Step 2: Run the tests and verify RED**

Run: `node --test tests/download-ui.test.mjs`

Expected: FAIL because modules do not exist.

- [ ] **Step 3: Implement poller and page**

Use one timer per mounted page, an in-flight request guard, `AbortController`, text-safe URL/title/error rendering, and real backend counts. The submit result displays server-created IDs only. Drive notifications from successive server snapshots, with permission requested only from a user gesture. Add both modules to gateway/PWA allowlists.

- [ ] **Step 4: Run tests and syntax checks**

Run public `npm test`; run `node --check` over all `.mjs`.

Expected: PASS.

- [ ] **Step 5: Commit the public task**

```powershell
git add js/job-poller.mjs js/job-notifier.mjs js/pages/download.mjs js/bootstrap.mjs css/app.css tests/download-ui.test.mjs server.js sw.js
git commit -m "feat: show real video download jobs"
```

### Task 6: Build server-derived files, history, and settings pages

**Files:**
- Create: `D:\TOOL\viralcrawl\js\pages\files.mjs`
- Create: `D:\TOOL\viralcrawl\js\pages\history.mjs`
- Replace: `D:\TOOL\viralcrawl\js\pages\settings.mjs`
- Modify: `D:\TOOL\viralcrawl\js\components\connection-panel.mjs`
- Create: `D:\TOOL\viralcrawl\tests\library-settings-ui.test.mjs`
- Modify: `D:\TOOL\viralcrawl\js\api-client.mjs`
- Modify: `D:\TOOL\viralcrawl\css\app.css`
- Modify: `D:\TOOL\viralcrawl\server.js`
- Modify: `D:\TOOL\viralcrawl\sw.js`

**Interfaces:**
- Extends `ApiClient` with `updateSettings(settings)`, `listTransactions()`, `listSessions()`, `revokeSession(id)`, and `exportAccount()`.
- Settings shape is exactly `{ quality, concurrency, theme, subtitles, saveMetadata, notifications }`.

- [ ] **Step 1: Write failing library/settings tests**

Assert only `completed && fileAvailable` jobs show preview/download; missing/deleted files show history only; delete/open-folder use IDs, not paths; history search matches server-reported title/URL/error and filters recognize every approved status; settings options clamp to plan limits; the connection panel is embedded without another top-level route; theme applies at bootstrap; enabling notifications requests browser permission from the click and persists `true` only when granted; account export contains server data; session revocation protects the current-session confirmation; and no fake GPU/proxy/checkpoint/database controls exist.

- [ ] **Step 2: Run the tests and verify RED**

Run: `node --test tests/library-settings-ui.test.mjs`

Expected: FAIL because pages/client methods are incomplete.

- [ ] **Step 3: Implement pages and settings integration**

Use shared job snapshots, authenticated file URLs, server response refreshes, real transaction/session data, and harmless local theme preference only as a pre-paint hint reconciled with server settings. Add every page module to gateway/PWA allowlists.

- [ ] **Step 4: Run public and private suites**

Run public `npm test`; run private `npm test`.

Expected: both PASS.

- [ ] **Step 5: Commit the public task**

```powershell
git add js/api-client.mjs js/pages/files.mjs js/pages/history.mjs js/pages/settings.mjs js/components/connection-panel.mjs css/app.css tests/library-settings-ui.test.mjs server.js sw.js
git commit -m "feat: connect files history and settings"
```

### Task 7: Verify a real authorized download vertical slice

**Files:**
- Create: `D:\TOOL\viralcrawl\tests\e2e\download-flow.spec.mjs`
- Modify: `D:\TOOL\viralcrawl\README.md`

**Interfaces:**
- Consumes: completed job/connection/file/settings contracts.
- Produces: repeatable fixture-based browser coverage plus a documented opt-in real-media smoke procedure.

- [ ] **Step 1: Add failing browser scenarios**

With API fixtures, test queue-to-progress-to-completed-file, cancel, retry, missing file, plan expiry, unsupported URL, connection validation, settings persistence, and route cleanup. Assert production UI never displays unreported `4K`, `60FPS`, view, like, size, or watermark claims.

- [ ] **Step 2: Run E2E and verify RED**

Run: `npm run test:e2e -- download-flow.spec.mjs`

Expected: FAIL until final selectors/flows are complete.

- [ ] **Step 3: Complete the browser flow and real-media runbook**

Document engine checks and an environment-gated smoke command using one owner-authorized public URL per available plan tier. The command must skip with a reason when OAuth/engines/network are unavailable and must never substitute a fake success.

- [ ] **Step 4: Run full verification**

Run public unit/E2E tests, private `npm test`, syntax checks, forbidden-marker scan, and—when configured—the opt-in real-media smoke.

Expected: automated suites PASS; any real-platform limitation is recorded verbatim.

- [ ] **Step 5: Commit the public verification task**

```powershell
git add tests/e2e/download-flow.spec.mjs README.md
git commit -m "test: verify real download product flow"
```

Plan 2 is complete when every download/connection/file/history/settings control is server-backed and no browser code can manufacture a successful media result.
