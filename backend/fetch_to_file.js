const http = require('http');
const fs = require('fs');

http.get('http://localhost:5050/api/admin/preorders/all', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        fs.writeFileSync('res.json', data);
        console.log('done');
    });
});
