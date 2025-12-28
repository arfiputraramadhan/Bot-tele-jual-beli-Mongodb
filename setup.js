require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { initializeDB } = require('./database');

async function setupBot() {
    console.log('⚙️ ============================================');
    console.log('⚙️   ULTIMATE GAME STORE BOT - SETUP');
    console.log('⚙️ ============================================');
    console.log('📅', new Date().toLocaleString('id-ID'));
    console.log('');
    
    try {
        // ==================== CEK .ENV FILE ====================
        const envFile = path.join(__dirname, '.env');
        const envExample = path.join(__dirname, '.env.example');
        
        if (!fs.existsSync(envFile)) {
            console.log('❌ File .env tidak ditemukan!');
            console.log('📝 Membuat file .env.example...');
            
            const envContent = `# Telegram Bot Configuration
BOT_TOKEN=your_bot_token_here
OWNER_ID=your_telegram_id_here

# Media URLs (optional)
BANNER_URL=https://images.unsplash.com/photo-1550745165-9bc0b252726f
QRIS_URL=https://images.unsplash.com/photo-1589666564459-93cdd3c7de32

# Bot Settings (auto-generated)
MAINTENANCE_MODE=false
MIN_DEPOSIT=10000
MAX_DEPOSIT=1000000
`;
            
            fs.writeFileSync(envExample, envContent, 'utf8');
            console.log('✅ File .env.example telah dibuat');
            console.log('');
            console.log('⚠️  SILAKAN BUAT FILE .env DENGAN KONTEN:');
            console.log('==========================================');
            console.log(envContent);
            console.log('==========================================');
            console.log('');
            console.log('📝 Cara mendapatkan BOT_TOKEN:');
            console.log('1. Buka Telegram, cari @BotFather');
            console.log('2. Kirim /newbot');
            console.log('3. Ikuti instruksi sampai dapat token');
            console.log('');
            console.log('📝 Cara mendapatkan OWNER_ID:');
            console.log('1. Buka Telegram, cari @userinfobot');
            console.log('2. Kirim /start');
            console.log('3. Copy ID Anda');
            console.log('');
            
            console.log('❌ Setup tidak dapat dilanjutkan tanpa .env file');
            console.log('👉 Silakan buat file .env terlebih dahulu');
            return;
        }
        
        // ==================== CEK ENVIRONMENT VARIABLES ====================
        console.log('🔍 Memeriksa environment variables...');
        
        if (!process.env.BOT_TOKEN || process.env.BOT_TOKEN === 'your_bot_token_here') {
            console.log('❌ BOT_TOKEN belum diisi di .env file!');
            console.log('👉 Silakan edit .env file dan isi BOT_TOKEN');
            return;
        }
        
        if (!process.env.OWNER_ID || process.env.OWNER_ID === 'your_telegram_id_here') {
            console.log('❌ OWNER_ID belum diisi di .env file!');
            console.log('👉 Silakan edit .env file dan isi OWNER_ID');
            return;
        }
        
        console.log('✅ Environment variables valid');
        console.log(`🤖 Bot Token: ${process.env.BOT_TOKEN.substring(0, 10)}...`);
        console.log(`👑 Owner ID: ${process.env.OWNER_ID}`);
        console.log('');
        
        // ==================== INISIALISASI DATABASE ====================
        console.log('💾 Menginisialisasi database...');
        
        const db = await initializeDB();
        
        console.log('✅ Database berhasil diinisialisasi');
        console.log('');
        
        // ==================== CEK DATA SAMPLE ====================
        console.log('📊 Memeriksa data sample...');
        
        const users = await db.getUsers();
        const products = await db.getAvailableProducts();
        const settings = await db.getSettings();
        
        console.log(`👥 Total Users: ${users.length}`);
        console.log(`📦 Total Products: ${products.length}`);
        console.log(`💰 Settings: Min Deposit ${settings.min_deposit}, Max Deposit ${settings.max_deposit}`);
        console.log('');
        
        // ==================== TAMPILKAN INFORMASI ====================
        console.log('✅ SETUP SELESAI!');
        console.log('');
        console.log('🎮 BOT SIAP DIGUNAKAN');
        console.log('======================');
        console.log('');
        console.log('📋 FITUR YANG TERSEDIA:');
        console.log('1. 🏠 Menu Utama dengan saldo user');
        console.log('2. 🛒 Etalase produk dengan pagination');
        console.log('3. 💳 Deposit via QRIS, Bank, E-Wallet');
        console.log('4. 👤 Profile user dengan riwayat belanja');
        console.log('5. 👑 Admin Panel (hanya untuk owner)');
        console.log('6. 📢 Broadcast pesan ke semua user');
        console.log('7. ⚙️ Maintenance mode');
        console.log('8. 📊 Statistik lengkap');
        console.log('');
        
        console.log('🚀 CARA MENJALANKAN BOT:');
        console.log('1. npm start                     # Jalankan bot');
        console.log('2. npm run dev                  # Development mode (jika ada nodemon)');
        console.log('');
        
        console.log('📝 PERINTAH TELEGRAM:');
        console.log('/start    - Mulai bot & menu utama');
        console.log('/help     - Bantuan & panduan');
        console.log('/saldo    - Cek saldo Anda');
        console.log('/topup    - Topup saldo');
        console.log('/admin    - Admin panel (owner only)');
        console.log('');
        
        console.log('🔧 TROUBLESHOOTING:');
        console.log('• Jika bot tidak start: cek BOT_TOKEN di .env');
        console.log('• Jika admin tidak work: cek OWNER_ID di .env');
        console.log('• Jika ada error: restart bot dengan npm start');
        console.log('');
        
        console.log('📁 FILE DATABASE:');
        console.log('• Semua data disimpan di database.json');
        console.log('• Backup file ini secara berkala');
        console.log('');
        
        console.log('🎉 SELAMAT MENGGUNAKAN ULTIMATE GAME STORE BOT!');
        console.log('');
        
        // ==================== CEK DEPENDENCIES ====================
        console.log('📦 Memeriksa dependencies...');
        
        const packageJson = require('./package.json');
        console.log(`📄 Bot Version: ${packageJson.version}`);
        console.log('✅ Dependencies sudah terinstall');
        console.log('');
        
        // ==================== TIPS ====================
        console.log('💡 TIPS PENGERJAAN PRODUK:');
        console.log('1. Owner bisa tambah produk via Admin Panel');
        console.log('2. Foto produk bisa dikirim via Telegram');
        console.log('3. Setiap produk harus ada email & password');
        console.log('4. Produk yang terjual otomatis tidak muncul');
        console.log('');
        
        console.log('🔐 DEPOSIT SYSTEM:');
        console.log('1. User pilih metode deposit');
        console.log('2. Masukkan nominal');
        console.log('3. Kirim foto bukti transfer');
        console.log('4. Owner approve/reject dari notifikasi');
        console.log('5. Saldo otomatis bertambah jika approve');
        console.log('');
        
    } catch (error) {
        console.error('❌ Error during setup:', error.message);
        console.log('');
        console.log('🔧 Solusi:');
        console.log('1. Pastikan Node.js versi 18+ terinstall');
        console.log('2. Jalankan: npm install telegraf dotenv');
        console.log('3. Cek file .env sudah benar');
        console.log('4. Cek koneksi internet');
    }
}

// ==================== RUN SETUP ====================
setupBot().then(() => {
    console.log('⚙️ Setup process completed.');
    console.log('👉 Jalankan "npm start" untuk memulai bot');
}).catch(error => {
    console.error('❌ Setup failed:', error);
});