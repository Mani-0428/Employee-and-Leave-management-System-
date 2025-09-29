// Employee Tracker v29 — Department + detailed Offer Letter
(function(){
  const qs = sel => document.querySelector(sel);
  // const qsa = sel => Array.from(document.querySelectorAll(sel));
  const qsa = window.qsa || (sel => document.querySelectorAll(sel));

  // Screens
  const SCREENS = { login: qs('#login-screen'), main: qs('#main-screen') };
  

  // Elements
  const els = {
    loginForm: qs('#login-form'),
    loginUser: qs('#login-username'),
    loginPass: qs('#login-password'),
    logout: qs('#btn-logout'),
    add: qs('#btn-add'),
    tableBody: qs('#emp-table tbody'),
    search: qs('#search'),
    exportBtn: qs('#btn-export'),
    exportCsvBtn: qs('#btn-export-csv'),
    importFile: qs('#import-file'),
    settingsBtn: qs('#btn-settings'),
    settingsModal: qs('#settings'),
    settingsClose: qs('#settings-close'),
    settingsForm: qs('#settings-form'),
    deleteSelected: qs('#btn-delete-selected'),
    selectedCount: qs('#selected-count'),
    qAll: qs('#q-all'), qActive: qs('#q-active'), qInactive: qs('#q-inactive'), qProb: qs('#q-probation'),
    exportAttCsv: qs('#btn-export-att-csv'),
    // Bulk Import
    bulkImportBtn: qs('#btn-bulk-import'),
    bulkModal: qs('#bulk-import'),
    bulkClose: qs('#bulk-close'),
    bulkFiles: qs('#bulk-files'),
    bulkFolder: qs('#bulk-folder'),
    chooseFolderBtn: qs('#btn-choose-folder'),
    tmplCsvBtn: qs('#btn-download-template-csv'),
    tmplJsonBtn: qs('#btn-download-template-json')
  };

  // Modal
  const modal = {
    root: qs('#modal'),
    title: qs('#modal-title'),
    close: qs('#modal-close'),
    form: qs('#emp-form')
  };

  // Storage keys
  const STORE_KEY = 'pt_employee_data_v1';
  const SETTINGS_KEY = 'pt_employee_settings_v1';
  const AUTH_KEY = 'pt_employee_auth_v1';
  const ATT_KEY = 'pt_attendance_v1';

  const defaultSettings = { storageHint: 'P:\\Management\\Tool\\Employee Tracker', username: 'admin', password: 'admin', pfPct: 12, leavePaid: true, nightAllowance: 100, weekendAllowance: 1000 };

  // Seed
  function uid(){ return 'id-' + Math.random().toString(36).slice(2,9) + Date.now().toString(36); }
  const seed = [];

  // Settings/Data
  function getSettings(){ try { return Object.assign({}, defaultSettings, JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}')); } catch(e){ return {...defaultSettings}; } }
  function setSettings(s){ localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); }
  function getData(){ const raw = localStorage.getItem(STORE_KEY); if(!raw){ localStorage.setItem(STORE_KEY, JSON.stringify(seed)); return JSON.parse(JSON.stringify(seed)); } try { return JSON.parse(raw) || []; } catch(e){ return []; } }
  function setData(data){ localStorage.setItem(STORE_KEY, JSON.stringify(data)); }

  // Attendance store
  function getAttendance(){ try{ return JSON.parse(localStorage.getItem(ATT_KEY)||'{}'); }catch(e){ return {}; } }
  function setAttendance(obj){ localStorage.setItem(ATT_KEY, JSON.stringify(obj)); }
  function daysInMonth(ym){ const [y,m] = ym.split('-').map(n=>parseInt(n,10)); return new Date(y, m, 0).getDate(); }
  function isWeekend(y,m,day){ const dd=new Date(y,m-1,day).getDay(); return dd===0 || dd===6; }
  function workingDaysInMonth(ym){ const [y,m] = ym.split('-').map(n=>parseInt(n,10)); let c=0; for(let d=1; d<=new Date(y,m,0).getDate(); d++){ if(!isWeekend(y,m,d)) c++; } return c; }

  // Auth
  function isAuthed(){ return sessionStorage.getItem(AUTH_KEY) === '1'; }
  function setAuthed(v){ v ? sessionStorage.setItem(AUTH_KEY,'1') : sessionStorage.removeItem(AUTH_KEY); }

  // Utils
  function fmtDate(d){ if(!d) return ''; try { return new Date(d).toISOString().slice(0,10); } catch(e){ return d; } }
  function monthsBetween(start, end){ try { const s=new Date(start); const e=end?new Date(end):new Date(); let m=(e.getFullYear()-s.getFullYear())*12+(e.getMonth()-s.getMonth()); if(e.getDate()<s.getDate()) m-=1; return Math.max(0,m);} catch(e){return 0;} }
  function esc(s){ return (s ?? '').toString().replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c])); }
  function download(filename, text){ const blob=new Blob([text],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=filename; document.body.appendChild(a); a.click(); URL.revokeObjectURL(a.href); a.remove(); }
  function downloadCsv(filename, rows){ if(!rows.length) return; const headers=Object.keys(rows[0]); const escv=v=>{const s=String(v??'').replace(/"/g,'""'); return /[",\n]/.test(s)?`"${s}"`:s;}; const lines=[headers.join(',')].concat(rows.map(r=>headers.map(h=>escv(r[h])).join(','))); const blob=new Blob([lines.join('\n')],{type:'text/csv'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=filename; document.body.appendChild(a); a.click(); URL.revokeObjectURL(a.href); a.remove(); }
  async function loadEmployees() {
  try {
    const url = 'api.php?action=list&queue=' + encodeURIComponent(window.currentQueue);
    console.log('Loading employees for queue:', window.currentQueue, url);

    const res = await fetch(url);
    const json = await res.json();
    if (!json.ok) throw new Error(json.error || 'Failed to load employees');
    data = json.data;
    renderEmployeeTable(data);
  } catch (err) {
    alert('Load failed: ' + err.message);
    console.error(err);
  }
}
  // Salary breakup helper (no percentages shown in UI)
  function salaryBreakup(gross){
    let trans = 2000;
    if(gross <= 0) return {basic:0,hra:0,conv:0,med:0,special:0,trans:0,total:0};
    if(gross <= trans) return {basic:0,hra:0,conv:0,med:0,special:0,trans:Math.round(gross),total:Math.round(gross)};
    let basic = (gross - trans) / 2;
    if(basic < 0) basic = 0;
    let hra = 0.40*basic;
    let conv = 0.18*basic;
    let med = 0.12*basic;
    let special = 0.30*basic;
    basic = Math.round(basic); hra = Math.round(hra); conv = Math.round(conv); med = Math.round(med); special = Math.round(special); trans = Math.round(trans);
    let sum = basic + hra + conv + med + special + trans;
    const delta = Math.round(gross) - sum;
    special += delta; // absorb rounding
    return {basic,hra,conv,med,special,trans,total:(basic+hra+conv+med+special+trans)};
  }

  // Status helpers
  function computeStatus(rec){ if(rec.exitDate && String(rec.exitDate).trim()!=='') return 'Inactive'; return (rec.status || 'Active'); }
  function isProbation(rec){ const st=computeStatus(rec); if(st!=='Active') return false; return monthsBetween(rec.joiningDate, rec.exitDate||'') <= 3; }

  // State
  let data = getData();
  let editingId = null;
  let currentQueue = 'all';
  let selectedIds = new Set();

  function updateSelectedCount(){ if(els.selectedCount) els.selectedCount.textContent = String(selectedIds.size); }

  // Modal + dim
  function setModalOpen(flag){ document.body.classList[flag?'add':'remove']('modal-open'); }
  function openModal(title, record){
    modal.title.textContent = title;
    modal.root.classList.remove('hidden');
    setModalOpen(true);
    modal.form.reset();
    editingId = record ? record.id : null;
    showTab('edit');
    if(record){
      for(const [k,v] of Object.entries(record)){
        const field = modal.form.querySelector(`[name="${k}"]`);
        if(field){
          if(field.type === 'checkbox') field.checked = !!v;
          else field.value = v;
        }
      }
    } else {
      const wot = modal.form.querySelector('[name="wotAllowance"]'); if(wot) wot.checked = true;
    }
  }
  function closeAllModals(){ if(!modal.root.classList.contains('hidden')) modal.root.classList.add('hidden'); if(!els.settingsModal.classList.contains('hidden')) els.settingsModal.classList.add('hidden'); if(!els.bulkModal.classList.contains('hidden')) els.bulkModal.classList.add('hidden'); setModalOpen(false); editingId=null; }

  // Tabs
  function showTab(name){
    qsa('.tab').forEach(t => t.classList.remove('active'));
    qsa('.tab-pane').forEach(p => p.classList.remove('active'));
    const btn = qs(`.tab[data-tab="${name}"]`);
    const pane = qs(`#tab-${name}`);
    if(btn) btn.classList.add('active');
    if(pane) pane.classList.add('active');
    if(name==='attendance' && editingId){ const emp = data.find(r => r.id===editingId); if(emp) renderAttendance(emp); }
    if(name==='payslip' && editingId){ const emp = data.find(r => r.id===editingId); if(emp) renderPayslip(emp); }
  }
  document.addEventListener('click', (e) => {
    const tab = e.target.closest('.tab'); if(!tab) return;
    const name = tab.getAttribute('data-tab'); showTab(name);
  });

  // Attendance helpers
  function renderAttendance(emp){
    const monthInput = qs('#att-month');
    const grid = qs('#att-grid');
    const summary = qs('#att-summary');
    if(!monthInput || !grid) return;
    const ym = monthInput.value || new Date().toISOString().slice(0,7);
    monthInput.value = ym;
    const att = getAttendance();
    att[emp.id] = att[emp.id] || {};
    const map = att[emp.id][ym] || {};
    const totalDays = daysInMonth(ym);
    const [y,m] = ym.split('-').map(n=>parseInt(n,10));

    let dp=0,np=0,lp=0,l=0,w=0,weekendP=0;
    let html = '';
    for(let d=1; d<=totalDays; d++){
      const wknd = isWeekend(y,m,d);
      if(!wknd) w++;
      let st = map[d] || (wknd ? 'WO' : '-'); // default WO on weekends
      if(st==='D') dp++; else if(st==='N') { np++; } else if(st==='LP') lp++; else if(st==='L') l++;
      if(wknd && st==='WOT') weekendP++;
      html += `<div class="att-day" data-day="${d}" data-wknd="${wknd?1:0}" title="Click to cycle status">
        <span class="d">${d}</span><span class="s">${st}</span>
      </div>`;
    }
    grid.innerHTML = html;
    summary.textContent = `Working days: ${w} | Day P: ${dp} | Night P: ${np} | Loss of Pay: ${lp} | Leave: ${l} | Weekend P: ${weekendP}`;

    const handler = (e) => {
      const el = e.target.closest('.att-day'); if(!el) return;
      const day = el.getAttribute('data-day');
      const wknd = el.getAttribute('data-wknd') === '1';
      const cur = el.querySelector('.s').textContent.trim();
      const next = wknd
        ? ((cur==='WO'||cur===''||cur==='-') ? 'WOT' : (cur==='WOT' ? 'LP' : (cur==='LP' ? 'L' : 'WO')))
        : ((cur==='-'||cur==='') ? 'D' : (cur==='D' ? 'N' : (cur==='N' ? 'LP' : (cur==='LP' ? 'L' : '-'))));
      const att2 = getAttendance();
      att2[emp.id] = att2[emp.id] || {};
      att2[emp.id][ym] = att2[emp.id][ym] || {};
      if(next==='-' || (wknd && next==='WO')){ delete att2[emp.id][ym][day]; } else { att2[emp.id][ym][day] = next; }
      setAttendance(att2);
      renderAttendance(emp);
    };
    grid.onclick = handler;
    monthInput.onchange = () => renderAttendance(emp);
  }

  // Payslip
 // Payslip
function renderPayslip(emp){
  const monthInput = qs('#pay-month');
  const prev = qs('#payslip-preview');
  if(!monthInput || !prev) return;

  const ym = monthInput.value || new Date().toISOString().slice(0,7);
  monthInput.value = ym;

  const att = getAttendance()[emp.id]?.[ym] || {};
  const wd = workingDaysInMonth(ym);
  let paidWeekdays = 0, nightWeekdayCount = 0, weekendCount = 0;

  const [y,m] = ym.split('-').map(n=>parseInt(n,10));
  for(let d=1; d<=daysInMonth(ym); d++){
    const st = att[d];
    const wknd = isWeekend(y,m,d);
    if(st==='N' && !wknd) nightWeekdayCount++;
    if(wknd && st==='WOT') weekendCount++;
    if(!wknd){
      if(st==='D' || st==='N') paidWeekdays++;
      const leavePaid = !!getSettings().leavePaid;
      if(leavePaid && st==='L') paidWeekdays++;
    }
  }

  // Default-safe settings
  const s = { pfPct: 12, nightAllowance: 100, weekendAllowance: 1000, leavePaid: false, ...getSettings() };
  const sal = Number(emp.salary||0);
  const daily = wd ? (sal / wd) : 0;
  const grossBase = Math.round(daily * paidWeekdays);

  // Safe breakup
  const br = salaryBreakup(grossBase) || { basic:0,hra:0,conv:0,med:0,special:0,trans:0,total:grossBase };
  const pf = Math.round(br.basic * (Number(s.pfPct)/100));

  const nightRate = Number(s.nightAllowance);
  const nightAllowance = nightWeekdayCount * nightRate;
  const wotAllowed = (emp.wotAllowance !== false);
  const weekendRate = Number(s.weekendAllowance);
  const weekendAllowance = wotAllowed ? (weekendCount * weekendRate) : 0;

  const allowances = nightAllowance + weekendAllowance;
  const net = Math.max(0, br.total - pf) + allowances;
let dp=0,np=0,lp=0,l=0,weekendP=0,w=0;
for(let d=1; d<=daysInMonth(ym); d++){
  const st = att[d];
  const wknd = isWeekend(y,m,d);
  if(!wknd) w++;
  if(st==='D') dp++;
  else if(st==='N') np++;
  else if(st==='LP') lp++;
  else if(st==='L') l++;
  if(wknd && st==='WOT') weekendP++;
}
  // Format month name
  const ymLabel = new Date(ym+"-01").toLocaleDateString('en-US',{year:'numeric',month:'long'});

//   prev.innerHTML = `
//   <div style="
//       max-width:800px;
//       margin:auto;
//       font-family:Arial, Helvetica, sans-serif;
//       background:#fff;
//       color:#000000;    
//       border:1px solid #ccc;
//       border-radius:10px;
//       padding:30px 40px;
//       box-shadow:0 4px 12px rgba(0,0,0,0.1);
//   ">

//     <!-- Header with Logo -->
//     <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:3px solid #000; padding-bottom:15px; margin-bottom:25px;">
//       <div>
//         <h2 style="margin:0; color:#00aaff; font-weight:700;">Platoon Title Services LLC</h2>
//         <p style="margin:5px 0 0 0; font-size:14px; color:#555;">Employee Payslip – ${ymLabel}</p>
//       </div>
//       <div>
//         <img src="logo.jpg" alt="Platoon Title Services" style="height:60px;">
//       </div>
//     </div>

// <!-- Employee Details -->
// <h3 style="margin:0 0 12px 0; color:#000; font-weight:700; border-bottom:1px solid #bbb; padding-bottom:6px;">Employee Details</h3>
// <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; font-size:15px; margin-bottom:25px;">
//   <div><b>Employee Name:</b> ${esc(emp.name)}</div>
//   <div><b>Employee ID:</b> ${esc(emp.empId)}</div>
//   <div><b>Department:</b> ${esc(emp.department||'')}</div>
//   <div><b>Bank A/C No:</b> ${esc(emp.accountNumber||'')}</div>
//   <div><b>IFSC Code:</b> ${esc(emp.ifsc||'')}</div>
//   <div><b>Base Salary (Prorated):</b> ₹ ${Math.round(grossBase).toLocaleString()}</div>
// </div>


//   <!-- Attendance Summary -->
// <h3 style="margin:0 0 12px 0; color:#5555aa; font-weight:700; border-bottom:1px solid #bbb; padding-bottom:6px;">
//   Attendance Summary
// </h3>
// <table style="width:100%; border-collapse:collapse; font-size:15px; margin-bottom:25px;">
//   <thead>
//     <tr style="background:#f0f4ff; text-align:left;">
//       <th style="padding:8px; border:1px solid #ccc;">Component</th>
//       <th style="padding:8px; border:1px solid #ccc; text-align:right;">Days</th>
//     </tr>
//   </thead>
//   <tbody>
//     <tr>
//       <td style="padding:8px; border:1px solid #eee;">Total Working Days</td>
//       <td style="padding:8px; border:1px solid #eee; text-align:right;">${w}</td>
//     </tr>
//     <tr>
//       <td style="padding:8px; border:1px solid #eee;">Day Shifts</td>
//       <td style="padding:8px; border:1px solid #eee; text-align:right;">${dp}</td>
//     </tr>
//     <tr>
//       <td style="padding:8px; border:1px solid #eee;">Night Shifts</td>
//       <td style="padding:8px; border:1px solid #eee; text-align:right;">${np}</td>
//     </tr>
//     <tr>
//       <td style="padding:8px; border:1px solid #eee;">Leave (Paid)</td>
//       <td style="padding:8px; border:1px solid #eee; text-align:right;">${l}</td>
//     </tr>
//     <tr>
//       <td style="padding:8px; border:1px solid #eee;">Loss of Pay</td>
//       <td style="padding:8px; border:1px solid #eee; text-align:right;">${lp}</td>
//     </tr>
//     <tr>
//       <td style="padding:8px; border:1px solid #eee;">Weekend Worked</td>
//       <td style="padding:8px; border:1px solid #eee; text-align:right;">${weekendP}</td>
//     </tr>
//   </tbody>
// </table>


//     <!-- Earnings -->
// <h3 style="margin:0 0 12px 0; color:#00aaff; font-weight:700; border-bottom:1px solid #bbb; padding-bottom:6px;">
//   Earnings Breakdown
// </h3>
// <table style="width:100%; border-collapse:collapse; font-size:15px; margin-bottom:25px;">
//   <thead>
//     <tr style="background:#f0f8ff; text-align:left;">
//       <th style="padding:8px; border:1px solid #ccc;">Component</th>
//       <th style="padding:8px; border:1px solid #ccc; text-align:right;">Amount (₹)</th>
//     </tr>
//   </thead>
//   <tbody>
//     <tr>
//       <td style="padding:8px; border:1px solid #eee;">Basic Pay</td>
//       <td style="padding:8px; border:1px solid #eee; text-align:right;">${br.basic.toLocaleString()}</td>
//     </tr>
//     <tr>
//       <td style="padding:8px; border:1px solid #eee;">HRA</td>
//       <td style="padding:8px; border:1px solid #eee; text-align:right;">${br.hra.toLocaleString()}</td>
//     </tr>
//     <tr>
//       <td style="padding:8px; border:1px solid #eee;">Conveyance Allowance</td>
//       <td style="padding:8px; border:1px solid #eee; text-align:right;">${br.conv.toLocaleString()}</td>
//     </tr>
//     <tr>
//       <td style="padding:8px; border:1px solid #eee;">Medical Allowance</td>
//       <td style="padding:8px; border:1px solid #eee; text-align:right;">${br.med.toLocaleString()}</td>
//     </tr>
//     <tr>
//       <td style="padding:8px; border:1px solid #eee;">Special Allowance</td>
//       <td style="padding:8px; border:1px solid #eee; text-align:right;">${br.special.toLocaleString()}</td>
//     </tr>
//     <tr>
//       <td style="padding:8px; border:1px solid #eee;">Transportation Allowance</td>
//       <td style="padding:8px; border:1px solid #eee; text-align:right;">${br.trans.toLocaleString()}</td>
//     </tr>
//     <tr style="font-weight:bold; background:#f9f9f9;">
//       <td style="padding:8px; border:1px solid #ccc;">Total Earnings (Prorated)</td>
//       <td style="padding:8px; border:1px solid #ccc; text-align:right;">${br.total.toLocaleString()}</td>
//     </tr>
//   </tbody>
// </table>


//    <!-- Deductions -->
// <h3 style="margin:0 0 12px 0; color:#ff5555; font-weight:700; border-bottom:1px solid #bbb; padding-bottom:6px;">
//   Deductions
// </h3>
// <table style="width:100%; border-collapse:collapse; font-size:15px; margin-bottom:25px;">
//   <thead>
//     <tr style="background:#ffe6e6; text-align:left;">
//       <th style="padding:8px; border:1px solid #ccc;">Component</th>
//       <th style="padding:8px; border:1px solid #ccc; text-align:right;">Amount (₹)</th>
//     </tr>
//   </thead>
//   <tbody>
//     <tr>
//       <td style="padding:8px; border:1px solid #eee;">Provident Fund (PF)</td>
//       <td style="padding:8px; border:1px solid #eee; text-align:right;">${pf.toLocaleString()}</td>
//     </tr>
//   </tbody>
// </table>

// <!-- Additional Allowances -->
// <h3 style="margin:0 0 12px 0; color:#00cc66; font-weight:700; border-bottom:1px solid #bbb; padding-bottom:6px;">
//   Additional Allowances
// </h3>
// <table style="width:100%; border-collapse:collapse; font-size:15px; margin-bottom:25px;">
//   <thead>
//     <tr style="background:#e6fff0; text-align:left;">
//       <th style="padding:8px; border:1px solid #ccc;">Allowance</th>
//       <th style="padding:8px; border:1px solid #ccc; text-align:right;">Amount (₹)</th>
//     </tr>
//   </thead>
//   <tbody>
//     <tr>
//       <td style="padding:8px; border:1px solid #eee;">Night (Weekday) Allowance (₹${nightRate} × ${nightWeekdayCount})</td>
//       <td style="padding:8px; border:1px solid #eee; text-align:right;">${nightAllowance.toLocaleString()}</td>
//     </tr>
//     <tr>
//       <td style="padding:8px; border:1px solid #eee;">Weekend Allowance (₹${weekendRate} × ${weekendCount}, applied: ${wotAllowed ? "Yes" : "No"})</td>
//       <td style="padding:8px; border:1px solid #eee; text-align:right;">${weekendAllowance.toLocaleString()}</td>
//     </tr>
//   </tbody>
// </table>

// <!-- Net Pay -->
// <div style="margin-top:20px; padding-top:15px; border-top:3px solid #000; text-align:right; font-size:18px; font-weight:700;">
//   Net Pay: ₹ ${net.toLocaleString()}
// </div>


//     <!-- Footer -->
//     <div style="margin-top:25px; font-size:13px; text-align:center; color:#666;">
//       LP = Loss of Pay • WO = Week Off • WOT = Weekend Present
//     </div>
//   </div>
//   `;

//   <div style="
//       max-width:800px;
//       margin:auto;
//       font-family:Arial, Helvetica, sans-serif;
//       background:#fff;
//       color:#000000;    
//       border:1px solid #ccc;
//       border-radius:10px;
//       padding:30px 40px;
//       box-shadow:0 4px 12px rgba(0,0,0,0.1);
//       page-break-inside: avoid;
//   " class="payslip">

//     <!-- Header with Logo -->
//     <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:3px solid #000; padding-bottom:15px; margin-bottom:25px; page-break-inside: avoid;">
//       <div>
//         <h2 style="margin:0; color:#00aaff; font-weight:700;">Platoon Title Services LLC</h2>
//         <p style="margin:5px 0 0 0; font-size:14px; color:#555;">Employee Payslip – ${ymLabel}</p>
//       </div>
//       <div>
//         <img src="logo.jpg" alt="Platoon Title Services" style="height:60px;">
//       </div>
//     </div>

//     <!-- Employee Details -->
//     <h3 style="margin:0 0 12px 0; color:#000; font-weight:700; border-bottom:1px solid #bbb; padding-bottom:6px; page-break-after: avoid;">
//       Employee Details
//     </h3>
//     <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; font-size:15px; margin-bottom:25px; page-break-inside: avoid;">
//       <div><b>Employee Name:</b> ${esc(emp.name)}</div>
//       <div><b>Employee ID:</b> ${esc(emp.empId)}</div>
//       <div><b>Department:</b> ${esc(emp.department||'')}</div>
//       <div><b>Bank A/C No:</b> ${esc(emp.accountNumber||'')}</div>
//       <div><b>IFSC Code:</b> ${esc(emp.ifsc||'')}</div>
//       <div><b>Base Salary (Prorated):</b> ₹ ${Math.round(grossBase).toLocaleString()}</div>
//     </div>

//     <!-- Attendance Summary -->
//     <h3 style="margin:0 0 12px 0; color:#5555aa; font-weight:700; border-bottom:1px solid #bbb; padding-bottom:6px; page-break-after: avoid;">
//       Attendance Summary
//     </h3>
//     <table style="width:100%; border-collapse:collapse; font-size:15px; margin-bottom:25px; page-break-inside: avoid;">
//       <thead>
//         <tr style="background:#f0f4ff; text-align:left;">
//           <th style="padding:8px; border:1px solid #ccc;">Component</th>
//           <th style="padding:8px; border:1px solid #ccc; text-align:right;">Days</th>
//         </tr>
//       </thead>
//       <tbody>
//         <tr><td style="padding:8px; border:1px solid #eee;">Total Working Days</td><td style="padding:8px; border:1px solid #eee; text-align:right;">${w}</td></tr>
//         <tr><td style="padding:8px; border:1px solid #eee;">Day Shifts</td><td style="padding:8px; border:1px solid #eee; text-align:right;">${dp}</td></tr>
//         <tr><td style="padding:8px; border:1px solid #eee;">Night Shifts</td><td style="padding:8px; border:1px solid #eee; text-align:right;">${np}</td></tr>
//         <tr><td style="padding:8px; border:1px solid #eee;">Leave (Paid)</td><td style="padding:8px; border:1px solid #eee; text-align:right;">${l}</td></tr>
//         <tr><td style="padding:8px; border:1px solid #eee;">Loss of Pay</td><td style="padding:8px; border:1px solid #eee; text-align:right;">${lp}</td></tr>
//         <tr><td style="padding:8px; border:1px solid #eee;">Weekend Worked</td><td style="padding:8px; border:1px solid #eee; text-align:right;">${weekendP}</td></tr>
//       </tbody>
//     </table>

//     <!-- Earnings -->
//     <h3 style="margin:0 0 12px 0; color:#00aaff; font-weight:700; border-bottom:1px solid #bbb; padding-bottom:6px; page-break-after: avoid;">
//       Earnings Breakdown
//     </h3>
//     <table style="width:100%; border-collapse:collapse; font-size:15px; margin-bottom:25px; page-break-inside: avoid;">
//       <thead>
//         <tr style="background:#f0f8ff; text-align:left;">
//           <th style="padding:8px; border:1px solid #ccc;">Component</th>
//           <th style="padding:8px; border:1px solid #ccc; text-align:right;">Amount (₹)</th>
//         </tr>
//       </thead>
//       <tbody>
//         <tr><td style="padding:8px; border:1px solid #eee;">Basic Pay</td><td style="padding:8px; border:1px solid #eee; text-align:right;">${br.basic.toLocaleString()}</td></tr>
//         <tr><td style="padding:8px; border:1px solid #eee;">HRA</td><td style="padding:8px; border:1px solid #eee; text-align:right;">${br.hra.toLocaleString()}</td></tr>
//         <tr><td style="padding:8px; border:1px solid #eee;">Conveyance Allowance</td><td style="padding:8px; border:1px solid #eee; text-align:right;">${br.conv.toLocaleString()}</td></tr>
//         <tr><td style="padding:8px; border:1px solid #eee;">Medical Allowance</td><td style="padding:8px; border:1px solid #eee; text-align:right;">${br.med.toLocaleString()}</td></tr>
//         <tr><td style="padding:8px; border:1px solid #eee;">Special Allowance</td><td style="padding:8px; border:1px solid #eee; text-align:right;">${br.special.toLocaleString()}</td></tr>
//         <tr><td style="padding:8px; border:1px solid #eee;">Transportation Allowance</td><td style="padding:8px; border:1px solid #eee; text-align:right;">${br.trans.toLocaleString()}</td></tr>
//         <tr style="font-weight:bold; background:#f9f9f9;">
//           <td style="padding:8px; border:1px solid #ccc;">Total Earnings (Prorated)</td>
//           <td style="padding:8px; border:1px solid #ccc; text-align:right;">${br.total.toLocaleString()}</td>
//         </tr>
//       </tbody>
//     </table>

//     <!-- Deductions -->
//     <h3 style="margin:0 0 12px 0; color:#ff5555; font-weight:700; border-bottom:1px solid #bbb; padding-bottom:6px; page-break-after: avoid;">
//       Deductions
//     </h3>
//     <table style="width:100%; border-collapse:collapse; font-size:15px; margin-bottom:25px; page-break-inside: avoid;">
//       <thead>
//         <tr style="background:#ffe6e6; text-align:left;">
//           <th style="padding:8px; border:1px solid #ccc;">Component</th>
//           <th style="padding:8px; border:1px solid #ccc; text-align:right;">Amount (₹)</th>
//         </tr>
//       </thead>
//       <tbody>
//         <tr><td style="padding:8px; border:1px solid #eee;">Provident Fund (PF)</td><td style="padding:8px; border:1px solid #eee; text-align:right;">${pf.toLocaleString()}</td></tr>
//       </tbody>
//     </table>

//     <!-- Additional Allowances -->
//     <h3 style="margin:0 0 12px 0; color:#00cc66; font-weight:700; border-bottom:1px solid #bbb; padding-bottom:6px; page-break-after: avoid;">
//       Additional Allowances
//     </h3>
//     <table style="width:100%; border-collapse:collapse; font-size:15px; margin-bottom:25px; page-break-inside: avoid;">
//       <thead>
//         <tr style="background:#e6fff0; text-align:left;">
//           <th style="padding:8px; border:1px solid #ccc;">Allowance</th>
//           <th style="padding:8px; border:1px solid #ccc; text-align:right;">Amount (₹)</th>
//         </tr>
//       </thead>
//       <tbody>
//         <tr><td style="padding:8px; border:1px solid #eee;">Night (Weekday) Allowance (₹${nightRate} × ${nightWeekdayCount})</td><td style="padding:8px; border:1px solid #eee; text-align:right;">${nightAllowance.toLocaleString()}</td></tr>
//         <tr><td style="padding:8px; border:1px solid #eee;">Weekend Allowance (₹${weekendRate} × ${weekendCount}, applied: ${wotAllowed ? "Yes" : "No"})</td><td style="padding:8px; border:1px solid #eee; text-align:right;">${weekendAllowance.toLocaleString()}</td></tr>
//       </tbody>
//     </table>

//     <!-- Net Pay -->
//     <div style="margin-top:20px; padding-top:15px; border-top:3px solid #000; text-align:right; font-size:18px; font-weight:700; page-break-inside: avoid;">
//       Net Pay: ₹ ${net.toLocaleString()}
//     </div>

//     <!-- Footer -->
//     <div style="margin-top:25px; font-size:13px; text-align:center; color:#666; page-break-inside: avoid;">
//       LP = Loss of Pay • WO = Week Off • WOT = Weekend Present
//     </div>
//   </div>

//   <style>
//     @media print {
//       .payslip {
//         page-break-inside: avoid;
//         page-break-before: avoid;
//         page-break-after: avoid;
//       }
//       table, tr, td, th, div, h3 {
//         page-break-inside: avoid !important;
//       }
//       body {
//         -webkit-print-color-adjust: exact;
//         print-color-adjust: exact;
//       }
//     }
//   </style>
// `;
prev.innerHTML = `
  <div style="
      max-width:800px;
      margin:auto;
      font-family:Arial, Helvetica, sans-serif;
      background:#fff;
      color:#000000;    
      border:1px solid #ccc;
      border-radius:10px;
      padding:30px 40px;
      box-shadow:0 4px 12px rgba(0,0,0,0.1);
  ">

    <!-- Header with Logo -->
    <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:3px solid #000; padding-bottom:15px; margin-bottom:25px;">
      <div>
        <h2 style="margin:0; color:#00aaff; font-weight:700;">Platoon Title Services LLC</h2>
        <p style="margin:5px 0 0 0; font-size:14px; color:#555;">Employee Payslip – ${ymLabel}</p>
      </div>
      <div>
        <img src="logo.jpg" alt="Platoon Title Services" style="height:60px;">
      </div>
    </div>

<!-- Employee Details -->
<h3 style="margin:0 0 12px 0; color:#000; font-weight:700; border-bottom:1px solid #bbb; padding-bottom:6px;">Employee Details</h3>
<div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; font-size:15px; margin-bottom:25px;">
  <div><b>Employee Name:</b> ${esc(emp.name)}</div>
  <div><b>Employee ID:</b> ${esc(emp.empId)}</div>
  <div><b>Department:</b> ${esc(emp.department || '')}</div>
  <div><b>Bank A/C No:</b> ${esc(emp.accountNumber || '')}</div>
  <div><b>IFSC Code:</b> ${esc(emp.ifsc || '')}</div>
  <div><b>Base Salary (Prorated):</b> ₹ ${Math.round(grossBase).toLocaleString()}</div>
</div>


  <!-- Attendance Summary -->
<h3 style="margin:0 0 12px 0; color:#5555aa; font-weight:700; border-bottom:1px solid #bbb; padding-bottom:6px;">
  Attendance Summary
</h3>
<table style="width:100%; border-collapse:collapse; font-size:15px; margin-bottom:25px;">
  <thead>
    <tr style="background:#f0f4ff; text-align:left;">
      <th style="padding:8px; border:1px solid #ccc;">Component</th>
      <th style="padding:8px; border:1px solid #ccc; text-align:right;">Days</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding:8px; border:1px solid #eee;">Total Working Days</td>
      <td style="padding:8px; border:1px solid #eee; text-align:right;">${w}</td>
    </tr>
    <tr>
      <td style="padding:8px; border:1px solid #eee;">Day Shifts</td>
      <td style="padding:8px; border:1px solid #eee; text-align:right;">${dp}</td>
    </tr>
    <tr>
      <td style="padding:8px; border:1px solid #eee;">Night Shifts</td>
      <td style="padding:8px; border:1px solid #eee; text-align:right;">${np}</td>
    </tr>
    <tr>
      <td style="padding:8px; border:1px solid #eee;">Leave (Paid)</td>
      <td style="padding:8px; border:1px solid #eee; text-align:right;">${l}</td>
    </tr>
    <tr>
      <td style="padding:8px; border:1px solid #eee;">Loss of Pay</td>
      <td style="padding:8px; border:1px solid #eee; text-align:right;">${lp}</td>
    </tr>
    <tr>
      <td style="padding:8px; border:1px solid #eee;">Weekend Worked</td>
      <td style="padding:8px; border:1px solid #eee; text-align:right;">${weekendP}</td>
    </tr>
  </tbody>
</table>


    <!-- Earnings -->
<h3 style="margin:0 0 12px 0; color:#00aaff; font-weight:700; border-bottom:1px solid #bbb; padding-bottom:6px;">
  Earnings Breakdown
</h3>
<table style="width:100%; border-collapse:collapse; font-size:15px; margin-bottom:25px;">
  <thead>
    <tr style="background:#f0f8ff; text-align:left;">
      <th style="padding:8px; border:1px solid #ccc;">Component</th>
      <th style="padding:8px; border:1px solid #ccc; text-align:right;">Amount (₹)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding:8px; border:1px solid #eee;">Basic Pay</td>
      <td style="padding:8px; border:1px solid #eee; text-align:right;">${br.basic.toLocaleString()}</td>
    </tr>
    <tr>
      <td style="padding:8px; border:1px solid #eee;">HRA</td>
      <td style="padding:8px; border:1px solid #eee; text-align:right;">${br.hra.toLocaleString()}</td>
    </tr>
    <tr>
      <td style="padding:8px; border:1px solid #eee;">Conveyance Allowance</td>
      <td style="padding:8px; border:1px solid #eee; text-align:right;">${br.conv.toLocaleString()}</td>
    </tr>
    <tr>
      <td style="padding:8px; border:1px solid #eee;">Medical Allowance</td>
      <td style="padding:8px; border:1px solid #eee; text-align:right;">${br.med.toLocaleString()}</td>
    </tr>
    <tr>
      <td style="padding:8px; border:1px solid #eee;">Special Allowance</td>
      <td style="padding:8px; border:1px solid #eee; text-align:right;">${br.special.toLocaleString()}</td>
    </tr>
    <tr>
      <td style="padding:8px; border:1px solid #eee;">Transportation Allowance</td>
      <td style="padding:8px; border:1px solid #eee; text-align:right;">${br.trans.toLocaleString()}</td>
    </tr>
    <tr style="font-weight:bold; background:#f9f9f9;">
      <td style="padding:8px; border:1px solid #ccc;">Total Earnings (Prorated)</td>
      <td style="padding:8px; border:1px solid #ccc; text-align:right;">${br.total.toLocaleString()}</td>
    </tr>
  </tbody>
</table>


    <!-- Deductions -->
<h3 style="margin:0 0 12px 0; color:#ff5555; font-weight:700; border-bottom:1px solid #bbb; padding-bottom:6px;">
  Deductions
</h3>
<table style="width:100%; border-collapse:collapse; font-size:15px; margin-bottom:25px;">
  <thead>
    <tr style="background:#ffe6e6; text-align:left;">
      <th style="padding:8px; border:1px solid #ccc;">Component</th>
      <th style="padding:8px; border:1px solid #ccc; text-align:right;">Amount (₹)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding:8px; border:1px solid #eee;">Provident Fund (PF)</td>
      <td style="padding:8px; border:1px solid #eee; text-align:right;">${pf.toLocaleString()}</td>
    </tr>
  </tbody>
</table>

<!-- Additional Allowances -->
<h3 style="margin:0 0 12px 0; color:#00cc66; font-weight:700; border-bottom:1px solid #bbb; padding-bottom:6px;">
  Additional Allowances
</h3>
<table style="width:100%; border-collapse:collapse; font-size:15px; margin-bottom:25px;">
  <thead>
    <tr style="background:#e6fff0; text-align:left;">
      <th style="padding:8px; border:1px solid #ccc;">Allowance</th>
      <th style="padding:8px; border:1px solid #ccc; text-align:right;">Amount (₹)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding:8px; border:1px solid #eee;">Night (Weekday) Allowance (₹${nightRate} × ${nightWeekdayCount})</td>
      <td style="padding:8px; border:1px solid #eee; text-align:right;">${nightAllowance.toLocaleString()}</td>
    </tr>
    <tr>
      <td style="padding:8px; border:1px solid #eee;">Weekend Allowance (₹${weekendRate} × ${weekendCount}, applied: ${wotAllowed ? "Yes" : "No"})</td>
      <td style="padding:8px; border:1px solid #eee; text-align:right;">${weekendAllowance.toLocaleString()}</td>
    </tr>
  </tbody>
</table>

<!-- Net Pay -->
<div style="margin-top:20px; padding-top:15px; border-top:3px solid #000; text-align:right; font-size:18px; font-weight:700;">
  Net Pay: ₹ ${net.toLocaleString()}
</div>


    <!-- Footer -->
    <div style="margin-top:25px; font-size:13px; text-align:center; color:#666;">
      LP = Loss of Pay • WO = Week Off • WOT = Weekend Present
    </div>
  </div>
  `;

  const printBtn = qs('#btn-print-payslip');
  if(printBtn) printBtn.onclick = () => {
    const w = window.open('', '_blank');
    w.document.write(`
      <html>
        <head>
          <title>Payslip</title>
          <style>
            body { font-family: Arial, sans-serif; }
            .line { display:flex; justify-content:space-between; }
          </style>
        </head>
        <body>${prev.outerHTML}</body>
      </html>
    `);
    w.document.close();
    w.focus(); 
    w.print(); 
    w.close();
  };
}

qs('#btn-generate-payslip')?.addEventListener('click', () => {
  if(!editingId) return;
  const emp = data.find(r => r.id === editingId);
  if(emp) renderPayslip(emp);
});


  // Offer Letter (detailed; no % in annexure labels; monthly/yearly tables; Company = Platoon Title Services)
  function renderOfferLetter(emp){
    const s = getSettings();
    const baseMonthly = Number(emp.salary||0);
    const br = salaryBreakup(baseMonthly);
    const pfPct = Number(s.pfPct ?? 12);
    const pfAmt = Math.round(br.basic * (pfPct/100));
    const today = new Date().toISOString().slice(0,10);
    const mo = (n)=>`₹ ${Math.round(n).toLocaleString()}`;
    const yr = (n)=>`₹ ${Math.round(n*12).toLocaleString()}`;

    const rows = [
      ['Basic Pay', br.basic],
      ['HRA', br.hra],
      ['Conveyance Allowance', br.conv],
      ['Medical Allowance', br.med],
      ['Special Allowance', br.special],
      ['Transportation Allowance', br.trans],
    ];
    const totalMo = br.total;

    const offer = document.getElementById('offer-preview');
    if(!offer) return;
offer.innerHTML = `
  <div style="
    max-width: 800px;
    margin: 40px auto;
    padding: 60px 50px 40px; /* Extra top padding so logo doesn't clash with address */
    background: #ffffff;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-family: 'Segoe UI', Arial, sans-serif;
    line-height: 1.7;
    color: #333;
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    position: relative;
  ">
    <!-- Address block (top-right) -->
    <div style="
      position: absolute;
      top: 20px;
      right: 20px;
      text-align: right;
      font-size: 12px;
      color: #555;
      line-height: 1.6;
    ">
     
    </div>

    <!-- Header with Logo -->
    <div style="text-align:center; margin-bottom:30px; margin-top:30px;">
      <img src="logo.jpg" alt="Platoon Title Services Logo"
           style="max-height:90px; margin-bottom:10px; display:block; margin-left:auto; margin-right:auto;">
      <h2 style="margin:0; font-weight:700; color:#000;">Platoon Title Services</h2>
      <p style="margin:5px 0 0; font-size:14px; color:#555;">Offer Letter</p>
      <div style="margin-top:5px; font-size:12px; color:#777;">${today}</div>
    </div>

    <!-- Body -->
    <p>Dear <b>${esc(emp.name)}</b>,</p>

    <p>
      We are pleased to extend to you an offer of employment with
      <b>Platoon Title Services</b> (“Company”) in our Business Process Outsourcing (BPO) operations.
      Your tentative date of joining is <b>${esc(emp.joiningDate || 'TBD')}</b>,
      reporting to the ${esc(emp.department || 'assigned')} department.
      Your compensation structure is provided in the annexures.
    </p>

    <h3 style="margin-top:30px; color:#000;">1. Position, Location & Reporting</h3>
    <p>You will be designated as <b>${esc(emp.department || 'BPO Associate')}</b> (designation may be finalized post-induction) and shall report to the manager assigned by the Company. Your primary work location and shift timing may change in line with business needs.</p>

    <h3 style="margin-top:25px; color:#000;">2. Working Hours & Shifts</h3>
    <ul style="margin-top:8px;">
      <li>The Company operates 24×7 across multiple time zones. You may be scheduled for day or night shifts as per process requirements.</li>
      <li>Breaks and weekly offs are as per roster. Overtime, if any, will follow Company policy.</li>
      <li>Night presence on weekdays may qualify for a night shift allowance as per current policy settings.</li>
    </ul>

    <h3 style="margin-top:25px; color:#000;">3. Probation & Confirmation</h3>
    <ul>
      <li>Your probation period is three (3) months from the date of joining. The Company may extend the probation at its discretion.</li>
      <li>Confirmation is subject to satisfactory performance, conduct, and compliance with Company policies.</li>
    </ul>

    <h3 style="margin-top:25px; color:#000;">4. Compensation</h3>
    <p>Your monthly compensation structure is presented in <b>Annexure A</b>. Statutory deductions such as PF and any applicable taxes will be deducted as per law and Company policy. Allowances for night shifts or weekend work (if applicable to your role) are separate from the monthly structure.</p>

    <h3 style="margin-top:25px; color:#000;">5. Attendance, Leave & Holidays</h3>
    <ul>
      <li>Attendance must be recorded through Company-approved systems. Any loss of pay (LP) due to absence will be applied as per policy.</li>
      <li>Leave is governed by Company policy; paid or unpaid leave may apply as configured by the Company.</li>
      <li>Holiday calendars may vary by client geography and process requirements.</li>
    </ul>

    <h3 style="margin-top:25px; color:#000;">6. Code of Conduct</h3>
    <ul>
      <li>You are expected to demonstrate professional behavior and maintain integrity in all interactions.</li>
      <li>Harassment, discrimination, and misconduct are strictly prohibited and will result in disciplinary action.</li>
      <li>Company assets and facilities must be used responsibly and solely for business purposes.</li>
    </ul>

    <h3 style="margin-top:25px; color:#000;">7. Confidentiality, IP & Non-Solicitation</h3>
    <ul>
      <li>You shall maintain strict confidentiality of all proprietary and client information, both during employment and thereafter.</li>
      <li>All work products created in the course of employment shall be the exclusive property of the Company.</li>
      <li>You agree not to solicit Company employees, clients, or vendors for a defined period post-separation, as per policy.</li>
    </ul>

    <h3 style="margin-top:25px; color:#000;">8. Information Security & Data Protection</h3>
    <ul>
      <li><b>Access Control:</b> Use only authorized accounts/devices; do not share passwords; enable MFA where required.</li>
      <li><b>Acceptable Use:</b> Personal email, cloud storage, or removable media must not be used for Company/client data.</li>
      <li><b>Clean Desk & Screen:</b> Prevent unauthorized viewing; lock screens when away; secure printouts and shred when disposed.</li>
      <li><b>Data Handling:</b> Process data strictly on a need-to-know basis; follow client-specific handling and retention rules.</li>
      <li><b>DLP & Monitoring:</b> Systems may be monitored/logged. You consent to monitoring consistent with policy and law.</li>
      <li><b>Incident Reporting:</b> Immediately report suspected data loss, malware, phishing, or policy violations to InfoSec.</li>
      <li><b>Physical Security:</b> Wear ID badges, comply with visitor protocols, and prevent tailgating into secure areas.</li>
      <li><b>Third-Party & Cross-Border:</b> Follow contractual and legal requirements when handling client data from other jurisdictions.</li>
      <li><b>Remote Work & BYOD:</b> Comply with VPN, device encryption, and endpoint protection policies; do not store client data locally.</li>
      <li><b>NDA & Client-Specific Clauses:</b> You will sign and comply with additional NDAs and security addenda required by client projects.</li>
    </ul>

    <h3 style="margin-top:25px; color:#000;">9. Training & Quality</h3>
    <ul>
      <li>Completion of induction, process, security, and compliance trainings is mandatory within specified timelines.</li>
      <li>Adherence to SLAs, quality benchmarks, and escalation protocols is required.</li>
    </ul>

    <h3 style="margin-top:25px; color:#000;">10. Background Verification</h3>
    <p>This offer is contingent on satisfactory background verification. Any misrepresentation may result in withdrawal/termination.</p>

    <h3 style="margin-top:25px; color:#000;">11. Anti-Bribery, Equal Opportunity & Safety</h3>
    <ul>
      <li>Compliance with anti-bribery/anti-corruption laws and Company policy is required.</li>
      <li>The Company is an equal opportunity employer.</li>
      <li>Follow health, safety and emergency procedures while at work or on client premises.</li>
    </ul>

    <h3 style="margin-top:25px; color:#000;">12. Separation</h3>
    <ul>
      <li>Either party may terminate employment with notice or payment in lieu as per policy and applicable law.</li>
      <li>On separation, return all Company assets and delete any Company/client data from personal custody.</li>
    </ul>

    <h3 style="margin-top:25px; color:#000;">13. Acceptance</h3>
    <p>Please sign and return a copy of this letter to indicate acceptance. By joining, you agree to comply with Company policies as amended from time to time.</p>

    <!-- Compensation Table -->
    <h3 style="margin-top:30px; color:#000;">Annexure A – Compensation Structure (Monthly & Yearly)</h3>
    <table style="width:100%; border-collapse:collapse; margin-top:10px;" border="1" cellpadding="8">
      <thead style="background:#f5f5f5;">
        <tr>
          <th align="left">Component</th>
          <th align="right">Monthly (INR)</th>
          <th align="right">Yearly (INR)</th>
        </tr>
      </thead>
      <tbody>
        ${rows.map(r => `
          <tr>
            <td>${r[0]}</td>
            <td align="right">${mo(r[1])}</td>
            <td align="right">${yr(r[1])}</td>
          </tr>`).join('')}
        <tr style="background:#f9fafb;">
          <td><b>Total Earnings</b></td>
          <td align="right"><b>${mo(totalMo)}</b></td>
          <td align="right"><b>${yr(totalMo)}</b></td>
        </tr>
      </tbody>
    </table>
    <small style="display:block; margin-top:8px; color:#555;">Note: The above reflects the monthly structure configured by the Company. Allowances for night/weekend work, if applicable, are paid separately as per policy.</small>

    <!-- Deductions Table -->
    <h3 style="margin-top:30px; color:#000;">Annexure B – Statutory Deductions (Illustrative)</h3>
    <table style="width:100%; border-collapse:collapse; margin-top:10px;" border="1" cellpadding="8">
      <thead style="background:#f5f5f5;">
        <tr>
          <th align="left">Deduction</th>
          <th align="right">Monthly (INR)</th>
          <th align="right">Yearly (INR)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Provident Fund (PF)</td>
          <td align="right">${mo(pfAmt)}</td>
          <td align="right">${yr(pfAmt)}</td>
        </tr>
      </tbody>
    </table>
    <small style="display:block; margin-top:8px; color:#555;">Figures are indicative and subject to change as per applicable law and policy.</small>

    <p style="margin-top:30px;">Regards,<br><b>HR – Platoon Title Services</b></p>
  </div>
`;



  }
  document.getElementById('btn-generate-offer')?.addEventListener('click', () => {
    if(!editingId) return alert('Open an employee via Edit first.');
    const emp = data.find(r => r.id===editingId);
    if(emp) renderOfferLetter(emp);
  });
  document.getElementById('btn-print-offer')?.addEventListener('click', () => {
    const prev = document.getElementById('offer-preview');
    if(!prev || !prev.innerHTML.trim()) return alert('Generate the offer letter first.');
    const w = window.open('', '_blank');
    w.document.write('<html><head><title>Offer Letter</title></head><body>'+prev.outerHTML+'</body></html>');
    w.document.close(); w.focus(); w.print(); w.close();
  });

  // Filtering helper
  function getFiltered(){
    const term = (els.search?.value || '').trim().toLowerCase();
    return data.filter(r => {
      const s = computeStatus(r);
      const t = monthsBetween(r.joiningDate, r.exitDate || '');
      const onProb = (s==='Active' && t<=3);
      if(currentQueue==='active' && s!=='Active') return false;
      if(currentQueue==='inactive' && s!=='Inactive') return false;
      if(currentQueue==='probation' && !onProb) return false;
      if(!term) return true;
      const hay = [r.name,r.empId,r.personalEmail,r.officialEmail,r.department,r.ifsc,r.pan,r.aadhar,(r.status||'')].join(' ').toLowerCase();
      return hay.includes(term);
    });
  }

  // Render
async function renderTable() {
  if (!window.data) return; // safety check
  const tbody = document.querySelector('#emp-table tbody');
  tbody.innerHTML = '';

  // Counters
  let cAll = 0, cAct = 0, cInact = 0, cProb = 0;
  const term = (document.querySelector('#search')?.value || '').trim().toLowerCase();

  // Filter data based on queue and search
  const filtered = data.filter(r => {
    const s = computeStatus(r);
    const t = monthsBetween(r.joiningDate, r.exitDate || '');
    const onProb = (s === 'Active' && t <= 3);

    cAll++;
    if (s === 'Active') cAct++; else cInact++;
    if (onProb) cProb++;

    if (currentQueue === 'active' && s !== 'Active') return false;
    if (currentQueue === 'inactive' && s !== 'Inactive') return false;
    if (currentQueue === 'probation' && !onProb) return false;

    if (!term) return true;
    const hay = [r.name,r.empId,r.personalEmail,r.officialEmail,r.department,r.ifsc,r.pan,r.aadhar,(r.status||'')].join(' ').toLowerCase();
    return hay.includes(term);
  });

  // Update queue counts
  const qAll = document.getElementById('q-all');
  const qActive = document.getElementById('q-active');
  const qInactive = document.getElementById('q-inactive');
  const qProb = document.getElementById('q-probation');

  if(qAll) qAll.textContent = cAll;
  if(qActive) qActive.textContent = cAct;
  if(qInactive) qInactive.textContent = cInact;
  if(qProb) qProb.textContent = cProb;

  // Build table rows
  const rowsHtml = filtered.map((r, idx) => {
    const t = monthsBetween(r.joiningDate, r.exitDate || '');
    const s = computeStatus(r);
    const prob = (s === 'Active' && t <= 3);
    const chipClass = s === 'Inactive' ? 'status-inactive' : (prob ? 'status-prob' : 'status-active');
    const chipText = prob ? 'Probation' : s;

    return `<tr>
      <td class="checkbox-col">
        <input type="checkbox" class="row-select" data-id="${r.id}" ${selectedIds.has(r.id)?'checked':''}/>
      </td>
      <td>${idx+1}</td>
      <td>${esc(r.name)}</td>
      <td>${esc(r.empId)}</td>
      <td>${esc(r.personalEmail)}</td>
      <td>${esc(r.officialEmail)}</td>
      <td>${esc(r.department||'')}</td>
      <td>${esc(fmtDate(r.joiningDate))}</td>
      <td>${esc(fmtDate(r.dob))}</td>
      <td class="mono">₹ ${Number(r.salary||0).toLocaleString()}</td>
      <td>${esc(fmtDate(r.exitDate))}</td>
      <td class="mono">${t}</td>
      <td><span class="status-chip ${chipClass}">${chipText}</span></td>
      <td>${esc(r.bloodGroup)}</td>
      <td>${esc(r.personalPhone)}</td>
      <td>${esc(r.emergencyContact)}</td>
      <td class="mono">${esc(r.accountNumber)}</td>
      <td class="mono">${esc(r.ifsc)}</td>
      <td class="mono">${esc(r.pan)}</td>
      <td class="mono">${esc(r.aadhar)}</td>
      <td>
        <button class="btn small view" data-id="${r.id}">View</button>
        <button class="btn small edit" data-id="${r.id}">Edit</button>
        <button class="btn small danger delete" data-id="${r.id}">Delete</button>
      </td>
    </tr>`;
  }).join('');

  tbody.innerHTML = rowsHtml || `<tr><td colspan="21" class="muted" style="text-align:center;padding:16px">No employees yet.</td></tr>`;
  
  // Attach event listeners for buttons
  tbody.querySelectorAll('.view').forEach(btn => {
    btn.addEventListener('click', async e => {
      const id = e.currentTarget.dataset.id;
      const resp = await fetch(`${API_BASE}?action=get&id=${id}`);
      const json = await resp.json();
      if (!json.ok) return alert('Failed to load employee data');
      const emp = json.data;

      const details = `
Name: ${emp.name}
Employee ID: ${emp.empId}
Department: ${emp.department}
Personal Email: ${emp.personalEmail}
Official Email: ${emp.officialEmail}
Blood Group: ${emp.bloodGroup}
Personal Phone: ${emp.personalPhone}
Emergency Contact: ${emp.emergencyContact}
Joining Date: ${fmtDate(emp.joiningDate)}
DOB: ${fmtDate(emp.dob)}
Salary: ₹${emp.salary}
Exit Date: ${fmtDate(emp.exitDate)}
Tenure: ${monthsBetween(emp.joiningDate, emp.exitDate)} months
Status: ${emp.status}
Account #: ${emp.accountNumber}
IFSC: ${emp.ifsc}
PAN: ${emp.pan}
Aadhar: ${emp.aadhar}
      `;
      alert(details);
    });
  });

  tbody.querySelectorAll('.edit').forEach(btn => {
    btn.addEventListener('click', async e => {
      const id = e.currentTarget.dataset.id;
      const resp = await fetch(`${API_BASE}?action=get&id=${id}`);
      const json = await resp.json();
      if(json.ok) openEditModal(json.data);
    });
  });

  tbody.querySelectorAll('.delete').forEach(btn => {
    btn.addEventListener('click', async e => {
      const id = e.currentTarget.dataset.id;
      if(!confirm('Delete employee #' + id + '?')) return;
      const form = new FormData();
      form.append('id', id);
      const res = await apiFetch('delete', 'POST', form);
      if(res.ok) loadEmployees(); // reload table
    });
  });

  // Select-all checkbox
  const selAll = document.getElementById('select-all');
  if(selAll){
    const allSelected = filtered.length>0 && filtered.every(r=>selectedIds.has(r.id));
    const someSelected = filtered.some(r=>selectedIds.has(r.id));
    selAll.checked = allSelected;
    selAll.indeterminate = !allSelected && someSelected;
  }

  updateSelectedCount();
}
window.currentQueue = window.currentQueue || 'all'; // make sure it's defined globally
// Queues
function bindQueueButtons() {
  const buttons = qsa('#queues .qbtn');
  if (!buttons || buttons.length === 0) return;

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // set with safe default
      window.currentQueue = btn.getAttribute('data-q') || 'all';

      loadEmployees();
    });
  });
}



// initialize after DOM ready
document.addEventListener('DOMContentLoaded', () => {
  bindQueueButtons();
  loadEmployees(); // will use default 'all' if user hasn't clicked anything
});

// Save employee (add or update)
async function saveEmployee(emp, isEdit=false) {
  let form = new FormData();
  Object.keys(emp).forEach(k => form.append(k, emp[k]));
  const url = isEdit ? "employee.php?action=update" : "employee.php?action=add";
  await fetch(url, { method:"POST", body:form });
  // fetchEmployees();
  loadEmployees();
}


  // Events
  // Login/Logout
  els.loginForm?.addEventListener('submit', e => {
    e.preventDefault();
    const s = getSettings();
    if(els.loginUser.value === s.username && els.loginPass.value === s.password){ setAuthed(true); showMain(); }
    else alert('Invalid credentials');
  });
  els.logout?.addEventListener('click', () => { setAuthed(false); showLogin(); });

  // Add
  els.add?.addEventListener('click', () => openModal('Add Employee', null));

// Edit (delegated)
els.tableBody?.addEventListener('click', async (e) => {
  const btn = e.target.closest('button[data-act="edit"]');
  if (!btn) return;

  const id = btn.getAttribute('data-id');
  if (!id) return alert('Invalid record ID');

  try {
    // Call your API to fetch that employee
    const res = await fetch(`api.php?action=get&id=${id}`);
    const json = await res.json();

    if (!json.ok) {
      return alert('Record not found in database');
    }

    // Open modal with the data returned from API
    openModal('Edit Employee', json.data);

  } catch (err) {
    console.error('Fetch error:', err);
    alert('Error fetching record');
  }
});


  // Row selection
  els.tableBody?.addEventListener('change', (e) => {
    const cb = e.target.closest('.row-select');
    if(!cb) return;
    const id = cb.getAttribute('data-id');
    if(cb.checked) selectedIds.add(id); else selectedIds.delete(id);
    const selAll = document.getElementById('select-all');
    const filtered = getFiltered();
    const allSelected = filtered.length>0 && filtered.every(r => selectedIds.has(r.id));
    if(selAll){
      selAll.checked = allSelected;
      selAll.indeterminate = !allSelected && filtered.some(r => selectedIds.has(r.id));
    }
    updateSelectedCount();
  });

  // Select All
  document.addEventListener('change', (e) => {
    if(e.target && e.target.id === 'select-all'){
      const checked = e.target.checked;
      const filtered = getFiltered();
      if(checked){ filtered.forEach(r => selectedIds.add(r.id)); }
      else { filtered.forEach(r => selectedIds.delete(r.id)); }
      renderTable();
    }
  });

  // Delete Selected
  els.deleteSelected?.addEventListener('click', () => {
    const count = selectedIds.size;
    if(count === 0) return alert('No employees selected.');
    if(!confirm(`Delete ${count} selected employee(s)?`)) return;
    data = data.filter(r => !selectedIds.has(r.id));
    selectedIds.clear();
    setData(data);
    renderTable();
  });

  // Modal buttons
  modal.close?.addEventListener('click', () => closeAllModals());
  modal.form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(modal.form);
    const rec = Object.fromEntries(fd.entries());
    rec.ifsc = (rec.ifsc||'').toUpperCase();
    rec.pan = (rec.pan||'').toUpperCase();
    rec.salary = Number(rec.salary || 0);
    rec.wotAllowance = !!fd.get('wotAllowance');
    rec.status = (rec.status==='Inactive') ? 'Inactive' : 'Active';
    rec.id = editingId || uid();

    if(rec.ifsc && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(rec.ifsc)) return alert('Invalid IFSC format (e.g., HDFC0001234)');
    if(rec.pan && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(rec.pan)) return alert('Invalid PAN format (ABCDE1234F)');
    if(rec.aadhar && !/^[0-9]{12}$/.test(rec.aadhar)) return alert('Aadhar must be 12 digits');

    const idx = data.findIndex(x => x.id === rec.id);
    if(idx >= 0) data[idx] = {...data[idx], ...rec};
    else data.push(rec);
    setData(data);
    renderTable();
    closeAllModals();
  });

  // Search
  els.search?.addEventListener('input', renderTable);

  // Export / Import (single JSON import)
  els.exportBtn?.addEventListener('click', () => {
    const s = getSettings();
    const dt = new Date().toISOString().replace(/[:T]/g,'-').slice(0,19);
    download(`EmployeeData_${dt}.json`, JSON.stringify(data, null, 2));
    // alert(`Choose your folder when saving.\nHint: ${s.storageHint}`);
  });
  els.exportCsvBtn?.addEventListener('click', () => {
    if(!data.length) return alert('No data to export');
    const rows = data.map(r => ({
      name:r.name, empId:r.empId, personalEmail:r.personalEmail, officialEmail:r.officialEmail, department:(r.department||''),
      joiningDate:r.joiningDate, dob:r.dob, salary:(r.salary||0), exitDate:r.exitDate, tenureMonths:monthsBetween(r.joiningDate, r.exitDate||''),
      status:computeStatus(r), bloodGroup:r.bloodGroup, personalPhone:r.personalPhone, emergencyContact:r.emergencyContact,
      accountNumber:r.accountNumber, ifsc:r.ifsc, pan:r.pan, aadhar:r.aadhar, wotAllowance:(r.wotAllowance!==false)
    }));
    const dt = new Date().toISOString().split('T')[0];
    downloadCsv(`EmployeeData_${dt}.csv`, rows);
  });
  els.importFile?.addEventListener('change', (e) => {
    const file = e.target.files[0]; if(!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try{
        const arr = JSON.parse(reader.result);
        if(!Array.isArray(arr)) throw new Error('Bad JSON structure');
        data = arr.map(x => ({ id: x.id || uid(), ...x }));
        setData(data);
        selectedIds.clear();
        renderTable();
        alert('Import successful');
      }catch(err){ alert('Import failed: ' + err.message); }
      finally { els.importFile.value = ''; }
    };
    reader.readAsText(file);
  });

  // Settings
  els.settingsBtn?.addEventListener('click', () => {
    const s = getSettings();
    const f = els.settingsForm;
    f.storageHint.value = s.storageHint || '';
    f.username.value = s.username || '';
    f.password.value = '';
    f.pfPct.value = (s.pfPct ?? 12); // if you want change pf 0 change it here
    f.leavePaid.checked = (s.leavePaid !== false);
    f.nightAllowance.value = (s.nightAllowance ?? 100);
    f.weekendAllowance.value = (s.weekendAllowance ?? 1000);
    els.settingsModal.classList.remove('hidden');
    document.body.classList.add('modal-open');
  });
  els.settingsClose?.addEventListener('click', () => closeAllModals());
  els.settingsForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(els.settingsForm);
    const s = getSettings();
    const next = {...s};
    if(fd.get('storageHint')) next.storageHint = fd.get('storageHint');
    if(fd.get('username')) next.username = fd.get('username');
    if(fd.get('password')) next.password = fd.get('password');
    if(fd.get('pfPct')!==null && fd.get('pfPct')!=='') next.pfPct = Number(fd.get('pfPct'));
    next.leavePaid = !!fd.get('leavePaid');
    if(fd.get('nightAllowance')!==null && fd.get('nightAllowance')!=='') next.nightAllowance = Number(fd.get('nightAllowance'));
    if(fd.get('weekendAllowance')!==null && fd.get('weekendAllowance')!=='') next.weekendAllowance = Number(fd.get('weekendAllowance'));
    setSettings(next);
    closeAllModals();
    alert('Settings saved');
  });

  // Attendance CSV export (all employees for selected month)
  els.exportAttCsv?.addEventListener('click', () => {
    const monthInput = document.getElementById('att-month');
    const ym = (monthInput?.value) || new Date().toISOString().slice(0,7);
    const att = getAttendance();
    const totalDays = daysInMonth(ym);
    const [y,m] = ym.split('-').map(n=>parseInt(n,10));

    const headers = ['empId','name'].concat(Array.from({length: totalDays}, (_,i)=>`D${i+1}`)).concat(['DP','NP','LP','L','WeekendP']);
    const rows = [];

    data.forEach(emp => {
      const map = (att[emp.id] && att[emp.id][ym]) ? att[emp.id][ym] : {};
      let dp=0,np=0,lp=0,l=0,weekendP=0;
      const statusByDay = [];
      for(let d=1; d<=totalDays; d++){
        const wknd = isWeekend(y,m,d);
        let st = map[d];
        if(!st) st = wknd ? 'WO' : '-';
        if(st==='D') dp++; else if(st==='N') { np++; } else if(st==='LP') lp++; else if(st==='L') l++;
        if(wknd && st==='WOT') weekendP++;
        statusByDay.push(st);
      }
      rows.push(Object.fromEntries(
        headers.map((h, idx) => {
          if(idx===0) return ['empId', emp.empId];
          if(idx===1) return ['name', emp.name];
          if(idx>=2 && idx<2+totalDays) return [h, statusByDay[idx-2]];
          if(h==='DP') return ['DP', dp];
          if(h==='NP') return ['NP', np];
          if(h==='LP') return ['LP', lp];
          if(h==='L') return ['L', l];
          if(h==='WeekendP') return ['WeekendP', weekendP];
        })
      ));
    });

    const dt = new Date().toISOString().replace(/[:T]/g,'-').slice(0,19);
    downloadCsv(`Attendance_${ym}_${dt}.csv`, rows);
  });

  // --- Bulk Import ---
  els.bulkImportBtn?.addEventListener('click', () => {
    els.bulkModal.classList.remove('hidden');
    document.body.classList.add('modal-open');
  });
  els.bulkClose?.addEventListener('click', () => closeAllModals());
  els.bulkModal?.addEventListener('click', (e) => { if(e.target === els.bulkModal){ closeAllModals(); } });
  els.tmplCsvBtn?.addEventListener('click', () => downloadTemplates('csv'));
  els.tmplJsonBtn?.addEventListener('click', () => downloadTemplates('json'));
  els.chooseFolderBtn?.addEventListener('click', () => { els.bulkFolder?.click(); });

  function parseCSV(text){
    const rows=[]; let row=[]; let field=''; let i=0; const s=text.replace(/\r\n?/g,'\n');
    let inQuotes=false;
    while(i<s.length){
      const ch=s[i];
      if(inQuotes){
        if(ch==='"'){ if(s[i+1]==='"'){ field+='"'; i+=2; continue; } inQuotes=false; i++; continue; }
        field+=ch; i++; continue;
      } else {
        if(ch==='"'){ inQuotes=true; i++; continue; }
        if(ch===','){ row.push(field); field=''; i++; continue; }
        if(ch==='\n'){ row.push(field); rows.push(row); row=[]; field=''; i++; continue; }
        field+=ch; i++; continue;
      }
    }
    row.push(field); rows.push(row);
    return rows;
  }
  function csvToRecords(text){
    const rows = parseCSV(text).filter(r => r.length && r.some(c => String(c).trim()!==''));
    if(rows.length===0) return [];
    const header = rows[0].map(h => String(h||'').trim().toLowerCase());
    const idx = name => header.indexOf(name.toLowerCase());
    const records = [];
    for(let r=1; r<rows.length; r++){
      const cells = rows[r];
      const get = (h) => { const p=idx(h); return p>=0 ? String(cells[p]||'').trim() : ''; };
      const rec = {
        name: get('name'),
        empId: get('empid') || get('employee id') || get('employeeid'),
        personalEmail: get('personalemail') || get('personal email'),
        officialEmail: get('officialemail') || get('official email'),
        department: get('department'),
        joiningDate: get('joiningdate') || get('joining date'),
        dob: get('dob') || get('date of birth'),
        salary: Number(get('salary') || 0),
        exitDate: get('exitdate') || get('exit date'),
        bloodGroup: get('bloodgroup') || get('blood group'),
        personalPhone: get('personalphone') || get('personal contact number') || get('phone'),
        emergencyContact: get('emergencycontact') || get('emergency contact'),
        accountNumber: get('account #') || get('account number') || get('account'),
        ifsc: (get('ifsc') || get('ifsc code')).toUpperCase(),
        pan: (get('pan') || get('pan number')).toUpperCase(),
        aadhar: get('aadhar') || get('aadhaar') || get('aadhar number') || get('aadhaar number'),
        status: get('status') || 'Active',
        wotAllowance: (get('wotallowance')||'').toLowerCase() !== 'false'
      };
      if(rec.name || rec.empId){ records.push(rec); }
    }
    return records;
  }
  function jsonToRecords(text){
    let arr = [];
    try{ arr = JSON.parse(text); }catch(e){ return []; }
    if(!Array.isArray(arr)) arr = [arr];
    return arr.map(x => ({
      name: x.name || '',
      empId: x.empId || x.employeeId || '',
      personalEmail: x.personalEmail || '',
      officialEmail: x.officialEmail || '',
      department: x.department || '',
      joiningDate: x.joiningDate || '',
      dob: x.dob || '',
      salary: Number(x.salary || 0),
      exitDate: x.exitDate || '',
      bloodGroup: x.bloodGroup || '',
      personalPhone: x.personalPhone || x.phone || '',
      emergencyContact: x.emergencyContact || '',
      accountNumber: x.accountNumber || '',
      ifsc: (x.ifsc || '').toUpperCase(),
      pan: (x.pan || '').toUpperCase(),
      aadhar: x.aadhar || x.aadhaar || '',
      status: x.status || 'Active',
      wotAllowance: x.wotAllowance !== false
    }));
  }
  function importRecords(records){
    let inserted=0, updated=0, skipped=0, errors=[];
    records.forEach(rec => {
      if(!rec.empId || !rec.name){ skipped++; return; }
      if(rec.ifsc && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(rec.ifsc)) { errors.push(`Bad IFSC for ${rec.empId}`); skipped++; return; }
      if(rec.pan && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(rec.pan)) { errors.push(`Bad PAN for ${rec.empId}`); skipped++; return; }
      if(rec.aadhar && !/^[0-9]{12}$/.test(rec.aadhar)) { errors.push(`Bad Aadhar for ${rec.empId}`); skipped++; return; }
      rec.status = (rec.status==='Inactive') ? 'Inactive' : 'Active';
      rec.wotAllowance = (rec.wotAllowance !== false);
      rec.salary = Number(rec.salary||0);
      const idx = data.findIndex(x => (x.empId||'').toLowerCase() === String(rec.empId).toLowerCase());
      if(idx>=0){ data[idx] = { ...data[idx], ...rec }; updated++; }
      else { data.push({ id: rec.id || uid(), ...rec }); inserted++; }
    });
    setData(data);
    renderTable();
    alert(`Import complete. Inserted: ${inserted}, Updated: ${updated}, Skipped: ${skipped}` + (errors.length? `\nIssues:\n- `+errors.join('\n- ') : ''));
  }

 function downloadTemplates(kind) {
    const headers = [
        'name','empId','personalEmail','officialEmail','department','joiningDate','dob','salary',
        'exitDate','bloodGroup','personalPhone','emergencyContact','accountNumber','ifsc','pan',
        'aadhar','status','wotAllowance'
    ];

    // ✅ Example sample row
    const sample = [
        'Aarav Kumar','PT-010','aarav.kumar@example.com','aarav.k@platoontitleservices.com',
        'Operations','2023-06-15','1994-02-11','50000','','B+','9876543210','9876500001',
        '123456789012','HDFC0001234','ABCDE1234F','123412341234','Active','TRUE'
    ];

    if (kind === 'csv') {
        const lines = [headers.join(','), sample.map(v => `"${v}"`).join(',')].join('\n');
        const blob = new Blob([lines], { type: 'text/csv;charset=utf-8;' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'EmployeeTemplate.csv';
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(a.href);
        a.remove();
    } else if (kind === 'json') {
        const tmpl = [Object.fromEntries(headers.map((h, i) => [h, sample[i] || '']))];
        const blob = new Blob([JSON.stringify(tmpl, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'EmployeeTemplate.json';
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(a.href);
        a.remove();
    }
}


  // Click-outside/Escape
  modal.root?.addEventListener('click', (e) => { if(e.target === modal.root) closeAllModals(); });
  els.settingsModal?.addEventListener('click', (e) => { if(e.target === els.settingsModal) closeAllModals(); });
  els.bulkModal?.addEventListener('click', (e) => { if(e.target === els.bulkModal) closeAllModals(); });
  document.addEventListener('keydown', (e) => { if(e.key==='Escape') closeAllModals(); });

  // Init
  function showLogin(){ SCREENS.main.classList.remove('active'); SCREENS.login.classList.add('active'); }
  function showMain(){ SCREENS.login.classList.remove('active'); SCREENS.main.classList.add('active'); data=getData(); bindQueueButtons(); renderTable(); }
  if(isAuthed()) showMain(); else showLogin();
})();
/* header shadow (v35, dark theme) */
(function(){
  const cont = document.querySelector('#main-screen .container');
  const topbar = document.querySelector('.topbar');
  if(!cont || !topbar) return;
  const onScroll=()=>{ if(cont.scrollTop>2) topbar.classList.add('topbar-shadow'); else topbar.classList.remove('topbar-shadow'); };
  cont.addEventListener('scroll', onScroll); onScroll();
})();

// v38: Close modal on Cancel in Edit form
document.addEventListener('click', (e)=>{
  if(e.target && e.target.id==='btn-cancel'){
    const closeBtn = document.getElementById('modal-close');
    if(closeBtn) closeBtn.click();
  }
});


// ====== CSV Parser ======
function parseCSV(text) {
  const lines = text.trim().split("\n");
  const headers = lines[0].split(",").map(h => h.trim().toLowerCase());

  return lines.slice(1).map(line => {
    const values = line.split(",").map(v => v.trim());
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = values[i] || "";
    });
    return obj;
  });
}

// ====== Handle Bulk Import ======
async function handleBulkFiles(files) {
  for (const file of files) {
    const text = await file.text();
    let employees = [];

    if (file.name.toLowerCase().endsWith(".csv")) {
      employees = parseCSV(text);
    } else if (file.name.toLowerCase().endsWith(".json")) {
      try {
        employees = JSON.parse(text);
      } catch (e) {
        alert("Invalid JSON in " + file.name);
      }
    }

    if (employees && employees.length > 0) {
      employees.forEach(emp => addEmployee(emp));
    }
  }
  refreshTable();
}

// ====== Attach Events ======
document.getElementById("bulk-files").addEventListener("change", (e) => {
  handleBulkFiles(e.target.files);
});

document.getElementById("bulk-folder").addEventListener("change", (e) => {
  handleBulkFiles(e.target.files);
});

// ====== Add Employee Helper ======
function addEmployee(data) {
  if (!window.employees) window.employees = [];

  window.employees.push({
    name: data.name || "",
    empId: data.empid || "",
    personalEmail: data.personalemail || "",
    officialEmail: data.officialemail || "",
    department: data.department || "",
    joiningDate: data.joiningdate || "",
    dob: data.dob || "",
    salary: data.salary || 0,
    exitDate: data.exitdate || "",
    bloodGroup: data.bloodgroup || "",
    personalPhone: data.personalphone || "",
    emergencyContact: data.emergencycontact || "",
    accountNumber: data.accountnumber || "",
    ifsc: data.ifsc || "",
    pan: data.pan || "",
    aadhar: data.aadhar || "",
    status: data.status || "active",
    wotAllowance: data.wotallowance === "true" || data.wotallowance === true
  });
}

// function refreshTable() {
//   const tbody = document.querySelector("#emp-table tbody");
//   tbody.innerHTML = "";

//   (window.employees || []).forEach((emp, index) => {
//     const row = document.createElement("tr");
//     row.innerHTML = `
//       <td><input type="checkbox"></td>
//       <td>${index + 1}</td>
//       <td>${emp.name}</td>
//       <td>${emp.empId}</td>
//       <td>${emp.personalEmail}</td>
//       <td>${emp.officialEmail}</td>
//       <td>${emp.department}</td>
//       <td>${emp.joiningDate}</td>
//       <td>${emp.dob}</td>
//       <td>${emp.salary}</td>
//       <td>${emp.exitDate}</td>
//       <td></td>
//       <td>${emp.status}</td>
//       <td>${emp.bloodGroup}</td>
//       <td>${emp.personalPhone}</td>
//       <td>${emp.emergencyContact}</td>
//       <td>${emp.accountNumber}</td>
//       <td>${emp.ifsc}</td>
//       <td>${emp.pan}</td>
//       <td>${emp.aadhar}</td>
//       <td><button class="btn small">Edit</button></td>
//     `;
//     tbody.appendChild(row);
//   });

//   // Update counters
//   document.getElementById("q-all").textContent = window.employees.length;
//   document.getElementById("q-active").textContent = window.employees.filter(e => e.status === "active").length;
//   document.getElementById("q-inactive").textContent = window.employees.filter(e => e.status === "inactive").length;
//   document.getElementById("q-probation").textContent = window.employees.filter(e => e.status === "probation").length;
// }


// Fetch employees
// async function fetchEmployees() {
//   const res = await fetch("employee.php?action=fetch");
//   const data = await res.json();
//   renderEmployees(data);
// }

// Save employee (add or update)
async function saveEmployee(emp, isEdit=false) {
  let form = new FormData();
  Object.keys(emp).forEach(k => form.append(k, emp[k]));
  const url = isEdit ? "employee.php?action=update" : "employee.php?action=add";
  await fetch(url, { method:"POST", body:form });
  // fetchEmployees();
  loadEmployees();
}


async function deleteEmployee(empId) {
    if(!confirm("Are you sure you want to delete this employee?")) return;

    try {
        const res = await fetch(`employee.php?action=delete&empId=${empId}`);
        const json = await res.json();
        if(json.status === "ok") {
            // fetchEmployees();
            loadEmployees();
        } else {
            alert(json.message || "Error deleting employee");
        }
    } catch(err) {
        console.error(err);
    }
}


// Delete selected employees
async function deleteSelected(ids) {
  let form = new FormData();
  form.append("ids", ids.join(","));
  await fetch("employee.php?action=deleteSelected", { method:"POST", body:form });
  loadEmployees();
}

// Bulk import employees
// async function bulkImport(employees) {
//   let form = new FormData();
//   form.append("employees", JSON.stringify(employees));
//   await fetch("employee.php?action=bulkImport", { method:"POST", body:form });
//   loadEmployees();
// }

// Handle CSV/Excel import
async function handleFileImport(file) {
  const reader = new FileReader();
  reader.onload = async function(e) {
    const text = e.target.result;
    const rows = text.split("\n").map(r => r.split(","));

    // Assuming first row = headers
    let employees = [];
    for (let i = 1; i < rows.length; i++) {
      let r = rows[i];
      if (r.length < 5) continue; // skip empty rows

      employees.push({
        name: r[0].trim(),
        empId: r[1].trim(),
        personalEmail: r[2].trim(),
        officialEmail: r[3].trim(),
        department: r[4].trim(),
        joiningDate: r[5] ? r[5].trim() : null,
        dob: r[6] ? r[6].trim() : null,
        salary: r[7] ? parseFloat(r[7].trim()) : 0,
        exitDate: r[8] ? r[8].trim() : null,
        bloodGroup: r[9] ? r[9].trim() : null,
        personalPhone: r[10] ? r[10].trim() : null,
        emergencyContact: r[11] ? r[11].trim() : null,
        accountNumber: r[12] ? r[12].trim() : null,
        ifsc: r[13] ? r[13].trim() : null,
        pan: r[14] ? r[14].trim() : null,
        aadhar: r[15] ? r[15].trim() : null,
        status: r[16] ? r[16].trim() : "Active",
        wotAllowance: 1
      });
    }

    // 🔥 Save to DB
    await bulkImport(employees);
  };

  reader.readAsText(file);
}

// base URL of API - adjust path if api.php is in a subfolder
const API_BASE = './api.php';

// helper: handle JSON response
async function apiFetch(action, method = 'POST', body = null) {
  const headers = {};
  let options = { method, headers };
  if (body && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  } else if (body instanceof FormData) {
    options.body = body;
  } else if (method === 'GET') {
    // nothing
  }
  const url = (method === 'GET' && body) ? `${API_BASE}?action=${action}&${new URLSearchParams(body)}` : `${API_BASE}?action=${action}`;
  const res = await fetch(url, options);
  if (!res.ok) {
    const text = await res.text();
    throw new Error('Server error: ' + text);
  }
  // if export endpoints will return file, handle separately
  return await res.json();
}
function renderEmployees(data) {
    const container = document.getElementById('emp-table'); // must match HTML
    if (!container) {
        console.error("renderEmployees: container not found!");
        return;
    }

    container.innerHTML = ''; // clear old content

    data.forEach(emp => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${emp.empId}</td>
            <td>${emp.name}</td>
            <td>${emp.department}</td>
            <td>
                <button onclick="openEditModal(${JSON.stringify(emp)})">Edit</button>
                <button onclick="deleteEmployee('${emp.empId}')">Delete</button>
            </td>
        `;
        container.appendChild(row);
    });
}
function escapeHtml(s) {
  if (!s) return '';
  return String(s).replace(/[&<>"']/g, function(m){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]); });
}

function calcTenureMonths(joining, exitDate) {
  if (!joining) return '';
  const j = new Date(joining);
  const e = exitDate ? new Date(exitDate) : new Date();
  if (isNaN(j)) return '';
  const months = (e.getFullYear() - j.getFullYear()) * 12 + (e.getMonth() - j.getMonth());
  return Math.max(0, months);
}

// commented --
// Save form (create or update)
// document.querySelector('#emp-form').addEventListener('submit', async function(ev){
//   ev.preventDefault();
//   // const form = ev.currentTarget;
//   const form = document.querySelector('#emp-form');
//   const formData = new FormData(form);
//   const obj = {};
//   formData.forEach((v,k) => {
//     obj[k] = v;
//   });
//   // wotAllowance handling (checkbox)
//   obj.wotAllowance = form.querySelector('[name="wotAllowance"]').checked ? 1 : 0;
//   // if editing, ensure id present
//   const id = form.dataset.recordId;
//   console.log(formData);
//   console.log(Object.fromEntries(formData.entries()));

//   // return
//     try {
//     if (id) {
//       obj.id = id;
//       await apiFetch('update', 'POST', obj);
//     } else {
//       await apiFetch('create', 'POST', obj);
//     }
//     closeModal();
//     loadEmployees();
//   } catch (err) {
//     alert('Save failed: ' + err.message);
//   }
// });

document.querySelector('#emp-form').addEventListener('submit', async function(ev) {
  ev.preventDefault();
  const form = ev.currentTarget;
  const formData = new FormData(form);

  let obj = Object.fromEntries(formData.entries());

  // Convert checkbox properly
  obj.wotAllowance = form.querySelector('[name="wotAllowance"]').checked ? 1 : 0;

  // Add id if editing
  const id = form.dataset.recordId || obj.id;
  if (id) obj.id = id;

  console.log(obj);
  console.log(id);

  try {
    if (id) {
      await apiFetch('update', 'POST', obj);
    } else {
      await apiFetch('create', 'POST', obj);
    }
    closeModal();
    loadEmployees();
  } catch (err) {
    // alert('Save failed: ' + err.message);
  }
});


// bulk import using file input (#bulk-files)
document.getElementById('bulk-files').addEventListener('change', async function(e){
  const files = e.target.files;
  if (!files.length) return;
  const fd = new FormData();
  for (let i=0;i<files.length;i++) fd.append('files[]', files[i]);
  try {
    const res = await fetch(`${API_BASE}?action=bulk_import`, { method: 'POST', body: fd });
    const json = await res.json();
    if (json.ok) {
      alert('Imported: ' + json.imported);
      // loadEmployees();
    } else {
      alert('Import failed: ' + json.error);
    }
  } catch (err) {
    alert('Import error: ' + err.message);
  }
});

// ✅ Export JSON / CSV dynamically from the current table data
document.getElementById('btn-export').addEventListener('click', () => {
    const data = renderEmployeeTable._allEmployees || [];
    if (!data.length) return alert('No employee data to export.');

    const jsonBlob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(jsonBlob);
    a.download = 'Employees.json';
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(a.href);
    a.remove();
});

// ✅ Helper function to normalize WOT Allowance
function normalizeWOT(val) {
    if (val === undefined || val === null) return '';
    const v = val.toString().trim().toLowerCase();
    if (v === 'true' || v === '1' || v === 'yes') return 'TRUE';
    if (v === 'false' || v === '0' || v === 'no') return 'FALSE';
    return '';
}

// Export CSV button
document.getElementById('btn-export-csv').addEventListener('click', () => {
    const data = renderEmployeeTable._allEmployees || [];
    if (!data.length) return alert('No employee data to export.');

    const headers = [
        'name','empId','personalEmail','officialEmail','department','joiningDate','dob',
        'salary','exitDate','bloodGroup','personalPhone','emergencyContact','accountNumber',
        'ifsc','pan','aadhar','status','wotAllowance'
    ];

    const lines = [
        headers.join(','), // CSV header
        data.map(emp => [
            emp.name || '',
            emp.emp_id || emp.empId || '',
            emp.personal_email || emp.personalEmail || '',
            emp.official_email || emp.officialEmail || '',
            emp.department || '',
            emp.joining_date || emp.joiningDate || '',
            emp.dob || '',
            emp.salary || '',
            emp.exit_date || emp.exitDate || '',
            emp.blood_group || emp.bloodGroup || '',
            emp.personal_phone || emp.personalPhone || '',
            emp.emergency_contact || emp.emergencyContact || '',
            emp.account_number || emp.accountNumber || '',
            emp.ifsc || '',
            emp.pan || '',
            emp.aadhar || '',
            emp.status || '',
            normalizeWOT(emp.wot_allowance ?? emp.wotAllowance) // ✅ Normalized TRUE/FALSE
        ].map(v => `"${v}"`).join(',')) // Wrap values in quotes to handle commas
    ].join('\n');

    const csvBlob = new Blob([lines], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(csvBlob);
    a.download = 'Employees.csv';
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(a.href);
    a.remove();
});


// simple search
document.getElementById('search').addEventListener('input', function(e){
  const q = e.target.value.trim();
  loadEmployees(q);
});

// init
loadEmployees();

// --- Helper Functions ---
function qs(sel) { return document.querySelector(sel); }
function qsa(sel) { return document.querySelectorAll(sel); }

// Global variables
let data = [];          // store DB employees
// let editingId = null;   // current editing employee ID

// // ..--- Fetch & Render Employee Table ---
// async function loadEmployees() {
//   try {
//     const url = 'api.php?action=list&queue=' + encodeURIComponent(currentQueue);
//     const res = await fetch(url);
//     const json = await res.json();

//     if (!json.ok) throw new Error(json.error || 'Failed to load employees');
//     data = json.data;
//     renderEmployeeTable(data);

//   } catch (err) {
//     alert('Load failed: ' + err.message);
//   }
// }
{/* <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script> */}

// THIS ORIGINAL SHOWING DATA IN FRONTEND WORKINGFINE
// --- Fetch employees and render table ---
// function renderEmployeeTable(employees) {
//     const tbody = document.getElementById('employee-table-body');
//     if (!tbody) return;

//     tbody.innerHTML = ''; // clear existing rows

//     employees.forEach((emp, index) => {
//         const tr = document.createElement('tr');
//         tr.innerHTML = `
//             <td><input type="checkbox" class="select-emp" data-id="${emp.id}"></td>
//             <td>${index + 1}</td>
//             <td>${emp.name || ''}</td>
//             <td>${emp.emp_id || emp.empId || ''}</td>
//             <td>${emp.personal_email || emp.personalEmail || ''}</td>
//             <td>${emp.official_email || emp.officialEmail || ''}</td>
//             <td>${emp.department || ''}</td>
//             <td>${emp.joining_date || emp.joiningDate || ''}</td>
//             <td>${emp.dob || ''}</td>
//             <td>${emp.salary || ''}</td>
//             <td>${emp.exit_date || emp.exitDate || ''}</td>
//             <td>${emp.tenure || ''}</td>
//             <td>${emp.status || ''}</td>
//             <td>${emp.blood_group || emp.bloodGroup || ''}</td>
//             <td>${emp.personal_phone || emp.personalPhone || ''}</td>
//             <td>${emp.emergency_contact || emp.emergencyContact || ''}</td>
//             <td>${emp.account_number || emp.accountNumber || ''}</td>
//             <td>${emp.ifsc || ''}</td>
//             <td>${emp.pan || ''}</td>
//             <td>${emp.aadhar || ''}</td>
//           <td>
//     <button class="view-btn" data-id="${emp.id}">👁️ View</button>
//     <button class="btn" data-act="edit" data-id="${emp.id}">✏️ Edit</button>
//     <button class="delete-btn" data-id="${emp.emp_id || emp.empId || ''}">🗑️ Delete</button>
// </td>

//         `;
//         tbody.appendChild(tr);
//     });
// // 1️⃣ Dynamically load SweetAlert2
// const script = document.createElement('script');
// script.src = "https://cdn.jsdelivr.net/npm/sweetalert2@11";
// script.onload = () => {
//     // 2️⃣ SweetAlert2 is ready, attach view button listeners
//     document.querySelectorAll('.view-btn').forEach(btn => {
//         btn.addEventListener('click', () => {
//             const emp = employees.find(e => e.id == btn.dataset.id);
//             if (!emp) return Swal.fire('Error', 'Employee not found', 'error');

//             Swal.fire({
//                 title: `${emp.name} (${emp.emp_id || emp.empId})`,
//               html: `
//   <div style="
//     display: grid;
//     grid-template-columns: 180px 1fr;
//     gap: 6px 12px;
//     text-align: left;
//     line-height: 1.6;
//     font-size: 15px;
//   ">
//     <div>🏢 <b>Department :</b></div>        <div>${emp.department}</div>
//     <div>📧 <b>Personal Email :</b></div>
// <div>
//   <a href="mailto:${emp.personal_email || emp.personalEmail}" 
//      style="color:#3498db; text-decoration: none;">
//     ${emp.personal_email || emp.personalEmail}
//   </a>
// </div>

// <div>💼 <b>Official Email :</b></div>
// <div>
//   <a href="mailto:${emp.official_email || emp.officialEmail}" 
//      style="color:#3498db; text-decoration: none;">
//     ${emp.official_email || emp.officialEmail}
//   </a>
// </div>

//     <div>🩸 <b>Blood Group :</b></div>      <div>${emp.blood_group || emp.bloodGroup}</div>
//     <div>📱 <b>Personal Phone :</b></div>   <div>${emp.personal_phone || emp.personalPhone}</div>
//     <div>☎️ <b>Emergency Contact :</b></div><div>${emp.emergency_contact || emp.emergencyContact}</div>
//     <div>🗓️ <b>Joining Date :</b></div>    <div>${emp.joining_date || emp.joiningDate}</div>
//     <div>🎂 <b>DOB :</b></div>              <div>${emp.dob}</div>
//     <div>💰 <b>Salary :</b></div>           <div>₹${emp.salary}</div>
//     <div>🚪 <b>Exit Date :</b></div>        <div>${emp.exit_date || emp.exitDate}</div>
//     <div>⏳ <b>Tenure :</b></div>           <div>${emp.tenure}</div>
//     <div>✅ <b>Status :</b></div>           <div>${emp.status}</div>
//     <div>🏦 <b>Account :</b></div>        <div>${emp.account_number || emp.accountNumber}</div>
//     <div>🏧 <b>IFSC :</b></div>             <div>${emp.ifsc}</div>
//     <div>🆔 <b>PAN :</b></div>              <div>${emp.pan}</div>
//     <div>🪪 <b>Aadhar :</b></div>           <div>${emp.aadhar}</div>
//   </div>
// `,
//                 icon: 'info',
//                 confirmButtonText: 'Close'
//             });
//         });
//     });
// };
// document.head.appendChild(script);


//     // // Add event listeners for edit buttons
//     // document.querySelectorAll('.edit-btn').forEach(btn => {
//     //     btn.addEventListener('click', () => openEditModal(btn.dataset.id, employees));
//     // });
//     document.querySelectorAll('[data-act="edit"]').forEach(btn => {
//     btn.addEventListener('click', () => openEditModal(btn.dataset.id, employees));
// });


//     // Add event listeners for delete buttons
//     document.querySelectorAll('.delete-btn').forEach(btn => {
//         btn.addEventListener('click', () => deleteEmployee(btn.dataset.id));
//     });
// }
// edit dynamic work
// function renderEmployeeTable(employees) {
//     const tbody = document.getElementById('employee-table-body');
//     if (!tbody) return;

//     tbody.innerHTML = ''; // clear previous rows

//     employees.forEach((emp, index) => {
//         const tr = document.createElement('tr');

//         tr.innerHTML = `
//             <td><input type="checkbox" class="select-emp" data-id="${emp.id}"></td>
//             <td>${index + 1}</td>
//             <td>${emp.name || ''}</td>
//             <td>${emp.emp_id || emp.empId || ''}</td>
//             <td>${emp.personal_email || emp.personalEmail || ''}</td>
//             <td>${emp.official_email || emp.officialEmail || ''}</td>
//             <td>${emp.department || ''}</td>
//             <td>${emp.joining_date || emp.joiningDate || ''}</td>
//             <td>${emp.dob || ''}</td>
//             <td>${emp.salary || ''}</td>
//             <td>${emp.exit_date || emp.exitDate || ''}</td>
//             <td>${emp.tenure || ''}</td>
//             <td>${emp.status || ''}</td>
//             <td>${emp.blood_group || emp.bloodGroup || ''}</td>
//             <td>${emp.personal_phone || emp.personalPhone || ''}</td>
//             <td>${emp.emergency_contact || emp.emergencyContact || ''}</td>
//             <td>${emp.account_number || emp.accountNumber || ''}</td>
//             <td>${emp.ifsc || ''}</td>
//             <td>${emp.pan || ''}</td>
//             <td>${emp.aadhar || ''}</td>
//            <td>
//     <button style="
//         background-color: #3498db;   /* blue */
//         color: #fff;                  /* white text */
//         font-weight: 700;
//         padding: 6px 12px;
//         border: 1px solid #2980b9;
//         border-radius: 6px;
//         cursor: pointer;
//     " class="view-btn" data-id="${emp.id}">👁️ View</button>

//     <button 
//     style="
//         background-color: #f1c40f; /* Yellow */
//         color: #000;               /* Black text */
//         font-weight: 700;
//         padding: 6px 12px;
//         border: 1px solid #d4ac0d;
//         border-radius: 6px;
//         cursor: pointer;
//     " 
//     class="btn" 
//     data-act="edit" 
//     data-id="${emp.id}">
//     ✏️ Edit
// </button>


//     <button style="
//         background-color: #e74c3c;   /* red */
//         color: #fff;                  /* white text */
//         font-weight: 700;
//         padding: 6px 12px;
//         border: 1px solid #c0392b;
//         border-radius: 6px;
//         cursor: pointer;
//     " class="delete-btn" data-id="${emp.emp_id || emp.empId || ''}">🗑️ Delete</button>
// </td>

//         `;

//         tbody.appendChild(tr);
//     });

//     // ✅ View (SweetAlert2) – load only once
//     if (!window._sweetalertLoaded) {
//         const script = document.createElement('script');
//         script.src = "https://cdn.jsdelivr.net/npm/sweetalert2@11";
//         script.onload = attachViewListeners;
//         document.head.appendChild(script);
//         window._sweetalertLoaded = true;
//     } else {
//         attachViewListeners();
//     }

//     // // ✅ Edit
//     // document.querySelectorAll('[data-act="edit"]').forEach(btn => {
//     //     btn.addEventListener('click', () => {
//     //         const emp = employees.find(e => e.id == btn.dataset.id);
//     //         if (emp) openEditModal(emp);
//     //     });
//     // });
//         // --- Edit buttons
//     document.querySelectorAll('[data-act="edit"]').forEach(btn => {
//         btn.addEventListener('click', () => {
//             const emp = employees.find(e => e.id == btn.dataset.id);
//             if (emp) {
//                 openEditModal(emp, updatedEmp => {
//                     // Update in-memory array
//                     const index = employees.findIndex(e => e.id == updatedEmp.id);
//                     if (index > -1) employees[index] = updatedEmp;
//                     renderEmployeeTable(employees); // re-render dynamically
//                 });
//             }
//         });
//     });

//     // ✅ Delete (Dynamic update)
// document.querySelectorAll('.delete-btn').forEach(btn => {
//     btn.addEventListener('click', () => {
//         const empId = btn.dataset.id;

//         deleteEmployee(empId, success => {
//             if (success) {
//                 // remove from employees array
//                 const idx = employees.findIndex(e => e.id == empId);
//                 if (idx > -1) {
//                     employees.splice(idx, 1); // remove one
//                     renderEmployeeTable(employees); // refresh table instantly
//                 }
//             } else {
//                 Swal.fire('Error', 'Failed to delete employee', 'error');
//             }
//         });
//     });
// });

//     // --- Helper for SweetAlert2 View ---
//     function attachViewListeners() {
//         document.querySelectorAll('.view-btn').forEach(btn => {
//             btn.addEventListener('click', () => {
//                 const emp = employees.find(e => e.id == btn.dataset.id);
//                 if (!emp) return Swal.fire('Error', 'Employee not found', 'error');

//                 Swal.fire({
//                     title: `${emp.name} (${emp.emp_id || emp.empId})`,
//                     html: `
//                         <div style="
//                             display: grid;
//                             grid-template-columns: 180px 1fr;
//                             gap: 6px 12px;
//                             text-align: left;
//                             line-height: 1.6;
//                             font-size: 15px;
//                         ">
//                             <div>🏢 <b>Department :</b></div><div>${emp.department || ''}</div>
//                             <div>📧 <b>Personal Email :</b></div>
//                             <div><a href="mailto:${emp.personal_email || emp.personalEmail}" style="color:#3498db; text-decoration:none;">
//                                 ${emp.personal_email || emp.personalEmail}</a></div>

//                             <div>💼 <b>Official Email :</b></div>
//                             <div><a href="mailto:${emp.official_email || emp.officialEmail}" style="color:#3498db; text-decoration:none;">
//                                 ${emp.official_email || emp.officialEmail}</a></div>

//                             <div>🩸 <b>Blood Group :</b></div><div>${emp.blood_group || emp.bloodGroup || ''}</div>
//                             <div>📱 <b>Personal Phone :</b></div><div>${emp.personal_phone || emp.personalPhone || ''}</div>
//                             <div>☎️ <b>Emergency Contact :</b></div><div>${emp.emergency_contact || emp.emergencyContact || ''}</div>
//                             <div>🗓️ <b>Joining Date :</b></div><div>${emp.joining_date || emp.joiningDate || ''}</div>
//                             <div>🎂 <b>DOB :</b></div><div>${emp.dob || ''}</div>
//                             <div>💰 <b>Salary :</b></div><div>₹${emp.salary || ''}</div>
//                             <div>🚪 <b>Exit Date :</b></div><div>${emp.exit_date || emp.exitDate || ''}</div>
//                             <div>⏳ <b>Tenure :</b></div><div>${emp.tenure || ''}</div>
//                             <div>✅ <b>Status :</b></div><div>${emp.status || ''}</div>
//                             <div>🏦 <b>Account :</b></div><div>${emp.account_number || emp.accountNumber || ''}</div>
//                             <div>🏧 <b>IFSC :</b></div><div>${emp.ifsc || ''}</div>
//                             <div>🆔 <b>PAN :</b></div><div>${emp.pan || ''}</div>
//                             <div>🪪 <b>Aadhar :</b></div><div>${emp.aadhar || ''}</div>
//                         </div>
//                     `,
//                     icon: 'info',
//                     confirmButtonText: 'Close'
//                 });
//             });
//         });
//     }
// }
//probacation logic 
// function renderEmployeeTable(employees) {
//     const tbody = document.getElementById('employee-table-body');
//     if (!tbody) return;

//     // Helper: compute status (Probation/Active)
//     function getEmployeeStatus(emp) {
//         if (!emp.joining_date && !emp.joiningDate) return '';
//         const joiningDate = new Date(emp.joining_date || emp.joiningDate);
//         const today = new Date();
//         const diffMonths = (today.getFullYear() - joiningDate.getFullYear()) * 12 
//                          + (today.getMonth() - joiningDate.getMonth());
//         return diffMonths >= 3 ? 'Active' : 'Probation';
//     }

//     tbody.innerHTML = ''; // clear previous rows

//     employees.forEach((emp, index) => {
//         const tr = document.createElement('tr');

//         tr.innerHTML = `
//             <td><input type="checkbox" class="select-emp" data-id="${emp.id}"></td>
//             <td>${index + 1}</td>
//             <td>${emp.name || ''}</td>
//             <td>${emp.emp_id || emp.empId || ''}</td>
//             <td>${emp.personal_email || emp.personalEmail || ''}</td>
//             <td>${emp.official_email || emp.officialEmail || ''}</td>
//             <td>${emp.department || ''}</td>
//             <td>${emp.joining_date || emp.joiningDate || ''}</td>
//             <td>${emp.dob || ''}</td>
//             <td>${emp.salary || ''}</td>
//             <td>${emp.exit_date || emp.exitDate || ''}</td>
//             <td>${emp.tenure || ''}</td>
//             <td>${emp.status || getEmployeeStatus(emp)}</td>
//             <td>${emp.blood_group || emp.bloodGroup || ''}</td>
//             <td>${emp.personal_phone || emp.personalPhone || ''}</td>
//             <td>${emp.emergency_contact || emp.emergencyContact || ''}</td>
//             <td>${emp.account_number || emp.accountNumber || ''}</td>
//             <td>${emp.ifsc || ''}</td>
//             <td>${emp.pan || ''}</td>
//             <td>${emp.aadhar || ''}</td>
//             <td>
//                 <button style="
//                     background-color: #3498db; 
//                     color: #fff; 
//                     font-weight: 700;
//                     padding: 6px 12px;
//                     border: 1px solid #2980b9;
//                     border-radius: 6px;
//                     cursor: pointer;
//                 " class="view-btn" data-id="${emp.id}">👁️ View</button>

//                 <button style="
//                     background-color: #f1c40f; 
//                     color: #000; 
//                     font-weight: 700;
//                     padding: 6px 12px;
//                     border: 1px solid #d4ac0d;
//                     border-radius: 6px;
//                     cursor: pointer;
//                 " class="btn" data-act="edit" data-id="${emp.id}">✏️ Edit</button>

//                 <button style="
//                     background-color: #e74c3c; 
//                     color: #fff; 
//                     font-weight: 700;
//                     padding: 6px 12px;
//                     border: 1px solid #c0392b;
//                     border-radius: 6px;
//                     cursor: pointer;
//                 " class="delete-btn" data-id="${emp.id || emp.emp_id || emp.empId}">🗑️ Delete</button>
//             </td>
//         `;

//         tbody.appendChild(tr);
//     });

//     // ✅ Load SweetAlert2 only once
//     if (!window._sweetalertLoaded) {
//         const script = document.createElement('script');
//         script.src = "https://cdn.jsdelivr.net/npm/sweetalert2@11";
//         script.onload = attachViewListeners;
//         document.head.appendChild(script);
//         window._sweetalertLoaded = true;
//     } else {
//         attachViewListeners();
//     }

//     // --- Edit buttons
//     document.querySelectorAll('[data-act="edit"]').forEach(btn => {
//         btn.addEventListener('click', () => {
//             const emp = employees.find(e => e.id == btn.dataset.id);
//             if (emp) {
//                 openEditModal(emp, updatedEmp => {
//                     // Update in-memory array
//                     const index = employees.findIndex(e => e.id == updatedEmp.id);
//                     if (index > -1) employees[index] = updatedEmp;
//                     renderEmployeeTable(employees); // re-render dynamically
//                 });
//             }
//         });
//     });

//     // --- Delete buttons
//     document.querySelectorAll('.delete-btn').forEach(btn => {
//         btn.addEventListener('click', () => {
//             const empId = btn.dataset.id;
//             // Optional: confirm delete
//             if (confirm("Are you sure you want to delete this employee?")) {
//                 // Remove from array
//                 employees = employees.filter(emp => emp.id != empId);
//                 renderEmployeeTable(employees); // re-render dynamically
//                 // TODO: also call backend delete API if needed
//             }
//         });
//     });

//     // --- SweetAlert2 View
//     function attachViewListeners() {
//         document.querySelectorAll('.view-btn').forEach(btn => {
//             btn.addEventListener('click', () => {
//                 const emp = employees.find(e => e.id == btn.dataset.id);
//                 if (!emp) return Swal.fire('Error', 'Employee not found', 'error');

//                 Swal.fire({
//                     title: `${emp.name} (${emp.emp_id || emp.empId})`,
//                     html: `
//                         <div style="
//                             display: grid;
//                             grid-template-columns: 180px 1fr;
//                             gap: 6px 12px;
//                             text-align: left;
//                             line-height: 1.6;
//                             font-size: 15px;
//                         ">
//                             <div>🏢 <b>Department :</b></div><div>${emp.department || ''}</div>
//                             <div>📧 <b>Personal Email :</b></div>
//                             <div><a href="mailto:${emp.personal_email || emp.personalEmail}" style="color:#3498db; text-decoration:none;">
//                                 ${emp.personal_email || emp.personalEmail}</a></div>

//                             <div>💼 <b>Official Email :</b></div>
//                             <div><a href="mailto:${emp.official_email || emp.officialEmail}" style="color:#3498db; text-decoration:none;">
//                                 ${emp.official_email || emp.officialEmail}</a></div>

//                             <div>🩸 <b>Blood Group :</b></div><div>${emp.blood_group || emp.bloodGroup || ''}</div>
//                             <div>📱 <b>Personal Phone :</b></div><div>${emp.personal_phone || emp.personalPhone || ''}</div>
//                             <div>☎️ <b>Emergency Contact :</b></div><div>${emp.emergency_contact || emp.emergencyContact || ''}</div>
//                             <div>🗓️ <b>Joining Date :</b></div><div>${emp.joining_date || emp.joiningDate || ''}</div>
//                             <div>🎂 <b>DOB :</b></div><div>${emp.dob || ''}</div>
//                             <div>💰 <b>Salary :</b></div><div>₹${emp.salary || ''}</div>
//                             <div>🚪 <b>Exit Date :</b></div><div>${emp.exit_date || emp.exitDate || ''}</div>
//                             <div>⏳ <b>Tenure :</b></div><div>${emp.tenure || ''}</div>
//                             <div>✅ <b>Status :</b></div><div>${emp.status || getEmployeeStatus(emp)}</div>
//                             <div>🏦 <b>Account :</b></div><div>${emp.account_number || emp.accountNumber || ''}</div>
//                             <div>🏧 <b>IFSC :</b></div><div>${emp.ifsc || ''}</div>
//                             <div>🆔 <b>PAN :</b></div><div>${emp.pan || ''}</div>
//                             <div>🪪 <b>Aadhar :</b></div><div>${emp.aadhar || ''}</div>
//                         </div>
//                     `,
//                     icon: 'info',
//                     confirmButtonText: 'Close'
//                 });
//             });
//         });
//     }
// }

// Track which tab is currently active


// function renderEmployeeTable(employees) {
//     const tbody = document.getElementById('employee-table-body');
//     if (!tbody) return;

//     // 🔎 Cache full list for searching
//     if (!renderEmployeeTable._allEmployees) {
//         renderEmployeeTable._allEmployees = [...employees];
//     }

//     tbody.innerHTML = ''; // clear previous rows

//     employees.forEach((emp, index) => {
//         const tr = document.createElement('tr');

//         tr.innerHTML = `
//             <td><input type="checkbox" class="select-emp" data-id="${emp.id}"></td>
//             <td>${index + 1}</td>
//             <td>${emp.name || ''}</td>
//             <td>${emp.emp_id || emp.empId || ''}</td>
//             <td>${emp.personal_email || emp.personalEmail || ''}</td>
//             <td>${emp.official_email || emp.officialEmail || ''}</td>
//             <td>${emp.department || ''}</td>
//             <td>${emp.joining_date || emp.joiningDate || ''}</td>
//             <td>${emp.dob || ''}</td>
//             <td>${emp.salary || ''}</td>
//             <td>${emp.exit_date || emp.exitDate || ''}</td>
//             <td>${emp.tenure || ''}</td>
//             <td>${emp.status || ''}</td>
//             <td>${emp.wot_allowance || emp.wotAllowance || ''}</td> 
//             <td>${emp.blood_group || emp.bloodGroup || ''}</td>
//             <td>${emp.personal_phone || emp.personalPhone || ''}</td>
//             <td>${emp.emergency_contact || emp.emergencyContact || ''}</td>
//             <td>${emp.account_number || emp.accountNumber || ''}</td>
//             <td>${emp.ifsc || ''}</td>
//             <td>${emp.pan || ''}</td>
//             <td>${emp.aadhar || ''}</td>
//            <td>
//     <button style="
//         background-color: #3498db;
//         color: #fff;
//         font-weight: 700;
//         padding: 6px 12px;
//         border: 1px solid #2980b9;
//         border-radius: 6px;
//         cursor: pointer;
//     " class="view-btn" data-id="${emp.id}">👁️ View</button>

//     <button 
//     style="
//         background-color: #f1c40f;
//         color: #000;
//         font-weight: 700;
//         padding: 6px 12px;
//         border: 1px solid #d4ac0d;
//         border-radius: 6px;
//         cursor: pointer;
//     " 
//     class="btn" 
//     data-act="edit" 
//     data-id="${emp.id}">
//     ✏️ Edit
// </button>

//     <button style="
//         background-color: #e74c3c;
//         color: #fff;
//         font-weight: 700;
//         padding: 6px 12px;
//         border: 1px solid #c0392b;
//         border-radius: 6px;
//         cursor: pointer;
//     " class="delete-btn" data-id="${emp.emp_id || emp.empId || ''}">🗑️ Delete</button>
// </td>
//         `;

//         tbody.appendChild(tr);
//     });

//     // ✅ View (SweetAlert2) – load only once
//     if (!window._sweetalertLoaded) {
//         const script = document.createElement('script');
//         script.src = "https://cdn.jsdelivr.net/npm/sweetalert2@11";
//         script.onload = attachViewListeners;
//         document.head.appendChild(script);
//         window._sweetalertLoaded = true;
//     } else {
//         attachViewListeners();
//     }

//     // --- Edit buttons
//     document.querySelectorAll('[data-act="edit"]').forEach(btn => {
//         btn.addEventListener('click', () => {
//             const emp = employees.find(e => e.id == btn.dataset.id);
//             if (emp) {
//                 openEditModal(emp, updatedEmp => {
//                     const index = employees.findIndex(e => e.id == updatedEmp.id);
//                     if (index > -1) {
//                         employees[index] = updatedEmp;
//                         // also update the cached full list
//                         const masterIdx = renderEmployeeTable._allEmployees.findIndex(e => e.id == updatedEmp.id);
//                         if (masterIdx > -1) renderEmployeeTable._allEmployees[masterIdx] = updatedEmp;
//                         renderEmployeeTable(employees); // re-render dynamically
//                     }
//                 });
//             }
//         });
//     });

//     // ✅ Delete (Dynamic update)
//     document.querySelectorAll('.delete-btn').forEach(btn => {
//         btn.addEventListener('click', () => {
//             const empId = btn.dataset.id;

//             deleteEmployee(empId, success => {
//                 if (success) {
//                     const idx = employees.findIndex(e => e.id == empId);
//                     if (idx > -1) employees.splice(idx, 1);
//                     const masterIdx = renderEmployeeTable._allEmployees.findIndex(e => e.id == empId);
//                     if (masterIdx > -1) renderEmployeeTable._allEmployees.splice(masterIdx, 1);
//                     renderEmployeeTable(employees);
//                 } else {
//                     Swal.fire('Error', 'Failed to delete employee', 'error');
//                 }
//             });
//         });
//     });

//     function attachViewListeners() {
//         document.querySelectorAll('.view-btn').forEach(btn => {
//             btn.addEventListener('click', () => {
//                 const emp = employees.find(e => e.id == btn.dataset.id);
//                 if (!emp) return Swal.fire('Error', 'Employee not found', 'error');

//                 Swal.fire({
//                     title: `${emp.name} (${emp.emp_id || emp.empId})`,
//                     html: `
//                         <div style="
//                             display: grid;
//                             grid-template-columns: 180px 1fr;
//                             gap: 6px 12px;
//                             text-align: left;
//                             line-height: 1.6;
//                             font-size: 15px;
//                         ">
//                             <div>🏢 <b>Department :</b></div><div>${emp.department || ''}</div>
//                             <div>📧 <b>Personal Email :</b></div>
//                             <div><a href="mailto:${emp.personal_email || emp.personalEmail}" style="color:#3498db; text-decoration:none;">
//                                 ${emp.personal_email || emp.personalEmail}</a></div>
//                             <div>💼 <b>Official Email :</b></div>
//                             <div><a href="mailto:${emp.official_email || emp.officialEmail}" style="color:#3498db; text-decoration:none;">
//                                 ${emp.official_email || emp.officialEmail}</a></div>
//                             <div>🩸 <b>Blood Group :</b></div><div>${emp.blood_group || emp.bloodGroup || ''}</div>
//                             <div>📱 <b>Personal Phone :</b></div><div>${emp.personal_phone || emp.personalPhone || ''}</div>
//                             <div>☎️ <b>Emergency Contact :</b></div><div>${emp.emergency_contact || emp.emergencyContact || ''}</div>
//                             <div>🗓️ <b>Joining Date :</b></div><div>${emp.joining_date || emp.joiningDate || ''}</div>
//                             <div>🎂 <b>DOB :</b></div><div>${emp.dob || ''}</div>
//                             <div>💰 <b>Salary :</b></div><div>₹${emp.salary || ''}</div>
//                             <div>🚪 <b>Exit Date :</b></div><div>${emp.exit_date || emp.exitDate || ''}</div>
//                             <div>⏳ <b>Tenure :</b></div><div>${emp.tenure || ''}</div>
//                             <div>✅ <b>Status :</b></div><div>${emp.status || ''}</div>
//                             <div>💸 <b>WOT Allowance :</b></div>
// <div>${emp.wot_allowance || emp.wotAllowance || ''}</div>
//                             <div>🏦 <b>Account :</b></div><div>${emp.account_number || emp.accountNumber || ''}</div>
//                             <div>🏧 <b>IFSC :</b></div><div>${emp.ifsc || ''}</div>
//                             <div>🆔 <b>PAN :</b></div><div>${emp.pan || ''}</div>
//                             <div>🪪 <b>Aadhar :</b></div><div>${emp.aadhar || ''}</div>
//                         </div>
//                     `,
//                     icon: 'info',
//                     confirmButtonText: 'Close'
//                 });
//             });
//         });
//     }

//     // 🔎 SEARCH FILTER (runs only once)
//     if (!renderEmployeeTable._searchAttached) {
//         const searchInput = document.getElementById('search');
//         if (searchInput) {
//             searchInput.addEventListener('input', () => {
//                 const query = searchInput.value.toLowerCase();
//                 const filtered = renderEmployeeTable._allEmployees.filter(emp =>
//                     [
//                         emp.name,
//                         emp.emp_id || emp.empId,
//                         emp.personal_email || emp.personalEmail,
//                         emp.official_email || emp.officialEmail,
//                         emp.department,
//                         emp.ifsc,
//                         emp.pan,
//                         emp.aadhar
//                     ]
//                     .filter(Boolean)
//                     .some(val => String(val).toLowerCase().includes(query))
//                 );
//                 renderEmployeeTable(filtered);
//             });
//             renderEmployeeTable._searchAttached = true;
//         }
//     }
// }
function renderEmployeeTable(employees) {
    const tbody = document.getElementById('employee-table-body');
    if (!tbody) return;

    // 🔎 Cache full list for searching
    if (!renderEmployeeTable._allEmployees) {
        renderEmployeeTable._allEmployees = [...employees];
    }

    tbody.innerHTML = ''; // clear previous rows

    employees.forEach((emp, index) => {
        const tr = document.createElement('tr');

        // ✅ Normalize wotAllowance to TRUE / FALSE
        const wot =
            (emp.wot_allowance ?? emp.wotAllowance ?? '')
                .toString()
                .trim()
                .toLowerCase();

        const wotDisplay = (wot === 'true' || wot === '1' || wot === 'yes') ? 'TRUE' :
                           (wot === 'false' || wot === '0' || wot === 'no') ? 'FALSE' : '';

        tr.innerHTML = `
         <td><input type="checkbox" class="select-emp" data-id="${emp.id}"></td>
<td>${index + 1}</td>
<td>${emp.name || ''}</td>
<td>${emp.emp_id || emp.empId || ''}</td>
<td>${emp.personal_email || emp.personalEmail || ''}</td>
<td>${emp.official_email || emp.officialEmail || ''}</td>
<td>${emp.department || ''}</td>
<td>${emp.joining_date || emp.joiningDate || ''}</td>
<td>${emp.dob || ''}</td>
<td>${emp.salary || ''}</td>
<td>${emp.exit_date || emp.exitDate || ''}</td>
<td>${emp.tenure || ''}</td>
<td>${emp.status || ''}</td>
<td>${wotDisplay}</td> <!-- WOT Allowance -->
<td>${emp.blood_group || emp.bloodGroup || ''}</td>
<td>${emp.personal_phone || emp.personalPhone || ''}</td>
<td>${emp.emergency_contact || emp.emergencyContact || ''}</td>
<td>${emp.account_number != null ? emp.account_number.toString() : emp.accountNumber || ''}</td>
<td>${emp.ifsc || ''}</td>
<td>${emp.pan || ''}</td>
<td>${emp.aadhar != null ? emp.aadhar.toString() : ''}</td>

           <td>
                <button style="
                    background-color: #3498db;
                    color: #fff;
                    font-weight: 700;
                    padding: 6px 12px;
                    border: 1px solid #2980b9;
                    border-radius: 6px;
                    cursor: pointer;
                " class="view-btn" data-id="${emp.id}">👁️ View</button>

                <button style="
                    background-color: #f1c40f;
                    color: #000;
                    font-weight: 700;
                    padding: 6px 12px;
                    border: 1px solid #d4ac0d;
                    border-radius: 6px;
                    cursor: pointer;
                " class="btn" data-act="edit" data-id="${emp.id}">✏️ Edit</button>

                <button style="
                    background-color: #e74c3c;
                    color: #fff;
                    font-weight: 700;
                    padding: 6px 12px;
                    border: 1px solid #c0392b;
                    border-radius: 6px;
                    cursor: pointer;
                " class="delete-btn" data-id="${emp.emp_id || emp.empId || ''}">🗑️ Delete</button>
           </td>
        `;

        tbody.appendChild(tr);
    });

    // ✅ View (SweetAlert2) – load only once
    if (!window._sweetalertLoaded) {
        const script = document.createElement('script');
        script.src = "https://cdn.jsdelivr.net/npm/sweetalert2@11";
        script.onload = attachViewListeners;
        document.head.appendChild(script);
        window._sweetalertLoaded = true;
    } else {
        attachViewListeners();
    }

    // --- Edit buttons
    document.querySelectorAll('[data-act="edit"]').forEach(btn => {
        btn.addEventListener('click', () => {
            const emp = employees.find(e => e.id == btn.dataset.id);
            if (emp) {
                openEditModal(emp, updatedEmp => {
                    const index = employees.findIndex(e => e.id == updatedEmp.id);
                    if (index > -1) {
                        employees[index] = updatedEmp;
                        const masterIdx = renderEmployeeTable._allEmployees.findIndex(e => e.id == updatedEmp.id);
                        if (masterIdx > -1) renderEmployeeTable._allEmployees[masterIdx] = updatedEmp;
                        renderEmployeeTable(employees); // re-render dynamically
                    }
                });
            }
        });
    });

    // ✅ Delete (Dynamic update)
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const empId = btn.dataset.id;

            deleteEmployee(empId, success => {
                if (success) {
                    const idx = employees.findIndex(e => e.id == empId);
                    if (idx > -1) employees.splice(idx, 1);
                    const masterIdx = renderEmployeeTable._allEmployees.findIndex(e => e.id == empId);
                    if (masterIdx > -1) renderEmployeeTable._allEmployees.splice(masterIdx, 1);
                    renderEmployeeTable(employees);
                } else {
                    Swal.fire('Error', 'Failed to delete employee', 'error');
                }
            });
        });
    });

    function attachViewListeners() {
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const emp = employees.find(e => e.id == btn.dataset.id);
                if (!emp) return Swal.fire('Error', 'Employee not found', 'error');

                const wot =
                    (emp.wot_allowance ?? emp.wotAllowance ?? '')
                        .toString()
                        .trim()
                        .toLowerCase();
                const wotDisplay = (wot === 'true' || wot === '1' || wot === 'yes') ? 'TRUE' :
                                   (wot === 'false' || wot === '0' || wot === 'no') ? 'FALSE' : '';

                Swal.fire({
                    title: `${emp.name} (${emp.emp_id || emp.empId})`,
                    html: `
                        <div style="
                            display: grid;
                            grid-template-columns: 180px 1fr;
                            gap: 6px 12px;
                            text-align: left;
                            line-height: 1.6;
                            font-size: 15px;
                        ">
                            <div>🏢 <b>Department :</b></div><div>${emp.department || ''}</div>
                            <div>📧 <b>Personal Email :</b></div>
                            <div><a href="mailto:${emp.personal_email || emp.personalEmail}" style="color:#3498db; text-decoration:none;">
                                ${emp.personal_email || emp.personalEmail}</a></div>
                            <div>💼 <b>Official Email :</b></div>
                            <div><a href="mailto:${emp.official_email || emp.officialEmail}" style="color:#3498db; text-decoration:none;">
                                ${emp.official_email || emp.officialEmail}</a></div>
                            <div>🩸 <b>Blood Group :</b></div><div>${emp.blood_group || emp.bloodGroup || ''}</div>
                            <div>📱 <b>Personal Phone :</b></div><div>${emp.personal_phone || emp.personalPhone || ''}</div>
                            <div>☎️ <b>Emergency Contact :</b></div><div>${emp.emergency_contact || emp.emergencyContact || ''}</div>
                            <div>🗓️ <b>Joining Date :</b></div><div>${emp.joining_date || emp.joiningDate || ''}</div>
                            <div>🎂 <b>DOB :</b></div><div>${emp.dob || ''}</div>
                            <div>💰 <b>Salary :</b></div><div>₹${emp.salary || ''}</div>
                            <div>🚪 <b>Exit Date :</b></div><div>${emp.exit_date || emp.exitDate || ''}</div>
                            <div>⏳ <b>Tenure :</b></div><div>${emp.tenure || ''}</div>
                            <div>✅ <b>Status :</b></div><div>${emp.status || ''}</div>
                            <div>💸 <b>WOT Allowance :</b></div><div>${wotDisplay}</div>
                            <div>🏦 <b>Account :</b></div><div>${emp.account_number != null ? emp.account_number.toString() : emp.accountNumber || ''}</div>
                            <div>🏧 <b>IFSC :</b></div><div>${emp.ifsc || ''}</div>
                            <div>🆔 <b>PAN :</b></div><div>${emp.pan || ''}</div>
                            <div>🪪 <b>Aadhar :</b></div><div>${emp.aadhar != null ? emp.aadhar.toString() : ''}</div>
                        </div>
                    `,
                    icon: 'info',
                    confirmButtonText: 'Close'
                });
            });
        });
    }

    // 🔎 SEARCH FILTER (runs only once)
    if (!renderEmployeeTable._searchAttached) {
        const searchInput = document.getElementById('search');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                const query = searchInput.value.toLowerCase();
                const filtered = renderEmployeeTable._allEmployees.filter(emp =>
                    [
                        emp.name,
                        emp.emp_id || emp.empId,
                        emp.personal_email || emp.personalEmail,
                        emp.official_email || emp.officialEmail,
                        emp.department,
                        emp.ifsc,
                        emp.pan,
                        emp.aadhar,
                        emp.wot_allowance || emp.wotAllowance   // ✅ include for searching
                    ]
                    .filter(Boolean)
                    .some(val => String(val).toLowerCase().includes(query))
                );
                renderEmployeeTable(filtered);
            });
            renderEmployeeTable._searchAttached = true;
        }
    }
}
let currentFilter = 'all';

// Filter employees based on currentFilter
function filterEmployees(employees) {
  return employees.filter(emp => {
    const status = (emp.status || '').toLowerCase();
    const tenureMonths = parseFloat(emp.tenure) || 0;

    switch (currentFilter) {
      case 'active':
        return status === 'active';
      case 'inactive':
        return status === 'inactive';
      case 'probation':
        // Explicit probation OR tenure <= 3 months
        return status === 'probation' || tenureMonths <= 3;
      default: // 'all'
        return true;
    }
  });
}
// --- Tab handling ---
// Example: buttons have class="qbtn" and data-q="all|active|inactive|probation"
document.querySelectorAll('.qbtn').forEach(btn => {
  btn.addEventListener('click', () => {
    // Update which filter is active
    currentFilter = btn.dataset.q;

    // Visual active state
    document.querySelectorAll('.qbtn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Re-render the table using the filtered employees
    renderEmployeeTable(filterEmployees(window.allEmployees));
  });
});
fetch('/api/employees')
  .then(r => r.json())
  .then(data => {
      window.allEmployees = data;  // store globally
      renderEmployeeTable(filterEmployees(data)); // filterEmployees() applies active/inactive/probation tabs
  });
// --- Initial load example ---
fetch('/api/employees')
  .then(r => r.json())
  .then(data => {
    window.allEmployees = data;
    renderEmployeeTable(filterEmployees(data)); // show all on first load
  });


// Attach filter button events
document.querySelectorAll('#queues .qbtn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#queues .qbtn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.q;
    renderEmployeeTable(filterEmployees(window.allEmployees || []));
  });
});

// ✅ Run this ONCE after page load
document.addEventListener('DOMContentLoaded', () => {
    const selectAll = document.getElementById('select-all');
    const deleteSelectedBtn = document.getElementById('btn-delete-selected');

    function toggleDeleteButton() {
        deleteSelectedBtn.disabled =
            document.querySelectorAll('.select-emp:checked').length === 0;
    }

    // Toggle all checkboxes
    selectAll.addEventListener('change', () => {
        document.querySelectorAll('.select-emp').forEach(chk => {
            chk.checked = selectAll.checked;
        });
        toggleDeleteButton();
    });

    // Monitor individual checkboxes
    document.addEventListener('change', e => {
        if (e.target.classList.contains('select-emp')) {
            const all = document.querySelectorAll('.select-emp');
            const checked = document.querySelectorAll('.select-emp:checked');
            selectAll.checked = all.length && checked.length === all.length;
            toggleDeleteButton();
        }
    });

    // Bulk Delete
    deleteSelectedBtn.addEventListener('click', () => {
        const ids = [...document.querySelectorAll('.select-emp:checked')]
            .map(chk => chk.dataset.id);

        if (!ids.length) return;

        Swal.fire({
            title: 'Delete Selected?',
            html: `Delete <b>${ids.length}</b> employee(s)?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, Delete'
        }).then(res => {
            if (res.isConfirmed) {
                ids.forEach(id => deleteEmployee(id)); // your existing function
                Swal.fire('Deleted!', 'Selected employees removed.', 'success');
            }
        });
    });
});

// function renderEmployeeTable(employees) {
//     const tbody = document.getElementById('employee-table-body');
//     if (!tbody) return;

//     tbody.innerHTML = ''; // clear existing rows
//     const today = new Date(); // ✅ needed for probation calculation

//     employees.forEach((emp, index) => {
//         // ✅ Probation logic
//         let status = emp.status || '';
//         const joinDate = new Date(emp.joining_date || emp.joiningDate || '');
//         const exitDate = emp.exit_date || emp.exitDate || '';
//         if (!isNaN(joinDate) && !exitDate) {
//             const diffDays = Math.floor((today - joinDate) / (1000 * 60 * 60 * 24));
//             if (diffDays <= 90 && status.toLowerCase() !== 'inactive') {
//                 status = 'Probation';
//             }
//         }

//         const tr = document.createElement('tr');
//         tr.innerHTML = `
//             <td><input type="checkbox" class="select-emp" data-id="${emp.id}"></td>
//             <td>${index + 1}</td>
//             <td>${emp.name || ''}</td>
//             <td>${emp.emp_id || emp.empId || ''}</td>
//             <td>${emp.personal_email || emp.personalEmail || ''}</td>
//             <td>${emp.official_email || emp.officialEmail || ''}</td>
//             <td>${emp.department || ''}</td>
//             <td>${emp.joining_date || emp.joiningDate || ''}</td>
//             <td>${emp.dob || ''}</td>
//             <td>${emp.salary || ''}</td>
//             <td>${emp.exit_date || emp.exitDate || ''}</td>
//             <td>${emp.tenure || ''}</td>
//             <td>${status}</td> <!-- ✅ updated Status -->
//             <td>${emp.blood_group || emp.bloodGroup || ''}</td>
//             <td>${emp.personal_phone || emp.personalPhone || ''}</td>
//             <td>${emp.emergency_contact || emp.emergencyContact || ''}</td>
//             <td>${emp.account_number || emp.accountNumber || ''}</td>
//             <td>${emp.ifsc || ''}</td>
//             <td>${emp.pan || ''}</td>
//             <td>${emp.aadhar || ''}</td>
//           <td>
//             <button class="view-btn" data-id="${emp.id}">👁️ View</button>
//             <button class="btn" data-act="edit" data-id="${emp.id}">✏️ Edit</button>
//             <button class="delete-btn" data-id="${emp.emp_id || emp.empId || ''}">🗑️ Delete</button>
//           </td>
//         `;
//         tbody.appendChild(tr);
//     });

//     // SweetAlert2
//     const script = document.createElement('script');
//     script.src = "https://cdn.jsdelivr.net/npm/sweetalert2@11";
//     script.onload = () => {
//         document.querySelectorAll('.view-btn').forEach(btn => {
//             btn.addEventListener('click', () => {
//                 const emp = employees.find(e => e.id == btn.dataset.id);
//                 if (!emp) return Swal.fire('Error', 'Employee not found', 'error');

//                 Swal.fire({
//     title: `${emp.name} (${emp.emp_id || emp.empId})`,
//     html: `
//         <strong>Department:</strong> ${emp.department}<br>
//         <strong>Personal Email:</strong> ${emp.personal_email || emp.personalEmail}<br>
//         <strong>Official Email:</strong> ${emp.official_email || emp.officialEmail}<br>
//         <strong>Blood Group:</strong> ${emp.blood_group || emp.bloodGroup}<br>
//         <strong>Personal Phone:</strong> ${emp.personal_phone || emp.personalPhone}<br>
//         <strong>Emergency Contact:</strong> ${emp.emergency_contact || emp.emergencyContact}<br>
//         <strong>Joining Date:</strong> ${emp.joining_date || emp.joiningDate}<br>
//         <strong>DOB:</strong> ${emp.dob}<br>
//         <strong>Salary:</strong> ₹${emp.salary}<br>
//         <strong>Exit Date:</strong> ${emp.exit_date || emp.exitDate}<br>
//         <strong>Tenure:</strong> ${emp.tenure}<br>
//         <strong>Status:</strong> ${status}<br>
//         <strong>Account #:</strong> ${emp.account_number || emp.accountNumber}<br>
//         <strong>IFSC:</strong> ${emp.ifsc}<br>
//         <strong>PAN:</strong> ${emp.pan}<br>
//         <strong>Aadhar:</strong> ${emp.aadhar}
//     `,
//     icon: 'info',
//     confirmButtonText: 'Close'
// });

//             });
//         });
//     };
//     document.head.appendChild(script);

//     // Edit & Delete
//     document.querySelectorAll('.edit-btn').forEach(btn => {
//         btn.addEventListener('click', () => openEditModal(btn.dataset.id, employees));
//     });
//     document.querySelectorAll('.delete-btn').forEach(btn => {
//         btn.addEventListener('click', () => deleteEmployee(btn.dataset.id));
//     });
// }
// Main render function


// Add search listener
// document.getElementById('employee-search').addEventListener('input', () => {
//     // Call render function again to filter
//     renderEmployeeTable(employees);
// });
let editingId = null; // Global DB id
// --- Tab Handling ---
function showTab(name){
    qsa('.tab').forEach(t => t.classList.remove('active'));
    qsa('.tab-pane').forEach(p => p.classList.remove('active'));

    const btn = qs(`.tab[data-tab="${name}"]`);
    const pane = qs(`#tab-${name}`);
    if(btn) btn.classList.add('active');
    if(pane) pane.classList.add('active');
}

// --- Render Attendance / Payslip / Offer Letter ---
function renderAttendance(emp) {
    const container = qs('#tab-attendance');
    container.innerHTML = `<pre>${JSON.stringify(emp.attendance || {}, null, 2)}</pre>`;
}

function renderPayslip(emp) {
    const container = qs('#tab-payslip');
    container.innerHTML = `<pre>${JSON.stringify(emp.payslip || {}, null, 2)}</pre>`;
}

function renderOfferLetter(emp) {
    const container = qs('#tab-offer');
    container.innerHTML = `<pre>${JSON.stringify(emp.offerLetter || {}, null, 2)}</pre>`;
}

// --- Close Modal ---
function closeModal() {
    qs('#editModal').classList.add('hidden');
    document.body.classList.remove('modal-open');
    editingId = null;
}

// --- Update Employee ---
document.getElementById("emp-form").addEventListener("submit", saveEmployee);

async function saveEmployee(e) {
    e.preventDefault();
    const empForm = document.getElementById("emp-form");
    const modal = document.getElementById("modal");
    const empId = empForm.dataset.empId || "";
    const formData = new FormData();

    // Fields mapping to match your IDs
    const fields = {
        name: "#modal-name",
        empId: "#modal-employee-id",
        department: "#modal-department",
        bloodGroup: "#modal-blood-group",
        personalPhone: "#modal-personal-contact",
        emergencyContact: "#modal-emergency-contact",
        joiningDate: "#modal-joining-date",
        dob: "#modal-dob",
        salary: "#modal-salary",
        exitDate: "#modal-exit-date",
        tenure: "#modal-tenure",
        status: "#modal-status",
        wotAllowance: "#modal-wotAllowance",
        accountNumber: "#modal-accountNumber",
        ifsc: "#modal-ifsc",
        pan: "#modal-pan",
        aadhar: "#modal-aadhar",
        personalEmail: "#modal-personal-email",
        officialEmail: "#modal-official-email"
    };

    for (const [key, selector] of Object.entries(fields)) {
        const el = empForm.querySelector(selector);
        if (!el) continue;
        if (key === "wotAllowance") formData.append(key, el.checked ? 1 : 0);
        else formData.append(key, el.value.trim());
    }

    if(empId) formData.append("originalEmpId", empId);
    const action = empId ? "update" : "create";

    console.log(action);
     // commented --
    // try {
    //     const res = await fetch(`employee.php?action=${action}`, {
    //         method: "POST",
    //         body: formData
    //     });
    //     const data = await res.json();

    //     if(data.status === "ok") {
    //         modal.classList.add("hidden");
    //         empForm.reset();
    //         delete empForm.dataset.empId;
    //         alert(`Employee ${action === "update" ? "updated" : "added"} successfully!`);
    //         fetchEmployees(); // Refresh table
    //     } else {
    //         alert(data.message || "Something went wrong");
    //     }
    // } catch(err) {
    //     console.error(err);
    //     alert("Failed to save employee");
    // }
}
// --- Event Listeners ---
qs('#save-employee-btn')?.addEventListener('click', saveEmployee);
qs('#close-modal-btn')?.addEventListener('click', closeModal);

// --- Initial Load ---
document.addEventListener('DOMContentLoaded', loadEmployees);

const empTable = document.getElementById("employee-table"); // your table id
const allBadge = document.getElementById("q-all");
const modal = document.getElementById("modal");
const empForm = document.getElementById("emp-form");
const modalTitle = document.getElementById("modal-title");

// Render employees into table
function renderEmployees(employees) {
    empTable.innerHTML = "";
    employees.forEach(emp => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${emp.name}</td>
            <td>${emp.empId}</td>
            <td>${emp.department}</td>
            <td>${emp.status}</td>
            <td>
                <button class="edit-btn">Edit</button>
                <button class="delete-btn">Delete</button>
            </td>
        `;
        // Edit button
        tr.querySelector(".edit-btn").addEventListener("click", () => openEditModal(emp));
        // Delete button
        tr.querySelector(".delete-btn").addEventListener("click", () => deleteEmployee(emp.empId));
        empTable.appendChild(tr);
    });
}

// Initial load
loadEmployees();

document.getElementById("btn-cancel")?.addEventListener("click", () => modal.classList.add("hidden"));
document.getElementById("modal-close")?.addEventListener("click", () => modal.classList.add("hidden"));

// Open Add Employee
function openAddModal() {
    modalTitle.textContent = "Add Employee";
    empForm.reset();
    empForm.dataset.empId = ""; // empty means create
    modal.classList.remove("hidden");
}

// function openEditModal(emp = null) {
//     const modal = document.getElementById("modal");
//     const modalTitle = document.getElementById("modal-title");
//     const empForm = document.getElementById("emp-form");

//     // Show modal
//     modal.classList.remove("hidden");
//     modalTitle.textContent = emp ? "Edit Employee" : "Add Employee";

//     // Reset form for new entry
//     empForm.reset();
//     delete empForm.dataset.empId;

//     if (emp) {
//         // Use consistent keys (handle both DB + JS keys)
//         const e = {
//             id: emp.id || "",
//             name: emp.name || "",
//             empId: emp.emp_id || emp.empId || "",
//             department: emp.department || "",
//             bloodGroup: emp.blood_group || emp.bloodGroup || "",
//             personalPhone: emp.personal_phone || emp.personalPhone || "",
//             emergencyContact: emp.emergency_contact || emp.emergencyContact || "",
//             personalEmail: emp.personal_email || emp.personalEmail || "",
//             officialEmail: emp.official_email || emp.officialEmail || "",
//             joiningDate: emp.joining_date || emp.joiningDate || "",
//             dob: emp.dob || "",
//             salary: emp.salary || "",
//             exitDate: emp.exit_date || emp.exitDate || "",
//             tenure: emp.tenure || "",
//             status: emp.status || "",
//             wotAllowance: emp.wotAllowance || false,
//             accountNumber: emp.account_number || emp.accountNumber || "",
//             ifsc: emp.ifsc || "",
//             pan: emp.pan || "",
//             aadhar: emp.aadhar || ""
//         };

//         // Store ID for update
//         empForm.dataset.empId = e.empId;

//         // Fill fields
//         empForm.querySelector("#modal-name").value = e.name;
//         empForm.querySelector("#modal-employee-id").value = e.empId;
//         empForm.querySelector("#modal-department").value = e.department;
//         empForm.querySelector("#modal-blood-group").value = e.bloodGroup;

//         empForm.querySelector("#modal-personal-contact").value = e.personalPhone;
//         empForm.querySelector("#modal-emergency-contact").value = e.emergencyContact;
//         empForm.querySelector("#modal-personal-email").value = e.personalEmail;
//         empForm.querySelector("#modal-official-email").value = e.officialEmail;

//         empForm.querySelector("#modal-joining-date").value = e.joiningDate;
//         empForm.querySelector("#modal-dob").value = e.dob;
//         empForm.querySelector("#modal-salary").value = e.salary;
//         empForm.querySelector("#modal-exit-date").value = e.exitDate;
//         empForm.querySelector("#modal-tenure").value = e.tenure;
//         empForm.querySelector("#modal-status").value = e.status;
//         empForm.querySelector("#modal-wotAllowance").checked = !!e.wotAllowance;

//         empForm.querySelector("#modal-accountNumber").value = e.accountNumber;
//         empForm.querySelector("#modal-ifsc").value = e.ifsc;
//         empForm.querySelector("#modal-pan").value = e.pan;
//         empForm.querySelector("#modal-aadhar").value = e.aadhar;
//     }
// }


// Close modal
// document.getElementById("modal-close").addEventListener("click", () => {
//     document.getElementById("modal").classList.add("hidden");
// });



// empForm.addEventListener("submit", async (e) => {
//   console.log("hello");
//     e.preventDefault();

//     const empId = empForm.dataset.empId || ""; // empty = create
//     const action = empId ? "update" : "create";

//     // Gather all form data
//     const formData = {
//         empId: empForm.empId.value,
//         name: empForm.name.value,
//         department: empForm.department.value,
//         bloodGroup: empForm.bloodGroup.value,
//         personalEmail: empForm.personalEmail.value,
//         officialEmail: empForm.officialEmail.value,
//         personalPhone: empForm.personalPhone.value,
//         emergencyContact: empForm.emergencyContact.value,
//         joiningDate: empForm.joiningDate.value,
//         dob: empForm.dob.value,
//         salary: parseFloat(empForm.salary.value) || 0,
//         exitDate: empForm.exitDate.value,
//         status: empForm.status.value,
//         wotAllowance: empForm.wotAllowance.checked ? 1 : 0,
//         accountNumber: empForm.accountNumber.value,
//         ifsc: empForm.ifsc.value,
//         pan: empForm.pan.value,
//         aadhar: empForm.aadhar.value
//     };

//     if(empId) formData.empId = empId; // include empId for update

//     try {
//         const res = await fetch(`employee.php?action=${action}`, {
//             method: "POST",
//             body: JSON.stringify(formData)
//         });
//         const json = await res.json();
//         if(json.status === "ok") {
//             fetchEmployees(); // refresh table & badge
//             modal.classList.add("hidden");
//         } else {
//             alert(json.message || "Error saving employee");
//         }
//     } catch(err) {
//         console.error(err);
//     }
// });

document.querySelectorAll(".tab").forEach(tab => {
    tab.addEventListener("click", () => {
        document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
        document.querySelectorAll(".tab-pane").forEach(p => p.classList.remove("active"));

        tab.classList.add("active");
        const pane = document.getElementById("tab-" + tab.dataset.tab);
        pane?.classList.add("active");
    });
});
function openEditModal(emp = null, onSaveCallback = null) {
    const modal = document.getElementById("modal");
    const modalTitle = document.getElementById("modal-title");
    const empForm = document.getElementById("emp-form");

    // Show modal
    modal.classList.remove("hidden");
    modalTitle.textContent = emp ? "Edit Employee" : "Add Employee";

    // Reset form for new entry
    empForm.reset();
    delete empForm.dataset.empId;

    // Helper: compute status dynamically
    function getEmployeeStatus(joiningDate) {
        if (!joiningDate) return '';
        const joinDate = new Date(joiningDate);
        const today = new Date();
        const diffMonths = (today.getFullYear() - joinDate.getFullYear()) * 12 
                         + (today.getMonth() - joinDate.getMonth());
        return diffMonths >= 3 ? 'Active' : 'Probation';
    }

    if (emp) {
        // Map employee fields consistently
        const e = {
            id: emp.id || "",
            name: emp.name || "",
            empId: emp.emp_id || emp.empId || "",
            department: emp.department || "",
            bloodGroup: emp.blood_group || emp.bloodGroup || "",
            personalPhone: emp.personal_phone || emp.personalPhone || "",
            emergencyContact: emp.emergency_contact || emp.emergencyContact || "",
            personalEmail: emp.personal_email || emp.personalEmail || "",
            officialEmail: emp.official_email || emp.officialEmail || "",
            joiningDate: emp.joining_date || emp.joiningDate || "",
            dob: emp.dob || "",
            salary: emp.salary || "",
            exitDate: emp.exit_date || emp.exitDate || "",
            tenure: emp.tenure || "",
            status: emp.status || getEmployeeStatus(emp.joining_date || emp.joiningDate),
            wotAllowance: emp.wotAllowance || false,
            accountNumber: emp.account_number || emp.accountNumber || "",
            ifsc: emp.ifsc || "",
            pan: emp.pan || "",
            aadhar: emp.aadhar || ""
        };

        // Store ID for update
        empForm.dataset.empId = e.id;

        // Fill fields
        empForm.querySelector("#modal-name").value = e.name;
        empForm.querySelector("#modal-employee-id").value = e.empId;
        empForm.querySelector("#modal-department").value = e.department;
        empForm.querySelector("#modal-blood-group").value = e.bloodGroup;

        empForm.querySelector("#modal-personal-contact").value = e.personalPhone;
        empForm.querySelector("#modal-emergency-contact").value = e.emergencyContact;
        empForm.querySelector("#modal-personal-email").value = e.personalEmail;
        empForm.querySelector("#modal-official-email").value = e.officialEmail;

        empForm.querySelector("#modal-joining-date").value = e.joiningDate;
        empForm.querySelector("#modal-dob").value = e.dob;
        empForm.querySelector("#modal-salary").value = e.salary;
        empForm.querySelector("#modal-exit-date").value = e.exitDate;
        empForm.querySelector("#modal-tenure").value = e.tenure;
        empForm.querySelector("#modal-status").value = e.status;
        empForm.querySelector("#modal-wotAllowance").checked = !!e.wotAllowance;

        empForm.querySelector("#modal-accountNumber").value = e.accountNumber;
        empForm.querySelector("#modal-ifsc").value = e.ifsc;
        empForm.querySelector("#modal-pan").value = e.pan;
        empForm.querySelector("#modal-aadhar").value = e.aadhar;
    }

    // --- Save button handler
    empForm.onsubmit = function (event) {
        event.preventDefault();

        const updatedEmp = {
            id: empForm.dataset.empId || Date.now(), // new ID if adding
            name: empForm.querySelector("#modal-name").value.trim(),
            empId: empForm.querySelector("#modal-employee-id").value.trim(),
            department: empForm.querySelector("#modal-department").value.trim(),
            bloodGroup: empForm.querySelector("#modal-blood-group").value.trim(),
            personalPhone: empForm.querySelector("#modal-personal-contact").value.trim(),
            emergencyContact: empForm.querySelector("#modal-emergency-contact").value.trim(),
            personalEmail: empForm.querySelector("#modal-personal-email").value.trim(),
            officialEmail: empForm.querySelector("#modal-official-email").value.trim(),
            joiningDate: empForm.querySelector("#modal-joining-date").value,
            dob: empForm.querySelector("#modal-dob").value,
            salary: empForm.querySelector("#modal-salary").value.trim(),
            exitDate: empForm.querySelector("#modal-exit-date").value,
            tenure: empForm.querySelector("#modal-tenure").value.trim(),
            status: getEmployeeStatus(empForm.querySelector("#modal-joining-date").value),
            wotAllowance: empForm.querySelector("#modal-wotAllowance").checked,
            accountNumber: empForm.querySelector("#modal-accountNumber").value.trim(),
            ifsc: empForm.querySelector("#modal-ifsc").value.trim(),
            pan: empForm.querySelector("#modal-pan").value.trim(),
            aadhar: empForm.querySelector("#modal-aadhar").value.trim()
        };

        // Callback to update table and array dynamically
        if (typeof onSaveCallback === "function") {
            onSaveCallback(updatedEmp);
        }

        // Close modal
        modal.classList.add("hidden");
    };
}
function getEmployeeStatus(joiningDate) {
    if (!joiningDate) return '';
    const joinDate = new Date(joiningDate);
    const today = new Date();

    // Calculate full month difference
    const yearDiff = today.getFullYear() - joinDate.getFullYear();
    const monthDiff = today.getMonth() - joinDate.getMonth();
    const dayDiff = today.getDate() - joinDate.getDate();

    let totalMonths = yearDiff * 12 + monthDiff;
    if (dayDiff < 0) totalMonths--; // If joining day not reached this month

    return totalMonths >= 3 ? 'Active' : 'Probation';
}


// Attach once, works for dynamically created rows
document.getElementById('employee-table-body').addEventListener('dblclick', async (e) => {
  let tr = e.target.closest('tr'); // find the row
  if (!tr) return;

  const btn = tr.querySelector('button[data-id]');
  if (!btn) return;

  const id = btn.dataset.id;
  if (!id) return;

  // Ask user
  const action = prompt('Type "edit" to edit or "delete" to delete this employee:', 'edit');
  if (!action) return;

  if (action.toLowerCase() === 'edit') {
    // Open edit modal
    const resp = await fetch(`${API_BASE}?action=get&id=${id}`);
    const json = await resp.json();
    if (json.ok) openEditModal(json.data);
  } else if (action.toLowerCase() === 'delete') {
    if (!confirm('Are you sure you want to delete employee #' + id + '?')) return;
    const form = new FormData();
    form.append('id', id);
    const res = await apiFetch('delete', 'POST', form);
    if (res.ok) loadEmployees(); // reload table
  } else {
    alert('Invalid action! Type "edit" or "delete".');
  }
});
