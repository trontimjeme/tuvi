import { NextResponse } from 'next/server';
import { readUmamiConfig, fetchUmamiStats } from '@/lib/azone/analytics';
export const dynamic = 'force-dynamic';
let snapshot: { key: string; expires: number; request: ReturnType<typeof fetchUmamiStats> } | undefined;
export async function GET() {
  const headers = { 'Cache-Control': 'no-store' };
  try {
    const config = readUmamiConfig();
    if (!config?.token) return NextResponse.json({ status: 'not_configured' }, { headers });
    const key = `${config.baseUrl}|${config.websiteId}|${config.token}`;
    if (!snapshot || snapshot.key !== key || snapshot.expires <= Date.now()) {
      snapshot = { key, expires: Date.now() + 15000, request: fetchUmamiStats(config) };
    }
    const stats = await snapshot.request;
    return NextResponse.json({ status: 'ready', ...stats }, { headers });
  } catch {
    snapshot = undefined;
    // Do not expose provider error bodies, credentials or visitor-level data.
    return NextResponse.json({ status: 'unavailable' }, { status: 503, headers });
  }
}
