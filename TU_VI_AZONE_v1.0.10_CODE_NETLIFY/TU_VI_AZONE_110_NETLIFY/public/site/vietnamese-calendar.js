/* Calendar UI: local UTC+7 conversion API, hnthap/lunar-calendar-api (MIT). */
(()=>{
  'use strict';
  const $=s=>document.querySelector(s),grid=$('#calendarGrid');if(!grid)return;
  const month=$('#calendarMonth'),year=$('#calendarYear'),detail=$('#calendarDetail');
  const localParts=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
  const today=Object.fromEntries(localParts.filter(p=>p.type!=='literal').map(p=>[p.type,p.value]));
  const todayISO=`${today.year}-${today.month}-${today.day}`;
  let selected=todayISO,serial=0;
  for(let i=1;i<=12;i++){const o=document.createElement('option');o.value=i;o.textContent=`Tháng ${i}`;month.appendChild(o)}
  month.value=Number(today.month);year.value=today.year;
  function showDay(day){
    selected=day.date;
    grid.querySelectorAll('.calendar-day').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.date===selected)));
    const date=new Date(`${day.date}T12:00:00+07:00`);
    detail.textContent=`${new Intl.DateTimeFormat('vi-VN',{timeZone:'Asia/Ho_Chi_Minh',weekday:'long'}).format(date)}, ${String(day.day).padStart(2,'0')}/${String(month.value).padStart(2,'0')}/${year.value} — Âm lịch: ${day.text}.`;
  }
  async function load(){
    const y=Number(year.value),m=Number(month.value),token=++serial;
    if(!Number.isInteger(y)||y<1900||y>2100){grid.replaceChildren();detail.textContent='Vui lòng chọn năm từ 1900 đến 2100.';return}
    $('#calendarPrev').disabled=y===1900&&m===1;$('#calendarNext').disabled=y===2100&&m===12;
    grid.replaceChildren();grid.setAttribute('aria-busy','true');detail.textContent='Đang tải lịch…';
    try{
      const response=await fetch(`/api/calendar?month=${y}-${String(m).padStart(2,'0')}`);
      const data=await response.json();if(token!==serial)return;
      if(!response.ok)throw Error(data.error||'Không tải được lịch.');
      for(const label of ['T2','T3','T4','T5','T6','T7','CN']){const e=document.createElement('span');e.className='calendar-weekday';e.textContent=label;grid.appendChild(e)}
      for(let i=0;i<(data.days[0].weekday+6)%7;i++){const e=document.createElement('span');e.setAttribute('aria-hidden','true');grid.appendChild(e)}
      for(const day of data.days){
        const b=document.createElement('button');b.type='button';b.className='calendar-day'+(day.weekday===0?' sunday':'')+(day.date===todayISO?' today':'');b.dataset.date=day.date;b.setAttribute('aria-pressed','false');
        b.setAttribute('aria-label',`${day.day}/${m}/${y}, âm lịch ${day.lunar.day}/${day.lunar.month}${day.lunar.leap?' nhuận':''}`);
        const solar=document.createElement('strong'),lunar=document.createElement('small');solar.textContent=day.day;lunar.textContent=`${day.lunar.day}${day.lunar.day===1?'/'+day.lunar.month:''}${day.lunar.leap?'n':''}`;
        b.append(solar,lunar);b.addEventListener('click',()=>showDay(day));grid.appendChild(b);
      }
      showDay(data.days.find(d=>d.date===selected)||data.days[0]);
    }catch(e){if(token===serial){grid.replaceChildren();detail.textContent=e.message||'Không tải được lịch. Hãy chọn lại tháng để thử lại.'}}
    finally{if(token===serial)grid.setAttribute('aria-busy','false')}
  }
  function move(delta){const date=new Date(Date.UTC(Number(year.value),Number(month.value)-1+delta,1));if(date.getUTCFullYear()<1900||date.getUTCFullYear()>2100)return;year.value=date.getUTCFullYear();month.value=date.getUTCMonth()+1;load()}
  $('#calendarPrev').addEventListener('click',()=>move(-1));$('#calendarNext').addEventListener('click',()=>move(1));
  month.addEventListener('change',load);year.addEventListener('change',load);
  $('#calendarToday').addEventListener('click',()=>{year.value=today.year;month.value=Number(today.month);selected=todayISO;load()});load();
})();
