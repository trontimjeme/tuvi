/* Official Umami tracker + aggregate-only footer. No birth information is sent. */
(()=>{
  'use strict';
  const panel=document.querySelector('#trafficStats');if(!panel)return;
  const status=panel.querySelector('.traffic-status');
  const counters={activeVisitors:panel.querySelector('[data-stat="active"]'),visitorsToday:panel.querySelector('[data-stat="visitors"]'),pageviewsToday:panel.querySelector('[data-stat="views"]')};
  const format=new Intl.NumberFormat('vi-VN');let busy=false;
  function reset(message){Object.values(counters).forEach(e=>e.textContent='—');status.textContent=message;panel.classList.remove('traffic-ready')}
  async function refresh(){
    if(busy||document.hidden)return;busy=true;
    try{
      const r=await fetch('/api/analytics/stats',{cache:'no-store',signal:AbortSignal.timeout(10000)}),data=await r.json();
      if(data.status==='not_configured'){reset('Chưa kết nối thống kê');return}
      if(!r.ok||data.status!=='ready')throw Error();
      for(const key of Object.keys(counters))if(!Number.isSafeInteger(data[key])||data[key]<0)throw Error();
      for(const [key,e] of Object.entries(counters))e.textContent=format.format(data[key]);
      status.textContent='Umami · Cập nhật '+new Intl.DateTimeFormat('vi-VN',{timeZone:'Asia/Ho_Chi_Minh',hour:'2-digit',minute:'2-digit'}).format(new Date(data.updatedAt));panel.classList.add('traffic-ready');
    }catch{reset('Thống kê tạm thời chưa khả dụng')}finally{busy=false}
  }
  async function start(){
    try{
      const r=await fetch('/api/analytics/config',{signal:AbortSignal.timeout(10000)}),config=await r.json();
      if(r.ok&&config.configured){
        const script=document.createElement('script');script.src=config.scriptUrl;script.defer=true;script.dataset.websiteId=config.websiteId;
        // Track page traffic only: exclude birth form fields, query strings and URL hashes.
        script.dataset.excludeSearch='true';script.dataset.excludeHash='true';script.dataset.doNotTrack='true';
        document.head.appendChild(script);
      }
    }catch{/* Analytics must never block chart generation. */}
    refresh();setInterval(refresh,30000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});
  }
  start();
})();
