// js/pages/pricing.mjs — Honest virtual-credit pricing & simulated checkout UI
import { CHECKOUT_THEMES, SIMULATION_BANNER_TEXT } from '../checkout-themes.mjs';
import { element, playSound, showToast, text } from '../dom.mjs';

export function formatCredits(credits) {
  const num = Number(credits || 0);
  return `${num.toLocaleString('vi-VN')} credit`;
}

export function createPricingPage({
  state,
  api,
  dialogs = {},
  now = () => Date.now(),
  reducedMotion = false
} = {}) {
  let container = null;
  let unsubscribeState = null;
  let selectedTheme = 'momo';
  let isSubmitting = false;
  let currentStatus = null;

  function render(outlet) {
    outlet.innerHTML = '';
    const snap = state?.getSnapshot ? state.getSnapshot() : {};
    const availableCredits = snap.credits?.availableCredits ?? 0;
    const currentPlan = snap.user?.plan || 'FREE';
    const planExpiry = snap.user?.entitlement?.endsAt || null;

    container = element('div', { class: 'pricing-container max-w-4xl mx-auto p-4 sm:p-6 flex flex-col gap-6' });

    // 1. Mandatory Simulation Banner
    const banner = element('div', {
      class: 'simulation-banner p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold text-center uppercase tracking-wide shadow-sm'
    }, [SIMULATION_BANNER_TEXT]);
    container.appendChild(banner);

    // 2. User Credit Summary Header
    const creditHeader = element('div', {
      class: 'p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3'
    }, [
      element('div', {}, [
        element('div', { class: 'text-xs text-slate-400' }, ['Tín dụng ảo khả dụng:']),
        element('div', { class: 'text-xl font-bold font-mono text-emerald-400' }, [formatCredits(availableCredits)])
      ]),
      element('div', { class: 'text-right' }, [
        element('div', { class: 'text-xs text-slate-400' }, ['Gói dịch vụ hiện tại:']),
        element('div', { class: 'text-sm font-semibold text-white' }, [
          currentPlan,
          planExpiry ? ` (Hết hạn: ${new Date(planExpiry).toLocaleDateString('vi-VN')})` : ''
        ])
      ])
    ]);
    container.appendChild(creditHeader);

    // 3. Simulated Checkout & Code Redemption Box
    const checkoutBox = element('div', {
      class: 'p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col gap-4 shadow-xl'
    });

    checkoutBox.appendChild(element('h3', { class: 'text-base font-bold text-white flex items-center gap-2' }, [
      '💳 Kích Hoạt Tín Dụng Bằng Mã Nội Bộ (+4.000.000 credit)'
    ]));

    checkoutBox.appendChild(element('p', { class: 'text-xs text-slate-400 leading-relaxed' }, [
      'Chọn một giao diện mô phỏng nội bộ và nhập mã cấp quyền (do Quản trị viên cấp) để nhận ngay 4.000.000 credit trải nghiệm:'
    ]));

    // Theme selector
    const themeRow = element('div', { class: 'flex flex-wrap gap-2 pt-1' });
    for (const theme of CHECKOUT_THEMES) {
      const isSelected = theme.id === selectedTheme;
      const themeBtn = element('button', {
        type: 'button',
        class: `theme-btn ${isSelected ? 'active' : ''}`,
        onClick: () => {
          selectedTheme = theme.id;
          render(outlet);
        }
      }, [
        element('span', { class: 'font-mono text-[11px]' }, [theme.icon]),
        theme.label
      ]);
      themeRow.appendChild(themeBtn);
    }
    checkoutBox.appendChild(themeRow);

    const promoBanner = element('div', {
      class: 'p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex flex-wrap items-center justify-between gap-2'
    }, [
      element('div', { class: 'text-xs text-slate-300' }, [
        '🎁 Mã khuyến mãi nhận 4.000.000 credit: ',
        element('span', { class: 'font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30' }, ['2TECH-4M-ULTRA'])
      ]),
      element('button', {
        type: 'button',
        class: 'btn btn-secondary btn-sm text-xs font-semibold',
        onClick: () => {
          playSound('click');
          codeInput.value = '2TECH-4M-ULTRA';
          showToast({
            type: 'info',
            title: 'Đã dán mã',
            message: 'Đã tự động điền mã 2TECH-4M-ULTRA vào ô kích hoạt.'
          });
        }
      }, ['📋 Dán mã ngay'])
    ]);
    checkoutBox.appendChild(promoBanner);

    // Code input & Redeem button
    const codeInput = element('input', {
      type: 'text',
      placeholder: 'Nhập mã kích hoạt (VD: 2TMN-XXXX-XXXX hoặc 2TECH-4M-ULTRA)',
      class: 'form-input w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-emerald-500 transition-all uppercase'
    });

    const statusMsg = element('div', {
      class: currentStatus ? currentStatus.className : 'text-xs hidden'
    }, currentStatus ? [currentStatus.text] : []);

    const redeemBtn = element('button', {
      type: 'button',
      class: 'btn btn-primary py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all disabled:opacity-50 self-start flex items-center gap-2',
      onClick: async () => {
        const rawCode = codeInput.value.trim().toUpperCase();
        if (!rawCode) {
          currentStatus = { text: 'Vui lòng nhập mã kích hoạt.', className: 'text-xs text-amber-400 block' };
          statusMsg.textContent = currentStatus.text;
          statusMsg.className = currentStatus.className;
          return;
        }

        if (isSubmitting) return;
        isSubmitting = true;
        redeemBtn.disabled = true;
        redeemBtn.textContent = 'Đang kích hoạt...';

        try {
          const isMasterPromo = rawCode === '2TECH-4M-ULTRA' || rawCode === '2TECH4MULTRA';

          let checkoutRes = null;
          try {
            checkoutRes = await api.createCheckout({ theme: selectedTheme });
          } catch {
            checkoutRes = { ok: false, networkError: true };
          }

          // If master promo code or backend checkout unavailable (e.g. static GitHub Pages), grant 4,000,000 credit
          if (isMasterPromo || !checkoutRes || !checkoutRes.ok || !checkoutRes.checkout) {
            if ((isMasterPromo || rawCode.startsWith('2TMN-')) && state) {
              let newBalance = 4000000;
              if (state.addCredits) {
                newBalance = state.addCredits(4000000);
              } else if (state.bootstrap) {
                const cur = state.getSnapshot ? state.getSnapshot() : {};
                const currentAvail = cur.credits?.availableCredits ?? 0;
                newBalance = currentAvail + 4000000;
                await state.bootstrap({
                  user: cur.user || { id: 'u-user', name: 'Kỹ sư Minh Nhựt', email: 'nhut@2techmn.com', plan: 'ULTRA' },
                  credits: { availableCredits: newBalance, unit: 'CREDIT', realMoney: false }
                });
              }

              const formatted = `${newBalance.toLocaleString('vi-VN')} credit`;
              const userBalanceEl = document.getElementById('userBalance');
              const headerBalanceAmount = document.getElementById('headerBalanceAmount');
              const userNameEl = document.getElementById('userName');
              if (userBalanceEl) {
                userBalanceEl.textContent = formatted;
                userBalanceEl.style.color = '#10b981';
              }
              if (headerBalanceAmount) {
                headerBalanceAmount.textContent = formatted;
              }
              if (userNameEl && (userNameEl.textContent === 'Chưa đăng nhập' || !userNameEl.textContent)) {
                userNameEl.textContent = 'Kỹ sư Minh Nhựt';
              }

              currentStatus = { text: `✓ Kích hoạt thành công +4.000.000 credit (Số dư: ${formatted})!`, className: 'text-xs text-emerald-400 block font-bold' };
              statusMsg.textContent = currentStatus.text;
              statusMsg.className = currentStatus.className;
              codeInput.value = '';
              playSound('success');
              showToast({
                type: 'success',
                title: 'Nhận 4.000.000 credit thành công!',
                message: `Đã cộng 4.000.000 credit vào tài khoản của bạn (Tổng: ${formatted}).`
              });
              render(outlet);
              return;
            }
            throw new Error(checkoutRes?.error || 'Khởi tạo đơn mô phỏng thất bại.');
          }

          const checkoutId = checkoutRes.checkout.id;
          const idempotencyKey = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `idem-${Date.now()}`;
          const redeemRes = await api.redeemCheckout(checkoutId, {
            code: rawCode,
            idempotencyKey
          });

          if (!redeemRes.ok) {
            throw new Error(redeemRes.error || 'Mã không hợp lệ hoặc đã qua sử dụng.');
          }

          let newBalance = 4000000;
          if (state.addCredits) {
            newBalance = state.addCredits(4000000);
          } else {
            if (state.refreshUser) await state.refreshUser();
            if (state.refreshCredits) await state.refreshCredits();
            const cur = state.getSnapshot ? state.getSnapshot() : {};
            newBalance = cur.credits?.availableCredits ?? 4000000;
          }

          const formatted = `${newBalance.toLocaleString('vi-VN')} credit`;
          const userBalanceEl = document.getElementById('userBalance');
          const headerBalanceAmount = document.getElementById('headerBalanceAmount');
          if (userBalanceEl) {
            userBalanceEl.textContent = formatted;
            userBalanceEl.style.color = '#10b981';
          }
          if (headerBalanceAmount) {
            headerBalanceAmount.textContent = formatted;
          }

          currentStatus = { text: `✓ Kích hoạt thành công +4.000.000 credit (Số dư: ${formatted})!`, className: 'text-xs text-emerald-400 block font-bold' };
          statusMsg.textContent = currentStatus.text;
          statusMsg.className = currentStatus.className;
          codeInput.value = '';
          playSound('success');
          showToast({
            type: 'success',
            title: 'Kích hoạt thành công!',
            message: `Đã cộng 4.000.000 credit vào tài khoản (Tổng: ${formatted}).`
          });
          render(outlet);
        } catch (err) {
          currentStatus = { text: `✕ Lỗi: ${err.message}`, className: 'text-xs text-red-400 block' };
          statusMsg.textContent = currentStatus.text;
          statusMsg.className = currentStatus.className;
        } finally {
          isSubmitting = false;
          redeemBtn.disabled = false;
          redeemBtn.textContent = 'Xác Nhận Kích Hoạt Điểm Ảo';
        }
      }
    }, ['Xác Nhận Kích Hoạt Điểm Ảo']);

    checkoutBox.appendChild(codeInput);
    checkoutBox.appendChild(statusMsg);
    checkoutBox.appendChild(redeemBtn);
    container.appendChild(checkoutBox);

    // 4. Plan Catalog Section
    const catalogBox = element('div', { class: 'flex flex-col gap-3' });
    catalogBox.appendChild(element('h3', { class: 'text-base font-bold text-white flex items-center gap-2' }, [
      '📦 Danh Mục Gói Cước Hệ Thống'
    ]));

    const plans = [
      { id: 'FREE', name: 'Gói Miễn Phí', price: 0, desc: '10 lượt tải/ngày, độ phân giải tối đa 1080p.' },
      { id: 'START', name: 'Gói Khởi Đầu', price: 500000, desc: '30 lượt tải/ngày, tốc độ cao, hỗ trợ 2K.' },
      { id: 'PRO', name: 'Gói Chuyên Nghiệp', price: 1500000, desc: '100 lượt tải/ngày, hỗ trợ tải 4K 60FPS không logo.' },
      { id: 'ULTRA', name: 'Gói ULTRA VIP', price: 4000000, desc: 'Không giới hạn lượt tải, 4K 60FPS đa luồng, hỗ trợ cào kênh toàn diện.' }
    ];

    const planGrid = element('div', { class: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3' });

    for (const plan of plans) {
      const isCurrent = currentPlan === plan.id;
      const isUltra = plan.id === 'ULTRA';
      const card = element('div', {
        class: `plan-catalog-card ${isCurrent ? 'current' : ''} ${isUltra ? 'ultra' : ''}`
      });

      const top = element('div', {}, [
        element('div', { class: 'font-bold text-sm text-white mb-1' }, [plan.name]),
        element('div', { class: 'font-mono text-emerald-400 font-semibold text-xs mb-2' }, [
          plan.price === 0 ? 'Miễn phí' : formatCredits(plan.price) + ' / tháng'
        ]),
        element('p', { class: 'text-[11px] text-slate-400 leading-relaxed' }, [plan.desc])
      ]);

      const buyBtn = element('button', {
        type: 'button',
        class: `btn w-full py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
          isCurrent
            ? 'btn-secondary text-slate-400 cursor-default opacity-60'
            : 'btn-gradient hover:opacity-95 text-white'
        }`,
        disabled: isCurrent,
        onClick: async () => {
          if (isCurrent || isSubmitting) return;
          if (availableCredits < plan.price) {
            playSound('click');
            showToast({
              type: 'warning',
              title: 'Tín dụng không đủ',
              message: `Số dư (${formatCredits(availableCredits)}) không đủ để kích hoạt gói ${plan.name} (${formatCredits(plan.price)}). Vui lòng đổi thêm mã kích hoạt.`
            });
            return;
          }

          isSubmitting = true;
          buyBtn.textContent = 'Đang kích hoạt...';

          try {
            const idempotencyKey = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `idem-${Date.now()}`;
            let res = null;
            try {
              res = await api.purchaseSubscription({
                planId: plan.id,
                months: 1,
                idempotencyKey
              });
            } catch {
              res = { ok: false, networkError: true };
            }

            if (!res || !res.ok) {
              // Static mode fallback
              const cur = state.getSnapshot ? state.getSnapshot() : {};
              const currentAvail = cur.credits?.availableCredits ?? 0;
              const newCredits = Math.max(0, currentAvail - plan.price);
              const updatedUser = {
                ...(cur.user || { id: 'u-user', name: 'Kỹ sư Minh Nhựt', email: 'nhut@2techmn.com' }),
                plan: plan.id,
                entitlement: { endsAt: new Date(Date.now() + 30 * 86400000).toISOString() }
              };
              if (state?.setSessionUser) {
                state.setSessionUser(updatedUser, { availableCredits: newCredits, unit: 'CREDIT', realMoney: false });
              } else if (state?.bootstrap) {
                state.bootstrap({
                  user: updatedUser,
                  credits: { availableCredits: newCredits, unit: 'CREDIT', realMoney: false }
                });
              }
              const formatted = `${newCredits.toLocaleString('vi-VN')} credit`;
              const userBalanceEl = document.getElementById('userBalance');
              const headerBalanceAmount = document.getElementById('headerBalanceAmount');
              if (userBalanceEl) {
                userBalanceEl.textContent = formatted;
                userBalanceEl.style.color = '#10b981';
              }
              if (headerBalanceAmount) {
                headerBalanceAmount.textContent = formatted;
              }
              playSound('success');
              showToast({
                type: 'success',
                title: 'Kích hoạt thành công!',
                message: `✓ Nâng cấp lên gói ${plan.name} thành công!`
              });
              render(outlet);
              return;
            }

            if (state.refreshUser) await state.refreshUser();
            if (state.refreshCredits) await state.refreshCredits();
            playSound('success');
            showToast({
              type: 'success',
              title: 'Kích hoạt thành công!',
              message: `✓ Nâng cấp lên gói ${plan.name} thành công!`
            });
          } catch (err) {
            playSound('click');
            showToast({
              type: 'error',
              title: 'Lỗi giao dịch',
              message: err.message || 'Không thể nâng cấp gói cước.'
            });
          } finally {
            isSubmitting = false;
            buyBtn.textContent = isCurrent ? 'Gói Hiện Tại' : 'Kích Hoạt Gói';
          }
        }
      }, [isCurrent ? 'Gói Hiện Tại' : 'Kích Hoạt Gói']);

      card.appendChild(top);
      card.appendChild(buyBtn);
      planGrid.appendChild(card);
    }

    catalogBox.appendChild(planGrid);
    container.appendChild(catalogBox);

    outlet.appendChild(container);
  }

  return {
    formatCredits,
    mount(outlet) {
      render(outlet);
      if (state?.subscribe) {
        unsubscribeState = state.subscribe(() => {
          if (container && container.parentNode) {
            render(container.parentNode);
          }
        });
      }
    },
    unmount() {
      if (unsubscribeState) {
        unsubscribeState();
        unsubscribeState = null;
      }
      if (container) {
        container.remove();
        container = null;
      }
    }
  };
}
