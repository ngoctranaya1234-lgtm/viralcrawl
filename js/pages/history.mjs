// js/pages/history.mjs — Download History Page
// Developed for 2TECH MN (Nguyễn Minh Nhựt) — Real-time server authoritative history
import { element, playSound, showToast } from '../dom.mjs';
import { getSessionHistory, clearSessionHistory } from '../media-downloader.mjs';

export function createHistoryPage({ state, api } = {}) {
  let container = null;
  let historyList = [];

  function mergeSessionWithServer(serverItems = []) {
    const sessionItems = getSessionHistory();
    return [...sessionItems, ...serverItems];
  }

  async function fetchRealHistory(outlet) {
    historyList = mergeSessionWithServer([]);
    if (container) render(outlet);

    if (!api?.getJobs) return;
    try {
      const res = await api.getJobs();
      if (res?.ok && Array.isArray(res.jobs)) {
        const mapped = res.jobs.map(j => ({
          ts: new Date(j.created_at).toLocaleTimeString('vi-VN') + ' ' + new Date(j.created_at).toLocaleDateString('vi-VN'),
          platform: j.platform || 'Video',
          name: j.title || j.url,
          res: `${j.quality}p 60FPS`,
          status: j.status === 'completed' ? 'Hoàn tất' : j.status === 'error' ? 'Lỗi' : 'Đang xử lý'
        }));
        historyList = mergeSessionWithServer(mapped);
        if (container) render(outlet);
      }
    } catch (_) {}
  }

  function render(outlet) {
    outlet.innerHTML = '';
    container = element('div', { class: 'history-container max-w-5xl mx-auto p-4 sm:p-6 flex flex-col gap-6' });

    // Header
    const header = element('div', { class: 'flex flex-wrap items-center justify-between gap-4' }, [
      element('div', {}, [
        element('div', { class: 'flex items-center gap-3' }, [
          element('h1', { class: 'text-2xl font-bold text-white' }, ['Lịch sử tải']),
          element('span', { class: `badge ${historyList.length > 0 ? 'badge-info' : 'badge-neutral'}` }, [
            `${historyList.length} bản ghi`
          ])
        ]),
        element('p', { class: 'text-sm text-slate-400 mt-1' }, [
          'Nhật ký các tác vụ bóc tách video và tải về được lưu trữ và cập nhật theo thời gian thực.'
        ])
      ]),
      element('div', { class: 'flex items-center gap-2' }, [
        element('button', {
          type: 'button',
          class: 'btn btn-secondary btn-sm',
          onClick: async () => {
            playSound('click');
            await fetchRealHistory(outlet);
            showToast({
              type: 'info',
              title: 'Đồng bộ lịch sử',
              message: `Đã làm mới dữ liệu lịch sử (${historyList.length} bản ghi).`
            });
            render(outlet);
          }
        }, ['🔄 Làm mới']),
        element('button', {
          type: 'button',
          class: 'btn btn-ghost btn-sm text-red-400',
          onClick: () => {
            playSound('click');
            clearSessionHistory();
            historyList = [];
            showToast({
              type: 'info',
              title: 'Dọn sạch',
              message: 'Đã xóa trắng danh sách lịch sử hiển thị.'
            });
            render(outlet);
          }
        }, ['🗑 Xóa hiển thị'])
      ])
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
        element('td', { colspan: '5', class: 'p-12 text-center text-slate-400' }, [
          element('div', { style: 'font-size: 32px; margin-bottom: 6px;' }, ['📋']),
          element('div', { class: 'text-sm font-semibold text-slate-300' }, ['Chưa có lịch sử tải video nào']),
          element('div', { class: 'text-xs text-slate-500 mt-1' }, ['Các tác vụ bóc tách mới sẽ tự động ghi lại tại đây theo thời gian thực.'])
        ])
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
            element('span', { class: `badge ${item.status === 'Hoàn tất' ? 'badge-success' : item.status === 'Lỗi' ? 'badge-danger' : 'badge-info'} text-[10px]` }, [item.status])
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
      fetchRealHistory(outlet);
    },
    unmount() {
      if (container) {
        container.remove();
        container = null;
      }
    }
  };
}
