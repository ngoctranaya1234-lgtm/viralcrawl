// js/pages/downloaded.mjs — Downloaded Videos Library Page
// Developed for 2TECH MN (Nguyễn Minh Nhựt)
import { element } from '../dom.mjs';

const DEMO_ITEMS = [
  { id: 'v1', title: 'Top 10 Thước Phim Động Vật Hoang Dã 4K 60FPS', platform: 'YouTube', quality: '4K 60FPS', size: '142.5 MB', duration: '03:45', date: '28/09/2026' },
  { id: 'v2', title: 'Douyin Hot Trend Nấu Ăn Sinh Tồn Không Logo', platform: 'Douyin', quality: '1080p 60FPS', size: '54.2 MB', duration: '01:20', date: '28/09/2026' },
  { id: 'v3', title: 'TikTok Travel Cinematic Video Trích Xuất Gốc', platform: 'TikTok', quality: '4K Ultra HD', size: '98.0 MB', duration: '02:15', date: '28/09/2026' }
];

export function createDownloadedPage({ state, api } = {}) {
  let container = null;
  let items = [...DEMO_ITEMS];

  function render(outlet) {
    outlet.innerHTML = '';
    container = element('div', { class: 'downloaded-container max-w-5xl mx-auto p-4 sm:p-6 flex flex-col gap-6' });

    // Header
    const header = element('div', { class: 'flex flex-wrap items-center justify-between gap-4' }, [
      element('div', {}, [
        element('div', { class: 'flex items-center gap-3' }, [
          element('h1', { class: 'text-2xl font-bold text-white' }, ['File đã tải']),
          element('span', { class: 'badge badge-success' }, [`${items.length} tệp sẵn sàng`])
        ]),
        element('p', { class: 'text-sm text-slate-400 mt-1' }, [
          'Thư viện lưu trữ video gốc chất lượng cao đã hoàn tất bóc tách không watermark.'
        ])
      ]),
      element('button', {
        type: 'button',
        class: 'btn btn-secondary btn-sm',
        onClick: () => {
          alert('Đã đồng bộ lại thư mục lưu trữ video cục bộ.');
        }
      }, ['🔄 Làm mới thư viện'])
    ]);
    container.appendChild(header);

    // Video Grid
    const grid = element('div', { class: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' });
    for (const item of items) {
      const card = element('div', {
        class: 'card p-4 flex flex-col justify-between gap-3 bg-slate-900 border-slate-800 hover:border-emerald-500/50 transition-all'
      }, [
        element('div', {}, [
          element('div', { class: 'flex items-center justify-between text-xs text-slate-400 mb-2' }, [
            element('span', { class: 'badge badge-neutral text-[10px]' }, [item.platform]),
            element('span', { class: 'font-mono text-emerald-400' }, [item.quality])
          ]),
          element('h3', { class: 'text-sm font-bold text-white leading-snug line-clamp-2 mb-2' }, [item.title]),
          element('div', { class: 'flex justify-between text-xs text-slate-400 font-mono' }, [
            element('span', {}, [`Dung lượng: ${item.size}`]),
            element('span', {}, [`Thời lượng: ${item.duration}`])
          ])
        ]),
        element('div', { class: 'flex items-center gap-2 pt-2 border-t border-slate-800' }, [
          element('button', {
            type: 'button',
            class: 'btn btn-secondary btn-sm flex-1 text-xs',
            onClick: () => alert(`Đang mở xem video: ${item.title}`)
          }, ['▶️ Xem video']),
          element('button', {
            type: 'button',
            class: 'btn btn-ghost btn-sm text-red-400 text-xs',
            onClick: () => {
              items = items.filter(i => i.id !== item.id);
              render(outlet);
            }
          }, ['🗑 Xóa'])
        ])
      ]);
      grid.appendChild(card);
    }
    container.appendChild(grid);

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
