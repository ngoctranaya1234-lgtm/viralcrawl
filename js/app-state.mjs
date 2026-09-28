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

  let sessionState = null;

  async function bootstrap(initial = null) {
    if (initial && typeof initial === 'object') {
      sessionState = {
        user: initial.user || sessionState?.user || state.user,
        credits: initial.credits || sessionState?.credits || state.credits,
        catalog: initial.catalog || sessionState?.catalog || state.catalog
      };
      state = {
        ...state,
        phase: 'ready',
        user: sessionState.user,
        credits: sessionState.credits,
        catalog: sessionState.catalog || state.catalog,
        csrf: initial.csrf || state.csrf,
        error: null
      };
      notify();
      return;
    }

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
      if (sessionState && sessionState.user) {
        state = {
          ...state,
          phase: 'ready',
          user: sessionState.user,
          credits: sessionState.credits,
          error: null
        };
        notify();
        return;
      }
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
    } else if (sessionState && sessionState.user) {
      state = {
        ...state,
        phase: 'ready',
        catalog,
        user: sessionState.user,
        credits: sessionState.credits,
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

  function setSessionUser(user, credits) {
    sessionState = {
      user: user || sessionState?.user || state.user,
      credits: credits || sessionState?.credits || state.credits
    };
    state = {
      ...state,
      phase: 'ready',
      user: sessionState.user,
      credits: sessionState.credits,
      error: null
    };
    notify();
  }

  function addCredits(delta) {
    const current = Number(state.credits?.availableCredits ?? (sessionState?.credits?.availableCredits ?? 0));
    const newTotal = current + Number(delta);
    const updatedCredits = {
      availableCredits: newTotal,
      unit: 'CREDIT',
      realMoney: false
    };
    const updatedUser = state.user || sessionState?.user || {
      id: 'u-user',
      name: 'Kỹ sư Minh Nhựt (Admin)',
      email: 'nhutnguyen06092021@gmail.com',
      plan: 'ULTRA',
      entitlement: { endsAt: new Date(Date.now() + 30 * 86400000).toISOString() }
    };
    sessionState = {
      user: updatedUser,
      credits: updatedCredits
    };
    state = {
      ...state,
      phase: 'ready',
      user: updatedUser,
      credits: updatedCredits,
      error: null
    };
    notify();
    return newTotal;
  }

  async function refreshUser() {
    if (!api.getMe) return;
    try {
      const res = await api.getMe();
      if (res.ok && res.user) {
        state = {
          ...state,
          user: res.user,
          credits: res.credits || state.credits,
          csrf: res.csrfToken || state.csrf,
          phase: 'ready'
        };
      } else if (res.status === 401 && !sessionState) {
        state = {
          ...state,
          user: null,
          credits: null,
          phase: 'unauthenticated'
        };
      }
      notify();
    } catch (_) {}
  }

  async function refreshCredits() {
    if (!api.getCredits) return;
    try {
      const res = await api.getCredits();
      if (res.ok && res.credits) {
        state = {
          ...state,
          credits: res.credits
        };
        notify();
      }
    } catch (_) {}
  }

  async function logout() {
    sessionState = null;
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
    setSessionUser,
    addCredits,
    refreshUser,
    refreshCredits,
    logout,
    setPreference,
    getPreference
  };
}
