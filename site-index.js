/* ═══════════════════════════════════════════
   SCROLL REVEAL
═══════════════════════════════════════════ */
new IntersectionObserver(entries => {
  entries.forEach(e => { if(e.isIntersecting){e.target.classList.add('in');} });
},{threshold:.07,rootMargin:'0px 0px -32px 0px'})
.observe = (() => {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('in'); } });
  },{threshold:.07,rootMargin:'0px 0px -32px 0px'});
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
  return obs.observe.bind(obs);
})();

/* ═══════════════════════════════════════════
   INDUSTRY TAB SWITCHER
═══════════════════════════════════════════ */
function switchInd(id, el) {
  document.querySelectorAll('.ind-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.ind-tab').forEach(t => t.classList.remove('active'));
  const panel = document.getElementById('panel-' + id);
  if (panel) {
    panel.classList.add('active');
    const first = panel.querySelector('.sql-block');
    if (first && !first.classList.contains('open')) first.classList.add('open');
  }
  if (el) el.classList.add('active');
  // Also sync the sim select
  const sel = document.getElementById('sim-select');
  if (sel) sel.value = id;
  simSelectInd(id);
}

/* ═══════════════════════════════════════════
   SQL ACCORDION
═══════════════════════════════════════════ */
function toggleCode(id) {
  const b = document.getElementById(id);
  if (b) b.classList.toggle('open');
}

/* ═══════════════════════════════════════════
   HERO CHIP CLICKS
═══════════════════════════════════════════ */
document.querySelectorAll('.ind-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    const target = chip.dataset.target;
    document.querySelectorAll('.ind-chip').forEach(c => c.classList.remove('active','dimmed'));
    chip.classList.add('active');
    document.getElementById('sql-section')?.scrollIntoView({behavior:'smooth',block:'start'});
    setTimeout(() => {
      const tab = document.querySelector(`.ind-tab[data-id="${target}"]`);
      if (tab) switchInd(target, tab);
    }, 450);
  });
});

/* ═══════════════════════════════════════════
   PIPELINE DATA — 5 INDUSTRIES
═══════════════════════════════════════════ */
const PIPELINES = {
  healthcare: {
    label: '🏥 Healthcare — Clinical Operations',
    file: 'clinical_ops_pipeline.sql',
    bronze: { rows:'284,391', casts:'23', keys:'284,391', tests:'14 passed', time:'4.2s' },
    silver: { rows:'281,004', joins:'6', windows:'11', rej:'3,387', tests:'8 passed' },
    gold:   { rows:'36 months', aggs:'7', grain:'Monthly', bi:'Triggered', status:'✓ Complete' },
    kpis: [
      {l:'Total Encounters',   v:'281,004', delta:'↑ 3.2% MoM',  dir:'up',  color:'#38c9f0'},
      {l:'No-Show Rate',       v:'8.4%',    delta:'↓ 1.1pp',     dir:'up',  color:'#3ed98f'},
      {l:'Avg LOS (hours)',    v:'6.2h',    delta:'↓ 0.4h',      dir:'up',  color:'#a78bfa'},
      {l:'Total Billed',       v:'$18.7M',  delta:'↑ $1.2M',     dir:'up',  color:'#f5c842'},
    ],
    c1:{title:'Monthly Encounter Volume', type:'bar',
      labels:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
      data:[7200,7450,7800,7600,7844,8100,8050,7900,8200,8350,8500,8750],
      color:'rgba(56,201,240,0.75)', border:'#38c9f0'},
    c2:{title:'Encounter Status Mix', type:'doughnut',
      labels:['Completed','No-Show','Cancelled','Scheduled'],
      data:[71,8,10,11],
      colors:['#38c9f0','#f87171','#f5c842','#a78bfa']},
    logs:[
      ['RUN','Connecting to Snowflake — HEALTHCARE_PROD · schema: CRIO_RAW'],
      ['RUN','Executing <span class="hl">stg_patient_encounters</span>'],
      ['INFO','Source: ehr_raw.encounters — <span class="hl">284,391 rows</span>'],
      ['INFO','Applying 23 type casts: encounter_date::DATE, admit_ts::TIMESTAMP_NTZ ...'],
      ['INFO','Generating MD5 surrogate keys on encounter_id + patient_id'],
      ['OK','14 staging null/unique tests → all passed'],
      ['INFO','Advancing to Silver — applying HIPAA field exclusions'],
      ['INFO','Computing 30-day LAG() readmission windows per patient'],
      ['INFO','Resolving DATEDIFF LOS from admission_at → discharge_at'],
      ['WARN','3,387 rows rejected — negative billed_amount or missing encounter_date'],
      ['OK','8 silver business rule tests → all passed'],
      ['INFO','Building Gold — fct_monthly_clinical_ops aggregation'],
      ['INFO','Computing no_show_rate_pct, readmission_rate_pct, avg_los_hours with LAG MoM'],
      ['OK','Gold layer complete — <span class="hl">36 months × 7 metrics</span>'],
      ['OK','Power BI REST API dataset refresh triggered ✓'],
    ]
  },
  finance: {
    label: '💳 Finance — Transaction Risk & Fraud',
    file: 'transaction_risk_pipeline.sql',
    bronze: { rows:'1,842,003', casts:'18', keys:'1,842,003', tests:'12 passed', time:'6.8s' },
    silver: { rows:'1,840,190', joins:'4', windows:'9', rej:'1,813', tests:'11 passed' },
    gold:   { rows:'180 days', aggs:'9', grain:'Daily', bi:'Triggered', status:'✓ Complete' },
    kpis: [
      {l:'Total Transactions',  v:'1.84M',  delta:'↑ 5.8% vs yesterday', dir:'up',  color:'#34d399'},
      {l:'Risk Rate',           v:'2.1%',   delta:'↓ 0.3pp vs 7d avg',   dir:'up',  color:'#38c9f0'},
      {l:'Flagged Exposure',    v:'$4.3M',  delta:'↑ 14% MoM',           dir:'dn',  color:'#f87171'},
      {l:'Avg Txn Amount',      v:'$127',   delta:'↑ $8 vs prior week',   dir:'up',  color:'#f5c842'},
    ],
    c1:{title:'Daily Transaction Volume (14d)', type:'bar',
      labels:['D-14','D-13','D-12','D-11','D-10','D-9','D-8','D-7','D-6','D-5','D-4','D-3','D-2','D-1'],
      data:[128000,141000,135000,152000,168000,89000,143000,155000,161000,148000,172000,138000,159000,167000],
      color:'rgba(52,211,153,0.75)', border:'#34d399'},
    c2:{title:'Transaction Type Split', type:'doughnut',
      labels:['Purchase','Transfer','Withdrawal','Refund'],
      data:[62,19,13,6],
      colors:['#34d399','#f5c842','#38c9f0','#a78bfa']},
    logs:[
      ['RUN','Connecting to Snowflake — FINANCE_PROD · schema: PAYMENTS_RAW'],
      ['RUN','Executing <span class="hl">stg_transactions</span>'],
      ['INFO','Source: core_banking.transactions — <span class="hl">1,842,003 rows</span>'],
      ['INFO','ROW_NUMBER() dedup on (account_id, txn_ts, amount) — 0 duplicates'],
      ['INFO','Type casting: txn_ts::TIMESTAMP_NTZ, amount::NUMERIC(14,2)'],
      ['OK','12 staging tests passed — 0 duplicate transaction keys'],
      ['INFO','Silver — computing 7-day rolling SUM per account'],
      ['INFO','Calculating z-scores via STDDEV_SAMP() per account partition'],
      ['INFO','Flagging high-risk: z_score>3 OR velocity_per_hr>20 OR rolling_7d>$10k'],
      ['WARN','1,813 rows rejected — null account_id or zero-amount anomalies'],
      ['OK','11 silver tests → all passed'],
      ['INFO','Building Gold — fct_account_risk_summary'],
      ['INFO','Aggregating risk_rate_pct, flagged_exposure, 30d spend delta per account'],
      ['OK','Gold layer complete — <span class="hl">180 days × 9 risk metrics</span>'],
      ['OK','Fraud ops dashboard refresh triggered ✓'],
    ]
  },
  insurance: {
    label: '🛡️ Insurance — Claims Analytics',
    file: 'claims_pipeline.sql',
    bronze: { rows:'492,810', casts:'21', keys:'492,810', tests:'10 passed', time:'3.4s' },
    silver: { rows:'489,240', joins:'7', windows:'8', rej:'3,570', tests:'9 passed' },
    gold:   { rows:'24 months', aggs:'8', grain:'Monthly', bi:'Triggered', status:'✓ Complete' },
    kpis: [
      {l:'Claims Processed',   v:'489,240', delta:'↑ 4.1% MoM',    dir:'up', color:'#a78bfa'},
      {l:'Loss Ratio',         v:'68.4%',   delta:'↓ 2.1pp vs Q1', dir:'up', color:'#3ed98f'},
      {l:'Avg Claim ($)',      v:'$4,820',  delta:'↑ $140 MoM',    dir:'dn', color:'#f5c842'},
      {l:'Fraud Flag Rate',    v:'1.8%',    delta:'↓ 0.4pp',        dir:'up', color:'#38c9f0'},
    ],
    c1:{title:'Monthly Claims Volume & Loss Ratio', type:'bar',
      labels:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
      data:[38000,41200,39800,44100,42500,40800,45200,43100,46800,44500,48200,47100],
      color:'rgba(167,139,250,0.75)', border:'#a78bfa'},
    c2:{title:'Claims by Line of Business', type:'doughnut',
      labels:['Auto','Home','Life','Health','Commercial'],
      data:[38,24,14,18,6],
      colors:['#a78bfa','#38c9f0','#34d399','#f5c842','#f87171']},
    logs:[
      ['RUN','Connecting to Snowflake — INSURANCE_PROD · schema: CLAIMS_RAW'],
      ['RUN','Executing <span class="hl">stg_claims</span>'],
      ['INFO','Source: claims_system.raw_claims — <span class="hl">492,810 rows</span>'],
      ['INFO','Normalizing claim_status codes: OPEN/CLOSED/PENDING/DENIED'],
      ['INFO','Generating claim_key via MD5(claim_id || policy_id || loss_date)'],
      ['OK','10 staging null/unique/referential tests → all passed'],
      ['INFO','Silver — joining policy dimension and agent hierarchy'],
      ['INFO','Computing days_to_close via DATEDIFF(report_date, close_date)'],
      ['INFO','Flagging fraud indicators: velocity, amount z-score, blacklist match'],
      ['WARN','3,570 rows rejected — invalid policy_id or pre-cutoff loss_date'],
      ['OK','9 silver tests → all passed'],
      ['INFO','Building Gold — fct_monthly_claims_kpis'],
      ['INFO','Computing loss_ratio_pct, avg_claim_amount, fraud_flag_rate with LAG'],
      ['OK','Gold layer complete — <span class="hl">24 months × 8 metrics</span>'],
      ['OK','Actuarial dashboard refresh triggered ✓'],
    ]
  },
  hr: {
    label: '👥 HR & Payroll — Workforce Analytics',
    file: 'workforce_pipeline.sql',
    bronze: { rows:'14,820', casts:'17', keys:'14,820', tests:'11 passed', time:'1.4s' },
    silver: { rows:'14,820', joins:'4', windows:'5', rej:'0', tests:'8 passed' },
    gold:   { rows:'24 months', aggs:'6', grain:'Monthly', bi:'Triggered', status:'✓ Complete' },
    kpis: [
      {l:'Active Headcount',   v:'13,940', delta:'↑ 120 MoM',    dir:'up', color:'#f59e0b'},
      {l:'Monthly Attrition',  v:'2.1%',   delta:'↓ 0.3pp',       dir:'up', color:'#3ed98f'},
      {l:'Avg Tenure (mos)',   v:'28.4',   delta:'↑ 1.2mo YoY',   dir:'up', color:'#38c9f0'},
      {l:'Avg Salary',         v:'$87K',   delta:'↑ 3.2% vs last', dir:'up', color:'#a78bfa'},
    ],
    c1:{title:'Monthly Attrition Rate %', type:'bar',
      labels:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
      data:[2.8,2.6,2.4,2.5,2.3,2.2,2.4,2.3,2.1,2.0,2.2,2.1],
      color:'rgba(245,158,11,0.75)', border:'#f59e0b'},
    c2:{title:'Attrition by Tenure Band', type:'doughnut',
      labels:['0–1 yr','1–3 yr','3–5 yr','5–10 yr','10+ yr'],
      data:[42,31,16,8,3],
      colors:['#f87171','#f59e0b','#f5c842','#34d399','#38c9f0']},
    logs:[
      ['RUN','Connecting to Snowflake — HR_PROD · schema: ADP_RAW'],
      ['RUN','Executing <span class="hl">stg_employees</span>'],
      ['INFO','Source: adp.employee_master — <span class="hl">14,820 records</span>'],
      ['INFO','SHA2-hashing PII: email, ssn, full_name → 256-bit digests'],
      ['INFO','Computing salary_band, tenure start/end date casts'],
      ['OK','11 staging tests passed — employee_id unique, hire_date non-null'],
      ['INFO','Silver — flagging is_active, computing tenure_months'],
      ['INFO','DATEDIFF(hire_date, COALESCE(term_date, CURRENT_DATE)) per employee'],
      ['INFO','Assigning tenure bands: <1yr | 1-3yr | 3-5yr | 5-10yr | 10+yr'],
      ['OK','0 rows rejected — all records passed validation'],
      ['OK','8 silver tests → tenure positive, active flag valid ✓'],
      ['INFO','Building Gold — fct_monthly_attrition per dept × tenure band'],
      ['INFO','Computing attrition_rate_pct, voluntary_sep_rate_pct, LAG MoM'],
      ['OK','Gold layer complete — <span class="hl">24 months × 6 workforce metrics</span>'],
      ['OK','People ops dashboard refresh triggered ✓'],
    ]
  },
  hotel: {
    label: '🏨 Hotels & Guests — Hospitality Analytics',
    file: 'guest_analytics_pipeline.sql',
    bronze: { rows:'628,440', casts:'24', keys:'628,440', tests:'13 passed', time:'4.8s' },
    silver: { rows:'624,110', joins:'8', windows:'10', rej:'4,330', tests:'10 passed' },
    gold:   { rows:'36 months', aggs:'11', grain:'Monthly/Property', bi:'Triggered', status:'✓ Complete' },
    kpis: [
      {l:'Total Room Nights',  v:'624,110', delta:'↑ 6.8% vs last yr', dir:'up', color:'#f472b6'},
      {l:'Avg Daily Rate',     v:'$189',    delta:'↑ $12 vs LY',        dir:'up', color:'#f5c842'},
      {l:'Occupancy Rate',     v:'71.4%',   delta:'↑ 3.2pp vs LY',      dir:'up', color:'#34d399'},
      {l:'RevPAR',             v:'$134.9',  delta:'↑ $9.4 vs LY',       dir:'up', color:'#38c9f0'},
    ],
    c1:{title:'Monthly RevPAR by Property Type', type:'bar',
      labels:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
      data:[112,108,128,138,142,158,168,174,155,148,138,145],
      color:'rgba(244,114,182,0.75)', border:'#f472b6'},
    c2:{title:'Guest Segment Distribution', type:'doughnut',
      labels:['Leisure','Business','Group','Extended Stay'],
      data:[48,28,16,8],
      colors:['#f472b6','#38c9f0','#f5c842','#34d399']},
    logs:[
      ['RUN','Connecting to Snowflake — HOSPITALITY_PROD · schema: PMS_RAW'],
      ['RUN','Executing <span class="hl">stg_reservations</span>'],
      ['INFO','Source: pms_system.reservations — <span class="hl">628,440 rows</span>'],
      ['INFO','Normalizing channel codes: OTA/DIRECT/GDS/VOICE/CORP'],
      ['INFO','Computing nights_stayed via DATEDIFF(check_in_date, check_out_date)'],
      ['INFO','Generating reservation_key: MD5(reservation_id || property_id || check_in)'],
      ['OK','13 staging tests passed — reservation_id unique, dates valid'],
      ['INFO','Silver — joining property dimension, rate plan codes, loyalty tier'],
      ['INFO','Computing ADR = total_revenue / nights, RevPAR = ADR × occupancy_rate'],
      ['INFO','RFM scoring guests: recency(days since last stay), frequency, monetary(LTV)'],
      ['INFO','Flagging VIP guests: loyalty_tier IN (Gold, Platinum) OR total_nights > 20'],
      ['WARN','4,330 rows rejected — cancelled reservations or missing check_out_date'],
      ['OK','10 silver tests → all passed'],
      ['INFO','Building Gold — fct_monthly_property_kpis with YoY LAG comparisons'],
      ['INFO','Computing occupancy_rate, ADR, RevPAR, guest_sat_score, NPS per property'],
      ['OK','Gold layer complete — <span class="hl">36 months × 11 hospitality metrics</span>'],
      ['OK','Revenue management dashboard refresh triggered ✓'],
    ]
  }
};

/* ═══════════════════════════════════════════
   SIMULATOR STATE & HELPERS
═══════════════════════════════════════════ */
let currentInd = 'healthcare';
let isRunning = false;
let pipeStart = null;
let chart1 = null, chart2 = null;
const sleep = ms => new Promise(r => setTimeout(r, ms));

function sv(id, v) { const e = document.getElementById(id); if(e) e.textContent = v; }
function sc(id, cls) { const e = document.getElementById(id); if(e) e.className = cls; }

function simSelectInd(id) {
  currentInd = id;
  const p = PIPELINES[id];
  const fname = document.getElementById('sim-filename');
  if (fname) fname.textContent = p.file;
}

function appendLog(tag, msg) {
  const body = document.getElementById('console-body');
  if (!body) return;
  const el = document.tooted = ((Date.now() - (pipeStart||Date.now()))/1000).toFixed(1);
  const ts = ((Date.now() - (pipeStart||Date.now()))/1000).toFixed(1);
  const cls = {OK:'lt-ok',INFO:'lt-info',WARN:'lt-warn',RUN:'lt-run'}[tag]||'lt-info';
  const line = document.createElement('div');
  line.className = 'log-line';
  line.innerHTML = `<span class="log-ts">${ts}s</span><span class="log-tag ${cls}">${tag}</span><span class="log-msg">${msg}</span>`;
  body.appendChild(line);
  body.scrollTop = body.scrollHeight;
}

function animateFlow(fId, cId) {
  const fl = document.getElementById(fId);
  const ca = document.getElementById(cId);
  if (fl) fl.classList.add('flowing');
  setTimeout(() => {
    if (fl) { fl.classList.remove('flowing'); fl.classList.add('done'); }
    if (ca) ca.classList.add('lit');
  }, 750);
}

function clearStages() {
  ['bronze','silver','gold'].forEach(s => {
    const dot = document.getElementById('dot-'+s);
    const lbl = document.getElementById('lbl-'+s);
    if (dot) dot.className = 'stage__dot';
    if (lbl && s !== 'bronze') { lbl.style.color = 'var(--t3)'; }
    const st = document.getElementById('st-'+s);
    if (st) st.className = 'stage' + (s==='bronze' ? ' ' : '');
  });
  ['v-brows','v-bcasts','v-bkeys','v-btests','v-btime',
   'v-srows','v-sjoins','v-swindows','v-srej','v-stests',
   'v-grows','v-gaggs','v-ggrain','v-gbi','v-gstatus'].forEach(id => sv(id, '—'));
  ['flow1','flow2'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.className = 'flow-line';
  });
  ['caret1','caret2'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.className = 'flow-caret';
  });
}

/* ═══════════════════════════════════════════
   RUN PIPELINE
═══════════════════════════════════════════ */
async function runPipeline() {
  if (isRunning) return;
  isRunning = true;
  pipeStart = Date.now();
  const btn = document.getElementById('run-btn');
  if (btn) { btn.disabled = true; btn.innerHTML = '⏳ Running…'; }
  document.getElementById('console-body').innerHTML = '';
  clearStages();
  sv('st-status','running'); sv('st-rows','—'); sv('st-tests','—'); sv('st-dur','—');

  const p = PIPELINES[currentInd];
  const delay = 480;

  // ── BRONZE ──
  document.getElementById('dot-bronze').className = 'stage__dot running';
  document.getElementById('st-bronze').classList.add('st-run');
  for (let i = 0; i < 6; i++) { await sleep(i===0?60:delay); appendLog(p.logs[i][0], p.logs[i][1]); }
  sv('v-brows', p.bronze.rows); sv('v-bcasts', p.bronze.casts);
  sv('v-bkeys', p.bronze.keys); sv('v-btests', p.bronze.tests); sv('v-btime', p.bronze.time);
  document.getElementById('dot-bronze').className = 'stage__dot done';
  document.getElementById('st-bronze').classList.remove('st-run');
  document.getElementById('st-bronze').classList.add('st-done');
  animateFlow('flow1','caret1');

  // ── SILVER ──
  await sleep(380);
  document.getElementById('dot-silver').className = 'stage__dot running';
  document.getElementById('lbl-silver').style.color = 'var(--ins)';
  document.getElementById('st-silver').classList.add('st-run');
  for (let i = 6; i < 11; i++) { await sleep(delay); appendLog(p.logs[i][0], p.logs[i][1]); }
  sv('v-srows', p.silver.rows); sv('v-sjoins', p.silver.joins);
  sv('v-swindows', p.silver.windows); sv('v-srej', p.silver.rej); sv('v-stests', p.silver.tests);
  document.getElementById('dot-silver').className = 'stage__dot done';
  document.getElementById('st-silver').classList.remove('st-run');
  document.getElementById('st-silver').classList.add('st-done');
  animateFlow('flow2','caret2');

  // ── GOLD ──
  await sleep(380);
  document.getElementById('dot-gold').className = 'stage__dot running';
  document.getElementById('lbl-gold').style.color = 'var(--gold)';
  document.getElementById('st-gold').classList.add('st-run');
  for (let i = 11; i < p.logs.length; i++) { await sleep(delay); appendLog(p.logs[i][0], p.logs[i][1]); }
  sv('v-grows', p.gold.rows); sv('v-gaggs', p.gold.aggs);
  sv('v-ggrain', p.gold.grain); sv('v-gbi', p.gold.bi); sv('v-gstatus', p.gold.status);
  document.getElementById('dot-gold').className = 'stage__dot done';
  document.getElementById('st-gold').classList.remove('st-run');
  document.getElementById('st-gold').classList.add('st-done');

  const elapsed = ((Date.now()-pipeStart)/1000).toFixed(1);
  sv('st-rows', p.bronze.rows); sv('st-tests','All passed'); sv('st-dur', elapsed+'s'); sv('st-status','✓ Success');

  // ── DASHBOARD ──
  await sleep(400);
  buildDashboard(p);

  if (btn) { btn.disabled=false; btn.innerHTML='▶ Run Pipeline'; }
  isRunning = false; pipeStart = null;
}

function resetSim() {
  if (isRunning) return;
  document.getElementById('console-body').innerHTML =
    '<div class="log-line"><span class="log-ts">0.0s</span><span class="log-tag lt-info">INFO</span><span class="log-msg">Ready — select an industry and click <span class="hl">Run Pipeline</span></span></div>';
  clearStages();
  sv('st-status','idle'); sv('st-rows','—'); sv('st-tests','—'); sv('st-dur','—');
  document.getElementById('dashboard').style.display = 'none';
  document.getElementById('dash-placeholder').style.display = '';
  if (chart1) { chart1.destroy(); chart1 = null; }
  if (chart2) { chart2.destroy(); chart2 = null; }
}

/* ═══════════════════════════════════════════
   BUILD GOLD DASHBOARD
═══════════════════════════════════════════ */
const CHART_OPTS = {
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor:'#131726', titleColor:'#edf0fa', bodyColor:'#7b8499',
      padding:10, cornerRadius:6,
      borderColor:'rgba(255,255,255,0.08)', borderWidth:1,
      titleFont:{family:"'DM Mono',monospace",size:11},
      bodyFont:{family:"'DM Mono',monospace",size:11}
    }
  },
  scales: {
    x:{grid:{color:'rgba(255,255,255,0.04)'},ticks:{color:'#3e4760',font:{family:"'DM Mono',monospace",size:10}}},
    y:{grid:{color:'rgba(255,255,255,0.04)'},ticks:{color:'#3e4760',font:{family:"'DM Mono',monospace",size:10}}}
  },
  animation:{duration:700,easing:'easeOutQuart'}
};

function buildDashboard(p) {
  document.getElementById('dash-placeholder').style.display = 'none';
  const dash = document.getElementById('dashboard');
  dash.style.display = 'block';
  document.getElementById('dash-title').textContent = p.label;
  document.getElementById('dash-ts').textContent = new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});

  // KPIs
  document.getElementById('kpi-row').innerHTML = p.kpis.map(k => `
    <div class="kpi">
      <div class="kpi__lbl">${k.l}</div>
      <div class="kpi__val" style="color:${k.color}">${k.v}</div>
      <div class="kpi__delta ${k.dir}">${k.delta}</div>
    </div>`).join('');

  // Chart 1 — Bar
  document.getElementById('c1-title').textContent = p.c1.title;
  if (chart1) chart1.destroy();
  chart1 = new Chart(document.getElementById('chart1').getContext('2d'), {
    type: 'bar',
    data: {
      labels: p.c1.labels,
      datasets:[{data:p.c1.data, backgroundColor:p.c1.color, borderColor:p.c1.border, borderWidth:1.5, borderRadius:4}]
    },
    options:{...CHART_OPTS,responsive:true,maintainAspectRatio:false}
  });

  // Chart 2 — Doughnut
  document.getElementById('c2-title').textContent = p.c2.title;
  if (chart2) chart2.destroy();
  chart2 = new Chart(document.getElementById('chart2').getContext('2d'), {
    type:'doughnut',
    data:{labels:p.c2.labels,datasets:[{data:p.c2.data,backgroundColor:p.c2.colors,borderColor:'#0d0f1c',borderWidth:2}]},
    options:{
      responsive:true, maintainAspectRatio:false, cutout:'64%',
      animation:{duration:700,easing:'easeOutQuart'},
      plugins:{
        legend:{display:true,position:'bottom',labels:{color:'#7b8499',font:{family:"'DM Mono',monospace",size:10},padding:12,boxWidth:10,boxHeight:10}},
        tooltip:CHART_OPTS.plugins.tooltip
      },
      scales:{}
    }
  });

  setTimeout(() => dash.scrollIntoView({behavior:'smooth',block:'nearest'}),100);
}

/* ═══════════════════════════════════════════
   INIT
═══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  // Reveal observer
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if(e.isIntersecting){e.target.classList.add('in');} });
  },{threshold:.07,rootMargin:'0px 0px -32px 0px'});
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

  // Open first SQL block in active panel
  const active = document.querySelector('.ind-panel.active');
  if (active) {
    const first = active.querySelector('.sql-block');
    if (first) first.classList.add('open');
  }

  // Init sim
  simSelectInd('healthcare');
});
