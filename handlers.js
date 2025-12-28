const menus = require('./menus');
const { db } = require('./database');

const handlers = {
    formatRp: menus.formatRp,
    
    async showMainMenu(ctx) {
        try {
            const userId = ctx.from.id;
            const user = await db.getUser(userId, ctx.from);
            const isOwner = userId.toString() === process.env.OWNER_ID;
            const settings = await db.getSettings();
            
            if (settings.maintenance && !isOwner) {
                return await ctx.reply(
                    '🔧 BOT SEDANG DALAM PERBAIKAN\n\n' +
                    'Mohon maaf, bot sedang dalam maintenance.\n' +
                    'Silakan coba lagi nanti.\n\n' +
                    'Untuk info lebih lanjut hubungi admin.'
                );
            }
            
            const menu = await menus.main(user, isOwner);
            return await this.sendMenu(ctx, menu);
        } catch (error) {
            console.error('Error in showMainMenu:', error.message);
            await this.sendSimpleMenu(ctx, '🎮 ULTIMATE GAME STORE 🎮\n\nGunakan tombol di bawah untuk navigasi:', [
                [{ text: '🛒 Etalase Game', callback_data: 'nav_shop' }],
                [{ text: '📦 Script Bot', callback_data: 'nav_scripts' }],
                [{ text: '💳 Topup Saldo', callback_data: 'nav_deposit' }],
                [{ text: '👤 Profile', callback_data: 'nav_profile' }],
                [{ text: '📢 Info', callback_data: 'nav_info' }]
            ]);
        }
    },
    
    async showShop(ctx, page = 0) {
        try {
            const menu = await menus.shop(page);
            return await this.sendMenu(ctx, menu);
        } catch (error) {
            console.error('Error in showShop:', error);
            await ctx.reply('❌ Error loading products.');
        }
    },
    
    async showScriptsMenu(ctx, page = 0) {
        try {
            const menu = await menus.scripts(page);
            return await this.sendMenu(ctx, menu);
        } catch (error) {
            console.error('Error in showScriptsMenu:', error);
            await ctx.reply('❌ Error loading scripts.');
        }
    },
    
    async showAdminPanel(ctx) {
        try {
            const userId = ctx.from.id;
            if (userId.toString() !== process.env.OWNER_ID) {
                await ctx.answerCbQuery('❌ Akses ditolak! Hanya owner.', { show_alert: true });
                return;
            }
            
            const menu = await menus.admin();
            return await this.sendMenu(ctx, menu);
        } catch (error) {
            console.error('Error in showAdminPanel:', error);
            await ctx.reply('❌ Error loading admin panel.');
        }
    },
    
    async showDepositMenu(ctx) {
        try {
            const user = await db.getUser(ctx.from.id, ctx.from);
            const settings = await db.getSettings();
            const menu = await menus.deposit(user, settings);
            return await this.sendMenu(ctx, menu);
        } catch (error) {
            console.error('Error in showDepositMenu:', error);
            await this.sendSimpleMenu(ctx, '💳 TOPUP SALDO\n\nPilih metode pembayaran:', [
                [{ text: '📱 QRIS', callback_data: 'deposit_method_qris' }],
                [{ text: '🏦 Bank', callback_data: 'deposit_method_bank' }],
                [{ text: '💳 E-Wallet', callback_data: 'deposit_method_ewallet' }],
                [{ text: '📋 Cara Deposit', callback_data: 'deposit_guide' }],
                [{ text: '🏠 Beranda', callback_data: 'nav_home' }]
            ]);
        }
    },
    
    async showQrisDeposit(ctx, amount, depositId) {
        try {
            const menu = await menus.qrisPayment(amount, depositId);
            return await this.sendMenu(ctx, menu);
        } catch (error) {
            console.error('Error in showQrisDeposit:', error);
            await ctx.reply(`💳 QRIS Payment\n\nNominal: ${this.formatRp(amount)}\n\nSilakan kirim bukti pembayaran.`);
        }
    },
    
    async showProfile(ctx) {
        try {
            const user = await db.getUser(ctx.from.id, ctx.from);
            const menu = await menus.profile(user);
            return await this.sendMenu(ctx, menu);
        } catch (error) {
            console.error('Error in showProfile:', error);
            const user = await db.getUser(ctx.from.id, ctx.from);
            await ctx.reply(
                `👤 PROFILE\n\n` +
                `Nama: ${user.first_name}\n` +
                `Saldo: ${this.formatRp(user.balance)}\n` +
                `Level: ${user.level}`
            );
        }
    },
    
    async showInfoMenu(ctx) {
        try {
            const menu = await menus.info();
            return await this.sendMenu(ctx, menu);
        } catch (error) {
            console.error('Error in showInfoMenu:', error);
            await ctx.reply('📢 INFO\n\nJam operasional: 24/7\nSupport: @sokkk91');
        }
    },
    
    async showBankTransfer(ctx, amount, depositId) {
        try {
            const menu = await menus.bankTransfer(amount, depositId);
            return await this.sendMenu(ctx, menu);
        } catch (error) {
            console.error('Error in showBankTransfer:', error);
            await ctx.reply(
                `🏦 TRANSFER BANK\n\n` +
                `Nominal: ${this.formatRp(amount)}\n\n` +
                `BCA: -\n` +
                `BRI: -\n\n` +
                `Kirim bukti transfer setelah bayar.`
            );
        }
    },
    
    async showEWallet(ctx, amount, depositId) {
        try {
            const menu = await menus.eWallet(amount, depositId);
            return await this.sendMenu(ctx, menu);
        } catch (error) {
            console.error('Error in showEWallet:', error);
            await ctx.reply(
                `💳 E-WALLET\n\n` +
                `Nominal: ${this.formatRp(amount)}\n\n` +
                `DANA/OVO: 087782738443\n` +
                `Kirim bukti setelah transfer.`
            );
        }
    },
    
    async showPurchaseHistory(ctx) {
        try {
            const user = await db.getUser(ctx.from.id, ctx.from);
            const menu = await menus.purchaseHistory(user);
            return await this.sendMenu(ctx, menu);
        } catch (error) {
            console.error('Error in showPurchaseHistory:', error);
            await ctx.reply('📜 Anda belum memiliki riwayat belanja.');
        }
    },
    
    async showProfileSettings(ctx) {
        try {
            const menu = await menus.profileSettings();
            return await this.sendMenu(ctx, menu);
        } catch (error) {
            console.error('Error in showProfileSettings:', error);
            await ctx.reply('⚙️ Pengaturan profile sedang dalam pengembangan.');
        }
    },
    
    async showProfileUpdate(ctx) {
        try {
            const menu = await menus.profileUpdate();
            return await this.sendMenu(ctx, menu);
        } catch (error) {
            console.error('Error in showProfileUpdate:', error);
            await ctx.reply('🔄 Update profile melalui settings Telegram Anda.');
        }
    },
    
    async showDepositGuide(ctx) {
        try {
            const menu = await menus.depositGuide();
            return await this.sendMenu(ctx, menu);
        } catch (error) {
            console.error('Error in showDepositGuide:', error);
            await ctx.reply('📋 Cara deposit: Pilih menu Topup → Pilih metode → Ikuti instruksi.');
        }
    },
    
    async showAdminManageProducts(ctx) {
        try {
            if (ctx.from.id.toString() !== process.env.OWNER_ID) {
                await ctx.answerCbQuery('❌ Akses ditolak!', { show_alert: true });
                return;
            }
            
            const menu = await menus.adminManageProducts();
            return await this.sendMenu(ctx, menu);
        } catch (error) {
            console.error('Error in showAdminManageProducts:', error);
            await ctx.reply('📦 Tidak ada produk tersedia.');
        }
    },
    
    async showAdminManageScripts(ctx) {
        try {
            if (ctx.from.id.toString() !== process.env.OWNER_ID) {
                await ctx.answerCbQuery('❌ Akses ditolak!', { show_alert: true });
                return;
            }
            
            const menu = await menus.adminManageScripts();
            return await this.sendMenu(ctx, menu);
        } catch (error) {
            console.error('Error in showAdminManageScripts:', error);
            await ctx.reply('📦 Tidak ada script tersedia.');
        }
    },
    
    async showAdminManageUsers(ctx) {
        try {
            if (ctx.from.id.toString() !== process.env.OWNER_ID) {
                await ctx.answerCbQuery('❌ Akses ditolak!', { show_alert: true });
                return;
            }
            
            const menu = await menus.adminManageUsers();
            return await this.sendMenu(ctx, menu);
        } catch (error) {
            console.error('Error in showAdminManageUsers:', error);
            await ctx.reply('👥 Error loading user data.');
        }
    },
    
    async showAdminManageDeposits(ctx) {
        try {
            if (ctx.from.id.toString() !== process.env.OWNER_ID) {
                await ctx.answerCbQuery('❌ Akses ditolak!', { show_alert: true });
                return;
            }
            
            const menu = await menus.adminManageDeposits();
            return await this.sendMenu(ctx, menu);
        } catch (error) {
            console.error('Error in showAdminManageDeposits:', error);
            await ctx.reply('💳 Error loading deposit data.');
        }
    },
    
    async showAdminPendingDeposits(ctx) {
        try {
            if (ctx.from.id.toString() !== process.env.OWNER_ID) {
                await ctx.answerCbQuery('❌ Akses ditolak!', { show_alert: true });
                return;
            }
            
            const menu = await menus.adminPendingDeposits();
            return await this.sendMenu(ctx, menu);
        } catch (error) {
            console.error('Error in showAdminPendingDeposits:', error);
            await ctx.reply('⏳ Error loading pending deposits.');
        }
    },
    
    async showAdminStats(ctx) {
        try {
            if (ctx.from.id.toString() !== process.env.OWNER_ID) {
                await ctx.answerCbQuery('❌ Akses ditolak!', { show_alert: true });
                return;
            }
            
            const menu = await menus.adminStats();
            return await this.sendMenu(ctx, menu);
        } catch (error) {
            console.error('Error in showAdminStats:', error);
            await ctx.reply('📊 Error loading statistics.');
        }
    },
    
    async showAdminUserDetails(ctx) {
        try {
            if (ctx.from.id.toString() !== process.env.OWNER_ID) {
                await ctx.answerCbQuery('❌ Akses ditolak!', { show_alert: true });
                return;
            }
            
            const menu = await menus.adminUserDetails();
            return await this.sendMenu(ctx, menu);
        } catch (error) {
            console.error('Error in showAdminUserDetails:', error);
            await ctx.reply('👥 Error loading user details.');
        }
    },
    
    async showAdminSettings(ctx) {
        try {
            if (ctx.from.id.toString() !== process.env.OWNER_ID) {
                await ctx.answerCbQuery('❌ Akses ditolak!', { show_alert: true });
                return;
            }
            
            const menu = await menus.adminSettings();
            return await this.sendMenu(ctx, menu);
        } catch (error) {
            console.error('Error in showAdminSettings:', error);
            await ctx.reply('⚙️ Error loading settings.');
        }
    },
    
    async sendMenu(ctx, menu) {
        try {
            if (ctx.callbackQuery) {
                await ctx.answerCbQuery().catch(() => {});
            }
            
            if (menu.type === 'photo') {
                if (ctx.callbackQuery) {
                    try {
                        await ctx.editMessageMedia({
                            type: 'photo',
                            media: menu.media,
                            caption: menu.caption,
                            parse_mode: undefined
                        }, { reply_markup: menu.reply_markup });
                    } catch (editError) {
                        await ctx.replyWithPhoto(menu.media, {
                            caption: menu.caption,
                            reply_markup: menu.reply_markup
                        });
                    }
                } else {
                    await ctx.replyWithPhoto(menu.media, {
                        caption: menu.caption,
                        reply_markup: menu.reply_markup
                    });
                }
            } else {
                if (ctx.callbackQuery) {
                    try {
                        await ctx.editMessageText(menu.text, {
                            parse_mode: undefined,
                            reply_markup: menu.reply_markup
                        });
                    } catch (editError) {
                        await ctx.reply(menu.text, {
                            reply_markup: menu.reply_markup
                        });
                    }
                } else {
                    await ctx.reply(menu.text, {
                        reply_markup: menu.reply_markup
                    });
                }
            }
        } catch (error) {
            console.error('Error in sendMenu:', error.message);
            if (menu.type === 'photo') {
                await ctx.replyWithPhoto(menu.media, {
                    caption: menu.caption.substring(0, 1024),
                    reply_markup: menu.reply_markup
                }).catch(async () => {
                    await ctx.reply(menu.caption.substring(0, 4096), {
                        reply_markup: menu.reply_markup
                    });
                });
            } else {
                await ctx.reply(menu.text.substring(0, 4096), {
                    reply_markup: menu.reply_markup
                });
            }
        }
    },
    
    async sendSimpleMenu(ctx, text, buttons) {
        try {
            if (ctx.callbackQuery) {
                await ctx.answerCbQuery().catch(() => {});
                try {
                    await ctx.editMessageText(text, {
                        reply_markup: { inline_keyboard: buttons }
                    });
                } catch {
                    await ctx.reply(text, {
                        reply_markup: { inline_keyboard: buttons }
                    });
                }
            } else {
                await ctx.reply(text, {
                    reply_markup: { inline_keyboard: buttons }
                });
            }
        } catch (error) {
            console.error('Error in sendSimpleMenu:', error);
            await ctx.reply(text);
        }
    },
    
    async handlePurchase(ctx, productId) {
        try {
            const userId = ctx.from.id;
            const purchaseResult = await db.purchaseProduct(userId, productId);
            
            if (purchaseResult === null) {
                await ctx.answerCbQuery('❌ Produk tidak ditemukan atau sudah terjual!', { show_alert: true });
                return;
            }
            
            if (purchaseResult === false) {
                await ctx.answerCbQuery('❌ Saldo tidak cukup! Silakan topup dulu.', { show_alert: true });
                return;
            }
            
            const { user, product } = purchaseResult;
            
            await ctx.reply(
                `✅ PEMBELIAN BERHASIL!\n\n` +
                `🎮 Produk: ${product.name}\n` +
                `💰 Harga: ${this.formatRp(product.price)}\n` +
                `👤 Pembeli: ${user.first_name}\n` +
                `📅 Waktu: ${new Date().toLocaleString('id-ID')}\n\n` +
                `🔐 DETAIL AKUN:\n` +
                `📧 Email: ${product.email}\n` +
                `🔑 Password: ${product.password}\n` +
                `🌐 Login via: ${product.login_method}\n\n` +
                `⚠️ Simpan informasi ini dengan baik!\n` +
                `📞 Hubungi admin jika ada masalah.`
            );
            
            await this.showMainMenu(ctx);
            
        } catch (error) {
            console.error('Error in handlePurchase:', error);
            await ctx.answerCbQuery('❌ Error processing purchase.', { show_alert: true });
        }
    },
    
    async handleScriptPurchase(ctx, scriptId) {
        try {
            const userId = ctx.from.id;
            const purchaseResult = await db.purchaseScript(userId, scriptId);
            
            if (purchaseResult === null) {
                await ctx.answerCbQuery('❌ Script tidak ditemukan atau sudah terjual!', { show_alert: true });
                return;
            }
            
            if (purchaseResult === false) {
                await ctx.answerCbQuery('❌ Saldo tidak cukup! Silakan topup dulu.', { show_alert: true });
                return;
            }
            
            const { user, script } = purchaseResult;
            
            // VALIDASI: Pastikan file_id ada sebelum mengirim
            if (!script.file_id || script.file_id.trim() === '') {
                console.error('❌ script.file_id is empty! Script:', script);
                await ctx.reply(
                    `✅ PEMBELIAN SCRIPT BERHASIL!\n\n` +
                    `📦 Script: ${script.name}\n` +
                    `💰 Harga: ${this.formatRp(script.price)}\n` +
                    `👤 Pembeli: ${user.first_name}\n\n` +
                    `❌ FILE BELUM TERSEDIA\n\n` +
                    `Mohon hubungi admin untuk mendapatkan file script.\n` +
                    `Admin akan mengirim file secara manual.`
                );
                await this.showMainMenu(ctx);
                return;
            }
            
            // Kirim file script ke user
            try {
                await ctx.replyWithDocument(script.file_id, {
                    caption: `📦 ${script.name}\n` +
                            `📁 ${script.file_name} (${Math.round(script.file_size / 1024)} KB)\n` +
                            `📝 ${script.description.substring(0, 100)}...`
                });
                
                await ctx.reply(
                    `✅ PEMBELIAN SCRIPT BERHASIL!\n\n` +
                    `📦 Script: ${script.name}\n` +
                    `💰 Harga: ${this.formatRp(script.price)}\n` +
                    `👤 Pembeli: ${user.first_name}\n` +
                    `📅 Waktu: ${new Date().toLocaleString('id-ID')}\n\n` +
                    `📝 DESKRIPSI:\n${script.description}\n\n` +
                    `🔧 FITUR:\n${script.features}\n\n` +
                    `📁 File telah dikirim di atas ⬆️\n\n` +
                    `⚠️ PERHATIAN:\n` +
                    `• File hanya untuk penggunaan pribadi\n` +
                    `• Dilarang menyebarluaskan\n` +
                    `• Hubungi admin jika ada masalah`
                );
                
            } catch (fileError) {
                console.error('Error sending file:', fileError);
                await ctx.reply(
                    `✅ PEMBELIAN SCRIPT BERHASIL!\n\n` +
                    `📦 Script: ${script.name}\n` +
                    `💰 Harga: ${this.formatRp(script.price)}\n` +
                    `👤 Pembeli: ${user.first_name}\n` +
                    `📅 Waktu: ${new Date().toLocaleString('id-ID')}\n\n` +
                    `❌ GAGAL MENGIRIM FILE\n\n` +
                    `Silakan hubungi admin untuk mendapatkan file script.\n` +
                    `Error: ${fileError.message}`
                );
            }
            
            await this.showMainMenu(ctx);
            
        } catch (error) {
            console.error('Error in handleScriptPurchase:', error);
            await ctx.answerCbQuery('❌ Error processing script purchase.', { show_alert: true });
        }
    }
};

module.exports = handlers;