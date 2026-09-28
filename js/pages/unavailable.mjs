// js/pages/unavailable.mjs — Honest unavailable state presentation
import { element } from '../dom.mjs';

export function createUnavailablePage({
  title = 'Tính năng đang chờ kết nối Backend',
  reason = 'Tính năng này yêu cầu dịch vụ Node.js backend và yt-dlp cục bộ đang chạy.',
  actionLabel = null,
  onAction = null
} = {}) {
  let container = null;

  function render(outlet) {
    outlet.innerHTML = '';
    container = element('div', { class: 'max-w-xl mx-auto p-8 text-center flex flex-col items-center gap-4 my-10' });

    const icon = element('div', { class: 'w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 text-3xl shadow-inner' }, ['⚡']);
    const titleEl = element('h2', { class: 'text-base font-bold text-white' }, [title]);
    const reasonEl = element('p', { class: 'text-xs text-slate-400 leading-relaxed max-w-md' }, [reason]);

    container.appendChild(icon);
    container.appendChild(titleEl);
    container.appendChild(reasonEl);

    if (actionLabel && typeof onAction === 'function') {
      const actionBtn = element('button', {
        class: 'mt-2 py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-all',
        onClick: onAction
      }, [actionLabel]);
      container.appendChild(actionBtn);
    }

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
