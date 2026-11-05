/*
  TỬ VI · AZONE STUDIO · v1.0.10
  Trợ lý tri thức bản demo OFFLINE: trả lời có quy tắc từ dữ liệu gốc Code
  KHÔNG phải LLM, KHÔNG được huấn luyện trên 56.6GB, KHÔNG luận lá số người dùng.
*/
(()=>{
  'use strict';
  const GH='https://github.com/Renhuai123/ziwei-doushu/blob/main/';
  const SOURCES={
    constants:{name:'Bảng sao & Tứ Hóa · Code',url:GH+'lib/ziwei/constants.ts'},
    types:{name:'Cấu trúc 12 cung · Code',url:GH+'lib/ziwei/types.ts'},
    algorithm:{name:'Thuật toán an sao · Code',url:GH+'lib/ziwei/algorithm.ts'},
    school:{name:'Quy tắc trường phái · Code',url:GH+'lib/ziwei/school-config.ts'},
    time:{name:'12 thời thần · Code',url:GH+'lib/ziwei/constants.ts'},
    readme:{name:'Tài liệu dự án · Code',url:GH+'README.en.md'},
    release:{name:'Dữ liệu luận giải v4.0 · Code',url:'https://github.com/Renhuai123/ziwei-doushu/releases/tag/v4.0-13d'},
    classic:{name:'Kho cổ thư · Code',url:GH+'lib/classics/index.ts'},
    forum:{name:'Diễn đàn Tử Vi Lý Số',url:'https://tuvilyso.org/'},
    lyso:{name:'Diễn đàn Lý Số Việt Nam',url:'https://lyso.vn/forum.php'}
  };
  // Các thuộc tính sao được dịch từ STAR_DESCRIPTIONS trong constants.ts.
  const STARS=[
    {name:'Tử Vi',alias:['tu vi'],element:'Thổ',nature:'Trung tính thiên cát',traits:'tôn quý, độc lập, vị thế'},
    {name:'Thiên Cơ',alias:['thien co'],element:'Mộc',nature:'Cát tinh',traits:'trí tuệ, linh hoạt, mưu lược'},
    {name:'Thái Dương',alias:['thai duong'],element:'Hỏa',nature:'Cát tinh',traits:'quang minh, chức vị, hào sảng'},
    {name:'Vũ Khúc',alias:['vu khuc'],element:'Kim',nature:'Trung tính',traits:'tài chính, cương nghị, quyết đoán'},
    {name:'Thiên Đồng',alias:['thien dong'],element:'Thủy',nature:'Cát tinh',traits:'ôn hòa, hưởng phúc, tùy duyên'},
    {name:'Liêm Trinh',alias:['liem trinh'],element:'Hỏa',nature:'Hung cát đan xen',traits:'tài nghệ, ràng buộc, đào hoa'},
    {name:'Thiên Phủ',alias:['thien phu'],element:'Thổ',nature:'Cát tinh',traits:'kho tài, ổn trọng, bảo thủ'},
    {name:'Thái Âm',alias:['thai am'],element:'Thủy',nature:'Cát tinh',traits:'mềm mỏng, tài lộc, tính âm'},
    {name:'Tham Lang',alias:['tham lang'],element:'Mộc',nature:'Trung tính',traits:'dục vọng, đào hoa, đa tài'},
    {name:'Cự Môn',alias:['cu mon'],element:'Thủy',nature:'Hung cát đan xen',traits:'khẩu thiệt, tranh luận, biện luận'},
    {name:'Thiên Tướng',alias:['thien tuong'],element:'Thủy',nature:'Cát tinh',traits:'phò tá, quản trị, ấn tín'},
    {name:'Thiên Lương',alias:['thien luong'],element:'Thổ',nature:'Cát tinh',traits:'che chở, y dược, trưởng bối'},
    {name:'Thất Sát',alias:['that sat'],element:'Kim',nature:'Hung tinh',traits:'tướng tinh, quyết đoán, cô độc'},
    {name:'Phá Quân',alias:['pha quan'],element:'Thủy',nature:'Hung tinh',traits:'khai phá, biến động, phá cách'}
  ];
  const PALACES=[
    ['Mệnh','Cung Mệnh được dùng làm điểm khởi đầu để lập trật tự các cung và xem các chính tinh tọa thủ.'],
    ['Huynh Đệ','Cung Huynh Đệ là nhóm chủ đề về anh chị em.'],
    ['Phu Thê','Cung Phu Thê là nhóm chủ đề về vợ chồng và quan hệ hôn phối.'],
    ['Tử Tức','Cung Tử Tức là nhóm chủ đề về con cái.'],
    ['Tài Bạch','Cung Tài Bạch là nhóm chủ đề về tài chính và nguồn lực.'],
    ['Tật Ách','Cung Tật Ách là nhóm chủ đề sức khỏe trong hệ thống truyền thống, không thay thế chẩn đoán y khoa.'],
    ['Thiên Di','Cung Thiên Di là nhóm chủ đề về đi xa và môi trường bên ngoài.'],
    ['Nô Bộc','Cung Nô Bộc còn có tên Giao Hữu, thuộc nhóm quan hệ xã hội, bạn bè, cộng sự.'],
    ['Quan Lộc','Cung Quan Lộc là nhóm chủ đề về công danh, công việc và sự nghiệp.'],
    ['Điền Trạch','Cung Điền Trạch là nhóm chủ đề về nhà cửa, tài sản bất động sản.'],
    ['Phúc Đức','Cung Phúc Đức là nhóm chủ đề về đời sống tinh thần và phúc đức.'],
    ['Phụ Mẫu','Cung Phụ Mẫu là nhóm chủ đề về cha mẹ, trưởng bối.']
  ];
  const STEMS=['Giáp','Ất','Bính','Đinh','Mậu','Kỷ','Canh','Tân','Nhâm','Quý'];
  // Bảng nguyên văn tại constants.ts — năm theo thiên can, mảng tương ứng Lộc, Quyền, Khoa, Kỵ.
  const FOUR=[
    ['Liêm Trinh','Phá Quân','Vũ Khúc','Thái Dương'],
    ['Thiên Cơ','Thiên Lương','Tử Vi','Thái Âm'],
    ['Thiên Đồng','Thiên Cơ','Văn Xương','Liêm Trinh'],
    ['Thái Âm','Thiên Đồng','Thiên Cơ','Cự Môn'],
    ['Tham Lang','Thái Âm','Hữu Bật','Thiên Cơ'],
    ['Vũ Khúc','Tham Lang','Thiên Lương','Văn Khúc'],
    ['Thái Dương','Vũ Khúc','Thái Âm','Thiên Đồng'],
    ['Cự Môn','Thái Dương','Văn Khúc','Văn Xương'],
    ['Thiên Lương','Tử Vi','Tả Phù','Vũ Khúc'],
    ['Phá Quân','Cự Môn','Thái Âm','Tham Lang']
  ];
  const HOURS=['Tý','Sửu','Dần','Mão','Thìn','Tỵ','Ngọ','Mùi','Thân','Dậu','Tuất','Hợi'];
  const HOUR_RANGES=['23:00–01:00','01:00–03:00','03:00–05:00','05:00–07:00','07:00–09:00','09:00–11:00','11:00–13:00','13:00–15:00','15:00–17:00','17:00–19:00','19:00–21:00','21:00–23:00'];
  const strip=s=>String(s).toLocaleLowerCase('vi').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/[^a-z0-9\s]/g,' ').replace(/\s+/g,' ').trim();
  const matchesWord=(q,word)=>(' '+q+' ').includes(' '+strip(word)+' ');
  const answer=(text,sources=[])=>({text,sources});
  function findReply(question){
    const q=strip(question); const src=(...ids)=>ids.map(i=>SOURCES[i]);
    if(!q)return answer('Anh/chị có thể hỏi về tên sao, Tứ Hóa, 12 cung, giờ sinh hoặc bộ dữ liệu của dự án.',src('readme'));
    if(/(hoc het|da hoc|xu ly|du lieu lon|bao nhieu gb|dataset|674 976|56 6|56gb|8 774|nguon du lieu|kho du lieu)/.test(q)){
      return answer('Hiện tại tôi mới có bộ kiến thức tra cứu chọn lọc từ mã nguồn. Tôi CHƯA đọc hay được huấn luyện trên bộ luận giải v4.0. Nguồn Code công bố 674.976 lá số × 13 chủ đề = 8.774.688 bài, khoảng 161 MB nén và 56,6 GB sau giải nén. Muốn sử dụng thật cần tải các gói theo năm, kiểm tra mã băm, lập chỉ mục và tích hợp công cụ truy vấn.',src('readme','release'));
    }
    const chart = window.AZONE_ACTIVE_CHART;
    if(chart && /(la so cua toi|xem la so|cung menh cua toi|sao nao o cung|sao trong cung|12 cung cua toi|cac sao trong la so)/.test(q)){
      const target=PALACES.find(p => q.includes(strip(p[0])));
      const palaces=chart.palaces || [];
      const record=target ? palaces.find(p => strip(p.name)===strip(target[0])) : palaces.find(p => p.branch===chart.mingGongBranch);
      if(record){
        const heading=record.name;
        const starList=(record.stars||[]).map(s=>s.name).slice(0,18);
        return answer(`Lá số vừa tính có cung ${heading} tại ${record.chi||'địa chi chưa xác định'}.\nCác sao ghi nhận: ${starList.join(' · ')||'Không có sao trong dữ liệu hiển thị'}.\n\nĐây là dữ liệu an sao từ thuật toán generateChart(), không phải kết luận số mệnh. Để đọc luận giải chi tiết, hãy sang mục Luận giải và tải dữ liệu v4.0 theo năm.`,src('algorithm','types','release'));
      }
    }
    if(/(xem la so|giai la so|luan giai la so|ngay sinh cua|tuoi cua toi|van han cua toi|canh nao|menh cua toi)/.test(q)){
      return answer('Nếu đã lập lá số, tôi có thể tra vị trí sao và 12 cung từ dữ liệu thực đang hiển thị. Tôi không tự suy diễn vận mệnh cá nhân; phần luận giải phải tải và đối chiếu riêng từ bộ dữ liệu v4.0.',src('algorithm','readme'));
    }
    const yearMatch=q.match(/\b(19\d\d|20\d\d)\b/);
    const stemIndex=STEMS.findIndex(s=>matchesWord(q,s));
    if(/(tu hoa|hoa loc|hoa quyen|hoa khoa|hoa ky|bon hoa|hoa ki)/.test(q)){
      const idx=stemIndex>=0?stemIndex:(yearMatch?((Number(yearMatch[1])-4)%10+10)%10:-1);
      if(idx>=0){const a=FOUR[idx];return answer(`Theo bảng Tứ Hóa năm can ${STEMS[idx]} trong mã nguồn:\n• Hóa Lộc: ${a[0]}\n• Hóa Quyền: ${a[1]}\n• Hóa Khoa: ${a[2]}\n• Hóa Kỵ: ${a[3]}.\n\nĐây là bảng tra cứu an sao, không phải luận đoán số mệnh.`,src('constants','school'))}
      return answer('Tứ Hóa gồm Hóa Lộc, Hóa Quyền, Hóa Khoa và Hóa Kỵ. Bảng an Tứ Hóa thay đổi theo thiên can năm. Ví dụ, hãy hỏi “Tứ Hóa năm Giáp” hoặc “Tứ Hóa năm 1990” để xem bảng cụ thể.',src('constants','school'));
    }
    if(/(gio sinh|gio ty|gio suu|gio dan|gio mao|gio thin|gio ty |gio ngo|gio mui|gio than|gio dau|gio tuat|gio hoi|12 thoi than|12 gio)/.test(q)){
      const m=q.match(/gio (ty|suu|dan|mao|thin|ngo|mui|than|dau|tuat|hoi)/);
      let i=m?HOURS.findIndex(x=>strip(x)===m[1]):-1;
      if(m&&m[1]==='ty'){i=0;}
      if(i>=0)return answer(`Theo bảng giờ sinh của dự án, giờ ${HOURS[i]} tương ứng ${HOUR_RANGES[i]}. Đối với trường hợp gần ranh giới giờ và sinh tại địa phương khác nhau, thuật toán có thể dùng hiệu chỉnh giờ mặt trời thực; riêng giờ Tý có thiết lập đổi ngày.`,src('time','algorithm','school'));
      return answer(`12 giờ theo địa chi trong mã nguồn:\n${HOURS.map((v,i)=>`${v}: ${HOUR_RANGES[i]}`).join(' · ')}.\n\nChú ý: đầu vào thuật toán là chỉ số giờ địa chi 0–11, không phải giờ đồng hồ 0–23.`,src('time','readme'));
    }
    if(/(tam phuong|tu chinh|doi cung|tam hop)/.test(q)){
      return answer('Trong sơ đồ Tử Vi, “tam phương tứ chính” lấy một cung làm gốc, hai cung ở vị trí tam hợp cách 4 và 8 địa chi, cùng cung đối xung cách 6 địa chi. Đây là quy tắc bố cục để xét các cung liên hệ, không tự nó kết luận cát hung.',src('algorithm','types'));
    }
    if(/(thang nhuan|nhuan am|leap month|gio ty muon|doi ngay|gio mat troi|solar time|true solar)/.test(q)){
      return answer('Repository có tùy chọn xử lý tháng nhuận theo các quy tắc khác nhau, hiệu chỉnh giờ mặt trời thực theo kinh độ nơi sinh và lựa chọn cách xử lý giờ Tý muộn. Khi xây website chính thức, phải giữ đúng cấu hình tính toán và kiểm thử các ca sát ranh giới; không được tự suy luận lại công thức.',src('school','algorithm','readme'));
    }
    if(/(co thu|thu vien|sach|tai lieu kinh dien|tu vi dau so toan thu|cot tuy phu)/.test(q)){
      return answer('Kho cổ thư tích hợp trong mã nguồn gồm 《骨髓赋》 (Cốt Tủy Phú), 《紫微斗数全集》 (Tử Vi Đẩu Số Toàn Tập) và 《紫微斗数全书》 (Tử Vi Đẩu Số Toàn Thư). Bản demo chưa dịch đầy đủ các chương; nội dung nghiên cứu có thể được đối chiếu theo chương, trang và nguồn khi hoàn thiện.',src('classic','readme'));
    }
    if(/(dien dan|cong dong|tham khao ngoai|hoc o dau)/.test(q)){
      return answer('Có thể đọc thảo luận tại Diễn đàn Tử Vi Lý Số và Diễn đàn Lý Số Việt Nam. Đây là nguồn trao đổi cộng đồng, không phải dữ liệu kiểm chứng tự động. Trước khi đưa bài viết vào hệ thống trả lời cần kiểm tra quyền sử dụng, tác giả, tính nhất quán với trường phái và nguồn dẫn.',src('forum','lyso'));
    }
    const st=STARS.find(s=>q.includes(strip(s.name)) && (strip(s.name)!=='tu vi'||/(sao tu vi|chinh tinh tu vi|sao nay)/.test(q)));
    if(st){return answer(`Sao ${st.name} thuộc nhóm 14 chính tinh. Theo mô tả trong bảng dữ liệu của dự án:\n• Ngũ hành: ${st.element}.\n• Phân loại truyền thống: ${st.nature}.\n• Từ khóa: ${st.traits}.\n\nĐể diễn giải một lá số cụ thể còn phải xác định cung an sao, miếu/vượng/hãm, sao hội chiếu, Tứ Hóa và cấu hình trường phái. Không thể kết luận chỉ từ tên một sao.`,src('constants','algorithm'))}
    const p=PALACES.find(x=>matchesWord(q,x[0])||(matchesWord(q,'cung '+x[0])));
    if(p){return answer(`${p[1]}\n\nĐây là khái niệm phân loại cung, chưa phải lời giải đoán cá nhân. Lá số gồm 12 cung; tên và thứ tự cung được định nghĩa trong nguồn, còn các sao được an bằng thuật toán.`,src('constants','types'))}
    if(/(14 sao|chinh tinh|14 chinh|cac sao|he thong sao)/.test(q)){
      return answer(`14 chính tinh trong mã nguồn:\n${STARS.map(s=>s.name).join(' · ')}.\n\nAnh/chị có thể hỏi từng sao như “Sao Thiên Cơ là gì?” để xem ngũ hành và mô tả được ghi trong dự án.`,src('constants'));
    }
    if(/(12 cung|cac cung|cung menh|tu vi dau so la gi)/.test(q)){
      return answer(`Hệ thống lá số Tử Vi gồm 12 cung:\n${PALACES.map(p=>p[0]).join(' · ')}.\n\nTheo dự án, thuật toán an sao sử dụng ngày dương lịch hợp lệ, chỉ số giờ địa chi 0–11 và giới tính; một số thiết lập khác có thể ảnh hưởng đến cách an sao.`,src('constants','readme'));
    }
    if(/(xin chao|chao bot|hello|hi bot)/.test(q)){
      return answer('Xin chào! Tôi là trợ lý tra cứu Tử Vi bản demo, hỗ trợ kiến thức chọn lọc có dẫn nguồn. Anh/chị có thể hỏi về 14 chính tinh, 12 cung, Tứ Hóa, tam phương tứ chính hoặc cơ chế lập lá số.',src('readme'));
    }
    return answer('Tôi chưa có câu trả lời đáng tin cậy cho nội dung này trong bộ tri thức demo. Anh/chị thử hỏi về 14 chính tinh, 12 cung, Tứ Hóa theo thiên can, giờ sinh hoặc kho dữ liệu Code. Khi tích hợp bộ dữ liệu lớn và công cụ truy xuất, tôi sẽ có thể tra cứu sâu hơn; hiện chưa tự học từ diễn đàn.',src('readme'));
  }
  const el=document.createElement('div');el.className='agent-dock';el.innerHTML=`
    <button id="agentLauncher" class="agent-launch" type="button" aria-label="Mở trợ lý Tử Vi" aria-controls="agentPanel" aria-expanded="false">
      <span class="agent-avatar"><img src="azone-bot.png" alt=""/><i class="agent-online-dot"></i></span><span class="agent-label">Trợ lý Tử Vi<small>Tra cứu tri thức</small></span>
    </button>
    <section class="agent-panel" id="agentPanel" role="dialog" aria-modal="false" aria-label="Trợ lý Tử Vi" aria-hidden="true">
      <div class="agent-head"><span class="agent-avatar"><img src="azone-bot.png" alt="" /></span><div class="agent-headcopy"><strong>Trợ lý Tử Vi</strong><span>Tra cứu nguồn · Chưa kết nối AI</span></div><button id="agentClear" class="agent-head-btn" type="button" title="Xóa cuộc trò chuyện" aria-label="Xóa cuộc trò chuyện">↺</button><button id="agentClose" class="agent-head-btn" type="button" title="Đóng" aria-label="Đóng trợ lý">×</button></div>
      <div class="agent-status"><b>● Tri thức demo có dẫn nguồn</b> · Chưa nhập 56,6 GB dữ liệu luận giải và chưa kết nối mô hình AI.</div>
      <div id="agentMessages" class="agent-messages" role="log" aria-live="polite" aria-relevant="additions text"></div>
      <div id="agentSuggest" class="agent-suggest" aria-label="Gợi ý câu hỏi"></div>
      <form id="agentForm" class="agent-compose"><textarea id="agentInput" rows="1" maxlength="600" placeholder="Hỏi về sao, cung, Tứ Hóa..." aria-label="Nhập câu hỏi cho trợ lý"></textarea><button class="agent-send" type="submit" aria-label="Gửi câu hỏi" title="Gửi câu hỏi">➤</button></form>
      <div class="agent-disclaimer">Thông tin để nghiên cứu văn hóa · Không dùng cho quyết định hệ trọng · Hội thoại chỉ ở trình duyệt</div>
    </section>`;
  document.body.appendChild(el);
  const $=s=>el.querySelector(s);const launcher=$('#agentLauncher'),panel=$('#agentPanel'),log=$('#agentMessages'),input=$('#agentInput'),chipbox=$('#agentSuggest');
  let lastFocus=null;
  function bubble(text,who,sources){const row=document.createElement('div');row.className='agent-msg'+(who==='user'?' user':'');const content=document.createElement('div');content.className='agent-msg-bubble';content.textContent=text;row.appendChild(content);if(sources&&sources.length){const refs=document.createElement('div');refs.className='agent-sources';sources.forEach(s=>{const a=document.createElement('a');a.href=s.url;a.target='_blank';a.rel='noopener noreferrer';a.textContent='↗ '+s.name;refs.appendChild(a)});row.appendChild(refs)}log.appendChild(row);log.scrollTop=log.scrollHeight}
  const prompts=['14 chính tinh gồm những sao nào?','Tứ Hóa năm Giáp','Tam phương tứ chính là gì?','Kho dữ liệu lớn đã được xử lý chưa?'];
  function suggestions(){chipbox.innerHTML='';prompts.forEach(p=>{const b=document.createElement('button');b.type='button';b.textContent=p;b.addEventListener('click',()=>send(p));chipbox.appendChild(b)})}
  function reset(){log.innerHTML='';bubble('Xin chào! Tôi là trợ lý Tử Vi của Không Gian Sống AZONE STUDIO. Tôi có thể trả lời các câu hỏi tra cứu từ phần dữ liệu Code đã chọn lọc, kèm nguồn đối chiếu.\n\nĐây là bản demo tra cứu theo quy tắc, chưa phải Bot AI được huấn luyện trên toàn bộ kho.', 'agent', [SOURCES.readme]);suggestions()}
  function send(value){const q=value.trim();if(!q)return;bubble(q,'user');input.value='';const rep=findReply(q);window.setTimeout(()=>{bubble(rep.text,'agent',rep.sources)},180);}
  function show(open){if(open){lastFocus=document.activeElement;panel.classList.add('open');panel.setAttribute('aria-hidden','false');launcher.setAttribute('aria-expanded','true');launcher.setAttribute('aria-label','Đóng trợ lý Tử Vi');setTimeout(()=>input.focus(),90)}else{panel.classList.remove('open');panel.setAttribute('aria-hidden','true');launcher.setAttribute('aria-expanded','false');launcher.setAttribute('aria-label','Mở trợ lý Tử Vi');(lastFocus&&lastFocus.focus?lastFocus:launcher).focus()}}
  launcher.addEventListener('click',()=>show(!panel.classList.contains('open')));$('#agentClose').addEventListener('click',()=>show(false));$('#agentClear').addEventListener('click',reset);$('#agentForm').addEventListener('submit',e=>{e.preventDefault();send(input.value)});input.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send(input.value)}});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&panel.classList.contains('open'))show(false)});reset();
})();
