require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://bebaswww1324_db_user:WLfdbXGhpI6e0YR0@cluster0.xwc3ege.mongodb.net/ultimate_game_store?retryWrites=true&w=majority';

const userSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    username: { type: String, default: '' },
    first_name: { type: String, required: true },
    last_name: { type: String, default: '' },
    balance: { type: Number, default: 0 },
    level: { type: String, default: 'Bronze' },
    total_spent: { type: Number, default: 0 },
    total_deposit: { type: Number, default: 0 },
    joined: { type: Date, default: Date.now },
    last_active: { type: Date, default: Date.now },
    purchased_items: [{
        product_id: String,
        product_name: String,
        type: { type: String, enum: ['product', 'script'] },
        price: Number,
        purchased_at: Date,
        details: mongoose.Schema.Types.Mixed,
        file_id: String,
        file_name: String,
        file_type: String
    }]
});

const productSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    login_method: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    description: { type: String, default: '' },
    photo_id: { type: String },
    status: { type: String, enum: ['available', 'sold'], default: 'available' },
    created_at: { type: Date, default: Date.now },
    sold_at: { type: Date },
    sold_to: { type: Number }
});

const scriptSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, default: '' },
    features: { type: String, default: '' },
    file_id: { type: String },
    file_name: { type: String },
    file_size: { type: Number },
    file_type: { type: String },
    downloads: { type: Number, default: 0 },
    stock: { type: Number, default: 1 },
    status: { type: String, enum: ['available', 'sold_out'], default: 'available' },
    created_at: { type: Date, default: Date.now },
    sold_count: { type: Number, default: 0 }
});

const depositSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    user_id: { type: Number, required: true },
    amount: { type: Number, required: true },
    method: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'expired', 'paid'], default: 'pending' },
    created_at: { type: Date, default: Date.now },
    processed_at: { type: Date },
    atlantic_id: { type: String },
    atlantic_data: { type: mongoose.Schema.Types.Mixed },
    atlantic_status: { type: String, default: 'pending' },
    qr_string: { type: String },
    qr_image: { type: String },
    expired_at: { type: Date },
    last_checked: { type: Date },
    auto_check_count: { type: Number, default: 0 },
    last_auto_check: { type: Date }
});

const settingsSchema = new mongoose.Schema({
    name: { type: String, default: 'main_settings', unique: true },
    min_deposit: { type: Number, default: 1000 },
    max_deposit: { type: Number, default: 1000000 },
    maintenance: { type: Boolean, default: false },
    auto_check_enabled: { type: Boolean, default: true },
    auto_check_interval: { type: Number, default: 5000 }, // 5 detik
    auto_check_max_tries: { type: Number, default: 360 } // 360 kali = 30 menit
});

const User = mongoose.model('User', userSchema);
const Product = mongoose.model('Product', productSchema);
const Script = mongoose.model('Script', scriptSchema);
const Deposit = mongoose.model('Deposit', depositSchema);
const Settings = mongoose.model('Settings', settingsSchema);

class Database {
    constructor() {
        this.connected = false;
    }

    async connect() {
        try {
            await mongoose.connect(MONGODB_URI, {
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
            });
            this.connected = true;
            console.log('✅ MongoDB connected successfully');
            
            await this.initializeSettings();
            
            return this;
        } catch (error) {
            console.error('❌ MongoDB connection error:', error.message);
            throw error;
        }
    }

    async initializeSettings() {
        const settings = await Settings.findOne({ name: 'main_settings' });
        if (!settings) {
            await Settings.create({ 
                name: 'main_settings',
                min_deposit: 1000,
                max_deposit: 1000000,
                maintenance: false,
                auto_check_enabled: true,
                auto_check_interval: 5000,
                auto_check_max_tries: 360
            });
            console.log('✅ Default settings created with auto-check enabled');
        } else {
            if (!settings.auto_check_enabled) {
                await Settings.findOneAndUpdate(
                    { name: 'main_settings' },
                    { 
                        $set: { 
                            auto_check_enabled: true,
                            auto_check_interval: 5000,
                            auto_check_max_tries: 360
                        } 
                    }
                );
                console.log('✅ Auto-check settings enabled');
            }
        }
    }

    async getUser(userId, from = {}) {
        try {
            let user = await User.findOne({ id: userId });
            
            if (!user) {
                user = await User.create({
                    id: userId,
                    username: from.username || `user_${userId}`,
                    first_name: from.first_name || 'User',
                    last_name: from.last_name || '',
                    balance: 0,
                    level: 'Bronze',
                    total_spent: 0,
                    total_deposit: 0,
                    joined: new Date(),
                    last_active: new Date(),
                    purchased_items: []
                });
                console.log(`👤 New user created: ${user.first_name} (${userId})`);
            } else {
                user.username = from.username || user.username;
                user.first_name = from.first_name || user.first_name;
                user.last_name = from.last_name !== undefined ? from.last_name : user.last_name;
                user.last_active = new Date();
                await user.save();
            }
            
            return user;
        } catch (error) {
            console.error('Error in getUser:', error);
            return {
                id: userId,
                username: from.username || `user_${userId}`,
                first_name: from.first_name || 'User',
                balance: 0,
                level: 'Bronze',
                total_spent: 0,
                total_deposit: 0,
                purchased_items: []
            };
        }
    }

    async getUsers() {
        return await User.find().sort({ joined: -1 });
    }

    async updateUser(userId, updateData) {
        return await User.findOneAndUpdate(
            { id: userId },
            { $set: updateData },
            { new: true }
        );
    }

    async getAvailableProducts() {
        return await Product.find({ status: 'available' }).sort({ created_at: -1 });
    }

    async getProduct(productId) {
        return await Product.findOne({ id: productId });
    }

    async getProducts() {
        return await Product.find().sort({ created_at: -1 });
    }

    async addProduct(productData) {
        try {
            const product = await Product.create({
                id: 'P' + Date.now(),
                ...productData,
                created_at: new Date(),
                status: 'available'
            });
            return product;
        } catch (error) {
            console.error('Error adding product:', error);
            throw error;
        }
    }

    async deleteProduct(productId) {
        try {
            const result = await Product.deleteOne({ id: productId });
            return result.deletedCount > 0;
        } catch (error) {
            console.error('Error deleting product:', error);
            return false;
        }
    }

    async purchaseProduct(userId, productId) {
        const session = await mongoose.startSession();
        session.startTransaction();
        
        try {
            const user = await User.findOne({ id: userId }).session(session);
            const product = await Product.findOne({ 
                id: productId, 
                status: 'available' 
            }).session(session);
            
            if (!product) {
                await session.abortTransaction();
                return null;
            }
            
            if (user.balance < product.price) {
                await session.abortTransaction();
                return false;
            }
            
            user.balance -= product.price;
            user.total_spent += product.price;
            user.purchased_items.push({
                product_id: product.id,
                product_name: product.name,
                type: 'product',
                price: product.price,
                purchased_at: new Date(),
                details: {
                    email: product.email,
                    password: product.password,
                    login_method: product.login_method
                }
            });
            await user.save({ session });
            
            product.status = 'sold';
            product.sold_at = new Date();
            product.sold_to = userId;
            await product.save({ session });
            
            await session.commitTransaction();
            
            return {
                user,
                product
            };
        } catch (error) {
            await session.abortTransaction();
            console.error('Error in purchaseProduct:', error);
            throw error;
        } finally {
            session.endSession();
        }
    }

    async addScript(scriptData) {
        try {
            const script = await Script.create({
                id: 'S' + Date.now(),
                ...scriptData,
                created_at: new Date(),
                status: 'available',
                downloads: 0,
                stock: scriptData.stock || 1,
                sold_count: 0
            });
            return script;
        } catch (error) {
            console.error('Error adding script:', error);
            throw error;
        }
    }

    async getScript(scriptId) {
        return await Script.findOne({ id: scriptId });
    }

    async getAvailableScripts() {
        return await Script.find({ 
            status: 'available',
            stock: { $gt: 0 }
        }).sort({ created_at: -1 });
    }

    async getScripts() {
        return await Script.find().sort({ created_at: -1 });
    }

    async deleteScript(scriptId) {
        try {
            const result = await Script.deleteOne({ id: scriptId });
            return result.deletedCount > 0;
        } catch (error) {
            console.error('Error deleting script:', error);
            return false;
        }
    }

    async addScriptStock(scriptId, quantity) {
        try {
            const script = await Script.findOne({ id: scriptId });
            if (!script) {
                return { success: false, message: 'Script tidak ditemukan' };
            }
            
            script.stock += quantity;
            if (script.stock > 0 && script.status === 'sold_out') {
                script.status = 'available';
            }
            await script.save();
            
            return { 
                success: true, 
                message: `Stok berhasil ditambahkan. Stok sekarang: ${script.stock}`,
                script 
            };
        } catch (error) {
            console.error('Error adding script stock:', error);
            return { success: false, message: 'Gagal menambah stok' };
        }
    }

    async purchaseScript(userId, scriptId) {
        const session = await mongoose.startSession();
        session.startTransaction();
        
        try {
            const user = await User.findOne({ id: userId }).session(session);
            const script = await Script.findOne({ 
                id: scriptId,
                status: 'available',
                stock: { $gt: 0 }
            }).session(session);
            
            if (!script) {
                await session.abortTransaction();
                return null;
            }
            
            if (user.balance < script.price) {
                await session.abortTransaction();
                return false;
            }
            
            user.balance -= script.price;
            user.total_spent += script.price;
            user.purchased_items.push({
                script_id: script.id,
                script_name: script.name,
                type: 'script',
                price: script.price,
                purchased_at: new Date(),
                file_id: script.file_id,
                file_name: script.file_name,
                file_type: script.file_type
            });
            await user.save({ session });
            
            script.stock -= 1;
            script.downloads += 1;
            script.sold_count += 1;
            
            if (script.stock <= 0) {
                script.status = 'sold_out';
            }
            
            await script.save({ session });
            
            await session.commitTransaction();
            
            return {
                user,
                script
            };
        } catch (error) {
            await session.abortTransaction();
            console.error('Error in purchaseScript:', error);
            throw error;
        } finally {
            session.endSession();
        }
    }

    async createAtlanticDeposit(userId, amount, atlanticData) {
        try {
            const depositId = 'D' + Date.now();
            const deposit = await Deposit.create({
                id: depositId,
                user_id: userId,
                amount: amount,
                method: 'QRIS_ATLANTIC',
                status: 'pending',
                atlantic_id: atlanticData.id || null,
                atlantic_data: atlanticData,
                atlantic_status: atlanticData.status || 'pending',
                qr_string: atlanticData.qr_string || null,
                qr_image: atlanticData.qr_image || null,
                expired_at: atlanticData.expired_at ? new Date(atlanticData.expired_at) : null,
                created_at: new Date(),
                auto_check_count: 0,
                last_auto_check: null
            });
            
            return deposit;
        } catch (error) {
            console.error('Error in createAtlanticDeposit:', error);
            throw error;
        }
    }

    async getPendingDepositByDepositId(depositId) {
        return await Deposit.findOne({ id: depositId });
    }

    async getAtlanticDepositByAtlanticId(atlanticId) {
        return await Deposit.findOne({ atlantic_id: atlanticId });
    }

    async getPendingAtlanticDeposits() {
        return await Deposit.find({ 
            status: 'pending',
            method: 'QRIS_ATLANTIC',
            created_at: { $gte: new Date(Date.now() - 30 * 60 * 1000) } // 30 menit terakhir
        });
    }

    async updateAtlanticDeposit(depositId, updateData) {
        try {
            const deposit = await Deposit.findOneAndUpdate(
                { id: depositId },
                { 
                    $set: {
                        ...updateData,
                        last_checked: new Date()
                    }
                },
                { new: true }
            );
            
            return deposit;
        } catch (error) {
            console.error('Error in updateAtlanticDeposit:', error);
            return null;
        }
    }

    async updateAtlanticDepositAutoCheck(depositId) {
        try {
            const deposit = await Deposit.findOneAndUpdate(
                { id: depositId },
                { 
                    $inc: { auto_check_count: 1 },
                    $set: { last_auto_check: new Date() }
                },
                { new: true }
            );
            
            return deposit;
        } catch (error) {
            console.error('Error in updateAtlanticDepositAutoCheck:', error);
            return null;
        }
    }

    async checkAndUpdateAtlanticDeposit(depositId, atlanticResult) {
        const session = await mongoose.startSession();
        session.startTransaction();
        
        try {
            const deposit = await Deposit.findOne({ id: depositId }).session(session);
            
            if (!deposit) {
                await session.abortTransaction();
                return { success: false, message: 'Deposit not found' };
            }
            
            deposit.atlantic_data = atlanticResult.data;
            deposit.atlantic_status = atlanticResult.data.status || deposit.atlantic_status;
            deposit.last_checked = new Date();
            deposit.auto_check_count = (deposit.auto_check_count || 0) + 1;
            deposit.last_auto_check = new Date();
            
            if (atlanticResult.data.status === 'success' || atlanticResult.data.status === 'paid' || atlanticResult.data.status === 'process') {
                deposit.status = 'approved';
                deposit.processed_at = new Date();
                
                const user = await User.findOne({ id: deposit.user_id }).session(session);
                if (user) {
                    user.balance += deposit.amount;
                    user.total_deposit += deposit.amount;
                    user.last_active = new Date();
                    await user.save({ session });
                }
            }
            
            if (atlanticResult.data.status === 'expired') {
                deposit.status = 'expired';
            }
            
            await deposit.save({ session });
            await session.commitTransaction();
            
            return {
                success: true,
                deposit,
                status: deposit.status
            };
        } catch (error) {
            await session.abortTransaction();
            console.error('Error in checkAndUpdateAtlanticDeposit:', error);
            throw error;
        } finally {
            session.endSession();
        }
    }

    async getSettings() {
        let settings = await Settings.findOne({ name: 'main_settings' });
        if (!settings) {
            settings = await Settings.create({ 
                name: 'main_settings',
                min_deposit: 1000,
                max_deposit: 1000000,
                maintenance: false,
                auto_check_enabled: true,
                auto_check_interval: 5000,
                auto_check_max_tries: 360
            });
        }
        return settings;
    }

    async updateSettings(newSettings) {
        await Settings.findOneAndUpdate(
            { name: 'main_settings' },
            { $set: newSettings },
            { upsert: true, new: true }
        );
        return true;
    }

    async getUserStats() {
        const [
            totalUsers,
            totalProducts,
            availableProducts,
            soldProducts,
            totalScripts,
            availableScripts,
            users
        ] = await Promise.all([
            User.countDocuments(),
            Product.countDocuments(),
            Product.countDocuments({ status: 'available' }),
            Product.countDocuments({ status: 'sold' }),
            Script.countDocuments(),
            Script.countDocuments({ status: 'available', stock: { $gt: 0 } }),
            User.find()
        ]);

        const totalDownloads = await Script.aggregate([
            { $group: { _id: null, total: { $sum: '$downloads' } } }
        ]);

        const totalSoldCount = await Script.aggregate([
            { $group: { _id: null, total: { $sum: '$sold_count' } } }
        ]);

        const totalDeposit = users.reduce((sum, user) => sum + user.total_deposit, 0);
        const totalSales = users.reduce((sum, user) => sum + user.total_spent, 0);

        const scripts = await Script.find();
        const totalStock = scripts.reduce((sum, script) => sum + script.stock, 0);

        return {
            totalUsers,
            totalProducts,
            availableProducts,
            soldProducts,
            totalScripts,
            availableScripts,
            totalDownloads: totalDownloads[0]?.total || 0,
            totalSoldScripts: totalSoldCount[0]?.total || 0,
            totalStock,
            totalDeposit,
            totalSales
        };
    }
}

const db = new Database();

module.exports = {
    db,
    initializeDB: async () => {
        await db.connect();
        console.log('✅ MongoDB Database initialized');
        console.log('🔄 Auto-check system: ENABLED');
        return db;
    }
};