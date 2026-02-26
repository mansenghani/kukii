const dns = require('dns');
dns.resolve4('cluster0.zcawqhy.mongodb.net', (err, addresses) => {
    if (err) {
        console.error('DNS A lookup failed:', err);
    } else {
        console.log('DNS A lookup success:', addresses);
    }
});
