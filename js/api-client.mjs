// js/api-client.mjs — Server-authoritative API client
// No financial / payment requests, strict credentials & CSRF forwarding

export function createApiClient({
  fetchImpl = globalThis.fetch,
  locationRef = globalThis.location,
  getCsrf = () => null
} = {}) {
  async function request(path, options = {}) {
    const headers = {
      'Accept': 'application/json',
      ...(options.headers || {})
    };

    if (options.body && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    const csrf = getCsrf();
    if (csrf) {
      headers['x-vc-csrf'] = csrf;
    }

    try {
      const resp = await fetchImpl(path, {
        credentials: 'include',
        ...options,
        headers
      });

      let data = null;
      const contentType = resp.headers?.get ? resp.headers.get('content-type') : resp.headers?.['content-type'];
      if (contentType && contentType.includes('application/json')) {
        try {
          data = await resp.json();
        } catch (_) {
          data = null;
        }
      }

      if (!resp.ok) {
        return {
          ok: false,
          status: resp.status,
          error: data?.error || `http_error_${resp.status}`,
          data
        };
      }

      return {
        ok: true,
        status: resp.status,
        ...(data || {})
      };
    } catch (err) {
      return {
        ok: false,
        status: 503,
        error: 'network_unavailable',
        networkError: true,
        details: err?.message
      };
    }
  }

  return {
    async getMe() {
      return request('/api/me', { method: 'GET' });
    },

    async getCatalog() {
      return request('/api/catalog', { method: 'GET' });
    },

    async getCredits() {
      return request('/api/credits', { method: 'GET' });
    },

    async getCreditTransactions() {
      return request('/api/credit-transactions', { method: 'GET' });
    },

    async createCheckout({ theme }) {
      return request('/api/internal-checkouts', {
        method: 'POST',
        body: JSON.stringify({ theme })
      });
    },

    async getCheckout(id) {
      return request(`/api/internal-checkouts/${encodeURIComponent(id)}`, { method: 'GET' });
    },

    async redeemCheckout(id, { code, idempotencyKey }) {
      const headers = {};
      if (idempotencyKey) {
        headers['idempotency-key'] = idempotencyKey;
      }
      return request(`/api/internal-checkouts/${encodeURIComponent(id)}/redeem`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ code })
      });
    },

    async purchaseSubscription({ planId, months, idempotencyKey }) {
      const headers = {};
      if (idempotencyKey) {
        headers['idempotency-key'] = idempotencyKey;
      }
      return request('/api/subscriptions/purchase', {
        method: 'POST',
        headers,
        body: JSON.stringify({ planId, months })
      });
    },

    async logout() {
      return request('/api/auth/logout', { method: 'POST' });
    },

    async getSupportCompose({ subject = '', contact = '', message = '' } = {}) {
      const query = new URLSearchParams({ subject, contact, message }).toString();
      return request(`/api/support/compose?${query}`, { method: 'GET' });
    },

    loginWithGoogle() {
      locationRef.href = '/api/auth/google';
    },

    loginWithApple() {
      locationRef.href = '/api/auth/apple';
    }
  };
}
