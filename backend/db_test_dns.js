const mongoose = require('mongoose');
const dns = require('dns');

dns.setServers(['8.8.8.8', '8.8.4.4']);

const uri = 'mongodb+srv://mansenghani6_db_user:gzpvaOFjPZoMFvvs@cluster0.zcawqhy.mongodb.net/kuki?retryWrites=true&w=majority';

mongoose.connect(uri)
    .then(() => {
        console.log('Successfully connected to MongoDB with direct URI!');
        process.exit(0);
    })
    .catch((err) => {
        console.error('Failed to connect:', err);
        process.exit(1);
    });
