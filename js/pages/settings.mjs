// js/pages/settings.mjs — Honest settings page with server-authoritative account info
import { element, playSound, showToast } from '../dom.mjs';

export function createSettingsPage({ state, api } = {}) {
  let container = null;

  function render(outlet) {
    outlet.innerHTML = '';
    const snap = state?.getSnapshot ? state.getSnapshot() : {};
    const user = snap.user;
    const plan = user?.plan || 'FREE';
    const planExpiry = user?.entitlement?.endsAt;

    container = element('div', { class: 'settings-container max-w-2xl mx-auto p-4 sm:p-6 flex flex-col gap-5' });

    const header = element('div', { class: 'flex flex-col gap-1' }, [
      element('h2', { class: 'text-lg font-bold text-white' }, ['⚙️ Cài Đặt Hệ Thống & Tài Khoản']),
      element('p', { class: 'text-xs text-slate-400' }, ['Quản lý thông tin hồ sơ và tùy chọn hiển thị giao diện.'])
    ]);
    container.appendChild(header);

    // Profile Box
    const profileBox = element('div', { class: 'p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-3' }, [
      element('div', { class: 'font-semibold text-sm text-white' }, ['Hồ sơ người dùng:']),
      element('div', { class: 'text-xs text-slate-400' }, [
        element('span', { class: 'font-semibold text-slate-300' }, ['Tên: ']),
        user?.name || 'Khách vãng lai'
      ]),
      element('div', { class: 'text-xs text-slate-400' }, [
        element('span', { class: 'font-semibold text-slate-300' }, ['Email: ']),
        user?.email || 'Chưa đăng nhập'
      ]),
      element('div', { class: 'text-xs text-slate-400' }, [
        element('span', { class: 'font-semibold text-slate-300' }, ['Gói dịch vụ: ']),
        plan,
        planExpiry ? ` (Hạn dùng: ${new Date(planExpiry).toLocaleString('vi-VN')})` : ''
      ])
    ]);
    container.appendChild(profileBox);

    // Preferences Box
    const prefBox = element('div', { class: 'p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-3' }, [
      element('div', { class: 'font-semibold text-sm text-white' }, ['Tùy chọn giao diện:']),
      element('div', { class: 'flex items-center justify-between text-xs text-slate-300' }, [
        element('span', {}, ['Chế độ giảm chuyển động (Reduced Motion):']),
        element('button', {
          class: 'px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-slate-700',
          onClick: () => {
            const current = state.getPreference('motion') === 'reduced';
            state.setPreference('motion', current ? 'normal' : 'reduced');
            playSound('click');
            showToast({
              type: 'info',
              title: 'Cài đặt giao diện',
              message: `Đã đổi chế độ chuyển động: ${current ? 'Bình thường' : 'Giảm chuyển động'}`
            });
          }
        }, ['Chuyển Đổi'])
      ])
    ]);
    container.appendChild(prefBox);

    outlet.appendChild(container);
  }

  return {
    mount(outlet) {
      render(outlet);
    },
    unmount() {
      if (container) {
        container.remove();
        container = null;
      }
    }
  };
}
