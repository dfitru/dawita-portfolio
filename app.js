const DOMAINS = [
  {
    id: 1,
    title: "Data Generation and Augmentation",
    outcome: "Generate synthetic rows and augment sparse labels.",
    tools: ["Python", "Faker", "Pandas", "Snowflake"],
    python: `from faker import Faker\nimport pandas as pd\n\nfake = Faker()\nrows = [{\n  "customer_id": f"C{n:04}",\n  "ticket_text": fake.sentence(),\n  "label": "support"\n} for n in range(1, 6)]\ndf = pd.DataFrame(rows)`,
    sql: `SELECT customer_id, ticket_text, label\nFROM synthetic_support_seed\nWHERE label IS NOT NULL;`,
    metrics: { readiness: 86, quality: 82, speed: 91, cost: 80, automation: 84 }
  },
  {
    id: 2,
    title: "Writing Generative AI Code with Gen AI",
    outcome: "Prompt-driven code generation with guardrails and tests.",
    tools: ["OpenAI", "CI/CD", "Unit Tests"],
    python: `prompt = "Build parser with schema checks"\ncandidate = llm.generate_code(prompt)\nassert "def parse_invoice" in candidate`,
    sql: `SELECT run_id, generated_module, unit_test_pass_rate\nFROM ai_codegen_audit\nORDER BY created_at DESC;`,
    metrics: { readiness: 79, quality: 85, speed: 88, cost: 73, automation: 90 }
  },
  {
    id: 3,
    title: "Data Parsing and Extraction",
    outcome: "Extract entities and key-value signals from unstructured data.",
    tools: ["Regex", "OCR", "JSON"],
    python: `import re\ninvoice_id = re.search(r"INV-\\d+", text).group(0)\namount = float(re.search(r"Total: (\\d+\\.\\d+)", text).group(1))`,
    sql: `SELECT doc_id, extracted:invoice_id::STRING, extracted:total::NUMBER(12,2)\nFROM parsed_documents;`,
    metrics: { readiness: 84, quality: 87, speed: 83, cost: 78, automation: 81 }
  },
  {
    id: 4,
    title: "Gen AI Data Engineering Tools",
    outcome: "Operationalize toolchains for lineage, testing, and orchestration.",
    tools: ["dbt", "Airflow", "LangChain", "Databricks"],
    python: `pipeline = {"orchestrator": "Airflow", "transform": "dbt", "monitoring": "Evidently"}\nprint(pipeline)`,
    sql: `SELECT tool_name, integration_status, last_health_check\nFROM genai_tool_registry;`,
    metrics: { readiness: 88, quality: 80, speed: 76, cost: 82, automation: 92 }
  },
  {
    id: 5,
    title: "Data Querying and Analysis",
    outcome: "Combine semantic retrieval with warehouse SQL analytics.",
    tools: ["Vector Search", "Snowflake SQL", "Power BI"],
    python: `question = "Which region has rising churn?"\ncontext = retriever.search(question)\nanswer = analyst_chain.run(question, context)`,
    sql: `SELECT region, ROUND(AVG(churn_rate), 2) AS avg_churn\nFROM fct_customer_health\nGROUP BY region\nORDER BY avg_churn DESC;`,
    metrics: { readiness: 83, quality: 86, speed: 79, cost: 81, automation: 77 }
  },
  {
    id: 6,
    title: "Data Enrichment, Normalization, and Standardization",
    outcome: "Standardize dimensions and enrich records with trusted references.",
    tools: ["Reference Data", "SCD2", "Data Quality"],
    python: `def normalize_city(value):\n  return value.strip().title().replace("St.", "Saint")\n\ndf["city_norm"] = df["city"].apply(normalize_city)`,
    sql: `SELECT c.customer_id, d.standard_industry, d.risk_band\nFROM stg_customers c\nLEFT JOIN dim_industry_dictionary d\nON UPPER(c.industry_raw)=d.industry_alias;`,
    metrics: { readiness: 90, quality: 92, speed: 75, cost: 85, automation: 86 }
  },
  {
    id: 7,
    title: "Anomaly Detection and Compression",
    outcome: "Detect outliers and compress telemetry with fidelity controls.",
    tools: ["Statistics", "Spark", "Observability"],
    python: `z = (series - series.mean()) / series.std()\nflags = series[z.abs() > 3]\ncompressed = series.round(2)`,
    sql: `SELECT metric_ts, metric_value, CASE WHEN ABS(z_score) > 3 THEN 1 ELSE 0 END AS is_anomaly\nFROM fct_metric_anomaly_scan;`,
    metrics: { readiness: 78, quality: 89, speed: 82, cost: 88, automation: 80 }
  }
];

const INDUSTRIES = {
  healthcare: {
    label: "Healthcare",
    focusLabel: "Readmission Control",
    focusValue: "8.7%",
    focusNote: "Patient flow and clinical operations"
  },
  finance: {
    label: "Finance",
    focusLabel: "Fraud Exposure",
    focusValue: "$1.2M",
    focusNote: "Risk monitoring and anomaly detection"
  },
  retail: {
    label: "Retail",
    focusLabel: "Customer LTV",
    focusValue: "$1,240",
    focusNote: "Segmentation and revenue analytics"
  },
  manufacturing: {
    label: "Manufacturing",
    focusLabel: "OEE Score",
    focusValue: "74.3%",
    focusNote: "Line performance and downtime insight"
  },
  hr: {
    label: "HR & Payroll",
    focusLabel: "Attrition Rate",
    focusValue: "2.1%",
    focusNote: "Workforce health and retention metrics"
  }
};

const DIMENSIONS = ["readiness", "quality", "speed", "cost", "automation"];
let currentDomain = 1;
let currentIndustry = "healthcare";
const executed = new Set();

function el(id) { return document.getElementById(id); }
function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

function initReveal() {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: "0px 0px -40px 0px" });
  document.querySelectorAll(".reveal").forEach(node => revealObserver.observe(node));
}

function switchIndustry(id, button) {
  document.querySelectorAll(".industry-panel").forEach(panel => panel.classList.remove("active"));
  document.querySelectorAll(".ind-pill").forEach(pill => pill.classList.remove("active"));
  const panel = document.getElementById(`industry-${id}`);
  if (panel) panel.classList.add("active");
  if (button) button.classList.add("active");
  currentIndustry = id;
  renderGoldDashboard();
  renderCapabilityMap();
}

function renderDomainCards() {
  const container = el("domain-cards");
  container.innerHTML = DOMAINS.map(domain => `
    <article class="domain-card reveal" id="domain-${domain.id}">
      <div class="domain-card__head">
        <span class="domain-chip">Domain ${domain.id}</span>
        <h3>${domain.title}</h3>
      </div>
      <p class="domain-desc">${domain.outcome}</p>
      <div class="domain-grid">
        <div class="code-card">
          <div class="code-card__title">Python</div>
          <pre>${domain.python}</pre>
        </div>
        <div class="code-card">
          <div class="code-card__title">SQL</div>
          <pre>${domain.sql}</pre>
        </div>
      </div>
      <div class="tool-row">
        ${domain.tools.map(tool => `<span class="tool-pill">${tool}</span>`).join("")}
      </div>
    </article>
  `).join("");
}

function renderRunnerPills() {
  const container = el("runner-domain-pills");
  container.innerHTML = DOMAINS.map(domain => `
    <button class="runner-pill ${domain.id === currentDomain ? "active" : ""}" data-domain="${domain.id}">D${domain.id}</button>
  `).join("");

  container.querySelectorAll(".runner-pill").forEach(button => {
    button.addEventListener("click", () => {
      currentDomain = Number(button.dataset.domain);
      renderRunnerPills();
      renderRunnerCode();
    });
  });
}

function renderRunnerCode() {
  const domain = DOMAINS.find(item => item.id === currentDomain);
  el("runner-python").textContent = domain.python;
  el("runner-sql").textContent = domain.sql;
}

function appendConsole(text, type = "info") {
  const line = document.createElement("div");
  line.className = `console-line ${type}`;
  line.textContent = text;
  el("runner-console").appendChild(line);
  el("runner-console").scrollTop = el("runner-console").scrollHeight;
}

function setTimeline(stepIndex) {
  document.querySelectorAll(".timeline-step").forEach((step, idx) => {
    step.classList.toggle("active", idx <= stepIndex);
  });
}

function updateMetrics(domain) {
  el("runner-metrics").innerHTML = DIMENSIONS.map(dim => `
    <div class="metric-pill">
      <span>${dim}</span>
      <strong>${domain.metrics[dim]}</strong>
    </div>
  `).join("");
}

function renderGoldDashboard() {
  const kpiGrid = el("gold-kpi-grid");
  const status = el("gold-dash-status");
  const title = el("gold-dash-title");
  const executedDomains = DOMAINS.filter(domain => executed.has(domain.id));
  const industry = INDUSTRIES[currentIndustry];

  title.textContent = `Gold Layer Dashboard / ${industry.label}`;

  if (!executedDomains.length) {
    status.textContent = `${industry.label} selected - awaiting domain execution`;
    kpiGrid.innerHTML = `
      <div class="kpi-card"><div class="kpi-label">Executed Domains</div><div class="kpi-value">0 / 7</div><div class="kpi-delta up">Run the live runner</div></div>
      <div class="kpi-card"><div class="kpi-label">Avg Readiness</div><div class="kpi-value">--</div><div class="kpi-delta up">No results yet</div></div>
      <div class="kpi-card"><div class="kpi-label">Industry Focus</div><div class="kpi-value">${industry.focusValue}</div><div class="kpi-delta up">${industry.focusLabel}</div></div>
      <div class="kpi-card"><div class="kpi-label">Delivery Layer</div><div class="kpi-value">Gold</div><div class="kpi-delta up">${industry.focusNote}</div></div>
    `;
    return;
  }

  const avg = dim => Math.round(executedDomains.reduce((sum, domain) => sum + domain.metrics[dim], 0) / executedDomains.length);
  const topDomain = executedDomains
    .map(domain => ({
      title: domain.title,
      avg: Math.round(DIMENSIONS.reduce((sum, dim) => sum + domain.metrics[dim], 0) / DIMENSIONS.length)
    }))
    .sort((a, b) => b.avg - a.avg)[0];

  status.textContent = `${industry.label} selected - ${executedDomains.length} domain${executedDomains.length > 1 ? "s" : ""} executed`;
  kpiGrid.innerHTML = `
    <div class="kpi-card"><div class="kpi-label">Executed Domains</div><div class="kpi-value">${executedDomains.length} / 7</div><div class="kpi-delta up">Coverage expanding</div></div>
    <div class="kpi-card"><div class="kpi-label">Avg Readiness</div><div class="kpi-value">${avg("readiness")}</div><div class="kpi-delta up">Across executed domains</div></div>
    <div class="kpi-card"><div class="kpi-label">${industry.focusLabel}</div><div class="kpi-value">${industry.focusValue}</div><div class="kpi-delta up">${industry.focusNote}</div></div>
    <div class="kpi-card"><div class="kpi-label">Top Capability</div><div class="kpi-value">${topDomain.title.split(" ")[0]}</div><div class="kpi-delta up">${topDomain.title}</div></div>
  `;
}

function getScoreClass(score) {
  if (score >= 88) return "score-high";
  if (score >= 80) return "score-mid";
  return "score-low";
}

function renderCapabilityMap() {
  const table = el("capability-table");
  const header = `<thead><tr><th>Domain</th>${DIMENSIONS.map(dim => `<th>${dim}</th>`).join("")}</tr></thead>`;

  const bodyRows = DOMAINS.map(domain => {
    const cells = DIMENSIONS.map(dim => {
      const value = executed.has(domain.id) ? domain.metrics[dim] : "--";
      const scoreClass = typeof value === "number" ? getScoreClass(value) : "score-empty";
      return `<td><button class="score-cell ${scoreClass}" data-domain="${domain.id}" data-dim="${dim}">${value}</button></td>`;
    }).join("");
    return `<tr><th>${domain.id}. ${domain.title}</th>${cells}</tr>`;
  }).join("");

  table.innerHTML = `${header}<tbody>${bodyRows}</tbody>`;

  table.querySelectorAll(".score-cell").forEach(cell => {
    cell.addEventListener("click", () => {
      const domainId = Number(cell.dataset.domain);
      const dim = cell.dataset.dim;
      const domain = DOMAINS.find(item => item.id === domainId);
      const industry = INDUSTRIES[currentIndustry];
      if (!executed.has(domainId)) {
        el("map-detail").textContent = "Run this domain first to unlock detailed capability insights.";
        return;
      }
      el("map-detail").textContent = `${industry.label} context - ${domain.title}: ${dim} score ${domain.metrics[dim]}. Outcome: ${domain.outcome}. Tools: ${domain.tools.join(", ")}.`;
    });
  });

  const topDomain = DOMAINS
    .filter(domain => executed.has(domain.id))
    .map(domain => ({
      title: domain.title,
      avg: Math.round(DIMENSIONS.reduce((sum, dim) => sum + domain.metrics[dim], 0) / DIMENSIONS.length)
    }))
    .sort((a, b) => b.avg - a.avg)[0];

  el("map-summary").innerHTML = `
    <div class="summary-card"><span>Executed Domains</span><strong>${executed.size}</strong></div>
    <div class="summary-card"><span>Active Industry</span><strong>${INDUSTRIES[currentIndustry].label}</strong></div>
    <div class="summary-card"><span>Top Domain</span><strong>${topDomain ? topDomain.title : "Pending"}</strong></div>
  `;

  renderGoldDashboard();
}

async function runDomain(id) {
  const domain = DOMAINS.find(item => item.id === id);
  appendConsole(`Running Domain ${domain.id}: ${domain.title}`, "run");
  updateMetrics(domain);

  const steps = ["Ingest", "Transform", "Validate", "Persist", "Evaluate"];
  for (let idx = 0; idx < steps.length; idx += 1) {
    setTimeline(idx);
    appendConsole(`${steps[idx]}: ${domain.title}`, "info");
    await sleep(220);
  }

  executed.add(domain.id);
  appendConsole(`Completed Domain ${domain.id} with outcome: ${domain.outcome}`, "ok");
  renderCapabilityMap();
}

async function runAll() {
  for (const domain of DOMAINS) {
    currentDomain = domain.id;
    renderRunnerPills();
    renderRunnerCode();
    await runDomain(domain.id);
  }
}

function resetRunner() {
  executed.clear();
  setTimeline(-1);
  el("runner-console").innerHTML = "";
  el("runner-metrics").innerHTML = "";
  appendConsole("Runner reset. Choose a domain and execute.", "info");
  renderCapabilityMap();
}

function initNavActive() {
  const sections = ["domains-overview", "industries-section", "runner-section", "dashboard-section", "skills-section"];
  const tabMap = {
    "domains-overview": document.querySelector('.nav__tab[href="#domains-overview"]'),
    "industries-section": document.querySelector('.nav__tab[href="#industries-section"]'),
    "runner-section": document.querySelector('.nav__tab[href="#runner-section"]'),
    "dashboard-section": document.querySelector('.nav__tab[href="#dashboard-section"]'),
    "skills-section": document.querySelector('.nav__tab[href="#skills-section"]')
  };

  const observer = new IntersectionObserver(entries => {
    const activeEntry = entries.filter(entry => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!activeEntry) return;
    document.querySelectorAll(".nav__tab").forEach(tab => tab.classList.remove("is-active"));
    const tab = tabMap[activeEntry.target.id];
    if (tab) tab.classList.add("is-active");
  }, { threshold: [0.2, 0.45], rootMargin: "-20% 0px -60% 0px" });

  sections.forEach(id => {
    const section = document.getElementById(id);
    if (section) observer.observe(section);
  });
}

function init() {
  renderDomainCards();
  renderRunnerPills();
  renderRunnerCode();
  renderCapabilityMap();
  renderGoldDashboard();
  initReveal();
  initNavActive();
  appendConsole("Runner ready. Use Run Domain or Run All.", "info");

  el("run-domain-btn").addEventListener("click", () => runDomain(currentDomain));
  el("run-all-btn").addEventListener("click", runAll);
  el("reset-runner-btn").addEventListener("click", resetRunner);
}

init();
