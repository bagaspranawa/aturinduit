# AturinDuit

**[Buka aplikasinya →](https://bagaspranawa.github.io/aturinduit/)**

Pencatat keuangan harian yang ringan. Satu berkas HTML, tanpa server, tanpa
database, tanpa akun. Dirancang untuk layar HP, tetap nyaman di browser desktop.

Tidak ada dependensi sama sekali — tanpa framework, tanpa CDN, tanpa font
eksternal, tanpa satu pun permintaan jaringan saat dipakai. Seluruh grafik dan
ikonnya SVG buatan sendiri.

---

## Sekilas

| | |
| --- | --- |
| **Ukuran** | ~180 KB, satu berkas |
| **Dependensi** | nol |
| **Backend** | tidak ada |
| **Data** | `localStorage`, dipindahkan lewat satu berkas JSON |
| **Offline** | penuh, lewat service worker |
| **Antarmuka** | Bahasa Indonesia |
| **Lisensi** | MIT |

Proyek ini menghasilkan dua bentuk dari sumber yang sama: `AturinDuit.html`
yang berdiri sendiri dan bisa dibuka langsung dari berkas, serta folder `docs/`
berisi situs statis lengkap dengan manifest dan service worker.

---

## Fitur

### Catat cepat

Beranda menampilkan tujuh kategori sebagai pintasan. Satu ketukan membuka
numpad dengan kategori, pocket, dan tanggal yang sudah terisi, sehingga
mencatat satu transaksi hanya perlu memasukkan nominal. Tersedia tombol tambah
cepat `+1rb … +500rb`, dan pada desktop nominal bisa diketik langsung lalu
Enter.

Pintasannya dipilih otomatis dari kategori yang paling sering dipakai 90 hari
terakhir, atau dikunci manual lewat pengaturan.

### Pocket

Dompet Tunai, Rekening Bank, E-Wallet, dan Tabungan tersedia sejak awal; satu
di antaranya menjadi default untuk transaksi baru. Tiap pocket punya saldo
awal, target tabungan opsional, serta ikon dan warna sendiri.

Transfer antar-pocket dicatat sebagai jenis transaksi terpisah, sehingga tidak
mengotori angka pemasukan dan pengeluaran.

Saldo tidak pernah disimpan. Ia selalu dihitung ulang dari saldo awal ditambah
seluruh transaksi, jadi tidak mungkin melenceng dari riwayatnya.

### Kategori

27 kategori pengeluaran dan 10 pemasukan tersedia sejak awal. Semuanya bisa
diubah, dan kategori baru bisa dibuat dengan memilih salah satu dari ~75 ikon
bawaan, memberi label bebas, dan memilih warna dari palet lembut.

Pencarian ikonnya memakai kata Indonesia — `kopi`, `bensin`, `zakat`, `gaji`,
`ibadah`, `servis`.

Kategori yang sudah dipakai transaksi akan **diarsipkan**, bukan dihapus, agar
catatan lama tetap punya label yang benar.

### Dashboard

| Grafik | Isinya |
| --- | --- |
| Arus kas | Batang pemasukan vs pengeluaran; granularitas harian/mingguan/bulanan/tahunan dipilih otomatis dari panjang periode |
| Komposisi | Donat per kategori dengan persentase |
| Peringkat kategori | Batang horizontal terurut, plus porsi terhadap total |
| Perbandingan | Periode terpilih vs pembanding, total dan rincian per kategori |
| Akumulasi selisih | Grafik area pemasukan dikurangi pengeluaran sepanjang periode |

Batang dan titik bisa diketuk untuk membaca angka periodenya. Mengetuk kategori
di grafik mana pun akan melompat ke daftar transaksinya.

### Filter

Bukan sekadar tanggal mulai dan selesai:

- **Cepat** — Hari ini, Kemarin, Minggu ini, Minggu lalu, 7 hari terakhir
- **Bulanan** — Bulan ini, Bulan lalu, 30 hari, 90 hari, Kuartal ini, Kuartal lalu
- **Tahunan** — Tahun ini, Tahun lalu, 12 bulan terakhir, Semua waktu
- **Kustom** — rentang tanggal bebas

Ditambah filter menurut kategori (bisa banyak sekaligus), pocket, jenis
transaksi, dan pencarian teks. Semuanya berlaku serentak untuk grafik,
ringkasan, dan daftar.

### Perbandingan

Mengikuti filter yang sedang aktif, dengan dua mode: *periode sebelumnya* dan
*tahun lalu*.

Mode "periode sebelumnya" sadar kalender — "Bulan ini" dibandingkan dengan
bulan lalu secara utuh, bukan dengan jendela 31 hari yang memotong dua bulan.
Panah naik dan turun diwarnai sesuai maknanya: pengeluaran yang naik merah,
pemasukan yang naik hijau.

### Tampilan

Tema terang, gelap, atau mengikuti sistem. Paletnya sengaja lembut — putih
hangat, aksen sage, warna kategori teredam. Ada pula sakelar *sembunyikan
nominal* yang mengganti semua angka dengan titik.

### Lain-lain

- **Pengingat backup** muncul di Beranda bila sudah lebih dari 7 hari tidak
  export, atau belum pernah sama sekali, dan hanya bila sudah ada transaksi
  yang bisa hilang.
- **Nama profil** opsional yang menandai berkas backup, berguna bila satu
  aplikasi dipakai beberapa orang di perangkat masing-masing. Ia hanya label
  dan tidak memengaruhi data.

---

## Penyimpanan data

Data aktif disimpan di **`localStorage`** dan dipindahkan lewat **satu berkas
JSON**. Tidak ada server yang menyimpan apa pun.

Pendekatan ini dipilih agar tidak ada langkah setup sama sekali: satu unduhan
untuk mencadangkan, satu unggahan untuk memulihkan. Berkasnya terbaca manusia
dan tidak terkunci ke aplikasi ini.

### Export dan import

- **Export** menghasilkan `aturinduit-<profil>-<tanggal>.json`
- **Import → Ganti total** menjadikan isi berkas sebagai data satu-satunya
- **Import → Gabungkan** mempertahankan data yang ada dan menambahkan yang baru

Mode gabung mencocokkan transaksi berdasarkan `id`, sehingga import berulang
tidak menghasilkan duplikat. Kategori dan pocket dicocokkan berdasarkan nama,
supaya data dari perangkat lain tidak beranak.

Batasnya: mode gabung belum menangani penghapusan karena tidak ada penanda
*tombstone*, dan edit yang lebih lama bisa menimpa yang lebih baru. Cukup untuk
menyatukan dua perangkat sesekali, belum cukup untuk sinkronisasi dua arah yang
berjalan terus-menerus.

### Ketahanan data

`localStorage` terikat pada browser di satu perangkat, dan pada asal-usul
(*origin*) halaman. Halaman yang dibuka dari alamat berbeda akan melihat
penyimpanan yang berbeda pula.

| Risiko | Dapat dicegah? |
| --- | --- |
| Pengguna menghapus *browsing data* browser | Tidak |
| Browser membuang data karena memori penuh | Ya |
| Aplikasi atau browser di-uninstall | Tidak |
| Halaman dibuka dari asal-usul berbeda | Ya, lewat export lalu import |

Ketika dipasang sebagai aplikasi, AturinDuit meminta status penyimpanan
permanen lewat `navigator.storage.persist()` sehingga datanya tidak dibuang
otomatis saat memori menipis. Statusnya ditampilkan pada halaman pengaturan.
Status ini tidak melindungi dari penghapusan manual, dan di situlah pengingat
backup berperan.

---

## Format berkas backup

JSON biasa dan rapi, supaya isinya tetap terbaca bila suatu saat perlu
dipindahkan ke tempat lain.

```json
{
  "version": 1,
  "app": "AturinDuit",
  "exportedAt": "2026-08-04T09:14:00.000Z",
  "profile": "utama",
  "settings":     { "currencySymbol": "Rp", "profileName": "utama",
                    "defaultPocketId": "…", "theme": "auto" },
  "pockets":      [ { "id": "…", "name": "Dompet Tunai", "icon": "wallet",
                      "color": "#C9A26B", "kind": "cash", "initial": 0, "target": 0 } ],
  "categories":   [ { "id": "…", "name": "Makan & Minum", "icon": "utensils",
                      "color": "#C9897A", "type": "expense" } ],
  "transactions": [ { "id": "…", "type": "expense", "amount": 25000,
                      "date": "2026-08-04", "categoryId": "…", "pocketId": "…",
                      "note": "makan siang" } ]
}
```

Tanggal disimpan sebagai teks `YYYY-MM-DD`, bukan timestamp, sehingga tidak
pernah bergeser karena zona waktu.

Import bersifat toleran: kolom yang hilang diisi nilai wajar, dan berkas yang
bukan backup AturinDuit ditolak dengan pesan yang jelas alih-alih gagal diam.

---

## Struktur proyek

```
index.html          versi modular, dipakai saat mengembangkan
assets/
  styles.css        design token, tema terang & gelap, layout responsif
  icons.js          ~110 ikon SVG, label pencarian Indonesia, palet warna
  utils.js          tanggal, format rupiah, preset periode, bucketing grafik
  store.js          model data, localStorage, export/import
  charts.js         renderer SVG: donat, batang, area, batang perbandingan
  pwa.js            service worker, penyimpanan permanen, pengingat backup
  ui.js             shell, navigasi, render tiap halaman
  sheets.js         seluruh bottom sheet: input cepat, filter, editor
  main.js           satu event handler terdelegasi, plus bootstrap
pwa/                bahan untuk versi terpasang
  manifest.json     nama, ikon, warna, mode layar penuh
  sw.js             service worker; penanda __BUILD__ dicap saat build
  icon-192.png      juga dipakai sebagai maskable icon
  icon-512.png
build.ps1           membangun kedua keluaran di bawah
AturinDuit.html     hasil bundel satu berkas
docs/               situs statis siap saji
```

`index.html` memuat berkas-berkas terpisah agar mudah diedit. `AturinDuit.html`
dan `docs/index.html` adalah hasil bundelnya — isinya aplikasi yang sama persis.

---

## Build

```bash
powershell -ExecutionPolicy Bypass -File build.ps1
```

Script-nya menyisipkan seluruh CSS dan JS ke dalam satu HTML, lalu menyalinnya
ke `docs/` bersama manifest, service worker, dan ikon. Service worker diberi
cap build baru setiap kali dijalankan, sehingga perangkat yang sudah memasang
aplikasinya akan mengambil versi terbaru dengan sendirinya.

Tidak perlu Node.js atau toolchain apa pun, hanya PowerShell bawaan Windows.

Saat mengembangkan lewat `index.html`, angka `?v=` pada tautan aset perlu
dinaikkan setelah `assets/` diubah agar browser tidak menyajikan campuran CSS
lama dengan JS baru. Angka itu dibuang otomatis ketika dibundel.

---

## Deploy

Folder `docs/` adalah situs statis utuh: `index.html`, `manifest.json`,
`sw.js`, dua berkas ikon, dan `.nojekyll`. Ia bisa disajikan apa adanya oleh
hosting statis mana pun tanpa konfigurasi tambahan.

Namanya `docs` karena GitHub Pages hanya dapat menyajikan dari root sebuah
branch atau dari folder `/docs`, sementara root di repositori ini dipakai untuk
sumber. Berkas `.nojekyll` mencegah Pages memproses situsnya lewat Jekyll.

Service worker hanya aktif pada asal-usul yang aman, jadi mode terpasang
memerlukan `https://` atau `localhost`. Dibuka dari `file://`, bagian PWA diam
dengan sendirinya dan sisa aplikasinya tetap berjalan penuh.

---

## Catatan teknis

**Shell tanpa `position: fixed`.** Navigasi bawah adalah elemen biasa dalam
aliran layout di dalam kolom setinggi `100dvh`, dan yang menggulir adalah area
kontennya, bukan dokumen. Chrome di Android menempatkan elemen `fixed` relatif
terhadap *layout viewport*, yang tetap setinggi halaman saat URL bar
tersembunyi, sehingga bar `bottom: 0` tenggelam di bawah area terlihat pada
halaman yang bisa digulir. Menjadikan navigasi bagian dari aliran layout
menghapus seluruh kelas bug itu. Bottom sheet ditempatkan relatif terhadap
shell dengan alasan yang sama.

**Grafik tanpa library.** Semua renderer menghasilkan string SVG. viewBox-nya
mengikuti lebar render sehingga ukuran teks label tetap wajar dan tidak ikut
membesar di layar lebar.

**Satu event handler.** Seluruh interaksi melewati satu listener terdelegasi di
`document` yang membaca atribut `data-*`, jadi render ulang tidak pernah
meninggalkan listener menggantung.

**Scrim dan `backdrop-filter`.** Filter hanya dipasang ketika scrim benar-benar
terbuka; pada Chrome, `backdrop-filter` pada elemen dengan `opacity: 0` tetap
mengaburkan seluruh halaman di belakangnya.

**Tombol sebagai grid item.** Beberapa baris memakai `<button>` di dalam grid,
dan sebuah tombol mempertahankan ukuran minimum otomatis sebesar lebar
kontennya. Tanpa `min-width: 0`, barisnya menolak menyusut dan labelnya tidak
pernah ter-ellipsis.

**Tanggal sebagai teks.** Seluruh tanggal disimpan dan dibandingkan sebagai
`YYYY-MM-DD` lokal, tidak pernah sebagai timestamp UTC, agar batas hari tidak
bergeser bagi pengguna di zona waktu mana pun.

---

## Lisensi

[MIT](LICENSE) — bebas dipakai, diubah, dan disebarkan, termasuk untuk
keperluan komersial, selama pemberitahuan hak cipta dan lisensinya tetap
disertakan. Perangkat lunak ini diberikan apa adanya, tanpa jaminan.
