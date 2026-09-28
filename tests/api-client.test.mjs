import test from 'node:test';
import assert from 'node:assert/strict';
import { createApiClient } from '../js/api-client.mjs';

function mockFetch(handlers) {
  const calls = [];
  const fetchImpl = async (url, options = {}) => {
    calls.push({ url, options });
    const u = new URL(url, 'http://localhost:3000');
    const path = u.pathname;
    const method = (options.method || 'GET').toUpperCase();
    const key = `${method} ${path}`;

    if (handlers[key]) {
      const resp = await handlers[key](u, options);
      return {
        ok: resp.status >= 200 && resp.status < 300,
        status: resp.status,
        headers: new Headers(resp.headers || { 'content-type': 'application/json' }),
        json: async () => resp.body,
        text: async () => typeof resp.body === 'string' ? resp.body : JSON.stringify(resp.body)
      };
    }
    return {
      ok: false,
      status: 404,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ error: 'not_found' }),
      text: async () => JSON.stringify({ error: 'not_found' })
    };
  };
  return { fetchImpl, calls };
}

test('api client sends credentials, csrf, and exact path for getMe and getCatalog', async () => {
  const { fetchImpl, calls } = mockFetch({
    'GET /api/me': async () => ({ status: 200, body: { ok: true, user: { id: 'u1', name: 'Nhut' }, csrfToken: 'csrf-123' } }),
    'GET /api/catalog': async () => ({ status: 200, body: { ok: true, plans: [] } })
  });

  let csrf = 'initial-csrf';
  const client = createApiClient({
    fetchImpl,
    locationRef: { href: 'http://localhost:3000/' },
    getCsrf: () => csrf
  });

  const me = await client.getMe();
  assert.equal(me.ok, true);
  assert.equal(me.user.id, 'u1');
  assert.equal(calls[0].options.credentials, 'include');
  assert.equal(calls[0].options.headers['x-vc-csrf'], 'initial-csrf');

  // Verify getCatalog
  const catalog = await client.getCatalog();
  assert.equal(catalog.ok, true);
  assert.equal(calls[1].options.credentials, 'include');
});

test('api client routes checkouts, redemption, and purchases with idempotency keys', async () => {
  const { fetchImpl, calls } = mockFetch({
    'POST /api/internal-checkouts': async (u, opt) => {
      const b = JSON.parse(opt.body);
      return { status: 201, body: { ok: true, checkout: { id: 'chk-1', theme: b.theme } } };
    },
    'GET /api/internal-checkouts/chk-1': async () => ({
      status: 200, body: { ok: true, checkout: { id: 'chk-1', status: 'pending' } }
    }),
    'POST /api/internal-checkouts/chk-1/redeem': async (u, opt) => {
      const b = JSON.parse(opt.body);
      return { status: 200, body: { ok: true, redeemed: true, code: b.code } };
    },
    'POST /api/subscriptions/purchase': async (u, opt) => {
      const b = JSON.parse(opt.body);
      return { status: 200, body: { ok: true, planId: b.planId, months: b.months } };
    }
  });

  const client = createApiClient({
    fetchImpl,
    locationRef: { href: 'http://localhost:3000/' },
    getCsrf: () => 'csrf-tok'
  });

  const checkout = await client.createCheckout({ theme: 'momo' });
  assert.equal(checkout.ok, true);
  assert.equal(checkout.checkout.theme, 'momo');

  const fetched = await client.getCheckout('chk-1');
  assert.equal(fetched.ok, true);
  assert.equal(fetched.checkout.id, 'chk-1');

  const redeemed = await client.redeemCheckout('chk-1', { code: '2TMN-ABCD-1234', idempotencyKey: 'idem-1' });
  assert.equal(redeemed.ok, true);
  assert.equal(calls[2].options.headers['idempotency-key'], 'idem-1');

  const purchase = await client.purchaseSubscription({ planId: 'PRO', months: 1, idempotencyKey: 'idem-2' });
  assert.equal(purchase.ok, true);
  assert.equal(calls[3].options.headers['idempotency-key'], 'idem-2');
});

test('api client handles 401, 429, and network failures honestly without fake success', async () => {
  const { fetchImpl } = mockFetch({
    'GET /api/credits': async () => ({ status: 401, body: { error: 'unauthorized' } }),
    'GET /api/credit-transactions': async () => ({ status: 429, body: { error: 'rate_limited' } })
  });

  const failingFetch = async () => {
    throw new Error('Connection refused');
  };

  const client = createApiClient({
    fetchImpl,
    locationRef: { href: 'http://localhost:3000/' },
    getCsrf: () => 'csrf'
  });

  const credits = await client.getCredits();
  assert.equal(credits.ok, false);
  assert.equal(credits.status, 401);

  const txs = await client.getCreditTransactions();
  assert.equal(txs.ok, false);
  assert.equal(txs.status, 429);

  const offlineClient = createApiClient({
    fetchImpl: failingFetch,
    locationRef: { href: 'http://localhost:3000/' },
    getCsrf: () => 'csrf'
  });

  const offlineResult = await offlineClient.getMe();
  assert.equal(offlineResult.ok, false);
  assert.equal(offlineResult.status, 503);
  assert.equal(offlineResult.networkError, true);
});

test('api client navigates official OAuth paths for Google and Apple', () => {
  const locationRef = { href: 'http://localhost:3000/' };
  const client = createApiClient({
    fetchImpl: async () => ({ ok: true }),
    locationRef,
    getCsrf: () => 'csrf'
  });

  client.loginWithGoogle();
  assert.equal(locationRef.href, '/api/auth/google');

  client.loginWithApple();
  assert.equal(locationRef.href, '/api/auth/apple');
});
