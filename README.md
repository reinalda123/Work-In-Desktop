# Work-in Desktop (Tauri v2)

Wrapper desktop Windows (`.exe` NSIS installer ~5–15 MB) berbasis **Tauri v2 (Rust + Edge WebView2)** untuk [**Work-In**](https://github.com/reinalda123/Work-In).

Repo ini dibuat terpisah (**Pola B**) agar repo web & GitHub Pages tetap murni web/PWA, sementara versi `.exe` memakai WebView2 bawaan Windows 10/11 dengan storage IndexedDB terisolasi per pengguna.

## Arsitektur Singkat

- `src-tauri/src/lib.rs` — Setup Tauri v2, `tauri-plugin-single-instance` (mencegah dua jendela berjalan bersamaan), serta `on_navigation` / `on_new_window` + `tauri-plugin-opener` agar link eksternal (`target="_blank"` / WhatsApp) terbuka di browser default Windows.
- `src-tauri/tauri.conf.json` — Konfigurasi window desktop (`1280x820`, min `960x640`, `#E9E9EA`) dan NSIS per-user installer (`installMode: currentUser`).
- `scripts/prepare-renderer.mjs` — Mem-build UI dari sibling `../Work-In` (atau `--remote` dari GitHub), menyalin hasilnya ke `app-dist/`, dan membersihkan aset PWA/Service Worker yang tidak dipakai di desktop.

## Prasyarat Build Lokal Windows

1. **Rust** (`rustup` / `rustc` + `cargo`)
2. **Microsoft Visual Studio C++ Build Tools** (workload *Desktop development with C++* / `Microsoft.VisualStudio.Workload.VCTools`)
3. **Microsoft Edge WebView2 Runtime** (sudah bawaan di Windows 11 & Windows 10 modern)

## Menjalankan & Build di Lokal

Pastikan repo web [`Work-In`](../Work-In) berada di folder sebelah `Work-In-Desktop`:

```powershell
npm install
npm run dev     # Build renderer lokal & buka window Tauri dev
npm run build   # Build NSIS installer ke src-tauri/target/release/bundle/nsis/
```

Build langsung dari GitHub (`reinalda123/Work-In`):

```powershell
npm run build:remote
```

## Rilis Otomatis via GitHub Actions

1. Push perubahan terbaru di repo web `Work-In`.
2. Di repo `Work-In-Desktop`, jalankan workflow **Build Windows Desktop Installer (Tauri)** dari tab **Actions** (*Run workflow*), atau buat & push tag rilis `v1.0.0`.
3. File `Work-in_*_x64-setup.exe` akan tersedia di **Actions Artifacts** dan otomatis terlampir di **GitHub Releases** saat push tag.

> **Catatan untuk Pengguna Windows (SmartScreen):** Karena `.exe` belum memiliki sertifikat code signing berbayar, saat pertama kali membuka installer di PC lain mungkin muncul *"Windows protected your PC"* — klik **More info -> Run anyway**.
