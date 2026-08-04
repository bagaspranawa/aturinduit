/* ============================================================
   Utils — dates, money formatting, period presets, bucketing.
   Dates are stored as plain 'YYYY-MM-DD' strings so a backup
   file never drifts across timezones.
   ============================================================ */

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const MONTHS_LONG  = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli',
                      'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const DAYS_SHORT   = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

const U = {

  /* ---------- ids ---------- */
  uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  },

  /* ---------- date keys ---------- */
  pad(n) { return String(n).padStart(2, '0'); },

  key(d) {
    return `${d.getFullYear()}-${U.pad(d.getMonth() + 1)}-${U.pad(d.getDate())}`;
  },

  parse(k) {
    return new Date(+k.slice(0, 4), +k.slice(5, 7) - 1, +k.slice(8, 10));
  },

  today() { return U.key(new Date()); },

  /* ---------- date math (all operate on Date, return Date) ---------- */
  addDays(d, n)   { const x = new Date(d); x.setDate(x.getDate() + n); return x; },
  addMonths(d, n) {
    const x = new Date(d.getFullYear(), d.getMonth() + n, 1);
    // clamp: 31 Jan + 1 month -> 28/29 Feb, never spills into March
    const last = new Date(x.getFullYear(), x.getMonth() + 1, 0).getDate();
    x.setDate(Math.min(d.getDate(), last));
    return x;
  },
  addYears(d, n) {
    const x = new Date(d);
    x.setFullYear(x.getFullYear() + n);
    return x;
  },

  startOfWeek(d) {                        // Monday-based
    const x = new Date(d);
    const dow = (x.getDay() + 6) % 7;
    x.setDate(x.getDate() - dow);
    return x;
  },
  endOfWeek(d)    { return U.addDays(U.startOfWeek(d), 6); },
  startOfMonth(d) { return new Date(d.getFullYear(), d.getMonth(), 1); },
  endOfMonth(d)   { return new Date(d.getFullYear(), d.getMonth() + 1, 0); },
  startOfQuarter(d) { return new Date(d.getFullYear(), Math.floor(d.getMonth() / 3) * 3, 1); },
  endOfQuarter(d)   { return new Date(d.getFullYear(), Math.floor(d.getMonth() / 3) * 3 + 3, 0); },
  startOfYear(d)  { return new Date(d.getFullYear(), 0, 1); },
  endOfYear(d)    { return new Date(d.getFullYear(), 11, 31); },

  daysBetween(a, b) {
    return Math.round((U.parse(b) - U.parse(a)) / 86400000) + 1;
  },

  /* ---------- labels ---------- */
  fmtDate(k, style = 'medium') {
    const d = U.parse(k);
    if (style === 'short')  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
    if (style === 'medium') return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
    if (style === 'long')   return `${DAYS_SHORT[d.getDay()]}, ${d.getDate()} ${MONTHS_LONG[d.getMonth()]} ${d.getFullYear()}`;
    return k;
  },

  /** "Hari ini" / "Kemarin" / "Sen, 14 Juli 2025" */
  fmtDateRelative(k) {
    const t = U.today();
    if (k === t) return 'Hari ini';
    if (k === U.key(U.addDays(new Date(), -1))) return 'Kemarin';
    if (k === U.key(U.addDays(new Date(), 1)))  return 'Besok';
    const d = U.parse(k);
    const sameYear = d.getFullYear() === new Date().getFullYear();
    return `${DAYS_SHORT[d.getDay()]}, ${d.getDate()} ${MONTHS_LONG[d.getMonth()]}` +
           (sameYear ? '' : ` ${d.getFullYear()}`);
  },

  fmtRange(start, end) {
    if (!start || !end) return 'Semua waktu';
    if (start === end) return U.fmtDate(start, 'medium');
    const a = U.parse(start), b = U.parse(end);
    if (a.getFullYear() === b.getFullYear()) {
      if (a.getMonth() === b.getMonth()) {
        // whole month?
        if (a.getDate() === 1 && b.getDate() === U.endOfMonth(b).getDate())
          return `${MONTHS_LONG[a.getMonth()]} ${a.getFullYear()}`;
        return `${a.getDate()}–${b.getDate()} ${MONTHS_SHORT[b.getMonth()]} ${b.getFullYear()}`;
      }
      if (a.getDate() === 1 && a.getMonth() === 0 && b.getMonth() === 11 && b.getDate() === 31)
        return String(a.getFullYear());
      return `${a.getDate()} ${MONTHS_SHORT[a.getMonth()]} – ${b.getDate()} ${MONTHS_SHORT[b.getMonth()]} ${b.getFullYear()}`;
    }
    return `${U.fmtDate(start, 'medium')} – ${U.fmtDate(end, 'medium')}`;
  },

  /* ---------- money ---------- */
  money(n, opts = {}) {
    const { symbol = 'Rp', sign = false, hide = false } = opts;
    if (hide) return `${symbol} ••••••`;
    const abs = Math.abs(Math.round(n));
    const body = abs.toLocaleString('id-ID');
    const pre = sign ? (n > 0 ? '+' : n < 0 ? '−' : '') : (n < 0 ? '−' : '');
    return `${pre}${symbol} ${body}`;
  },

  /** Compact Indonesian scale: 1,2jt / 350rb / 4,5M */
  compact(n) {
    const abs = Math.abs(n);
    const s = n < 0 ? '−' : '';
    const trim = (v) => String(Math.round(v * 10) / 10).replace('.', ',');
    if (abs >= 1e12) return s + trim(abs / 1e12) + 'T';
    if (abs >= 1e9)  return s + trim(abs / 1e9)  + 'M';
    if (abs >= 1e6)  return s + trim(abs / 1e6)  + 'jt';
    if (abs >= 1e3)  return s + trim(abs / 1e3)  + 'rb';
    return s + String(Math.round(abs));
  },

  pct(part, whole) {
    if (!whole) return 0;
    return (part / whole) * 100;
  },

  clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); },

  escape(s) {
    return String(s ?? '').replace(/[&<>"']/g, (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  },
};

/* ============================================================
   Period presets
   ============================================================ */

const PRESETS = [
  { id: 'today',       label: 'Hari ini',          group: 'Cepat' },
  { id: 'yesterday',   label: 'Kemarin',           group: 'Cepat' },
  { id: 'thisWeek',    label: 'Minggu ini',        group: 'Cepat' },
  { id: 'lastWeek',    label: 'Minggu lalu',       group: 'Cepat' },
  { id: 'last7',       label: '7 hari terakhir',   group: 'Cepat' },
  { id: 'thisMonth',   label: 'Bulan ini',         group: 'Bulanan' },
  { id: 'lastMonth',   label: 'Bulan lalu',        group: 'Bulanan' },
  { id: 'last30',      label: '30 hari terakhir',  group: 'Bulanan' },
  { id: 'last90',      label: '90 hari terakhir',  group: 'Bulanan' },
  { id: 'thisQuarter', label: 'Kuartal ini',       group: 'Bulanan' },
  { id: 'lastQuarter', label: 'Kuartal lalu',      group: 'Bulanan' },
  { id: 'thisYear',    label: 'Tahun ini',         group: 'Tahunan' },
  { id: 'lastYear',    label: 'Tahun lalu',        group: 'Tahunan' },
  { id: 'last12m',     label: '12 bulan terakhir', group: 'Tahunan' },
  { id: 'all',         label: 'Semua waktu',       group: 'Tahunan' },
  { id: 'custom',      label: 'Rentang kustom',    group: 'Kustom' },
];

/**
 * Resolve a preset into concrete {start, end} date keys.
 * `all` returns nulls — callers treat that as unbounded.
 */
function resolvePreset(id, custom = {}) {
  const now = new Date();
  const k = U.key;

  switch (id) {
    case 'today':     return { start: k(now), end: k(now) };
    case 'yesterday': { const y = U.addDays(now, -1); return { start: k(y), end: k(y) }; }
    case 'thisWeek':  return { start: k(U.startOfWeek(now)), end: k(U.endOfWeek(now)) };
    case 'lastWeek':  { const w = U.addDays(U.startOfWeek(now), -7);
                        return { start: k(w), end: k(U.addDays(w, 6)) }; }
    case 'last7':     return { start: k(U.addDays(now, -6)),  end: k(now) };
    case 'last30':    return { start: k(U.addDays(now, -29)), end: k(now) };
    case 'last90':    return { start: k(U.addDays(now, -89)), end: k(now) };
    case 'thisMonth': return { start: k(U.startOfMonth(now)), end: k(U.endOfMonth(now)) };
    case 'lastMonth': { const m = U.addMonths(U.startOfMonth(now), -1);
                        return { start: k(U.startOfMonth(m)), end: k(U.endOfMonth(m)) }; }
    case 'thisQuarter': return { start: k(U.startOfQuarter(now)), end: k(U.endOfQuarter(now)) };
    case 'lastQuarter': { const q = U.addMonths(U.startOfQuarter(now), -3);
                          return { start: k(U.startOfQuarter(q)), end: k(U.endOfQuarter(q)) }; }
    case 'thisYear':  return { start: k(U.startOfYear(now)), end: k(U.endOfYear(now)) };
    case 'lastYear':  { const y = U.addYears(now, -1);
                        return { start: k(U.startOfYear(y)), end: k(U.endOfYear(y)) }; }
    case 'last12m':   { const s = U.startOfMonth(U.addMonths(now, -11));
                        return { start: k(s), end: k(U.endOfMonth(now)) }; }
    case 'all':       return { start: null, end: null };
    case 'custom':    return { start: custom.start || U.today(), end: custom.end || U.today() };
    default:          return { start: k(U.startOfMonth(now)), end: k(U.endOfMonth(now)) };
  }
}

function presetLabel(id) {
  return (PRESETS.find(p => p.id === id) || {}).label || 'Periode';
}

/**
 * The period a range is compared against.
 *   prev — the same number of days immediately before
 *   yoy  — the same calendar dates one year earlier
 */
function comparisonRange(range, mode, presetId) {
  if (mode === 'none' || !range.start || !range.end) return null;

  if (mode === 'yoy') {
    return {
      start: U.key(U.addYears(U.parse(range.start), -1)),
      end:   U.key(U.addYears(U.parse(range.end), -1)),
      label: 'Periode sama tahun lalu',
    };
  }

  // Calendar-aware shift keeps "bulan ini" comparing against a whole month,
  // not against a 31-day window that straddles two months.
  const whole = {
    thisMonth: () => { const m = U.addMonths(new Date(), -1);
                       return { start: U.startOfMonth(m), end: U.endOfMonth(m), label: 'Bulan lalu' }; },
    lastMonth: () => { const m = U.addMonths(new Date(), -2);
                       return { start: U.startOfMonth(m), end: U.endOfMonth(m), label: '2 bulan lalu' }; },
    thisYear:  () => { const y = U.addYears(new Date(), -1);
                       return { start: U.startOfYear(y), end: U.endOfYear(y), label: 'Tahun lalu' }; },
    thisQuarter: () => { const q = U.addMonths(U.startOfQuarter(new Date()), -3);
                         return { start: U.startOfQuarter(q), end: U.endOfQuarter(q), label: 'Kuartal lalu' }; },
    thisWeek:  () => { const w = U.addDays(U.startOfWeek(new Date()), -7);
                       return { start: w, end: U.addDays(w, 6), label: 'Minggu lalu' }; },
  }[presetId];

  if (whole) {
    const r = whole();
    return { start: U.key(r.start), end: U.key(r.end), label: r.label };
  }

  const len = U.daysBetween(range.start, range.end);
  const end = U.addDays(U.parse(range.start), -1);
  const start = U.addDays(end, -(len - 1));
  return { start: U.key(start), end: U.key(end), label: 'Periode sebelumnya' };
}

/* ============================================================
   Bucketing — choose a sensible granularity for the trend chart
   ============================================================ */

function pickGranularity(start, end) {
  const days = U.daysBetween(start, end);
  if (days <= 14)  return 'day';
  if (days <= 92)  return 'week';
  if (days <= 800) return 'month';
  return 'year';
}

/**
 * Build the empty time buckets covering [start, end].
 * Each bucket: { key, label, start, end }
 */
function buildBuckets(start, end, granularity) {
  const g = granularity || pickGranularity(start, end);
  const out = [];
  const last = U.parse(end);
  let cursor;

  if (g === 'day') {
    cursor = U.parse(start);
    while (cursor <= last) {
      const k = U.key(cursor);
      out.push({ key: k, start: k, end: k, label: String(cursor.getDate()) });
      cursor = U.addDays(cursor, 1);
    }
  } else if (g === 'week') {
    cursor = U.startOfWeek(U.parse(start));
    while (cursor <= last) {
      const e = U.addDays(cursor, 6);
      out.push({
        key: U.key(cursor),
        start: U.key(cursor),
        end: U.key(e),
        label: `${cursor.getDate()}/${cursor.getMonth() + 1}`,
      });
      cursor = U.addDays(cursor, 7);
    }
  } else if (g === 'month') {
    cursor = U.startOfMonth(U.parse(start));
    while (cursor <= last) {
      const e = U.endOfMonth(cursor);
      out.push({
        key: U.key(cursor),
        start: U.key(cursor),
        end: U.key(e),
        label: MONTHS_SHORT[cursor.getMonth()],
        sub: cursor.getMonth() === 0 ? String(cursor.getFullYear()) : '',
      });
      cursor = U.addMonths(cursor, 1);
    }
  } else {
    cursor = U.startOfYear(U.parse(start));
    while (cursor <= last) {
      out.push({
        key: U.key(cursor),
        start: U.key(cursor),
        end: U.key(U.endOfYear(cursor)),
        label: String(cursor.getFullYear()),
      });
      cursor = U.addYears(cursor, 1);
    }
  }

  return { granularity: g, buckets: out };
}

const GRANULARITY_LABEL = { day: 'Harian', week: 'Mingguan', month: 'Bulanan', year: 'Tahunan' };
