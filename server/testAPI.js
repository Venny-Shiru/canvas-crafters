import fetch from 'node-fetch';

async function testAPIEndpoints() {
  const BASE_URL = 'https://web-production-a1b2.up.railway.app';
  
  const endpoints = [
    '',
    '/api',
    '/api/auth',
    '/api/auth/login'
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`\nTesting: ${BASE_URL}${endpoint}`);
      const response = await fetch(`${BASE_URL}${endpoint}`);
      const text = await response.text();
      
      console.log('Status:', response.status);
      console.log('Response:', text.substring(0, 200));
      
    } catch (error) {
      console.log('Error:', error.message);
    }
  }
}

testAPIEndpoints();
