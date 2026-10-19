document.documentElement.classList.add('js');
const $=s=>document.querySelector(s),$$=s=>document.querySelectorAll(s);
const roles=["Cybersecurity & Software Development","Python · FastAPI · React","C++ / Java security tooling","Application security & automation"];
const te=$('#type');let ri=0,ci=0,dl=false;
if(matchMedia('(prefers-reduced-motion:reduce)').matches){te.textContent=roles[0]}else(function tk(){const r=roles[ri];ci+=dl?-1:1;te.textContent=r.slice(0,ci);let d=dl?28:60;if(!dl&&ci===r.length){dl=true;d=1700}else if(dl&&ci===0){dl=false;ri=(ri+1)%roles.length;d=300}setTimeout(tk,d)})();
function cnt(el){const n=+el.dataset.n;let i=0;(function s(){i=Math.min(n,i+Math.ceil(n/45));el.textContent=i+(el.dataset.s||'');if(i<n)requestAnimationFrame(s)})()}
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');if(e.target.dataset.n)cnt(e.target);io.unobserve(e.target)}}),{threshold:.15});
$$('.rv,[data-n]').forEach(x=>io.observe(x));
addEventListener('scroll',()=>{const h=document.documentElement;$('#bar').style.width=(h.scrollTop/(h.scrollHeight-h.clientHeight)*100)+'%'},{passive:true});
$$('.f').forEach(b=>b.onclick=()=>{$$('.f').forEach(x=>x.classList.toggle('on',x===b));const t=b.dataset.t;$$('.pc').forEach(c=>c.hidden=!(t==='all'||c.dataset.t.includes(t)))});
$('#th').onclick=()=>{const r=document.documentElement,d=r.dataset.theme?r.dataset.theme==='dark':matchMedia('(prefers-color-scheme:dark)').matches;r.dataset.theme=d?'light':'dark'};
const out=$('#out'),inp=$('#cmd'),esc=s=>s.replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m]);
const C={help:'Commands: whoami · skills · projects · education · contact · clear',
whoami:'Argiris Vivelis. Cybersecurity & software development, based in Greece. Available now for 100% remote roles.',
skills:'Python, FastAPI, JavaScript, React, C++, Java, Linux, Docker, Git, CI/CD, PostgreSQL, Nmap, Wireshark, threat modeling.',
projects:'1) Sentinel AV (C++17 / JavaFX)<br>2) Dark Signal (FastAPI / React phishing simulation)<br>3) AI Paper Trading Platform (Python / ML)<br>All public at github.com/ArgirisViv',
education:'MSc Cybersecurity (remote), University of Piraeus. BSc Cultural Technology and Communication, University of the Aegean.',
contact:'argirisvivelis@gmail.com · github.com/ArgirisViv · linkedin.com/in/argiris-vivelis-a49b79262'};
function run(c){c=c.trim().toLowerCase();if(!c)return;if(c==='clear'){out.innerHTML=''}else{out.innerHTML+='<div><span class="pr">$</span> '+esc(c)+'</div><div class="o">'+(C[c]||'command not found: '+esc(c)+'. Try help')+'</div>'}out.scrollTop=out.scrollHeight}
inp.addEventListener('keydown',e=>{if(e.key==='Enter'){run(inp.value);inp.value=''}});
$$('[data-c]').forEach(b=>b.onclick=()=>run(b.dataset.c));
run('help');
$('#cp').onclick=async function(){try{await navigator.clipboard.writeText('argirisvivelis@gmail.com');this.textContent='Copied ✓'}catch(e){location.href='mailto:argirisvivelis@gmail.com'}};
