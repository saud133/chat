// Simple test script to verify API endpoints
const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3001';

async function testAPI() {
  console.log('🧪 Testing API endpoints...\n');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${API_BASE}/api/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);
    console.log('');

    // Test usage stats endpoint
    console.log('2. Testing usage stats endpoint...');
    const statsResponse = await fetch(`${API_BASE}/api/usage`);
    const statsData = await statsResponse.json();
    console.log('✅ Usage stats:', JSON.stringify(statsData, null, 2));
    console.log('');

    // Test users endpoint
    console.log('3. Testing users endpoint...');
    const usersResponse = await fetch(`${API_BASE}/api/usage/users`);
    const usersData = await usersResponse.json();
    console.log('✅ Users data:', JSON.stringify(usersData, null, 2));
    console.log('');

    // Test POST usage endpoint
    console.log('4. Testing POST usage endpoint...');
    const postResponse = await fetch(`${API_BASE}/api/usage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: 'user-test123',
        username: 'Test User',
        email: 'test@example.com',
        isRegistered: true
      })
    });
    const postData = await postResponse.json();
    console.log('✅ POST usage:', postData);
    console.log('');

    console.log('🎉 All API tests passed!');

  } catch (error) {
    console.error('❌ API test failed:', error.message);
    console.log('\n💡 Make sure to run: npm run api');
  }
}

testAPI();
