const SidebarItem = require('../models/SidebarItem');

// Initial Data Load (Seeder)
exports.seedSidebarItems = async () => {
    try {
        const defaultItems = [
            { name: 'Overview', route: 'overview', icon: 'dashboard', order: 1 },
            { name: 'Bookings', route: 'bookings', icon: 'book_online', order: 2 },
            { name: 'Events', route: 'events', icon: 'event', order: 3 },
            { name: 'Menu', route: 'menu', icon: 'restaurant_menu', order: 4 },
            { name: 'Showcase', route: 'showcase', icon: 'image', order: 5 },
            { name: 'Categories', route: 'categories', icon: 'category', order: 6 },
            { name: 'Pre-Orders', route: 'preorders', icon: 'fastfood', order: 7 },
            { name: 'Table Slots', route: 'slots', icon: 'schedule', order: 8 },
            { name: 'Tables', route: 'tables', icon: 'table_restaurant', order: 9 },
            { name: 'Feedback', route: 'feedback', icon: 'feedback', order: 10 },
            { name: 'Settings', route: 'settings', icon: 'settings', order: 11 }
        ];

        for (const item of defaultItems) {
            // Upsert prevents duplicate creation automatically across server restarts via 'route' key
            await SidebarItem.findOneAndUpdate(
                { route: item.route }, // Find by unique route identifier
                { $setOnInsert: item }, // Set the default fields natively ONLY on insert (leaves modifications safely alone if already modified)
                { upsert: true, new: true }
            );
        }
        console.log('✅ Sidebar items seeder completed');
    } catch (err) {
        console.error('❌ Failed to seed sidebar items:', err);
    }
};

// API Route Controller (GET)
exports.getSidebarItems = async (req, res) => {
    try {
        // Find only active items & sort them by defined order securely
        const items = await SidebarItem.find({ isActive: true }).sort({ order: 1 });
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Toggle API Route Controller (PATCH) (Optional if user wanted to add toggle later but good for admin)
exports.toggleSidebarItem = async (req, res) => {
    try {
        const item = await SidebarItem.findById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Not Found' });
        item.isActive = !item.isActive;
        await item.save();
        res.json(item);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
