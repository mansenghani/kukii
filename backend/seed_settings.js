const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Admin = require('./models/Admin');
const RestaurantSettings = require('./models/RestaurantSettings');
const BookingSettings = require('./models/BookingSettings');
const NotificationSettings = require('./models/NotificationSettings');
const SystemPreferences = require('./models/SystemPreferences');

dotenv.config();

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('DB Connected');

        // 1. Create Admin
        const adminExits = await Admin.findOne({ email: 'admin@luxedining.com' });
        if (!adminExits) {
            await Admin.create({
                name: 'Ananya Sharma',
                email: 'admin@luxedining.com',
                password: 'admin123' // Will be hashed by pre-save hook
            });
            console.log('✅ Admin user created');
        }

        // 2. Create Default Settings if they don't exist
        const rSettings = await RestaurantSettings.findOne();
        if (!rSettings) await RestaurantSettings.create({});

        const bSettings = await BookingSettings.findOne();
        if (!bSettings) await BookingSettings.create({});

        const nSettings = await NotificationSettings.findOne();
        if (!nSettings) await NotificationSettings.create({});

        const sSettings = await SystemPreferences.findOne();
        if (!sSettings) await SystemPreferences.create({});

        console.log('✅ Default settings initialized');
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seed();
