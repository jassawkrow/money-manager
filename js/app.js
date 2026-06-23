// =====================================================================
//  Paise — money tracker (vanilla JS PWA)
//  Storage: localStorage. No backend, no tracking.
// =====================================================================

const STORAGE_KEY = "paise.v1";

const DEFAULT_INCOME_CATS = [
  { id: "freelance",   name: "Freelancing",    color: "#0a84ff", icon: "laptop" },
  { id: "painting",    name: "Painting",       color: "#ff375f", icon: "brush" },
  { id: "commission",  name: "Commissions",    color: "#bf5af2", icon: "star" },
  { id: "website",     name: "Websites",       color: "#5ac8fa", icon: "globe" },
  { id: "shop",        name: "Shop Sales",     color: "#ff9f0a", icon: "bag" },
  { id: "agency",      name: "Design Agency",  color: "#30d158", icon: "diamond" },
  { id: "other_inc",   name: "Other",          color: "#8e8e93", icon: "wallet" },
];

const DEFAULT_EXPENSE_CATS = [
  { id: "food",        name: "Food",          color: "#ff9f0a", icon: "food",  limitPct: 20 },
  { id: "transport",   name: "Transport",     color: "#5ac8fa", icon: "car",   limitPct: 10 },
  { id: "shopping",    name: "Shopping",      color: "#ff375f", icon: "bag",   limitPct: 15 },
  { id: "rent",        name: "Rent",          color: "#bf5af2", icon: "home",  limitPct: 30 },
  { id: "subs",        name: "Subscriptions", color: "#0a84ff", icon: "play",  limitPct: 5 },
  { id: "health",      name: "Health",        color: "#30d158", icon: "heart", limitPct: 5 },
  { id: "fun",         name: "Entertainment", color: "#ffd60a", icon: "music", limitPct: 5 },
  { id: "other_exp",   name: "Other",         color: "#8e8e93", icon: "dots",  limitPct: 10 },
];

const ICONS = {
  laptop:'<path d="M4 5h16v10H4z M2 18h20 M9 21h6"/>',
  brush:'<path d="M14 3l7 7-9 9H5v-7l9-9z M14 3l-2 2 7 7 2-2-7-7z"/>',
  star:'<path d="M12 3l2.6 5.5 6 .8-4.4 4.2 1.1 6L12 16.9 6.7 19.5l1.1-6L3.4 9.3l6-.8L12 3z"/>',
  globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18 M12 3a14 14 0 0 1 0 18 M12 3a14 14 0 0 0 0 18"/>',
  bag:'<path d="M6 8h12l-1 12H7L6 8z M9 8a3 3 0 0 1 6 0"/>',
  diamond:'<path d="M6 3h12l3 6-9 12L3 9l3-6z M3 9h18 M9 3l-3 6 6 12 6-12-3-6"/>',
  wallet:'<path d="M3 6h15a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6z M16 13h4 M3 9h18"/>',
  food:'<path d="M4 4v8a4 4 0 0 0 8 0V4 M8 4v16 M16 4c2 0 4 2 4 6v4h-2v6"/>',
  car:'<path d="M3 13l2-5h14l2 5v6H3v-6z M6 16h.01 M18 16h.01"/>',
  home:'<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1v-9z"/>',
  play:'<polygon points="6,4 20,12 6,20"/>',
  heart:'<path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 11c0 5.5-7 10-7 10z"/>',
  music:'<path d="M9 18V5l11-2v13 M9 18a3 3 0 1 1-3-3 3 3 0 0 1 3 3z M20 16a3 3 0 1 1-3-3 3 3 0 0 1 3 3z"/>',
  dots:'<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>',
};

function svg(iconKey, color = "#fff", size = 22) {
  const path = ICONS[iconKey] || ICONS.dots;
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;
}

// ---------------------------------------------------------------------
//  State
// ---------------------------------------------------------------------
const defaultState = () => ({
  profile: { name: "", currency: "₹" },
  settings: {
    theme: "system",      // "light" | "dark" | "system"
    accent: "blue",
    monthlyTarget: 50000,
    monthlyBudget: 30000,
    spendLimitPct: 60,    // percent of income allowed as expense (alert)
    haptics: true,
  },
  categories: {
    income: DEFAULT_INCOME_CATS,
    expense: DEFAULT_EXPENSE_CATS,
  },
  transactions: [],       // { id, type, amount, catId, note, date (ISO) }
  createdAt: new Date().toISOString(),
});

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    return { ...defaultState(), ...parsed,
      profile: { ...defaultState().profile, ...(parsed.profile||{}) },
      settings: { ...defaultState().settings, ...(parsed.settings||{}) },
      categories: {
        income: parsed.categories?.income || DEFAULT_INCOME_CATS,
        expense: parsed.categories?.expense || DEFAULT_EXPENSE_CATS,
      },
      transactions: parsed.transactions || [],
    };
  } catch (e) { return defaultState(); }
}
function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }

let state = load();

// ---------------------------------------------------------------------
//  Helpers
// ---------------------------------------------------------------------
const fmtMoney = (n, { compact = false } = {}) => {
  const cur = state.profile.currency || "₹";
  if (compact && Math.abs(n) >= 100000) {
    return cur + (n/100000).toFixed(n >= 1000000 ? 1 : 2).replace(/\.?0+$/,"") + "L";
  }
  if (compact && Math.abs(n) >= 1000) {
    return cur + (n/1000).toFixed(1).replace(/\.0$/,"") + "K";
  }
  return cur + Math.round(n).toLocaleString("en-IN");
};
const allCats = () => [...state.categories.income, ...state.categories.expense];
const getCat = (id) => allCats().find(c => c.id === id) || { id, name: "Unknown", color: "#8e8e93", icon: "dots" };

const startOfMonth = (d = new Date()) => new Date(d.getFullYear(), d.getMonth(), 1);
const endOfMonth = (d = new Date()) => new Date(d.getFullYear(), d.getMonth() + 1, 1);
const sameMonth = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();

function monthTxns(date = new Date()) {
  return state.transactions.filter(t => sameMonth(new Date(t.date), date));
}
function sumBy(arr, pred = () => true) {
  return arr.filter(pred).reduce((s, t) => s + Number(t.amount || 0), 0);
}
function uid() { return Math.random().toString(36).slice(2, 10); }

function applyTheme() {
  const t = state.settings.theme;
  const wantDark = t === "dark" || (t === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", wantDark);
  document.documentElement.setAttribute("data-accent", state.settings.accent || "blue");
}
matchMedia("(prefers-color-scheme: dark)").addEventListener("change", applyTheme);

function haptic(ms = 8) {
  if (state.settings.haptics && navigator.vibrate) navigator.vibrate(ms);
}

function toast(msg) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.remove("show"), 1800);
}

// ---------------------------------------------------------------------
//  Router-ish: simple tab switching
// ---------------------------------------------------------------------
const VIEWS = {};
let currentTab = "home";

function setTab(tab) {
  if (!VIEWS[tab]) tab = "home";
  currentTab = tab;
  document.querySelectorAll(".tab").forEach(b => b.classList.toggle("active", b.dataset.tab === tab));
  const view = document.getElementById("view");
  view.style.animation = "none";
  // force reflow then re-trigger animation
  void view.offsetWidth;
  view.style.animation = "";
  view.innerHTML = VIEWS[tab]();
  attachAfterRender(tab);
  window.scrollTo({ top: 0, behavior: "instant" });
}

// ---------------------------------------------------------------------
//  Views
// ---------------------------------------------------------------------
VIEWS.home = () => {
  const now = new Date();
  const txns = monthTxns(now);
  const income = sumBy(txns, t => t.type === "income");
  const expense = sumBy(txns, t => t.type === "expense");
  const net = income - expense;
  const target = state.settings.monthlyTarget || 0;
  const savings = Math.max(0, net); // savings = income - expenses, floor at 0
  const pct = target > 0 ? Math.min(100, Math.round((savings / target) * 100)) : 0;
  const budget = state.settings.monthlyBudget || 0;
  const spendPct = budget > 0 ? Math.min(100, Math.round((expense / budget) * 100)) : 0;

  const incByCat = {};
  txns.filter(t=>t.type==="income").forEach(t => { incByCat[t.catId] = (incByCat[t.catId]||0) + Number(t.amount); });
  const sortedInc = Object.entries(incByCat).sort((a,b)=>b[1]-a[1]).slice(0,5);

  const expByCat = {};
  txns.filter(t=>t.type==="expense").forEach(t => { expByCat[t.catId] = (expByCat[t.catId]||0) + Number(t.amount); });
  const sortedExp = Object.entries(expByCat).sort((a,b)=>b[1]-a[1]).slice(0,5);

  const recent = [...txns].sort((a,b)=> new Date(b.date) - new Date(a.date)).slice(0,4);

  const monthName = now.toLocaleString("en-US", { month: "long", year: "numeric" });
  const incomeLimit = state.settings.spendLimitPct || 0;
  const spendingOf = income > 0 ? Math.round((expense/income)*100) : 0;

  return `
    <div class="hero pressable">
      <div class="hero-label">${monthName} · Net Balance</div>
      <div class="hero-amount">${fmtMoney(net)}</div>
      <div class="hero-sub">
        <div class="pill">
          <div class="k">Income</div>
          <div class="v">${fmtMoney(income, {compact:true})}</div>
        </div>
        <div class="pill">
          <div class="k">Expenses</div>
          <div class="v">${fmtMoney(expense, {compact:true})}</div>
        </div>
      </div>
    </div>

    <div class="section-title row"><span>Monthly Goal</span><button class="link" id="edit-target">Edit</button></div>
    <div class="card goal">
      ${ringSvg(pct, pct >= 100 ? "var(--accent-2)" : "var(--accent)")}
      <div class="goal-info">
        <div class="goal-title">Monthly savings goal</div>
        <div class="goal-amount">${fmtMoney(savings)} <span class="muted" style="font-size:14px;font-weight:500;">of ${fmtMoney(target)}</span></div>
        <div class="goal-remaining" style="color:${net < 0 ? 'var(--danger)' : 'var(--text-3)'};">
          ${net < 0
            ? `Overspent by ${fmtMoney(Math.abs(net))} this month`
            : pct >= 100
              ? `Goal reached! ${fmtMoney(savings - target)} extra saved`
              : `${fmtMoney(Math.max(0, target - savings))} more to save`}
        </div>
      </div>
    </div>

    <div class="section-title row"><span>Spending Limit</span><button class="link" id="edit-budget">Edit</button></div>
    <div class="card">
      <div class="row-split">
        <div>
          <div class="muted" style="font-size:13px;">Budget used</div>
          <div style="font-weight:700;font-size:20px;letter-spacing:-0.02em;margin-top:2px;">${fmtMoney(expense)} <span class="muted" style="font-size:14px;font-weight:500;">/ ${fmtMoney(budget)}</span></div>
        </div>
        <div style="font-weight:700;font-size:22px;color:${spendPct>=100?'var(--danger)':spendPct>=80?'var(--warning)':'var(--accent-2)'};">
          ${spendPct}%
        </div>
      </div>
      <div class="bar-track mt-12"><div class="bar-fill" style="width:${spendPct}%;background:${spendPct>=100?'var(--danger)':spendPct>=80?'var(--warning)':'linear-gradient(90deg, var(--accent), var(--accent-2))'};"></div></div>
      ${income > 0 ? `
        <div class="mt-12 muted" style="font-size:12.5px;">
          You've spent <b style="color:${spendingOf>incomeLimit?'var(--danger)':'var(--text)'};">${spendingOf}%</b> of your income (limit: ${incomeLimit}%)
        </div>` : ""}
    </div>

    <div class="section-title">Quick Stats</div>
    <div class="quick-grid">
      <div class="qcard pressable">
        <div class="icon" style="background:rgba(48,209,88,0.15);">${svg("wallet","var(--accent-2)",18)}</div>
        <div class="label">Top Earner</div>
        <div class="value">${sortedInc[0] ? getCat(sortedInc[0][0]).name : "—"}</div>
        <div class="delta pos">${sortedInc[0] ? fmtMoney(sortedInc[0][1],{compact:true}) : "No income yet"}</div>
      </div>
      <div class="qcard pressable">
        <div class="icon" style="background:rgba(255,59,48,0.12);">${svg("bag","var(--danger)",18)}</div>
        <div class="label">Top Spend</div>
        <div class="value">${sortedExp[0] ? getCat(sortedExp[0][0]).name : "—"}</div>
        <div class="delta neg">${sortedExp[0] ? fmtMoney(sortedExp[0][1],{compact:true}) : "No expense yet"}</div>
      </div>
      <div class="qcard pressable">
        <div class="icon" style="background:rgba(10,132,255,0.15);">${svg("star","var(--accent)",18)}</div>
        <div class="label">Transactions</div>
        <div class="value">${txns.length}</div>
        <div class="delta">this month</div>
      </div>
      <div class="qcard pressable">
        <div class="icon" style="background:rgba(191,90,242,0.15);">${svg("diamond","var(--purple)",18)}</div>
        <div class="label">Savings Rate</div>
        <div class="value">${income > 0 ? Math.max(0, Math.round(((income-expense)/income)*100)) : 0}%</div>
        <div class="delta">of income</div>
      </div>
    </div>

    <div class="section-title row"><span>Income Sources</span><button class="link" id="show-all-inc">View all</button></div>
    <div class="card">
      ${sortedInc.length ? `<ul class="cat-list">${sortedInc.map(([id,v]) => {
        const c = getCat(id);
        const p = income ? Math.round((v/income)*100) : 0;
        return `<li class="cat-row">
          <div class="cat-icon" style="background:${c.color}22;">${svg(c.icon, c.color, 20)}</div>
          <div class="cat-mid">
            <div class="cat-name">${c.name}</div>
            <div class="cat-meta">${p}% of income</div>
            <div class="bar-track"><div class="bar-fill" style="width:${p}%;background:${c.color};"></div></div>
          </div>
          <div class="cat-amt income">${fmtMoney(v,{compact:true})}</div>
        </li>`;
      }).join("")}</ul>` : emptyState("Add your first income", "Tap the + button to log money from a freelance gig, painting, commission and more.")}
    </div>

    <div class="section-title row"><span>Recent Activity</span><button class="link" data-tab="transactions" id="see-history">See all</button></div>
    <div>
      ${recent.length ? recent.map(t => txnRowHtml(t)).join("") :
        `<div class="card">${emptyStateInline("No transactions yet")}</div>`}
    </div>
  `;
};

VIEWS.transactions = () => {
  const txns = [...state.transactions].sort((a,b)=> new Date(b.date) - new Date(a.date));
  const filter = view.dataset?.txnFilter || "all";
  const filtered = txns.filter(t => filter === "all" ? true : t.type === filter);

  // Group by date label
  const groups = {};
  filtered.forEach(t => {
    const d = new Date(t.date);
    const key = labelForDate(d);
    (groups[key] = groups[key] || []).push(t);
  });

  return `
    <div class="filters">
      <button class="filter-chip ${filter==='all'?'active':''}" data-filter="all">All</button>
      <button class="filter-chip ${filter==='income'?'active':''}" data-filter="income">Income</button>
      <button class="filter-chip ${filter==='expense'?'active':''}" data-filter="expense">Expenses</button>
    </div>
    ${filtered.length ? Object.entries(groups).map(([label, items]) => `
      <div class="date-label">${label}</div>
      ${items.map(t => txnRowHtml(t)).join("")}
    `).join("") :
      `<div class="card">${emptyState("Nothing here yet", "Your tracked income and expenses will live here.")}</div>`}
  `;
};

VIEWS.stats = () => {
  const now = new Date();
  // Get last 6 months including current
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const t = state.transactions.filter(tx => sameMonth(new Date(tx.date), d));
    months.push({
      d, label: d.toLocaleString("en-US",{month:"short"}),
      income: sumBy(t, tx => tx.type === "income"),
      expense: sumBy(t, tx => tx.type === "expense"),
    });
  }
  const totalIncome = months.reduce((s,m)=>s+m.income, 0);
  const totalExpense = months.reduce((s,m)=>s+m.expense, 0);
  const avgIncome = Math.round(totalIncome / months.length);
  const thisMonth = months[months.length-1];
  const prevMonth = months[months.length-2];
  const trend = prevMonth.income > 0
    ? Math.round(((thisMonth.income - prevMonth.income)/prevMonth.income)*100)
    : (thisMonth.income > 0 ? 100 : 0);

  // Pie data for income by cat (this month)
  const tx = monthTxns(now);
  const inc = {}; tx.filter(t=>t.type==="income").forEach(t => inc[t.catId] = (inc[t.catId]||0) + Number(t.amount));
  const exp = {}; tx.filter(t=>t.type==="expense").forEach(t => exp[t.catId] = (exp[t.catId]||0) + Number(t.amount));

  return `
    <div class="card chart-card">
      <div class="row-split" style="padding:0 6px 12px;">
        <div>
          <div class="muted" style="font-size:13px;">Last 6 months income</div>
          <div class="stat-header">
            <div class="big">${fmtMoney(totalIncome,{compact:true})}</div>
            <div class="lbl">avg ${fmtMoney(avgIncome,{compact:true})}/mo</div>
          </div>
        </div>
        <div style="text-align:right;">
          <div class="muted" style="font-size:13px;">vs last month</div>
          <div style="font-weight:700;font-size:18px;color:${trend>=0?'var(--accent-2)':'var(--danger)'};margin-top:2px;">${trend>=0?'+':''}${trend}%</div>
        </div>
      </div>
      ${barChart(months)}
      <div class="chart-legend">
        <div class="leg"><span class="swatch" style="background:var(--accent);"></span> Income</div>
        <div class="leg"><span class="swatch" style="background:var(--danger);"></span> Expense</div>
      </div>
    </div>

    <div class="section-title">Income breakdown</div>
    <div class="card chart-card">
      ${donutChart(inc, state.categories.income, "No income this month")}
    </div>

    <div class="section-title">Expense breakdown</div>
    <div class="card chart-card">
      ${donutChart(exp, state.categories.expense, "No expenses this month")}
    </div>

    <div class="section-title">Insights</div>
    ${insights(months, inc, exp).map(i => insightHtml(i)).join("")}
  `;
};

VIEWS.settings = () => {
  const s = state.settings;
  return `
    <div class="section-title">Profile</div>
    <div class="list">
      <button class="list-row pressable" data-action="edit-profile">
        <div class="icon" style="background:var(--accent);">${svg("star","#fff",18)}</div>
        <div class="label">Name</div>
        <div class="value">${state.profile.name || "Not set"}</div>
        <span class="chev">›</span>
      </button>
      <button class="list-row pressable" data-action="edit-currency">
        <div class="icon" style="background:var(--accent-2);">${svg("wallet","#fff",18)}</div>
        <div class="label">Currency</div>
        <div class="value">${state.profile.currency} (Rupees)</div>
        <span class="chev">›</span>
      </button>
    </div>

    <div class="section-title">Goals & Limits</div>
    <div class="list">
      <button class="list-row pressable" data-action="edit-target">
        <div class="icon" style="background:#ff9f0a;">${svg("star","#fff",18)}</div>
        <div class="label">Monthly savings goal</div>
        <div class="value">${fmtMoney(s.monthlyTarget)}</div>
        <span class="chev">›</span>
      </button>
      <button class="list-row pressable" data-action="edit-budget">
        <div class="icon" style="background:#ff3b30;">${svg("bag","#fff",18)}</div>
        <div class="label">Monthly budget</div>
        <div class="value">${fmtMoney(s.monthlyBudget)}</div>
        <span class="chev">›</span>
      </button>
      <button class="list-row pressable" data-action="edit-limit-pct">
        <div class="icon" style="background:#bf5af2;">${svg("diamond","#fff",18)}</div>
        <div class="label">Spend limit (% of income)</div>
        <div class="value">${s.spendLimitPct}%</div>
        <span class="chev">›</span>
      </button>
    </div>

    <div class="section-title">Appearance</div>
    <div class="list">
      <div class="list-row">
        <div class="icon" style="background:#1c1c1e;">${svg("globe","#fff",18)}</div>
        <div class="label">Theme</div>
        <div class="value"></div>
      </div>
      <div style="padding:0 14px 14px;">
        <div class="seg" id="theme-seg">
          <button data-theme="light" class="${s.theme==='light'?'active':''}">Light</button>
          <button data-theme="dark"  class="${s.theme==='dark'?'active':''}">Dark</button>
          <button data-theme="system" class="${s.theme==='system'?'active':''}">Auto</button>
        </div>
        <div class="muted" style="font-size:12px;margin:6px 4px 10px;">Accent color</div>
        <div class="chip-row" id="accent-row">
          ${["blue","green","purple","pink","orange"].map(a => `
            <button class="chip ${s.accent===a?'active':''}" data-accent="${a}" style="background:${a===s.accent?'':'var(--bg-card-2)'};">
              <span class="dot" style="background:${({blue:'#0a84ff',green:'#30d158',purple:'#bf5af2',pink:'#ff375f',orange:'#ff9f0a'})[a]};"></span>
              ${a[0].toUpperCase()+a.slice(1)}
            </button>`).join("")}
        </div>
      </div>
    </div>

    <div class="section-title">Categories</div>
    <div class="list">
      <button class="list-row pressable" data-action="manage-income">
        <div class="icon" style="background:var(--accent-2);">${svg("wallet","#fff",18)}</div>
        <div class="label">Income categories</div>
        <div class="value">${state.categories.income.length}</div>
        <span class="chev">›</span>
      </button>
      <button class="list-row pressable" data-action="manage-expense">
        <div class="icon" style="background:var(--danger);">${svg("bag","#fff",18)}</div>
        <div class="label">Expense categories</div>
        <div class="value">${state.categories.expense.length}</div>
        <span class="chev">›</span>
      </button>
    </div>

    <div class="section-title">Preferences</div>
    <div class="list">
      <label class="list-row">
        <div class="icon" style="background:#5ac8fa;">${svg("music","#fff",18)}</div>
        <div class="label">Haptics</div>
        <span class="switch"><input type="checkbox" id="haptics" ${s.haptics?'checked':''}><span></span></span>
      </label>
    </div>

    <div class="section-title">Data</div>
    <div class="list">
      <button class="list-row pressable" data-action="export">
        <div class="icon" style="background:#30d158;">${svg("globe","#fff",18)}</div>
        <div class="label">Export data (JSON)</div>
        <span class="chev">›</span>
      </button>
      <button class="list-row pressable" data-action="import">
        <div class="icon" style="background:#0a84ff;">${svg("globe","#fff",18)}</div>
        <div class="label">Import data</div>
        <span class="chev">›</span>
      </button>
      <button class="list-row pressable" data-action="reset" style="color:var(--danger);">
        <div class="icon" style="background:var(--danger);">${svg("dots","#fff",18)}</div>
        <div class="label">Erase all data</div>
        <span class="chev">›</span>
      </button>
    </div>

    <div class="section-title">About</div>
    <div class="list">
      <div class="list-row">
        <div class="icon" style="background:linear-gradient(135deg,var(--accent),var(--accent-2));">${svg("star","#fff",18)}</div>
        <div class="label">Paise</div>
        <div class="value">v1.0</div>
      </div>
      <div class="list-row">
        <div class="icon" style="background:#8e8e93;">${svg("heart","#fff",18)}</div>
        <div class="label muted" style="font-size:13px;">Made for tracking your hustle ❤️</div>
      </div>
    </div>

    <div style="height:30px;"></div>
  `;
};

// ---------------------------------------------------------------------
//  Sub-render helpers
// ---------------------------------------------------------------------
function txnRowHtml(t) {
  const c = getCat(t.catId);
  const isInc = t.type === "income";
  const time = new Date(t.date).toLocaleString("en-US",{hour:"numeric",minute:"2-digit"});
  return `
    <div class="txn-row pressable" data-txn="${t.id}">
      <div class="cat-icon" style="background:${c.color}22;">${svg(c.icon, c.color, 22)}</div>
      <div class="meta">
        <div class="t-title">${c.name}</div>
        <div class="t-sub">${t.note ? escapeHtml(t.note) + " · " : ""}${time}</div>
      </div>
      <div class="amt ${isInc?'income':'expense'}">${isInc?'+':'−'}${fmtMoney(Number(t.amount))}</div>
    </div>
  `;
}

function ringSvg(pct, color = "var(--accent)") {
  const r = 32, c = 2 * Math.PI * r;
  const off = c - (pct/100) * c;
  return `
    <div class="goal-ring">
      <svg viewBox="0 0 80 80" width="78" height="78">
        <circle cx="40" cy="40" r="${r}" stroke="var(--separator)" stroke-width="8" fill="none"/>
        <circle cx="40" cy="40" r="${r}" stroke="${color}" stroke-width="8" fill="none" stroke-linecap="round"
          stroke-dasharray="${c}" stroke-dashoffset="${off}"
          style="transition: stroke-dashoffset 1s cubic-bezier(.2,.7,.2,1);"/>
      </svg>
      <div class="pct">${pct}%</div>
    </div>`;
}

function barChart(months) {
  const W = 320, H = 160, P = 24;
  const max = Math.max(1, ...months.flatMap(m => [m.income, m.expense]));
  const bw = (W - P*2) / months.length / 2.6;
  const x0 = i => P + i*((W-P*2)/months.length) + ((W-P*2)/months.length - bw*2 - 4)/2;
  const yOf = v => H - P - (v/max) * (H - P*2);

  const bars = months.map((m,i) => {
    const xi = x0(i);
    const yi = yOf(m.income), hi = (H - P) - yi;
    const xe = xi + bw + 4;
    const ye = yOf(m.expense), he = (H - P) - ye;
    return `
      <rect x="${xi}" y="${yi}" width="${bw}" height="${hi}" rx="4" fill="var(--accent)" opacity="0.95">
        <animate attributeName="height" from="0" to="${hi}" dur="0.6s" fill="freeze" begin="${i*0.05}s"/>
        <animate attributeName="y"      from="${H-P}" to="${yi}" dur="0.6s" fill="freeze" begin="${i*0.05}s"/>
      </rect>
      <rect x="${xe}" y="${ye}" width="${bw}" height="${he}" rx="4" fill="var(--danger)" opacity="0.85">
        <animate attributeName="height" from="0" to="${he}" dur="0.6s" fill="freeze" begin="${i*0.05 + 0.08}s"/>
        <animate attributeName="y"      from="${H-P}" to="${ye}" dur="0.6s" fill="freeze" begin="${i*0.05 + 0.08}s"/>
      </rect>
      <text x="${xi + bw + 2}" y="${H - 6}" text-anchor="middle" font-size="10" fill="var(--text-3)">${m.label}</text>
    `;
  }).join("");

  return `<svg viewBox="0 0 ${W} ${H}" width="100%" height="${H}" preserveAspectRatio="xMidYMid meet">
    <line x1="${P}" y1="${H-P}" x2="${W-P}" y2="${H-P}" stroke="var(--separator)" stroke-width="1"/>
    ${bars}
  </svg>`;
}

function donutChart(map, cats, emptyMsg) {
  const entries = Object.entries(map).filter(([,v]) => v > 0).sort((a,b)=>b[1]-a[1]);
  if (!entries.length) return emptyStateInline(emptyMsg);
  const total = entries.reduce((s,[,v])=>s+v,0);
  const r = 60, cx = 90, cy = 90, sw = 22;
  const C = 2 * Math.PI * r;
  let offset = 0;
  const arcs = entries.map(([id,v]) => {
    const c = cats.find(x=>x.id===id) || getCat(id);
    const portion = v/total;
    const dash = portion * C;
    const arc = `
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${c.color}" stroke-width="${sw}"
        stroke-dasharray="${dash} ${C - dash}"
        stroke-dashoffset="${-offset}"
        transform="rotate(-90 ${cx} ${cy})"
        style="transition: stroke-dasharray .6s ease;"
      />`;
    offset += dash;
    return arc;
  }).join("");
  const legend = entries.map(([id,v]) => {
    const c = cats.find(x=>x.id===id) || getCat(id);
    const p = Math.round((v/total)*100);
    return `<div class="leg"><span class="swatch" style="background:${c.color};"></span>${c.name} · ${p}% · ${fmtMoney(v,{compact:true})}</div>`;
  }).join("");
  return `
    <div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;justify-content:center;">
      <svg viewBox="0 0 180 180" width="160" height="160">
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--separator)" stroke-width="${sw}"/>
        ${arcs}
        <text x="${cx}" y="${cy-4}" text-anchor="middle" font-size="13" fill="var(--text-3)">Total</text>
        <text x="${cx}" y="${cy+18}" text-anchor="middle" font-size="18" font-weight="700" fill="var(--text)">${fmtMoney(total,{compact:true})}</text>
      </svg>
    </div>
    <div class="chart-legend" style="justify-content:center;">${legend}</div>
  `;
}

function insights(months, inc, exp) {
  const arr = [];
  const thisMonth = months[months.length-1];
  const prevMonth = months[months.length-2];
  if (thisMonth.income > prevMonth.income && prevMonth.income > 0) {
    const pct = Math.round(((thisMonth.income - prevMonth.income)/prevMonth.income)*100);
    arr.push({ icon: "star", color: "var(--accent-2)", title: `Income up ${pct}%`, body: `You earned ${fmtMoney(thisMonth.income - prevMonth.income,{compact:true})} more than last month. Keep it up.` });
  }
  if (thisMonth.expense > thisMonth.income && thisMonth.income > 0) {
    arr.push({ icon: "bag", color: "var(--danger)", title: "Spending over income", body: `You're spending ${fmtMoney(thisMonth.expense - thisMonth.income,{compact:true})} more than you earn this month.` });
  }
  const topInc = Object.entries(inc).sort((a,b)=>b[1]-a[1])[0];
  if (topInc) {
    const c = getCat(topInc[0]);
    arr.push({ icon: c.icon, color: c.color, title: `${c.name} is your top earner`, body: `Contributing ${fmtMoney(topInc[1],{compact:true})} this month.` });
  }
  const topExp = Object.entries(exp).sort((a,b)=>b[1]-a[1])[0];
  if (topExp) {
    const c = getCat(topExp[0]);
    arr.push({ icon: c.icon, color: c.color, title: `${c.name} costs the most`, body: `${fmtMoney(topExp[1],{compact:true})} spent on this category.` });
  }
  if (arr.length === 0) {
    arr.push({ icon: "heart", color: "var(--accent)", title: "Start tracking", body: "Add a few transactions to see personalized insights." });
  }
  return arr;
}

function insightHtml(i) {
  return `
    <div class="insight">
      <div class="ico" style="background:${i.color}22;">${svg(i.icon, i.color, 18)}</div>
      <div class="body">
        <div class="t">${i.title}</div>
        <div class="s">${i.body}</div>
      </div>
    </div>`;
}

function emptyState(title, sub) {
  return `<div class="empty">
    <div class="e-icon">✨</div>
    <div class="e-title">${title}</div>
    <div class="e-sub">${sub}</div>
  </div>`;
}
function emptyStateInline(msg) {
  return `<div class="empty" style="padding:20px 12px;"><div class="e-sub">${msg}</div></div>`;
}

function labelForDate(d) {
  const today = new Date();
  const yest = new Date(today); yest.setDate(today.getDate()-1);
  const eq = (a,b)=> a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();
  if (eq(d,today)) return "Today";
  if (eq(d,yest)) return "Yesterday";
  return d.toLocaleDateString("en-US",{ weekday:"long", month:"short", day:"numeric" });
}
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]);
}

// ---------------------------------------------------------------------
//  Sheets / modals
// ---------------------------------------------------------------------
const sheetBackdrop = () => document.getElementById("sheet-backdrop");
const sheetEl = () => document.getElementById("sheet");

function openSheet(html) {
  document.getElementById("sheet-content").innerHTML = html;
  sheetBackdrop().classList.add("open");
  sheetEl().classList.add("open");
  sheetEl().setAttribute("aria-hidden","false");
}
function closeSheet() {
  sheetBackdrop().classList.remove("open");
  sheetEl().classList.remove("open");
  sheetEl().setAttribute("aria-hidden","true");
}

// Add transaction sheet (with calc-style keypad)
function openAddTransaction(preset = "income") {
  const cats = state.categories[preset];
  const html = `
    <h2>Add ${preset === "income" ? "Income" : "Expense"}</h2>
    <div class="seg" id="type-seg">
      <button data-type="income"  class="${preset==='income'?'active':''}">Income</button>
      <button data-type="expense" class="${preset==='expense'?'active':''}">Expense</button>
    </div>

    <div class="field">
      <label>Amount</label>
      <div class="row"><span class="prefix">${state.profile.currency}</span><input id="amt" inputmode="decimal" placeholder="0" autocomplete="off"/></div>
    </div>

    <label class="muted" style="font-size:12px;display:block;margin:4px 6px 6px;">Category</label>
    <div class="chip-row" id="cat-chips">
      ${cats.map(c => `<button class="chip" data-cat="${c.id}" style="background:${c.color}22;color:${c.color};"><span class="dot" style="background:${c.color};"></span>${c.name}</button>`).join("")}
    </div>

    <div class="field"><label>Note (optional)</label>
      <input id="note" placeholder="What was it for?" maxlength="80"/>
    </div>

    <div class="field"><label>Date</label>
      <input id="date" type="datetime-local" value="${toLocalInput(new Date())}"/>
    </div>

    <div class="sheet-actions">
      <button class="btn btn-secondary" id="cancel">Cancel</button>
      <button class="btn btn-primary" id="save">Save</button>
    </div>
  `;
  openSheet(html);

  let selectedType = preset;
  let selectedCat = cats[0]?.id || null;

  const reRenderChips = () => {
    const list = state.categories[selectedType];
    document.getElementById("cat-chips").innerHTML = list.map(c =>
      `<button class="chip ${selectedCat===c.id?'active':''}" data-cat="${c.id}" style="${selectedCat===c.id?'':'background:'+c.color+'22;color:'+c.color+';'}"><span class="dot" style="background:${selectedCat===c.id?'#fff':c.color};"></span>${c.name}</button>`).join("");
    bindChips();
  };
  const bindChips = () => {
    document.querySelectorAll("#cat-chips .chip").forEach(b => {
      b.addEventListener("click", () => {
        selectedCat = b.dataset.cat;
        haptic(5);
        reRenderChips();
      });
    });
  };

  document.querySelectorAll("#type-seg button").forEach(b => {
    b.addEventListener("click", () => {
      selectedType = b.dataset.type;
      document.querySelectorAll("#type-seg button").forEach(x => x.classList.toggle("active", x === b));
      const list = state.categories[selectedType];
      selectedCat = list[0]?.id || null;
      reRenderChips();
      haptic(5);
    });
  });
  reRenderChips();
  if (selectedCat) document.querySelector(`#cat-chips .chip[data-cat="${selectedCat}"]`)?.classList.add("active");

  document.getElementById("cancel").onclick = closeSheet;
  document.getElementById("save").onclick = () => {
    const amt = parseFloat(document.getElementById("amt").value);
    const note = document.getElementById("note").value.trim();
    const date = document.getElementById("date").value;
    if (!amt || amt <= 0) { toast("Enter a valid amount"); return; }
    if (!selectedCat) { toast("Pick a category"); return; }
    state.transactions.push({
      id: uid(), type: selectedType, amount: amt, catId: selectedCat,
      note, date: new Date(date || Date.now()).toISOString()
    });
    save(); haptic(20); closeSheet(); setTab(currentTab);
    toast(`${selectedType === "income" ? "Income" : "Expense"} added`);
    checkLimits();
  };

  // Focus amount input
  setTimeout(() => document.getElementById("amt")?.focus(), 350);
}

function toLocalInput(d) {
  const pad = n => String(n).padStart(2,"0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function openTxnDetail(id) {
  const t = state.transactions.find(x => x.id === id);
  if (!t) return;
  const c = getCat(t.catId);
  const html = `
    <h2>Transaction</h2>
    <div style="display:flex;align-items:center;gap:14px;padding:8px 4px 18px;">
      <div class="cat-icon" style="width:56px;height:56px;border-radius:16px;background:${c.color}22;">${svg(c.icon, c.color, 28)}</div>
      <div>
        <div style="font-weight:700;font-size:20px;">${c.name}</div>
        <div class="muted" style="font-size:13px;">${new Date(t.date).toLocaleString()}</div>
      </div>
      <div style="margin-left:auto;font-weight:800;font-size:22px;color:${t.type==='income'?'var(--accent-2)':'var(--danger)'};">${t.type==='income'?'+':'−'}${fmtMoney(Number(t.amount))}</div>
    </div>
    ${t.note ? `<div class="field"><label>Note</label><div>${escapeHtml(t.note)}</div></div>` : ""}
    <div class="sheet-actions">
      <button class="btn btn-danger" id="del">Delete</button>
      <button class="btn btn-primary" id="close">Done</button>
    </div>
  `;
  openSheet(html);
  document.getElementById("close").onclick = closeSheet;
  document.getElementById("del").onclick = () => {
    if (!confirm("Delete this transaction?")) return;
    state.transactions = state.transactions.filter(x => x.id !== id);
    save(); closeSheet(); setTab(currentTab); haptic(20); toast("Deleted");
  };
}

function openProfileSheet() {
  const initial = (state.profile.name || "P").trim().charAt(0).toUpperCase();
  const txns = state.transactions;
  const totalIn = sumBy(txns, t=>t.type==="income");
  const totalEx = sumBy(txns, t=>t.type==="expense");
  const html = `
    <h2 style="margin-bottom:0;">Profile</h2>
    <div class="profile-hero">
      <div class="av">${initial}</div>
      <div class="pname">${state.profile.name || "Set your name"}</div>
      <div class="psub">Member since ${new Date(state.createdAt).toLocaleDateString("en-US",{month:"long",year:"numeric"})}</div>
    </div>
    <div class="quick-grid">
      <div class="qcard"><div class="label">Lifetime income</div><div class="value" style="color:var(--accent-2);">${fmtMoney(totalIn,{compact:true})}</div></div>
      <div class="qcard"><div class="label">Lifetime spent</div><div class="value" style="color:var(--danger);">${fmtMoney(totalEx,{compact:true})}</div></div>
      <div class="qcard"><div class="label">Saved</div><div class="value">${fmtMoney(totalIn-totalEx,{compact:true})}</div></div>
      <div class="qcard"><div class="label">Transactions</div><div class="value">${txns.length}</div></div>
    </div>
    <div class="sheet-actions">
      <button class="btn btn-secondary" id="edit-name">Edit name</button>
      <button class="btn btn-primary" id="close">Done</button>
    </div>
  `;
  openSheet(html);
  document.getElementById("close").onclick = closeSheet;
  document.getElementById("edit-name").onclick = () => openSimpleEdit({
    title: "Your name",
    placeholder: "What should we call you?",
    value: state.profile.name,
    onSave: v => { state.profile.name = v.trim(); save(); openProfileSheet(); updateHeader(); }
  });
}

function openSimpleEdit({ title, placeholder, value = "", type = "text", suffix = "", onSave }) {
  openSheet(`
    <h2>${title}</h2>
    <div class="field"><label>${title}</label>
      <div class="row">${suffix ? `<span class="prefix">${suffix}</span>` : ""}<input id="se-input" type="${type}" placeholder="${placeholder}" value="${escapeHtml(String(value))}"/></div>
    </div>
    <div class="sheet-actions">
      <button class="btn btn-secondary" id="se-cancel">Cancel</button>
      <button class="btn btn-primary" id="se-save">Save</button>
    </div>
  `);
  setTimeout(() => document.getElementById("se-input")?.focus(), 250);
  document.getElementById("se-cancel").onclick = closeSheet;
  document.getElementById("se-save").onclick = () => {
    const raw = document.getElementById("se-input").value;
    const v = type === "number" ? Number(raw) : raw;
    if (type === "number" && (isNaN(v) || v < 0)) { toast("Enter a valid number"); return; }
    onSave(v); closeSheet(); haptic(10);
  };
}

function manageCategoriesSheet(kind) {
  const cats = state.categories[kind];
  const html = `
    <h2>${kind === "income" ? "Income" : "Expense"} categories</h2>
    <div class="list" style="background:transparent;box-shadow:none;">
      ${cats.map(c => `
        <div class="list-row" style="background:var(--bg-card-2);border-radius:14px;margin-bottom:8px;border:none;">
          <div class="icon" style="background:${c.color};">${svg(c.icon,"#fff",18)}</div>
          <div class="label">${c.name}</div>
          ${kind === "expense" ? `<div class="value">${c.limitPct||0}% limit</div>`:''}
          <button class="btn btn-danger" style="padding:6px 10px;font-size:13px;" data-del="${c.id}">Remove</button>
        </div>
      `).join("")}
    </div>
    <div class="field"><label>Add new ${kind} category</label>
      <input id="nc-name" placeholder="Category name" maxlength="24"/>
    </div>
    <div class="field"><label>Color</label>
      <div class="chip-row" id="nc-colors">
        ${["#0a84ff","#30d158","#ff9f0a","#ff375f","#bf5af2","#5ac8fa","#ffd60a","#8e8e93"].map(col =>
          `<button class="chip" data-color="${col}" style="background:${col};color:#fff;">${col}</button>`).join("")}
      </div>
    </div>
    <div class="sheet-actions">
      <button class="btn btn-secondary" id="ds">Done</button>
      <button class="btn btn-primary" id="add-cat">Add category</button>
    </div>
  `;
  openSheet(html);
  let chosen = "#0a84ff";
  document.querySelectorAll("#nc-colors .chip").forEach(b => {
    b.addEventListener("click", () => {
      chosen = b.dataset.color;
      document.querySelectorAll("#nc-colors .chip").forEach(x => x.style.outline = "");
      b.style.outline = "3px solid var(--text)";
    });
  });
  document.getElementById("ds").onclick = closeSheet;
  document.querySelectorAll("[data-del]").forEach(b => {
    b.addEventListener("click", () => {
      const id = b.dataset.del;
      if (!confirm("Remove this category? Existing transactions will keep their label.")) return;
      state.categories[kind] = state.categories[kind].filter(c => c.id !== id);
      save(); manageCategoriesSheet(kind);
    });
  });
  document.getElementById("add-cat").onclick = () => {
    const name = document.getElementById("nc-name").value.trim();
    if (!name) { toast("Enter a name"); return; }
    state.categories[kind].push({
      id: name.toLowerCase().replace(/\s+/g,"_") + "_" + uid().slice(0,4),
      name, color: chosen, icon: kind==="income" ? "wallet" : "dots",
      ...(kind==="expense" ? { limitPct: 10 } : {}),
    });
    save(); manageCategoriesSheet(kind);
  };
}

function exportData() {
  const blob = new Blob([JSON.stringify(state,null,2)], { type:"application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `paise-backup-${new Date().toISOString().slice(0,10)}.json`;
  a.click(); URL.revokeObjectURL(url);
  toast("Exported");
}
function importData() {
  const input = document.createElement("input");
  input.type = "file"; input.accept = "application/json";
  input.onchange = () => {
    const file = input.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        state = { ...defaultState(), ...data };
        save(); applyTheme(); updateHeader(); setTab(currentTab); toast("Imported");
      } catch (e) { toast("Invalid file"); }
    };
    reader.readAsText(file);
  };
  input.click();
}
function eraseAll() {
  if (!confirm("Erase ALL data? This cannot be undone.")) return;
  state = defaultState(); save(); applyTheme(); updateHeader(); setTab("home"); toast("All data erased");
}

function checkLimits() {
  const now = new Date();
  const txns = monthTxns(now);
  const income = sumBy(txns, t => t.type === "income");
  const expense = sumBy(txns, t => t.type === "expense");
  if (state.settings.monthlyBudget && expense > state.settings.monthlyBudget) {
    toast("⚠️ You've crossed your monthly budget");
    return;
  }
  if (income > 0 && state.settings.spendLimitPct) {
    const pct = Math.round((expense/income)*100);
    if (pct >= state.settings.spendLimitPct) {
      toast(`⚠️ Spending ${pct}% of income (limit ${state.settings.spendLimitPct}%)`);
    }
  }
}

// ---------------------------------------------------------------------
//  Header
// ---------------------------------------------------------------------
function updateHeader() {
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  document.getElementById("header-hello").textContent = greet;
  document.getElementById("header-name").textContent = state.profile.name || "Welcome";
  document.getElementById("avatar-initial").textContent = (state.profile.name || "P").trim().charAt(0).toUpperCase();
}

// ---------------------------------------------------------------------
//  Event binding
// ---------------------------------------------------------------------
const view = document.getElementById("view");

function attachAfterRender(tab) {
  // Common: txn rows open detail
  view.querySelectorAll("[data-txn]").forEach(el => {
    el.addEventListener("click", () => openTxnDetail(el.dataset.txn));
  });

  if (tab === "home") {
    document.getElementById("edit-target")?.addEventListener("click", () => editTargetSheet("monthlyTarget", "Monthly savings goal"));
    document.getElementById("edit-budget")?.addEventListener("click", () => editTargetSheet("monthlyBudget", "Monthly budget"));
    document.getElementById("see-history")?.addEventListener("click", () => setTab("transactions"));
    document.getElementById("show-all-inc")?.addEventListener("click", () => setTab("stats"));
  }

  if (tab === "transactions") {
    view.querySelectorAll(".filter-chip").forEach(b => {
      b.addEventListener("click", () => {
        view.dataset.txnFilter = b.dataset.filter;
        setTab("transactions");
      });
    });
  }

  if (tab === "settings") {
    view.querySelector('[data-action="edit-profile"]')?.addEventListener("click", () => openSimpleEdit({
      title: "Your name", placeholder: "Name", value: state.profile.name,
      onSave: v => { state.profile.name = v.trim(); save(); updateHeader(); setTab("settings"); }
    }));
    view.querySelector('[data-action="edit-currency"]')?.addEventListener("click", () => openSimpleEdit({
      title: "Currency symbol", placeholder: "₹", value: state.profile.currency,
      onSave: v => { state.profile.currency = (v||"₹").slice(0,3); save(); setTab("settings"); }
    }));
    view.querySelector('[data-action="edit-target"]')?.addEventListener("click", () => editTargetSheet("monthlyTarget", "Monthly savings goal"));
    view.querySelector('[data-action="edit-budget"]')?.addEventListener("click", () => editTargetSheet("monthlyBudget", "Monthly budget"));
    view.querySelector('[data-action="edit-limit-pct"]')?.addEventListener("click", () => openSimpleEdit({
      title: "Spend limit % of income", placeholder: "60", type: "number", value: state.settings.spendLimitPct, suffix: "%",
      onSave: v => { state.settings.spendLimitPct = Math.max(0, Math.min(100, Math.round(v))); save(); setTab("settings"); }
    }));
    view.querySelectorAll("#theme-seg button").forEach(b => b.addEventListener("click", () => {
      state.settings.theme = b.dataset.theme; save(); applyTheme(); setTab("settings");
    }));
    view.querySelectorAll("#accent-row .chip").forEach(b => b.addEventListener("click", () => {
      state.settings.accent = b.dataset.accent; save(); applyTheme(); setTab("settings");
    }));
    view.querySelector("#haptics")?.addEventListener("change", e => { state.settings.haptics = e.target.checked; save(); });
    view.querySelector('[data-action="manage-income"]')?.addEventListener("click", () => manageCategoriesSheet("income"));
    view.querySelector('[data-action="manage-expense"]')?.addEventListener("click", () => manageCategoriesSheet("expense"));
    view.querySelector('[data-action="export"]')?.addEventListener("click", exportData);
    view.querySelector('[data-action="import"]')?.addEventListener("click", importData);
    view.querySelector('[data-action="reset"]')?.addEventListener("click", eraseAll);
  }
}

function editTargetSheet(key, title) {
  openSimpleEdit({
    title, placeholder: "0", type: "number", value: state.settings[key], suffix: state.profile.currency,
    onSave: v => { state.settings[key] = Math.max(0, Math.round(v)); save(); setTab(currentTab); }
  });
}

// Tab clicks
document.querySelectorAll(".tab").forEach(b => {
  if (b.classList.contains("tab-spacer")) return;
  b.addEventListener("click", () => { haptic(5); setTab(b.dataset.tab); });
});
// Avatar opens profile
document.getElementById("avatar-btn").addEventListener("click", () => { haptic(8); openProfileSheet(); });
// FAB
document.getElementById("fab").addEventListener("click", () => { haptic(10); openAddTransaction("income"); });
// Sheet backdrop closes sheet
sheetBackdrop().addEventListener("click", closeSheet);

// Drag-down on sheet to close
(function attachSheetDrag(){
  const sh = sheetEl();
  let startY = 0, dragging = false, currentY = 0;
  sh.addEventListener("touchstart", e => {
    if (sh.scrollTop > 0) return;
    startY = e.touches[0].clientY; dragging = true; currentY = 0;
    sh.style.transition = "none";
  }, { passive: true });
  sh.addEventListener("touchmove", e => {
    if (!dragging) return;
    currentY = e.touches[0].clientY - startY;
    if (currentY > 0) {
      sh.style.transform = `translateY(${currentY}px)`;
    }
  }, { passive: true });
  sh.addEventListener("touchend", () => {
    if (!dragging) return;
    dragging = false;
    sh.style.transition = "";
    if (currentY > 120) { closeSheet(); }
    sh.style.transform = "";
  });
})();

// ---------------------------------------------------------------------
//  Boot
// ---------------------------------------------------------------------
applyTheme();
updateHeader();
setTab("home");
// Hide splash
window.addEventListener("load", () => {
  setTimeout(() => {
    document.getElementById("splash").classList.add("hidden");
    setTimeout(() => document.getElementById("splash").remove(), 600);
  }, 500);
});

// Service worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(()=>{}));
}

// PWA install prompt
let deferredPrompt = null;
window.addEventListener("beforeinstallprompt", e => {
  e.preventDefault();
  deferredPrompt = e;
  // Show a soft prompt the next time user opens profile
});
