const http = require('http');

http.get('http://localhost:5050/api/admin/preorders/all', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        try {
            const parsed = JSON.parse(data);
            console.log(JSON.stringify(parsed[0], null, 2));
        } catch (e) {
            console.log(data);
        }
    });
});
