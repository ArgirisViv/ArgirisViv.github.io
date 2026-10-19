'use strict';
const $=s=>document.querySelector(s),$$=s=>document.querySelectorAll(s);
const root=document.documentElement;
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine=matchMedia('(hover: hover) and (pointer: fine)').matches;
const EMAIL='argirisvivelis@gmail.com';
const esc=s=>String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m]);

/* ---------- Theme ---------- */
const isDark=()=>root.dataset.theme?root.dataset.theme==='dark':matchMedia('(prefers-color-scheme: dark)').matches;
$('#theme').addEventListener('click',()=>{
  const t=isDark()?'light':'dark';root.dataset.theme=t;
  try{localStorage.setItem('theme',t)}catch(e){}
  readColors();
});

/* ---------- Name decrypt (load moment) ---------- */
(function decrypt(){
  if(reduce)return;
  const glyphs='01<>/\\{}[]#$%&*+=?ABCDEFXYZ';
  $$('.name .l').forEach((el,li)=>{
    const final=el.dataset.text;let frame=0;const start=8+li*6,per=2.2;
    el.classList.add('scr');
    (function tick(){
      let out='',done=true;
      for(let i=0;i<final.length;i++){
        const reveal=start+i*per;
        if(frame>=reveal)out+=final[i];
        else{done=false;out+=glyphs[(Math.random()*glyphs.length)|0]}
      }
      el.textContent=out;frame++;
      if(done){el.classList.remove('scr');el.textContent=final}else requestAnimationFrame(tick);
    })();
  });
})();

/* ---------- SOC log stream background ---------- */
const cv=$('#net'),ctx=cv.getContext('2d');
const LH=20,FS=12,REACH=130,ZOOM=1.65,COLW=560,GAP=40;
let BG='#050e1c',W=0,H=0,cols=[],mouse={x:-9999,y:-9999},NET='124,196,255',SIG='255,181,71',MONO='monospace',running=true,clock=Date.now();
const r=n=>(Math.random()*n)|0,pick=a=>a[r(a.length)];
const IP=()=>pick(['192.0.2.','198.51.100.','203.0.113.'])+(r(250)+2),LAN=()=>'10.0.'+r(9)+'.'+(r(240)+10);
const EV=[
  ['INFO','auth',()=>`login ok user=${pick(['admin','svc-backup','argiris','analyst'])} src=${LAN()} mfa=true`],
  ['INFO','tls',()=>`handshake ok TLSv1.3 ${pick(['TLS_AES_128_GCM_SHA256','TLS_CHACHA20_POLY1305_SHA256'])} peer=${IP()}`],
  ['INFO','dns',()=>`query A ${pick(['api.internal','updates.vendor.example','mail.example.org','cdn.example.net'])} -> NOERROR`],
  ['INFO','ci',()=>`pipeline #${r(900)+100} passed tests=${r(300)+120} sast=clean`],
  ['WARN','auth',()=>`failed login user=${pick(['root','admin','test','oracle'])} src=${IP()} attempts=${r(6)+3}`],
  ['WARN','waf',()=>`rate limit triggered path=/api/${pick(['login','search','export'])} src=${IP()}`],
  ['WARN','csp',()=>`violation blocked script-src from ${pick(['evil.example','cdn.unknown.example'])}`],
  ['WARN','ids',()=>`port scan detected src=${IP()} ports=${r(900)+100} window=60s`],
  ['BLOCK','fw',()=>`inbound tcp/${pick([22,23,445,3389,5900])} from ${IP()} dropped`],
  ['BLOCK','waf',()=>`sqli pattern in param=${pick(['id','q','user'])} src=${IP()} rule=942100`],
  ['ALERT','edr',()=>`suspicious process tree ${pick(['winword.exe > powershell.exe -enc','excel.exe > cmd.exe /c','outlook.exe > mshta.exe'])}`],
  ['ALERT','av',()=>`SHA-256 match EICAR-Test-File quarantined path=C:\\Users\\Public\\${pick(['eicar.com','test.txt','sample.bin'])}`],
  ['ALERT','edr',()=>`ransomware-like activity ${r(400)+120} files renamed in 10s pid=${r(9000)+1000}`],
  ['INFO','phish',()=>`campaign=${pick(['Q4-awareness','invoice-sim','mfa-reset-sim'])} link clicked user=u${r(900)+100} training assigned`],
];
const WEIGHT=[6,5,4,3,3,2,2,2,3,2,1,1,1,2];
function mkLine(){
  let t=Math.random()*WEIGHT.reduce((a,b)=>a+b),i=0;while((t-=WEIGHT[i])>0)i++;
  const [lvl,src,msg]=EV[i];clock+=r(900)+40;
  const d=new Date(clock),ts=d.toISOString().slice(11,23);
  return {ts,lvl,src,msg:msg()};
}
function readColors(){
  const cs=getComputedStyle(root);
  NET=cs.getPropertyValue('--net-rgb').trim()||NET;SIG=cs.getPropertyValue('--sig-rgb').trim()||SIG;
  MONO=cs.getPropertyValue('--mono').trim()||MONO;BG=cs.getPropertyValue('--bg').trim()||BG;if(reduce)frame();
}
function size(){
  const dpr=Math.min(window.devicePixelRatio||1,2);W=innerWidth;H=innerHeight;
  cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
  const n=Math.max(1,Math.ceil((W+GAP)/(COLW+GAP)));
  cols=Array.from({length:n},(_,k)=>{const rows=Math.ceil(H/LH)+2;return {depth:.6+Math.random()*.8,x:k*(COLW+GAP)+8,off:Math.random()*LH,speed:.12+Math.random()*.1,lines:Array.from({length:rows},mkLine)}});
}
const LVL={INFO:a=>`rgba(${NET},${a})`,WARN:a=>`rgba(${SIG},${a*.9})`,BLOCK:a=>`rgba(${SIG},${a})`,ALERT:a=>`rgba(${SIG},${a*1.25})`};
let px=0,py=0,ex=0,ey=0;
function drawCols(base){
  ctx.font=`400 ${FS}px ${MONO}`;ctx.textBaseline='middle';
  const on=mouse.x>-999&&!reduce;
  for(const c of cols){
    const cx=c.x+ex*c.depth,cy=ey*c.depth;
    ctx.save();ctx.beginPath();ctx.rect(cx-10,0,COLW+20,H);ctx.clip();
    c.lines.forEach((l,i)=>{
      const y=i*LH-c.off+LH/2+cy;if(y<-LH||y>H+LH)return;
      /* lines near the pointer lift slightly and nudge right: a gentle, glow-free response */
      let a=base,x=cx;
      if(on&&mouse.x>cx-40&&mouse.x<cx+COLW+40){const k=Math.max(0,1-Math.abs(y-mouse.y)/90);a+=k*k*.05;x+=k*k*6}
      ctx.fillStyle=`rgba(${NET},${a*.75})`;ctx.fillText(l.ts,x,y);x+=96;
      ctx.fillStyle=LVL[l.lvl](a*(l.lvl==='INFO'?1:1.6));ctx.fillText(l.lvl.padEnd(5),x,y);x+=48;
      ctx.fillStyle=`rgba(${NET},${a*1.1})`;ctx.fillText(l.src,x,y);x+=46;
      ctx.fillStyle=`rgba(${NET},${a})`;ctx.fillText(l.msg,x,y);
    });
    ctx.restore();
  }
}
function step(){
  for(const c of cols){c.off+=c.speed;while(c.off>=LH){c.off-=LH;c.lines.shift();c.lines.push(mkLine())}}
}
function frame(){
  ctx.clearRect(0,0,W,H);
  /* soft parallax: columns drift a few pixels with the pointer, eased */
  const tx=mouse.x>-999&&!reduce?(mouse.x/W-.5)*-10:0,ty=mouse.x>-999&&!reduce?(mouse.y/H-.5)*-8:0;
  ex+=(tx-ex)*.06;ey+=(ty-ey)*.06;
  drawCols(.065);
}
function loop(){if(running){step();frame();requestAnimationFrame(loop)}}
size();readColors();
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>{readColors();if(reduce)frame()});
if(reduce)frame();else requestAnimationFrame(loop);
let rz;addEventListener('resize',()=>{clearTimeout(rz);rz=setTimeout(()=>{size();if(reduce)frame()},150)});
if(fine&&!reduce){
  addEventListener('pointermove',e=>{mouse.x=e.clientX;mouse.y=e.clientY},{passive:true});
  document.addEventListener('pointerleave',()=>{mouse.x=mouse.y=-9999});
}
document.addEventListener('visibilitychange',()=>{const was=running;running=!document.hidden;if(running&&!was&&!reduce)requestAnimationFrame(loop)});
matchMedia('(prefers-color-scheme: dark)').addEventListener('change',readColors);

/* ---------- Badge tilt ---------- */
const badge=$('#badge');
if(fine&&!reduce){
  badge.addEventListener('pointermove',e=>{
    const r=badge.getBoundingClientRect(),px=(e.clientX-r.left)/r.width,py=(e.clientY-r.top)/r.height;
    badge.classList.add('live');
    badge.style.setProperty('--ry',((px-.5)*16).toFixed(2)+'deg');
    badge.style.setProperty('--rx',((.5-py)*14).toFixed(2)+'deg');
    badge.style.setProperty('--gx',(px*100).toFixed(1)+'%');
    badge.style.setProperty('--gy',(py*100).toFixed(1)+'%');
  });
  badge.addEventListener('pointerleave',()=>{
    badge.classList.remove('live');
    ['--rx','--ry','--gx','--gy'].forEach(p=>badge.style.removeProperty(p));
  });
}

/* ---------- Badge flip ---------- */
const front=$('.face.front'),back=$('.face.back');
function flip(){
  const on=!badge.classList.contains('flipped');
  badge.classList.toggle('flipped',on);badge.setAttribute('aria-pressed',String(on));
  back.setAttribute('aria-hidden',String(!on));front.setAttribute('aria-hidden',String(on));
  $('.flip-hint').textContent=on?'Click again to flip back':'Click the badge to flip it';
}
badge.addEventListener('click',e=>{if(!e.target.closest('a'))flip()});
badge.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();flip()}});

/* ---------- Scroll progress + active nav ---------- */
const bar=$('#progress');
function onScroll(){
  const h=root.scrollHeight-root.clientHeight;bar.style.transform=`scaleX(${h>0?root.scrollTop/h:0})`;
  const k=Math.min(1,root.scrollTop/(innerHeight*.9));cv.style.opacity=(.8-.55*k).toFixed(3);
}
addEventListener('scroll',onScroll,{passive:true});onScroll();
const links=[...$$('.nav nav a')];
const so=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){links.forEach(a=>a.setAttribute('aria-current',a.hash==='#'+e.target.id?'true':'false'))}}),{rootMargin:'-45% 0px -50% 0px'});
$$('main section[id]').forEach(s=>so.observe(s));

/* ---------- Stat counters ---------- */
const co=new IntersectionObserver(es=>es.forEach(e=>{
  if(!e.isIntersecting)return;co.unobserve(e.target);if(reduce)return;
  const el=e.target,n=+el.dataset.n,suf=el.dataset.s||'',t0=performance.now(),dur=1100;
  (function s(now){const k=Math.min(1,(now-t0)/dur),v=Math.round(n*(1-Math.pow(1-k,3)));el.textContent=v+suf;if(k<1)requestAnimationFrame(s)})(t0);
}),{threshold:.6});
$$('[data-n]').forEach(x=>co.observe(x));

/* ---------- Project filters ---------- */
$$('.filters button').forEach(b=>b.addEventListener('click',()=>{
  $$('.filters button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
  const f=b.dataset.f;$$('.case').forEach(c=>{c.hidden=!(f==='all'||c.dataset.t.split(' ').includes(f))});
}));

/* ---------- Terminal ---------- */
const out=$('#out'),inp=$('#cmd'),hist=[];let hi=0;
const GH='https://github.com/ArgirisViv',LI='https://linkedin.com/in/argiris-vivelis-a49b79262';
const ext=(h,t)=>`<a href="${h}" target="_blank" rel="noopener noreferrer">${t}</a>`;
const FILES={'about.txt':'Software developer with a cybersecurity focus. C++ is my favourite language; I also enjoy building clean frontends.','security.txt':'Contact: mailto:'+EMAIL+'<br>Preferred-Languages: en, el<br><span class="m">Full file at /.well-known/security.txt</span>'};
const C={
  help:()=>'Commands: '+Object.keys(C).filter(k=>!HIDDEN.includes(k)).map(k=>`<span class="k">${k}</span>`).join('  ')+'<br><span class="m">Tab autocompletes, arrow keys browse history.</span>',
  whoami:()=>'Argiris Vivelis. Software developer with a cybersecurity focus, based in Mytilene, Greece (UTC+2).<br>Available now for 100% remote roles.',
  projects:()=>`${ext(GH+'/sentinel-antivirus','sentinel-antivirus')}  <span class="m">C++17 engine, JavaFX console</span><br>${ext(GH+'/dark-signal','dark-signal')}  <span class="m">FastAPI and React phishing simulation</span><br>${ext(GH+'/micro-trading-bot','micro-trading-bot')}  <span class="m">Python and ML paper trading</span>`,
  skills:()=>'<span class="k">dev</span>    Python, FastAPI, C++17, Java, JavaScript, React, Node.js, SQL<br><span class="k">sec</span>    network security, threat modeling, Nmap, Wireshark, Kali Linux<br><span class="k">infra</span>  Linux, Docker, Git, GitHub Actions, PostgreSQL, MySQL',
  experience:()=>'Jul to Sep 2026  Software Engineer Intern, PRIVACT P.C.<br>Jun to Sep 2024  Customer Service & Sales, Hellenic Duty Free Shops',
  education:()=>'MSc Cybersecurity (remote), University of Piraeus, from Oct 2026<br>BSc Cultural Technology and Communication, University of the Aegean, 2022 to 2026',
  certs:()=>'IPICS 2026, University of the Aegean (89 h)<br>Cybercrime & Cybersecurity, NKUA (70 h)<br>Data Security, Cybersecurity, University of Patras (200 h)',
  contact:()=>`<a href="mailto:${EMAIL}">${EMAIL}</a><br>${ext(GH,'github.com/ArgirisViv')}<br>${ext(LI,'linkedin.com/in/argiris-vivelis-a49b79262')}`,
  cv:()=>{window.open('Argiris_Vivelis_CV.pdf','_blank','noopener');return 'Opening CV in a new tab. '+'<a href="Argiris_Vivelis_CV.pdf" download>Download instead</a>'},
  ls:()=>'<span class="k">projects/</span>  about.txt  security.txt  cv.pdf',
  cat:a=>{if(!a)return '<span class="m">usage: cat &lt;file&gt;</span>';if(a==='cv.pdf')return C.cv();return FILES[a]||null},
  history:()=>hist.length?hist.map((h,i)=>`<span class="m">${String(i+1).padStart(3)}</span>  ${esc(h)}`).join('<br>'):'<span class="m">no history yet</span>',
  date:()=>esc(new Date().toString()),
  clear:()=>''
};
Object.assign(C,{
  sudo:a=>/hire/.test(a||'')?'[sudo] password for recruiter: ********<br><span class="k">Access granted.</span> Next step: <a href="mailto:'+EMAIL+'">send me an email</a>.':'<span class="m">Try: sudo hire argiris</span>',
  nmap:()=>'Starting Nmap scan on argiris.portfolio<br>PORT     STATE  SERVICE<br>443/tcp  <span class="k">open</span>   https<br>22/tcp   closed ssh<br><span class="m">Only what needs to be open is open.</span>',
  'rm':()=>'<span class="m">Nice try. Permission denied.</span>',
  exit:()=>'<span class="m">There is no escape. Try contact instead.</span>'
});
const HIDDEN=['sudo','nmap','rm','exit'];
function print(cmd,html,err){
  out.insertAdjacentHTML('beforeend',`<div><span class="pr">$</span> ${esc(cmd)}</div><div class="o${err?' err':''}">${html}</div>`);
  out.scrollTop=out.scrollHeight;
}
function run(raw){
  const line=raw.trim();if(!line)return;
  hist.push(line);hi=hist.length;
  const [c0,...rest]=line.split(/\s+/),c=c0.toLowerCase(),arg=rest.join(' ');
  if(c==='clear'){out.innerHTML='';return}
  const fn=C[c];
  if(!fn){print(line,`command not found: ${esc(c0)}. Type <span class="k">help</span>`,true);return}
  const r=fn(arg);
  if(r===null)print(line,`cat: ${esc(arg)}: No such file`,true);else print(line,r);
}
inp.addEventListener('keydown',e=>{
  if(e.key==='Enter'){run(inp.value);inp.value=''}
  else if(e.key==='ArrowUp'){if(hi>0){hi--;inp.value=hist[hi]}e.preventDefault()}
  else if(e.key==='ArrowDown'){if(hi<hist.length-1){hi++;inp.value=hist[hi]}else{hi=hist.length;inp.value=''}e.preventDefault()}
  else if(e.key==='Tab'){
    const v=inp.value.trim().toLowerCase();if(!v)return;e.preventDefault();
    const m=Object.keys(C).filter(k=>!HIDDEN.includes(k)&&k.startsWith(v));
    if(m.length===1)inp.value=m[0]+' ';else if(m.length>1)print(v,m.map(k=>`<span class="k">${k}</span>`).join('  '));
  }
});
$$('.cmds button').forEach(b=>b.addEventListener('click',()=>{run(b.dataset.c);inp.focus({preventScroll:true})}));
out.insertAdjacentHTML('beforeend','<div class="o"><span class="m">Session started. Type</span> <span class="k">help</span> <span class="m">to list commands.</span></div>');
/* Type one demo command, once, the first time the terminal is seen */
let touched=false;inp.addEventListener('input',()=>{touched=true},{once:true});
const to=new IntersectionObserver(es=>{
  if(!es[0].isIntersecting)return;to.disconnect();if(touched||hist.length)return;
  const demo='whoami';
  if(reduce){run(demo);return}
  let i=0;setTimeout(function type(){
    if(touched)return;inp.value=demo.slice(0,++i);
    if(i<demo.length)setTimeout(type,90+Math.random()*60);else setTimeout(()=>{if(!touched){run(demo);inp.value=''}},350);
  },500);
},{threshold:.6});
to.observe($('.term'));

/* ---------- Copy email ---------- */
const cp=$('#cp'),cpl=$('#cpl');
cp.addEventListener('click',async()=>{
  try{await navigator.clipboard.writeText(EMAIL);cp.classList.add('ok');cpl.textContent='Copied';setTimeout(()=>{cp.classList.remove('ok');cpl.textContent='Copy'},2000)}
  catch(e){location.href='mailto:'+EMAIL}
});
