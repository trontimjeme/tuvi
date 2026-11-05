import { NextRequest, NextResponse } from 'next/server';
import { mapAnnual } from '@/lib/azone/chart';
export const runtime = 'nodejs';
export async function POST(request: NextRequest) {
  try {
    const text = await request.text();
    if (new TextEncoder().encode(text).length > 12000) {
      return NextResponse.json({error:'Dữ liệu gửi quá lớn.'},{status:413});
    }
    let data;
    try { data = JSON.parse(text); } catch {
      return NextResponse.json({error:'Dữ liệu gửi phải là JSON hợp lệ.'},{status:400});
    }
    if (!data || typeof data !== 'object' || Array.isArray(data) || !data.birth || typeof data.birth !== 'object' || Array.isArray(data.birth)) {
      return NextResponse.json({error:'Cần cung cấp thông tin ngày, giờ sinh và năm muốn xem.'},{status:400});
    }
    return NextResponse.json(mapAnnual(data.birth, data.year),{headers:{'Cache-Control':'no-store'}});
  } catch(e:unknown) {
    const error=e as Error & {status?:number};
    return NextResponse.json({error:(error.message||'Không tính được năm cần xem.').slice(0,180)},{status:error.status===500?500:400});
  }
}
