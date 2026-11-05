import { NextRequest, NextResponse } from 'next/server';
import { mapChart } from '@/lib/azone/chart';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function POST(request: NextRequest) {
  try {
    if (Number(request.headers.get('content-length') ?? 0) > 12000) {
      return NextResponse.json({ error: 'Dữ liệu gửi quá lớn.' }, { status: 413 });
    }
    const data = await request.json();
    const result = mapChart(data);
    return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e: unknown) {
    const err = e as Error & { status?: number };
    const code = typeof err.status === 'number' && err.status >= 400 && err.status < 600 ? err.status : 400;
    return NextResponse.json({ error: String(err.message ?? 'Không lập được lá số.').slice(0, 250) }, { status: code });
  }
}
