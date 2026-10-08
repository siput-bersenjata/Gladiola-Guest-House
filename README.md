# Gladiol — Kos Eksklusif & Guest House Taman Sejuk

Sistem monitoring pembayaran kos dan tagihan listrik bulanan dengan desain botani elegan, pelacakan lokasi berbasis GPS, serta hak akses multi-role (Super Admin, Owner, Operator, dan Anak Kos).

---

## 🌿 Fitur Utama

### 1. Hak Akses & Role Management
- **Super Admin**:
  - Memiliki akses penuh terhadap seluruh fitur sistem.
  - CRUD Akun Pengelola / Operator.
  - **Audit Log Aktivitas Real-time**: Mencatat timestamp, nama user, detail aksi, serta titik koordinat GPS dan nama lokasi.
- **Owner (Pemilik Kos)**:
  - Memantau laporan keuangan bulanan, tingkat okupansi kamar, data tagihan kos dan listrik, serta ulasan staf.
  - *Sesuai aturan keamanan:* Owner **tidak dapat** menambah atau mengubah data anak kos.
- **Operator / Pengelola (Admin Taman)**:
  - Tambah, ubah, dan kelola data anak kos.
  - Validasi pembayaran sewa kamar (Setujui / Tolak / Kuitansi).
  - Input pencatatan meteran listrik bulanan per kamar (otomatis kalkulasi kWh dan tarif).
  - Kelola profil petugas operasional kos dan kontak WhatsApp.
  - Atur nomor rekening bank tujuan transfer & Wi-Fi.
- **Anak Kos (Penghuni)**:
  - **Login hanya menggunakan nomor Handphone** (tanpa ribet kata sandi).
  - Tampilan tagihan bulan ini (rincian sewa kamar + listrik).
  - Fasilitas bulan ini: Nama Wi-Fi & Password kos (dengan tombol salin instan).
  - Daftar kontak WhatsApp petugas operasional & darurat (klik langsung chat).
  - **Rating & Ulasan Petugas Wajib**: Setelah pembayaran tervalidasi, penghuni wajib mengisi kalimat ulasan serta rating (bisa untuk 1 atau seluruh petugas).
  - Riwayat arsip tagihan beberapa bulan sebelumnya.

### 2. Pelacakan & Akses Lokasi Wajib (Geolocation Enforcement)
- Sistem mewajibkan izin akses lokasi saat situs dibuka untuk pemantauan penghuni baru dan lama.
- Integrasi data koordinat resmi **Gladiola Guest House Malang** (`-7.9584011, 112.6059591`).
- Perhitungan jarak radius real-time dari posisi pengguna ke lokasi kos.
- Peta interaktif Google Maps terintegrasi dengan tombol pembuka rute langsung.

### 3. Desain Dinamis & Responsif HP (Mobile-First)
- Mengadopsi estetika **Deep Forest Green** sesuai referensi desain taman sejuk Gladiola.
- Tampilan kartu, grafik spline interaktif, dan progress bar okupansi (50 kamar).
- Desain dinamis pada smartphone: Bottom navigation bar ergonomis, drawer menu, dan tabel responsif tanpa overflow horizontal yang rusak.

---

## 📍 Data Lokasi Gladiola Guest House
- **Alamat**: Jl. Gladiol No. 1, Lowokwaru, Kota Malang, Jawa Timur 65141
- **Koordinat**: `Latitude: -7.9584011, Longitude: 112.6059591`
- **Google Maps**: [Gladiola Guest House - Google Maps](https://www.google.com/maps/place/Gladiola+Guest+House/@-7.9581898,112.6059383,19.75z/data=!4m9!3m8!1s0x2e7882636fac0ba1:0x35903e0a08234e14!5m2!4m1!1i2!8m2!3d-7.9584011!4d112.6059591!16s%2Fg%2F11b6j70yv9)

---

## 🚀 Menjalankan Secara Lokal

```bash
# Install dependencies
npm install

# Jalankan server development
npm run dev

# Build untuk produksi
npm run build
```

---

## 🌐 Deploy ke Vercel
Repository ini telah dikonfigurasi dengan `vercel.json` untuk routing SPA otomatis di Vercel.
Hubungkan repo ini ke Vercel untuk deployment instan.
