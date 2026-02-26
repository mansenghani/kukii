const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
dns.resolveSrv('_mongodb._tcp.cluster0.zcawqhy.mongodb.net', (err, addresses) => {
    if (err) {
        console.error('DNS SRV lookup failed:', err);
    } else {
        console.log('DNS SRV lookup success:', addresses);
        // try to lookup txt record to get authdb
        dns.resolveTxt('cluster0.zcawqhy.mongodb.net', (err2, txts) => {
            console.log('TXT:', txts);
        });
    }
});
