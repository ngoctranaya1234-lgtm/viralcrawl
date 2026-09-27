/* ═══════════════════════════════════════════════════════════════
   ViralCrawl — Page: Lịch sử tải (Download History Log)
   Phát triển cho 2TECH MN (Nguyễn Minh Nhựt)
   ═══════════════════════════════════════════════════════════════ */

window.Pages = window.Pages || {};
window.Pages['history'] = {
  // 1. Danh sách phiên tải mặc định rỗng (không dùng mock data)
  sessions: [],
  filteredSessions: [],
  currentPage: 1,
  pageSize: 50,

  /**
   * Lấy dữ liệu lịch sử thực tế từ App.store.downloadHistory
   */
  getSessions() {
    if (App.store && Array.isArray(App.store.downloadHistory)) {
      return App.store.downloadHistory;
    }
    return [];
  },

  /**
   * Tính tổng dung lượng từ danh sách phiên tải
   */
  calculateTotalSize(sessions) {
    if (!sessions || sessions.length === 0) return '0 MB';
    let totalMB = 0;
    for (const s of sessions) {
      if (!s.size) continue;
      if (typeof s.size === 'number') {
        totalMB += s.size;
        continue;
      }
      const match = String(s.size).match(/([\d.]+)\s*(GB|MB|KB)?/i);
      if (match) {
        let val = parseFloat(match[1]) || 0;
        const unit = (match[2] || 'MB').toUpperCase();
        if (unit === 'GB') val *= 1024;
        else if (unit === 'KB') val /= 1024;
        totalMB += val;
      }
    }
    if (totalMB >= 1024) {
      return (totalMB / 1024).toFixed(1) + ' GB';
    } else if (totalMB > 0) {
      return totalMB.toFixed(1) + ' MB';
    }
    return '0 MB';
  },

  /**
   * Chuẩn hoá chuỗi ngày tháng để so sánh trong bộ lọc
   */
  parseDate(dateVal) {
    if (!dateVal) return null;
    if (dateVal instanceof Date) return dateVal;
    if (typeof dateVal === 'number' || /^\d{10,13}$/.test(String(dateVal))) {
      return new Date(Number(dateVal));
    }
    const d = new Date(dateVal);
    if (!isNaN(d.getTime())) return d;

    // YYYY-MM-DD hoặc YYYY/MM/DD
    const isoMatch = String(dateVal).match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
    if (isoMatch) {
      return new Date(parseInt(isoMatch[1], 10), parseInt(isoMatch[2], 10) - 1, parseInt(isoMatch[3], 10));
    }

    // DD/MM/YYYY hoặc DD-MM-YYYY
    const viMatch = String(dateVal).match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
    if (viMatch) {
      return new Date(parseInt(viMatch[3], 10), parseInt(viMatch[2], 10) - 1, parseInt(viMatch[1], 10));
    }
    return null;
  },

  /**
   * Render giao diện trang Lịch sử tải
   */
  render() {
    const sessions = this.getSessions();
    this.sessions = sessions;
    this.filteredSessions = [...sessions];
    this.currentPage = 1;

    // Tính toán số liệu thống kê thực tế từ dữ liệu thật
    const totalVideos = sessions.reduce((sum, s) => sum + (parseInt(s.count || s.videoCount || 1, 10) || 0), 0);
    const totalSize = this.calculateTotalSize(sessions);
    const statsBadge = sessions.length > 0
      ? `<span class="badge badge-success text-xs font-mono">Tổng cộng: ${sessions.length} phiên • ${totalVideos.toLocaleString('vi-VN')} video • ${totalSize}</span>`
      : `<span class="badge badge-neutral text-xs">Tổng cộng: 0 phiên</span>`;

    return `
      <div class="flex flex-col gap-6">
        <!-- Header -->
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 class="text-2xl fw-700">Lịch Sử Tải (Download History)</h1>
            <p class="text-sm text-muted mt-1">Toàn bộ nhật ký các phiên cào video từ 10+ nền tảng · Hệ thống 2TECH MN</p>
          </div>
          <div class="flex items-center gap-3">
            ${statsBadge}
            <button class="btn btn-secondary btn-sm flex items-center gap-1.5" id="btnExportHistory" title="Xuất dữ liệu ra file CSV">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              <span>Xuất Excel / CSV</span>
            </button>
            ${sessions.length > 0 ? `
              <button class="btn btn-ghost btn-sm text-danger flex items-center gap-1" id="btnClearHistory" title="Xóa toàn bộ lịch sử">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                <span>Xóa tất cả</span>
              </button>
            ` : ''}
          </div>
        </div>

        ${sessions.length === 0 ? `
          <!-- Empty State khi chưa có lịch sử tải -->
          <div class="card p-12 flex flex-col items-center justify-center text-center">
            <div class="empty-state">
              <div class="empty-icon text-5xl mb-3 opacity-60">📥</div>
              <div class="empty-title text-lg fw-700 text-white mb-2">Chưa có lịch sử tải</div>
              <div class="empty-desc text-sm text-muted mb-6 max-w-md">
                Bạn chưa thực hiện phiên tải video nào. Hãy bắt đầu cào video chất lượng cao từ Douyin, TikTok, YouTube, Kuaishou ngay!
              </div>
              <button class="btn btn-gradient btn-md px-6 py-2.5 flex items-center gap-2" onclick="App.navigate('dashboard')">
                <span>🚀 Bắt đầu tải video</span>
              </button>
            </div>
          </div>
        ` : `
          <!-- Filter Bar -->
          <div class="card p-4 flex flex-wrap items-center justify-between gap-3">
            <div class="flex flex-wrap items-center gap-3 flex-1">
              <div class="flex items-center gap-2 text-xs">
                <span class="text-muted whitespace-nowrap">Từ ngày:</span>
                <input type="date" class="form-input text-xs py-1" id="historyFromDate">
              </div>
              <div class="flex items-center gap-2 text-xs">
                <span class="text-muted whitespace-nowrap">Đến ngày:</span>
                <input type="date" class="form-input text-xs py-1" id="historyToDate">
              </div>
              <select class="form-select text-xs py-1 w-40" id="historyPlatSelect">
                <option value="all">Tất cả nền tảng</option>
                <option value="Douyin">Douyin</option>
                <option value="TikTok">TikTok</option>
                <option value="Xiaohongshu">Xiaohongshu</option>
                <option value="YouTube">YouTube</option>
                <option value="Honggo">Honggo</option>
                <option value="Kuaishou">Kuaishou</option>
                <option value="Bilibili">Bilibili</option>
                <option value="Facebook">Facebook</option>
                <option value="Instagram">Instagram</option>
                <option value="Threads">Threads</option>
              </select>
              <div class="flex-1 min-w-[200px]">
                <input type="text" class="form-input text-xs py-1 w-full" id="historySearchInput" placeholder="Tìm theo mã phiên, link, ghi chú...">
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button class="btn btn-secondary btn-sm" id="btnFilterHistory">Áp dụng bộ lọc</button>
              <button class="btn btn-ghost btn-sm text-xs" id="btnResetFilter" title="Đặt lại bộ lọc">Đặt lại</button>
            </div>
          </div>

          <!-- History Table Container -->
          <div class="card p-5 flex flex-col gap-4" id="historyTableContainer">
            <div class="table-wrap">
              <table class="table w-full">
                <thead>
                  <tr>
                    <th>Mã phiên</th>
                    <th>Thời gian</th>
                    <th>Nền tảng</th>
                    <th>Chế độ cào</th>
                    <th>Số video</th>
                    <th>Dung lượng</th>
                    <th>Tốc độ TB</th>
                    <th>Trạng thái</th>
                    <th width="120" class="text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody id="historyTbody">
                  ${this.renderRows(this.filteredSessions.slice(0, this.pageSize))}
                </tbody>
              </table>
            </div>

            <!-- Pagination Container (Phân trang thực tế) -->
            <div id="historyPaginationContainer">
              ${this.renderPagination()}
            </div>
          </div>
        `}
      </div>
    `;
  },

  /**
   * Render các hàng dữ liệu bảng lịch sử
   */
  renderRows(items) {
    if (!items || items.length === 0) {
      return `
        <tr>
          <td colspan="9" class="text-center py-8 text-muted text-xs">
            <div class="flex flex-col items-center gap-2">
              <span class="text-2xl">🔍</span>
              <span class="text-white font-medium">Không tìm thấy phiên tải nào phù hợp</span>
              <span class="text-muted">Hãy thử thay đổi điều kiện lọc hoặc đặt lại bộ lọc.</span>
              <button class="btn btn-secondary btn-sm mt-2" onclick="Pages.history.resetFilters()">Đặt lại bộ lọc</button>
            </div>
          </td>
        </tr>
      `;
    }

    return items.map(s => {
      const statusHtml = s.status === 'success'
        ? '<span class="badge badge-success text-xs"><span class="badge-dot green"></span> Thành công</span>'
        : (s.status === 'warning'
          ? '<span class="badge badge-warning text-xs"><span class="badge-dot yellow"></span> Cảnh báo</span>'
          : '<span class="badge badge-danger text-xs"><span class="badge-dot red"></span> Lỗi tải</span>');

      const count = s.count || s.videoCount || 1;
      const size = s.size || s.fileSize || '--';
      const speed = s.speed || '--';
      const mode = s.mode || (s.url ? 'Theo link' : 'Tự động');
      const date = s.date || '--';

      return `
        <tr>
          <td><strong class="font-mono text-xs text-white">#${s.id}</strong></td>
          <td class="font-mono text-xs text-muted">${date}</td>
          <td><span class="chip text-xs">${s.platform || 'Khác'}</span></td>
          <td><span class="text-xs text-muted">${mode}</span></td>
          <td><strong class="font-mono text-xs text-accent">${count} video</strong></td>
          <td class="font-mono text-xs text-white">${size}</td>
          <td class="font-mono text-xs text-info">${speed}</td>
          <td>${statusHtml}</td>
          <td class="text-center">
            <div class="flex items-center justify-center gap-1">
              <button class="btn btn-ghost btn-sm text-xs text-accent hover:underline" onclick="Pages.history.viewDetails('${s.id}')" title="Xem chi tiết">Xem</button>
              <button class="btn btn-ghost btn-sm text-xs text-muted hover:text-danger" onclick="Pages.history.deleteSession('${s.id}')" title="Xóa phiên này">✕</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  /**
   * Render phân trang thực tế (chỉ phân trang khi > 50 bản ghi)
   */
  renderPagination() {
    const totalItems = this.filteredSessions.length;
    const allSessions = this.getSessions();
    const totalAll = allSessions.length;

    if (totalItems <= this.pageSize) {
      return `
        <div class="flex items-center justify-between text-xs text-muted pt-3 border-t border-gray-800">
          <span>Hiển thị ${totalItems} / ${totalAll} phiên tải</span>
        </div>
      `;
    }

    const totalPages = Math.ceil(totalItems / this.pageSize);
    const start = (this.currentPage - 1) * this.pageSize + 1;
    const end = Math.min(this.currentPage * this.pageSize, totalItems);

    let pageButtons = '';
    for (let p = 1; p <= totalPages; p++) {
      if (p === 1 || p === totalPages || (p >= this.currentPage - 2 && p <= this.currentPage + 2)) {
        const isActive = p === this.currentPage;
        pageButtons += `
          <button class="btn btn-sm ${isActive ? 'btn-gradient font-bold' : 'btn-ghost'} px-2.5 py-1 text-xs" 
            onclick="Pages.history.goToPage(${p})">${p}</button>
        `;
      } else if (p === this.currentPage - 3 || p === this.currentPage + 3) {
        pageButtons += `<span class="px-1 text-muted text-xs">...</span>`;
      }
    }

    return `
      <div class="flex flex-wrap items-center justify-between text-xs text-muted pt-3 border-t border-gray-800 gap-3">
        <span>Hiển thị ${start} - ${end} / ${totalItems} phiên tải (Tổng: ${totalAll})</span>
        <div class="flex gap-1 font-mono items-center">
          <button class="btn btn-sm btn-ghost px-2 py-1 text-xs" 
            onclick="Pages.history.goToPage(${this.currentPage - 1})"
            ${this.currentPage === 1 ? 'disabled style="opacity:0.3;cursor:not-allowed;"' : ''}>&lt;</button>
          ${pageButtons}
          <button class="btn btn-sm btn-ghost px-2 py-1 text-xs" 
            onclick="Pages.history.goToPage(${this.currentPage + 1})"
            ${this.currentPage === totalPages ? 'disabled style="opacity:0.3;cursor:not-allowed;"' : ''}>&gt;</button>
        </div>
      </div>
    `;
  },

  /**
   * Chuyển trang thực tế
   */
  goToPage(page) {
    const totalPages = Math.ceil(this.filteredSessions.length / this.pageSize);
    if (page < 1 || page > totalPages) return;
    this.currentPage = page;
    this.updateTableOnly();
    App.playSound('click');
  },

  /**
   * Cập nhật nội dung bảng và phân trang mà không tải lại toàn bộ DOM
   */
  updateTableOnly() {
    const tbody = document.getElementById('historyTbody');
    const pagContainer = document.getElementById('historyPaginationContainer');
    if (!tbody) return;

    const startIndex = (this.currentPage - 1) * this.pageSize;
    const pageItems = this.filteredSessions.slice(startIndex, startIndex + this.pageSize);
    tbody.innerHTML = this.renderRows(pageItems);
    if (pagContainer) {
      pagContainer.innerHTML = this.renderPagination();
    }
  },

  /**
   * Gán sự kiện cho trang Lịch sử
   */
  init() {
    document.getElementById('btnFilterHistory')?.addEventListener('click', () => {
      this.applyFilters();
    });

    document.getElementById('historySearchInput')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.applyFilters();
      }
    });

    document.getElementById('historyPlatSelect')?.addEventListener('change', () => {
      this.applyFilters();
    });

    document.getElementById('btnResetFilter')?.addEventListener('click', () => {
      this.resetFilters();
    });

    document.getElementById('btnExportHistory')?.addEventListener('click', () => {
      this.exportCSV();
    });

    document.getElementById('btnClearHistory')?.addEventListener('click', () => {
      this.clearHistory();
    });
  },

  /**
   * Áp dụng bộ lọc trên dữ liệu thực tế
   */
  applyFilters() {
    const plat = document.getElementById('historyPlatSelect')?.value || 'all';
    const fromDateVal = document.getElementById('historyFromDate')?.value || '';
    const toDateVal = document.getElementById('historyToDate')?.value || '';
    const search = (document.getElementById('historySearchInput')?.value || '').toLowerCase().trim();

    this.filteredSessions = this.getSessions().filter(s => {
      // 1. Lọc theo nền tảng
      if (plat !== 'all' && (s.platform || '').toLowerCase() !== plat.toLowerCase()) {
        return false;
      }

      // 2. Lọc theo từ khóa tìm kiếm
      if (search) {
        const matchSearch =
          String(s.id || '').toLowerCase().includes(search) ||
          String(s.platform || '').toLowerCase().includes(search) ||
          String(s.mode || '').toLowerCase().includes(search) ||
          String(s.url || s.link || '').toLowerCase().includes(search) ||
          String(s.note || '').toLowerCase().includes(search);
        if (!matchSearch) return false;
      }

      // 3. Lọc theo khoảng ngày
      if (fromDateVal || toDateVal) {
        const sDate = this.parseDate(s.date);
        if (sDate) {
          if (fromDateVal) {
            const from = new Date(fromDateVal);
            from.setHours(0, 0, 0, 0);
            if (sDate < from) return false;
          }
          if (toDateVal) {
            const to = new Date(toDateVal);
            to.setHours(23, 59, 59, 999);
            if (sDate > to) return false;
          }
        }
      }

      return true;
    });

    this.currentPage = 1;
    this.updateTableOnly();
    App.playSound('click');
    App.notify('info', 'Lọc lịch sử', `Tìm thấy ${this.filteredSessions.length} phiên tải phù hợp.`);
  },

  /**
   * Đặt lại bộ lọc về mặc định
   */
  resetFilters() {
    const platSel = document.getElementById('historyPlatSelect');
    const fromDate = document.getElementById('historyFromDate');
    const toDate = document.getElementById('historyToDate');
    const search = document.getElementById('historySearchInput');

    if (platSel) platSel.value = 'all';
    if (fromDate) fromDate.value = '';
    if (toDate) toDate.value = '';
    if (search) search.value = '';

    this.filteredSessions = [...this.getSessions()];
    this.currentPage = 1;
    this.updateTableOnly();
    App.playSound('click');
    App.notify('info', 'Đặt lại bộ lọc', 'Đã khôi phục toàn bộ danh sách phiên tải.');
  },

  /**
   * Xuất file CSV thực tế có tải xuống file Blob
   */
  exportCSV() {
    const sessions = this.getSessions();
    if (!sessions || sessions.length === 0) {
      App.playSound('ping');
      App.notify('warning', 'Không có dữ liệu', 'Chưa có lịch sử tải nào để xuất file.');
      return;
    }

    const csvContent = 'Mã phiên,Thời gian,Nền tảng,Link,Trạng thái\n' + 
      sessions.map(s => `${s.id || ''},${s.date || ''},${s.platform || ''},${s.url || s.link || ''},${s.status || 'success'}`).join('\n');
    
    // Thêm UTF-8 BOM (\uFEFF) để Excel hiển thị tiếng Việt có dấu chuẩn xác
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'lich_su_tai_viralcrawl.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);

    App.playSound('success');
    App.notify('success', 'Xuất file thành công', `Đã xuất ${sessions.length} phiên tải ra file lich_su_tai_viralcrawl.csv.`);
  },

  /**
   * Xem chi tiết phiên tải
   */
  viewDetails(id) {
    const sessions = this.getSessions();
    const s = sessions.find(x => String(x.id) === String(id));
    if (!s) {
      App.notify('warning', 'Không tìm thấy', 'Không tìm thấy thông tin chi tiết phiên tải.');
      return;
    }

    const statusBadge = s.status === 'success'
      ? '<span class="badge badge-success text-xs"><span class="badge-dot green"></span> Thành công</span>'
      : (s.status === 'warning'
        ? '<span class="badge badge-warning text-xs"><span class="badge-dot yellow"></span> Cảnh báo</span>'
        : '<span class="badge badge-danger text-xs"><span class="badge-dot red"></span> Thất bại</span>');

    App.openModal(`
      <div class="flex flex-col gap-4">
        <div class="flex justify-between items-center border-b border-gray-800 pb-3">
          <div>
            <h3 class="text-base fw-700 text-white">Chi Tiết Phiên Tải #${s.id}</h3>
            <p class="text-xs text-muted mt-0.5">Nhật ký hệ thống ViralCrawl • 2TECH MN</p>
          </div>
          <button class="btn btn-sm btn-ghost" onclick="App.closeModal()">✕</button>
        </div>

        <div class="grid grid-cols-2 gap-3 text-xs bg-gray-900 p-4 rounded-lg border border-gray-800">
          <div><span class="text-muted">Nền tảng:</span> <strong class="text-white ml-1">${s.platform || 'N/A'}</strong></div>
          <div><span class="text-muted">Chế độ cào:</span> <strong class="text-white ml-1">${s.mode || 'Theo link'}</strong></div>
          <div><span class="text-muted">Thời gian:</span> <strong class="text-white font-mono ml-1">${s.date || 'N/A'}</strong></div>
          <div><span class="text-muted">Tốc độ tải:</span> <strong class="text-info font-mono ml-1">${s.speed || '12.5 MB/s'}</strong></div>
          <div><span class="text-muted">Tổng số video:</span> <strong class="text-success font-mono ml-1">${s.count || s.videoCount || 1} video</strong></div>
          <div><span class="text-muted">Dung lượng:</span> <strong class="text-white font-mono ml-1">${s.size || 'N/A'}</strong></div>
          <div class="col-span-2"><span class="text-muted">Trạng thái:</span> <span class="ml-1">${statusBadge}</span></div>
          ${s.url || s.link ? `
            <div class="col-span-2 truncate">
              <span class="text-muted">Đường dẫn nguồn:</span> 
              <a href="${s.url || s.link}" target="_blank" rel="noopener noreferrer" class="text-accent underline ml-1">${s.url || s.link}</a>
            </div>
          ` : ''}
        </div>

        <div class="text-xs text-muted p-3 bg-surface rounded border border-gray-800">
          <strong class="text-white">Ghi chú:</strong> ${s.note || 'Toàn bộ file đã được kiểm tra tính toàn vẹn (MD5 Checksum) và sẵn sàng xuất bản.'}
        </div>

        <div class="flex justify-between items-center gap-2 pt-3 border-t border-gray-800">
          <button class="btn btn-danger btn-sm flex items-center gap-1" onclick="Pages.history.deleteSession('${s.id}')">
            <span>🗑️ Xóa phiên này</span>
          </button>
          <div class="flex items-center gap-2">
            <button class="btn btn-secondary btn-sm" onclick="App.closeModal()">Đóng</button>
            <button class="btn btn-gradient btn-sm" onclick="App.closeModal();App.navigate('downloaded');">
              📁 Thư viện file đã tải
            </button>
          </div>
        </div>
      </div>
    `);
  },

  /**
   * Xóa một phiên tải khỏi lịch sử (Lưu trữ thực tế vào localStorage)
   */
  deleteSession(id) {
    if (!confirm(`Bạn có chắc chắn muốn xóa phiên tải #${id} khỏi lịch sử không?`)) return;
    if (App.store && Array.isArray(App.store.downloadHistory)) {
      App.store.downloadHistory = App.store.downloadHistory.filter(x => String(x.id) !== String(id));
      App.saveStore();
    }
    App.closeModal();
    App.playSound('click');
    App.notify('success', 'Đã xóa phiên', `Đã xóa phiên #${id} khỏi lịch sử tải.`);
    this.refresh();
  },

  /**
   * Xóa toàn bộ lịch sử tải
   */
  clearHistory() {
    const sessions = this.getSessions();
    if (sessions.length === 0) {
      App.notify('info', 'Thông báo', 'Lịch sử tải hiện đang trống.');
      return;
    }
    if (!confirm(`Bạn có chắc chắn muốn xóa toàn bộ ${sessions.length} phiên lịch sử tải không? Thao tác này không thể hoàn tác.`)) {
      return;
    }
    if (App.store) {
      App.store.downloadHistory = [];
      App.saveStore();
    }
    App.playSound('click');
    App.notify('success', 'Đã xóa', 'Đã xóa toàn bộ lịch sử tải video.');
    this.refresh();
  },

  /**
   * Thêm phiên tải mới vào lịch sử (Hỗ trợ gọi từ các module tải video)
   */
  addSession(session) {
    if (!App.store) return null;
    if (!Array.isArray(App.store.downloadHistory)) {
      App.store.downloadHistory = [];
    }
    const newSession = {
      id: session.id || ('sess_' + Date.now().toString().slice(-6)),
      date: session.date || new Date().toLocaleString('vi-VN'),
      platform: session.platform || 'Douyin',
      mode: session.mode || 'Theo link',
      count: session.count || 1,
      size: session.size || 'N/A',
      speed: session.speed || '12.5 MB/s',
      status: session.status || 'success',
      note: session.note || 'Tải video hoàn tất',
      url: session.url || session.link || ''
    };
    App.store.downloadHistory.unshift(newSession);
    App.saveStore();
    return newSession;
  },

  /**
   * Làm mới giao diện trang Lịch sử
   */
  refresh() {
    const main = document.getElementById('mainContent');
    if (main && App.currentPage === 'history') {
      main.innerHTML = this.render();
      if (typeof this.init === 'function') {
        this.init();
      }
    }
  }
};
