import {readFileSync,existsSync} from 'node:fs';
const files=['public/site/index.html','public/site/agent.js','public/site/agent.css','public/site/azone-studio-project.webp','public/site/azone-bot.png','app/api/chart/route.ts','app/api/interpret/route.ts','lib/azone/chart.ts','lib/ziwei/algorithm.ts'];
for(const f of files) if(!existsSync(f)) throw Error('Missing '+f);
const page=readFileSync('public/site/index.html','utf8');
for(const id of ['birthForm','chartBoard','loadReading','engineStatus']) if(!page.includes(`id="${id}"`))throw Error('Missing HTML element '+id);
console.log('AZONE static smoke: required files and UI integration points present');
