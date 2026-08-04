/* ============================================================
   UI — shell, navigation and page rendering.
   Everything is re-rendered from state; interaction runs
   through one delegated click handler on document.
   ============================================================ */

const App = {
  page: 'dashboard',

  filter: {
    preset: 'thisMonth',
    custom: { start: U.today(), end: U.today() },
    categoryIds: [],
    pocketIds: [],
    types: [],
    search: '',
  },

  compare: 'prev',
  donutType: 'expense',
  chartNote: '',

  /* ---------- derived ---------- */

  range() { return resolvePreset(App.filter.preset, App.filter.custom); },

  /** Transactions matching every active filter. */
  tx() {
    const r = App.range();
    return Store.query({
      start: r.start, end: r.end,
      types: App.filter.types,
      categoryIds: App.filter.categoryIds,
      pocketIds: App.filter.pocketIds,
      search: App.filter.search,
    });
  },

  /** Same filters, but over the comparison window. */
  txCompare() {
    const cmp = comparisonRange(App.range(), App.compare, App.filter.preset);
    if (!cmp) return { list: [], range: null };
    return {
      range: cmp,
      list: Store.query({
        start: cmp.start, end: cmp.end,
        types: App.filter.types,
        categoryIds: App.filter.categoryIds,
        pocketIds: App.filter.pocketIds,
        search: App.filter.search,
      }),
    };
  },

  money(n, extra = {}) {
    return U.money(n, Object.assign({
      symbol: Store.data.settings.currencySymbol,
      hide: Store.data.settings.hideAmounts,
    }, extra));
  },

  activeFilterCount() {
    return App.filter.categoryIds.length + App.filter.pocketIds.length +
           App.filter.types.length + (App.filter.search ? 1 : 0);
  },

  resetFilters() {
    App.filter.categoryIds = [];
    App.filter.pocketIds = [];
    App.filter.types = [];
    App.filter.search = '';
    render();
  },
};

/* ============================================================
   Theme
   ============================================================ */

/** Matches the desktop breakpoint in styles.css. */
function isWide() {
  return window.matchMedia('(min-width: 900px)').matches;
}

function applyTheme() {
  const pref = Store.data.settings.theme;
  const dark = pref === 'dark' ||
    (pref === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', dark ? '#191917' : '#F6F4F0');
}

/* ============================================================
   Toast
   ============================================================ */

function toast(msg, ico = 'check') {
  const host = document.getElementById('toasts');
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = `${icon(ico, 16)}<span>${U.escape(msg)}</span>`;
  host.appendChild(el);
  setTimeout(() => {
    el.classList.add('is-out');
    setTimeout(() => el.remove(), 220);
  }, 2200);
}

/* ============================================================
   Shell
   ============================================================ */

const NAV = [
  { id: 'dashboard',    label: 'Beranda',   ico: 'dashboard' },
  { id: 'transactions', label: 'Transaksi', ico: 'list' },
  { id: '_slot',        label: '',          ico: '' },
  { id: 'pockets',      label: 'Pocket',    ico: 'wallet' },
  { id: 'more',         label: 'Lainnya',   ico: 'settings' },
];

function renderNav() {
  const items = NAV.map(n => {
    if (n.id === '_slot') return `<span class="navitem navitem--slot"></span>`;
    return `<button class="navitem ${App.page === n.id ? 'is-active' : ''}" data-nav="${n.id}">
      ${icon(n.ico, 21)}<span>${n.label}</span>
    </button>`;
  }).join('');

  document.getElementById('nav').innerHTML = `
    <div class="navitem navitem--brand">
      <span class="brand-mark">${icon('wallet', 18)}</span>
      <span>AturinDuit</span>
    </div>
    ${items}
    <button class="fab" data-act="quick-add" aria-label="Catat transaksi">
      ${icon('plus', 24)}<span class="fab__lb">Catat</span>
    </button>`;
}

const PAGE_TITLES = {
  dashboard:    { t: 'Beranda',     s: () => U.fmtRange(App.range().start, App.range().end) },
  transactions: { t: 'Transaksi',   s: () => U.fmtRange(App.range().start, App.range().end) },
  pockets:      { t: 'Pocket',      s: () => `${Store.activePockets().length} pocket aktif` },
  more:         { t: 'Lainnya',     s: () => 'Kategori, data & tampilan' },
  categories:   { t: 'Kategori',    s: () => 'Atur pengelompokan sendiri' },
};

function renderTopbar() {
  const p = PAGE_TITLES[App.page] || PAGE_TITLES.dashboard;
  const back = App.page === 'categories';
  const hidden = Store.data.settings.hideAmounts;

  document.getElementById('topbar').innerHTML = `
    ${back ? `<button class="icon-btn" data-nav="more">${icon('chevron-left', 20)}</button>` : ''}
    <div class="topbar__title">
      <h1>${p.t}</h1>
      <p>${U.escape(p.s())}</p>
    </div>
    <button class="icon-btn ${hidden ? 'is-on' : ''}" data-act="toggle-hide"
      aria-label="Sembunyikan nominal">${icon(hidden ? 'eye-off' : 'eye', 19)}</button>
    ${App.page === 'dashboard' || App.page === 'transactions'
      ? `<button class="icon-btn ${App.activeFilterCount() ? 'is-on' : ''}" data-act="open-filter"
          aria-label="Filter">${icon('filter', 19)}</button>` : ''}`;
}

function render() {
  applyTheme();
  renderNav();
  renderTopbar();
  const view = document.getElementById('view');
  view.innerHTML = ({
    dashboard:    renderDashboard,
    transactions: renderTransactions,
    pockets:      renderPockets,
    more:         renderMore,
    categories:   renderCategories,
  }[App.page] || renderDashboard)();
  view.scrollTop = 0;
}

function go(page) {
  App.page = page;
  App.chartNote = '';
  render();   // render() already returns .view to the top
}

/* ============================================================
   Shared fragments
   ============================================================ */

function filterBar() {
  const f = App.filter;
  const catN = f.categoryIds.length;
  const pocN = f.pocketIds.length;
  const typeN = f.types.length;

  return `<div class="filterbar"><div class="chip-scroll">
    <button class="chip is-active" data-act="open-period">
      ${icon('calendar', 15)}${presetLabel(f.preset)}${icon('chevron-down', 14)}
    </button>
    <button class="chip ${catN ? 'is-active' : ''}" data-act="open-cat-filter">
      ${icon('layers', 15)}Kategori
      ${catN ? `<span class="chip--count">${catN}</span>` : icon('chevron-down', 14)}
    </button>
    <button class="chip ${pocN ? 'is-active' : ''}" data-act="open-pocket-filter">
      ${icon('wallet', 15)}Pocket
      ${pocN ? `<span class="chip--count">${pocN}</span>` : icon('chevron-down', 14)}
    </button>
    <button class="chip ${typeN ? 'is-active' : ''}" data-act="cycle-type">
      ${icon('arrow-left-right', 15)}${typeN ? typeLabel(f.types[0]) : 'Semua jenis'}
    </button>
    ${App.activeFilterCount() ? `<button class="chip" data-act="reset-filter">
      ${icon('x', 14)}Reset</button>` : ''}
  </div></div>`;
}

function typeLabel(t) {
  return { expense: 'Pengeluaran', income: 'Pemasukan', transfer: 'Transfer' }[t] || 'Semua jenis';
}

function emptyState(title, msg, ico = 'list') {
  return `<div class="empty">
    <div class="empty__ico">${icon(ico, 24)}</div>
    <b>${U.escape(title)}</b><p>${U.escape(msg)}</p>
  </div>`;
}

function txRow(t) {
  const cat = Store.category(t.categoryId);
  const pocket = Store.pocket(t.pocketId);

  if (t.type === 'transfer') {
    const to = Store.pocket(t.toPocketId);
    return `<button class="tx-item" data-tx="${t.id}">
      <span class="bubble bubble--transfer tx-item__ico">${icon('arrow-left-right', 19)}</span>
      <span class="tx-item__mid">
        <span class="tx-item__t">Transfer</span>
        <span class="tx-item__s">${U.escape(pocket ? pocket.name : '—')} → ${U.escape(to ? to.name : '—')}</span>
      </span>
      <span class="tx-item__a a-tf">${App.money(t.amount)}</span>
    </button>`;
  }

  const inc = t.type === 'income';
  return `<button class="tx-item" data-tx="${t.id}">
    ${iconBubble(cat ? cat.icon : 'more-horizontal', cat ? cat.color : '#9EA79B', 38, 19, 'tx-item__ico')}
    <span class="tx-item__mid">
      <span class="tx-item__t">${U.escape(t.note || (cat ? cat.name : 'Transaksi'))}</span>
      <span class="tx-item__s">${t.note && cat ? U.escape(cat.name) + ' · ' : ''}${U.escape(pocket ? pocket.name : '—')}</span>
    </span>
    <span class="tx-item__a ${inc ? 'a-in' : 'a-out'}">
      ${inc ? '+' : '−'}${App.money(t.amount).replace('−', '')}
    </span>
  </button>`;
}

function txGroups(list) {
  if (!list.length) return emptyState('Belum ada transaksi', 'Catat pengeluaran pertamamu dengan tombol +');

  const byDate = new Map();
  for (const t of list) {
    if (!byDate.has(t.date)) byDate.set(t.date, []);
    byDate.get(t.date).push(t);
  }

  return [...byDate.entries()].map(([date, items]) => {
    const net = items.reduce((s, t) =>
      s + (t.type === 'income' ? t.amount : t.type === 'expense' ? -t.amount : 0), 0);
    return `<div class="tx-group">
      <div class="tx-group__head">
        <b>${U.escape(U.fmtDateRelative(date))}</b>
        <span class="${net > 0 ? 'a-in' : ''}">${App.money(net, { sign: true })}</span>
      </div>
      <div class="tx-list">${items.map(txRow).join('')}</div>
    </div>`;
  }).join('');
}

/* ============================================================
   Page — Dashboard
   ============================================================ */

function renderDashboard() {
  const range = App.range();
  const list = App.tx();
  const tot = Store.totals(list);
  const symbolHidden = Store.data.settings.hideAmounts;

  /* ---- hero ---- */
  const hero = `<div class="hero">
    <div class="hero__label">${icon('wallet', 14)} Total saldo semua pocket</div>
    <div class="hero__value">${App.money(Store.totalBalance())}</div>
    <div class="hero__split">
      <div class="hero__cell">
        <span class="bubble bubble--income">${icon('arrow-down-right', 17)}</span>
        <span><span class="k">Pemasukan</span><br><span class="v a-in">${App.money(tot.income)}</span></span>
      </div>
      <div class="hero__cell">
        <span class="bubble bubble--expense">${icon('arrow-up-right', 17)}</span>
        <span><span class="k">Pengeluaran</span><br><span class="v">${App.money(tot.expense)}</span></span>
      </div>
    </div>
    <div class="spread" style="padding-bottom:12px">
      <span class="tiny muted">Selisih periode ini</span>
      <b class="num ${tot.net >= 0 ? 'a-in' : ''}" style="font-size:15px">
        ${App.money(tot.net, { sign: true })}</b>
    </div>
  </div>`;

  /* ---- quick add ---- */
  const quick = `<div class="section">
    <div class="section__head"><h2>Catat cepat</h2>
      <button class="link" data-act="edit-quick">Atur${icon('chevron-right', 13)}</button>
    </div>
    <div class="quick-grid">${quickTiles()}</div>
  </div>`;

  /* ---- trend ---- */
  const { granularity, buckets } = buildBuckets(
    range.start || earliestDate(), range.end || U.today());
  for (const b of buckets) b.values = { income: 0, expense: 0 };
  for (const t of list) {
    if (t.type === 'transfer') continue;
    const b = buckets.find(x => t.date >= x.start && t.date <= x.end);
    if (b) b.values[t.type] += Number(t.amount) || 0;
  }
  const series = [
    { key: 'income',  color: 'var(--income)',  label: 'Pemasukan' },
    { key: 'expense', color: 'var(--expense)', label: 'Pengeluaran' },
  ].filter(s => !App.filter.types.length || App.filter.types.includes(s.key));
  App._buckets = buckets;

  const trendCard = `<div class="card">
    <div class="card__head">
      <h3>Arus kas</h3>
      <span class="tiny muted">${GRANULARITY_LABEL[granularity]}</span>
    </div>
    <div class="wrap-gap tiny muted" style="margin:-6px 0 10px">
      ${series.map(s => `<span class="inline"><i style="width:9px;height:9px;border-radius:3px;
        background:${s.color};display:inline-block"></i>${s.label}</span>`).join('')}
    </div>
    ${Charts.trend(buckets, series, { wide: isWide() })}
    <div class="chart-note" id="note-trend">${U.escape(App.chartNote)}</div>
  </div>`;

  /* ---- composition donut ---- */
  const donutItems = Store.byCategory(list, App.donutType);
  const donutTotal = donutItems.reduce((s, i) => s + i.value, 0);
  const shown = donutItems.slice(0, 6);
  const restVal = donutItems.slice(6).reduce((s, i) => s + i.value, 0);
  if (restVal > 0) shown.push({ id: '_rest', name: 'Lainnya', value: restVal, color: '#B6AE96', icon: 'more-horizontal' });
  App._donut = shown;

  const donutCard = `<div class="card">
    <div class="card__head"><h3>Komposisi</h3></div>
    <div class="segmented" style="margin-bottom:14px">
      <button data-act="donut-type" data-v="expense" data-kind="expense"
        class="${App.donutType === 'expense' ? 'is-active' : ''}">Pengeluaran</button>
      <button data-act="donut-type" data-v="income" data-kind="income"
        class="${App.donutType === 'income' ? 'is-active' : ''}">Pemasukan</button>
    </div>
    <div class="donut-wrap">
      ${Charts.donut(shown, {
        centerTop: App.donutType === 'expense' ? 'KELUAR' : 'MASUK',
        centerMain: symbolHidden ? '••••' : U.compact(donutTotal),
      })}
      <div class="legend">${shown.length ? shown.map(i => `
        <button class="legend__row" ${i.id !== '_rest' ? `data-cat-jump="${i.id}"` : ''}>
          <span class="legend__dot" style="background:${i.color}"></span>
          <span class="legend__lb">${U.escape(i.name)}</span>
          <span class="legend__vl">${symbolHidden ? '••••' : U.compact(i.value)}</span>
          <span class="legend__pc">${U.pct(i.value, donutTotal).toFixed(0)}%</span>
        </button>`).join('') : `<p class="tiny muted">Belum ada data pada periode ini.</p>`}
      </div>
    </div>
  </div>`;

  /* ---- category ranking ---- */
  const rankItems = donutItems.slice(0, 8);
  const rankCard = `<div class="card">
    <div class="card__head">
      <h3>Peringkat kategori</h3>
      <span class="tiny muted">${App.donutType === 'expense' ? 'Pengeluaran' : 'Pemasukan'}</span>
    </div>
    ${rankItems.length
      ? Charts.rank(rankItems, {
          symbol: Store.data.settings.currencySymbol,
          hide: symbolHidden,
          total: donutTotal,
        })
      : `<p class="tiny muted">Belum ada data pada periode ini.</p>`}
  </div>`;

  /* ---- comparison ---- */
  const comparison = renderComparison(list, tot);

  /* ---- cumulative net ---- */
  const cum = [];
  let run = 0;
  for (const b of buckets) {
    run += (b.values.income || 0) - (b.values.expense || 0);
    cum.push({ label: b.label, value: run });
  }
  App._cum = cum;
  const areaCard = `<div class="card">
    <div class="card__head"><h3>Akumulasi selisih</h3>
      <span class="tiny muted">${GRANULARITY_LABEL[granularity]}</span></div>
    <p class="card__sub">Pemasukan dikurangi pengeluaran, ditumpuk sepanjang periode.</p>
    ${Charts.area(cum, { wide: isWide() })}
    <div class="chart-note" id="note-area">${U.escape(App.chartNote)}</div>
  </div>`;

  /* ---- recent ---- */
  const recent = list.slice(0, 6);
  const recentCard = `<div class="section">
    <div class="section__head"><h2>Transaksi terakhir</h2>
      <button class="link" data-nav="transactions">Semua${icon('chevron-right', 13)}</button>
    </div>
    ${recent.length ? `<div class="tx-list">${recent.map(txRow).join('')}</div>`
      : emptyState('Belum ada transaksi', 'Tekan tombol + untuk mulai mencatat.')}
  </div>`;

  return `${filterBar()}${Backup.banner()}${hero}${quick}
    <div class="section"><div class="dash-grid">
      <div class="span2">${trendCard}</div>
      ${donutCard}
      ${rankCard}
      <div class="span2">${comparison}</div>
      <div class="span2">${areaCard}</div>
    </div></div>
    ${recentCard}`;
}

function earliestDate() {
  const dates = Store.data.transactions.map(t => t.date);
  return dates.length ? dates.reduce((a, b) => (a < b ? a : b)) : U.today();
}

function quickTiles() {
  const s = Store.data.settings;
  let ids = s.quickCategoryIds.filter(id => {
    const c = Store.category(id);
    return c && !c.archived;
  });

  if (!ids.length) {
    // auto-pick: most used in the last 90 days, then fill from defaults
    const since = U.key(U.addDays(new Date(), -90));
    const count = new Map();
    for (const t of Store.data.transactions) {
      if (t.date < since || t.type === 'transfer' || !t.categoryId) continue;
      count.set(t.categoryId, (count.get(t.categoryId) || 0) + 1);
    }
    ids = [...count.entries()].sort((a, b) => b[1] - a[1]).map(e => e[0]);
    for (const c of Store.categoriesOf('expense')) {
      if (ids.length >= 7) break;
      if (!ids.includes(c.id)) ids.push(c.id);
    }
  }

  const tiles = ids.slice(0, 7).map(id => {
    const c = Store.category(id);
    if (!c) return '';
    return `<button class="quick-tile" data-quick="${c.id}">
      ${iconBubble(c.icon, c.color, 40, 21, 'quick-tile__ico')}
      <span class="quick-tile__lb">${U.escape(c.name)}</span>
    </button>`;
  }).join('');

  return tiles + `<button class="quick-tile quick-tile--add" data-act="quick-add">
    <span class="bubble quick-tile__ico">${icon('plus', 21)}</span>
    <span class="quick-tile__lb">Lainnya</span>
  </button>`;
}

function renderComparison(list, tot) {
  if (App.compare === 'none' || App.filter.preset === 'all') {
    return `<div class="card">
      <div class="card__head"><h3>Perbandingan</h3></div>
      ${compareModeSwitch()}
      <p class="tiny muted" style="margin-top:12px">
        Pilih mode pembanding untuk melihat selisih antar periode.</p>
    </div>`;
  }

  const { list: prev, range: cmpRange } = App.txCompare();
  const prevTot = Store.totals(prev);

  const cards = [
    { k: 'Pemasukan',  a: tot.income,  b: prevTot.income,  invert: false, ico: 'arrow-down-right' },
    { k: 'Pengeluaran',a: tot.expense, b: prevTot.expense, invert: true,  ico: 'arrow-up-right' },
    { k: 'Selisih',    a: tot.net,     b: prevTot.net,     invert: false, ico: 'scale' },
  ].map(c => `<div class="cmp-card">
      <div class="cmp-card__k">${icon(c.ico, 13)}${c.k}</div>
      <div class="cmp-card__v num">${App.money(c.a, { sign: c.k === 'Selisih' })}</div>
      <div class="inline">
        ${deltaBadge(deltaOf(c.a, c.b), c.invert)}
        <span class="cmp-card__p">dari ${App.money(c.b)}</span>
      </div>
    </div>`).join('');

  // per-category comparison for the currently selected side
  const curCats = Store.byCategory(list, App.donutType);
  const prevCats = Store.byCategory(prev, App.donutType);
  const prevMap = new Map(prevCats.map(c => [c.id, c.value]));
  const ids = new Set([...curCats.map(c => c.id), ...prevCats.map(c => c.id)]);

  const rows = [...ids].map(id => {
    const cur = curCats.find(c => c.id === id);
    const ref = prevCats.find(c => c.id === id);
    const meta = cur || ref;
    return {
      id, name: meta.name, icon: meta.icon, color: meta.color,
      a: cur ? cur.value : 0,
      b: prevMap.get(id) || 0,
      invert: App.donutType === 'expense',
    };
  }).sort((x, y) => Math.max(y.a, y.b) - Math.max(x.a, x.b)).slice(0, 6);

  return `<div class="card">
    <div class="card__head"><h3>Perbandingan</h3></div>
    <p class="card__sub">
      ${U.escape(U.fmtRange(App.range().start, App.range().end))}
      &nbsp;vs&nbsp; ${U.escape(U.fmtRange(cmpRange.start, cmpRange.end))}
    </p>
    ${compareModeSwitch()}
    <div class="cmp-grid" style="margin-top:14px">${cards}</div>
    ${rows.length ? `
      <div class="divider"></div>
      <div class="section__head" style="margin-bottom:2px">
        <h2>Per kategori · ${App.donutType === 'expense' ? 'pengeluaran' : 'pemasukan'}</h2>
      </div>
      ${Charts.compareRows(rows, {
        symbol: Store.data.settings.currencySymbol,
        hide: Store.data.settings.hideAmounts,
        labelA: 'Sekarang',
        labelB: cmpRange.label === 'Periode sebelumnya' ? 'Sebelumnya' : cmpRange.label,
      })}` : ''}
  </div>`;
}

function compareModeSwitch() {
  const opt = [
    ['prev', 'Periode sebelumnya'],
    ['yoy',  'Tahun lalu'],
    ['none', 'Nonaktif'],
  ];
  return `<div class="segmented">${opt.map(([v, l]) =>
    `<button data-act="compare-mode" data-v="${v}"
      class="${App.compare === v ? 'is-active' : ''}">${l}</button>`).join('')}</div>`;
}

/* ============================================================
   Page — Transactions
   ============================================================ */

function renderTransactions() {
  const list = App.tx();
  const tot = Store.totals(list);

  return `${filterBar()}
    <div class="field" style="margin-top:4px">
      <input class="input" id="search" type="search" placeholder="Cari catatan atau kategori…"
        value="${U.escape(App.filter.search)}" data-act="search">
    </div>
    <div class="card">
      <div class="spread">
        <div><div class="tiny muted">Pemasukan</div>
          <b class="num a-in">${App.money(tot.income)}</b></div>
        <div style="text-align:right"><div class="tiny muted">Pengeluaran</div>
          <b class="num">${App.money(tot.expense)}</b></div>
      </div>
      <div class="divider"></div>
      <div class="spread">
        <span class="tiny muted">${tot.count} transaksi</span>
        <b class="num ${tot.net >= 0 ? 'a-in' : ''}">${App.money(tot.net, { sign: true })}</b>
      </div>
    </div>
    ${txGroups(list)}`;
}

/* ============================================================
   Page — Pockets
   ============================================================ */

function renderPockets() {
  const pockets = Store.activePockets();
  const total = Store.totalBalance();

  const cards = pockets.map(p => {
    const bal = Store.pocketBalance(p.id);
    const isDefault = Store.data.settings.defaultPocketId === p.id;
    const goal = Number(p.target) || 0;
    const pctGoal = goal ? U.clamp((bal / goal) * 100, 0, 100) : 0;

    return `<button class="pocket-card" data-pocket="${p.id}">
      ${iconBubble(p.icon, p.color, 44, 22, 'pocket-card__ico')}
      <span class="pocket-card__mid">
        <span class="pocket-card__nm">${U.escape(p.name)}
          ${isDefault ? '<span class="tag">default</span>' : ''}</span>
        <span class="pocket-card__sub">${POCKET_KIND[p.kind] || 'Lainnya'}</span>
        ${goal ? `<span class="goal-track"><span class="goal-fill"
            style="width:${pctGoal}%;background:${p.color}"></span></span>
          <span class="pocket-card__sub">${pctGoal.toFixed(0)}% dari target ${App.money(goal)}</span>` : ''}
      </span>
      <span class="pocket-card__bal ${bal < 0 ? '' : ''}">${App.money(bal)}</span>
    </button>`;
  }).join('');

  const archived = Store.data.pockets.filter(p => p.archived);

  return `<div class="hero">
      <div class="hero__label">${icon('coins', 14)} Total saldo</div>
      <div class="hero__value">${App.money(total)}</div>
      <div style="padding-bottom:14px" class="tiny muted">
        Saldo dihitung dari saldo awal + seluruh transaksi.</div>
    </div>

    <div class="btn-row" style="margin-top:14px">
      <button class="btn btn--soft" data-act="transfer">${icon('arrow-left-right', 18)}Transfer</button>
      <button class="btn btn--soft" data-act="new-pocket">${icon('plus', 18)}Pocket baru</button>
    </div>

    <div class="section">
      <div class="section__head"><h2>Pocket kamu</h2></div>
      ${cards || emptyState('Belum ada pocket', 'Tambahkan pocket untuk mulai mencatat.', 'wallet')}
    </div>

    ${archived.length ? `<div class="section">
      <div class="section__head"><h2>Diarsipkan</h2></div>
      <div class="rows">${archived.map(p => `
        <button class="row" data-pocket="${p.id}">
          ${iconBubble(p.icon, p.color, 34, 18, 'row__ico')}
          <span class="row__mid"><span class="row__t">${U.escape(p.name)}</span>
            <span class="row__s">${App.money(Store.pocketBalance(p.id))}</span></span>
          <span class="row__r">${icon('chevron-right', 16)}</span>
        </button>`).join('')}</div>
    </div>` : ''}`;
}

const POCKET_KIND = {
  cash: 'Tunai', bank: 'Rekening bank', ewallet: 'E-wallet',
  savings: 'Tabungan', invest: 'Investasi', other: 'Lainnya',
};

/* ============================================================
   Page — Categories
   ============================================================ */

function renderCategories() {
  const build = (type) => {
    const cats = Store.categoriesOf(type);
    return `<div class="section">
      <div class="section__head">
        <h2>${type === 'expense' ? 'Pengeluaran' : 'Pemasukan'}</h2>
        <button class="link" data-act="new-category" data-v="${type}">
          ${icon('plus', 14)}Tambah</button>
      </div>
      <div class="rows">${cats.map(c => `
        <button class="row" data-category="${c.id}">
          ${iconBubble(c.icon, c.color, 34, 18, 'row__ico')}
          <span class="row__mid">
            <span class="row__t">${U.escape(c.name)}</span>
            <span class="row__s">${Store.categoryUsage(c.id)} transaksi</span>
          </span>
          <span class="row__r">${icon('pencil', 15)}</span>
        </button>`).join('') || emptyState('Kosong', 'Belum ada kategori.', 'layers')}
      </div>
    </div>`;
  };

  const archived = Store.data.categories.filter(c => c.archived);

  return `<p class="tiny muted" style="margin:4px 2px 0">
      Ketuk kategori untuk mengubah nama, ikon, dan warnanya. Kategori yang sudah
      dipakai akan diarsipkan (bukan dihapus) agar riwayat tetap utuh.
    </p>
    ${build('expense')}
    ${build('income')}
    ${archived.length ? `<div class="section">
      <div class="section__head"><h2>Diarsipkan</h2></div>
      <div class="rows">${archived.map(c => `
        <button class="row" data-category="${c.id}">
          ${iconBubble(c.icon, c.color, 34, 18, 'row__ico')}
          <span class="row__mid"><span class="row__t">${U.escape(c.name)}</span>
            <span class="row__s">${c.type === 'expense' ? 'Pengeluaran' : 'Pemasukan'} ·
              ${Store.categoryUsage(c.id)} transaksi</span></span>
          <span class="row__r">${icon('archive', 15)}</span>
        </button>`).join('')}</div>
    </div>` : ''}`;
}

/* ============================================================
   Page — More / settings
   ============================================================ */

function renderMore() {
  const s = Store.data.settings;
  const d = Store.data;
  const lastKey = Backup.lastKey();
  const last = lastKey
    ? `${U.fmtDate(lastKey, 'medium')} · ${Backup.daysSince()} hari lalu`
    : 'belum pernah';

  const themeOpts = [['auto', 'Ikuti sistem', 'monitor'], ['light', 'Terang', 'sun'], ['dark', 'Gelap', 'moon']];

  return `
    <div class="section">
      <div class="section__head"><h2>Pengelompokan</h2></div>
      <div class="rows">
        <button class="row" data-nav="categories">
          <span class="bubble row__ico">${icon('layers', 18)}</span>
          <span class="row__mid"><span class="row__t">Kategori</span>
            <span class="row__s">${d.categories.filter(c => !c.archived).length} kategori aktif</span></span>
          <span class="row__r">${icon('chevron-right', 16)}</span>
        </button>
        <button class="row" data-act="edit-quick">
          <span class="bubble row__ico">${icon('star', 18)}</span>
          <span class="row__mid"><span class="row__t">Pintasan catat cepat</span>
            <span class="row__s">${s.quickCategoryIds.length
              ? `${s.quickCategoryIds.length} kategori dipilih` : 'Otomatis dari yang sering dipakai'}</span></span>
          <span class="row__r">${icon('chevron-right', 16)}</span>
        </button>
      </div>
    </div>

    <div class="section">
      <div class="section__head"><h2>Data</h2></div>
      <div class="rows">
        <button class="row" data-act="export">
          <span class="bubble row__ico">${icon('download', 18)}</span>
          <span class="row__mid"><span class="row__t">Export ke satu file</span>
            <span class="row__s">Simpan .json lalu upload ke Google Drive</span></span>
          <span class="row__r">${icon('chevron-right', 16)}</span>
        </button>
        <button class="row" data-act="import">
          <span class="bubble row__ico">${icon('upload', 18)}</span>
          <span class="row__mid"><span class="row__t">Import dari file</span>
            <span class="row__s">Pulihkan atau gabungkan data</span></span>
          <span class="row__r">${icon('chevron-right', 16)}</span>
        </button>
        <div class="row">
          <span class="bubble row__ico">${icon('clock', 18)}</span>
          <span class="row__mid"><span class="row__t">Backup terakhir</span>
            <span class="row__s">${U.escape(last)}</span></span>
        </div>
        <div class="row">
          <span class="bubble row__ico">${icon('shield', 18)}</span>
          <span class="row__mid"><span class="row__t">Ketahanan penyimpanan</span>
            <span class="row__s">${U.escape(PWA.statusLabel())}</span></span>
        </div>
        <div class="row">
          <span class="bubble row__ico">${icon('chart-bar', 18)}</span>
          <span class="row__mid"><span class="row__t">Isi data</span>
            <span class="row__s">${d.transactions.length} transaksi ·
              ${d.pockets.length} pocket · ${d.categories.length} kategori</span></span>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section__head"><h2>Tampilan</h2></div>
      <div class="rows">
        <div class="row">
          <span class="bubble row__ico">${icon('sun', 18)}</span>
          <span class="row__mid"><span class="row__t">Tema</span></span>
        </div>
        <div style="padding:0 14px 14px">
          <div class="segmented">${themeOpts.map(([v, l, ic]) =>
            `<button data-act="set-theme" data-v="${v}"
              class="${s.theme === v ? 'is-active' : ''}">${icon(ic, 15)}${l}</button>`).join('')}</div>
        </div>
        <button class="row" data-act="toggle-hide">
          <span class="bubble row__ico">${icon('eye-off', 18)}</span>
          <span class="row__mid"><span class="row__t">Sembunyikan nominal</span>
            <span class="row__s">Untuk buka aplikasi di tempat ramai</span></span>
          <span class="switch ${s.hideAmounts ? 'is-on' : ''}"></span>
        </button>
        <button class="row" data-act="edit-symbol">
          <span class="bubble row__ico">${icon('banknote', 18)}</span>
          <span class="row__mid"><span class="row__t">Simbol mata uang</span>
            <span class="row__s">Saat ini: ${U.escape(s.currencySymbol)}</span></span>
          <span class="row__r">${icon('chevron-right', 16)}</span>
        </button>
        <button class="row" data-act="edit-profile">
          <span class="bubble row__ico">${icon('users', 18)}</span>
          <span class="row__mid"><span class="row__t">Nama profil</span>
            <span class="row__s">${s.profileName
              ? U.escape(s.profileName) + ' · dipakai menamai berkas backup'
              : 'Belum diisi — berguna kalau berdua pakai aplikasi ini'}</span></span>
          <span class="row__r">${icon('chevron-right', 16)}</span>
        </button>
      </div>
    </div>

    <div class="section">
      <div class="section__head"><h2>Zona berbahaya</h2></div>
      <div class="rows">
        <button class="row" data-act="reset-all">
          <span class="bubble bubble--expense row__ico">${icon('trash', 18)}</span>
          <span class="row__mid"><span class="row__t" style="color:var(--expense)">Hapus semua data</span>
            <span class="row__s">Kembali ke kondisi awal</span></span>
        </button>
      </div>
    </div>

    <p class="tiny muted" style="text-align:center;margin:22px 0 8px">
      AturinDuit · data tersimpan di perangkat ini<br>Export rutin agar aman.
    </p>`;
}
