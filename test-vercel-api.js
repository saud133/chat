// Test script to verify Vercel API endpoints
const https = require('https');

const VERCEL_URL = 'https://chat-m3jt9enzm-saudgs-projects.vercel.app';

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const url = `${VERCEL_URL}${path}`;
    console.log(`Testing: ${url}`);
    
    const req = https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ 
            status: res.statusCode, 
            data: jsonData,
            success: res.statusCode === 200
          });
        } catch (e) {
          resolve({ 
            status: res.statusCode, 
            data: data,
            success: false,
            error: 'Invalid JSON'
          });
        }
      });
    });
    
    req.on('error', (err) => {
      resolve({ 
        status: 0, 
        success: false, 
        error: err.message 
      });
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      resolve({ 
        status: 0, 
        success: false, 
        error: 'Request timeout' 
      });
    });
  });
}

async function testVercelAPI() {
  console.log('🧪 Testing Vercel API endpoints...\n');
  console.log(`Base URL: ${VERCEL_URL}\n`);

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
    const result = await makeRequest(test.path);
    
    if (result.success) {
      const hasExpectedKeys = test.expectedKeys.length === 0 || 
        test.expectedKeys.every(key => result.data.hasOwnProperty(key));
      
      if (hasExpectedKeys) {
        console.log(`  ✅ ${test.name} - Status: ${result.status}`);
        console.log(`  📊 Data: ${JSON.stringify(result.data, null, 2).substring(0, 200)}...`);
      } else {
        console.log(`  ⚠️  ${test.name} - Status: ${result.status} (Missing expected keys)`);
        console.log(`  📊 Data: ${JSON.stringify(result.data, null, 2)}`);
      }
    } else {
      console.log(`  ❌ ${test.name} - Status: ${result.status} - Error: ${result.error || 'Failed'}`);
      if (result.data) {
        console.log(`  📊 Response: ${JSON.stringify(result.data, null, 2)}`);
      }
      allPassed = false;
    }
    console.log('');
  }

  console.log('='.repeat(60));
  
  if (allPassed) {
    console.log('🎉 All API tests passed! Dashboard should work correctly on Vercel.');
    console.log('\nNext steps:');
    console.log('1. Go to https://chat-m3jt9enzm-saudgs-projects.vercel.app');
    console.log('2. Login to your account');
    console.log('3. Navigate to the Dashboard page');
    console.log('4. Verify it loads without errors');
  } else {
    console.log('❌ Some tests failed. Please check:');
    console.log('1. Are the API files deployed to Vercel?');
    console.log('2. Is the vercel.json configuration correct?');
    console.log('3. Check Vercel deployment logs for errors');
  }

  console.log('\n' + '='.repeat(60));
}

testVercelAPI();
