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


