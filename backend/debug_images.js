const mongoose = require('mongoose');
const dotenv = require('dotenv');
const MenuItem = require('./models/MenuItem');
const dns = require('dns');
const fs = require('fs');
const path = require('path');

dns.setServers(['8.8.8.8', '8.8.4.4']);
dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('--- Database Check ---');
        const items = await MenuItem.find({});
        console.log(`Found ${items.length} items.`);
        items.forEach(item => {
            console.log(`Item: ${item.name} (_id: ${item._id})`);
            console.log(`  - Image Path in DB: "${item.image}"`);
            if (item.image) {
                const fullPath = path.join(__dirname, item.image);
                console.log(`  - Full Path: ${fullPath}`);
                console.log(`  - File Exists: ${fs.existsSync(fullPath)}`);
            }
        });

        console.log('\n--- Uploads Folder Check ---');
        const uploadDir = path.join(__dirname, 'uploads');
        if (fs.existsSync(uploadDir)) {
            const files = fs.readdirSync(uploadDir);
            console.log(`Files in uploads/: ${files.join(', ') || 'None'}`);
        } else {
            console.log('Uploads directory does not exist!');
        }

        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
