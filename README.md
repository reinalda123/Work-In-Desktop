# Work-in Desktop

Aplikasi desktop Windows (`.exe`) berbasis **Tauri v2 (Rust + Edge WebView2)** untuk [**Work-in**](https://github.com/reinalda123/Work-In) — pelacak kerjaan freelance & kreator konten yang berjalan **100% lokal** dengan tampilan monokrom.

- **Versi Web / HP (PWA):** https://reinalda123.github.io/Work-In/
- **Versi Desktop Windows (`.exe`):** lihat halaman [**Releases**](https://github.com/reinalda123/Work-In-Desktop/releases)

---

## Untuk Pengguna (Cara Download & Install)

1. Buka tab [**Releases**](https://github.com/reinalda123/Work-In-Desktop/releases), lalu unduh file **`Work-in_*_x64-setup.exe`** (~2,34 MB).
2. Jalankan installer tersebut (**tidak butuh hak Administrator**; terpasang khusus untuk akun Windows kamu dengan shortcut di Desktop & Start Menu).
3. **Jika muncul layar biru Windows Defender SmartScreen** (*"Windows protected your PC"*): itu wajar karena installer belum memiliki sertifikat code-signing berbayar. Klik **More info -> Run anyway** untuk melanjutkan instalasi.

### Pindah Data dari Versi Web ke `.exe` (dan Sebaliknya)
Data di browser dan data di aplikasi `.exe` disimpan terpisah agar aman kalau cache browser suatu saat dibersihkan. Untuk memindahkan data:
1. Buka **Pengaturan** di Work-in Web, klik **Ekspor Backup JSON**.
2. Buka **Pengaturan** di aplikasi `.exe` Work-in, klik **Pulihkan dari JSON**, lalu pilih file backup tersebut.

> **Kebutuhan Sistem:** Windows 11 (siap pakai) atau Windows 10 dengan Microsoft Edge WebView2 Runtime (jika belum terpasang di Windows 10 lama, installer akan mengunduhnya otomatis saat instalasi pertama).

---

## Arsitektur Singkat (Developer)

Repo ini dipisahkan dari repo web (**Pola B**) supaya repo web & GitHub Pages tetap murni web/PWA, sementara build desktop membungkus UI yang sama menjadi aplikasi Windows ringan.

- `src-tauri/src/lib.rs` — Setup Tauri v2, `tauri-plugin-single-instance` (fokus ke jendela yang sudah terbuka agar database lokal tidak bentrok), serta `on_navigation` / `on_new_window` + `tauri-plugin-opener` agar link eksternal (`target="_blank"` / WhatsApp) terbuka di browser default Windows.
- `src-tauri/tauri.conf.json` — Konfigurasi window desktop (`1280x820`, min `960x640`, `#E9E9EA`) dan NSIS per-user installer (`installMode: currentUser`).
- `scripts/prepare-renderer.mjs` — Mem-build UI dari sibling `../Work-In` (atau `--remote` dari GitHub), menyalin hasilnya ke `app-dist/`, dan membersihkan aset PWA/Service Worker yang tidak dipakai di desktop.

## Prasyarat & Build Lokal

1. **Node.js** (lihat `.nvmrc`) & **Rust** (`rustup` / `rustc` + `cargo`)
2. **Microsoft Visual Studio C++ Build Tools** (workload *Desktop development with C++*)
3. Repo web [`Work-In`](../Work-In) berada di folder sebelah `Work-In-Desktop`

```powershell
npm install
npm run dev     # Build renderer lokal & buka window Tauri dev
npm run build   # Build NSIS installer ke src-tauri/target/release/bundle/nsis/
```

Build langsung mengambil source UI dari GitHub (`reinalda123/Work-In`):

```powershell
npm run build:remote
```

## Rilis Otomatis via GitHub Actions

1. Pastikan perubahan terbaru di repo web `Work-In` sudah di-push ke `main`.
2. Di repo `Work-In-Desktop`, jalankan workflow **Build Windows Desktop Installer (Tauri)** dari tab **Actions** (*Run workflow*), atau buat & push tag rilis:
   ```powershell
   git tag v1.0.0
   git push origin v1.0.0
   ```
3. File `Work-in_*_x64-setup.exe` akan tersedia di **Actions Artifacts** dan otomatis terlampir di **GitHub Releases** saat push tag.
