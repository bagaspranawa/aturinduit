/* ============================================================
   Store — the whole app state lives in one JSON object.
   Kept in localStorage while you use it, and exportable to a
   single .json file you can park in Google Drive.
   ============================================================ */

const SCHEMA_VERSION = 1;
const STORAGE_KEY = 'aturinduit.v1';

const DEFAULT_POCKETS = [
  { icon: 'wallet',      name: 'Dompet Tunai',  color: '#C9A26B', kind: 'cash',    initial: 0 },
  { icon: 'landmark',    name: 'Rekening Bank', color: '#8AA7C4', kind: 'bank',    initial: 0 },
  { icon: 'smartphone',  name: 'E-Wallet',      color: '#83B394', kind: 'ewallet', initial: 0 },
  { icon: 'piggy-bank',  name: 'Tabungan',      color: '#AF9BC2', kind: 'savings', initial: 0 },
];

const DEFAULT_EXPENSE = [
  ['Makan & Minum',    'utensils',        '#C9897A'],
  ['Kopi & Jajan',     'coffee',          '#B79C8E'],
  ['Belanja Harian',   'shopping-cart',   '#D2A26B'],
  ['Belanja',          'shopping-bag',    '#C695A9'],
  ['Transportasi',     'car',             '#8AA7C4'],
  ['Bensin',           'fuel',            '#C6B074'],
  ['Parkir & Tol',     'parking',         '#9EA79B'],
  ['Pulsa & Internet', 'wifi',            '#7FB0AC'],
  ['Listrik & Air',    'zap',             '#D2A26B'],
  ['Sewa / Kos',       'key',             '#A5B7C6'],
  ['Rumah Tangga',     'home',            '#B6AE96'],
  ['Kesehatan',        'pill',            '#83B394'],
  ['Olahraga',         'dumbbell',        '#A8B983'],
  ['Hiburan',          'film',            '#9AA0C9'],
  ['Langganan',        'repeat',          '#AF9BC2'],
  ['Pendidikan',       'graduation-cap',  '#8FA8A0'],
  ['Pakaian',          'shirt',           '#CBA08C'],
  ['Perawatan Diri',   'sparkles',        '#C695A9'],
  ['Hadiah',           'gift',            '#C9897A'],
  ['Donasi & Zakat',   'hand',            '#83B394'],
  ['Keluarga',         'users',           '#B79C8E'],
  ['Peliharaan',       'paw',             '#C6B074'],
  ['Servis Kendaraan', 'wrench',          '#9EA79B'],
  ['Pajak & Admin',    'receipt',         '#A5B7C6'],
  ['Asuransi',         'shield',          '#8FA8A0'],
  ['Traveling',        'plane',           '#7FB0AC'],
  ['Lain-lain',        'more-horizontal', '#9EA79B'],
];

const DEFAULT_INCOME = [
  ['Gaji',        'briefcase',       '#83B394'],
  ['Bonus & THR', 'award',           '#C6B074'],
  ['Freelance',   'laptop',          '#8AA7C4'],
  ['Usaha',       'store',           '#D2A26B'],
  ['Investasi',   'trending-up',     '#8FA8A0'],
  ['Bunga Bank',  'landmark',        '#A5B7C6'],
  ['Penjualan',   'tag',             '#B79C8E'],
  ['Hadiah',      'gift',            '#C695A9'],
  ['Refund',      'rotate-ccw',      '#9AA0C9'],
  ['Lain-lain',   'more-horizontal', '#9EA79B'],
];

const Store = {
  data: null,

  /* ---------- lifecycle ---------- */

  init() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        Store.data = Store.migrate(JSON.parse(raw));
      } catch (e) {
        console.error('Data rusak, memakai data awal.', e);
        Store.data = Store.seed();
      }
    } else {
      Store.data = Store.seed();
    }
    Store.save();
    return Store.data;
  },

  seed() {
    const pockets = DEFAULT_POCKETS.map((p, i) => ({
      id: U.uid(), name: p.name, icon: p.icon, color: p.color,
      kind: p.kind, initial: p.initial, target: 0, order: i, archived: false,
    }));

    const mk = (list, type) => list.map(([name, ic, color], i) => ({
      id: U.uid(), name, icon: ic, color, type, order: i, archived: false,
    }));

    return {
      version: SCHEMA_VERSION,
      createdAt: new Date().toISOString(),
      settings: {
        currencySymbol: 'Rp',
        theme: 'auto',
        hideAmounts: false,
        profileName: '',               // labels the backup file, nothing more
        defaultPocketId: pockets[0].id,
        quickCategoryIds: [],          // empty -> auto-pick most used
        lastBackupAt: null,
      },
      pockets,
      categories: [...mk(DEFAULT_EXPENSE, 'expense'), ...mk(DEFAULT_INCOME, 'income')],
      transactions: [],
    };
  },

  /** Tolerates older/partial files so an import never hard-fails. */
  migrate(d) {
    d.version = SCHEMA_VERSION;
    d.settings = Object.assign({
      currencySymbol: 'Rp', theme: 'auto', hideAmounts: false, profileName: '',
      defaultPocketId: null, quickCategoryIds: [], lastBackupAt: null,
    }, d.settings || {});
    d.pockets = (d.pockets || []).map((p, i) => Object.assign(
      { id: U.uid(), name: 'Pocket', icon: 'wallet', color: '#8AA7C4',
        kind: 'cash', initial: 0, target: 0, order: i, archived: false }, p));
    d.categories = (d.categories || []).map((c, i) => Object.assign(
      { id: U.uid(), name: 'Kategori', icon: 'more-horizontal', color: '#9EA79B',
        type: 'expense', order: i, archived: false }, c));
    d.transactions = (d.transactions || []).map(t => Object.assign(
      { id: U.uid(), type: 'expense', amount: 0, date: U.today(),
        categoryId: null, pocketId: null, toPocketId: null, note: '',
        createdAt: new Date().toISOString() }, t));

    if (!d.pockets.length) d.pockets = Store.seed().pockets;
    if (!d.categories.length) d.categories = Store.seed().categories;
    if (!d.pockets.some(p => p.id === d.settings.defaultPocketId))
      d.settings.defaultPocketId = d.pockets[0].id;

    return d;
  },

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Store.data));
    } catch (e) {
      console.error('Gagal menyimpan', e);
      toast('Penyimpanan penuh — coba export lalu hapus data lama', 'alert');
    }
  },

  /* ---------- lookups ---------- */

  category(id) { return Store.data.categories.find(c => c.id === id) || null; },
  pocket(id)   { return Store.data.pockets.find(p => p.id === id) || null; },

  categoriesOf(type, { includeArchived = false } = {}) {
    return Store.data.categories
      .filter(c => c.type === type && (includeArchived || !c.archived))
      .sort((a, b) => a.order - b.order);
  },

  activePockets({ includeArchived = false } = {}) {
    return Store.data.pockets
      .filter(p => includeArchived || !p.archived)
      .sort((a, b) => a.order - b.order);
  },

  defaultPocket() {
    return Store.pocket(Store.data.settings.defaultPocketId) || Store.activePockets()[0] || null;
  },

  /* ---------- balances (always computed over ALL transactions) ---------- */

  pocketBalance(pocketId) {
    const p = Store.pocket(pocketId);
    if (!p) return 0;
    let bal = Number(p.initial) || 0;
    for (const t of Store.data.transactions) {
      const amt = Number(t.amount) || 0;
      if (t.type === 'income'  && t.pocketId === pocketId) bal += amt;
      if (t.type === 'expense' && t.pocketId === pocketId) bal -= amt;
      if (t.type === 'transfer') {
        if (t.pocketId === pocketId)   bal -= amt;
        if (t.toPocketId === pocketId) bal += amt;
      }
    }
    return bal;
  },

  totalBalance() {
    return Store.activePockets().reduce((s, p) => s + Store.pocketBalance(p.id), 0);
  },

  /* ---------- transactions ---------- */

  addTx(tx) {
    const rec = Object.assign({
      id: U.uid(), createdAt: new Date().toISOString(),
      type: 'expense', amount: 0, date: U.today(),
      categoryId: null, pocketId: null, toPocketId: null, note: '',
    }, tx);
    Store.data.transactions.push(rec);
    Store.save();
    return rec;
  },

  updateTx(id, patch) {
    const t = Store.data.transactions.find(x => x.id === id);
    if (!t) return null;
    Object.assign(t, patch);
    Store.save();
    return t;
  },

  deleteTx(id) {
    const i = Store.data.transactions.findIndex(x => x.id === id);
    if (i < 0) return null;
    const [removed] = Store.data.transactions.splice(i, 1);
    Store.save();
    return removed;
  },

  /** Filtered + sorted newest first. */
  query(filter = {}) {
    const { start, end, types, categoryIds, pocketIds, search } = filter;
    const q = (search || '').trim().toLowerCase();

    return Store.data.transactions.filter(t => {
      if (start && t.date < start) return false;
      if (end && t.date > end) return false;
      if (types && types.length && !types.includes(t.type)) return false;
      if (categoryIds && categoryIds.length) {
        if (t.type === 'transfer') return false;
        if (!categoryIds.includes(t.categoryId)) return false;
      }
      if (pocketIds && pocketIds.length) {
        const hit = pocketIds.includes(t.pocketId) ||
                    (t.type === 'transfer' && pocketIds.includes(t.toPocketId));
        if (!hit) return false;
      }
      if (q) {
        const cat = Store.category(t.categoryId);
        const hay = `${t.note || ''} ${cat ? cat.name : ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    }).sort((a, b) =>
      b.date.localeCompare(a.date) || String(b.createdAt).localeCompare(String(a.createdAt)));
  },

  /** Income / expense / net for a set of transactions. */
  totals(list) {
    let income = 0, expense = 0;
    for (const t of list) {
      const a = Number(t.amount) || 0;
      if (t.type === 'income') income += a;
      else if (t.type === 'expense') expense += a;
    }
    return { income, expense, net: income - expense, count: list.length };
  },

  /** Aggregate per category, biggest first. */
  byCategory(list, type) {
    const map = new Map();
    for (const t of list) {
      if (t.type !== type) continue;
      const key = t.categoryId || '_none';
      map.set(key, (map.get(key) || 0) + (Number(t.amount) || 0));
    }
    return [...map.entries()]
      .map(([id, value]) => {
        const c = Store.category(id);
        return {
          id,
          value,
          name: c ? c.name : 'Tanpa kategori',
          icon: c ? c.icon : 'more-horizontal',
          color: c ? c.color : '#9EA79B',
        };
      })
      .sort((a, b) => b.value - a.value);
  },

  /* ---------- categories ---------- */

  addCategory(cat) {
    const siblings = Store.categoriesOf(cat.type, { includeArchived: true });
    const rec = Object.assign({
      id: U.uid(), name: 'Kategori baru', icon: 'more-horizontal',
      color: PALETTE[0], type: 'expense', archived: false,
      order: siblings.length,
    }, cat);
    Store.data.categories.push(rec);
    Store.save();
    return rec;
  },

  updateCategory(id, patch) {
    const c = Store.category(id);
    if (!c) return null;
    Object.assign(c, patch);
    Store.save();
    return c;
  },

  categoryUsage(id) {
    return Store.data.transactions.filter(t => t.categoryId === id).length;
  },

  /** Delete outright when unused; otherwise archive so history stays intact. */
  removeCategory(id) {
    const used = Store.categoryUsage(id);
    if (used > 0) {
      Store.updateCategory(id, { archived: true });
      return { archived: true, used };
    }
    Store.data.categories = Store.data.categories.filter(c => c.id !== id);
    Store.data.settings.quickCategoryIds =
      Store.data.settings.quickCategoryIds.filter(x => x !== id);
    Store.save();
    return { archived: false, used: 0 };
  },

  /* ---------- pockets ---------- */

  addPocket(p) {
    const rec = Object.assign({
      id: U.uid(), name: 'Pocket baru', icon: 'wallet', color: PALETTE[6],
      kind: 'cash', initial: 0, target: 0, archived: false,
      order: Store.data.pockets.length,
    }, p);
    Store.data.pockets.push(rec);
    Store.save();
    return rec;
  },

  updatePocket(id, patch) {
    const p = Store.pocket(id);
    if (!p) return null;
    Object.assign(p, patch);
    Store.save();
    return p;
  },

  pocketUsage(id) {
    return Store.data.transactions
      .filter(t => t.pocketId === id || t.toPocketId === id).length;
  },

  removePocket(id) {
    if (Store.data.pockets.filter(p => !p.archived).length <= 1)
      return { error: 'Minimal harus ada satu pocket aktif.' };

    const used = Store.pocketUsage(id);
    if (used > 0) {
      Store.updatePocket(id, { archived: true });
      if (Store.data.settings.defaultPocketId === id)
        Store.data.settings.defaultPocketId = Store.activePockets()[0].id;
      Store.save();
      return { archived: true, used };
    }
    Store.data.pockets = Store.data.pockets.filter(p => p.id !== id);
    if (Store.data.settings.defaultPocketId === id)
      Store.data.settings.defaultPocketId = Store.activePockets()[0].id;
    Store.save();
    return { archived: false, used: 0 };
  },

  /* ---------- settings ---------- */

  setSetting(key, value) {
    Store.data.settings[key] = value;
    Store.save();
  },

  /* ---------- backup file ---------- */

  /** Includes the profile name so two people's backups never look alike. */
  exportName() {
    const slug = (Store.data.settings.profileName || '')
      .toLowerCase().trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 24);
    return `aturinduit-${slug ? slug + '-' : ''}${U.today()}.json`;
  },

  exportText() {
    const payload = Object.assign({}, Store.data, {
      exportedAt: new Date().toISOString(),
      app: 'AturinDuit',
      profile: Store.data.settings.profileName || '',
      version: SCHEMA_VERSION,
    });
    return JSON.stringify(payload, null, 2);
  },

  /**
   * mode 'replace' — the file becomes your data
   * mode 'merge'   — keep what you have, add anything new from the file
   */
  importText(text, mode = 'replace') {
    let incoming;
    try {
      incoming = JSON.parse(text);
    } catch {
      throw new Error('File bukan JSON yang valid.');
    }
    if (!incoming || typeof incoming !== 'object' || !Array.isArray(incoming.transactions))
      throw new Error('Struktur file tidak dikenali — pastikan ini backup AturinDuit.');

    const clean = Store.migrate(incoming);

    if (mode === 'replace') {
      Store.data = clean;
      Store.save();
      return { pockets: clean.pockets.length, categories: clean.categories.length,
               transactions: clean.transactions.length, mode };
    }

    // merge — id collisions are skipped, names are matched so categories
    // from a second device don't duplicate
    const cur = Store.data;
    let addedTx = 0, addedCat = 0, addedPocket = 0;

    const pocketMap = new Map();
    for (const p of clean.pockets) {
      const match = cur.pockets.find(x => x.id === p.id) ||
                    cur.pockets.find(x => x.name.toLowerCase() === p.name.toLowerCase());
      if (match) { pocketMap.set(p.id, match.id); continue; }
      const rec = Object.assign({}, p, { order: cur.pockets.length });
      cur.pockets.push(rec);
      pocketMap.set(p.id, rec.id);
      addedPocket++;
    }

    const catMap = new Map();
    for (const c of clean.categories) {
      const match = cur.categories.find(x => x.id === c.id) ||
                    cur.categories.find(x => x.type === c.type &&
                                             x.name.toLowerCase() === c.name.toLowerCase());
      if (match) { catMap.set(c.id, match.id); continue; }
      const rec = Object.assign({}, c, { order: cur.categories.length });
      cur.categories.push(rec);
      catMap.set(c.id, rec.id);
      addedCat++;
    }

    const seen = new Set(cur.transactions.map(t => t.id));
    for (const t of clean.transactions) {
      if (seen.has(t.id)) continue;
      cur.transactions.push(Object.assign({}, t, {
        categoryId: catMap.get(t.categoryId) || t.categoryId,
        pocketId:   pocketMap.get(t.pocketId) || t.pocketId,
        toPocketId: t.toPocketId ? (pocketMap.get(t.toPocketId) || t.toPocketId) : null,
      }));
      seen.add(t.id);
      addedTx++;
    }

    Store.save();
    return { pockets: addedPocket, categories: addedCat, transactions: addedTx, mode };
  },

  reset() {
    Store.data = Store.seed();
    Store.save();
  },
};
