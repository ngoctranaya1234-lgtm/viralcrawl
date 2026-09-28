// js/app-state.mjs — Server-authoritative central state management
// Storage stores presentation preferences only; never balance, plan, or user authority.

const ALLOWED_PREFERENCES = new Set(['theme', 'motion', 'viewMode']);
const PURGE_KEYS = [
  'vc_store', 'balance', 'plan', 'plan_expiry', 'account',
  'transactions', 'downloadHistory', 'downloadQueue', 'activeJobs',
  'user_info', 'reward_claimed', 'mock_balance', 'mock_plan'
];

export function createAppState({
  api,
  preferenceStore = globalThis.localStorage
} = {}) {
  // Purge legacy and dangerous keys
  if (preferenceStore && typeof preferenceStore.removeItem === 'function') {
    for (const key of PURGE_KEYS) {
      try {
        preferenceStore.removeItem(key);
      } catch (_) {}
    }
  }

  let state = {
    phase: 'initializing',
    catalog: null,
    user: null,
    credits: null,
    transactions: [],
    csrf: null,
    config: null,
    error: null
  };

  const listeners = new Set();

  function notify() {
    const snapshot = getSnapshot();
    for (const listener of listeners) {
      try {
        listener(snapshot);
      } catch (err) {
        console.error('[AppState listener error]', err);
      }
    }
  }

  function getSnapshot() {
    return { ...state };
  }

  function setPreference(key, value) {
    if (!ALLOWED_PREFERENCES.has(key)) {
      throw new Error(`disallowed_preference: "${key}" cannot be stored in client storage`);
    }
    if (preferenceStore && typeof preferenceStore.setItem === 'function') {
      preferenceStore.setItem(key, String(value));
    }
  }

  function getPreference(key) {
    if (!ALLOWED_PREFERENCES.has(key)) return null;
    return preferenceStore && typeof preferenceStore.getItem === 'function'
      ? preferenceStore.getItem(key)
      : null;
  }

  async function bootstrap() {
    state = { ...state, phase: 'initializing', error: null };
    notify();

    let catalogRes = null;
    let meRes = null;

    try {
      if (api.getCatalog) {
        catalogRes = await api.getCatalog();
      }
      if (api.getMe) {
        meRes = await api.getMe();
      }
    } catch (err) {
      state = { ...state, phase: 'offline', error: err?.message || 'bootstrap_failed' };
      notify();
      return;
    }

    const catalog = catalogRes?.ok ? (catalogRes.catalog || catalogRes) : null;

    if (meRes?.ok && meRes.user) {
      state = {
        ...state,
        phase: 'ready',
        catalog,
        user: meRes.user,
        credits: meRes.credits || null,
        csrf: meRes.csrfToken || state.csrf,
        error: null
      };
    } else if (meRes?.status === 401) {
      state = {
        ...state,
        phase: 'unauthenticated',
        catalog,
        user: null,
        credits: null,
        error: null
      };
    } else if (meRes?.networkError) {
      state = {
        ...state,
        phase: 'offline',
        catalog,
        error: 'network_unavailable'
      };
    } else {
      state = {
        ...state,
        phase: meRes ? 'unauthenticated' : 'ready',
        catalog,
        error: meRes?.error || null
      };
    }

    notify();
  }

  async function refreshUser() {
    if (!api.getMe) return;
    const res = await api.getMe();
    if (res.ok && res.user) {
      state = {
        ...state,
        user: res.user,
        credits: res.credits || state.credits,
        csrf: res.csrfToken || state.csrf,
        phase: 'ready'
      };
    } else if (res.status === 401) {
      state = {
        ...state,
        user: null,
        credits: null,
        phase: 'unauthenticated'
      };
    }
    notify();
  }

  async function refreshCredits() {
    if (!api.getCredits) return;
    const res = await api.getCredits();
    if (res.ok && res.credits) {
      state = {
        ...state,
        credits: res.credits
      };
      notify();
    }
  }

  async function logout() {
    if (api.logout) {
      try {
        await api.logout();
      } catch (_) {}
    }
    state = {
      ...state,
      user: null,
      credits: null,
      transactions: [],
      phase: 'unauthenticated'
    };
    notify();
  }

  return {
    getSnapshot,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    bootstrap,
    refreshUser,
    refreshCredits,
    logout,
    setPreference,
    getPreference
  };
}
