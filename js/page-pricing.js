/* ═══════════════════════════════════════════════════════════════
   Mnhut 2tech Al — Page: Bảng Giá Chính Thức (2TECH MN)
   ═══════════════════════════════════════════════════════════════ */

window.Pages = window.Pages || {};
window.Pages['pricing'] = {
  currentCycle: 'year', // 'month' | 'halfyear' | 'year'
  selectedPlan: 'PRO',

  selectCard(planKey) {
    this.selectedPlan = planKey;
    document.querySelectorAll('.pricing-card-interactive').forEach(el => {
      const isCurrent = el.dataset.plan === planKey;
      el.classList.toggle('pricing-card-selected', isCurrent);
    });
    if (App && typeof App.playSound === 'function') {
      App.playSound('click');
    }
  },

  render() {
    const balance = App.store?.balance || 0;
    const balanceStr = balance.toLocaleString('vi-VN');
    const plan = App.store?.plan || 'FREE';

    const getBtnHtml = (planKey, planName) => {
      if (plan === planKey) {
        return `<button class="btn btn-disabled w-full py-2.5 mt-4" disabled>
                  <span style="color:#10b981;margin-right:6px;">✓</span> Đang sử dụng
                </button>`;
      }
      const btnClass = planKey === 'PRO' ? 'btn-gradient font-bold' : 'btn-secondary';
      return `<button class="btn ${btnClass} w-full py-2.5 mt-4" onclick="event.stopPropagation(); Pages.pricing.buyPlan('${planKey}', '${planName}')">
                Nâng Cấp Gói ${planName}
              </button>`;
    };

    return `
      <div class="flex flex-col gap-6">
        <!-- Header -->
        <div class="text-center max-w-2xl mx-auto">
          <span class="badge badge-accent mb-2">Bảng Giá Niêm Yết 2TECH MN 2026</span>
          <h1 class="text-3xl fw-700">Chi Phí Nhỏ — Hiệu Quả Triệu View</h1>
          <p class="text-sm text-muted mt-2">Chọn gói phù hợp với quy mô làm video của bạn. Nâng cấp VIP tự động trừ vào số dư tài khoản.</p>
        </div>

        <!-- Balance Display -->
        <div class="flex justify-center">
          <div class="card p-4 border border-gray-800 bg-gray-900/80 rounded-xl min-w-[320px] text-center shadow-lg" style="box-shadow:0 8px 24px rgba(16,185,129,0.12);">
            <div class="text-xs text-muted mb-1 flex items-center justify-center gap-1.5">
              <span>💰</span> <span>Số dư khả dụng trong tài khoản</span>
            </div>
            <div class="text-3xl fw-700 text-success font-mono tracking-tight">${balanceStr}đ</div>
            <div class="text-xs text-muted mt-1">Gói hiện tại: <strong class="text-accent">${plan}</strong></div>
          </div>
        </div>

        <!-- Cycle Switcher (Month / 6 Months / Year) -->
        <div class="flex justify-center items-center gap-2 my-2">
          <div class="bg-surface p-1.5 rounded-xl border border-gray-800 flex items-center shadow-inner">
            <button class="cycle-btn btn btn-sm btn-ghost text-xs" data-cycle="month" onclick="Pages.pricing.switchCycle('month')">1 Tháng</button>
            <button class="cycle-btn btn btn-sm btn-ghost text-xs" data-cycle="halfyear" onclick="Pages.pricing.switchCycle('halfyear')">6 Tháng (Tiết kiệm 50%)</button>
            <button class="cycle-btn btn btn-sm btn-gradient text-xs fw-600 active" data-cycle="year" onclick="Pages.pricing.switchCycle('year')">1 Năm (Tiết kiệm 63% + Tặng 1 Tháng)</button>
          </div>
        </div>

        <!-- 3 Core Pricing Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <!-- 1. Gói START -->
          <div class="card p-6 flex flex-col justify-between border border-gray-800 pricing-card-interactive ${this.selectedPlan === 'START' ? 'pricing-card-selected' : ''}" data-plan="START" onclick="Pages.pricing.selectCard('START')">
            <div>
              <div class="flex justify-between items-center mb-2">
                <span class="text-base fw-700">Gói START</span>
                <span class="badge badge-neutral text-xs">Cơ bản</span>
              </div>
              <div class="my-4">
                <div class="text-3xl fw-700 text-white font-mono" id="priceStart">149.000đ<span class="text-xs text-muted font-sans font-normal">/tháng</span></div>
                <div class="text-xs text-muted mt-1" id="subStart">Thanh toán 1 năm: 1.788.000đ (Dùng 13 tháng)</div>
              </div>
              <div class="divider"></div>
              
              <ul class="flex flex-col gap-3 text-xs my-4">
                <li class="flex items-center gap-2 text-white">
                  <span class="text-success">✓</span> <span>Tải <strong>4 nền tảng</strong> (TikTok, YouTube, FB, IG)</span>
                </li>
                <li class="flex items-center gap-2 text-white">
                  <span class="text-success">✓</span> <span><strong>50 video/ngày</strong> độ phân giải cao</span>
                </li>
                <li class="flex items-center gap-2 text-white">
                  <span class="text-success">✓</span> <span>Tự động xóa watermark sạch 100%</span>
                </li>
              </ul>
            </div>

            ${getBtnHtml('START', 'START')}
          </div>

          <!-- 2. Gói PRO (Most Popular) -->
          <div class="card p-6 flex flex-col justify-between border-2 border-accent relative ring-2 ring-accent/30 bg-gradient-to-b from-surface to-accent/5 pricing-card-interactive ${this.selectedPlan === 'PRO' ? 'pricing-card-selected' : ''}" data-plan="PRO" onclick="Pages.pricing.selectCard('PRO')">
            <div class="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-white text-xs px-3 py-1 rounded-full fw-700 shadow-md whitespace-nowrap">
              🔥 ĐƯỢC CHỌN NHIỀU NHẤT
            </div>

            <div>
              <div class="flex justify-between items-center mb-2">
                <span class="text-base fw-700 text-accent">Gói PRO</span>
                <span class="badge badge-success text-xs">Phổ Biến</span>
              </div>
              <div class="my-4">
                <div class="text-3xl fw-700 text-white font-mono" id="pricePro">249.000đ<span class="text-xs text-muted font-sans font-normal">/tháng</span></div>
                <div class="text-xs text-muted mt-1" id="subPro">Thanh toán 1 năm: 2.988.000đ (Dùng 13 tháng)</div>
              </div>
              <div class="divider"></div>

              <ul class="flex flex-col gap-3 text-xs my-4">
                <li class="flex items-center gap-2 text-white">
                  <span class="text-success">✓</span> <span>Tải <strong>8 nền tảng</strong> (+Douyin, Xiaohongshu, Kuaishou, RedNote)</span>
                </li>
                <li class="flex items-center gap-2 text-white">
                  <span class="text-success">✓</span> <span><strong>200 video/ngày</strong> chuẩn 4K 60FPS</span>
                </li>
                <li class="flex items-center gap-2 text-white">
                  <span class="text-success">✓</span> <span><strong>Tải hàng loạt (Batch download)</strong></span>
                </li>
                <li class="flex items-center gap-2 text-white">
                  <span class="text-success">✓</span> <span>Tốc độ bóc tách video siêu tốc</span>
                </li>
              </ul>
            </div>

            ${getBtnHtml('PRO', 'PRO')}
          </div>

          <!-- 3. Gói UNLIMITED -->
          <div class="card p-6 flex flex-col justify-between border border-gray-800 pricing-card-interactive ${this.selectedPlan === 'UNLIMITED' ? 'pricing-card-selected' : ''}" data-plan="UNLIMITED" onclick="Pages.pricing.selectCard('UNLIMITED')">
            <div>
              <div class="flex justify-between items-center mb-2">
                <span class="text-base fw-700 text-yellow-400">Gói UNLIMITED</span>
                <span class="badge badge-warning text-xs">Full Sức Mạnh</span>
              </div>
              <div class="my-4">
                <div class="text-3xl fw-700 text-white font-mono" id="priceUnlim">329.000đ<span class="text-xs text-muted font-sans font-normal">/tháng</span></div>
                <div class="text-xs text-muted mt-1" id="subUnlim">Thanh toán 1 năm: 3.948.000đ (Dùng 13 tháng)</div>
              </div>
              <div class="divider"></div>

              <ul class="flex flex-col gap-3 text-xs my-4">
                <li class="flex items-center gap-2 text-white">
                  <span class="text-success">✓</span> <span>Tải <strong>TOÀN BỘ 10+ nền tảng</strong> (kèm Bilibili, Honggo)</span>
                </li>
                <li class="flex items-center gap-2 text-white">
                  <span class="text-success">✓</span> <span><strong>KHÔNG GIỚI HẠN</strong> số lượng video tải/ngày</span>
                </li>
                <li class="flex items-center gap-2 text-white">
                  <span class="text-success">✓</span> <span><strong>Ưu tiên luồng tải cao cấp</strong> (Priority 4K Queue)</span>
                </li>
                <li class="flex items-center gap-2 text-white">
                  <span class="text-success">✓</span> <span>Hỗ trợ kỹ thuật 24/7 trực tiếp từ 2TECH MN</span>
                </li>
              </ul>
            </div>

            ${getBtnHtml('UNLIMITED', 'UNLIMITED')}
          </div>

        </div>
      </div>
    `;
  },

  init() {
    // Restore visual state for cycle on init just in case
    this.switchCycle(this.currentCycle);
  },

  switchCycle(cycle) {
    this.currentCycle = cycle;
    document.querySelectorAll('.cycle-btn').forEach(btn => {
      if (btn.dataset.cycle === cycle) {
        btn.classList.remove('btn-ghost');
        btn.classList.add('btn-gradient', 'active');
      } else {
        btn.classList.add('btn-ghost');
        btn.classList.remove('btn-gradient', 'active');
      }
    });

    const pStart = document.getElementById('priceStart');
    const sStart = document.getElementById('subStart');
    const pPro = document.getElementById('pricePro');
    const sPro = document.getElementById('subPro');
    const pUnlim = document.getElementById('priceUnlim');
    const sUnlim = document.getElementById('subUnlim');

    if (cycle === 'month') {
      if (pStart) pStart.innerHTML = '399.000đ<span class="text-xs text-muted font-sans font-normal">/tháng</span>';
      if (sStart) sStart.textContent = 'Gói tháng tiêu chuẩn';
      if (pPro) pPro.innerHTML = '599.000đ<span class="text-xs text-muted font-sans font-normal">/tháng</span>';
      if (sPro) sPro.textContent = 'Gói tháng tiêu chuẩn';
      if (pUnlim) pUnlim.innerHTML = '799.000đ<span class="text-xs text-muted font-sans font-normal">/tháng</span>';
      if (sUnlim) sUnlim.textContent = 'Gói tháng tiêu chuẩn';
    } else if (cycle === 'halfyear') {
      if (pStart) pStart.innerHTML = '199.000đ<span class="text-xs text-muted font-sans font-normal">/tháng</span>';
      if (sStart) sStart.textContent = 'Tổng 1.194.000đ / 6 tháng (Tiết kiệm 50%)';
      if (pPro) pPro.innerHTML = '399.000đ<span class="text-xs text-muted font-sans font-normal">/tháng</span>';
      if (sPro) sPro.textContent = 'Tổng 2.394.000đ / 6 tháng (Tiết kiệm 50%)';
      if (pUnlim) pUnlim.innerHTML = '499.000đ<span class="text-xs text-muted font-sans font-normal">/tháng</span>';
      if (sUnlim) sUnlim.textContent = 'Tổng 2.994.000đ / 6 tháng (Tiết kiệm 50%)';
    } else { // year
      if (pStart) pStart.innerHTML = '149.000đ<span class="text-xs text-muted font-sans font-normal">/tháng</span>';
      if (sStart) sStart.textContent = 'Thanh toán 1 năm: 1.788.000đ (Dùng 13 tháng)';
      if (pPro) pPro.innerHTML = '249.000đ<span class="text-xs text-muted font-sans font-normal">/tháng</span>';
      if (sPro) sPro.textContent = 'Thanh toán 1 năm: 2.988.000đ (Dùng 13 tháng)';
      if (pUnlim) pUnlim.innerHTML = '329.000đ<span class="text-xs text-muted font-sans font-normal">/tháng</span>';
      if (sUnlim) sUnlim.textContent = 'Thanh toán 1 năm: 3.948.000đ (Dùng 13 tháng)';
    }

    if (App && typeof App.playSound === 'function') {
      App.playSound('click');
    }
  },

  getPrice(planKey) {
    const key = planKey.toLowerCase();
    if (this.currentCycle === 'month') {
      if (key === 'start') return 399000;
      if (key === 'pro') return 599000;
      return 799000;
    } else if (this.currentCycle === 'halfyear') {
      if (key === 'start') return 1194000;
      if (key === 'pro') return 2394000;
      return 2994000;
    } else {
      if (key === 'start') return 1788000;
      if (key === 'pro') return 2988000;
      return 3948000;
    }
  },

  buyPlan(planKey, planName) {
    if (App.requireLogin && !App.requireLogin()) return;

    const price = this.getPrice(planKey);
    const balance = App.store?.balance || 0;

    if (balance < price) {
      if (App.notify) App.notify('error', 'Số dư không đủ. Vui lòng nạp thêm tiền vào tài khoản.');
      return;
    }

    const priceStr = price.toLocaleString('vi-VN');
    const balanceStr = balance.toLocaleString('vi-VN');
    const remainStr = (balance - price).toLocaleString('vi-VN');

    const modalHtml = `
      <div class="flex flex-col gap-4 text-sm">
        <div class="flex justify-between items-center border-b pb-3 border-gray-800">
          <div class="flex items-center gap-2">
            <span class="badge-dot green"></span>
            <h3 class="text-base fw-700 text-white">Xác nhận thanh toán</h3>
          </div>
          <button class="btn btn-sm btn-ghost" onclick="App.closeModal()">✕</button>
        </div>
        
        <div class="py-2">
          <p class="mb-4 text-base">Bạn có muốn mua gói <strong>${planName}</strong> với giá <span class="text-accent fw-700">${priceStr}đ</span>?</p>
          <div class="p-3 bg-gray-900 rounded border border-gray-800 flex flex-col gap-2">
            <div class="flex justify-between">
              <span class="text-muted">Số dư hiện tại:</span>
              <span class="text-white font-mono">${balanceStr}đ</span>
            </div>
            <div class="flex justify-between border-t border-gray-800 pt-2 mt-1">
              <span class="text-muted">Sau khi mua, số dư còn lại:</span>
              <span class="text-success fw-700 font-mono">${remainStr}đ</span>
            </div>
          </div>
        </div>

        <div class="flex gap-3 justify-end mt-2">
          <button class="btn btn-ghost" onclick="App.closeModal()">Hủy</button>
          <button class="btn btn-gradient px-6 font-bold" onclick="Pages.pricing.confirmBuy('${planKey}', ${price})">Xác nhận mua</button>
        </div>
      </div>
    `;

    App.openModal(modalHtml);
  },

  confirmBuy(planKey, price) {
    const balance = App.store?.balance || 0;
    if (balance < price) {
      App.notify('error', 'Số dư không đủ!');
      App.closeModal();
      return;
    }

    // Deduct balance
    App.store.balance = balance - price;
    
    // Set plan
    App.store.plan = planKey;
    
    // Calculate expiry date
    let daysToAdd = 30; // month
    if (this.currentCycle === 'halfyear') daysToAdd = 180;
    if (this.currentCycle === 'year') daysToAdd = 365 + 30; // 13 months
    
    const now = new Date();
    App.store.planExpiry = new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000).toISOString();

    // Record transaction in history
    App.store.downloadHistory = App.store.downloadHistory || [];
    App.store.downloadHistory.unshift({
      id: 'tx_' + Date.now(),
      action: 'Nâng cấp gói ' + planKey,
      details: `Thanh toán thành công ${price.toLocaleString('vi-VN')}đ (Thời hạn: +${daysToAdd} ngày)`,
      time: new Date().toISOString(),
      status: 'Thành công'
    });

    // Broadcast sync to Admin Panel
    try {
      if (window.BroadcastChannel) {
        const bc = new BroadcastChannel('2tech_channel');
        bc.postMessage({
          type: 'PLAN_PURCHASE',
          data: {
            email: App.store.user?.email,
            name: App.store.user?.name,
            plan: planKey,
            price: price,
            balance: App.store.balance,
            timestamp: new Date().toISOString()
          }
        });
        bc.close();
      }
    } catch (_) {}

    App.saveStore();
    App.updateUI();
    App.closeModal();
    if (App.playSound) App.playSound('success');
    if (App.notify) App.notify('success', `Đã nâng cấp thành công gói ${planKey}! Số dư còn lại: ${(App.store.balance).toLocaleString('vi-VN')}đ.`);
    
    // Re-render the pricing page
    App.navigate('pricing');
  }
};
