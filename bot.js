require('dotenv').config();
const { Telegraf } = require('telegraf');
const { initializeDB, db } = require('./database'); 
const handlers = require('./handlers');
const AtlanticService = require('./atlantic');

const bot = new Telegraf(process.env.BOT_TOKEN, {
    telegram: {
        apiRoot: 'https://api.telegram.org',
        timeout: 30000,
    },
    handlerTimeout: 60000
});

const userStates = new Map();

async function startBot() {
    console.log('🚀 Ultimate Game Store Bot - ATLANTIC QRIS VERSION');
    console.log('📅', new Date().toLocaleString('id-ID'));
    console.log('👤 Owner ID:', process.env.OWNER_ID || 'Not set');
    
    try {
        await initializeDB();
        console.log('💾 Database initialized');
        
        console.log('\n🔐 Atlantic API Diagnostics:');
        console.log('='.repeat(50));
        
        const apiKey = process.env.ATLANTIC_API_KEY;
        if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
            console.log('❌ ATLANTIC_API_KEY belum diatur di .env!');
            console.log('💡 Tambahkan API Key Atlantic Anda di file .env');
            console.log('ATLANTIC_API_KEY=io4pdKzLzF30Xykt01X8e0viZddck1Kwgkml');
        } else {
            console.log('🔑 API Key:', apiKey.substring(0, 8) + '...' + apiKey.substring(apiKey.length - 4));
            console.log('🌐 API URL:', process.env.ATLANTIC_API_URL);
            
            const testResult = await AtlanticService.testConnection();
            console.log(testResult.message);
        }
        
        console.log('='.repeat(50));
        
        const botInfo = await bot.telegram.getMe();
        console.log('🤖 Bot:', botInfo.username, `(ID: ${botInfo.id})`);
        console.log('✅ Bot connected!');
        
        await bot.telegram.setMyCommands([
            { command: 'start', description: 'Mulai bot & menu utama' },
            { command: 'help', description: 'Bantuan & panduan' },
            { command: 'saldo', description: 'Cek saldo Anda' },
            { command: 'topup', description: 'Topup saldo via QRIS' },
            { command: 'scripts', description: 'Lihat script bot tersedia' },
            { command: 'admin', description: 'Admin panel (owner only)' }
        ]);
        
        await bot.launch({
            dropPendingUpdates: true,
            allowedUpdates: ['message', 'callback_query', 'document']
        });
        
        console.log('🎉 Bot is now running!');
        console.log('📝 Use Ctrl+C to stop');
        
    } catch (error) {
        console.error('❌ Failed to start bot:', error.message);
        process.exit(1);
    }
}

// ==================== COMMAND HANDLERS ====================
bot.start(async (ctx) => {
    const settings = await db.getSettings();
    if (settings.maintenance && ctx.from.id.toString() !== process.env.OWNER_ID) {
        return ctx.reply('🔧 BOT SEDANG DALAM PERBAIKAN\n\nMohon maaf, bot sedang dalam maintenance. Silakan coba lagi nanti.');
    }
    await handlers.showMainMenu(ctx);
});

bot.help(async (ctx) => {
    await ctx.reply(
        '🆘 BANTUAN\n\n' +
        'Perintah yang tersedia:\n' +
        '/start - Mulai bot\n' +
        '/saldo - Cek saldo\n' +
        '/topup - Topup saldo via QRIS\n' +
        '/scripts - Lihat script bot\n' +
        '/admin - Admin panel (owner)\n\n' +
        'Gunakan tombol menu untuk navigasi.'
    );
});

bot.command('saldo', async (ctx) => {
    const user = await db.getUser(ctx.from.id, ctx.from);
    await ctx.reply(
        `💰 SALDO ANDA\n\n` +
        `Saldo: ${handlers.formatRp(user.balance)}\n` +
        `Level: ${user.level}`
    );
});

bot.command('topup', async (ctx) => {
    await handlers.showDepositMenu(ctx);
});

bot.command('scripts', async (ctx) => {
    await handlers.showScriptsMenu(ctx, 0);
});

bot.command('admin', async (ctx) => {
    if (ctx.from.id.toString() !== process.env.OWNER_ID) {
        return ctx.reply('❌ Akses ditolak!');
    }
    await handlers.showAdminPanel(ctx);
});

// ==================== CALLBACK QUERY HANDLERS ====================
bot.action(/^buy_script_(.+)$/, async (ctx) => {
    const scriptId = ctx.match[1];
    await handlers.handleScriptPurchase(ctx, scriptId);
});

bot.action('nav_home', async (ctx) => {
    await handlers.showMainMenu(ctx);
});

bot.action('nav_shop', async (ctx) => {
    await handlers.showShop(ctx, 0);
});

bot.action('nav_scripts', async (ctx) => {
    await handlers.showScriptsMenu(ctx, 0);
});

bot.action('nav_admin', async (ctx) => {
    if (ctx.from.id.toString() !== process.env.OWNER_ID) {
        await ctx.answerCbQuery('❌ Akses ditolak! Hanya owner.', { show_alert: true });
        return;
    }
    await handlers.showAdminPanel(ctx);
});

bot.action('nav_deposit', async (ctx) => {
    await handlers.showDepositMenu(ctx);
});

bot.action('nav_profile', async (ctx) => {
    await handlers.showProfile(ctx);
});

bot.action('nav_info', async (ctx) => {
    await handlers.showInfoMenu(ctx);
});

bot.action('profile_history', async (ctx) => {
    await handlers.showPurchaseHistory(ctx);
});

bot.action('profile_settings', async (ctx) => {
    await handlers.showProfileSettings(ctx);
});

bot.action('profile_update', async (ctx) => {
    await handlers.showProfileUpdate(ctx);
});

bot.action('deposit_method_qris', async (ctx) => {
    try {
        const isValid = await AtlanticService.validateApiKey();
        if (!isValid) {
            await ctx.answerCbQuery('❌ Sistem pembayaran sedang maintenance. Silakan coba lagi nanti.', { show_alert: true });
            return;
        }
        
        userStates.set(ctx.from.id, { 
            action: 'DEPOSIT_AMOUNT_ATLANTIC', 
            method: 'QRIS_ATLANTIC',
            step: 'amount'
        });
        
        const settings = await db.getSettings();
        await ctx.reply(
            '💳 DEPOSIT VIA QRIS (ATLANTIC)\n\n' +
            'Masukkan nominal deposit (angka saja):\n\n' +
            `💰 Minimal: ${handlers.formatRp(settings.min_deposit)}\n` +
            `💵 Maksimal: ${handlers.formatRp(settings.max_deposit)}\n\n` +
            '⚠️ Sistem akan otomatis verifikasi pembayaran\n' +
            '📱 Scan QR untuk bayar, saldo otomatis masuk\n\n' +
            'Contoh: 10000\n\n' +
            'Ketik "cancel" untuk membatalkan'
        );
    } catch (error) {
        console.error('Atlantic validation error:', error);
        await ctx.answerCbQuery('❌ Sistem QRIS sedang gangguan. Silakan coba lagi nanti.', { show_alert: true });
    }
});

bot.action('deposit_guide', async (ctx) => {
    await handlers.showDepositGuide(ctx);
});

bot.action('deposit_cancel', async (ctx) => {
    userStates.delete(ctx.from.id);
    await ctx.reply(
        '❌ DEPOSIT DIBATALKAN\n\n' +
        'Anda telah membatalkan proses deposit.\n' +
        'Kembali ke menu utama untuk memulai ulang.',
        {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '🏠 Beranda', callback_data: 'nav_home' }]
                ]
            }
        }
    );
});

// Admin actions
bot.action('admin_add_product', async (ctx) => {
    if (ctx.from.id.toString() !== process.env.OWNER_ID) {
        await ctx.answerCbQuery('❌ Akses ditolak!', { show_alert: true });
        return;
    }
    
    userStates.set(ctx.from.id, { 
        action: 'ADMIN_ADD_PRODUCT',
        step: 1 
    });
    
    await ctx.reply(
        '➕ TAMBAH PRODUK BARU\n\n' +
        'Masukkan nama produk:\n\n' +
        'Contoh: "Game XYZ Premium Account"\n\n' +
        'Ketik "cancel" untuk membatalkan'
    );
});

bot.action('admin_add_script', async (ctx) => {
    if (ctx.from.id.toString() !== process.env.OWNER_ID) {
        await ctx.answerCbQuery('❌ Akses ditolak!', { show_alert: true });
        return;
    }
    
    userStates.set(ctx.from.id, { 
        action: 'ADMIN_ADD_SCRIPT',
        step: 1 
    });
    
    await ctx.reply(
        '📦 TAMBAH SCRIPT BOT\n\n' +
        'Masukkan nama script bot:\n\n' +
        'Contoh: "Auto Claim Bot", "Mining Bot", "Trading Bot"\n\n' +
        'Ketik "cancel" untuk membatalkan'
    );
});

bot.action('admin_manage_products', async (ctx) => {
    await handlers.showAdminManageProducts(ctx);
});

bot.action('admin_manage_scripts', async (ctx) => {
    await handlers.showAdminManageScripts(ctx);
});

bot.action('admin_manage_users', async (ctx) => {
    await handlers.showAdminManageUsers(ctx);
});

bot.action('admin_manage_deposits', async (ctx) => {
    await handlers.showAdminManageDeposits(ctx);
});

bot.action('admin_pending_deposits', async (ctx) => {
    await handlers.showAdminPendingDeposits(ctx);
});

bot.action('admin_broadcast', async (ctx) => {
    if (ctx.from.id.toString() !== process.env.OWNER_ID) {
        await ctx.answerCbQuery('❌ Akses ditolak!', { show_alert: true });
        return;
    }
    
    userStates.set(ctx.from.id, { action: 'BROADCAST_MESSAGE' });
    
    const users = await db.getUsers();
    
    await ctx.reply(
        `📢 BROADCAST PESAN\n\n` +
        `Masukkan pesan yang ingin dikirim ke semua user:\n\n` +
        `⚠️ PERHATIAN:\n` +
        `• Pesan akan dikirim ke ${users.length} user\n` +
        `• Proses mungkin memakan waktu\n\n` +
        `Ketik "cancel" untuk membatalkan`
    );
});

bot.action('admin_stats', async (ctx) => {
    await handlers.showAdminStats(ctx);
});

bot.action('admin_user_details', async (ctx) => {
    await handlers.showAdminUserDetails(ctx);
});

bot.action(/^delete_product_(.+)$/, async (ctx) => {
    const productId = ctx.match[1];
    
    if (ctx.from.id.toString() !== process.env.OWNER_ID) {
        await ctx.answerCbQuery('❌ Akses ditolak! Hanya owner.', { show_alert: true });
        return;
    }
    
    try {
        const product = await db.getProduct(productId);
        
        if (!product) {
            await ctx.answerCbQuery('❌ Produk tidak ditemukan.', { show_alert: true });
            return;
        }
        
        const success = await db.deleteProduct(productId);
        
        if (success) {
            await ctx.answerCbQuery('✅ Produk berhasil dihapus!', { show_alert: true });
            
            try {
                await ctx.editMessageText(
                    `🗑️ PRODUK DIHAPUS\n\n` +
                    `✅ "${product.name}" berhasil dihapus dari database.\n\n` +
                    `Harga: ${handlers.formatRp(product.price)}\n` +
                    `Status: ❌ DIHAPUS PERMANEN\n\n` +
                    `⚠️ Produk tidak akan muncul lagi di etalase.`,
                    { 
                        reply_markup: {
                            inline_keyboard: [[
                                { text: "📦 Kelola Produk", callback_data: "admin_manage_products" },
                                { text: "🏠 Beranda", callback_data: "nav_home" }
                            ]]
                        }
                    }
                );
            } catch (editError) {
                await ctx.reply(
                    `✅ Produk "${product.name}" berhasil dihapus!`,
                    {
                        reply_markup: {
                            inline_keyboard: [[
                                { text: "📦 Kelola Produk", callback_data: "admin_manage_products" }
                            ]]
                        }
                    }
                );
            }
            
        } else {
            await ctx.answerCbQuery('❌ Gagal menghapus produk.', { show_alert: true });
        }
        
    } catch (error) {
        console.error('Error deleting product:', error);
        await ctx.answerCbQuery('❌ Error menghapus produk.', { show_alert: true });
    }
});

bot.action(/^delete_script_(.+)$/, async (ctx) => {
    const scriptId = ctx.match[1];
    
    if (ctx.from.id.toString() !== process.env.OWNER_ID) {
        await ctx.answerCbQuery('❌ Akses ditolak! Hanya owner.', { show_alert: true });
        return;
    }
    
    try {
        const script = await db.getScript(scriptId);
        
        if (!script) {
            await ctx.answerCbQuery('❌ Script tidak ditemukan.', { show_alert: true });
            return;
        }
        
        const success = await db.deleteScript(scriptId);
        
        if (success) {
            await ctx.answerCbQuery('✅ Script berhasil dihapus!', { show_alert: true });
            
            try {
                await ctx.editMessageText(
                    `🗑️ SCRIPT DIHAPUS\n\n` +
                    `✅ "${script.name}" berhasil dihapus dari database.\n\n` +
                    `Harga: ${handlers.formatRp(script.price)}\n` +
                    `Status: ❌ DIHAPUS PERMANEN\n\n` +
                    `⚠️ Script tidak akan muncul lagi di daftar.`,
                    { 
                        reply_markup: {
                            inline_keyboard: [[
                                { text: "📦 Kelola Script", callback_data: "admin_manage_scripts" },
                                { text: "🏠 Beranda", callback_data: "nav_home" }
                            ]]
                        }
                    }
                );
            } catch (editError) {
                await ctx.reply(
                    `✅ Script "${script.name}" berhasil dihapus!`,
                    {
                        reply_markup: {
                            inline_keyboard: [[
                                { text: "📦 Kelola Script", callback_data: "admin_manage_scripts" }
                            ]]
                        }
                    }
                );
            }
            
        } else {
            await ctx.answerCbQuery('❌ Gagal menghapus script.', { show_alert: true });
        }
        
    } catch (error) {
        console.error('Error deleting script:', error);
        await ctx.answerCbQuery('❌ Error menghapus script.', { show_alert: true });
    }
});

bot.action('admin_settings', async (ctx) => {
    await handlers.showAdminSettings(ctx);
});

bot.action(/^page_(-?\d+)$/, async (ctx) => {
    const page = parseInt(ctx.match[1]);
    await handlers.showShop(ctx, page);
});

bot.action(/^script_page_(-?\d+)$/, async (ctx) => {
    const page = parseInt(ctx.match[1]);
    await handlers.showScriptsMenu(ctx, page);
});

bot.action(/^buy_(.+)$/, async (ctx) => {
    const productId = ctx.match[1];
    await handlers.handlePurchase(ctx, productId);
});

bot.action(/^check_atlantic_(.+)$/, async (ctx) => {
    const depositId = ctx.match[1];
    
    try {
        await ctx.answerCbQuery('🔄 Mengecek status pembayaran...');
        
        const deposit = await db.getPendingDepositByDepositId(depositId);
        if (!deposit || deposit.method !== 'QRIS_ATLANTIC') {
            await ctx.reply('❌ Deposit tidak ditemukan.');
            return;
        }
        
        if (!deposit.atlantic_id) {
            await ctx.reply('❌ Deposit tidak memiliki ID Atlantic.');
            return;
        }
        
        const statusResult = await AtlanticService.checkDepositStatus(deposit.atlantic_id);
        
        if (!statusResult.success) {
            await ctx.reply(`❌ Gagal cek status: ${statusResult.message}`);
            return;
        }
        
        const updateResult = await db.checkAndUpdateAtlanticDeposit(depositId, statusResult);
        
        if (updateResult.success) {
            if (updateResult.status === 'approved') {
                await ctx.reply(
                    `✅ PEMBAYARAN BERHASIL!\n\n` +
                    `💰 Nominal: ${handlers.formatRp(deposit.amount)}\n` +
                    `🎉 Saldo Anda telah ditambahkan: ${handlers.formatRp(deposit.amount)}\n` +
                    `📅 Waktu: ${new Date().toLocaleString('id-ID')}\n\n` +
                    `🎮 Selamat berbelanja di Ultimate Game Store!`,
                    {
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: '🏠 Beranda', callback_data: 'nav_home' }],
                                [{ text: '🛒 Belanja Sekarang', callback_data: 'nav_shop' }]
                            ]
                        }
                    }
                );
                
            } else if (updateResult.status === 'pending') {
                await ctx.reply(
                    `⏳ MENUNGGU PEMBAYARAN\n\n` +
                    `💰 Nominal: ${handlers.formatRp(deposit.amount)}\n` +
                    `🔄 Status: Belum dibayar\n\n` +
                    `Silakan scan QR code dan bayar sebelum waktu habis.`,
                    {
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: '🔄 Cek Lagi', callback_data: `check_atlantic_${depositId}` }],
                                [{ text: '❌ Batalkan', callback_data: `cancel_atlantic_${depositId}` }]
                            ]
                        }
                    }
                );
            } else if (updateResult.status === 'expired') {
                await ctx.reply(
                    `❌ QR CODE EXPIRED\n\n` +
                    `QR code telah kadaluarsa.\n` +
                    `Silakan buat deposit baru.`,
                    {
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: '💳 Deposit Baru', callback_data: 'nav_deposit' }],
                                [{ text: '🏠 Beranda', callback_data: 'nav_home' }]
                            ]
                        }
                    }
                );
            }
        } else {
            await ctx.reply(`❌ Gagal update status: ${updateResult.message}`);
        }
        
    } catch (error) {
        console.error('Error checking Atlantic status:', error);
        await ctx.reply('❌ Terjadi kesalahan saat mengecek status. Coba lagi nanti.');
    }
});

bot.action(/^cancel_atlantic_(.+)$/, async (ctx) => {
    const depositId = ctx.match[1];
    
    try {
        await ctx.answerCbQuery('🔄 Membatalkan deposit...');
        
        const deposit = await db.getPendingDepositByDepositId(depositId);
        if (!deposit) {
            await ctx.reply('❌ Deposit tidak ditemukan.');
            return;
        }
        
        if (deposit.atlantic_id) {
            await AtlanticService.cancelDeposit(deposit.atlantic_id);
        }
        
        await db.updateAtlanticDeposit(depositId, {
            status: 'rejected',
            processed_at: new Date()
        });
        
        await ctx.reply(
            '❌ DEPOSIT DIBATALKAN\n\n' +
            'Deposit QRIS Atlantic telah dibatalkan.\n' +
            'Silakan buat deposit baru jika ingin melanjutkan.',
            {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '💳 Deposit Baru', callback_data: 'nav_deposit' }],
                        [{ text: '🏠 Beranda', callback_data: 'nav_home' }]
                    ]
                }
            }
        );
        
    } catch (error) {
        console.error('Error canceling Atlantic deposit:', error);
        await ctx.reply('❌ Gagal membatalkan deposit. Coba lagi nanti.');
    }
});

bot.action('settings_maintenance_on', async (ctx) => {
    if (ctx.from.id.toString() !== process.env.OWNER_ID) {
        await ctx.answerCbQuery('❌ Akses ditolak!', { show_alert: true });
        return;
    }
    
    await db.updateSettings({ maintenance: true });
    await ctx.answerCbQuery('✅ Maintenance mode ON', { show_alert: true });
    await handlers.showAdminSettings(ctx);
});

bot.action('settings_maintenance_off', async (ctx) => {
    if (ctx.from.id.toString() !== process.env.OWNER_ID) {
        await ctx.answerCbQuery('❌ Akses ditolak!', { show_alert: true });
        return;
    }
    
    await db.updateSettings({ maintenance: false });
    await ctx.answerCbQuery('✅ Maintenance mode OFF', { show_alert: true });
    await handlers.showAdminSettings(ctx);
});

bot.action('noop', async (ctx) => {
    await ctx.answerCbQuery();
});

bot.action('qris_guide', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.reply(
        `*📋 PANDUAN SCAN QRIS*\n\n` +
        `1. 📱 Buka aplikasi e-wallet/banking\n` +
        `2. 🔍 Pilih "Scan QR"\n` +
        `3. 📷 Arahkan ke QR code\n` +
        `4. 💰 Bayar sesuai nominal\n` +
        `5. ✅ Klik "🔄 Cek Status"\n\n` +
        `*🔍 Tidak bisa scan?*\n` +
        `• Screenshot QR, scan dari galeri\n` +
        `• Pastikan kamera fokus\n` +
        `• Coba aplikasi berbeda (DANA/OVO)\n\n` +
        `*⏳ Proses lambat?*\n` +
        `• Tunggu 1-5 menit\n` +
        `• Cek status berkala\n` +
        `• Hubungi admin jika >10 menit`,
        {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                    [{ text: '🔙 Kembali ke Deposit', callback_data: 'nav_deposit' }],
                    [{ text: '🏠 Beranda', callback_data: 'nav_home' }]
                ]
            }
        }
    );
});

// ==================== MESSAGE HANDLERS ====================
bot.on('text', async (ctx) => {
    const userId = ctx.from.id;
    const text = ctx.message.text.trim();
    const state = userStates.get(userId);
    
    if (text.startsWith('/')) return;
    
    try {
        if (text.toLowerCase() === 'cancel') {
            userStates.delete(userId);
            await ctx.reply(
                '❌ PROSES DIBATALKAN\n\n' +
                'Anda telah membatalkan proses.\n' +
                'Kembali ke menu utama untuk memulai ulang.',
                {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: '🏠 Beranda', callback_data: 'nav_home' }]
                        ]
                    }
                }
            );
            return;
        }
        
        if (state?.action === 'DEPOSIT_AMOUNT_ATLANTIC' && state.step === 'amount') {
            const settings = await db.getSettings();
            const amount = parseInt(text.replace(/[^\d]/g, ''));
            
            if (isNaN(amount) || amount < settings.min_deposit || amount > settings.max_deposit) {
                await ctx.reply(
                    `❌ NOMINAL TIDAK VALID!\n\n` +
                    `Minimal: ${handlers.formatRp(settings.min_deposit)}\n` +
                    `Maksimal: ${handlers.formatRp(settings.max_deposit)}\n\n` +
                    `Silakan masukkan nominal yang valid.\n\n` +
                    `Ketik "cancel" untuk membatalkan`
                );
                return;
            }
            
            await ctx.reply(`🔄 Membuat QRIS payment untuk ${handlers.formatRp(amount)}, mohon tunggu...`);
            
            try {
                console.log('📤 Creating Atlantic deposit for user:', userId, 'amount:', amount);
                
                const atlanticResult = await AtlanticService.createQRISDeposit({
                    reff_id: `DEP${userId}${Date.now()}`,
                    nominal: amount
                });
                
                console.log('📥 Atlantic deposit result:', {
                    success: atlanticResult.success,
                    hasData: !!atlanticResult.data,
                    data: atlanticResult.data ? {
                        id: atlanticResult.data.id,
                        hasQRImage: !!atlanticResult.data.qr_image,
                        hasQRString: !!atlanticResult.data.qr_string,
                        status: atlanticResult.data.status
                    } : 'No data'
                });
                
                if (!atlanticResult.success) {
                    throw new Error(atlanticResult.message || 'Gagal membuat deposit Atlantic');
                }
                
                const deposit = await db.createAtlanticDeposit(userId, amount, atlanticResult.data);
                
                await handlers.showAtlanticQRIS(ctx, amount, deposit.id, atlanticResult.data);
                
                state.depositId = deposit.id;
                state.atlanticId = atlanticResult.data.id;
                userStates.set(userId, state);
                
            } catch (error) {
                console.error('❌ Atlantic deposit creation error:', error);
                await ctx.reply(
                    `❌ GAGAL MEMBUAT QRIS\n\n` +
                    `Error: ${error.message}\n\n` +
                    `Silakan coba lagi atau hubungi admin.`,
                    {
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: '💳 Coba Lagi', callback_data: 'deposit_method_qris' }],
                                [{ text: '👑 Hubungi Admin', url: 'https://t.me/sokkk91' }]
                            ]
                        }
                    }
                );
                userStates.delete(userId);
            }
            
            return;
        }
        
        if (state?.action === 'ADMIN_ADD_PRODUCT') {
            if (!state.step) state.step = 1;
            
            switch(state.step) {
                case 1:
                    state.name = text;
                    state.step = 2;
                    userStates.set(userId, state);
                    
                    await ctx.reply(
                        '💰 HARGA PRODUK\n\n' +
                        'Masukkan harga produk (angka saja):\n\n' +
                        'Contoh: 150000\n\n' +
                        'Ketik "cancel" untuk membatalkan'
                    );
                    break;
                    
                case 2:
                    const price = parseInt(text.replace(/[^\d]/g, ''));
                    if (isNaN(price) || price < 1000) {
                        await ctx.reply(
                            '❌ Harga tidak valid!\n' +
                            'Masukkan angka yang valid (minimal 1000).\n\n' +
                            'Contoh: 150000\n\n' +
                            'Ketik "cancel" untuk membatalkan'
                        );
                        return;
                    }
                    
                    state.price = price;
                    state.step = 3;
                    userStates.set(userId, state);
                    
                    await ctx.reply(
                        '🔐 LOGIN METHOD\n\n' +
                        'Masukkan cara login:\n\n' +
                        'Contoh: "Email & Password", "Google Play", "App Store", "Facebook"\n\n' +
                        'Ketik "cancel" untuk membatalkan'
                    );
                    break;
                    
                case 3:
                    state.loginMethod = text;
                    state.step = 4;
                    userStates.set(userId, state);
                    
                    await ctx.reply(
                        '📧 EMAIL AKUN\n\n' +
                        'Masukkan email akun:\n\n' +
                        'Contoh: "gameaccount@email.com"\n\n' +
                        'Ketik "cancel" untuk membatalkan'
                    );
                    break;
                    
                case 4:
                    state.email = text;
                    state.step = 5;
                    userStates.set(userId, state);
                    
                    await ctx.reply(
                        '🔑 PASSWORD AKUN\n\n' +
                        'Masukkan password akun:\n\n' +
                        'Ketik "cancel" untuk membatalkan'
                    );
                    break;
                    
                case 5:
                    state.password = text;
                    state.step = 6;
                    userStates.set(userId, state);
                    
                    await ctx.reply(
                        '📝 DESKRIPSI PRODUK\n\n' +
                        'Masukkan deskripsi produk (opsional):\n\n' +
                        'Contoh: "Akun premium level 100, memiliki semua skin, bisa ganti email"\n\n' +
                        'Ketik "skip" untuk melewatkan\n' +
                        'Ketik "cancel" untuk membatalkan'
                    );
                    break;
                    
                case 6:
                    state.description = text === 'skip' ? '' : text;
                    state.step = 7;
                    userStates.set(userId, state);
                    
                    await ctx.reply(
                        '📸 FOTO PRODUK\n\n' +
                        'Kirim foto untuk produk ini:\n\n' +
                        'Note: Gunakan tombol kirim foto\n\n' +
                        'Ketik "skip" untuk tanpa foto\n' +
                        'Ketik "cancel" untuk membatalkan'
                    );
                    break;
            }
            return;
        }
        
        if (state?.action === 'ADMIN_ADD_SCRIPT') {
            if (!state.step) state.step = 1;
            
            switch(state.step) {
                case 1:
                    state.name = text;
                    state.step = 2;
                    userStates.set(userId, state);
                    
                    await ctx.reply(
                        '💰 HARGA SCRIPT\n\n' +
                        'Masukkan harga script (angka saja):\n\n' +
                        'Contoh: 50000\n\n' +
                        'Ketik "cancel" untuk membatalkan'
                    );
                    break;
                    
                case 2:
                    const price = parseInt(text.replace(/[^\d]/g, ''));
                    if (isNaN(price) || price < 1000) {
                        await ctx.reply(
                            '❌ Harga tidak valid!\n' +
                            'Masukkan angka yang valid (minimal 1000).\n\n' +
                            'Contoh: 50000\n\n' +
                            'Ketik "cancel" untuk membatalkan'
                        );
                        return;
                    }
                    
                    state.price = price;
                    state.step = 3;
                    userStates.set(userId, state);
                    
                    await ctx.reply(
                        '📝 DESKRIPSI SCRIPT\n\n' +
                        'Masukkan deskripsi script:\n\n' +
                        'Contoh: "Bot untuk auto claim coin, support multi account, easy setup"\n\n' +
                        'Ketik "cancel" untuk membatalkan'
                    );
                    break;
                    
                case 3:
                    state.description = text;
                    state.step = 4;
                    userStates.set(userId, state);
                    
                    await ctx.reply(
                        '🔧 FITUR SCRIPT\n\n' +
                        'Masukkan fitur-fitur script:\n\n' +
                        'Contoh: "• Auto claim coin\n• Multi account\n• Proxy support\n• No ban"\n\n' +
                        'Ketik "cancel" untuk membatalkan'
                    );
                    break;
                    
                case 4:
                    state.features = text;
                    state.step = 5;
                    userStates.set(userId, state);
                    
                    await ctx.reply(
                        '📦 KIRIM FILE SCRIPT\n\n' +
                        'Kirim file script (format .zip, .rar, .py, .js, dll):\n\n' +
                        '⚠️ Maksimal 50MB\n' +
                        '💡 Rekomendasi: kompres ke .zip dulu\n\n' +
                        'Ketik "cancel" untuk membatalkan'
                    );
                    break;
            }
            return;
        }
        
        if (state?.action === 'BROADCAST_MESSAGE') {
            const users = await db.getUsers();
            let success = 0;
            let failed = 0;
            
            await ctx.reply(`🚀 Mulai mengirim ke ${users.length} user...`);
            
            for (let user of users) {
                try {
                    await ctx.telegram.sendMessage(
                        user.id,
                        `📢 PENGUMUMAN RESMI\n\n${text}\n\n— Ultimate Game Store`
                    );
                    success++;
                    
                    await new Promise(resolve => setTimeout(resolve, 100));
                } catch (error) {
                    failed++;
                }
            }
            
            userStates.delete(userId);
            
            await ctx.reply(
                `✅ BROADCAST SELESAI!\n\n` +
                `📤 Terkirim: ${success} user\n` +
                `❌ Gagal: ${failed} user\n` +
                `📊 Total: ${users.length} user`
            );
            
            return;
        }
        
        if (!state) {
            await ctx.reply(
                '🤖 ULTIMATE GAME STORE BOT\n\n' +
                'Gunakan tombol menu untuk navigasi:\n\n' +
                '🔹 Klik tombol di bawah\n' +
                '🔹 Atau gunakan perintah /start',
                {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: '🏠 Menu Utama', callback_data: 'nav_home' }],
                            [{ text: '🛒 Etalase Game', callback_data: 'nav_shop' }],
                            [{ text: '📦 Script Bot', callback_data: 'nav_scripts' }],
                            [{ text: '💳 Topup Saldo', callback_data: 'nav_deposit' }],
                            [{ text: '👤 Profile', callback_data: 'nav_profile' }]
                        ]
                    }
                }
            );
        }
        
    } catch (error) {
        console.error('Error in text handler:', error);
        await ctx.reply('❌ Terjadi kesalahan. Silakan coba lagi.');
    }
});

// ==================== DOCUMENT HANDLER ====================
bot.on('document', async (ctx) => {
    const userId = ctx.from.id;
    const state = userStates.get(userId);
    const document = ctx.message.document;
    
    if (state?.action === 'ADMIN_ADD_SCRIPT' && state.step === 5) {
        try {
            if (document.file_size > 50 * 1024 * 1024) {
                await ctx.reply(
                    '❌ FILE TERLALU BESAR!\n\n' +
                    'Maksimal file size: 50MB\n' +
                    'Ukuran file Anda: ' + Math.round(document.file_size / (1024 * 1024)) + 'MB\n\n' +
                    'Silakan kompres file atau gunakan file yang lebih kecil.'
                );
                return;
            }
            
            const allowedExtensions = ['.zip', '.rar', '.7z', '.tar', '.gz', '.py', '.js', '.txt', '.json', '.env'];
            const fileExt = document.file_name.substring(document.file_name.lastIndexOf('.')).toLowerCase();
            
            if (!allowedExtensions.includes(fileExt)) {
                await ctx.reply(
                    '❌ FORMAT FILE TIDAK DIDUKUNG!\n\n' +
                    'Format yang didukung: ' + allowedExtensions.join(', ') + '\n' +
                    'File Anda: ' + document.file_name + '\n\n' +
                    'Silakan kompres ke format .zip atau gunakan format yang didukung.'
                );
                return;
            }
            
            const newScript = await db.addScript({
                name: state.name,
                price: state.price,
                description: state.description,
                features: state.features,
                file_id: document.file_id,
                file_name: document.file_name,
                file_size: document.file_size,
                file_type: fileExt
            });
            
            userStates.delete(userId);
            
            await ctx.reply(
                `✅ SCRIPT BOT BERHASIL DITAMBAHKAN!\n\n` +
                `📦 Nama: ${state.name}\n` +
                `💰 Harga: ${handlers.formatRp(state.price)}\n` +
                `📝 Deskripsi: ${state.description.substring(0, 100)}...\n` +
                `📁 File: ${document.file_name} (${Math.round(document.file_size / 1024)} KB)\n` +
                `🔧 Fitur: ${state.features.split('\n').length} fitur\n\n` +
                `Script sekarang tersedia untuk dijual!`,
                {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: '📦 Lihat Script', callback_data: 'nav_scripts' }],
                            [{ text: '➕ Tambah Script Lagi', callback_data: 'admin_add_script' }],
                            [{ text: '🏠 Beranda', callback_data: 'nav_home' }]
                        ]
                    }
                }
            );
            
        } catch (error) {
            console.error('Error adding script:', error);
            await ctx.reply('❌ Gagal menambahkan script. Silakan coba lagi.');
        }
        return;
    }
    
    await ctx.reply(
        '📁 FILE DITERIMA\n\n' +
        'Untuk mengupload script bot:\n' +
        '1. Akses Admin Panel\n' +
        '2. Pilih "Tambah Script Bot"\n' +
        '3. Ikuti instruksi sampai diminta kirim file\n\n' +
        'Format file yang didukung:\n' +
        '• .zip, .rar, .7z (direkomendasikan)\n' +
        '• .py, .js, .txt\n' +
        '• Maksimal 50MB',
        {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '👑 Admin Panel', callback_data: 'nav_admin' }],
                    [{ text: '🏠 Beranda', callback_data: 'nav_home' }]
                ]
            }
        }
    );
});

// ==================== ERROR HANDLING ====================
bot.catch((error, ctx) => {
    console.error(`[GLOBAL ERROR]`, error.message);
    
    if (error.message.includes('message is not modified')) {
        return;
    }
});

// ==================== START BOT ====================
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

startBot();

module.exports = bot;