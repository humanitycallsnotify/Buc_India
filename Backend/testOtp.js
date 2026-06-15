const axios = require('axios');

async function test() {
  try {
    const res = await axios.post('http://localhost:5000/api/otp/send', {
      email: 'test12345@example.com',
      type: 'registration'
    });
    console.log('Success:', res.data);
  } catch (err) {
    console.error('Error:', err.response ? err.response.data : err.message);
  }
}

test();
