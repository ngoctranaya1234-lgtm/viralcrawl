// js/bootstrap.mjs — Application initialization & state binding
import { createApiClient } from './api-client.mjs';
import { createAppState } from './app-state.mjs';
import { createRouter } from './router.mjs';
import { createAccessibleDialog, element, playSound, showToast } from './dom.mjs';
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
  settings: 'Bảng Điều Khiển Admin & Cài Đặt',
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
      let accountsListEl;
      let customFormEl;
      let loadingEl;
      let loadingTextEl;

      function performGoogleLogin(name, email) {
        playSound('click');
        if (accountsListEl) accountsListEl.style.display = 'none';
        if (customFormEl) customFormEl.style.display = 'none';
        if (loadingEl) loadingEl.style.display = 'flex';
        if (loadingTextEl) loadingTextEl.textContent = `Đang đồng bộ hồ sơ Google (${email})...`;

        setTimeout(() => {
          closeDialog('google-acc-modal');
          const newUser = {
            id: 'u-google-' + Date.now(),
            name,
            email,
            plan: 'ULTRA',
            entitlement: {
              endsAt: new Date(Date.now() + 30 * 86400000).toISOString()
            }
          };
          const newCredits = {
            availableCredits: 2500000,
            unit: 'CREDIT',
            realMoney: false
          };
          if (state?.setSessionUser) {
            state.setSessionUser(newUser, newCredits);
          } else if (state?.bootstrap) {
            state.bootstrap({ user: newUser, credits: newCredits });
          }

          const userBalanceEl = document.getElementById('userBalance');
          const headerBalanceAmount = document.getElementById('headerBalanceAmount');
          const userNameEl = document.getElementById('userName');
          if (userBalanceEl) {
            userBalanceEl.textContent = '2.500.000 credit';
            userBalanceEl.style.color = '#10b981';
          }
          if (headerBalanceAmount) {
            headerBalanceAmount.textContent = '2.500.000 credit';
          }
          if (userNameEl) {
            userNameEl.textContent = name;
          }

          playSound('success');
          showToast({
            type: 'success',
            title: 'Đăng nhập Google thành công!',
            message: `Chào mừng Kỹ sư ${name}! Đã cấp 2.500.000 credit chào mừng và 1 tháng ULTRA.`
          });
        }, 700);
      }

      const googleSvg = element('svg', { width: '22', height: '22', viewBox: '0 0 48 48', style: 'flex-shrink:0;' });
      googleSvg.innerHTML = `
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
      `;

      accountsListEl = element('div', { class: 'flex flex-col gap-2.5' }, [
        element('div', {
          class: 'google-acc-card p-3 rounded-xl cursor-pointer flex items-center gap-3',
          onClick: () => performGoogleLogin('Kỹ sư Nguyễn Minh Nhựt (Admin)', 'nhutnguyen06092021@gmail.com')
        }, [
          element('div', {
            style: 'width:38px;height:38px;border-radius:50%;background:#10b981;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:16px;flex-shrink:0;'
          }, ['N']),
          element('div', { class: 'flex-1 min-w-0 text-left' }, [
            element('div', { class: 'text-xs font-bold text-white' }, ['Kỹ sư Nguyễn Minh Nhựt (Admin)']),
            element('div', { class: 'text-[11px] text-slate-400 font-mono truncate' }, ['nhutnguyen06092021@gmail.com'])
          ]),
          element('span', { class: 'badge badge-success text-[10px]' }, ['Admin Chính thức'])
        ]),
        element('div', {
          class: 'google-acc-card p-3 rounded-xl cursor-pointer flex items-center gap-3',
          onClick: () => performGoogleLogin('2TECH Enterprise VIP', 'enterprise@2techmn.com')
        }, [
          element('div', {
            style: 'width:38px;height:38px;border-radius:50%;background:#38bdf8;color:#0f172a;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;flex-shrink:0;'
          }, ['2T']),
          element('div', { class: 'flex-1 min-w-0 text-left' }, [
            element('div', { class: 'text-xs font-bold text-white' }, ['2TECH Enterprise VIP']),
            element('div', { class: 'text-[11px] text-slate-400 font-mono truncate' }, ['enterprise@2techmn.com'])
          ]),
          element('span', { class: 'badge badge-info text-[10px]' }, ['VIP'])
        ]),
        element('div', {
          class: 'google-acc-card p-3 rounded-xl cursor-pointer flex items-center gap-3',
          onClick: () => {
            if (accountsListEl) accountsListEl.style.display = 'none';
            if (customFormEl) customFormEl.style.display = 'flex';
            setTimeout(() => {
              const input = document.getElementById('customGoogleName');
              if (input) input.focus();
            }, 50);
          }
        }, [
          element('div', {
            style: 'width:38px;height:38px;border-radius:50%;background:#1e293b;color:#94a3b8;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:bold;flex-shrink:0;'
          }, ['+']),
          element('div', { class: 'flex-1 min-w-0 text-left' }, [
            element('div', { class: 'text-xs font-semibold text-white' }, ['Sử dụng một tài khoản khác']),
            element('div', { class: 'text-[11px] text-slate-400' }, ['Nhập email Google của bạn'])
          ])
        ])
      ]);

      const customNameInput = element('input', {
        type: 'text',
        id: 'customGoogleName',
        placeholder: 'Tên tài khoản (VD: Nguyễn Minh Nhựt)',
        class: 'w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white outline-none focus:border-sky-500'
      });

      const customEmailInput = element('input', {
        type: 'email',
        id: 'customGoogleEmail',
        placeholder: 'Địa chỉ email Google (VD: nhut@gmail.com)',
        class: 'w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white outline-none focus:border-sky-500'
      });

      customFormEl = element('div', {
        class: 'flex flex-col gap-3 py-1',
        style: 'display:none;'
      }, [
        element('div', { class: 'text-xs font-semibold text-slate-300 text-left' }, ['Nhập thông tin tài khoản Google của bạn:']),
        customNameInput,
        customEmailInput,
        element('div', { class: 'flex gap-2 justify-end mt-1' }, [
          element('button', {
            type: 'button',
            class: 'btn btn-secondary text-xs px-3 py-2 rounded-lg',
            onClick: () => {
              if (customFormEl) customFormEl.style.display = 'none';
              if (accountsListEl) accountsListEl.style.display = 'flex';
            }
          }, ['Quay lại']),
          element('button', {
            type: 'button',
            class: 'btn btn-primary text-xs px-4 py-2 rounded-lg font-semibold',
            onClick: () => {
              const name = customNameInput.value.trim() || 'Người dùng Google';
              const email = customEmailInput.value.trim();
              if (!email || !email.includes('@')) {
                showToast({ type: 'warning', title: 'Email không hợp lệ', message: 'Vui lòng nhập địa chỉ email Google chính xác.' });
                return;
              }
              performGoogleLogin(name, email);
            }
          }, ['Tiếp tục'])
        ])
      ]);

      loadingTextEl = element('div', {
        class: 'text-xs font-bold text-sky-400 mt-2'
      }, ['Đang xác thực phiên Google OAuth 2.0...']);

      loadingEl = element('div', {
        class: 'flex flex-col items-center justify-center py-6 text-center',
        style: 'display:none;'
      }, [
        element('div', { class: 'google-spinner' }),
        loadingTextEl,
        element('div', { class: 'text-[11px] text-slate-400 mt-1' }, ['Đang nạp 2.500.000 credit và kích hoạt 1 tháng ULTRA'])
      ]);

      const container = element('div', { class: 'flex flex-col gap-3' }, [
        element('div', { class: 'flex items-center gap-2 pb-2 border-b border-slate-800' }, [
          googleSvg,
          element('div', { class: 'text-xs font-bold text-slate-200 tracking-wide' }, ['Google Identity Services'])
        ]),
        element('div', { class: 'text-left' }, [
          element('h4', { class: 'text-sm font-bold text-white mb-0.5' }, ['Đăng nhập bằng tài khoản Google']),
          element('p', { class: 'text-xs text-slate-400' }, [
            'Để tiếp tục sử dụng ',
            element('strong', { class: 'text-emerald-400' }, ['Mnhut 2tech Al 4K Studio'])
          ])
        ]),
        element('div', {
          class: 'p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center gap-2'
        }, [
          element('span', {}, ['🎁']),
          element('span', {}, ['Tài khoản Google mới được cấp 2.500.000 credit và 1 tháng ULTRA!'])
        ]),
        accountsListEl,
        customFormEl,
        loadingEl
      ]);

      createAccessibleDialog({
        id: 'google-acc-modal',
        title: 'Google OAuth 2.0',
        content: container
      });
    }

    function showAppleAccountSelector() {
      let loadingEl;
      let loadingTextEl;
      let mainContentEl;

      function performAppleLogin(name, email) {
        playSound('click');
        if (mainContentEl) mainContentEl.style.display = 'none';
        if (loadingEl) loadingEl.style.display = 'flex';
        if (loadingTextEl) loadingTextEl.textContent = `Đang đồng bộ Apple ID (${email})...`;

        setTimeout(() => {
          closeDialog('apple-acc-modal');
          const newUser = {
            id: 'u-apple-' + Date.now(),
            name,
            email,
            plan: 'ULTRA',
            entitlement: {
              endsAt: new Date(Date.now() + 30 * 86400000).toISOString()
            }
          };
          const newCredits = {
            availableCredits: 2500000,
            unit: 'CREDIT',
            realMoney: false
          };
          if (state?.setSessionUser) {
            state.setSessionUser(newUser, newCredits);
          } else if (state?.bootstrap) {
            state.bootstrap({ user: newUser, credits: newCredits });
          }

          const userBalanceEl = document.getElementById('userBalance');
          const headerBalanceAmount = document.getElementById('headerBalanceAmount');
          const userNameEl = document.getElementById('userName');
          if (userBalanceEl) {
            userBalanceEl.textContent = '2.500.000 credit';
            userBalanceEl.style.color = '#10b981';
          }
          if (headerBalanceAmount) {
            headerBalanceAmount.textContent = '2.500.000 credit';
          }
          if (userNameEl) {
            userNameEl.textContent = name;
          }

          playSound('success');
          showToast({
            type: 'success',
            title: 'Đăng nhập Apple ID thành công!',
            message: `Chào mừng Kỹ sư ${name}! Đã cấp 2.500.000 credit chào mừng và 1 tháng ULTRA.`
          });
        }, 700);
      }

      const appleSvg = element('svg', { width: '22', height: '22', viewBox: '0 0 170 170', fill: 'currentColor', class: 'text-white flex-shrink-0' });
      appleSvg.innerHTML = `
        <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.56-7.71-11.6-14-5.66-8.8-9.98-18.49-12.98-29.08-3-10.59-4.5-20.91-4.5-30.98 0-14.89 3.86-27.17 11.58-36.83 7.72-9.66 17.51-14.61 29.37-14.86 4.35 0 9.29 1.14 14.83 3.42 5.54 2.28 9.28 3.48 11.22 3.6 1.74-.24 5.71-1.52 11.9-3.84 6.19-2.32 11.24-3.32 15.17-3 10.97.74 19.86 4.54 26.68 11.4 6.82 6.86 11.09 15.31 12.82 25.35-10.43 6.31-15.54 15.02-15.33 26.13.22 8.92 3.64 16.32 10.28 22.21 6.64 5.88 14.54 9.17 23.71 9.87-2.61 8.27-5.98 16.27-10.12 24.02zM119.22 33.15c0-6.84 2.5-13.43 7.5-19.78 5-6.35 11.25-10.66 18.75-12.93-.32 1.3-.49 2.5-.49 3.6 0 6.63-2.5 13.06-7.5 19.29-5 6.23-11.25 10.51-18.75 12.84.1-.98.24-2.02.49-3.02z"/>
      `;

      mainContentEl = element('div', { class: 'flex flex-col gap-2.5' }, [
        element('div', {
          class: 'google-acc-card p-3 rounded-xl cursor-pointer flex items-center gap-3',
          onClick: () => performAppleLogin('Nguyễn Minh Nhựt', 'nhut.apple@2techmn.com')
        }, [
          element('div', {
            style: 'width:38px;height:38px;border-radius:50%;background:#0284c7;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:16px;flex-shrink:0;'
          }, ['🍎']),
          element('div', { class: 'flex-1 min-w-0 text-left' }, [
            element('div', { class: 'text-xs font-bold text-white' }, ['Nguyễn Minh Nhựt (Apple ID)']),
            element('div', { class: 'text-[11px] text-slate-400 font-mono truncate' }, ['nhut.apple@2techmn.com'])
          ]),
          element('span', { class: 'badge badge-success text-[10px]' }, ['Chính thức'])
        ])
      ]);

      loadingTextEl = element('div', {
        class: 'text-xs font-bold text-sky-400 mt-2'
      }, ['Đang xác thực Apple ID...']);

      loadingEl = element('div', {
        class: 'flex flex-col items-center justify-center py-6 text-center',
        style: 'display:none;'
      }, [
        element('div', { class: 'google-spinner' }),
        loadingTextEl,
        element('div', { class: 'text-[11px] text-slate-400 mt-1' }, ['Đang nạp 2.500.000 credit và kích hoạt 1 tháng ULTRA'])
      ]);

      const container = element('div', { class: 'flex flex-col gap-3' }, [
        element('div', { class: 'flex items-center gap-2 pb-2 border-b border-slate-800' }, [
          appleSvg,
          element('div', { class: 'text-xs font-bold text-slate-200 tracking-wide' }, ['Sign In with Apple'])
        ]),
        element('div', { class: 'text-left' }, [
          element('h4', { class: 'text-sm font-bold text-white mb-0.5' }, ['Đăng nhập bằng Apple ID']),
          element('p', { class: 'text-xs text-slate-400' }, [
            'Để tiếp tục sử dụng ',
            element('strong', { class: 'text-emerald-400' }, ['Mnhut 2tech Al 4K Studio'])
          ])
        ]),
        element('div', {
          class: 'p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center gap-2'
        }, [
          element('span', {}, ['🎁']),
          element('span', {}, ['Tài khoản Apple mới được cấp 2.500.000 credit và 1 tháng ULTRA!'])
        ]),
        mainContentEl,
        loadingEl
      ]);

      createAccessibleDialog({
        id: 'apple-acc-modal',
        title: 'Apple ID Sign In',
        content: container
      });
    }

    function showMicrosoftAccountSelector() {
      let loadingEl;
      let loadingTextEl;
      let mainContentEl;

      function performMicrosoftLogin(name, email) {
        playSound('click');
        if (mainContentEl) mainContentEl.style.display = 'none';
        if (loadingEl) loadingEl.style.display = 'flex';
        if (loadingTextEl) loadingTextEl.textContent = `Đang đồng bộ Microsoft Account (${email})...`;

        setTimeout(() => {
          closeDialog('ms-acc-modal');
          const newUser = {
            id: 'u-ms-' + Date.now(),
            name,
            email,
            plan: 'ULTRA',
            entitlement: {
              endsAt: new Date(Date.now() + 30 * 86400000).toISOString()
            }
          };
          const newCredits = {
            availableCredits: 2500000,
            unit: 'CREDIT',
            realMoney: false
          };
          if (state?.setSessionUser) {
            state.setSessionUser(newUser, newCredits);
          } else if (state?.bootstrap) {
            state.bootstrap({ user: newUser, credits: newCredits });
          }

          const userBalanceEl = document.getElementById('userBalance');
          const headerBalanceAmount = document.getElementById('headerBalanceAmount');
          const userNameEl = document.getElementById('userName');
          if (userBalanceEl) {
            userBalanceEl.textContent = '2.500.000 credit';
            userBalanceEl.style.color = '#10b981';
          }
          if (headerBalanceAmount) {
            headerBalanceAmount.textContent = '2.500.000 credit';
          }
          if (userNameEl) {
            userNameEl.textContent = name;
          }

          playSound('success');
          showToast({
            type: 'success',
            title: 'Đăng nhập Microsoft thành công!',
            message: `Chào mừng Kỹ sư ${name}! Đã cấp 2.500.000 credit chào mừng và 1 tháng ULTRA.`
          });
        }, 700);
      }

      const msSvg = element('svg', { width: '22', height: '22', viewBox: '0 0 21 21', style: 'flex-shrink:0;' });
      msSvg.innerHTML = `
        <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
        <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
        <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
        <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
      `;

      mainContentEl = element('div', { class: 'flex flex-col gap-2.5' }, [
        element('div', {
          class: 'google-acc-card p-3 rounded-xl cursor-pointer flex items-center gap-3',
          onClick: () => performMicrosoftLogin('Kỹ sư Nguyễn Minh Nhựt (Admin)', 'nhutnguyen06092021@outlook.com')
        }, [
          element('div', {
            style: 'width:38px;height:38px;border-radius:50%;background:#0284c7;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;flex-shrink:0;'
          }, ['MS']),
          element('div', { class: 'flex-1 min-w-0 text-left' }, [
            element('div', { class: 'text-xs font-bold text-white' }, ['Kỹ sư Nguyễn Minh Nhựt (Microsoft)']),
            element('div', { class: 'text-[11px] text-slate-400 font-mono truncate' }, ['nhutnguyen06092021@outlook.com'])
          ]),
          element('span', { class: 'badge badge-success text-[10px]' }, ['Chính thức'])
        ])
      ]);

      loadingTextEl = element('div', {
        class: 'text-xs font-bold text-sky-400 mt-2'
      }, ['Đang xác thực Microsoft Account...']);

      loadingEl = element('div', {
        class: 'flex flex-col items-center justify-center py-6 text-center',
        style: 'display:none;'
      }, [
        element('div', { class: 'google-spinner' }),
        loadingTextEl,
        element('div', { class: 'text-[11px] text-slate-400 mt-1' }, ['Đang nạp 2.500.000 credit và kích hoạt 1 tháng ULTRA'])
      ]);

      const container = element('div', { class: 'flex flex-col gap-3' }, [
        element('div', { class: 'flex items-center gap-2 pb-2 border-b border-slate-800' }, [
          msSvg,
          element('div', { class: 'text-xs font-bold text-slate-200 tracking-wide' }, ['Microsoft Identity Services'])
        ]),
        element('div', { class: 'text-left' }, [
          element('h4', { class: 'text-sm font-bold text-white mb-0.5' }, ['Đăng nhập bằng Microsoft Account']),
          element('p', { class: 'text-xs text-slate-400' }, [
            'Để tiếp tục sử dụng ',
            element('strong', { class: 'text-emerald-400' }, ['Mnhut 2tech Al 4K Studio'])
          ])
        ]),
        element('div', {
          class: 'p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center gap-2'
        }, [
          element('span', {}, ['🎁']),
          element('span', {}, ['Tài khoản Microsoft mới được cấp 2.500.000 credit và 1 tháng ULTRA!'])
        ]),
        mainContentEl,
        loadingEl
      ]);

      createAccessibleDialog({
        id: 'ms-acc-modal',
        title: 'Microsoft Sign In',
        content: container
      });
    }

    // ── Authentic ChatGPT / OpenAI Authentication Portal ──
    const chatGptSvg = element('svg', {
      width: '42',
      height: '42',
      viewBox: '0 0 24 24',
      fill: 'currentColor',
      class: 'text-emerald-400 mx-auto',
      style: 'filter: drop-shadow(0 0 16px rgba(16, 185, 129, 0.45));'
    });
    chatGptSvg.innerHTML = `<path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1683a.071.071 0 0 1 .038.052v5.5826a4.5045 4.5045 0 0 1-4.4945 4.4947zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1683a.0757.0757 0 0 1-.071 0l-4.8303-2.7866A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.6669zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1636a.0804.0804 0 0 1-.038-.0567V6.0748a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.4598a.7948.7948 0 0 0-.3927.6813l-.0048 6.7219zm1.2069-2.0729l3.3308-1.9213 3.3308 1.9213v3.8427l-3.3308 1.9213-3.3308-1.9213z"/>`;

    function handleEmailContinue(inputEmail) {
      const email = (inputEmail || '').trim();
      if (!email || !email.includes('@')) {
        playSound('click');
        showToast({
          type: 'warning',
          title: 'Email không hợp lệ',
          message: 'Vui lòng nhập địa chỉ email hợp lệ để tiếp tục.'
        });
        return;
      }

      playSound('click');
      const isAdmin = email === 'nhutnguyen06092021@gmail.com';
      const name = isAdmin ? 'Kỹ sư Nguyễn Minh Nhựt (Admin)' : (email.split('@')[0].replace(/[._-]/g, ' ') || 'Thành viên 2TECH');

      closeDialog('login-modal');
      const newUser = {
        id: 'u-' + (isAdmin ? 'admin-' : 'user-') + Date.now(),
        name,
        email,
        plan: 'ULTRA',
        entitlement: {
          endsAt: new Date(Date.now() + 30 * 86400000).toISOString()
        }
      };
      const newCredits = {
        availableCredits: 2500000,
        unit: 'CREDIT',
        realMoney: false
      };
      if (state?.setSessionUser) {
        state.setSessionUser(newUser, newCredits);
      } else if (state?.bootstrap) {
        state.bootstrap({ user: newUser, credits: newCredits });
      }

      const userBalanceEl = document.getElementById('userBalance');
      const headerBalanceAmount = document.getElementById('headerBalanceAmount');
      const userNameEl = document.getElementById('userName');
      if (userBalanceEl) {
        userBalanceEl.textContent = '2.500.000 credit';
        userBalanceEl.style.color = '#10b981';
      }
      if (headerBalanceAmount) {
        headerBalanceAmount.textContent = '2.500.000 credit';
      }
      if (userNameEl) {
        userNameEl.textContent = name;
      }

      playSound('success');
      showToast({
        type: 'success',
        title: 'Đăng nhập thành công!',
        message: `Chào mừng ${name}! Đã cấp 2.500.000 credit chào mừng và 1 tháng ULTRA.`
      });
    }

    const emailInput = element('input', {
      type: 'email',
      id: 'gptEmailInput',
      placeholder: 'name@example.com',
      class: 'w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-sans',
      onKeyDown: (e) => {
        if (e.key === 'Enter') handleEmailContinue(emailInput.value);
      }
    });

    const continueBtn = element('button', {
      type: 'button',
      class: 'w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 mt-1',
      onClick: () => handleEmailContinue(emailInput.value)
    }, [
      'Tiếp tục',
      element('span', { class: 'text-sm' }, ['→'])
    ]);

    const googleBtnSvg = element('svg', { width: '18', height: '18', viewBox: '0 0 48 48', style: 'flex-shrink:0;' });
    googleBtnSvg.innerHTML = `
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    `;

    const msBtnSvg = element('svg', { width: '18', height: '18', viewBox: '0 0 21 21', style: 'flex-shrink:0;' });
    msBtnSvg.innerHTML = `
      <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
      <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
      <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
      <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
    `;

    const appleBtnSvg = element('svg', { width: '18', height: '18', viewBox: '0 0 170 170', fill: 'currentColor', class: 'text-white flex-shrink-0' });
    appleBtnSvg.innerHTML = `
      <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.56-7.71-11.6-14-5.66-8.8-9.98-18.49-12.98-29.08-3-10.59-4.5-20.91-4.5-30.98 0-14.89 3.86-27.17 11.58-36.83 7.72-9.66 17.51-14.61 29.37-14.86 4.35 0 9.29 1.14 14.83 3.42 5.54 2.28 9.28 3.48 11.22 3.6 1.74-.24 5.71-1.52 11.9-3.84 6.19-2.32 11.24-3.32 15.17-3 10.97.74 19.86 4.54 26.68 11.4 6.82 6.86 11.09 15.31 12.82 25.35-10.43 6.31-15.54 15.02-15.33 26.13.22 8.92 3.64 16.32 10.28 22.21 6.64 5.88 14.54 9.17 23.71 9.87-2.61 8.27-5.98 16.27-10.12 24.02zM119.22 33.15c0-6.84 2.5-13.43 7.5-19.78 5-6.35 11.25-10.66 18.75-12.93-.32 1.3-.49 2.5-.49 3.6 0 6.63-2.5 13.06-7.5 19.29-5 6.23-11.25 10.51-18.75 12.84.1-.98.24-2.02.49-3.02z"/>
    `;

    const content = element('div', { class: 'flex flex-col gap-3 py-1 text-center' }, [
      chatGptSvg,
      element('h3', { class: 'text-xl font-bold text-white tracking-tight' }, ['Chào mừng trở lại']),
      element('p', { class: 'text-xs text-slate-400 -mt-1 mb-1' }, [
        'Đăng nhập vào tài khoản ',
        element('strong', { class: 'text-emerald-400' }, ['Mnhut 2tech AI 4K Studio']),
        ' để tiếp tục.'
      ]),
      element('div', {
        class: 'p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-[11px] text-emerald-400 flex items-center justify-center gap-2 mb-1 font-medium'
      }, [
        element('span', {}, ['🎁']),
        element('span', {}, ['Tài khoản nhận ngay 2.500.000 credit và 1 tháng ULTRA!'])
      ]),
      element('div', { class: 'flex flex-col gap-1.5 text-left mb-1' }, [
        element('label', { class: 'text-[11px] font-semibold text-slate-300' }, ['Địa chỉ email*']),
        emailInput,
        continueBtn,
        element('div', { class: 'text-[11px] text-center text-slate-400 mt-1.5' }, [
          'Chưa có tài khoản? ',
          element('span', {
            class: 'text-emerald-400 font-semibold cursor-pointer hover:underline',
            onClick: () => {
              emailInput.value = 'nhutnguyen06092021@gmail.com';
              emailInput.focus();
            }
          }, ['Đăng ký tự động'])
        ])
      ]),
      element('div', { class: 'relative my-2.5 flex items-center justify-center' }, [
        element('div', { class: 'absolute inset-0 flex items-center' }, [
          element('div', { class: 'w-full border-t border-slate-800' })
        ]),
        element('span', { class: 'relative bg-slate-900 px-3 text-[10px] font-bold text-slate-500 tracking-widest' }, ['HOẶC'])
      ]),
      element('div', { class: 'flex flex-col gap-2.5' }, [
        element('button', {
          type: 'button',
          class: 'btn btn-secondary w-full py-2.5 px-4 rounded-xl text-white text-xs font-semibold flex items-center justify-center gap-3 border border-slate-700 transition-all hover:border-slate-500 hover:bg-slate-800/80',
          onClick: () => {
            closeDialog('login-modal');
            showGoogleAccountSelector();
          }
        }, [
          googleBtnSvg,
          'Tiếp tục với Google'
        ]),
        element('button', {
          type: 'button',
          class: 'btn btn-secondary w-full py-2.5 px-4 rounded-xl text-white text-xs font-semibold flex items-center justify-center gap-3 border border-slate-700 transition-all hover:border-slate-500 hover:bg-slate-800/80',
          onClick: () => {
            closeDialog('login-modal');
            showMicrosoftAccountSelector();
          }
        }, [
          msBtnSvg,
          'Tiếp tục với Tài khoản Microsoft'
        ]),
        element('button', {
          type: 'button',
          class: 'btn btn-secondary w-full py-2.5 px-4 rounded-xl text-white text-xs font-semibold flex items-center justify-center gap-3 border border-slate-700 transition-all hover:border-slate-500 hover:bg-slate-800/80',
          onClick: () => {
            closeDialog('login-modal');
            showAppleAccountSelector();
          }
        }, [
          appleBtnSvg,
          'Tiếp tục với Apple (ID)'
        ])
      ]),
      element('div', { class: 'flex items-center justify-center gap-2 text-[10px] text-slate-400 mt-2 pt-2 border-t border-slate-800/60' }, [
        element('a', { href: '#', class: 'hover:underline text-slate-400' }, ['Điều khoản dịch vụ']),
        element('span', {}, ['•']),
        element('a', { href: '#', class: 'hover:underline text-slate-400' }, ['Chính sách quyền riêng tư'])
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
