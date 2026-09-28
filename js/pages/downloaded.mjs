// js/pages/downloaded.mjs — Downloaded Videos Library Page
// Developed for 2TECH MN (Nguyễn Minh Nhựt)
import { createAccessibleDialog, element, playSound, showToast } from '../dom.mjs';

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
          playSound('click');
          showToast({
            type: 'info',
            title: 'Đồng bộ thư viện',
            message: 'Đã làm mới danh mục tệp video đã tải.'
          });
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
            onClick: () => {
              playSound('click');
              const previewBox = element('div', { class: 'flex flex-col gap-3' }, [
                element('div', {
                  class: 'w-full rounded-xl bg-black border border-slate-800 flex flex-col items-center justify-center p-8 text-center',
                  style: 'aspect-ratio: 16/9;'
                }, [
                  element('div', {
                    style: 'width: 48px; height: 48px; border-radius: 50%; background: rgba(16, 185, 129, 0.2); border: 2px solid #10b981; display: flex; align-items: center; justify-content: center; font-size: 20px; color: #10b981; margin-bottom: 8px;'
                  }, ['▶']),
                  element('div', { class: 'text-xs font-bold text-white' }, [item.title]),
                  element('div', { class: 'text-[11px] text-emerald-400 font-mono mt-1' }, [`${item.quality} • ${item.duration}`])
                ]),
                element('div', { class: 'flex justify-between items-center text-xs text-slate-400' }, [
                  element('span', {}, [`Nền tảng: ${item.platform}`]),
                  element('span', {}, [`Dung lượng: ${item.size}`])
                ])
              ]);
              createAccessibleDialog({
                id: 'preview-player-modal',
                title: 'Xem video',
                content: previewBox
              });
            }
          }, ['▶️ Xem video']),
          element('button', {
            type: 'button',
            class: 'btn btn-ghost btn-sm text-red-400 text-xs',
            onClick: () => {
              playSound('click');
              items = items.filter(i => i.id !== item.id);
              showToast({
                type: 'info',
                title: 'Đã xóa tệp',
                message: `Đã xóa "${item.title}" khỏi thư viện.`
              });
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
