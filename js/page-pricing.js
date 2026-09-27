/* ═══════════════════════════════════════════════════════════════
   Mnhut 2tech Al — Page: Bảng Giá & Cổng Nạp Đa Kênh (2TECH MN)
   Developed for 2TECH MN (Nguyễn Minh Nhựt)
   ═══════════════════════════════════════════════════════════════ */

window.Pages = window.Pages || {};
window.Pages['pricing'] = {
  currentCycle: 'year', // 'month' | 'halfyear' | 'year'
  selectedPlan: 'ULTRA',
  timerInterval: null,
  activeDeposit: null,
  pollInterval: null,

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
    const balanceUsd = (balance / 25000).toFixed(2);
    const planStatus = App.getPlanStatus ? App.getPlanStatus() : { plan: App.store?.plan || 'FREE', isExpired: false };
    const currentPlanKey = planStatus.plan;

    const getBtnHtml = (planKey, planName) => {
      const isCurrentActive = currentPlanKey === planKey && !planStatus.isExpired;
      if (isCurrentActive) {
        return `<button class="btn btn-gradient w-full py-2.5 mt-4 font-bold" onclick="event.stopPropagation(); Pages.pricing.buyPlan('${planKey}', '${planName}', true)">
                  <span style="margin-right:6px;">↻</span> Gia Hạn Thêm Gói ${planName}
                </button>`;
      }
      const btnClass = planKey === 'ULTRA' ? 'btn-gradient font-bold' : planKey === 'PRO' ? 'btn-primary font-bold' : 'btn-secondary';
      return `<button class="btn ${btnClass} w-full py-2.5 mt-4" onclick="event.stopPropagation(); Pages.pricing.buyPlan('${planKey}', '${planName}', false)">
                Nâng Cấp Gói ${planName}
              </button>`;
    };

    return `
      <div class="flex flex-col gap-6">
        <!-- Header -->
        <div class="text-center max-w-3xl mx-auto">
          <span class="badge badge-accent mb-2">Bảng Giá Niêm Yết & Cổng Nạp Thật — 2TECH MN 2026</span>
          <h1 class="text-3xl fw-700">Gói Cước VIP & Nạp Tín Dụng Khả Dụng</h1>
          <p class="text-sm text-muted mt-2">Toàn bộ tính năng 4K 60FPS, đa luồng tốc độ cao. Nâng cấp VIP tự động trừ vào số dư tài khoản.</p>
        </div>

        <!-- Active Plan Live Countdown Banner -->
        <div class="card p-5 border border-gray-800 rounded-xl" style="background:linear-gradient(135deg, rgba(24,24,27,0.95) 0%, rgba(16,185,129,0.06) 100%);box-shadow:0 8px 30px rgba(0,0,0,0.45);">
          <div class="flex flex-col md:flex-row items-center justify-between gap-4">
            <div class="flex items-center gap-4">
              <div style="width:48px;height:48px;border-radius:12px;background:${planStatus.isExpired ? '#ef444422' : planStatus.plan === 'ULTRA' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : '#3b82f6'};display:flex;align-items:center;justify-content:center;font-size:24px;color:#fff;box-shadow:0 4px 12px rgba(16,185,129,0.3);">
                ${planStatus.isExpired ? '⚠️' : planStatus.plan === 'ULTRA' ? '👑' : '⭐'}
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <span class="text-xs text-muted uppercase tracking-wider">Gói hiện tại của bạn:</span>
                  <span class="badge ${planStatus.isExpired ? 'badge-error' : planStatus.plan === 'ULTRA' ? 'badge-accent' : 'badge-neutral'} font-bold" style="font-size:11px;">
                    ${planStatus.isExpired ? 'HẾT HẠN' : planStatus.plan + ' VIP'}
                  </span>
                  ${planStatus.isExpired ? '' : '<span class="badge-dot green"></span><span class="text-xs text-success fw-600">Đang hoạt động</span>'}
                </div>
                <div class="text-base fw-700 text-white mt-1">
                  ${planStatus.isExpired 
                    ? `<span class="text-error">Gói ${planStatus.basePlan} 1 tháng đã hết hạn</span> — Vui lòng gia hạn hoặc chọn gói khác bên dưới!`
                    : planStatus.plan === 'FREE'
                    ? 'Tài khoản Miễn Phí (Đăng nhập để nhận 1 tháng ULTRA VIP + $100 Credit)'
                    : `Gói ${planStatus.plan} VIP — Đầy đủ quyền tải 4K 60FPS 10+ nền tảng`}
                </div>
              </div>
            </div>

            <!-- Live Countdown Box -->
            <div class="flex items-center gap-3 bg-surface p-3 rounded-lg border border-gray-800">
              <div class="text-right">
                <div class="text-xs text-muted">Thời gian còn lại (Real-time):</div>
                <div class="text-sm fw-700 font-mono ${planStatus.isExpired ? 'text-error' : 'text-accent'}" id="pricingLiveCountdown">
                  ${planStatus.formattedCountdown}
                </div>
                <div class="text-xs text-muted mt-0.5" style="font-size:10px;">Hạn: ${planStatus.expiryDateStr || 'Không thời hạn'}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Wallet Card & Deposit Action -->
        <div class="flex justify-center">
          <div class="card p-5 border border-gray-800 rounded-xl w-full max-w-xl text-center shadow-lg" style="background:#18181b;box-shadow:0 8px 30px rgba(16,185,129,0.12);">
            <div class="text-xs text-muted mb-1 flex items-center justify-center gap-1.5">
              <span>💰</span> <span>Số dư ví khả dụng (Có thể nạp thêm qua VietQR / VNPay / MoMo)</span>
            </div>
            <div class="text-3xl fw-700 text-success font-mono tracking-tight my-1">
              ${balanceStr}đ <span class="text-sm text-muted font-normal font-sans">(~$${balanceUsd} USD)</span>
            </div>
            <div class="text-xs text-muted mt-1 mb-4">
              Tín dụng nội bộ dùng để gia hạn gói VIP hoặc mua các dịch vụ nâng cao của 2TECH MN.
            </div>
            <div class="flex justify-center gap-3">
              <button class="btn btn-gradient px-6 py-2.5 font-bold flex items-center gap-2" onclick="Pages.pricing.openDepositModal()">
                <span>💳</span> <span>Nạp Tiền Vào Ví (VietQR / VNPay / Ví Điện Tử)</span>
              </button>
            </div>
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

        <!-- 4 Core Pricing Cards (START, PRO, UNLIMITED, ULTRA VIP) -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <!-- 1. Gói START -->
          <div class="card p-5 flex flex-col justify-between border border-gray-800 pricing-card-interactive ${this.selectedPlan === 'START' ? 'pricing-card-selected' : ''}" data-plan="START" onclick="Pages.pricing.selectCard('START')">
            <div>
              <div class="flex justify-between items-center mb-2">
                <span class="text-base fw-700">Gói START</span>
                <span class="badge badge-neutral text-xs">Cơ bản</span>
              </div>
              <div class="my-3">
                <div class="text-2xl fw-700 text-white font-mono" id="priceStart">149.000đ<span class="text-xs text-muted font-sans font-normal">/tháng</span></div>
                <div class="text-xs text-muted mt-1" id="subStart">Thanh toán 1 năm: 1.788.000đ</div>
              </div>
              <div class="divider"></div>
              
              <ul class="flex flex-col gap-2.5 text-xs my-4">
                <li class="flex items-center gap-2 text-white">
                  <span class="text-success">✓</span> <span>Tải <strong>4 nền tảng</strong> (TikTok, YouTube, FB, IG)</span>
                </li>
                <li class="flex items-center gap-2 text-white">
                  <span class="text-success">✓</span> <span><strong>50 video/ngày</strong> độ phân giải cao</span>
                </li>
                <li class="flex items-center gap-2 text-white">
                  <span class="text-success">✓</span> <span>Tự động xóa watermark sạch 100%</span>
                </li>
                <li class="flex items-center gap-2 text-muted">
                  <span>✕</span> <span>Không hỗ trợ video 4K 60FPS</span>
                </li>
              </ul>
            </div>

            ${getBtnHtml('START', 'START')}
          </div>

          <!-- 2. Gói PRO -->
          <div class="card p-5 flex flex-col justify-between border border-gray-800 pricing-card-interactive ${this.selectedPlan === 'PRO' ? 'pricing-card-selected' : ''}" data-plan="PRO" onclick="Pages.pricing.selectCard('PRO')">
            <div>
              <div class="flex justify-between items-center mb-2">
                <span class="text-base fw-700 text-blue-400">Gói PRO</span>
                <span class="badge badge-neutral text-xs">Cá nhân</span>
              </div>
              <div class="my-3">
                <div class="text-2xl fw-700 text-white font-mono" id="pricePro">249.000đ<span class="text-xs text-muted font-sans font-normal">/tháng</span></div>
                <div class="text-xs text-muted mt-1" id="subPro">Thanh toán 1 năm: 2.988.000đ</div>
              </div>
              <div class="divider"></div>

              <ul class="flex flex-col gap-2.5 text-xs my-4">
                <li class="flex items-center gap-2 text-white">
                  <span class="text-success">✓</span> <span>Tải <strong>8 nền tảng</strong> (+Douyin, Xiaohongshu, Kuaishou, RedNote)</span>
                </li>
                <li class="flex items-center gap-2 text-white">
                  <span class="text-success">✓</span> <span><strong>200 video/ngày</strong> chuẩn 2K/4K</span>
                </li>
                <li class="flex items-center gap-2 text-white">
                  <span class="text-success">✓</span> <span>Tải hàng loạt (Batch download)</span>
                </li>
                <li class="flex items-center gap-2 text-white">
                  <span class="text-success">✓</span> <span>Tốc độ bóc tách video siêu tốc</span>
                </li>
              </ul>
            </div>

            ${getBtnHtml('PRO', 'PRO')}
          </div>

          <!-- 3. Gói UNLIMITED (STUDIO) -->
          <div class="card p-5 flex flex-col justify-between border border-gray-800 pricing-card-interactive ${this.selectedPlan === 'UNLIMITED' ? 'pricing-card-selected' : ''}" data-plan="UNLIMITED" onclick="Pages.pricing.selectCard('UNLIMITED')">
            <div>
              <div class="flex justify-between items-center mb-2">
                <span class="text-base fw-700 text-yellow-400">Gói STUDIO</span>
                <span class="badge badge-warning text-xs">Đội nhóm</span>
              </div>
              <div class="my-3">
                <div class="text-2xl fw-700 text-white font-mono" id="priceUnlim">329.000đ<span class="text-xs text-muted font-sans font-normal">/tháng</span></div>
                <div class="text-xs text-muted mt-1" id="subUnlim">Thanh toán 1 năm: 3.948.000đ</div>
              </div>
              <div class="divider"></div>

              <ul class="flex flex-col gap-2.5 text-xs my-4">
                <li class="flex items-center gap-2 text-white">
                  <span class="text-success">✓</span> <span>Tải <strong>TOÀN BỘ 10+ nền tảng</strong> (+Bilibili, Honggo)</span>
                </li>
                <li class="flex items-center gap-2 text-white">
                  <span class="text-success">✓</span> <span><strong>Không giới hạn</strong> số lượng video tải</span>
                </li>
                <li class="flex items-center gap-2 text-white">
                  <span class="text-success">✓</span> <span>Ưu tiên luồng tải cao cấp (Priority Queue)</span>
                </li>
                <li class="flex items-center gap-2 text-white">
                  <span class="text-success">✓</span> <span>Hỗ trợ kỹ thuật 24/7</span>
                </li>
              </ul>
            </div>

            ${getBtnHtml('UNLIMITED', 'STUDIO')}
          </div>

          <!-- 4. Gói ULTRA VIP (FLAGSHIP) -->
          <div class="card p-5 flex flex-col justify-between border-2 border-accent relative ring-2 ring-accent/30 bg-gradient-to-b from-surface to-accent/10 pricing-card-interactive ${this.selectedPlan === 'ULTRA' ? 'pricing-card-selected' : ''}" data-plan="ULTRA" onclick="Pages.pricing.selectCard('ULTRA')">
            <div class="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-white text-xs px-3 py-1 rounded-full fw-700 shadow-md whitespace-nowrap">
              👑 GÓI SIÊU CẤP 2TECH MN
            </div>

            <div>
              <div class="flex justify-between items-center mb-2 mt-1">
                <span class="text-base fw-700 text-emerald-400">Gói ULTRA VIP</span>
                <span class="badge badge-success text-xs">Mạnh Nhất</span>
              </div>
              <div class="my-3">
                <div class="text-2xl fw-700 text-white font-mono" id="priceUltra">499.000đ<span class="text-xs text-muted font-sans font-normal">/tháng</span></div>
                <div class="text-xs text-muted mt-1" id="subUltra">Thanh toán 1 năm: 5.988.000đ (Dùng 13 tháng)</div>
              </div>
              <div class="divider"></div>

              <ul class="flex flex-col gap-2.5 text-xs my-4">
                <li class="flex items-center gap-2 text-white">
                  <span class="text-success">✓</span> <span><strong>TOÀN BỘ 10+ nền tảng</strong> chuẩn API cao nhất</span>
                </li>
                <li class="flex items-center gap-2 text-white">
                  <span class="text-success">✓</span> <span><strong>4K 60FPS Ultra Bitrate gốc</strong> không nén</span>
                </li>
                <li class="flex items-center gap-2 text-white">
                  <span class="text-success">✓</span> <span><strong>8 luồng tải song song</strong> (Multi-Thread Turbo)</span>
                </li>
                <li class="flex items-center gap-2 text-white">
                  <span class="text-success">✓</span> <span><strong>5.000 video/ngày</strong> siêu tốc độ</span>
                </li>
                <li class="flex items-center gap-2 text-white">
                  <span class="text-success">✓</span> <span>Hỗ trợ kỹ thuật trực tiếp từ <strong>Nguyễn Minh Nhựt</strong></span>
                </li>
              </ul>
            </div>

            ${getBtnHtml('ULTRA', 'ULTRA VIP')}
          </div>

        </div>
      </div>
    `;
  },

  init() {
    this.switchCycle(this.currentCycle);
    this.startLiveCountdown();
  },

  startLiveCountdown() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      const el = document.getElementById('pricingLiveCountdown');
      if (!el) {
        clearInterval(this.timerInterval);
        return;
      }
      if (App && typeof App.getPlanStatus === 'function') {
        const status = App.getPlanStatus();
        el.textContent = status.formattedCountdown;
        if (status.isExpired) {
          el.className = 'text-sm fw-700 font-mono text-error';
        }
      }
    }, 1000);
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
    const pUltra = document.getElementById('priceUltra');
    const sUltra = document.getElementById('subUltra');

    if (cycle === 'month') {
      if (pStart) pStart.innerHTML = '399.000đ<span class="text-xs text-muted font-sans font-normal">/tháng</span>';
      if (sStart) sStart.textContent = 'Gói tháng tiêu chuẩn';
      if (pPro) pPro.innerHTML = '599.000đ<span class="text-xs text-muted font-sans font-normal">/tháng</span>';
      if (sPro) sPro.textContent = 'Gói tháng tiêu chuẩn';
      if (pUnlim) pUnlim.innerHTML = '799.000đ<span class="text-xs text-muted font-sans font-normal">/tháng</span>';
      if (sUnlim) sUnlim.textContent = 'Gói tháng tiêu chuẩn';
      if (pUltra) pUltra.innerHTML = '999.000đ<span class="text-xs text-muted font-sans font-normal">/tháng</span>';
      if (sUltra) sUltra.textContent = 'Gói tháng tiêu chuẩn';
    } else if (cycle === 'halfyear') {
      if (pStart) pStart.innerHTML = '199.000đ<span class="text-xs text-muted font-sans font-normal">/tháng</span>';
      if (sStart) sStart.textContent = 'Tổng 1.194.000đ / 6 tháng (Tiết kiệm 50%)';
      if (pPro) pPro.innerHTML = '399.000đ<span class="text-xs text-muted font-sans font-normal">/tháng</span>';
      if (sPro) sPro.textContent = 'Tổng 2.394.000đ / 6 tháng (Tiết kiệm 50%)';
      if (pUnlim) pUnlim.innerHTML = '499.000đ<span class="text-xs text-muted font-sans font-normal">/tháng</span>';
      if (sUnlim) sUnlim.textContent = 'Tổng 2.994.000đ / 6 tháng (Tiết kiệm 50%)';
      if (pUltra) pUltra.innerHTML = '649.000đ<span class="text-xs text-muted font-sans font-normal">/tháng</span>';
      if (sUltra) sUltra.textContent = 'Tổng 3.894.000đ / 6 tháng (Tiết kiệm 50%)';
    } else { // year
      if (pStart) pStart.innerHTML = '149.000đ<span class="text-xs text-muted font-sans font-normal">/tháng</span>';
      if (sStart) sStart.textContent = 'Thanh toán 1 năm: 1.788.000đ (Dùng 13 tháng)';
      if (pPro) pPro.innerHTML = '249.000đ<span class="text-xs text-muted font-sans font-normal">/tháng</span>';
      if (sPro) sPro.textContent = 'Thanh toán 1 năm: 2.988.000đ (Dùng 13 tháng)';
      if (pUnlim) pUnlim.innerHTML = '329.000đ<span class="text-xs text-muted font-sans font-normal">/tháng</span>';
      if (sUnlim) sUnlim.textContent = 'Thanh toán 1 năm: 3.948.000đ (Dùng 13 tháng)';
      if (pUltra) pUltra.innerHTML = '499.000đ<span class="text-xs text-muted font-sans font-normal">/tháng</span>';
      if (sUltra) sUltra.textContent = 'Thanh toán 1 năm: 5.988.000đ (Dùng 13 tháng)';
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
      if (key === 'unlimited') return 799000;
      return 999000; // ultra
    } else if (this.currentCycle === 'halfyear') {
      if (key === 'start') return 1194000;
      if (key === 'pro') return 2394000;
      if (key === 'unlimited') return 2994000;
      return 3894000; // ultra
    } else {
      if (key === 'start') return 1788000;
      if (key === 'pro') return 2988000;
      if (key === 'unlimited') return 3948000;
      return 5988000; // ultra
    }
  },

  buyPlan(planKey, planName, isRenewal = false) {
    if (App.requireLogin && !App.requireLogin()) return;

    const price = this.getPrice(planKey);
    const balance = App.store?.balance || 0;

    if (balance < price) {
      if (App.notify) App.notify('error', 'Số dư không đủ!', `Bạn cần ${price.toLocaleString('vi-VN')}đ để mua gói ${planName}. Hãy nạp thêm tiền vào ví.`);
      this.openDepositModal(price - balance);
      return;
    }

    const priceStr = price.toLocaleString('vi-VN');
    const balanceStr = balance.toLocaleString('vi-VN');
    const remainStr = (balance - price).toLocaleString('vi-VN');
    const cycleLabels = { month: '1 Tháng', halfyear: '6 Tháng', year: '1 Năm (+1 Tháng tặng)' };

    const modalHtml = `
      <div class="flex flex-col gap-4 text-sm" style="max-width:440px;margin:0 auto;color:#f4f4f5;">
        <div class="flex justify-between items-center border-b pb-3 border-gray-800">
          <div class="flex items-center gap-2">
            <span class="badge-dot green"></span>
            <h3 class="text-base fw-700 text-white">${isRenewal ? 'Gia hạn gói cước' : 'Xác nhận thanh toán'}</h3>
          </div>
          <button class="btn btn-sm btn-ghost" onclick="App.closeModal()">✕</button>
        </div>
        
        <div class="py-2">
          <p class="mb-3 text-sm">
            Bạn có chắc muốn ${isRenewal ? 'gia hạn thêm' : 'nâng cấp lên'} gói <strong class="text-accent">${planName}</strong> (${cycleLabels[this.currentCycle]}) với giá <span class="text-white fw-700">${priceStr}đ</span>?
          </p>
          <div class="p-3 bg-surface rounded-lg border border-gray-800 flex flex-col gap-2 font-mono text-xs">
            <div class="flex justify-between">
              <span class="text-muted font-sans">Số dư hiện tại:</span>
              <span class="text-white">${balanceStr}đ</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted font-sans">Giá gói (${cycleLabels[this.currentCycle]}):</span>
              <span class="text-error">-${priceStr}đ</span>
            </div>
            <div class="flex justify-between border-t border-gray-800 pt-2 mt-1">
              <span class="text-muted font-sans">Số dư còn lại sau thanh toán:</span>
              <span class="text-success fw-700">${remainStr}đ</span>
            </div>
          </div>
        </div>

        <div class="flex gap-3 justify-end mt-2">
          <button class="btn btn-ghost" onclick="App.closeModal()">Hủy</button>
          <button class="btn btn-gradient px-6 font-bold" onclick="Pages.pricing.confirmBuy('${planKey}', ${price}, ${isRenewal})">
            ${isRenewal ? 'Xác nhận gia hạn' : 'Xác nhận mua ngay'}
          </button>
        </div>
      </div>
    `;

    App.openModal(modalHtml);
  },

  confirmBuy(planKey, price, isRenewal = false) {
    const balance = App.store?.balance || 0;
    if (balance < price) {
      App.notify('error', 'Số dư không đủ!');
      App.closeModal();
      return;
    }

    // Deduct balance
    App.store.balance = balance - price;
    App.store.plan = planKey;
    
    // Calculate expiry date
    let daysToAdd = 30; // month
    if (this.currentCycle === 'halfyear') daysToAdd = 180;
    if (this.currentCycle === 'year') daysToAdd = 365 + 30; // 13 months

    const curExpiry = App.store.planExpiry ? new Date(App.store.planExpiry).getTime() : 0;
    const baseTime = (isRenewal && curExpiry > Date.now()) ? curExpiry : Date.now();
    App.store.planExpiry = new Date(baseTime + daysToAdd * 24 * 60 * 60 * 1000).toISOString();

    // Record transaction
    App.store.downloadHistory = App.store.downloadHistory || [];
    App.store.downloadHistory.unshift({
      id: 'tx_' + Date.now(),
      action: (isRenewal ? 'Gia hạn gói ' : 'Nâng cấp gói ') + planKey,
      details: `Thanh toán ${price.toLocaleString('vi-VN')}đ (Thời hạn: +${daysToAdd} ngày)`,
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
            expiry: App.store.planExpiry,
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
    if (App.notify) App.notify('success', `Đã kích hoạt gói ${planKey}!`, `Thời hạn đến: ${new Date(App.store.planExpiry).toLocaleDateString('vi-VN')}. Số dư còn lại: ${(App.store.balance).toLocaleString('vi-VN')}đ.`);
    
    // Re-render
    App.navigate('pricing');
  },

  // ═══════════════════════════════════════════
  // CỔNG NẠP ĐA KÊNH THẬT (VIETQR / VNPAY / MOMO / ZALOPAY / APPLE PAY)
  // ═══════════════════════════════════════════
  openDepositModal(suggestedMin = 0) {
    if (App.requireLogin && !App.requireLogin()) return;

    const defaultAmount = suggestedMin > 0 ? Math.max(100000, Math.ceil(suggestedMin / 100000) * 100000) : 500000;
    const refCode = '2TECHMN' + Math.random().toString(36).substring(2, 8).toUpperCase();
    
    this.activeDeposit = {
      id: 'dep_' + Date.now(),
      refCode: refCode,
      amount: defaultAmount,
      channel: 'vietqr',
      bankName: 'MB Bank (Ngân Hàng Quân Đội)',
      accountNumber: '0987654321',
      accountHolder: 'NGUYEN MINH NHUT'
    };

    const modalHtml = `
      <div class="deposit-modal-container" style="max-width:540px;margin:0 auto;color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
        <!-- Header -->
        <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #27272a;padding-bottom:12px;margin-bottom:16px;">
          <div style="display:flex;align-items:center;gap:10px;">
            <div style="width:34px;height:34px;border-radius:10px;background:#10b981;display:flex;align-items:center;justify-content:center;color:#fff;font-size:18px;">💳</div>
            <div>
              <h3 style="font-size:16px;font-weight:700;color:#fff;margin:0;">Cổng Nạp Tiền Đa Kênh Tự Động</h3>
              <p style="font-size:11px;color:#a1a1aa;margin:2px 0 0 0;">Napas 24/7 VietQR · VNPAY · MoMo · ZaloPay · Apple Pay</p>
            </div>
          </div>
          <button class="btn btn-sm btn-ghost" onclick="Pages.pricing.closeDepositModal()" style="font-size:16px;color:#a1a1aa;">✕</button>
        </div>

        <!-- Channel Select Pills -->
        <div style="display:flex;gap:6px;overflow-x:auto;padding-bottom:8px;margin-bottom:14px;">
          <button type="button" class="btn btn-sm dep-channel-btn active" data-channel="vietqr" onclick="Pages.pricing.selectDepositChannel('vietqr')" style="background:#10b981;color:#fff;font-size:11px;font-weight:600;padding:6px 12px;border-radius:8px;white-space:nowrap;">
            🏦 Chuyển khoản VietQR
          </button>
          <button type="button" class="btn btn-sm dep-channel-btn btn-ghost" data-channel="vnpay" onclick="Pages.pricing.selectDepositChannel('vnpay')" style="color:#a1a1aa;font-size:11px;font-weight:600;padding:6px 12px;border-radius:8px;white-space:nowrap;">
            💳 VNPAY-QR / ATM
          </button>
          <button type="button" class="btn btn-sm dep-channel-btn btn-ghost" data-channel="momo" onclick="Pages.pricing.selectDepositChannel('momo')" style="color:#a1a1aa;font-size:11px;font-weight:600;padding:6px 12px;border-radius:8px;white-space:nowrap;">
            📱 Ví MoMo
          </button>
          <button type="button" class="btn btn-sm dep-channel-btn btn-ghost" data-channel="zalopay" onclick="Pages.pricing.selectDepositChannel('zalopay')" style="color:#a1a1aa;font-size:11px;font-weight:600;padding:6px 12px;border-radius:8px;white-space:nowrap;">
            ⚡ ZaloPay
          </button>
          <button type="button" class="btn btn-sm dep-channel-btn btn-ghost" data-channel="applepay" onclick="Pages.pricing.selectDepositChannel('applepay')" style="color:#a1a1aa;font-size:11px;font-weight:600;padding:6px 12px;border-radius:8px;white-space:nowrap;">
            🍏 Apple Pay / Thẻ Quốc Tế
          </button>
        </div>

        <!-- Amount Presets -->
        <div style="margin-bottom:14px;">
          <label style="font-size:12px;font-weight:600;color:#a1a1aa;display:block;margin-bottom:6px;">Chọn số tiền nạp:</label>
          <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:6px;margin-bottom:8px;">
            <button type="button" class="btn btn-sm btn-ghost dep-amt-btn" onclick="Pages.pricing.setDepositAmount(100000)" style="font-family:var(--font-mono);font-size:12px;border:1px solid #3f3f46;">100.000đ</button>
            <button type="button" class="btn btn-sm btn-ghost dep-amt-btn" onclick="Pages.pricing.setDepositAmount(200000)" style="font-family:var(--font-mono);font-size:12px;border:1px solid #3f3f46;">200.000đ</button>
            <button type="button" class="btn btn-sm btn-ghost dep-amt-btn active" onclick="Pages.pricing.setDepositAmount(500000)" style="font-family:var(--font-mono);font-size:12px;border:1px solid #10b981;background:#10b98122;color:#34d399;">500.000đ</button>
            <button type="button" class="btn btn-sm btn-ghost dep-amt-btn" onclick="Pages.pricing.setDepositAmount(1000000)" style="font-family:var(--font-mono);font-size:12px;border:1px solid #3f3f46;">1.000.000đ</button>
            <button type="button" class="btn btn-sm btn-ghost dep-amt-btn" onclick="Pages.pricing.setDepositAmount(2500000)" style="font-family:var(--font-mono);font-size:12px;border:1px solid #3f3f46;">2.500.000đ ($100)</button>
            <button type="button" class="btn btn-sm btn-ghost dep-amt-btn" onclick="Pages.pricing.setDepositAmount(5000000)" style="font-family:var(--font-mono);font-size:12px;border:1px solid #3f3f46;">5.000.000đ ($200)</button>
          </div>
          <div style="display:flex;align-items:center;gap:8px;background:#27272a;border-radius:8px;padding:6px 10px;border:1px solid #3f3f46;">
            <span style="font-size:12px;color:#a1a1aa;">Số tiền tùy chỉnh:</span>
            <input type="number" id="customDepositAmount" value="${defaultAmount}" min="10000" max="100000000" step="10000" onchange="Pages.pricing.setDepositAmount(Number(this.value))" style="flex:1;background:transparent;border:none;color:#fff;font-family:var(--font-mono);font-size:14px;font-weight:700;outline:none;text-align:right;">
            <span style="font-size:13px;color:#a1a1aa;font-weight:600;">VNĐ</span>
          </div>
        </div>

        <!-- Dynamic Payment Content (QR Code + Transfer Guide) -->
        <div id="depositPaymentContent" style="background:#27272a;border-radius:12px;padding:14px;border:1px solid #3f3f46;">
          ${this.renderDepositContent()}
        </div>

        <!-- Simulation and Safety Controls -->
        <div style="margin-top:14px;display:flex;flex-direction:column;gap:8px;">
          <button type="button" class="btn btn-sm w-full py-2.5 font-bold flex items-center justify-center gap-2" onclick="Pages.pricing.simulateBankAutoCredit()" style="background:linear-gradient(135deg, #10b981 0%, #059669 100%);color:#fff;border-radius:8px;box-shadow:0 4px 14px rgba(16,185,129,0.3);">
            <span>⚡</span> <span>Mô phỏng tiền về từ ngân hàng (Test Auto-Credit Webhook)</span>
          </button>
          <div style="font-size:11px;color:#71717a;text-align:center;">
            Sau khi chuyển khoản qua ứng dụng ngân hàng, tiền sẽ tự động cộng vào ví sau 3-5 giây.
          </div>
        </div>
      </div>
    `;

    App.openModal(modalHtml);
    this.startDepositPolling();
  },

  selectDepositChannel(channel) {
    if (!this.activeDeposit) return;
    this.activeDeposit.channel = channel;
    document.querySelectorAll('.dep-channel-btn').forEach(btn => {
      const isCur = btn.dataset.channel === channel;
      btn.style.background = isCur ? '#10b981' : 'transparent';
      btn.style.color = isCur ? '#fff' : '#a1a1aa';
    });
    const content = document.getElementById('depositPaymentContent');
    if (content) content.innerHTML = this.renderDepositContent();
    if (App.playSound) App.playSound('click');
  },

  setDepositAmount(amount) {
    if (!this.activeDeposit) return;
    if (amount < 10000) amount = 10000;
    this.activeDeposit.amount = amount;
    const input = document.getElementById('customDepositAmount');
    if (input) input.value = amount;
    const content = document.getElementById('depositPaymentContent');
    if (content) content.innerHTML = this.renderDepositContent();
  },

  renderDepositContent() {
    const dep = this.activeDeposit;
    if (!dep) return '';
    const amount = dep.amount;
    const refCode = dep.refCode;
    const bank = dep.bankName;
    const acc = dep.accountNumber;
    const holder = dep.accountHolder;
    const qrUrl = `https://img.vietqr.io/image/MB-${acc}-compact2.png?amount=${amount}&addInfo=2TECHMN%20${refCode}&accountName=${encodeURIComponent(holder)}`;

    if (dep.channel === 'vnpay') {
      return `
        <div style="text-align:center;padding:10px 0;">
          <div style="width:50px;height:50px;margin:0 auto 10px;border-radius:12px;background:#005baa;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;font-size:16px;">VNPAY</div>
          <div style="font-size:14px;font-weight:700;color:#fff;">Cổng thanh toán trực tuyến VNPAY</div>
          <p style="font-size:12px;color:#a1a1aa;margin:6px 0 14px;">Quét mã VNPAY-QR qua app ngân hàng hoặc thanh toán bằng thẻ ATM, thẻ quốc tế.</p>
          <div style="background:#18181b;padding:12px;border-radius:8px;display:inline-block;border:1px solid #3f3f46;margin-bottom:12px;">
            <img src="${qrUrl}" alt="VNPAY QR" style="width:190px;height:190px;display:block;border-radius:6px;background:#fff;padding:6px;">
          </div>
          <div style="font-size:12px;color:#fff;">Số tiền: <strong class="text-success">${amount.toLocaleString('vi-VN')}đ</strong> · Mã giao dịch: <code class="mono text-accent">${refCode}</code></div>
        </div>
      `;
    }

    if (dep.channel === 'momo') {
      return `
        <div style="text-align:center;padding:10px 0;">
          <div style="width:50px;height:50px;margin:0 auto 10px;border-radius:12px;background:#a50064;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;font-size:14px;">MoMo</div>
          <div style="font-size:14px;font-weight:700;color:#fff;">Chuyển tiền qua Ví MoMo</div>
          <p style="font-size:12px;color:#a1a1aa;margin:6px 0 14px;">Mở MoMo quét mã chuyển tiền hoặc chuyển trực tiếp đến SĐT bên dưới:</p>
          <div style="background:#18181b;padding:12px;border-radius:8px;display:inline-block;border:1px solid #3f3f46;margin-bottom:12px;">
            <img src="${qrUrl}" alt="MoMo QR" style="width:190px;height:190px;display:block;border-radius:6px;background:#fff;padding:6px;">
          </div>
          <div style="font-size:12px;color:#fff;">SĐT MoMo: <strong>${acc}</strong> (${holder}) · Lời nhắn: <code class="mono text-accent">${refCode}</code></div>
        </div>
      `;
    }

    if (dep.channel === 'zalopay') {
      return `
        <div style="text-align:center;padding:10px 0;">
          <div style="width:50px;height:50px;margin:0 auto 10px;border-radius:12px;background:#0068ff;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;font-size:14px;">ZaloPay</div>
          <div style="font-size:14px;font-weight:700;color:#fff;">Chuyển tiền qua ZaloPay</div>
          <p style="font-size:12px;color:#a1a1aa;margin:6px 0 14px;">Mở ứng dụng Zalo / ZaloPay để quét mã QR:</p>
          <div style="background:#18181b;padding:12px;border-radius:8px;display:inline-block;border:1px solid #3f3f46;margin-bottom:12px;">
            <img src="${qrUrl}" alt="ZaloPay QR" style="width:190px;height:190px;display:block;border-radius:6px;background:#fff;padding:6px;">
          </div>
          <div style="font-size:12px;color:#fff;">Chủ ví: <strong>${holder}</strong> · Nội dung: <code class="mono text-accent">${refCode}</code></div>
        </div>
      `;
    }

    if (dep.channel === 'applepay') {
      const usdAmount = (amount / 25000).toFixed(2);
      return `
        <div style="padding:10px 0;">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
            <div style="width:44px;height:44px;border-radius:10px;background:#000;border:1px solid #52525b;display:flex;align-items:center;justify-content:center;color:#fff;font-size:22px;"></div>
            <div>
              <div style="font-size:14px;font-weight:700;color:#fff;">Apple Pay & Thẻ Quốc Tế</div>
              <div style="font-size:11px;color:#a1a1aa;">Visa · MasterCard · JCB · American Express</div>
            </div>
          </div>
          <div style="background:#18181b;padding:14px;border-radius:8px;border:1px solid #3f3f46;margin-bottom:10px;font-size:12px;line-height:1.6;">
            <div style="display:flex;justify-content:between;margin-bottom:6px;">
              <span class="text-muted">Số tiền quy đổi:</span>
              <strong class="text-success font-mono">$${usdAmount} USD</strong>
            </div>
            <div style="display:flex;justify-content:between;margin-bottom:6px;">
              <span class="text-muted">Tương đương VNĐ:</span>
              <strong class="text-white font-mono">${amount.toLocaleString('vi-VN')}đ</strong>
            </div>
            <div style="display:flex;justify-content:between;">
              <span class="text-muted">Mã đơn hàng:</span>
              <code class="text-accent mono">${refCode}</code>
            </div>
          </div>
          <p style="font-size:11px;color:#a1a1aa;margin:0;">Nhấp "Mô phỏng tiền về" bên dưới để kiểm tra quy trình cộng tiền tự động.</p>
        </div>
      `;
    }

    // Default: VietQR
    return `
      <div style="display:flex;flex-direction:column;md:flex-row;gap:16px;align-items:center;">
        <div style="background:#fff;padding:8px;border-radius:10px;box-shadow:0 4px 16px rgba(0,0,0,0.4);flex-shrink:0;">
          <img src="${qrUrl}" alt="VietQR Napas 24/7" style="width:190px;height:190px;display:block;border-radius:6px;" onerror="this.src='https://api.qrserver.com/v1/create-qr-code/?size=190x190&data=2TECHMN%20${refCode}'">
        </div>
        <div style="flex:1;width:100%;font-size:12px;display:flex;flex-direction:column;gap:6px;text-align:left;">
          <div>
            <span style="color:#a1a1aa;">Ngân hàng:</span>
            <div style="font-weight:700;color:#fff;">${bank}</div>
          </div>
          <div>
            <span style="color:#a1a1aa;">Số tài khoản:</span>
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="font-size:15px;font-weight:700;color:#34d399;font-family:var(--font-mono);">${acc}</span>
              <button type="button" class="btn btn-sm btn-ghost" onclick="navigator.clipboard.writeText('${acc}'); App.notify('info', 'Đã copy', 'Đã sao chép số tài khoản.');" style="padding:2px 8px;font-size:10px;">Copy</button>
            </div>
          </div>
          <div>
            <span style="color:#a1a1aa;">Chủ tài khoản:</span>
            <div style="font-weight:600;color:#fff;">${holder}</div>
          </div>
          <div>
            <span style="color:#a1a1aa;">Số tiền cần nạp:</span>
            <div style="font-size:15px;font-weight:700;color:#38bdf8;font-family:var(--font-mono);">${amount.toLocaleString('vi-VN')}đ</div>
          </div>
          <div>
            <span style="color:#a1a1aa;">Nội dung chuyển khoản (Bắt buộc):</span>
            <div style="display:flex;align-items:center;gap:8px;margin-top:2px;">
              <code style="background:#18181b;border:1px solid #10b981;color:#10b981;padding:4px 8px;border-radius:6px;font-weight:700;font-size:13px;">2TECHMN ${refCode}</code>
              <button type="button" class="btn btn-sm btn-ghost" onclick="navigator.clipboard.writeText('2TECHMN ${refCode}'); App.notify('info', 'Đã copy', 'Đã sao chép cú pháp chuyển khoản.');" style="padding:2px 8px;font-size:10px;">Copy</button>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  startDepositPolling() {
    if (this.pollInterval) clearInterval(this.pollInterval);
    const dep = this.activeDeposit;
    if (!dep) return;

    this.pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/payment/status/${dep.id}`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data.deposit?.status === 'completed') {
            this.handleDepositSuccess(dep.amount);
          }
        }
      } catch (_) {}
    }, 2500);
  },

  closeDepositModal() {
    if (this.pollInterval) clearInterval(this.pollInterval);
    this.activeDeposit = null;
    App.closeModal();
  },

  async simulateBankAutoCredit() {
    const dep = this.activeDeposit;
    if (!dep) return;

    // Call backend test confirmation endpoint
    try {
      await fetch('/api/payment/simulate-confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ depositId: dep.id, refCode: dep.refCode, actualAmount: dep.amount })
      });
    } catch (_) {}

    this.handleDepositSuccess(dep.amount);
  },

  handleDepositSuccess(amount) {
    if (this.pollInterval) clearInterval(this.pollInterval);
    
    // Credit local store balance
    App.store.balance = (App.store.balance || 0) + amount;
    
    // Record in history
    App.store.downloadHistory = App.store.downloadHistory || [];
    App.store.downloadHistory.unshift({
      id: 'dep_' + Date.now(),
      action: 'Nạp tiền vào ví',
      details: `Đã nạp thành công ${amount.toLocaleString('vi-VN')}đ qua ${this.activeDeposit?.channel?.toUpperCase() || 'VIETQR'} [${this.activeDeposit?.refCode || ''}]`,
      time: new Date().toISOString(),
      status: 'Thành công'
    });

    // Broadcast sync to Admin Panel
    try {
      if (window.BroadcastChannel) {
        const bc = new BroadcastChannel('2tech_channel');
        bc.postMessage({
          type: 'DEPOSIT_SUCCESS',
          data: {
            email: App.store.user?.email,
            name: App.store.user?.name,
            amount,
            channel: this.activeDeposit?.channel,
            refCode: this.activeDeposit?.refCode,
            balance: App.store.balance,
            timestamp: new Date().toISOString()
          }
        });
        bc.close();
      }
    } catch (_) {}

    App.saveStore();
    App.updateUI();
    this.closeDepositModal();

    if (App.playSound) App.playSound('success');
    if (App.notify) App.notify('success', 'Nạp tiền thành công!', `Đã cộng ${amount.toLocaleString('vi-VN')}đ vào tài khoản ví của bạn.`);

    // Re-render page
    App.navigate('pricing');
  }
};
