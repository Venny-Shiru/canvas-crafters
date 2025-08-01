import fetch from 'node-fetch';

async function testLoginAPI() {
  const API_URL = 'https://web-production-a1b2.up.railway.app/api/auth/login';
  
  console.log('Testing login API...');
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identifier: 'demo@canvascrafters.com',
        password: 'demo123'
      })
    });
    
    const data = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response data:', data);
    
    if (response.ok) {
      console.log('✅ Login API working correctly!');
      console.log('User ID:', data.user._id);
      console.log('Username:', data.user.username);
      console.log('Token length:', data.token ? data.token.length : 'No token');
    } else {
      console.log('❌ Login API failed');
    }
    
  } catch (error) {
    console.error('Error testing login API:', error.message);
  }
}

testLoginAPI();
