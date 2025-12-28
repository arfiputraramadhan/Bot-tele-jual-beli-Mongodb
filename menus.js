
const { Markup } = require('telegraf');
const { db } = require('./database');

const formatRp = (n) => {
    try {
        const num = Number(n) || 0;
        return `Rp${num.toLocaleString('id-ID')}`;
    } catch {
        return `Rp${n || 0}`;
    }
};

// Emoji untuk tampilan yang konsisten
const EMOJI = {
    LOGO: '🎮',
    HOME: '🏠',
    SHOP: '🛍️',
    SCRIPT: '🤖',
    DEPOSIT: '💳',
    PROFILE: '👤',
    INFO: '📢',
    ADMIN: '👑',
    BACK: '↩️',
    REFRESH: '🔄',
    ADD: '➕',
    DELETE: '🗑️',
    SETTINGS: '⚙️',
    STATS: '📊',
    USERS: '👥',
    TRANSACTION: '💰',
    PENDING: '⏳',
    SUCCESS: '✅',
    ERROR: '❌',
    WARNING: '⚠️',
    NEXT: '▶️',
    PREV: '◀️',
    CALENDAR: '📅',
    CLOCK: '⏰',
    DOWNLOAD: '📥',
    UPLOAD: '📤',
    FILE: '📁',
    PHOTO: '🖼️',
    QRCODE: '📱',
    BANK: '🏦',
    WALLET: '💼',
    MONEY: '💵',
    STAR: '⭐',
    CROWN: '👑',
    SHIELD: '🛡️',
    LOCK: '🔒',
    BELL: '🔔',
    MESSAGE: '💬',
    BROADCAST: '📣',
    HELP: '❓',
    LIST: '📋',
    GRAPH: '📈',
    CHECK: '✔️',
    CROSS: '✖️',
    FIRE: '🔥',
    GIFT: '🎁',
    TROPHY: '🏆',
    DIAMOND: '💎',
    COIN: '🪙',
    BAG: '🛍️',
    CART: '🛒',
    BOX: '📦',
    GLOBE: '🌐',
    VERIFIED: '✅',
    HEART: '❤️',
    THUMBS_UP: '👍',
    ZAP: '⚡',
    ROCKET: '🚀',
    CLOUD: '☁️',
    TIME: '⏱️',
    KEY: '🗝️',
    ID_CARD: '🪪',
    CERTIFICATE: '📜',
    RECEIPT: '🧾',
    BARCODE: '📊',
    TOOLS: '🛠️',
    GAME: '🎮',
    DICE: '🎲'
};

const menus = {
    async main(user, isOwner = false) {
        const stats = await db.getUserStats();
        
        // Hitung total pembelian
        const totalPurchases = user.purchased_items?.length || 0;
        const scriptPurchases = user.purchased_items?.filter(item => item.type === 'script').length || 0;
        const productPurchases = user.purchased_items?.filter(item => item.type === 'product').length || 0;
        
        const text = 
            `*🎮 ULTIMATE GAME STORE*\n` +
            `_Platform Jual Beli Akun & Script Premium_\n` +
            `\n` +
            `═══════════════════════\n` +
            `*👤 PROFIL ANDA*\n` +
            `═══════════════════════\n` +
            `👤 *${user.first_name} ${user.last_name || ''}*\n` +
            `🆔 ID: \`${user.id}\`\n` +
            `💰 *Saldo:* ${formatRp(user.balance)}\n` +
            `🏅 *Level:* ${user.level}\n` +
            `🛍️ *Pembelian:* ${totalPurchases} item\n` +
            `   └ 🎮 Game: ${productPurchases}\n` +
            `   └ 🤖 Script: ${scriptPurchases}\n` +
            `\n` +
            `═══════════════════════\n` +
            `*📊 STATISTIK TOKO*\n` +
            `═══════════════════════\n` +
            `👥 *Pengguna:* ${stats.totalUsers}\n` +
            `🎮 *Produk Tersedia:* ${stats.availableProducts}\n` +
            `🤖 *Script Tersedia:* ${stats.availableScripts}\n` +
            `📥 *Total Downloads:* ${stats.totalDownloads}\n` +
            `\n` +
            `═══════════════════════\n` +
            `*📋 MENU UTAMA*\n` +
            `═══════════════════════\n` +
            `Pilih menu di bawah ini:`;
        
        const buttons = [
            [Markup.button.callback(`${EMOJI.SHOP} Etalase Game`, 'nav_shop')],
            [Markup.button.callback(`${EMOJI.SCRIPT} Script Bot`, 'nav_scripts')],
            [Markup.button.callback(`${EMOJI.DEPOSIT} Topup Saldo`, 'nav_deposit')],
            [Markup.button.callback(`${EMOJI.PROFILE} Profil Saya`, 'nav_profile')],
            [Markup.button.callback(`${EMOJI.INFO} Info & Bantuan`, 'nav_info')]
        ];
        
        if (isOwner) {
            buttons.push([Markup.button.callback(`${EMOJI.ADMIN} ADMIN PANEL`, 'nav_admin')]);
        }
        
        return {
            type: 'photo',
            media: process.env.BANNER_URL || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f',
            caption: text,
            parse_mode: 'Markdown',
            reply_markup: Markup.inlineKeyboard(buttons).reply_markup
        };
    },
    
    async profile(user) {
        const joinedDate = new Date(user.joined);
        const lastActive = new Date(user.last_active);
        const daysSinceJoin = Math.floor((new Date() - joinedDate) / (1000 * 60 * 60 * 24));
        
        const purchaseCount = user.purchased_items?.length || 0;
        const scriptCount = user.purchased_items?.filter(item => item.type === 'script').length || 0;
        const productCount = user.purchased_items?.filter(item => item.type === 'product').length || 0;
        
        // Hitung aktivitas bulan ini
        const thisMonth = new Date().getMonth();
        const thisYear = new Date().getFullYear();
        const purchasesThisMonth = user.purchased_items?.filter(item => {
            const purchaseDate = new Date(item.purchased_at);
            return purchaseDate.getMonth() === thisMonth && purchaseDate.getFullYear() === thisYear;
        }).length || 0;
        
        const text = 
            `*👤 PROFIL USER*\n` +
            `_Detail informasi akun Anda_\n` +
            `\n` +
            `═══════════════════════\n` +
            `*📋 INFORMASI AKUN*\n` +
            `═══════════════════════\n` +
            `👤 *Nama:* ${user.first_name} ${user.last_name || ''}\n` +
            `🆔 *User ID:* \`${user.id}\`\n` +
            `@${user.username || 'tidak_ada'}\n` +
            `\n` +
            `═══════════════════════\n` +
            `*💰 STATISTIK KEUANGAN*\n` +
            `═══════════════════════\n` +
            `💵 *Saldo Saat Ini:* ${formatRp(user.balance)}\n` +
            `📈 *Total Deposit:* ${formatRp(user.total_deposit)}\n` +
            `📉 *Total Belanja:* ${formatRp(user.total_spent)}\n` +
            `🏅 *Level Member:* ${user.level}\n` +
            `\n` +
            `═══════════════════════\n` +
            `*🛍️ AKTIVITAS BELANJA*\n` +
            `═══════════════════════\n` +
            `📦 *Total Pembelian:* ${purchaseCount} item\n` +
            `   └ 🎮 Game Akun: ${productCount}\n` +
            `   └ 🤖 Script Bot: ${scriptCount}\n` +
            `📅 *Bulan Ini:* ${purchasesThisMonth} pembelian\n` +
            `\n` +
            `═══════════════════════\n` +
            `*⏰ AKTIVITAS AKUN*\n` +
            `═══════════════════════\n` +
            `📅 *Bergabung:* ${joinedDate.toLocaleDateString('id-ID')}\n` +
            `⏰ *Aktif Terakhir:* ${lastActive.toLocaleDateString('id-ID')}\n` +
            `📆 *Hari Ke:* ${daysSinceJoin} hari\n` +
            `\n` +
            `═══════════════════════\n` +
            `*🔧 MENU PROFIL*\n` +
            `═══════════════════════`;
        
        return {
            type: 'photo',
            media: process.env.BANNER_URL || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f',
            caption: text,
            parse_mode: 'Markdown',
            reply_markup: Markup.inlineKeyboard([
                [Markup.button.callback(`${EMOJI.DEPOSIT} Topup Saldo`, 'nav_deposit')],
                [Markup.button.callback(`${EMOJI.RECEIPT} Riwayat Belanja`, 'profile_history')],
                [Markup.button.callback(`${EMOJI.SETTINGS} Pengaturan`, 'profile_settings')],
                [Markup.button.callback(`${EMOJI.REFRESH} Update Profil`, 'profile_update')],
                [Markup.button.callback(`${EMOJI.HOME} Beranda`, 'nav_home')]
            ]).reply_markup
        };
    },
    
    async shop(page = 0) {
        const products = await db.getAvailableProducts();
        
        if (products.length === 0) {
            return {
                type: 'text',
                text: 
                    `*🛍️ ETALASE GAME*\n` +
                    `_Koleksi akun game premium_\n` +
                    `\n` +
                    `═══════════════════════\n` +
                    `*📭 ETALASE KOSONG*\n` +
                    `═══════════════════════\n` +
                    `⚠️ Maaf, saat ini belum ada produk game yang tersedia.\n` +
                    `\n` +
                    `*💡 Saran:*\n` +
                    `• Cek menu Script Bot untuk alternatif\n` +
                    `• Hubungi admin untuk request game tertentu\n` +
                    `• Coba lagi nanti\n` +
                    `\n` +
                    `*📞 Support:* @sokkk91`,
                parse_mode: 'Markdown',
                reply_markup: Markup.inlineKeyboard([
                    [Markup.button.callback(`${EMOJI.SCRIPT} Lihat Script Bot`, 'nav_scripts')],
                    [Markup.button.callback(`${EMOJI.REFRESH} Refresh`, 'nav_shop')],
                    [Markup.button.callback(`${EMOJI.HOME} Beranda`, 'nav_home')]
                ]).reply_markup
            };
        }
        
        const product = products[page];
        const totalPages = products.length;
        
        const text = 
            `*🎮 DETAIL PRODUK*\n` +
            `_${product.name}_\n` +
            `\n` +
            `═══════════════════════\n` +
            `*📋 INFORMASI PRODUK*\n` +
            `═══════════════════════\n` +
            `🏷️ *Nama:* ${product.name}\n` +
            `💰 *Harga:* ${formatRp(product.price)}\n` +
            `🔐 *Login Method:* ${product.login_method}\n` +
            `⭐ *Status:* Tersedia\n` +
            `📅 *Ditambahkan:* ${new Date(product.created_at).toLocaleDateString('id-ID')}\n` +
            `🆔 *Product ID:* \`${product.id}\`\n` +
            `\n` +
            `═══════════════════════\n` +
            `*📝 DESKRIPSI*\n` +
            `═══════════════════════\n` +
            `${product.description || 'Tidak ada deskripsi'}\n` +
            `\n` +
            `═══════════════════════\n` +
            `*📄 NAVIGASI*\n` +
            `═══════════════════════\n` +
            `Halaman ${page + 1} dari ${totalPages}`;
        
        const buttons = [
            [Markup.button.callback(`${EMOJI.CART} BELI SEKARANG ${EMOJI.FIRE}`, `buy_${product.id}`)],
            [
                Markup.button.callback(`${EMOJI.PREV} Sebelumnya`, `page_${page - 1}`, page === 0),
                Markup.button.callback(`${page + 1}/${totalPages}`, 'noop', true),
                Markup.button.callback(`Selanjutnya ${EMOJI.NEXT}`, `page_${page + 1}`, page === totalPages - 1)
            ],
            [Markup.button.callback(`${EMOJI.SCRIPT} Script Bot`, 'nav_scripts')],
            [Markup.button.callback(`${EMOJI.HOME} Beranda`, 'nav_home')]
        ];
        
        return {
            type: 'photo',
            media: product.photo_id || process.env.BANNER_URL,
            caption: text,
            parse_mode: 'Markdown',
            reply_markup: Markup.inlineKeyboard(buttons).reply_markup
        };
    },
    
    async scripts(page = 0) {
        const scripts = await db.getAvailableScripts();
        
        if (scripts.length === 0) {
            return {
                type: 'text',
                text: 
                    `*🤖 SCRIPT BOT*\n` +
                    `_Koleksi script automation premium_\n` +
                    `\n` +
                    `═══════════════════════\n` +
                    `*📭 SCRIPT KOSONG*\n` +
                    `═══════════════════════\n` +
                    `⚠️ Maaf, saat ini belum ada script bot yang tersedia.\n` +
                    `\n` +
                    `*💡 Saran:*\n` +
                    `• Cek menu Etalase Game untuk alternatif\n` +
                    `• Hubungi admin untuk request script tertentu\n` +
                    `• Coba lagi nanti\n` +
                    `\n` +
                    `*📞 Support:* @sokkk91`,
                parse_mode: 'Markdown',
                reply_markup: Markup.inlineKeyboard([
                    [Markup.button.callback(`${EMOJI.SHOP} Lihat Etalase Game`, 'nav_shop')],
                    [Markup.button.callback(`${EMOJI.REFRESH} Refresh`, 'nav_scripts')],
                    [Markup.button.callback(`${EMOJI.HOME} Beranda`, 'nav_home')]
                ]).reply_markup
            };
        }
        
        const script = scripts[page];
        const totalPages = scripts.length;
        
        const text = 
            `*🤖 DETAIL SCRIPT*\n` +
            `_${script.name}_\n` +
            `\n` +
            `═══════════════════════\n` +
            `*📋 INFORMASI SCRIPT*\n` +
            `═══════════════════════\n` +
            `🏷️ *Nama:* ${script.name}\n` +
            `💰 *Harga:* ${formatRp(script.price)}\n` +
            `📁 *File:* ${script.file_name}\n` +
            `📦 *Ukuran:* ${Math.round(script.file_size / 1024)} KB\n` +
            `📥 *Downloads:* ${script.downloads}\n` +
            `⭐ *Status:* Tersedia\n` +
            `📅 *Ditambahkan:* ${new Date(script.created_at).toLocaleDateString('id-ID')}\n` +
            `🆔 *Script ID:* \`${script.id}\`\n` +
            `\n` +
            `═══════════════════════\n` +
            `*📝 DESKRIPSI*\n` +
            `═══════════════════════\n` +
            `${script.description || 'Tidak ada deskripsi'}\n` +
            `\n` +
            `═══════════════════════\n` +
            `*🔧 FITUR UTAMA*\n` +
            `═══════════════════════\n` +
            `${script.features || 'Tidak ada fitur'}\n` +
            `\n` +
            `═══════════════════════\n` +
            `*📄 NAVIGASI*\n` +
            `═══════════════════════\n` +
            `Halaman ${page + 1} dari ${totalPages}`;
        
        const buttons = [
            [Markup.button.callback(`${EMOJI.CART} BELI SEKARANG ${EMOJI.FIRE}`, `buy_script_${script.id}`)],
            [
                Markup.button.callback(`${EMOJI.PREV} Sebelumnya`, `script_page_${page - 1}`, page === 0),
                Markup.button.callback(`${page + 1}/${totalPages}`, 'noop', true),
                Markup.button.callback(`Selanjutnya ${EMOJI.NEXT}`, `script_page_${page + 1}`, page === totalPages - 1)
            ],
            [Markup.button.callback(`${EMOJI.SHOP} Etalase Game`, 'nav_shop')],
            [Markup.button.callback(`${EMOJI.HOME} Beranda`, 'nav_home')]
        ];
        
        return {
            type: 'text',
            text: text,
            parse_mode: 'Markdown',
            reply_markup: Markup.inlineKeyboard(buttons).reply_markup
        };
    },
    
    async deposit(user, settings) {
        const text = 
            `*💳 TOPUP SALDO*\n` +
            `_Tambah saldo untuk berbelanja_\n` +
            `\n` +
            `═══════════════════════\n` +
            `*💰 SALDO ANDA*\n` +
            `═══════════════════════\n` +
            `💵 *Saldo Saat Ini:* ${formatRp(user.balance)}\n` +
            `📈 *Total Deposit:* ${formatRp(user.total_deposit)}\n` +
            `📉 *Total Belanja:* ${formatRp(user.total_spent)}\n` +
            `\n` +
            `═══════════════════════\n` +
            `*📊 LIMIT DEPOSIT*\n` +
            `═══════════════════════\n` +
            `⬇️ *Minimal:* ${formatRp(settings.min_deposit)}\n` +
            `⬆️ *Maksimal:* ${formatRp(settings.max_deposit)}\n` +
            `\n` +
            `═══════════════════════\n` +
            `*🏦 METODE PEMBAYARAN*\n` +
            `═══════════════════════\n` +
            `Pilih metode pembayaran:`;
        
        return {
            type: 'text',
            text: text,
            parse_mode: 'Markdown',
            reply_markup: Markup.inlineKeyboard([
                [Markup.button.callback(`${EMOJI.QRCODE} QRIS (Instan)`, 'deposit_method_qris')],
                [Markup.button.callback(`${EMOJI.BANK} Transfer Bank`, 'deposit_method_bank')],
                [Markup.button.callback(`${EMOJI.WALLET} E-Wallet`, 'deposit_method_ewallet')],
                [Markup.button.callback(`${EMOJI.HELP} Cara Deposit`, 'deposit_guide')],
                [Markup.button.callback(`${EMOJI.HOME} Beranda`, 'nav_home')]
            ]).reply_markup
        };
    },
    
    async info() {
        const text = 
            `*📢 INFO & BANTUAN*\n` +
            `_Informasi lengkap tentang toko kami_\n` +
            `\n` +
            `═══════════════════════\n` +
            `*⏰ JAM OPERASIONAL*\n` +
            `═══════════════════════\n` +
            `🕐 24/7 - Setiap Hari\n` +
            `⚡ Proses: Instan\n` +
            `📞 Support: @sokkk91\n` +
            `\n` +
            `═══════════════════════\n` +
            `*🛡️ GARANSI PRODUK*\n` +
            `═══════════════════════\n` +
            `✅ 7 Hari setelah pembelian\n` +
            `✅ Akun tidak bisa login\n` +
            `✅ Script error/tidak work\n` +
            `\n` +
            `═══════════════════════\n` +
            `*🎮 PRODUK GAME*\n` +
            `═══════════════════════\n` +
            `• Akun premium berbagai game\n` +
            `• Email & password langsung\n` +
            `• Garansi login 100%\n` +
            `• Ready stock terupdate\n` +
            `\n` +
            `═══════════════════════\n` +
            `*🤖 SCRIPT BOT*\n` +
            `═══════════════════════\n` +
            `• File dikirim otomatis\n` +
            `• Support berbagai format\n` +
            `• Panduan setup included\n` +
            `• Update berkala\n` +
            `\n` +
            `═══════════════════════\n` +
            `*⚠️ SYARAT & KETENTUAN*\n` +
            `═══════════════════════\n` +
            `1. Tidak ada refund setelah akun/file dikirim\n` +
            `2. Garansi hanya untuk masalah teknis\n` +
            `3. Dilarang memperjualbelikan ulang\n` +
            `4. Script hanya untuk penggunaan pribadi\n` +
            `\n` +
            `❤️ *Terima kasih telah berbelanja di Ultimate Game Store!*`;
        
        return {
            type: 'text',
            text: text,
            parse_mode: 'Markdown',
            reply_markup: Markup.inlineKeyboard([
                [Markup.button.callback(`${EMOJI.HOME} Beranda`, 'nav_home'), Markup.button.callback(`${EMOJI.SHOP} Etalase`, 'nav_shop')],
                [Markup.button.callback(`${EMOJI.SCRIPT} Script`, 'nav_scripts'), Markup.button.callback(`${EMOJI.DEPOSIT} Topup`, 'nav_deposit')]
            ]).reply_markup
        };
    },
    
    // Method lainnya tetap sama seperti sebelumnya...
    // Saya akan ambil dari versi sebelumnya yang sudah bagus
    
    async admin() {
        const stats = await db.getUserStats();
        
        const text = 
            `*👑 ADMIN PANEL*\n` +
            `_Panel administrator Ultimate Game Store_\n` +
            `\n` +
            `═══════════════════════\n` +
            `*📊 STATISTIK SISTEM*\n` +
            `═══════════════════════\n` +
            `👥 *Pengguna:* ${stats.totalUsers}\n` +
            `🎮 *Produk:* ${stats.totalProducts} (${stats.availableProducts} tersedia)\n` +
            `🤖 *Script:* ${stats.totalScripts} (${stats.availableScripts} tersedia)\n` +
            `📥 *Downloads:* ${stats.totalDownloads}\n` +
            `⏳ *Pending:* ${stats.pendingDeposits}\n` +
            `💰 *Deposit:* ${formatRp(stats.totalDeposit)}\n` +
            `💸 *Penjualan:* ${formatRp(stats.totalSales)}\n` +
            `📈 *Transaksi:* ${stats.totalTransactions}\n` +
            `\n` +
            `═══════════════════════\n` +
            `*📋 MENU ADMINISTRATOR*\n` +
            `═══════════════════════\n` +
            `Pilih opsi di bawah:`;
        
        return {
            type: 'text',
            text: text,
            parse_mode: 'Markdown',
            reply_markup: Markup.inlineKeyboard([
                [Markup.button.callback(`${EMOJI.ADD} Tambah Produk`, 'admin_add_product'), Markup.button.callback(`${EMOJI.ADD} Tambah Script`, 'admin_add_script')],
                [Markup.button.callback(`${EMOJI.BOX} Kelola Produk`, 'admin_manage_products'), Markup.button.callback(`${EMOJI.SCRIPT} Kelola Script`, 'admin_manage_scripts')],
                [Markup.button.callback(`${EMOJI.USERS} Kelola User`, 'admin_manage_users'), Markup.button.callback(`${EMOJI.PENDING} Deposit Pending`, 'admin_pending_deposits')],
                [Markup.button.callback(`${EMOJI.TRANSACTION} Transaksi`, 'admin_manage_deposits'), Markup.button.callback(`${EMOJI.BROADCAST} Broadcast`, 'admin_broadcast')],
                [Markup.button.callback(`${EMOJI.STATS} Laporan`, 'admin_stats'), Markup.button.callback(`${EMOJI.SETTINGS} Settings`, 'admin_settings')],
                [Markup.button.callback(`${EMOJI.HOME} Beranda`, 'nav_home')]
            ]).reply_markup
        };
    },
    
    // Method lainnya tetap dipertahankan...
    async qrisPayment(amount, depositId) {
        const text = 
            `*📱 PAYMENT QRIS*\n` +
            `_Pembayaran via QR Code_\n` +
            `\n` +
            `═══════════════════════\n` +
            `*💰 DETAIL TRANSAKSI*\n` +
            `═══════════════════════\n` +
            `💵 *Nominal:* ${formatRp(amount)}\n` +
            `🆔 *Deposit ID:* \`${depositId}\`\n` +
            `⏰ *Batas Waktu:* 30 menit\n` +
            `⏳ *Status:* Menunggu Pembayaran\n` +
            `\n` +
            `═══════════════════════\n` +
            `*📋 INSTRUKSI*\n` +
            `═══════════════════════\n` +
            `1. Scan QR Code di atas\n` +
            `2. Bayar sesuai nominal\n` +
            `3. Screenshot bukti bayar\n` +
            `4. Kirim bukti ke bot ini\n` +
            `\n` +
            `═══════════════════════\n` +
            `*⚠️ PERHATIAN*\n` +
            `═══════════════════════\n` +
            `• Pastikan nominal transfer sesuai\n` +
            `• Proses verifikasi 1-15 menit\n` +
            `• Hubungi admin jika ada masalah`;
        
        return {
            type: 'photo',
            media: process.env.QRIS_URL || 'https://images.unsplash.com/photo-1589666564459-93cdd3c7de32',
            caption: text,
            parse_mode: 'Markdown',
            reply_markup: Markup.inlineKeyboard([
                [Markup.button.callback(`${EMOJI.CROSS} Batalkan`, 'deposit_cancel')],
                [Markup.button.callback(`${EMOJI.BACK} Kembali`, 'nav_deposit')],
                [Markup.button.callback(`${EMOJI.HOME} Beranda`, 'nav_home')]
            ]).reply_markup
        };
    },
    
    async bankTransfer(amount, depositId) {
        const text = 
            `*🏦 TRANSFER BANK*\n` +
            `_Pembayaran via Transfer Bank_\n` +
            `\n` +
            `═══════════════════════\n` +
            `*💰 DETAIL TRANSAKSI*\n` +
            `═══════════════════════\n` +
            `💵 *Nominal:* ${formatRp(amount)}\n` +
            `🆔 *Deposit ID:* \`${depositId}\`\n` +
            `⏰ *Batas Waktu:* 30 menit\n` +
            `⏳ *Status:* Menunggu Pembayaran\n` +
            `\n` +
            `═══════════════════════\n` +
            `*🏦 REKENING TUJUAN*\n` +
            `═══════════════════════\n` +
            `Bank: BCA\n` +
            `Nomor: 1234567890\n` +
            `Atas Nama: ULTIMATE STORE\n` +
            `\n` +
            `Bank: BRI\n` +
            `Nomor: 0987654321\n` +
            `Atas Nama: ULTIMATE STORE\n` +
            `\n` +
            `═══════════════════════\n` +
            `*📋 INSTRUKSI*\n` +
            `═══════════════════════\n` +
            `1. Transfer ke rekening di atas\n` +
            `2. Jumlah transfer harus tepat\n` +
            `3. Screenshot bukti transfer\n` +
            `4. Kirim bukti ke bot ini\n` +
            `\n` +
            `═══════════════════════\n` +
            `*⚠️ PERHATIAN*\n` +
            `═══════════════════════\n` +
            `• Tambahkan kode unik jika diperlukan\n` +
            `• Proses verifikasi 1-15 menit`;
        
        return {
            type: 'text',
            text: text,
            parse_mode: 'Markdown',
            reply_markup: Markup.inlineKeyboard([
                [Markup.button.callback(`${EMOJI.CROSS} Batalkan`, 'deposit_cancel')],
                [Markup.button.callback(`${EMOJI.HOME} Beranda`, 'nav_home')]
            ]).reply_markup
        };
    },
    
    async eWallet(amount, depositId) {
        const text = 
            `*💼 E-WALLET*\n` +
            `_Pembayaran via E-Wallet_\n` +
            `\n` +
            `═══════════════════════\n` +
            `*💰 DETAIL TRANSAKSI*\n` +
            `═══════════════════════\n` +
            `💵 *Nominal:* ${formatRp(amount)}\n` +
            `🆔 *Deposit ID:* \`${depositId}\`\n` +
            `⏰ *Batas Waktu:* 30 menit\n` +
            `⏳ *Status:* Menunggu Pembayaran\n` +
            `\n` +
            `═══════════════════════\n` +
            `*📱 NOMOR E-WALLET*\n` +
            `═══════════════════════\n` +
            `DANA/OVO/GoPay/ShopeePay\n` +
            `087782738443\n` +
            `Atas Nama: ULTIMATE STORE\n` +
            `\n` +
            `═══════════════════════\n` +
            `*📋 INSTRUKSI*\n` +
            `═══════════════════════\n` +
            `1. Transfer ke nomor di atas\n` +
            `2. Jumlah transfer harus tepat\n` +
            `3. Screenshot bukti transfer\n` +
            `4. Kirim bukti ke bot ini`;
        
        return {
            type: 'text',
            text: text,
            parse_mode: 'Markdown',
            reply_markup: Markup.inlineKeyboard([
                [Markup.button.callback(`${EMOJI.CROSS} Batalkan`, 'deposit_cancel')],
                [Markup.button.callback(`${EMOJI.HOME} Beranda`, 'nav_home')]
            ]).reply_markup
        };
    },
    
    async purchaseHistory(user) {
        const purchases = user.purchased_items || [];
        
        if (purchases.length === 0) {
            return {
                type: 'text',
                text: 
                    `*🧾 RIWAYAT BELANJA*\n` +
                    `_Daftar pembelian Anda_\n` +
                    `\n` +
                    `═══════════════════════\n` +
                    `*📭 RIWAYAT KOSONG*\n` +
                    `═══════════════════════\n` +
                    `⚠️ Anda belum memiliki riwayat pembelian.\n` +
                    `\n` +
                    `*💡 Mulai belanja:*\n` +
                    `• Kunjungi etalase game\n` +
                    `• Cek script bot premium\n` +
                    `• Topup saldo terlebih dahulu\n` +
                    `\n` +
                    `*🔥 Produk Populer:*\n` +
                    `• Akun game premium\n` +
                    `• Script automation\n` +
                    `• Tools bot trading`,
                parse_mode: 'Markdown',
                reply_markup: Markup.inlineKeyboard([
                    [Markup.button.callback(`${EMOJI.SHOP} Etalase Game`, 'nav_shop')],
                    [Markup.button.callback(`${EMOJI.SCRIPT} Script Bot`, 'nav_scripts')],
                    [Markup.button.callback(`${EMOJI.BACK} Kembali ke Profil`, 'nav_profile')]
                ]).reply_markup
            };
        }
        
        let historyText = 
            `*🧾 RIWAYAT BELANJA*\n` +
            `_Daftar pembelian Anda_\n` +
            `\n` +
            `═══════════════════════\n` +
            `*📋 TOTAL PEMBELIAN*\n` +
            `═══════════════════════\n` +
            `📦 Total Item: ${purchases.length}\n` +
            `💵 Total Belanja: ${formatRp(user.total_spent)}\n` +
            `\n` +
            `═══════════════════════\n` +
            `*🛍️ DAFTAR PEMBELIAN*\n` +
            `═══════════════════════\n`;
        
        purchases.slice(0, 5).forEach((item, index) => {
            const date = new Date(item.purchased_at).toLocaleDateString('id-ID');
            const typeIcon = item.type === 'script' ? EMOJI.SCRIPT : EMOJI.GAME;
            
            historyText += 
                `${index + 1}. ${typeIcon} *${item.product_name || item.script_name}*\n` +
                `   💰 ${formatRp(item.price)}\n` +
                `   📅 ${date}\n`;
            
            if (item.type === 'script') {
                historyText += `   📁 ${item.file_name}\n`;
            }
            
            historyText += '\n';
        });
        
        if (purchases.length > 5) {
            historyText += `📄 ... dan ${purchases.length - 5} item lainnya\n\n`;
        }
        
        historyText += `═══════════════════════\n` +
                      `*📊 RINGKASAN*\n` +
                      `═══════════════════════\n` +
                      `💵 Total Belanja: ${formatRp(user.total_spent)}\n` +
                      `📅 Total Transaksi: ${purchases.length}`;
        
        return {
            type: 'text',
            text: historyText,
            parse_mode: 'Markdown',
            reply_markup: Markup.inlineKeyboard([
                [Markup.button.callback(`${EMOJI.BACK} Kembali ke Profil`, 'nav_profile')],
                [Markup.button.callback(`${EMOJI.HOME} Beranda`, 'nav_home')]
            ]).reply_markup
        };
    },
    
    profileSettings() {
        return {
            type: 'text',
            text: 
                `*⚙️ PENGATURAN PROFIL*\n` +
                `_Kelola akun Anda_\n` +
                `\n` +
                `═══════════════════════\n` +
                `*🚧 DALAM PENGEMBANGAN*\n` +
                `═══════════════════════\n` +
                `⚠️ Fitur pengaturan sedang dalam pengembangan.\n` +
                `\n` +
                `*💡 Untuk perubahan data akun:*\n` +
                `• Hubungi admin @sokkk91\n` +
                `• Kirim permintaan perubahan\n` +
                `• Tunggu konfirmasi admin\n` +
                `\n` +
                `*🔜 FITUR YANG AKAN DATANG:*\n` +
                `• Ubah nama tampilan\n` +
                `• Ganti password akun\n` +
                `• Notifikasi setting\n` +
                `• Privacy options\n` +
                `• Two-factor authentication`,
            parse_mode: 'Markdown',
            reply_markup: Markup.inlineKeyboard([
                [Markup.button.callback(`${EMOJI.BACK} Kembali ke Profil`, 'nav_profile')],
                [Markup.button.callback(`${EMOJI.HOME} Beranda`, 'nav_home')]
            ]).reply_markup
        };
    },
    
    profileUpdate() {
        return {
            type: 'text',
            text: 
                `*🔄 UPDATE PROFIL*\n` +
                `_Sinkronisasi data Telegram_\n` +
                `\n` +
                `═══════════════════════\n` +
                `*📋 CARA UPDATE*\n` +
                `═══════════════════════\n` +
                `1. Ubah di settings Telegram Anda\n` +
                `2. Klik tombol 'Update Profil' lagi\n` +
                `3. Data akan otomatis terupdate\n` +
                `\n` +
                `═══════════════════════\n` +
                `*ℹ️ INFORMASI*\n` +
                `═══════════════════════\n` +
                `Bot hanya membaca data dari Telegram\n` +
                `\n` +
                `*📊 DATA YANG DIUPDATE:*\n` +
                `• Nama depan/belakang\n` +
                `• Username\n` +
                `• Foto profil\n` +
                `• Bio/profile info\n` +
                `\n` +
                `*⚠️ CATATAN:*\n` +
                `• Perubahan username bisa mempengaruhi tag\n` +
                `• Pastikan data Telegram Anda valid\n` +
                `• Proses update bersifat real-time`,
            parse_mode: 'Markdown',
            reply_markup: Markup.inlineKeyboard([
                [Markup.button.callback(`${EMOJI.REFRESH} Update Sekarang`, 'nav_profile')],
                [Markup.button.callback(`${EMOJI.BACK} Kembali ke Profil`, 'nav_profile')]
            ]).reply_markup
        };
    },
    
    depositGuide() {
        return {
            type: 'text',
            text: 
                `*❓ CARA DEPOSIT*\n` +
                `_Panduan lengkap topup saldo_\n` +
                `\n` +
                `═══════════════════════\n` +
                `*📋 LANGKAH-LANGKAH*\n` +
                `═══════════════════════\n` +
                `1. ${EMOJI.DEPOSIT} Pilih menu 'Topup Saldo'\n` +
                `2. ${EMOJI.CHOOSE} Pilih metode pembayaran\n` +
                `3. ${EMOJI.KEYBOARD} Masukkan nominal deposit\n` +
                `4. ${EMOJI.QRCODE} Ikuti instruksi pembayaran\n` +
                `5. ${EMOJI.PHOTO} Kirim bukti pembayaran\n` +
                `6. ${EMOJI.CLOCK} Tunggu verifikasi admin\n` +
                `7. ${EMOJI.SUCCESS} Saldo otomatis ditambahkan\n` +
                `\n` +
                `═══════════════════════\n` +
                `*⚠️ PERHATIAN PENTING*\n` +
                `═══════════════════════\n` +
                `• Pastikan nominal transfer sesuai\n` +
                `• Kirim bukti yang jelas dan terbaca\n` +
                `• Proses verifikasi 1-15 menit\n` +
                `• Hubungi admin jika ada masalah\n` +
                `\n` +
                `═══════════════════════\n` +
                `*⏰ WAKTU PROSES*\n` +
                `═══════════════════════\n` +
                `📱 QRIS: 1-5 menit\n` +
                `🏦 Bank: 1-15 menit\n` +
                `💼 E-Wallet: 1-10 menit\n` +
                `\n` +
                `═══════════════════════\n` +
                `*📞 SUPPORT*\n` +
                `═══════════════════════\n` +
                `Admin: @sokkk91\n` +
                `24/7 Support`,
            parse_mode: 'Markdown',
            reply_markup: Markup.inlineKeyboard([
                [Markup.button.callback(`${EMOJI.DEPOSIT} Mulai Deposit`, 'nav_deposit')],
                [Markup.button.callback(`${EMOJI.HOME} Beranda`, 'nav_home')]
            ]).reply_markup
        };
    },
    
    // Method admin lainnya tetap sama...
    async adminManageProducts() {
        const products = await db.getAvailableProducts();
        
        if (products.length === 0) {
            return {
                type: 'text',
                text: 
                    `*📦 KELOLA PRODUK*\n` +
                    `_Manajemen produk game_\n` +
                    `\n` +
                    `═══════════════════════\n` +
                    `*📭 PRODUK KOSONG*\n` +
                    `═══════════════════════\n` +
                    `⚠️ Tidak ada produk game yang tersedia.\n` +
                    `\n` +
                    `*💡 Mulai tambah produk:*\n` +
                    `• Klik tombol 'Tambah Produk'\n` +
                    `• Isi data lengkap produk\n` +
                    `• Upload foto produk\n` +
                    `• Produk langsung aktif\n` +
                    `\n` +
                    `*🎯 TIPS:*\n` +
                    `• Gunakan foto yang menarik\n` +
                    `• Deskripsi yang detail\n` +
                    `• Harga kompetitif`,
                parse_mode: 'Markdown',
                reply_markup: Markup.inlineKeyboard([
                    [Markup.button.callback(`${EMOJI.ADD} Tambah Produk Game`, 'admin_add_product')],
                    [Markup.button.callback(`${EMOJI.SCRIPT} Kelola Script`, 'admin_manage_scripts')],
                    [Markup.button.callback(`${EMOJI.BACK} Kembali ke Admin`, 'nav_admin')]
                ]).reply_markup
            };
        }
        
        let text = 
            `*📦 KELOLA PRODUK*\n` +
            `_Manajemen produk game_\n` +
            `\n` +
            `═══════════════════════\n` +
            `*📊 STATISTIK*\n` +
            `═══════════════════════\n` +
            `📦 Total: ${products.length} produk tersedia\n` +
            `\n` +
            `═══════════════════════\n` +
            `*🛍️ DAFTAR PRODUK*\n` +
            `═══════════════════════\n`;
        
        products.slice(0, 5).forEach((p, i) => {
            text += `${i+1}. *${p.name}*\n`;
            text += `   💰 ${formatRp(p.price)}\n`;
            text += `   📅 ${new Date(p.created_at).toLocaleDateString('id-ID')}\n`;
            text += `   🗑️ Hapus: /delete_product_${p.id}\n\n`;
        });
        
        if (products.length > 5) text += `📄 ... dan ${products.length - 5} produk lainnya\n\n`;
        
        text += `═══════════════════════\n` +
               `*⚠️ PERHATIAN*\n` +
               `═══════════════════════\n` +
               `Klik tombol di bawah untuk menghapus produk.`;
        
        const buttons = [];
        
        products.slice(0, 5).forEach((p, i) => {
            buttons.push([Markup.button.callback(`${EMOJI.DELETE} Hapus "${p.name.substring(0, 20)}..."`, `delete_product_${p.id}`)]);
        });
        
        buttons.push(
            [Markup.button.callback(`${EMOJI.ADD} Tambah Produk Baru`, 'admin_add_product')],
            [Markup.button.callback(`${EMOJI.REFRESH} Refresh`, 'admin_manage_products')],
            [Markup.button.callback(`${EMOJI.BACK} Kembali ke Admin`, 'nav_admin')]
        );
        
        return {
            type: 'text',
            text: text,
            parse_mode: 'Markdown',
            reply_markup: Markup.inlineKeyboard(buttons).reply_markup
        };
    },
    
    async adminManageScripts() {
        const scripts = await db.getAvailableScripts();
        
        if (scripts.length === 0) {
            return {
                type: 'text',
                text: 
                    `*🤖 KELOLA SCRIPT*\n` +
                    `_Manajemen script bot_\n` +
                    `\n` +
                    `═══════════════════════\n` +
                    `*📭 SCRIPT KOSONG*\n` +
                    `═══════════════════════\n` +
                    `⚠️ Tidak ada script bot yang tersedia.\n` +
                    `\n` +
                    `*💡 Mulai tambah script:*\n` +
                    `• Klik tombol 'Tambah Script'\n` +
                    `• Upload file script\n` +
                    `• Isi data lengkap\n` +
                    `• Script langsung aktif\n` +
                    `\n` +
                    `*🎯 TIPS:*\n` +
                    `• Kompres file ke .zip\n` +
                    `• Deskripsi yang jelas\n` +
                    `• Fitur yang menarik`,
                parse_mode: 'Markdown',
                reply_markup: Markup.inlineKeyboard([
                    [Markup.button.callback(`${EMOJI.ADD} Tambah Script Bot`, 'admin_add_script')],
                    [Markup.button.callback(`${EMOJI.BOX} Kelola Produk`, 'admin_manage_products')],
                    [Markup.button.callback(`${EMOJI.BACK} Kembali ke Admin`, 'nav_admin')]
                ]).reply_markup
            };
        }
        
        let text = 
            `*🤖 KELOLA SCRIPT*\n` +
            `_Manajemen script bot_\n` +
            `\n` +
            `═══════════════════════\n` +
            `*📊 STATISTIK*\n` +
            `═══════════════════════\n` +
            `🤖 Total: ${scripts.length} script tersedia\n` +
            `📥 Total Downloads: ${scripts.reduce((sum, s) => sum + s.downloads, 0)}\n` +
            `\n` +
            `═══════════════════════\n` +
            `*📋 DAFTAR SCRIPT*\n` +
            `═══════════════════════\n`;
        
        scripts.slice(0, 5).forEach((s, i) => {
            text += `${i+1}. *${s.name}*\n`;
            text += `   💰 ${formatRp(s.price)}\n`;
            text += `   📥 ${s.downloads} downloads\n`;
            text += `   📁 ${s.file_name}\n`;
            text += `   🗑️ Hapus: /delete_script_${s.id}\n\n`;
        });
        
        if (scripts.length > 5) text += `📄 ... dan ${scripts.length - 5} script lainnya\n\n`;
        
        text += `═══════════════════════\n` +
               `*⚠️ PERHATIAN*\n` +
               `═══════════════════════\n` +
               `Klik tombol di bawah untuk menghapus script.`;
        
        const buttons = [];
        
        scripts.slice(0, 5).forEach((s, i) => {
            buttons.push([Markup.button.callback(`${EMOJI.DELETE} Hapus "${s.name.substring(0, 20)}..."`, `delete_script_${s.id}`)]);
        });
        
        buttons.push(
            [Markup.button.callback(`${EMOJI.ADD} Tambah Script Baru`, 'admin_add_script')],
            [Markup.button.callback(`${EMOJI.REFRESH} Refresh`, 'admin_manage_scripts')],
            [Markup.button.callback(`${EMOJI.BACK} Kembali ke Admin`, 'nav_admin')]
        );
        
        return {
            type: 'text',
            text: text,
            parse_mode: 'Markdown',
            reply_markup: Markup.inlineKeyboard(buttons).reply_markup
        };
    },
    
    async adminManageUsers() {
        const users = await db.getUsers();
        const totalBalance = users.reduce((sum, user) => sum + user.balance, 0);
        
        let text = 
            `*👥 KELOLA USER*\n` +
            `_Manajemen pengguna_\n` +
            `\n` +
            `═══════════════════════\n` +
            `*📊 STATISTIK USER*\n` +
            `═══════════════════════\n` +
            `👥 Total User: ${users.length}\n` +
            `💰 Total Saldo: ${formatRp(totalBalance)}\n` +
            `📈 Rata-rata Saldo: ${formatRp(Math.round(totalBalance / users.length))}\n` +
            `\n` +
            `═══════════════════════\n` +
            `*👤 USER TERBARU*\n` +
            `═══════════════════════\n`;
        
        const recentUsers = users.slice(0, 5);
        recentUsers.forEach((user, i) => {
            const joined = new Date(user.joined).toLocaleDateString('id-ID');
            text += `${i+1}. ${user.first_name}\n`;
            text += `   💰 ${formatRp(user.balance)}\n`;
            text += `   📅 ${joined}\n\n`;
        });
        
        if (users.length > 5) text += `📄 ... dan ${users.length - 5} user lainnya`;
        
        return {
            type: 'text',
            text: text,
            parse_mode: 'Markdown',
            reply_markup: Markup.inlineKeyboard([
                [Markup.button.callback(`${EMOJI.SEARCH} Detail Semua User`, 'admin_user_details')],
                [Markup.button.callback(`${EMOJI.BACK} Kembali ke Admin`, 'nav_admin')]
            ]).reply_markup
        };
    },
    
    async adminManageDeposits() {
        const transactions = await db.getTransactions('deposit');
        const totalDeposit = transactions.reduce((sum, t) => sum + t.amount, 0);
        
        let text = 
            `*💰 TRANSAKSI DEPOSIT*\n` +
            `_Riwayat deposit user_\n` +
            `\n` +
            `═══════════════════════\n` +
            `*📊 STATISTIK DEPOSIT*\n` +
            `═══════════════════════\n` +
            `📈 Total Transaksi: ${transactions.length}\n` +
            `💰 Total Nominal: ${formatRp(totalDeposit)}\n` +
            `📅 Rata-rata: ${formatRp(Math.round(totalDeposit / (transactions.length || 1)))}\n` +
            `\n` +
            `═══════════════════════\n` +
            `*🕒 DEPOSIT TERBARU*\n` +
            `═══════════════════════\n`;
        
        const recentDeposits = transactions.slice(0, 5);
        if (recentDeposits.length === 0) {
            text += `⚠️ Tidak ada data deposit.`;
        } else {
            recentDeposits.forEach((deposit, i) => {
                const time = new Date(deposit.timestamp).toLocaleString('id-ID');
                text += `${i+1}. User ${deposit.user_id}\n`;
                text += `   💰 ${formatRp(deposit.amount)}\n`;
                text += `   ⏰ ${time}\n\n`;
            });
        }
        
        return {
            type: 'text',
            text: text,
            parse_mode: 'Markdown',
            reply_markup: Markup.inlineKeyboard([
                [Markup.button.callback(`${EMOJI.PENDING} Lihat Pending`, 'admin_pending_deposits')],
                [Markup.button.callback(`${EMOJI.BACK} Kembali ke Admin`, 'nav_admin')]
            ]).reply_markup
        };
    },
    
    async adminPendingDeposits() {
        const pendingDeposits = await db.getPendingDeposits();
        
        let text = 
            `*⏳ DEPOSIT PENDING*\n` +
            `_Deposit menunggu verifikasi_\n` +
            `\n` +
            `═══════════════════════\n` +
            `*📊 STATISTIK*\n` +
            `═══════════════════════\n` +
            `⏳ Total Pending: ${pendingDeposits.length}\n` +
            `💰 Total Nominal: ${formatRp(pendingDeposits.reduce((sum, d) => sum + d.amount, 0))}\n` +
            `\n` +
            `═══════════════════════\n` +
            `*📋 DAFTAR PENDING*\n` +
            `═══════════════════════\n`;
        
        if (pendingDeposits.length === 0) {
            text += `✅ Tidak ada deposit pending.`;
        } else {
            pendingDeposits.forEach((deposit, i) => {
                const time = new Date(deposit.created_at).toLocaleString('id-ID');
                text += 
                    `${i+1}. *Deposit ID:* \`${deposit.id}\`\n` +
                    `   👤 User: ${deposit.user_id}\n` +
                    `   💰 ${formatRp(deposit.amount)}\n` +
                    `   ${deposit.method === 'QRIS' ? '📱' : deposit.method === 'BANK' ? '🏦' : '💼'} ${deposit.method}\n` +
                    `   ⏰ ${time}\n\n`;
            });
        }
        
        return {
            type: 'text',
            text: text,
            parse_mode: 'Markdown',
            reply_markup: Markup.inlineKeyboard([
                [Markup.button.callback(`${EMOJI.REFRESH} Refresh`, 'admin_pending_deposits')],
                [Markup.button.callback(`${EMOJI.BACK} Kembali`, 'admin_manage_deposits')]
            ]).reply_markup
        };
    },
    
    async adminStats() {
        const stats = await db.getUserStats();
        
        const text = 
            `*📊 LAPORAN STATISTIK*\n` +
            `_Analisis performa toko_\n` +
            `\n` +
            `═══════════════════════\n` +
            `*👥 USER*\n` +
            `═══════════════════════\n` +
            `👥 Total User: ${stats.totalUsers}\n` +
            `\n` +
            `═══════════════════════\n` +
            `*🎮 PRODUK GAME*\n` +
            `═══════════════════════\n` +
            `📦 Total: ${stats.totalProducts}\n` +
            `✅ Tersedia: ${stats.availableProducts}\n` +
            `💰 Terjual: ${stats.soldProducts}\n` +
            `📊 Rate: ${stats.totalProducts > 0 ? Math.round((stats.soldProducts / stats.totalProducts) * 100) : 0}%\n` +
            `\n` +
            `═══════════════════════\n` +
            `*🤖 SCRIPT BOT*\n` +
            `═══════════════════════\n` +
            `📦 Total: ${stats.totalScripts}\n` +
            `✅ Tersedia: ${stats.availableScripts}\n` +
            `💰 Terjual: ${stats.soldScripts}\n` +
            `📥 Downloads: ${stats.totalDownloads}\n` +
            `📊 Rate: ${stats.totalScripts > 0 ? Math.round((stats.soldScripts / stats.totalScripts) * 100) : 0}%\n` +
            `\n` +
            `═══════════════════════\n` +
            `*💰 KEUANGAN*\n` +
            `═══════════════════════\n` +
            `💵 Total Deposit: ${formatRp(stats.totalDeposit)}\n` +
            `🛍️ Total Penjualan: ${formatRp(stats.totalSales)}\n` +
            `📈 Total Transaksi: ${stats.totalTransactions}\n` +
            `⏳ Deposit Pending: ${stats.pendingDeposits}`;
        
        return {
            type: 'text',
            text: text,
            parse_mode: 'Markdown',
            reply_markup: Markup.inlineKeyboard([
                [Markup.button.callback(`${EMOJI.REFRESH} Refresh`, 'admin_stats')],
                [Markup.button.callback(`${EMOJI.BACK} Kembali ke Admin`, 'nav_admin')]
            ]).reply_markup
        };
    },
    
    async adminUserDetails() {
        const users = await db.getUsers();
        
        let text = 
            `*👥 DETAIL SEMUA USER*\n` +
            `_Informasi lengkap pengguna_\n` +
            `\n` +
            `═══════════════════════\n` +
            `*📊 STATISTIK*\n` +
            `═══════════════════════\n` +
            `👥 Total User: ${users.length}\n` +
            `\n` +
            `═══════════════════════\n` +
            `*📋 DAFTAR USER*\n` +
            `═══════════════════════\n`;
        
        users.slice(0, 10).forEach((user, index) => {
            const joined = new Date(user.joined).toLocaleDateString('id-ID');
            const purchaseCount = user.purchased_items?.length || 0;
            
            text += 
                `${index + 1}. *${user.first_name}*\n` +
                `   🆔 ID: \`${user.id}\`\n` +
                `   💰 ${formatRp(user.balance)}\n` +
                `   🛍️ ${formatRp(user.total_spent)} (${purchaseCount} item)\n` +
                `   📈 ${formatRp(user.total_deposit)}\n` +
                `   📅 ${joined}\n\n`;
        });
        
        if (users.length > 10) text += `📄 ... dan ${users.length - 10} user lainnya`;
        
        return {
            type: 'text',
            text: text.slice(0, 4000),
            parse_mode: 'Markdown',
            reply_markup: Markup.inlineKeyboard([
                [Markup.button.callback(`${EMOJI.BACK} Kembali`, 'admin_manage_users')]
            ]).reply_markup
        };
    },
    
    async adminSettings() {
        const settings = await db.getSettings();
        
        const maintenanceStatus = settings.maintenance ? `${EMOJI.SIREN} ON` : `${EMOJI.SUCCESS} OFF`;
        
        const text = 
            `*⚙️ SETTINGS ADMIN*\n` +
            `_Konfigurasi sistem_\n` +
            `\n` +
            `═══════════════════════\n` +
            `*🔧 KONFIGURASI SISTEM*\n` +
            `═══════════════════════\n` +
            `⚙️ Maintenance Mode: ${maintenanceStatus}\n` +
            `⬇️ Minimal Deposit: ${formatRp(settings.min_deposit)}\n` +
            `⬆️ Maksimal Deposit: ${formatRp(settings.max_deposit)}\n` +
            `\n` +
            `═══════════════════════\n` +
            `*🎛️ PENGATURAN*\n` +
            `═══════════════════════`;
        
        const maintenanceButtons = settings.maintenance 
            ? [Markup.button.callback(`${EMOJI.SUCCESS} Matikan Maintenance`, 'settings_maintenance_off')]
            : [Markup.button.callback(`${EMOJI.SIREN} Nyalakan Maintenance`, 'settings_maintenance_on')];
        
        return {
            type: 'text',
            text: text,
            parse_mode: 'Markdown',
            reply_markup: Markup.inlineKeyboard([
                maintenanceButtons,
                [Markup.button.callback(`${EMOJI.BACK} Kembali ke Admin`, 'nav_admin')]
            ]).reply_markup
        };
    }
};

menus.formatRp = formatRp;
menus.EMOJI = EMOJI;

module.exports = menus;
