// Verification script for Dashboard API
const http = require('http');

const API_BASE = 'http://localhost:3000';

function testEndpoint(path, expectedKeys = []) {
  return new Promise((resolve) => {
    const req = http.get(`${API_BASE}${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          const hasExpectedKeys = expectedKeys.every(key => jsonData.hasOwnProperty(key));
          resolve({
            path,
            status: res.statusCode,
            success: res.statusCode === 200 && hasExpectedKeys,
            hasData: Object.keys(jsonData).length > 0,
            expectedKeys: hasExpectedKeys
          });
        } catch (e) {
          resolve({
            path,
            status: res.statusCode,
            success: false,
            hasData: false,
            expectedKeys: false,
            error: 'Invalid JSON'
          });
        }
      });
    });
    
    req.on('error', () => {
      resolve({
        path,
        status: 0,
        success: false,
        hasData: false,
        expectedKeys: false,
        error: 'Connection failed'
      });
    });
    
    req.setTimeout(3000, () => {
      req.destroy();
      resolve({
        path,
        status: 0,
        success: false,
        hasData: false,
        expectedKeys: false,
        error: 'Timeout'
      });
    });
  });
}

async function verifyDashboard() {
  console.log('🔍 Verifying Dashboard API...\n');

  const tests = [
    {
      name: 'Health Check',
      path: '/api/health',
      expectedKeys: ['status', 'timestamp']
    },
    {
      name: 'Usage Statistics',
      path: '/api/usage',
      expectedKeys: ['total_usage', 'total_users', 'registered_users', 'guest_users']
    },
    {
      name: 'Users Data',
      path: '/api/usage/users',
      expectedKeys: []
    }
  ];

  let allPassed = true;

  for (const test of tests) {
    console.log(`Testing ${test.name}...`);
    const result = await testEndpoint(test.path, test.expectedKeys);
    
    if (result.success) {
      console.log(`  ✅ ${test.name} - Status: ${result.status} - Data: ${result.hasData ? 'Yes' : 'No'}`);
    } else {
      console.log(`  ❌ ${test.name} - Status: ${result.status} - Error: ${result.error || 'Failed'}`);
      allPassed = false;
    }
  }

  console.log('\n' + '='.repeat(50));
  
  if (allPassed) {
    console.log('🎉 All tests passed! Dashboard should work correctly.');
    console.log('\nNext steps:');
    console.log('1. Go to http://localhost:3000');
    console.log('2. Login to your account');
    console.log('3. Navigate to the Dashboard page');
    console.log('4. Verify it loads without errors');
  } else {
    console.log('❌ Some tests failed. Please check:');
    console.log('1. Is the server running? (npm run server)');
    console.log('2. Is port 3000 available?');
    console.log('3. Are all dependencies installed? (npm install)');
  }

  console.log('\n' + '='.repeat(50));
}

verifyDashboard();
