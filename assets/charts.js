/* ============================================================
   Charts — plain SVG, no libraries, no network.
   Every renderer returns a markup string; interaction is wired
   by delegated listeners in ui.js via data-* attributes.
   ============================================================ */

const Charts = {

  /* ---------------------------------------------------------
     Donut — composition of a single period
     --------------------------------------------------------- */
  donut(items, opts = {}) {
    const { size = 132, thickness = 16, centerTop = '', centerMain = '' } = opts;
    const r = (size - thickness) / 2 - 2;
    const c = size / 2;
    const circ = 2 * Math.PI * r;
    const total = items.reduce((s, i) => s + i.value, 0);

    if (!total) {
      return `<svg class="chart" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
        <circle cx="${c}" cy="${c}" r="${r}" fill="none"
                stroke="var(--surface-2)" stroke-width="${thickness}"/>
        <text x="${c}" y="${c + 4}" text-anchor="middle"
              fill="var(--text-3)" font-size="11">Belum ada data</text>
      </svg>`;
    }

    let offset = 0;
    const arcs = items.map((item, idx) => {
      const frac = item.value / total;
      const len = Math.max(frac * circ - 2, 0.6);   // small gap between slices
      const seg = `<circle cx="${c}" cy="${c}" r="${r}" fill="none"
          stroke="${item.color}" stroke-width="${thickness}" stroke-linecap="butt"
          stroke-dasharray="${len.toFixed(2)} ${(circ - len).toFixed(2)}"
          stroke-dashoffset="${(-offset).toFixed(2)}"
          data-slice="${idx}" style="cursor:pointer"><title>${U.escape(item.name)}</title></circle>`;
      offset += frac * circ;
      return seg;
    }).join('');

    return `<svg class="chart" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
      <g transform="rotate(-90 ${c} ${c})">${arcs}</g>
      ${centerTop ? `<text x="${c}" y="${c - 6}" text-anchor="middle"
        fill="var(--text-3)" font-size="9.5" letter-spacing=".04em">${U.escape(centerTop)}</text>` : ''}
      ${centerMain ? `<text x="${c}" y="${c + 10}" text-anchor="middle"
        fill="var(--text)" font-size="15" font-weight="650">${U.escape(centerMain)}</text>` : ''}
    </svg>`;
  },

  /* ---------------------------------------------------------
     Grouped bars — income vs expense across time buckets
     --------------------------------------------------------- */
  trend(buckets, series, opts = {}) {
    // The viewBox tracks the rendered width so label text keeps its real
    // pixel size instead of being scaled up on a wide screen.
    const W = opts.wide ? 760 : 340;
    const H = opts.wide ? 250 : 178;
    const padL = 36, padR = 6, padT = 10, padB = 26;
    const plotW = W - padL - padR;
    const plotH = H - padT - padB;
    const n = buckets.length;

    if (!n) return Charts.blank(W, H);

    let max = 0;
    for (const b of buckets)
      for (const s of series) max = Math.max(max, b.values[s.key] || 0);
    const scaleMax = niceCeil(max);

    const y = (v) => padT + plotH - (scaleMax ? (v / scaleMax) * plotH : 0);
    const slot = plotW / n;
    const maxBar = opts.wide ? 28 : 12;
    const barW = Math.max(3, Math.min(maxBar, (slot * 0.72) / series.length));
    const groupW = barW * series.length + (series.length - 1) * 2;

    // horizontal grid + value labels (only the baseline when there is nothing to scale)
    const levels = scaleMax > 0 ? [0, 0.5, 1] : [0];
    const grid = levels.map(f => {
      const gy = padT + plotH - f * plotH;
      return `<line x1="${padL}" x2="${W - padR}" y1="${gy.toFixed(1)}" y2="${gy.toFixed(1)}"
                stroke="var(--border-soft)" stroke-width="1"/>
              <text x="${padL - 6}" y="${(gy + 3.5).toFixed(1)}" text-anchor="end"
                fill="var(--text-3)" font-size="9">${f === 0 ? '0' : U.compact(scaleMax * f)}</text>`;
    }).join('');

    const bars = buckets.map((b, i) => {
      const cx = padL + slot * i + slot / 2;
      const x0 = cx - groupW / 2;
      const rects = series.map((s, j) => {
        const v = b.values[s.key] || 0;
        const top = y(v);
        const h = Math.max(v > 0 ? 2 : 0, padT + plotH - top);
        const bx = x0 + j * (barW + 2);
        return `<rect x="${bx.toFixed(1)}" y="${(padT + plotH - h).toFixed(1)}"
            width="${barW.toFixed(1)}" height="${h.toFixed(1)}"
            rx="${Math.min(3, barW / 2).toFixed(1)}" fill="${s.color}"/>`;
      }).join('');
      return rects +
        `<rect x="${(padL + slot * i).toFixed(1)}" y="${padT}" width="${slot.toFixed(1)}"
           height="${plotH}" fill="transparent" data-bucket="${i}" style="cursor:pointer"/>`;
    }).join('');

    // thin out x labels so they never collide
    const step = Math.ceil(n / (W / 46));
    const xlabels = buckets.map((b, i) => {
      if (i % step !== 0 && i !== n - 1) return '';
      const cx = padL + slot * i + slot / 2;
      return `<text x="${cx.toFixed(1)}" y="${H - 10}" text-anchor="middle"
        fill="var(--text-3)" font-size="9.5">${U.escape(b.label)}</text>`;
    }).join('');

    return `<svg class="chart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet"
      data-chart="trend">${grid}${bars}${xlabels}</svg>`;
  },

  /* ---------------------------------------------------------
     Area — cumulative net across the period
     --------------------------------------------------------- */
  area(points, opts = {}) {
    const W = opts.wide ? 760 : 340;
    const H = opts.wide ? 210 : 150;
    const padL = 36, padR = 6, padT = 12, padB = 24;
    const plotW = W - padL - padR;
    const plotH = H - padT - padB;
    const n = points.length;
    if (n < 1) return Charts.blank(W, H);

    const vals = points.map(p => p.value);
    let lo = Math.min(0, ...vals);
    let hi = Math.max(0, ...vals);
    if (hi === lo) hi = lo + 1;
    const pad = (hi - lo) * 0.12;
    lo -= pad; hi += pad;

    const x = (i) => n === 1 ? padL + plotW / 2 : padL + (i / (n - 1)) * plotW;
    const y = (v) => padT + plotH - ((v - lo) / (hi - lo)) * plotH;

    const line = points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(p.value).toFixed(1)}`).join(' ');
    const zeroY = y(0);
    const fill = `${line} L${x(n - 1).toFixed(1)} ${zeroY.toFixed(1)} L${x(0).toFixed(1)} ${zeroY.toFixed(1)} Z`;
    const last = points[n - 1];
    const col = last.value >= 0 ? 'var(--income)' : 'var(--expense)';

    const gid = 'ag' + Math.random().toString(36).slice(2, 7);
    const step = Math.ceil(n / (W / 46));
    const xlabels = points.map((p, i) => {
      if (i % step !== 0 && i !== n - 1) return '';
      return `<text x="${x(i).toFixed(1)}" y="${H - 8}" text-anchor="middle"
        fill="var(--text-3)" font-size="9.5">${U.escape(p.label)}</text>`;
    }).join('');

    return `<svg class="chart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet"
      data-chart="area">
      <defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${col}" stop-opacity=".26"/>
        <stop offset="100%" stop-color="${col}" stop-opacity="0"/>
      </linearGradient></defs>
      <line x1="${padL}" x2="${W - padR}" y1="${zeroY.toFixed(1)}" y2="${zeroY.toFixed(1)}"
        stroke="var(--border)" stroke-width="1" stroke-dasharray="3 3"/>
      <text x="${padL - 6}" y="${(zeroY + 3.5).toFixed(1)}" text-anchor="end"
        fill="var(--text-3)" font-size="9">0</text>
      <text x="${padL - 6}" y="${(padT + 4).toFixed(1)}" text-anchor="end"
        fill="var(--text-3)" font-size="9">${U.compact(hi)}</text>
      <path d="${fill}" fill="url(#${gid})"/>
      <path d="${line}" fill="none" stroke="${col}" stroke-width="2"
        stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="${x(n - 1).toFixed(1)}" cy="${y(last.value).toFixed(1)}" r="3.2"
        fill="${col}" stroke="var(--bg-elev)" stroke-width="2"/>
      ${points.map((p, i) => `<rect x="${(x(i) - plotW / n / 2).toFixed(1)}" y="${padT}"
        width="${(plotW / n).toFixed(1)}" height="${plotH}" fill="transparent"
        data-point="${i}" style="cursor:pointer"/>`).join('')}
      ${xlabels}
    </svg>`;
  },

  blank(W, H) {
    return `<svg class="chart" viewBox="0 0 ${W} ${H}">
      <text x="${W / 2}" y="${H / 2}" text-anchor="middle"
        fill="var(--text-3)" font-size="11">Belum ada data</text></svg>`;
  },

  /* ---------------------------------------------------------
     Ranked horizontal bars (HTML, not SVG — crisper text)
     --------------------------------------------------------- */
  rank(items, opts = {}) {
    const { symbol = 'Rp', hide = false, max = 0, total = 0, clickable = true, activeId = null } = opts;
    const top = max || Math.max(...items.map(i => i.value), 1);

    return `<div class="rank">${items.map(it => {
      const w = U.clamp((it.value / top) * 100, 2, 100);
      const share = total ? U.pct(it.value, total) : 0;
      const tag = clickable ? 'button' : 'div';
      return `<${tag} class="rank__row" ${clickable ? `data-cat-jump="${it.id}"` : ''}
          style="${activeId && activeId !== it.id ? 'opacity:.45' : ''}">
        ${iconBubble(it.icon, it.color, 34, 18, 'rank__ico')}
        <span class="rank__mid">
          <span class="rank__top">
            <span class="rank__nm">${U.escape(it.name)}</span>
            <span class="rank__vl">${U.money(it.value, { symbol, hide })}</span>
          </span>
          <span class="rank__track"><span class="rank__fill"
            style="width:${w.toFixed(1)}%;background:${it.color}"></span></span>
          ${total ? `<span class="rank__pc">${share.toFixed(1)}% dari total</span>` : ''}
        </span>
      </${tag}>`;
    }).join('')}</div>`;
  },

  /* ---------------------------------------------------------
     Side-by-side comparison rows (current vs comparison period)
     --------------------------------------------------------- */
  compareRows(rows, opts = {}) {
    const { symbol = 'Rp', hide = false, labelA = 'Sekarang', labelB = 'Pembanding' } = opts;
    const top = Math.max(...rows.flatMap(r => [r.a, r.b]), 1);

    return `<div>${rows.map(r => {
      const wa = U.clamp((r.a / top) * 100, 0, 100);
      const wb = U.clamp((r.b / top) * 100, 0, 100);
      const d = deltaOf(r.a, r.b);
      return `<div class="cmp-row">
        <div class="cmp-row__h">
          ${iconBubble(r.icon, r.color, 26, 14)}
          <span class="nm">${U.escape(r.name)}</span>
          ${deltaBadge(d, r.invert)}
        </div>
        <div class="cmp-bar">
          <span style="width:56px">${U.escape(labelA)}</span>
          <span class="cmp-bar__track"><span class="cmp-bar__fill"
            style="width:${wa.toFixed(1)}%;background:${r.color}"></span></span>
          <span class="cmp-bar__vl">${U.money(r.a, { symbol, hide })}</span>
        </div>
        <div class="cmp-bar">
          <span style="width:56px">${U.escape(labelB)}</span>
          <span class="cmp-bar__track"><span class="cmp-bar__fill"
            style="width:${wb.toFixed(1)}%;background:${r.color};opacity:.38"></span></span>
          <span class="cmp-bar__vl">${U.money(r.b, { symbol, hide })}</span>
        </div>
      </div>`;
    }).join('')}</div>`;
  },
};

/* ---------- helpers ---------- */

/** Round an axis maximum up to something readable (1, 2, 2.5 or 5 × 10ⁿ). */
function niceCeil(v) {
  if (v <= 0) return 0;
  const exp = Math.floor(Math.log10(v));
  const base = Math.pow(10, exp);
  const f = v / base;
  const step = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10;
  return step * base;
}

/**
 * Percentage change from b (comparison) to a (current).
 * Returns null when there is no baseline to compare against.
 */
function deltaOf(a, b) {
  if (!b) return a ? null : 0;
  return ((a - b) / Math.abs(b)) * 100;
}

/**
 * `invert` flips the colour meaning: for expenses, going up is bad.
 */
function deltaBadge(d, invert = false) {
  if (d === null) return `<span class="delta delta--flat">baru</span>`;
  if (Math.abs(d) < 0.05) return `<span class="delta delta--flat">0%</span>`;
  const up = d > 0;
  const good = invert ? !up : up;
  const cls = good ? 'delta--up' : 'delta--down';
  const arrow = icon(up ? 'arrow-up' : 'arrow-down', 11);
  const val = Math.abs(d) >= 1000 ? '>999' : Math.abs(d).toFixed(Math.abs(d) < 10 ? 1 : 0);
  return `<span class="delta ${cls}">${arrow}${val}%</span>`;
}
