const years = ['2021-2022','2022-2023','2023-2024','2024-2025','2025-2026'];
const enrollment = [1966,1812,1914,1799,1748];
const grades = [
  {grade:'Kinder', y2021:218, y2025:197},
  {grade:'Grade 1', y2021:297, y2025:277},
  {grade:'Grade 2', y2021:206, y2025:241},
  {grade:'Grade 3', y2021:362, y2025:233},
  {grade:'Grade 4', y2021:292, y2025:276},
  {grade:'Grade 5', y2021:212, y2025:243},
  {grade:'Grade 6', y2021:283, y2025:189},
  {grade:'SPED', y2021:35, y2025:69},
];
const matrix = [
  ['Enrollment Decline','Enrollment recovery and parent/community outreach','High','Medium','High'],
  ['Grade 3 and 6 Retention','Cohort tracking, exit surveys, and intervention logs','High','High','High'],
  ['SPED Growth','Resource expansion and classroom reallocation','High','Medium','High'],
  ['Class Size Imbalance','Section redistribution and room planning','Medium','High','Medium'],
  ['Attendance Reliability','Monthly validation and adviser reporting','Medium','High','Medium'],
];
Chart.defaults.font.family = 'Poppins';
Chart.defaults.color = '#6f5d5d';
const gridColor = 'rgba(138,102,85,.12)';
const pink = '#c49ca0';
const brown = '#8a6655';
const blush = '#f4d9de';
const green = '#87936c';
function makeGradient(ctx){
  const gradient = ctx.createLinearGradient(0, 0, 0, 280);
  gradient.addColorStop(0, 'rgba(196,156,160,.45)');
  gradient.addColorStop(1, 'rgba(196,156,160,.03)');
  return gradient;
}
const enrollmentCtx = document.getElementById('enrollmentChart');
if(enrollmentCtx){
  const ctx = enrollmentCtx.getContext('2d');
  new Chart(ctx,{type:'line',data:{labels:years,datasets:[{label:'Total Enrollment',data:enrollment,borderColor:brown,backgroundColor:makeGradient(ctx),fill:true,tension:.42,pointBackgroundColor:pink,pointBorderColor:'#fff',pointBorderWidth:3,pointRadius:6}]},options:{responsive:true,plugins:{legend:{display:false}},scales:{x:{grid:{display:false}},y:{grid:{color:gridColor},beginAtZero:false}}}});
}
const varianceCtx = document.getElementById('varianceChart');
if(varianceCtx){
  new Chart(varianceCtx,{type:'bar',data:{labels:grades.map(g=>g.grade),datasets:[{label:'Net Variance',data:grades.map(g=>g.y2025-g.y2021),backgroundColor:grades.map(g=>(g.y2025-g.y2021)>=0?green:pink),borderRadius:10}]},options:{plugins:{legend:{display:false}},scales:{x:{grid:{display:false}},y:{grid:{color:gridColor}}}}});
}
const priorityCtx = document.getElementById('diagnosticPriorityChart');
if(priorityCtx){
  new Chart(priorityCtx,{type:'radar',data:{labels:['Enrollment','Retention','Class Size','SPED','Attendance'],datasets:[{label:'Priority',data:[95,90,72,88,70],borderColor:brown,backgroundColor:'rgba(196,156,160,.28)',pointBackgroundColor:pink}]},options:{plugins:{legend:{display:false}},scales:{r:{angleLines:{color:gridColor},grid:{color:gridColor},pointLabels:{font:{weight:'700'}},suggestedMin:0,suggestedMax:100}}}});
}
const forecastCtx = document.getElementById('forecastChart');
if(forecastCtx){
  new Chart(forecastCtx,{type:'line',data:{labels:['2021-2022','2022-2023','2023-2024','2024-2025','2025-2026','2026-2027','2027-2028'],datasets:[{label:'Actual',data:[1966,1812,1914,1799,1748,null,null],borderColor:brown,backgroundColor:'transparent',tension:.38,pointRadius:5},{label:'Forecast',data:[null,null,null,null,1748,1700,1650],borderColor:pink,borderDash:[7,6],backgroundColor:'transparent',tension:.38,pointRadius:5}]},options:{plugins:{legend:{position:'bottom',labels:{usePointStyle:true}}},scales:{x:{grid:{display:false}},y:{grid:{color:gridColor}}}}});
}
function pct(n){return (n>0?'+':'')+n.toFixed(1)+'%'}
const varianceBody = document.querySelector('#varianceTable tbody');
if(varianceBody){
  grades.forEach(g=>{
    const diff = g.y2025-g.y2021;
    const change = diff/g.y2021*100;
    const status = diff>20?'Growth':diff<-50?'High Decline':diff<0?'Decline':'Stable';
    const cls = diff>0?'status-up':diff<-50?'status-down':'status-watch';
    varianceBody.insertAdjacentHTML('beforeend',`<tr><td><strong>${g.grade}</strong></td><td>${g.y2021}</td><td>${g.y2025}</td><td>${diff>0?'+':''}${diff}</td><td>${pct(change)}</td><td><span class="status-badge ${cls}">${status}</span></td></tr>`);
  });
}
const summaryBody = document.querySelector('#summaryTable tbody');
if(summaryBody){
  const notes = ['Baseline year with highest enrollment','Decline started after baseline','Temporary recovery / spike','Decline returned; highest dropout recorded','Lowest enrollment in five-year range'];
  enrollment.forEach((e,i)=>{
    const pattern = i===0?'Baseline':e>enrollment[i-1]?'Increase':'Decrease';
    const cls = pattern==='Increase'?'status-up':pattern==='Baseline'?'status-watch':'status-down';
    summaryBody.insertAdjacentHTML('beforeend',`<tr><td><strong>${years[i]}</strong></td><td>${e.toLocaleString()}</td><td><span class="status-badge ${cls}">${pattern}</span></td><td>${notes[i]}</td></tr>`);
  });
}
const matrixBody = document.querySelector('#decisionMatrixTable tbody');
if(matrixBody){
  matrix.forEach(row=>matrixBody.insertAdjacentHTML('beforeend',`<tr>${row.map((c,i)=>i===4?`<td><span class="status-badge ${c==='High'?'status-down':'status-watch'}">${c}</span></td>`:`<td>${c}</td>`).join('')}</tr>`));
}
document.querySelectorAll('.filter-group').forEach(group=>{
  group.addEventListener('click',e=>{
    const btn = e.target.closest('.filter-btn'); if(!btn) return;
    group.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    const board = group.dataset.filterGroup;
    document.querySelectorAll(`.${board}-actions .action-card`).forEach(card=>{
      const cats = card.dataset.category || '';
      card.style.display = filter==='all' || cats.includes(filter) ? '' : 'none';
    });
  });
});
const yearFilter = document.getElementById('yearFilter');
if(yearFilter){
  yearFilter.addEventListener('change',()=>{
    const val=yearFilter.value;
    const idx=years.indexOf(val);
    const current = idx>=0?enrollment[idx]:enrollment[enrollment.length-1];
    document.getElementById('heroEnrollment').textContent=current.toLocaleString();
    document.getElementById('kpiEnrollment').textContent=current.toLocaleString();
    document.getElementById('sideFilterText').textContent=val==='all'?'All Years':val;
  });
}
const menuBtn = document.getElementById('menuBtn');
const sidebar = document.getElementById('sidebar');
if(menuBtn && sidebar){menuBtn.addEventListener('click',()=>sidebar.classList.toggle('open'));}
document.querySelectorAll('.panel,.kpi-card,.action-card,.toolbar-card,.section-title,.hero-card').forEach(el=>el.classList.add('reveal'));
const observer = new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('show');observer.unobserve(entry.target);}})},{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));