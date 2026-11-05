import { NextResponse } from 'next/server';
import { readUmamiConfig } from '@/lib/azone/analytics';
export const dynamic = 'force-dynamic';
export async function GET() {
  try {
    const config = readUmamiConfig();
    return NextResponse.json(config ? {
      configured: true, websiteId: config.websiteId, scriptUrl: `${config.baseUrl}/script.js`,
    } : { configured: false }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ configured: false }, { headers: { 'Cache-Control': 'no-store' } });
  }
}
