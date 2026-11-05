/** AZONE display mapping wraps the UNMODIFIED upstream charting engine. */
import { generateChart } from '@/lib/ziwei/algorithm';
import { calculateTrueSolarTime, resolveZiweiDayOffset, shiftGregorianDate } from '@/lib/ziwei/true-solar-time';
import { Lunar } from 'lunar-javascript';

const chiVN = ['Tý','Sửu','Dần','Mão','Thìn','Tỵ','Ngọ','Mùi','Thân','Dậu','Tuất','Hợi'];
const stars: Record<string,string> = {
 '紫微':'Tử Vi','天机':'Thiên Cơ','太阳':'Thái Dương','武曲':'Vũ Khúc','天同':'Thiên Đồng','廉贞':'Liêm Trinh','天府':'Thiên Phủ','太阴':'Thái Âm','贪狼':'Tham Lang','巨门':'Cự Môn','天相':'Thiên Tướng','天梁':'Thiên Lương','七杀':'Thất Sát','破军':'Phá Quân',
 '左辅':'Tả Phù','右弼':'Hữu Bật','文昌':'Văn Xương','文曲':'Văn Khúc','天魁':'Thiên Khôi','天钺':'Thiên Việt','禄存':'Lộc Tồn','天马':'Thiên Mã','擎羊':'Kình Dương','陀罗':'Đà La','火星':'Hỏa Tinh','铃星':'Linh Tinh','地空':'Địa Không','地劫':'Địa Kiếp','红鸾':'Hồng Loan','天喜':'Thiên Hỷ','天刑':'Thiên Hình','天姚':'Thiên Diêu','天哭':'Thiên Khốc','天虚':'Thiên Hư','孤辰':'Cô Thần','寡宿':'Quả Tú','咸池':'Hàm Trì','白虎':'Bạch Hổ','天空':'Thiên Không','解神':'Giải Thần','华盖':'Hoa Cái','天才':'Thiên Tài','天寿':'Thiên Thọ','龙池':'Long Trì','凤阁':'Phượng Các','台辅':'Đài Phụ','封诰':'Phong Cáo','天福':'Thiên Phúc','天官':'Thiên Quan','旬空':'Tuần Không','截空':'Triệt Không'
};
const palais: Record<string,string> = {'命宫':'Mệnh','命':'Mệnh','兄弟':'Huynh Đệ','夫妻':'Phu Thê','子女':'Tử Tức','财帛':'Tài Bạch','疾厄':'Tật Ách','迁移':'Thiên Di','仆役':'Nô Bộc','交友':'Nô Bộc','官禄':'Quan Lộc','田宅':'Điền Trạch','福德':'Phúc Đức','父母':'Phụ Mẫu'};
const translate=(s:string)=>stars[s] || s;
function palaceVN(n:string){let k=String(n||'').replace(/宫$/,'');return palais[k] || palais[n] || n;}
const geo:Record<string,number>={'Thái Nguyên':105.845,'Hà Nội':105.854,'Bắc Ninh':106.075,'Hải Phòng':106.682,'Đà Nẵng':108.22,'Huế':107.59,'TP. Hồ Chí Minh':106.702,'Cần Thơ':105.78};
function err(msg:string,status=400){return Object.assign(new Error(msg),{status});}
function validDate(y:number,m:number,d:number){const q=new Date(Date.UTC(y,m-1,d));return q.getUTCFullYear()===y&&q.getUTCMonth()+1===m&&q.getUTCDate()===d;}
function stringIn(v:any,max=90){return String(v??'').slice(0,max).trim();}
function inputToChart(o:any){
  let [y,m,d]=String(o.birthdate||'').split('-').map(Number);
  const calendar=o.calendar==='lunar'?'lunar':'solar';
  if(!Number.isInteger(y)||y<1900||y>2100||!Number.isInteger(m)||m<1||m>12||!Number.isInteger(d)||d<1||d>31)throw err('Ngày sinh không hợp lệ (năm 1900–2100).');
  const origDate={year:y,month:m,day:d};
  if(calendar==='lunar'){
    try{const lunar=Lunar.fromYmd(y,o.leapMonth?-m:m,d);const solar=lunar.getSolar();y=solar.getYear();m=solar.getMonth();d=solar.getDay();}catch{throw err('Ngày âm lịch không hợp lệ hoặc tháng nhuận không tồn tại.');}
  }
  if(!validDate(y,m,d))throw err('Ngày sinh không tồn tại trong lịch.');
  const [hour,minute]=String(o.birthtime||'').split(':').map(Number);
  if(!Number.isInteger(hour)||hour<0||hour>23||!Number.isInteger(minute)||minute<0||minute>59)throw err('Giờ sinh phải có định dạng HH:MM.');
  if(o.gender!=='male'&&o.gender!=='female')throw err('Giới tính không hợp lệ.');
  const place=stringIn(o.birthplace,90),longitude=geo[place];
  // Vietnam standard time is UTC+7 -> 105E, unlike the Chinese UTC+8 baseline.
  // For unrecognized birthplaces, leave longitude undefined rather than invent a correction.
  const solar=calculateTrueSolarTime({year:y,month:m,day:d,clockHour:hour,clockMinute:minute,...(longitude?{longitude,utcOffsetMinutes:420}:{})});
  const shift=resolveZiweiDayOffset(solar);
  const corrected=shiftGregorianDate({year:y,month:m,day:d},shift);
  const birthInfo={...corrected,hour:solar.branch,gender:o.gender,name:stringIn(o.name),province:place,city:place,...(longitude?{longitude}:{}),origInput:{year:y,month:m,day:d,clockHour:hour,clockMinute:minute}};
  return {birthInfo,calendar,original:origDate,gregorian:{year:y,month:m,day:d},trueSolar:{clock:`${String(solar.hour).padStart(2,'0')}:${String(solar.minute).padStart(2,'0')}`,branch:solar.branch,dayShift:shift,corrected:solar.corrected}};
}
function mapChart(o:any){const x=inputToChart(o), chart=generateChart(x.birthInfo);
  const p=chart.palaces.map(c=>({branch:c.branch,chi:chiVN[c.branch],name:palaceVN(c.name),stem:c.stem,stars:c.stars.map(s=>({original:s.name,name:translate(s.name),type:s.type,brightness:s.brightnessRaw||null,siHua:s.siHua||null})),daXianAge:c.daXianAge||null,isMingGong:c.isMingGong||false,isShenGong:c.isShenGong||false,oppositeBranch:c.oppositeBranch}));
  if(p.length!==12||new Set(p.map(v=>v.branch)).size!==12)throw err('Thuật toán trả dữ liệu 12 cung không hợp lệ.',500);
  return {chart:{palaces:p,mingGongBranch:chart.mingGongBranch,shenGongBranch:chart.shenGongBranch,wuxingJuName:chart.wuxingJuName,mingZhu:translate(chart.mingZhu||''),shenZhu:translate(chart.shenZhu||''),yinYangGender:chart.yinYangGender,lunarInfo:chart.lunarInfo,daXians:chart.daXians.map(z=>({startAge:z.startAge,endAge:z.endAge,palaceBranch:z.palaceBranch,palaceName:palaceVN(z.palaceName),stemIndex:z.stemIndex,siHua:z.siHua})),currentDaXianIndex:chart.currentDaXianIndex,currentAge:chart.currentAge,birthInfo:chart.birthInfo},params:{birthYear:x.birthInfo.year,month:x.birthInfo.month,day:x.birthInfo.day,hour:x.birthInfo.hour,gender:x.birthInfo.gender},meta:{...x,trueSolar:x.trueSolar,engine:'Renhuai123/ziwei-doushu · generateChart()'}};
}

export { mapChart };
