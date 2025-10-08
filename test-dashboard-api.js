// Test script to verify dashboard API endpoints
const http = require('http');

const API_BASE = 'http://localhost:3000';

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const req = http.get(`${API_BASE}${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    
    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function testDashboardAPI() {
  console.log('🧪 Testing Dashboard API endpoints...\n');

  try {
    // Test health endpoint
    console.log('1. Testing /api/health...');
    const health = await makeRequest('/api/health');
    console.log(`   Status: ${health.status}`);
    console.log(`   Response:`, health.data);
    console.log('');

    // Test usage stats endpoint
    console.log('2. Testing /api/usage...');
    const stats = await makeRequest('/api/usage');
    console.log(`   Status: ${stats.status}`);
    console.log(`   Response:`, JSON.stringify(stats.data, null, 2));
    console.log('');

    // Test users endpoint
    console.log('3. Testing /api/usage/users...');
    const users = await makeRequest('/api/usage/users');
    console.log(`   Status: ${users.status}`);
    console.log(`   Response:`, JSON.stringify(users.data, null, 2));
    console.log('');

    if (health.status === 200 && stats.status === 200 && users.status === 200) {
      console.log('✅ All API tests passed! Dashboard should work correctly.');
    } else {
      console.log('❌ Some API tests failed. Check the server logs.');
    }

  } catch (error) {
    console.error('❌ API test failed:', error.message);
    console.log('\n💡 Make sure to run: npm run server');
    console.log('   This will start the backend server on port 3000');
  }
}

testDashboardAPI();
