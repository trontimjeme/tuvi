/** Exact-record retrieval from the checksum-verified original release. */
import { NextRequest, NextResponse } from 'next/server';
import { getOriginalRecord, translateReading, validateReadingInput, TOPICS, type Topic } from '@/lib/azone/interpret';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export const maxDuration=60;
export async function POST(request:NextRequest){
  const headers={'Cache-Control':'no-store'};
  let data;
  try{
    const text=await request.text();if(new TextEncoder().encode(text).length>4000)return NextResponse.json({error:'Dữ liệu đầu vào quá lớn.'},{status:413,headers});
    data=JSON.parse(text);
  }catch{return NextResponse.json({error:'Dữ liệu đầu vào phải là JSON hợp lệ.'},{status:400,headers});}
  let q,topic:Topic;
  try{q=validateReadingInput(data);topic=data.topic??'overview';if(!TOPICS.includes(topic))throw Error('Chủ đề luận giải không hợp lệ.');}
  catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Thông tin lá số không hợp lệ.'},{status:400,headers});}
  try{
    const row=await getOriginalRecord(q);
    if(!row)return NextResponse.json({found:false,notice:'Không tìm thấy bản ghi khớp chính xác với lá số này.'},{headers});
    let translation:string|null=null,status:'ready'|'not_configured'|'unavailable'='not_configured';
    try{translation=await translateReading(row.c[topic]);if(translation)status='ready';}catch{status='unavailable';}
    return NextResponse.json({found:true,key:row.k,year:q.year,originalReadings:row.c,readings:translation?{[topic]:translation}:{},language:translation?'vi':'zh',translation:{status,topic},
      source:'Bộ luận giải v4.0-13d · 王多鱼AI · CC BY 4.0',
      notice:'Bản gốc tiếng Trung được giữ nguyên; bản tiếng Việt là bản dịch máy khi có dịch vụ dịch. Trích dẫn bên trong có thể có giấy phép riêng. Nội dung là quan niệm truyền thống, không bảo đảm dự báo.'},{headers});
  }catch{return NextResponse.json({error:'Chưa truy xuất được dữ liệu gốc đã xác minh. Vui lòng thử lại sau.'},{status:503,headers});}
}
