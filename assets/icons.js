/* ============================================================
   Icon set — hand-tuned 24x24 stroke icons, no dependencies.
   Every glyph is plain inner-SVG markup so it inherits
   currentColor and works offline from file://.
   ============================================================ */

const ICONS = {

  /* ---------- interface ---------- */
  plus:        '<path d="M12 5v14"/><path d="M5 12h14"/>',
  minus:       '<path d="M5 12h14"/>',
  x:           '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  check:       '<path d="m4.5 12.5 5 5 10-11"/>',
  'chevron-left':  '<path d="m14.5 5-7 7 7 7"/>',
  'chevron-right': '<path d="m9.5 5 7 7-7 7"/>',
  'chevron-down':  '<path d="m5 9 7 7 7-7"/>',
  'chevron-up':    '<path d="m5 15 7-7 7 7"/>',
  'arrow-up':      '<path d="M12 19V5"/><path d="m5.5 11.5 6.5-6.5 6.5 6.5"/>',
  'arrow-down':    '<path d="M12 5v14"/><path d="m5.5 12.5 6.5 6.5 6.5-6.5"/>',
  'arrow-up-right':   '<path d="M7 17 17 7"/><path d="M8 7h9v9"/>',
  'arrow-down-right': '<path d="M7 7l10 10"/><path d="M17 8v9H8"/>',
  'arrow-left-right': '<path d="m7 4-4 4 4 4"/><path d="M3 8h13"/><path d="m17 12 4 4-4 4"/><path d="M21 16H8"/>',
  calendar:    '<rect x="3" y="4.5" width="18" height="16.5" rx="2.5"/><path d="M3 9.5h18"/><path d="M8 2.5v4"/><path d="M16 2.5v4"/>',
  filter:      '<path d="M3.5 5h17l-6.5 7.7V20l-4 1.5v-8.8z"/>',
  search:      '<circle cx="11" cy="11" r="7"/><path d="m16.2 16.2 4.3 4.3"/>',
  settings:    '<path d="M4 6h10"/><path d="M18 6h2"/><path d="M4 12h2"/><path d="M10 12h10"/><path d="M4 18h8"/><path d="M16 18h4"/><circle cx="16" cy="6" r="2"/><circle cx="8" cy="12" r="2"/><circle cx="14" cy="18" r="2"/>',
  trash:       '<path d="M4 6.5h16"/><path d="M9.5 6.5V4.8A1.8 1.8 0 0 1 11.3 3h1.4a1.8 1.8 0 0 1 1.8 1.8v1.7"/><path d="M6.5 6.5 7.4 19a2 2 0 0 0 2 1.9h5.2a2 2 0 0 0 2-1.9l.9-12.5"/><path d="M10.5 10.5v6"/><path d="M13.5 10.5v6"/>',
  pencil:      '<path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4z"/><path d="m14.5 5.5 3 3"/>',
  download:    '<path d="M12 3.5v12"/><path d="m7 11 5 4.5 5-4.5"/><path d="M4 17v2.5A1.5 1.5 0 0 0 5.5 21h13a1.5 1.5 0 0 0 1.5-1.5V17"/>',
  upload:      '<path d="M12 16V4"/><path d="m7 8.5 5-4.5 5 4.5"/><path d="M4 17v2.5A1.5 1.5 0 0 0 5.5 21h13a1.5 1.5 0 0 0 1.5-1.5V17"/>',
  refresh:     '<path d="M3.5 12a8.5 8.5 0 1 1 2.5 6"/><path d="M3 13v5h5"/>',
  eye:         '<path d="M2 12s3.8-6.5 10-6.5S22 12 22 12s-3.8 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="2.8"/>',
  'eye-off':   '<path d="M4 4.5 20 20"/><path d="M9.6 9.7A2.8 2.8 0 0 0 12 14.8c.8 0 1.5-.3 2-.8"/><path d="M6.4 6.7C3.8 8.3 2 12 2 12s3.8 6.5 10 6.5c1.7 0 3.2-.5 4.5-1.2"/><path d="M19.3 15.4C21.2 13.8 22 12 22 12s-3.8-6.5-10-6.5c-1 0-1.9.1-2.7.4"/>',
  sun:         '<circle cx="12" cy="12" r="4"/><path d="M12 2v2.5"/><path d="M12 19.5V22"/><path d="M2 12h2.5"/><path d="M19.5 12H22"/><path d="m4.9 4.9 1.8 1.8"/><path d="m17.3 17.3 1.8 1.8"/><path d="m19.1 4.9-1.8 1.8"/><path d="m6.7 17.3-1.8 1.8"/>',
  moon:        '<path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11z"/>',
  monitor:     '<rect x="2.5" y="4" width="19" height="13" rx="2"/><path d="M8.5 21h7"/><path d="M12 17v4"/>',
  dashboard:   '<rect x="3" y="3" width="7.5" height="8.5" rx="1.8"/><rect x="13.5" y="3" width="7.5" height="5.5" rx="1.8"/><rect x="3" y="14.5" width="7.5" height="6.5" rx="1.8"/><rect x="13.5" y="11.5" width="7.5" height="9.5" rx="1.8"/>',
  list:        '<path d="M8.5 6.5h12"/><path d="M8.5 12h12"/><path d="M8.5 17.5h12"/><circle cx="4" cy="6.5" r="1.3"/><circle cx="4" cy="12" r="1.3"/><circle cx="4" cy="17.5" r="1.3"/>',
  layers:      '<path d="m12 2.5 9 4.7-9 4.7-9-4.7z"/><path d="m3 12.2 9 4.7 9-4.7"/><path d="m3 16.8 9 4.7 9-4.7"/>',
  backspace:   '<path d="M20 4.5H9.6a2 2 0 0 0-1.5.7L2.8 12l5.3 6.8a2 2 0 0 0 1.5.7H20a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5z"/><path d="m12 9.5 5 5"/><path d="m17 9.5-5 5"/>',
  star:        '<path d="m12 3 2.7 5.8 6.3.8-4.6 4.4 1.2 6.3L12 17.3 6.4 20.3l1.2-6.3L3 9.6l6.3-.8z"/>',
  info:        '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5"/><path d="M12 7.6h.01"/>',
  alert:       '<path d="M10.3 3.9 2.6 17.2A2 2 0 0 0 4.3 20.2h15.4a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4"/><path d="M12 16.6h.01"/>',
  clock:       '<circle cx="12" cy="12" r="9"/><path d="M12 7v5.3l3.3 2"/>',
  target:      '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.4"/>',
  save:        '<path d="M5 3.5h11l5 5V19a1.5 1.5 0 0 1-1.5 1.5h-14A1.5 1.5 0 0 1 4 19V5a1.5 1.5 0 0 1 1-1.5z"/><path d="M8 3.5v6h7v-6"/><path d="M8 20.5v-6h8v6"/>',
  folder:      '<path d="M3 7a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  drag:        '<circle cx="9" cy="6" r="1.4"/><circle cx="15" cy="6" r="1.4"/><circle cx="9" cy="12" r="1.4"/><circle cx="15" cy="12" r="1.4"/><circle cx="9" cy="18" r="1.4"/><circle cx="15" cy="18" r="1.4"/>',
  archive:     '<rect x="2.5" y="3.5" width="19" height="5" rx="1.5"/><path d="M4.5 8.5V19a1.5 1.5 0 0 0 1.5 1.5h12a1.5 1.5 0 0 0 1.5-1.5V8.5"/><path d="M10 12.5h4"/>',

  /* ---------- charts ---------- */
  'trending-up':   '<path d="m3 17 6.5-6.5 4 4L21 7"/><path d="M15 7h6v6"/>',
  'trending-down': '<path d="m3 7 6.5 6.5 4-4L21 17"/><path d="M15 17h6v-6"/>',
  'chart-pie':     '<path d="M11 3.05A9 9 0 1 0 20.95 13H11z"/><path d="M14 2.5A8.5 8.5 0 0 1 21.5 10H14z"/>',
  'chart-bar':     '<path d="M3 20.5h18"/><rect x="4.5" y="10" width="4" height="7.5" rx="1.2"/><rect x="10" y="5" width="4" height="12.5" rx="1.2"/><rect x="15.5" y="13" width="4" height="4.5" rx="1.2"/>',
  'chart-line':    '<path d="M3.5 3.5v17h17"/><path d="m7 15.5 3.5-4.5 3 2.5 5-7"/>',
  scale:           '<path d="M12 3v18"/><path d="M7 21h10"/><path d="M12 6.5 4 8.5"/><path d="m12 6.5 8 2"/><path d="M4 8.5 1.5 15a3 3 0 0 0 5 0z"/><path d="M20 8.5 17.5 15a3 3 0 0 0 5 0z"/>',

  /* ---------- money / pockets ---------- */
  wallet:      '<path d="M19.5 7.5V6A1.5 1.5 0 0 0 18 4.5H5.2A2.7 2.7 0 0 0 2.5 7.2V18a2.5 2.5 0 0 0 2.5 2.5h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2H5.2a2.7 2.7 0 0 1-2.7-2.7"/><circle cx="16.8" cy="14" r="1.2"/>',
  banknote:    '<rect x="2" y="6" width="20" height="12" rx="2.5"/><circle cx="12" cy="12" r="2.6"/><path d="M6 10v4"/><path d="M18 10v4"/>',
  coins:       '<ellipse cx="12" cy="6" rx="7.5" ry="3"/><path d="M4.5 6v5c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3V6"/><path d="M4.5 11v5c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-5"/>',
  'piggy-bank':'<path d="M16.5 8.6c2 1 3.5 2.7 3.5 4.7 0 1.3-.6 2.5-1.5 3.4V19a1.5 1.5 0 0 1-3 0v-.7a10 10 0 0 1-5 0V19a1.5 1.5 0 0 1-3 0v-2.6A5.6 5.6 0 0 1 6 13.2H4.5a1.5 1.5 0 0 1 0-3H6a5.8 5.8 0 0 1 5.5-4.2h2.2"/><path d="M13.5 6c0-1.4-1.1-2.5-2.5-2.5"/><circle cx="16" cy="11.9" r=".9"/><path d="M20 11.7h1.5"/>',
  landmark:    '<path d="M2.5 9.5 12 3.5l9.5 6z"/><path d="M4.5 10v8"/><path d="M9.5 10v8"/><path d="M14.5 10v8"/><path d="M19.5 10v8"/><path d="M2.5 20.5h19"/>',
  'credit-card':'<rect x="2" y="5" width="20" height="14" rx="2.5"/><path d="M2 10h20"/><path d="M6 14.8h4"/>',
  briefcase:   '<rect x="2.5" y="7" width="19" height="13" rx="2.2"/><path d="M8.5 7V5.2A2 2 0 0 1 10.5 3.2h3a2 2 0 0 1 2 2V7"/><path d="M2.5 12.5h19"/><path d="M10.5 12.5v2h3v-2"/>',
  safe:        '<rect x="2.5" y="4" width="19" height="16" rx="2.5"/><circle cx="10.5" cy="12" r="3.5"/><path d="M10.5 8.5v-1"/><path d="M17 9.5v5"/><path d="M6 20v1.5"/><path d="M18 20v1.5"/>',

  /* ---------- food & drink ---------- */
  utensils:    '<path d="M5 3v4.5a2.5 2.5 0 0 0 5 0V3"/><path d="M7.5 10V21"/><ellipse cx="16.8" cy="6.6" rx="2.7" ry="3.6"/><path d="M16.8 10.2V21"/>',
  coffee:      '<path d="M4 8.5h13V14a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M17 10h1.6a2.4 2.4 0 0 1 0 4.8H17"/><path d="M7.5 2.5v3"/><path d="M11 2.5v3"/><path d="M14.5 2.5v3"/>',
  'cup-soda':  '<path d="M6.2 8h11.6l-1.2 12.2a2 2 0 0 1-2 1.8H9.4a2 2 0 0 1-2-1.8z"/><path d="m9.3 8 .9-5.5h3.6L14.7 8"/><path d="M7 13.5h10"/>',
  cake:        '<path d="M4 13.2a2.4 2.4 0 0 1 4 0 2.4 2.4 0 0 0 4 0 2.4 2.4 0 0 1 4 0 2.4 2.4 0 0 0 4 0V19a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/><path d="M12 5v3.5"/><circle cx="12" cy="3.4" r="1.1"/><path d="M7.5 6.5v2"/><path d="M16.5 6.5v2"/>',

  /* ---------- shopping ---------- */
  'shopping-bag':  '<path d="M5 7h14l1 12.8a2 2 0 0 1-2 2.2H6a2 2 0 0 1-2-2.2z"/><path d="M9 10.5V6a3 3 0 0 1 6 0v4.5"/>',
  'shopping-cart': '<path d="M2 3h2.6l2.2 10.6a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 2-1.6L20.5 7H6.2"/><circle cx="9.5" cy="19.4" r="1.6"/><circle cx="17" cy="19.4" r="1.6"/>',
  package:     '<path d="m12 2.5 9 4.5v10l-9 4.5-9-4.5V7z"/><path d="m3 7 9 4.5L21 7"/><path d="M12 11.5v10"/><path d="m7.5 4.7 9 4.5"/>',
  tag:         '<path d="M20.6 11.6 12.4 3.4A2 2 0 0 0 11 2.8H4.6a1.8 1.8 0 0 0-1.8 1.8V11c0 .5.2 1 .6 1.4l8.2 8.2a2 2 0 0 0 2.8 0l6.2-6.2a2 2 0 0 0 0-2.8z"/><circle cx="7.6" cy="7.6" r="1.3"/>',
  gift:        '<rect x="2.8" y="8" width="18.4" height="4.2" rx="1.2"/><path d="M4.8 12.2V19a2 2 0 0 0 2 2h10.4a2 2 0 0 0 2-2v-6.8"/><path d="M12 8v13"/><path d="M12 8S10.6 3 8.2 3a2.5 2.5 0 0 0 0 5z"/><path d="M12 8s1.4-5 3.8-5a2.5 2.5 0 0 1 0 5z"/>',
  ticket:      '<path d="M3 8.6V6.4A1.4 1.4 0 0 1 4.4 5h15.2A1.4 1.4 0 0 1 21 6.4v2.2a3.4 3.4 0 0 0 0 6.8v2.2a1.4 1.4 0 0 1-1.4 1.4H4.4A1.4 1.4 0 0 1 3 17.6v-2.2a3.4 3.4 0 0 0 0-6.8z"/><path d="M9.5 5v14" stroke-dasharray="2 2.6"/>',

  /* ---------- transport ---------- */
  car:         '<path d="M5 17H3.6A1.6 1.6 0 0 1 2 15.4V12a2 2 0 0 1 1.3-1.9l2.2-.8 1.8-3.6a2 2 0 0 1 1.8-1.1h5.8a2 2 0 0 1 1.8 1.1l1.8 3.6 2.2.8A2 2 0 0 1 22 12v3.4a1.6 1.6 0 0 1-1.6 1.6H19"/><path d="M5.5 9.3h13"/><circle cx="7.4" cy="17" r="2"/><circle cx="16.6" cy="17" r="2"/><path d="M9.4 17h5.2"/>',
  bike:        '<circle cx="5.6" cy="17.2" r="3.4"/><circle cx="18.4" cy="17.2" r="3.4"/><path d="m5.6 17.2 4-9.2h4.6l4.2 9.2"/><path d="M9.6 8h6"/><path d="M12.5 8V5h3"/>',
  bus:         '<rect x="3" y="3" width="18" height="14" rx="2.5"/><path d="M3 10.5h18"/><path d="M7 14h.01"/><path d="M17 14h.01"/><path d="M6.5 17v2.5"/><path d="M17.5 17v2.5"/>',
  plane:       '<path d="M10.5 2.6a1.5 1.5 0 0 1 3 0V8l8.2 4.6v2.6L13.5 13v4.4l2.5 2v2l-4-1.2L8 21.4v-2l2.5-2V13L2.3 15.2v-2.6L10.5 8z"/>',
  truck:       '<rect x="1.5" y="6" width="12" height="10" rx="1.6"/><path d="M13.5 9.5h3.9l3.1 3.6V16h-7z"/><circle cx="6" cy="18" r="2"/><circle cx="17.4" cy="18" r="2"/><path d="M8 18h7.4"/>',
  fuel:        '<path d="M4 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16"/><path d="M2.8 21h12.4"/><path d="M4.5 10h9"/><path d="M14 8h2.6a1.4 1.4 0 0 1 1.4 1.4V16a2 2 0 0 0 4 0V9.2l-2.6-3"/>',
  parking:     '<rect x="3" y="3" width="18" height="18" rx="4"/><path d="M9.6 17.2V7.4h3.2a2.9 2.9 0 0 1 0 5.8H9.6"/>',
  wrench:      '<path d="M15.6 3a5.5 5.5 0 0 0-5 7.7l-7 6.9a2 2 0 0 0 2.8 2.8l6.9-7A5.5 5.5 0 0 0 20.6 6.4l-3 3-2.9-2.9 3-3A5.6 5.6 0 0 0 15.6 3z"/>',

  /* ---------- home & bills ---------- */
  home:        '<path d="M3 10.5 12 3l9 7.5"/><path d="M5.2 9.8V19a2 2 0 0 0 2 2h9.6a2 2 0 0 0 2-2V9.8"/><path d="M9.6 21v-5.8h4.8V21"/>',
  building:    '<rect x="4" y="2.5" width="16" height="18.5" rx="2.2"/><path d="M9 7h1.6"/><path d="M13.4 7H15"/><path d="M9 11h1.6"/><path d="M13.4 11H15"/><path d="M9 15h1.6"/><path d="M13.4 15H15"/><path d="M10 21v-2.6h4V21"/>',
  key:         '<circle cx="7.4" cy="16.6" r="3.6"/><path d="m10 14 9.6-9.6"/><path d="m16.8 7.2 2.6 2.6"/><path d="m14.2 9.8 2.6 2.6"/>',
  bed:         '<path d="M2.5 20.5V6.5"/><path d="M2.5 12h17a2.5 2.5 0 0 1 2.5 2.5v6"/><path d="M2.5 16.6h19"/><circle cx="7" cy="9.4" r="2"/><path d="M10.4 12V9.6A1.6 1.6 0 0 1 12 8h5.5a1.6 1.6 0 0 1 1.6 1.6V12"/>',
  zap:         '<path d="M13.2 2.5 4 14h7l-1.2 7.5L20 10h-7z"/>',
  droplet:     '<path d="M12 2.7c3 3.7 6 6.9 6 10.3a6 6 0 0 1-12 0c0-3.4 3-6.6 6-10.3z"/>',
  flame:       '<path d="M12 22a7 7 0 0 0 7-7c0-4-3-6.4-4.2-9.4-1.4 1-1.9 2.5-1.8 4C11.8 7.8 11.2 5.2 11.8 2 8.6 4.3 5 8.4 5 15a7 7 0 0 0 7 7z"/>',
  wifi:        '<path d="M2.6 9.2a15 15 0 0 1 18.8 0"/><path d="M5.6 12.7a10.5 10.5 0 0 1 12.8 0"/><path d="M8.6 16.2a6 6 0 0 1 6.8 0"/><circle cx="12" cy="19.7" r="1.1"/>',
  smartphone:  '<rect x="6" y="2" width="12" height="20" rx="2.6"/><path d="M10.4 18.4h3.2"/>',
  laptop:      '<rect x="4" y="4.2" width="16" height="11" rx="1.8"/><path d="M2 18.8h20"/>',
  receipt:     '<path d="M5 2.4v19.2l2.5-1.5L10 21.6l2-1.5 2 1.5 2.5-1.5 2.5 1.5V2.4L16.5 3.9 14 2.4l-2 1.5-2-1.5L7.5 3.9z"/><path d="M8.5 8h7"/><path d="M8.5 11.8h7"/><path d="M8.5 15.6h4.5"/>',
  shield:      '<path d="M12 21.6s7.8-3.4 7.8-9.3V5.6L12 2.9 4.2 5.6v6.7c0 5.9 7.8 9.3 7.8 9.3z"/><path d="m9 12 2.2 2.2L15.2 10"/>',
  newspaper:   '<path d="M4 5.6A1.6 1.6 0 0 1 5.6 4h10.8A1.6 1.6 0 0 1 18 5.6V18a2 2 0 0 0 2 2H6a2 2 0 0 1-2-2z"/><path d="M18 8.2h1.4A1.6 1.6 0 0 1 21 9.8V18a2 2 0 0 1-2 2"/><path d="M7.4 8h7"/><path d="M7.4 11.5h7"/><path d="M7.4 15h4"/>',
  repeat:      '<path d="m16.8 2.5 3.7 3.5-3.7 3.5"/><path d="M20.5 6H7.2A3.7 3.7 0 0 0 3.5 9.7v1.8"/><path d="m7.2 21.5-3.7-3.5 3.7-3.5"/><path d="M3.5 18h13.3a3.7 3.7 0 0 0 3.7-3.7v-1.8"/>',
  umbrella:    '<path d="M12 3.2a8.8 8.8 0 0 1 8.8 8.8H3.2A8.8 8.8 0 0 1 12 3.2z"/><path d="M12 12v6.4a2.6 2.6 0 0 0 5.2 0"/><path d="M12 3.2V1.8"/>',
  plant:       '<path d="M12 21v-8.4"/><path d="M12 13c0-4.2 2.7-7.2 8.2-7.2 0 4.7-3.1 7.2-8.2 7.2z"/><path d="M12 16.2c0-3.1-2.1-5.6-6.7-5.6 0 3.6 2.6 5.6 6.7 5.6z"/><path d="M8 21h8"/>',

  /* ---------- health & body ---------- */
  heart:       '<path d="M20.6 5.9a5 5 0 0 0-7.1 0L12 7.4l-1.5-1.5a5 5 0 0 0-7.1 7.1l8.6 8.6 8.6-8.6a5 5 0 0 0 0-7.1z"/>',
  pill:        '<path d="M10.5 20.6a4.9 4.9 0 0 1-7-7l10-10a4.9 4.9 0 0 1 7 7z"/><path d="m8.5 8.5 7 7"/>',
  stethoscope: '<path d="M5 2.5v4.8a4 4 0 0 0 8 0V2.5"/><path d="M3.6 2.5h2.8"/><path d="M11.6 2.5h2.8"/><path d="M9 11.3v2.9a5.2 5.2 0 0 0 5.2 5.2 4 4 0 0 0 4-4v-2.2"/><circle cx="18.2" cy="11" r="2.2"/>',
  dumbbell:    '<rect x="1.4" y="8.5" width="3.2" height="7" rx="1.2"/><rect x="19.4" y="8.5" width="3.2" height="7" rx="1.2"/><rect x="5" y="6.2" width="3.2" height="11.6" rx="1.3"/><rect x="15.8" y="6.2" width="3.2" height="11.6" rx="1.3"/><path d="M8.2 12h7.6"/>',
  sparkles:    '<path d="m11 3 1.9 5.1L18 10l-5.1 1.9L11 17l-1.9-5.1L4 10l5.1-1.9z"/><path d="m18 14.4.9 2.3 2.3.9-2.3.9-.9 2.3-.9-2.3-2.3-.9 2.3-.9z"/>',
  scissors:    '<circle cx="6" cy="6.2" r="3"/><circle cx="6" cy="17.8" r="3"/><path d="M20.4 3.8 8.2 16"/><path d="M8.2 8 20.4 20.2"/>',
  shirt:       '<path d="M15.2 2.6 12 5 8.8 2.6 3.4 5.6l2.1 4.2 2-1.1V21h9V8.7l2 1.1 2.1-4.2z"/>',
  baby:        '<circle cx="12" cy="9" r="6.2"/><path d="M9.6 8h.01"/><path d="M14.4 8h.01"/><path d="M9.6 11.4s.9 1.5 2.4 1.5 2.4-1.5 2.4-1.5"/><path d="M7.4 16.4 5.8 21"/><path d="m16.6 16.4 1.6 4.6"/>',
  paw:         '<circle cx="6.4" cy="9.2" r="2.1"/><circle cx="10.2" cy="5.8" r="2.1"/><circle cx="14.6" cy="5.8" r="2.1"/><circle cx="18" cy="9.6" r="2"/><path d="M12.2 11.4c-2.6 0-4.6 2.1-5.6 4.2-1 2.1.3 4.2 2.6 4.2 1 0 2-.5 3-.5s2 .5 3 .5c2.3 0 3.6-2.1 2.6-4.2-1-2.1-3-4.2-5.6-4.2z"/>',
  hand:        '<path d="M7 12.6V5.6a1.5 1.5 0 0 1 3 0v5.4"/><path d="M10 11V4a1.5 1.5 0 0 1 3 0v7"/><path d="M13 11V5.4a1.5 1.5 0 0 1 3 0V13"/><path d="M16 10.6a1.5 1.5 0 0 1 3 0V15a7 7 0 0 1-7 7h-.6a7 7 0 0 1-7-7v-1.4a1.5 1.5 0 0 1 3 0"/>',
  users:       '<circle cx="9" cy="8" r="3.6"/><path d="M2.4 20.4v-1a5 5 0 0 1 5-5h3.2a5 5 0 0 1 5 5v1"/><path d="M16.4 4.9a3.6 3.6 0 0 1 0 6.2"/><path d="M18 14.6a5 5 0 0 1 3.6 4.8v1"/>',

  /* ---------- leisure & learning ---------- */
  film:        '<rect x="2.5" y="4" width="19" height="16" rx="2.4"/><path d="M7 4v16"/><path d="M17 4v16"/><path d="M2.5 12h19"/><path d="M2.5 8h4.5"/><path d="M2.5 16h4.5"/><path d="M17 8h4.5"/><path d="M17 16h4.5"/>',
  music:       '<path d="M9 17.4V5.2l11-2v11.4"/><circle cx="6" cy="17.8" r="3"/><circle cx="17" cy="15.8" r="3"/>',
  gamepad:     '<path d="M7 7.5h10a5 5 0 0 1 5 5v.5a3.6 3.6 0 0 1-6.5 2.1l-.7-1H9.2l-.7 1A3.6 3.6 0 0 1 2 13v-.5a5 5 0 0 1 5-5z"/><path d="M6.8 10.6v3"/><path d="M5.3 12.1h3"/><circle cx="16.4" cy="11" r=".9"/><circle cx="18.4" cy="13.2" r=".9"/>',
  book:        '<path d="M4 19.4V4.6A2.6 2.6 0 0 1 6.6 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.6a2.6 2.6 0 0 1 0-5.2H20"/>',
  'graduation-cap': '<path d="M21.8 8.2 12 3.6 2.2 8.2 12 12.8z"/><path d="M6.2 10.4V16c0 1.8 2.6 3.2 5.8 3.2s5.8-1.4 5.8-3.2v-5.6"/><path d="M21.8 8.2v6"/>',
  camera:      '<path d="M3 8.8a2 2 0 0 1 2-2h2.2l1.2-2.2h7.2l1.2 2.2H19a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><circle cx="12" cy="13" r="3.4"/>',
  'moon-star': '<path d="M20.2 15A8.5 8.5 0 0 1 9 3.8 8.5 8.5 0 1 0 20.2 15z"/><path d="m17.6 2.4.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/>',
  globe:       '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a13.5 13.5 0 0 1 0 18 13.5 13.5 0 0 1 0-18z"/>',
  mail:        '<rect x="2.5" y="5" width="19" height="14" rx="2.2"/><path d="m3.2 7 8.8 6 8.8-6"/>',
  'phone-call':'<path d="M6.6 3.2H4.5A1.5 1.5 0 0 0 3 4.8C3 12.6 10.4 20 18.2 20a1.6 1.6 0 0 0 1.6-1.5v-2.1a1.5 1.5 0 0 0-1.2-1.5l-2.6-.5a1.5 1.5 0 0 0-1.5.6l-.9 1.2a13 13 0 0 1-5-5l1.2-.9a1.5 1.5 0 0 0 .6-1.5l-.5-2.6a1.5 1.5 0 0 0-1.3-1z"/>',
  store:       '<path d="M3.6 9.8V20a1 1 0 0 0 1 1h14.8a1 1 0 0 0 1-1V9.8"/><path d="M2 9.8 4 3.6h16l2 6.2a3 3 0 0 1-5 2.2 3 3 0 0 1-5 0 3 3 0 0 1-5 0 3 3 0 0 1-5-2.2z"/><path d="M9.4 21v-5.6h5.2V21"/>',
  award:       '<circle cx="12" cy="8.6" r="5.8"/><path d="m8.6 13.6-1.4 8 4.8-2.5 4.8 2.5-1.4-8"/>',
  'rotate-ccw':'<path d="M20.5 12a8.5 8.5 0 1 1-2.5-6l3 2.5"/><path d="M21 3v5.5h-5.5"/>',
  'more-horizontal': '<circle cx="5" cy="12" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="19" cy="12" r="1.7"/>',
};

/* Indonesian names — what the icon picker searches on, and the tooltip you
   get on hover. Without these, searching "kopi" would never find `coffee`. */
const ICON_LABELS = {
  utensils: 'makan piring sendok garpu',
  coffee: 'kopi ngopi cafe minum panas',
  'cup-soda': 'minuman es boba jus soda',
  cake: 'kue jajan ulang tahun dessert',
  'shopping-cart': 'belanja harian troli groceries pasar',
  store: 'warung toko usaha dagang',
  'shopping-bag': 'belanja tas shopping',
  package: 'paket kiriman barang online',
  tag: 'harga diskon label jual',
  gift: 'hadiah kado bingkisan thr',
  truck: 'pengiriman ongkir truk logistik',
  ticket: 'tiket karcis konser masuk',
  car: 'mobil kendaraan taksi',
  bike: 'motor sepeda ojek',
  bus: 'bus kereta angkot transportasi umum',
  plane: 'pesawat terbang travel liburan',
  fuel: 'bensin bbm pom solar isi',
  parking: 'parkir tol retribusi',
  wrench: 'servis bengkel perbaikan kunci',
  home: 'rumah tangga kebutuhan',
  building: 'gedung kantor apartemen',
  key: 'sewa kos kontrakan kunci',
  bed: 'hotel penginapan kasur tidur',
  zap: 'listrik token pln setrum',
  droplet: 'air pdam galon',
  flame: 'gas lpg elpiji api kompor',
  wifi: 'internet wifi kuota indihome',
  smartphone: 'pulsa hp telepon ponsel',
  laptop: 'laptop komputer freelance kerja',
  receipt: 'tagihan pajak struk nota admin',
  shield: 'asuransi proteksi jaminan bpjs',
  newspaper: 'koran media berita langganan',
  repeat: 'langganan bulanan berulang subscription',
  umbrella: 'payung proteksi dana darurat',
  plant: 'tanaman kebun bunga tumbuh',
  heart: 'kesehatan cinta sehat',
  pill: 'obat apotek vitamin',
  stethoscope: 'dokter klinik rumah sakit periksa',
  dumbbell: 'olahraga gym fitness',
  sparkles: 'perawatan diri skincare kecantikan',
  scissors: 'salon potong rambut barber',
  shirt: 'pakaian baju fashion laundry',
  baby: 'anak bayi popok susu',
  paw: 'peliharaan kucing anjing hewan',
  users: 'keluarga teman sosial patungan',
  hand: 'donasi zakat sedekah amal infak',
  film: 'film bioskop nonton hiburan',
  music: 'musik lagu spotify konser',
  gamepad: 'game nongkrong main hiburan',
  book: 'buku baca novel',
  'graduation-cap': 'pendidikan sekolah kuliah kursus les',
  camera: 'kamera foto fotografi',
  'moon-star': 'ibadah masjid religi kurban',
  globe: 'internasional luar negeri global',
  mail: 'surat email pos',
  'phone-call': 'telepon pulsa hubungi',
  wallet: 'dompet tunai cash',
  banknote: 'uang tunai kertas cash',
  coins: 'koin tabungan receh simpanan',
  'piggy-bank': 'celengan menabung tabungan',
  landmark: 'bank rekening bunga atm',
  'credit-card': 'kartu kredit debit cicilan',
  briefcase: 'gaji kerja kantor pekerjaan',
  safe: 'brankas simpanan aman deposito',
  award: 'bonus penghargaan prestasi thr',
  'trending-up': 'investasi untung naik saham',
  'trending-down': 'rugi turun minus',
  'chart-pie': 'laporan komposisi analisa',
  'chart-bar': 'statistik grafik data',
  scale: 'neraca timbang seimbang',
  'rotate-ccw': 'refund kembali balik retur',
  target: 'target tujuan goal rencana',
  star: 'favorit bintang penting',
  clock: 'waktu jam durasi',
  calendar: 'jadwal tanggal kalender',
  'more-horizontal': 'lain lainnya serba misc',
};

function iconLabel(name) {
  const s = ICON_LABELS[name] || name;
  return s.split(' ')[0].replace(/^./, c => c.toUpperCase());
}

/* Icons offered in the custom-category icon picker, grouped for browsing. */
const ICON_GROUPS = [
  { label: 'Makan & Minum', names: ['utensils', 'coffee', 'cup-soda', 'cake', 'shopping-cart', 'store'] },
  { label: 'Belanja',       names: ['shopping-bag', 'package', 'tag', 'gift', 'truck', 'ticket'] },
  { label: 'Transportasi',  names: ['car', 'bike', 'bus', 'plane', 'fuel', 'parking', 'wrench'] },
  { label: 'Rumah & Tagihan', names: ['home', 'building', 'key', 'bed', 'zap', 'droplet', 'flame', 'wifi', 'smartphone', 'laptop', 'receipt', 'shield', 'repeat', 'newspaper', 'umbrella', 'plant'] },
  { label: 'Kesehatan & Diri', names: ['heart', 'pill', 'stethoscope', 'dumbbell', 'sparkles', 'scissors', 'shirt', 'baby', 'paw', 'users', 'hand'] },
  { label: 'Hiburan & Belajar', names: ['film', 'music', 'gamepad', 'book', 'graduation-cap', 'camera', 'moon-star', 'globe', 'mail', 'phone-call'] },
  { label: 'Uang & Kerja',  names: ['wallet', 'banknote', 'coins', 'piggy-bank', 'landmark', 'credit-card', 'briefcase', 'safe', 'award', 'trending-up', 'trending-down', 'chart-pie', 'chart-bar', 'scale', 'rotate-ccw', 'target', 'star', 'clock', 'calendar', 'more-horizontal'] },
];

const POCKET_ICONS = ['wallet', 'landmark', 'smartphone', 'credit-card', 'piggy-bank', 'coins', 'safe', 'banknote', 'briefcase', 'home', 'target', 'star'];

/* Soft, low-contrast palette — nothing neon, nothing that buzzes. */
const PALETTE = [
  '#C9897A', '#D2A26B', '#C6B074', '#A8B983', '#83B394', '#7FB0AC',
  '#8AA7C4', '#9AA0C9', '#AF9BC2', '#C695A9', '#B79C8E', '#9EA79B',
  '#CBA08C', '#A5B7C6', '#B6AE96', '#8FA8A0',
];

function icon(name, size = 22, cls = '') {
  const body = ICONS[name] || ICONS['more-horizontal'];
  return `<svg class="ico ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"
    aria-hidden="true">${body}</svg>`;
}

/* A rounded tinted square holding an icon — used everywhere for categories. */
function iconBubble(name, color, size = 38, iconSize = 20, cls = '') {
  return `<span class="bubble ${cls}" style="width:${size}px;height:${size}px;background:${tint(color)};color:${color}">
    ${icon(name, iconSize)}
  </span>`;
}

/* Translucent wash of a colour that works on both light and dark surfaces. */
function tint(hex, alpha = 0.16) {
  const c = hex.replace('#', '');
  const n = parseInt(c.length === 3 ? c.split('').map(x => x + x).join('') : c, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}
