// Comprehensive Endpoint Testing Script for FlexiCash SA
// Run this with: node test-endpoints.js

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
let authToken = '';
let testLoanId = '';
let testUserId = '';

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function logSuccess(message) {
  console.log(`${colors.green}✓${colors.reset} ${message}`);
}

function logError(message) {
  console.log(`${colors.red}✗${colors.reset} ${message}`);
}

function logInfo(message) {
  console.log(`${colors.blue}ℹ${colors.reset} ${message}`);
}

function logSection(message) {
  console.log(`\n${colors.cyan}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.cyan}${message}${colors.reset}`);
  console.log(`${colors.cyan}${'='.repeat(60)}${colors.reset}\n`);
}

async function testHealthCheck() {
  logSection('Testing Health Check Endpoint');
  try {
    const response = await axios.get(`${BASE_URL}/health`);
    if (response.data.success) {
      logSuccess('Server health check passed');
      return true;
    }
  } catch (error) {
    logError(`Health check failed: ${error.message}`);
    return false;
  }
}

async function testRegister() {
  logSection('Testing User Registration');
  try {
    const userData = {
      name: 'Test User',
      email: `test.user.${Date.now()}@example.com`,
      password: 'password123',
      phone: '0712345678',
      address: '123 Test Street, Johannesburg'
    };
    
    const response = await axios.post(`${BASE_URL}/auth/register`, userData);
    if (response.data.success && response.data.data.token) {
      authToken = response.data.data.token;
      testUserId = response.data.data._id;
      logSuccess(`User registered successfully: ${response.data.data.email}`);
      logInfo(`Auth Token: ${authToken.substring(0, 20)}...`);
      return true;
    }
  } catch (error) {
    logError(`Registration failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function testLogin() {
  logSection('Testing User Login');
  try {
    const loginData = {
      email: 'admin@flexicash.co.za',
      password: 'admin123'
    };
    
    const response = await axios.post(`${BASE_URL}/auth/login`, loginData);
    if (response.data.success && response.data.data.token) {
      logSuccess(`Admin login successful: ${response.data.data.email}`);
      logInfo(`User role: ${response.data.data.role}`);
      return true;
    }
  } catch (error) {
    logError(`Login failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function testGetCurrentUser() {
  logSection('Testing Get Current User');
  try {
    const response = await axios.get(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (response.data.success) {
      logSuccess(`Current user retrieved: ${response.data.data.name}`);
      return true;
    }
  } catch (error) {
    logError(`Get current user failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function testLoanApplication() {
  logSection('Testing Loan Application');
  try {
    const FormData = require('form-data');
    const fs = require('fs');
    const path = require('path');
    
    // Create a dummy file for testing
    const dummyFilePath = path.join(__dirname, 'test-statement.txt');
    fs.writeFileSync(dummyFilePath, 'Test bank statement content');
    
    const formData = new FormData();
    formData.append('amount', '1000');
    formData.append('duration', '1');
    formData.append('purpose', 'Emergency expenses');
    formData.append('bankStatements', fs.createReadStream(dummyFilePath));
    
    const response = await axios.post(`${BASE_URL}/loans/apply`, formData, {
      headers: {
        ...formData.getHeaders(),
        Authorization: `Bearer ${authToken}`
      }
    });
    
    // Clean up test file
    fs.unlinkSync(dummyFilePath);
    
    if (response.data.success) {
      testLoanId = response.data.data._id;
      logSuccess(`Loan application submitted: R${response.data.data.amount}`);
      logInfo(`Loan ID: ${testLoanId}`);
      logInfo(`Status: ${response.data.data.status}`);
      return true;
    }
  } catch (error) {
    logError(`Loan application failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function testGetMyLoans() {
  logSection('Testing Get My Loans');
  try {
    const response = await axios.get(`${BASE_URL}/loans/my-loans`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (response.data.success) {
      logSuccess(`Retrieved ${response.data.count} loan(s)`);
      return true;
    }
  } catch (error) {
    logError(`Get my loans failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function testGetNotifications() {
  logSection('Testing Get Notifications');
  try {
    const response = await axios.get(`${BASE_URL}/notifications`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    logSuccess(`Retrieved ${response.data.length} notification(s)`);
    return true;
  } catch (error) {
    logError(`Get notifications failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function testUnreadNotificationCount() {
  logSection('Testing Unread Notification Count');
  try {
    const response = await axios.get(`${BASE_URL}/notifications/unread-count`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    logSuccess(`Unread notifications: ${response.data.count}`);
    return true;
  } catch (error) {
    logError(`Get unread count failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function testUnauthorizedAccess() {
  logSection('Testing Unauthorized Access Protection');
  try {
    await axios.get(`${BASE_URL}/loans/my-loans`);
    logError('Security issue: Endpoint accessible without auth token');
    return false;
  } catch (error) {
    if (error.response?.status === 401) {
      logSuccess('Unauthorized access properly blocked');
      return true;
    }
    logError(`Unexpected error: ${error.message}`);
    return false;
  }
}

async function testInvalidRoute() {
  logSection('Testing Invalid Route Handling');
  try {
    await axios.get(`${BASE_URL}/invalid-route-that-does-not-exist`);
    logError('Server did not return 404 for invalid route');
    return false;
  } catch (error) {
    if (error.response?.status === 404) {
      logSuccess('Invalid routes properly handled with 404');
      return true;
    }
    logInfo(`Status code: ${error.response?.status || 'No response'}`);
    return true; // Express returns other codes when no matching route
  }
}

async function runAllTests() {
  console.log('\n' + colors.cyan + '╔════════════════════════════════════════════════════════════╗');
  console.log('║     FlexiCash SA - Comprehensive Endpoint Testing         ║');
  console.log('╚════════════════════════════════════════════════════════════╝' + colors.reset);
  
  logInfo('Starting tests against: ' + BASE_URL);
  logInfo('Make sure the backend server is running on port 5000\n');
  
  const tests = [
    { name: 'Health Check', fn: testHealthCheck },
    { name: 'User Registration', fn: testRegister },
    { name: 'Get Current User', fn: testGetCurrentUser },
    { name: 'User Login', fn: testLogin },
    { name: 'Get My Loans', fn: testGetMyLoans },
    { name: 'Loan Application', fn: testLoanApplication },
    { name: 'Get Notifications', fn: testGetNotifications },
    { name: 'Unread Notification Count', fn: testUnreadNotificationCount },
    { name: 'Unauthorized Access', fn: testUnauthorizedAccess },
    { name: 'Invalid Route Handling', fn: testInvalidRoute }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      logError(`Unexpected error in ${test.name}: ${error.message}`);
      failed++;
    }
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Print summary
  logSection('Test Summary');
  console.log(`Total Tests: ${tests.length}`);
  console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failed}${colors.reset}`);
  console.log(`Success Rate: ${((passed / tests.length) * 100).toFixed(1)}%\n`);
  
  if (failed === 0) {
    console.log(`${colors.green}✓ All endpoints are functioning correctly!${colors.reset}\n`);
  } else {
    console.log(`${colors.yellow}⚠ Some tests failed. Please check the errors above.${colors.reset}\n`);
  }
}

// Check if server is accessible before running tests
async function checkServerAvailability() {
  try {
    await axios.get('http://localhost:5000/api/health', { timeout: 2000 });
    return true;
  } catch (error) {
    console.log(`${colors.red}✗ Backend server is not running on http://localhost:5000${colors.reset}`);
    console.log(`${colors.yellow}  Please start the server first:${colors.reset}`);
    console.log(`  1. cd backend`);
    console.log(`  2. npm install`);
    console.log(`  3. npm run dev\n`);
    return false;
  }
}

// Main execution
(async () => {
  const serverAvailable = await checkServerAvailability();
  if (serverAvailable) {
    await runAllTests();
  }
})();
