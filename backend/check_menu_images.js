const mongoose = require('mongoose');
const dotenv = require('dotenv');
const MenuItem = require('./models/MenuItem');
const dns = require('dns');

dns.setServers(['8.8.8.8', '8.8.4.4']);

dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        const items = await MenuItem.find({}, 'name image');
        console.log('Menu Items:', JSON.stringify(items, null, 2));
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
