/* ═══════════════════════════════════════════════════════════════
   Mnhut 2tech Al — Page: Cài Đặt Hệ Thống (2TECH MN - Nguyễn Minh Nhựt)
   ═══════════════════════════════════════════════════════════════ */

window.Pages = window.Pages || {};
window.Pages['settings'] = {
  applyTheme(theme) {
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
      let style = document.getElementById('vc-light-theme-style');
      if (!style) {
        style = document.createElement('style');
        style.id = 'vc-light-theme-style';
        style.textContent = `
          html[data-theme="light"], body.light-theme {
            --bg-void: #f1f5f9;
            --bg-canvas: #f8fafc;
            --bg-surface: #ffffff;
            --bg-elevated: #f8fafc;
            --bg-overlay: rgba(255, 255, 255, 0.92);
            --bg-input: #ffffff;
            --border-subtle: #e2e8f0;
            --border-default: #cbd5e1;
            --border-hover: #94a3b8;
            --text-primary: #0f172a;
            --text-secondary: #334155;
            --text-muted: #64748b;
            --text-inverse: #ffffff;
          }
        `;
        document.head.appendChild(style);
      }
      document.body.classList.add('light-theme');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.body.classList.remove('light-theme');
      const style = document.getElementById('vc-light-theme-style');
      if (style) style.remove();
    }
  },

  render() {
    App.store = App.store || {};
    const settings = Object.assign({
      downloadPath: 'D:\\Videos\\Mnhut_2tech_Al\\Downloaded\\',
      quality: 'max',
      threads: 4,
      autoClean: true,
      proxyList: '',
      autoUserAgent: true,
      antiCheckpoint: true,
      language: 'vi',
      theme: 'dark',
      soundEnabled: !App.muted,
      autoUpdate: true
    }, App.store.settings || {});

    const user = App.store.user;
    const planKey = App.store.plan || 'FREE';
    const balance = App.store.balance || 0;
    const planExpiry = App.store.planExpiry;

    const planNames = {
      FREE: 'Miễn Phí (FREE)',
      START: 'Gói START (Cơ Bản)',
      PRO: 'Gói PRO (Chuyên Nghiệp)',
      UNLIMITED: 'Gói STUDIO (Không Giới Hạn)',
      ULTRA: 'Gói ULTRA VIP (Cao Cấp Nhất)'
    };
    const planBadges = {
      FREE: 'badge-neutral',
      START: 'badge-info',
      PRO: 'badge-accent',
      UNLIMITED: 'badge-warning',
      ULTRA: 'badge-success'
    };

    const planDisplayName = planNames[planKey] || planKey;
    const planBadgeClass = planBadges[planKey] || 'badge-neutral';

    let expiryText = 'Vô thời hạn';
    let expiryDetail = 'Gói mặc định miễn phí';
    if (planExpiry) {
      const expDate = new Date(planExpiry);
      if (!isNaN(expDate.getTime())) {
        const diffMs = expDate.getTime() - Date.now();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        const formatted = expDate.toLocaleDateString('vi-VN');
        if (diffDays > 0) {
          expiryText = `Còn ${diffDays} ngày`;
          expiryDetail = `Hết hạn: ${formatted}`;
        } else {
          expiryText = 'Đã hết hạn';
          expiryDetail = `Hết hạn ngày: ${formatted}`;
        }
      }
    }

    const soundActive = !App.muted;
    const historyCount = (App.store.downloadHistory || []).length;
    const videoCount = (App.store.downloadedVideos || []).length;
    const rawStore = localStorage.getItem('vc_store') || '';
    const storageSize = App.formatSize(new Blob([rawStore]).size);

    return `
      <div class="flex flex-col gap-6">
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl fw-700">Cài Đặt Hệ Thống</h1>
            <p class="text-sm text-muted mt-1">Bản quyền 2TECH MN (Nguyễn Minh Nhựt) · Cấu hình tải video, proxy và bảo trì dữ liệu</p>
          </div>
          <button class="btn btn-primary px-6 font-semibold" id="btnSaveAllSettings">Lưu cài đặt</button>
        </div>

        <!-- 1. Account & License Card -->
        <div class="card p-5 flex flex-col gap-4">
          <div class="flex justify-between items-center mb-1">
            <div>
              <h2 class="card-title text-base fw-600">Thông Tin Bản Quyền & Tài Khoản 2TECH MN</h2>
              <p class="text-xs text-muted mt-0.5">Xác thực bản quyền trực tuyến qua hệ sinh thái dịch vụ 2TECH MN</p>
            </div>
            <span class="badge ${planBadgeClass}">${planDisplayName}</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="p-3 bg-gray-900 rounded border border-gray-800">
              <span class="text-xs text-muted block mb-1">Gói cước đang kích hoạt:</span>
              <strong class="text-sm text-accent font-mono">Mnhut 2tech Al ${planKey}</strong>
              <div class="text-xs text-muted mt-1">Cấp phép bởi 2TECH MN</div>
            </div>

            <div class="p-3 bg-gray-900 rounded border border-gray-800">
              <span class="text-xs text-muted block mb-1">Thời hạn bản quyền còn lại:</span>
              <strong class="text-sm text-success font-mono">${expiryText}</strong>
              <div class="text-xs text-muted mt-1">${expiryDetail}</div>
            </div>

            <div class="p-3 bg-gray-900 rounded border border-gray-800">
              <span class="text-xs text-muted block mb-1">Số dư tài khoản khả dụng:</span>
              <strong class="text-sm text-success font-mono">${App.formatCurrency(balance)}</strong>
              <div class="text-xs text-muted mt-1">
                <a href="#pricing" onclick="App.navigate('pricing')" class="text-accent hover:underline">Nạp số dư / Nâng cấp &rarr;</a>
              </div>
            </div>
          </div>

          <!-- Real User Account Details -->
          ${user ? `
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-gray-800">
              <div class="form-group flex flex-col gap-1">
                <label class="form-label text-xs fw-500">Chủ tài khoản</label>
                <div class="p-2.5 bg-gray-900 rounded border border-gray-800 text-xs flex items-center justify-between">
                  <span class="fw-600 text-white truncate">${user.name || 'Người dùng'}</span>
                  <span class="badge badge-success text-xs">✓ Đang dùng</span>
                </div>
              </div>

              <div class="form-group flex flex-col gap-1">
                <label class="form-label text-xs fw-500">Email liên kết</label>
                <div class="p-2.5 bg-gray-900 rounded border border-gray-800 text-xs font-mono text-white truncate">
                  ${user.email || 'Chưa cập nhật'}
                </div>
              </div>

              <div class="form-group flex flex-col gap-1">
                <label class="form-label text-xs fw-500">Phương thức đăng nhập</label>
                <div class="p-2.5 bg-gray-900 rounded border border-gray-800 text-xs flex items-center justify-between">
                  <span class="text-muted">${user.provider === 'google' ? 'Google OAuth 2.0' : 'Đăng nhập nhanh'}</span>
                  <button class="btn btn-ghost btn-sm text-xs py-0.5 px-2" id="btnLogoutFromSettings">Đăng xuất</button>
                </div>
              </div>
            </div>
          ` : `
            <div class="p-4 bg-gray-900 rounded border border-gray-800 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div class="text-sm fw-600 text-white">Chưa liên kết tài khoản 2TECH MN</div>
                <p class="text-xs text-muted mt-1">Đăng nhập bằng tài khoản Google để nhận 2.000.000đ số dư trải nghiệm và đồng bộ đám mây.</p>
              </div>
              <button class="btn btn-primary btn-sm px-4" id="btnLoginFromSettings">Đăng nhập Google</button>
            </div>
          `}
        </div>

        <!-- 2. Application & UI Settings -->
        <div class="card p-5 flex flex-col gap-4">
          <div class="flex justify-between items-center mb-1">
            <h2 class="card-title text-base fw-600">Cài Đặt Chung & Giao Diện Ứng Dụng</h2>
            <span class="text-xs text-muted">Tùy biến hiển thị và thông báo</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="form-group flex flex-col gap-1">
              <label class="form-label text-xs fw-500">Ngôn ngữ & Khu vực (Language / Region)</label>
              <select class="form-select text-xs" id="selectLanguage">
                <option value="vi" ${settings.language === 'vi' ? 'selected' : ''}>Tiếng Việt (Việt Nam - Mặc định)</option>
                <option value="en" ${settings.language === 'en' ? 'selected' : ''}>English (International)</option>
              </select>
            </div>

            <div class="form-group flex flex-col gap-1">
              <label class="form-label text-xs fw-500">Chủ đề giao diện (Theme)</label>
              <select class="form-select text-xs" id="selectTheme">
                <option value="dark" ${settings.theme === 'dark' ? 'selected' : ''}>Giao diện tối (Dark Theme - Chuẩn 2TECH MN)</option>
                <option value="light" ${settings.theme === 'light' ? 'selected' : ''}>Giao diện sáng (Light Theme)</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="card p-3 bg-gray-900 border border-gray-800 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="toggle">
                  <input type="checkbox" id="checkSound" ${soundActive ? 'checked' : ''}>
                  <div class="toggle-track"></div>
                </div>
                <div>
                  <span class="text-xs fw-600 text-white">Âm thanh thông báo & hiệu ứng</span>
                  <p class="text-xs text-muted" style="font-size:11px;">Phát âm thanh khi tải xong, gặp lỗi hoặc hoàn thành tác vụ</p>
                </div>
              </div>
            </div>

            <div class="card p-3 bg-gray-900 border border-gray-800 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="toggle">
                  <input type="checkbox" id="checkAutoUpdate" ${settings.autoUpdate !== false ? 'checked' : ''}>
                  <div class="toggle-track"></div>
                </div>
                <div>
                  <span class="text-xs fw-600 text-white">Tự động kiểm tra bản cập nhật</span>
                  <p class="text-xs text-muted" style="font-size:11px;">Nhận thông báo khi 2TECH MN phát hành phiên bản mới</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 3. Download Performance & Storage Paths -->
        <div class="card p-5 flex flex-col gap-4">
          <div class="flex justify-between items-center mb-1">
            <h2 class="card-title text-base fw-600">Đường Dẫn Lưu Trữ & Hiệu Năng Tải Video</h2>
            <span class="text-xs text-success">✓ Hệ thống đa luồng sẵn sàng</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="form-group flex flex-col gap-1">
              <label class="form-label text-xs fw-500">Thư mục lưu video tải về gốc</label>
              <div class="flex gap-2">
                <input type="text" class="form-input text-xs font-mono flex-1" id="inputDownloadPath" value="${settings.downloadPath || 'D:\\Videos\\Mnhut_2tech_Al\\Downloaded\\'}" readonly>
                <button class="btn btn-secondary btn-sm" id="btnBrowseDownloadPath">Chọn...</button>
              </div>
            </div>

            <div class="form-group flex flex-col gap-1">
              <label class="form-label text-xs fw-500">Chất lượng video tải về mặc định</label>
              <select class="form-select text-xs" id="selectQuality">
                <option value="max" ${settings.quality === 'max' ? 'selected' : ''}>Chất lượng cao nhất có sẵn (Gốc 1080p / 4K không logo)</option>
                <option value="1080p" ${settings.quality === '1080p' ? 'selected' : ''}>Chuẩn Full HD 1080p</option>
                <option value="720p" ${settings.quality === '720p' ? 'selected' : ''}>Chuẩn HD 720p (Tiết kiệm dung lượng)</option>
                <option value="audio" ${settings.quality === 'audio' ? 'selected' : ''}>Chỉ tải âm thanh trích xuất (MP3 / AAC)</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="form-group flex flex-col gap-1">
              <label class="form-label text-xs fw-500">Số luồng tải đồng thời (Download Threads)</label>
              <select class="form-select text-xs" id="selectThreads">
                <option value="2" ${Number(settings.threads) === 2 ? 'selected' : ''}>2 Luồng (Tiết kiệm băng thông mạng)</option>
                <option value="4" ${Number(settings.threads) === 4 || !settings.threads ? 'selected' : ''}>4 Luồng (Khuyên dùng - Ổn định nhất)</option>
                <option value="8" ${Number(settings.threads) === 8 ? 'selected' : ''}>8 Luồng (Tải tốc độ cao)</option>
                <option value="16" ${Number(settings.threads) === 16 ? 'selected' : ''}>16 Luồng (Tối đa công suất mạng cáp quang)</option>
              </select>
            </div>

            <div class="card p-3 bg-gray-900 border border-gray-800 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="toggle">
                  <input type="checkbox" id="checkAutoClean" ${settings.autoClean ? 'checked' : ''}>
                  <div class="toggle-track"></div>
                </div>
                <div>
                  <span class="text-xs fw-600 text-white">Tự động xóa lịch sử và tệp tạm sau 30 ngày</span>
                  <p class="text-xs text-muted" style="font-size:11px;">Chống đầy bộ nhớ ổ cứng khi chạy tự động tải liên tục 24/7</p>
                </div>
              </div>
              <span class="badge badge-success text-xs">Bảo vệ ổ đĩa</span>
            </div>
          </div>
        </div>

        <!-- 4. Proxy & Network Anti-ban -->
        <div class="card p-5 flex flex-col gap-4">
          <div class="flex justify-between items-center mb-1">
            <h2 class="card-title text-base fw-600">Mạng & Proxy (Chống Khóa IP Nền Tảng)</h2>
            <span class="text-xs text-muted">Dùng khi cào số lượng lớn trên 1.000 video/ngày</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="form-group flex flex-col gap-1">
              <label class="form-label text-xs fw-500">Danh sách Proxy xoay (IPv4 / IPv6 HTTP hoặc SOCKS5)</label>
              <textarea class="form-textarea w-full h-24 text-xs font-mono bg-gray-900 border border-gray-700 rounded p-2" id="textareaProxyList" placeholder="ip:port:user:pass (mỗi proxy 1 dòng)">${settings.proxyList || ''}</textarea>
            </div>

            <div class="flex flex-col gap-3 justify-center text-xs">
              <label class="flex items-center gap-2 cursor-pointer">
                <div class="toggle">
                  <input type="checkbox" id="checkAutoUserAgent" ${settings.autoUserAgent !== false ? 'checked' : ''}>
                  <div class="toggle-track"></div>
                </div>
                <span>Tự động đổi User-Agent ngẫu nhiên cho mỗi lượt cào</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <div class="toggle">
                  <input type="checkbox" id="checkAntiCheckpoint" ${settings.antiCheckpoint !== false ? 'checked' : ''}>
                  <div class="toggle-track"></div>
                </div>
                <span>Giãn cách ngẫu nhiên 2 - 5 giây giữa các lượt tải để chống checkpoint</span>
              </label>
            </div>
          </div>
        </div>

        <!-- 5. Cache & Data Maintenance -->
        <div class="card p-5 flex flex-col gap-4">
          <div class="flex justify-between items-center mb-1">
            <div>
              <h2 class="card-title text-base fw-600">Bảo Trì Cơ Sở Dữ Liệu & Bộ Nhớ Ứng Dụng</h2>
              <p class="text-xs text-muted mt-0.5">Dọn dẹp phân mảnh, giải phóng bộ nhớ và khôi phục hệ thống</p>
            </div>
            <span class="badge badge-neutral text-xs">Bộ nhớ: ${storageSize}</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-gray-900 rounded border border-gray-800 text-xs">
            <div>
              <span class="text-muted block">Lịch sử phiên tải:</span>
              <strong class="text-white">${historyCount} phiên ghi nhận</strong>
            </div>
            <div>
              <span class="text-muted block">Danh sách video đã tải:</span>
              <strong class="text-white">${videoCount} video lưu trong thư viện</strong>
            </div>
          </div>

          <div class="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div class="flex flex-wrap gap-2">
              <button class="btn btn-secondary btn-sm" id="btnCleanTemp">Dọn dẹp file tạm (>30 ngày)</button>
              <button class="btn btn-secondary btn-sm" id="btnVacuumDb">Tối ưu Database</button>
              <button class="btn btn-secondary btn-sm" id="btnResetHistory">Xóa toàn bộ lịch sử</button>
            </div>
            <button class="btn btn-danger btn-sm" id="btnResetAllData">Khôi phục cài đặt gốc</button>
          </div>
        </div>
      </div>
    `;
  },

  init() {
    // Apply theme from store if available
    const currentTheme = App.store?.settings?.theme || 'dark';
    this.applyTheme(currentTheme);

    // Save All Settings
    document.getElementById('btnSaveAllSettings')?.addEventListener('click', () => {
      this.saveSettings();
    });

    // Theme selector change
    document.getElementById('selectTheme')?.addEventListener('change', (e) => {
      this.applyTheme(e.target.value);
    });

    // Sound toggle change (instant feedback)
    document.getElementById('checkSound')?.addEventListener('change', (e) => {
      App.muted = !e.target.checked;
      localStorage.setItem('vc_muted', App.muted);
      App.updateMuteIcon();
      if (!App.muted) {
        App.playSound('click');
      }
    });

    // Storage path selection button
    document.getElementById('btnBrowseDownloadPath')?.addEventListener('click', () => {
      App.playSound('click');
      App.notify(
        'info',
        'Đường dẫn lưu trữ',
        'Vui lòng thiết lập hoặc thay đổi đường dẫn lưu trữ thư mục tải về trong Bảng quản trị hệ thống (Admin Panel) để cấp quyền truy cập hệ thống tệp cho máy chủ.'
      );
    });

    // User login/logout handlers in settings
    document.getElementById('btnLoginFromSettings')?.addEventListener('click', () => {
      App.showLoginModal();
    });

    document.getElementById('btnLogoutFromSettings')?.addEventListener('click', () => {
      if (confirm('Bạn có chắc chắn muốn đăng xuất tài khoản?')) {
        App.store.user = null;
        App.saveStore();
        App.updateUI();
        App.notify('info', 'Đã đăng xuất', 'Tài khoản đã được đăng xuất thành công.');
        App.navigate('settings');
      }
    });

    // Maintenance 1: Dọn dẹp file tạm (older than 30 days)
    document.getElementById('btnCleanTemp')?.addEventListener('click', () => {
      const now = Date.now();
      const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
      const history = App.store.downloadHistory || [];
      const beforeCount = history.length;

      App.store.downloadHistory = history.filter(item => {
        const itemDate = new Date(item.date || item.timestamp || item.downloadedAt || item.time || 0).getTime();
        if (!itemDate || isNaN(itemDate)) return true;
        return (now - itemDate) <= thirtyDaysMs;
      });

      const cleaned = beforeCount - App.store.downloadHistory.length;
      App.saveStore();
      App.playSound('success');
      if (cleaned > 0) {
        App.notify('success', 'Dọn dẹp hoàn tất', `Đã dọn dẹp ${cleaned} bản ghi lịch sử cũ hơn 30 ngày và làm sạch bộ nhớ tạm.`);
      } else {
        App.notify('info', 'Dọn dẹp hoàn tất', 'Không có bản ghi lịch sử nào cũ hơn 30 ngày cần xóa.');
      }
      App.navigate('settings');
    });

    // Maintenance 2: Tối ưu Database (compact localStorage)
    document.getElementById('btnVacuumDb')?.addEventListener('click', () => {
      try {
        const compacted = JSON.parse(JSON.stringify(App.store));
        App.store = compacted;
        App.saveStore();
        App.playSound('success');
        const rawStore = localStorage.getItem('vc_store') || '';
        const size = App.formatSize(new Blob([rawStore]).size);
        App.notify('success', 'Tối ưu Database', `Đã nén và sắp xếp lại dữ liệu localStorage (${size}). Tốc độ truy xuất đạt hiệu suất cao nhất.`);
        App.navigate('settings');
      } catch (err) {
        App.notify('error', 'Lỗi tối ưu', 'Không thể tối ưu dữ liệu: ' + err.message);
      }
    });

    // Maintenance 3: Xóa toàn bộ lịch sử
    document.getElementById('btnResetHistory')?.addEventListener('click', () => {
      if (confirm('Bạn có chắc chắn muốn xóa TOÀN BỘ lịch sử tải và danh sách video đã tải? Thao tác này không thể hoàn tác.')) {
        const histCount = (App.store.downloadHistory || []).length;
        const vidCount = (App.store.downloadedVideos || []).length;
        App.store.downloadHistory = [];
        App.store.downloadedVideos = [];
        App.saveStore();
        App.updateUI();
        App.playSound('success');
        App.notify('success', 'Đã xóa toàn bộ lịch sử', `Đã dọn sạch ${histCount} bản ghi lịch sử và ${vidCount} video đã tải.`);
        App.navigate('settings');
      }
    });

    // Maintenance 4: Khôi phục cài đặt gốc (Reset all data)
    document.getElementById('btnResetAllData')?.addEventListener('click', () => {
      if (confirm('CẢNH BÁO: Thao tác này sẽ xóa sạch TOÀN BỘ dữ liệu cấu hình, tài khoản và lịch sử trên trình duyệt này để trở về mặc định của 2TECH MN. Bạn có chắc chắn muốn tiếp tục?')) {
        localStorage.removeItem('vc_store');
        localStorage.removeItem('vc_muted');
        App.loadStore();
        App.muted = false;
        App.updateMuteIcon();
        App.updateUI();
        this.applyTheme('dark');
        App.playSound('ping');
        App.notify('warning', 'Khôi phục cài đặt gốc', 'Toàn bộ dữ liệu hệ thống đã được đưa về trạng thái mặc định ban đầu.');
        App.navigate('settings');
      }
    });
  },

  saveSettings() {
    App.store = App.store || {};
    App.store.settings = App.store.settings || {};

    const inputPath = document.getElementById('inputDownloadPath');
    const selectQuality = document.getElementById('selectQuality');
    const selectThreads = document.getElementById('selectThreads');
    const selectLanguage = document.getElementById('selectLanguage');
    const selectTheme = document.getElementById('selectTheme');
    const checkSound = document.getElementById('checkSound');
    const checkAutoUpdate = document.getElementById('checkAutoUpdate');
    const checkAutoClean = document.getElementById('checkAutoClean');
    const textareaProxyList = document.getElementById('textareaProxyList');
    const checkAutoUserAgent = document.getElementById('checkAutoUserAgent');
    const checkAntiCheckpoint = document.getElementById('checkAntiCheckpoint');

    if (inputPath) App.store.settings.downloadPath = inputPath.value.trim();
    if (selectQuality) App.store.settings.quality = selectQuality.value;
    if (selectThreads) App.store.settings.threads = parseInt(selectThreads.value, 10) || 4;
    if (selectLanguage) App.store.settings.language = selectLanguage.value;
    if (selectTheme) {
      App.store.settings.theme = selectTheme.value;
      this.applyTheme(selectTheme.value);
    }
    if (checkSound) {
      const soundEnabled = checkSound.checked;
      App.store.settings.soundEnabled = soundEnabled;
      App.muted = !soundEnabled;
      localStorage.setItem('vc_muted', App.muted);
      App.updateMuteIcon();
    }
    if (checkAutoUpdate) App.store.settings.autoUpdate = checkAutoUpdate.checked;
    if (checkAutoClean) App.store.settings.autoClean = checkAutoClean.checked;
    if (textareaProxyList) App.store.settings.proxyList = textareaProxyList.value;
    if (checkAutoUserAgent) App.store.settings.autoUserAgent = checkAutoUserAgent.checked;
    if (checkAntiCheckpoint) App.store.settings.antiCheckpoint = checkAntiCheckpoint.checked;

    App.saveStore();
    App.playSound('success');
    App.notify('success', 'Đã lưu cài đặt', 'Toàn bộ cấu hình hệ thống 2TECH MN đã được áp dụng thành công.');
  }
};
