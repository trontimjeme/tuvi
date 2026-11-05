import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { after, before, test } from 'node:test';
import { readUmamiConfig, fetchUmamiStats, vietnamDayStart } from '../lib/azone/analytics.ts';

const websiteId = '00000000-0000-4000-8000-000000000001';
const fixtureToken = 'test-fixture-not-a-real-token';
let server, baseUrl, mode = 'v3';
const requests = [];
before(async () => {
  server = createServer((req, res) => {
    requests.push({ url: req.url, authorization: req.headers.authorization });
    assert.equal(req.headers.authorization, `Bearer ${fixtureToken}`);
    res.setHeader('Content-Type', 'application/json');
    if (mode === 'denied') { res.writeHead(401); res.end('{"error":"fixture"}'); return; }
    if (req.url.endsWith('/active')) res.end(JSON.stringify({visitors:mode==='invalid'?-1:4}));
    else res.end(JSON.stringify(mode==='v2'?{visitors:{value:12},pageviews:{value:34}}:{visitors:12,pageviews:34}));
  });
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});
after(() => new Promise(resolve => server.close(resolve)));
test('missing configuration stays disconnected', () => {
  assert.equal(readUmamiConfig({}), null);
});
test('rejects malformed public config and credentials in URL', () => {
  for (const url of ['javascript:alert(1)', 'https://user:pass@example.com', 'http://example.com']) {
    assert.throws(() => readUmamiConfig({ UMAMI_URL:url,UMAMI_WEBSITE_ID:websiteId }));
  }
  assert.throws(()=>readUmamiConfig({UMAMI_URL:'https://example.com',UMAMI_WEBSITE_ID:'bad-id'}));
});
test('today begins at Vietnam midnight, including UTC date boundary', () => {
  assert.equal(new Date(vietnamDayStart(Date.parse('2026-05-23T18:00:00Z'))).toISOString(),'2026-05-23T17:00:00.000Z');
});
test('reads authenticated v3 aggregates with correct date range', async () => {
  mode='v3'; const now=Date.parse('2026-05-24T03:00:00Z');
  const stats=await fetchUmamiStats({baseUrl,websiteId,token:fixtureToken},now);
  assert.equal(stats.activeVisitors,4);assert.equal(stats.visitorsToday,12);assert.equal(stats.pageviewsToday,34);
  assert.equal(stats.activeWindowMinutes,5);assert.ok(!JSON.stringify(stats).includes(fixtureToken));
  const url=new URL(requests.find(r=>r.url.includes('/stats?')).url,baseUrl);
  assert.equal(url.searchParams.get('startAt'),String(Date.parse('2026-05-23T17:00:00Z')));
  assert.equal(url.searchParams.get('endAt'),String(now));
});
test('supports Umami v2 value objects', async()=>{
  mode='v2';const stats=await fetchUmamiStats({baseUrl,websiteId,token:fixtureToken});assert.equal(stats.pageviewsToday,34);
});
test('does not turn authorization failure or invalid counts into zero', async()=>{
  mode='denied';await assert.rejects(fetchUmamiStats({baseUrl,websiteId,token:fixtureToken}));
  mode='invalid';await assert.rejects(fetchUmamiStats({baseUrl,websiteId,token:fixtureToken}));
  await assert.rejects(fetchUmamiStats({baseUrl,websiteId,token:''}));
});
