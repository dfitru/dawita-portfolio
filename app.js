/* ============================================================
   MEDALLION ARCHITECTURE PORTFOLIO
   app.js — All interactivity & pipeline data
   ------------------------------------------------------------
   Author   : Dawit Adane — Senior Data Engineer
   LinkedIn : linkedin.com/in/dawit1221
   ------------------------------------------------------------
   TABLE OF CONTENTS
   1.  Scroll Reveal — IntersectionObserver setup
   2.  Industry Tab Switcher  (Section 01 — SQL panels)
   3.  SQL Accordion toggle   (toggleSql)
   4.  Pipeline Data          (PIPELINES object — 5 industries)
   5.  Pipeline State & Helpers (sleep, setVal, addClass…)
   6.  simSelectInd()         — simulator industry selector
   7.  runPipeline()          — animated bronze→silver→gold run
   8.  clearStages()          — reset all stage UI
   9.  hardReset()            — full UI + dashboard reset
  10.  buildDashboard()       — Gold-layer KPI cards + Chart.js
  11.  Chart.js configuration (chartBase options)
============================================================ */

/* ═══════════════════════════════════════
   SCROLL REVEAL — IntersectionObserver
═══════════════════════════════════════ */
/* ─── 1. SCROLL REVEAL ─────────────────────────────────── */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ═══════════════════════════════════════
   INDUSTRY TABS (Section 01)
═══════════════════════════════════════ */

/* ─── 2. INDUSTRY TAB SWITCHER (Section 01) ─────────────── */
function switchInd(id, el) {
  document.querySelectorAll('.industry-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.ind-pill').forEach(t => t.classList.remove('active'));
  document.getElementById('panel-' + id).classList.add('active');
  el.classList.add('active');
}


/* ─── 3. SQL ACCORDION ─────────────────────────────────── */
function toggleSql(id) {
  const block = document.getElementById(id);
  block.classList.toggle('open');
}

/* ═══════════════════════════════════════
   PIPELINE DATA
═══════════════════════════════════════ */

/* ─── 4. PIPELINE DATA — 5 industries ──────────────────── */
const PIPELINES = {
  healthcare: {
    label: '🏥 Clinical Operations',
    bronze: { rows:'284,391', casts:'23', keys:'284,391', tests:'14 passed', time:'4.2s' },
    silver: { rows:'281,004', joins:'6', windows:'11', rejected:'3,387', tests:'8 passed' },
    gold:   { rows:'36 months', aggs:'7', grain:'Monthly', bi:'Triggered', status:'✓ Complete' },
    kpis: [
      { label:'Avg LOS (days)', value:'4.2', delta:'-0.3', dir:'up' },
      { label:'No-Show Rate', value:'11.4%', delta:'-1.8%', dir:'up' },
      { label:'Readmission Rate', value:'8.7%', delta:'-0.5%', dir:'up' },
      { label:'Encounters / Mo', value:'7,844', delta:'+312', dir:'up' }
    ],
    chart1: { label:'Monthly Encounters', labels:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'], data:[7200,7450,7800,7600,7844,8100,8050,7900,8200,8350,8500,8750], color:'rgba(91,141,238,0.75)' },
    chart2: { label:'Encounter Type Mix', labels:['Outpatient','Inpatient','Emergency','Telehealth'], data:[52,18,15,15], colors:['#5b8dee','#a0aec0','#f2c94c','#4ade80'] },
    logs: [
      ['RUN','Starting Healthcare clinical pipeline — CRIO source'],
      ['RUN','Connecting to Snowflake: PROD_DB.CRIO_RAW'],
      ['INFO','stg_patient_encounters — extracting <span class="hl">284,391 rows</span>'],
      ['INFO','Applying 23 type casts: encounter_date::DATE, admit_ts::TIMESTAMP ...'],
      ['INFO','Generating MD5 surrogate keys on encounter_id + patient_id'],
      ['OK','14 staging null/unique tests → all passed'],
      ['INFO','Advancing to Silver — applying HIPAA field rules'],
      ['INFO','silver_encounters — computing LAG() readmission windows (30d)'],
      ['INFO','Resolving DATEDIFF length-of-stay from admit→discharge timestamps'],
      ['WARN','3,387 rows rejected: missing discharge_date or invalid encounter type'],
      ['OK','8 silver business rule tests → all passed'],
      ['INFO','Building Gold — fct_monthly_clinical_ops aggregation'],
      ['INFO','Computing monthly no-show rate, readmission rate, avg LOS with LAG MoM'],
      ['OK','Gold layer complete — <span class="hl">36 months × 7 metrics</span>'],
      ['OK','Power BI dataset refresh triggered via REST API ✓']
    ]
  },
  finance: {
    label: '💳 Transaction Risk & Fraud',
    bronze: { rows:'1,842,003', casts:'18', keys:'1,842,003', tests:'12 passed', time:'6.8s' },
    silver: { rows:'1,840,190', joins:'4', windows:'9', rejected:'1,813', tests:'11 passed' },
    gold:   { rows:'180 days', aggs:'9', grain:'Daily', bi:'Triggered', status:'✓ Complete' },
    kpis: [
      { label:'Flagged Txns', value:'2.3%', delta:'-0.4%', dir:'up' },
      { label:'Avg Z-Score (flagged)', value:'3.8σ', delta:'+0.2σ', dir:'down' },
      { label:'Exposure at Risk', value:'$1.2M', delta:'-$180K', dir:'up' },
      { label:'Velocity / hr', value:'14.7', delta:'+1.2', dir:'down' }
    ],
    chart1: { label:'Daily Flagged Transactions (14 days)', labels:['D-14','D-13','D-12','D-11','D-10','D-9','D-8','D-7','D-6','D-5','D-4','D-3','D-2','D-1'], data:[42,39,51,38,44,36,29,41,48,33,27,31,38,35], color:'rgba(248,113,113,0.7)' },
    chart2: { label:'Risk Category Distribution', labels:['Normal','Elevated','High Risk','Critical'], data:[73,17,7,3], colors:['#4ade80','#f2c94c','#f5a623','#f87171'] },
    logs: [
      ['RUN','Starting Finance risk pipeline — transactions source'],
      ['RUN','Connecting to Snowflake: PROD_DB.PAYMENTS_RAW'],
      ['INFO','stg_transactions — extracting <span class="hl">1,842,003 rows</span>'],
      ['INFO','Applying ROW_NUMBER() dedup on (account_id, txn_ts, amount)'],
      ['INFO','Type casting: txn_ts::TIMESTAMP, amount::NUMERIC(14,2)'],
      ['OK','12 staging tests passed — 0 duplicate transaction keys'],
      ['INFO','Silver — computing 7-day rolling SUM and daily transaction COUNT'],
      ['INFO','Calculating z-scores via STDDEV_SAMP() per account × day'],
      ['INFO','Flagging high-risk rows: z-score > 3 OR velocity_per_hr > 20'],
      ['WARN','1,813 rows rejected: null account_id or zero-amount anomalies'],
      ['OK','11 silver tests → all passed'],
      ['INFO','Building Gold — fct_account_risk_summary aggregation'],
      ['INFO','Aggregating risk_rate_pct, flagged_exposure, 30d spend delta'],
      ['OK','Gold layer complete — <span class="hl">180 days × 9 risk metrics</span>'],
      ['OK','Power BI dataset refresh triggered via REST API ✓']
    ]
  },
  retail: {
    label: '🛒 Customer 360 & RFM',
    bronze: { rows:'623,840', casts:'16', keys:'623,840', tests:'10 passed', time:'3.9s' },
    silver: { rows:'621,200', joins:'5', windows:'8', rejected:'2,640', tests:'7 passed' },
    gold:   { rows:'48,330 customers', aggs:'6', grain:'Customer', bi:'Triggered', status:'✓ Complete' },
    kpis: [
      { label:'Champions', value:'9,120', delta:'+440', dir:'up' },
      { label:'Avg Order Value', value:'$87.40', delta:'+$3.20', dir:'up' },
      { label:'At-Risk Customers', value:'5,880', delta:'-310', dir:'up' },
      { label:'Avg LTV', value:'$1,240', delta:'+$95', dir:'up' }
    ],
    chart1: { label:'RFM Segment Size', labels:['Champions','Loyal','Potential','At-Risk','Lost'], data:[9120,14200,11600,5880,7530], color:'rgba(242,201,76,0.75)' },
    chart2: { label:'Revenue by Segment', labels:['Champions','Loyal','Potential','At-Risk','Lost'], data:[41,29,17,8,5], colors:['#f2c94c','#5b8dee','#4ade80','#f5a623','#f87171'] },
    logs: [
      ['RUN','Starting Retail customer 360 pipeline — POS + Shopify'],
      ['RUN','Connecting to Snowflake: PROD_DB.RETAIL_RAW'],
      ['INFO','stg_orders — UNION ALL POS (411,200) + ECOM (212,640) rows'],
      ['INFO','Tagging each row with order_channel: POS | ECOM'],
      ['INFO','net_amount = gross_amount - COALESCE(discount, 0)'],
      ['OK','10 staging tests passed — all order_id + customer_id non-null'],
      ['INFO','Silver — computing RFM signals via window functions'],
      ['INFO','DATEDIFF recency, ROW_NUMBER frequency rank, cumulative LTV SUM'],
      ['INFO','is_first_order flag via ROW_NUMBER = 1 per customer partition'],
      ['WARN','2,640 rows rejected: null customer_id or negative net_amount'],
      ['OK','7 silver tests → all passed — LTV monotonically increasing'],
      ['INFO','Building Gold — fct_customer_segments with NTILE(5) scoring'],
      ['INFO','Composing R/F/M → Champion / Loyal / Potential / At-Risk / Lost'],
      ['OK','Gold layer complete — <span class="hl">48,330 customer segments</span>'],
      ['OK','Power BI dataset refresh triggered via REST API ✓']
    ]
  },
  manufacturing: {
    label: '🏭 Equipment OEE & Downtime',
    bronze: { rows:'98,240', casts:'14', keys:'98,240', tests:'9 passed', time:'2.7s' },
    silver: { rows:'97,100', joins:'3', windows:'6', rejected:'1,140', tests:'6 passed' },
    gold:   { rows:'12 months', aggs:'5', grain:'Daily / Line', bi:'Triggered', status:'✓ Complete' },
    kpis: [
      { label:'Avg OEE Score', value:'74.3%', delta:'+2.1%', dir:'up' },
      { label:'Top Downtime Machine', value:'Line 4-B', delta:'', dir:'up' },
      { label:'Avg Downtime / Shift', value:'34 min', delta:'-6 min', dir:'up' },
      { label:'Quality Rate', value:'97.8%', delta:'+0.4%', dir:'up' }
    ],
    chart1: { label:'OEE % by Production Line', labels:['Line 1','Line 2','Line 3','Line 4','Line 5','Line 6'], data:[81,76,83,67,78,71], color:'rgba(212,136,74,0.8)' },
    chart2: { label:'Downtime Root Causes', labels:['Planned Maint','Equipment Fault','Changeover','Material Wait','Other'], data:[34,28,20,12,6], colors:['#4ade80','#f87171','#f2c94c','#5b8dee','#a0aec0'] },
    logs: [
      ['RUN','Starting Manufacturing OEE pipeline — production_events source'],
      ['RUN','Connecting to Snowflake: PROD_DB.MFG_RAW'],
      ['INFO','stg_production_events — extracting <span class="hl">98,240 shift events</span>'],
      ['INFO','Assigning shift tags via CASE on HOUR(event_ts): Day / Evening / Night'],
      ['INFO','Casting downtime_minutes::NUMERIC, tagging event_type categories'],
      ['OK','9 staging tests passed — all machine_id and shift_date non-null'],
      ['INFO','Silver — aggregating per machine × shift grain'],
      ['INFO','planned_minutes=480, availability_pct, performance_pct, quality_pct'],
      ['INFO','OEE = availability × performance × quality per shift segment'],
      ['WARN','1,140 rows rejected: downtime_minutes > 480 or null machine_id'],
      ['OK','6 silver tests → OEE score bounded 0–100 ✓'],
      ['INFO','Building Gold — fct_line_oee_daily with 7-day rolling window'],
      ['INFO','FIRST_VALUE() identifying highest downtime machine per line per day'],
      ['OK','Gold layer complete — <span class="hl">12 months × 6 lines × 5 OEE metrics</span>'],
      ['OK','Power BI dataset refresh triggered via REST API ✓']
    ]
  },
  hr: {
    label: '👥 Workforce Attrition',
    bronze: { rows:'14,820', casts:'17', keys:'14,820', tests:'11 passed', time:'1.4s' },
    silver: { rows:'14,820', joins:'4', windows:'5', rejected:'0', tests:'8 passed' },
    gold:   { rows:'24 months', aggs:'6', grain:'Monthly', bi:'Triggered', status:'✓ Complete' },
    kpis: [
      { label:'Monthly Attrition', value:'2.1%', delta:'-0.3%', dir:'up' },
      { label:'Voluntary Sep Rate', value:'1.4%', delta:'-0.1%', dir:'up' },
      { label:'Avg Tenure (mos)', value:'28.4', delta:'+1.2', dir:'up' },
      { label:'Active Headcount', value:'13,940', delta:'+120', dir:'up' }
    ],
    chart1: { label:'Monthly Attrition Rate %', labels:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'], data:[2.8,2.6,2.4,2.5,2.3,2.2,2.4,2.3,2.1,2.0,2.2,2.1], color:'rgba(160,174,192,0.75)' },
    chart2: { label:'Tenure Band Distribution', labels:['< 1 yr','1–3 yr','3–5 yr','5–10 yr','10+ yr'], data:[18,31,24,18,9], colors:['#f87171','#f2c94c','#5b8dee','#4ade80','#a0aec0'] },
    logs: [
      ['RUN','Starting HR workforce pipeline — employees + separations'],
      ['RUN','Connecting to Snowflake: PROD_DB.ADP_RAW'],
      ['INFO','stg_employees — extracting <span class="hl">14,820 employee records</span>'],
      ['INFO','SHA2-hashing PII fields: ssn, email, full_name → 256-bit digests'],
      ['INFO','Computing salary_band buckets and hire/term date casts'],
      ['OK','11 staging tests passed — employee_id unique, hire_date non-null'],
      ['INFO','Silver — classifying is_active, computing tenure_months'],
      ['INFO','DATEDIFF tenure from hire_date to COALESCE(term_date, CURRENT_DATE)'],
      ['INFO','Assigning tenure bands: <1yr | 1-3yr | 3-5yr | 5-10yr | 10+yr'],
      ['OK','0 rows rejected — all employee records passed validation'],
      ['OK','8 silver tests → tenure monotonically positive, active flag valid ✓'],
      ['INFO','Building Gold — fct_monthly_attrition with LAG MoM comparison'],
      ['INFO','Computing attrition_rate_pct and voluntary_sep_rate_pct by dept'],
      ['OK','Gold layer complete — <span class="hl">24 months × 6 workforce metrics</span>'],
      ['OK','Power BI dataset refresh triggered via REST API ✓']
    ]
  }
};

/* ═══════════════════════════════════════
   PIPELINE STATE & HELPERS
═══════════════════════════════════════ */

/* ─── 5. STATE & HELPERS ───────────────────────────────── */
let currentSimInd = 'healthcare';
let isRunning = false;
let chart1Inst = null, chart2Inst = null;
let pipeStart = null;


/* ─── 6. SIMULATOR INDUSTRY SELECTOR ───────────────────── */
function simSelectInd(id, el) {
  currentSimInd = id;
  document.querySelectorAll('.sim-pill').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

function setVal(id, v) { const e = document.getElementById(id); if(e) e.textContent = v; }
function addClass(id, cls) { const e = document.getElementById(id); if(e) e.classList.add(cls); }
function setClass(id, cls) { const e = document.getElementById(id); if(e) e.className = cls; }

function appendLog(tag, msg) {
  const body = document.getElementById('console-body');
  const elapsed = pipeStart ? ((Date.now() - pipeStart)/1000).toFixed(1) : '0.0';
  const tagClass = {OK:'t-ok', WARN:'t-warn', RUN:'t-run', INFO:'t-info'}[tag] || 't-info';
  const line = document.createElement('div');
  line.className = 'log-line';
  line.innerHTML = `<span class="log-ts">${elapsed}s</span><span class="log-tag ${tagClass}">${tag}</span><span class="log-msg">${msg}</span>`;
  body.appendChild(line);
  body.scrollTop = body.scrollHeight;
}

function animateFlow(flowId, caretId) {
  const fl = document.getElementById(flowId);
  const ca = document.getElementById(caretId);
  if (fl) fl.classList.add('flowing');
  setTimeout(() => {
    if (fl) { fl.classList.remove('flowing'); fl.classList.add('done'); }
    if (ca) ca.classList.add('lit');
  }, 750);
}

/* ═══════════════════════════════════════
   RUN PIPELINE
═══════════════════════════════════════ */

/* ─── 7. RUN PIPELINE ──────────────────────────────────── */
async function runPipeline() {
  if (isRunning) return;
  isRunning = true;
  pipeStart = Date.now();

  const btn = document.getElementById('run-btn');
  btn.disabled = true;
  btn.innerHTML = '<span class="run-icon">⏳</span> Running…';

  const p = PIPELINES[currentSimInd];

  // Clear console
  document.getElementById('console-body').innerHTML = '';
  // Reset stage UI
  clearStages();

  setVal('st-status', 'running');
  document.getElementById('st-status-pill').classList.add('active');

  const delay = 500;

  // ── BRONZE ──
  setClass('ind-bronze', 'stage-indicator ind-running');
  for (let i = 0; i < 6; i++) {
    await sleep(i === 0 ? 50 : delay);
    appendLog(p.logs[i][0], p.logs[i][1]);
  }
  setVal('v-brows', p.bronze.rows);
  setVal('v-bcasts', p.bronze.casts);
  setVal('v-bkeys', p.bronze.keys);
  setVal('v-btests', p.bronze.tests);
  setVal('v-btime', p.bronze.time);
  setClass('ind-bronze', 'stage-indicator ind-bronze');
  addClass('st-bronze', 'st-done-bronze');
  animateFlow('flow1', 'caret1');

  // ── SILVER ──
  await sleep(400);
  setClass('ind-silver', 'stage-indicator ind-running');
  setClass('lbl-silver', 'stage-label lbl-silver');
  for (let i = 6; i < 11; i++) {
    await sleep(delay);
    appendLog(p.logs[i][0], p.logs[i][1]);
  }
  setVal('v-srows', p.silver.rows);
  setVal('v-sjoins', p.silver.joins);
  setVal('v-swindows', p.silver.windows);
  setVal('v-srej', p.silver.rejected);
  setVal('v-stests', p.silver.tests);
  setClass('ind-silver', 'stage-indicator ind-silver');
  addClass('st-silver', 'st-done-silver');
  animateFlow('flow2', 'caret2');

  // ── GOLD ──
  await sleep(400);
  setClass('ind-gold', 'stage-indicator ind-running');
  setClass('lbl-gold', 'stage-label lbl-gold');
  for (let i = 11; i < p.logs.length; i++) {
    await sleep(delay);
    appendLog(p.logs[i][0], p.logs[i][1]);
  }
  setVal('v-grows', p.gold.rows);
  setVal('v-gaggs', p.gold.aggs);
  setVal('v-ggrain', p.gold.grain);
  setVal('v-gbi', p.gold.bi);
  setVal('v-gstatus', p.gold.status);
  setClass('ind-gold', 'stage-indicator ind-gold');
  addClass('st-gold', 'st-done-gold');

  // Stats
  const elapsed = ((Date.now() - pipeStart)/1000).toFixed(1);
  setVal('st-rows', p.bronze.rows);
  setVal('st-tests', 'All passed');
  setVal('st-dur', elapsed + 's');
  setVal('st-status', '✓ Success');

  // Dashboard
  await sleep(500);
  buildDashboard(p);

  btn.disabled = false;
  btn.innerHTML = '<span class="run-icon">▶</span> Run Pipeline';
  isRunning = false;
}


/* ─── 8. CLEAR / RESET STAGES ──────────────────────────── */
function clearStages() {
  // Reset indicators
  setClass('ind-bronze', 'stage-indicator');
  setClass('ind-silver', 'stage-indicator');
  setClass('ind-gold',   'stage-indicator');
  // Reset labels
  setClass('lbl-silver', 'stage-label lbl-idle');
  setClass('lbl-gold',   'stage-label lbl-idle');
  // Reset stage borders
  ['st-bronze','st-silver','st-gold'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.className = 'pipe-stage';
  });
  // Reset rows
  ['v-brows','v-bcasts','v-bkeys','v-btests','v-btime',
   'v-srows','v-sjoins','v-swindows','v-srej','v-stests',
   'v-grows','v-gaggs','v-ggrain','v-gbi','v-gstatus'].forEach(id => setVal(id, '—'));
  // Reset flow
  ['flow1','flow2'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.className = 'flow-line';
  });
  ['caret1','caret2'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.className = 'flow-caret';
  });
}


/* ─── 9. HARD RESET (full UI + dashboard) ──────────────── */
function hardReset() {
  if (isRunning) return;
  document.getElementById('console-body').innerHTML =
    '<div class="log-line"><span class="log-ts">0.0s</span><span class="log-tag t-info">INFO</span><span class="log-msg">Ready — select an industry above and click <span class="hl">Run Pipeline</span></span></div>';
  clearStages();
  setVal('st-rows','—'); setVal('st-tests','—'); setVal('st-dur','—'); setVal('st-status','idle');
  document.getElementById('st-status-pill').classList.remove('active');
  document.getElementById('dashboard').style.display = 'none';
  document.getElementById('dash-placeholder').style.display = '';
  if (chart1Inst) { chart1Inst.destroy(); chart1Inst = null; }
  if (chart2Inst) { chart2Inst.destroy(); chart2Inst = null; }
}

/* ═══════════════════════════════════════
   DASHBOARD
═══════════════════════════════════════ */

/* ─── 10. CHART.JS BASE CONFIG ─────────────────────────── */
const chartBase = {
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#141720',
      titleColor: '#dde3f0',
      bodyColor: '#7e8899',
      padding: 10, cornerRadius: 6,
      borderColor: 'rgba(255,255,255,0.08)', borderWidth: 1,
      titleFont: { family: "'DM Mono', monospace", size: 11 },
      bodyFont:  { family: "'DM Mono', monospace", size: 11 }
    }
  },
  scales: {
    x: { grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false },
         ticks: { color: '#404859', font: { family: "'DM Mono',monospace", size: 10 } } },
    y: { grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false },
         ticks: { color: '#404859', font: { family: "'DM Mono',monospace", size: 10 } } }
  }
};


/* ─── 11. BUILD DASHBOARD ──────────────────────────────── */
function buildDashboard(p) {
  document.getElementById('dash-placeholder').style.display = 'none';
  const dash = document.getElementById('dashboard');
  dash.style.display = 'block';

  document.getElementById('dash-title').textContent = p.label;
  document.getElementById('dash-ts').textContent = new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});

  // KPIs
  const grid = document.getElementById('kpi-grid');
  grid.innerHTML = p.kpis.map(k => `
    <div class="kpi-card">
      <div class="kpi-label">${k.label}</div>
      <div class="kpi-value">${k.value}</div>
      ${k.delta ? `<div class="kpi-delta ${k.dir}">${k.dir === 'up' ? '↑' : '↓'} ${k.delta} vs prev</div>` : ''}
    </div>`).join('');

  // Chart 1 — Bar
  document.getElementById('chart1-title').textContent = p.chart1.label;
  if (chart1Inst) chart1Inst.destroy();
  chart1Inst = new Chart(document.getElementById('chart1').getContext('2d'), {
    type: 'bar',
    data: {
      labels: p.chart1.labels,
      datasets: [{
        data: p.chart1.data,
        backgroundColor: p.chart1.color,
        borderColor: p.chart1.color.replace(/[\d.]+\)$/, '1)'),
        borderWidth: 1.5, borderRadius: 4
      }]
    },
    options: { ...chartBase, responsive: true, maintainAspectRatio: false, animation: { duration: 700, easing: 'easeOutQuart' } }
  });

  // Chart 2 — Doughnut
  document.getElementById('chart2-title').textContent = p.chart2.label;
  if (chart2Inst) chart2Inst.destroy();
  chart2Inst = new Chart(document.getElementById('chart2').getContext('2d'), {
    type: 'doughnut',
    data: {
      labels: p.chart2.labels,
      datasets: [{ data: p.chart2.data, backgroundColor: p.chart2.colors, borderColor: '#0e1018', borderWidth: 2 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      cutout: '65%',
      animation: { duration: 700, easing: 'easeOutQuart' },
      plugins: {
        legend: {
          display: true, position: 'bottom',
          labels: { color: '#7e8899', font: { family: "'DM Mono',monospace", size: 10 }, padding: 12, boxWidth: 10, boxHeight: 10 }
        },
        tooltip: chartBase.plugins.tooltip
      },
      scales: {}
    }
  });

  setTimeout(() => dash.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
}

/* ─── 12. NAV TAB ACTIVE STATE ─────────────────────────── */
const pageSections = [
  'sql-section',
  'sim-section',
  'dash-section',
  'skills-section'
];
const navTabMap = {
  'sql-section': document.querySelector('.nav__tab[href="#sql-section"]'),
  'sim-section': document.querySelector('.nav__tab[href="#sim-section"]'),
  'dash-section': document.querySelector('.nav__tab[href="#dash-section"]'),
  'skills-section': document.querySelector('.nav__tab[href="#skills-section"]')
};

function setActiveNavTab(sectionId) {
  document.querySelectorAll('.nav__tab').forEach(tab => tab.classList.remove('is-active'));
  const tab = navTabMap[sectionId];
  if (tab) tab.classList.add('is-active');
}

const navObserver = new IntersectionObserver(entries => {
  const visible = entries
    .filter(entry => entry.isIntersecting)
    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (visible) setActiveNavTab(visible.target.id);
}, {
  threshold: [0.2, 0.45, 0.7],
  rootMargin: '-20% 0px -60% 0px'
});

pageSections.forEach(id => {
  const sectionEl = document.getElementById(id);
  if (sectionEl) navObserver.observe(sectionEl);
});