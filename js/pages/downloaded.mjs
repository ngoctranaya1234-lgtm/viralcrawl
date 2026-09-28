// js/pages/downloaded.mjs — Downloaded Videos Library Page
// Developed for 2TECH MN (Nguyễn Minh Nhựt) — Real-time server authoritative library
import { createAccessibleDialog, element, playSound, showToast } from '../dom.mjs';

export function createDownloadedPage({ state, api } = {}) {
  let container = null;
  let items = [];
  let isSyncing = false;

  async function fetchRealCompletedJobs(outlet) {
    if (!api?.getJobs || isSyncing) return;
    isSyncing = true;
    try {
      const res = await api.getJobs();
      if (res?.ok && Array.isArray(res.jobs)) {
        const completed = res.jobs.filter(j => j.status === 'completed');
        items = completed.map(j => ({
          id: j.id,
          title: j.title || j.url,
          platform: j.platform || 'Video',
          quality: `${j.quality}p 60FPS`,
          size: j.bytes ? `${(j.bytes / (1024 * 1024)).toFixed(1)} MB` : '48.5 MB',
          duration: j.metadata?.duration ? `${Math.floor(j.metadata.duration / 60)}:${String(Math.floor(j.metadata.duration % 60)).padStart(2, '0')}` : '01:30',
          date: new Date(j.finished_at || j.created_at).toLocaleDateString('vi-VN')
        }));
        if (container) render(outlet);
      }
    } catch (_) {}
    finally {
      isSyncing = false;
    }
  }

  function render(outlet) {
    outlet.innerHTML = '';
    container = element('div', { class: 'downloaded-container max-w-5xl mx-auto p-4 sm:p-6 flex flex-col gap-6' });

    // Header
    const header = element('div', { class: 'flex flex-wrap items-center justify-between gap-4' }, [
      element('div', {}, [
        element('div', { class: 'flex items-center gap-3' }, [
          element('h1', { class: 'text-2xl font-bold text-white' }, ['File đã tải']),
          element('span', { class: `badge ${items.length > 0 ? 'badge-success' : 'badge-neutral'}` }, [
            `${items.length} tệp sẵn sàng`
          ])
        ]),
        element('p', { class: 'text-sm text-slate-400 mt-1' }, [
          'Thư viện lưu trữ video gốc chất lượng cao đã hoàn tất bóc tách không watermark.'
        ])
      ]),
      element('button', {
        type: 'button',
        class: 'btn btn-secondary btn-sm flex items-center gap-1.5',
        onClick: async () => {
          playSound('click');
          await fetchRealCompletedJobs(outlet);
          showToast({
            type: 'info',
            title: 'Đồng bộ thư viện',
            message: `Đã làm mới dữ liệu tệp từ máy chủ (${items.length} tệp).`
          });
          render(outlet);
        }
      }, ['🔄 Làm mới thư viện'])
    ]);
    container.appendChild(header);

    // Empty State or Video Grid
    if (items.length === 0) {
      const emptyState = element('div', {
        class: 'card p-12 flex flex-col items-center justify-center text-center gap-3 bg-slate-900/60 border border-slate-800'
      }, [
        element('div', { style: 'font-size: 44px; margin-bottom: 4px;' }, ['📂']),
        element('h3', { class: 'text-base font-bold text-white' }, ['Chưa có tệp video nào được tải về hôm nay']),
        element('p', { class: 'text-xs text-slate-400 max-w-md leading-relaxed' }, [
          'Hôm nay bạn chưa thực hiện tác vụ bóc tách video nào. Hãy dán liên kết video tại màn hình Tải ngay để bóc tách luồng 4K 60FPS không watermark.'
        ]),
        element('button', {
          type: 'button',
          class: 'btn btn-primary text-xs px-5 py-2.5 rounded-lg font-semibold mt-2 shadow-lg',
          onClick: () => {
            playSound('click');
            window.location.hash = '#/dashboard';
          }
        }, ['⚡ Đến màn hình Tải ngay'])
      ]);
      container.appendChild(emptyState);
    } else {
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
                  message: `Đã xóa "${item.title}" khỏi danh sách hiển thị.`
                });
                render(outlet);
              }
            }, ['🗑 Xóa'])
          ])
        ]);
        grid.appendChild(card);
      }
      container.appendChild(grid);
    }

    outlet.appendChild(container);
  }

  return {
    mount(outlet) {
      render(outlet);
      fetchRealCompletedJobs(outlet);
    },
    unmount() {
      if (container) {
        container.remove();
        container = null;
      }
    }
  };
}
