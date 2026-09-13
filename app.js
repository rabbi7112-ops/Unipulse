const app = document.getElementById('app');
const toastEl = document.getElementById('toast');

const state = {
  token: localStorage.getItem('unipulse_token') || '',
  user: null,
  screen: localStorage.getItem('unipulse_token') ? 'home' : 'onboarding',
  selectedDay: 3,
  eventCategory: 'All',
  eventSearch: '',
  mood: 3,
};

const I = {
  home:'<path d="M3 10.8 12 3l9 7.8"/><path d="M5.5 9.5V21h13V9.5"/><path d="M9.5 21v-6h5v6"/>',
  calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
  star:'<path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
  heart:'<path d="M20.8 4.7a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.5 1-1a5.5 5.5 0 0 0 0-7.8z"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/>',
  chevron:'<path d="m9 18 6-6-6-6"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  school:'<path d="m3 10 9-5 9 5-9 5z"/><path d="M7 12.5V17c3 2 7 2 10 0v-4.5M21 10v6"/>',
  eye:'<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z"/><circle cx="12" cy="12" r="2.5"/>',
  eyeoff:'<path d="M3 3l18 18"/><path d="M10.6 6.2A10 10 0 0 1 12 6c6.5 0 10 6 10 6a18.9 18.9 0 0 1-2 2.7M6.6 6.6C3.6 8.3 2 12 2 12s3.5 6 10 6a10.2 10.2 0 0 0 4.1-.8"/><path d="M9.9 9.9A3 3 0 0 0 14.1 14.1"/>',
  users:'<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><path d="M20 8v6M23 11h-6"/>',
  chat:'<path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/>',
  wind:'<path d="M3 8h11a3 3 0 1 0-3-3M3 12h16a3 3 0 1 1-3 3M3 16h8"/>',
  lock:'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  edit:'<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  settings:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21H10v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H3v-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4a1.7 1.7 0 0 0 1-1.6V2h4v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 6l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.1v4H21a1.7 1.7 0 0 0-1.6 1z"/>',
  link:'<path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1.1 1.1"/><path d="M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1.1-1.1"/>',
  shield:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  help:'<circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 1 1 5.8 1c-.8 1-2 1.2-2.5 2.3-.2.4-.2.9-.2 1.2M12 17h.01"/>',
  logout:'<path d="M10 17l5-5-5-5M15 12H3"/><path d="M14 3h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5"/>',
  close:'<path d="M18 6 6 18M6 6l12 12"/>',
  check:'<path d="m5 12 4 4L19 6"/>',
  cake:'<path d="M4 13h16v8H4zM4 17h16M8 13V9M12 13V9M16 13V9"/><path d="M8 6c1-1 1-2 0-3M12 6c1-1 1-2 0-3M16 6c1-1 1-2 0-3"/>'
};
function icon(name, cls=''){ return `<svg class="svg-icon ${cls}" viewBox="0 0 24 24" aria-hidden="true">${I[name]||I.star}</svg>`; }

function toast(msg){
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(()=>toastEl.classList.remove('show'),2200);
}

async function api(path, options={}){
  const headers = {'Content-Type':'application/json', ...(options.headers||{})};
  if(state.token) headers.Authorization = `Bearer ${state.token}`;
  const r = await fetch('/api'+path, {...options, headers});
  const data = await r.json().catch(()=>({}));
  if(r.status===401 && !path.startsWith('/auth/')){
    localStorage.removeItem('unipulse_token');
    state.token=''; state.user=null; state.screen='login'; render();
    throw new Error(data.message || 'Please log in again.');
  }
  if(!r.ok) throw new Error(data.message || 'Something went wrong.');
  return data;
}

function nav(active){
  const items=[['home','home','Home'],['timetable','calendar','Timetable'],['events','star','Events'],['wellbeing','heart','Wellbeing'],['profile','user','Profile']];
  return `<nav class="bottom-nav">${items.map(([s,i,l])=>`<button class="nav-item ${active===s?'active':''}" data-nav="${s}">${icon(i)}<span>${l}</span></button>`).join('')}</nav>`;
}
function bindNav(){ document.querySelectorAll('[data-nav]').forEach(b=>b.onclick=()=>{state.screen=b.dataset.nav; render();}); }
function loading(){ app.innerHTML=`<div class="loading"><div><div class="spinner"></div>Loading UniPulse…</div></div>`; }
function initials(name='Priya Sharma'){ return name.split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]?.toUpperCase()).join('') || 'UP'; }
function splitDate(label='14 APR'){ const p=String(label).trim().split(/\s+/); return [p[0]||'14',p[1]||'APR']; }

function onboarding(){
  app.innerHTML=`<section class="onboarding">
    <div class="onboarding-main">
      <div class="up-logo">UP</div>
      <h1 class="brand">UniPulse</h1>
      <p class="tagline">Your campus, in your pocket</p>
      <p class="intro">Timetable, events, clubs and wellbeing support — all in one place, built for university life.</p>
    </div>
    <button id="getStarted" class="btn btn-white">Get Started</button>
    <button id="already" class="onboarding-login">Already have an account? <b>Log in</b></button>
  </section>`;
  document.getElementById('getStarted').onclick=()=>{state.screen='login';render();};
  document.getElementById('already').onclick=()=>{state.screen='login';render();};
}

function login(){
  app.innerHTML=`<section class="screen auth-screen">
    <header class="topbar"><h1>Log in</h1></header>
    <div class="scroll"><div class="auth-wrap">
      <h2 class="auth-title">Welcome back.</h2>
      <p class="sub">Log in with your university email.</p>
      <div id="authError" class="error-box"></div>
      <form id="loginForm">
        <div class="field-group"><label class="field-label">University Email</label><input id="email" class="field" type="email" placeholder="you@university.edu" autocomplete="username"></div>
        <div class="field-group"><label class="field-label">Password</label><div class="password-wrap"><input id="password" class="field" type="password" placeholder="••••••••" autocomplete="current-password"><button type="button" id="togglePw" class="password-toggle">${icon('eye')}</button></div></div>
        <div class="auth-row"><button type="button" id="forgot" class="link-btn">Forgot password?</button></div>
        <button class="btn btn-primary" style="width:100%" type="submit">Log in</button>
      </form>
      <div class="divider">or continue with</div>
      <button id="sso" class="btn btn-outline" style="width:100%">${icon('school')} Continue with Student SSO</button>
      <p class="auth-footer">New here? <button id="toRegister" class="link-btn">Create an account</button></p>
    </div></div>
  </section>`;
  const error=document.getElementById('authError');
  const showErr=(m)=>{error.textContent=m;error.style.display='block';};
  document.getElementById('togglePw').onclick=()=>{const p=document.getElementById('password');p.type=p.type==='password'?'text':'password';};
  document.getElementById('forgot').onclick=()=>toast('Password recovery would be handled by your university account.');
  document.getElementById('toRegister').onclick=()=>{state.screen='register';render();};
  const doLogin=async(email,password)=>{
    error.style.display='none';
    try{const d=await api('/auth/login',{method:'POST',body:JSON.stringify({email,password})});state.token=d.token;state.user=d.user;localStorage.setItem('unipulse_token',d.token);state.screen='home';render();}
    catch(e){showErr(e.message);}
  };
  document.getElementById('loginForm').onsubmit=e=>{e.preventDefault();doLogin(document.getElementById('email').value,document.getElementById('password').value);};
  document.getElementById('sso').onclick=()=>doLogin('demo@unipulse.local','Demo123!');
}

function register(){
  app.innerHTML=`<section class="screen auth-screen">
    <header class="topbar"><button id="backLogin" class="icon-btn left">${icon('chevron')}</button><h1>Create account</h1></header>
    <div class="scroll"><div class="auth-wrap">
      <h2 class="auth-title">Join UniPulse.</h2><p class="sub">Create your student account to continue.</p>
      <div id="authError" class="error-box"></div>
      <form id="regForm">
        <div class="field-group"><label class="field-label">Full Name</label><input id="rName" class="field" placeholder="Priya Sharma" autocomplete="name"></div>
        <div class="field-group"><label class="field-label">University Email</label><input id="rEmail" class="field" type="email" placeholder="you@university.edu" autocomplete="email"></div>
        <div class="field-group"><label class="field-label">Password</label><input id="rPassword" class="field" type="password" placeholder="6+ characters" autocomplete="new-password"></div>
        <button class="btn btn-primary" style="width:100%;margin-top:6px" type="submit">Create account</button>
      </form>
      <p class="auth-footer">Already registered? <button id="loginInstead" class="link-btn">Log in</button></p>
    </div></div>
  </section>`;
  const back=()=>{state.screen='login';render();};
  document.getElementById('backLogin').onclick=back;document.getElementById('loginInstead').onclick=back;
  document.getElementById('regForm').onsubmit=async e=>{e.preventDefault();const er=document.getElementById('authError');er.style.display='none';try{const d=await api('/auth/register',{method:'POST',body:JSON.stringify({name:rName.value,email:rEmail.value,password:rPassword.value})});state.token=d.token;state.user=d.user;localStorage.setItem('unipulse_token',d.token);state.screen='home';render();}catch(x){er.textContent=x.message;er.style.display='block';}};
}

async function home(){
  loading();
  try{
    const d=await api('/dashboard');state.user=d.user;
    const e=d.event;const date=e?splitDate(e.dateLabel):['14','APR'];
    app.innerHTML=`<section class="screen">
      <header class="header-purple"><div><h2>Hi, ${escapeHtml((d.user.name||'Priya').split(' ')[0])}</h2><p>Tuesday, 14 April</p></div><button class="bell">${icon('bell')}<span class="not-dot"></span></button></header>
      <div class="scroll"><div class="content">
        <div class="section-head"><h3>Next Class</h3></div>
        ${d.nextClass?`<div class="card next-card"><div class="main"><p class="card-title">${escapeHtml(d.nextClass.title)}</p><p class="card-meta">${escapeHtml(d.nextClass.time)} • ${escapeHtml(d.nextClass.location)}</p><p class="card-link">${escapeHtml(d.nextClass.lecturer||'')}</p></div><span class="chev">${icon('chevron')}</span></div>`:`<div class="card empty">No upcoming classes.</div>`}
        <div class="section-head"><h3>Quick Access</h3></div>
        <div class="quick-grid">
          <button class="quick-card" data-go="timetable"><span class="qicon indigo">${icon('calendar')}</span><span>Timetable</span></button>
          <button class="quick-card" data-go="events"><span class="qicon orange">${icon('star')}</span><span>Events</span></button>
          <button class="quick-card" data-go="wellbeing"><span class="qicon pink">${icon('heart')}</span><span>Wellbeing</span></button>
          <button class="quick-card" data-go="events"><span class="qicon green">${icon('users')}</span><span>Clubs</span></button>
        </div>
        <div class="section-head"><h3>Today's Events</h3><button id="seeAll" class="link-btn">See all ›</button></div>
        ${e?`<div class="card event-row"><div class="date-badge"><strong>${escapeHtml(date[0])}</strong><span>${escapeHtml(date[1])}</span></div><div class="event-copy"><h4>${escapeHtml(e.title)}</h4><p>${escapeHtml(e.timeLocation)}</p></div><span class="chev">${icon('chevron')}</span></div>`:`<div class="card empty">No events today.</div>`}
      </div></div>${nav('home')}
    </section>`;
    bindNav();document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>{state.screen=b.dataset.go;render();});document.getElementById('seeAll').onclick=()=>{state.screen='events';render();};
  }catch(e){toast(e.message);}
}

async function timetable(){
  loading();
  try{
    const items=await api(`/timetable?dayIndex=${state.selectedDay}`);
    const days=[['11','Sat',6],['12','Sun',0],['13','Mon',1],['14','Tue',3],['15','Wed',4],['16','Thu',5],['17','Fri',6]];
    // visual dayIndex intentionally follows seeded sample for Tue/Wed
    const actual=[0,1,2,3,4,5,6];
    app.innerHTML=`<section class="screen"><header class="topbar"><h1>Timetable</h1><div class="right"><button class="icon-btn">${icon('user')}</button></div></header>
      <div class="scroll"><div class="content" style="padding-top:13px">
        <div class="days">${days.map((x,i)=>`<button class="day ${state.selectedDay===actual[i]?'active':''}" data-day="${actual[i]}"><span>${x[1]}</span><strong>${x[0]}</strong></button>`).join('')}</div>
        <div>${items.length?items.map(c=>`<div class="timeline-item"><div class="time">${escapeHtml(c.time||'')}</div><div class="class-card ${c.color==='orange'?'orange':c.color==='green'?'green':''}"><h4>${escapeHtml(c.title||'')}</h4><p>${escapeHtml(c.location||'')}</p>${c.lecturer?`<p>${escapeHtml(c.lecturer)}</p>`:''}</div></div>`).join(''):`<div class="card empty">No classes scheduled for this day.</div>`}</div>
      </div></div>${nav('timetable')}</section>`;
    bindNav();document.querySelectorAll('[data-day]').forEach(b=>b.onclick=()=>{state.selectedDay=Number(b.dataset.day);timetable();});
  }catch(e){toast(e.message);}
}

async function events(){
  loading();
  try{
    const q=new URLSearchParams({category:state.eventCategory,search:state.eventSearch});
    const items=await api('/events?'+q.toString());
    const chips=['All','This Week','Clubs','Free Food'];
    app.innerHTML=`<section class="screen"><header class="topbar"><h1>Events & Clubs</h1><div class="right"><button class="icon-btn">${icon('user')}</button></div></header>
      <div class="scroll"><div class="content" style="padding-top:13px">
        <div class="search-wrap"><span class="search-icon">${icon('search')}</span><input id="eventSearch" class="field" placeholder="Search events, clubs..." value="${attr(state.eventSearch)}"></div>
        <div class="chips">${chips.map(c=>`<button class="chip ${state.eventCategory===c?'active':''}" data-chip="${c}">${c}</button>`).join('')}</div>
        <div class="event-list">${items.length?items.map(e=>{const d=splitDate(e.dateLabel);return `<div class="card event-card"><div class="date-badge"><strong>${escapeHtml(d[0])}</strong><span>${escapeHtml(d[1])}</span></div><div class="event-copy"><h4>${escapeHtml(e.title)}</h4><p>${escapeHtml(e.timeLocation)}</p><div class="category">${escapeHtml(e.category||'Event')}</div></div><button class="rsvp ${e.going?'going':''}" data-rsvp="${e._id}">${e.going?'GOING':'RSVP'}</button></div>`}).join(''):`<div class="card empty">No matching events.</div>`}</div>
      </div></div>${nav('events')}</section>`;
    bindNav();
    let timer;document.getElementById('eventSearch').oninput=e=>{clearTimeout(timer);state.eventSearch=e.target.value;timer=setTimeout(events,350);};
    document.querySelectorAll('[data-chip]').forEach(b=>b.onclick=()=>{state.eventCategory=b.dataset.chip;events();});
    document.querySelectorAll('[data-rsvp]').forEach(b=>b.onclick=async()=>{try{await api(`/events/${b.dataset.rsvp}/rsvp`,{method:'POST',body:'{}'});events();}catch(e){toast(e.message);}});
  }catch(e){toast(e.message);}
}

async function wellbeing(){
  loading();
  try{
    const d=await api('/wellbeing');state.mood=Number.isInteger(d.mood)?d.mood:3;
    const moods=[['😢','Low'],['😕','Meh'],['😐','Okay'],['🙂','Good'],['😄','Great']];
    app.innerHTML=`<section class="screen"><header class="topbar"><h1>Wellbeing Hub</h1><div class="right"><button class="icon-btn">${icon('user')}</button></div></header>
      <div class="scroll"><div class="content" style="padding-top:13px">
        <div class="card mood-card"><h3>How are you feeling today?</h3><div class="moods">${moods.map((m,i)=>`<button class="mood ${state.mood===i?'active':''}" data-mood="${i}"><span class="face">${m[0]}</span><span>${m[1]}</span></button>`).join('')}</div><div class="private-note">${icon('lock')} Private & anonymous — never shared</div></div>
        <div class="section-head"><h3>Support Resources</h3></div>
        <div class="resource-list">
          <div class="card resource"><span class="qicon pink">${icon('heart')}</span><div class="event-copy"><h4>Book a Counsellor</h4><p>Free • Next slot 2:30 PM</p></div><span class="chev">${icon('chevron')}</span></div>
          <div class="card resource"><span class="qicon indigo">${icon('chat')}</span><div class="event-copy"><h4>Peer Support Chat</h4><p>Talk to trained student peers</p></div><span class="chev">${icon('chevron')}</span></div>
          <div class="card resource"><span class="qicon green">${icon('wind')}</span><div class="event-copy"><h4>Guided Breathing</h4><p>5-minute calming exercise</p></div><span class="chev">${icon('chevron')}</span></div>
        </div>
        <button id="bookCounselling" class="btn btn-pink" style="width:100%;margin-top:15px">Book Counselling Appointment</button>
        ${d.appointments?.length?`<div class="section-head"><h3>Your Requests</h3></div><div class="card event-row"><span class="qicon pink">${icon('check')}</span><div class="event-copy"><h4>Counselling request</h4><p>${escapeHtml(d.appointments[0].requestedSlot||'2:30 PM')} • ${escapeHtml(d.appointments[0].status||'requested')}</p></div></div>`:''}
      </div></div>${nav('wellbeing')}</section>`;
    bindNav();document.querySelectorAll('[data-mood]').forEach(b=>b.onclick=async()=>{const m=Number(b.dataset.mood);try{await api('/wellbeing/mood',{method:'POST',body:JSON.stringify({mood:m})});state.mood=m;wellbeing();}catch(e){toast(e.message);}});
    document.getElementById('bookCounselling').onclick=()=>showCounsellingModal();
  }catch(e){toast(e.message);}
}

function showCounsellingModal(){
  const wrap=document.createElement('div');wrap.className='modal-backdrop';wrap.innerHTML=`<div class="modal"><h3>Book counselling appointment</h3><div class="field-group"><label class="field-label">Preferred slot</label><select id="slot" class="field"><option>2:30 PM</option><option>3:30 PM</option><option>4:30 PM</option><option>Tomorrow 10:00 AM</option></select></div><div class="modal-actions"><button id="cancelModal" class="btn btn-outline">Cancel</button><button id="confirmBook" class="btn btn-pink">Request appointment</button></div></div>`;app.appendChild(wrap);
  document.getElementById('cancelModal').onclick=()=>wrap.remove();wrap.onclick=e=>{if(e.target===wrap)wrap.remove();};
  document.getElementById('confirmBook').onclick=async()=>{try{await api('/wellbeing/counselling',{method:'POST',body:JSON.stringify({requestedSlot:document.getElementById('slot').value})});wrap.remove();toast('Counselling request sent.');wellbeing();}catch(e){toast(e.message);}};
}

async function profile(){
  loading();
  try{
    const u=await api('/profile');state.user=u;
    app.innerHTML=`<section class="screen"><header class="topbar"><h1>Profile</h1></header><div class="scroll"><div class="content" style="padding-top:8px">
      <div class="profile-head"><div class="avatar">${escapeHtml(initials(u.name))}</div><h2>${escapeHtml(u.name)}</h2><p>${escapeHtml(u.program)}, Yr ${escapeHtml(String(u.year))}</p></div>
      <div class="menu-list">
        <button class="card menu-row" id="editProfile"><span class="qicon indigo">${icon('edit')}</span><span class="label">Edit Profile Details</span><span class="chev">${icon('chevron')}</span></button>
        <button class="card menu-row"><span class="qicon indigo">${icon('settings')}</span><span class="label">Notification Preferences</span><span class="chev">${icon('chevron')}</span></button>
        <button class="card menu-row"><span class="qicon indigo">${icon('link')}</span><span class="label">Linked University Account</span><span class="chev">${icon('chevron')}</span></button>
        <button class="card menu-row"><span class="qicon indigo">${icon('shield')}</span><span class="label">Privacy & Security</span><span class="chev">${icon('chevron')}</span></button>
        <button class="card menu-row"><span class="qicon indigo">${icon('help')}</span><span class="label">Help & Support</span><span class="chev">${icon('chevron')}</span></button>
        <button class="card menu-row logout" id="logout"><span class="qicon" style="background:var(--danger-soft);color:var(--danger)">${icon('logout')}</span><span class="label">Log Out</span><span class="chev">${icon('chevron')}</span></button>
      </div>
      <p style="text-align:center;margin:14px 0 0" class="mini-status">● MongoDB Atlas connected</p>
    </div></div>${nav('profile')}</section>`;
    bindNav();document.getElementById('editProfile').onclick=()=>showProfileModal(u);document.getElementById('logout').onclick=()=>{localStorage.removeItem('unipulse_token');state.token='';state.user=null;state.screen='login';render();};
  }catch(e){toast(e.message);}
}

function showProfileModal(u){
  const wrap=document.createElement('div');wrap.className='modal-backdrop';wrap.innerHTML=`<div class="modal"><h3>Edit profile</h3><div class="edit-form"><div class="field-group"><label class="field-label">Name</label><input id="pName" class="field" value="${attr(u.name)}"></div><div class="field-group"><label class="field-label">Program</label><input id="pProgram" class="field" value="${attr(u.program)}"></div><div class="field-group"><label class="field-label">Year</label><input id="pYear" class="field" type="number" min="1" max="8" value="${attr(String(u.year))}"></div></div><div class="modal-actions"><button id="cancelProfile" class="btn btn-outline">Cancel</button><button id="saveProfile" class="btn btn-primary">Save</button></div></div>`;app.appendChild(wrap);
  document.getElementById('cancelProfile').onclick=()=>wrap.remove();wrap.onclick=e=>{if(e.target===wrap)wrap.remove();};
  document.getElementById('saveProfile').onclick=async()=>{try{await api('/profile',{method:'PUT',body:JSON.stringify({name:pName.value,program:pProgram.value,year:Number(pYear.value)})});wrap.remove();toast('Profile updated.');profile();}catch(e){toast(e.message);}};
}

function escapeHtml(v){return String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
function attr(v){return escapeHtml(v).replace(/`/g,'&#96;');}

async function render(){
  switch(state.screen){
    case 'onboarding': return onboarding();
    case 'login': return login();
    case 'register': return register();
    case 'home': return home();
    case 'timetable': return timetable();
    case 'events': return events();
    case 'wellbeing': return wellbeing();
    case 'profile': return profile();
    default: state.screen=state.token?'home':'onboarding';return render();
  }
}

render();
