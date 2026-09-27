/* ═══════════════════════════════════════════════════════════════
   ViralCrawl — Page: Tải ngay (Dashboard / Multi-Platform Scraper)
   ═══════════════════════════════════════════════════════════════ */

window.Pages = window.Pages || {};
window.Pages['dashboard'] = {
  activeTab: 'tab-link',
  isDownloading: false,
  downloadInterval: null,

  render() {
    App.store.kpi = App.store.kpi || { today: 0, downloading: 0, completed: 0, error: 0 };
    App.store.downloadedVideos = App.store.downloadedVideos || [];
    App.store.downloadHistory = App.store.downloadHistory || [];
    App.store.platformConnections = App.store.platformConnections || {};
    App.store.queue = App.store.queue || [];
    
    const kpi = App.store.kpi;
    return `
      <div class="flex flex-col gap-6">
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl fw-700">Tải ngay (Multi-Platform Scraper)</h1>
            <p class="text-sm text-muted mt-1">Cào video tự động từ 10+ nền tảng — lọc video xu hướng, tải sạch watermark, khử trùng lặp</p>
          </div>
          <div class="flex items-center gap-3">
            <span class="badge badge-neutral"><span class="badge-dot green"></span> Server AI 2TECH MN: Hoạt động</span>
            <button class="btn btn-secondary btn-sm" id="btnRefreshStats" title="Cập nhật chỉ số">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
              Làm mới
            </button>
          </div>
        </div>
        
        <!-- KPI Stats -->
        <div class="kpi-grid grid gap-4" style="grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));">
          <div class="kpi-card card p-4">
            <div class="kpi-label text-muted text-xs uppercase tracking-wide">Video hôm nay</div>
            <div class="kpi-value text-2xl fw-700 mt-1" id="kpiToday">${kpi.today}</div>
          </div>
          <div class="kpi-card card p-4">
            <div class="kpi-label text-muted text-xs uppercase tracking-wide">Đang tải</div>
            <div class="kpi-value text-2xl fw-700 mt-1 text-info" id="kpiDownloading">${kpi.downloading}</div>
          </div>
          <div class="kpi-card card p-4">
            <div class="kpi-label text-muted text-xs uppercase tracking-wide">Đã hoàn thành</div>
            <div class="kpi-value text-2xl fw-700 mt-1 text-success" id="kpiCompleted">${kpi.completed}</div>
          </div>
          <div class="kpi-card card p-4">
            <div class="kpi-label text-muted text-xs uppercase tracking-wide">Lỗi / Bỏ qua</div>
            <div class="kpi-value text-2xl fw-700 mt-1 text-muted" id="kpiError">${kpi.error}</div>
          </div>
          <div class="kpi-card card p-4">
            <div class="kpi-label text-muted text-xs uppercase tracking-wide">Thời gian chạy</div>
            <div class="kpi-value text-xl fw-700 mt-1 font-mono text-warning" id="dashUptime">0m 0s</div>
          </div>
        </div>

        <!-- Platform Login Section (10+ platforms) -->
        <div class="card p-5">
          <div class="flex justify-between items-center mb-4">
            <div>
              <h2 class="card-title text-base fw-600">Trạng thái kết nối nền tảng</h2>
              <p class="text-xs text-muted">Nhấn vào từng nền tảng để nạp Cookie hoặc quét mã QR đăng nhập</p>
            </div>
            <span class="text-xs text-muted">Hỗ trợ 10+ mạng xã hội hot nhất 2026</span>
          </div>
          <div class="platform-list grid gap-3" id="platformListContainer" style="grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));">
            <!-- Rendered via JS -->
          </div>
        </div>

        <!-- Crawl Setup Section -->
        <div class="card p-5">
          <div class="tabs flex gap-4 border-b border-gray-700 mb-4" id="crawlTabs">
            <button class="tab active text-sm fw-600 pb-2 border-b-2 border-accent text-accent" data-target="tab-link">🔗 Theo link</button>
            <button class="tab text-sm fw-600 pb-2 border-b-2 border-transparent text-muted hover:text-white" data-target="tab-keyword">🔍 Theo từ khoá</button>
            <button class="tab text-sm fw-600 pb-2 border-b-2 border-transparent text-muted hover:text-white" data-target="tab-channel">👤 Theo kênh</button>
            <button class="tab text-sm fw-600 pb-2 border-b-2 border-transparent text-muted hover:text-white" data-target="tab-playlist">📁 Theo bộ / Playlist</button>
          </div>
          
          <div class="tab-content relative min-h-[160px]">
            <!-- Tab 1: Theo Link -->
            <div id="tab-link" class="tab-panel active flex flex-col gap-3">
              <div class="flex justify-between items-center text-xs text-muted">
                <span>Dán danh sách link video (hỗ trợ Douyin, TikTok, YouTube Shorts, FB Reels, Xiaohongshu, Kuaishou, Bilibili...)</span>
                <span id="linkCount">0 link được phát hiện</span>
              </div>
              <textarea id="crawlInputLinks" class="form-textarea w-full p-3 rounded bg-gray-800 border border-gray-700 text-sm h-32 font-mono" placeholder="Dán link video tại đây (mỗi dòng 1 link)...
Ví dụ:
https://v.douyin.com/iRoLkd1/
https://www.tiktok.com/@shoptool_ai/video/7689771314827005205
https://youtube.com/shorts/abcxyz123"></textarea>
              <div class="flex items-center gap-2">
                <button class="btn btn-ghost btn-sm text-error" onclick="document.getElementById('crawlInputLinks').value='';document.getElementById('linkCount').textContent='0 link được phát hiện';">Xóa trắng</button>
              </div>
            </div>

            <!-- Tab 2: Theo Từ Khóa -->
            <div id="tab-keyword" class="tab-panel" style="display:none;">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="form-group flex flex-col gap-2">
                  <label class="form-label text-sm fw-500">Từ khoá tìm kiếm</label>
                  <input type="text" id="crawlKeyword" class="form-input p-2 rounded bg-gray-800 border border-gray-700 text-sm" placeholder="Nhập từ khoá (Tiếng Việt hoặc Tiếng Trung)..." value="câu cá sinh tồn hoang dã">
                  
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
                    <select class="form-select p-2 rounded bg-gray-800 border border-gray-700 text-sm" id="crawlPlatSelect">
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
                    <input type="number" id="crawlKeywordCount" class="num-spinner form-input p-2 rounded bg-gray-800 border border-gray-700 text-sm" value="50" min="5" max="500">
                  </div>
                </div>
              </div>
            </div>

            <!-- Tab 3: Theo Kênh -->
            <div id="tab-channel" class="tab-panel" style="display:none;">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="form-group flex flex-col gap-2">
                  <label class="form-label text-sm fw-500">URL Kênh hoặc ID Creator</label>
                  <input type="text" id="crawlChannelUrl" class="form-input p-2 rounded bg-gray-800 border border-gray-700 text-sm" placeholder="https://www.douyin.com/user/MS4wLjAB..." value="">
                  <span class="text-xs text-muted">Hỗ trợ quét trọn bộ video của Creator hoặc tự động cập nhật video mới nhất</span>
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div class="form-group flex flex-col gap-2">
                    <label class="form-label text-sm fw-500">Số video lấy tối đa</label>
                    <input type="number" id="crawlChannelMax" class="num-spinner form-input p-2 rounded bg-gray-800 border border-gray-700 text-sm" value="100">
                  </div>
                  <div class="form-group flex flex-col gap-2">
                    <label class="form-label text-sm fw-500">Trạng thái theo dõi</label>
                    <label class="flex items-center gap-2 mt-2 cursor-pointer">
                      <div class="toggle"><input type="checkbox" id="checkAutoFollow" checked><div class="toggle-track"></div></div>
                      <span class="text-xs">Tự động thêm vào mục Theo dõi kênh</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <!-- Tab 4: Theo Bộ -->
            <div id="tab-playlist" class="tab-panel" style="display:none;">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="form-group flex flex-col gap-2">
                  <label class="form-label text-sm fw-500">URL Bộ sưu tập / Phim ngắn / Playlist</label>
                  <input type="text" id="crawlPlaylistUrl" class="form-input p-2 rounded bg-gray-800 border border-gray-700 text-sm" placeholder="Nhập link bộ phim ngắn Honggo hoặc playlist Douyin..." value="">
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div class="form-group flex flex-col gap-2">
                    <label class="form-label text-sm fw-500">Số tập lấy</label>
                    <select class="form-select p-2 rounded bg-gray-800 border border-gray-700 text-sm">
                      <option>Toàn bộ các tập (Trọn bộ)</option>
                      <option>10 tập đầu tiên</option>
                      <option>Tập mới nhất</option>
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
          </div>

          <!-- Deep Filters & De-duplication Row -->
          <div class="divider"></div>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <div>
              <label class="text-xs text-muted block mb-1">Thời lượng video</label>
              <select class="form-select text-xs w-full" id="filterDuration">
                <option value="all">Tất cả thời lượng</option>
                <option value="short">Dưới 1 phút (Shorts/Reels)</option>
                <option value="medium">1 - 5 phút (Vlog ngắn)</option>
                <option value="long">5 - 20 phút (Review/Dài tập)</option>
                <option value="extra">Trên 20 phút (Full tập phim)</option>
              </select>
            </div>
            <div>
              <label class="text-xs text-muted block mb-1">Sắp xếp ưu tiên</label>
              <select class="form-select text-xs w-full" id="filterSort">
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
                <span class="text-xs fw-500">Tải không trùng (Bỏ qua video đã có)</span>
              </label>
            </div>
            <div>
              <label class="text-xs text-muted block mb-1">Xóa watermark gốc</label>
              <label class="flex items-center gap-2 mt-1 cursor-pointer">
                <div class="toggle"><input type="checkbox" id="checkCleanWatermark" checked><div class="toggle-track"></div></div>
                <span class="text-xs fw-500 text-success">Lấy link gốc HD không logo</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Download Progress Bar (shown when downloading) -->
        <div id="crawlProgressSection" class="card p-4" style="display:none;">
          <div class="flex justify-between items-center text-sm mb-2">
            <span class="fw-600 flex items-center gap-2 text-info">
              <span class="badge-dot blue"></span> <span id="crawlProgressText">Đang cào video...</span>
            </span>
            <span class="font-mono text-sm fw-600" id="crawlProgressPercent">0%</span>
          </div>
          <div class="progress h-2 bg-gray-800 rounded">
            <div id="crawlProgressBar" class="progress-fill bg-accent h-full" style="width: 0%; transition: width 0.2s;"></div>
          </div>
          <div class="flex justify-between text-xs text-muted mt-2">
            <span id="crawlSpeed">Tốc độ: Đang tính toán...</span>
            <span id="crawlRemaining">Ước tính còn lại: ...</span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-wrap gap-4 items-center">
          <button class="btn btn-gradient btn-lg px-6 py-3 rounded fw-600 flex items-center gap-2" id="btnPreviewSelect">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            Xem trước & chọn
          </button>
          <button class="btn btn-secondary px-5 py-3 rounded flex items-center gap-2" id="btnDownloadAll">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Tải hết (không xem)
          </button>
          <button class="btn btn-secondary px-4 py-3 rounded" id="btnAddToQueue">
            Thêm vào hàng đợi
          </button>
          <button class="btn btn-danger px-4 py-3 rounded ml-auto" id="btnStopAll">
            Dừng tất cả
          </button>
        </div>

        <!-- Terminal Log -->
        <div class="terminal card flex flex-col h-64 bg-black rounded overflow-hidden">
          <div class="terminal-header flex justify-between items-center p-2 bg-gray-800 border-b border-gray-700">
            <div class="flex items-center gap-2">
              <span class="badge-dot green"></span>
              <span class="text-xs fw-600 font-mono text-white">Nhật ký hoạt động Crawler (Realtime Stream)</span>
            </div>
            <div class="flex gap-2">
              <button class="btn btn-sm btn-ghost text-xs text-muted hover:text-white" id="btnExportLog">Xuất log</button>
              <button class="btn btn-sm btn-ghost text-xs text-muted hover:text-white" onclick="document.getElementById('dashTerminal').innerHTML=''">Xóa log</button>
            </div>
          </div>
          <div class="terminal-body flex-1 p-4 overflow-y-auto font-mono text-xs text-gray-300 space-y-1" id="dashTerminal">
            <!-- Terminal entries -->
          </div>
        </div>
      </div>
    `;
  },

  init() {
    this.renderPlatforms();
    this.bindTabs();
    this.bindActions();
    this.initTerminal();

    // Link counter
    const inputLinks = document.getElementById('crawlInputLinks');
    inputLinks?.addEventListener('input', () => {
      const lines = inputLinks.value.split('\n').filter(l => l.trim().length > 0);
      document.getElementById('linkCount').textContent = `${lines.length} link được phát hiện`;
    });

    // Refresh stats
    document.getElementById('btnRefreshStats')?.addEventListener('click', () => {
      App.playSound('ping');
      if(App.store.downloadedVideos) {
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

  renderPlatforms() {
    const container = document.getElementById('platformListContainer');
    if (!container) return;

    const platforms = [
      { id: 'Douyin', name: 'Douyin', icon: '🎵', desc: 'TikTok Trung Quốc', requireLogin: true },
      { id: 'TikTok', name: 'TikTok', icon: '📱', desc: 'Không cần login', bypass: true },
      { id: 'YouTube', name: 'YouTube & Shorts', icon: '▶️', desc: 'Không cần login', bypass: true },
      { id: 'Xiaohongshu', name: 'Xiaohongshu', icon: '📕', desc: 'Tiểu Hồng Thư nội địa', requireLogin: true },
      { id: 'RedNote', name: 'RedNote', icon: '📝', desc: 'XHS Quốc Tế', requireLogin: true },
      { id: 'Kuaishou', name: 'Kuaishou', icon: '🧡', desc: 'Kwai Trung Quốc', requireLogin: true },
      { id: 'Bilibili', name: 'Bilibili', icon: '📺', desc: 'Bilibili TV quốc tế', requireLogin: true },
      { id: 'Honggo', name: 'Honggo', icon: '🍎', desc: 'Web drama / Phim ngắn', requireLogin: true },
      { id: 'Facebook', name: 'Facebook', icon: '📘', desc: 'Reels & Video Page', requireLogin: true },
      { id: 'Instagram', name: 'Instagram', icon: '📸', desc: 'Reels & Post', requireLogin: true }
    ];

    let html = '';
    platforms.forEach(p => {
      let statusClass = 'offline badge-dot red';
      let statusTitle = 'Chưa đăng nhập';
      
      if (p.bypass) {
        statusClass = 'bypass badge-dot blue';
        statusTitle = 'Bypass không cần login';
      } else {
        const conn = App.store.platformConnections[p.id];
        if (conn && conn.status === 'online') {
          statusClass = 'online badge-dot green';
          statusTitle = 'Đã kết nối';
        }
      }

      html += `
        <div class="platform-item card p-3 flex items-center justify-between cursor-pointer" data-platform="${p.id}">
          <div class="flex items-center gap-3">
            <div class="platform-icon text-xl">${p.icon}</div>
            <div>
              <div class="platform-name text-sm fw-600">${p.name}</div>
              <div class="text-xs text-muted">${p.desc}</div>
            </div>
          </div>
          <div class="platform-status ${statusClass}" title="${statusTitle}"></div>
        </div>
      `;
    });

    container.innerHTML = html;
    this.bindPlatforms();
  },

  bindTabs() {
    const tabs = document.querySelectorAll('#crawlTabs .tab');
    const panels = {
      'tab-link': document.getElementById('tab-link'),
      'tab-keyword': document.getElementById('tab-keyword'),
      'tab-channel': document.getElementById('tab-channel'),
      'tab-playlist': document.getElementById('tab-playlist'),
    };

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => {
          t.classList.remove('active', 'border-accent', 'text-accent');
          t.classList.add('border-transparent', 'text-muted');
        });
        Object.values(panels).forEach(p => { if (p) p.style.display = 'none'; });

        tab.classList.add('active', 'border-accent', 'text-accent');
        tab.classList.remove('border-transparent', 'text-muted');

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
    return inputLinks.value.split('\\n')
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
    return 'Khác';
  },

  generateRandomDataForUrl(url, index) {
    const plat = this.extractPlatformFromUrl(url);
    const mockId = `vid_${Date.now()}_${index}`;
    return { 
      id: mockId, 
      url: url,
      title: `Video từ ${plat} - ${mockId}`, 
      plat: plat, 
      dur: '00:' + (Math.floor(Math.random() * 40) + 15).toString().padStart(2, '0'), 
      view: Math.floor(Math.random() * 900 + 100) + 'K', 
      like: Math.floor(Math.random() * 50 + 10) + 'K', 
      size: Math.floor(Math.random() * 50 + 10) + ' MB' 
    };
  },

  bindActions() {
    // 1. Xem trước & chọn Modal
    document.getElementById('btnPreviewSelect')?.addEventListener('click', () => {
      if (!App.requireLogin()) return;
      const urls = this.parseLinks();
      if (urls.length === 0) {
        App.notify('warning', 'Không có dữ liệu', 'Vui lòng nhập ít nhất 1 đường dẫn hợp lệ.');
        return;
      }
      this.openPreviewModal(urls);
    });

    // 2. Tải hết (không xem)
    document.getElementById('btnDownloadAll')?.addEventListener('click', () => {
      if (!App.requireLogin()) return;
      const urls = this.parseLinks();
      if (urls.length === 0) {
        App.notify('warning', 'Không có dữ liệu', 'Vui lòng nhập ít nhất 1 đường dẫn hợp lệ.');
        return;
      }
      const dataToDownload = urls.map((url, i) => this.generateRandomDataForUrl(url, i));
      this.startBatchDownload(dataToDownload);
    });

    // 3. Thêm vào hàng đợi
    document.getElementById('btnAddToQueue')?.addEventListener('click', () => {
      if (!App.requireLogin()) return;
      const urls = this.parseLinks();
      if (urls.length === 0) {
        App.notify('warning', 'Không có dữ liệu', 'Vui lòng nhập ít nhất 1 đường dẫn hợp lệ.');
        return;
      }
      
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
            <p class="text-xs text-muted">Chọn các video bạn muốn lưu vào máy hoặc đưa thẳng vào Studio Render</p>
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
                      <div class="w-12 h-8 rounded bg-gray-800 flex items-center justify-center text-xs text-muted flex-shrink-0">▶ HD</div>
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
            <button class="btn btn-gradient" id="btnModalConfirmDownload">Tải ${list.length} video đã chọn</button>
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
      if (btnConfirm) btnConfirm.textContent = `Tải ${checked} video đã chọn`;
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
      if(selectedChecks.length === 0) {
        App.notify('warning', 'Không có lựa chọn', 'Vui lòng chọn ít nhất 1 video để tải.');
        return;
      }
      
      const selectedIds = Array.from(selectedChecks).map(c => c.getAttribute('data-id'));
      const dataToDownload = list.filter(item => selectedIds.includes(item.id));
      
      App.closeModal();
      this.startBatchDownload(dataToDownload);
    });
  },

  startBatchDownload(dataList) {
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

    let percent = 0;
    this.logTerminal(`<span class="log-info">[Init] Bắt đầu cào song song ${dataList.length} video qua Cloud 2TECH MN...</span>`);
    App.notify('info', 'Bắt đầu cào video', `Đang tải ${dataList.length} video độ phân giải 1080p không logo...`);

    const total = dataList.length;
    let completed = 0;
    const stepAmount = 100 / total;

    this.downloadInterval = setInterval(() => {
      if (completed < total) {
        const item = dataList[completed];
        percent += stepAmount;
        if (percent > 100) percent = 100;
        
        if (progressBar) progressBar.style.width = percent + '%';
        if (percentEl) percentEl.textContent = Math.round(percent) + '%';
        if (statusText) statusText.textContent = `Đang tải video ${completed + 1}/${total} (${item.plat})...`;
        
        this.logTerminal(`<span class="log-time">[${new Date().toLocaleTimeString('vi-VN')}]</span> <span class="log-info">[Progress ${Math.round(percent)}%]</span> Đã tải thành công ${item.title}`);
        
        // Add to store
        item.downloadDate = new Date().toISOString();
        App.store.downloadedVideos.push(item);
        
        App.store.downloadHistory.push({
          id: 'hist_' + Date.now(),
          action: 'Tải video',
          details: item.title,
          time: item.downloadDate,
          status: 'Thành công'
        });

        completed++;
      } else {
        clearInterval(this.downloadInterval);
        this.isDownloading = false;
        
        App.store.kpi.downloading = 0;
        App.store.kpi.completed = App.store.downloadedVideos.length;
        App.store.kpi.today += total;
        App.saveStore();

        if (kpiDown) kpiDown.textContent = 0;
        if (kpiComp) kpiComp.textContent = App.store.kpi.completed;
        document.getElementById('kpiToday').textContent = App.store.kpi.today;

        App.notify('success', 'Tải hoàn tất!', `Đã tải xong ${total} video chất lượng gốc không watermark.`);
        App.playSound('success');
        this.logTerminal(`<span class="log-time">[${new Date().toLocaleTimeString('vi-VN')}]</span> <span class="log-success">✓ Tất cả ${total} video đã được lưu vào mục "File đã tải". Bạn có thể chuyển sang tab Render để xử lý.</span>`);
        
        document.getElementById('crawlInputLinks').value = '';
        document.getElementById('linkCount').textContent = '0 link được phát hiện';

        setTimeout(() => {
          if (progressSec) progressSec.style.display = 'none';
        }, 3000);
      }
    }, 1000); // 1 second per video simulate
  },

  bindPlatforms() {
    document.querySelectorAll('.platform-item').forEach(item => {
      item.addEventListener('click', () => {
        App.playSound('click');
        const plat = item.dataset.platform || item.querySelector('.platform-name').textContent;
        const isBypass = item.querySelector('.platform-status').classList.contains('bypass');
        
        if (isBypass) {
          App.notify('info', 'Thông báo', `Nền tảng ${plat} hỗ trợ bypass, không cần nạp cookie.`);
          return;
        }

        const conn = App.store.platformConnections[plat];
        if (conn && conn.status === 'online') {
          App.notify('info', 'Trạng thái', `Tài khoản ${plat} đang hoạt động bình thường.`);
        }
        
        this.openPlatformModal(plat);
      });
    });
  },

  openPlatformModal(platform) {
    const conn = App.store.platformConnections[platform];
    const existingCookie = conn ? conn.cookie : '';

    const modalHtml = `
      <div class="flex flex-col gap-4">
        <div class="flex items-center justify-between border-b pb-3">
          <div class="flex items-center gap-2">
            <h3 class="text-lg fw-700">Cấu hình kết nối: ${platform}</h3>
          </div>
          <button class="btn btn-sm btn-ghost" onclick="App.closeModal()">✕</button>
        </div>

        <p class="text-sm text-muted">
          Để cào video không bị hạn chế số lượng và vượt tường lửa kiểm tra của ${platform}, bạn có thể nạp Cookie tài khoản hoặc quét mã QR.
        </p>

        <div class="tabs flex gap-3 border-b">
          <div class="tab active text-sm fw-600 pb-2 border-b-2 border-accent text-accent">Nạp Cookie</div>
          <div class="tab text-sm fw-600 pb-2 text-muted">Quét mã QR</div>
        </div>

        <div class="form-group flex flex-col gap-2">
          <label class="form-label text-xs">Chuỗi Cookie (từ tiện ích Cookie-Editor hoặc EditThisCookie)</label>
          <textarea id="modalCookieInput" class="form-textarea w-full h-24 p-2 text-xs font-mono bg-gray-800 border border-gray-700 rounded" placeholder="sessionid=...; passport_csrf_token=...;">${existingCookie}</textarea>
        </div>

        <div class="flex justify-between items-center pt-2">
          <span class="text-xs text-success">✓ Hỗ trợ tự động làm mới Token sau mỗi 24h</span>
          <div class="flex gap-2">
            <button class="btn btn-secondary" onclick="App.closeModal()">Đóng</button>
            <button class="btn btn-primary" id="btnSaveCookie">Lưu & Kết nối</button>
          </div>
        </div>
      </div>
    `;
    App.openModal(modalHtml);

    document.getElementById('btnSaveCookie')?.addEventListener('click', () => {
      const cookieVal = document.getElementById('modalCookieInput').value.trim();
      if (!cookieVal) {
        App.notify('error', 'Lỗi', 'Vui lòng nhập chuỗi cookie.');
        return;
      }

      App.store.platformConnections[platform] = {
        cookie: cookieVal,
        status: 'online',
        updatedAt: new Date().toISOString()
      };
      App.saveStore();
      
      this.renderPlatforms();
      App.notify('success', 'Đã lưu Cookie', `Kết nối với ${platform} thành công.`);
      App.closeModal();
    });
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
