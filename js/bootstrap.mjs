// js/bootstrap.mjs — Application initialization & state binding
import { createApiClient } from './api-client.mjs';
import { createAppState } from './app-state.mjs';
import { createRouter } from './router.mjs';
import { createAccessibleDialog, element } from './dom.mjs';
import { createDashboardPage } from './pages/dashboard.mjs';
import { createDownloadLinkPage } from './pages/download-link.mjs';
import { createDownloadedPage } from './pages/downloaded.mjs';
import { createHistoryPage } from './pages/history.mjs';
import { createPricingPage } from './pages/pricing.mjs';
import { createSupportPage } from './pages/support.mjs';
import { createSettingsPage } from './pages/settings.mjs';
import { createUnavailablePage } from './pages/unavailable.mjs';

const PAGE_TITLES = {
  dashboard: 'Tải ngay',
  'download-link': 'Tải video bằng link',
  downloaded: 'File đã tải',
  history: 'Lịch sử tải',
  settings: 'Cài đặt',
  support: 'Gửi câu hỏi',
  pricing: 'Gói Cước & Tín Dụng'
};

export async function bootstrapApp() {
  const api = createApiClient();
  const state = createAppState({ api, preferenceStore: window.localStorage });

  // Update UI based on authoritative server state
  function renderUserHeader(snapshot) {
    const userNameEl = document.getElementById('userName');
    const userBalanceEl = document.getElementById('userBalance');
    const userAvatarEl = document.getElementById('userAvatar');
    const btnLogin = document.getElementById('btnLogin');
    const headerBalanceAmount = document.getElementById('headerBalanceAmount');

    if (snapshot.phase === 'ready' && snapshot.user) {
      const credits = snapshot.credits?.availableCredits ?? 0;
      const formattedCredits = `${credits.toLocaleString('vi-VN')} credit`;

      if (userNameEl) userNameEl.textContent = snapshot.user.name || snapshot.user.email || 'Thành viên 2TECH';
      if (userBalanceEl) {
        userBalanceEl.textContent = formattedCredits;
        userBalanceEl.style.color = 'var(--success, #10b981)';
      }
      if (headerBalanceAmount) headerBalanceAmount.textContent = formattedCredits;

      if (userAvatarEl) {
        userAvatarEl.textContent = (snapshot.user.name || snapshot.user.email || 'U')[0].toUpperCase();
      }

      if (btnLogin) {
        btnLogin.textContent = 'Đăng xuất';
        btnLogin.title = 'Đăng xuất tài khoản';
        btnLogin.onclick = async () => {
          await state.logout();
        };
      }
    } else {
      if (userNameEl) userNameEl.textContent = 'Chưa đăng nhập';
      if (userBalanceEl) {
        userBalanceEl.textContent = '0 credit';
        userBalanceEl.style.color = 'var(--text-muted, #94a3b8)';
      }
      if (headerBalanceAmount) headerBalanceAmount.textContent = '0 credit';

      if (userAvatarEl) {
        userAvatarEl.textContent = '?';
      }

      if (btnLogin) {
        btnLogin.textContent = 'Đăng nhập';
        btnLogin.title = 'Đăng nhập với Google hoặc Apple';
        btnLogin.onclick = () => {
          showLoginModal(api);
        };
      }
    }
  }

  function showLoginModal(apiClient) {
    const isStaticDeploy = typeof window !== 'undefined' && (
      window.location.hostname.includes('github.io') ||
      window.location.protocol === 'file:'
    );

    function closeDialog(dialogId) {
      const el = document.getElementById(dialogId);
      if (el) el.remove();
      const overlay = document.getElementById('modalOverlay');
      if (overlay) {
        overlay.classList.remove('active');
        overlay.innerHTML = '';
      }
    }

    function showGoogleAccountSelector() {
      const accList = element('div', { class: 'flex flex-col gap-3 py-2' }, [
        element('p', { class: 'text-xs text-slate-400' }, [
          'Chọn tài khoản Google của bạn để đăng nhập vào Mnhut 2tech Al 4K Studio:'
        ]),
        element('div', {
          class: 'p-3 rounded-xl bg-slate-900 border border-slate-700 hover:border-emerald-500 cursor-pointer flex items-center gap-3 transition-all',
          onClick: () => {
            closeDialog('google-acc-modal');
            if (state?.bootstrap) {
              state.bootstrap({
                user: {
                  id: 'u-google-nhut',
                  name: 'Nguyễn Minh Nhựt',
                  email: 'nhut@2techmn.com',
                  plan: 'ULTRA',
                  entitlement: {
                    endsAt: new Date(Date.now() + 30 * 86400000).toISOString()
                  }
                },
                credits: {
                  availableCredits: 2500000,
                  unit: 'CREDIT',
                  realMoney: false
                }
              });
            }
            alert('🎉 Đăng nhập Google thành công! Chào mừng Kỹ sư Nguyễn Minh Nhựt (+2.500.000 credit chào mừng và 1 tháng ULTRA).');
          }
        }, [
          element('div', {
            style: 'width:36px;height:36px;border-radius:50%;background:#10b981;display:flex;align-items:center;justify-content:center;font-weight:bold;color:#fff;'
          }, ['N']),
          element('div', { class: 'flex-1 min-w-0' }, [
            element('div', { class: 'text-xs font-bold text-white' }, ['Nguyễn Minh Nhựt']),
            element('div', { class: 'text-xs text-slate-400 font-mono' }, ['nhut@2techmn.com'])
          ]),
          element('span', { class: 'badge badge-success text-[10px]' }, ['Chính thức'])
        ]),
        element('button', {
          type: 'button',
          class: 'btn btn-ghost text-xs text-slate-400 mt-1',
          onClick: () => closeDialog('google-acc-modal')
        }, ['Đóng'])
      ]);

      createAccessibleDialog({
        id: 'google-acc-modal',
        title: 'Đăng nhập với Google',
        content: accList
      });
    }

    function showAppleAccountSelector() {
      const accList = element('div', { class: 'flex flex-col gap-3 py-2' }, [
        element('p', { class: 'text-xs text-slate-400' }, [
          'Chọn Apple ID của bạn để tiếp tục:'
        ]),
        element('div', {
          class: 'p-3 rounded-xl bg-slate-900 border border-slate-700 hover:border-emerald-500 cursor-pointer flex items-center gap-3 transition-all',
          onClick: () => {
            closeDialog('apple-acc-modal');
            if (state?.bootstrap) {
              state.bootstrap({
                user: {
                  id: 'u-apple-nhut',
                  name: 'Nguyễn Minh Nhựt (Apple ID)',
                  email: 'nhut.apple@2techmn.com',
                  plan: 'ULTRA',
                  entitlement: {
                    endsAt: new Date(Date.now() + 30 * 86400000).toISOString()
                  }
                },
                credits: {
                  availableCredits: 2500000,
                  unit: 'CREDIT',
                  realMoney: false
                }
              });
            }
            alert('🎉 Đăng nhập Apple ID thành công! Chào mừng Kỹ sư Nguyễn Minh Nhựt (+2.500.000 credit chào mừng và 1 tháng ULTRA).');
          }
        }, [
          element('div', {
            style: 'width:36px;height:36px;border-radius:50%;background:#38bdf8;display:flex;align-items:center;justify-content:center;font-weight:bold;color:#fff;'
          }, ['🍎']),
          element('div', { class: 'flex-1 min-w-0' }, [
            element('div', { class: 'text-xs font-bold text-white' }, ['Nguyễn Minh Nhựt']),
            element('div', { class: 'text-xs text-slate-400 font-mono' }, ['nhut.apple@2techmn.com'])
          ]),
          element('span', { class: 'badge badge-success text-[10px]' }, ['Chính thức'])
        ]),
        element('button', {
          type: 'button',
          class: 'btn btn-ghost text-xs text-slate-400 mt-1',
          onClick: () => closeDialog('apple-acc-modal')
        }, ['Đóng'])
      ]);

      createAccessibleDialog({
        id: 'apple-acc-modal',
        title: 'Đăng nhập với Apple (ID)',
        content: accList
      });
    }

    const content = element('div', { class: 'flex flex-col gap-3 py-2' }, [
      element('p', { class: 'text-xs text-slate-400 mb-2 leading-relaxed' }, [
        'Chọn phương thức xác thực chính thức để nhận 2.500.000 credit và 1 tháng trải nghiệm ULTRA:'
      ]),
      element('button', {
        type: 'button',
        class: 'btn btn-secondary w-full py-2.5 px-4 rounded-xl text-white text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700 transition-all hover:border-emerald-500',
        onClick: () => {
          if (isStaticDeploy) {
            closeDialog('login-modal');
            showGoogleAccountSelector();
          } else {
            apiClient.loginWithGoogle();
          }
        }
      }, [
        element('span', { class: 'text-sm' }, ['🌐']),
        'Tiếp tục với Google'
      ]),
      element('button', {
        type: 'button',
        class: 'btn btn-secondary w-full py-2.5 px-4 rounded-xl text-white text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700 transition-all hover:border-emerald-500',
        onClick: () => {
          if (isStaticDeploy) {
            closeDialog('login-modal');
            showAppleAccountSelector();
          } else {
            apiClient.loginWithApple();
          }
        }
      }, [
        element('span', { class: 'text-sm' }, ['🍎']),
        'Tiếp tục với Apple (ID)'
      ])
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
  const contentOutlet = document.getElementById('mainContent') || document.querySelector('.main-content') || document.body;

  const routes = {
    dashboard: ({ outlet }) => {
      const page = createDashboardPage({ state, api });
      page.mount(outlet);
      return () => page.unmount();
    },
    'download-link': ({ outlet }) => {
      const page = createDownloadLinkPage({ state, api });
      page.mount(outlet);
      return () => page.unmount();
    },
    downloaded: ({ outlet }) => {
      const page = createDownloadedPage({ state, api });
      page.mount(outlet);
      return () => page.unmount();
    },
    history: ({ outlet }) => {
      const page = createHistoryPage({ state, api });
      page.mount(outlet);
      return () => page.unmount();
    },
    settings: ({ outlet }) => {
      const page = createSettingsPage({ state, api });
      page.mount(outlet);
      return () => page.unmount();
    },
    support: ({ outlet }) => {
      const page = createSupportPage({ state, api });
      page.mount(outlet);
      return () => page.unmount();
    },
    pricing: ({ outlet }) => {
      const page = createPricingPage({
        state,
        api,
        dialogs: { createAccessibleDialog },
        now: () => Date.now(),
        reducedMotion: () => state.getPreference('motion') === 'reduced'
      });
      page.mount(outlet);
      return () => page.unmount();
    }
  };

  const router = createRouter({
    outlet: contentOutlet,
    routes,
    defaultRoute: 'dashboard'
  });

  // Update page title when navigating
  const originalNavigate = router.navigate;
  router.navigate = async (target, params) => {
    await originalNavigate(target, params);
    const titleEl = document.getElementById('pageTitle');
    const route = router.getCurrentRoute();
    if (titleEl && route && PAGE_TITLES[route]) {
      titleEl.textContent = PAGE_TITLES[route];
    }
  };

  router.start();

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

  // Wire mute toggle
  const btnMute = document.getElementById('btnMute');
  if (btnMute) {
    btnMute.addEventListener('click', () => {
      const current = state.getPreference('muted') === 'true';
      state.setPreference('muted', current ? 'false' : 'true');
      btnMute.setAttribute('aria-pressed', current ? 'false' : 'true');
    });
  }

  // Uptime counter
  const startTime = Date.now();
  setInterval(() => {
    const uptimeEl = document.getElementById('footerUptime');
    if (!uptimeEl) return;
    const elapsedSec = Math.floor((Date.now() - startTime) / 1000);
    const m = Math.floor(elapsedSec / 60);
    const s = elapsedSec % 60;
    uptimeEl.textContent = `${m}m ${s}s`;
  }, 1000);

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
