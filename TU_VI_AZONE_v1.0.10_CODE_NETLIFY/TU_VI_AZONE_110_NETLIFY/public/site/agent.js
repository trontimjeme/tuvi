/*
  TỬ VI · AZONE STUDIO · v1.0.10
  Trợ lý đọc lá số và Tứ Hóa theo năm; không có liên kết kho trong giao diện chat.
  Không phải LLM hay hệ thống tự huấn luyện. Đọc lá số đang mở và giải thích theo dữ liệu nguồn.
*/
(()=>{
  'use strict';
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
  const answer=text=>({text});
  let lastTopic='overview',lastYear=null,lastChart=null,conversationVersion=0;
  const FOUR_LABELS={'禄':'Hóa Lộc','权':'Hóa Quyền','科':'Hóa Khoa','忌':'Hóa Kỵ'};
  const palaceByName=(chart,name)=>(chart.palaces||[]).find(p=>strip(p.name)===strip(name));
  function describePalace(p){
    if(!p)return 'Không có dữ liệu cung.';
    const stars=(p.stars||[]).map(s=>s.name+(FOUR_LABELS[s.siHua]?' '+FOUR_LABELS[s.siHua]:''));
    return `${p.name} tại ${p.chi}: ${stars.join(' · ')||'chưa có dữ liệu sao'}.`;
  }
  function periodFor(chart,p){
    if(!p)return null;
    // Use actual engine ranges; do not invent dates or recalculate nominal ages.
    const dx=(chart.daXians||[]).find(d=>d.palaceBranch===p.branch);
    if(dx&&Number.isInteger(dx.startAge)&&Number.isInteger(dx.endAge))return `${dx.startAge}–${dx.endAge} tuổi`;
    return Array.isArray(p.daXianAge)?`${p.daXianAge[0]}–${p.daXianAge[1]} tuổi`:null;
  }
  function chartContext(chart){
    const b=chart.birthInfo||{}, o=b.origInput||{};
    const date=[o.day||b.day,o.month||b.month,o.year||b.year].filter(Boolean).join('/');
    const clock=Number.isInteger(o.clockHour)?` ${String(o.clockHour).padStart(2,'0')}:${String(o.clockMinute||0).padStart(2,'0')}`:'';
    return `Đang đọc lá số ${b.gender==='male'?'nam':b.gender==='female'?'nữ':''} sinh ${date}${clock}.`;
  }
  function hideRepositoryLinks(value){
    return String(value).replace(/\[([^\]]+)\]\(([^)]+)\)/g,(full,label,url)=>/(?:github\.com|githubusercontent\.com|github\.io|githubassets\.com)/i.test(url)?label:full)
      .replace(/(?:https?:\/\/|www\.|git@)?(?:[a-z0-9-]+\.)*(?:github\.com|githubusercontent\.com|github\.io|githubassets\.com)(?::|\/)?[^\s<>"']*/gi,'[liên kết đã ẩn]');
  }
  function personalReply(chart,kind,question=''){
    if(!chart||!Array.isArray(chart.palaces)||chart.palaces.length!==12)return answer('Hãy tạo lá số trước bằng ngày, giờ sinh và giới tính. Tôi chỉ đọc dữ liệu của lá số đã tính trên trang, không tự đoán lá số từ câu hỏi.',[]);
    const saved=window.AZONE_READING;
    const topic={wealth:'wealth',career:'career',relationship:'love',overview:'overview'}[kind]||'overview';
    if(saved?.chart===chart&&saved.language==='vi'&&saved.readings?.[topic])return answer(chartContext(chart)+'\n\nBản dịch máy từ bản luận gốc khớp lá số (chưa được người dịch duyệt):\n\n'+saved.readings[topic].slice(0,7000)+'\n\nCó thể xem đầy đủ trong mục Luận giải. Đây là quan niệm truyền thống, không bảo đảm dự báo.');
    const child=Number.isInteger(chart.currentAge)&&chart.currentAge<18;
    const names=child?['Mệnh','Phụ Mẫu','Phúc Đức']:kind==='wealth'?['Tài Bạch','Quan Lộc','Điền Trạch']:kind==='career'?['Quan Lộc','Mệnh']:kind==='relationship'?['Phu Thê','Mệnh']:['Mệnh','Quan Lộc','Tài Bạch'];
    const records=names.map(n=>palaceByName(chart,n)).filter(Boolean);
    const lines=[chartContext(chart)];
    if(saved?.chart===chart&&!saved.readings?.[topic])lines.push('Bản luận gốc đã được tải ở mục Luận giải nhưng còn tiếng Trung, chưa có bản dịch tiếng Việt. Phần dưới là diễn giải theo quy tắc từ lá số, không phải bản dịch của dữ liệu gốc.');
    if(child)lines.push('Đây là lá số trẻ nhỏ. Tôi ưu tiên gợi ý học tập, cảm xúc và sự hỗ trợ của gia đình; chưa gán nghề nghiệp, hôn nhân hay mức giàu cho trẻ.');
    if(kind==='wealth'){
      const amount=/(co nao|bao nhieu|muc nao|ty phu|trieu phu|may ty|muc giau)/.test(strip(question));
      lines.push(amount?'Lá số không quy đổi được thành số tiền, mức tài sản hay khẳng định tỷ phú. Tôi sẽ đọc cách tạo thu nhập và những điểm nên lưu ý, thay vì gán một mức giàu.':'Tôi có thể đọc các giai đoạn về công việc, tài sản và tài chính; chưa có căn cứ để gọi một giai đoạn là “giàu nhất”.');
    }
    else lines.push('Các điểm nổi bật trên lá số đang mở:');
    for(const p of records){
      lines.push('• '+describePalace(p));
      const period=periodFor(chart,p);
      if(period)lines.push(`  Đại hạn đi qua cung ${p.name}: ${period}.`);
      const traits=(p.stars||[]).filter(s=>s.type==='major').map(s=>{const known=STARS.find(k=>k.name===s.name);return known?`${known.name}: ${known.traits}`:null}).filter(Boolean);
      if(traits.length)lines.push('  Ý nghĩa truyền thống: '+traits.join('; ')+'.');
      const majors=(p.stars||[]).filter(s=>s.type==='major');
      if(p.name==='Quan Lộc')lines.push(majors.some(s=>s.name==='Thiên Cơ')?'  Có thể phát huy tư duy phân tích, lập kế hoạch và khả năng thích nghi; nên chọn việc phù hợp năng lực thực tế.':'  Nên lấy chuyên môn, kinh nghiệm và khả năng hợp tác làm nền tảng; tên sao không tự quyết định nghề nghiệp.');
      if(p.name==='Tài Bạch')lines.push((majors.length?'  Cần xét cùng Mệnh và Quan Lộc.':'  Vô chính diệu không có nghĩa nghèo; cần xét cùng Mệnh và Quan Lộc.')+' Ưu tiên quản lý dòng tiền, dự phòng và tránh quyết định đầu tư chỉ dựa trên lá số.');
      if(p.name==='Phu Thê')lines.push('  Quan hệ bền vững vẫn dựa vào giao tiếp, ranh giới và trách nhiệm chung; không thể kết luận cưới hay chia tay chỉ từ một cung.');
    }
    if(kind==='wealth'&&!child){
      const career=palaceByName(chart,'Quan Lộc'), home=palaceByName(chart,'Điền Trạch');
      const careerPeriod=periodFor(chart,career),homePeriod=periodFor(chart,home);
      if(careerPeriod)lines.push(`Nếu muốn xem khả năng tạo thu nhập từ công việc, có thể xem sâu đại hạn ${careerPeriod} ở Quan Lộc${homePeriod?`, đồng thời đối chiếu giai đoạn ${homePeriod} ở Điền Trạch về chủ đề nhà cửa, tài sản`:''}. Đây là chọn chủ đề để phân tích, không phải kết luận giai đoạn đó giàu nhất.`);
      lines.push('Đại hạn ở Tài Bạch cũng không mặc nhiên là đỉnh tài sản. Hóa Lộc/Hóa Quyền nêu trên là sao bản mệnh, không phải Hóa Lộc/Hóa Quyền phát sinh riêng cho đại hạn. Anh/chị có thể hỏi thêm một năm cụ thể, ví dụ “năm 2027 thế nào?” để xem Tứ Hóa và đại hạn của năm đó.');
    }
    lines.push('Các khoảng tuổi là tuổi mụ. Nội dung để tham khảo văn hóa, không bảo đảm kết quả tài chính hoặc sự kiện trong tương lai.');
    return answer(lines.join('\n\n'),[]);
  }
  function birthRequest(chart){
    const b=chart.birthInfo||{},o=b.origInput;
    if(!o)throw Error('Hãy tạo lại lá số với ngày và giờ sinh để xem năm.');
    return {birthdate:`${o.year}-${String(o.month).padStart(2,'0')}-${String(o.day).padStart(2,'0')}`,birthtime:`${String(o.clockHour).padStart(2,'0')}:${String(o.clockMinute).padStart(2,'0')}`,gender:b.gender,birthplace:b.province||'',calendar:'solar'};
  }
  const themes={'Mệnh':'bản thân và định hướng','Tài Bạch':'thu nhập và dòng tiền','Quan Lộc':'công việc, học tập và trách nhiệm','Điền Trạch':'nhà cửa và tài sản','Phu Thê':'quan hệ và việc phối hợp','Phúc Đức':'đời sống tinh thần','Phụ Mẫu':'gia đình và sự hỗ trợ','Nô Bộc':'cộng sự, bạn bè','Huynh Đệ':'anh chị em','Tử Tức':'con cái, việc chăm sóc','Thiên Di':'môi trường bên ngoài','Tật Ách':'chăm sóc sức khỏe thường ngày'};
  function annualAdvice(item,child=false){
    const theme=child?({'Tài Bạch':'nguồn lực chăm sóc trẻ trong gia đình','Quan Lộc':'học hỏi và sinh hoạt phù hợp lứa tuổi','Phu Thê':'sự phối hợp của người chăm sóc','Tử Tức':'việc chăm sóc và giáo dục'}[item.palace]||themes[item.palace]||'chủ đề liên quan'):themes[item.palace]||'chủ đề liên quan';
    if(item.type==='禄')return `Gợi ý truyền thống: chú ý cơ hội và nguồn hỗ trợ về ${theme}; Hóa Lộc không bảo đảm có tiền.`;
    if(item.type==='权')return `Gợi ý truyền thống: chủ động, kỷ luật và phân chia trách nhiệm trong ${theme}; tránh ôm việc hoặc áp đặt.`;
    if(item.type==='科')return `Gợi ý truyền thống: học hỏi, minh bạch và trao đổi rõ ràng trong ${theme}.`;
    return `Gợi ý truyền thống: dành thêm thời gian xử lý vướng mắc về ${theme}; Hóa Kỵ không đồng nghĩa chắc chắn gặp tai họa.`;
  }
  async function annualReply(chart,year,topic){
    if(!chart)return personalReply(null,'overview');
    const response=await fetch('/api/annual',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({birth:birthRequest(chart),year}),signal:AbortSignal.timeout(20000)});
    const data=await response.json();if(!response.ok)throw Error(data.error||'Không xem được năm này.');
    const lines=[chartContext(chart),`Năm ${data.year} (${data.yearName}) · ${data.age} tuổi mụ. Đang xét năm âm lịch, đổi năm vào Tết; không áp dụng nguyên vẹn cho những ngày dương lịch còn trước Tết.`,
      data.daXian?`Đại hạn ${data.daXian.startAge}–${data.daXian.endAge} tuổi tại ${data.daXian.palace}.`:data.childhood?'Đây là giai đoạn trước đại hạn đầu tiên; không gán nhầm vào đại hạn người trưởng thành.':'Năm này nằm ngoài các đại hạn đang có.'];
    if(data.age<18)lines.push('Với trẻ nhỏ, các chủ đề tài chính/công việc chỉ nên đọc theo hướng học tập, nếp sinh hoạt và sự hỗ trợ của gia đình, không gán sẵn nghề nghiệp hoặc mức giàu.');
    const focus=topic==='wealth'?['Tài Bạch','Quan Lộc','Điền Trạch']:topic==='career'?['Quan Lộc','Mệnh']:topic==='relationship'?['Phu Thê']:[];
    lines.push('Tứ Hóa lưu niên (phân biệt với Tứ Hóa bản mệnh):');
    for(const item of data.transforms){lines.push(`• ${item.star} ${item.label}${item.palace?` tại ${item.palace} (${item.branch})`:' — chưa xác định vị trí'}.`);if(!focus.length||focus.includes(item.palace))lines.push('  '+annualAdvice(item,data.age<18));}
    if(focus.length){const hits=data.transforms.filter(i=>focus.includes(i.palace));lines.push(`Riêng ${topic==='wealth'?'tài vận':topic==='career'?'công việc':'tình cảm'}: ${hits.length?'các điểm liên quan trực tiếp là '+hits.map(i=>i.star+' '+i.label+' tại '+i.palace).join('; ')+'.':'không có Tứ Hóa năm tọa trực tiếp trong nhóm cung đang hỏi; không thể từ đó kết luận tốt hoặc xấu.'}`);}
    if(data.daXian?.transforms?.length)lines.push('Lớp đại hạn: '+data.daXian.transforms.map(i=>`${i.star} ${i.label}${i.palace?' tại '+i.palace:''}`).join('; ')+'. Các dấu này thuộc đại hạn, không phải thêm một lần Tứ Hóa năm.');
    lines.push('Cách đọc: Lộc = cơ hội/hỗ trợ, Quyền = chủ động/trách nhiệm, Khoa = học hỏi/uy tín, Kỵ = điểm cần tháo gỡ. Đây là ý nghĩa truyền thống, không phải bằng chứng dự báo.');
    lines.push('Phạm vi: đã tính Tứ Hóa theo năm và đại hạn theo tuổi; chưa tổng hợp đầy đủ tiểu hạn, các lưu tinh, tháng/ngày. Vì vậy tôi không chốt năm này giàu bao nhiêu, chắc chắn cưới hay xảy ra sự kiện cụ thể.');
    return answer(lines.join('\n\n'));
  }
  async function respond(question){
    const chart=window.AZONE_ACTIVE_CHART,q=strip(question);
    if(chart!==lastChart){lastTopic='overview';lastYear=null;lastChart=chart;}
    let topic=/(giau|tai van|tai chinh|kiem tien|tien bac|tai san|phat tai)/.test(q)?'wealth':/(su nghiep|cong viec|nghe nghiep|cong danh)/.test(q)?'career':/(hon nhan|tinh duyen|vo chong|tinh cam)/.test(q)?'relationship':null;
    if(topic)lastTopic=topic;
    const explicit=q.match(/\b(?:nam|luu nien)\s+(\d{4})\b/)||q.match(/^\s*(\d{4})(?:\s|$)/);
    const currentYear=Number(new Intl.DateTimeFormat('en',{timeZone:'Asia/Ho_Chi_Minh',year:'numeric'}).format(new Date()));
    let year=explicit?Number(explicit[1]):/nam sau/.test(q)?(lastYear||currentYear)+1:/nam nay/.test(q)?currentYear:/nam truoc/.test(q)?currentYear-1:null;
    if(/(nam tiep|nam ke tiep)/.test(q))year=(lastYear||currentYear)+1;
    if(year!==null&&!/tu hoa/.test(q)){const result=await annualReply(chart,year,topic||lastTopic);if(chart)lastYear=year;return result;}
    if(topic&&lastYear&&!/(ban menh|ca doi|tong quan)/.test(q))return annualReply(chart,lastYear,topic);
    if(topic)return personalReply(chart,topic,question);
    return findReply(question);
  }
  function findReply(question){
    const q=strip(question);
    if(!q)return answer('Anh/chị có thể hỏi về tên sao, Tứ Hóa, 12 cung, giờ sinh hoặc bộ dữ liệu của dự án.');
    if(/(hoc het|da hoc|xu ly|du lieu lon|bao nhieu gb|dataset|674 976|56 6|56gb|8 774|nguon du lieu|kho du lieu)/.test(q)){
      return answer('Tôi đọc lá số đang mở, giải thích các cung và tính Tứ Hóa theo năm được hỏi. Tôi chưa kết nối mô hình ngôn ngữ và không tự học từ hội thoại. Có thể hỏi “năm 2027 thế nào?”, tài vận, công việc hoặc tình cảm.');
    }
    const chart = window.AZONE_ACTIVE_CHART;
    if(/(giau|tai van|tai chinh|kiem tien|tien bac|tai san|phat tai)/.test(q))return personalReply(chart,'wealth');
    if(/(su nghiep|cong viec|nghe nghiep|cong danh)/.test(q)&&!/(la gi|dinh nghia)/.test(q))return personalReply(chart,'career');
    if(/(hon nhan|tinh duyen|vo chong|tinh cam)/.test(q)&&!/(la gi|dinh nghia)/.test(q))return personalReply(chart,'relationship');
    if(/(luan giai|luan la so|giai la so)/.test(q))return personalReply(chart,'overview');
    if(chart && /(la so nay|la so cua toi|xem la so|cung menh cua toi|sao nao o cung|sao trong cung|12 cung cua toi|cac sao trong la so)/.test(q)){
      const target=PALACES.find(p => q.includes(strip(p[0])));
      const palaces=chart.palaces || [];
      const record=target ? palaces.find(p => strip(p.name)===strip(target[0])) : palaces.find(p => p.branch===chart.mingGongBranch);
      if(record){
        const heading=record.name;
        const starList=(record.stars||[]).map(s=>s.name).slice(0,18);
        return answer(`Lá số vừa tính có cung ${heading} tại ${record.chi||'địa chi chưa xác định'}.\nCác sao ghi nhận: ${starList.join(' · ')||'Không có sao trong dữ liệu hiển thị'}.\n\nĐây là vị trí sao trên lá số đang mở. Anh/chị có thể hỏi tiếp về ý nghĩa của cung, công việc, tài vận hoặc một năm cụ thể.`);
      }
    }
    if(/(xem la so|giai la so|luan giai la so|ngay sinh cua|tuoi cua toi|van han cua toi|canh nao|menh cua toi)/.test(q)){
      return answer('Nếu đã lập lá số, tôi có thể tra vị trí sao và 12 cung từ dữ liệu thực đang hiển thị. Tôi không tự suy diễn vận mệnh cá nhân; phần luận giải phải tải và đối chiếu riêng từ bộ dữ liệu v4.0.');
    }
    const yearMatch=q.match(/\b(19\d\d|20\d\d)\b/);
    const stemIndex=STEMS.findIndex(s=>matchesWord(q,s));
    if(/(tu hoa|hoa loc|hoa quyen|hoa khoa|hoa ky|bon hoa|hoa ki)/.test(q)){
      const idx=stemIndex>=0?stemIndex:(yearMatch?((Number(yearMatch[1])-4)%10+10)%10:-1);
      if(idx>=0){const a=FOUR[idx];return answer(`Tứ Hóa năm can ${STEMS[idx]}:\n• Hóa Lộc: ${a[0]}\n• Hóa Quyền: ${a[1]}\n• Hóa Khoa: ${a[2]}\n• Hóa Kỵ: ${a[3]}.\n\nĐây là bảng tra cứu an sao, không phải luận đoán số mệnh.`)}
      return answer('Tứ Hóa gồm Hóa Lộc, Hóa Quyền, Hóa Khoa và Hóa Kỵ. Bảng an Tứ Hóa thay đổi theo thiên can năm. Ví dụ, hãy hỏi “Tứ Hóa năm Giáp” hoặc “Tứ Hóa năm 1990” để xem bảng cụ thể.');
    }
    if(/(gio sinh|gio ty|gio suu|gio dan|gio mao|gio thin|gio ty |gio ngo|gio mui|gio than|gio dau|gio tuat|gio hoi|12 thoi than|12 gio)/.test(q)){
      const m=q.match(/gio (ty|suu|dan|mao|thin|ngo|mui|than|dau|tuat|hoi)/);
      let i=m?HOURS.findIndex(x=>strip(x)===m[1]):-1;
      if(m&&m[1]==='ty'){i=0;}
      if(i>=0)return answer(`Theo cách chia giờ truyền thống, giờ ${HOURS[i]} tương ứng ${HOUR_RANGES[i]}. Đối với trường hợp gần ranh giới giờ và sinh tại địa phương khác nhau, thuật toán có thể dùng hiệu chỉnh giờ mặt trời thực; riêng giờ Tý có thiết lập đổi ngày.`);
      return answer(`12 giờ theo địa chi:\n${HOURS.map((v,i)=>`${v}: ${HOUR_RANGES[i]}`).join(' · ')}.\n\nChú ý: đầu vào thuật toán là chỉ số giờ địa chi 0–11, không phải giờ đồng hồ 0–23.`);
    }
    if(/(tam phuong|tu chinh|doi cung|tam hop)/.test(q)){
      return answer('Trong sơ đồ Tử Vi, “tam phương tứ chính” lấy một cung làm gốc, hai cung ở vị trí tam hợp cách 4 và 8 địa chi, cùng cung đối xung cách 6 địa chi. Đây là quy tắc bố cục để xét các cung liên hệ, không tự nó kết luận cát hung.');
    }
    if(/(thang nhuan|nhuan am|leap month|gio ty muon|doi ngay|gio mat troi|solar time|true solar)/.test(q)){
      return answer('Tháng nhuận, giờ Tý muộn và nơi sinh có thể làm thay đổi cách an sao. Hãy nhập đúng loại lịch và nơi sinh; với giờ sát ranh giới nên đối chiếu cả hai giờ thay vì kết luận ngay.');
    }
    if(/(co thu|thu vien|sach|tai lieu kinh dien|tu vi dau so toan thu|cot tuy phu)/.test(q)){
      return answer('Các cổ thư thường dùng gồm 《骨髓赋》 (Cốt Tủy Phú), 《紫微斗数全集》 (Tử Vi Đẩu Số Toàn Tập) và 《紫微斗数全书》 (Tử Vi Đẩu Số Toàn Thư). Bản demo chưa dịch đầy đủ các chương; nội dung nghiên cứu có thể được đối chiếu theo chương, trang và nguồn khi hoàn thiện.');
    }
    if(/(dien dan|cong dong|tham khao ngoai|hoc o dau)/.test(q)){
      return answer('Có thể đọc thảo luận tại Diễn đàn Tử Vi Lý Số và Diễn đàn Lý Số Việt Nam. Đây là nguồn trao đổi cộng đồng, không phải dữ liệu kiểm chứng tự động. Trước khi đưa bài viết vào hệ thống trả lời cần kiểm tra quyền sử dụng, tác giả, tính nhất quán với trường phái và nguồn dẫn.');
    }
    const st=STARS.find(s=>q.includes(strip(s.name)) && (strip(s.name)!=='tu vi'||/(sao tu vi|chinh tinh tu vi|sao nay)/.test(q)));
    if(st){return answer(`Sao ${st.name} thuộc nhóm 14 chính tinh. Theo mô tả trong bảng dữ liệu của dự án:\n• Ngũ hành: ${st.element}.\n• Phân loại truyền thống: ${st.nature}.\n• Từ khóa: ${st.traits}.\n\nĐể diễn giải một lá số cụ thể còn phải xác định cung an sao, miếu/vượng/hãm, sao hội chiếu, Tứ Hóa và cấu hình trường phái. Không thể kết luận chỉ từ tên một sao.`)}
    const p=PALACES.find(x=>matchesWord(q,x[0])||(matchesWord(q,'cung '+x[0])));
    if(p){return answer(`${p[1]}\n\nĐây là khái niệm phân loại cung, chưa phải lời giải đoán cá nhân. Lá số gồm 12 cung; cần xét đồng cung, hội chiếu và Tứ Hóa khi đọc từng cung.`)}
    if(/(14 sao|chinh tinh|14 chinh|cac sao|he thong sao)/.test(q)){
      return answer(`14 chính tinh:\n${STARS.map(s=>s.name).join(' · ')}.\n\nAnh/chị có thể hỏi từng sao như “Sao Thiên Cơ là gì?” để xem ngũ hành và mô tả được ghi trong dự án.`);
    }
    if(/(12 cung|cac cung|cung menh|tu vi dau so la gi)/.test(q)){
      return answer(`Hệ thống lá số Tử Vi gồm 12 cung:\n${PALACES.map(p=>p[0]).join(' · ')}.\n\nHãy nhập ngày, giờ sinh, giới tính và loại lịch chính xác để xem lá số cá nhân.`);
    }
    if(/(xin chao|chao bot|hello|hi bot)/.test(q)){
      return answer('Xin chào! Tôi có thể đọc lá số đang mở và giải thích theo năm. Anh/chị muốn xem tổng quan, tài vận, công việc hay tình cảm?');
    }
    return answer('Tôi chưa xác định được ý anh/chị muốn hỏi. Có thể hỏi cụ thể: “năm 2027 thế nào?”, “tài vận năm 2027”, “luận giải lá số này”, hoặc tên một sao/cung. Tôi không tự suy ra thông tin ngoài lá số đang mở.');
  }
  const el=document.createElement('div');el.className='agent-dock';el.innerHTML=`
    <button id="agentLauncher" class="agent-launch" type="button" aria-label="Mở trợ lý Tử Vi" aria-controls="agentPanel" aria-expanded="false">
      <span class="agent-avatar"><img src="azone-bot.png" alt=""/><i class="agent-online-dot"></i></span><span class="agent-label">Trợ lý Tử Vi<small>Tra cứu tri thức</small></span>
    </button>
    <section class="agent-panel" id="agentPanel" role="dialog" aria-modal="false" aria-label="Trợ lý Tử Vi" aria-hidden="true">
      <div class="agent-head"><span class="agent-avatar"><img src="azone-bot.png" alt="" /></span><div class="agent-headcopy"><strong>Trợ lý Tử Vi</strong><span>Lá số cá nhân · Xem theo năm</span></div><button id="agentClear" class="agent-head-btn" type="button" title="Xóa cuộc trò chuyện" aria-label="Xóa cuộc trò chuyện">↺</button><button id="agentClose" class="agent-head-btn" type="button" title="Đóng" aria-label="Đóng trợ lý">×</button></div>
      <div class="agent-status"><b>● Đọc lá số · Đại hạn · Tứ Hóa theo năm</b> · Diễn giải truyền thống, không bảo đảm dự báo.</div>
      <div id="agentMessages" class="agent-messages" role="log" aria-live="polite" aria-relevant="additions text"></div>
      <div id="agentSuggest" class="agent-suggest" aria-label="Gợi ý câu hỏi"></div>
      <form id="agentForm" class="agent-compose"><textarea id="agentInput" rows="1" maxlength="600" placeholder="Hỏi về lá số, tài vận, công việc..." aria-label="Nhập câu hỏi cho trợ lý"></textarea><button class="agent-send" type="submit" aria-label="Gửi câu hỏi" title="Gửi câu hỏi">➤</button></form>
      <div class="agent-disclaimer">Thông tin để nghiên cứu văn hóa · Không dùng cho quyết định hệ trọng · Hội thoại chỉ ở trình duyệt</div>
    </section>`;
  document.body.appendChild(el);
  const $=s=>el.querySelector(s);const launcher=$('#agentLauncher'),panel=$('#agentPanel'),log=$('#agentMessages'),input=$('#agentInput'),chipbox=$('#agentSuggest');
  let lastFocus=null;
  function bubble(text,who){const row=document.createElement('div');row.className='agent-msg'+(who==='user'?' user':'');const content=document.createElement('div');content.className='agent-msg-bubble';content.textContent=hideRepositoryLinks(text);row.appendChild(content);log.appendChild(row);log.scrollTop=log.scrollHeight;return row;}
  const prompts=['Năm 2027 thế nào?','Tài vận năm 2027','Luận giải lá số này','Công việc của tôi thế nào?'];
  function suggestions(){chipbox.innerHTML='';prompts.forEach(p=>{const b=document.createElement('button');b.type='button';b.textContent=p;b.addEventListener('click',()=>send(p));chipbox.appendChild(b)})}
  function reset(){conversationVersion++;lastTopic='overview';lastYear=null;log.innerHTML='';bubble('Xin chào! Tôi là trợ lý Tử Vi AZONE STUDIO. Hãy tạo lá số rồi hỏi tổng quan, tài vận, công việc, tình cảm hoặc “năm 2027 thế nào?”. Tôi sẽ dùng đúng lá số đang mở và nhớ chủ đề trong cuộc trò chuyện này.\n\nTôi diễn giải theo quy tắc truyền thống; chưa kết nối mô hình AI và không tự học hay lưu hội thoại sau khi tải lại trang.','agent');suggestions()}
  let sending=false;
  async function send(value){
    const q=value.trim();if(!q||sending)return;
    const version=conversationVersion,chart=window.AZONE_ACTIVE_CHART; sending=true;input.value='';bubble(q,'user');const waiting=bubble('Đang xem lá số…','agent');$('#agentForm button').disabled=true;
    try{const rep=await respond(q);if(version!==conversationVersion)return;waiting.remove();if(chart!==window.AZONE_ACTIVE_CHART){bubble('Lá số đã thay đổi trong lúc trả lời. Hãy gửi lại câu hỏi để tôi đọc đúng lá số mới.','agent');return}bubble(rep.text,'agent');}
    catch(e){if(version===conversationVersion){waiting.remove();bubble(e.name==='TimeoutError'?'Tính toán mất nhiều thời gian. Anh/chị thử lại câu hỏi nhé.':e.message||'Chưa trả lời được lúc này. Anh/chị thử lại nhé.','agent');}}
    finally{sending=false;$('#agentForm button').disabled=false;}
  }
  function show(open){if(open){lastFocus=document.activeElement;panel.classList.add('open');panel.setAttribute('aria-hidden','false');launcher.setAttribute('aria-expanded','true');launcher.setAttribute('aria-label','Đóng trợ lý Tử Vi');setTimeout(()=>input.focus(),90)}else{panel.classList.remove('open');panel.setAttribute('aria-hidden','true');launcher.setAttribute('aria-expanded','false');launcher.setAttribute('aria-label','Mở trợ lý Tử Vi');(lastFocus&&lastFocus.focus?lastFocus:launcher).focus()}}
  launcher.addEventListener('click',()=>show(!panel.classList.contains('open')));$('#agentClose').addEventListener('click',()=>show(false));$('#agentClear').addEventListener('click',reset);$('#agentForm').addEventListener('submit',e=>{e.preventDefault();send(input.value)});input.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send(input.value)}});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&panel.classList.contains('open'))show(false)});reset();
})();
