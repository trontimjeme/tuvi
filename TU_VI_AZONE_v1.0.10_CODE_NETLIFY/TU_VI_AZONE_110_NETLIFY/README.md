# TỬ VI · KHÔNG GIAN SỐNG STUDIO AZONE — v1.0.10 Web Online

**Bản nguồn phục vụ triển khai thử nghiệm qua GitHub → Netlify.**

Đây là bản chuyển từ bộ demo giao diện AZONE v1.0.8 chạy Windows sang ứng dụng Next.js có API serverless. Trang giao diện gốc được giữ ở `public/site/index.html` và sẽ được mở tự động khi truy cập `/`.

## Chức năng

- Trang web tiếng Việt, 12 cung, 14 chính tinh, chuyển trang, giao diện neon và quảng cáo AZONE STUDIO.
- `POST /api/chart`: nhập sinh, tính lá số bằng hàm `generateChart()` gốc từ kho [Renhuai123/ziwei-doushu](https://github.com/Renhuai123/ziwei-doushu) tại commit `a600484a49255039d0725f1ba9e11ca81a948f97`.
- `GET /api/status`: trạng thái API.
- `POST /api/interpret`: tra cứu luận giải v4.0 bằng cách tải **một tệp theo năm**, kiểm tra SHA-256 và giải nén Zstandard theo luồng bằng Node.js >=22.15. Đây là chế độ thử nghiệm tài nguyên lớn, có thể bị timeout trên Netlify; không nên dùng cho tải cao trước khi lập chỉ mục trong cơ sở dữ liệu riêng.
- Bot tra cứu trên giao diện đọc bảng sao, cung từ mã nguồn đã đối chiếu; Bot có thể đọc vị trí sao vừa lập ở trình duyệt. **Không phải mô hình ngôn ngữ và không được huấn luyện trên 56,6 GB dữ liệu.**

## Bot đọc lá số và xem theo năm

Sau khi tạo lá số, mở **Trợ lý Tử Vi** và hỏi “Năm 2027 thế nào?”, “Tài vận năm 2027”,
“Giàu cỡ nào?” hoặc “Luận giải lá số này”. Bot đọc đúng lá số đang mở; giữ chủ đề và
năm gần nhất trong phiên trò chuyện. Đổi lá số hoặc xóa chat sẽ xóa ngữ cảnh này.

`POST /api/annual` nhận thông tin sinh và năm, tự tính lại lá số trên server rồi dùng
`getLiuNianSiHua`, `getDaXianSiHua`, `getDaXianIndexForYear` của engine để xác định
Tứ Hóa lưu niên, vị trí các sao và đại hạn. Năm được hiểu là **năm âm lịch, đổi vào Tết**;
tuổi mụ lấy chênh lệch năm âm lịch sinh. Chưa gộp đầy đủ tiểu hạn, lưu tinh, tháng/ngày.
API chỉ chấp nhận năm nguyên 1900–2200 và tuổi 1–125; không tin các vị trí sao client gửi.
Có thể chạy `node scripts/smoke-annual.mjs [URL máy chủ]` để kiểm tra các ca này.

Chat không xuất liên kết kho mã hay chip dẫn nguồn. Thông báo bản quyền/giấy phép và
nguồn gốc kỹ thuật vẫn giữ trong tài liệu repository và các tệp giấy phép upstream.
Bot phân biệt câu hỏi mức tài sản với thời điểm tài vận, không định giá mức giàu bằng
số tiền, không đồng nhất đại hạn Tài Bạch với đỉnh tài sản. Với trẻ nhỏ, câu trả lời ưu
tiên học tập, chăm sóc và hỗ trợ gia đình. Nội dung là diễn giải văn hóa theo quy tắc;
chưa kết nối mô hình ngôn ngữ, không tự huấn luyện/tự học từ hội thoại và không tải
âm thầm kho dữ liệu ngoài. Để thêm khả năng AI mở cần một tích hợp mô hình và truy
xuất dữ liệu riêng; không có API key hoặc dữ liệu được bịa ra trong bản này.

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

## Lịch vạn niên và định dạng ngày Việt Nam

Ô ngày sinh nhập `DD/MM/YYYY` rồi chuyển sang ISO khi gọi API tạo lá số. Khung lịch
vạn niên cho chọn tháng/năm, xem ngày âm và tháng nhuận theo UTC+7. Phần chuyển đổi
được tích hợp từ [hnthap/lunar-calendar-api](https://github.com/hnthap/lunar-calendar-api)
(MIT), ghim commit và giữ giấy phép tại `lib/vietnamese-calendar/vendor/`.
Không gọi API công cộng bên ngoài; phần lịch này độc lập với engine an sao.

Sau khi chạy ứng dụng, kiểm tra các mốc Tết, tháng nhuận và múi giờ Việt Nam bằng
`node scripts/smoke-calendar.mjs` (hoặc truyền URL máy chủ làm tham số đầu tiên).
Tiêu đề trang và tên trên bản in: **AZONE STUDIO 135 ĐỒNG QUANG**.

## Thống kê truy cập Umami

Chân trang dùng tracker và API chính thức của [umami-software/umami](https://github.com/umami-software/umami).
Hiển thị khách hoạt động trong **5 phút gần nhất**, khách và lượt xem **hôm nay theo UTC+7**.
“Online” là cửa sổ hoạt động của Umami, không phải kết nối trực tuyến chính xác từng giây.
Không gửi tên, ngày/giờ/nơi sinh hoặc dữ liệu lá số tới Umami. Query/hash bị loại khỏi
URL theo dõi; tôn trọng Do Not Track. Chặn quảng cáo/DNT có thể khiến thống kê thiếu.

Để bật trên Vercel/Netlify, cấu hình trong Environment Variables/Secrets rồi redeploy:

- `UMAMI_URL`: URL HTTPS của máy chủ Umami, không kèm `/script.js` hoặc `/api`.
- `UMAMI_WEBSITE_ID`: UUID website đã thêm trong Umami, đặt domain đúng website triển khai.
- `UMAMI_API_TOKEN`: API key/Bearer token đọc website đó, **chỉ trên server**.

Mã được đối chiếu với Umami 3.4.1, commit `559e3c607c23d2c72d9bd4f6481bda428255323c`;
phần đọc số liệu hỗ trợ cả định dạng `{ value }` của Umami 2. Tích hợp này nhắm tới
Umami self-hosted; Umami Cloud có endpoint/cách xác thực riêng cần cấu hình bổ sung.
Nếu chưa có máy chủ, triển khai repo Umami với PostgreSQL theo README chính thức,
tạo tài khoản/đổi mật khẩu mặc định và thêm website trước khi cấu hình ba biến trên.
Không dùng database tạm trong môi trường phát triển để lưu thống kê website công khai.

`/api/analytics/config` chỉ trả cấu hình tracker công khai; `/api/analytics/stats` giữ
credential trên máy chủ và chỉ trả ba số tổng hợp, cache nội bộ 15 giây. Giao diện làm
mới 30 giây/lần khi tab đang mở. Chưa cấu hình hoặc lỗi kết nối hiển thị dấu `—`,
không tạo số liệu giả. Chưa có Umami thật/credential thì chưa xác nhận thu thập thực tế.

## Nhận diện khi chia sẻ link

Tiêu đề: **✓ AZONE STUDIO GENCHART**; mô tả: **✓ TỬ VI KHÔNG GIAN SỐNG**.
Metadata Open Graph/Twitter có ở cả layout Next.js và trang HTML đích sau chuyển hướng.
Ảnh chia sẻ `public/site/share-preview.png` có kích thước 1200×630. URL chính hiện là
`https://tuvi-dun.vercel.app`; khi đổi tên miền cần cập nhật metadata trong hai nơi này.
Tiêu đề in vẫn là **AZONE STUDIO 135 ĐỒNG QUANG**, được đặt khi bắt đầu in và khôi
phục sau đó. Dịch vụ nhắn tin có thể giữ cache bản xem trước cũ sau khi triển khai.


## Luận giải từ bản ghi gốc

Sau khi tạo lá số thành công, nút **Luận giải** xuất hiện ngay dưới nút tạo lá số.
Nút lấy bản ghi đúng ngày dương lịch/giờ địa chi/giới tính đã được engine hiệu chỉnh,
kiểm tra SHA-256 của tệp năm trước khi giải nén và kiểm tra đủ 13 chủ đề. Không tìm
thấy bản ghi thì báo rõ, không dùng bản gần giống. Bản gốc 1950–2026 giữ nguyên tiếng
Trung. Giao diện ghi **chưa có bản dịch tiếng Việt** khi chưa có dịch vụ dịch.

Giải nén dùng Zstandard native, yêu cầu **Node >=22.15** (Node 24 cũng được), cửa sổ
128 MB theo hướng dẫn phát hành. Cache chỉ giữ tối đa 12 bản ghi; không nạp cả 700 MB
văn bản giải nén vào RAM. Việc tải lần đầu còn phụ thuộc truy cập bộ phát hành và tài
nguyên serverless; khi lưu lượng lớn nên lập chỉ mục dữ liệu ngoài thay vì giải nén lại.
Trong cloud sandbox có HTTP proxy, Node 24 có thể cần `NODE_USE_ENV_PROXY=1` lúc chạy;
không tắt kiểm tra TLS hoặc checksum.

Dịch tiếng Việt hiện **chưa bật** theo lựa chọn người dùng. Adapter tùy chọn dùng
`TRANSLATION_API_KEY`, `TRANSLATION_API_URL`, `TRANSLATION_MODEL` (mẫu trong `.env.example`).
Mỗi lần chỉ dịch chủ đề đang chọn, gửi nguyên văn chủ đề chứ không gửi trường tên/ngày
sinh. Bản dịch máy được tách khỏi nguyên bản và không được nhận là đã có người duyệt.
Bot chỉ trích bản dịch khi thuộc đúng lá số/chủ đề; nếu chưa dịch, bot nói rõ phần trả
lời tiếng Việt là diễn giải quy tắc riêng. Chat lọc các URL GitHub ở cả câu trả lời,
lỗi API và phần hiển thị câu hỏi; không tạo liên kết bấm được.

Kiểm thử: `node --experimental-strip-types --test scripts/test-interpret.mjs`.
Giữ nguồn và giấy phép của bộ dữ liệu trong tài liệu này và `UPSTREAM-DATASET-LICENSE`;
không xóa thông báo tác giả/giấy phép khỏi bản gốc.

### Dịch thủ công qua trình duyệt / Google

Sau khi tải bản ghi gốc, thanh công cụ cho copy toàn bộ chủ đề, bôi đen văn bản để
sử dụng menu dịch gốc của trình duyệt, hoặc mở Google Dịch Trung → Việt. Ứng dụng
không can thiệp menu chuột phải. Chỉ đoạn đang chọn trong nội dung luận giải mới
được lấy làm lựa chọn; không lấy phần bôi đen ở khu vực khác. Với URL ngắn, đoạn đó
được điền trực tiếp; với văn bản dài, copy nguyên văn và mở Google để người dùng dán,
không cắt mất nội dung hoặc tạo URL quá dài. Clipboard bị chặn thì hướng dẫn Copy
thủ công. Google chỉ nhận nội dung khi người dùng chủ động bấm mở dịch; kết quả dịch
bên ngoài không được ứng dụng nhận là bản dịch đã duyệt.
