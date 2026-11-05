import assert from 'node:assert/strict';
const base = process.argv[2] ?? 'http://127.0.0.1:3000';
const birth={birthdate:'1986-10-03',birthtime:'06:30',gender:'male',birthplace:''};
async function annual(payload){return fetch(`${base}/api/annual`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});}
const a=await annual({birth,year:2027}),b=await annual({birth,year:2028});
assert.equal(a.status,200);assert.equal(b.status,200);
const y27=await a.json(),y28=await b.json();
assert.equal(y27.yearName,'Đinh Mùi');assert.equal(y27.age,42);assert.equal(y27.yearConvention,'lunar-year');
assert.deepEqual(y27.transforms.map(t=>t.star),['Thái Âm','Thiên Đồng','Thiên Cơ','Cự Môn']);
assert.deepEqual(y27.transforms.map(t=>t.palace),['Mệnh','Mệnh','Quan Lộc','Phúc Đức']);
assert.equal(y27.daXian.palace,'Điền Trạch');assert.notDeepEqual(y27.transforms,y28.transforms);
const child=await (await annual({birth:{...birth,birthdate:'2026-05-24',birthtime:'10:00'},year:2027})).json();
assert.equal(child.age,2);assert.equal(child.childhood,true);assert.equal(child.daXian,null);
for(const payload of [null,{},[],{birth:null,year:2027},{birth,year:1899},{birth,year:2201},{birth,year:1985},{birth,year:'2027'},{birth,year:2027.5}]){
  const r=await annual(payload);assert.equal(r.status,400);assert.equal(typeof (await r.json()).error,'string');
}
const invalid=await fetch(`${base}/api/annual`,{method:'POST',body:'not-json'});assert.equal(invalid.status,400);
console.log('Annual smoke: 2027 facts, 2028 difference, childhood and invalid inputs passed.');
