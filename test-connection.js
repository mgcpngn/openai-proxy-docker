const axios = require('axios');

async function testConnection() {
  try {
    console.log('Testing direct connection to OpenAI API...');
    const response = await axios.get('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${process.argv[2] || 'sk-test'}`
      },
      timeout: 10000
    });
    console.log('Connection successful!');
    console.log(`Status: ${response.status}`);
    console.log(`First few models: ${JSON.stringify(response.data.data.slice(0, 3))}`);
  } catch (error) {
    console.error('Connection failed!');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Message: ${JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      console.error(`Request error: ${error.message}`);
      console.error(`Error code: ${error.code}`);
    } else {
      console.error(`Error: ${error.message}`);
    }
  }
}

testConnection();
