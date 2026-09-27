/* ═══════════════════════════════════════════════════════════════
   ViralCrawl — Core Application Controller & State Engine
   Developed for 2TECH MN (Nguyễn Minh Nhựt)
   ═══════════════════════════════════════════════════════════════ */

window.Pages = window.Pages || {};

const App = {
  currentPage: null,
  startTime: Date.now(), // Sync with run time
  muted: localStorage.getItem('vc_muted') === 'true',
  audioCtx: null,

  // ── Persistent Store (localStorage-backed) ──
  store: null, // initialized in loadStore()

  defaultStore: {
    kpi: { today: 0, downloading: 0, completed: 0, error: 0 },
    user: null, // { name, email, avatar, provider } — set on login
    balance: 0, // VNĐ — initialized to 2,000,000 on first Google sign-in
    plan: 'FREE', // FREE | START | PRO | UNLIMITED
    planExpiry: null, // ISO date string
    downloadedVideos: [],
    downloadHistory: [],
    platformConnections: {}, // { Douyin: {cookie, status}, ... }
    settings: {
      downloadPath: 'D:\\Videos\\ViralCrawl\\Downloaded\\',
      gpuEncoder: 'nvenc_h264',
      quality: 'high',
      threads: 4,
      autoClean: true,
      proxyList: '',
      autoUserAgent: true,
      antiCheckpoint: true
    }
  },

  loadStore() {
    try {
      const saved = localStorage.getItem('vc_store');
      if (saved) {
        this.store = JSON.parse(saved);
        // Merge any new defaults
        for (const key of Object.keys(this.defaultStore)) {
          if (!(key in this.store)) {
            this.store[key] = JSON.parse(JSON.stringify(this.defaultStore[key]));
          }
        }
      } else {
        this.store = JSON.parse(JSON.stringify(this.defaultStore));
      }
    } catch (e) {
      console.error('Failed to load store:', e);
      this.store = JSON.parse(JSON.stringify(this.defaultStore));
    }
  },

  saveStore() {
    try {
      localStorage.setItem('vc_store', JSON.stringify(this.store));
    } catch (e) {
      console.error('Failed to save store:', e);
    }
  },

  // ── Sidebar definition ──
  pages: [
    { id: 'dashboard',      title: 'Tải ngay',              step: 2 },
    { id: 'download-link',  title: 'Tải video bằng link',   step: 2 },
    { id: 'downloaded',     title: 'File đã tải',           step: 3 },
    { id: 'history',        title: 'Lịch sử tải',           step: 3 },
    { id: 'settings',       title: 'Cài đặt',              step: 1 },
    { id: 'pricing',        title: 'Bảng Giá',             step: 1 },
    { id: 'support',        title: 'Gửi câu hỏi',          step: 1 },
  ],

  // ═══════════════════════════════════════════
  // INIT
  // ═══════════════════════════════════════════
  deviceMode: 'auto', // 'auto' | 'ios' | 'android' | 'desktop'
  device: { os: 'desktop', isMobile: false },

  init() {
    this.loadStore();
    this.detectDevice();
    this.bindSidebar();
    this.bindMobileNav();
    this.bindDeviceMode();
    this.bindMute();
    this.bindModal();
    this.bindMobileMenu();
    this.bindLogin();
    this.startUptime();
    this.updateMuteIcon();
    this.updateUI();

    // Listen to hash changes for browser back/forward navigation
    window.addEventListener('hashchange', () => {
      const hash = location.hash.slice(1) || 'dashboard';
      if (this.currentPage !== hash) this.navigate(hash);
    });

    const initial = location.hash.slice(1) || 'dashboard';
    this.navigate(initial);
  },

  // ═══════════════════════════════════════════
  // DEVICE AUTO-DETECTION (iOS / Android / Desktop)
  // ═══════════════════════════════════════════
  detectDevice() {
    const ua = navigator.userAgent || '';
    let os = 'desktop';
    let isMobile = false;

    if (/iPad|iPhone|iPod/.test(ua) && !window.MSStream) {
      os = 'ios';
      isMobile = true;
    } else if (/android/i.test(ua)) {
      os = 'android';
      isMobile = true;
    } else if (window.innerWidth <= 768) {
      isMobile = true;
      os = /iphone|ipad/i.test(ua) ? 'ios' : (/android/i.test(ua) ? 'android' : 'mobile');
    }

    this.device = { os, isMobile, ua };
    this.applyDeviceMode();
  },

  applyDeviceMode() {
    const mode = this.deviceMode;
    let activeOs = this.device.os;
    let isMobile = this.device.isMobile;

    if (mode === 'ios') { activeOs = 'ios'; isMobile = true; }
    else if (mode === 'android') { activeOs = 'android'; isMobile = true; }
    else if (mode === 'desktop') { activeOs = 'desktop'; isMobile = false; }

    document.documentElement.classList.toggle('device-ios', activeOs === 'ios');
    document.documentElement.classList.toggle('device-android', activeOs === 'android');
    document.documentElement.classList.toggle('device-mobile', isMobile);
    document.documentElement.classList.toggle('device-desktop', !isMobile);

    const badgeText = document.getElementById('deviceText');
    const badgeIcon = document.getElementById('deviceIcon');
    if (badgeText && badgeIcon) {
      if (mode === 'auto') {
        if (activeOs === 'ios') { badgeIcon.textContent = '🍏'; badgeText.textContent = 'iOS'; }
        else if (activeOs === 'android') { badgeIcon.textContent = '🤖'; badgeText.textContent = 'Android'; }
        else { badgeIcon.textContent = '💻'; badgeText.textContent = 'PC 4K'; }
      } else if (mode === 'ios') {
        badgeIcon.textContent = '🍏'; badgeText.textContent = 'iOS Sim';
      } else if (mode === 'android') {
        badgeIcon.textContent = '🤖'; badgeText.textContent = 'Android Sim';
      } else {
        badgeIcon.textContent = '💻'; badgeText.textContent = 'PC Mode';
      }
    }
  },

  bindDeviceMode() {
    const btn = document.getElementById('btnDeviceMode');
    btn?.addEventListener('click', () => {
      const modes = ['auto', 'ios', 'android', 'desktop'];
      const nextIdx = (modes.indexOf(this.deviceMode) + 1) % modes.length;
      this.deviceMode = modes[nextIdx];
      this.applyDeviceMode();
      const labels = {
        auto: 'Tự động nhận diện thiết bị (Auto Detect)',
        ios: 'Giao diện chuẩn iOS (iPhone / iPad Safe-Area)',
        android: 'Giao diện chuẩn Android (Material / Touch)',
        desktop: 'Giao diện máy tính để bàn (PC 4K Studio)'
      };
      this.playSound('click');
      this.notify('info', 'Chế độ hiển thị', labels[this.deviceMode]);
    });

    window.addEventListener('resize', () => {
      if (this.deviceMode === 'auto') this.detectDevice();
    });
  },

  bindMobileNav() {
    document.getElementById('mobileBottomNav')?.addEventListener('click', (e) => {
      const item = e.target.closest('.mobile-nav-item');
      if (!item || !item.dataset.page) return;
      this.navigate(item.dataset.page);
    });
  },

  // ═══════════════════════════════════════════
  // NAVIGATION / ROUTER
  // ═══════════════════════════════════════════
  navigate(pageId) {
    const pageDef = this.pages.find(p => p.id === pageId);
    if (!pageDef) return;

    // Update sidebar active class
    document.querySelectorAll('.sidebar-item').forEach(el => {
      el.classList.toggle('active', el.dataset.page === pageId);
    });

    // Update mobile bottom nav active class
    document.querySelectorAll('.mobile-nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.page === pageId);
    });

    // Update header title
    const titleEl = document.getElementById('pageTitle');
    if (titleEl) titleEl.textContent = pageDef.title;

    // Update stepper
    this.updateStepper(pageDef.step);

    // Update hash
    if (location.hash.slice(1) !== pageId) {
      location.hash = pageId;
    }
    this.currentPage = pageId;

    // Render content
    const main = document.getElementById('mainContent');
    const pageModule = window.Pages[pageId];

    if (pageModule && typeof pageModule.render === 'function') {
      main.innerHTML = pageModule.render();
      if (typeof pageModule.init === 'function') {
        try {
          pageModule.init();
        } catch (err) {
          console.error(`Error initializing page ${pageId}:`, err);
        }
      }
    } else {
      main.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🚧</div>
          <div class="empty-title">Module "${pageDef.title}" đang chuẩn bị</div>
          <div class="empty-desc">Tính năng thuộc bản cập nhật 2TECH MN 2026.</div>
        </div>`;
    }

    this.playSound('click');
    document.getElementById('sidebar')?.classList.remove('open');
  },

  // ═══════════════════════════════════════════
  // TAB SWITCHER (Universal utility)
  // ═══════════════════════════════════════════
  switchTab(containerId, index) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const parent = container.parentElement;
    const tabs = parent.querySelectorAll('.tab');
    const panels = container.querySelectorAll('.tab-panel');

    tabs.forEach((t, i) => {
      if (i === index) {
        t.classList.add('active');
      } else {
        t.classList.remove('active');
      }
    });

    panels.forEach((p, i) => {
      p.style.display = (i === index) ? 'flex' : 'none';
      if (i === index) {
        p.classList.add('active');
      } else {
        p.classList.remove('active');
      }
    });

    this.playSound('click');
  },

  // ═══════════════════════════════════════════
  // TOAST NOTIFICATION SYSTEM
  // ═══════════════════════════════════════════
  notify(type, title, message) {
    let container = document.getElementById('appToastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'appToastContainer';
      container.style.cssText = 'position:fixed;top:20px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:10px;pointer-events:none;max-width:380px;';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `card p-4 flex items-start gap-3 shadow-lg`;
    toast.style.cssText = 'pointer-events:auto;background:var(--bg-elevated);border-left:4px solid var(--accent);transform:translateX(100%);transition:transform .25s ease;';

    let icon = 'ℹ️';
    let borderColor = 'var(--accent)';
    if (type === 'success') { icon = '✓'; borderColor = 'var(--success)'; this.playSound('success'); }
    else if (type === 'error') { icon = '✕'; borderColor = 'var(--error)'; this.playSound('error'); }
    else if (type === 'warning') { icon = '⚠️'; borderColor = 'var(--warning)'; this.playSound('ping'); }

    toast.style.borderLeftColor = borderColor;
    toast.innerHTML = `
      <div style="font-size:18px;line-height:1;margin-top:2px;">${icon}</div>
      <div class="flex-1">
        <div class="text-sm fw-600">${title}</div>
        <div class="text-xs text-muted mt-1">${message}</div>
      </div>
    `;

    container.appendChild(toast);
    requestAnimationFrame(() => toast.style.transform = 'translateX(0)');

    setTimeout(() => {
      toast.style.transform = 'translateX(120%)';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  },

  // ═══════════════════════════════════════════
  // UPDATE UI & LOGIN BINDING
  // ═══════════════════════════════════════════
  updateUI() {
    // Badge
    const badge = document.getElementById('badgeDownloaded');
    if (badge) badge.textContent = this.store.downloadedVideos.length;

    const mobileBadge = document.getElementById('mobileBadgeCount');
    if (mobileBadge) mobileBadge.textContent = this.store.downloadedVideos.length;

    // User sidebar
    const nameEl = document.getElementById('userName');
    const balEl = document.getElementById('userBalance');
    const avatarEl = document.getElementById('userAvatar');
    const btnLogin = document.getElementById('btnLogin');
    const headerBal = document.getElementById('headerBalanceAmount');

    if (this.store.user) {
      if (nameEl) nameEl.textContent = this.store.user.name || this.store.user.email;
      if (balEl) balEl.textContent = this.formatCurrency(this.store.balance);
      if (avatarEl) {
        const initials = (this.store.user.name || 'U').charAt(0).toUpperCase();
        if (this.store.user.avatar) {
          avatarEl.innerHTML = `<img src="${this.store.user.avatar}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" alt="">`;
        } else {
          avatarEl.textContent = initials;
        }
      }
      if (btnLogin) { btnLogin.textContent = 'Đăng xuất'; btnLogin.id = 'btnLogout'; }
    } else {
      if (nameEl) nameEl.textContent = 'Chưa đăng nhập';
      if (balEl) balEl.textContent = '0đ';
      if (avatarEl) avatarEl.textContent = '?';
    }
    if (headerBal) headerBal.textContent = this.formatCurrency(this.store.balance);
  },

  bindLogin() {
    document.addEventListener('click', (e) => {
      if (e.target.id === 'btnLogin' || e.target.closest('#btnLogin')) {
        this.showLoginModal();
      }
      if (e.target.id === 'btnLogout' || e.target.closest('#btnLogout')) {
        if (confirm('Bạn có chắc muốn đăng xuất?')) {
          this.store.user = null;
          this.saveStore();
          this.updateUI();
          this.notify('info', 'Đã đăng xuất', 'Tài khoản đã được đăng xuất.');
          this.navigate('dashboard');
        }
      }
    });
  },

  showLoginModal() {
    const html = `
      <div class="google-auth-container" style="max-width:440px;margin:0 auto;background:#fff;color:#1f1f1f;border-radius:16px;padding:28px 24px;box-shadow:0 12px 40px rgba(0,0,0,0.5);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
        <!-- Google Header -->
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;">
          <div style="display:flex;align-items:center;gap:10px;">
            <svg width="24" height="24" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            <span style="font-size:15px;font-weight:600;color:#3c4043;">Google Identity Services</span>
          </div>
          <button class="btn btn-sm btn-ghost" onclick="App.closeModal()" style="color:#5f6368;font-size:16px;line-height:1;padding:4px 8px;">✕</button>
        </div>

        <div style="text-align:left;margin-bottom:18px;">
          <h3 style="font-size:19px;font-weight:600;color:#1f1f1f;margin:0 0 6px 0;">Đăng nhập bằng tài khoản Google</h3>
          <p style="font-size:13px;color:#5f6368;margin:0;">Để tiếp tục sử dụng <strong>ViralCrawl 4K Studio</strong></p>
          <div style="margin-top:10px;padding:8px 12px;background:#e8f0fe;border-radius:8px;font-size:12px;color:#1967d2;display:flex;align-items:center;gap:6px;">
            <span>🎁</span> <span>Mỗi tài khoản Google mới được cấp <strong style="color:#0d652d;">2.000.000đ</strong> số dư miễn phí!</span>
          </div>
        </div>

        <!-- Account Chooser List -->
        <div id="googleAccountsList" style="display:flex;flex-direction:column;gap:8px;">
          <!-- Account 1: Nguyễn Minh Nhựt -->
          <div class="google-acc-card" onclick="App.simulateGoogleLogin('Nguyễn Minh Nhựt', 'minhnhut@2techmn.com', 'N', '#10b981')" style="display:flex;align-items:center;gap:12px;padding:10px 14px;border:1px solid #dadce0;border-radius:10px;cursor:pointer;transition:all .2s ease;">
            <div style="width:38px;height:38px;border-radius:50%;background:#10b981;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:16px;flex-shrink:0;">N</div>
            <div style="flex:1;min-width:0;text-align:left;">
              <div style="font-size:13px;font-weight:600;color:#202124;">Nguyễn Minh Nhựt</div>
              <div style="font-size:12px;color:#5f6368;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">minhnhut@2techmn.com</div>
            </div>
            <span style="font-size:10px;padding:2px 8px;border-radius:999px;background:#e6f4ea;color:#137333;font-weight:600;flex-shrink:0;">Chính thức</span>
          </div>

          <!-- Account 2: Khách Hàng Doanh Nghiệp -->
          <div class="google-acc-card" onclick="App.simulateGoogleLogin('2TECH Enterprise VIP', 'enterprise@2techmn.com', '2T', '#4285f4')" style="display:flex;align-items:center;gap:12px;padding:10px 14px;border:1px solid #dadce0;border-radius:10px;cursor:pointer;transition:all .2s ease;">
            <div style="width:38px;height:38px;border-radius:50%;background:#4285f4;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;flex-shrink:0;">2T</div>
            <div style="flex:1;min-width:0;text-align:left;">
              <div style="font-size:13px;font-weight:600;color:#202124;">2TECH Enterprise VIP</div>
              <div style="font-size:12px;color:#5f6368;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">enterprise@2techmn.com</div>
            </div>
            <span style="font-size:10px;padding:2px 8px;border-radius:999px;background:#e8f0fe;color:#1a73e8;font-weight:600;flex-shrink:0;">VIP</span>
          </div>

          <!-- Account 3: Sử dụng tài khoản khác -->
          <div class="google-acc-card" id="btnToggleOtherGoogle" style="display:flex;align-items:center;gap:12px;padding:10px 14px;border:1px dashed #dadce0;border-radius:10px;cursor:pointer;transition:all .2s ease;">
            <div style="width:38px;height:38px;border-radius:50%;background:#f1f3f4;color:#5f6368;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:bold;flex-shrink:0;">+</div>
            <div style="flex:1;min-width:0;text-align:left;">
              <div style="font-size:13px;font-weight:500;color:#202124;">Sử dụng một tài khoản khác</div>
              <div style="font-size:12px;color:#5f6368;">Nhập email Google của bạn</div>
            </div>
          </div>
        </div>

        <!-- Custom Account Form (hidden by default) -->
        <div id="otherGoogleAccForm" style="display:none;margin-top:14px;flex-direction:column;gap:10px;text-align:left;">
          <div style="font-size:12px;font-weight:600;color:#3c4043;">Nhập thông tin tài khoản Google của bạn:</div>
          <input type="text" id="customGoogleName" placeholder="Tên tài khoản (VD: Nguyễn Minh Nhựt)" style="width:100%;padding:10px 12px;border:1px solid #dadce0;border-radius:6px;font-size:13px;color:#202124;background:#fff;outline:none;">
          <input type="email" id="customGoogleEmail" placeholder="Địa chỉ email Google (VD: nhut@gmail.com)" style="width:100%;padding:10px 12px;border:1px solid #dadce0;border-radius:6px;font-size:13px;color:#202124;background:#fff;outline:none;">
          <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:4px;">
            <button type="button" id="btnCancelCustomGoogle" style="background:#fff;border:1px solid #dadce0;color:#5f6368;padding:7px 14px;border-radius:6px;font-size:12px;cursor:pointer;">Quay lại</button>
            <button type="button" id="btnSubmitCustomGoogle" style="background:#1a73e8;border:none;color:#fff;padding:7px 18px;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;">Tiếp theo</button>
          </div>
        </div>

        <!-- Loading State -->
        <div id="googleAuthLoading" style="display:none;margin-top:20px;flex-direction:column;align-items:center;gap:12px;text-align:center;">
          <div style="width:36px;height:36px;border:3px solid #e8f0fe;border-top-color:#1a73e8;border-radius:50%;animation:spinGoogle 0.7s linear infinite;"></div>
          <div style="font-size:13px;font-weight:600;color:#1a73e8;" id="googleAuthLoadingText">Đang xác thực phiên Google OAuth 2.0...</div>
          <div style="font-size:11px;color:#5f6368;">Đang kết nối tài khoản & nạp 2.000.000đ số dư khuyến mại</div>
        </div>

        <!-- Footer -->
        <div style="margin-top:18px;padding-top:12px;border-top:1px solid #f1f3f4;font-size:11px;color:#70757a;text-align:center;line-height:1.5;">
          Phần mềm ViralCrawl 4K — Bản quyền <strong>2TECH MN</strong> (Kỹ sư: Nguyễn Minh Nhựt).
        </div>
      </div>
    `;
    this.openModal(html);

    // Toggle custom Google account form
    const btnToggle = document.getElementById('btnToggleOtherGoogle');
    const accList = document.getElementById('googleAccountsList');
    const customForm = document.getElementById('otherGoogleAccForm');
    const btnCancel = document.getElementById('btnCancelCustomGoogle');
    const btnSubmit = document.getElementById('btnSubmitCustomGoogle');

    btnToggle?.addEventListener('click', () => {
      accList.style.display = 'none';
      customForm.style.display = 'flex';
      document.getElementById('customGoogleName')?.focus();
    });

    btnCancel?.addEventListener('click', () => {
      customForm.style.display = 'none';
      accList.style.display = 'flex';
    });

    btnSubmit?.addEventListener('click', () => {
      const name = document.getElementById('customGoogleName')?.value.trim();
      const email = document.getElementById('customGoogleEmail')?.value.trim();
      if (!name || !email) {
        this.notify('warning', 'Thiếu thông tin', 'Vui lòng nhập tên và email Google của bạn.');
        return;
      }
      this.simulateGoogleLogin(name, email, name.charAt(0).toUpperCase(), '#ea4335');
    });
  },

  simulateGoogleLogin(name, email, initial = 'U', color = '#1a73e8') {
    const accList = document.getElementById('googleAccountsList');
    const customForm = document.getElementById('otherGoogleAccForm');
    const loadingBox = document.getElementById('googleAuthLoading');
    const loadingText = document.getElementById('googleAuthLoadingText');

    if (accList) accList.style.display = 'none';
    if (customForm) customForm.style.display = 'none';
    if (loadingBox) {
      loadingBox.style.display = 'flex';
      if (loadingText) loadingText.textContent = `Đang đồng bộ hồ sơ Google (${email})...`;
    }

    setTimeout(() => {
      this.completeLogin(name, email, 'google', { initial, color });
    }, 700);
  },

  completeLogin(name, email, provider = 'google', meta = {}) {
    const isNewUser = !this.store.user || this.store.user.email !== email;
    const initial = meta.initial || (name ? name.charAt(0).toUpperCase() : 'U');
    const color = meta.color || '#10b981';

    this.store.user = {
      name,
      email,
      provider,
      avatar: null,
      initial,
      color,
      loginDate: new Date().toISOString()
    };

    // Every account receives 2.000.000đ if initial balance is 0
    if (isNewUser && (!this.store.balance || this.store.balance === 0)) {
      this.store.balance = 2000000;
    }

    // Log traffic session for Admin Panel tracking
    try {
      const trafficLogs = JSON.parse(localStorage.getItem('vc_google_traffic') || '[]');
      const sessionEntry = {
        id: 'sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        name,
        email,
        initial,
        color,
        provider,
        device: this.device?.os || 'desktop',
        isMobile: !!this.device?.isMobile,
        ip: '192.168.1.' + Math.floor(Math.random() * 200 + 10),
        timestamp: new Date().toISOString(),
        balance: this.store.balance,
        plan: this.store.plan || 'FREE'
      };
      trafficLogs.unshift(sessionEntry);
      if (trafficLogs.length > 200) trafficLogs.length = 200;
      localStorage.setItem('vc_google_traffic', JSON.stringify(trafficLogs));

      // Broadcast sync event to Admin Panel if open
      if (window.BroadcastChannel) {
        const bc = new BroadcastChannel('2tech_channel');
        bc.postMessage({ type: 'GOOGLE_SIGNIN', data: sessionEntry });
        bc.close();
      }
    } catch (e) {
      console.warn('Traffic logging skipped:', e);
    }

    this.saveStore();
    this.closeModal();
    this.updateUI();
    this.playSound('success');

    if (isNewUser) {
      this.notify('success', 'Đăng nhập Google thành công!', `Chào mừng ${name}! Đã cấp 2.000.000đ số dư vào tài khoản.`);
    } else {
      this.notify('success', 'Đăng nhập thành công!', `Chào mừng ${name} quay trở lại ViralCrawl.`);
    }
  },

  formatCurrency(amount) {
    if (!amount && amount !== 0) return '0đ';
    return amount.toLocaleString('vi-VN') + 'đ';
  },

  // ═══════════════════════════════════════════
  // PLAN & GATING
  // ═══════════════════════════════════════════
  isFeatureAllowed(feature) {
    const plan = this.store.plan;
    const freeFeatures = ['download-link-basic', 'view-history', 'support'];
    const startFeatures = [...freeFeatures, 'download-tiktok', 'download-youtube', 'download-facebook', 'download-instagram'];
    const proFeatures = [...startFeatures, 'download-douyin', 'download-xiaohongshu', 'download-kuaishou', 'download-rednote', 'batch-download'];
    const unlimitedFeatures = [...proFeatures, 'download-honggo', 'download-bilibili', 'unlimited-downloads', 'priority-support'];

    if (plan === 'UNLIMITED') return true;
    if (plan === 'PRO') return proFeatures.includes(feature);
    if (plan === 'START') return startFeatures.includes(feature);
    return freeFeatures.includes(feature);
  },

  requireLogin() {
    if (!this.store.user) {
      this.showLoginModal();
      return false;
    }
    return true;
  },

  requirePlan(minPlan) {
    if (!this.requireLogin()) return false;
    const levels = { FREE: 0, START: 1, PRO: 2, UNLIMITED: 3 };
    if ((levels[this.store.plan] || 0) < (levels[minPlan] || 0)) {
      this.notify('warning', 'Cần nâng cấp gói', `Tính năng này yêu cầu gói ${minPlan} trở lên. Vào Bảng Giá để nâng cấp.`);
      this.navigate('pricing');
      return false;
    }
    return true;
  },

  // ═══════════════════════════════════════════
  // SIDEBAR BINDING
  // ═══════════════════════════════════════════
  bindSidebar() {
    document.getElementById('sidebarNav')?.addEventListener('click', (e) => {
      const item = e.target.closest('.sidebar-item');
      if (!item || !item.dataset.page) return;
      this.navigate(item.dataset.page);
    });

    document.getElementById('sidebarNav')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const item = e.target.closest('.sidebar-item');
        if (item && item.dataset.page) this.navigate(item.dataset.page);
      }
    });
  },

  // ═══════════════════════════════════════════
  // STEPPER
  // ═══════════════════════════════════════════
  updateStepper(activeStep) {
    document.querySelectorAll('.stepper-step').forEach(el => {
      const step = parseInt(el.dataset.step);
      el.classList.remove('active', 'completed');
      if (step < activeStep) el.classList.add('completed');
      else if (step === activeStep) el.classList.add('active');

      const num = el.querySelector('.stepper-num');
      if (num) {
        if (step < activeStep) num.textContent = '✓';
        else num.textContent = step;
      }
    });
  },

  // ═══════════════════════════════════════════
  // MUTE / SOUND (Web Audio API Native Synthesis)
  // ═══════════════════════════════════════════
  bindMute() {
    document.getElementById('btnMute')?.addEventListener('click', () => {
      this.muted = !this.muted;
      localStorage.setItem('vc_muted', this.muted);
      this.updateMuteIcon();
      this.playSound('click');
    });
  },

  updateMuteIcon() {
    const btn = document.getElementById('btnMute');
    if (!btn) return;
    if (this.muted) {
      btn.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>`;
      btn.title = 'Bật âm thanh';
    } else {
      btn.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>`;
      btn.title = 'Tắt âm thanh';
    }
  },

  playSound(type) {
    if (this.muted) return;
    try {
      if (!this.audioCtx) this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = this.audioCtx;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      switch (type) {
        case 'click':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(880, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.05);
          gain.gain.setValueAtTime(0.05, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.08);
          break;
        case 'success':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(523, ctx.currentTime);
          osc.frequency.setValueAtTime(659, ctx.currentTime + 0.1);
          osc.frequency.setValueAtTime(784, ctx.currentTime + 0.2);
          osc.frequency.setValueAtTime(1046, ctx.currentTime + 0.3);
          gain.gain.setValueAtTime(0.07, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.45);
          break;
        case 'error':
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(220, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.25);
          gain.gain.setValueAtTime(0.06, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.3);
          break;
        case 'ping':
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(1200, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(1600, ctx.currentTime + 0.08);
          gain.gain.setValueAtTime(0.04, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.12);
          break;
      }
    } catch (_) { /* AudioContext not permitted or unsupported */ }
  },

  // ═══════════════════════════════════════════
  // MODAL MANAGER
  // ═══════════════════════════════════════════
  bindModal() {
    const overlay = document.getElementById('modalOverlay');
    overlay?.addEventListener('click', (e) => {
      if (e.target === overlay) this.closeModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeModal();
    });
  },

  openModal(html) {
    const content = document.getElementById('modalContent');
    const overlay = document.getElementById('modalOverlay');
    if (content && overlay) {
      content.innerHTML = html;
      overlay.classList.add('show');
      this.playSound('ping');
    }
  },

  closeModal() {
    document.getElementById('modalOverlay')?.classList.remove('show');
  },

  // ═══════════════════════════════════════════
  // MOBILE MENU
  // ═══════════════════════════════════════════
  bindMobileMenu() {
    const toggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const mq = window.matchMedia('(max-width: 768px)');

    const check = () => {
      if (toggle) toggle.style.display = mq.matches ? 'flex' : 'none';
      if (!mq.matches && sidebar) sidebar.classList.remove('open');
    };

    toggle?.addEventListener('click', () => sidebar?.classList.toggle('open'));
    mq.addEventListener('change', check);
    check();
  },

  // ═══════════════════════════════════════════
  // UPTIME TICKER
  // ═══════════════════════════════════════════
  startUptime() {
    const el = document.getElementById('footerUptime');
    if (!el) return;
    const tick = () => {
      const diff = Math.floor((Date.now() - this.startTime) / 1000);
      const h = Math.floor(diff / 3600);
      const m = Math.floor((diff % 3600) / 60);
      const s = diff % 60;
      el.textContent = h > 0 ? `${h}h ${m}m ${s}s` : `${m}m ${s}s`;
    };
    tick();
    setInterval(tick, 1000);
  },

  // ═══════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════
  formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  },

  formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
    return (bytes / 1073741824).toFixed(2) + ' GB';
  },

  formatDate(ts) {
    const d = new Date(ts);
    return d.toLocaleDateString('vi-VN') + ' ' + d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  },

  generateLogLines(count) {
    const platforms = ['Douyin', 'TikTok', 'YouTube', 'Xiaohongshu', 'Kuaishou', 'Bilibili', 'Honggo'];
    const lines = [];
    for (let i = 0; i < count; i++) {
      const plat = platforms[Math.floor(Math.random() * platforms.length)];
      const id = Math.random().toString(36).substring(2, 10);
      const size = (Math.random() * 30 + 5).toFixed(1);
      const now = new Date();
      now.setSeconds(now.getSeconds() - (count - i) * 4);
      const time = now.toLocaleTimeString('vi-VN');
      lines.push(
        `<span class="log-time">[${time}]</span> <span class="log-info">[${plat}]</span> Tải xong video <span class="log-url">#${id}</span> — ${size} MB (1080p không logo)`
      );
    }
    lines.push(`<span class="log-time">[${new Date().toLocaleTimeString('vi-VN')}]</span> <span class="log-success">✓ Sẵn sàng nhận lệnh mới. Dịch vụ AI Cloud 2TECH MN kết nối ổn định.</span>`);
    return lines.join('\n');
  },

  typeTerminal(containerId, lines, delay = 100) {
    const el = document.getElementById(containerId);
    if (!el) return;
    let idx = 0;
    const parts = lines.split('\n');
    el.innerHTML = '';
    const timer = setInterval(() => {
      if (idx >= parts.length) { clearInterval(timer); return; }
      el.innerHTML += parts[idx] + '\n';
      el.scrollTop = el.scrollHeight;
      idx++;
    }, delay);
  }
};
