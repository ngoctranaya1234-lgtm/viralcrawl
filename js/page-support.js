/* ═══════════════════════════════════════════════════════════════
   ViralCrawl — Page: Gửi câu hỏi & Hỗ trợ kỹ thuật (2TECH MN)
   Official Customer Support (2techmn.com)
   ═══════════════════════════════════════════════════════════════ */

window.Pages = window.Pages || {};
window.Pages['support'] = {
  render() {
    return `
      <div class="flex flex-col gap-6">
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl fw-700">Trung Tâm Hỗ Trợ Kỹ Thuật (2TECH MN)</h1>
            <p class="text-sm text-muted mt-1">Đội ngũ kỹ thuật hỗ trợ 24/7 qua Zalo, Ultraviewer và Ticket hệ thống</p>
          </div>
          <div class="flex items-center gap-2">
            <span class="badge badge-success"><span class="badge-dot green"></span> Kỹ thuật trực tuyến: Phản hồi &lt; 5 phút</span>
          </div>
        </div>

        <!-- 1. Official Contact Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="card p-5 flex items-start gap-4 border border-accent/40 bg-accent/5">
            <div class="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center text-2xl flex-shrink-0">💬</div>
            <div>
              <div class="text-xs text-muted">Zalo Hỗ Trợ 1-1 (Chính thức)</div>
              <div class="text-base fw-700 text-white mt-0.5">0xxx xxx xxx</div>
              <div class="text-xs text-accent mt-1">Hỗ trợ cài đặt, kích hoạt key, Ultraviewer</div>
            </div>
          </div>

          <div class="card p-5 flex items-start gap-4 border border-gray-800">
            <div class="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center text-2xl flex-shrink-0">📞</div>
            <div>
              <div class="text-xs text-muted">Hotline Kỹ Thuật & Khẩn Cấp</div>
              <div class="text-base fw-700 text-white mt-0.5">0xxx xxx xxx</div>
              <div class="text-xs text-muted mt-1">Kỹ thuật máy chủ 2TECH MN</div>
            </div>
          </div>

          <div class="card p-5 flex items-start gap-4 border border-gray-800">
            <div class="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center text-2xl flex-shrink-0">🏢</div>
            <div>
              <div class="text-xs text-muted">Đơn vị chủ quản</div>
              <div class="text-sm fw-700 text-white mt-0.5">2TECH MN (Nguyễn Minh Nhựt)</div>
              <div class="text-xs text-muted mt-1">Bản quyền phần mềm ViralCrawl</div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <!-- 2. FAQ Accordion (7 cols) -->
          <div class="lg:col-span-7 flex flex-col gap-4">
            <h2 class="card-title text-base fw-600 mb-1">Câu Hỏi Thường Gặp (FAQ Chuyên Sâu)</h2>

            <div class="flex flex-col gap-3" id="faqAccordion">
              <!-- FAQ 1 -->
              <div class="card p-4 cursor-pointer hover:border-gray-700 faq-item">
                <div class="flex justify-between items-center">
                  <span class="text-sm fw-600 text-white">1. Làm thế nào để lấy Cookie Douyin / Xiaohongshu không bị hết hạn?</span>
                  <span class="text-muted faq-toggle text-sm">▼</span>
                </div>
                <div class="faq-content text-xs text-muted mt-2 pt-2 border-t border-gray-800 leading-relaxed" style="display:none;">
                  Bạn cài tiện ích <strong>Cookie-Editor</strong> trên trình duyệt Chrome/Edge, đăng nhập tài khoản Douyin/Xiaohongshu rồi nhấn "Export -> Header String". Sau đó dán vào mục kết nối nền tảng trong ViralCrawl. Hệ thống có cơ chế tự động gửi heartbeat để duy trì phiên đăng nhập không bị out.
                </div>
              </div>

              <!-- FAQ 2 -->
              <div class="card p-4 cursor-pointer hover:border-gray-700 faq-item">
                <div class="flex justify-between items-center">
                  <span class="text-sm fw-600 text-white">2. Bật tăng tốc GPU NVIDIA NVENC như thế nào để xuất video siêu tốc?</span>
                  <span class="text-muted faq-toggle text-sm">▼</span>
                </div>
                <div class="faq-content text-xs text-muted mt-2 pt-2 border-t border-gray-800 leading-relaxed" style="display:none;">
                  Vào mục <strong>Cài đặt -> Phần cứng & GPU Encoder</strong>, chọn <strong>NVIDIA NVENC H.264</strong>. Phần mềm sẽ kích hoạt nhân phần cứng của card đồ họa rời (GTX 1060 trở lên, RTX series) để encode video trong vài giây thay vì dùng CPU gây chậm máy.
                </div>
              </div>

              <!-- FAQ 3 -->
              <div class="card p-4 cursor-pointer hover:border-gray-700 faq-item">
                <div class="flex justify-between items-center">
                  <span class="text-sm fw-600 text-white">3. Tính năng AI Vocal Remover giữ lại âm thanh gì trong video?</span>
                  <span class="text-muted faq-toggle text-sm">▼</span>
                </div>
                <div class="faq-content text-xs text-muted mt-2 pt-2 border-t border-gray-800 leading-relaxed" style="display:none;">
                  ViralCrawl sử dụng mô hình trí tuệ nhân tạo nhận diện phổ âm thanh để bóc tách triệt để tiếng nói (vocal lời thoại), trong khi bảo toàn 100% tiếng nhạc nền gốc, tiếng động vật, bước chân, tiếng gió và các hiệu ứng âm thanh môi trường xung quanh.
                </div>
              </div>

              <!-- FAQ 4 -->
              <div class="card p-4 cursor-pointer hover:border-gray-700 faq-item">
                <div class="flex justify-between items-center">
                  <span class="text-sm fw-600 text-white">4. Làm sao để cào hàng loạt toàn bộ kênh video Douyin / TikTok của đối thủ?</span>
                  <span class="text-muted faq-toggle text-sm">▼</span>
                </div>
                <div class="faq-content text-xs text-muted mt-2 pt-2 border-t border-gray-800 leading-relaxed" style="display:none;">
                  Bạn sao chép liên kết trang cá nhân (Profile URL) của kênh cần cào dán vào tính năng <strong>Cào Kênh Nâng Cao</strong>, chọn số lượng video cần quét và nhấn <strong>Bắt đầu</strong>. ViralCrawl của 2TECH MN sẽ tự động bóc tách danh sách video không logo, thống kê lượt xem, thả tim và hỗ trợ tải hàng loạt kèm lách bản quyền tự động.
                </div>
              </div>

              <!-- FAQ 5 -->
              <div class="card p-4 cursor-pointer hover:border-gray-700 faq-item">
                <div class="flex justify-between items-center">
                  <span class="text-sm fw-600 text-white">5. Đổi máy tính khác có dùng tiếp được license không?</span>
                  <span class="text-muted faq-toggle text-sm">▼</span>
                </div>
                <div class="faq-content text-xs text-muted mt-2 pt-2 border-t border-gray-800 leading-relaxed" style="display:none;">
                  Mỗi bản quyền gắn liền với một thiết bị đang hoạt động. Khi đổi máy tính hoặc cài lại hệ điều hành, bạn chỉ cần liên hệ Zalo <strong>0xxx xxx xxx</strong> hoặc gửi email hỗ trợ đến <strong>support@2techmn.com</strong> để được kỹ thuật viên hỗ trợ reset bản quyền nhanh chóng.
                </div>
              </div>
            </div>
          </div>

          <!-- 3. Ticket Form (5 cols) -->
          <div class="lg:col-span-5 card p-5 flex flex-col gap-4">
            <h2 class="card-title text-base fw-600">Gửi Yêu Cầu Hỗ Trợ (Ticket)</h2>

            <div class="form-group flex flex-col gap-1">
              <label class="form-label text-xs fw-500">Chủ đề cần trợ giúp</label>
              <select class="form-select text-xs" id="supportSubject">
                <option value="Lỗi tải video / Link không hỗ trợ">Lỗi tải video / Link không hỗ trợ</option>
                <option value="Hỗ trợ kết nối nền tảng (Cookie/QR)">Hỗ trợ kết nối nền tảng (Cookie/QR)</option>
                <option value="Tư vấn nâng cấp gói ViralCrawl">Tư vấn nâng cấp gói ViralCrawl</option>
                <option value="Yêu cầu hoàn tiền / Đổi gói">Yêu cầu hoàn tiền / Đổi gói</option>
                <option value="Góp ý tính năng mới">Góp ý tính năng mới</option>
                <option value="Báo lỗi phần mềm">Báo lỗi phần mềm</option>
              </select>
            </div>

            <div class="form-group flex flex-col gap-1">
              <label class="form-label text-xs fw-500">Số Zalo hoặc Email của bạn</label>
              <input type="text" class="form-input text-xs" id="supportContact" placeholder="Ví dụ: 0987xxxxxx hoặc email@example.com">
            </div>

            <div class="form-group flex flex-col gap-1">
              <label class="form-label text-xs fw-500">Mô tả chi tiết vấn đề</label>
              <textarea class="form-textarea w-full h-28 text-xs p-3 rounded bg-gray-900 border border-gray-700 font-sans" id="supportMessage" placeholder="Mô tả chi tiết link video bị lỗi hoặc ảnh chụp thông báo lỗi..."></textarea>
            </div>

            <button class="btn btn-gradient w-full py-2.5 font-bold text-xs" id="btnSubmitSupport">
              Gửi Yêu Cầu Hỗ Trợ
            </button>
          </div>
        </div>
      </div>
    `;
  },

  init() {
    // Accordion toggle
    document.querySelectorAll('.faq-item').forEach(item => {
      item.addEventListener('click', () => {
        const content = item.querySelector('.faq-content');
        const toggle = item.querySelector('.faq-toggle');
        if (!content || !toggle) return;
        if (content.style.display === 'none') {
          content.style.display = 'block';
          toggle.textContent = '▲';
        } else {
          content.style.display = 'none';
          toggle.textContent = '▼';
        }
        if (typeof App.playSound === 'function') {
          App.playSound('click');
        }
      });
    });

    // Submit ticket
    document.getElementById('btnSubmitSupport')?.addEventListener('click', () => {
      const subjectEl = document.getElementById('supportSubject');
      const contactEl = document.getElementById('supportContact');
      const messageEl = document.getElementById('supportMessage');

      const subjectVal = subjectEl?.value?.trim() || '';
      const contact = contactEl?.value?.trim() || '';
      const message = messageEl?.value?.trim() || '';

      if (!subjectVal) {
        App.notify('warning', 'Chưa chọn chủ đề', 'Vui lòng chọn chủ đề cần trợ giúp.');
        subjectEl?.focus();
        return;
      }

      if (!contact) {
        App.notify('warning', 'Thiếu thông tin liên hệ', 'Vui lòng nhập số Zalo hoặc Email của bạn.');
        contactEl?.focus();
        return;
      }

      if (!message) {
        App.notify('warning', 'Chưa có nội dung', 'Vui lòng nhập mô tả chi tiết vấn đề cần hỗ trợ.');
        messageEl?.focus();
        return;
      }

      const subject = encodeURIComponent(subjectEl.value);
      const body = encodeURIComponent(`Thông tin liên hệ: ${contact}\n\nNội dung:\n${message}\n\n---\nGửi từ ViralCrawl Tool by 2TECH MN`);
      const gmailUrl = `https://mail.google.com/mail/?view=cm&to=support@2techmn.com&su=${subject}&body=${body}`;

      window.open(gmailUrl, '_blank');

      if (typeof App.playSound === 'function') {
        App.playSound('success');
      }
      App.notify('success', 'Đã mở hộp thư Gmail', 'Cửa sổ soạn thư Gmail đã được mở với đầy đủ nội dung. Vui lòng nhấn Gửi để hoàn tất!');

      messageEl.value = '';
    });
  }
};
