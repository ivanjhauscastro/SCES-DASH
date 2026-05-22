const baseRecords = [
  {year:'2021-2022', enrollment:1966, teachers:62, dropout:2, repeaters:6, sped:35, classSize:45},
  {year:'2022-2023', enrollment:1812, teachers:58, dropout:3, repeaters:7, sped:42, classSize:48},
  {year:'2023-2024', enrollment:1914, teachers:60, dropout:4, repeaters:12, sped:52, classSize:60},
  {year:'2024-2025', enrollment:1799, teachers:57, dropout:7, repeaters:5, sped:63, classSize:47},
  {year:'2025-2026', enrollment:1748, teachers:55, dropout:1, repeaters:3, sped:69, classSize:45},
];
let records = loadRecords();
let years = records.map(r => r.year);
let enrollment = records.map(r => r.enrollment);
const grades = [
  {grade:'Kinder', y2021:218, y2025:197}, {grade:'Grade 1', y2021:297, y2025:277},
  {grade:'Grade 2', y2021:206, y2025:241}, {grade:'Grade 3', y2021:362, y2025:233},
  {grade:'Grade 4', y2021:292, y2025:276}, {grade:'Grade 5', y2021:212, y2025:243},
  {grade:'Grade 6', y2021:283, y2025:189}, {grade:'SPED', y2021:35, y2025:69},
];
const matrix = [
  ['Enrollment Decline','Enrollment recovery and parent/community outreach','High','Medium','High'],
  ['Grade 3 and 6 Retention','Cohort tracking, exit surveys, and intervention logs','High','High','High'],
  ['SPED Growth','Resource expansion and classroom reallocation','High','Medium','High'],
  ['Class Size Imbalance','Section redistribution and room planning','Medium','High','Medium'],
  ['Attendance Reliability','Monthly validation and adviser reporting','Medium','High','Medium'],
];
Chart.defaults.font.family='Poppins'; Chart.defaults.color='#6f5d5d';
const gridColor='rgba(138,102,85,.12)', pink='#c49ca0', brown='#8a6655', green='#87936c';
let enrollmentChart, varianceChart, priorityChart, forecastChart;
function loadRecords(){try{const saved=localStorage.getItem('scesDashboardDemoRecords'); if(saved){const p=JSON.parse(saved); if(Array.isArray(p)&&p.length) return p;}}catch(e){} return [...baseRecords];}
function saveRecords(){localStorage.setItem('scesDashboardDemoRecords', JSON.stringify(records));}
function refreshArrays(){records.sort((a,b)=>a.year.localeCompare(b.year)); years=records.map(r=>r.year); enrollment=records.map(r=>Number(r.enrollment));}
function pct(n){if(!Number.isFinite(n)) return '0.0%'; return (n>0?'+':'')+n.toFixed(1)+'%';}
function formatRatio(enrollmentValue, teachers){if(!teachers) return '—'; return `${Math.round(enrollmentValue/teachers)}`;}
function getLatest(){return records[records.length-1];} function getBaseline(){return records[0];}
function makeGradient(ctx){const gradient=ctx.createLinearGradient(0,0,0,280); gradient.addColorStop(0,'rgba(196,156,160,.45)'); gradient.addColorStop(1,'rgba(196,156,160,.03)'); return gradient;}
function updateYearFilter(){const f=document.getElementById('yearFilter'); if(!f) return; const cur=f.value||'all'; f.innerHTML='<option value="all">All Years</option>'; years.forEach(y=>f.insertAdjacentHTML('beforeend',`<option value="${y}">${y}</option>`)); f.value=years.includes(cur)?cur:'all';}
function updateKpis(selectedYear='all'){
  const latest=selectedYear==='all'?getLatest():(records.find(r=>r.year===selectedYear)||getLatest()); const baseline=getBaseline();
  const diff=Number(latest.enrollment)-Number(baseline.enrollment); const declinePct=diff/Number(baseline.enrollment)*100;
  const highestDropout=records.reduce((m,r)=>Number(r.dropout)>Number(m.dropout)?r:m,records[0]);
  const spedGrowth=(Number(latest.sped)-Number(baseline.sped))/(Number(baseline.sped)||1)*100;
  const maxClass=records.reduce((m,r)=>Number(r.classSize)>Number(m.classSize)?r:m,records[0]);
  const set=(id,val)=>{const el=document.getElementById(id); if(el) el.textContent=val;};
  set('heroEnrollment',Number(latest.enrollment).toLocaleString()); set('kpiEnrollment',Number(latest.enrollment).toLocaleString());
  const heroTrend=document.querySelector('.hero-stat span'); if(heroTrend){heroTrend.innerHTML=`<i class="bi ${diff<0?'bi-arrow-down-right':'bi-arrow-up-right'}"></i> ${pct(declinePct)} vs ${baseline.year}`;}
  set('kpiDecline',pct(declinePct)); set('kpiDeclineNote',`${diff>=0?'Increase':'Decrease'} of ${Math.abs(diff).toLocaleString()} students`);
  set('kpiRatio',formatRatio(latest.enrollment, latest.teachers)); set('kpiDropout',Number(highestDropout.dropout).toLocaleString()); set('kpiDropoutNote',`Recorded in SY ${highestDropout.year}`);
  set('kpiSped',pct(spedGrowth)); set('kpiSpedNote',`${baseline.sped} to ${latest.sped} students`); set('kpiClassSize',`~${maxClass.classSize}`); set('kpiClassSizeNote',`Highest recorded in ${maxClass.year}`);
  set('sideFilterText',selectedYear==='all'?'All Years':selectedYear); const af=document.querySelector('.active-filter span'); if(af) af.textContent=`SY ${years[0]} to ${years[years.length-1]}`; set('enrollmentRangeText',`SY ${years[0]} to ${years[years.length-1]}`);
}
function buildForecastData(){const latest=getLatest(), prev=records.length>1?records[records.length-2]:latest; const move=Number(latest.enrollment)-Number(prev.enrollment); const next1=Math.max(0,Math.round(Number(latest.enrollment)+move)); const next2=Math.max(0,Math.round(next1+move)); const endYear=Number(String(latest.year).split('-')[1])||2026; return {labels:[...years,`${endYear}-${endYear+1}`,`${endYear+1}-${endYear+2}`], datasets:[{label:'Actual',data:[...enrollment,null,null],borderColor:brown,backgroundColor:'transparent',tension:.38,pointRadius:5},{label:'Forecast',data:[...Array(years.length-1).fill(null),Number(latest.enrollment),next1,next2],borderColor:pink,borderDash:[7,6],backgroundColor:'transparent',tension:.38,pointRadius:5}]};}
function buildCharts(){
  const enrollmentCtx=document.getElementById('enrollmentChart'); if(enrollmentCtx){const ctx=enrollmentCtx.getContext('2d'); enrollmentChart=new Chart(ctx,{type:'line',data:{labels:years,datasets:[{label:'Total Enrollment',data:enrollment,borderColor:brown,backgroundColor:makeGradient(ctx),fill:true,tension:.42,pointBackgroundColor:pink,pointBorderColor:'#fff',pointBorderWidth:3,pointRadius:6}]},options:{responsive:true,plugins:{legend:{display:false}},scales:{x:{grid:{display:false}},y:{grid:{color:gridColor},beginAtZero:false}}}});}
  const varianceCtx=document.getElementById('varianceChart'); if(varianceCtx){varianceChart=new Chart(varianceCtx,{type:'bar',data:{labels:grades.map(g=>g.grade),datasets:[{label:'Net Variance',data:grades.map(g=>g.y2025-g.y2021),backgroundColor:grades.map(g=>(g.y2025-g.y2021)>=0?green:pink),borderRadius:10}]},options:{plugins:{legend:{display:false}},scales:{x:{grid:{display:false}},y:{grid:{color:gridColor}}}}});}
  const priorityCtx=document.getElementById('diagnosticPriorityChart'); if(priorityCtx){priorityChart=new Chart(priorityCtx,{type:'radar',data:{labels:['Enrollment','Retention','Class Size','SPED','Attendance'],datasets:[{label:'Priority',data:[95,90,72,88,70],borderColor:brown,backgroundColor:'rgba(196,156,160,.28)',pointBackgroundColor:pink}]},options:{plugins:{legend:{display:false}},scales:{r:{angleLines:{color:gridColor},grid:{color:gridColor},pointLabels:{font:{weight:'700'}},suggestedMin:0,suggestedMax:100}}}});}
  const forecastCtx=document.getElementById('forecastChart'); if(forecastCtx){forecastChart=new Chart(forecastCtx,{type:'line',data:buildForecastData(),options:{plugins:{legend:{position:'bottom',labels:{usePointStyle:true}}},scales:{x:{grid:{display:false}},y:{grid:{color:gridColor}}}}});}
}
function updateCharts(){if(enrollmentChart){enrollmentChart.data.labels=years; enrollmentChart.data.datasets[0].data=enrollment; enrollmentChart.update();} if(forecastChart){const d=buildForecastData(); forecastChart.data.labels=d.labels; forecastChart.data.datasets=d.datasets; forecastChart.update();}}
function renderVarianceTable(){const body=document.querySelector('#varianceTable tbody'); if(!body)return; body.innerHTML=''; grades.forEach(g=>{const diff=g.y2025-g.y2021, change=diff/g.y2021*100, status=diff>20?'Growth':diff<-50?'High Decline':diff<0?'Decline':'Stable', cls=diff>0?'status-up':diff<-50?'status-down':'status-watch'; body.insertAdjacentHTML('beforeend',`<tr><td><strong>${g.grade}</strong></td><td>${g.y2021}</td><td>${g.y2025}</td><td>${diff>0?'+':''}${diff}</td><td>${pct(change)}</td><td><span class="status-badge ${cls}">${status}</span></td></tr>`);});}
function renderSummaryTable(){const body=document.querySelector('#summaryTable tbody'); if(!body)return; body.innerHTML=''; records.forEach((r,i)=>{const p=records[i-1]; const pattern=i===0?'Baseline':r.enrollment>p.enrollment?'Increase':r.enrollment<p.enrollment?'Decrease':'Stable'; const cls=pattern==='Increase'?'status-up':pattern==='Baseline'||pattern==='Stable'?'status-watch':'status-down'; const note=i===0?'Baseline year':`${pattern} of ${Math.abs(r.enrollment-p.enrollment).toLocaleString()} students vs previous year`; body.insertAdjacentHTML('beforeend',`<tr><td><strong>${r.year}</strong></td><td>${Number(r.enrollment).toLocaleString()}</td><td><span class="status-badge ${cls}">${pattern}</span></td><td>${note}</td></tr>`);});}
function renderDemoRecordsTable(){const body=document.querySelector('#demoRecordsTable tbody'); if(!body)return; body.innerHTML=''; records.forEach(r=>body.insertAdjacentHTML('beforeend',`<tr><td><strong>${r.year}</strong></td><td>${Number(r.enrollment).toLocaleString()}</td><td>${Number(r.teachers).toLocaleString()}</td><td>${formatRatio(r.enrollment,r.teachers)}:1</td><td>${Number(r.dropout).toLocaleString()}</td><td>${Number(r.repeaters).toLocaleString()}</td><td>${Number(r.sped).toLocaleString()}</td><td>${Number(r.classSize).toLocaleString()}</td></tr>`));}
function renderMatrix(){const body=document.querySelector('#decisionMatrixTable tbody'); if(!body)return; body.innerHTML=''; matrix.forEach(row=>body.insertAdjacentHTML('beforeend',`<tr>${row.map((c,i)=>i===4?`<td><span class="status-badge ${c==='High'?'status-down':'status-watch'}">${c}</span></td>`:`<td>${c}</td>`).join('')}</tr>`));}
function refreshDashboard(selectedYear=document.getElementById('yearFilter')?.value||'all'){refreshArrays(); updateYearFilter(); updateKpis(selectedYear); updateCharts(); renderSummaryTable(); renderDemoRecordsTable();}
function showDemoToast(message){const t=document.getElementById('demoToast'); if(!t)return; t.textContent=message; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),3600);}
function setupAddYearForm(){const form=document.getElementById('addYearForm'); if(form){form.addEventListener('submit',e=>{e.preventDefault(); const newRecord={year:document.getElementById('newYear').value.trim(), enrollment:Number(document.getElementById('newEnrollment').value), teachers:Number(document.getElementById('newTeachers').value), dropout:Number(document.getElementById('newDropout').value||0), repeaters:Number(document.getElementById('newRepeaters').value||0), sped:Number(document.getElementById('newSped').value||0), classSize:Number(document.getElementById('newClassSize').value||0)}; if(!/^\d{4}-\d{4}$/.test(newRecord.year)){showDemoToast('Use school year format like 2026-2027.'); return;} if(!newRecord.enrollment||!newRecord.teachers){showDemoToast('Enrollment and teacher count are required.'); return;} const idx=records.findIndex(r=>r.year===newRecord.year); if(idx>=0){records[idx]=newRecord; showDemoToast(`${newRecord.year} updated. KPIs and charts moved.`);}else{records.push(newRecord); showDemoToast(`${newRecord.year} added. KPIs and charts moved.`);} saveRecords(); refreshDashboard(newRecord.year); const yf=document.getElementById('yearFilter'); if(yf) yf.value=newRecord.year; form.reset(); document.getElementById('newDropout').value=0; document.getElementById('newRepeaters').value=0; document.getElementById('newSped').value=0; document.getElementById('newClassSize').value=45;});}
const resetBtn=document.getElementById('resetDemoData'); if(resetBtn){resetBtn.addEventListener('click',()=>{records=[...baseRecords]; saveRecords(); refreshDashboard('all'); const yf=document.getElementById('yearFilter'); if(yf) yf.value='all'; showDemoToast('Records reset to original sample data.');});}}
function setupFilters(){document.querySelectorAll('.filter-group').forEach(group=>{group.addEventListener('click',e=>{const btn=e.target.closest('.filter-btn'); if(!btn)return; group.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active')); btn.classList.add('active'); const filter=btn.dataset.filter, board=group.dataset.filterGroup; document.querySelectorAll(`.${board}-actions .action-card`).forEach(card=>{const cats=card.dataset.category||''; card.style.display=filter==='all'||cats.includes(filter)?'':'none';});});});}
function setupYearFilter(){const yf=document.getElementById('yearFilter'); if(yf){yf.addEventListener('change',()=>updateKpis(yf.value));}}
function setupMobileMenu(){const menuBtn=document.getElementById('menuBtn'), sidebar=document.getElementById('sidebar'); if(menuBtn&&sidebar){menuBtn.addEventListener('click',()=>sidebar.classList.toggle('open'));}}
function setupReveal(){document.querySelectorAll('.panel,.kpi-card,.action-card,.toolbar-card,.section-title,.hero-card').forEach(el=>el.classList.add('reveal')); const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('show'); observer.unobserve(entry.target);}})},{threshold:.12}); document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));}
refreshArrays(); buildCharts(); renderVarianceTable(); renderMatrix(); refreshDashboard('all'); setupFilters(); setupYearFilter(); setupAddYearForm(); setupMobileMenu(); setupReveal();
