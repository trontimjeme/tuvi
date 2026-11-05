import { NextRequest, NextResponse } from 'next/server';
import { toLunar } from '@/lib/vietnamese-calendar/vendor/astronomy/converter';
import { stringifyLunar } from '@/lib/vietnamese-calendar/vendor/utils/representation';

export async function GET(request: NextRequest) {
  const monthText = request.nextUrl.searchParams.get('month') ?? '';
  if (!/^\d{4}-\d{2}$/.test(monthText)) {
    return NextResponse.json({ error: 'Tháng phải có dạng YYYY-MM.' }, { status: 400 });
  }
  const [year, month] = monthText.split('-').map(Number);
  if (year < 1900 || year > 2100 || month < 1 || month > 12) {
    return NextResponse.json({ error: 'Chọn tháng 1–12, năm 1900–2100.' }, { status: 400 });
  }
  const count = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const days = Array.from({ length: count }, (_, i) => {
    const day = i + 1;
    const lunar = toLunar({ year, month, day, tz: 7 });
    return {
      date: `${monthText}-${String(day).padStart(2, '0')}`,
      day, weekday: new Date(Date.UTC(year, month - 1, day)).getUTCDay(),
      lunar: { day: lunar.day, month: lunar.month, year: lunar.year, leap: lunar.leap },
      text: stringifyLunar(lunar, true, 'vi'),
    };
  });
  return NextResponse.json({ year, month, timezone: 'Asia/Ho_Chi_Minh', days }, {
    headers: { 'Cache-Control': 'public, max-age=86400' },
  });
}
