/**
 * OPTIONAL online on-demand reader for v4.0-13d.
 * NOTE: Each year decompresses to roughly 700 MB and Netlify executions may
 * time out; for production/many concurrent users build an indexed database.
 * No user birth data is stored here. Source is kept fully attributable.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'node:crypto';
import { Decompress } from 'fzstd';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;
const ROOT = 'https://github.com/Renhuai123/ziwei-doushu/releases/download/v4.0-13d';
type Input = { year: number; month: number; day: number; hour: number; gender: 'male'|'female' };
const resultCache = new Map<string, Record<string, unknown>>();
const safeDate = (y: number, m: number, d: number) => {
  if (![y,m,d].every(Number.isInteger)) return false;
  const t=new Date(Date.UTC(y,m-1,d));
  return t.getUTCFullYear()===y && t.getUTCMonth()===m-1 && t.getUTCDate()===d;
};
function validate(x: any): Input {
  const y=Number(x.year),m=Number(x.month),d=Number(x.day),h=Number(x.hour),g=x.gender;
  if (!safeDate(y,m,d)||!Number.isInteger(h)||h<0||h>11||!['male','female'].includes(g)) throw new Error('Ngày sinh / giờ địa chi / giới tính không hợp lệ.');
  if(y<1950||y>2026) throw new Error('Dữ liệu luận giải v4.0 chỉ bao gồm năm sinh 1950–2026.');
  return {year:y,month:m,day:d,hour:h,gender:g};
}
function matchesGender(value:unknown, goal:string){
  const s=String(value).toLowerCase();
  return goal==='male'?['male','m','男','1'].includes(s):['female','f','女','0'].includes(s);
}
async function fetchText(url:string, signal:AbortSignal){
  const r=await fetch(url,{signal,cache:'no-store',headers:{'User-Agent':'AZONE-Ziwei/1.0.9'}});
  if(!r.ok)throw new Error(`Code từ chối tải tệp xác thực (HTTP ${r.status}).`);
  return r.text();
}
const cacheGlobal = globalThis as typeof globalThis & {__AZONE_CHECKSUMS__?:string};
async function lookupRecord(q:Input, signal:AbortSignal){
  const name=`year-${q.year}.jsonl.zst`;
  const sums=cacheGlobal.__AZONE_CHECKSUMS__ ?? await fetchText(`${ROOT}/SHA256SUMS.txt`,signal);
  cacheGlobal.__AZONE_CHECKSUMS__=sums;
  const row=sums.split(/\r?\n/).find(line=>new RegExp(`(?:^|\\s)${name.replaceAll('.','\\.')}\\s*$`).test(line));
  const expected=row?.match(/[a-fA-F0-9]{64}/)?.[0]?.toLowerCase();
  if(!expected)throw new Error('Không tìm thấy SHA-256 xác minh tệp từ Code.');
  const result=await fetch(`${ROOT}/${name}`,{signal,cache:'no-store',headers:{'User-Agent':'AZONE-Ziwei/1.0.9'}});
  if(!result.ok||!result.body)throw new Error(`Không tải được dữ liệu năm ${q.year} (HTTP ${result.status}).`);
  const parts:Uint8Array[]=[];
  const hash=createHash('sha256');
  let total=0;
  const reader=result.body.getReader();
  while(true){
    const {done,value}=await reader.read();
    if(done)break;
    total+=value.length;
    if(total>10_000_000)throw new Error('Tệp nén có kích thước vượt mức dự kiến.');
    hash.update(value);parts.push(value);
  }
  if(hash.digest('hex')!==expected)throw new Error('SHA-256 không hợp lệ: dữ liệu có thể bị sai.');

  let found:Record<string,unknown>|null=null;
  let buffer='';
  const decoder=new TextDecoder('utf-8');
  // Pre-filter strings before JSON.parse to avoid parsing hundreds of MB of
  // unrelated interpretations; only then validate all fields strictly.
  const mRe=new RegExp(`"m"\\s*:\\s*${q.month}(?=[,}])`);
  const dRe=new RegExp(`"d"\\s*:\\s*${q.day}(?=[,}])`);
  const hRe=new RegExp(`"h"\\s*:\\s*${q.hour}(?=[,}])`);
  const scan=(line:string)=>{
    if(found||!mRe.test(line)||!dRe.test(line)||!hRe.test(line))return;
    try {
      const rec=JSON.parse(line);
      if(Number(rec.y)===q.year&&Number(rec.m)===q.month&&Number(rec.d)===q.day&&Number(rec.h)===q.hour&&matchesGender(rec.g,q.gender)){
        found=rec;
      }
    }catch{/* ignore corrupted unrelated records */}
  };
  const decomp=new Decompress((chunk:Uint8Array, final:boolean)=>{
    if(found)return;
    buffer+=decoder.decode(chunk,{stream:!final});
    let pos;
    while((pos=buffer.indexOf('\n'))>=0){
      scan(buffer.slice(0,pos));
      buffer=buffer.slice(pos+1);
      if(found){buffer='';return;}
      if(buffer.length>12_000_000)throw new Error('Tệp dữ liệu có bản ghi lớn bất thường.');
    }
  });
  // Chunked input keeps peak memory lower than decoding a 700MB text array.
  for(const part of parts){
    for(let i=0;i<part.length&&!found;i+=32768){
      if(signal.aborted)throw new Error('Hết thời gian tải/giải nén dữ liệu năm.');
      decomp.push(part.subarray(i,i+32768),false);
    }
    if(found)break;
  }
  if(!found){decomp.push(new Uint8Array(),true);if(buffer)scan(buffer);}
  return found;
}
export async function POST(request:NextRequest){
  try {
    if(Number(request.headers.get('content-length')||0)>4000) return NextResponse.json({error:'Dữ liệu đầu vào quá lớn.'},{status:413});
    const q=validate(await request.json());
    const key=JSON.stringify(q);
    let row=resultCache.get(key);
    if(!row){
      const timeout=new AbortController();
      const timer=setTimeout(()=>timeout.abort(),45000);
      try{row=(await lookupRecord(q,timeout.signal))??undefined;}finally{clearTimeout(timer);}
      if(row){resultCache.set(key,row);if(resultCache.size>12)resultCache.delete(resultCache.keys().next().value!);}
    }
    if(!row)return NextResponse.json({found:false,notice:'Không tìm thấy bản ghi đúng thông tin trong dữ liệu v4.0.'});
    return NextResponse.json({found:true,year:q.year,readings:row.c,topics:row.t??null,source:'ziwei-doushu · v4.0-13d · CC BY 4.0',notice:'Đây là bản gốc tiếng Trung. Trích dẫn từ các bài giảng của tác giả khác có giấy phép riêng; nội dung chỉ mang tính nghiên cứu văn hóa.'},{headers:{'Cache-Control':'no-store'}});
  } catch(e:unknown){
    const text=String(e instanceof Error?e.message:e).slice(0,230);
    return NextResponse.json({error:text||'Không thể lấy luận giải từ kho Code trong lần này. Hãy thử lại hoặc sử dụng cơ sở dữ liệu đã lập chỉ mục.'},{status:503});
  }
}
