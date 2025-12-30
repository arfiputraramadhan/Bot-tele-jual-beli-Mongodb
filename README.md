📦 Ultimate Game Store Bot

https://files.catbox.moe/z5h0d8.png

Sebuah bot Telegram lengkap untuk menjual akun game premium dan script bot otomatis dengan sistem pembayaran QRIS Atlantic terintegrasi.

⚠️ PERHATIAN PENTING

GANTI TOKEN BOT DAN OWNER ID DI FILE .env SEBELUM DIGUNAKAN!
Jangan pakai token orang lain, buat bot sendiri via @BotFather

---

🎯 Fitur Utama

🛒 Jualan Game Account

· ✅ Akun premium berbagai game (Mobile Legends, PUBG, Free Fire, dll)
· ✅ Email & password langsung setelah pembelian
· ✅ Garansi login 7 hari
· ✅ Etalase produk dengan foto & deskripsi

📦 Jualan Script Bot

· ✅ Upload script bot dalam format .zip, .py, .js
· ✅ File otomatis dikirim ke user setelah pembelian
· ✅ Download counter untuk tracking
· ✅ Support file hingga 50MB
· ✅ Fitur tambah stok script - Admin bisa tambah stok tanpa upload ulang

💳 Sistem Pembayaran QRIS Atlantic

· ✅ QRIS Instant - Pembayaran via QR code (1-5 menit)
· ✅ Atlantic API - Sistem pembayaran terpercaya
· ✅ Auto verification - Saldo otomatis masuk setelah bayar
· ✅ QR code generator - Otomatis generate dari string QR
· ✅ Status checking - User bisa cek status kapan saja

👑 Admin Panel Lengkap

· ✅ Tambah/hapus produk game
· ✅ Tambah/hapus script bot
· ✅ Tambah stok script - Update stok tanpa hapus data
· ✅ Broadcast pesan ke semua user
· ✅ Statistics & reports real-time
· ✅ Maintenance mode toggle
· ✅ Kelola settings (min/max deposit)

👤 User Features

· ✅ Profile dengan riwayat belanja
· ✅ Saldo digital real-time
· ✅ Level system (Bronze, Silver, Gold)
· ✅ Riwayat transaksi lengkap
· ✅ Topup saldo via QRIS instan

---

🚀 Instalasi Cepat

Prerequisites

· Node.js v16 atau lebih tinggi
· Telegram Bot Token dari @BotFather
· MongoDB Atlas account (gratis)
· Atlantic API Key (untuk QRIS)

1. Clone Repository

```bash
git clone https://github.com/arfiputraramadhan/Bot-tele-menu-oke-.git
cd Bot-tele-menu-oke-
```

2. Install Dependencies

```bash
npm install
```

3. Konfigurasi Environment

Buat file .env di root directory:

```env
# TELEGRAM CONFIG
BOT_TOKEN=your_bot_token_from_botfather_here
OWNER_ID=your_telegram_user_id_here

# MONGODB DATABASE
MONGODB_URI=mongodb+srv://bebaswww1324_db_user:WLfdbXGhpI6e0YR0@cluster0.xwc3ege.mongodb.net/ultimate_game_store?retryWrites=true&w=majority

# ATLANTIC API (QRIS)
ATLANTIC_API_KEY=io4pdKzLzF30Xykt01X8e0viZddck1Kwgkml
ATLANTIC_API_URL=https://api.atlantich2h.com

# OPTIONAL
BANNER_URL=https://images.unsplash.com/photo-1550745165-9bc0b252726f
```

Cara Mendapatkan Config:

1. BOT_TOKEN: Chat dengan @BotFather → /newbot → Ikuti instruksi → Copy token
2. OWNER_ID: Chat dengan @userinfobot → Copy "ID" Anda
3. MONGODB_URI: Sudah disediakan (gratis database)
4. ATLANTIC_API_KEY: Sudah disediakan (free trial)

4. Jalankan Bot

```bash
# Mode development (auto restart)
npm run dev

# Mode production
npm start
```

5. Test Bot

· Buka Telegram, cari username bot Anda
· Ketik /start
· Bot harus merespon dengan menu utama

---

📁 Struktur File

```
ultimate-game-store-bot/
├── bot.js              # Main bot file & handlers
├── database.js         # MongoDB database system
├── handlers.js         # Message & callback handlers
├── menus.js           # Menu templates & formatting
├── atlantic.js        # Atlantic QRIS API service
├── package.json       # Dependencies
├── .env              # Environment variables (CREATE THIS!)
├── .gitignore        # Git ignore file
└── README.md         # Documentation
```

---

🗄️ Database Structure (MongoDB)

Bot menggunakan MongoDB Atlas dengan struktur:

Collections:

1. users - Data user & saldo
2. products - Produk game account
3. scripts - Script bot files dengan stok system
4. deposits - Deposit history dengan Atlantic integration
5. settings - Bot settings (min deposit, maintenance mode)

---

🎮 Cara Penggunaan

Untuk User Biasa:

1. Start bot: /start
2. Beli game account:
   · Menu utama → 🛒 Etalase Game
   · Pilih game → 🛒 BELI SEKARANG
   · Dapatkan email & password langsung
3. Beli script bot:
   · Menu utama → 🤖 Script Bot
   · Pilih script → 🛒 BELI SEKARANG
   · File otomatis dikirim ke chat
4. Topup saldo via QRIS:
   · Menu utama → 💳 Topup Saldo
   · Pilih "📱 QRIS (ATLANTIC)"
   · Input nominal (min Rp 1.000)
   · Scan QR code & bayar
   · Saldo otomatis masuk dalam 1-5 menit

Untuk Admin/Owner:

1. Akses admin panel: /admin atau klik "👑 ADMIN PANEL"
2. Tambah produk game:
   · Admin Panel → ➕ Tambah Produk
   · Ikuti instruksi step-by-step
3. Tambah script bot:
   · Admin Panel → ➕ Tambah Script
   · Isi data script → Upload file
4. Tambah stok script (FITUR BARU):
   · Admin Panel → 📈 Tambah Stok Script
   · Masukkan ID script (format: Sxxxxxxxxx)
   · Input jumlah stok yang ingin ditambahkan
   · Stok langsung bertambah tanpa hapus data lama
5. Kelola deposit: Otomatis via Atlantic API
6. Broadcast pesan: Admin Panel → 📢 Broadcast
7. Settings: Admin Panel → ⚙️ Settings
   · Maintenance mode ON/OFF
   · Minimal deposit: Rp 1.000 (default)

---

💰 Sistem Pembayaran QRIS Atlantic

Metode Pembayaran:

· ✅ QRIS Atlantic - Instant payment via QR code
· ✅ Auto verification system
· ✅ Status checking real-time
· ✅ QR code generator dari string

Proses Deposit QRIS:

```
User: Input nominal → Generate QR code → Scan & bayar → 
Atlantic: Verify payment → Webhook → Bot: Update saldo → 
User: Saldo bertambah otomatis
```

Settings Deposit:

· Minimal deposit: Rp 1.000 (bisa diubah via code)
· Maksimal deposit: Rp 1.000.000
· Fee: Sesuai Atlantic API
· Waktu proses: 1-5 menit

---

🔧 FITUR TAMBAH STOK SCRIPT (NEW!)

Cara Kerja:

1. Admin klik "📈 Tambah Stok Script"
2. Masukkan ID Script (contoh: S1767057123264)
3. Input jumlah stok yang ingin ditambahkan (1-1000)
4. System:
   · Cek ketersediaan script
   · Tambah stok ke existing stock
   · Auto update status jika stok > 0
   · Beri konfirmasi ke admin

Keuntungan:

· ✅ Tidak perlu upload file ulang
· ✅ Tidak perlu buat produk baru
· ✅ Stok bertambah ke existing stock
· ✅ Status auto update (habis → tersedia)
· ✅ History terjaga

---

🛡️ Security Features

1. Owner-only commands - Hanya owner ID yang bisa akses admin
2. Maintenance mode - Nonaktifkan bot sementara untuk maintenance
3. MongoDB security - Connection dengan SSL
4. Input validation - Validasi semua input user
5. Session management - User states untuk proses multi-step

---

📊 Statistics & Analytics

Bot menyediakan statistik real-time:

· Total users & aktifitas
· Penjualan produk vs script
· Total revenue & deposit
· Download count untuk script
· Stok tersedia & habis
· Atlantic deposit status

---

🔧 Troubleshooting

Common Issues & Solutions:

1. Bot tidak jalan - Token error
   ```bash
   # Cek token di .env
   cat .env | grep BOT_TOKEN
   
   # Test token validity
   curl "https://api.telegram.org/bot<YOUR_TOKEN>/getMe"
   ```
2. MongoDB connection timeout
   ```bash
   # Cek koneksi internet
   ping google.com
   
   # Cek MongoDB URI
   echo $MONGODB_URI
   ```
3. Atlantic QRIS tidak kerja
   · Cek API key di .env
   · Test connection di log bot startup
   · Pastikan saldo Atlantic cukup
4. File script gagal dikirim
   · Pastikan file < 50MB
   · Format: .zip, .rar, .py, .js
   · Compress ke .zip jika file besar

Logs Monitoring:

```bash
# Live monitoring
tail -f bot.log  # atau lihat console output

# Cek error specific
npm start | grep -i "error\|failed\|timeout"
```

---

📈 Scaling & Optimization

Untuk traffic tinggi:

1. Upgrade MongoDB tier dari Atlas dashboard
2. Implement caching dengan Redis (optional)
3. Load balancing multiple bot instances
4. CDN untuk file script besar

Backup database:

```bash
# Backup via MongoDB Atlas dashboard
# Atau gunakan mongodump:
mongodump --uri="YOUR_MONGODB_URI" --out=./backup
```

---

🤝 Contributing

1. Fork repository
2. Create feature branch: git checkout -b feature/AmazingFeature
3. Commit changes: git commit -m 'Add AmazingFeature'
4. Push to branch: git push origin feature/AmazingFeature
5. Open Pull Request

---

📝 License

MIT License - see LICENSE file

---

👨‍💻 Author & Support

Ultimate Game Store Bot

· Telegram: @sokkk91
· Email: arfiofficial@arfi.web.id
· Website: https://arfi.web.id

🙏 Support Development

Jika bot ini membantu bisnis Anda, pertimbangkan untuk:

· ⭐ Star repository ini di GitHub
· 🐛 Laporkan bug/issues di Issues section
· 💡 Suggest new features
· 📢 Share dengan teman sesama seller

---

⚡ Quick Start Commands

```bash
# Install & run di Termux (Android)
pkg update && pkg upgrade
pkg install git nodejs -y
git clone https://github.com/arfiputraramadhan/Bot-tele-menu-oke-.git
cd Bot-tele-menu-oke-
npm install
nano .env  # Edit config (GANTI TOKEN & OWNER_ID!)
npm start
```

---

🎯 Final Notes

· ✅ Minimal deposit: Rp 1.000 (sudah fix di code)
· ✅ Fitur tambah stok script sudah WORK
· ✅ QRIS Atlantic integration ready
· ✅ MongoDB database stable
· ✅ Admin panel lengkap

JANGAN LUPA GANTI:

1. BOT_TOKEN di .env
2. OWNER_ID di .env
3. Test bot sebelum deploy production

---

```
📊 Stats: 1000+ Users | 500+ Products | 24/7 Support
🎯 Mission: Membuat jualan game & script lebih mudah!
🚀 Version: 4.0.0 (Atlantic QRIS + MongoDB Edition)
```

Happy Selling! 🎮📦💰├── database.json     # Auto-generated database
└── README.md         # Documentation
```

🗄️ Database Structure

Bot menggunakan JSON database dengan struktur:

```json
{
  "users": [],           // Data user & saldo
  "products": [],        // Produk game account
  "scripts": [],         // Script bot files
  "transactions": [],    // Riwayat transaksi
  "pendingDeposits": [], // Deposit menunggu verifikasi
  "settings": {}         // Bot settings
}
```

🎮 Cara Penggunaan

Untuk User Biasa:

1. Start bot: /start
2. Beli game account:
   · Menu utama → Etalase Game
   · Pilih game → Beli Sekarang
   · Dapatkan email & password langsung
3. Beli script bot:
   · Menu utama → Script Bot
   · Pilih script → Beli Sekarang
   · File otomatis dikirim ke chat
4. Topup saldo:
   · Menu utama → Topup Saldo
   · Pilih metode pembayaran
   · Kirim bukti transfer
   · Tunggu verifikasi admin (1-15 menit)

Untuk Admin/Owner:

1. Akses admin panel: /admin
2. Tambah produk:
   · Admin Panel → Tambah Produk Game
   · Isi data lengkap (nama, harga, login info)
   · Upload foto produk
3. Tambah script bot:
   · Admin Panel → Tambah Script Bot
   · Isi data script
   · Upload file script (.zip/.py/.js)
4. Kelola deposit:
   · Admin Panel → Deposit Pending
   · Approve/reject deposit user
   · Saldo otomatis ditambahkan jika approve
5. Hapus produk/script:
   · Admin Panel → Kelola Produk / Kelola Script
   · Klik tombol "Hapus"
   · Produk langsung terhapus permanen

💰 Sistem Pembayaran

Metode yang Support:

1. QRIS - Instant payment via QR code
2. Bank Transfer - Manual transfer ke rekening
3. E-Wallet - DANA, OVO, GoPay, ShopeePay

Proses Deposit:

```
User request deposit → Pilih metode → Input nominal → 
Kirim bukti → Admin verifikasi → Saldo bertambah
```

Settings Deposit:

· Minimal deposit: Rp 10.000
· Maksimal deposit: Rp 1.000.000
· Dapat diubah di Admin Panel → Settings

🔧 Troubleshooting

Common Issues:

1. Bot tidak jalan
   ```bash
   # Cek token bot
   echo $BOT_TOKEN
   
   # Cek port tidak terpakai
   netstat -tulpn | grep :3000
   ```
2. Database error
   ```bash
   # Hapus database.json untuk reset
   rm database.json
   # Restart bot
   npm start
   ```
3. File script gagal dikirim
   · Pastikan file < 50MB
   · Format file: .zip, .rar, .py, .js
   · Compress ke .zip jika file besar

Logs Monitoring:

```bash
# Live monitoring logs
tail -f bot.log

# Error logs only
grep -i error bot.log
```

📊 Statistics & Analytics

Bot menyediakan statistik lengkap:

· Total users & aktifitas
· Penjualan produk vs script
· Total revenue & deposit
· Download count untuk script
· Pending transactions

🛡️ Security Features

1. Owner-only commands - Hanya owner ID yang bisa akses admin
2. Maintenance mode - Nonaktifkan bot sementara
3. Data validation - Validasi input user
4. JSON database encryption (optional)

📈 Scaling & Optimization

Untuk traffic tinggi:

1. Gunakan database external (MongoDB/MySQL)
2. Implement caching dengan Redis
3. Load balancing multiple bot instances
4. CDN untuk file script besar

Backup database:

```bash
# Backup harian
cp database.json database_backup_$(date +%Y%m%d).json

# Restore backup
cp database_backup_20240101.json database.json
```

🤝 Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

📝 License

MIT License - see LICENSE file

👨‍💻 Author

Ultimate Game Store Team

· Telegram: @sokkk91
· Email: arfiofficial@arfi.web.id
· Website: https://arfi.web.id

🙏 Support

Jika bot ini membantu bisnis Anda, pertimbangkan untuk:

· ⭐ Star repository ini
· 🐛 Laporkan bug/issues
· 💡 Suggest new features
· 📢 Share dengan teman

---

⭐ Jika Anda suka project ini, jangan lupa kasih star! ⭐

```
📊 Stats: 1000+ Users | 500+ Products | 24/7 Support
🎯 Mission: Membuat jualan game & script lebih mudah!
🚀 Version: 3.0.0 (Stable Release)
```

🚀 Quick Start Commands

```bash
# Install & run
. pkg update && pkg upgrade
. pkg install git
. git clone https://github.com/arfiputraramadhan/Bot-tele-menu-oke-.git
. pkg install nodejs
. cd Bot-tele-menu-oke- && npm install
. nano .env  # Edit config, lalu:
. npm install
. npm start
```

Happy Selling! 🎮📦
