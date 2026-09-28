# Internal Credits and Honest Core Remediation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the already-published fake payment/login behavior with a server-authoritative virtual-credit, one-month ULTRA trial, code redemption, plan purchase, and clearly simulated seven-theme checkout system while keeping the admin and all private data local.

**Architecture:** The private Node/SQLite service owns verified identities, one-time onboarding, credit accounts and ledger, one-use codes, internal checkouts, subscriptions, entitlements, and audit data. The public vanilla-JavaScript application renders server state only; its seven named channel themes all terminate at the same internal-code redemption API and never contact a financial provider. This plan supersedes `2026-09-27-core-identity-wallet-plan.md`, then execution continues through the existing real-download and admin-hardening/delivery plans before any final publication is declared complete.

**Tech Stack:** Node.js 24, `node:sqlite`, `google-auth-library`, built-in `crypto` and `fetch`, vanilla browser ES modules, CSS, `node:test`, and Playwright Chromium for final browser smoke coverage.

**Spec:** `docs/superpowers/specs/2026-09-27-internal-credit-checkout-design.md` together with the non-commerce requirements retained from `docs/superpowers/specs/2026-09-27-layered-productionization-design.md`

## Global Constraints

- Begin public implementation in a fresh worktree/branch from the then-current `origin/main`; do not build on or discard the dirty `D:\TOOL\viralcrawl-productionization\server.js` change.
- Preserve public commits `fe42c57` and `673ee18` as historical evidence; correct them with reviewed commits and never force-push.
- Create a private feature branch from the current local `D:\TOOL\admin-panel` state; keep `safety/unreviewed-finance-20260927` intact and keep `git remote -v` empty.
- Cherry-pick the approved spec and this plan into the fresh public implementation branch before product edits.
- Brand copy is exactly `Mnhut 2tech Al`, `NGUYEN MINH NHỰT`, and `2TECH MN`.
- `WELCOME_CREDITS = 2_500_000`, `CODE_CREDITS = 4_000_000`, and `CODE_TTL_MS = 604_800_000`.
- A verified new internal user receives one welcome-credit grant and one ULTRA entitlement ending one calendar month after the server grant time.
- Unit metadata is exactly `{ unit: "CREDIT", realMoney: false, withdrawable: false, cashValue: null }`; no product UI formats credits as VND, USD, or cash.
- Internal checkout theme IDs are exactly `momo`, `mbbank`, `techcombank`, `sacombank`, `visa`, `applepay`, and `googlepay`.
- Every themed checkout displays `NỘI BỘ / MÔ PHỎNG — ĐIỂM ẢO — KHÔNG CHUYỂN HOẶC RÚT TIỀN THẬT` throughout the flow.
- No production file may collect a bank account, card number, expiry, CVV, OTP, financial password, or real-wallet phone number, or generate a payment QR/deep link.
- There is no `/api/payment/*`, deposit webhook, provider return handler, transfer, withdrawal, cash-out, peer-transfer, or browser-accessible credit-confirmation API.
- Google and Apple use their official authorization pages. Apple stays disabled with `Chưa cấu hình` until all required private configuration exists.
- Browser storage may retain harmless presentation preferences only; it never authorizes identity, credit, plan, expiry, entitlement, transaction, cookie, traffic, or download state.
- The pricing/packages tab remains the final primary navigation tab and plan selection supports keyboard input and reduced motion.
- GitHub Pages is a truthful static shell. Full identity, credit, admin, and download behavior remains available only through the local gateway/private backend unless a later HTTPS backend deployment is separately approved.
- No public push occurs at the end of this plan. Publication remains the last task of `2026-09-27-admin-hardening-delivery-plan.md`, after this plan and `2026-09-27-real-download-product-plan.md` both pass.

## Review Focus

- A legacy database contains fake `deposit`/`transfer_out` ledger activity or finance tables: quarantine those records, derive no credits from rejected finance sources, and preserve an auditable migration report (Task 1).
- OAuth callback, code redemption, or plan purchase arrives twice or concurrently: exactly one grant/debit succeeds and retries return the original result without duplicate ledger rows (Tasks 2, 3, and 4).
- Apple omits name/email on later callbacks, configuration is partial, or JWKS/token exchange is unavailable: preserve known profile data, disable incomplete configuration, and never fall back to a fake account (Task 4).
- An old service-worker cache or GitHub Pages has no backend: activate the new cache atomically and render an actionable disconnected state without fabricated success (Tasks 6, 9, and 10).
- A malicious user submits very long Unicode, code lookalikes, HTML, an invalid theme, client-supplied balance/price, or a reused idempotency key with different input: reject safely, render text only, and leave state unchanged (Tasks 2, 3, 5, 7, and 8).

## Program Execution Order

1. Execute every task in this plan with per-task implementation and review gates.
2. Execute `docs/superpowers/plans/2026-09-27-real-download-product-plan.md`, inheriting this plan's server-authority and no-demo constraints.
3. Execute `docs/superpowers/plans/2026-09-27-admin-hardening-delivery-plan.md`, inheriting this plan's credit terminology and private/public boundaries.
4. Run whole-branch review, release verification, non-force push, GitHub Actions wait, and published Pages verification only at the final delivery gate.

---

### Task 0: Cut off every rejected finance runtime path

**Files:**
- Delete: `D:\TOOL\admin-panel\lib\payment.js`
- Delete: `D:\TOOL\admin-panel\tests\payment.test.js`
- Modify: `D:\TOOL\admin-panel\server.js`
- Modify: `D:\TOOL\admin-panel\index.html`
- Modify: `D:\TOOL\admin-panel\js\admin.js`
- Modify: `D:\TOOL\admin-panel\tests\backend.test.js`
- Modify: `D:\TOOL\admin-panel\tests\gateway.test.js`
- Create: `D:\TOOL\viralcrawl\package.json`
- Create: `D:\TOOL\viralcrawl\tests\gateway.test.js`
- Modify: `D:\TOOL\viralcrawl\server.js`

**Interfaces:**
- Removes: all payment-module imports plus deposit, provider-return, webhook, transfer, withdrawal, payment-config, and simulate-confirm routes.
- Produces: explicit `404` behavior for every removed route through both the private service and public gateway.
- Preserves: the rejected database rows/tables untouched until Task 1 can quarantine them transactionally.

- [ ] **Step 1: Write failing negative route and response tests**

Enumerate current payment route variants and assert `404` for every method through the private service and public gateway. Assert health/catalog/me/admin responses contain no bank account, gateway config, sandbox secret, hash secret, provider URL, deposit list, or transfer list.

- [ ] **Step 2: Run focused tests and verify RED**

Run private: `node --test tests/backend.test.js tests/gateway.test.js`

Run public: `node --test tests/gateway.test.js`

Expected: FAIL because the routes and allowlist still exist.

- [ ] **Step 3: Remove the payment runtime and temporary admin finance views**

Delete `lib/payment.js` and its positive tests. Remove imports, route handlers, overview fields, config fields, finance admin navigation, and finance renderer/actions. Do not drop or rewrite database tables in this task; do not replace the routes with a different confirmation shortcut.

- [ ] **Step 4: Restrict the public gateway immediately**

Remove all `/api/payment/*` patterns. Add a minimal public `node:test` package/test harness that instantiates `makeGateway()` with a temporary config and proves removed routes are rejected before an upstream request is made.

- [ ] **Step 5: Run both repository suites**

Run public `npm test`, then private `npm test`.

Expected: PASS with no payment module present and every old finance route denied.

- [ ] **Step 6: Commit private and public cutoffs separately**

```powershell
git -C D:\TOOL\admin-panel add --all
git -C D:\TOOL\admin-panel commit -m "fix: remove rejected finance runtime"
git -C D:\TOOL\viralcrawl add package.json server.js tests/gateway.test.js
git -C D:\TOOL\viralcrawl commit -m "fix: block rejected finance routes"
```

### Task 1: Replace ad-hoc schema setup with a recoverable virtual-credit migration

**Files:**
- Create: `D:\TOOL\admin-panel\lib\migrations.js`
- Create: `D:\TOOL\admin-panel\tests\migrations.test.js`
- Modify: `D:\TOOL\admin-panel\lib\store.js`
- Modify: `D:\TOOL\admin-panel\tests\backend.test.js`

**Interfaces:**
- Produces: `applyMigrations(db: DatabaseSync, options?: { now?: number }): void`.
- Produces: `LATEST_SCHEMA_VERSION: number` and `schema_migrations(version INTEGER PRIMARY KEY, applied_at INTEGER NOT NULL)`.
- Produces: `migration_audit(id, version, action, details_json, created_at)` with redacted, deterministic migration evidence.
- Preserves: sessions, users, connections, jobs, settings, purchases, and accepted non-finance credit history by user ID; legacy user columns remain compatibility-only until Task 5 removes their final readers.
- Quarantines: rejected tables/rows under `legacy_*_disabled`; runtime modules never query them.

- [ ] **Step 1: Write failing fresh-schema tests**

Assert that a new database creates the exact tables required by the spec: `users`, `external_identities`, `credit_accounts`, `credit_ledger`, `credit_codes`, `credit_redemptions`, `internal_checkouts`, `trial_grants`, `entitlements`, `subscription_purchases`, `oauth_challenges`, `audit_events`, and the existing job/session/connection tables. Assert foreign keys, unique source/idempotency constraints, nonnegative credit checks, and allowed checkout statuses.

- [ ] **Step 2: Write failing legacy-migration tests**

Build a fixture with the current `users`, `ledger`, `purchases`, `deposits`, and `transfers` schema. Assert migration preserves IDs/profile/session/job rows, creates `(provider, subject)` identities from verified legacy subjects, converts only `signup`, `purchase`, and `admin_adjustment` ledger effects into an opening credit balance, excludes `deposit` and `transfer_out`, quarantines finance rows, records the excluded totals, and passes `PRAGMA foreign_key_check`.

- [ ] **Step 3: Cover rollback and repeated startup**

Inject a migration failure after staging tables and assert the old schema/data remains usable with no recorded version. Run a successful migration twice and assert the second call is a no-op. Assert a pre-migration SQLite backup exists outside the public repository before a legacy database is changed.

- [ ] **Step 4: Run the migration tests and verify RED**

Run: `node --test tests/migrations.test.js` from `D:\TOOL\admin-panel`

Expected: FAIL because `lib/migrations.js` does not exist and `openStore()` still creates finance tables directly.

- [ ] **Step 5: Implement versioned migration and simplify `openStore()`**

Move schema ownership to `applyMigrations()`. Create provider-neutral `external_identities`, accounts, ledger, checkout, code, and entitlement tables while retaining the old Google/balance/plan user columns as explicitly deprecated compatibility data during Tasks 1–4. Use temporary tables and explicit column lists for every rebuilt table, verify counts and foreign keys before committing, and write a redacted migration audit. Never calculate new credit from a deposit, transfer, webhook, or browser value.

- [ ] **Step 6: Run focused and full private suites**

Run: `node --test tests/migrations.test.js tests/data-root.test.js`

Expected: PASS, including rollback, quarantine, and idempotent startup.

Run: `npm test`

Expected: all private tests that do not intentionally target the rejected payment module PASS.

- [ ] **Step 7: Commit the private migration locally**

```powershell
git -C D:\TOOL\admin-panel add lib/migrations.js lib/store.js tests/migrations.test.js tests/backend.test.js
git -C D:\TOOL\admin-panel diff --cached --check
git -C D:\TOOL\admin-panel commit -m "refactor: migrate to virtual credit schema"
```

### Task 2: Implement the only credit mutation path and one-use admin codes

**Files:**
- Create: `D:\TOOL\admin-panel\lib\commerce-constants.js`
- Create: `D:\TOOL\admin-panel\lib\credits.js`
- Create: `D:\TOOL\admin-panel\lib\credit-codes.js`
- Create: `D:\TOOL\admin-panel\lib\internal-checkouts.js`
- Create: `D:\TOOL\admin-panel\tests\credits.test.js`
- Create: `D:\TOOL\admin-panel\tests\credit-codes.test.js`
- Create: `D:\TOOL\admin-panel\tests\internal-checkouts.test.js`
- Modify: `D:\TOOL\admin-panel\lib\store.js`

**Interfaces:**
- Produces: `creditSummary(db, userId): { availableCredits, unit, realMoney, withdrawable, cashValue }`.
- Produces: `postCreditEntry(db, input): CreditReceipt` for composition inside an existing transaction; callers must not use it without their own transaction.
- Produces: `applyCreditEntry(store, { userId, delta, kind, sourceType, sourceId, requestKey, reason, actorType, actorId, now }): CreditReceipt`; callers cannot omit source/idempotency metadata.
- Produces: `createCreditCode(store, { adminId, now?, randomBytes? }): { id, code, codeHint, credits, createdAt, expiresAt }`.
- Produces: `listCreditCodes(store, { now? }): CreditCodeView[]` and `revokeCreditCode(store, { id, adminId, reason, now? }): void` without plaintext codes.
- Produces: `createInternalCheckout(store, { userId, theme, now? }): CheckoutView`.
- Produces: `redeemCheckout(store, { userId, checkoutId, code, requestKey, now?, req? }): RedemptionReceipt`.

- [ ] **Step 1: Write failing credit-ledger tests**

Assert integer-only deltas, no negative final balance, exactly one ledger row per `(kind, sourceType, sourceId)` and `(userId, requestKey)`, correct `balance_after`, rollback after injected audit failure, and rejection of direct `deposit`, `transfer`, `withdrawal`, or client-controlled kinds. Include a request-key collision with changed input and expect `409` with no mutation.

- [ ] **Step 2: Write failing code lifecycle tests**

Assert `2TMN-` plus 24 Crockford-Base32 characters from 15 random bytes, case/separator normalization, HMAC-SHA256 lookup using a generated private `creditCodePepper`, hash-only persistence, four-character hint, exactly `4_000_000` credits, exact `604_800_000` ms unused lifetime, one-time plaintext return, revocation reason, and generic invalid/expired/redeemed errors.

- [ ] **Step 3: Write failing checkout and concurrency tests**

Assert only the seven exact theme IDs are accepted; theme selection stores no account/payment data; redemption requires checkout ownership; two database connections racing on one code produce one success, one conflict, one `+4_000_000` ledger entry, and one succeeded checkout. Retry with the same idempotency key returns the original receipt.

- [ ] **Step 4: Run focused tests and verify RED**

Run: `node --test tests/credits.test.js tests/credit-codes.test.js tests/internal-checkouts.test.js`

Expected: FAIL because the modules do not exist.

- [ ] **Step 5: Implement credit constants and mutation boundary**

Generate `creditCodePepper` once in private config and validate it at startup. Keep the conditional code claim, balance mutation, redemption, ledger, checkout state, and audit event in one `BEGIN IMMEDIATE` transaction. Implement `applyCreditEntry()` as the standalone transaction wrapper and `postCreditEntry()` as its transaction-bound primitive so onboarding, redemption, and purchase never nest SQLite transactions. Do not store plaintext codes or expose an arbitrary positive credit mutation to public routes.

- [ ] **Step 6: Run focused and full private suites**

Run the focused command from Step 4, then `npm test`.

Expected: all tests PASS; code concurrency leaves one credit entry.

- [ ] **Step 7: Commit the private domain locally**

```powershell
git -C D:\TOOL\admin-panel add lib/commerce-constants.js lib/credits.js lib/credit-codes.js lib/internal-checkouts.js lib/store.js tests/credits.test.js tests/credit-codes.test.js tests/internal-checkouts.test.js
git -C D:\TOOL\admin-panel commit -m "feat: add code-gated virtual credits"
```

### Task 3: Separate subscriptions from catalog and enforce real-time entitlement

**Files:**
- Create: `D:\TOOL\admin-panel\lib\subscriptions.js`
- Create: `D:\TOOL\admin-panel\tests\subscriptions.test.js`
- Modify: `D:\TOOL\admin-panel\lib\catalog.js`
- Modify: `D:\TOOL\admin-panel\lib\downloads.js`
- Modify: `D:\TOOL\admin-panel\tests\backend.test.js`

**Interfaces:**
- Preserves: `PLATFORMS`, `PLANS`, `TERMS`, `price(planId, months)`, `platformFor(url)`, and `addMonths(time, months)` as pure catalog helpers.
- Produces: `grantUltraTrialInTransaction(db, { userId, sourceId, now }): EntitlementView` for an existing transaction and rejects a second trial for the same user.
- Produces: `effectiveEntitlement(db, userId, now?): EntitlementView` with FREE fallback at `endsAt <= now`.
- Produces: `purchaseSubscription(store, { userId, planId, months, requestKey, now?, req? }): PurchaseReceipt`.
- Produces: `requireEntitlement(db, { userId, capability, now? }): PlanLimits` for every job mutation.

- [ ] **Step 1: Write failing trial-boundary tests**

Assert ULTRA begins at the grant timestamp, ends at `addMonths(now, 1)`, remains active one millisecond before the boundary, becomes FREE exactly at the boundary, grants once under concurrent calls, and cannot be revived by a browser-provided expiry.

- [ ] **Step 2: Write failing purchase tests**

Pin server catalog prices and 1/6/12-month discounts. Assert one atomic credit debit, same-plan renewal from the current end, expired-plan purchase from now, active higher-tier downgrade rejection, insufficient credits, rollback after ledger/audit failure, replayed key returning one receipt, and changed-input key reuse returning `409`.

- [ ] **Step 3: Write failing job-authorization tests**

At the same expiry boundary, assert queue/batch/quality/concurrency checks use `effectiveEntitlement()` and deny limits beyond FREE even if the client posts `plan: "ULTRA"` or a future expiry.

- [ ] **Step 4: Run focused tests and verify RED**

Run: `node --test tests/subscriptions.test.js tests/backend.test.js`

Expected: FAIL because subscription state is still stored directly on `users` and catalog owns mutations.

- [ ] **Step 5: Implement subscription and entitlement services**

Keep catalog data pure. Record trial and purchase entitlements as append-only rows; determine the active row by server time and tier rules. Use `postCreditEntry()` from Task 2 inside the purchase transaction and return the authoritative credit summary with the receipt.

- [ ] **Step 6: Run the private suite**

Run: `npm test`

Expected: PASS with exact boundary and idempotency coverage.

- [ ] **Step 7: Commit the private subscription task locally**

```powershell
git -C D:\TOOL\admin-panel add lib/subscriptions.js lib/catalog.js lib/downloads.js tests/subscriptions.test.js tests/backend.test.js
git -C D:\TOOL\admin-panel commit -m "feat: enforce server-owned subscriptions"
```

### Task 4: Implement provider-neutral Google and Apple identity onboarding

**Files:**
- Create: `D:\TOOL\admin-panel\lib\identities.js`
- Create: `D:\TOOL\admin-panel\lib\apple-oauth.js`
- Create: `D:\TOOL\admin-panel\tests\identities.test.js`
- Create: `D:\TOOL\admin-panel\tests\apple-oauth.test.js`
- Modify: `D:\TOOL\admin-panel\server.js`
- Modify: `D:\TOOL\admin-panel\lib\store.js`
- Modify: `D:\TOOL\admin-panel\tests\backend.test.js`

**Interfaces:**
- Produces: `loginIdentity(store, { provider, subject, email, emailVerified, name, now, req }): UserView`.
- Produces: `linkIdentity(store, { authenticatedUserId, provider, subject, email, emailVerified, name, now, req }): UserView` without onboarding benefits.
- Produces: `appleConfigured(config): boolean`, `createAppleAuthorizationUrl(config, challenge): URL`, `exchangeAppleCode(config, code, fetchImpl): Promise<TokenSet>`, and `verifyAppleIdToken(config, token, { nonce, fetchImpl, now }): Promise<VerifiedIdentity>`.
- Preserves: existing Google PKCE/state/nonce/audience/email-verification protections.

- [ ] **Step 1: Write failing provider-identity tests**

Assert uniqueness by `(provider, subject)`, not email; first verified identity atomically creates the user, `+2_500_000` welcome ledger entry, one trial grant, one entitlement, and audit rows; callback replay and concurrent first login grant once. Assert an unverified identity grants nothing and linking a second provider to an authenticated user grants nothing.

- [ ] **Step 2: Write failing Apple configuration and token tests**

Assert partial configuration disables Apple, authorization includes state/nonce and the exact callback, callbacks validate issuer/audience/expiry/nonce/signature, JWKS/network/token errors create no user, and later callbacks with missing name/email preserve stored profile values. Test `form_post` body size/content type and reject callback state replay.

- [ ] **Step 3: Run focused tests and verify RED**

Run: `node --test tests/identities.test.js tests/apple-oauth.test.js tests/backend.test.js`

Expected: FAIL because identity is Google-specific and Apple routes do not exist.

- [ ] **Step 4: Implement atomic onboarding and official OAuth routes**

Use `/api/auth/google`, existing Google callback compatibility, `/api/auth/apple`, and `/api/auth/apple/callback`. Store only hashed one-use challenges with provider and `login|link` mode. Compose `postCreditEntry()` and `grantUltraTrialInTransaction()` inside the same onboarding transaction, and update `userView()` to read `creditSummary()` plus `effectiveEntitlement()` rather than deprecated user columns. Use built-in crypto/JWK verification and injected fetch in tests. Never accept a name/email/provider subject directly from a public JSON login endpoint.

- [ ] **Step 5: Run OAuth and full private suites**

Run the focused command from Step 3, then `npm test`.

Expected: PASS; fake account chooser and caller-supplied onboarding credit are impossible.

- [ ] **Step 6: Commit the private identity task locally**

```powershell
git -C D:\TOOL\admin-panel add lib/identities.js lib/apple-oauth.js lib/store.js server.js tests/identities.test.js tests/apple-oauth.test.js tests/backend.test.js
git -C D:\TOOL\admin-panel commit -m "feat: add verified Google and Apple onboarding"
```

### Task 5: Expose internal-credit contracts through the restrictive gateway

**Files:**
- Modify: `D:\TOOL\admin-panel\server.js`
- Modify: `D:\TOOL\admin-panel\lib\migrations.js`
- Modify: `D:\TOOL\admin-panel\tests\migrations.test.js`
- Modify: `D:\TOOL\admin-panel\tests\backend.test.js`
- Modify: `D:\TOOL\admin-panel\tests\gateway.test.js`
- Modify: `D:\TOOL\viralcrawl\server.js`
- Modify: `D:\TOOL\viralcrawl\tests\gateway.test.js`

**Interfaces:**
- Produces: `GET /api/me`, `GET /api/catalog`, `GET /api/credits`, `GET /api/credit-transactions`.
- Produces: `POST /api/internal-checkouts`, `GET /api/internal-checkouts/:id`, and `POST /api/internal-checkouts/:id/redeem`.
- Produces: `POST /api/subscriptions/purchase` with `Idempotency-Key`.
- Produces: official Google/Apple auth routes from Task 4 and existing support/job routes that survive their contract tests.
- Preserves: Task 0's denial of all payment, deposit, webhook, provider-return, transfer, withdrawal, and simulate-confirm routes.

- [ ] **Step 1: Write failing user API contract tests**

Assert session, exact origin, CSRF, JSON type, body limits, rate limits, checkout ownership, code length, theme enum, idempotency, server catalog price, and authoritative post-mutation `/api/me` data. Post forged `balance`, `price`, `planExpiry`, `userId`, and `realMoney` fields and assert they are ignored or rejected without state changes.

- [ ] **Step 2: Write failing negative route tests**

Re-run every old route (`channels`, `banks`, `transfer`, `transfers`, `create`, `simulate-confirm`, `status`, `webhook`, and `vnpay/return`) and assert it remains `404` through the private service and public gateway. Assert the public gateway denies every `/admin/*` route and never forwards gateway/config secrets.

- [ ] **Step 3: Run focused tests and verify RED**

Run private: `node --test tests/backend.test.js tests/gateway.test.js`

Run public: `node --test tests/gateway.test.js`

Expected: FAIL because internal-credit routes are absent; old finance-route assertions must already PASS from Task 0.

- [ ] **Step 4: Implement the internal API surface and remove finance code**

Wire Tasks 2–4 into existing session/CSRF/origin helpers. Return unit metadata on every credit response. Remove the final reads of deprecated user balance/plan/Google-only columns, then apply a tested cleanup migration that rebuilds `users` as internal profile/status data only. Restrict the gateway regex to exact user routes and explicit ID patterns; do not use a broad `/api/` pass-through.

- [ ] **Step 5: Run both repositories' suites**

Run public `npm test`, then private `npm test`.

Expected: PASS; source and route scans find no runtime import of `lib/payment.js`.

- [ ] **Step 6: Commit private and public changes separately**

```powershell
git -C D:\TOOL\admin-panel add --all
git -C D:\TOOL\admin-panel commit -m "refactor: replace payment APIs with internal credits"
git -C D:\TOOL\viralcrawl add server.js tests/gateway.test.js
git -C D:\TOOL\viralcrawl commit -m "fix: restrict gateway to internal credit APIs"
```

### Task 6: Make public identity and application state server-authoritative

**Files:**
- Create: `D:\TOOL\viralcrawl\js\api-client.mjs`
- Create: `D:\TOOL\viralcrawl\js\app-state.mjs`
- Create: `D:\TOOL\viralcrawl\js\bootstrap.mjs`
- Create: `D:\TOOL\viralcrawl\js\dom.mjs`
- Create: `D:\TOOL\viralcrawl\js\router.mjs`
- Create: `D:\TOOL\viralcrawl\tests\api-client.test.mjs`
- Create: `D:\TOOL\viralcrawl\tests\app-state.test.mjs`
- Modify: `D:\TOOL\viralcrawl\index.html`
- Modify: `D:\TOOL\viralcrawl\server.js`
- Modify: `D:\TOOL\viralcrawl\sw.js`
- Modify: `D:\TOOL\viralcrawl\package.json`
- Delete/replace: `D:\TOOL\viralcrawl\js\app.js`

**Interfaces:**
- Produces: `createApiClient({ fetchImpl, locationRef, getCsrf }): ApiClient` with typed methods for auth, catalog, current user, credits, checkout, redemption, purchase, transactions, logout, and support compose.
- Produces: `createAppState({ api, preferenceStore }): AppState` whose snapshot is `{ phase, catalog, user, credits, transactions, csrf, config, error }`.
- Produces: `text(value)`, `element(tag, attributes, children)`, and focus-safe dialog helpers that never inject untrusted HTML.
- Produces: `createRouter({ outlet, routes }): Router`; each route mount returns an unmount cleanup and stale async work is aborted on navigation.

- [ ] **Step 1: Write failing API-client tests**

Use injected fetch/location objects to assert credentials, CSRF and idempotency headers, exact endpoint paths, JSON/error parsing, `401` session clearing, `429` displayable errors, `503` offline state, Google/Apple navigation, and no fallback success after a network exception.

- [ ] **Step 2: Write failing state and storage tests**

Assert immutable subscriptions, bootstrap ordering, authoritative refresh after mutation, expiration display updates from server data, and persistence of only `theme`, `motion`, and `viewMode`. Seed malicious legacy `vc_store`, balance, plan, account, and transaction keys and assert they are ignored and removed.

- [ ] **Step 3: Run public unit tests and verify RED**

Run: `node --test tests/api-client.test.mjs tests/app-state.test.mjs`

Expected: FAIL because the modules do not exist and current `app.js` trusts localStorage.

- [ ] **Step 4: Implement API/state modules and external bootstrap**

Use a single state source, an external-module router, abort stale refreshes, and expose no global balance mutation method. Load only external modules; remove the fake Google/Apple modal, sample identities, random traffic, inline bootstrap, and inline event attributes. Keep `script-src 'self'` without `unsafe-inline`.

- [ ] **Step 5: Version the service-worker cache**

Precache only reviewed static assets, remove every old cache during activate, use network-first for navigation/API, and never cache authenticated API responses. Add tests that simulate activation with the previous cache name.

- [ ] **Step 6: Run public and cross-repository tests**

Run public `npm test`, then private `npm test`.

Expected: PASS; a static source scan finds no `simulateLogin`, sample identity, or authoritative `localStorage` state.

- [ ] **Step 7: Commit the public foundation**

```powershell
git -C D:\TOOL\viralcrawl add index.html server.js sw.js package.json js tests
git -C D:\TOOL\viralcrawl commit -m "refactor: make account state server authoritative"
```

### Task 7: Build the seven-theme internal checkout and plan interface

**Files:**
- Create: `D:\TOOL\viralcrawl\js\checkout-themes.mjs`
- Create: `D:\TOOL\viralcrawl\js\pages\pricing.mjs`
- Create: `D:\TOOL\viralcrawl\tests\checkout-themes.test.mjs`
- Create: `D:\TOOL\viralcrawl\tests\pricing-ui.test.mjs`
- Modify: `D:\TOOL\viralcrawl\css\app.css`
- Modify: `D:\TOOL\viralcrawl\index.html`
- Modify: `D:\TOOL\viralcrawl\js\bootstrap.mjs`
- Modify: `D:\TOOL\viralcrawl\server.js`
- Modify: `D:\TOOL\viralcrawl\sw.js`
- Delete: `D:\TOOL\viralcrawl\js\page-pricing.js`

**Interfaces:**
- Produces: immutable `CHECKOUT_THEMES` entries with only `{ id, label, accent, icon }` display metadata.
- Produces: `createPricingPage({ state, api, dialogs, now, reducedMotion }): { mount, unmount }`.
- Consumes: catalog, user, credit, checkout, redemption, transaction, and purchase contracts from Tasks 5–6.

- [ ] **Step 1: Write failing theme safety tests**

Assert exactly seven IDs and visible labels; every rendered step includes the permanent simulation label; no theme contains a provider URL, account number, phone, QR endpoint, card/CVV/OTP/password field, payment claim, currency symbol, or external form action. Pass an unknown theme and expect a safe validation error.

- [ ] **Step 2: Write failing pricing and redemption UI tests**

Assert pricing is the last navigation item; plan cards use server prices; keyboard and pointer selection change only presentation state; reduced motion disables transitions; the code review shows `4,000,000 credit` only after the server response; double-submit makes one request; failure never changes displayed credit; success refreshes `/api/me` and ledger; plaintext code is cleared after completion/close.

- [ ] **Step 3: Write failing purchase and expiry UI tests**

Assert current ULTRA trial and exact expiry come from the server, countdown reaching zero triggers a refresh rather than local authorization, insufficient credit shows the backend error, purchase uses a generated idempotency key, retries do not generate a second key, and the receipt uses `CREDIT` without VND/USD formatting.

- [ ] **Step 4: Run focused tests and verify RED**

Run: `node --test tests/checkout-themes.test.mjs tests/pricing-ui.test.mjs`

Expected: FAIL because the safe themed checkout does not exist and the legacy page contains real-payment simulation.

- [ ] **Step 5: Implement accessible themed checkout and pricing**

Use event listeners, semantic buttons/radios, focus restoration, live regions, escape-to-close, and text-only rendering. Theme motion may change accent/illustration but never behavior. Build checkout states `started`, `submitting`, `succeeded`, and recoverable error around the one code field.

- [ ] **Step 6: Remove legacy finance UI and run negative scans**

Delete transfer, deposit, polling, QR, fake receipt, local debit/credit, and provider-account code. Run a source scan for `simulate-confirm`, `VietQR`, `VNPay`, `Napas`, `accountNumber`, `cardNumber`, `CVV`, `OTP`, `transfer`, `withdraw`, `qrserver`, `img.vietqr`, `2momo`, `zalopay`, `VNĐ`, and `$100` in production public files.

Expected: no runtime finance-flow matches; permitted documentation/tests explicitly identify rejected patterns.

- [ ] **Step 7: Run and commit the public task**

Run public `npm test` and syntax-check every `.js`/`.mjs` file.

Expected: PASS.

```powershell
git -C D:\TOOL\viralcrawl add --all
git -C D:\TOOL\viralcrawl commit -m "feat: add internal credit checkout themes"
```

### Task 8: Replace finance administration with credit-code and entitlement operations

**Files:**
- Create: `D:\TOOL\admin-panel\js\credit-admin-view.js`
- Create: `D:\TOOL\admin-panel\tests\admin-credits.test.js`
- Modify: `D:\TOOL\admin-panel\index.html`
- Modify: `D:\TOOL\admin-panel\js\admin.js`
- Modify: `D:\TOOL\admin-panel\css\admin.css`
- Modify: `D:\TOOL\admin-panel\server.js`
- Modify: `D:\TOOL\admin-panel\tests\backend.test.js`

**Interfaces:**
- Produces: `POST /admin/credit-codes`, `GET /admin/credit-codes`, `POST /admin/credit-codes/:id/revoke`, and `GET /admin/credit-ledger`.
- Produces: `POST /admin/users/:id/credit-adjustments` and `POST /admin/users/:id/entitlements`, each requiring a reason.
- Produces: `creditAdminViewModel(data, now): AdminCreditView` as a dual browser/CommonJS pure formatter.
- Removes: deposit, transfer, payment-config, bank approval, and provider finance views/routes.

- [ ] **Step 1: Write failing admin API tests**

Assert admin authentication, loopback origin, CSRF, fixed code amount/lifetime, one-time plaintext response, redacted list, revoke reason, adjustment bounds, no negative balance, entitlement reason, audit actor/target/request metadata, config-secret redaction, and 404 for every removed finance route.

- [ ] **Step 2: Write failing admin view tests**

Assert code status filters, fixed `4,000,000 credit` copy, seven-day expiry, one-time reveal cleared from memory/DOM on close, copy fallback, reason dialogs, server-derived user/provider/trial/plan/expiry, safe Unicode rendering, and complete absence of currency, bank, card, webhook, or payment settings.

- [ ] **Step 3: Run focused tests and verify RED**

Run: `node --test tests/admin-credits.test.js tests/backend.test.js`

Expected: FAIL because the admin still exposes deposit/transfer behavior and lacks code APIs.

- [ ] **Step 4: Implement admin APIs and UI**

Consume Task 2/3 modules; do not duplicate balance SQL in route handlers. Serve `credit-admin-view.js` through the strict admin static allowlist. Require and audit human-readable reasons for every manual adjustment, revoke, status, session, or entitlement change.

- [ ] **Step 5: Run private suite and forbidden-source scan**

Run: `npm test`

Expected: PASS.

Scan private production files for `DEFAULT_BANK_CONFIG`, `gatewayConfig`, `VNPay`, `VietQR`, `Napas`, `createDeposit`, `confirmDeposit`, `createBankTransfer`, `processBankWebhook`, `transfer_out`, and `simulate-confirm`.

Expected: no runtime matches.

- [ ] **Step 6: Commit the private task locally**

```powershell
git -C D:\TOOL\admin-panel add --all
git -C D:\TOOL\admin-panel commit -m "feat: manage virtual credits and entitlements"
```

### Task 9: Remove remaining demo success paths and preserve honest core features

**Files:**
- Modify: `D:\TOOL\viralcrawl\js\router.mjs`
- Create: `D:\TOOL\viralcrawl\js\pages\dashboard.mjs`
- Create: `D:\TOOL\viralcrawl\js\pages\support.mjs`
- Create: `D:\TOOL\viralcrawl\js\pages\settings.mjs`
- Create: `D:\TOOL\viralcrawl\js\pages\unavailable.mjs`
- Create: `D:\TOOL\viralcrawl\tests\honest-shell.test.mjs`
- Modify: `D:\TOOL\viralcrawl\index.html`
- Modify: `D:\TOOL\viralcrawl\css\app.css`
- Modify: `D:\TOOL\viralcrawl\js\bootstrap.mjs`
- Modify: `D:\TOOL\viralcrawl\server.js`
- Modify: `D:\TOOL\viralcrawl\sw.js`
- Delete: `D:\TOOL\viralcrawl\js\engine-resolver.js`
- Delete/replace: legacy `page-dashboard.js`, `page-download-link.js`, `page-downloaded.js`, `page-history.js`, `page-settings.js`, and `page-support.js`

**Interfaces:**
- Produces: `createRouter({ outlet, routes }): Router`; each page `mount()` returns an `unmount()` cleanup.
- Produces: `openGmailCompose({ api, desktopOpen, windowRef, fields }): Promise<'opened'|'same-tab'>` without claiming email delivery.
- Produces: honest unavailable pages consumed temporarily until the real-download plan replaces them.

- [ ] **Step 1: Write failing shell and no-demo tests**

Assert navigation contains only Dashboard, Download by link, Downloaded, History, Settings, Support, and Pricing in that order; no removed auto-post/voice/split/render/automation/channel-monitor tabs exist; disconnected and unimplemented pages state exactly what is unavailable; library/job/traffic counts are never invented; and static Pages cannot create a user, credit, purchase, cookie, or successful download.

- [ ] **Step 2: Write failing support-flow tests**

Assert required subject/contact/message, safe long Unicode/control-character handling, exact owner/company signature supplied by the backend, configured recipient behavior, preservation of form values, allowlisted Gmail host, normal-browser open attempt, popup-blocked same-tab fallback, and no message saying email was sent.

- [ ] **Step 3: Run focused tests and verify RED**

Run: `node --test tests/honest-shell.test.mjs`

Expected: FAIL because legacy modules fabricate metadata, cookies, QR sessions, traffic, queue records, and success.

- [ ] **Step 4: Implement the honest shell and Gmail flow**

Render actual API state or explicit loading/empty/error/unavailable states. Preserve owner/company branding. Keep download routes visible but honestly unavailable until the next plan; do not retain legacy implementation behind hidden controls.

- [ ] **Step 5: Delete legacy modules and run exhaustive scans**

Scan production files for sample identities/cookies, `Math.random()` data generation, `BroadcastChannel` demo syncing, fake QR sessions, hard-coded library counts, fabricated views/likes/sizes, local “ready” jobs, fake 4K results, and success-on-fetch-error branches.

Expected: no production matches.

- [ ] **Step 6: Run and commit the public task**

Run public `npm test` and syntax checks.

Expected: PASS under the production CSP.

```powershell
git -C D:\TOOL\viralcrawl add --all
git -C D:\TOOL\viralcrawl commit -m "fix: remove remaining demo success paths"
```

### Task 10: Add browser, cache-upgrade, and public-safety release gates

**Files:**
- Create: `D:\TOOL\viralcrawl\playwright.config.mjs`
- Create: `D:\TOOL\viralcrawl\tests\e2e\internal-credit-flow.spec.mjs`
- Create: `D:\TOOL\viralcrawl\scripts\verify-public-safety.mjs`
- Create: `D:\TOOL\viralcrawl\tests\public-safety.test.mjs`
- Modify: `D:\TOOL\viralcrawl\package.json`
- Create/modify: `D:\TOOL\viralcrawl\package-lock.json`
- Modify: `D:\TOOL\viralcrawl\.github\workflows\deploy.yml`
- Modify: `D:\TOOL\viralcrawl\sw.js`

**Interfaces:**
- Produces: `npm test`, `npm run test:e2e`, and `npm run verify:public` release commands.
- Produces: a CI job that tests before staging a fixed public asset allowlist.
- Consumes: fixture-only API responses inside tests; no production simulation hook is introduced.

- [ ] **Step 1: Write failing end-to-end scenarios**

Cover disconnected Pages state; signed-out Google navigation; disabled unconfigured Apple; authenticated 2,500,000-credit/ULTRA trial state; one code redemption to 6,500,000; one plan debit; idempotent double-click; exact-expiry refresh; all seven theme labels; keyboard/focus/reduced-motion behavior; no sensitive field; logout; and Gmail compose preservation. Keep all fixture responses in the test process.

- [ ] **Step 2: Write failing public-safety tests**

Assert the staged Pages artifact contains only `index.html`, `manifest.json`, `sw.js`, reviewed `assets/`, `css/`, and `js/`; reject admin paths, SQLite, config, secrets, cookies, logs, downloads, PEM/key files, and forbidden finance/demo markers. Assert service-worker activation deletes the cache name used by the deployed unsafe build.

- [ ] **Step 3: Run new gates and verify RED**

Run: `npm test`, `npm run test:e2e`, and `npm run verify:public`.

Expected: at least browser/safety gates FAIL before their configuration and workflow integration exist.

- [ ] **Step 4: Pin browser tooling and implement CI gates**

Install `@playwright/test` with `--save-dev --save-exact`, Chromium only. Update Actions to run `npm ci`, unit tests, public-safety verification, syntax checks, and the selected browser smoke set before upload. Stage files from an explicit allowlist rather than `cp -r js` without validation.

- [ ] **Step 5: Run the complete core matrix**

Run public unit, E2E, safety, syntax, and `git diff --check` commands; run private `npm test`; run negative source scans in both repositories; parse all PowerShell launchers; start services against a temporary explicit data root and verify loopback binding plus `/api/health`.

Expected: every command exits `0`, no forbidden production marker is found, and temporary state stays outside both repositories.

- [ ] **Step 6: Commit the public gates**

```powershell
git -C D:\TOOL\viralcrawl add package.json package-lock.json playwright.config.mjs tests scripts sw.js .github/workflows/deploy.yml
git -C D:\TOOL\viralcrawl commit -m "test: gate internal credit release"
```

### Task 11: Update truthful documentation and complete the core review gate

**Files:**
- Modify: `D:\TOOL\viralcrawl\README.md`
- Modify: `D:\TOOL\viralcrawl\docs\superpowers\plans\2026-09-27-real-download-product-plan.md`
- Modify: `D:\TOOL\viralcrawl\docs\superpowers\plans\2026-09-27-admin-hardening-delivery-plan.md`
- Create: `D:\TOOL\viralcrawl\docs\operations\internal-credits.md`
- Create: `D:\TOOL\admin-panel\docs\migration-and-recovery.md`

**Interfaces:**
- Produces: operator instructions for creating/revoking codes, interpreting the ledger, restoring the pre-migration backup, configuring official OAuth, and understanding Pages versus local functionality.
- Produces: downstream plans that reference the new spec and inherit the no-money/no-demo/API boundaries.
- Produces: a reviewed core checkpoint; it does not publish.

- [ ] **Step 1: Write documentation assertions into public-safety tests**

Assert README and operator docs state 2,500,000 welcome credits, 4,000,000-code value, seven-day unused lifetime, one-month ULTRA trial, non-cash/nontransferable/nonwithdrawable status, simulation labeling, Apple configuration behavior, local-only admin, and static Pages limitations. Reject old 2,000,000, VND/USD equivalence, real gateway, transfer, or withdrawal claims.

- [ ] **Step 2: Run the documentation test and verify RED**

Run: `npm run verify:public`

Expected: FAIL because current README describes old currency-like credits and incomplete provider behavior.

- [ ] **Step 3: Update public/private documentation and downstream plan references**

Document recovery without printing secrets. Add the new spec path and global virtual-credit constraints to both downstream plans. Mark `2026-09-27-core-identity-wallet-plan.md` as superseded by this plan without deleting it.

- [ ] **Step 4: Run final core verification**

Run the complete matrix from Task 10, then inspect `git status --short`, `git diff --check`, private `git remote -v`, public/private recent logs, and public staged/history filename scans.

Expected: both implementation branches are clean; the private remote list is empty; all suites pass; no private artifact is in public history.

- [ ] **Step 5: Request independent whole-core reviews**

Run one spec-compliance review against both approved specs and one code-quality/security review across the complete public/private branch diffs. Resolve every Critical/Important issue with a new failing test, minimal fix, rerun, and focused commit; repeat reviews until approved.

- [ ] **Step 6: Commit documentation separately**

```powershell
git -C D:\TOOL\admin-panel add docs/migration-and-recovery.md
git -C D:\TOOL\admin-panel commit -m "docs: explain credit migration recovery"
git -C D:\TOOL\viralcrawl add README.md docs
git -C D:\TOOL\viralcrawl commit -m "docs: document internal credit operation"
```

Do not push after this task. Continue automatically to the real-download plan, then the admin-hardening/delivery plan. Only the latter plan's final verified task may push public `main`, wait for GitHub Actions, verify the Pages URL, and hand the GitHub link to the owner.
