# Mnhut 2tech Al Layered Productionization Design

**Date:** 2026-09-27

**Owner:** NGUYỄN MINH NHỰT

**Company:** 2TECH MN

**Status:** Approved by the owner on 2026-09-27

## 1. Summary

Mnhut 2tech Al will be converted from a demo-heavy browser application into a layered product whose visible actions are backed by real server behavior. The public `viralcrawl` repository will contain the user-facing application and its restricted gateway. The private `admin-panel` project, database, credentials, platform cookies, downloaded media, and operational logs will remain outside the public repository on the owner's machine.

The implementation will preserve the existing real backend foundations where they are sound: official Google OAuth, server sessions, SQLite storage, an append-only balance ledger, plan purchases, yt-dlp/FFmpeg jobs, encrypted platform cookies, and a loopback-only admin application. The browser-local simulated login, simulated balances, fake IP traffic, invented media metadata, fake QR sessions, sample cookies, and false success paths will be removed rather than migrated.

The first release uses internal promotional credits only. MoMo and other real-money payment gateways are intentionally postponed.

## 2. Goals

1. Every visible user action must either perform a real operation or clearly explain why it cannot run.
2. Use Google's official OAuth pages; never imitate Google's account chooser or collect Google passwords.
3. Give each newly verified Google identity 2,000,000 VND-equivalent internal credits exactly once.
4. Let the private admin generate one-use internal voucher codes worth 4,000,000 credits. A code can be redeemed for seven days after creation; redeemed credits do not expire.
5. Make internal credits non-transferable, non-withdrawable, and usable only to buy plans inside the tool.
6. Enforce plan price, expiry, feature access, URL batch size, daily quota, quality, and concurrency on the server.
7. Run video jobs through the private yt-dlp/FFmpeg worker and show only real job/file state.
8. Open Gmail compose in the user's normal browser profile with the entered subject, contact, and message preserved.
9. Keep the private admin application and all private data outside GitHub.
10. Deliver a bright, polished, responsive interface with meaningful plan-selection animation and accessible interactions.

## 3. Non-goals

- No MoMo, bank-card, bank-transfer, cash-out, peer-to-peer transfer, refund, or real-money settlement flow in this release.
- No withdrawal of signup or voucher credits to a bank account and no claim that credits have cash value.
- No DRM bypass, paywall bypass, account-password collection, or download of content the user is not authorized to access.
- No universal promise that every URL, platform, or source offers 4K, 60 FPS, or removable watermarks.
- No fake QR authentication, generated cookies, fake traffic, invented engagement statistics, or synthetic success records.
- No reintroduction of auto-posting, voice creation, splitting, rendering, rendered-output, automation, or channel-monitoring tabs.
- No framework migration solely for fashion. The public application remains build-light and is reorganized into maintainable external JavaScript modules.

## 4. Current-state findings

The private backend already contains substantive implementations for Google OAuth with PKCE/state/nonce validation, hashed sessions, CSRF protection, SQLite records, internal credit purchases, encrypted cookie storage, network guarding, and real yt-dlp/FFmpeg workers.

The public frontend is not connected to those capabilities. It currently treats `localStorage` as the account database, simulates Google login, grants browser-controlled credits, generates fake IP traffic, fabricates preview/download metadata, constructs fake QR/cookie sessions, and purchases plans locally. It also loads a resolver that is not allowed by the local gateway and can return an original webpage URL as a fictional successful 4K download. The gateway CSP blocks the inline bootstrap and inline event handlers used by the UI.

Productionization therefore requires a public frontend integration rewrite plus targeted backend extensions, not a cosmetic patch.

## 5. System boundaries

### 5.1 Public application: `viralcrawl`

The public project owns:

- accessible HTML/CSS/JavaScript UI;
- browser routing and harmless UI preferences such as theme and view mode;
- an API client for the allowlisted gateway routes;
- a public gateway that serves only allowlisted assets and forwards only allowlisted user APIs;
- launch scripts and public documentation;
- automated public tests and GitHub Pages assets.

It must not contain OAuth secrets, gateway keys, voucher codes, password hashes, encryption keys, platform cookies, SQLite files, downloaded media, or private admin source.

### 5.2 Private system: `admin-panel`

The private sibling project owns:

- Google OAuth credentials and callback processing;
- sessions, CSRF tokens, users, internal credits, ledger, plans, purchases, vouchers, events, jobs, connections, and settings;
- yt-dlp/FFmpeg execution and downloaded-file storage;
- the admin UI and all administrative APIs;
- backup, audit, security, and operational configuration.

It binds to loopback by default. Public internet deployment is a separate operational decision requiring HTTPS and a correctly configured reverse proxy; it is not implied by pushing the public source to GitHub.

### 5.3 Source of truth

The private backend is the sole source of truth for identity, balance, plan, expiry, entitlements, limits, transactions, jobs, files, connections, and user settings. `localStorage` may retain only non-security UI preferences. Existing browser demo state is discarded and is never imported as a verified user, balance, purchase, completed download, or platform connection.

## 6. Navigation and user experience

The public navigation contains exactly:

1. Trang chủ
2. Tải video bằng link
3. File đã tải
4. Lịch sử
5. Bảng giá
6. Cài đặt
7. Gửi câu hỏi

Branding is consistently shown as **Mnhut 2tech Al**, owned by **NGUYỄN MINH NHỰT**, company **2TECH MN**. Old variants remain recognized only where required for data-path compatibility during migration.

The visual direction is a bright light-first workspace with deep navy text, emerald/teal actions, warm neutral surfaces, restrained gradients, strong typography, and clear status color. Dark mode remains optional. Pricing cards use CSS transform, border, checkmark, and price transitions when the selected plan or billing term changes. Motion respects `prefers-reduced-motion`.

All interactions use external scripts and `addEventListener`; inline scripts and inline `onclick` attributes are removed so the gateway CSP remains strict. Keyboard navigation, visible focus, semantic controls, modal focus management, restored viewport zoom, and useful empty/loading/error states are required.

When the backend is offline or not configured, the UI shows that state without inventing data. Unauthenticated users can inspect product information and pricing, but account, voucher, purchase, connection, and download actions lead to the real sign-in flow.

## 7. Identity and sessions

The login button navigates to `GET /api/auth/google`, which redirects to the official `accounts.google.com` OAuth page. There is no local account chooser, arbitrary email/name form, or simulated delay. The existing backend validation of state, one-use challenge, PKCE verifier, nonce, audience, and verified email is retained.

After the callback, the public app loads `GET /api/me` and renders the server response. A first-time verified Google subject receives one signup ledger entry of 2,000,000 credits. Re-login, email changes, cookie clearing, or a second browser cannot grant the bonus again.

Logout calls the server endpoint, removes the server session, and refreshes public state. Settings exposes active sessions and permits revocation. Banned users and expired/revoked sessions lose server access immediately.

## 8. Internal credits and vouchers

### 8.1 Credit rules

- Credits are integer, VND-equivalent accounting units used only inside the tool.
- Signup credit: 2,000,000 once per verified Google subject.
- Voucher credit: 4,000,000 per successfully redeemed voucher.
- Credits do not expire after posting to the account.
- Credits cannot be transferred, withdrawn, redeemed for cash, or sent to a bank.
- Every change is represented by a ledger row and an audit event; UI state alone never changes balance.

### 8.2 Voucher lifecycle

The admin generates a cryptographically random, high-entropy code. The plaintext code is displayed once immediately after creation so the admin can copy it. The database stores a hash, a non-secret display hint, timestamps, amount, and status; it does not need to recover the plaintext.

Each voucher:

- has a fixed amount of 4,000,000 credits;
- expires exactly seven days after creation if unused;
- is redeemable by one active user exactly once;
- can be revoked by the admin before redemption;
- becomes `redeemed` or `revoked` and cannot return to `active`; an unused `active` voucher whose `expires_at` has passed is reported as expired and cannot be redeemed.

Redemption occurs in one database transaction: validate the user and voucher, mark the voucher redeemed, increment the user's balance, insert a ledger entry, and insert an audit event. Concurrent requests for the same code result in one success and one conflict. Invalid-code attempts are rate-limited and do not reveal whether a near-match exists.

### 8.3 Voucher schema

Add a versioned schema migration and a `vouchers` table with:

- `id` primary key;
- `code_hash` unique and non-null;
- `code_hint` non-secret suffix for admin identification;
- `amount` constrained to 4,000,000 for this release;
- `status` constrained to `active`, `redeemed`, or `revoked`; API queries derive `expired` when an active row is past `expires_at`;
- `created_at`, `expires_at`, `redeemed_at`, and `revoked_at` timestamps;
- `redeemed_by` optional foreign key to users.

Existing installations are migrated without deleting users, jobs, purchases, or settings.

### 8.4 Voucher APIs

Public:

- `POST /api/vouchers/redeem` with a code, authenticated session, valid CSRF token, origin check, size limit, and rate limit.

Private admin:

- `POST /admin/vouchers` creates one fixed-value, seven-day voucher and returns plaintext once.
- `GET /admin/vouchers` lists hint, status, creation, expiry, and redemption metadata without plaintext.
- `POST /admin/vouchers/:id/revoke` revokes an unused voucher with a recorded reason.

## 9. Pricing, purchases, and entitlements

The backend catalog is canonical. The initial plan matrix is:

| Plan | Monthly price | Daily jobs | URLs per request | Maximum source height | Concurrent jobs |
| --- | ---: | ---: | ---: | ---: | ---: |
| Free | 0 | 5 | 1 | 720p | 1 |
| Start | 149,000 | 50 | 10 | 1080p | 2 |
| Pro | 249,000 | 250 | 50 | 2160p | 3 |
| Studio | 329,000 | 1,000 | 100 | 2160p | 4 |

Terms are one month at list price, six months at 10% off, and twelve months at 20% off. The frontend receives these values from `GET /api/catalog`; it does not maintain a second price table.

Selecting a plan or term updates the visible total and discount using catalog data. Purchase confirmation calls `POST /api/purchase` with an idempotency key. The server validates active account, price, term, balance, downgrade rules, and current expiry, then debits balance, creates the receipt, inserts the ledger entry, and updates the plan atomically.

Renewing the same plan extends from its current expiry. An upgrade starts immediately from purchase time; no automatic refund is created for remaining time. Downgrades can be selected after the active higher-tier plan expires. The server evaluates an expired plan as Free even if stale database fields remain.

Feature checks occur when a server operation is requested. Hiding or disabling a control in the browser is explanatory UX, not authorization.

## 10. Real download workflow

The browser submits one or more supported URLs and a permitted quality to `POST /api/jobs`. The server validates URL syntax, host allowlist, platform tier, batch size, daily quota, quality, account status, and current plan before creating durable job rows.

Jobs use only these user-visible states: `queued`, `extracting`, `downloading`, `processing`, `completed`, `error`, and `canceled`. The worker invokes the installed yt-dlp binary, optionally FFmpeg, and derives progress from process output. A job becomes `completed` only after the expected file exists and passes basic file validation.

The public app polls `GET /api/jobs` at a bounded interval while jobs are active and pauses background polling when the page is hidden. A later streaming transport can be added without changing the job contract. Cancel calls the real cancel endpoint and terminates the owned process tree on Windows. Retry creates a new, auditable job rather than rewriting history.

The browser resolver and direct third-party resolver APIs are removed. No fallback may turn an original webpage URL into a successful download descriptor. Metadata, file size, progress, and title are displayed only when reported by the backend.

## 11. Platforms and connections

The catalog advertises platforms that the maintained backend/yt-dlp configuration is prepared to attempt, not a guarantee that every URL succeeds. Source deletion, geographic restriction, private access, authentication, extractor changes, and DRM can prevent a download.

Platform login buttons open the platform's official HTTPS login page in the user's normal browser. A website cannot read another site's session automatically. When authorized content requires a session, the user may explicitly upload/paste a Netscape-format cookie file belonging to their own account. The backend validates the relevant domain and expiry, encrypts the stored value, and never returns cookie plaintext to the browser.

Fake QR graphics, confirmation buttons that synthesize sessions, sample cookies, plaintext browser cookie storage, and claims of automatic account capture are removed. No tool form accepts a platform password.

## 12. Files, history, and settings

`File đã tải` is derived only from completed backend jobs whose files still exist. Authenticated endpoints support preview/range streaming and download. Add an owner-checked delete operation that removes the file and records deletion while keeping an auditable history row. Opening the containing folder uses a dedicated authenticated endpoint available only on the loopback deployment; the server derives the folder from the owned job ID and never accepts a client-supplied filesystem path.

`Lịch sử` reads server jobs and transactions, supports search and status filters, and presents exact backend errors. It does not merge old demo `localStorage` records.

User settings supported in this release are:

- default quality within current plan limits;
- requested concurrency within current plan limits;
- subtitles on/off;
- metadata sidecar on/off;
- notifications on/off;
- light, dark, or system theme.

Download root and engine installation are admin settings because they affect the host machine. Fake GPU, proxy, anti-checkpoint, AI-cloud, localStorage-database optimization, and fake update controls are removed. Any future setting must have a documented consumer before it appears in the UI.

## 13. Gmail support flow

The support form contains subject, contact, and message. The backend validates them and builds a Gmail compose URL using the support recipient configured in the private admin. The body includes the submitted contact/message and the signature `Mnhut 2tech Al — NGUYỄN MINH NHỰT — 2TECH MN`.

On the local Windows application, the restricted desktop-open endpoint requests the default browser, which reuses the normal browser profile when the operating system/browser supports it. Otherwise the public app opens Gmail in the current browser and falls back to same-tab navigation if popups are blocked. A signed-in Gmail user sees a prefilled compose screen; a signed-out user sees Google's sign-in flow first.

The tool never claims that the email was sent because only the user can press Gmail's Send button. Form contents are not cleared merely because Gmail opened.

## 14. Private admin application

The private admin keeps its separate login and loopback-only origin. Its navigation covers:

- overview and real service health;
- Google-authenticated users and status;
- sessions and recorded request traffic;
- internal-credit ledger and plan purchases;
- voucher generation, status, redemption, revocation, and audit;
- download jobs, files, errors, and engine health;
- Google OAuth, support email, session duration, download root, backups, and admin password.

Admin actions that change balance, plan, status, session, or voucher state require a reason and create an event. Voucher plaintext is never listed again after creation. The admin does not consume browser `BroadcastChannel` demo data.

## 15. Error handling and safety

- API responses use stable status codes and Vietnamese user-facing messages without secret or stack-trace disclosure.
- Mutation requests require authenticated sessions, exact-origin checks, CSRF tokens, JSON content types, size limits, and per-user/IP rate limits appropriate to the deployment boundary.
- Untrusted API fields are rendered with DOM text properties, not interpolated into executable HTML or inline handlers.
- Voucher redemption and plan purchase use database transactions and unique constraints to withstand retries and concurrency.
- The gateway maintains explicit static/API/desktop-host allowlists and blocks private admin routes, source, configuration, database, and Git paths.
- Cookie plaintext temporary files and partial downloads are removed on success, failure, cancellation, and startup recovery where safe.
- Worker execution uses per-user/job directories, disk-space checks, total storage limits, fair scheduling, bounded subprocess counts, timeouts, and process-tree termination.
- Source quality is reported honestly. The product does not claim generic watermark removal or resolution/frame-rate creation.

## 16. Testing and verification

Implementation follows test-first development. Required automated coverage includes:

1. Official OAuth redirects and callback rejection for invalid state, nonce, audience, or unverified email.
2. Signup credit granted once per Google subject.
3. Voucher creation, seven-day boundary, one-use redemption, concurrent redemption, revocation, hashing, rate limiting, ledger entry, and audit event.
4. Catalog-derived prices, all term discounts, insufficient balance, idempotent purchase, renewal, upgrade, expired-plan fallback, and downgrade restriction.
5. Gateway allowlists, CSP compatibility, private route denial, CSRF/origin enforcement, and host validation.
6. Job URL/platform/plan/quota/quality/concurrency validation, real-state transitions, cancel/retry, missing engine, missing output, partial cleanup, and owner-isolated files.
7. Connection validation/encryption and absence of returned cookie plaintext.
8. Gmail compose encoding, configured recipient, full submitted contents, desktop-open restrictions, and popup fallback.
9. Frontend browser smoke tests for offline state, real login navigation, voucher UI, pricing animation, purchase refresh, jobs, settings, accessibility, and absence of demo success.

Before completion, run the full private test suite, public JavaScript/type/lint checks, browser smoke suite, secret scan, tracked-file audit, and a real local launch. At least one legal, authorized public video per supported tier should be exercised where the local environment and platform permit; unsupported or blocked sources must fail honestly.

## 17. GitHub and delivery

Only the public `viralcrawl` repository is committed and pushed to GitHub. The sibling `admin-panel`, local data directory, database, credentials, cookies, binaries, downloaded files, and logs remain outside that repository and are checked against both the working tree and Git history before publication.

GitHub Pages can host the static public shell, but it cannot run Node.js, SQLite, OAuth callbacks, or yt-dlp. A Pages build therefore shows an honest disconnected-backend state. Full functionality is delivered by the local launcher unless a later HTTPS backend deployment is explicitly designed and configured.

The launcher standardizes the data directory as `%LOCALAPPDATA%\2TECHMN\Mnhut_2tech_Al` and passes it consistently to both services. A safe migration copies or reuses existing `ViralCrawl` data after explicit validation; it does not silently create competing databases.

## 18. Layered implementation order

1. **Foundation:** versioned schema migration, consistent data path, strict CSP-compatible bootstrap, public API client, server-derived session/catalog state, and removal of demo login/data/resolver paths.
2. **Identity and internal commerce:** official Google UI flow, signup credit, vouchers, ledger, backend-derived pricing, plan animation, real purchase, entitlements, and Gmail compose.
3. **Download product:** real job UI, platform connections, file library, history, settings, cancellation, deletion, cleanup, and honest engine/offline errors.
4. **Private administration:** voucher screens, complete account/traffic/security/job views, audit reasons, backups, configuration, and operational health.
5. **Hardening and delivery:** automated suites, accessibility/responsive QA, performance checks, secret/history audit, local end-to-end verification, documentation, commit, push, and GitHub link handoff.

No layer may preserve a simulated success path as a temporary fallback. If a backend function is unavailable, the public control is disabled or returns a truthful actionable error.

## 19. Acceptance criteria

The work is accepted when:

- a real Google account is authenticated only through Google's domain;
- the first verified login grants exactly 2,000,000 credits once;
- an admin-created 4,000,000-credit voucher expires after seven unused days and can be redeemed exactly once;
- credits cannot be transferred or withdrawn;
- plan price/discount/expiry and feature limits are server-controlled and consistent across user/admin views;
- every kept button invokes a real operation or an honest unavailable state;
- the public UI contains none of the named fake data/session/success mechanisms;
- authorized supported URLs create real jobs and only validated files appear as completed;
- Gmail opens with the entered subject, contact, message, recipient, and owner/company signature intact;
- admin code/data/secrets are absent from the public repository and its pushed history;
- all required automated tests and local end-to-end checks pass, with any environment-dependent platform limitation documented rather than hidden.
