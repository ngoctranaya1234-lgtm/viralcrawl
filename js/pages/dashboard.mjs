// js/pages/dashboard.mjs — Honest server-authoritative dashboard
import { element } from '../dom.mjs';

export function createDashboardPage({ state, api } = {}) {
  let container = null;

  function render(outlet) {
    outlet.innerHTML = '';
    const snap = state?.getSnapshot ? state.getSnapshot() : {};
    const availableCredits = snap.credits?.availableCredits ?? 0;
    const plan = snap.user?.plan || 'FREE';

    container = element('div', { class: 'dashboard-container max-w-4xl mx-auto p-4 sm:p-6 flex flex-col gap-6' });

    // Hero Branding
    const hero = element('div', { class: 'p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 flex flex-col gap-2' }, [
      element('div', { class: 'text-xs font-mono uppercase text-emerald-400 font-semibold' }, ['MNHUT 2TECH AL 4K STUDIO']),
      element('h1', { class: 'text-xl sm:text-2xl font-black text-white' }, ['Hệ Thống Tải & Cào Video 4K Không Logo']),
      element('p', { class: 'text-xs text-slate-400' }, ['Bản quyền Kỹ sư trưởng Nguyễn Minh Nhựt • Đơn vị 2TECH MN. Vận hành trên Node.js v24 + SQLite WAL.'])
    ]);
    container.appendChild(hero);

    // KPI Cards
    const kpis = element('div', { class: 'grid grid-cols-1 sm:grid-cols-3 gap-3' }, [
      element('div', { class: 'p-4 rounded-xl bg-slate-900 border border-slate-800' }, [
        element('div', { class: 'text-xs text-slate-400' }, ['Tín dụng khả dụng:']),
        element('div', { class: 'text-lg font-bold font-mono text-emerald-400 mt-1' }, [`${availableCredits.toLocaleString('vi-VN')} credit`])
      ]),
      element('div', { class: 'p-4 rounded-xl bg-slate-900 border border-slate-800' }, [
        element('div', { class: 'text-xs text-slate-400' }, ['Gói tài khoản:']),
        element('div', { class: 'text-lg font-bold text-cyan-400 mt-1' }, [plan])
      ]),
      element('div', { class: 'p-4 rounded-xl bg-slate-900 border border-slate-800' }, [
        element('div', { class: 'text-xs text-slate-400' }, ['Trạng thái hệ thống:']),
        element('div', { class: 'text-lg font-bold text-white mt-1 flex items-center gap-1.5' }, [
          element('span', { class: 'w-2 h-2 rounded-full bg-emerald-500 animate-pulse' }),
          'Sẵn sàng'
        ])
      ])
    ]);
    container.appendChild(kpis);

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
