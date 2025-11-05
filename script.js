/* Main JS for the split-site
   - Router
   - Animations (counters, bars)
   - Impact calculator
   - Simple chart drawing
   - Contact local save demo
*/

document.addEventListener('DOMContentLoaded', () => {
  const pages = ['home','about','solutions','data','contact'];

  // Router & navigation
  function navigate(route){
    if(!pages.includes(route)) route='home';
    document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
    const el = document.getElementById(route);
    if(el) {
      el.classList.add('active');
      // Simple fade-in + slide-up animation for the new page
      el.animate([
        { opacity: 0, transform: 'translateY(10px)' },
        { opacity: 1, transform: 'translateY(0px)' }
      ], { duration: 400, easing: 'ease-out' });
    }
    document.querySelectorAll('#nav a').forEach(a=>a.classList.toggle('active', a.dataset.route === route));
    location.hash = route;
    window.scrollTo({top:80, behavior:'smooth'});
  }

  window.addEventListener('hashchange', ()=>navigate(location.hash.replace('#','')||'home'));
  document.querySelectorAll('#nav a').forEach(a=>{
    a.addEventListener('click', (e)=>{ e.preventDefault(); navigate(a.dataset.route); });
  });

  // buttons that navigate
  document.querySelectorAll('[data-route-to]').forEach(b=>{
    b.addEventListener('click', ()=> navigate(b.getAttribute('data-route-to')));
  });

  // keyboard shortcuts (Alt+1..5)
  document.addEventListener('keydown', (e)=>{
    if(e.altKey && e.key === '1') navigate('home');
    if(e.altKey && e.key === '2') navigate('about');
    if(e.altKey && e.key === '3') navigate('solutions');
    if(e.altKey && e.key === '4') navigate('data');
    if(e.altKey && e.key === '5') navigate('contact');
  });

  // counters animation
  function animateNumber(el, to, duration=1200){
    const from = 0; const start = performance.now();
    function tick(now){
      const t = Math.min(1,(now-start)/duration);
      el.textContent = Math.floor(from + (to-from)*easeOutCubic(t)).toLocaleString();
      if(t<1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  function easeOutCubic(t){return 1 - Math.pow(1 - t, 3)}
  const totalEl = document.getElementById('counterTotal');
  const projEl = document.getElementById('counterProjects');
  const partEl = document.getElementById('counterPartners');
  if(totalEl) animateNumber(totalEl, 12450);
  if(projEl) animateNumber(projEl, 42);
  if(partEl) animateNumber(partEl, 18);

  // animate progress bars
  document.querySelectorAll('.bar i').forEach(i=>{
    const to = +i.dataset.progress || 60;
    setTimeout(()=>{ i.style.width = to + '%'; i.style.transition = 'width 1200ms cubic-bezier(.2,.9,.2,1)'; }, 300);
  });

  // impact calculator
  const calcBtn = document.getElementById('calcBtn');
  if(calcBtn){
    calcBtn.addEventListener('click', calcImpact);
  }
  function calcImpact(){
    const factor = parseFloat(document.getElementById('plasticType').value || '1');
    const weight = parseFloat(document.getElementById('weight').value) || 0;
    const saved = factor * weight * 0.6; // assume recycling saves ~60%
    const out = document.getElementById('impactResult');
    if(out) out.textContent = saved.toFixed(2) + ' kg CO₂e avoided';
  }

  // sample data + table
  const regions = [{name:'North',kg:4200},{name:'South',kg:3300},{name:'East',kg:2100},{name:'West',kg:1640}];
  function makeTable(){
    const tbody = document.getElementById('tableBody');
    if(!tbody) return;
    tbody.innerHTML = '';
    // Animate table rows appearing
    regions.forEach((r, i)=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `<td style="color:#e6f3ff">${r.name}</td><td>${r.kg.toLocaleString()}</td><td>${Math.round((r.kg/5000)*100)}%</td>`;
      tr.style.opacity = 0;
      tbody.appendChild(tr);
      setTimeout(() => {
        tr.style.transition = 'opacity 0.4s ease';
        tr.style.opacity = 1;
      }, i * 100 + 300);
    });
  }
  makeTable();

  // Table sorting
  let sortConfig = { key: 'kg', dir: 'desc' };
  document.querySelectorAll('.data-table th[data-sort]').forEach(th => {
    th.addEventListener('click', () => {
      const key = th.dataset.sort;
      if (sortConfig.key === key) {
        sortConfig.dir = sortConfig.dir === 'desc' ? 'asc' : 'desc';
      } else {
        sortConfig.key = key;
        sortConfig.dir = 'desc'; // Default to descending for new column
      }

      regions.sort((a, b) => {
        const [valA, valB] = [a[sortConfig.key], b[sortConfig.key]];
        const mod = sortConfig.dir === 'desc' ? -1 : 1;
        if (typeof valA === 'string') {
          return valA.localeCompare(valB) * mod;
        }
        return (valA - valB) * mod;
      });

      makeTable();
      document.querySelectorAll('.data-table th[data-sort]').forEach(h => h.classList.remove('sort-asc', 'sort-desc'));
      th.classList.add(`sort-${sortConfig.dir}`);
    });
  });

  // simple canvas bar chart
  const canvas = document.getElementById('chart1');
  function drawChart(){
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0,0,w,h);
    const max = Math.max(...regions.map(r=>r.kg));
    const pad = 30;
    const colW = (w - pad*2) / regions.length;
    const barW = colW * 0.6;
    regions.forEach((r,i)=>{
      const x = pad + i * colW + (colW - barW)/2;
      const barH = (r.kg/max) * (h - 80);
      // shadow
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.fillRect(x+6, h-40 - barH +6, barW, barH);
      // gradient bar
      const g = ctx.createLinearGradient(0, h, 0, h - barH);
      g.addColorStop(0,'rgba(0,212,255,0.18)');
      g.addColorStop(1,'rgba(124,92,255,0.22)');
      ctx.fillStyle = g;
      ctx.fillRect(x, h-40 - barH, barW, barH);
      // labels
      ctx.fillStyle = '#bcd9e6';
      ctx.font = '13px sans-serif';
      ctx.fillText(r.name, x, h-16);
      ctx.fillStyle = '#9aa8b2';
      ctx.font = '12px sans-serif';
      ctx.fillText(r.kg.toLocaleString()+' kg', x, h-40 - barH - 6);
    });
  }

  // hi-dpi canvas sizing & redraw on resize
  function hiDPI() {
    if(!canvas) return;
    const ratio = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * ratio;
    canvas.height = 260 * ratio;
    drawChart();
  }
  hiDPI();
  window.addEventListener('resize', () => {
    hiDPI();
    drawChart();
  });

  // contact form — save locally demo
  const sendBtn = document.getElementById('sendBtn');
  if(sendBtn){
    sendBtn.addEventListener('click', submitForm);
  }
  function submitForm(){
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const inquiry = document.getElementById('inquiry').value;
    const message = document.getElementById('message').value;
    const status = document.getElementById('formStatus');

    if(!name || !email){
      if(status) status.textContent = 'Please provide name and email';
      return;
    }
    const store = JSON.parse(localStorage.getItem('pwm_contacts') || '[]');
    store.push({name,email,inquiry,message,at:new Date().toISOString()});
    localStorage.setItem('pwm_contacts', JSON.stringify(store));
    if(status) status.textContent = 'Saved locally — thank you!';
    setTimeout(()=>{ if(status) status.textContent = ''; }, 3000);
    const form = document.getElementById('contactForm');
    if(form) form.reset();
  }

  // theme toggle - simple
  const themeBtnEl = document.getElementById('themeBtn');
  if(themeBtnEl){
    themeBtnEl.addEventListener('click', ()=>{
      const body = document.body;
      const current = body.getAttribute('data-theme') || 'dark';
      if(current === 'dark'){
        body.setAttribute('data-theme','light');
        body.style.background = 'linear-gradient(180deg,#f8fafc 0%, #eef2ff 60%)';
        document.querySelectorAll('.card').forEach(c => c.style.background = 'linear-gradient(180deg,#ffffff,#f7fbff)');
      } else {
        body.setAttribute('data-theme','dark');
        body.style.background = 'linear-gradient(180deg,#071029 0%, #071229 60%)';
        document.querySelectorAll('.card').forEach(c => c.style.background = '');
      }
    });
  }

  // initial route
  navigate(location.hash.replace('#','')||'home');
});
