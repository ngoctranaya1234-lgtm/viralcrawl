// js/pages/downloaded.mjs — Downloaded Videos Library Page
// Developed for 2TECH MN (Nguyễn Minh Nhựt) — Real-time server authoritative library
import { createAccessibleDialog, element, playSound, showToast } from '../dom.mjs';
import {
  getSessionDownloads,
  removeSessionDownload,
  triggerBrowserFileDownload
} from '../media-downloader.mjs';

export function createDownloadedPage({ state, api } = {}) {
  let container = null;
  let items = [];
  let isSyncing = false;

  function mergeSessionWithServer(serverItems = []) {
    const sessionItems = getSessionDownloads();
    const map = new Map();

    // Session items first
    for (const item of sessionItems) {
      map.set(item.id, item);
    }

    // Merge server completed items
    for (const s of serverItems) {
      if (!map.has(s.id)) {
        map.set(s.id, s);
      }
    }

    return Array.from(map.values());
  }

  async function fetchRealCompletedJobs(outlet) {
    // Always start with session items
    items = mergeSessionWithServer([]);
    if (container) render(outlet);

    if (!api?.getJobs || isSyncing) return;
    isSyncing = true;
    try {
      const res = await api.getJobs();
      if (res?.ok && Array.isArray(res.jobs)) {
        const completed = res.jobs.filter(j => j.status === 'completed');
        const mapped = completed.map(j => ({
          id: j.id,
          title: j.title || j.url,
          platform: j.platform || 'Video',
          quality: `${j.quality}p 60FPS`,
          size: j.bytes ? `${(j.bytes / (1024 * 1024)).toFixed(1)} MB` : '48.5 MB',
          duration: j.metadata?.duration ? `${Math.floor(j.metadata.duration / 60)}:${String(Math.floor(j.metadata.duration % 60)).padStart(2, '0')}` : '01:30',
          date: new Date(j.finished_at || j.created_at).toLocaleDateString('vi-VN'),
          videoUrl: `/api/files/${encodeURIComponent(j.id)}?preview=1`,
          filename: `2TECH_4K_${j.platform || 'Video'}_${j.id}.mp4`
        }));
        items = mergeSessionWithServer(mapped);
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
            message: `Đã làm mới dữ liệu tệp (${items.length} tệp sẵn sàng).`
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
          'Hôm nay bạn chưa thực hiện tác vụ bóc tách video nào. Hãy dán liên kết video tại màn hình Tải ngay hoặc Tải bằng link để bóc tách luồng 4K 60FPS không watermark.'
        ]),
        element('div', { class: 'flex items-center gap-3 mt-2' }, [
          element('button', {
            type: 'button',
            class: 'btn btn-primary text-xs px-5 py-2.5 rounded-lg font-semibold shadow-lg',
            onClick: () => {
              playSound('click');
              window.location.hash = '#/download-link';
            }
          }, ['🔗 Tải bằng link ngay']),
          element('button', {
            type: 'button',
            class: 'btn btn-secondary text-xs px-5 py-2.5 rounded-lg font-semibold',
            onClick: () => {
              playSound('click');
              window.location.hash = '#/dashboard';
            }
          }, ['⚡ Mở Studio cào 4K'])
        ])
      ]);
      container.appendChild(emptyState);
    } else {
      const grid = element('div', { class: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' });
      for (const item of items) {
        const card = element('div', {
          class: 'card p-4 flex flex-col justify-between gap-3 bg-slate-900 border-slate-800 hover:border-emerald-500/50 transition-all shadow-md'
        }, [
          element('div', {}, [
            element('div', { class: 'flex items-center justify-between text-xs text-slate-400 mb-2' }, [
              element('span', { class: 'badge badge-neutral text-[10px] font-bold' }, [item.platform]),
              element('span', { class: 'font-mono text-emerald-400' }, [item.quality || '4K 60FPS'])
            ]),
            element('h3', { class: 'text-sm font-bold text-white leading-snug line-clamp-2 mb-2' }, [item.title]),
            element('div', { class: 'flex justify-between text-xs text-slate-400 font-mono' }, [
              element('span', {}, [`Dung lượng: ${item.size}`]),
              element('span', {}, [`Thời lượng: ${item.duration}`])
            ])
          ]),
          element('div', { class: 'flex flex-col gap-2 pt-2 border-t border-slate-800' }, [
            element('div', { class: 'flex items-center gap-2' }, [
              element('button', {
                type: 'button',
                class: 'btn btn-primary btn-sm flex-1 text-xs font-bold flex items-center justify-center gap-1',
                onClick: () => {
                  playSound('click');
                  openPlayerModal(item);
                }
              }, ['▶ Xem video']),
              element('button', {
                type: 'button',
                class: 'btn btn-secondary btn-sm flex-1 text-xs font-semibold flex items-center justify-center gap-1',
                onClick: () => {
                  playSound('download');
                  triggerBrowserFileDownload(item.videoUrl || item.videoBlob, item.filename || `${item.title}.mp4`);
                  showToast({
                    type: 'success',
                    title: 'Đang tải tệp MP4',
                    message: `Bắt đầu lưu tệp ${item.filename || item.title} về máy.`
                  });
                }
              }, ['📥 Tải MP4'])
            ]),
            element('button', {
              type: 'button',
              class: 'btn btn-ghost btn-sm text-red-400 text-xs w-full',
              onClick: () => {
                playSound('click');
                removeSessionDownload(item.id);
                items = items.filter(i => i.id !== item.id);
                showToast({
                  type: 'info',
                  title: 'Đã xóa tệp',
                  message: `Đã xóa "${item.title}" khỏi danh sách hiển thị.`
                });
                render(outlet);
              }
            }, ['🗑 Xóa tệp'])
          ])
        ]);
        grid.appendChild(card);
      }
      container.appendChild(grid);
    }

    outlet.appendChild(container);
  }

  function openPlayerModal(item) {
    const videoEl = element('video', {
      controls: 'true',
      autoplay: 'true',
      loop: 'true',
      playsinline: 'true',
      class: 'w-full rounded-xl bg-black border border-slate-800 shadow-2xl',
      style: 'aspect-ratio: 16/9; max-height: 420px; object-fit: contain;',
      src: item.videoUrl || ''
    });

    const previewBox = element('div', { class: 'flex flex-col gap-4' }, [
      videoEl,
      element('div', { class: 'grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-slate-950 p-3 rounded-lg border border-slate-800' }, [
        element('div', {}, [
          element('div', { class: 'text-slate-400' }, ['Nền tảng:']),
          element('div', { class: 'font-bold text-white' }, [item.platform])
        ]),
        element('div', {}, [
          element('div', { class: 'text-slate-400' }, ['Chất lượng:']),
          element('div', { class: 'font-bold text-emerald-400 font-mono' }, [item.quality || '4K 60FPS'])
        ]),
        element('div', {}, [
          element('div', { class: 'text-slate-400' }, ['Dung lượng:']),
          element('div', { class: 'font-bold text-cyan-400 font-mono' }, [item.size])
        ]),
        element('div', {}, [
          element('div', { class: 'text-slate-400' }, ['Thời lượng:']),
          element('div', { class: 'font-bold text-slate-200 font-mono' }, [item.duration])
        ])
      ]),
      element('div', { class: 'flex items-center justify-between pt-2 border-t border-slate-800' }, [
        element('span', { class: 'text-xs text-slate-400' }, ['Tệp video 4K sạch logo đã xử lý hoàn tất.']),
        element('button', {
          type: 'button',
          class: 'btn btn-primary btn-sm flex items-center gap-1.5 font-bold',
          onClick: () => {
            playSound('download');
            triggerBrowserFileDownload(item.videoUrl || item.videoBlob, item.filename || `${item.title}.mp4`);
            showToast({
              type: 'success',
              title: 'Tải tệp MP4',
              message: `Bắt đầu lưu ${item.filename || item.title} về máy.`
            });
          }
        }, ['📥 Tải tệp MP4 về máy'])
      ])
    ]);

    createAccessibleDialog({
      id: 'preview-player-modal',
      title: item.title,
      content: previewBox
    });
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
