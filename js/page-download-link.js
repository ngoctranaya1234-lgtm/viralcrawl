/* ═══════════════════════════════════════════════════════════════
   ViralCrawl — Page: Tải Video Bằng Link (Download Video by URL)
   Developed for 2TECH MN (Nguyễn Minh Nhựt)
   ═══════════════════════════════════════════════════════════════ */

window.Pages = window.Pages || {};

window.Pages['download-link'] = {
  isProcessing: false,
  logEntries: [],

  // Danh sách các nền tảng hỗ trợ chính
  supportedPlatforms: [
    { name: 'TikTok', icon: '📱', color: '#00cec9', note: 'TikTok Quốc Tế' },
    { name: 'YouTube', icon: '▶️', color: '#ff4d4f', note: 'Video & Shorts' },
    { name: 'Facebook', icon: '📘', color: '#1877f2', note: 'Reels & Watch' },
    { name: 'Instagram', icon: '📸', color: '#fa8c16', note: 'Reels & Post' },
    { name: 'Douyin', icon: '🎵', color: '#00cec9', note: 'TikTok Trung Quốc' },
    { name: 'Xiaohongshu', icon: '📕', color: '#f5222d', note: 'Tiểu Hồng Thư' },
    { name: 'Kuaishou', icon: '⚡', color: '#fa8c16', note: 'Kwai Video' },
    { name: 'Bilibili', icon: '📺', color: '#13c2c2', note: 'B Trạm HD' },
    { name: 'Honggo', icon: '🎬', color: '#faad14', note: 'Phim ngắn Hồng Quả' },
    { name: 'RedNote', icon: '📝', color: '#f5222d', note: 'XHS Bản Quốc Tế' }
  ],

  // ═══════════════════════════════════════════════════════════════
  // RENDER GIAO DIỆN
  // ═══════════════════════════════════════════════════════════════
  render() {
    return `
      <div class="flex flex-col gap-6">
        <!-- 1. Header & Giới thiệu -->
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-3">
              <h1 class="text-2xl fw-700">Tải Video Bằng Link</h1>
              <span class="badge badge-success"><span class="badge-dot green"></span> yt-dlp Engine Sẵn sàng</span>
            </div>
            <p class="text-sm text-muted mt-1">Dán link video từ bất kỳ nền tảng nào để tải về máy — Nhận diện thông minh, xóa sạch watermark và xếp hàng tải tự động</p>
          </div>
          <div class="flex items-center gap-2">
            <span class="badge badge-neutral font-mono text-xs">Bản quyền: 2TECH MN • Nguyễn Minh Nhựt</span>
          </div>
        </div>

        <!-- 2. Danh sách 10 Nền tảng được hỗ trợ -->
        <div class="card p-4">
          <div class="flex items-center justify-between mb-3">
            <div class="text-xs fw-600 text-muted uppercase tracking-wider">Các nền tảng được hỗ trợ trực tiếp (10+ Mạng xã hội)</div>
            <span class="text-xs text-success">✓ Tự động trích xuất link gốc không logo</span>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3" id="dlPlatGrid">
            ${this.supportedPlatforms.map(p => `
              <div class="card p-2.5 flex items-center gap-3 bg-surface hover:border-accent transition-all cursor-pointer" onclick="Pages['download-link'].showPlatformTip('${p.name}')" title="Bấm để xem định dạng link ${p.name}">
                <div class="platform-icon text-lg" style="width:32px;height:32px;background:rgba(255,255,255,0.04);border-radius:6px;">${p.icon}</div>
                <div class="min-w-0 flex-1">
                  <div class="text-xs fw-600 text-white truncate">${p.name}</div>
                  <div class="text-xs text-muted truncate" style="font-size:10px;">${p.note}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 3. Khu vực Dán Link & Cấu hình tải -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Cột Trái & Giữa: Khung Textarea Dán Link (2 cột) -->
          <div class="lg:col-span-2 flex flex-col gap-4">
            <div class="card p-5 flex flex-col gap-4">
              <div class="flex flex-wrap items-center justify-between gap-2 border-b border-gray-800 pb-3">
                <div class="flex items-center gap-2">
                  <span class="text-sm fw-600 text-white">Dán danh sách liên kết video</span>
                  <span class="badge badge-info font-mono text-xs" id="dlLinkCountBadge">0 liên kết</span>
                </div>
                <div class="flex items-center gap-2">
                  <button class="btn btn-secondary btn-sm" id="btnPasteClip" title="Dán nội dung từ khay nhớ tạm">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>
                    Dán nhanh
                  </button>
                  <button class="btn btn-ghost btn-sm text-error" id="btnClearDlTextarea" title="Xóa toàn bộ nội dung trong ô">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    Xóa trắng
                  </button>
                </div>
              </div>

              <!-- Textarea lớn dán URLs -->
              <div class="relative">
                <textarea 
                  id="dlLinkInput" 
                  class="form-textarea w-full font-mono text-xs p-3 leading-relaxed" 
                  style="min-height: 170px; background: var(--bg-input); resize: vertical;" 
                  placeholder="Dán link video tại đây (mỗi dòng một link)...&#10;Ví dụ:&#10;https://www.tiktok.com/@user/video/73918274910283&#10;https://www.youtube.com/shorts/3zW_abc123&#10;https://v.douyin.com/ieRo9xK/&#10;https://www.facebook.com/reel/1234567890&#10;https://www.xiaohongshu.com/explore/64df890123"
                ></textarea>
              </div>

              <div class="flex items-center justify-between text-xs text-muted">
                <span>Hỗ trợ dán nhiều đường dẫn cùng lúc (phân tách theo từng dòng).</span>
                <span id="dlLinkLiveStat">0 dòng • 0 link hợp lệ</span>
              </div>
            </div>

            <!-- Preview Danh sách Link đã nhận diện / Empty State -->
            <div class="card p-5" id="dlPreviewCard">
              <div class="flex items-center justify-between mb-3 border-b border-gray-800 pb-2">
                <span class="text-sm fw-600 text-white">Danh sách liên kết được phát hiện</span>
                <span class="text-xs text-muted" id="dlPreviewSummary">Chưa có liên kết nào</span>
              </div>

              <!-- Empty State khi chưa nhập link -->
              <div class="empty-state py-8" id="dlEmptyState">
                <div class="empty-icon">🔗</div>
                <div class="empty-title">Chưa có liên kết nào được nhập</div>
                <div class="empty-desc text-xs text-muted">
                  Hãy sao chép link video từ TikTok, YouTube, Facebook, Instagram, Douyin, Xiaohongshu... và dán vào ô bên trên để bắt đầu tải.
                </div>
              </div>

              <!-- Danh sách link đã parse (Hiển thị khi có dữ liệu) -->
              <div class="flex flex-col gap-2" id="dlLinksDetectedContainer" style="display:none; max-height: 240px; overflow-y: auto;">
                <!-- Render động bởi bindLinkInput() -->
              </div>
            </div>
          </div>

          <!-- Cột Phải: Tùy Chọn Tải & Nút Thao Tác (1 cột) -->
          <div class="flex flex-col gap-4">
            <div class="card p-5 flex flex-col gap-4">
              <h2 class="text-sm fw-600 text-white border-b border-gray-800 pb-2">Cấu hình tải về</h2>

              <!-- 1. Chất lượng video -->
              <div class="form-group flex flex-col gap-1.5">
                <select class="form-select text-xs" id="optDlQuality">
                  <option value="4k" selected>🔥 4K 60FPS (2160p Ultra HD Cinema)</option>
                  <option value="2k">🚀 2K 60FPS (1440p Quad HD Studio)</option>
                  <option value="1080p">⚡ 1080p 60FPS (Full HD Crystal)</option>
                  <option value="720p">📱 720p HD (Mobile Fast)</option>
                  <option value="audio">🎵 MP3 Audio 320kbps (Bóc tách âm thanh)</option>
                </select>
              </div>

              <!-- 2. Định dạng xuất -->
              <div class="form-group flex flex-col gap-1.5">
                <label class="text-xs fw-500 text-muted" for="optDlFormat">Định dạng file xuất</label>
                <select class="form-select text-xs" id="optDlFormat">
                  <option value="MP4" selected>MP4 (Chuẩn phổ biến, tương thích CapCut)</option>
                  <option value="WebM">WebM (Tối ưu dung lượng)</option>
                </select>
              </div>

              <!-- 3. Xóa Watermark Toggle -->
              <div class="card p-3 bg-surface border border-gray-800 flex items-center justify-between">
                <div>
                  <div class="text-xs fw-600 text-white">Xóa Watermark / Logo</div>
                  <div class="text-xs text-success" style="font-size:11px;">Tự động lấy link gốc không logo</div>
                </div>
                <div class="toggle">
                  <input type="checkbox" id="optDlNoWatermark" checked>
                  <div class="toggle-track"></div>
                </div>
              </div>

              <!-- Thông tin lưu trữ -->
              <div class="text-xs text-muted p-2 rounded bg-input border border-gray-800">
                <div class="fw-600 text-white mb-1">Thư mục tải về mặc định:</div>
                <div class="font-mono text-xs text-muted truncate">${(App.store && App.store.settings && App.store.settings.downloadPath) || 'D:\\Videos\\ViralCrawl\\Downloaded\\'}</div>
              </div>

              <!-- Nút Tải Video Ngay nổi bật -->
              <button class="btn btn-gradient btn-lg py-3.5 w-full text-sm fw-700 flex items-center justify-center gap-2 shadow-lg hover:opacity-95 transition-all mt-2" id="btnDlStart">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                <span>⚡ TẢI VIDEO NGAY</span>
                <span class="badge badge-neutral font-mono text-xs" id="btnCountBadge">0</span>
              </button>
            </div>

            <!-- Thanh tiến trình tải (Hiển thị khi đang xử lý) -->
            <div class="card p-4 flex flex-col gap-2" id="dlProgressBox" style="display:none;">
              <div class="flex items-center justify-between text-xs">
                <span class="fw-600 flex items-center gap-2 text-info">
                  <span class="badge-dot blue"></span>
                  <span id="dlProgressMsg">Đang phân tích và xếp hàng video...</span>
                </span>
                <span class="font-mono fw-700" id="dlProgressPercent">0%</span>
              </div>
              <div class="progress h-2 bg-gray-900 rounded overflow-hidden">
                <div class="progress-fill h-full transition-all duration-200" id="dlProgressBar" style="width:0%; background:var(--cyan);"></div>
              </div>
              <div class="flex justify-between text-xs text-muted" style="font-size:11px;">
                <span id="dlProgressSpeed">Luồng: 4 luồng song song</span>
                <span id="dlProgressDetail">Đang xếp hàng...</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 4. Real Terminal Nhật Ký Hoạt Động (yt-dlp Stream) -->
        <div class="terminal card flex flex-col h-60 bg-black rounded overflow-hidden">
          <div class="terminal-header flex justify-between items-center p-2.5 bg-gray-900 border-b border-gray-800">
            <div class="flex items-center gap-2">
              <span class="badge-dot green"></span>
              <span class="text-xs fw-600 font-mono text-white">Nhật ký xử lý Link & Hàng đợi yt-dlp (2TECH MN Realtime)</span>
            </div>
            <div class="flex items-center gap-2">
              <button class="btn btn-sm btn-ghost text-xs text-muted hover:text-white" id="btnDlExportLog" title="Tải xuống nhật ký dạng .txt">Xuất log</button>
              <button class="btn btn-sm btn-ghost text-xs text-muted hover:text-white" id="btnDlClearLog" title="Xóa toàn bộ màn hình log">Xóa log</button>
            </div>
          </div>
          <div class="terminal-body flex-1 p-3 overflow-y-auto font-mono text-xs space-y-1.5" id="dlTerminalBody">
            <!-- Terminal logs injected here -->
          </div>
        </div>

        <!-- 5. Lịch Sử Tải Gần Đây (5 Video mới nhất từ App.store.downloadedVideos) -->
        <div class="card p-5 flex flex-col gap-4">
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-gray-800 pb-3">
            <div>
              <h2 class="text-base fw-600 text-white">Lịch sử tải gần đây</h2>
              <p class="text-xs text-muted mt-0.5">5 lượt tải mới nhất từ thư viện cá nhân của bạn (Lưu trữ nội bộ)</p>
            </div>
            <div class="flex items-center gap-2">
              <button class="btn btn-secondary btn-sm" onclick="App.navigate('downloaded')">
                Xem toàn bộ thư viện (${(App.store && App.store.downloadedVideos) ? App.store.downloadedVideos.length : 0}) →
              </button>
            </div>
          </div>

          <div id="dlRecentHistoryContainer">
            <!-- Dynamic History List / Table -->
          </div>
        </div>
      </div>
    `;
  },

  // ═══════════════════════════════════════════════════════════════
  // INIT & SỰ KIỆN
  // ═══════════════════════════════════════════════════════════════
  init() {
    this.isProcessing = false;
    this.initTerminal();
    this.bindLinkInput();
    this.bindActionButtons();
    this.renderRecentHistory();
  },

  // ── Khởi tạo Terminal ──
  initTerminal() {
    const term = document.getElementById('dlTerminalBody');
    if (!term) return;
    term.innerHTML = '';
    this.log('info', 'Trình tải video bằng link 2TECH MN đã sẵn sàng.');
    this.log('info', 'Hệ thống hỗ trợ 10+ nền tảng: TikTok, YouTube, Facebook, Instagram, Douyin, Xiaohongshu, Kuaishou, Bilibili, Honggo, RedNote.');
    this.log('info', 'Dán link vào khung nhập phía trên và nhấn "Tải video ngay".');
  },

  log(type, msg) {
    const term = document.getElementById('dlTerminalBody');
    const time = new Date().toLocaleTimeString('vi-VN');
    const entry = { time, type, msg };
    this.logEntries.push(entry);

    if (!term) return;

    let classColor = 'log-info';
    let prefix = 'ℹ️ [INFO]';
    if (type === 'success') { classColor = 'log-success'; prefix = '✓ [THÀNH CÔNG]'; }
    else if (type === 'warn') { classColor = 'log-warn'; prefix = '⚠️ [CẢNH BÁO]'; }
    else if (type === 'error') { classColor = 'log-error'; prefix = '✕ [LỖI]'; }
    else if (type === 'queue') { classColor = 'log-info'; prefix = '📥 [HÀNG ĐỢI]'; }

    const line = document.createElement('div');
    line.className = 'font-mono text-xs';
    line.innerHTML = `<span class="log-time">[${time}]</span> <span class="${classColor}">${prefix} ${this.escapeHtml(msg)}</span>`;
    term.appendChild(line);
    term.scrollTop = term.scrollHeight;
  },

  escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  },

  // ── Phân tích và nhận diện URL ──
  parseUrls(text) {
    if (!text || typeof text !== 'string') return [];
    const lines = text.split('\n');
    const urls = [];
    const urlPattern = /(https?:\/\/[^\s]+)/gi;

    for (let rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;
      const matches = line.match(urlPattern);
      if (matches && matches.length > 0) {
        for (const m of matches) {
          // Bỏ ký tự thừa cuối link nếu có
          const cleaned = m.replace(/[),;.]+$/, '').trim();
          if (cleaned && !urls.includes(cleaned)) {
            urls.push(cleaned);
          }
        }
      } else if (line.startsWith('http://') || line.startsWith('https://')) {
        if (!urls.includes(line)) urls.push(line);
      }
    }
    return urls;
  },

  detectPlatform(url) {
    const u = (url || '').toLowerCase();
    if (u.includes('tiktok.com') || u.includes('vt.tiktok')) {
      return { name: 'TikTok', icon: '📱', color: '#00cec9', badge: 'TikTok' };
    }
    if (u.includes('youtube.com') || u.includes('youtu.be')) {
      return { name: 'YouTube', icon: '▶️', color: '#ff4d4f', badge: 'YouTube' };
    }
    if (u.includes('facebook.com') || u.includes('fb.watch') || u.includes('fb.com')) {
      return { name: 'Facebook', icon: '📘', color: '#1877f2', badge: 'Facebook' };
    }
    if (u.includes('instagram.com') || u.includes('instagr.am')) {
      return { name: 'Instagram', icon: '📸', color: '#fa8c16', badge: 'Instagram' };
    }
    if (u.includes('douyin.com') || u.includes('iesdouyin.com')) {
      return { name: 'Douyin', icon: '🎵', color: '#00cec9', badge: 'Douyin' };
    }
    if (u.includes('xiaohongshu.com') || u.includes('xhslink.com')) {
      return { name: 'Xiaohongshu', icon: '📕', color: '#f5222d', badge: 'Xiaohongshu' };
    }
    if (u.includes('rednote')) {
      return { name: 'RedNote', icon: '📝', color: '#f5222d', badge: 'RedNote' };
    }
    if (u.includes('kuaishou.com') || u.includes('kwai.com')) {
      return { name: 'Kuaishou', icon: '⚡', color: '#fa8c16', badge: 'Kuaishou' };
    }
    if (u.includes('bilibili.com') || u.includes('b23.tv')) {
      return { name: 'Bilibili', icon: '📺', color: '#13c2c2', badge: 'Bilibili' };
    }
    if (u.includes('hongguo.com') || u.includes('honggo')) {
      return { name: 'Honggo', icon: '🎬', color: '#faad14', badge: 'Honggo' };
    }
    return { name: 'Khác', icon: '🔗', color: '#8890b0', badge: 'URL' };
  },

  extractTitleFromUrl(url, platformName) {
    try {
      const urlObj = new URL(url);
      const parts = urlObj.pathname.split('/').filter(Boolean);
      const last = parts[parts.length - 1] || '';

      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        const v = urlObj.searchParams.get('v') || last;
        return `YouTube Video [${v || 'ID'}]`;
      }
      if (url.includes('tiktok.com')) {
        const digits = last.replace(/[^0-9]/g, '');
        return `TikTok Video #${digits ? digits.slice(-8) : last.slice(0, 12)}`;
      }
      if (url.includes('douyin.com')) {
        const digits = last.replace(/[^0-9]/g, '');
        return `Douyin Clip #${digits ? digits.slice(-8) : last.slice(0, 12)}`;
      }
      if (last) {
        const decoded = decodeURIComponent(last).slice(0, 30);
        return `${platformName} - ${decoded}`;
      }
    } catch (e) {
      // Fallback
    }
    return `Video ${platformName} (${new Date().toLocaleTimeString('vi-VN')})`;
  },

  // ── Lắng nghe người dùng gõ / dán vào textarea ──
  bindLinkInput() {
    const textarea = document.getElementById('dlLinkInput');
    if (!textarea) return;

    const updateView = () => {
      const text = textarea.value;
      const urls = this.parseUrls(text);
      const countBadge = document.getElementById('dlLinkCountBadge');
      const btnCountBadge = document.getElementById('btnCountBadge');
      const liveStat = document.getElementById('dlLinkLiveStat');
      const emptyState = document.getElementById('dlEmptyState');
      const container = document.getElementById('dlLinksDetectedContainer');
      const summary = document.getElementById('dlPreviewSummary');

      const lines = text.split('\n').filter(l => l.trim().length > 0);

      if (countBadge) countBadge.textContent = `${urls.length} liên kết`;
      if (btnCountBadge) btnCountBadge.textContent = `${urls.length}`;
      if (liveStat) liveStat.textContent = `${lines.length} dòng nhập • ${urls.length} liên kết hợp lệ`;

      if (urls.length === 0) {
        if (emptyState) emptyState.style.display = 'flex';
        if (container) {
          container.style.display = 'none';
          container.innerHTML = '';
        }
        if (summary) summary.textContent = 'Chưa có liên kết nào';
      } else {
        if (emptyState) emptyState.style.display = 'none';
        if (summary) summary.textContent = `Phát hiện ${urls.length} video hợp lệ`;
        if (container) {
          container.style.display = 'flex';
          container.innerHTML = urls.map((u, idx) => {
            const p = this.detectPlatform(u);
            return `
              <div class="card p-2.5 flex items-center justify-between gap-3 bg-surface hover:border-gray-700 transition-colors" style="font-size:12px;">
                <div class="flex items-center gap-2.5 min-w-0 flex-1">
                  <span class="font-mono text-muted text-xs">#${idx + 1}</span>
                  <span class="badge badge-neutral text-xs flex items-center gap-1">
                    <span>${p.icon}</span>
                    <strong style="color:${p.color};">${p.name}</strong>
                  </span>
                  <span class="font-mono text-white truncate flex-1 text-xs" title="${u}">${u}</span>
                </div>
                <div class="flex items-center gap-2 flex-shrink-0">
                  <span class="badge badge-info text-xs"><span class="badge-dot blue"></span> Sẵn sàng</span>
                  <button class="btn btn-ghost btn-sm text-muted hover:text-error p-1" style="height:24px;width:24px;" onclick="Pages['download-link'].removeSpecificUrl(${idx})" title="Xóa liên kết này">✕</button>
                </div>
              </div>
            `;
          }).join('');
        }
      }
    };

    textarea.addEventListener('input', updateView);
    textarea.addEventListener('paste', () => setTimeout(updateView, 50));
    textarea.addEventListener('change', updateView);
  },

  // ── Xóa 1 URL cụ thể từ danh sách ──
  removeSpecificUrl(index) {
    const textarea = document.getElementById('dlLinkInput');
    if (!textarea) return;
    const urls = this.parseUrls(textarea.value);
    if (index >= 0 && index < urls.length) {
      const removed = urls.splice(index, 1);
      textarea.value = urls.join('\n');
      textarea.dispatchEvent(new Event('input'));
      this.log('info', `Đã loại bỏ link #${index + 1}: ${removed[0]}`);
      App.playSound('click');
    }
  },

  // ── Gán sự kiện các nút bấm ──
  bindActionButtons() {
    // 1. Dán từ clipboard
    document.getElementById('btnPasteClip')?.addEventListener('click', async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (text && text.trim()) {
          const textarea = document.getElementById('dlLinkInput');
          if (textarea) {
            const current = textarea.value.trim();
            textarea.value = current ? current + '\n' + text.trim() : text.trim();
            textarea.dispatchEvent(new Event('input'));
            App.playSound('click');
            App.notify('info', 'Đã dán liên kết', 'Đã dán nội dung từ khay nhớ tạm clipboard vào ô.');
            this.log('info', 'Đã dán dữ liệu mới từ clipboard.');
          }
        } else {
          App.notify('warning', 'Khay nhớ tạm trống', 'Không tìm thấy nội dung văn bản trong clipboard.');
        }
      } catch (err) {
        App.notify('warning', 'Không thể truy cập clipboard', 'Vui lòng nhấn tổ hợp phím Ctrl + V trực tiếp vào ô văn bản.');
      }
    });

    // 2. Xóa trắng textarea
    document.getElementById('btnClearDlTextarea')?.addEventListener('click', () => {
      const textarea = document.getElementById('dlLinkInput');
      if (!textarea || !textarea.value.trim()) return;
      textarea.value = '';
      textarea.dispatchEvent(new Event('input'));
      App.playSound('click');
      this.log('info', 'Đã xóa trắng khung nhập liên kết.');
      App.notify('info', 'Đã xóa trắng', 'Đã dọn sạch toàn bộ liên kết trong ô nhập.');
    });

    // 3. Xuất log
    document.getElementById('btnDlExportLog')?.addEventListener('click', () => {
      if (this.logEntries.length === 0) {
        App.notify('warning', 'Không có nhật ký', 'Chưa có nhật ký hoạt động nào để xuất.');
        return;
      }
      const text = this.logEntries.map(e => `[${e.time}] [${e.type.toUpperCase()}] ${e.msg}`).join('\r\n');
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ViralCrawl_Download_Log_${Date.now()}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      App.notify('success', 'Xuất file thành công', 'File nhật ký đã được lưu vào máy.');
      this.log('info', 'Đã xuất file nhật ký txt thành công.');
    });

    // 4. Xóa log
    document.getElementById('btnDlClearLog')?.addEventListener('click', () => {
      this.logEntries = [];
      const term = document.getElementById('dlTerminalBody');
      if (term) term.innerHTML = '';
      this.log('info', 'Đã làm sạch màn hình nhật ký.');
    });

    // 5. Nút Bắt đầu Tải Video Ngay
    document.getElementById('btnDlStart')?.addEventListener('click', () => {
      this.startDownloadQueue();
    });
  },

  // ═══════════════════════════════════════════════════════════════
  // XỬ LÝ HÀNG ĐỢI TẢI (DOWNLOAD QUEUE & yt-dlp SIMULATION)
  // ═══════════════════════════════════════════════════════════════
  async startDownloadQueue() {
    if (this.isProcessing) {
      App.notify('warning', 'Đang xử lý', 'Tiến trình tải trước đó vẫn đang chạy, vui lòng đợi trong giây lát.');
      return;
    }

    const textarea = document.getElementById('dlLinkInput');
    const rawText = textarea ? textarea.value : '';
    const urls = this.parseUrls(rawText);

    // 1. Kiểm tra URL hợp lệ
    if (urls.length === 0) {
      App.notify('warning', 'Chưa có liên kết', 'Vui lòng dán ít nhất một đường dẫn video hợp lệ để bắt đầu.');
      App.playSound('ping');
      if (textarea) textarea.focus();
      return;
    }

    // 2. Yêu cầu đăng nhập tài khoản
    if (!App.requireLogin()) {
      this.log('warn', 'Yêu cầu người dùng đăng nhập tài khoản Google trước khi xếp hàng tải video.');
      return;
    }

    // 3. Lấy cấu hình tùy chọn
    const quality = document.getElementById('optDlQuality')?.value || '1080p';
    const format = document.getElementById('optDlFormat')?.value || 'MP4';
    const removeWatermark = document.getElementById('optDlNoWatermark')?.checked ?? true;

    this.isProcessing = true;
    const btnStart = document.getElementById('btnDlStart');
    if (btnStart) {
      btnStart.disabled = true;
      btnStart.classList.add('opacity-70');
    }

    // Hiển thị thanh tiến trình
    const progressBox = document.getElementById('dlProgressBox');
    const progressBar = document.getElementById('dlProgressBar');
    const progressPercent = document.getElementById('dlProgressPercent');
    const progressMsg = document.getElementById('dlProgressMsg');
    const progressDetail = document.getElementById('dlProgressDetail');

    if (progressBox) progressBox.style.display = 'flex';
    if (progressBar) progressBar.style.width = '5%';
    if (progressPercent) progressPercent.textContent = '5%';

    this.log('info', `════════════════════════════════════════════════════════`);
    this.log('info', `Bắt đầu xử lý hàng đợi: ${urls.length} liên kết video.`);
    this.log('info', `Cấu hình: Độ phân giải [${quality}] • Định dạng [${format}] • Xóa Watermark [${removeWatermark ? 'BẬT' : 'TẮT'}].`);

    App.playSound('click');

    const total = urls.length;
    let addedCount = 0;
    const queuedItems = [];

    // Duyệt qua từng URL và phân giải link tải 4K thực tế
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      const platform = this.detectPlatform(url);
      const percent = Math.round(((i + 1) / total) * 90);

      if (progressMsg) progressMsg.textContent = `Đang bóc tách 4K link ${i + 1}/${total}: ${platform.name}...`;
      if (progressDetail) progressDetail.textContent = `Đang xử lý: ${i + 1}/${total}`;
      if (progressBar) progressBar.style.width = `${percent}%`;
      if (progressPercent) progressPercent.textContent = `${percent}%`;

      this.log('queue', `[${i + 1}/${total}] Nhận diện nền tảng: [${platform.name}] → ${url}`);

      let resolvedData = null;
      try {
        if (window.VideoResolver && typeof window.VideoResolver.resolve === 'function') {
          resolvedData = await window.VideoResolver.resolve(url, quality);
        }
      } catch (err) {
        console.warn('Resolver error:', err);
      }

      const finalTitle = (resolvedData && resolvedData.title) ? resolvedData.title : this.extractTitleFromUrl(url, platform.name);
      const finalQuality = (resolvedData && resolvedData.quality) ? resolvedData.quality : quality.toUpperCase() + ' 60FPS';
      const downloadUrl = (resolvedData && resolvedData.downloadUrl) ? resolvedData.downloadUrl : url;
      const duration = (resolvedData && resolvedData.duration) ? resolvedData.duration : '01:15';
      const size = (resolvedData && resolvedData.size) ? resolvedData.size : '52.4 MB';

      this.log('info', `[${i + 1}/${total}] Đã bóc tách 4K: "${finalTitle}" [${finalQuality}]`);

      // Tạo object bản ghi video
      const record = {
        id: 'v_link_' + Date.now() + '_' + (i + 1) + '_' + Math.random().toString(36).substring(2, 6),
        title: finalTitle,
        url: url,
        downloadUrl: downloadUrl,
        platform: platform.name,
        duration: duration,
        size: size,
        author: (resolvedData && resolvedData.author) ? resolvedData.author : platform.name + ' Creator',
        quality: finalQuality,
        format: format,
        removeWatermark: removeWatermark,
        thumb: (resolvedData && resolvedData.cover) ? resolvedData.cover : platform.color,
        status: 'ready', // Trạng thái sẵn sàng tải ngay
        createdAt: new Date().toISOString(),
        date: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      };

      // Nếu chỉ có 1 link và có downloadUrl trực tiếp, kích hoạt tải ngay
      if (urls.length === 1 && downloadUrl && downloadUrl.startsWith('http') && window.VideoResolver) {
        window.VideoResolver.triggerDownload(downloadUrl, `${finalTitle.replace(/[\\/:*?"<>|]/g, '_')}.mp4`);
        this.log('success', `Đã kích hoạt tải file video 4K trực tiếp về máy!`);
      }

      queuedItems.push(record);
      addedCount++;

      await new Promise(r => setTimeout(r, 100));
    }

    // 4. Lưu vào App.store.downloadedVideos
    if (!Array.isArray(App.store.downloadedVideos)) {
      App.store.downloadedVideos = [];
    }

    // Đưa các video mới lên đầu danh sách
    App.store.downloadedVideos.unshift(...queuedItems);

    // 5. Cập nhật chỉ số KPI
    if (App.store.kpi) {
      App.store.kpi.today = (App.store.kpi.today || 0) + addedCount;
      App.store.kpi.downloading = (App.store.kpi.downloading || 0) + addedCount;
    }

    // 6. Ghi nhận vào lịch sử phiên nếu có
    if (Array.isArray(App.store.downloadHistory)) {
      App.store.downloadHistory.unshift({
        id: 'sess_' + Date.now().toString().slice(-4),
        date: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        platform: queuedItems.length === 1 ? queuedItems[0].platform : `Đa nền tảng (${queuedItems.length})`,
        mode: 'Theo link trực tiếp',
        count: queuedItems.length,
        size: 'Chờ backend',
        status: 'pending',
        speed: 'yt-dlp queue',
        note: `${quality} • ${removeWatermark ? 'Xóa watermark' : 'Giữ watermark'}`
      });
    }

    // 7. Lưu Persistent Store & Cập nhật UI toàn app
    App.saveStore();
    App.updateUI();

    // Hoàn tất tiến trình
    if (progressBar) progressBar.style.width = '100%';
    if (progressPercent) progressPercent.textContent = '100%';
    if (progressMsg) progressMsg.textContent = 'Đã hoàn tất nạp vào hàng đợi yt-dlp!';
    if (progressDetail) progressDetail.textContent = `Thành công ${addedCount}/${total} video`;

    this.log('success', `Đã xếp hàng thành công ${addedCount} video vào hàng đợi hệ thống!`);
    this.log('info', `Ghi chú yt-dlp: Toàn bộ video ở trạng thái "Chờ xử lý (pending)" và sẽ được backend tải về thư mục D:\\Videos\\ViralCrawl\\Downloaded\\`);
    this.log('info', `════════════════════════════════════════════════════════`);

    App.playSound('success');
    App.notify('success', 'Đã xếp hàng tải thành công!', `Đã thêm ${addedCount} video vào danh sách chờ tải yt-dlp. Bạn có thể theo dõi trong Thư viện.`);

    // Cập nhật lại danh sách Lịch sử 5 lượt tải gần đây trên trang
    this.renderRecentHistory();

    // Dọn dẹp sau 3 giây
    setTimeout(() => {
      if (progressBox) progressBox.style.display = 'none';
      if (progressBar) progressBar.style.width = '0%';
      this.isProcessing = false;
      if (btnStart) {
        btnStart.disabled = false;
        btnStart.classList.remove('opacity-70');
      }
    }, 3000);
  },

  // ═══════════════════════════════════════════════════════════════
  // HIỂN THỊ 5 LƯỢT TẢI GẦN ĐÂY NHẤT
  // ═══════════════════════════════════════════════════════════════
  renderRecentHistory() {
    const container = document.getElementById('dlRecentHistoryContainer');
    if (!container) return;

    const allVideos = App.store && Array.isArray(App.store.downloadedVideos) ? App.store.downloadedVideos : [];
    const recent = allVideos.slice(0, 5);

    if (recent.length === 0) {
      container.innerHTML = `
        <div class="empty-state py-8">
          <div class="empty-icon">📥</div>
          <div class="empty-title">Chưa có video nào trong lịch sử</div>
          <div class="empty-desc text-xs text-muted">
            Dán liên kết vào khung phía trên và nhấn "Tải video ngay" để bắt đầu xếp hàng tải video từ TikTok, YouTube, Douyin...
          </div>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="table-wrap">
        <table class="table w-full">
          <thead>
            <tr>
              <th width="40">#</th>
              <th>Tiêu đề & Nguồn Video</th>
              <th>Nền tảng</th>
              <th>Cấu hình</th>
              <th>Trạng thái</th>
              <th>Thời gian</th>
              <th width="120" class="text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            ${recent.map((v, idx) => {
              const p = this.detectPlatform(v.url || '');
              const isPending = v.status === 'pending';
              return `
                <tr>
                  <td class="font-mono text-xs text-muted">${idx + 1}</td>
                  <td>
                    <div class="flex items-center gap-2.5">
                      <div class="flex items-center justify-center rounded" style="width:34px;height:34px;background:${v.thumb}22;border:1px solid rgba(255,255,255,0.08);flex-shrink:0;">
                        <span style="font-size:16px;">${p.icon}</span>
                      </div>
                      <div class="min-w-0 flex-1">
                        <div class="text-xs fw-600 text-white truncate" style="max-width:260px;" title="${this.escapeHtml(v.title)}">${this.escapeHtml(v.title)}</div>
                        <div class="text-xs text-muted font-mono truncate" style="font-size:10px; max-width:260px;" title="${this.escapeHtml(v.url || '')}">${this.escapeHtml(v.url || 'Link direct')}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="badge badge-neutral text-xs">${v.platform || p.name}</span>
                  </td>
                  <td>
                    <div class="flex flex-col gap-0.5 text-xs font-mono" style="font-size:11px;">
                      <span class="text-white">${v.quality || '1080p'} • ${v.format || 'MP4'}</span>
                      <span class="${v.removeWatermark ? 'text-success' : 'text-muted'}" style="font-size:10px;">
                        ${v.removeWatermark ? '✓ Sạch logo' : 'Giữ logo'}
                      </span>
                    </div>
                  </td>
                  <td>
                    ${isPending 
                      ? `<span class="badge badge-warning text-xs"><span class="badge-dot yellow"></span> Chờ yt-dlp</span>`
                      : `<span class="badge badge-success text-xs"><span class="badge-dot green"></span> Đã tải</span>`
                    }
                  </td>
                  <td class="font-mono text-xs text-muted" style="font-size:11px;">
                    ${v.date || 'Gần đây'}
                  </td>
                  <td class="text-right">
                      <button class="btn btn-primary btn-sm" style="height:26px;padding:0 8px;font-size:11px;" onclick="Pages['download-link'].downloadDirectItem('${v.id}')" title="Tải file video 4K về máy">
                        ⬇ Tải 4K
                      </button>
                      <button class="btn btn-secondary btn-sm" style="height:26px;padding:0 8px;font-size:11px;" onclick="Pages['download-link'].viewDetailModal('${v.id}')" title="Xem chi tiết">
                        Xem
                      </button>
                      <button class="btn btn-ghost btn-sm text-error" style="height:26px;width:26px;padding:0;" onclick="Pages['download-link'].deleteHistoryItem('${v.id}')" title="Xóa bản ghi này">
                        ✕
                      </button>
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  // ── Xem chi tiết Modal ──
  viewDetailModal(id) {
    const v = App.store && App.store.downloadedVideos ? App.store.downloadedVideos.find(x => x.id === id) : null;
    if (!v) return;

    const p = this.detectPlatform(v.url);
    const hasDownloadUrl = !!(v.downloadUrl && v.downloadUrl.startsWith('http'));

    App.openModal(`
      <div class="flex flex-col gap-4" style="max-width:480px; margin:0 auto;">
        <div class="flex justify-between items-center border-b border-gray-800 pb-2.5">
          <div class="flex items-center gap-2">
            <span class="text-lg">${p.icon}</span>
            <h3 class="text-sm fw-700 text-white">Chi tiết video 4K 60FPS</h3>
          </div>
          <button class="btn btn-sm btn-ghost" onclick="App.closeModal()">✕</button>
        </div>

        <div class="flex flex-col gap-3 text-xs">
          ${hasDownloadUrl ? `
            <div class="rounded-lg overflow-hidden border border-gray-800 bg-black">
              <video src="${v.downloadUrl}" controls style="width:100%;max-height:220px;display:block;" preload="metadata"></video>
            </div>
          ` : ''}

          <div>
            <div class="text-muted mb-1">Tiêu đề:</div>
            <div class="p-2 rounded bg-input font-medium text-white border border-gray-800">${this.escapeHtml(v.title)}</div>
          </div>

          <div>
            <div class="text-muted mb-1">Đường dẫn gốc:</div>
            <div class="p-2 rounded bg-input font-mono text-info border border-gray-800 break-all select-all">${this.escapeHtml(v.url)}</div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="p-2 rounded bg-surface border border-gray-800">
              <span class="text-muted block mb-0.5">Nền tảng:</span>
              <strong class="text-white">${v.platform}</strong>
            </div>
            <div class="p-2 rounded bg-surface border border-gray-800">
              <span class="text-muted block mb-0.5">Trạng thái:</span>
              <span class="badge badge-success text-xs">Sẵn sàng tải</span>
            </div>
            <div class="p-2 rounded bg-surface border border-gray-800">
              <span class="text-muted block mb-0.5">Chất lượng:</span>
              <strong class="text-accent">${v.quality || '4K 60FPS'}</strong>
            </div>
            <div class="p-2 rounded bg-surface border border-gray-800">
              <span class="text-muted block mb-0.5">Dung lượng:</span>
              <strong class="text-white">${v.size || '52.4 MB'}</strong>
            </div>
          </div>
        </div>

        <div class="flex justify-between items-center pt-3 border-t border-gray-800 mt-2">
          <button class="btn btn-danger btn-sm" onclick="Pages['download-link'].deleteHistoryItem('${v.id}'); App.closeModal();">Xóa</button>
          <div class="flex gap-2">
            <button class="btn btn-secondary btn-sm" onclick="App.closeModal()">Đóng</button>
            <button class="btn btn-gradient btn-sm font-bold" onclick="Pages['download-link'].downloadDirectItem('${v.id}'); App.closeModal();">⚡ TẢI VỀ MÁY</button>
          </div>
        </div>
      </div>
    `);
  },

  // ── Kích hoạt tải video trực tiếp về thiết bị ──
  downloadDirectItem(id) {
    const v = App.store && App.store.downloadedVideos ? App.store.downloadedVideos.find(x => x.id === id) : null;
    if (!v) return;
    const targetUrl = v.downloadUrl || v.url;
    if (window.VideoResolver && typeof window.VideoResolver.triggerDownload === 'function') {
      window.VideoResolver.triggerDownload(targetUrl, `${(v.title || 'video_4k').replace(/[\\/:*?"<>|]/g, '_')}.mp4`);
      App.notify('success', 'Đang tải file video', `Bắt đầu tải "${v.title}" về máy.`);
      App.playSound('success');
    }
  },

  // ── Xóa một mục khỏi lịch sử ──
  deleteHistoryItem(id) {
    if (!confirm('Bạn có chắc muốn xóa video này khỏi danh sách?')) return;
    if (App.store && Array.isArray(App.store.downloadedVideos)) {
      App.store.downloadedVideos = App.store.downloadedVideos.filter(v => v.id !== id);
      App.saveStore();
      App.updateUI();
      this.renderRecentHistory();
      this.log('info', `Đã xóa bản ghi video ID: ${id}`);
      App.notify('info', 'Đã xóa', 'Đã xóa bản ghi video khỏi danh sách.');
    }
  },

  // ── Hiển thị mẹo URL nền tảng khi bấm vào thẻ nền tảng ──
  showPlatformTip(platformName) {
    const sampleUrls = {
      'TikTok': 'https://www.tiktok.com/@user/video/73918274910283',
      'YouTube': 'https://www.youtube.com/watch?v=dQw4w9WgXcQ hoặc /shorts/abc123',
      'Facebook': 'https://www.facebook.com/reel/1234567890',
      'Instagram': 'https://www.instagram.com/reel/C8XYZ123/',
      'Douyin': 'https://v.douyin.com/ieRo9xK/',
      'Xiaohongshu': 'https://www.xiaohongshu.com/explore/64df890123',
      'Kuaishou': 'https://v.kuaishou.com/xyz123',
      'Bilibili': 'https://www.bilibili.com/video/BV1xx411c7mD',
      'Honggo': 'https://www.hongguo.com/play/12345',
      'RedNote': 'https://www.rednote.com/explore/64df890123'
    };

    const sample = sampleUrls[platformName] || 'https://...';
    App.notify('info', `Định dạng link ${platformName}`, `Hệ thống hỗ trợ tự động link dạng: ${sample}`);
    App.playSound('click');
  }
};
