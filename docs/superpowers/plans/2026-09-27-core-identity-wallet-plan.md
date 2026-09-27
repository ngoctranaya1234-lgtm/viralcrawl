# Core Identity and Internal Wallet Implementation Plan

> **Superseded:** Use `2026-09-27-internal-credit-core-remediation-plan.md`. This historical plan retains the earlier 2,000,000-credit and Google-only decisions and must not be executed.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace every simulated account, balance, pricing, and support path with official Google identity, server-owned internal credits, one-use vouchers, real plan purchases, and Gmail compose.

**Architecture:** First establish a recoverable local-only repository and one canonical data root, then extend the private Node/SQLite backend with a versioned voucher domain and authenticated APIs. Replace the public global/localStorage controller with external ES modules that consume only gateway APIs. End this plan with an honest working core UI; download pages may be visibly unavailable until the next plan, but no demo success path remains.

**Tech Stack:** Node.js 24, `node:sqlite`, `google-auth-library`, vanilla browser ES modules, CSS, `node:test`, Playwright Chromium.

**Spec:** `docs/superpowers/specs/2026-09-27-layered-productionization-design.md`

## Global Constraints

- Public Git history contains only `D:\TOOL\viralcrawl`; `D:\TOOL\admin-panel` remains a separate local-only repository with no remote.
- Both services use the explicit canonical data root `%LOCALAPPDATA%\2TECHMN\Mnhut_2tech_Al` before any schema or product mutation.
- Brand copy is exactly `Mnhut 2tech Al`, `NGUYỄN MINH NHỰT`, and `2TECH MN`.
- Signup credit is exactly 2,000,000, granted once per verified Google subject.
- Every voucher is exactly 4,000,000, single-use, redeemable before `created_at + 7 * 86_400_000 ms`; redeemed credit never expires.
- Credits are internal, non-transferable, non-withdrawable, and have no cash-redemption path.
- MoMo and every real-money control remain absent.
- Backend state authorizes every mutation; browser storage retains harmless UI preferences only.
- No inline script/handler, fake login, fake QR/cookie, invented traffic/media data, or synthetic success fallback survives.

## Review Focus

- Both old and canonical data roots contain different live databases: launchers refuse automatic migration and print recovery-safe next steps (Task 2).
- Two simultaneous redemptions of the same voucher: exactly one credits the account; the other returns conflict without a second ledger row (Task 4).
- Redemption exactly at/after the seven-day boundary: the voucher is expired and balance is unchanged (Task 4).
- Replayed purchase idempotency key: one debit and one receipt only (Task 5).
- Backend offline or Google OAuth unconfigured: the UI shows an actionable unavailable state and never creates a local user (Task 6).
- HTML/control characters and long Unicode in support fields: safely encoded Gmail URL with no executable markup or truncated owner signature (Task 7).

---

### Task 1: Establish the dual-repository safety baseline

**Files:**
- Create: `D:\TOOL\admin-panel\.gitignore`

**Interfaces:**
- Produces: a recoverable local Git baseline for `D:\TOOL\admin-panel` with no remote and no ignored secret/data artifact tracked.
- Preserves: all current private source and runtime data; this task changes no product behavior.

- [ ] **Step 1: Write the private ignore policy**

Ignore `node_modules/`, SQLite/config/password/key material, downloads, logs, backups, engines, and temporary cookie/media files. Do not ignore source, tests, launchers, or documentation.

- [ ] **Step 2: Audit candidates before initialization**

Run `git -C D:\TOOL\admin-panel status --short` when a repository already exists; otherwise enumerate the directory and verify every secret/data pattern is covered by `.gitignore`. Search candidate source for credential values without printing matches' contents.

- [ ] **Step 3: Initialize and verify the local-only repository**

If `.git` is absent, run `git init -b main` in `D:\TOOL\admin-panel`. Run `git remote -v` and verify it prints nothing. Stage the reviewed baseline, then inspect `git diff --cached --name-only` and `git diff --cached --check` before committing.

- [ ] **Step 4: Run the existing private suite**

Run: `npm test` from `D:\TOOL\admin-panel`
Expected: the existing private baseline passes before any product edit.

- [ ] **Step 5: Commit the reviewed private baseline locally**

Commit only after confirming `git remote -v` remains empty. Record the baseline commit SHA for later recovery.

```powershell
git -C D:\TOOL\admin-panel add --all
git -C D:\TOOL\admin-panel diff --cached --check
git -C D:\TOOL\admin-panel commit -m "chore: establish private local baseline"
```

### Task 2: Standardize the canonical data root before mutation

**Files:**
- Modify: `D:\TOOL\start-mnhut-2tech-al.bat`
- Modify: `D:\TOOL\viralcrawl\run.bat`
- Modify: `D:\TOOL\viralcrawl\start-tool.ps1`
- Modify: `D:\TOOL\viralcrawl\server.js:3-6,52-61`
- Modify: `D:\TOOL\admin-panel\run-admin.bat`
- Modify: `D:\TOOL\admin-panel\start-admin.ps1`
- Modify: `D:\TOOL\admin-panel\lib\store.js`
- Create: `D:\TOOL\admin-panel\lib\data-root.js`
- Create: `D:\TOOL\admin-panel\tests\data-root.test.js`

**Interfaces:**
- Produces: `canonicalDataRoot(env): string` returning `%LOCALAPPDATA%\2TECHMN\Mnhut_2tech_Al`.
- Produces: `planDataMigration({ oldRoot, newRoot }): none|copy|conflict` and `executeDataMigration(plan): { action, oldRoot, newRoot, copiedFiles, verified, legacyRetained }`.
- Both Node processes and PowerShell launchers consume explicit `VC_DATA_DIR` from the same canonical value.

- [ ] **Step 1: Write failing path and migration tests**

Assert the canonical path, missing-`LOCALAPPDATA` fallback, old-only move from `2TECHMN\ViralCrawl`, identical-roots no-op, both-roots conflict, file-hash verification, rollback after copy failure, no recursive broad deletion, and preservation of database/config/password/backups/downloads/logs.

- [ ] **Step 2: Run the test and verify RED**

Run: `node --test tests/data-root.test.js` from `D:\TOOL\admin-panel`
Expected: FAIL because the resolver/migration module does not exist.

- [ ] **Step 3: Implement the resolver and explicit migration**

Create only the canonical parent first. When legacy data is the source, copy it to a same-volume sibling staging directory, validate hashes and database opening, then atomically rename the staging directory to the canonical name. Keep the legacy root intact as the recovery copy. If both roots differ, stop and print their exact paths; do not choose or merge silently.

- [ ] **Step 4: Update every launcher and service default**

Pass `VC_DATA_DIR` explicitly to both child processes, keep background windows hidden where applicable, open the normal default browser profile, and show consistent password/log/admin/tool paths. The Node defaults must resolve to the same canonical path even when launched without a script.

- [ ] **Step 5: Run path, launcher, and loopback checks**

Run private `npm test`. Parse each PowerShell launcher with `[scriptblock]::Create((Get-Content -Raw <file>))`. Start both services against a temporary explicit `VC_DATA_DIR` and assert ports `3000/3891` bind only to loopback.
Expected: tests pass and all temporary data stays under the named temporary directory.

- [ ] **Step 6: Commit each repository separately**

```powershell
git -C D:\TOOL\admin-panel add run-admin.bat start-admin.ps1 lib/store.js lib/data-root.js tests/data-root.test.js
git -C D:\TOOL\admin-panel commit -m "fix: standardize private data location"
git -C D:\TOOL\viralcrawl add run.bat start-tool.ps1 server.js
git -C D:\TOOL\viralcrawl commit -m "fix: share the canonical data root"
```

Record the root-level `D:\TOOL\start-mnhut-2tech-al.bat` change in the final handoff because `D:\TOOL` is not a Git repository.

### Task 3: Add versioned schema migrations

**Files:**
- Create: `D:\TOOL\admin-panel\lib\migrations.js`
- Create: `D:\TOOL\admin-panel\tests\migrations.test.js`
- Modify: `D:\TOOL\admin-panel\lib\store.js:41-58`

**Interfaces:**
- Produces: `applyMigrations(db: DatabaseSync): void`; `schema_migrations(version INTEGER PRIMARY KEY, applied_at INTEGER NOT NULL)`; voucher schema version `1`.
- Preserves: existing `openStore(options)` return shape and all current tables/data.

- [ ] **Step 1: Write the failing migration tests**

Assert that `applyMigrations` is repeatable, records version `1`, creates the exact voucher constraints/indexes from the spec, and preserves a pre-existing user plus ledger row.

- [ ] **Step 2: Run the migration test and verify RED**

Run: `node --test tests/migrations.test.js` from `D:\TOOL\admin-panel`
Expected: FAIL because `lib/migrations.js` does not exist.

- [ ] **Step 3: Implement `applyMigrations(db)` and call it from `openStore()`**

Migration `1` creates `vouchers(id, code_hash, code_hint, amount, status, created_at, expires_at, redeemed_at, revoked_at, redeemed_by)`; constrain amount to `4000000`, status to `active|redeemed|revoked`, and make `code_hash` unique. Apply each migration in one SQLite transaction and record it only after success.

- [ ] **Step 4: Run the private suite and verify GREEN**

Run: `npm test` from `D:\TOOL\admin-panel`
Expected: all existing tests plus migration tests pass.

- [ ] **Step 5: Commit the private task locally**

```powershell
git -C D:\TOOL\admin-panel add lib/migrations.js lib/store.js tests/migrations.test.js
git -C D:\TOOL\admin-panel commit -m "feat: add versioned private database migrations"
```

### Task 4: Implement the voucher domain transaction

**Files:**
- Create: `D:\TOOL\admin-panel\lib\vouchers.js`
- Create: `D:\TOOL\admin-panel\tests\vouchers.test.js`

**Interfaces:**
- Produces: `normalizeVoucherCode(value: string): string`.
- Produces: `createVoucher(store, { now?: number, randomBytes?: (size: number) => Buffer }): { id, code, codeHint, amount, status, createdAt, expiresAt }`.
- Produces: `redeemVoucher(store, { userId, code, now?: number, req?: IncomingMessage }): { voucherId, amount, balance }`.
- Produces: `listVouchers(store, { now?: number }): Array<{ id, codeHint, amount, status, createdAt, expiresAt, redeemedAt, revokedAt, redeemedBy }>`; views derive `expired` for active rows past `expires_at`.
- Produces: `revokeVoucher(store, { id, reason, now?: number, req?: IncomingMessage }): void`.

- [ ] **Step 1: Write failing voucher behavior tests**

Test the canonical `2TMN-` plus 24 Crockford-Base32-character format, lowercase/unformatted input normalization, at least 120 random bits, hash-only persistence, last-four hint, fixed amount, exact seven-day expiry, success ledger/audit rows, no plaintext returned by lists, exact-boundary expiry, revocation, malformed codes, and inactive users. Add a two-connection concurrency test asserting one success, one `409`, one `voucher` ledger row, and a final `+4000000` balance.

- [ ] **Step 2: Run the voucher test and verify RED**

Run: `node --test tests/vouchers.test.js`

Expected: FAIL because `lib/vouchers.js` does not exist.

- [ ] **Step 3: Implement the voucher functions**

Encode 15 CSPRNG bytes as 24 Crockford Base32 characters, use SHA-256 of the canonical code, `crypto.randomUUID()` IDs, integer timestamps, and `store.transaction`. Never persist or log plaintext. Map duplicate/used/expired/revoked conditions to stable errors with `status` values `400`, `404`, or `409` without revealing near matches.

- [ ] **Step 4: Run focused and full private tests**

Run: `node --test tests/vouchers.test.js`

Expected: focused tests PASS with exactly one ledger credit in concurrency cases.

Run: `npm test`

Expected: the complete private suite PASS.

- [ ] **Step 5: Commit the private task locally**

```powershell
git -C D:\TOOL\admin-panel add lib/vouchers.js tests/vouchers.test.js
git -C D:\TOOL\admin-panel commit -m "feat: add one-use internal vouchers"
```

### Task 5: Expose voucher APIs and pin commerce contracts

**Files:**
- Modify: `D:\TOOL\admin-panel\server.js:4-76`
- Modify: `D:\TOOL\admin-panel\tests\backend.test.js`
- Modify: `D:\TOOL\viralcrawl\server.js:7-42`
- Modify: `D:\TOOL\admin-panel\tests\gateway.test.js`

**Interfaces:**
- Consumes: voucher functions from Task 4.
- Produces: `POST /api/vouchers/redeem` with `{ code }` and response `{ redemption, user }`.
- Produces: `POST /admin/vouchers`, `GET /admin/vouchers`, and `POST /admin/vouchers/:id/revoke`.
- Preserves: `POST /api/purchase` request `{ plan, months }` plus `Idempotency-Key`, response `{ receipt, user }`.

- [ ] **Step 1: Add failing backend and gateway contract tests**

Assert user redemption requires session, exact origin, CSRF, JSON, bounded code length, and per-user attempt limiting; assert admin create/list/revoke requires admin session and a revocation reason. Pin the exact Free/Start/Pro/Studio catalog values and 1/6/12-month totals. Extend purchase tests to cover insufficient balance, replayed key, changed-input reuse, same-plan renewal, immediate upgrade, expired-plan fallback, and active-plan downgrade rejection. Preserve the existing official OAuth callback tests for state, one-use challenge, PKCE, nonce, audience, verified email, and exactly-one signup credit per Google subject. Extend Gmail compose/desktop-open tests for configured recipient, full Unicode/control-character encoding, length limits, host restriction, and popup-independent URL output. Assert the gateway forwards only the new public redeem route and still blocks all admin voucher routes.

- [ ] **Step 2: Run focused tests and verify RED**

Run: `node --test tests/backend.test.js tests/gateway.test.js`

Expected: FAIL with `404` for voucher routes.

- [ ] **Step 3: Implement routes and allowlist changes**

Import the voucher domain, use the existing session/CSRF/body/rate-limit helpers, return server-refreshed `userView`, record admin reasons, and add only `vouchers/redeem` to the public gateway regex. Do not add an API that accepts a balance amount from the browser.

- [ ] **Step 4: Run the full private suite**

Run: `npm test`

Expected: all backend, gateway, network, migration, and voucher tests PASS.

- [ ] **Step 5: Commit both repositories separately**

```powershell
git -C D:\TOOL\admin-panel add server.js tests/backend.test.js tests/gateway.test.js
git -C D:\TOOL\admin-panel commit -m "feat: expose secure voucher redemption"
git -C D:\TOOL\viralcrawl add server.js
git -C D:\TOOL\viralcrawl commit -m "feat: allow public voucher redemption"
```

### Task 6: Replace browser-local state with the public API foundation

**Files:**
- Create: `D:\TOOL\viralcrawl\package.json`
- Create: `D:\TOOL\viralcrawl\js\api-client.mjs`
- Create: `D:\TOOL\viralcrawl\js\app-state.mjs`
- Create: `D:\TOOL\viralcrawl\js\bootstrap.mjs`
- Create: `D:\TOOL\viralcrawl\tests\api-client.test.mjs`
- Create: `D:\TOOL\viralcrawl\tests\app-state.test.mjs`
- Modify: `D:\TOOL\viralcrawl\index.html:175-199`
- Modify: `D:\TOOL\viralcrawl\server.js:7-47`
- Modify: `D:\TOOL\viralcrawl\sw.js`

**Interfaces:**
- Produces: `createApiClient({ fetchImpl, locationRef, getCsrf }): ApiClient` with `getCatalog()`, `getMe()`, `beginGoogleLogin()`, `logout()`, `redeemVoucher(code)`, `purchase({ plan, months, requestKey })`, and `composeSupport({ subject, contact, message })`.
- Produces: `createAppState({ api }): { getSnapshot, subscribe, bootstrap, refreshMe, clearSession }` where the snapshot is `{ phase, catalog, user, csrf, config, error }`.
- Contract: mutation methods read the latest CSRF from app state, send JSON plus exact origin credentials, and surface typed `{ status, message }` errors.

- [ ] **Step 1: Write failing API/state tests**

Use injected fake fetch to assert catalog/me bootstrap, CSRF headers, idempotency header, encoded support query, `401` session clearing, `503` offline state, OAuth-unconfigured message preservation, and no fallback user/balance creation. Assert subscriptions receive immutable snapshots.

- [ ] **Step 2: Run public unit tests and verify RED**

Run: `node --test tests/api-client.test.mjs tests/app-state.test.mjs`

Expected: FAIL because the modules do not exist.

- [ ] **Step 3: Implement the API client and state store**

Keep the modules DOM-independent. `bootstrap()` performs catalog and me requests, distinguishes `ready|offline|error`, and never reads `vc_store`. Redirect login with `locationRef.assign('/api/auth/google')` rather than simulating an account.

- [ ] **Step 4: Replace inline bootstrap and update static/PWA allowlists**

Load only `<script type="module" src="./js/bootstrap.mjs">`; expose each new module through the gateway and service-worker asset list. Keep `script-src 'self'` without `unsafe-inline`.

- [ ] **Step 5: Run public and gateway tests**

Run: `npm test` from `D:\TOOL\viralcrawl`, then `npm test` from `D:\TOOL\admin-panel`

Expected: both suites PASS; a gateway GET for `/js/bootstrap.mjs` returns JavaScript and the old `/js/engine-resolver.js` is no longer required.

- [ ] **Step 6: Commit the public task**

```powershell
git add package.json js/api-client.mjs js/app-state.mjs js/bootstrap.mjs tests index.html server.js sw.js
git commit -m "refactor: make backend state authoritative"
```

### Task 7: Build the honest core UI, pricing animation, and Gmail flow

**Files:**
- Create: `D:\TOOL\viralcrawl\js\dom.mjs`
- Create: `D:\TOOL\viralcrawl\js\router.mjs`
- Create: `D:\TOOL\viralcrawl\js\pages\home.mjs`
- Create: `D:\TOOL\viralcrawl\js\pages\pricing.mjs`
- Create: `D:\TOOL\viralcrawl\js\pages\settings.mjs`
- Create: `D:\TOOL\viralcrawl\js\pages\support.mjs`
- Create: `D:\TOOL\viralcrawl\tests\core-ui.test.mjs`
- Modify: `D:\TOOL\viralcrawl\index.html`
- Modify: `D:\TOOL\viralcrawl\css\app.css`
- Modify: `D:\TOOL\viralcrawl\server.js`
- Modify: `D:\TOOL\viralcrawl\sw.js`
- Delete: `D:\TOOL\viralcrawl\js\engine-resolver.js`
- Delete/replace: legacy `app.js`, `page-dashboard.js`, `page-pricing.js`, `page-support.js`, and `page-settings.js` after their real routes exist.

**Interfaces:**
- Consumes: `ApiClient` and app-state contracts from Task 6.
- Produces: `createRouter({ outlet, routes })`; route renderers return cleanup functions.
- Produces: `buildGmailOpenFlow({ api, desktopOpen, windowRef })` that preserves fields and reports `opened|same-tab|error` without claiming delivery.

- [ ] **Step 1: Write failing pure UI behavior tests**

Assert the seven approved navigation labels only; exact owner/company copy; signed-out controls route to official login; voucher submit sends only the code; plan totals come from catalog for 1/6/12 months; selected-card state changes classes without changing price data; insufficient balance displays the backend error; internal credits are labeled nonwithdrawable; no MoMo/real-payment control is rendered; offline state has no fake KPI; and support Unicode/control characters remain text and produce a correctly encoded compose request.

- [ ] **Step 2: Run the UI test and verify RED**

Run: `node --test tests/core-ui.test.mjs`

Expected: FAIL because the page modules do not exist.

- [ ] **Step 3: Implement semantic shell and real core routes**

Use DOM creation/textContent helpers, event listeners, abortable subscriptions, keyboard-safe dialogs, and focus restoration. Show honest disabled placeholders for download/file/history routes until Plan 2. Add every new external module to the gateway and service-worker allowlists. Do not clear support inputs after opening Gmail.

- [ ] **Step 4: Implement visual system and motion**

Make light mode default, retain optional dark/system themes, add responsive navigation, clear loading/error/empty states, pricing-card selection/checkmark/price transitions, and `prefers-reduced-motion` overrides. Restore user zoom and visible focus.

- [ ] **Step 5: Remove legacy fake modules and scan for forbidden markers**

Run: `rg -n -i "simulateGoogle|vc_google_traffic|generateRandom|mockId|SampleCookie|qr_session|success:\s*true|engine-resolver|BroadcastChannel" index.html js css`

Expected: no production matches.

- [ ] **Step 6: Run public unit tests and syntax checks**

Run: `npm test`

Expected: all public unit tests PASS.

Run: `Get-ChildItem js -Recurse -Filter *.mjs | ForEach-Object { node --check $_.FullName }`

Expected: every module exits `0`.

- [ ] **Step 7: Commit the public core UI**

```powershell
git add index.html css js tests sw.js server.js
git commit -m "feat: connect identity wallet pricing and support"
```

### Task 8: Add the private voucher administration screen

**Files:**
- Modify: `D:\TOOL\admin-panel\index.html`
- Modify: `D:\TOOL\admin-panel\server.js`
- Modify: `D:\TOOL\admin-panel\js\admin.js`
- Create: `D:\TOOL\admin-panel\js\voucher-view.js`
- Modify: `D:\TOOL\admin-panel\css\admin.css`
- Create: `D:\TOOL\admin-panel\tests\admin-vouchers.test.js`

**Interfaces:**
- Consumes: admin voucher endpoints from Task 5.
- Produces: `voucherViewModel(rows, now): VoucherRowView[]` in a small dual-environment `js/voucher-view.js` export (CommonJS for `node:test`, frozen `window.VoucherView` for the existing classic admin script), plus a voucher table, one-time plaintext creation dialog, copy action, revoke-with-reason action, and no plaintext persistence in DOM after dialog close.

- [ ] **Step 1: Write failing admin voucher UI contract tests**

Test the pure view model and API-backed presenter: authenticated creation shows amount `4.000.000đ` and seven-day expiry once, list responses never contain plaintext, the presenter clears its plaintext field when the dialog closes, expired/redeemed rows cannot expose revoke, and revoke requires a non-empty reason.

- [ ] **Step 2: Run the test and verify RED**

Run: `node --test tests/admin-vouchers.test.js`

Expected: FAIL because no voucher view exists.

- [ ] **Step 3: Implement the admin view**

Expose `voucher-view.js` through the strict admin static allowlist. Follow existing `api()`/CSRF patterns, use text-safe rendering, copy via Clipboard API with fallback selection, refresh after mutations, and label credits explicitly as internal/nonwithdrawable.

- [ ] **Step 4: Run the complete private suite**

Run: `npm test`

Expected: all tests PASS.

- [ ] **Step 5: Commit the private task locally**

```powershell
git -C D:\TOOL\admin-panel add index.html server.js js/admin.js js/voucher-view.js css/admin.css tests/admin-vouchers.test.js
git -C D:\TOOL\admin-panel commit -m "feat: manage internal vouchers"
```

### Task 9: Verify the complete core vertical slice

**Files:**
- Create: `D:\TOOL\viralcrawl\playwright.config.mjs`
- Create: `D:\TOOL\viralcrawl\tests\e2e\core-flow.spec.mjs`
- Modify: `D:\TOOL\viralcrawl\package.json`
- Create/modify: `D:\TOOL\viralcrawl\package-lock.json`

**Interfaces:**
- Consumes: completed public and private core contracts.
- Produces: repeatable Chromium smoke coverage for offline, signed-out, authenticated fixture, voucher, purchase, logout, and Gmail-open UI states.

- [ ] **Step 1: Write the failing browser scenarios**

Use Playwright route fixtures (never fake production code) to assert: offline banner; OAuth navigation to `/api/auth/google`; authenticated 2,000,000 balance; voucher response increases to 6,000,000; replayed clicks create one purchase request; selected pricing animation state; support values persist after compose open; keyboard navigation and reduced-motion behavior.

- [ ] **Step 2: Run browser tests and verify RED**

Run: `npm run test:e2e`

Expected: FAIL until configuration/fixtures and selectors exist.

- [ ] **Step 3: Add Playwright configuration and stable accessibility selectors**

Install `@playwright/test` as an exact dev dependency, use Chromium only, bind test servers to loopback, and keep all simulated network responses inside test files.

- [ ] **Step 4: Run all core verification**

Run public `npm test`.

Expected: unit tests PASS.

Run public `npm run test:e2e`.

Expected: browser tests PASS.

Run private `npm test`.

Expected: the private suite PASS.

Run `git diff --check`, then run the forbidden-marker scan from Task 7 as a separate command.

Expected: both checks PASS and no demo markers remain in production files.

- [ ] **Step 5: Commit the public browser suite**

```powershell
git add package.json package-lock.json playwright.config.mjs tests/e2e
git commit -m "test: cover core account and wallet flows"
```

Plan 1 is complete when the public app has real identity/wallet/pricing/support behavior, the private admin can create and revoke vouchers, and unavailable download features are honest rather than simulated.
