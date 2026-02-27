const axios = require('axios');

async function test() {
    try {
        const res = await axios.get('http://localhost:5050/api/menu');
        console.log('Menu Data:', res.data);
        const res2 = await axios.get('http://localhost:5050/api/categories');
        console.log('Categories Data:', res2.data);
    } catch (err) {
        console.error('Test Failed:', err.message);
    }
}

test();
