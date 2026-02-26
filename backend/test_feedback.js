const axios = require('axios');

axios.post('http://localhost:5000/api/feedback', {
    name: "System Test",
    email: "test@system",
    rating: 5,
    review: "This is a test from the backend."
})
    .then(res => console.log('Success:', res.data))
    .catch(err => {
        if (err.response) {
            console.error('API Error:', err.response.data);
        } else {
            console.error('Network Error:', err.message);
        }
    });
