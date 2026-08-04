/* ============================================================
   Sheets — every modal in the app.
   A small stack lets one sheet open another and step back
   without losing the state underneath.
   ============================================================ */

const Sheet = {
  stack: [],

  get el()    { return document.getElementById('sheet'); },
  get scrim() { return document.getElementById('scrim'); },

  open(config) {
    Sheet.stack.push(config);
    Sheet.paint();
    // If the sheet is dismissed before this frame lands (a fast double tap),
    // the stack is already empty — don't re-open a scrim over nothing.
    requestAnimationFrame(() => {
      if (!Sheet.stack.length) return;
      Sheet.el.classList.add('is-open');
      Sheet.scrim.classList.add('is-open');
    });
  },

  /** Re-render the top sheet in place (state changed underneath). */
  refresh() {
    if (Sheet.stack.length) Sheet.paint();
  },

  paint() {
    const cfg = Sheet.stack[Sheet.stack.length - 1];
    const canBack = Sheet.stack.length > 1;

    Sheet.el.innerHTML = `
      <div class="sheet__grip"></div>
      <div class="sheet__head">
        ${canBack ? `<button class="icon-btn" data-act="sheet-back">${icon('chevron-left', 19)}</button>` : ''}
        <h3>${U.escape(cfg.title)}</h3>
        ${cfg.headAction || ''}
        <button class="icon-btn" data-act="sheet-close">${icon('x', 19)}</button>
      </div>
      <div class="sheet__body">${cfg.body()}</div>
      ${cfg.foot ? `<div class="sheet__foot">${cfg.foot()}</div>` : ''}`;

    if (cfg.onMount) cfg.onMount(Sheet.el);
  },

  back() {
    if (Sheet.stack.length <= 1) return Sheet.close();
    Sheet.stack.pop();
    Sheet.paint();
  },

  close() {
    Sheet.el.classList.remove('is-open');
    Sheet.scrim.classList.remove('is-open');
    Sheet.stack = [];
    setTimeout(() => { if (!Sheet.stack.length) Sheet.el.innerHTML = ''; }, 280);
  },
};

/* ============================================================
   Quick add / edit transaction
   ============================================================ */

const Draft = {
  type: 'expense',
  amount: '',
  categoryId: null,
  pocketId: null,
  toPocketId: null,
  date: U.today(),
  note: '',
  editingId: null,

  reset(patch = {}) {
    const def = Store.defaultPocket();
    Object.assign(Draft, {
      type: 'expense', amount: '', categoryId: null,
      pocketId: def ? def.id : null, toPocketId: null,
      date: U.today(), note: '', editingId: null,
    }, patch);
    if (!Draft.categoryId && Draft.type !== 'transfer') {
      const first = Store.categoriesOf(Draft.type)[0];
      Draft.categoryId = first ? first.id : null;
    }
  },

  value() { return Number(Draft.amount || 0); },
};

function openQuickAdd(patch = {}) {
  Draft.reset(patch);
  Sheet.open({
    title: Draft.editingId ? 'Ubah transaksi' : 'Catat transaksi',
    body: quickAddBody,
    foot: quickAddFoot,
    onMount: bindQuickAdd,
  });
}

function openEditTx(id) {
  const t = Store.data.transactions.find(x => x.id === id);
  if (!t) return;
  Draft.reset({
    type: t.type, amount: String(t.amount || ''), categoryId: t.categoryId,
    pocketId: t.pocketId, toPocketId: t.toPocketId, date: t.date,
    note: t.note || '', editingId: t.id,
  });
  Sheet.open({
    title: 'Ubah transaksi',
    body: quickAddBody,
    foot: quickAddFoot,
    onMount: bindQuickAdd,
  });
}

function quickAddBody() {
  const sym = Store.data.settings.currencySymbol;
  const amountStr = Draft.amount ? Number(Draft.amount).toLocaleString('id-ID') : '0';
  const isTransfer = Draft.type === 'transfer';
  const cats = Store.categoriesOf(Draft.type === 'income' ? 'income' : 'expense');
  const pockets = Store.activePockets();

  const typeSwitch = `<div class="segmented">
    ${[['expense', 'Pengeluaran'], ['income', 'Pemasukan'], ['transfer', 'Transfer']]
      .map(([v, l]) => `<button data-act="draft-type" data-v="${v}" data-kind="${v}"
        class="${Draft.type === v ? 'is-active' : ''}">${l}</button>`).join('')}
  </div>`;

  const amountView = `<div class="amount-view">
    <div class="amount-view__k">${isTransfer ? 'Jumlah transfer'
      : Draft.type === 'income' ? 'Nominal masuk' : 'Nominal keluar'}</div>
    <div class="amount-view__v num ${Draft.amount ? '' : 'is-zero'}">
      <small>${U.escape(sym)}</small>${amountStr}
    </div>
  </div>`;

  const quickAmt = `<div class="quickamt">
    ${[1000, 2000, 5000, 10000, 20000, 50000, 100000, 500000].map(v =>
      `<button data-act="amt-add" data-v="${v}">+${U.compact(v)}</button>`).join('')}
    <button data-act="amt-clear">${icon('x', 13)} Kosongkan</button>
  </div>`;

  const catGrid = isTransfer ? '' : `<div class="field">
    <label class="field__lb">Kategori</label>
    <div class="catgrid">
      ${cats.map(c => `<button class="catcell ${Draft.categoryId === c.id ? 'is-active' : ''}"
        data-act="draft-cat" data-v="${c.id}">
        ${iconBubble(c.icon, c.color, 42, 21, 'catcell__ico')}
        <span class="catcell__lb">${U.escape(c.name)}</span>
      </button>`).join('')}
      <button class="catcell" data-act="new-category" data-v="${Draft.type}">
        <span class="bubble catcell__ico" style="border:1px dashed var(--border)">${icon('plus', 21)}</span>
        <span class="catcell__lb">Baru</span>
      </button>
    </div>
  </div>`;

  const pocketRow = (labelText, key) => `<div class="field">
    <label class="field__lb">${labelText}</label>
    <div class="chip-scroll" style="margin:0;padding:0">
      ${pockets.map(p => `<button class="chip ${Draft[key] === p.id ? 'is-active' : ''}"
        data-act="draft-pocket" data-key="${key}" data-v="${p.id}">
        ${icon(p.icon, 15)}${U.escape(p.name)}
      </button>`).join('')}
    </div>
  </div>`;

  const dateRow = `<div class="field">
    <label class="field__lb">Tanggal</label>
    <div class="inline">
      <button class="chip ${Draft.date === U.today() ? 'is-active' : ''}"
        data-act="draft-date" data-v="today">Hari ini</button>
      <button class="chip ${Draft.date === U.key(U.addDays(new Date(), -1)) ? 'is-active' : ''}"
        data-act="draft-date" data-v="yesterday">Kemarin</button>
      <input class="input" type="date" id="draft-date-input" value="${Draft.date}"
        style="flex:1;min-width:130px">
    </div>
  </div>`;

  return `${typeSwitch}${amountView}${quickAmt}
    <div class="numpad">
      ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n =>
        `<button class="key" data-act="amt-key" data-v="${n}">${n}</button>`).join('')}
      <button class="key key--fn" data-act="amt-key" data-v="000">000</button>
      <button class="key" data-act="amt-key" data-v="0">0</button>
      <button class="key key--fn" data-act="amt-back">${icon('backspace', 20)}</button>
    </div>
    <div class="divider"></div>
    ${catGrid}
    ${isTransfer ? pocketRow('Dari pocket', 'pocketId') + pocketRow('Ke pocket', 'toPocketId')
                 : pocketRow('Pocket', 'pocketId')}
    ${dateRow}
    <div class="field">
      <label class="field__lb">Catatan <span class="muted">(opsional)</span></label>
      <input class="input" id="draft-note" placeholder="mis. makan siang warteg"
        value="${U.escape(Draft.note)}">
    </div>`;
}

function quickAddFoot() {
  const ok = Draft.value() > 0 &&
    (Draft.type !== 'transfer' || (Draft.pocketId && Draft.toPocketId && Draft.pocketId !== Draft.toPocketId));

  return `<div class="btn-row">
    ${Draft.editingId
      ? `<button class="btn btn--danger" style="flex:0 0 56px" data-act="delete-tx"
          data-v="${Draft.editingId}">${icon('trash', 19)}</button>` : ''}
    <button class="btn btn--primary" data-act="save-tx" ${ok ? '' : 'disabled'}>
      ${icon('check', 19)}${Draft.editingId ? 'Simpan perubahan' : 'Simpan'}
    </button>
  </div>`;
}

function bindQuickAdd(root) {
  const dateInput = root.querySelector('#draft-date-input');
  if (dateInput) dateInput.addEventListener('change', (e) => {
    Draft.date = e.target.value || U.today();
    Sheet.refresh();
  });

  const note = root.querySelector('#draft-note');
  if (note) note.addEventListener('input', (e) => { Draft.note = e.target.value; });
}

function saveDraft() {
  const amount = Draft.value();
  if (amount <= 0) return;

  if (Draft.type === 'transfer') {
    if (!Draft.pocketId || !Draft.toPocketId || Draft.pocketId === Draft.toPocketId) {
      toast('Pilih dua pocket yang berbeda', 'alert');
      return;
    }
  }

  const payload = {
    type: Draft.type,
    amount,
    date: Draft.date,
    note: Draft.note.trim(),
    pocketId: Draft.pocketId,
    toPocketId: Draft.type === 'transfer' ? Draft.toPocketId : null,
    categoryId: Draft.type === 'transfer' ? null : Draft.categoryId,
  };

  if (Draft.editingId) {
    Store.updateTx(Draft.editingId, payload);
    toast('Transaksi diperbarui');
  } else {
    Store.addTx(payload);
    toast(`${typeLabel(Draft.type)} ${App.money(amount)} tercatat`);
  }

  Sheet.close();
  render();
}

/* ============================================================
   Transfer shortcut (pre-set to transfer mode)
   ============================================================ */

function openTransfer() {
  const pockets = Store.activePockets();
  openQuickAdd({
    type: 'transfer',
    pocketId: pockets[0] ? pockets[0].id : null,
    toPocketId: pockets[1] ? pockets[1].id : null,
  });
}

/* ============================================================
   Period picker
   ============================================================ */

function openPeriodSheet() {
  Sheet.open({
    title: 'Periode',
    body() {
      const groups = {};
      for (const p of PRESETS) (groups[p.group] ||= []).push(p);

      const sections = Object.entries(groups).map(([g, items]) => `
        <div class="field">
          <label class="field__lb">${g}</label>
          <div class="wrap-gap">
            ${items.map(p => `<button class="chip ${App.filter.preset === p.id ? 'is-active' : ''}"
              data-act="set-preset" data-v="${p.id}">${p.label}</button>`).join('')}
          </div>
        </div>`).join('');

      const custom = App.filter.preset === 'custom' ? `
        <div class="divider"></div>
        <div class="field">
          <label class="field__lb">Dari tanggal</label>
          <input class="input" type="date" id="cust-start" value="${App.filter.custom.start}">
        </div>
        <div class="field">
          <label class="field__lb">Sampai tanggal</label>
          <input class="input" type="date" id="cust-end" value="${App.filter.custom.end}">
        </div>` : '';

      const r = App.range();
      return `${sections}${custom}
        <div class="card" style="background:var(--surface-2);border:none;box-shadow:none">
          <div class="tiny muted">Periode terpilih</div>
          <b>${U.escape(U.fmtRange(r.start, r.end))}</b>
          ${r.start ? `<div class="tiny muted" style="margin-top:2px">
            ${U.daysBetween(r.start, r.end)} hari</div>` : ''}
        </div>`;
    },
    foot: () => `<button class="btn btn--primary btn--block" data-act="sheet-close">Selesai</button>`,
    onMount(root) {
      const s = root.querySelector('#cust-start');
      const e = root.querySelector('#cust-end');
      if (s) s.addEventListener('change', ev => {
        App.filter.custom.start = ev.target.value;
        if (App.filter.custom.end < ev.target.value) App.filter.custom.end = ev.target.value;
        Sheet.refresh(); render();
      });
      if (e) e.addEventListener('change', ev => {
        App.filter.custom.end = ev.target.value;
        if (App.filter.custom.start > ev.target.value) App.filter.custom.start = ev.target.value;
        Sheet.refresh(); render();
      });
    },
  });
}

/* ============================================================
   Category / pocket multi-select filters
   ============================================================ */

/** Everything-in-one filter sheet, reachable from the topbar icon. */
function openFilterSheet() {
  Sheet.open({
    title: 'Filter',
    headAction: App.activeFilterCount()
      ? `<button class="btn btn--sm btn--ghost" data-act="reset-filter">Reset</button>` : '',
    body() {
      const r = App.range();
      const quick = ['today', 'thisWeek', 'thisMonth', 'lastMonth', 'last30', 'thisYear'];
      const types = [['', 'Semua'], ['expense', 'Pengeluaran'], ['income', 'Pemasukan'], ['transfer', 'Transfer']];
      const cur = App.filter.types[0] || '';

      return `
        <div class="field">
          <label class="field__lb">Periode</label>
          <div class="wrap-gap" style="margin-bottom:10px">
            ${quick.map(id => `<button class="chip ${App.filter.preset === id ? 'is-active' : ''}"
              data-act="set-preset" data-v="${id}">${presetLabel(id)}</button>`).join('')}
          </div>
          <button class="btn btn--soft btn--sm btn--block" data-act="open-period">
            ${icon('calendar', 16)}Semua pilihan periode &amp; rentang kustom</button>
          <p class="tiny muted" style="margin:8px 2px 0">
            Terpilih: <b>${U.escape(U.fmtRange(r.start, r.end))}</b></p>
        </div>

        <div class="field">
          <label class="field__lb">Jenis transaksi</label>
          <div class="segmented">
            ${types.map(([val, l]) => `<button data-act="set-type" data-v="${val}"
              class="${cur === val ? 'is-active' : ''}">${l}</button>`).join('')}
          </div>
        </div>

        <div class="field">
          <label class="field__lb">Pengelompokan</label>
          <div class="rows">
            <button class="row" data-act="open-cat-filter">
              <span class="bubble row__ico">${icon('layers', 18)}</span>
              <span class="row__mid"><span class="row__t">Kategori</span>
                <span class="row__s">${App.filter.categoryIds.length
                  ? `${App.filter.categoryIds.length} dipilih` : 'Semua kategori'}</span></span>
              <span class="row__r">${icon('chevron-right', 16)}</span>
            </button>
            <button class="row" data-act="open-pocket-filter">
              <span class="bubble row__ico">${icon('wallet', 18)}</span>
              <span class="row__mid"><span class="row__t">Pocket</span>
                <span class="row__s">${App.filter.pocketIds.length
                  ? `${App.filter.pocketIds.length} dipilih` : 'Semua pocket'}</span></span>
              <span class="row__r">${icon('chevron-right', 16)}</span>
            </button>
          </div>
        </div>`;
    },
    foot: () => `<button class="btn btn--primary btn--block" data-act="sheet-close">Selesai</button>`,
  });
}

function openCategoryFilter() {
  Sheet.open({
    title: 'Filter kategori',
    headAction: `<button class="btn btn--sm btn--ghost" data-act="clear-cat-filter">Bersihkan</button>`,
    body() {
      const block = (type, label) => {
        const cats = Store.categoriesOf(type);
        if (!cats.length) return '';
        return `<div class="field">
          <label class="field__lb">${label}</label>
          <div class="catgrid">
            ${cats.map(c => `<button class="catcell ${App.filter.categoryIds.includes(c.id) ? 'is-active' : ''}"
              data-act="toggle-cat-filter" data-v="${c.id}">
              ${iconBubble(c.icon, c.color, 42, 21, 'catcell__ico')}
              <span class="catcell__lb">${U.escape(c.name)}</span>
            </button>`).join('')}
          </div>
        </div>`;
      };
      return `<p class="tiny muted" style="margin-top:0">
          Grafik, ringkasan, dan daftar transaksi akan mengikuti pilihan ini.</p>
        ${block('expense', 'Pengeluaran')}${block('income', 'Pemasukan')}`;
    },
    foot: () => `<button class="btn btn--primary btn--block" data-act="sheet-close">
      Terapkan${App.filter.categoryIds.length ? ` (${App.filter.categoryIds.length})` : ''}</button>`,
  });
}

function openPocketFilter() {
  Sheet.open({
    title: 'Filter pocket',
    headAction: `<button class="btn btn--sm btn--ghost" data-act="clear-pocket-filter">Bersihkan</button>`,
    body() {
      return `<p class="tiny muted" style="margin-top:0">
          Pilih satu atau beberapa pocket untuk mempersempit laporan.</p>
        <div class="rows">
          ${Store.activePockets().map(p => {
            const on = App.filter.pocketIds.includes(p.id);
            return `<button class="row" data-act="toggle-pocket-filter" data-v="${p.id}">
              ${iconBubble(p.icon, p.color, 34, 18, 'row__ico')}
              <span class="row__mid"><span class="row__t">${U.escape(p.name)}</span>
                <span class="row__s">${App.money(Store.pocketBalance(p.id))}</span></span>
              <span class="row__r">${on ? `<span style="color:var(--accent)">${icon('check', 18)}</span>`
                : `<span style="opacity:.3">${icon('plus', 18)}</span>`}</span>
            </button>`;
          }).join('')}
        </div>`;
    },
    foot: () => `<button class="btn btn--primary btn--block" data-act="sheet-close">
      Terapkan${App.filter.pocketIds.length ? ` (${App.filter.pocketIds.length})` : ''}</button>`,
  });
}

/* ============================================================
   Category editor
   ============================================================ */

const CatDraft = { id: null, name: '', icon: 'more-horizontal', color: PALETTE[0], type: 'expense', iconQuery: '' };

function openCategoryEditor(id, type) {
  if (id) {
    const c = Store.category(id);
    if (!c) return;
    Object.assign(CatDraft, { id: c.id, name: c.name, icon: c.icon, color: c.color, type: c.type, iconQuery: '' });
  } else {
    Object.assign(CatDraft, {
      id: null, name: '', icon: type === 'income' ? 'banknote' : 'more-horizontal',
      color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
      type: type || 'expense', iconQuery: '',
    });
  }

  Sheet.open({
    title: CatDraft.id ? 'Ubah kategori' : 'Kategori baru',
    body: catEditorBody,
    foot: catEditorFoot,
    onMount(root) {
      const nm = root.querySelector('#cat-name');
      if (nm) {
        nm.addEventListener('input', e => {
          CatDraft.name = e.target.value;
          const prev = root.querySelector('#cat-preview-name');
          if (prev) prev.textContent = CatDraft.name || 'Nama kategori';
          const btn = root.querySelector('[data-act="save-category"]');
          if (btn) btn.disabled = !CatDraft.name.trim();
        });
        if (!CatDraft.id) setTimeout(() => nm.focus(), 260);
      }
      const q = root.querySelector('#icon-search');
      if (q) q.addEventListener('input', e => {
        CatDraft.iconQuery = e.target.value.toLowerCase();
        paintIconGrid(root);
      });
    },
  });
}

function catEditorBody() {
  const archived = CatDraft.id ? (Store.category(CatDraft.id) || {}).archived : false;
  const used = CatDraft.id ? Store.categoryUsage(CatDraft.id) : 0;

  return `
    <div class="inline" style="margin-bottom:16px">
      ${iconBubble(CatDraft.icon, CatDraft.color, 52, 26)}
      <div>
        <div style="font-weight:620" id="cat-preview-name">${U.escape(CatDraft.name || 'Nama kategori')}</div>
        <div class="tiny muted">${CatDraft.type === 'expense' ? 'Pengeluaran' : 'Pemasukan'}
          ${used ? ` · ${used} transaksi` : ''}${archived ? ' · diarsipkan' : ''}</div>
      </div>
    </div>

    <div class="field">
      <label class="field__lb">Nama</label>
      <input class="input" id="cat-name" value="${U.escape(CatDraft.name)}"
        placeholder="mis. Nongkrong, Servis Motor, Bonus Proyek" maxlength="32">
    </div>

    ${CatDraft.id ? '' : `<div class="field">
      <label class="field__lb">Jenis</label>
      <div class="segmented">
        ${[['expense', 'Pengeluaran'], ['income', 'Pemasukan']].map(([v, l]) =>
          `<button data-act="cat-type" data-v="${v}" data-kind="${v}"
            class="${CatDraft.type === v ? 'is-active' : ''}">${l}</button>`).join('')}
      </div>
    </div>`}

    <div class="field">
      <label class="field__lb">Warna</label>
      <div class="swatches">
        ${PALETTE.map(c => `<button class="swatch ${CatDraft.color === c ? 'is-active' : ''}"
          style="background:${c}" data-act="cat-color" data-v="${c}"></button>`).join('')}
      </div>
    </div>

    <div class="field">
      <label class="field__lb">Ikon</label>
      <input class="input" id="icon-search" placeholder="Cari ikon — mis. kopi, bensin, gaji…"
        value="${U.escape(CatDraft.iconQuery)}" style="margin-bottom:10px">
      <div id="icon-grid">${iconGridHtml()}</div>
    </div>`;
}

function iconGridHtml() {
  const q = CatDraft.iconQuery.trim();
  const matches = (n, groupLabel) => !q ||
    n.includes(q) ||
    (ICON_LABELS[n] || '').includes(q) ||
    groupLabel.toLowerCase().includes(q);

  return ICON_GROUPS.map(g => {
    const names = g.names.filter(n => matches(n, g.label));
    if (!names.length) return '';
    return `<div style="margin-bottom:12px">
      <div class="tiny muted" style="margin-bottom:6px">${g.label}</div>
      <div class="icongrid">
        ${names.map(n => `<button class="iconcell ${CatDraft.icon === n ? 'is-active' : ''}"
          data-act="cat-icon" data-v="${n}" title="${U.escape(iconLabel(n))}"
          aria-label="${U.escape(iconLabel(n))}">${icon(n, 21)}</button>`).join('')}
      </div>
    </div>`;
  }).join('') || `<p class="tiny muted">Ikon tidak ditemukan. Coba kata lain, mis. "bensin" atau "gaji".</p>`;
}

function paintIconGrid(root) {
  const g = root.querySelector('#icon-grid');
  if (g) g.innerHTML = iconGridHtml();
}

function catEditorFoot() {
  const exists = !!CatDraft.id;
  const cat = exists ? Store.category(CatDraft.id) : null;
  return `<div class="btn-row">
    ${exists ? `<button class="btn btn--danger" style="flex:0 0 56px"
        data-act="delete-category" data-v="${CatDraft.id}">${icon('trash', 19)}</button>` : ''}
    ${exists && cat && cat.archived ? `<button class="btn btn--soft" data-act="unarchive-category"
        data-v="${CatDraft.id}">Aktifkan</button>` : ''}
    <button class="btn btn--primary" data-act="save-category"
      ${CatDraft.name.trim() ? '' : 'disabled'}>${icon('check', 19)}Simpan</button>
  </div>`;
}

function saveCategory() {
  const name = CatDraft.name.trim();
  if (!name) return;
  if (CatDraft.id) {
    Store.updateCategory(CatDraft.id, { name, icon: CatDraft.icon, color: CatDraft.color });
    toast('Kategori diperbarui');
  } else {
    const c = Store.addCategory({
      name, icon: CatDraft.icon, color: CatDraft.color, type: CatDraft.type,
    });
    // if we came from the quick-add sheet, select the fresh category right away
    if (Sheet.stack.length > 1 && Draft.type === c.type) Draft.categoryId = c.id;
    toast('Kategori ditambahkan');
  }
  Sheet.back();
  Sheet.refresh();
  render();
}

/* ============================================================
   Pocket editor
   ============================================================ */

const PocketDraft = { id: null, name: '', icon: 'wallet', color: PALETTE[6], kind: 'cash', initial: '', target: '' };

function openPocketEditor(id) {
  if (id) {
    const p = Store.pocket(id);
    if (!p) return;
    Object.assign(PocketDraft, {
      id: p.id, name: p.name, icon: p.icon, color: p.color, kind: p.kind,
      initial: String(p.initial || ''), target: String(p.target || ''),
    });
  } else {
    Object.assign(PocketDraft, {
      id: null, name: '', icon: 'wallet',
      color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
      kind: 'cash', initial: '', target: '',
    });
  }

  Sheet.open({
    title: PocketDraft.id ? 'Ubah pocket' : 'Pocket baru',
    body: pocketEditorBody,
    foot: pocketEditorFoot,
    onMount(root) {
      const bind = (sel, key, num) => {
        const el = root.querySelector(sel);
        if (!el) return;
        el.addEventListener('input', e => {
          PocketDraft[key] = num ? e.target.value.replace(/[^\d-]/g, '') : e.target.value;
          if (key === 'name') {
            const prev = root.querySelector('#pocket-preview-name');
            if (prev) prev.textContent = PocketDraft.name || 'Nama pocket';
            const btn = root.querySelector('[data-act="save-pocket"]');
            if (btn) btn.disabled = !PocketDraft.name.trim();
          }
        });
      };
      bind('#pk-name', 'name');
      bind('#pk-initial', 'initial', true);
      bind('#pk-target', 'target', true);
      const nm = root.querySelector('#pk-name');
      if (nm && !PocketDraft.id) setTimeout(() => nm.focus(), 260);
    },
  });
}

function pocketEditorBody() {
  const isDefault = PocketDraft.id && Store.data.settings.defaultPocketId === PocketDraft.id;
  const bal = PocketDraft.id ? Store.pocketBalance(PocketDraft.id) : 0;

  return `
    <div class="inline" style="margin-bottom:16px">
      ${iconBubble(PocketDraft.icon, PocketDraft.color, 52, 26)}
      <div>
        <div style="font-weight:620" id="pocket-preview-name">${U.escape(PocketDraft.name || 'Nama pocket')}</div>
        <div class="tiny muted">${PocketDraft.id ? `Saldo saat ini ${App.money(bal)}` : 'Pocket baru'}</div>
      </div>
    </div>

    <div class="field">
      <label class="field__lb">Nama</label>
      <input class="input" id="pk-name" value="${U.escape(PocketDraft.name)}"
        placeholder="mis. BCA, GoPay, Dana Darurat" maxlength="28">
    </div>

    <div class="field">
      <label class="field__lb">Jenis</label>
      <select class="select" data-act="pk-kind">
        ${Object.entries(POCKET_KIND).map(([v, l]) =>
          `<option value="${v}" ${PocketDraft.kind === v ? 'selected' : ''}>${l}</option>`).join('')}
      </select>
    </div>

    <div class="field">
      <label class="field__lb">Saldo awal</label>
      <input class="input num" id="pk-initial" inputmode="numeric" value="${U.escape(PocketDraft.initial)}"
        placeholder="0">
      <p class="tiny muted" style="margin:6px 2px 0">
        Isi dengan saldo yang sudah ada sekarang, sebelum kamu mulai mencatat.</p>
    </div>

    <div class="field">
      <label class="field__lb">Target tabungan <span class="muted">(opsional)</span></label>
      <input class="input num" id="pk-target" inputmode="numeric" value="${U.escape(PocketDraft.target)}"
        placeholder="0">
    </div>

    <div class="field">
      <label class="field__lb">Warna</label>
      <div class="swatches">
        ${PALETTE.map(c => `<button class="swatch ${PocketDraft.color === c ? 'is-active' : ''}"
          style="background:${c}" data-act="pk-color" data-v="${c}"></button>`).join('')}
      </div>
    </div>

    <div class="field">
      <label class="field__lb">Ikon</label>
      <div class="icongrid">
        ${POCKET_ICONS.map(n => `<button class="iconcell ${PocketDraft.icon === n ? 'is-active' : ''}"
          data-act="pk-icon" data-v="${n}" title="${U.escape(iconLabel(n))}"
          aria-label="${U.escape(iconLabel(n))}">${icon(n, 21)}</button>`).join('')}
      </div>
    </div>

    ${PocketDraft.id && !isDefault ? `
      <button class="btn btn--soft btn--block" data-act="make-default" data-v="${PocketDraft.id}">
        ${icon('star', 18)}Jadikan pocket default</button>` : ''}
    ${isDefault ? `<p class="tiny muted" style="text-align:center">
      ${icon('star', 13)} Ini pocket default untuk transaksi baru.</p>` : ''}`;
}

function pocketEditorFoot() {
  const p = PocketDraft.id ? Store.pocket(PocketDraft.id) : null;
  return `<div class="btn-row">
    ${PocketDraft.id ? `<button class="btn btn--danger" style="flex:0 0 56px"
      data-act="delete-pocket" data-v="${PocketDraft.id}">${icon('trash', 19)}</button>` : ''}
    ${p && p.archived ? `<button class="btn btn--soft" data-act="unarchive-pocket"
      data-v="${PocketDraft.id}">Aktifkan</button>` : ''}
    <button class="btn btn--primary" data-act="save-pocket"
      ${PocketDraft.name.trim() ? '' : 'disabled'}>${icon('check', 19)}Simpan</button>
  </div>`;
}

function savePocket() {
  const name = PocketDraft.name.trim();
  if (!name) return;
  const payload = {
    name, icon: PocketDraft.icon, color: PocketDraft.color, kind: PocketDraft.kind,
    initial: Number(PocketDraft.initial || 0),
    target: Number(PocketDraft.target || 0),
  };
  if (PocketDraft.id) {
    Store.updatePocket(PocketDraft.id, payload);
    toast('Pocket diperbarui');
  } else {
    Store.addPocket(payload);
    toast('Pocket ditambahkan');
  }
  Sheet.close();
  render();
}

/* ============================================================
   Quick-shortcut picker
   ============================================================ */

function openQuickPicker() {
  Sheet.open({
    title: 'Pintasan catat cepat',
    headAction: `<button class="btn btn--sm btn--ghost" data-act="clear-quick">Otomatis</button>`,
    body() {
      const sel = Store.data.settings.quickCategoryIds;
      const block = (type, label) => `<div class="field">
        <label class="field__lb">${label}</label>
        <div class="catgrid">
          ${Store.categoriesOf(type).map(c => `
            <button class="catcell ${sel.includes(c.id) ? 'is-active' : ''}"
              data-act="toggle-quick" data-v="${c.id}">
              ${iconBubble(c.icon, c.color, 42, 21, 'catcell__ico')}
              <span class="catcell__lb">${U.escape(c.name)}</span>
            </button>`).join('')}
        </div></div>`;
      return `<p class="tiny muted" style="margin-top:0">
          Pilih sampai 7 kategori yang muncul di beranda. Kosongkan untuk membiarkan
          aplikasi memilih otomatis dari yang paling sering kamu pakai.
          <b>${sel.length}/7 dipilih.</b></p>
        ${block('expense', 'Pengeluaran')}${block('income', 'Pemasukan')}`;
    },
    foot: () => `<button class="btn btn--primary btn--block" data-act="sheet-close">Selesai</button>`,
  });
}

/* ============================================================
   Data: export / import
   ============================================================ */

function doExport() {
  const text = Store.exportText();
  const blob = new Blob([text], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = Store.exportName();
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);

  // A local date key, matching how every other date in the app is stored.
  Store.setSetting('lastBackupAt', U.today());
  toast('File backup diunduh');
  render();
}

function openImportSheet() {
  let picked = null;   // { name, text }
  let mode = 'replace';

  Sheet.open({
    title: 'Import data',
    body() {
      return `<p class="tiny muted" style="margin-top:0">
          Pilih file backup <b>.json</b> hasil export — misalnya yang kamu unduh dari Google Drive.</p>

        <button class="btn btn--soft btn--block" data-act="pick-file" style="margin-bottom:14px">
          ${icon('folder', 18)}${picked ? 'Ganti file' : 'Pilih file backup'}</button>
        <input type="file" id="import-file" accept="application/json,.json" class="hidden">

        ${picked ? `<div class="card" style="background:var(--surface-2);border:none;box-shadow:none;margin-bottom:14px">
          <div class="inline">${icon('save', 18)}
            <div><b class="tiny">${U.escape(picked.name)}</b>
            <div class="tiny muted">${picked.summary}</div></div>
          </div>
          ${picked.owner ? `<div class="tiny" style="margin-top:8px;color:${
            picked.owner.toLowerCase() === (Store.data.settings.profileName || '').toLowerCase()
              ? 'var(--text-2)' : 'var(--warn)'}">
            ${icon('info', 13)} Berkas ini milik profil <b>${U.escape(picked.owner)}</b>.</div>` : ''}
        </div>` : ''}

        <div class="field">
          <label class="field__lb">Cara menggabungkan</label>
          <div class="segmented">
            <button data-act="import-mode" data-v="replace"
              class="${mode === 'replace' ? 'is-active' : ''}">Ganti total</button>
            <button data-act="import-mode" data-v="merge"
              class="${mode === 'merge' ? 'is-active' : ''}">Gabungkan</button>
          </div>
          <p class="tiny muted" style="margin:8px 2px 0">
            ${mode === 'replace'
              ? 'Semua data di perangkat ini akan diganti isi file. Cocok saat pindah HP atau memulihkan backup.'
              : 'Data yang sudah ada dipertahankan; transaksi, kategori, dan pocket baru dari file akan ditambahkan.'}
          </p>
        </div>`;
    },
    foot: () => `<button class="btn btn--primary btn--block" data-act="do-import"
      ${picked ? '' : 'disabled'}>${icon('upload', 18)}Import sekarang</button>`,
    onMount(root) {
      root.querySelector('#import-file').addEventListener('change', async (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        try {
          const text = await file.text();
          const probe = JSON.parse(text);
          const owner = (probe.profile || (probe.settings || {}).profileName || '').trim();
          picked = {
            name: file.name,
            text,
            owner,
            summary: `${(probe.transactions || []).length} transaksi · ` +
                     `${(probe.pockets || []).length} pocket · ` +
                     `${(probe.categories || []).length} kategori`,
          };
          Sheet.refresh();
        } catch (err) {
          toast('File tidak bisa dibaca', 'alert');
        }
      });
    },
    /* exposed so the delegated handler can reach them */
    api: {
      setMode(v) { mode = v; Sheet.refresh(); },
      run() {
        if (!picked) return;
        try {
          const res = Store.importText(picked.text, mode);
          Sheet.close();
          App.filter.categoryIds = [];
          App.filter.pocketIds = [];
          render();
          toast(res.mode === 'replace'
            ? `Data dipulihkan · ${res.transactions} transaksi`
            : `Digabungkan · +${res.transactions} transaksi`);
        } catch (err) {
          toast(err.message || 'Import gagal', 'alert');
        }
      },
    },
  });
}

/* ============================================================
   Small prompts
   ============================================================ */

/** One small sheet for any single-line text setting. */
function openTextSheet({ title, label, hint, value, placeholder = '', maxLength = 40, onSave }) {
  let val = value;
  Sheet.open({
    title,
    body: () => `<div class="field">
        <label class="field__lb">${label}</label>
        <input class="input" id="text-value" value="${U.escape(val)}"
          maxlength="${maxLength}" placeholder="${U.escape(placeholder)}">
      </div>
      <p class="tiny muted">${hint}</p>`,
    foot: () => `<button class="btn btn--primary btn--block" data-act="save-text">Simpan</button>`,
    onMount(root) {
      const el = root.querySelector('#text-value');
      el.addEventListener('input', (e) => { val = e.target.value; });
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); onSave(val); }
      });
      setTimeout(() => el.focus(), 250);
    },
    api: { save: () => onSave(val) },
  });
}

function openSymbolSheet() {
  openTextSheet({
    title: 'Simbol mata uang',
    label: 'Simbol',
    value: Store.data.settings.currencySymbol,
    placeholder: 'Rp',
    maxLength: 5,
    hint: 'Ditampilkan di depan setiap nominal, mis. <b>Rp 25.000</b>.',
    onSave(v) {
      Store.setSetting('currencySymbol', v.trim() || 'Rp');
      Sheet.close();
      render();
      toast('Simbol diperbarui');
    },
  });
}

function openProfileSheet() {
  openTextSheet({
    title: 'Nama profil',
    label: 'Nama',
    value: Store.data.settings.profileName,
    placeholder: 'mis. Bagas',
    maxLength: 24,
    hint: 'Dipakai untuk menamai berkas backup, mis. <b>aturinduit-bagas-2026-07-28.json</b>. ' +
          'Berguna kalau ada dua orang memakai aplikasi ini, supaya berkas kalian tidak tertukar ' +
          'saat di-import. Tidak memengaruhi datamu sama sekali.',
    onSave(v) {
      Store.setSetting('profileName', v.trim());
      Sheet.close();
      render();
      toast('Nama profil disimpan');
    },
  });
}

function openConfirm({ title, message, confirmLabel = 'Ya, lanjutkan', danger = true, onConfirm }) {
  Sheet.open({
    title,
    body: () => `<p style="margin:4px 0 8px">${message}</p>`,
    foot: () => `<div class="btn-row">
      <button class="btn btn--ghost" data-act="sheet-close">Batal</button>
      <button class="btn ${danger ? 'btn--danger' : 'btn--primary'}" data-act="confirm-yes">
        ${U.escape(confirmLabel)}</button>
    </div>`,
    onConfirm,
  });
}
