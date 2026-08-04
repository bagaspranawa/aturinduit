/* ============================================================
   Main — one delegated listener drives the whole app.
   ============================================================ */

/* ---------- helpers ---------- */

function closest(el, sel) { return el && el.closest ? el.closest(sel) : null; }

function setChartNote(id, text) {
  App.chartNote = text;
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

/* ---------- click routing ---------- */

document.addEventListener('click', (ev) => {
  const t = ev.target;

  /* --- navigation --- */
  const nav = closest(t, '[data-nav]');
  if (nav) { go(nav.dataset.nav); return; }

  /* --- entity taps --- */
  const txBtn = closest(t, '[data-tx]');
  if (txBtn) { openEditTx(txBtn.dataset.tx); return; }

  const pocketBtn = closest(t, '[data-pocket]');
  if (pocketBtn) { openPocketEditor(pocketBtn.dataset.pocket); return; }

  const catBtn = closest(t, '[data-category]');
  if (catBtn) { openCategoryEditor(catBtn.dataset.category); return; }

  const quickBtn = closest(t, '[data-quick]');
  if (quickBtn) {
    const c = Store.category(quickBtn.dataset.quick);
    if (c) openQuickAdd({ type: c.type, categoryId: c.id });
    return;
  }

  /* --- drill into a category from any chart --- */
  const jump = closest(t, '[data-cat-jump]');
  if (jump) {
    const id = jump.dataset.catJump;
    App.filter.categoryIds = App.filter.categoryIds.includes(id) ? [] : [id];
    go('transactions');
    return;
  }

  /* --- chart read-outs --- */
  const bucket = closest(t, '[data-bucket]');
  if (bucket) {
    const b = (App._buckets || [])[+bucket.dataset.bucket];
    if (b) setChartNote('note-trend',
      `${U.fmtRange(b.start, b.end)} · masuk ${App.money(b.values.income)} · keluar ${App.money(b.values.expense)}`);
    return;
  }

  const point = closest(t, '[data-point]');
  if (point) {
    const p = (App._cum || [])[+point.dataset.point];
    if (p) setChartNote('note-area', `${p.label} · akumulasi ${App.money(p.value, { sign: true })}`);
    return;
  }

  const slice = closest(t, '[data-slice]');
  if (slice) {
    const item = (App._donut || [])[+slice.dataset.slice];
    if (item && item.id !== '_rest') {
      App.filter.categoryIds = [item.id];
      go('transactions');
    }
    return;
  }

  /* --- actions --- */
  const btn = closest(t, '[data-act]');
  if (!btn) return;
  const act = btn.dataset.act;
  const v = btn.dataset.v;

  switch (act) {

    /* ---- sheet plumbing ---- */
    case 'sheet-close': Sheet.close(); break;
    case 'sheet-back':  Sheet.back(); break;
    case 'confirm-yes': {
      const cfg = Sheet.stack[Sheet.stack.length - 1];
      Sheet.close();
      if (cfg && cfg.onConfirm) cfg.onConfirm();
      break;
    }

    /* ---- transaction draft ---- */
    case 'quick-add': openQuickAdd(); break;
    case 'transfer':  openTransfer(); break;

    case 'draft-type':
      Draft.type = v;
      if (v === 'transfer') {
        const ps = Store.activePockets();
        if (!Draft.toPocketId || Draft.toPocketId === Draft.pocketId)
          Draft.toPocketId = (ps.find(p => p.id !== Draft.pocketId) || {}).id || null;
      } else {
        const cats = Store.categoriesOf(v);
        if (!cats.some(c => c.id === Draft.categoryId))
          Draft.categoryId = cats[0] ? cats[0].id : null;
      }
      Sheet.refresh();
      break;

    case 'draft-cat':    Draft.categoryId = v; Sheet.refresh(); break;
    case 'draft-pocket': Draft[btn.dataset.key] = v; Sheet.refresh(); break;
    case 'draft-date':
      Draft.date = v === 'today' ? U.today() : U.key(U.addDays(new Date(), -1));
      Sheet.refresh();
      break;

    case 'amt-key':
      if (Draft.amount.length < 13) {
        Draft.amount = (Draft.amount === '' && v === '000') ? '' : (Draft.amount + v);
        Draft.amount = Draft.amount.replace(/^0+(?=\d)/, '');
      }
      Sheet.refresh();
      break;
    case 'amt-back':  Draft.amount = Draft.amount.slice(0, -1); Sheet.refresh(); break;
    case 'amt-clear': Draft.amount = ''; Sheet.refresh(); break;
    case 'amt-add':
      Draft.amount = String(Draft.value() + Number(v));
      Sheet.refresh();
      break;

    case 'save-tx': saveDraft(); break;
    case 'delete-tx':
      openConfirm({
        title: 'Hapus transaksi?',
        message: 'Transaksi ini akan dihapus permanen dan saldo pocket akan menyesuaikan.',
        confirmLabel: 'Hapus',
        onConfirm() { Store.deleteTx(v); toast('Transaksi dihapus'); render(); },
      });
      break;

    /* ---- filters ---- */
    case 'open-filter':        openFilterSheet(); break;
    case 'open-period':        openPeriodSheet(); break;
    case 'open-cat-filter':    openCategoryFilter(); break;
    case 'open-pocket-filter': openPocketFilter(); break;
    case 'reset-filter':       App.resetFilters(); break;

    case 'set-preset':
      App.filter.preset = v;
      Sheet.refresh();
      render();
      break;

    case 'toggle-cat-filter': {
      const set = new Set(App.filter.categoryIds);
      set.has(v) ? set.delete(v) : set.add(v);
      App.filter.categoryIds = [...set];
      Sheet.refresh();
      render();
      break;
    }
    case 'clear-cat-filter': App.filter.categoryIds = []; Sheet.refresh(); render(); break;

    case 'toggle-pocket-filter': {
      const set = new Set(App.filter.pocketIds);
      set.has(v) ? set.delete(v) : set.add(v);
      App.filter.pocketIds = [...set];
      Sheet.refresh();
      render();
      break;
    }
    case 'clear-pocket-filter': App.filter.pocketIds = []; Sheet.refresh(); render(); break;

    case 'cycle-type': {
      const order = [[], ['expense'], ['income'], ['transfer']];
      const cur = JSON.stringify(App.filter.types);
      const i = order.findIndex(o => JSON.stringify(o) === cur);
      App.filter.types = order[(i + 1) % order.length];
      Sheet.refresh();
      render();
      break;
    }
    case 'set-type': App.filter.types = v ? [v] : []; Sheet.refresh(); render(); break;

    /* ---- dashboard toggles ---- */
    case 'donut-type':   App.donutType = v; render(); break;
    case 'compare-mode': App.compare = v; render(); break;

    /* ---- quick shortcuts ---- */
    case 'edit-quick': openQuickPicker(); break;
    case 'toggle-quick': {
      const list = Store.data.settings.quickCategoryIds.slice();
      const i = list.indexOf(v);
      if (i >= 0) list.splice(i, 1);
      else if (list.length >= 7) { toast('Maksimal 7 pintasan', 'info'); break; }
      else list.push(v);
      Store.setSetting('quickCategoryIds', list);
      Sheet.refresh();
      render();
      break;
    }
    case 'clear-quick':
      Store.setSetting('quickCategoryIds', []);
      Sheet.refresh();
      render();
      toast('Pintasan kembali otomatis');
      break;

    /* ---- categories ---- */
    case 'new-category':  openCategoryEditor(null, v); break;
    case 'cat-type':      CatDraft.type = v; Sheet.refresh(); break;
    case 'cat-color':     CatDraft.color = v; Sheet.refresh(); break;
    case 'cat-icon':      CatDraft.icon = v; Sheet.refresh(); break;
    case 'save-category': saveCategory(); break;
    case 'unarchive-category':
      Store.updateCategory(v, { archived: false });
      Sheet.close(); render(); toast('Kategori diaktifkan');
      break;
    case 'delete-category': {
      const used = Store.categoryUsage(v);
      openConfirm({
        title: used ? 'Arsipkan kategori?' : 'Hapus kategori?',
        message: used
          ? `Kategori ini dipakai ${used} transaksi, jadi akan diarsipkan agar riwayat tetap utuh. Ia tidak akan muncul lagi saat mencatat.`
          : 'Kategori ini belum dipakai dan akan dihapus permanen.',
        confirmLabel: used ? 'Arsipkan' : 'Hapus',
        onConfirm() {
          const r = Store.removeCategory(v);
          toast(r.archived ? 'Kategori diarsipkan' : 'Kategori dihapus');
          render();
        },
      });
      break;
    }

    /* ---- pockets ---- */
    case 'new-pocket': openPocketEditor(null); break;
    case 'pk-color':   PocketDraft.color = v; Sheet.refresh(); break;
    case 'pk-icon':    PocketDraft.icon = v; Sheet.refresh(); break;
    case 'save-pocket': savePocket(); break;
    case 'make-default':
      Store.setSetting('defaultPocketId', v);
      Sheet.refresh(); render(); toast('Pocket default diperbarui');
      break;
    case 'unarchive-pocket':
      Store.updatePocket(v, { archived: false });
      Sheet.close(); render(); toast('Pocket diaktifkan');
      break;
    case 'delete-pocket': {
      const used = Store.pocketUsage(v);
      openConfirm({
        title: used ? 'Arsipkan pocket?' : 'Hapus pocket?',
        message: used
          ? `Pocket ini terpakai di ${used} transaksi, jadi akan diarsipkan. Saldonya tidak lagi ikut dihitung di total.`
          : 'Pocket ini belum dipakai dan akan dihapus permanen.',
        confirmLabel: used ? 'Arsipkan' : 'Hapus',
        onConfirm() {
          const r = Store.removePocket(v);
          if (r.error) { toast(r.error, 'alert'); return; }
          Sheet.close();
          toast(r.archived ? 'Pocket diarsipkan' : 'Pocket dihapus');
          render();
        },
      });
      break;
    }

    /* ---- data ---- */
    case 'export': doExport(); break;
    case 'import': openImportSheet(); break;
    case 'pick-file': {
      const input = document.getElementById('import-file');
      if (input) input.click();
      break;
    }
    case 'import-mode': {
      const cfg = Sheet.stack[Sheet.stack.length - 1];
      if (cfg && cfg.api) cfg.api.setMode(v);
      break;
    }
    case 'do-import': {
      const cfg = Sheet.stack[Sheet.stack.length - 1];
      if (cfg && cfg.api) cfg.api.run();
      break;
    }

    /* ---- appearance ---- */
    case 'set-theme':
      Store.setSetting('theme', v);
      render();
      break;
    case 'toggle-hide':
      Store.setSetting('hideAmounts', !Store.data.settings.hideAmounts);
      render();
      break;
    case 'edit-symbol':  openSymbolSheet(); break;
    case 'edit-profile': openProfileSheet(); break;
    case 'save-text': {
      const cfg = Sheet.stack[Sheet.stack.length - 1];
      if (cfg && cfg.api) cfg.api.save();
      break;
    }

    /* ---- backup reminder ---- */
    case 'dismiss-nag':
      Backup.dismissed = true;
      render();
      break;

    /* ---- danger ---- */
    case 'reset-all':
      openConfirm({
        title: 'Hapus semua data?',
        message: 'Seluruh transaksi, pocket, dan kategori kustom akan hilang dari perangkat ini. ' +
                 'Export dulu kalau kamu masih membutuhkannya.',
        confirmLabel: 'Hapus semuanya',
        onConfirm() {
          Store.reset();
          App.resetFilters();
          go('dashboard');
          toast('Data dikembalikan ke awal');
        },
      });
      break;
  }
});

/* ---------- inputs ---------- */

document.addEventListener('input', (ev) => {
  const el = ev.target;
  if (el.dataset && el.dataset.act === 'search') {
    App.filter.search = el.value;
    // Re-rendering replaces the input, so put the caret and the scroll
    // position back where the user had them.
    const scroll = document.getElementById('view').scrollTop;
    render();
    const again = document.getElementById('search');
    if (again) { again.focus(); again.setSelectionRange(again.value.length, again.value.length); }
    document.getElementById('view').scrollTop = scroll;
  }
});

document.addEventListener('change', (ev) => {
  const el = ev.target;
  if (el.dataset && el.dataset.act === 'pk-kind') {
    PocketDraft.kind = el.value;
  }
});

/* ---------- scrim + keyboard ---------- */

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('scrim').addEventListener('click', () => Sheet.close());
});

document.addEventListener('keydown', (ev) => {
  if (!Sheet.stack.length) return;

  if (ev.key === 'Escape') { Sheet.close(); return; }

  // typing straight into the amount pad on desktop
  const top = Sheet.stack[Sheet.stack.length - 1];
  const isAmountSheet = top && (top.body === quickAddBody);
  const inField = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName);
  if (!isAmountSheet || inField) return;

  if (/^[0-9]$/.test(ev.key)) {
    ev.preventDefault();
    if (Draft.amount.length < 13) {
      Draft.amount = (Draft.amount + ev.key).replace(/^0+(?=\d)/, '');
      Sheet.refresh();
    }
  } else if (ev.key === 'Backspace') {
    ev.preventDefault();
    Draft.amount = Draft.amount.slice(0, -1);
    Sheet.refresh();
  } else if (ev.key === 'Enter') {
    ev.preventDefault();
    saveDraft();
  }
});

/* ---------- charts re-render when we cross the desktop breakpoint ---------- */

window.matchMedia('(min-width: 900px)').addEventListener('change', () => {
  if (Store.data) render();
});

/* ---------- theme follows the OS when set to auto ---------- */

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  if (Store.data && Store.data.settings.theme === 'auto') applyTheme();
});

/* ---------- boot ---------- */

function boot() {
  Store.init();
  applyTheme();
  render();
  PWA.init();
  // the storage check resolves a tick later; refresh the label if it's on screen
  setTimeout(() => { if (App.page === 'more') render(); }, 600);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
