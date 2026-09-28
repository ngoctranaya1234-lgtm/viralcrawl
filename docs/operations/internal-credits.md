# Vận Hành Hệ Thống Tín Dụng Nội Bộ (Internal Credits Operator Guide)

Chủ quản: **NGUYỄN MINH NHỰT** • Đơn vị: **2TECH MN**

Tài liệu hướng dẫn quản trị viên vận hành hệ thống tín dụng nội bộ, cấp/thu hồi mã kích hoạt và đối soát sổ cái (ledger) bất biến trong Mnhut 2tech Al 4K Studio.

---

## 1. Nguyên Tắc Cốt Lõi (Core Principles)
- **Tín dụng ảo nội bộ (Virtual Credit):** Đơn vị tính là `CREDIT`. Đây là điểm sử dụng trong phần mềm, **hoàn toàn không phải tiền thật, không thể rút, không thể chuyển nhượng và không có giá trị quy đổi ngoại tệ hay VNĐ**.
- **Cơ chế một sổ cái duy nhất (Single Immutable Ledger):** Mọi biến động số dư (thưởng đăng ký, nạp mã, mua gói) đều được ghi nhận vào bảng `credit_ledger` với chữ ký và khóa chống ghi trùng (idempotency key).
- **Thưởng chào mừng chính thức:** Người dùng đăng nhập lần đầu tiên qua Google hoặc Apple OAuth chính thức nhận được **2.500.000 credit** và **1 tháng dùng thử gói ULTRA** (tính chính xác theo lịch máy chủ). Các lần đăng nhập sau không cấp lại.
- **Mã kích hoạt nội bộ (Credit Codes):**
  - Giá trị cố định: **4.000.000 credit** / mã.
  - Hiệu lực: **7 ngày** kể từ khi tạo (nếu chưa kích hoạt).
  - Sử dụng: **Duy nhất 1 lần** (single-use). Mã được băm bằng HMAC-SHA256 với secret pepper riêng biệt; cơ sở dữ liệu chỉ lưu chuỗi băm và hint 8 ký tự đầu/cuối để đối soát.
  - Quản trị viên có thể thu hồi mã chưa sử dụng kèm lý do bắt buộc được ghi nhật ký kiểm toán (audit log).

---

## 2. Giao Diện Mô Phỏng & Bảng Giá Dịch Vụ
- **7 Giao diện mô phỏng nội bộ:** Hệ thống cung cấp 7 chủ đề trực quan (`MoMo`, `MB Bank`, `Techcombank`, `Sacombank`, `Thẻ Quốc Tế (Visa/Mastercard)`, `Apple Pay`, `Google Pay`). Mọi bước đều có banner cảnh báo vĩnh viễn: *"GIAO DIỆN MÔ PHỎNG NỘI BỘ • KHÔNG SỬ DỤNG TIỀN THẬT • ĐIỂM TÍN DỤNG ẢO KHÔNG CÓ GIÁ TRỊ QUY ĐỔI"*. Tuyệt đối không thu thập số thẻ, CVV, OTP hay số tài khoản ngân hàng.
- **Danh mục gói dịch vụ:**
  - **Miễn phí (FREE):** 0 credit/tháng — 10 lượt tải/ngày, tối đa 1080p.
  - **Khởi Đầu (START):** 500.000 credit/tháng — 30 lượt tải/ngày, hỗ trợ 2K.
  - **Chuyên Nghiệp (PRO):** 1.500.000 credit/tháng — 100 lượt tải/ngày, 4K 60FPS.
  - **ULTRA VIP (ULTRA):** 4.000.000 credit/tháng — Không giới hạn tải, 4K 60FPS đa luồng, cào kênh toàn diện.

---

## 3. Thao Tác Quản Trị Viên (Admin Operations)
Quản trị viên thao tác trực tiếp tại Admin Panel (`http://localhost:3891`):

### A. Tạo mã kích hoạt 4.000.000 credit
1. Truy cập mục **Quản lý mã tín dụng** (`/admin/credit-codes`).
2. Bấm nút **"Tạo mã mới (+4.000.000 credit)"**.
3. Hệ thống trả về mã dạng `2TMN-XXXX-XXXX-XXXX-XXXX-XXXX` **duy nhất một lần**. Quản trị viên sao chép và gửi cho người dùng. Khi đóng hộp thoại, chuỗi mã thô lập tức bị hủy khỏi bộ nhớ.

### B. Thu hồi mã chưa sử dụng
1. Trong danh sách mã, chọn mã có trạng thái `active`.
2. Bấm **"Thu hồi"**, nhập lý do bắt buộc (tối thiểu 6 ký tự).
3. Hệ thống ghi nhật ký kiểm toán và chuyển trạng thái mã sang `revoked`. Mã bị thu hồi không thể kích hoạt được nữa.

### C. Đối soát sổ cái (Credit Ledger)
1. Truy cập mục **Sổ cái tín dụng** (`/admin/credit-ledger`).
2. Xem danh sách toàn bộ các giao dịch tín dụng kèm `transaction_id`, `user_id`, `amount`, `balance_after`, `reference_type` (`welcome_grant`, `code_redemption`, `plan_purchase`, `admin_adjustment`) và dấu thời gian chính xác.

---

## 4. Bảo Vệ Dữ Liệu & Cách Ly Môi Trường
- **Cổng Admin riêng biệt:** Admin panel chỉ bind trên loopback (`127.0.0.1:3891`) và yêu cầu xác thực bằng mật khẩu ngẫu nhiên lưu tại `%LOCALAPPDATA%\2TECHMN\Mnhut_2tech_Al\admin-password.txt`.
- **Cổng Gateway công khai:** Gateway công khai (`127.0.0.1:3000`) chỉ cho phép các API người dùng đã được duyệt (`/api/me`, `/api/credits`, `/api/internal-checkouts`, v.v.). Mọi yêu cầu tới route tài chính cũ (nạp tiền, chuyển khoản, webhook) đều bị chặn cứng với mã lỗi `404 Not Found` ngay tại gateway.
- **Giới hạn tĩnh của GitHub Pages:** Bản triển khai GitHub Pages chỉ đóng vai trò giao diện tĩnh (HTML/CSS/JS). Không chứa backend Node.js, không kết nối SQLite, không cấp tài khoản hay tự động tạo số dư giả lập. Khi mở trên Pages, các tính năng yêu cầu máy chủ cục bộ sẽ hiển thị thông báo trung thực đang chờ backend.
