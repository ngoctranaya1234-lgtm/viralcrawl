import test from 'node:test';
import assert from 'node:assert/strict';
import { createAppState } from '../js/app-state.mjs';

function createMockStorage(initial = {}) {
  const store = new Map(Object.entries(initial));
  return {
    getItem: (k) => store.has(k) ? store.get(k) : null,
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
    clear: () => store.clear(),
    keys: () => Array.from(store.keys()),
    _raw: store
  };
}

test('app-state purges malicious and legacy storage keys on creation', () => {
  const mockStorage = createMockStorage({
    'vc_store': '{"balance": 10000000}',
    'balance': '5000000',
    'plan': 'ULTRA',
    'plan_expiry': '2099-01-01',
    'account': 'fake-account',
    'transactions': '[{"id": 1}]',
    'theme': 'dark',
    'motion': 'reduced',
    'viewMode': 'grid'
  });

  const state = createAppState({
    api: {},
    preferenceStore: mockStorage
  });

  // Malicious / authoritative keys MUST be purged
  assert.equal(mockStorage.getItem('vc_store'), null);
  assert.equal(mockStorage.getItem('balance'), null);
  assert.equal(mockStorage.getItem('plan'), null);
  assert.equal(mockStorage.getItem('plan_expiry'), null);
  assert.equal(mockStorage.getItem('account'), null);
  assert.equal(mockStorage.getItem('transactions'), null);

  // Harmless presentation preferences MUST be preserved
  assert.equal(mockStorage.getItem('theme'), 'dark');
  assert.equal(mockStorage.getItem('motion'), 'reduced');
  assert.equal(mockStorage.getItem('viewMode'), 'grid');
});

test('app-state bootstrap transitions phase to ready when authenticated', async () => {
  const mockApi = {
    getCatalog: async () => ({ ok: true, catalog: { plans: [{ id: 'START' }] } }),
    getMe: async () => ({
      ok: true,
      user: { id: 'usr-1', email: 'test@2tech.mn', name: 'Nhut', plan: 'ULTRA' },
      credits: { availableCredits: 2500000, unit: 'CREDIT', realMoney: false, withdrawable: false, cashValue: null },
      csrfToken: 'csrf-secret-999'
    }),
    getCreditTransactions: async () => ({ ok: true, transactions: [] })
  };

  const state = createAppState({
    api: mockApi,
    preferenceStore: createMockStorage()
  });

  assert.equal(state.getSnapshot().phase, 'initializing');

  const updates = [];
  const unsubscribe = state.subscribe((snap) => {
    updates.push(snap.phase);
  });

  await state.bootstrap();

  const snap = state.getSnapshot();
  assert.equal(snap.phase, 'ready');
  assert.equal(snap.user.id, 'usr-1');
  assert.equal(snap.credits.availableCredits, 2500000);
  assert.equal(snap.credits.unit, 'CREDIT');
  assert.equal(snap.credits.realMoney, false);
  assert.equal(snap.csrf, 'csrf-secret-999');

  unsubscribe();
});

test('app-state bootstrap transitions to unauthenticated on 401', async () => {
  const mockApi = {
    getCatalog: async () => ({ ok: true, catalog: { plans: [] } }),
    getMe: async () => ({ ok: false, status: 401, error: 'unauthorized' })
  };

  const state = createAppState({
    api: mockApi,
    preferenceStore: createMockStorage()
  });

  await state.bootstrap();

  const snap = state.getSnapshot();
  assert.equal(snap.phase, 'unauthenticated');
  assert.equal(snap.user, null);
  assert.equal(snap.credits, null);
});

test('app-state allows only valid preference keys to be set', () => {
  const mockStorage = createMockStorage();
  const state = createAppState({
    api: {},
    preferenceStore: mockStorage
  });

  state.setPreference('theme', 'cyber-neon');
  assert.equal(mockStorage.getItem('theme'), 'cyber-neon');

  state.setPreference('motion', 'normal');
  assert.equal(mockStorage.getItem('motion'), 'normal');

  // Attempting to write forbidden authority keys throws or is ignored
  assert.throws(() => {
    state.setPreference('balance', '999999');
  }, /disallowed_preference/);
  assert.equal(mockStorage.getItem('balance'), null);
});
