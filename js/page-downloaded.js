/* ═══════════════════════════════════════════════════════════════
   Mnhut 2tech Al — Page: File đã tải (Thư viện video gốc)
   Bản quyền: 2TECH MN — NGUYỄN MINH NHỰT
   ═══════════════════════════════════════════════════════════════ */

window.Pages = window.Pages || {};
window.Pages['downloaded'] = {
  selectedIds: new Set(),
  viewMode: localStorage.getItem('vc_lib_view') || 'grid',

  calculateTotalSize(videos) {
    if (!videos || !videos.length) return '0 MB';
    let totalBytes = 0;
    let hasParsed = false;
    videos.forEach(v => {
      if (typeof v.size === 'number') {
        totalBytes += v.size;
        hasParsed = true;
      } else if (typeof v.size === 'string') {
        const match = v.size.match(/([\d.]+)\s*(GB|MB|KB|B)/i);
        if (match) {
          const val = parseFloat(match[1]);
          const unit = match[2].toUpperCase();
          if (unit === 'GB') totalBytes += val * 1024 * 1024 * 1024;
          else if (unit === 'MB') totalBytes += val * 1024 * 1024;
          else if (unit === 'KB') totalBytes += val * 1024;
          else totalBytes += val;
          hasParsed = true;
        }
      }
    });

    if (hasParsed && totalBytes > 0) {
      if (typeof App !== 'undefined' && typeof App.formatSize === 'function') {
        return App.formatSize(totalBytes);
      }
      const mb = totalBytes / (1024 * 1024);
      if (mb >= 1024) return (mb / 1024).toFixed(2) + ' GB';
      return mb.toFixed(1) + ' MB';
    }
    return '0 MB';
  },

  renderThumbnail(v, isList = false) {
    const heightClass = isList ? 'w-24 h-16 sm:w-32 sm:h-20 flex-shrink-0' : 'h-36 w-full';
    const hasImage = v.thumb && (v.thumb.startsWith('http') || v.thumb.startsWith('data:') || v.thumb.startsWith('blob:') || v.thumb.startsWith('/'));
    const bgStyle = hasImage ? '' : (v.thumb ? `background:${v.thumb}22;` : 'background:rgba(255,255,255,0.03);');

    return `
      <div class="video-thumb relative ${heightClass} rounded-lg bg-gray-900 flex items-center justify-center overflow-hidden border border-gray-800 cursor-pointer" onclick="Pages.downloaded.previewVideo('${v.id}')" style="${bgStyle}">
        ${hasImage ? `<img src="${v.thumb}" alt="${v.title || ''}" class="w-full h-full object-cover">` : ''}
        <span class="badge badge-neutral absolute top-2 right-2 text-xs" style="font-size:10px;">${v.platform || 'Video'}</span>
        <span class="badge badge-neutral absolute bottom-2 right-2 text-xs font-mono" style="font-size:10px;">${v.duration || '--:--'}</span>
        <div class="play-btn-overlay absolute inset-0 flex items-center justify-center bg-black/30 opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all text-2xl text-white">▶</div>
      </div>
    `;
  },

  renderCard(v, isList = false) {
    if (isList) {
      return `
        <div class="video-card card p-3 flex flex-wrap sm:flex-nowrap items-center justify-between gap-4 relative group hover:border-accent transition-all" data-id="${v.id}" data-plat="${v.platform || ''}">
          <div class="flex items-center gap-3 min-w-0 flex-1">
            <div class="flex-shrink-0">
              <input type="checkbox" class="checkbox lib-item-check" data-id="${v.id}" ${this.selectedIds.has(String(v.id)) ? 'checked' : ''}>
            </div>
            ${this.renderThumbnail(v, true)}
            <div class="min-w-0 flex-1">
              <div class="text-sm fw-600 text-white truncate cursor-pointer hover:text-accent" onclick="Pages.downloaded.previewVideo('${v.id}')" title="${v.title || ''}">${v.title || 'Video'}</div>
              <div class="flex flex-wrap items-center gap-2 text-xs text-muted mt-1.5" style="font-size:11px;">
                <span class="badge badge-neutral text-xs py-0.5 px-2">${v.platform || 'N/A'}</span>
                <span class="font-mono text-white">${v.size || 'N/A'}</span>
                <span>•</span>
                <span class="text-accent">${v.author || 'Ẩn danh'}</span>
                ${v.duration ? `<span>•</span><span class="font-mono">${v.duration}</span>` : ''}
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2 flex-shrink-0">
            <button class="btn btn-secondary btn-sm text-xs flex items-center gap-1.5" onclick="event.stopPropagation(); Pages.downloaded.openFile('${v.id}')" title="Mở tệp video">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
              Mở file
            </button>
            <button class="btn btn-ghost btn-sm text-danger hover:bg-danger/10 text-xs flex items-center gap-1.5" onclick="event.stopPropagation(); Pages.downloaded.deleteVideo('${v.id}')" title="Xóa video khỏi thư viện">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              Xóa
            </button>
          </div>
        </div>
      `;
    }

    return `
      <div class="video-card card p-3 flex flex-col justify-between relative group hover:border-accent transition-all" data-id="${v.id}" data-plat="${v.platform || ''}">
        <!-- Checkbox selection top-left -->
        <div class="absolute top-4 left-4 z-20">
          <input type="checkbox" class="checkbox lib-item-check" data-id="${v.id}" ${this.selectedIds.has(String(v.id)) ? 'checked' : ''}>
        </div>

        <!-- Thumbnail & Play icon -->
        ${this.renderThumbnail(v, false)}

        <!-- Metadata -->
        <div class="mt-3 flex-1 flex flex-col justify-between">
          <div class="text-xs fw-600 text-white line-clamp-2 cursor-pointer hover:text-accent" onclick="Pages.downloaded.previewVideo('${v.id}')" title="${v.title || ''}">${v.title || 'Video'}</div>
          <div class="flex items-center justify-between text-xs text-muted mt-2 pt-2 border-t border-gray-800" style="font-size:11px;">
            <span class="font-mono text-white">${v.size || 'N/A'}</span>
            <span class="text-accent truncate ml-2" style="max-width:110px;">${v.author || 'Ẩn danh'}</span>
          </div>
        </div>

        <!-- Quick action buttons -->
        <div class="flex gap-2 mt-3 pt-2 border-t border-gray-800">
          <button class="btn btn-secondary btn-sm flex-1 text-xs flex items-center justify-center gap-1.5" onclick="event.stopPropagation(); Pages.downloaded.openFile('${v.id}')" title="Mở tệp video">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
            Mở file
          </button>
          <button class="btn btn-ghost btn-sm text-danger hover:bg-danger/10 text-xs flex items-center justify-center gap-1.5" onclick="event.stopPropagation(); Pages.downloaded.deleteVideo('${v.id}')" title="Xóa video khỏi thư viện">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            Xóa
          </button>
        </div>
      </div>
    `;
  },

  renderCardsHtml() {
    const videos = (App.store && Array.isArray(App.store.downloadedVideos)) ? App.store.downloadedVideos : [];
    const isList = this.viewMode === 'list';
    const containerClasses = isList 
      ? 'flex flex-col gap-3' 
      : 'video-grid grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4';

    return `
      <div class="${containerClasses}" id="libGridContainer">
        ${videos.map(v => this.renderCard(v, isList)).join('')}
      </div>
      <div id="libNoResults" class="card p-8 text-center" style="display:none;">
        <div class="text-3xl mb-2 opacity-50">🔍</div>
        <div class="text-sm fw-600 text-white">Không tìm thấy video nào</div>
        <div class="text-xs text-muted mt-1">Hãy thử tìm với từ khóa hoặc nền tảng khác</div>
      </div>
    `;
  },

  render() {
    const videos = (App.store && Array.isArray(App.store.downloadedVideos)) ? App.store.downloadedVideos : [];
    const totalSize = this.calculateTotalSize(videos);

    if (videos.length === 0) {
      return `
        <div class="flex flex-col gap-6">
          <!-- Header -->
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div class="flex items-center gap-3">
                <h1 class="text-2xl fw-700">File đã tải (Thư viện Video Gốc)</h1>
                <span class="badge badge-accent font-mono text-xs" id="libBadgeCount">0 video • 0 MB</span>
              </div>
              <p class="text-xs text-muted mt-1">Toàn bộ video gốc chất lượng cao đã tải về máy, sẵn sàng lưu trữ và sử dụng</p>
            </div>
          </div>

          <!-- Empty State -->
          <div class="empty-state card p-12">
            <div class="empty-icon">📁</div>
            <div class="empty-title text-lg text-white">Chưa có video nào</div>
            <div class="empty-desc text-sm text-muted">
              Thư viện video tải về hiện đang trống. Hãy bắt đầu tải video chất lượng cao không watermark từ các nền tảng xã hội ngay!
            </div>
            <button class="btn btn-gradient px-6 py-2.5 flex items-center gap-2" onclick="App.navigate('dashboard')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Tải video ngay
            </button>
          </div>
        </div>
      `;
    }

    return `
      <div class="flex flex-col gap-6">
        <!-- Header & Filter Bar -->
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-3">
              <h1 class="text-2xl fw-700">File đã tải (Thư viện Video Gốc)</h1>
              <span class="badge badge-accent font-mono text-xs" id="libBadgeCount">${videos.length} video • ${totalSize}</span>
            </div>
            <p class="text-xs text-muted mt-1">Toàn bộ video gốc chất lượng cao đã tải về máy, sẵn sàng lưu trữ và sử dụng</p>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <select class="form-select text-xs w-36" id="libFilterPlat">
              <option value="all">Tất cả nền tảng</option>
              <option value="Douyin">Douyin</option>
              <option value="TikTok">TikTok</option>
              <option value="YouTube">YouTube</option>
              <option value="Xiaohongshu">Xiaohongshu</option>
              <option value="Kuaishou">Kuaishou</option>
              <option value="Bilibili">Bilibili</option>
              <option value="Facebook">Facebook</option>
              <option value="Instagram">Instagram</option>
              <option value="Honggo">Honggo</option>
            </select>

            <input type="text" class="form-input text-xs w-56" placeholder="Tìm kiếm theo tên video..." id="libSearchInput">

            <div class="flex bg-surface rounded-lg p-1 border border-gray-800">
              <button class="btn btn-sm btn-ghost ${this.viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-muted'}" id="btnViewGrid" title="Xem dạng lưới">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              </button>
              <button class="btn btn-sm btn-ghost ${this.viewMode === 'list' ? 'bg-white/10 text-white' : 'text-muted'}" id="btnViewList" title="Xem danh sách">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Video Cards Container -->
        <div id="libContainerWrapper">
          ${this.renderCardsHtml()}
        </div>

        <!-- Sticky Bottom Multi-Select Action Bar -->
        <div class="card p-4 flex flex-wrap items-center justify-between gap-4 sticky bottom-4 z-40 bg-surface/95 backdrop-blur border border-accent/40 shadow-2xl">
          <label class="flex items-center gap-2 cursor-pointer text-sm">
            <input type="checkbox" class="checkbox" id="libCheckAll">
            <span class="fw-600">Chọn tất cả (<span id="libSelectedCount">0</span> đã chọn)</span>
          </label>

          <div class="flex items-center gap-3">
            <button class="btn btn-danger btn-sm flex items-center gap-2" id="btnDeleteSelected">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
              Xóa đã chọn
            </button>
          </div>
        </div>
      </div>
    `;
  },

  init() {
    const videos = (App.store && Array.isArray(App.store.downloadedVideos)) ? App.store.downloadedVideos : [];
    if (videos.length === 0) {
      this.selectedIds.clear();
      return;
    }

    this.selectedIds.clear();
    this.bindFilters();
    this.bindCheckboxes();
    this.bindBottomActions();
    this.bindViewToggle();
  },

  setViewMode(mode) {
    this.viewMode = mode;
    localStorage.setItem('vc_lib_view', mode);
    const container = document.getElementById('libContainerWrapper');
    if (container) {
      container.innerHTML = this.renderCardsHtml();
      this.bindCheckboxes();
      this.applyFilters();
    }
    const btnGrid = document.getElementById('btnViewGrid');
    const btnList = document.getElementById('btnViewList');
    if (btnGrid) {
      btnGrid.className = `btn btn-sm btn-ghost ${mode === 'grid' ? 'bg-white/10 text-white' : 'text-muted'}`;
    }
    if (btnList) {
      btnList.className = `btn btn-sm btn-ghost ${mode === 'list' ? 'bg-white/10 text-white' : 'text-muted'}`;
    }
  },

  bindViewToggle() {
    document.getElementById('btnViewGrid')?.addEventListener('click', () => {
      this.setViewMode('grid');
    });

    document.getElementById('btnViewList')?.addEventListener('click', () => {
      this.setViewMode('list');
    });
  },

  applyFilters() {
    const platSelect = document.getElementById('libFilterPlat');
    const searchInput = document.getElementById('libSearchInput');
    const noResultEl = document.getElementById('libNoResults');

    const plat = platSelect ? platSelect.value : 'all';
    const term = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const cards = document.querySelectorAll('.video-card[data-id]');

    let visibleCount = 0;
    cards.forEach(card => {
      const cPlat = card.dataset.plat || '';
      const text = card.innerText.toLowerCase();
      const matchPlat = (plat === 'all' || cPlat.toLowerCase() === plat.toLowerCase());
      const matchSearch = (!term || text.includes(term));
      const isVisible = matchPlat && matchSearch;
      card.style.display = isVisible ? 'flex' : 'none';
      if (isVisible) visibleCount++;
    });

    if (noResultEl) {
      noResultEl.style.display = (visibleCount === 0 && cards.length > 0) ? 'block' : 'none';
    }
  },

  bindFilters() {
    const platSelect = document.getElementById('libFilterPlat');
    const searchInput = document.getElementById('libSearchInput');

    platSelect?.addEventListener('change', () => this.applyFilters());
    searchInput?.addEventListener('input', () => this.applyFilters());
  },

  bindCheckboxes() {
    const checkAll = document.getElementById('libCheckAll');
    const itemChecks = document.querySelectorAll('.lib-item-check');
    const countEl = document.getElementById('libSelectedCount');

    const updateCheckState = () => {
      if (countEl) countEl.textContent = this.selectedIds.size;
      if (checkAll) {
        const visibleChecks = Array.from(document.querySelectorAll('.lib-item-check')).filter(c => {
          const card = c.closest('.video-card');
          return card && card.style.display !== 'none';
        });
        checkAll.checked = visibleChecks.length > 0 && visibleChecks.every(c => this.selectedIds.has(String(c.dataset.id)));
      }
    };

    checkAll?.addEventListener('change', () => {
      const visibleChecks = Array.from(document.querySelectorAll('.lib-item-check')).filter(c => {
        const card = c.closest('.video-card');
        return card && card.style.display !== 'none';
      });
      visibleChecks.forEach(c => {
        c.checked = checkAll.checked;
        const id = String(c.dataset.id);
        if (checkAll.checked) this.selectedIds.add(id);
        else this.selectedIds.delete(id);
      });
      updateCheckState();
    });

    itemChecks.forEach(c => {
      c.addEventListener('change', () => {
        const id = String(c.dataset.id);
        if (c.checked) this.selectedIds.add(id);
        else this.selectedIds.delete(id);
        updateCheckState();
      });
    });

    updateCheckState();
  },

  bindBottomActions() {
    document.getElementById('btnDeleteSelected')?.addEventListener('click', () => {
      this.deleteSelected();
    });
  },

  deleteVideo(id) {
    const v = (App.store && Array.isArray(App.store.downloadedVideos)) 
      ? App.store.downloadedVideos.find(x => String(x.id) === String(id)) 
      : null;
    const title = v ? `"${v.title}"` : 'video này';

    if (confirm(`Bạn có chắc chắn muốn xóa ${title} khỏi thư viện?`)) {
      App.store.downloadedVideos = (App.store.downloadedVideos || []).filter(x => String(x.id) !== String(id));
      this.selectedIds.delete(String(id));
      App.saveStore();
      App.updateUI();
      App.closeModal();
      App.playSound('click');
      App.notify('info', 'Đã xóa video', `Đã xóa ${title} khỏi thư viện.`);
      App.navigate('downloaded');
    }
  },

  deleteSelected() {
    if (this.selectedIds.size === 0) {
      App.notify('warning', 'Chưa chọn video', 'Vui lòng tích chọn ít nhất 1 video để xóa.');
      return;
    }

    const count = this.selectedIds.size;
    if (confirm(`Bạn có chắc chắn muốn xóa ${count} video đã chọn khỏi thư viện?`)) {
      App.store.downloadedVideos = (App.store.downloadedVideos || []).filter(v => !this.selectedIds.has(String(v.id)));
      this.selectedIds.clear();
      App.saveStore();
      App.updateUI();
      App.playSound('click');
      App.notify('info', 'Đã xóa video', `Đã xóa thành công ${count} video khỏi thư viện.`);
      App.navigate('downloaded');
    }
  },

  openFile(id) {
    const v = (App.store && Array.isArray(App.store.downloadedVideos)) 
      ? App.store.downloadedVideos.find(x => String(x.id) === String(id)) 
      : null;

    if (!v) {
      App.notify('warning', 'Không tìm thấy', 'Không tìm thấy thông tin video này.');
      return;
    }

    const defaultDir = (App.store.settings && App.store.settings.downloadPath) || 'D:\\Videos\\Mnhut_2tech_Al\\Downloaded\\';
    const sanitize = (name) => (name || 'video').replace(/[\\/:*?"<>|]/g, '_');
    const filePath = v.filePath || v.path || (defaultDir + (v.fileName || sanitize(v.title) + '.mp4'));

    // 1. Electron or Node integration check
    if (window.electron && window.electron.shell && typeof window.electron.shell.openPath === 'function') {
      window.electron.shell.openPath(filePath);
      App.notify('success', 'Đang mở tệp', filePath);
      return;
    }

    // 2. Direct Video Download trigger
    const dlTarget = v.downloadUrl || v.url;
    if (dlTarget && (dlTarget.startsWith('http') || dlTarget.startsWith('blob:') || dlTarget.startsWith('data:'))) {
      if (window.VideoResolver && typeof window.VideoResolver.triggerDownload === 'function') {
        window.VideoResolver.triggerDownload(dlTarget, `${sanitize(v.title)}.mp4`);
        App.notify('success', 'Đang tải tệp video', `Đang tải "${v.title}" về máy.`);
        return;
      }
      window.open(dlTarget, '_blank');
      return;
    }

    // 3. Fallback: file location information modal with clipboard copy
    const escapedPath = filePath.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    App.openModal(`
      <div class="flex flex-col gap-4">
        <div class="flex justify-between items-center border-b pb-3">
          <h3 class="text-base fw-700 text-white flex items-center gap-2">
            <span>📁</span> Thông tin tệp video
          </h3>
          <button class="btn btn-sm btn-ghost" onclick="App.closeModal()">✕</button>
        </div>

        <div class="text-xs text-muted">
          Tệp video đã được lưu vào thư mục lưu trữ cục bộ trên máy tính của bạn:
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-xs text-muted font-semibold">Đường dẫn tệp:</label>
          <div class="p-3 rounded bg-surface border border-gray-800 font-mono text-xs text-accent break-all select-all flex items-center justify-between gap-2">
            <span id="filePathDisplay">${filePath}</span>
            <button class="btn btn-ghost btn-sm text-xs" onclick="Pages.downloaded.copyToClipboard('${escapedPath}')" title="Sao chép">📋</button>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3 text-xs p-3 bg-surface/50 rounded border border-gray-800">
          <div><span class="text-muted">Tên video:</span> <div class="fw-600 text-white truncate" title="${v.title || ''}">${v.title || 'N/A'}</div></div>
          <div><span class="text-muted">Nền tảng:</span> <div class="fw-600 text-accent">${v.platform || 'N/A'}</div></div>
          <div><span class="text-muted">Dung lượng:</span> <div class="fw-600 text-white">${v.size || 'N/A'}</div></div>
          <div><span class="text-muted">Tác giả:</span> <div class="fw-600 text-white">${v.author || 'N/A'}</div></div>
        </div>

        <div class="flex justify-end gap-2 pt-3 border-t">
          <button class="btn btn-secondary btn-sm" onclick="App.closeModal()">Đóng</button>
          <button class="btn btn-primary btn-sm flex items-center gap-1.5" onclick="Pages.downloaded.copyToClipboard('${escapedPath}')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            Sao chép đường dẫn
          </button>
        </div>
      </div>
    `);
  },

  copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        App.notify('success', 'Đã sao chép', 'Đã sao chép đường dẫn vào clipboard.');
      }).catch(() => {
        App.notify('info', 'Đường dẫn', text);
      });
    } else {
      App.notify('info', 'Đường dẫn', text);
    }
  },

  previewVideo(id) {
    const v = (App.store && Array.isArray(App.store.downloadedVideos)) 
      ? App.store.downloadedVideos.find(x => String(x.id) === String(id)) 
      : null;
    if (!v) return;

    const hasVideoUrl = v.url && (v.url.startsWith('http') || v.url.startsWith('blob:') || v.url.startsWith('data:'));
    const hasImage = v.thumb && (v.thumb.startsWith('http') || v.thumb.startsWith('data:') || v.thumb.startsWith('blob:') || v.thumb.startsWith('/'));

    App.openModal(`
      <div class="flex flex-col gap-4">
        <div class="flex justify-between items-center border-b pb-2">
          <h3 class="text-sm fw-700 text-white truncate max-w-md" title="${v.title || ''}">${v.title || 'Xem trước video'}</h3>
          <button class="btn btn-sm btn-ghost" onclick="App.closeModal()">✕</button>
        </div>

        <div class="w-full h-72 bg-black rounded flex items-center justify-center overflow-hidden relative border border-gray-800">
          ${hasVideoUrl ? `
            <video src="${v.url}" controls class="w-full h-full object-contain" autoplay></video>
          ` : hasImage ? `
            <img src="${v.thumb}" class="w-full h-full object-contain" alt="">
            <div class="absolute inset-0 flex items-center justify-center bg-black/40 text-4xl text-white">▶</div>
          ` : `
            <div class="flex flex-col items-center gap-2 text-muted">
              <div class="text-4xl text-white opacity-60">▶</div>
              <span class="text-xs">Xem trước video chất lượng cao (1080p HD)</span>
            </div>
          `}
        </div>

        <div class="grid grid-cols-3 gap-2 text-xs text-muted p-2 rounded bg-surface border border-gray-800">
          <div>Tác giả: <strong class="text-white">${v.author || 'N/A'}</strong></div>
          <div>Nền tảng: <strong class="text-accent">${v.platform || 'N/A'}</strong></div>
          <div>Thời lượng: <strong class="text-white">${v.duration || '--:--'}</strong></div>
        </div>

        <div class="flex justify-between items-center pt-2 border-t">
          <button class="btn btn-danger btn-sm flex items-center gap-1.5" onclick="Pages.downloaded.deleteVideo('${v.id}')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            Xóa video
          </button>
          <div class="flex gap-2">
            <button class="btn btn-secondary btn-sm" onclick="App.closeModal()">Đóng</button>
            <button class="btn btn-primary btn-sm flex items-center gap-1.5" onclick="Pages.downloaded.openFile('${v.id}')">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
              Mở file
            </button>
          </div>
        </div>
      </div>
    `);
  }
};
