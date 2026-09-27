# Mnhut 2tech Al — 2TECH MN

Chủ quản: **NGUYỄN MINH NHỰT**. Công ty chủ quản: **2TECH MN**.

Tool tải video bằng link, quản lý công việc/file tải, kết nối nền tảng, mua gói bằng tín dụng nội bộ và hỗ trợ qua Gmail. Giao diện lấy dữ liệu từ máy chủ; không tạo tài khoản, số dư, video hoặc tiến độ trong trình duyệt.

## Chạy đầy đủ trên Windows

1. Cần Node.js 24 trở lên và hệ thống admin riêng do chủ quản cung cấp tại thư mục cùng cấp `admin-panel`. Mã admin không được đưa vào kho công khai.
2. Chạy `run.bat`. Tool tại `http://localhost:3000`, admin riêng tại `http://localhost:3891`. Launcher dùng trình duyệt mặc định và hồ sơ thông thường.
3. Mật khẩu admin ban đầu được tạo ngẫu nhiên, lưu tại `%LOCALAPPDATA%\2TECHMN\Mnhut_2tech_Al\admin-password.txt`. Đổi mật khẩu sau khi vào admin.
4. Trong admin, cấu hình Google OAuth **Web application** với redirect URI chính xác `http://localhost:3000/api/auth/callback`. Client Secret chỉ được nhập/lưu ở admin riêng. Nếu OAuth consent đang ở Testing, thêm người dùng thử nghiệm trong Google Cloud Console. Đăng nhập luôn chuyển sang tên miền Google.
5. Cấu hình email nhận hỗ trợ. Gmail mở thư soạn sẵn; người dùng tự nhấn Gửi.
6. Cài yt-dlp/FFmpeg bằng installer của admin đã kiểm tra SHA256 từ bản phát hành chính chủ. Không chạy lệnh tải script rồi thực thi trực tiếp.

## Tài khoản và bảng giá

Google xác minh lần đăng ký đầu tiên sẽ cấp **2.000.000 đồng tín dụng nội bộ**, chỉ dùng mua gói trong tool, không rút hoặc quy đổi tiền mặt. Những lần đăng nhập tiếp theo không cấp lại. Máy chủ lưu sổ giao dịch và kiểm tra quyền cho từng công việc.

| Gói | Giá/tháng | Video/ngày | Link/lần | Chất lượng tối đa | Đồng thời |
| --- | ---: | ---: | ---: | --- | ---: |
| Miễn phí | 0 | 5 | 1 | 720p | 1 |
| Start | 149.000 | 50 | 10 | 1080p | 2 |
| Pro | 249.000 | 250 | 50 | 2160p | 3 |
| Studio | 329.000 | 1.000 | 100 | 2160p | 4 |

Kỳ 6 tháng giảm 10%, kỳ 12 tháng giảm 20%. Mua cùng gói gia hạn từ ngày hết hạn hiện tại; nâng gói áp dụng từ lúc mua, không tự động tính hoàn tiền gói cũ. Chọn gói thấp hơn khi gói đang dùng hết hạn. Chất lượng thực tế phụ thuộc video nguồn và bộ tải; không tự tạo 4K hay cam kết 60 FPS.

## Nền tảng và dữ liệu riêng

Các adapter hiện tích hợp: YouTube, TikTok, Facebook, Instagram, Douyin, Bilibili, Kuaishou/Kwai, Xiaohongshu/RedNote, X/Twitter, Vimeo, Reddit, Twitch, Dailymotion và Pinterest. Không cam kết mọi URL sẽ tải được: quyền truy cập, thay đổi nền tảng, nội dung riêng tư, video bị xóa hoặc DRM có thể ngăn tải. Dùng nội dung bạn được phép truy cập và tải.

Nút đăng nhập nền tảng mở trang chính chủ. Trang web không thể tự đọc phiên đăng nhập của tên miền khác. Với nội dung cần đăng nhập, người dùng chủ động nhập file cookie Netscape của tài khoản mình trong phần kết nối; dữ liệu được mã hóa ở admin riêng. Không gửi mật khẩu nền tảng vào tool hoặc repository.

SQLite, cấu hình, khóa mã hóa, OAuth secret, phiên người dùng, cookie, video và nhật ký lưu ở `%LOCALAPPDATA%\2TECHMN\Mnhut_2tech_Al`, ngoài repository. Admin chỉ lắng nghe loopback; gateway chỉ chuyển tiếp các route người dùng cho phép và không phục vụ mã admin/DB.

## GitHub Pages và triển khai Internet

GitHub Pages chỉ phục vụ HTML/CSS/JS; **không chạy Node.js, SQLite, đăng nhập hoặc downloader**. Bản Pages hiển thị trạng thái chưa kết nối khi không có backend, không giả thành công. Dùng `run.bat` cho đầy đủ chức năng trên máy chủ.

Để nhiều người sử dụng qua Internet, chủ quản cần triển khai gateway với HTTPS/reverse proxy tới dịch vụ đang chạy, cấu hình public origin và Google redirect URI phù hợp, đồng thời giữ cổng admin/DB riêng. Kho này không tự mở firewall, tunnel hoặc công khai máy cá nhân. Bản hiện tại mặc định chỉ bind `127.0.0.1`.

Workflow chỉ upload các asset công khai vào Pages, không upload server/launcher. Các GitHub Actions được ghim commit. `deploy-to-github.ps1` dùng Git Credential Manager, yêu cầu đã commit, không lấy token ra khỏi kho mật khẩu, không dùng force push.

Google OAuth: [tài liệu chính chủ](https://developers.google.com/identity/protocols/oauth2/web-server). Downloader: [yt-dlp](https://github.com/yt-dlp/yt-dlp) và [FFmpeg builds](https://github.com/yt-dlp/FFmpeg-Builds).
