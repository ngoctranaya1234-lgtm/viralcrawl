# Internal Credit Checkout and Subscription Design

**Date:** 2026-09-27
**Owner:** NGUYEN MINH NHUT
**Company:** 2TECH MN
**Status:** Written for owner review

## 1. Decision and scope

This document replaces the payment, signup-credit, and subscription portions of
`2026-09-27-layered-productionization-design.md`. The remaining product,
download, Gmail support, private-admin, and delivery requirements in that design
continue to apply.

The product will use **virtual credits only**. Credits:

- are not money and have no cash value;
- cannot be bought with money in this release;
- cannot be transferred, withdrawn, refunded to a bank, or converted to cash;
- are used only to activate plans inside the application;
- are created only by a verified welcome grant, a one-use admin code, or a
  reasoned admin adjustment.

The public UI may offer polished internal themes named MoMo, MB Bank,
Techcombank, Sacombank, Visa, Apple Pay, and Google Pay. These names select a
visual checkout theme only. They do not contact those providers and never imply
that a financial transaction occurred.

This remains an architectural change because identity, credits, subscriptions,
the public gateway, the private admin, database migrations, and the deployed
frontend all need coordinated changes.

## 2. Success criteria

The change is successful when:

1. every balance, plan, expiry, and entitlement comes from the private backend;
2. a new verified Google or Apple identity receives 2,500,000 virtual credits
   and one ULTRA trial exactly once;
3. the ULTRA trial ends one calendar month after it is granted and feature
   access changes immediately according to server time;
4. an admin can create a one-use 4,000,000-credit code valid for seven days;
5. concurrent or repeated redemption can credit at most once;
6. a user can spend credits on a plan through an atomic, idempotent purchase;
7. every simulated channel is permanently identified as internal and cannot
   collect real payment credentials;
8. there is no payment webhook, bank transfer, withdrawal, cash-out, card
   collection, real QR, or external payment deep link in either repository;
9. public GitHub contains no private admin source, database, secrets, cookies,
   logs, or downloaded media; and
10. the corrected public build replaces the misleading version currently
    published on GitHub Pages only after the required test and safety gates pass.

## 3. Approaches considered

### 3.1 Selected: code-gated internal checkout

The user selects a visual channel, receives an internal checkout reference,
enters an admin-issued code, reviews the virtual-credit grant, and submits it.
The private backend consumes the code and records the credit in one transaction.

This is selected because it provides the requested polished flow while keeping
the authority to create credits outside the browser.

### 3.2 Rejected: manual admin approval queue

The UI could create a pending request and wait for an admin to approve it. This
adds operational work, delays the user, and creates more states without adding
security beyond a one-use code.

### 3.3 Rejected: unrestricted sandbox confirmation

A browser button or public endpoint could mark a simulated payment successful.
This would let any user mint unlimited credits and repeats the unsafe behavior
already present in the deployed code. It must not exist.

## 4. Product language and visual rules

The application uses the unit name **credit** or **diem noi bo**. It must not
display `VND`, `VNĐ`, `d`, `$`, exchange rates, or phrases such as “money
received”, “bank accepted”, or “cash balance” for these credits.

Every channel card, modal, checkout step, receipt, transaction row, and empty
state displays the persistent label:

> NOI BO / MO PHONG - DIEM AO - KHONG CHUYEN HOAC RUT TIEN THAT

The seven themes may use distinctive neutral colors, typography, motion, and
generic icons. They must not clone provider login pages, claim provider
certification, or reproduce a provider flow closely enough to be mistaken for
the real service.

The UI must never request or render fields for:

- a bank account number;
- card number, expiry, CVV, or cardholder name;
- OTP, bank password, wallet password, or recovery code;
- a real phone number used for wallet transfer; or
- a QR/deep link that opens a bank, wallet, or payment provider.

An optional internal QR may encode only an application-owned checkout ID such
as `viralcrawl://internal-checkout/<id>`. It must be watermarked `NOI BO` and is
not required for the first release.

## 5. User experience

### 5.1 Navigation

The pricing/packages tab remains the final primary navigation tab. Its contents
are ordered as:

1. current plan and exact server-derived expiry;
2. available virtual credits;
3. plan cards and comparison;
4. internal code redemption;
5. credit and plan history.

Plan cards retain a bright visual design, keyboard-accessible selection, reduced
motion support, and an animated selection indicator. Animation never substitutes
for a server result.

### 5.2 Internal checkout flow

1. The authenticated user selects `Redeem internal credits`.
2. The user selects one of the seven presentation themes.
3. The frontend creates an internal checkout containing only user ID, theme,
   status, and timestamps. The server returns an opaque checkout ID.
4. The UI shows the permanent simulation label and a field for the admin-issued
   code.
5. A review screen states that the code grants virtual credits with no cash
   value and shows no currency symbols.
6. Submission includes an `Idempotency-Key` and CSRF token.
7. On success, the UI reloads `/api/me` and the credit ledger from the server,
   then renders an internal receipt.
8. On failure, the UI retains the selected theme but never changes the displayed
   balance locally.

Selecting a theme, advancing animations, closing a dialog, refreshing the page,
or receiving a frontend timeout can never create credits.

### 5.3 Plan purchase and renewal

Prices are integer credit amounts from one server-owned catalog. The frontend
does not contain a second authoritative price list.

Purchase runs in one database transaction: validate the plan and term, reserve
the idempotency key, verify the current balance, debit credits, create the
entitlement/purchase record, append the ledger entry, and append the audit event.
A retry returns the original receipt without charging again.

When a paid plan or trial expires, server authorization immediately falls back
to FREE limits. The user can renew the same plan or select another plan. No
background browser timer is trusted to enforce access.

## 6. Identity and welcome benefits

Google authentication uses Google's official OAuth page. Apple authentication
uses Apple's official authorization page only when the required Services ID,
key, domain, and redirect configuration exist. If Apple is not configured, the
button is disabled with `Chua cau hinh`; no fake Apple account chooser is shown.

External identities are stored by the unique pair `(provider, subject)`, not by
email. A first verified identity creates or links to an internal user. The
backend grants that user:

- `2_500_000` virtual credits; and
- an ULTRA entitlement ending one calendar month after the server grant time.

There is at most one welcome-credit grant and one trial grant per internal user.
Linking a second provider to an existing authenticated user does not grant a
second benefit. Two previously separate identities are not automatically merged
solely because their email text matches.

Granting the identity, welcome ledger entry, trial record, entitlement, and audit
event occurs in one transaction. Clearing browser storage, logging out, changing
email, changing browsers, callback replay, or concurrent callbacks cannot grant
the benefits again.

## 7. System boundaries

### 7.1 Public repository: `viralcrawl`

The public project owns:

- HTML, CSS, animations, channel themes, and accessible interactions;
- a small API client and honest offline/disconnected states;
- the restricted gateway route allowlist;
- public tests, documentation, launchers, and GitHub Pages output.

`localStorage` may contain harmless preferences such as theme and view mode. It
must not be used as the source of identity, credits, trial state, plan state,
entitlements, transaction history, traffic, download results, or cookies.

### 7.2 Private local repository: `admin-panel`

The private project owns:

- verified Google/Apple identities and server sessions;
- the virtual-credit account, immutable ledger, codes, redemptions, and internal
  checkout records;
- trials, plan purchases, entitlements, and server-side feature enforcement;
- admin authentication, configuration, audit events, backups, jobs, and private
  operational data.

It remains loopback-only by default, has no Git remote, and is never copied into
the public repository or GitHub Pages artifact.

## 8. Backend modules

The private backend is split into focused modules:

- `identities`: OAuth identities, account linking, and one-time onboarding;
- `credits`: the only module allowed to mutate a credit balance and ledger;
- `credit-codes`: secure code creation, lookup, revocation, and redemption;
- `internal-checkouts`: theme metadata and the checkout state machine;
- `subscriptions`: trial grants, purchases, expiry, and entitlements;
- `audit`: actor, target, request, and event recording;
- `migrations`: ordered schema versions and legacy-data quarantine.

Catalog display data may be shared read-only. Catalog code must not own identity
or mutate balances.

## 9. Data model

The implementation uses integer credits and server timestamps.

### 9.1 Identity and credits

- `users`: internal account and status;
- `external_identities`: provider, provider subject, user, verified metadata;
- `credit_accounts`: user, available credits, optimistic version;
- `credit_ledger`: immutable delta, balance-after, kind, source, idempotency key,
  reason, actor, and timestamp.

Unique constraints prevent duplicate source events and duplicate user request
keys.

### 9.2 Codes and redemption

- `credit_codes`: ID, HMAC hash, short display hint, fixed 4,000,000 credits,
  creator, created time, seven-day expiry, redemption fields, and revocation
  fields;
- `credit_redemptions`: unique code, user, checkout, request key, credit amount,
  and timestamp;
- `internal_checkouts`: user, selected theme, `started|succeeded|expired|cancelled`
  status, optional redemption, and timestamps.

Plaintext codes are returned once at creation and are never stored, listed, or
logged. Redemption hashes the submitted value before lookup.

Redeeming a code runs in one `BEGIN IMMEDIATE` transaction: validate user and
checkout, claim one active unexpired code conditionally, increment the credit
account, insert redemption, append ledger and audit rows, mark the checkout
succeeded, and commit.

Unused codes expire seven days after creation. Credits already redeemed do not
expire independently; they remain until spent or adjusted by an audited admin
action.

### 9.3 Subscriptions

- `trial_grants`: one row per user;
- `entitlements`: plan, source, start, end, and source ID;
- `purchases`: plan, term, price, receipt, and idempotency key.

Effective access is calculated from server time on every protected request.

### 9.4 Legacy finance data

If a local database already contains `deposits` or `transfers` from the rejected
implementation, migration quarantines them as disabled legacy tables. Their rows
are not converted into credits and no runtime route reads them. The migration is
backed up and tested before use; it does not silently delete evidence.

## 10. API contract

Authenticated user routes:

- `GET /api/me` returns identity, effective plan, expiry, entitlements, credit
  summary, and explicit `{ unit: "CREDIT", realMoney: false,
  withdrawable: false, cashValue: null }` metadata;
- `GET /api/catalog` returns server-owned plans and prices;
- `POST /api/internal-checkouts` creates an internal themed checkout;
- `POST /api/internal-checkouts/:id/redeem` consumes one credit code;
- `GET /api/credit-transactions` returns the user's ledger view;
- `POST /api/subscriptions/purchase` purchases or renews a plan.

Admin routes:

- `POST /admin/credit-codes` creates one 4,000,000-credit, seven-day code and
  returns its plaintext once;
- `GET /admin/credit-codes` lists only hints and lifecycle metadata;
- `POST /admin/credit-codes/:id/revoke` revokes an unused code with a reason;
- `GET /admin/credit-ledger` lists ledger entries;
- `POST /admin/users/:id/credit-adjustments` makes a reasoned adjustment;
- `POST /admin/users/:id/entitlements` makes a reasoned plan adjustment.

Every mutation requires an authenticated session, exact-origin validation, CSRF,
JSON content type, body-size limit, rate limit, and an idempotency strategy.

The following route families do not exist and are denied by the public gateway:

- `/api/payment/*`;
- payment/bank/wallet webhooks and return URLs;
- bank transfer, peer transfer, withdrawal, or cash-out routes; and
- browser-accessible simulate/confirm/credit endpoints.

## 11. Admin experience

The private admin replaces `Cổng nạp & đối soát` and bank-transfer views with:

- credit-code creation and one-time reveal;
- active, redeemed, expired, and revoked code filters;
- credit ledger with source and balance-after;
- account trial, effective plan, and exact expiry;
- reasoned credit/entitlement adjustments;
- audit views for code creation, redemption, purchase, adjustment, and failure.

Admin screens consistently call the unit `credit`, never format it as currency,
and never show bank/card/provider configuration.

## 12. Error handling and security

- Invalid, expired, redeemed, and revoked codes return a generic failure that
  does not expose near matches.
- Repeated invalid attempts are rate-limited by user and loopback/client IP.
- A concurrent second redemption loses the conditional claim and cannot mutate
  balance.
- A failed database write rolls back code claim, balance, ledger, checkout, and
  audit changes together.
- Frontend network failure leaves state unknown until `/api/me` and the receipt
  endpoint are refreshed; it never assumes success.
- Credit codes, OAuth credentials, cookies, sessions, and admin secrets are
  redacted from logs and exports.
- Plan access is checked by the backend job endpoint, not by hidden/disabled UI.
- The content-security policy supports only external JavaScript files; inline
  bootstrap code and inline event handlers are removed.
- The service worker uses a versioned cache and removes prior unsafe cached
  assets during activation.

## 13. Remediation of current repositories

The current public `main` and GitHub Pages release already contain rejected
client-side login, local balance mutation, fake payment confirmation, and fake
bank-transfer behavior. The private local `main` contains corresponding
unreviewed payment modules and routes.

Implementation starts from the current public `origin/main` on a fresh feature
branch so the corrective diff is explicit. It does not force-push or rewrite
published history. The existing dirty productionization worktree is preserved
until its independent data-root change is reconciled safely.

Public remediation removes:

- sample Google/Apple identities and `simulateLogin`;
- browser-issued welcome credits and trial state;
- real-payment wording, provider QR links, account/card forms, and bank receipts;
- `/api/payment/*` allowlist entries;
- local bank transfer and withdrawal UI;
- fallback code that reports success when the backend fails; and
- unrelated fake download, traffic, cookie, and metadata success paths covered
  by the original productionization design.

Private remediation removes the payment module, payment/webhook/transfer routes,
provider configuration, finance admin views, and tests that certify fake bank
behavior. Safe transaction, session, audit, catalog, data-root, and download
foundations may be retained after review.

## 14. Verification

Automated tests must prove:

1. Google and Apple verified identities are keyed by provider subject;
2. welcome credits and ULTRA trial are each granted once under replay and
   concurrency;
3. account linking does not grant a second welcome benefit;
4. trial access expires at the exact server boundary and FREE limits apply;
5. a 4,000,000-credit code expires seven days after creation;
6. redemption is single-use, atomic, idempotent, and concurrency-safe;
7. plaintext codes do not appear in database listings, logs, or exports;
8. plan purchase uses catalog pricing, rejects insufficient credits, rolls back
   on failure, and charges once on retry;
9. browser/localStorage tampering cannot change identity, credits, plan, expiry,
   or job entitlement;
10. old payment, webhook, transfer, and withdrawal routes return 404/deny;
11. all seven themes display the permanent simulation label and contain no
    sensitive financial input or external payment request;
12. local UI works under the production CSP;
13. GitHub Pages shows an honest backend-disconnected state and cannot fabricate
    credit, purchase, login, or download success;
14. service-worker upgrade removes the unsafe prior cache; and
15. public staged files and Git history contain no admin source, secrets,
    databases, logs, cookies, binaries, or runtime data.

Before publication, run syntax checks for every public JavaScript file, the full
private test suite, public behavior/smoke tests, whitespace checks, negative
source scans, secret/history scans, and a complete staged-diff review.

## 15. Delivery

Only the corrected public repository is pushed to GitHub. The private admin
remains local with no remote.

GitHub Pages hosts only the static public shell; it cannot run the private Node,
SQLite, OAuth callback, credit ledger, or download engine. The full product runs
through the local launcher. The Pages version must explain its disconnected
state rather than simulate success.

The final push is non-force, occurs only after review and verification, and is
followed by waiting for the GitHub Actions deployment result and manually
checking the published URL. The handoff includes the public repository URL, the
Pages URL, test evidence, and explicit confirmation that the private admin was
not published.

## 16. Acceptance checklist

- [ ] The UI uses only credit terminology and no real-money symbols or claims.
- [ ] Seven polished channel themes exist and are unmistakably internal.
- [ ] No screen accepts bank, wallet, card, OTP, or payment credentials.
- [ ] Google/Apple onboarding grants 2,500,000 credits and one ULTRA month once.
- [ ] Apple is disabled honestly until official credentials are configured.
- [ ] Admin codes grant 4,000,000 credits, expire unused after seven days, and
      redeem once.
- [ ] All balance, plan, expiry, purchase, and entitlement decisions are server
      authoritative.
- [ ] There is no withdrawal, transfer, payment webhook, real QR, or simulate
      confirmation path.
- [ ] Legacy fake finance data is quarantined without becoming valid credit.
- [ ] The pricing tab is last and plan selection is animated and accessible.
- [ ] All original non-finance productionization acceptance criteria still pass.
- [ ] Public history and staged content contain no private admin or sensitive
      runtime data.
- [ ] GitHub Actions succeeds and the corrected Pages URL is verified after the
      final push.
