// js/pages/history.mjs — Download History Page
// Developed for 2TECH MN (Nguyễn Minh Nhựt)
import { element } from '../dom.mjs';

const DEMO_HISTORY = [
  { ts: '17:35:10 28/09/2026', platform: 'Douyin', name: 'Thước phim du lịch Vân Nam 4K', res: '4K 60FPS', status: 'Hoàn tất' },
  { ts: '16:42:00 28/09/2026', platform: 'TikTok', name: 'Hướng dẫn nhiếp ảnh điện ảnh', res: '1080p 60FPS', status: 'Hoàn tất' },
  { ts: '15:10:22 28/09/2026', platform: 'YouTube', name: 'Trailer phim ngắn hành động', res: '4K Ultra HD', status: 'Hoàn tất' }
];

export function createHistoryPage({ state, api } = {}) {
  let container = null;
  let historyList = [...DEMO_HISTORY];

  function render(outlet) {
    outlet.innerHTML = '';
    container = element('div', { class: 'history-container max-w-5xl mx-auto p-4 sm:p-6 flex flex-col gap-6' });

    // Header
    const header = element('div', { class: 'flex flex-wrap items-center justify-between gap-4' }, [
      element('div', {}, [
        element('h1', { class: 'text-2xl font-bold text-white' }, ['Lịch sử tải']),
        element('p', { class: 'text-sm text-slate-400 mt-1' }, [
          'Nhật ký các tác vụ bóc tách video và tải về đã thực hiện.'
        ])
      ]),
      element('button', {
        type: 'button',
        class: 'btn btn-ghost btn-sm text-red-400',
        onClick: () => {
          historyList = [];
          render(outlet);
        }
      }, ['🗑 Xóa sạch lịch sử'])
    ]);
    container.appendChild(header);

    // Table
    const tableCard = element('div', { class: 'card p-0 overflow-hidden' });
    const table = element('table', { class: 'w-full text-left text-xs border-collapse' });

    const thead = element('thead', { class: 'bg-slate-900 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider' }, [
      element('tr', {}, [
        element('th', { class: 'p-3' }, ['Thời gian']),
        element('th', { class: 'p-3' }, ['Nền tảng']),
        element('th', { class: 'p-3' }, ['Tên video / Tác vụ']),
        element('th', { class: 'p-3' }, ['Độ phân giải']),
        element('th', { class: 'p-3 text-right' }, ['Trạng thái'])
      ])
    ]);
    table.appendChild(thead);

    const tbody = element('tbody', { class: 'divide-y divide-slate-800' });
    if (historyList.length === 0) {
      tbody.appendChild(element('tr', {}, [
        element('td', { colspan: '5', class: 'p-8 text-center text-slate-400' }, ['Chưa có lịch sử tải video nào.'])
      ]));
    } else {
      for (const item of historyList) {
        const row = element('tr', { class: 'hover:bg-slate-900/50 transition-colors' }, [
          element('td', { class: 'p-3 font-mono text-slate-400' }, [item.ts]),
          element('td', { class: 'p-3' }, [
            element('span', { class: 'badge badge-neutral text-[10px]' }, [item.platform])
          ]),
          element('td', { class: 'p-3 font-semibold text-white' }, [item.name]),
          element('td', { class: 'p-3 font-mono text-emerald-400' }, [item.res]),
          element('td', { class: 'p-3 text-right' }, [
            element('span', { class: 'badge badge-success text-[10px]' }, [item.status])
          ])
        ]);
        tbody.appendChild(row);
      }
    }
    table.appendChild(tbody);
    tableCard.appendChild(table);
    container.appendChild(tableCard);

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
