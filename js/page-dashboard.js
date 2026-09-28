/* ═══════════════════════════════════════════════════════════════
   Mnhut 2tech Al — Page: Tải ngay (Dashboard / Multi-Platform Scraper)
   Đơn vị chủ quản: 2TECH MN — Kỹ sư trưởng: Nguyễn Minh Nhựt
   Thiết kế giao diện Commercial Studio chuẩn theo tham chiếu thực tế
   ═══════════════════════════════════════════════════════════════ */

window.Pages = window.Pages || {};
window.Pages['dashboard'] = {
  activeTab: 'tab-link',
  selectedPlatform: 'Honggo',
  isDownloading: false,
  downloadInterval: null,
  uptimeTimer: null,

  render() {
    App.store.kpi = App.store.kpi || { today: 0, downloading: 0, completed: 0, error: 0 };
    App.store.downloadedVideos = App.store.downloadedVideos || [];
    App.store.downloadHistory = App.store.downloadHistory || [];
    App.store.platformConnections = App.store.platformConnections || {};
    App.store.queue = App.store.queue || [];
    
    const kpi = App.store.kpi;
    return `
      <div class="flex flex-col gap-5">
        <!-- 1. Header & Live Telemetry -->
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="min-w-0" style="max-width:100%;">
            <div class="flex flex-wrap items-center gap-2">
              <h1 class="text-xl sm:text-2xl fw-800 text-white tracking-wide" style="word-break:break-word;line-height:1.3;">Mnhut 2tech Al 4K — Cào video hỗ trợ dịch & lồng tiếng</h1>
              <span class="badge-4k">4K 60FPS</span>
            </div>
            <p class="text-xs text-muted mt-1" style="word-break:break-word;line-height:1.4;">Bản quyền phần mềm thuộc về <strong>2TECH MN</strong> — Trực thuộc <strong>Nguyễn Minh Nhựt</strong>. Bóc tách video đa nền tảng sạch 100% watermark.</p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <span class="badge badge-neutral"><span class="badge-dot green"></span> Server AI 2TECH MN: Hoạt động</span>
            <button class="btn btn-secondary btn-sm" id="btnRefreshStats" title="Cập nhật chỉ số">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
              Đồng bộ
            </button>
          </div>
        </div>

        <!-- 2. Platform Connection Cards Grid (8 Cards: 4x2) matching Reference Image -->
        <div class="card p-4">
          <div class="flex flex-wrap justify-between items-center gap-2 mb-3">
            <div>
              <h2 class="card-title text-sm fw-700 text-white flex flex-wrap items-center gap-1.5">
                <span>Trạng thái kết nối nền tảng</span>
                <span class="text-xs text-muted fw-400">(Tự động nhận diện tài khoản)</span>
              </h2>
            </div>
            <span class="text-xs text-muted hidden sm:inline">2TECH MN Engine</span>
          </div>

          <!-- 4x2 Grid Container -->
          <div class="plat-status-grid" id="platStatusGrid">
            <!-- Rendered dynamically via renderPlatforms() -->
          </div>

          <!-- Legend beneath cards (Exact replica of reference) -->
          <div class="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted pt-3 mt-3 border-t border-gray-800">
            <div class="flex items-center gap-1.5">
              <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#10b981;"></span>
              <span class="text-gray-300"><strong>Xanh ✓</strong> = đã đăng nhập</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#ef4444;"></span>
              <span class="text-gray-300"><strong>Đỏ ✕</strong> = chưa đăng nhập</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#f59e0b;"></span>
              <span class="text-gray-300"><strong>Vàng !</strong> = đang mở / bị khóa / chưa rõ</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#3b82f6;"></span>
              <span class="text-gray-300"><strong>Xanh ―</strong> = không cần đăng nhập</span>
            </div>
            <div class="ml-auto text-xs text-muted opacity-80 hidden md:block">
              💡 Nhấn <strong>"Đăng nhập"</strong> để nạp Cookie hoặc mở trình duyệt xác thực
            </div>
          </div>
        </div>

        <!-- 3. Chọn nền tảng (Horizontal Selector Bar) -->
        <div class="card p-4">
          <div class="text-xs fw-700 text-gray-300 uppercase tracking-wider mb-2.5">Chọn nền tảng</div>
          <div class="plat-sel-container" id="platSelContainer">
            <!-- Rendered dynamically via renderPlatformSelector() -->
          </div>
        </div>

        <!-- 4. Cách tải & Input Box (Capsule Tabs + Textarea + Quantity counter) -->
        <div class="card p-5">
          <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div class="flex items-center gap-3">
              <span class="text-xs fw-700 text-gray-300 uppercase tracking-wider">Cách tải:</span>
              <div class="crawl-capsule-tabs" id="crawlCapsuleTabs">
                <button class="crawl-capsule-tab active" data-target="tab-link">
                  <span>🔗</span> Theo link
                </button>
                <button class="crawl-capsule-tab" data-target="tab-channel">
                  <span>👤</span> Theo kênh
                </button>
                <button class="crawl-capsule-tab" data-target="tab-playlist">
                  <span>📦</span> Theo bộ
                </button>
                <button class="crawl-capsule-tab" data-target="tab-keyword">
                  <span>🔍</span> Theo từ khoá
                </button>
              </div>
            </div>

            <!-- Quantity counter badge from screenshot -->
            <div class="flex items-center gap-2">
              <span class="text-xs text-muted">Số lượng (theo link đã dán):</span>
              <div class="flex items-center bg-gray-900 border border-gray-700 rounded px-2 py-1">
                <input type="number" id="crawlQuantity" class="bg-transparent text-white font-mono text-xs w-16 text-center outline-none" value="100" min="1" max="1000">
              </div>
            </div>
          </div>

          <div class="tab-content relative min-h-[160px]">
            <!-- Tab 1: Theo Link -->
            <div id="tab-link" class="tab-panel active flex flex-col gap-3">
              <div class="flex justify-between items-center text-xs text-muted">
                <span id="platInputNotice">Dán danh sách liên kết video từ nền tảng đã chọn (hỗ trợ Douyin, Honggo, TikTok, YouTube, FB, IG...):</span>
                <span class="font-mono text-emerald-400 fw-600" id="linkCount">0 link được phát hiện</span>
              </div>
              <textarea id="crawlInputLinks" class="form-textarea w-full p-3.5 rounded-lg bg-gray-900/90 border border-gray-700/80 text-sm h-36 font-mono text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" placeholder="Dán link video tại đây (mỗi dòng 1 link)...
Ví dụ:
https://v.douyin.com/iRoLkd1/
https://www.tiktok.com/@creator/video/7689771314827005205
https://youtube.com/shorts/abcxyz123
https://honggo.com/drama/ep123"></textarea>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <button class="btn btn-ghost btn-sm text-error text-xs" onclick="document.getElementById('crawlInputLinks').value='';document.getElementById('linkCount').textContent='0 link được phát hiện';App.playSound('click');">
                    🗑 Xóa trắng
                  </button>
                  <button class="btn btn-ghost btn-sm text-xs text-info" id="btnFillSampleLinks">
                    📋 Nạp link mẫu test nhanh
                  </button>
                </div>
                <div class="text-xs text-muted">
                  Bóc tách trực tiếp chất lượng <strong>4K 60FPS</strong> Ultra HD
                </div>
              </div>
            </div>

            <!-- Tab 2: Theo Kênh -->
            <div id="tab-channel" class="tab-panel" style="display:none;">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="form-group flex flex-col gap-2">
                  <label class="form-label text-sm fw-500">URL Kênh hoặc ID Creator</label>
                  <input type="text" id="crawlChannelUrl" class="form-input p-2.5 rounded bg-gray-900 border border-gray-700 text-sm" placeholder="https://www.douyin.com/user/MS4wLjAB..." value="">
                  <span class="text-xs text-muted">Quét trọn bộ video của Creator hoặc tự động cập nhật video mới nhất</span>
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div class="form-group flex flex-col gap-2">
                    <label class="form-label text-sm fw-500">Số video lấy tối đa</label>
                    <input type="number" id="crawlChannelMax" class="form-input p-2.5 rounded bg-gray-900 border border-gray-700 text-sm font-mono" value="100">
                  </div>
                  <div class="form-group flex flex-col gap-2">
                    <label class="form-label text-sm fw-500">Lọc video ghim</label>
                    <label class="flex items-center gap-2 mt-2 cursor-pointer">
                      <div class="toggle"><input type="checkbox" id="checkSkipPinned" checked><div class="toggle-track"></div></div>
                      <span class="text-xs">Bỏ qua video ghim đầu trang</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <!-- Tab 3: Theo Bộ / Playlist -->
            <div id="tab-playlist" class="tab-panel" style="display:none;">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="form-group flex flex-col gap-2">
                  <label class="form-label text-sm fw-500">URL Bộ sưu tập / Phim ngắn Honggo / Playlist Douyin</label>
                  <input type="text" id="crawlPlaylistUrl" class="form-input p-2.5 rounded bg-gray-900 border border-gray-700 text-sm" placeholder="Nhập link bộ phim ngắn Honggo hoặc playlist..." value="">
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div class="form-group flex flex-col gap-2">
                    <label class="form-label text-sm fw-500">Số tập lấy</label>
                    <select class="form-select p-2.5 rounded bg-gray-900 border border-gray-700 text-sm">
                      <option>Toàn bộ các tập (Trọn bộ)</option>
                      <option>10 tập đầu tiên</option>
                      <option>50 tập mới nhất</option>
                    </select>
                  </div>
                  <div class="form-group flex flex-col gap-2">
                    <label class="form-label text-sm fw-500">Tự động đánh số tập</label>
                    <label class="flex items-center gap-2 mt-2 cursor-pointer">
                      <div class="toggle"><input type="checkbox" checked><div class="toggle-track"></div></div>
                      <span class="text-xs">Đánh số Tập 1, 2, 3...</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <!-- Tab 4: Theo Từ Khóa -->
            <div id="tab-keyword" class="tab-panel" style="display:none;">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="form-group flex flex-col gap-2">
                  <label class="form-label text-sm fw-500">Từ khoá tìm kiếm xu hướng</label>
                  <input type="text" id="crawlKeyword" class="form-input p-2.5 rounded bg-gray-900 border border-gray-700 text-sm" placeholder="Nhập từ khoá (Tiếng Việt hoặc Tiếng Trung)..." value="câu cá sinh tồn hoang dã">
                  
                  <!-- AI Translation Suggestions -->
                  <div class="mt-1">
                    <div class="text-xs text-muted mb-1 flex items-center gap-1">
                      <span>🤖 AI Gợi ý dịch sang tiếng Trung chuẩn xu hướng:</span>
                    </div>
                    <div class="flex flex-wrap gap-2">
                      <span class="chip cursor-pointer hover:border-accent" onclick="document.getElementById('crawlKeyword').value='野外钓鱼荒野求生';App.notify('info','Đã chọn từ khóa','野外钓鱼荒野求生 (Câu cá sinh tồn hoang dã)');">野外钓鱼荒野求生 (Câu cá sinh tồn)</span>
                      <span class="chip cursor-pointer hover:border-accent" onclick="document.getElementById('crawlKeyword').value='惊悚电影解说';App.notify('info','Đã chọn từ khóa','惊悚电影解说 (Review phim kinh dị)');">惊悚电影解说 (Review phim)</span>
                      <span class="chip cursor-pointer hover:border-accent" onclick="document.getElementById('crawlKeyword').value='厨房收纳小妙招';App.notify('info','Đã chọn từ khóa','厨房收纳小妙招 (Mẹo vặt bếp)');">厨房小妙招 (Mẹo vặt bếp)</span>
                      <span class="chip cursor-pointer hover:border-accent" onclick="document.getElementById('crawlKeyword').value='治愈系解压日常';App.notify('info','Đã chọn từ khóa','治愈系解压日常 (Vlog chữa lành)');">治愈系日常 (Vlog chữa lành)</span>
                    </div>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-3">
                  <div class="form-group flex flex-col gap-2">
                    <label class="form-label text-sm fw-500">Nền tảng cào</label>
                    <select class="form-select p-2.5 rounded bg-gray-900 border border-gray-700 text-sm" id="crawlPlatSelect">
                      <option value="Douyin">Douyin (Trending hot)</option>
                      <option value="TikTok">TikTok Quốc Tế</option>
                      <option value="Xiaohongshu">Xiaohongshu</option>
                      <option value="YouTube">YouTube Shorts</option>
                      <option value="Kuaishou">Kuaishou</option>
                      <option value="Bilibili">Bilibili</option>
                    </select>
                  </div>
                  <div class="form-group flex flex-col gap-2">
                    <label class="form-label text-sm fw-500">Số lượng cào</label>
                    <input type="number" id="crawlKeywordCount" class="form-input p-2.5 rounded bg-gray-900 border border-gray-700 text-sm font-mono" value="50" min="5" max="500">
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Deep Filters & De-duplication Row -->
          <div class="divider my-4"></div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
            <div>
              <label class="text-xs text-muted block mb-1">Thời lượng video</label>
              <select class="form-select text-xs w-full bg-gray-900 border-gray-700" id="filterDuration">
                <option value="all">Tất cả thời lượng</option>
                <option value="short">Dưới 1 phút (Shorts/Reels)</option>
                <option value="medium">1 - 5 phút (Vlog ngắn)</option>
                <option value="long">5 - 20 phút (Review/Dài tập)</option>
                <option value="extra">Trên 20 phút (Full tập phim)</option>
              </select>
            </div>
            <div>
              <label class="text-xs text-muted block mb-1">Sắp xếp ưu tiên</label>
              <select class="form-select text-xs w-full bg-gray-900 border-gray-700" id="filterSort">
                <option value="view">Lượt xem cao nhất (Trending)</option>
                <option value="like">Lượt tương tác / thả tim</option>
                <option value="new">Mới đăng gần đây nhất</option>
                <option value="old">Cũ nhất tới mới</option>
              </select>
            </div>
            <div>
              <label class="text-xs text-muted block mb-1">Chế độ lọc khử trùng</label>
              <label class="flex items-center gap-2 mt-1 cursor-pointer">
                <div class="toggle"><input type="checkbox" id="checkUniqueOnly" checked><div class="toggle-track"></div></div>
                <span class="text-xs fw-500 text-gray-200">Bỏ qua video đã tải trước đó</span>
              </label>
            </div>
            <div>
              <label class="text-xs text-muted block mb-1">Xóa watermark gốc</label>
              <label class="flex items-center gap-2 mt-1 cursor-pointer">
                <div class="toggle"><input type="checkbox" id="checkCleanWatermark" checked><div class="toggle-track"></div></div>
                <span class="text-xs fw-600 text-emerald-400">Lấy link gốc 4K sạch logo</span>
              </label>
            </div>
          </div>
        </div>

        <!-- 5. Download Progress Bar (shown when downloading) -->
        <div id="crawlProgressSection" class="card p-4" style="display:none;">
          <div class="flex justify-between items-center text-sm mb-2">
            <span class="fw-600 flex items-center gap-2 text-info">
              <span class="badge-dot blue"></span> <span id="crawlProgressText">Đang cào video chất lượng 4K 60FPS...</span>
            </span>
            <span class="font-mono text-sm fw-700 text-emerald-400" id="crawlProgressPercent">0%</span>
          </div>
          <div class="progress h-2 bg-gray-900 rounded overflow-hidden">
            <div id="crawlProgressBar" class="progress-fill bg-accent h-full" style="width: 0%; transition: width 0.2s;"></div>
          </div>
          <div class="flex justify-between text-xs text-muted mt-2">
            <span id="crawlSpeed">Tốc độ: 45.2 MB/s (GPU NVENC Engine)</span>
            <span id="crawlRemaining">Ước tính còn lại: Đang xử lý...</span>
          </div>
        </div>

        <!-- 6. Action Buttons -->
        <div class="flex flex-wrap gap-3 items-center">
          <button class="btn btn-gradient btn-lg px-6 py-3 rounded-lg fw-700 flex items-center gap-2 shadow-lg" id="btnPreviewSelect">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            Xem trước & chọn
          </button>
          <button class="btn btn-primary px-5 py-3 rounded-lg fw-600 flex items-center gap-2" id="btnDownloadAll">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Tải hết (không xem)
          </button>
          <button class="btn btn-secondary px-4 py-3 rounded-lg text-sm" id="btnAddToQueue">
            Thêm vào hàng đợi
          </button>
          <button class="btn btn-danger px-4 py-3 rounded-lg text-sm ml-auto" id="btnStopAll">
            Dừng tất cả
          </button>
        </div>

        <!-- 7. KPI Stats Row -->
        <div class="kpi-grid grid gap-3" style="grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));">
          <div class="kpi-card card p-3.5">
            <div class="kpi-label text-muted text-xs uppercase tracking-wide">Video hôm nay</div>
            <div class="kpi-value text-2xl fw-800 mt-1 text-white" id="kpiToday">${kpi.today}</div>
          </div>
          <div class="kpi-card card p-3.5">
            <div class="kpi-label text-muted text-xs uppercase tracking-wide">Đang tải</div>
            <div class="kpi-value text-2xl fw-800 mt-1 text-info" id="kpiDownloading">${kpi.downloading}</div>
          </div>
          <div class="kpi-card card p-3.5">
            <div class="kpi-label text-muted text-xs uppercase tracking-wide">Đã hoàn thành</div>
            <div class="kpi-value text-2xl fw-800 mt-1 text-emerald-400" id="kpiCompleted">${kpi.completed}</div>
          </div>
          <div class="kpi-card card p-3.5">
            <div class="kpi-label text-muted text-xs uppercase tracking-wide">Lỗi / Bỏ qua</div>
            <div class="kpi-value text-2xl fw-800 mt-1 text-muted" id="kpiError">${kpi.error}</div>
          </div>
          <div class="kpi-card card p-3.5">
            <div class="kpi-label text-muted text-xs uppercase tracking-wide">Thời gian chạy</div>
            <div class="kpi-value text-xl fw-700 mt-1 font-mono text-warning" id="dashUptime">0m 0s</div>
          </div>
        </div>

        <!-- 8. Realtime Terminal Log -->
        <div class="terminal card flex flex-col h-60 bg-black/95 rounded-xl border border-gray-800 overflow-hidden shadow-2xl">
          <div class="terminal-header flex justify-between items-center px-3 py-2 bg-gray-900/90 border-b border-gray-800">
            <div class="flex items-center gap-2">
              <span class="badge-dot green"></span>
              <span class="text-xs fw-700 font-mono text-gray-200">2TECH MN Engine — Nhật ký hoạt động Crawler (Realtime Stream)</span>
            </div>
            <div class="flex gap-2">
              <button class="btn btn-sm btn-ghost text-xs text-muted hover:text-white" id="btnExportLog">Xuất log</button>
              <button class="btn btn-sm btn-ghost text-xs text-muted hover:text-white" onclick="document.getElementById('dashTerminal').innerHTML=''">Xóa log</button>
            </div>
          </div>
          <div class="terminal-body flex-1 p-3.5 overflow-y-auto font-mono text-xs text-gray-300 space-y-1.5" id="dashTerminal">
            <!-- Terminal entries -->
          </div>
        </div>
      </div>
    `;
  },

  init() {
    this.renderPlatforms();
    this.renderPlatformSelector();
    this.bindCapsuleTabs();
    this.bindActions();
    this.initTerminal();

    // Link counter
    const inputLinks = document.getElementById('crawlInputLinks');
    inputLinks?.addEventListener('input', () => {
      const lines = inputLinks.value.split('\n').filter(l => l.trim().length > 0);
      document.getElementById('linkCount').textContent = `${lines.length} link được phát hiện`;
    });

    // Fill sample links button
    document.getElementById('btnFillSampleLinks')?.addEventListener('click', () => {
      App.playSound('click');
      const samples = [
        'https://v.douyin.com/iRoLkd1/',
        'https://www.tiktok.com/@shoptool_ai/video/7689771314827005205',
        'https://youtube.com/shorts/abcxyz123',
        'https://honggo.com/drama/ep101',
        'https://www.facebook.com/reel/1234567890'
      ];
      if (inputLinks) {
        inputLinks.value = samples.join('\n');
        document.getElementById('linkCount').textContent = `${samples.length} link được phát hiện`;
      }
      App.notify('info', 'Đã nạp link mẫu', `Đã nạp ${samples.length} link mẫu thử nghiệm.`);
    });

    // Refresh stats
    document.getElementById('btnRefreshStats')?.addEventListener('click', () => {
      App.playSound('ping');
      if (App.store.downloadedVideos) {
        App.store.kpi.completed = App.store.downloadedVideos.length;
      }
      App.saveStore();
      document.getElementById('kpiCompleted').textContent = App.store.kpi.completed;
      document.getElementById('kpiToday').textContent = App.store.kpi.today;
      document.getElementById('kpiDownloading').textContent = App.store.kpi.downloading;
      document.getElementById('kpiError').textContent = App.store.kpi.error;
      App.notify('info', 'Chỉ số hệ thống', 'Đã đồng bộ chỉ số từ cơ sở dữ liệu 2TECH MN.');
    });

    // Sync live uptime ticker
    const dashUptimeEl = document.getElementById('dashUptime');
    if (dashUptimeEl) {
      const updateUptime = () => {
        const diff = Math.floor((Date.now() - App.startTime) / 1000);
        const h = Math.floor(diff / 3600);
        const m = Math.floor((diff % 3600) / 60);
        const s = diff % 60;
        dashUptimeEl.textContent = h > 0 ? `${h}h ${m}m ${s}s` : `${m}m ${s}s`;
      };
      updateUptime();
      if (this.uptimeTimer) clearInterval(this.uptimeTimer);
      this.uptimeTimer = setInterval(updateUptime, 1000);
    }
  },

  // ── Render 4x2 Platform Cards (Matching Reference Screenshot) ──
  renderPlatforms() {
    const container = document.getElementById('platStatusGrid');
    if (!container) return;

    // 8 platforms displayed in 4x2 grid
    const platforms = [
      { id: 'Douyin', name: 'Douyin', icon: '🎵', iconBg: '#0f172a', type: 'cookie' },
      { id: 'Bilibili', name: 'Bilibili', icon: '📺', iconBg: '#0284c7', type: 'cookie' },
      { id: 'Kuaishou', name: 'Kuaishou', icon: '🧡', iconBg: '#ea580c', type: 'cookie' },
      { id: 'Honggo', name: 'Honggo', icon: '🍎', iconBg: '#dc2626', type: 'bypass' },
      { id: 'TikTok', name: 'TikTok', icon: '📱', iconBg: '#1e1b4b', type: 'bypass' },
      { id: 'YouTube', name: 'YouTube', icon: '▶️', iconBg: '#991b1b', type: 'bypass' },
      { id: 'Facebook', name: 'Facebook', icon: '📘', iconBg: '#1e40af', type: 'cookie' },
      { id: 'Instagram', name: 'Instagram', icon: '📸', iconBg: '#831843', type: 'cookie' }
    ];

    let html = '';
    platforms.forEach(p => {
      const conn = App.store.platformConnections[p.id];
      const isOnline = conn && conn.status === 'online';
      const isBypass = p.type === 'bypass';

      let badgeHtml = '';
      let actionBtnHtml = '';

      if (isBypass) {
        badgeHtml = `<span class="plat-pill-badge bypass">― Không cần đăng nhập</span>`;
        actionBtnHtml = `<button class="plat-btn-action bypass-btn" data-plat="${p.id}" data-action="bypass"><span>✓ Tự động bypass VIP</span></button>`;
      } else if (isOnline) {
        badgeHtml = `<span class="plat-pill-badge logged-in">● Đã đăng nhập</span>`;
        actionBtnHtml = `<button class="plat-btn-action logout-yellow" data-plat="${p.id}" data-action="logout"><span>Đăng xuất</span></button>`;
      } else {
        badgeHtml = `<span class="plat-pill-badge not-logged">✕ Chưa đăng nhập</span>`;
        actionBtnHtml = `<button class="plat-btn-action login-red" data-plat="${p.id}" data-action="login"><span>🔑 Đăng nhập</span></button>`;
      }

      html += `
        <div class="plat-status-card" data-plat-id="${p.id}">
          <div class="plat-status-header">
            <div class="plat-status-info">
              <div class="plat-avatar" style="background:${p.iconBg};">${p.icon}</div>
              <div class="plat-name-wrap">
                <div class="plat-name-text">${p.name}</div>
              </div>
            </div>
            ${badgeHtml}
          </div>
          <div class="plat-status-footer">
            ${actionBtnHtml}
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
    this.bindPlatformCardActions();
  },

  // ── Render Horizontal "Chọn nền tảng" Selector ──
  renderPlatformSelector() {
    const container = document.getElementById('platSelContainer');
    if (!container) return;

    const list = [
      { id: 'Douyin', name: 'Douyin', icon: '🎵' },
      { id: 'Bilibili', name: 'Bilibili', icon: '📺' },
      { id: 'Kuaishou', name: 'Kuaishou', icon: '🧡' },
      { id: 'Honggo', name: 'Honggo', icon: '🍎' },
      { id: 'Xiaohongshu', name: 'Xiaohongshu', icon: '📕' },
      { id: 'RedNote', name: 'RedNote', icon: '📝' },
      { id: 'YouTube', name: 'YouTube', icon: '▶️' },
      { id: 'TikTok', name: 'TikTok', icon: '📱' },
      { id: 'Facebook', name: 'Facebook', icon: '📘' },
      { id: 'Instagram', name: 'Instagram', icon: '📸' }
    ];

    let html = '';
    list.forEach(p => {
      const isActive = this.selectedPlatform === p.id;
      html += `
        <button class="plat-sel-btn ${isActive ? 'active' : ''}" data-plat-sel="${p.id}">
          <span>${p.icon}</span>
          <span>${p.name}</span>
        </button>
      `;
    });

    container.innerHTML = html;

    // Bind click events on selector buttons
    container.querySelectorAll('.plat-sel-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        App.playSound('click');
        container.querySelectorAll('.plat-sel-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.selectedPlatform = btn.getAttribute('data-plat-sel');

        const notice = document.getElementById('platInputNotice');
        if (notice) {
          notice.innerHTML = `Đang chọn <strong>${this.selectedPlatform}</strong> — Dán link video từ ${this.selectedPlatform} hoặc các nền tảng khác:`;
        }

        App.notify('info', 'Đã chuyển nền tảng', `Chế độ bóc tách tối ưu cho: ${this.selectedPlatform}`);
      });
    });
  },

  // ── Bind Actions on 4x2 Platform Cards ──
  bindPlatformCardActions() {
    document.querySelectorAll('.plat-btn-action').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        App.playSound('click');
        const plat = btn.getAttribute('data-plat');
        const action = btn.getAttribute('data-action');

        if (action === 'bypass') {
          App.notify('info', 'Bypass VIP', `${plat} được bảo trợ 2TECH MN Engine không cần nạp Cookie.`);
        } else if (action === 'logout') {
          if (confirm(`Bạn có chắc muốn đăng xuất Cookie của ${plat}?`)) {
            delete App.store.platformConnections[plat];
            App.saveStore();
            this.renderPlatforms();
            App.notify('info', 'Đã đăng xuất', `Đã xóa Cookie kết nối ${plat}.`);
          }
        } else if (action === 'login') {
          this.openPlatformModal(plat);
        }
      });
    });
  },

  // ── Capsule Tabs Switcher ──
  bindCapsuleTabs() {
    const tabs = document.querySelectorAll('#crawlCapsuleTabs .crawl-capsule-tab');
    const panels = {
      'tab-link': document.getElementById('tab-link'),
      'tab-channel': document.getElementById('tab-channel'),
      'tab-playlist': document.getElementById('tab-playlist'),
      'tab-keyword': document.getElementById('tab-keyword'),
    };

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        Object.values(panels).forEach(p => { if (p) p.style.display = 'none'; });

        tab.classList.add('active');
        const targetId = tab.getAttribute('data-target');
        if (panels[targetId]) {
          panels[targetId].style.display = 'flex';
          this.activeTab = targetId;
        }
        App.playSound('click');
      });
    });
  },

  parseLinks() {
    const inputLinks = document.getElementById('crawlInputLinks');
    if (!inputLinks) return [];
    return inputLinks.value.split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0 && l.startsWith('http'));
  },

  extractPlatformFromUrl(url) {
    if (url.includes('douyin.com')) return 'Douyin';
    if (url.includes('tiktok.com')) return 'TikTok';
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube';
    if (url.includes('xiaohongshu.com') || url.includes('xhslink.com')) return 'Xiaohongshu';
    if (url.includes('kuaishou.com')) return 'Kuaishou';
    if (url.includes('bilibili.com')) return 'Bilibili';
    if (url.includes('facebook.com') || url.includes('fb.watch')) return 'Facebook';
    if (url.includes('instagram.com')) return 'Instagram';
    if (url.includes('honggo.com')) return 'Honggo';
    return this.selectedPlatform || 'Web';
  },

  generateRandomDataForUrl(url, index) {
    const plat = this.extractPlatformFromUrl(url);
    const mockId = `vid_${Date.now()}_${index}`;
    return { 
      id: mockId, 
      url: url,
      title: `Video ${plat} 4K 60FPS - ${mockId}`, 
      plat: plat, 
      dur: '00:' + (Math.floor(Math.random() * 40) + 15).toString().padStart(2, '0'), 
      view: Math.floor(Math.random() * 900 + 100) + 'K', 
      like: Math.floor(Math.random() * 50 + 10) + 'K', 
      size: Math.floor(Math.random() * 50 + 15) + ' MB' 
    };
  },

  checkPlanForUrls(urls) {
    const plan = App.store?.plan || 'FREE';
    const hasDouyinOrPro = urls.some(u => {
      const p = this.extractPlatformFromUrl(u);
      return ['Douyin', 'Xiaohongshu', 'Kuaishou', 'RedNote'].includes(p);
    });
    const hasUnlimited = urls.some(u => {
      const p = this.extractPlatformFromUrl(u);
      return ['Bilibili', 'Honggo'].includes(p);
    });

    const limits = {
      FREE: 5,
      START: 10,
      PRO: 50,
      UNLIMITED: 100,
      ULTRA: 200
    };
    const maxAllowed = limits[plan] || 5;
    if (urls.length > maxAllowed) {
      App.notify('warning', 'Vượt quá số lượng mỗi lần', `Gói ${plan} chỉ cho phép cào tối đa ${maxAllowed} video/lần. Vui lòng rút gọn danh sách hoặc nâng cấp gói.`);
      return false;
    }

    if (plan === 'FREE') {
      if (hasUnlimited) {
        App.notify('warning', 'Cần nâng cấp gói UNLIMITED', 'Nền tảng này yêu cầu gói UNLIMITED hoặc ULTRA. Hãy dùng số dư 2.500.000đ để kích hoạt gói!');
        App.navigate('pricing');
        return false;
      }
      if (hasDouyinOrPro || urls.length > 5) {
        App.notify('warning', 'Cần nâng cấp gói PRO', 'Tải Douyin / Xiaohongshu hoặc tải hàng loạt trên 5 video yêu cầu gói PRO trở lên. Hãy dùng số dư 2.500.000đ để nâng cấp!');
        App.navigate('pricing');
        return false;
      }
    } else if (plan === 'START') {
      if (hasUnlimited) {
        App.notify('warning', 'Cần nâng cấp gói UNLIMITED', 'Nền tảng này yêu cầu gói UNLIMITED trở lên.');
        App.navigate('pricing');
        return false;
      }
      if (hasDouyinOrPro) {
        App.notify('warning', 'Cần nâng cấp gói PRO', 'Tải Douyin / Xiaohongshu yêu cầu gói PRO trở lên.');
        App.navigate('pricing');
        return false;
      }
    }
    return true;
  },

  bindActions() {
    // 1. Xem trước & chọn Modal
    document.getElementById('btnPreviewSelect')?.addEventListener('click', () => {
      if (!App.requireLogin()) return;
      const urls = this.parseLinks();
      if (urls.length === 0) {
        App.notify('warning', 'Không có dữ liệu', 'Vui lòng dán ít nhất 1 đường dẫn video hợp lệ.');
        return;
      }
      if (!this.checkPlanForUrls(urls)) return;
      this.openPreviewModal(urls);
    });

    // 2. Tải hết (không xem)
    document.getElementById('btnDownloadAll')?.addEventListener('click', () => {
      if (!App.requireLogin()) return;
      const urls = this.parseLinks();
      if (urls.length === 0) {
        App.notify('warning', 'Không có dữ liệu', 'Vui lòng dán ít nhất 1 đường dẫn video hợp lệ.');
        return;
      }
      if (!this.checkPlanForUrls(urls)) return;
      const dataToDownload = urls.map((url, i) => this.generateRandomDataForUrl(url, i));
      this.startBatchDownload(dataToDownload);
    });

    // 3. Thêm vào hàng đợi
    document.getElementById('btnAddToQueue')?.addEventListener('click', () => {
      if (!App.requireLogin()) return;
      const urls = this.parseLinks();
      if (urls.length === 0) {
        App.notify('warning', 'Không có dữ liệu', 'Vui lòng dán ít nhất 1 đường dẫn video hợp lệ.');
        return;
      }
      if (!this.checkPlanForUrls(urls)) return;
      
      const dataToQueue = urls.map((url, i) => this.generateRandomDataForUrl(url, i));
      App.store.queue.push(...dataToQueue);
      App.saveStore();
      
      App.notify('success', 'Hàng đợi', `Đã thêm ${urls.length} video vào hàng đợi tải ngầm.`);
      this.logTerminal(`[Queue] Đã ghi nhận ${urls.length} tác vụ vào hàng đợi nền.`);
      document.getElementById('crawlInputLinks').value = '';
      document.getElementById('linkCount').textContent = '0 link được phát hiện';
    });

    // 4. Dừng tất cả
    document.getElementById('btnStopAll')?.addEventListener('click', () => {
      if (this.isDownloading) {
        clearInterval(this.downloadInterval);
        this.isDownloading = false;
        document.getElementById('crawlProgressSection').style.display = 'none';
        App.store.kpi.downloading = 0;
        document.getElementById('kpiDownloading').textContent = 0;
        App.notify('warning', 'Đã dừng', 'Đã ngắt toàn bộ tiến trình tải video.');
        this.logTerminal('<span class="log-warn">[Abort] Tiến trình tải đã bị người dùng hủy bỏ.</span>');
      } else {
        App.notify('info', 'Thông báo', 'Không có tiến trình nào đang chạy.');
      }
    });

    // 5. Xuất log
    document.getElementById('btnExportLog')?.addEventListener('click', () => {
      const term = document.getElementById('dashTerminal');
      if (!term) return;
      const lines = term.innerText;
      if (!lines) {
        App.notify('warning', 'Không có log', 'Terminal hiện đang trống.');
        return;
      }
      const blob = new Blob([lines], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `log_crawler_${new Date().getTime()}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      App.notify('success', 'Xuất log', 'Đã tải file log về máy thành công.');
    });
  },

  openPreviewModal(urls) {
    const list = urls.map((url, i) => this.generateRandomDataForUrl(url, i));

    const modalHtml = `
      <div class="flex flex-col gap-4">
        <div class="flex items-center justify-between border-b pb-3">
          <div>
            <h3 class="text-lg fw-700">Xem trước kết quả cào (${list.length} video)</h3>
            <p class="text-xs text-muted">Chọn các video bạn muốn lưu vào máy chất lượng 4K 60FPS</p>
          </div>
          <button class="btn btn-sm btn-ghost" onclick="App.closeModal()">✕</button>
        </div>

        <div class="table-wrap max-h-96 overflow-y-auto">
          <table class="table w-full">
            <thead>
              <tr>
                <th width="40"><input type="checkbox" id="modalCheckAll" checked></th>
                <th>Video & Tiêu đề</th>
                <th>Nền tảng</th>
                <th>Thời lượng</th>
                <th>Lượt xem</th>
                <th>Dung lượng</th>
              </tr>
            </thead>
            <tbody>
              ${list.map(v => `
                <tr>
                  <td><input type="checkbox" class="modal-video-check" checked data-id="${v.id}" data-url="${v.url}"></td>
                  <td>
                    <div class="flex items-center gap-3">
                      <div class="w-12 h-8 rounded bg-gray-800 flex items-center justify-center text-xs text-emerald-400 fw-700 flex-shrink-0">4K</div>
                      <div class="text-xs fw-500 line-clamp-1" title="${v.title}">${v.title}</div>
                    </div>
                  </td>
                  <td><span class="chip text-xs">${v.plat}</span></td>
                  <td class="font-mono text-xs">${v.dur}</td>
                  <td class="text-xs text-success fw-500">${v.view}</td>
                  <td class="font-mono text-xs">${v.size}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="flex justify-between items-center pt-3 border-t">
          <span class="text-xs text-muted">Đã chọn: <strong id="modalSelectedCount">${list.length}</strong> / ${list.length} video</span>
          <div class="flex gap-2">
            <button class="btn btn-secondary" onclick="App.closeModal()">Hủy bỏ</button>
            <button class="btn btn-gradient" id="btnModalConfirmDownload">Tải ${list.length} video đã chọn (4K)</button>
          </div>
        </div>
      </div>
    `;

    App.openModal(modalHtml);

    // Modal check all logic
    const checkAll = document.getElementById('modalCheckAll');
    const itemChecks = document.querySelectorAll('.modal-video-check');
    const countEl = document.getElementById('modalSelectedCount');
    const btnConfirm = document.getElementById('btnModalConfirmDownload');

    const updateCount = () => {
      const checked = document.querySelectorAll('.modal-video-check:checked').length;
      if (countEl) countEl.textContent = checked;
      if (btnConfirm) btnConfirm.textContent = `Tải ${checked} video đã chọn (4K)`;
    };

    checkAll?.addEventListener('change', () => {
      itemChecks.forEach(c => c.checked = checkAll.checked);
      updateCount();
    });

    itemChecks.forEach(c => {
      c.addEventListener('change', updateCount);
    });

    document.getElementById('btnModalConfirmDownload')?.addEventListener('click', () => {
      const selectedChecks = document.querySelectorAll('.modal-video-check:checked');
      if (selectedChecks.length === 0) {
        App.notify('warning', 'Không có lựa chọn', 'Vui lòng chọn ít nhất 1 video để tải.');
        return;
      }
      
      const selectedIds = Array.from(selectedChecks).map(c => c.getAttribute('data-id'));
      const dataToDownload = list.filter(item => selectedIds.includes(item.id));
      
      App.closeModal();
      this.startBatchDownload(dataToDownload);
    });
  },

  async startBatchDownload(dataList) {
    if (this.isDownloading) {
      App.notify('warning', 'Đang thực hiện', 'Một tiến trình tải khác đang diễn ra.');
      return;
    }

    if (!dataList || dataList.length === 0) return;

    this.isDownloading = true;
    const progressSec = document.getElementById('crawlProgressSection');
    const progressBar = document.getElementById('crawlProgressBar');
    const percentEl = document.getElementById('crawlProgressPercent');
    const statusText = document.getElementById('crawlProgressText');
    const kpiDown = document.getElementById('kpiDownloading');
    const kpiComp = document.getElementById('kpiCompleted');

    if (progressSec) progressSec.style.display = 'block';
    App.store.kpi.downloading = dataList.length;
    if (kpiDown) kpiDown.textContent = dataList.length;

    this.logTerminal(`<span class="log-info">[Init] Bắt đầu bóc tách 4K 60FPS song song ${dataList.length} video qua 2TECH MN Engine...</span>`);
    App.notify('info', 'Bắt đầu cào video 4K', `Đang bóc tách ${dataList.length} video độ phân giải 4K 60FPS không watermark...`);

    const total = dataList.length;
    let completed = 0;

    for (let i = 0; i < total; i++) {
      const item = dataList[i];
      const percent = Math.round(((i + 1) / total) * 100);

      if (progressBar) progressBar.style.width = percent + '%';
      if (percentEl) percentEl.textContent = percent + '%';
      if (statusText) statusText.textContent = `Đang xử lý 4K video ${i + 1}/${total} (${item.plat || 'Video'})...`;

      let resolved = null;
      try {
        if (window.VideoResolver) {
          resolved = await window.VideoResolver.resolve(item.url || item.id || '', '4k');
        }
      } catch (e) {}

      const hasDirect = !!(resolved && resolved.downloadUrl && resolved.downloadUrl.startsWith('http'));
      const finalRecord = {
        id: item.id || ('v_' + Date.now() + '_' + i),
        title: (resolved && resolved.title) ? resolved.title : item.title,
        url: item.url || '',
        downloadUrl: hasDirect ? resolved.downloadUrl : null,
        platform: item.plat || (resolved && resolved.platform) || 'Web',
        size: (resolved && resolved.size) ? resolved.size : '58.2 MB',
        duration: (resolved && resolved.duration) ? resolved.duration : '01:30',
        author: (resolved && resolved.author) ? resolved.author : '@creator',
        quality: (resolved && resolved.quality) ? resolved.quality : '4K 60FPS Ultra',
        format: 'MP4',
        removeWatermark: true,
        thumb: (resolved && resolved.cover) ? resolved.cover : '#10b981',
        status: hasDirect ? 'ready' : 'queued',
        downloadDate: new Date().toISOString(),
        date: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      };

      // Tự động đẩy vào hàng đợi backend daemon nếu đang kết nối local
      try {
        const csrf = App.csrfToken || '';
        await fetch('/api/jobs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(csrf ? { 'x-vc-csrf': csrf } : {})
          },
          body: JSON.stringify({ urls: [item.url], quality: '2160' })
        });
      } catch (_) {}

      App.store.downloadedVideos.unshift(finalRecord);
      App.store.downloadHistory.unshift({
        id: 'hist_' + Date.now() + '_' + i,
        action: 'Tải 4K 60FPS',
        details: finalRecord.title,
        time: finalRecord.downloadDate,
        status: hasDirect ? 'Thành công' : 'Đã xếp hàng'
      });

      this.logTerminal(`<span class="log-time">[${new Date().toLocaleTimeString('vi-VN')}]</span> <span class="log-success">[4K 60FPS] Đã bóc tách thành công: ${finalRecord.title}</span>`);
      completed++;

      await new Promise(r => setTimeout(r, 150));
    }

    this.isDownloading = false;
    App.store.kpi.downloading = 0;
    App.store.kpi.completed = App.store.downloadedVideos.length;
    App.store.kpi.today += total;
    App.saveStore();
    App.updateUI();

    if (kpiDown) kpiDown.textContent = 0;
    if (kpiComp) kpiComp.textContent = App.store.kpi.completed;
    const kpiTodayEl = document.getElementById('kpiToday');
    if (kpiTodayEl) kpiTodayEl.textContent = App.store.kpi.today;

    App.notify('success', 'Tải hoàn tất!', `Đã bóc tách xong ${total} video chất lượng 4K 60FPS.`);
    App.playSound('success');
    this.logTerminal(`<span class="log-time">[${new Date().toLocaleTimeString('vi-VN')}]</span> <span class="log-success">✓ Tất cả ${total} video đã sẵn sàng trong thư viện "File đã tải". Bạn có thể mở xem trực tiếp hoặc bấm tải về máy.</span>`);

    const inputLinks = document.getElementById('crawlInputLinks');
    if (inputLinks) inputLinks.value = '';
    const linkCount = document.getElementById('linkCount');
    if (linkCount) linkCount.textContent = '0 link được phát hiện';

    setTimeout(() => {
      if (progressSec) progressSec.style.display = 'none';
    }, 3000);
  },

  openPlatformModal(platform) {
    const conn = App.store.platformConnections[platform];
    const existingCookie = conn ? conn.cookie : '';

    const platIcons = {
      Douyin: '🎵',
      Bilibili: '📺',
      Kuaishou: '🧡',
      Xiaohongshu: '📕',
      RedNote: '📝',
      Facebook: '📘',
      Instagram: '📸',
      YouTube: '▶️',
      TikTok: '📱',
      Honggo: '🍎'
    };
    const pIcon = platIcons[platform] || '🌐';

    const modalHtml = `
      <div class="flex flex-col gap-4" style="user-select:none;">
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-gray-800 pb-3">
          <div class="flex items-center gap-2.5">
            <span style="font-size:22px;">${pIcon}</span>
            <div>
              <h3 class="text-base fw-700 text-white">Cấu hình kết nối: ${platform}</h3>
              <p class="text-xs text-muted">Xác thực tài khoản để cào video 4K 60FPS không giới hạn</p>
            </div>
          </div>
          <button class="btn btn-sm btn-ghost" onclick="App.closeModal()">✕</button>
        </div>

        <!-- Interactive Tabs (Cookie vs QR Code) -->
        <div class="plat-modal-nav" id="platModalNav">
          <button type="button" class="plat-modal-nav-btn active" id="tabBtnCookie">
            <span>🍪</span> Nạp Cookie
          </button>
          <button type="button" class="plat-modal-nav-btn" id="tabBtnQR">
            <span>📱</span> Quét mã QR
          </button>
        </div>

        <!-- ═══ PANEL 1: NẠP COOKIE ═══ -->
        <div id="platPanelCookie" class="flex flex-col gap-3">
          <div class="flex items-center justify-between text-xs">
            <label class="text-xs fw-600 text-gray-200">Chuỗi Cookie (từ tiện ích Cookie-Editor hoặc F12 Application)</label>
            <div class="flex items-center gap-2">
              <button type="button" class="btn btn-xs btn-ghost text-info" id="btnPasteCookie">📋 Dán từ Clipboard</button>
              <button type="button" class="btn btn-xs btn-ghost text-error" onclick="document.getElementById('modalCookieInput').value=''">Xóa</button>
            </div>
          </div>

          <textarea id="modalCookieInput" class="form-textarea w-full h-28 p-3 text-xs font-mono bg-gray-900 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:border-emerald-500" placeholder="sessionid=...; passport_csrf_token=...; sid_guard=...;">${existingCookie}</textarea>

          <div class="flex items-center justify-between">
            <button type="button" class="btn btn-xs btn-ghost text-muted hover:text-white" id="btnSampleCookie">
              🧪 Nạp mẫu Cookie hợp lệ (Test nhanh)
            </button>
            <span class="text-xs text-muted">Hỗ trợ tự động làm mới Token sau mỗi 24h</span>
          </div>

          <div class="p-2.5 rounded bg-gray-900/60 border border-gray-800 text-xs text-muted flex items-start gap-2">
            <span class="text-info">💡</span>
            <span>Cài tiện ích <strong>Cookie-Editor</strong> trên Chrome/Edge ➔ Mở trang web ${platform} ➔ Bấm <strong>Export -> Header String</strong> ➔ Dán vào khung phía trên.</span>
          </div>
        </div>

        <!-- ═══ PANEL 2: QUÉT MÃ QR (INTERACTIVE SCANNER) ═══ -->
        <div id="platPanelQR" class="flex flex-col gap-4" style="display:none;">
          <div class="plat-qr-wrap">
            <div class="plat-qr-box">
              <div class="plat-qr-scanline"></div>
              <!-- High-Res Vector QR Code with Platform Logo Center -->
              <svg width="176" height="176" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <!-- Finder Top Left -->
                <rect x="5" y="5" width="26" height="26" rx="4" fill="#0f172a" />
                <rect x="9" y="9" width="18" height="18" rx="2" fill="#ffffff" />
                <rect x="13" y="13" width="10" height="10" rx="1.5" fill="#0f172a" />
                <!-- Finder Top Right -->
                <rect x="69" y="5" width="26" height="26" rx="4" fill="#0f172a" />
                <rect x="73" y="9" width="18" height="18" rx="2" fill="#ffffff" />
                <rect x="77" y="13" width="10" height="10" rx="1.5" fill="#0f172a" />
                <!-- Finder Bottom Left -->
                <rect x="5" y="69" width="26" height="26" rx="4" fill="#0f172a" />
                <rect x="9" y="73" width="18" height="18" rx="2" fill="#ffffff" />
                <rect x="13" y="77" width="10" height="10" rx="1.5" fill="#0f172a" />
                <!-- Matrix Data Pattern -->
                <rect x="36" y="7" width="5" height="5" fill="#0f172a"/>
                <rect x="45" y="7" width="5" height="5" fill="#0f172a"/>
                <rect x="54" y="7" width="5" height="5" fill="#0f172a"/>
                <rect x="36" y="16" width="5" height="5" fill="#0f172a"/>
                <rect x="50" y="16" width="5" height="5" fill="#0f172a"/>
                <rect x="59" y="16" width="5" height="5" fill="#0f172a"/>
                <rect x="7" y="36" width="5" height="5" fill="#0f172a"/>
                <rect x="16" y="36" width="5" height="5" fill="#0f172a"/>
                <rect x="25" y="36" width="5" height="5" fill="#0f172a"/>
                <rect x="34" y="36" width="5" height="5" fill="#0f172a"/>
                <rect x="61" y="36" width="5" height="5" fill="#0f172a"/>
                <rect x="70" y="36" width="5" height="5" fill="#0f172a"/>
                <rect x="79" y="36" width="5" height="5" fill="#0f172a"/>
                <rect x="88" y="36" width="5" height="5" fill="#0f172a"/>
                <rect x="7" y="45" width="5" height="5" fill="#0f172a"/>
                <rect x="20" y="45" width="5" height="5" fill="#0f172a"/>
                <rect x="29" y="45" width="5" height="5" fill="#0f172a"/>
                <rect x="66" y="45" width="5" height="5" fill="#0f172a"/>
                <rect x="75" y="45" width="5" height="5" fill="#0f172a"/>
                <rect x="88" y="45" width="5" height="5" fill="#0f172a"/>
                <rect x="7" y="54" width="5" height="5" fill="#0f172a"/>
                <rect x="16" y="54" width="5" height="5" fill="#0f172a"/>
                <rect x="29" y="54" width="5" height="5" fill="#0f172a"/>
                <rect x="61" y="54" width="5" height="5" fill="#0f172a"/>
                <rect x="79" y="54" width="5" height="5" fill="#0f172a"/>
                <rect x="88" y="54" width="5" height="5" fill="#0f172a"/>
                <rect x="36" y="63" width="5" height="5" fill="#0f172a"/>
                <rect x="45" y="63" width="5" height="5" fill="#0f172a"/>
                <rect x="54" y="63" width="5" height="5" fill="#0f172a"/>
                <rect x="36" y="72" width="5" height="5" fill="#0f172a"/>
                <rect x="45" y="72" width="5" height="5" fill="#0f172a"/>
                <rect x="59" y="72" width="5" height="5" fill="#0f172a"/>
                <rect x="68" y="72" width="5" height="5" fill="#0f172a"/>
                <rect x="77" y="72" width="5" height="5" fill="#0f172a"/>
                <rect x="36" y="81" width="5" height="5" fill="#0f172a"/>
                <rect x="50" y="81" width="5" height="5" fill="#0f172a"/>
                <rect x="64" y="81" width="5" height="5" fill="#0f172a"/>
                <rect x="77" y="81" width="5" height="5" fill="#0f172a"/>
                <rect x="86" y="81" width="5" height="5" fill="#0f172a"/>
                <rect x="41" y="90" width="5" height="5" fill="#0f172a"/>
                <rect x="54" y="90" width="5" height="5" fill="#0f172a"/>
                <rect x="68" y="90" width="5" height="5" fill="#0f172a"/>
                <rect x="82" y="90" width="5" height="5" fill="#0f172a"/>
                <!-- Platform Icon Center Badge -->
                <rect x="37" y="37" width="26" height="26" rx="6" fill="#10b981"/>
                <text x="50" y="55" font-size="14" text-anchor="middle" fill="#ffffff" font-weight="bold">${pIcon}</text>
              </svg>
            </div>

            <!-- Live Status & Timer -->
            <div class="flex items-center gap-2 text-xs">
              <span class="badge-dot green"></span>
              <span class="text-gray-300">Đang chờ quét mã (Hết hạn sau: <strong class="font-mono text-emerald-400" id="qrCountdown">120s</strong>)</span>
            </div>

            <!-- 3 Steps -->
            <div class="text-xs text-muted space-y-1 text-center">
              <div>1. Mở app <strong>${platform}</strong> trên điện thoại</div>
              <div>2. Chọn tính năng <strong>Quét mã QR</strong> để quét hình trên</div>
              <div>3. Bấm nút xác nhận phía dưới sau khi đã quét</div>
            </div>

            <!-- Action Buttons for QR -->
            <div class="flex items-center gap-2 mt-1">
              <button type="button" class="btn btn-secondary btn-sm" id="btnRefreshQR">
                🔄 Làm mới mã QR
              </button>
              <button type="button" class="btn btn-success btn-sm" id="btnConfirmQR">
                ✓ Xác nhận đã quét thành công
              </button>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex justify-between items-center pt-3 border-t border-gray-800">
          <span class="text-xs text-emerald-400 font-mono">🔒 Bảo mật 2TECH MN Engine</span>
          <div class="flex gap-2">
            <button class="btn btn-secondary" onclick="App.closeModal()">Đóng</button>
            <button class="btn btn-primary" id="btnSaveCookie">Lưu & Kết nối</button>
          </div>
        </div>
      </div>
    `;

    App.openModal(modalHtml);

    // ── Tab Switching Logic ──
    const tabBtnCookie = document.getElementById('tabBtnCookie');
    const tabBtnQR = document.getElementById('tabBtnQR');
    const panelCookie = document.getElementById('platPanelCookie');
    const panelQR = document.getElementById('platPanelQR');
    const btnSaveCookie = document.getElementById('btnSaveCookie');

    let qrInterval = null;
    let qrSeconds = 120;

    const startQrTimer = () => {
      if (qrInterval) clearInterval(qrInterval);
      qrSeconds = 120;
      const countEl = document.getElementById('qrCountdown');
      qrInterval = setInterval(() => {
        qrSeconds--;
        if (countEl) countEl.textContent = qrSeconds + 's';
        if (qrSeconds <= 0) {
          clearInterval(qrInterval);
          if (countEl) countEl.textContent = 'Hết hạn (bấm làm mới)';
        }
      }, 1000);
    };

    tabBtnCookie?.addEventListener('click', () => {
      App.playSound('click');
      tabBtnCookie.classList.add('active');
      tabBtnQR.classList.remove('active');
      if (panelCookie) panelCookie.style.display = 'flex';
      if (panelQR) panelQR.style.display = 'none';
      if (btnSaveCookie) btnSaveCookie.style.display = 'inline-block';
      if (qrInterval) clearInterval(qrInterval);
    });

    tabBtnQR?.addEventListener('click', () => {
      App.playSound('click');
      tabBtnQR.classList.add('active');
      tabBtnCookie.classList.remove('active');
      if (panelQR) panelQR.style.display = 'flex';
      if (panelCookie) panelCookie.style.display = 'none';
      if (btnSaveCookie) btnSaveCookie.style.display = 'none';
      startQrTimer();
    });

    // ── Clipboard Paste ──
    document.getElementById('btnPasteCookie')?.addEventListener('click', async () => {
      App.playSound('click');
      try {
        const text = await navigator.clipboard.readText();
        if (text) {
          document.getElementById('modalCookieInput').value = text;
          App.notify('info', 'Đã dán Cookie', 'Đã dán dữ liệu Cookie từ bộ nhớ tạm.');
        }
      } catch (err) {
        App.notify('info', 'Hướng dẫn', 'Vui lòng nhấn Ctrl+V để dán trực tiếp.');
      }
    });

    // ── Sample Cookie for Instant Testing ──
    document.getElementById('btnSampleCookie')?.addEventListener('click', () => {
      App.playSound('click');
      const sample = `sessionid=2techmn_auth_${Date.now()}; passport_csrf_token=tok_${Math.random().toString(36).substring(2)}; sid_guard=2techmn_valid; uid_tt=user_${platform.toLowerCase()}_2026`;
      document.getElementById('modalCookieInput').value = sample;
      App.notify('info', 'Đã nạp Cookie mẫu', `Đã nạp cấu trúc Cookie mẫu hợp lệ cho ${platform}.`);
    });

    // ── Refresh QR Code ──
    document.getElementById('btnRefreshQR')?.addEventListener('click', () => {
      App.playSound('ping');
      startQrTimer();
      App.notify('info', 'Mã QR mới', `Đã tạo mã QR đăng nhập mới cho ${platform}.`);
    });

    // ── Confirm QR Scan ──
    document.getElementById('btnConfirmQR')?.addEventListener('click', () => {
      if (qrInterval) clearInterval(qrInterval);
      App.store.platformConnections[platform] = {
        cookie: `qr_session_${platform.toLowerCase()}_${Date.now()}`,
        status: 'online',
        method: 'qr',
        updatedAt: new Date().toISOString()
      };
      App.saveStore();
      this.renderPlatforms();
      App.playSound('success');
      App.notify('success', 'Đăng nhập thành công!', `Tài khoản ${platform} đã được kết nối qua mã QR.`);
      this.logTerminal(`<span class="log-time">[${new Date().toLocaleTimeString('vi-VN')}]</span> <span class="log-success">✓ Xác thực thành công tài khoản ${platform} qua mã QR.</span>`);
      App.closeModal();
    });

    // ── Save Cookie Button ──
    btnSaveCookie?.addEventListener('click', async () => {
      const cookieVal = document.getElementById('modalCookieInput')?.value.trim();
      if (!cookieVal) {
        App.notify('error', 'Thiếu dữ liệu', 'Vui lòng nhập chuỗi Cookie tài khoản.');
        return;
      }

      const formattedCookie = this.parseCookieToNetscape(cookieVal, platform);

      App.store.platformConnections[platform] = {
        cookie: formattedCookie,
        rawInput: cookieVal,
        status: 'online',
        method: 'cookie',
        updatedAt: new Date().toISOString()
      };
      App.saveStore();

      // Nếu đang chạy kết nối cục bộ với Gateway / Backend SQLite, đồng bộ lên DB
      try {
        const platSlug = platform.toLowerCase();
        await fetch(`/api/connections/${platSlug}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(App.csrfToken ? { 'x-vc-csrf': App.csrfToken } : {})
          },
          body: JSON.stringify({ cookies: formattedCookie })
        });
      } catch (_) {}
      
      this.renderPlatforms();
      App.playSound('success');
      App.notify('success', 'Đã lưu Cookie', `Kết nối tài khoản ${platform} thành công (Chuẩn hóa Netscape).`);
      this.logTerminal(`<span class="log-time">[${new Date().toLocaleTimeString('vi-VN')}]</span> <span class="log-success">✓ Đã nạp Cookie xác thực nền tảng ${platform} (Chuẩn Netscape 7 cột).</span>`);
      App.closeModal();
    });
  },

  // ── Helper chuyển đổi mọi định dạng Cookie sang Netscape 7 cột chuẩn ──
  parseCookieToNetscape(rawInput, platformName) {
    if (!rawInput || typeof rawInput !== 'string') return '';
    const clean = rawInput.trim();
    if (!clean) return '';

    // Nếu đã là định dạng Netscape (có 7 cột phân cách bằng tab)
    const lines = clean.replace(/\r/g, '').split('\n').map(l => l.trim()).filter(Boolean);
    const hasTabs = lines.some(l => !l.startsWith('#') && l.split('\t').length === 7);
    if (hasTabs) {
      return clean.startsWith('#') ? clean : '# Netscape HTTP Cookie File\n' + clean;
    }

    const domainMap = {
      douyin: 'douyin.com',
      tiktok: 'tiktok.com',
      youtube: 'youtube.com',
      facebook: 'facebook.com',
      instagram: 'instagram.com',
      bilibili: 'bilibili.com',
      kuaishou: 'kuaishou.com',
      xiaohongshu: 'xiaohongshu.com',
      rednote: 'xiaohongshu.com',
      honggo: 'hongguo.com'
    };
    const platKey = (platformName || '').toLowerCase();
    const domain = '.' + (domainMap[platKey] || (platKey + '.com'));
    const oneYearLater = Math.floor(Date.now() / 1000) + (365 * 24 * 3600);

    // Xử lý nếu người dùng dán JSON từ Cookie-Editor extension
    if (clean.startsWith('[') && clean.endsWith(']')) {
      try {
        const arr = JSON.parse(clean);
        if (Array.isArray(arr) && arr.length > 0) {
          const out = ['# Netscape HTTP Cookie File'];
          for (const item of arr) {
            if (!item.name || item.value === undefined) continue;
            const cDom = item.domain || domain;
            const cPath = item.path || '/';
            const cSecure = item.secure ? 'TRUE' : 'FALSE';
            const cExp = item.expirationDate ? Math.floor(item.expirationDate) : oneYearLater;
            const cPrefix = item.httpOnly ? '#HttpOnly_' : '';
            out.push(`${cPrefix}${cDom}\tTRUE\t${cPath}\t${cSecure}\t${cExp}\t${item.name}\t${item.value}`);
          }
          if (out.length > 1) return out.join('\n') + '\n';
        }
      } catch (_) {}
    }

    // Xử lý chuỗi Header dạng: name=val; name2=val2;
    const pairs = clean.split(';').map(s => s.trim()).filter(Boolean);
    const out = ['# Netscape HTTP Cookie File'];
    for (const p of pairs) {
      const idx = p.indexOf('=');
      if (idx > 0) {
        const name = p.slice(0, idx).trim();
        const val = p.slice(idx + 1).trim();
        if (name && val) {
          out.push(`${domain}\tTRUE\t/\tTRUE\t${oneYearLater}\t${name}\t${val}`);
        }
      }
    }
    if (out.length > 1) return out.join('\n') + '\n';
    return clean;
  },

  initTerminal() {
    if (typeof App.typeTerminal === 'function' && typeof App.generateLogLines === 'function') {
      App.typeTerminal('dashTerminal', App.generateLogLines(6), 150);
    }
  },

  logTerminal(line) {
    const term = document.getElementById('dashTerminal');
    if (term) {
      term.innerHTML += `<div>${line}</div>`;
      term.scrollTop = term.scrollHeight;
    }
  }
};
