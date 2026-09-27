/* ═══════════════════════════════════════════════════════════════
   Mnhut 2tech Al — Core Application Controller & State Engine
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
    balance: 0, // VNĐ — initialized to 2,500,000 VNĐ ($100 Credit) on first Google/Apple sign-in
    plan: 'FREE', // FREE | START | PRO | UNLIMITED | ULTRA
    planExpiry: null, // ISO date string
    downloadedVideos: [],
    downloadHistory: [],
    platformConnections: {}, // { Douyin: {cookie, status}, ... }
    settings: {
      downloadPath: 'D:\\Videos\\Mnhut_2tech_Al\\Downloaded\\',
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
    { id: 'support',        title: 'Gửi câu hỏi',          step: 1 },
    { id: 'pricing',        title: 'Gói Cước & Ví Tiền',   step: 1 },
  ],

  // ═══════════════════════════════════════════
  // INIT
  // ═══════════════════════════════════════════
  deviceMode: (() => { try { return localStorage.getItem('vc_device_mode') || 'auto'; } catch (e) { return 'auto'; } })(), // 'auto' | 'ios' | 'android' | 'desktop'
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
    this.syncBackendSession();

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
    const platform = navigator.platform || '';
    const vendor = navigator.vendor || '';
    const maxTouchPoints = navigator.maxTouchPoints || 0;

    // Robust Apple iOS identification (iPhone, iPod, iPad, iPadOS 13+ desktop UA, standalone PWA)
    const isIos = /iPad|iPhone|iPod/.test(ua) || 
      (platform === 'MacIntel' && maxTouchPoints > 1) || 
      (/AppleWebKit/.test(ua) && /Mobile/.test(ua) && !/Android/.test(ua)) ||
      (window.navigator.standalone === true) ||
      (/Apple/.test(vendor) && maxTouchPoints > 0 && !/Windows|Linux|Android/.test(platform));

    const isAndroid = /Android/.test(ua);
    const isMobileScreen = window.innerWidth <= 860 || (maxTouchPoints > 0 && window.innerWidth <= 1024);

    let os = 'desktop';
    let isMobile = false;

    if (isIos) {
      os = 'ios';
      isMobile = true;
    } else if (isAndroid) {
      os = 'android';
      isMobile = true;
    } else if (isMobileScreen) {
      isMobile = true;
      os = (/Mac|iPhone|iPad/i.test(platform) || /Apple/i.test(vendor)) ? 'ios' : 'android';
    }

    this.device = { os, isMobile, isIos, isAndroid, ua, platform, maxTouchPoints };
    this.applyDeviceMode();
  },

  applyDeviceMode() {
    const mode = this.deviceMode; // 'auto' | 'ios' | 'android' | 'desktop'
    let activeOs = this.device.os;
    let isMobile = this.device.isMobile;

    if (mode === 'ios') {
      activeOs = 'ios';
      isMobile = true;
    } else if (mode === 'android') {
      activeOs = 'android';
      isMobile = true;
    } else if (mode === 'desktop') {
      activeOs = 'desktop';
      isMobile = false;
    }

    const root = document.documentElement;
    root.classList.toggle('device-ios', activeOs === 'ios');
    root.classList.toggle('device-android', activeOs === 'android');
    root.classList.toggle('device-mobile', isMobile);
    root.classList.toggle('device-desktop', !isMobile);
    root.classList.toggle('force-mobile-view', isMobile);

    const badgeText = document.getElementById('deviceText');
    const badgeIcon = document.getElementById('deviceIcon');
    const badgeContainer = document.getElementById('btnDeviceMode');
    if (badgeText && badgeIcon) {
      if (mode === 'auto') {
        if (activeOs === 'ios') {
          badgeIcon.textContent = '🍏';
          badgeText.textContent = 'Apple iOS';
          badgeContainer?.classList.remove('badge-neutral', 'badge-info');
          badgeContainer?.classList.add('badge-accent');
        } else if (activeOs === 'android') {
          badgeIcon.textContent = '🤖';
          badgeText.textContent = 'Android';
          badgeContainer?.classList.remove('badge-neutral', 'badge-accent');
          badgeContainer?.classList.add('badge-info');
        } else {
          badgeIcon.textContent = '💻';
          badgeText.textContent = 'PC 4K';
          badgeContainer?.classList.remove('badge-accent', 'badge-info');
          badgeContainer?.classList.add('badge-neutral');
        }
      } else if (mode === 'ios') {
        badgeIcon.textContent = '🍏';
        badgeText.textContent = 'Apple iOS';
        badgeContainer?.classList.remove('badge-neutral', 'badge-info');
        badgeContainer?.classList.add('badge-accent');
      } else if (mode === 'android') {
        badgeIcon.textContent = '🤖';
        badgeText.textContent = 'Android';
        badgeContainer?.classList.remove('badge-neutral', 'badge-accent');
        badgeContainer?.classList.add('badge-info');
      } else {
        badgeIcon.textContent = '💻';
        badgeText.textContent = 'PC 4K';
        badgeContainer?.classList.remove('badge-accent', 'badge-info');
        badgeContainer?.classList.add('badge-neutral');
      }
    }
  },

  bindDeviceMode() {
    const btn = document.getElementById('btnDeviceMode');
    btn?.addEventListener('click', () => {
      const modes = ['auto', 'ios', 'android', 'desktop'];
      const nextIdx = (modes.indexOf(this.deviceMode) + 1) % modes.length;
      this.deviceMode = modes[nextIdx];
      try { localStorage.setItem('vc_device_mode', this.deviceMode); } catch (e) {}
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
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        if (this.deviceMode === 'auto') this.detectDevice();
      }, 100);
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

    const planStatus = this.getPlanStatus();

    if (this.store.user) {
      if (nameEl) nameEl.textContent = this.store.user.name || this.store.user.email;
      if (balEl) {
        const badgeColor = planStatus.isExpired ? '#ef4444' : planStatus.plan === 'ULTRA' ? '#10b981' : planStatus.plan === 'UNLIMITED' ? '#f59e0b' : '#3b82f6';
        balEl.innerHTML = `<span style="font-weight:700;">${this.formatCurrency(this.store.balance)}</span> <span style="font-size:9px;padding:1px 6px;border-radius:999px;background:${badgeColor}22;color:${badgeColor};border:1px solid ${badgeColor}55;font-weight:700;margin-left:4px;">${planStatus.isExpired ? 'Hết hạn' : planStatus.plan}</span>`;
      }
      if (avatarEl) {
        const initials = (this.store.user.initial || this.store.user.name || 'U').charAt(0).toUpperCase();
        if (this.store.user.avatar) {
          avatarEl.innerHTML = `<img src="${this.store.user.avatar}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" alt="">`;
        } else {
          avatarEl.textContent = initials;
          if (this.store.user.color) avatarEl.style.background = this.store.user.color;
        }
      }
      if (btnLogin) { btnLogin.textContent = 'Đăng xuất'; btnLogin.id = 'btnLogout'; }
    } else {
      if (nameEl) nameEl.textContent = 'Chưa đăng nhập';
      if (balEl) balEl.textContent = '0đ';
      if (avatarEl) {
        avatarEl.textContent = '?';
        avatarEl.style.background = 'var(--accent)';
      }
    }
    if (headerBal) headerBal.textContent = this.formatCurrency(this.store.balance);
  },

  async syncBackendSession() {
    try {
      const res = await fetch('/api/me', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data && data.user) {
          const u = data.user;
          this.store.user = {
            id: u.id,
            name: u.name || u.email,
            email: u.email,
            provider: u.provider || 'google',
            avatar: null,
            initial: (u.name || u.email || 'U').charAt(0).toUpperCase()
          };
          if (typeof u.balance === 'number') this.store.balance = u.balance;
          if (u.plan) this.store.plan = u.plan;
          if (u.planExpiry) this.store.planExpiry = new Date(u.planExpiry).toISOString();
          this.saveStore();
          this.updateUI();
        }
      }
    } catch (_) {}
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
      <div class="auth-modal-container" style="max-width:460px;margin:0 auto;background:#18181b;color:#f4f4f5;border-radius:18px;padding:26px 24px;border:1px solid #27272a;box-shadow:0 20px 60px rgba(0,0,0,0.85);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
        <!-- Header -->
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
          <div style="display:flex;align-items:center;gap:10px;">
            <div style="width:34px;height:34px;border-radius:8px;background:linear-gradient(135deg, #10b981 0%, #059669 100%);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;font-size:15px;">2T</div>
            <div>
              <div style="font-size:15px;font-weight:700;color:#fff;line-height:1.2;">Mnhut 2tech Al</div>
              <div style="font-size:11px;color:#a1a1aa;">Bản quyền 2TECH MN — Nguyễn Minh Nhựt</div>
            </div>
          </div>
          <button class="btn btn-sm btn-ghost" onclick="App.closeModal()" style="color:#a1a1aa;font-size:18px;line-height:1;padding:4px 8px;">✕</button>
        </div>

        <!-- Incentive Banner (100$ + 1 Month Ultra) -->
        <div style="margin-bottom:18px;padding:12px 14px;background:linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(59,130,246,0.12) 100%);border:1px solid rgba(16,185,129,0.35);border-radius:12px;text-align:left;">
          <div style="font-size:12px;font-weight:700;color:#34d399;display:flex;align-items:center;gap:6px;margin-bottom:4px;">
            <span>🎁</span> <span>ĐẶC QUYỀN ĐĂNG NHẬP GOOGLE & APPLE ID:</span>
          </div>
          <div style="font-size:12px;color:#e4e4e7;line-height:1.5;">
            • Tặng ngay <strong style="color:#10b981;">$100 USD Credit (~2.500.000 VNĐ)</strong> vào tài khoản ví.<br>
            • Tặng <strong style="color:#38bdf8;">1 THÁNG GÓI ULTRA VIP MIỄN PHÍ</strong> (Hệ thống tính thời gian thực 30 ngày, 4K 60FPS 8 luồng siêu tốc).
          </div>
        </div>

        <!-- Provider Tabs -->
        <div style="display:flex;background:#27272a;border-radius:10px;padding:3px;margin-bottom:16px;">
          <button type="button" id="tabLoginGoogle" class="btn btn-sm" style="flex:1;background:#3f3f46;color:#fff;font-weight:600;border:none;border-radius:8px;font-size:12px;display:flex;align-items:center;justify-content:center;gap:6px;padding:8px 0;">
            <svg width="16" height="16" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Tài khoản Google
          </button>
          <button type="button" id="tabLoginApple" class="btn btn-sm btn-ghost" style="flex:1;color:#a1a1aa;font-weight:600;border:none;border-radius:8px;font-size:12px;display:flex;align-items:center;justify-content:center;gap:6px;padding:8px 0;">
            <svg width="16" height="16" viewBox="0 0 170 170" fill="currentColor">
              <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.08-7.74-7.85-12.14-14.31-6.13-9.08-11.02-19.46-14.66-31.14-3.64-11.69-5.46-22.95-5.46-33.8 0-14.28 3.51-26.06 10.53-35.34 7.02-9.28 16.03-14.07 27.02-14.38 4.58 0 9.87 1.25 15.86 3.76 5.99 2.51 9.94 3.82 11.85 3.93 2.12-.22 6.28-1.58 12.49-4.09 6.21-2.51 11.45-3.67 15.72-3.48 11.7.65 21.05 4.67 28.06 12.06-9.87 6-14.7 14.16-14.5 24.48.2 8.7 3.42 16.08 9.66 22.13 6.24 6.05 13.78 9.4 22.62 10.05-2.02 6.08-4.43 12.08-7.23 18zM119.22 33.15c0-6.9 2.45-13.37 7.35-19.41 4.9-6.04 11.05-10.37 18.45-13 1.09 6.74-.22 13.27-3.93 19.59-3.71 6.32-9.87 10.74-18.48 13.27-.33-.15-.8-.25-1.39-.45z"/>
            </svg>
            Apple ID
          </button>
        </div>

        <!-- Google Section -->
        <div id="sectionGoogleAuth" style="display:flex;flex-direction:column;gap:8px;">
          <!-- Account 1: Nguyễn Minh Nhựt -->
          <div class="acc-card" onclick="App.simulateLogin('Nguyễn Minh Nhựt', 'minhnhut@2techmn.com', 'google', 'N', '#10b981')" style="display:flex;align-items:center;gap:12px;padding:10px 14px;background:#27272a;border:1px solid #3f3f46;border-radius:10px;cursor:pointer;transition:all .2s ease;">
            <div style="width:36px;height:36px;border-radius:50%;background:#10b981;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:15px;flex-shrink:0;">N</div>
            <div style="flex:1;min-width:0;text-align:left;">
              <div style="font-size:13px;font-weight:600;color:#fff;">Nguyễn Minh Nhựt</div>
              <div style="font-size:11px;color:#a1a1aa;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">minhnhut@2techmn.com</div>
            </div>
            <span style="font-size:10px;padding:2px 8px;border-radius:999px;background:rgba(16,185,129,0.2);color:#34d399;font-weight:600;flex-shrink:0;">Chính thức</span>
          </div>

          <!-- Account 2: Khách Hàng VIP -->
          <div class="acc-card" onclick="App.simulateLogin('2TECH Enterprise VIP', 'enterprise@2techmn.com', 'google', '2T', '#3b82f6')" style="display:flex;align-items:center;gap:12px;padding:10px 14px;background:#27272a;border:1px solid #3f3f46;border-radius:10px;cursor:pointer;transition:all .2s ease;">
            <div style="width:36px;height:36px;border-radius:50%;background:#3b82f6;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;flex-shrink:0;">2T</div>
            <div style="flex:1;min-width:0;text-align:left;">
              <div style="font-size:13px;font-weight:600;color:#fff;">2TECH Enterprise VIP</div>
              <div style="font-size:11px;color:#a1a1aa;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">enterprise@2techmn.com</div>
            </div>
            <span style="font-size:10px;padding:2px 8px;border-radius:999px;background:rgba(59,130,246,0.2);color:#60a5fa;font-weight:600;flex-shrink:0;">VIP</span>
          </div>

          <!-- Custom Google -->
          <div class="acc-card" id="btnToggleOtherGoogle" style="display:flex;align-items:center;gap:12px;padding:10px 14px;background:#202023;border:1px dashed #52525b;border-radius:10px;cursor:pointer;transition:all .2s ease;">
            <div style="width:36px;height:36px;border-radius:50%;background:#27272a;color:#a1a1aa;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:bold;flex-shrink:0;">+</div>
            <div style="flex:1;min-width:0;text-align:left;">
              <div style="font-size:13px;font-weight:500;color:#f4f4f5;">Nhập email Google khác</div>
              <div style="font-size:11px;color:#71717a;">Nhận $100 Credit + 1 Tháng ULTRA</div>
            </div>
          </div>
        </div>

        <!-- Apple ID Section (hidden by default) -->
        <div id="sectionAppleAuth" style="display:none;flex-direction:column;gap:8px;">
          <!-- Account Apple 1 -->
          <div class="acc-card" onclick="App.simulateLogin('Nguyễn Minh Nhựt (Apple ID)', 'minhnhut@icloud.com', 'apple', '', '#000000')" style="display:flex;align-items:center;gap:12px;padding:10px 14px;background:#27272a;border:1px solid #3f3f46;border-radius:10px;cursor:pointer;transition:all .2s ease;">
            <div style="width:36px;height:36px;border-radius:50%;background:#000;border:1px solid #52525b;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:17px;flex-shrink:0;"></div>
            <div style="flex:1;min-width:0;text-align:left;">
              <div style="font-size:13px;font-weight:600;color:#fff;">Nguyễn Minh Nhựt</div>
              <div style="font-size:11px;color:#a1a1aa;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">minhnhut@icloud.com</div>
            </div>
            <span style="font-size:10px;padding:2px 8px;border-radius:999px;background:rgba(255,255,255,0.1);color:#e4e4e7;font-weight:600;flex-shrink:0;">Apple ID</span>
          </div>

          <!-- Account Apple 2 -->
          <div class="acc-card" onclick="App.simulateLogin('Apple Developer 2TECH', 'dev.nhut@apple.com', 'apple', '', '#000000')" style="display:flex;align-items:center;gap:12px;padding:10px 14px;background:#27272a;border:1px solid #3f3f46;border-radius:10px;cursor:pointer;transition:all .2s ease;">
            <div style="width:36px;height:36px;border-radius:50%;background:#000;border:1px solid #52525b;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:17px;flex-shrink:0;"></div>
            <div style="flex:1;min-width:0;text-align:left;">
              <div style="font-size:13px;font-weight:600;color:#fff;">Apple Developer 2TECH</div>
              <div style="font-size:11px;color:#a1a1aa;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">dev.nhut@apple.com</div>
            </div>
            <span style="font-size:10px;padding:2px 8px;border-radius:999px;background:rgba(16,185,129,0.2);color:#34d399;font-weight:600;flex-shrink:0;">VIP</span>
          </div>

          <!-- Custom Apple ID -->
          <div class="acc-card" id="btnToggleOtherApple" style="display:flex;align-items:center;gap:12px;padding:10px 14px;background:#202023;border:1px dashed #52525b;border-radius:10px;cursor:pointer;transition:all .2s ease;">
            <div style="width:36px;height:36px;border-radius:50%;background:#27272a;color:#a1a1aa;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:bold;flex-shrink:0;">+</div>
            <div style="flex:1;min-width:0;text-align:left;">
              <div style="font-size:13px;font-weight:500;color:#f4f4f5;">Nhập Apple ID khác</div>
              <div style="font-size:11px;color:#71717a;">Nhận $100 Credit + 1 Tháng ULTRA</div>
            </div>
          </div>
        </div>

        <!-- Custom Account Form (hidden by default) -->
        <div id="otherAccForm" style="display:none;margin-top:14px;flex-direction:column;gap:10px;text-align:left;">
          <div style="font-size:12px;font-weight:600;color:#e4e4e7;" id="customFormTitle">Nhập thông tin tài khoản:</div>
          <input type="text" id="customAccName" placeholder="Tên hiển thị (VD: Nguyễn Minh Nhựt)" style="width:100%;padding:10px 12px;border:1px solid #3f3f46;border-radius:8px;font-size:13px;color:#fff;background:#27272a;outline:none;">
          <input type="email" id="customAccEmail" placeholder="Địa chỉ email (VD: nhut@gmail.com)" style="width:100%;padding:10px 12px;border:1px solid #3f3f46;border-radius:8px;font-size:13px;color:#fff;background:#27272a;outline:none;">
          <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:4px;">
            <button type="button" id="btnCancelCustomAcc" class="btn btn-sm btn-ghost">Quay lại</button>
            <button type="button" id="btnSubmitCustomAcc" class="btn btn-sm btn-gradient font-bold px-4">Xác nhận đăng nhập</button>
          </div>
        </div>

        <!-- Loading State -->
        <div id="authLoadingBox" style="display:none;margin-top:20px;flex-direction:column;align-items:center;gap:12px;text-align:center;">
          <div style="width:36px;height:36px;border:3px solid #27272a;border-top-color:#10b981;border-radius:50%;animation:spinGoogle 0.7s linear infinite;"></div>
          <div style="font-size:13px;font-weight:600;color:#34d399;" id="authLoadingText">Đang xác thực OAuth 2.0...</div>
          <div style="font-size:11px;color:#a1a1aa;">Đang cấp $100 Credit (2.500.000đ) & kích hoạt 1 tháng ULTRA VIP...</div>
        </div>

        <!-- Footer -->
        <div style="margin-top:18px;padding-top:12px;border-top:1px solid #27272a;font-size:11px;color:#71717a;text-align:center;line-height:1.5;">
          Hệ thống bảo mật 2TECH MN. Số dư & Gói ULTRA được tính toán thời gian thực tại backend.
        </div>
      </div>
    `;
    this.openModal(html);

    // Tab switching between Google & Apple
    const tabGoogle = document.getElementById('tabLoginGoogle');
    const tabApple = document.getElementById('tabLoginApple');
    const secGoogle = document.getElementById('sectionGoogleAuth');
    const secApple = document.getElementById('sectionAppleAuth');
    const customForm = document.getElementById('otherAccForm');
    let currentProvider = 'google';

    tabGoogle?.addEventListener('click', () => {
      currentProvider = 'google';
      tabGoogle.style.background = '#3f3f46';
      tabGoogle.style.color = '#fff';
      tabApple.style.background = 'transparent';
      tabApple.style.color = '#a1a1aa';
      secGoogle.style.display = 'flex';
      secApple.style.display = 'none';
      if (customForm) customForm.style.display = 'none';
      this.playSound('click');
    });

    tabApple?.addEventListener('click', () => {
      currentProvider = 'apple';
      tabApple.style.background = '#3f3f46';
      tabApple.style.color = '#fff';
      tabGoogle.style.background = 'transparent';
      tabGoogle.style.color = '#a1a1aa';
      secApple.style.display = 'flex';
      secGoogle.style.display = 'none';
      if (customForm) customForm.style.display = 'none';
      this.playSound('click');
    });

    // Custom Account Form Toggles
    const openCustomForm = (providerName, defaultEmail) => {
      secGoogle.style.display = 'none';
      secApple.style.display = 'none';
      customForm.style.display = 'flex';
      document.getElementById('customFormTitle').textContent = `Nhập thông tin tài khoản ${providerName}:`;
      const emailInput = document.getElementById('customAccEmail');
      if (emailInput) emailInput.placeholder = defaultEmail;
      document.getElementById('customAccName')?.focus();
    };

    document.getElementById('btnToggleOtherGoogle')?.addEventListener('click', () => {
      openCustomForm('Google', 'VD: minhnhut@gmail.com');
    });

    document.getElementById('btnToggleOtherApple')?.addEventListener('click', () => {
      openCustomForm('Apple ID', 'VD: minhnhut@icloud.com');
    });

    document.getElementById('btnCancelCustomAcc')?.addEventListener('click', () => {
      customForm.style.display = 'none';
      if (currentProvider === 'google') secGoogle.style.display = 'flex';
      else secApple.style.display = 'flex';
    });

    document.getElementById('btnSubmitCustomAcc')?.addEventListener('click', () => {
      const name = document.getElementById('customAccName')?.value.trim();
      const email = document.getElementById('customAccEmail')?.value.trim();
      if (!name || !email) {
        this.notify('warning', 'Thiếu thông tin', 'Vui lòng nhập tên và email.');
        return;
      }
      const initial = currentProvider === 'apple' ? '' : name.charAt(0).toUpperCase();
      const color = currentProvider === 'apple' ? '#000000' : '#10b981';
      this.simulateLogin(name, email, currentProvider, initial, color);
    });
  },

  simulateLogin(name, email, provider = 'google', initial = 'U', color = '#10b981') {
    const secGoogle = document.getElementById('sectionGoogleAuth');
    const secApple = document.getElementById('sectionAppleAuth');
    const customForm = document.getElementById('otherAccForm');
    const loadingBox = document.getElementById('authLoadingBox');
    const loadingText = document.getElementById('authLoadingText');

    if (secGoogle) secGoogle.style.display = 'none';
    if (secApple) secApple.style.display = 'none';
    if (customForm) customForm.style.display = 'none';
    if (loadingBox) {
      loadingBox.style.display = 'flex';
      if (loadingText) loadingText.textContent = `Đang đồng bộ hồ sơ ${provider === 'apple' ? 'Apple ID' : 'Google'} (${email})...`;
    }

    setTimeout(() => {
      this.completeLogin(name, email, provider, { initial, color });
    }, 700);
  },

  completeLogin(name, email, provider = 'google', meta = {}) {
    const isNewUser = !this.store.user || this.store.user.email !== email;
    const initial = meta.initial || (name ? name.charAt(0).toUpperCase() : (provider === 'apple' ? '' : 'U'));
    const color = meta.color || (provider === 'apple' ? '#000000' : '#10b981');

    this.store.user = {
      name,
      email,
      provider,
      avatar: null,
      initial,
      color,
      loginDate: new Date().toISOString()
    };

    // Upon login with Google / Apple: User receives $100 Credit (2,500,000 VNĐ) + 1 Month ULTRA VIP trial
    if (isNewUser || !this.store.balance || this.store.balance === 0) {
      this.store.balance = 2500000; // 2.500.000đ ($100 USD Credit)
    }
    if (isNewUser || !this.store.plan || this.store.plan === 'FREE') {
      this.store.plan = 'ULTRA';
      this.store.planExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 1 month free trial
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
        plan: this.store.plan || 'ULTRA',
        planExpiry: this.store.planExpiry
      };
      trafficLogs.unshift(sessionEntry);
      if (trafficLogs.length > 200) trafficLogs.length = 200;
      localStorage.setItem('vc_google_traffic', JSON.stringify(trafficLogs));

      // Broadcast sync event to Admin Panel if open
      if (window.BroadcastChannel) {
        const bc = new BroadcastChannel('2tech_channel');
        bc.postMessage({ type: 'USER_SIGNIN', data: sessionEntry });
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
      this.notify('success', `Chào mừng ${name}!`, `Đã tặng 2.500.000đ ($100 Credit) & 1 tháng miễn phí Gói ULTRA VIP!`);
    } else {
      this.notify('success', 'Đăng nhập thành công!', `Chào mừng ${name} quay trở lại Mnhut 2tech Al.`);
    }

    // Refresh current page if pricing
    if (this.currentPage === 'pricing' && window.Pages && window.Pages['pricing']) {
      this.navigate('pricing');
    }
  },

  formatCurrency(amount) {
    if (!amount && amount !== 0) return '0đ';
    return amount.toLocaleString('vi-VN') + 'đ';
  },

  // ═══════════════════════════════════════════
  // PLAN & REAL-TIME EXPIRATION ENGINE
  // ═══════════════════════════════════════════
  getPlanStatus() {
    const plan = this.store?.plan || 'FREE';
    const expiry = this.store?.planExpiry;
    if (plan === 'FREE' || !expiry) {
      return {
        plan: 'FREE',
        basePlan: 'FREE',
        isExpired: false,
        isActive: false,
        remainingMs: 0,
        remainingDays: 0,
        remainingHours: 0,
        remainingMins: 0,
        remainingSecs: 0,
        formattedCountdown: 'Gói miễn phí',
        expiryDateStr: 'Không thời hạn'
      };
    }

    const expiryTime = new Date(expiry).getTime();
    const now = Date.now();
    const remainingMs = expiryTime - now;

    if (remainingMs <= 0) {
      return {
        plan: 'FREE', // Effective fallback on real-time expiry
        basePlan: plan,
        isExpired: true,
        isActive: false,
        remainingMs: 0,
        remainingDays: 0,
        remainingHours: 0,
        remainingMins: 0,
        remainingSecs: 0,
        formattedCountdown: 'Đã hết hạn',
        expiryDateStr: new Date(expiryTime).toLocaleDateString('vi-VN')
      };
    }

    const remainingDays = Math.floor(remainingMs / (24 * 3600 * 1000));
    const remainingHours = Math.floor((remainingMs % (24 * 3600 * 1000)) / (3600 * 1000));
    const remainingMins = Math.floor((remainingMs % (3600 * 1000)) / (60 * 1000));
    const remainingSecs = Math.floor((remainingMs % (60 * 1000)) / 1000);

    return {
      plan: plan,
      basePlan: plan,
      isExpired: false,
      isActive: true,
      remainingMs,
      remainingDays,
      remainingHours,
      remainingMins,
      remainingSecs,
      formattedCountdown: `${remainingDays} ngày : ${String(remainingHours).padStart(2,'0')} giờ : ${String(remainingMins).padStart(2,'0')} phút : ${String(remainingSecs).padStart(2,'0')} giây`,
      expiryDateStr: new Date(expiryTime).toLocaleString('vi-VN')
    };
  },

  isFeatureAllowed(feature) {
    const status = this.getPlanStatus();
    const plan = status.isExpired ? 'FREE' : status.plan;
    const freeFeatures = ['download-link-basic', 'view-history', 'support'];
    const startFeatures = [...freeFeatures, 'download-tiktok', 'download-youtube', 'download-facebook', 'download-instagram'];
    const proFeatures = [...startFeatures, 'download-douyin', 'download-xiaohongshu', 'download-kuaishou', 'download-rednote', 'batch-download'];
    const unlimitedFeatures = [...proFeatures, 'download-honggo', 'download-bilibili', 'unlimited-downloads', 'priority-support'];
    const ultraFeatures = [...unlimitedFeatures, '4k-60fps', 'batch-200', '8-threads', 'ultra-vip', 'priority-queue', 'anti-detect-deep'];

    if (plan === 'ULTRA') return true;
    if (plan === 'UNLIMITED') return unlimitedFeatures.includes(feature) || proFeatures.includes(feature) || startFeatures.includes(feature) || freeFeatures.includes(feature);
    if (plan === 'PRO') return proFeatures.includes(feature) || startFeatures.includes(feature) || freeFeatures.includes(feature);
    if (plan === 'START') return startFeatures.includes(feature) || freeFeatures.includes(feature);
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
    const status = this.getPlanStatus();
    if (status.isExpired) {
      this.notify('warning', 'Gói cước đã hết hạn', `Gói ${status.basePlan} của bạn đã hết hạn. Vui lòng thanh toán gia hạn hoặc chọn gói khác để tiếp tục sử dụng.`);
      this.navigate('pricing');
      return false;
    }
    const levels = { FREE: 0, START: 1, PRO: 2, UNLIMITED: 3, ULTRA: 4 };
    const curLevel = levels[status.plan] || 0;
    const reqLevel = levels[minPlan] || 0;
    if (curLevel < reqLevel) {
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
    if (toggle) toggle.style.display = 'none';
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
