const mongoose = require('mongoose');

const uri = 'mongodb://mansenghani6_db_user:gzpvaOFjPZoMFvvs@ac-tsxj5ve-shard-00-00.zcawqhy.mongodb.net:27017,ac-tsxj5ve-shard-00-01.zcawqhy.mongodb.net:27017,ac-tsxj5ve-shard-00-02.zcawqhy.mongodb.net:27017/kuki?ssl=true&replicaSet=atlas-9lp5j7-shard-0&authSource=admin&retryWrites=true&w=majority';

mongoose.connect(uri)
    .then(() => {
        console.log('Successfully connected to MongoDB with direct URI!');
        process.exit(0);
    })
    .catch((err) => {
        console.error('Failed to connect:', err);
        process.exit(1);
    });
