// GradeVue — enhanced with Data Tools (StudentVUE mapper)
const $ = (sel, el=document) => el.querySelector(sel);
const $$ = (sel, el=document) => Array.from(el.querySelectorAll(sel));

const state = {
  authed: false,
  data: null,
  settings: {
    districtUrl: localStorage.getItem('gv.districtUrl') || '',
    proxyUrl: localStorage.getItem('gv.proxyUrl') || '',
    remember: localStorage.getItem('gv.remember') === 'true'
  }
};

function saveSettings(){
  localStorage.setItem('gv.districtUrl', state.settings.districtUrl || '');
  localStorage.setItem('gv.proxyUrl', state.settings.proxyUrl || '');
  localStorage.setItem('gv.remember', String(state.settings.remember));
}
function setToday(){
  const el = $('#today');
  if(!el) return;
  const d = new Date();
  el.textContent = d.toLocaleDateString(undefined, { month:'2-digit', day:'2-digit', year:'numeric'}) +
    ' • ' + d.toLocaleDateString(undefined, { weekday:'short' }).toUpperCase();
}
setToday();

const drawer = $('#drawer');
if(drawer){
  $('#menuBtn').addEventListener('click', () => {
    const open = drawer.classList.toggle('open');
    $('#menuBtn').setAttribute('aria-expanded', String(open));
    drawer.setAttribute('aria-hidden', String(!open));
  });
}

window.addEventListener('hashchange', router);
document.addEventListener('DOMContentLoaded', () => {
  if(!location.hash) location.hash = '#/signin';
  router();
});

const routes = {
  '/signin': SignIn,
  '/dashboard': Dashboard,
  '/settings': Settings,
  '/data-tools': DataTools,
  '/student-info': StudentInfo,
  '/class-schedule': ClassSchedule,
  '/school-info': SchoolInfo,
  '/report-card': ReportCard,
  '/documents': Documents,
  '/course-history': CourseHistory,
  '/course-request': CourseRequest,
  '/test-history': TestHistory,
  '/synergy-mail': SynergyMail,
  '/flex-schedule': FlexSchedule,
  '/calendar': CalendarView,
  '/attendance': Attendance,
  '/grade-book': GradeBook,
  '/daily-assignments': DailyAssignments,
  '/class-notes': ClassNotes
};

function router(){
  const hash = location.hash.replace(/^#/, '');
  const view = routes[hash] || NotFound;
  $('#app').innerHTML = '';
  view($('#app'));
  if(drawer){
    drawer.classList.remove('open');
    $('#menuBtn').setAttribute('aria-expanded','false');
  }
}

// --- Helpers --- //
async function ensureData(){
  if(state.data) return state.data;
  const demo = await fetch('assets/sample_data.json').then(r=>r.json());
  state.data = demo;
  return demo;
}
function footer(root){
  const f = document.createElement('footer');
  f.className = 'small center';
  f.innerHTML = `Date: ${new Date().toLocaleDateString()} Meeting Day: <b>THR</b>`;
  root.appendChild(f);
}
function letterFromPercent(p){
  if(p >= 93) return 'A';
  if(p >= 90) return 'A-';
  if(p >= 87) return 'B+';
  if(p >= 83) return 'B';
  if(p >= 80) return 'B-';
  if(p >= 77) return 'C+';
  if(p >= 73) return 'C';
  if(p >= 70) return 'C-';
  if(p >= 67) return 'D+';
  if(p >= 60) return 'D';
  return 'F';
}

// --- Sign In --- //
function SignIn(root){
  root.innerHTML = `
  <section class="card" style="max-width:720px;margin:4vh auto;">
    <h2 class="section-title">Sign in to GradeVue</h2>
    <p class="helper">Use demo data or import StudentVUE JSON/XML (Data Tools). District link is saved for later if you choose.</p>
    <div class="form-grid">
      <label>District StudentVUE URL
        <input class="input" id="inDistrict" placeholder="https://synergy.yourdistrict.org/StudentVUE" value="${state.settings.districtUrl}">
      </label>
      <label>Proxy URL (optional for CORS)
        <input class="input" id="inProxy" placeholder="https://your-cors-proxy.example" value="${state.settings.proxyUrl}">
      </label>
      <label>Username
        <input class="input" id="inUser" autocomplete="username">
      </label>
      <label>Password
        <input class="input" id="inPass" type="password" autocomplete="current-password">
      </label>
      <label style="grid-column:1/-1;display:flex;gap:.5rem;align-items:center">
        <input type="checkbox" id="inRemember" ${state.settings.remember?'checked':''}/> Remember district settings
      </label>
    </div>
    <div class="toolbar">
      <div>
        <button class="btn primary" id="btnDemo">Use Demo Data</button>
        <a class="btn" href="#/data-tools">Data Tools</a>
      </div>
      <div>
        <button class="btn primary" id="btnSignIn">Sign In</button>
      </div>
    </div>
    <p class="helper">Direct live logins are not enabled by default. Use <b>Data Tools</b> to import your StudentVUE exports and map them correctly.</p>
  </section>`;

  $('#btnDemo').addEventListener('click', async () => {
    await ensureData();
    state.authed = true;
    location.hash = '#/dashboard';
  });
  $('#btnSignIn').addEventListener('click', async () => {
    state.settings.districtUrl = $('#inDistrict').value.trim();
    state.settings.proxyUrl = $('#inProxy').value.trim();
    state.settings.remember = $('#inRemember').checked;
    saveSettings();
    await ensureData();
    state.authed = true;
    location.hash = '#/dashboard';
  });
}

// --- Dashboard --- //
function Dashboard(root){
  if(!state.authed){ location.hash = '#/signin'; return; }
  const tiles = [
    ['Student Info','/student-info'],['Class Schedule','/class-schedule'],
    ['School Information','/school-info'],['Report Card','/report-card'],
    ['Documents','/documents'],['Course History','/course-history'],
    ['Course Request','/course-request'],['Test History','/test-history'],
    ['Synergy Mail','/synergy-mail'],['Flex Schedule','/flex-schedule'],
    ['Calendar','/calendar'],['Attendance','/attendance'],
    ['Grade Book','/grade-book'],['Daily Assignments','/daily-assignments'],
    ['Class Notes','/class-notes'],['Settings','/settings'],['Data Tools','/data-tools']
  ];
  const grid = document.createElement('div');
  grid.className = 'grid';
  for(const [label, url] of tiles){
    const a = document.importNode($('#tile-template').content, true);
    a.querySelector('.tile').href = `#${url}`;
    a.querySelector('.tile-label').textContent = label;
    grid.appendChild(a);
  }
  root.appendChild(grid);
  footer(root);
}

// --- Settings --- //
function Settings(root){
  root.innerHTML = `
  <section class="card" style="max-width:720px;margin:0 auto;">
    <h2 class="section-title">Settings</h2>
    <div class="form-grid">
      <label>District StudentVUE URL
        <input class="input" id="inDistrict2" value="${state.settings.districtUrl}" placeholder="https://synergy.yourdistrict.org/StudentVUE">
      </label>
      <label>Proxy URL (optional)
        <input class="input" id="inProxy2" value="${state.settings.proxyUrl}" placeholder="https://your-cors-proxy.example">
      </label>
      <label style="grid-column:1/-1;display:flex;gap:.5rem;align-items:center">
        <input type="checkbox" id="inRemember2" ${state.settings.remember?'checked':''}/> Remember settings in this browser
      </label>
    </div>
    <div class="toolbar">
      <button class="btn primary" id="saveBtn">Save</button>
      <button class="btn danger" id="clearBtn">Clear Local Data</button>
    </div>
  </section>`;
  $('#saveBtn').addEventListener('click',()=>{
    state.settings.districtUrl = $('#inDistrict2').value.trim();
    state.settings.proxyUrl = $('#inProxy2').value.trim();
    state.settings.remember = $('#inRemember2').checked;
    saveSettings();
    alert('Saved.');
  });
  $('#clearBtn').addEventListener('click',()=>{
    localStorage.clear();
    alert('Local storage cleared.');
  });
}

// --- Data Tools (Importer + Mapper) --- //
function DataTools(root){
  root.innerHTML = `
  <section class="card">
    <h2 class="section-title">Data Tools — Import & Map StudentVUE</h2>
    <p class="helper">Import your StudentVUE data dump (JSON or XML). The mapper will try to auto-detect fields. You can correct anything before saving.</p>
    <div class="toolbar">
      <input type="file" id="file" accept=".json,.xml,application/json,text/xml" />
      <button class="btn" id="pasteBtn">Paste Raw</button>
    </div>
    <div id="preview" class="card" style="margin-top:1rem;"></div>
    <div class="toolbar">
      <button class="btn primary" id="applyBtn" disabled>Apply to App</button>
    </div>
  </section>`;

  $('#pasteBtn').addEventListener('click', () => {
    const raw = prompt('Paste JSON or XML:');
    if(raw){ handleRaw(raw); }
  });
  $('#file').addEventListener('change', async (e) => {
    const txt = await e.target.files[0].text();
    handleRaw(txt);
  });

  function handleRaw(txt){
    let mapped=null, err=null;
    try{
      if(txt.trim().startsWith('<')){
        mapped = mapFromStudentVueXML(txt);
      }else{
        const obj = JSON.parse(txt);
        mapped = mapFromStudentVueJSON(obj);
      }
    }catch(e){
      err = e.message;
    }
    if(err || !mapped){
      $('#preview').innerHTML = `<p style="color:#c62828">Could not map automatically: ${err||'Unknown error'}</p>`;
      $('#applyBtn').disabled = true;
      return;
    }
    // Show preview counts
    const c = mapped;
    $('#preview').innerHTML = `
      <div class="kv">
        <b>Student</b><div>${c.student?.name||'—'}</div>
        <b>Schedule rows</b><div>${c.schedule?.length||0}</div>
        <b>Gradebook classes</b><div>${c.gradebook?.length||0}</div>
        <b>Assignments</b><div>${c.assignments?.length||0}</div>
        <b>Report card items</b><div>${c.reportCard?.length||0}</div>
        <b>Mail items</b><div>${c.mail?.length||0}</div>
      </div>
      <details style="margin-top:1rem;"><summary>Show mapped JSON</summary><pre style="white-space:pre-wrap">${escapeHtml(JSON.stringify(mapped,null,2))}</pre></details>
      <p class="helper">If a count looks wrong, you can expand the JSON above and edit it after applying via <i>assets/sample_data.json</i>.</p>
    `;
    $('#applyBtn').disabled = false;
    $('#applyBtn').onclick = () => {
      state.data = mapped;
      state.authed = true;
      location.hash = '#/dashboard';
    };
  }
}

function escapeHtml(s){ return s.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

// Heuristic mappers
function mapFromStudentVueJSON(j){
  const out = blankData();

  // Student
  const s = j.Student || j.student || j.Profile || j.ProfileData || {};
  out.student.name = s.Name || s.StudentName || s.FullName || s.name || 'Unknown';
  out.student.id = s.ID || s.StudentID || s.id || '';
  out.student.grade = s.Grade || s.grade || '';
  out.student.school = s.School || s.school || '';
  out.student.counselor = s.Counselor || s.counselor || '';
  out.student.email = s.Email || s.email || '';

  // Schedule
  const sched = j.Schedule || j.schedule || j.Classes || j.Periods || [];
  const schedArr = Array.isArray(sched) ? sched : (sched?.Classes || sched?.Periods || sched?.Items || []);
  for(const p of (schedArr || [])){
    out.schedule.push({
      period: p.Period || p.period || p.Per || p.Block || '',
      course: p.Course || p.CourseTitle || p.course || p.Title || '',
      teacher: p.Teacher || p.teacher || p.Instructor || '',
      room: p.Room || p.room || '',
      time: p.Time || p.time || ''
    });
  }

  // Gradebook
  const gb = j.Gradebook || j.gradebook || j.Courses || j.Classes || j.GBK || {};
  const gbCourses = Array.isArray(gb) ? gb : (gb.Courses || gb.Course || gb.Classes || []);
  for(const c of (gbCourses || [])){
    const percent = Number(c.Percent || c.Overall || c.OverallPercent || c.Score || c.percent || 0);
    out.gradebook.push({
      course: c.Title || c.Course || c.CourseTitle || c.course || '',
      teacher: c.Teacher || c.Instructor || c.teacher || '',
      percent: isFinite(percent) ? Math.round(percent*100)/100 : 0,
      letter: c.Letter || c.Grade || c.letter || letterFromPercent(percent||0)
    });
    if(Array.isArray(c.Assignments || c.assignments)){
      for(const a of (c.Assignments || c.assignments)){
        out.assignments.push({
          date: a.Date || a.date || '',
          course: c.Title || c.Course || c.CourseTitle || c.course || '',
          title: a.Title || a.name || a.Assignment || '',
          pointsEarned: Number(a.Earned || a.pointsEarned || a.Score || 0),
          pointsPossible: Number(a.Possible || a.pointsPossible || a.OutOf || 0),
          status: a.Status || a.status || ''
        });
      }
    }
  }

  // Report card
  const rc = j.ReportCard || j.reportCard || j.Grades || [];
  const rcArr = Array.isArray(rc) ? rc : (rc.Items || rc.Grades || []);
  for(const r of (rcArr || [])){
    out.reportCard.push({
      term: r.Term || r.term || r.MarkingPeriod || '',
      course: r.Course || r.CourseTitle || r.course || '',
      grade: r.Grade || r.letter || '',
      credits: Number(r.Credit || r.credits || r.Credits || 0)
    });
  }

  // Attendance
  const att = j.Attendance || j.attendance || [];
  const attArr = Array.isArray(att) ? att : (att.Records || att.Items || []);
  for(const a of (attArr || [])){
    out.attendance.push({
      date: a.Date || a.date || '',
      status: a.Status || a.status || '',
      notes: a.Notes || a.notes || ''
    });
  }

  // Mail
  const mail = j.Mail || j.mail || j.Messages || [];
  const mailArr = Array.isArray(mail) ? mail : (mail.Items || []);
  for(const m of (mailArr || [])){
    out.mail.push({
      subject: m.Subject || m.subject || '',
      from: m.From || m.from || m.Sender || '',
      date: m.Date || m.date || ''
    });
  }

  // Documents
  const docs = j.Documents || j.documents || [];
  const docsArr = Array.isArray(docs) ? docs : (docs.Items || []);
  for(const d of (docsArr || [])){
    out.documents.push({
      name: d.Name || d.name || d.Title || '',
      url: d.Url || d.url || '#',
      type: d.Type || d.type || ''
    });
  }

  // Course history
  const hist = j.CourseHistory || j.courseHistory || j.Transcript || [];
  const histArr = Array.isArray(hist) ? hist : (hist.Items || hist.Courses || []);
  for(const h of (histArr || [])){
    out.courseHistory.push({
      year: h.Year || h.year || '',
      course: h.Course || h.CourseTitle || h.course || '',
      term: h.Term || h.term || '',
      grade: h.Grade || h.grade || '',
      credits: Number(h.Credit || h.credits || h.Credits || 0)
    });
  }

  // Requests
  const req = j.CourseRequests || j.courseRequests || j.Requests || [];
  const reqArr = Array.isArray(req) ? req : (req.Items || []);
  for(const r of (reqArr || [])){
    out.courseRequests.push({
      course: r.Course || r.CourseTitle || r.course || '',
      status: r.Status || r.status || ''
    });
  }

  // Flex / Calendar / Notes
  const flex = j.Flex || j.flexSchedule || [];
  for(const f of (Array.isArray(flex)?flex:(flex.Items||[]))){
    out.flexSchedule.push({date:f.Date||'',session:f.Session||'',activity:f.Activity||''});
  }
  const cal = j.Calendar || j.calendar || [];
  for(const e of (Array.isArray(cal)?cal:(cal.Items||[]))){
    out.calendar.push({date:e.Date||'',title:e.Title||'',type:e.Type||''});
  }
  const notes = j.ClassNotes || j.classNotes || [];
  for(const n of (Array.isArray(notes)?notes:(notes.Items||[]))){
    out.classNotes.push({course:n.Course||'',note:n.Note||'',date:n.Date||''});
  }

  // Fill schedule from gradebook if empty
  if(out.schedule.length === 0 && out.gradebook.length){
    out.schedule = out.gradebook.map((g,i)=>({period:i+1,course:g.course,teacher:g.teacher,room:'',time:''}));
  }

  // Ensure grade letters
  out.gradebook = out.gradebook.map(g => ({...g, letter: g.letter || letterFromPercent(g.percent||0)}));
  return out;
}

function mapFromStudentVueXML(xmlText){
  const out = blankData();
  const doc = new DOMParser().parseFromString(xmlText, 'text/xml');

  const text = (n, sel) => (n.querySelector(sel)?.textContent || '').trim();

  // Student
  const s = doc.querySelector('Student') || doc.querySelector('Profile') || doc;
  out.student.name = text(s,'Name') || text(s,'StudentName') || 'Unknown';
  out.student.id = text(s,'PermID') || text(s,'StudentID');
  out.student.grade = text(s,'Grade');
  out.student.school = text(s,'School');
  out.student.counselor = text(s,'Counselor');
  out.student.email = text(s,'Email');

  // Gradebook Courses
  doc.querySelectorAll('Course, Class').forEach((c, idx) => {
    const title = text(c,'Title') || text(c,'CourseTitle') || c.getAttribute('Title') || '';
    const teacher = text(c,'Teacher') || text(c,'Instructor') || c.getAttribute('Teacher') || '';
    const percent = Number(text(c,'Mark') || text(c,'OverallPercent') || c.getAttribute('Percent') || 0);
    out.gradebook.push({
      course: title, teacher,
      percent: isFinite(percent)?Math.round(percent*100)/100:0,
      letter: text(c,'Letter') || text(c,'Grade') || letterFromPercent(percent||0)
    });
    // assignments under course
    c.querySelectorAll('Assignment').forEach(a => {
      out.assignments.push({
        date: text(a,'DateAssigned') || text(a,'Date') || '',
        course: title,
        title: text(a,'Name') || text(a,'Title') || '',
        pointsEarned: Number(text(a,'Score') || text(a,'Points') || a.getAttribute('Score') || 0),
        pointsPossible: Number(text(a,'PointsPossible') || a.getAttribute('PointsPossible') || 0),
        status: text(a,'Status') || ''
      });
    });
  });

  // Schedule
  doc.querySelectorAll('Period, ScheduleItem').forEach(p => {
    out.schedule.push({
      period: text(p,'Period') || p.getAttribute('Period') || '',
      course: text(p,'CourseTitle') || text(p,'Title') || '',
      teacher: text(p,'Teacher') || '',
      room: text(p,'Room') || '',
      time: text(p,'StartTime') && text(p,'EndTime') ? `${text(p,'StartTime')}–${text(p,'EndTime')}`: ''
    });
  });

  // ReportCard
  doc.querySelectorAll('ReportCardItem, Grade').forEach(r => {
    out.reportCard.push({
      term: text(r,'Term') || '',
      course: text(r,'CourseTitle') || '',
      grade: text(r,'Mark') || text(r,'Grade') || '',
      credits: Number(text(r,'Credits') || 0)
    });
  });

  // Attendance
  doc.querySelectorAll('AttendanceEvent, AttendanceItem').forEach(a => {
    out.attendance.push({
      date: text(a,'Date') || '',
      status: text(a,'Code') || text(a,'Status') || '',
      notes: text(a,'Note') || ''
    });
  });

  // Mail
  doc.querySelectorAll('Message, MailItem').forEach(m => {
    out.mail.push({
      subject: text(m,'Subject') || '',
      from: text(m,'From') || text(m,'Sender') || '',
      date: text(m,'Date') || text(m,'SentDate') || ''
    });
  });

  // Fall back schedule
  if(out.schedule.length === 0 && out.gradebook.length){
    out.schedule = out.gradebook.map((g,i)=>({period:i+1,course:g.course,teacher:g.teacher,room:'',time:''}));
  }

  return out;
}

function blankData(){
  return {
    student:{name:'',id:'',grade:'',school:'',counselor:'',email:''},
    schedule:[], schoolInfo:{name:'',phone:'',address:''},
    reportCard:[], documents:[], courseHistory:[], courseRequests:[],
    tests:[], mail:[], flexSchedule:[], calendar:[],
    attendance:[], gradebook:[], assignments:[], classNotes:[]
  };
}

// --- Pages (render from state.data) --- //
async function StudentInfo(root){
  const d = await ensureData();
  const s = d.student||{};
  root.innerHTML = `<section class="card"><h2 class="section-title">Student Info</h2>
  <div class="kv">
    <b>Name</b><div>${s.name||''}</div>
    <b>ID</b><div>${s.id||''}</div>
    <b>Grade</b><div>${s.grade||''}</div>
    <b>School</b><div>${s.school||''}</div>
    <b>Counselor</b><div>${s.counselor||''}</div>
    <b>Email</b><div>${s.email||''}</div>
  </div></section>`;
  footer(root);
}

async function ClassSchedule(root){
  const d = await ensureData();
  const rows = (d.schedule||[]).map(p => `<tr><td>${p.period||''}</td><td>${p.course||''}</td><td>${p.teacher||''}</td><td>${p.room||''}</td><td>${p.time||''}</td></tr>`).join('');
  root.innerHTML = `<section class="card"><h2 class="section-title">Class Schedule</h2>
  <table class="table"><thead><tr><th>Per</th><th>Course</th><th>Teacher</th><th>Room</th><th>Time</th></tr></thead><tbody>${rows}</tbody></table></section>`;
  footer(root);
}

async function SchoolInfo(root){
  const d = await ensureData();
  const s = d.schoolInfo||{};
  root.innerHTML = `<section class="card"><h2 class="section-title">School Information</h2>
  <div class="kv"><b>School</b><div>${s.name||''}</div><b>Phone</b><div>${s.phone||''}</div><b>Address</b><div>${s.address||''}</div></div></section>`;
  footer(root);
}

async function ReportCard(root){
  const d = await ensureData();
  const rows = (d.reportCard||[]).map(r=>`<tr><td>${r.term||''}</td><td>${r.course||''}</td><td>${r.grade||''}</td><td>${r.credits??''}</td></tr>`).join('');
  root.innerHTML = `<section class="card"><h2 class="section-title">Report Card</h2>
  <table class="table"><thead><tr><th>Term</th><th>Course</th><th>Grade</th><th>Credits</th></tr></thead><tbody>${rows}</tbody></table></section>`;
  footer(root);
}

async function Documents(root){
  const d = await ensureData();
  const list = (d.documents||[]).map(doc=>`<li><a href="${doc.url||'#'}" target="_blank" rel="noopener">${doc.name||''}</a> <span class="pill">${doc.type||''}</span></li>`).join('');
  root.innerHTML = `<section class="card"><h2 class="section-title">Documents</h2><ul>${list}</ul></section>`;
  footer(root);
}

async function CourseHistory(root){
  const d = await ensureData();
  const rows = (d.courseHistory||[]).map(r=>`<tr><td>${r.year||''}</td><td>${r.course||''}</td><td>${r.term||''}</td><td>${r.grade||''}</td><td>${r.credits??''}</td></tr>`).join('');
  root.innerHTML = `<section class="card"><h2 class="section-title">Course History</h2>
  <table class="table"><thead><tr><th>Year</th><th>Course</th><th>Term</th><th>Grade</th><th>Credits</th></tr></thead><tbody>${rows}</tbody></table></section>`;
  footer(root);
}

async function CourseRequest(root){
  const d = await ensureData();
  const list = (d.courseRequests||[]).map(r=>`<li>${r.course||''} <span class="pill">${r.status||''}</span></li>`).join('');
  root.innerHTML = `<section class="card"><h2 class="section-title">Course Request</h2><ul>${list}</ul></section>`;
  footer(root);
}

async function TestHistory(root){
  const d = await ensureData();
  const rows = (d.tests||[]).map(t=>`<tr><td>${t.name||''}</td><td>${t.date||''}</td><td>${t.score||''}</td></tr>`).join('');
  root.innerHTML = `<section class="card"><h2 class="section-title">Test History</h2>
  <table class="table"><thead><tr><th>Test</th><th>Date</th><th>Score</th></tr></thead><tbody>${rows}</tbody></table></section>`;
  footer(root);
}

async function SynergyMail(root){
  const d = await ensureData();
  const list = (d.mail||[]).map(m=>`<li><b>${m.subject||''}</b> — ${m.from||''} <span class="muted">(${m.date||''})</span></li>`).join('');
  root.innerHTML = `<section class="card"><h2 class="section-title">Synergy Mail</h2><ul>${list}</ul></section>`;
  footer(root);
}

async function FlexSchedule(root){
  const d = await ensureData();
  const rows = (d.flexSchedule||[]).map(f=>`<tr><td>${f.date||''}</td><td>${f.session||''}</td><td>${f.activity||''}</td></tr>`).join('');
  root.innerHTML = `<section class="card"><h2 class="section-title">Flex Schedule</h2>
  <table class="table"><thead><tr><th>Date</th><th>Session</th><th>Activity</th></tr></thead><tbody>${rows}</tbody></table></section>`;
  footer(root);
}

async function CalendarView(root){
  const d = await ensureData();
  const list = (d.calendar||[]).map(ev=>`<li>${ev.date||''} — <b>${ev.title||''}</b> <span class="pill">${ev.type||''}</span></li>`).join('');
  root.innerHTML = `<section class="card"><h2 class="section-title">Calendar</h2><ul>${list}</ul></section>`;
  footer(root);
}

async function Attendance(root){
  const d = await ensureData();
  const rows = (d.attendance||[]).map(a=>`<tr><td>${a.date||''}</td><td>${a.status||''}</td><td>${a.notes||''}</td></tr>`).join('');
  root.innerHTML = `<section class="card"><h2 class="section-title">Attendance</h2>
  <table class="table"><thead><tr><th>Date</th><th>Status</th><th>Notes</th></tr></thead><tbody>${rows}</tbody></table></section>`;
  footer(root);
}

async function GradeBook(root){
  const d = await ensureData();
  // Ensure unique courses and include all classes
  const rows = (d.gradebook||[]).map(g=>`<tr><td>${g.course||''}</td><td>${g.teacher||''}</td><td><span class="pill grade-a">${(g.percent??'')}${g.percent!==undefined?'%':''}</span></td><td>${g.letter||letterFromPercent(Number(g.percent)||0)}</td></tr>`).join('');
  root.innerHTML = `<section class="card"><h2 class="section-title">Grade Book</h2>
  <table class="table"><thead><tr><th>Course</th><th>Teacher</th><th>Percent</th><th>Letter</th></tr></thead><tbody>${rows}</tbody></table></section>`;
  footer(root);
}

async function DailyAssignments(root){
  const d = await ensureData();
  const rows = (d.assignments||[]).map(a=>`<tr><td>${a.date||''}</td><td>${a.course||''}</td><td>${a.title||''}</td><td>${a.pointsEarned??''}/${a.pointsPossible??''}</td><td>${a.status||''}</td></tr>`).join('');
  root.innerHTML = `<section class="card"><h2 class="section-title">Daily Assignments</h2>
  <table class="table"><thead><tr><th>Date</th><th>Course</th><th>Assignment</th><th>Score</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table></section>`;
  footer(root);
}

async function ClassNotes(root){
  const d = await ensureData();
  const list = (d.classNotes||[]).map(n=>`<li><b>${n.course||''}</b> — ${n.note||''} <span class="muted">(${n.date||''})</span></li>`).join('');
  root.innerHTML = `<section class="card"><h2 class="section-title">Class Notes</h2><ul>${list}</ul></section>`;
  footer(root);
}

function NotFound(root){
  root.innerHTML = `<section class="card"><h2 class="section-title">Not found</h2><p>That page doesn't exist.</p></section>`;
}
