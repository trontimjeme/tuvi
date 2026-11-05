import assert from 'node:assert/strict';
const base = process.argv[2] ?? 'http://127.0.0.1:3000';
const cases = [
  ['2026-02-17', {year:2026,month:1,day:1,leap:false}],
  ['2026-05-24', {year:2026,month:4,day:8,leap:false}],
  ['2023-03-22', {year:2023,month:2,day:1,leap:true}],
  // Vietnam's UTC+7 Tet in 1968 precedes the UTC+8 calendar date.
  ['1968-01-29', {year:1968,month:1,day:1,leap:false}],
];
for (const [date, expected] of cases) {
  const response = await fetch(`${base}/api/calendar?month=${date.slice(0,7)}`);
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(data.timezone, 'Asia/Ho_Chi_Minh');
  assert.deepEqual(data.days.find(day => day.date === date)?.lunar, expected);
}
for (const month of ['2026-13', '1899-12', '2026-2', 'abc']) {
  assert.equal((await fetch(`${base}/api/calendar?month=${month}`)).status, 400);
}
console.log('Calendar smoke: Tet, leap month, Vietnam timezone and invalid dates passed.');
