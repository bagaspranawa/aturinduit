/* ============================================================
   PWA glue — installability, offline, and storage durability.

   All of this is optional by design: opened straight from a
   file:// path none of it runs, and the app behaves exactly as
   it always has.
   ============================================================ */

const PWA = {
  hosted: location.protocol === 'http:' || location.protocol === 'https:',
  persisted: null,          // null = unknown, true/false once checked

  init() {
    if (!PWA.hosted) return;   // service workers require a secure origin
    PWA.linkManifest();
    PWA.registerWorker();
    PWA.requestPersistence();
  },

  /** Added from script so a file:// run doesn't log a 404 for the manifest. */
  linkManifest() {
    if (document.querySelector('link[rel="manifest"]')) return;
    const link = document.createElement('link');
    link.rel = 'manifest';
    link.href = 'manifest.json';
    document.head.appendChild(link);
  },

  registerWorker() {
    if (!('serviceWorker' in navigator)) return;
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch((err) => {
        console.warn('Service worker tidak aktif:', err.message);
      });
    });
  },

  /**
   * Asks the browser not to evict our data when storage runs low.
   * Chrome usually grants this once the app has been installed.
   * It does NOT protect against the user clearing site data by hand —
   * that is what the backup reminder is for.
   */
  async requestPersistence() {
    if (!navigator.storage || !navigator.storage.persist) return;
    try {
      PWA.persisted = await navigator.storage.persisted();
      if (!PWA.persisted) PWA.persisted = await navigator.storage.persist();
    } catch {
      PWA.persisted = null;
    }
  },

  async usage() {
    if (!navigator.storage || !navigator.storage.estimate) return null;
    try {
      const { usage } = await navigator.storage.estimate();
      return usage || 0;
    } catch {
      return null;
    }
  },

  /** Human-readable storage state for the settings page. */
  statusLabel() {
    if (!PWA.hosted) return 'Dibuka dari berkas lokal';
    if (PWA.persisted === true) return 'Aman — tidak akan dihapus otomatis';
    if (PWA.persisted === false) return 'Standar — bisa dihapus jika memori penuh';
    return 'Memeriksa…';
  },
};

/* ============================================================
   Backup reminder
   ============================================================ */

const BACKUP_NAG_DAYS = 7;

const Backup = {
  dismissed: false,          // per session only, so it returns tomorrow

  /**
   * The last backup as a local 'YYYY-MM-DD' key.
   * Earlier builds stored a UTC ISO timestamp, whose first ten characters
   * are the *UTC* date — an export at 06:00 in UTC+7 would read as
   * yesterday. Both shapes are normalised to the local day here.
   */
  lastKey() {
    const at = Store.data.settings.lastBackupAt;
    if (!at) return null;
    return at.length === 10 ? at : U.key(new Date(at));
  },

  /** Days since the last export, or null if there has never been one. */
  daysSince() {
    const key = Backup.lastKey();
    if (!key) return null;
    return Math.max(0, Math.round((U.parse(U.today()) - U.parse(key)) / 86400000));
  },

  /** Only nags once there is something worth losing. */
  isDue() {
    if (Backup.dismissed) return false;
    if (!Store.data.transactions.length) return false;
    const d = Backup.daysSince();
    return d === null || d >= BACKUP_NAG_DAYS;
  },

  banner() {
    if (!Backup.isDue()) return '';
    const d = Backup.daysSince();
    const line = d === null
      ? 'Belum pernah dicadangkan'
      : `Cadangan terakhir ${d} hari lalu`;

    return `<div class="nag">
      <span class="bubble nag__ico">${icon('alert', 18)}</span>
      <div class="nag__mid">
        <b>${line}</b>
        <span>Simpan satu berkas agar catatanmu aman.</span>
      </div>
      <div class="nag__act">
        <button class="btn btn--sm btn--primary" data-act="export">Export</button>
        <button class="icon-btn" data-act="dismiss-nag"
          aria-label="Tutup pengingat">${icon('x', 17)}</button>
      </div>
    </div>`;
  },
};
