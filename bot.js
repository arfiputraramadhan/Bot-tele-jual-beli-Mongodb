require('dotenv').config();
const { Telegraf } = require('telegraf');
const { initializeDB, db } = require('./database'); 
const handlers = require('./handlers');



const bot = new Telegraf(process.env.BOT_TOKEN, {
    telegram: {
        apiRoot: 'https://api.telegram.org',
        timeout: 30000,
    },
    handlerTimeout: 60000
});

const userStates = new Map();

// ==================== STARTUP ====================
async function startBot() {
    console.log('🚀 Ultimate Game Store Bot - FINAL VERSION');
    console.log('📅', new Date().toLocaleString('id-ID'));
    console.log('👤 Owner ID:', process.env.OWNER_ID || 'Not set');
    
    try {
        await initializeDB();
        console.log('💾 Database initialized');
        
        const botInfo = await bot.telegram.getMe();
        console.log('🤖 Bot:', botInfo.username, `(ID: ${botInfo.id})`);
        console.log('✅ Bot connected!');
        
        await bot.telegram.setMyCommands([
            { command: 'start', description: 'Mulai bot & menu utama' },
            { command: 'help', description: 'Bantuan & panduan' },
            { command: 'saldo', description: 'Cek saldo Anda' },
            { command: 'topup', description: 'Topup saldo' },
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
        '/topup - Topup saldo\n' +
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

// Navigation handlers
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

// Profile actions
bot.action('profile_history', async (ctx) => {
    await handlers.showPurchaseHistory(ctx);
});

bot.action('profile_settings', async (ctx) => {
    await handlers.showProfileSettings(ctx);
});

bot.action('profile_update', async (ctx) => {
    await handlers.showProfileUpdate(ctx);
});

// Deposit methods
bot.action('deposit_method_qris', async (ctx) => {
    userStates.set(ctx.from.id, { 
        action: 'DEPOSIT_AMOUNT', 
        method: 'QRIS',
        step: 'amount'
    });
    const settings = await db.getSettings();
    await ctx.reply(
        '💳 DEPOSIT VIA QRIS\n\n' +
        'Masukkan nominal deposit (angka saja):\n\n' +
        `💰 Minimal: ${handlers.formatRp(settings.min_deposit)}\n` +
        `💵 Maksimal: ${handlers.formatRp(settings.max_deposit)}\n\n` +
        'Contoh: 1.000\n\n' +
        'Ketik "cancel" untuk membatalkan'
    );
});

bot.action('deposit_method_bank', async (ctx) => {
    userStates.set(ctx.from.id, { 
        action: 'DEPOSIT_AMOUNT', 
        method: 'BANK',
        step: 'amount'
    });
    const settings = await db.getSettings();
    await ctx.reply(
        '🏦 DEPOSIT VIA TRANSFER BANK\n\n' +
        'Masukkan nominal deposit (angka saja):\n\n' +
        `💰 Minimal: ${handlers.formatRp(settings.min_deposit)}\n` +
        `💵 Maksimal: ${handlers.formatRp(settings.max_deposit)}\n\n` +
        'Contoh: 1.000\n\n' +
        'Ketik "cancel" untuk membatalkan'
    );
});

bot.action('deposit_method_ewallet', async (ctx) => {
    userStates.set(ctx.from.id, { 
        action: 'DEPOSIT_AMOUNT', 
        method: 'EWALLET',
        step: 'amount'
    });
    const settings = await db.getSettings();
    await ctx.reply(
        '💳 DEPOSIT VIA E-WALLET\n\n' +
        'Masukkan nominal deposit (angka saja):\n\n' +
        `💰 Minimal: ${handlers.formatRp(settings.min_deposit)}\n` +
        `💵 Maksimal: ${handlers.formatRp(settings.max_deposit)}\n\n` +
        'Contoh: 1.000\n\n' +
        'Ketik "cancel" untuk membatalkan'
    );
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

// DELETE PRODUCT - NEW FIXED VERSION
bot.action(/^delete_product_(.+)$/, async (ctx) => {
    const productId = ctx.match[1];
    
    if (ctx.from.id.toString() !== process.env.OWNER_ID) {
        await ctx.answerCbQuery('❌ Akses ditolak! Hanya owner.', { show_alert: true });
        return;
    }
    
    try {
        console.log(`🗑️ Processing delete product: ${productId}`);
        
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
            
            console.log(`✅ Product ${productId} deleted by admin ${ctx.from.id}`);
            
        } else {
            await ctx.answerCbQuery('❌ Gagal menghapus produk.', { show_alert: true });
        }
        
    } catch (error) {
        console.error('Error deleting product:', error);
        await ctx.answerCbQuery('❌ Error menghapus produk.', { show_alert: true });
    }
});

// DELETE SCRIPT - NEW FIXED VERSION
bot.action(/^delete_script_(.+)$/, async (ctx) => {
    const scriptId = ctx.match[1];
    
    if (ctx.from.id.toString() !== process.env.OWNER_ID) {
        await ctx.answerCbQuery('❌ Akses ditolak! Hanya owner.', { show_alert: true });
        return;
    }
    
    try {
        console.log(`🗑️ Processing delete script: ${scriptId}`);
        
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
            
            console.log(`✅ Script ${scriptId} deleted by admin ${ctx.from.id}`);
            
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

// Product pagination
bot.action(/^page_(-?\d+)$/, async (ctx) => {
    const page = parseInt(ctx.match[1]);
    await handlers.showShop(ctx, page);
});

// Script pagination
bot.action(/^script_page_(-?\d+)$/, async (ctx) => {
    const page = parseInt(ctx.match[1]);
    await handlers.showScriptsMenu(ctx, page);
});

// Purchase product
bot.action(/^buy_(.+)$/, async (ctx) => {
    const productId = ctx.match[1];
    await handlers.handlePurchase(ctx, productId);
});

// Purchase script
bot.action(/^buy_script_(.+)$/, async (ctx) => {
    const scriptId = ctx.match[1];
    await handlers.handleScriptPurchase(ctx, scriptId);
});

// DEPOSIT APPROVAL - FIXED VERSION
bot.action(/^approve_deposit_(.+)$/, async (ctx) => {
    const depositId = ctx.match[1];
    
    if (ctx.from.id.toString() !== process.env.OWNER_ID) {
        await ctx.answerCbQuery('❌ Hanya owner yang bisa approve!', { show_alert: true });
        return;
    }
    
    try {
        console.log(`🔄 Processing deposit approval for: ${depositId}`);
        
        const pendingDeposit = await db.getPendingDepositByDepositId(depositId);
        
        if (!pendingDeposit) {
            await ctx.answerCbQuery('❌ Deposit tidak ditemukan.', { show_alert: true });
            return;
        }
        
        if (pendingDeposit.status !== 'pending') {
            await ctx.answerCbQuery(`❌ Deposit sudah diproses (${pendingDeposit.status}).`, { show_alert: true });
            return;
        }
        
        const result = await db.approveDeposit(depositId, ctx.from.id);
        
        if (result.success) {
            // Notify user
            await ctx.telegram.sendMessage(
                pendingDeposit.user_id,
                `✅ DEPOSIT DISETUJUI!\n\n` +
                `💰 Nominal: ${handlers.formatRp(pendingDeposit.amount)}\n` +
                `💳 Saldo bertambah: ${handlers.formatRp(pendingDeposit.amount)}\n` +
                `📅 Waktu: ${new Date().toLocaleString('id-ID')}\n\n` +
                `🎮 Selamat berbelanja di Ultimate Game Store!`
            ).catch(err => console.error('Error notifying user:', err));
            
            // Update admin message
            try {
                await ctx.editMessageText(
                    `✅ Deposit berhasil disetujui!\n\n` +
                    `👤 User ID: ${pendingDeposit.user_id}\n` +
                    `💰 Nominal: ${handlers.formatRp(pendingDeposit.amount)}\n` +
                    `⏰ Waktu: ${new Date().toLocaleString('id-ID')}\n\n` +
                    `✅ User telah diberitahu.`,
                    { 
                        reply_markup: {
                            inline_keyboard: [[
                                { text: "🔙 Kembali ke Admin", callback_data: "nav_admin" }
                            ]]
                        }
                    }
                );
            } catch (editError) {
                await ctx.reply(
                    `✅ Deposit berhasil disetujui!\n\n` +
                    `👤 User ID: ${pendingDeposit.user_id}\n` +
                    `💰 Nominal: ${handlers.formatRp(pendingDeposit.amount)}\n` +
                    `⏰ Waktu: ${new Date().toLocaleString('id-ID')}\n\n` +
                    `✅ User telah diberitahu.`,
                    { 
                        reply_markup: {
                            inline_keyboard: [[
                                { text: "🔙 Kembali ke Admin", callback_data: "nav_admin" }
                            ]]
                        }
                    }
                );
            }
            
            console.log(`✅ Deposit ${depositId} approved by admin ${ctx.from.id}`);
            
        } else {
            await ctx.answerCbQuery(`❌ ${result.message}`, { show_alert: true });
        }
        
    } catch (error) {
        console.error('Error approving deposit:', error);
        await ctx.answerCbQuery('❌ Error approving deposit.', { show_alert: true });
    }
});

// REJECT DEPOSIT - FIXED VERSION
bot.action(/^reject_deposit_(.+)$/, async (ctx) => {
    const depositId = ctx.match[1];
    
    if (ctx.from.id.toString() !== process.env.OWNER_ID) {
        await ctx.answerCbQuery('❌ Hanya owner yang bisa menolak!', { show_alert: true });
        return;
    }
    
    try {
        console.log(`🔄 Processing deposit rejection for: ${depositId}`);
        
        const pendingDeposit = await db.getPendingDepositByDepositId(depositId);
        
        if (!pendingDeposit) {
            await ctx.answerCbQuery('❌ Deposit tidak ditemukan.', { show_alert: true });
            return;
        }
        
        if (pendingDeposit.status !== 'pending') {
            await ctx.answerCbQuery(`❌ Deposit sudah diproses (${pendingDeposit.status}).`, { show_alert: true });
            return;
        }
        
        const success = await db.rejectDeposit(depositId, ctx.from.id);
        
        if (success) {
            // Notify user
            await ctx.telegram.sendMessage(
                pendingDeposit.user_id,
                '❌ DEPOSIT DITOLAK\n\n' +
                'Bukti pembayaran Anda ditolak oleh admin.\n\n' +
                'Alasan: Bukti tidak jelas/tidak valid\n' +
                'Silakan cek kembali atau hubungi admin untuk informasi lebih lanjut.'
            ).catch(err => console.error('Error notifying user:', err));
            
            try {
                await ctx.editMessageText(
                    '❌ Deposit ditolak.\n' +
                    'User telah diberitahu.',
                    {
                        reply_markup: {
                            inline_keyboard: [[
                                { text: "🔙 Kembali ke Admin", callback_data: "nav_admin" }
                            ]]
                        }
                    }
                );
            } catch (editError) {
                await ctx.reply(
                    '❌ Deposit ditolak.\n' +
                    'User telah diberitahu.',
                    {
                        reply_markup: {
                            inline_keyboard: [[
                                { text: "🔙 Kembali ke Admin", callback_data: "nav_admin" }
                            ]]
                        }
                    }
                );
            }
            
            console.log(`❌ Deposit ${depositId} rejected by admin ${ctx.from.id}`);
            
        } else {
            await ctx.answerCbQuery('❌ Gagal menolak deposit.', { show_alert: true });
        }
        
    } catch (error) {
        console.error('Error rejecting deposit:', error);
        await ctx.answerCbQuery('❌ Error rejecting deposit.', { show_alert: true });
    }
});

// Settings actions
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
        
        if (state?.action === 'DEPOSIT_AMOUNT' && state.step === 'amount') {
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
            
            const deposit = await db.createPendingDeposit(userId, amount, state.method);
            
            state.amount = amount;
            state.depositId = deposit.id;
            state.action = 'DEPOSIT_WAITING_PROOF';
            userStates.set(userId, state);
            
            if (state.method === 'QRIS') {
                await handlers.showQrisDeposit(ctx, amount, deposit.id);
            } else if (state.method === 'BANK') {
                await handlers.showBankTransfer(ctx, amount, deposit.id);
            } else if (state.method === 'EWALLET') {
                await handlers.showEWallet(ctx, amount, deposit.id);
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

// ==================== DOCUMENT HANDLER (SCRIPT FILES) ====================
bot.on('document', async (ctx) => {
    const userId = ctx.from.id;
    const state = userStates.get(userId);
    const document = ctx.message.document;
    
    if (state?.action === 'ADMIN_ADD_SCRIPT' && state.step === 5) {
        try {
            console.log(`📦 Admin ${userId} uploading script file: ${document.file_name}`);
            
            // Check file size (max 50MB)
            if (document.file_size > 50 * 1024 * 1024) {
                await ctx.reply(
                    '❌ FILE TERLALU BESAR!\n\n' +
                    'Maksimal file size: 50MB\n' +
                    'Ukuran file Anda: ' + Math.round(document.file_size / (1024 * 1024)) + 'MB\n\n' +
                    'Silakan kompres file atau gunakan file yang lebih kecil.'
                );
                return;
            }
            
            // Allow common script file types
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

// PHOTO HANDLER - FIXED DEPOSIT PROOF
bot.on('photo', async (ctx) => {
    const userId = ctx.from.id;
    const state = userStates.get(userId);
    const photo = ctx.message.photo[ctx.message.photo.length - 1];
    
    if (state?.action === 'DEPOSIT_WAITING_PROOF' && state.depositId) {
        try {
            console.log(`📸 User ${userId} sent deposit proof for deposit ${state.depositId}`);
            
            const pendingDeposit = await db.getPendingDepositByDepositId(state.depositId);
            
            if (!pendingDeposit || pendingDeposit.status !== 'pending') {
                await ctx.reply(
                    '❌ Deposit tidak ditemukan atau sudah diproses.\n' +
                    'Silakan mulai deposit ulang.',
                    {
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: '💳 Deposit Ulang', callback_data: 'nav_deposit' }],
                                [{ text: '🏠 Beranda', callback_data: 'nav_home' }]
                            ]
                        }
                    }
                );
                userStates.delete(userId);
                return;
            }
            
            const adminId = process.env.OWNER_ID;
            
            if (adminId) {
                // Kirim ke admin dengan tombol approve/reject
                await ctx.telegram.sendPhoto(adminId, photo.file_id, {
                    caption: 
                        `💰 DEPOSIT MENUNGGU VERIFIKASI\n\n` +
                        `👤 User: ${ctx.from.first_name} (@${ctx.from.username || 'no_username'})\n` +
                        `🆔 User ID: ${userId}\n` +
                        `💵 Nominal: ${handlers.formatRp(state.amount)}\n` +
                        `📱 Metode: ${state.method}\n` +
                        `🆔 Deposit ID: ${state.depositId}\n` +
                        `⏰ Waktu: ${new Date().toLocaleString('id-ID')}\n\n` +
                        `Klik tombol di bawah untuk approve:`,
                    reply_markup: {
                        inline_keyboard: [
                            [
                                { text: '✅ APPROVE', callback_data: `approve_deposit_${state.depositId}` },
                                { text: '❌ REJECT', callback_data: `reject_deposit_${state.depositId}` }
                            ]
                        ]
                    }
                }).then(() => {
                    console.log(`✅ Proof sent to admin ${adminId}`);
                }).catch(err => {
                    console.error('Error sending to admin:', err);
                });
                
                await ctx.reply(
                    `✅ BUKTI TERKIRIM!\n\n` +
                    `📤 Bukti pembayaran telah dikirim ke admin.\n` +
                    `⏱️ Admin akan memverifikasi dalam 1-15 menit.\n\n` +
                    `📞 Hubungi admin jika butuh bantuan.`,
                    {
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: '🏠 Beranda', callback_data: 'nav_home' }],
                                [{ text: '🔄 Cek Status', callback_data: 'nav_deposit' }]
                            ]
                        }
                    }
                );
                
                // Update deposit status
                pendingDeposit.proof_sent = true;
                userStates.delete(userId);
                
            } else {
                await ctx.reply('❌ Admin tidak dikonfigurasi. Hubungi admin secara manual.');
            }
        } catch (error) {
            console.error('Error sending to admin:', error);
            await ctx.reply('❌ Gagal mengirim bukti ke admin. Silakan coba lagi atau hubungi admin.');
        }
        return;
    }
    
    if (state?.action === 'ADMIN_ADD_PRODUCT' && state.step === 7) {
        try {
            const newProduct = await db.addProduct({
                name: state.name,
                price: state.price,
                login_method: state.loginMethod,
                email: state.email,
                password: state.password,
                description: state.description || '',
                photo_id: photo.file_id
            });
            
            userStates.delete(userId);
            
            await ctx.reply(
                `✅ PRODUK BERHASIL DITAMBAHKAN!\n\n` +
                `🎮 Nama: ${state.name}\n` +
                `💰 Harga: ${handlers.formatRp(state.price)}\n` +
                `🔐 Login: ${state.loginMethod}\n` +
                `📧 Email: ${state.email}\n` +
                `📸 Foto: ✅\n\n` +
                `Produk sekarang tersedia di etalase.`,
                {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: '🛒 Lihat Etalase', callback_data: 'nav_shop' }],
                            [{ text: '➕ Tambah Lagi', callback_data: 'admin_add_product' }],
                            [{ text: '🏠 Beranda', callback_data: 'nav_home' }]
                        ]
                    }
                }
            );
            
        } catch (error) {
            console.error('Error adding product:', error);
            await ctx.reply('❌ Gagal menambahkan produk. Silakan coba lagi.');
        }
        return;
    }
    
    await ctx.reply(
        '📸 FOTO DITERIMA\n\n' +
        'Untuk mengirim bukti pembayaran:\n' +
        '1. Pilih menu "Topup Saldo"\n' +
        '2. Ikuti instruksi sampai diminta kirim bukti\n\n' +
        'Untuk menambah produk (admin):\n' +
        '1. Akses Admin Panel\n' +
        '2. Pilih "Tambah Produk"',
        {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '💳 Topup Saldo', callback_data: 'nav_deposit' }],
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