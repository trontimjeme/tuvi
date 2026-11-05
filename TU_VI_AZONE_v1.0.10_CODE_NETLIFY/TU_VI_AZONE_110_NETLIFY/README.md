# TỬ VI · KHÔNG GIAN SỐNG STUDIO AZONE — v1.0.10 Web Online

**Bản nguồn phục vụ triển khai thử nghiệm qua GitHub → Netlify.**

Đây là bản chuyển từ bộ demo giao diện AZONE v1.0.8 chạy Windows sang ứng dụng Next.js có API serverless. Trang giao diện gốc được giữ ở `public/site/index.html` và sẽ được mở tự động khi truy cập `/`.

## Chức năng

- Trang web tiếng Việt, 12 cung, 14 chính tinh, chuyển trang, giao diện neon và quảng cáo AZONE STUDIO.
- `POST /api/chart`: nhập sinh, tính lá số bằng hàm `generateChart()` gốc từ kho [Renhuai123/ziwei-doushu](https://github.com/Renhuai123/ziwei-doushu) tại commit `a600484a49255039d0725f1ba9e11ca81a948f97`.
- `GET /api/status`: trạng thái API.
- `POST /api/interpret`: tra cứu luận giải v4.0 bằng cách tải **một tệp theo năm**, kiểm tra SHA-256 và giải nén theo luồng `fzstd`. Đây là chế độ thử nghiệm tài nguyên lớn, có thể bị timeout trên Netlify; không nên dùng cho tải cao trước khi lập chỉ mục trong cơ sở dữ liệu riêng.
- Bot tra cứu trên giao diện đọc bảng sao, cung từ mã nguồn đã đối chiếu; Bot có thể đọc vị trí sao vừa lập ở trình duyệt. **Không phải mô hình ngôn ngữ và không được huấn luyện trên 56,6 GB dữ liệu.**

## Hướng dẫn triển khai Netlify

1. Giải nén ZIP này. **Không sử dụng chức năng Drag & Drop một file HTML để triển khai**: website này có Next.js API và cần xây dựng mã bằng Node.js.
2. Tạo một **repository GitHub mới** cho Tử Vi, đẩy toàn bộ thư mục `TU_VI_AZONE_109_NETLIFY/` lên gốc repository. Không đẩy vào repository portfolio của AZONE nếu không muốn thay thế site hiện tại.
3. Vào Netlify → Add new project → Import an existing project → GitHub → chọn repo Tử Vi mới.
4. Build command: `npm run build` ; Publish directory: `.next` ; Node.js: `22` (đã khai báo trong `netlify.toml`).
5. Chờ build hoàn tất; truy cập URL Netlify sẽ tự dẫn tới `/site/index.html`.
6. Kiểm tra `https://<site>.netlify.app/api/status` phải trả `ready:true`. Sau đó điền ngày sinh → **TẠO LÁ SỐ TỬ VI**. Kiểm tra 12 cung thực tế và dữ liệu sao đã thay đổi khi đổi thời điểm sinh.
7. Chọn menu Luận giải → Nạp dữ liệu năm sinh để thử kiểm tra dữ liệu v4.0. Nếu lần đầu trả 503, nguyên nhân có thể là GitHub chặn tần suất, hết thời gian hoặc dung lượng thực thi serverless. Hướng đi chính thức là nạp dữ liệu trước vào cơ sở dữ liệu bên ngoài.

### Nếu sử dụng Terminal trên PC

```
cd TU_VI_AZONE_109_NETLIFY
npm install
npm run dev
```

Lệnh `dev` sẽ tự tải mã nguồn gốc theo commit cố định từ GitHub (bắt buộc kết nối Internet). Mở `http://localhost:3000`.

### Nếu tự đẩy repo qua Git

```
git init
git add .
git commit -m "Tử Vi AZONE v1.0.10 Netlify"
git branch -M main
git remote add origin https://github.com/<TAI_KHOAN_CUA_BAN>/<REPO_MOI>.git
git push -u origin main
```

`<TAI_KHOAN_CUA_BAN>` và `<REPO_MOI>` là giá trị do người sở hữu GitHub chọn.

## Cơ chế tải mã nguồn gốc

File `scripts/prepare-upstream.mjs` tải kho GitHub công khai bằng Git tại build-time và **kiểm tra SHA commit** trước khi sao chép `lib/ziwei/`. Vì bản ZIP không chứa thuật toán gốc, cần kết nối GitHub khi triển khai lần đầu. Không lấy mã nguồn khi từng người dùng xem lá số.

## Phạm vi & hạn chế cần biết

- Chưa thể xác nhận tích hợp GitHub→Netlify chạy thật trong môi trường đóng gói này vì không có truy cập GitHub/NPM từ container. Trang và tương tác đã được kiểm tra bằng API mock, không phải bằng một lá số được tính từ repo.
- Bộ luận giải `v4.0-13d` chứa **77 tệp nén theo năm 1950–2026**, toàn bộ khoảng **56,6 GB sau giải nén**. Không có toàn bộ dữ liệu trong ZIP. Endpoint `/api/interpret` là cách tải theo năm theo yêu cầu, **không phải hệ thống database đã lập chỉ mục**.
- Luận giải v4.0 vẫn bằng tiếng Trung. Chưa dịch máy toàn bộ và chưa tích hợp AI trả lời tự nhiên. Các tên sao/cung trong giao diện đã dịch chọn lọc, một số sao phụ có thể còn tên Trung.
- Mặc định chỉ có lựa chọn kinh độ cho một số tỉnh thành Việt Nam. Nếu chưa xác định địa phương, giữ giờ đồng hồ, không tự suy ra kinh độ.
- Ngày sinh được gửi tới API để tính toán, không được ghi xuống database bởi mã này. Cần thêm chính sách bảo mật, kiểm soát spam, kiểm thử quy tắc an sao và giám sát Netlify trước khi mở cho công chúng.
- Thông tin Tử Vi chỉ nhằm nghiên cứu văn hóa; không thay thế tư vấn sức khỏe, tài chính, pháp lý hay quyết định quan trọng.

## Phân định giấy phép

- Mã nguồn gốc: **MIT**, tác giả gốc tại GitHub. Cần giữ thông báo bản quyền/phần giấy phép gốc khi phân phối.
- Bộ luận giải v4.0: **CC BY 4.0**, phải ghi nguồn và tác giả **王多鱼AI**.
- Các trích dẫn bài giảng của **Nghê Hải Hạ / Ni Haixia** có quy định riêng, không thuộc giấy phép CC BY của bộ dữ liệu; kho trích dẫn gốc quy định **CC BY-NC-SA 4.0**, cần xin phép hoặc kiểm tra kỹ nếu tái sử dụng thương mại.
- Thư viện cổ thuộc phạm vi công cộng như mô tả tại repository.

Nguồn: https://github.com/Renhuai123/ziwei-doushu

### Tên nguồn trong giao diện

Website và Bot hiển thị nhãn **Code** thay cho nhãn tên nền tảng lưu trữ. Các URL `github.com` và chỉ dẫn **Import from GitHub** trong hướng dẫn cài đặt vẫn được giữ nguyên vì đó là tên và địa chỉ kỹ thuật thực tế; thay chúng sẽ làm hỏng liên kết hoặc gây nhầm thao tác.
