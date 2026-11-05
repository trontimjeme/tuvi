import { NextResponse } from 'next/server';
export const runtime = 'nodejs';
export async function GET() {
  return NextResponse.json({
    ready: true,
    engine: 'Renhuai123/ziwei-doushu · generateChart()',
    version: '1.0.10',
    dataset: 'v4.0-13d',
    online: true,
    notice: 'Tạo lá số hoạt động độc lập; luận giải tải theo năm khi yêu cầu.'
  }, { headers: { 'Cache-Control': 'no-store' } });
}
