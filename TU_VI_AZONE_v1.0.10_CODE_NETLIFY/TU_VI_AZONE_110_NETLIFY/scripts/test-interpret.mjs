import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { test } from 'node:test';
import { TOPICS, validateReadingInput, readingKey, extractRecord, translateReading } from '../lib/azone/interpret.ts';
const birth={year:1986,month:10,day:3,hour:3,gender:'male'};
function rawZstd(text){
  const bytes=Buffer.from(text),header=Buffer.alloc(9),block=Buffer.alloc(3);
  header.writeUInt32LE(0xfd2fb528);header[4]=0xa0;header.writeUInt32LE(bytes.length,5);
  block.writeUIntLE((bytes.length<<3)|1,0,3);return Buffer.concat([header,block,bytes]);
}
const row={k:readingKey(birth),y:1986,m:10,d:3,h:3,g:'male',c:Object.fromEntries(TOPICS.map(t=>[t,`原文 ${t} — dữ liệu kiểm thử`]))};
const bytes=rawZstd(JSON.stringify(row)+'\n'),sum=createHash('sha256').update(bytes).digest('hex');
test('rejects invalid Gregorian date, year, gender and branch',()=>{
  assert.deepEqual(validateReadingInput(birth),birth);
  for(const x of [null,{}, {...birth,month:2,day:30},{...birth,year:2027},{...birth,hour:12},{...birth,gender:'unknown'},{...birth,year:'1986'}])assert.throws(()=>validateReadingInput(x));
});
test('verifies compressed SHA256 before matching all identity fields',async()=>{
  assert.equal((await extractRecord(bytes,sum,birth)).c.overview,row.c.overview);
  assert.equal(await extractRecord(bytes,sum,{...birth,gender:'female'}),null);
  assert.equal(await extractRecord(bytes,sum,{...birth,hour:4}),null);
  await assert.rejects(extractRecord(bytes,'0'.repeat(64),birth));
});
test('missing a topic never becomes a claimed complete original',async()=>{
  const bad=structuredClone(row);delete bad.c.wealth;const b=rawZstd(JSON.stringify(bad)+'\n');
  await assert.rejects(extractRecord(b,createHash('sha256').update(b).digest('hex'),birth));
});
test('no translation key means original only and no external call',async()=>{
  assert.equal(await translateReading('中文',{},async()=>{throw Error('must not call')}),null);
});
test('translation sends only source text; original retained; truncation rejected',async()=>{
  const env={TRANSLATION_API_KEY:'test-fixture-only',TRANSLATION_MODEL:'fixture-model'};
  const translated=await translateReading('原文完整内容',env,async(url,opts)=>{
    const body=JSON.parse(opts.body);assert.equal(body.messages[1].content,'原文完整内容');assert.ok(!JSON.stringify(body).includes('1986-10-03'));
    return new Response(JSON.stringify({choices:[{finish_reason:'stop',message:{content:'Nội dung gốc đã được dịch.'}}]}));
  });assert.equal(translated,'Nội dung gốc đã được dịch.');
  await assert.rejects(translateReading('不完整文本',env,async()=>new Response(JSON.stringify({choices:[{finish_reason:'length',message:{content:'Thiếu'}}]}))));
});
