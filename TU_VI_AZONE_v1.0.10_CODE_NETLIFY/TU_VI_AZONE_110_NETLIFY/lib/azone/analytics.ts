/** Server-side Umami adapter. Never send the API token to the browser. */
type Environment = Record<string, string | undefined>;
export type UmamiConfig = { baseUrl: string; websiteId: string; token: string };
export function readUmamiConfig(env: Environment = process.env): UmamiConfig | null {
  const base = env.UMAMI_URL?.trim(), websiteId = env.UMAMI_WEBSITE_ID?.trim();
  if (!base || !websiteId) return null;
  const url = new URL(base);
  if (url.username || url.password || url.search || url.hash ||
    !['https:', 'http:'].includes(url.protocol)) throw Error('Invalid Umami URL');
  if (url.protocol === 'http:' && !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) {
    throw Error('Umami requires HTTPS');
  }
  if (!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(websiteId)) {
    throw Error('Invalid Umami Website ID');
  }
  return { baseUrl: url.href.replace(/\/$/, ''), websiteId, token: env.UMAMI_API_TOKEN?.trim() ?? '' };
}
export function vietnamDayStart(now: number): number {
  const local = new Date(now + 7 * 3600000);
  return Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate()) - 7 * 3600000;
}
function count(value: unknown): number {
  // Umami v2 returns { value: n }; v3 returns the number directly.
  const n = typeof value === 'object' && value !== null && 'value' in value ? value.value : value;
  if (typeof n !== 'number' || !Number.isSafeInteger(n) || n < 0) throw Error('Invalid Umami count');
  return n;
}
export async function fetchUmamiStats(config: UmamiConfig, now = Date.now()) {
  if (!config.token) throw Error('Missing read credential');
  const prefix = `${config.baseUrl}/api/websites/${config.websiteId}`;
  const query = new URLSearchParams({ startAt: String(vietnamDayStart(now)), endAt: String(now), timezone: 'Asia/Ho_Chi_Minh' });
  const read = async (url: string) => {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${config.token}`, Accept: 'application/json' },
      signal: AbortSignal.timeout(8000), redirect: 'error', cache: 'no-store',
    });
    if (!response.ok) throw Error('Umami request failed');
    return response.json();
  };
  const [active, stats] = await Promise.all([read(`${prefix}/active`), read(`${prefix}/stats?${query}`)]);
  return {
    activeVisitors: count(active.visitors), visitorsToday: count(stats.visitors),
    pageviewsToday: count(stats.pageviews), updatedAt: new Date(now).toISOString(),
    timezone: 'Asia/Ho_Chi_Minh', activeWindowMinutes: 5,
  };
}
