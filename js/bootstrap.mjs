// js/bootstrap.mjs — Application initialization & state binding
import { createApiClient } from './api-client.mjs';
import { createAppState } from './app-state.mjs';
import { createRouter } from './router.mjs';
import { createAccessibleDialog, element } from './dom.mjs';

export async function bootstrapApp() {
  const api = createApiClient();
  const state = createAppState({ api, preferenceStore: window.localStorage });

  // Update UI based on authoritative server state
  function renderUserHeader(snapshot) {
    const userNameEl = document.getElementById('userName');
    const userBalanceEl = document.getElementById('userBalance');
    const userAvatarEl = document.getElementById('userAvatar');
    const btnLogin = document.getElementById('btnLogin');

    if (!userNameEl || !userBalanceEl || !btnLogin) return;

    if (snapshot.phase === 'ready' && snapshot.user) {
      userNameEl.textContent = snapshot.user.name || snapshot.user.email || 'Thành viên 2TECH';
      const credits = snapshot.credits?.availableCredits ?? 0;
      userBalanceEl.textContent = `${credits.toLocaleString('vi-VN')} credit`;
      userBalanceEl.style.color = 'var(--success, #10b981)';

      if (userAvatarEl) {
        userAvatarEl.textContent = (snapshot.user.name || snapshot.user.email || 'U')[0].toUpperCase();
      }

      btnLogin.textContent = 'Đăng xuất';
      btnLogin.title = 'Đăng xuất tài khoản';
      btnLogin.onclick = async () => {
        await state.logout();
      };
    } else {
      userNameEl.textContent = 'Chưa đăng nhập';
      userBalanceEl.textContent = '0 credit';
      userBalanceEl.style.color = 'var(--text-muted, #94a3b8)';

      if (userAvatarEl) {
        userAvatarEl.textContent = '?';
      }

      btnLogin.textContent = 'Đăng nhập';
      btnLogin.title = 'Đăng nhập với Google hoặc Apple';
      btnLogin.onclick = () => {
        showLoginModal(api);
      };
    }
  }

  function showLoginModal(apiClient) {
    const content = element('div', { class: 'flex flex-col gap-3 py-2' }, [
      element('p', { class: 'text-xs text-slate-400 mb-2' }, [
        'Chọn phương thức xác thực chính thức để nhận 2.500.000 credit và 1 tháng trải nghiệm ULTRA:'
      ]),
      element('button', {
        class: 'w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700 transition-all',
        onClick: () => apiClient.loginWithGoogle()
      }, ['Tiếp tục với Google']),
      element('button', {
        class: 'w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700 transition-all',
        onClick: () => apiClient.loginWithApple()
      }, ['Tiếp tục với Apple (ID)'])
    ]);

    createAccessibleDialog({
      id: 'login-modal',
      title: 'Đăng nhập tài khoản',
      content
    });
  }

  // Subscribe state changes
  state.subscribe(renderUserHeader);

  // Setup client routing
  const contentOutlet = document.querySelector('.main-content') || document.getElementById('content') || document.body;
  const router = createRouter({
    outlet: contentOutlet,
    routes: {},
    defaultRoute: 'dashboard'
  });

  // Wire sidebar & mobile navigation buttons
  document.querySelectorAll('[data-page]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const page = btn.getAttribute('data-page');
      if (page) {
        window.location.hash = `#/${page}`;
      }
    });
  });

  // Start state bootstrap
  await state.bootstrap();

  // Register Service Worker securely
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
    navigator.serviceWorker.register('./sw.js').catch(err => {
      console.warn('[SW Registration ignored]', err);
    });
  }

  return { api, state, router };
}

// Auto-run if in browser
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      bootstrapApp().catch(err => console.error('[Bootstrap failed]', err));
    });
  } else {
    bootstrapApp().catch(err => console.error('[Bootstrap failed]', err));
  }
}
