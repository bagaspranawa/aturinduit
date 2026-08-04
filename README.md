# AturinDuit

Pencatat keuangan harian yang ringan. Satu berkas HTML, tanpa server, tanpa
database, tanpa akun. Dirancang untuk dipakai dari HP, tetap nyaman di browser
desktop.

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
| **Data** | `localStorage` + export/import satu berkas JSON |
| **Offline** | penuh, lewat service worker |
| **Bahasa antarmuka** | Indonesia |

---

## Fitur

### Catat cepat

Beranda menampilkan tujuh kategori sebagai pintasan. Ketuk satu, masukkan
nominal di numpad, tekan Simpan — kategori, pocket, dan tanggal sudah terisi.
Ada tombol tambah cepat `+1rb … +500rb`, dan di desktop nominal bisa diketik
langsung lalu Enter.

Pintasannya dipilih otomatis dari kategori yang paling sering dipakai 90 hari
terakhir, atau bisa dikunci manual.

### Pocket

Dompet Tunai, Rekening Bank, E-Wallet, dan Tabungan tersedia sejak awal; satu
di antaranya menjadi default untuk transaksi baru. Tiap pocket punya saldo
awal, target tabungan opsional, serta ikon dan warna sendiri.

Transfer antar-pocket dicatat sebagai jenis terpisah, sehingga tidak mengotori
angka pemasukan dan pengeluaran.

Saldo tidak pernah disimpan — selalu dihitung ulang dari saldo awal ditambah
seluruh transaksi, jadi tidak mungkin melenceng dari riwayatnya.

### Kategori

27 kategori pengeluaran dan 10 pemasukan siap pakai. Semuanya bisa diubah, dan
kategori baru bisa dibuat sendiri: pilih dari ~75 ikon bawaan, beri label
bebas, pilih warna dari palet lembut.

Pencarian ikonnya memakai kata Indonesia — `kopi`, `bensin`, `zakat`, `gaji`,
`ibadah`, `servis`.

Kategori yang sudah terpakai akan **diarsipkan**, bukan dihapus, agar transaksi
lama tetap punya label yang benar.

### Dashboard

| Grafik | Isinya |
| --- | --- |
| Arus kas | Batang pemasukan vs pengeluaran; granularitas harian/mingguan/bulanan/tahunan dipilih otomatis dari panjang periode |
| Komposisi | Donat per kategori dengan persentase |
| Peringkat kategori | Batang horizontal terurut, plus porsi terhadap total |
| Perbandingan | Periode terpilih vs pembanding, total dan rincian per kategori |
| Akumulasi selisih | Grafik area pemasukan dikurangi pengeluaran sepanjang periode |

Ketuk batang atau titik untuk membaca angka periodenya. Ketuk kategori di
grafik mana pun untuk melompat ke daftar transaksinya.

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
Panah naik/turun diwarnai sesuai maknanya: pengeluaran yang naik merah,
pemasukan yang naik hijau.

### Tampilan

Tema terang, gelap, atau ikut sistem. Paletnya sengaja lembut — putih hangat,
aksen sage, warna kategori teredam. Ada juga sakelar *sembunyikan nominal*
untuk membuka aplikasi di tempat ramai.

---

## Menjalankan

**Cara tercepat.** Buka `AturinDuit.html` di browser — dobel-klik di komputer,
atau ketuk dari aplikasi Files di HP. Tidak ada langkah instalasi, dan seluruh
fitur langsung jalan.

**Sebagai aplikasi terpasang.** Sajikan isi folder `docs/` lewat HTTPS, buka di
Chrome, lalu **Add to Home screen**. Hasilnya ikon di layar utama, terbuka
tanpa address bar, dan tetap jalan offline.

Service worker hanya aktif di origin yang aman, jadi mode terpasang butuh
`https://` atau `localhost` — dari `file://` bagian ini diam sendiri tanpa
error.

---

## Penyimpanan data

Data aktif disimpan di **`localStorage`**, dan bisa dibawa keluar-masuk lewat
**satu berkas JSON**. Tidak ada server yang menyimpan apa pun.

Pilihan ini diambil karena sasarannya adalah nol setup: cukup unduh satu berkas
untuk membuat cadangan, dan unggah berkas yang sama untuk memulihkan. Berkasnya
bisa dibaca manusia dan tidak terkunci ke aplikasi ini.

### Export dan import

- **Export** menghasilkan `aturinduit-<profil>-<tanggal>.json`
- **Import → Ganti total** menjadikan isi berkas sebagai data satu-satunya
- **Import → Gabungkan** mempertahankan data yang ada dan menambahkan yang baru

Mode gabung mencocokkan transaksi berdasarkan `id`, sehingga import berulang
tidak menghasilkan duplikat. Kategori dan pocket dicocokkan berdasarkan nama,
supaya data dari perangkat lain tidak beranak.

Batas yang perlu diketahui: mode gabung belum menangani penghapusan (tidak ada
penanda *tombstone*), dan edit lama bisa menimpa yang baru. Cukup untuk
menyatukan dua perangkat sesekali, belum cukup untuk sinkronisasi dua arah
yang berjalan terus.

### Ketahanan data

`localStorage` menempel pada browser di perangkat itu, dan pada alamat halaman.

| Risiko | Bisa dicegah? |
| --- | --- |
| Pengguna menghapus *browsing data* browser | Tidak |
| Browser membuang data karena memori penuh | Ya, lihat di bawah |
| Aplikasi atau browser di-uninstall | Tidak |
| Halaman dibuka dari alamat berbeda | Ya — export lalu import |

Alamat itu penting: membuka berkas lewat `content://` (dari aplikasi chat,
Drive, atau file manager) bisa menghasilkan asal-usul yang berbeda-beda, dan
tiap asal-usul punya penyimpanan sendiri. URL `https://` yang tetap membuat
datanya punya satu rumah.

Saat dipasang sebagai aplikasi, AturinDuit meminta status penyimpanan permanen
lewat `navigator.storage.persist()`, sehingga datanya tidak dibuang otomatis
ketika memori menipis. Statusnya terlihat di **Lainnya → Ketahanan
penyimpanan**. Status ini tidak melindungi dari penghapusan manual.

**Pengingat backup** muncul di Beranda kalau sudah lebih dari 7 hari tidak
export, atau belum pernah sama sekali — dan hanya kalau sudah ada transaksi
yang bisa hilang. Bisa ditutup, dan kembali keesokan harinya.

### Dipakai lebih dari satu orang

Beberapa orang bisa memakai URL yang sama tanpa saling mengganggu: karena
`localStorage` menempel di masing-masing perangkat, catatan mereka terpisah
dengan sendirinya. Tidak ada akun, tidak ada login.

Isian **nama profil** di pengaturan hanya memberi label pada berkas backup
(`aturinduit-rina-2026-08-04.json`) dan ditampilkan saat import, agar berkas
milik orang berbeda tidak tertukar. Ia tidak memengaruhi data sama sekali.

Data baru akan bercampur kalau dua orang memakai **browser yang sama di
perangkat yang sama**.

---

## Format berkas backup

JSON biasa dan rapi, supaya isinya tetap terbaca kalau suatu saat perlu
dipindahkan ke tempat lain.

```json
{
  "version": 1,
  "app": "AturinDuit",
  "exportedAt": "2026-08-04T09:14:00.000Z",
  "profile": "rina",
  "settings":     { "currencySymbol": "Rp", "profileName": "rina",
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
index.html          versi modular, untuk mengembangkan
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
  sw.js             service worker; __BUILD__ dicap saat build
  icon-192.png      juga dipakai sebagai maskable icon
  icon-512.png
build.ps1           membangun kedua keluaran di bawah
AturinDuit.html     hasil bundel satu berkas
docs/               situs siap sajikan (dilayani GitHub Pages)
```

Ketiganya berisi aplikasi yang sama. `index.html` memuat berkas terpisah agar
mudah diedit; `AturinDuit.html` dan `docs/index.html` adalah hasil bundelnya.

---

## Build

```bash
powershell -ExecutionPolicy Bypass -File build.ps1
```

Script-nya menyisipkan seluruh CSS dan JS ke dalam satu HTML, lalu menyalinnya
ke `docs/` bersama manifest, service worker, dan ikon. Service worker diberi
cap build baru setiap kali, sehingga perangkat yang sudah memasang aplikasinya
akan mengambil versi terbaru sendiri.

Tidak perlu Node.js atau toolchain apa pun — hanya PowerShell bawaan Windows.

Kalau `assets/` diedit lalu `index.html` dibuka langsung, naikkan angka `?v=`
di dalamnya supaya browser tidak menyajikan campuran CSS lama dengan JS baru.
Angka itu dibuang otomatis saat bundling.

---

## Deploy

Folder `docs/` sudah siap disajikan apa adanya oleh hosting statis mana pun —
GitHub Pages, Netlify, Cloudflare Pages, atau server sendiri.

Untuk GitHub Pages: **Settings → Pages → Source: branch `main`, folder
`/docs`**. Foldernya bernama `docs` justru karena Pages hanya bisa menyajikan
dari root branch atau `/docs`, sementara root di sini dipakai untuk sumber.

Berkas `.nojekyll` disertakan agar Pages tidak menjalankan Jekyll dan
melewatkan berkas yang tidak dikenalinya.

Repositori publik berarti kodenya terlihat, tetapi catatan keuangan tetap
privat: data tidak pernah meninggalkan browser pengguna, dan `.gitignore`
sengaja memblokir pola berkas backup agar tidak ikut ter-commit.

---

## Catatan teknis

**Shell tanpa `position: fixed`.** Navigasi bawah adalah elemen biasa dalam
aliran layout di dalam kolom setinggi `100dvh`, dan area konten yang
menggulir — bukan dokumen. Chrome di Android menempatkan elemen `fixed`
relatif terhadap *layout viewport*, yang tetap setinggi halaman saat URL bar
tersembunyi, sehingga bar `bottom: 0` tenggelam di bawah area terlihat pada
halaman yang bisa digulir. Membuat navigasi ikut aliran layout menghapus
seluruh kelas bug itu. Bottom sheet juga ditempatkan relatif terhadap shell
dengan alasan yang sama.

**Grafik tanpa library.** Semua renderer menghasilkan string SVG. viewBox-nya
mengikuti lebar render sehingga ukuran teks label tetap wajar, tidak ikut
membesar di layar lebar.

**Satu event handler.** Seluruh interaksi lewat satu listener terdelegasi di
`document` yang membaca atribut `data-*`, jadi render ulang tidak pernah
meninggalkan listener menggantung.

**Scrim dan `backdrop-filter`.** Filter hanya dipasang saat scrim benar-benar
terbuka; pada Chrome, `backdrop-filter` di elemen dengan `opacity: 0` tetap
mengaburkan seluruh halaman di belakangnya.

**Tombol sebagai grid item.** Beberapa baris memakai `<button>` di dalam grid,
dan sebuah tombol mempertahankan ukuran minimum otomatis sebesar lebar
kontennya. Tanpa `min-width: 0` barisnya menolak menyusut dan labelnya tidak
pernah ter-ellipsis.
