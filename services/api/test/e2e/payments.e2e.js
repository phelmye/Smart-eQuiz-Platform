/**
 * E2E Test for Payment Gateway Endpoints
 * Tests all 5 payment admin endpoints
 * 
 * Run: node test/e2e/payments.e2e.js
 */

let fetch;
try {
  fetch = require('node-fetch');
} catch (e) {
  // In newer Node versions fetch is global
  fetch = global.fetch;
}

const API_BASE = process.env.API_URL || 'http://localhost:3000/api';

// Test credentials (super_admin)
const TEST_USER = {
  email: 'admin@demo.local',
  password: 'password123'
};

/**
 * Login and get JWT token
 */
async function login() {
  console.log('🔐 Logging in as super_admin...');
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(TEST_USER)
  });

  if (!res.ok) {
    throw new Error(`Login failed: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  
  if (!json.access_token) {
    throw new Error('No access token in login response');
  }

  console.log('✅ Login successful');
  return json.access_token;
}

/**
 * Test GET /api/payments/gateways
 * Should list configured payment gateways
 */
async function testGetGateways(token) {
  console.log('\n📋 Testing GET /api/payments/gateways');
  
  const res = await fetch(`${API_BASE}/payments/gateways`, {
    method: 'GET',
    headers: { 
      'authorization': `Bearer ${token}`
    }
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`GET /gateways failed: ${res.status} - ${error}`);
  }

  const data = await res.json();
  console.log('✅ Gateways endpoint successful');
  console.log(`   Total gateways: ${data.totalGateways}`);
  console.log(`   Configured: ${data.configuredGateways}`);
  console.log(`   Default provider: ${data.defaultProvider}`);
  console.log(`   Gateway details:`);
  
  data.gateways.forEach(gateway => {
    const status = gateway.configured ? '✓ Configured' : '✗ Not Configured';
    console.log(`   - ${gateway.info.displayName}: ${status}`);
  });

  return data;
}

/**
 * Test GET /api/payments/admin/transactions
 * Should list all transactions (super_admin only)
 */
async function testGetAllTransactions(token) {
  console.log('\n💳 Testing GET /api/payments/admin/transactions');
  
  const res = await fetch(`${API_BASE}/payments/admin/transactions`, {
    method: 'GET',
    headers: { 
      'authorization': `Bearer ${token}`
    }
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`GET /admin/transactions failed: ${res.status} - ${error}`);
  }

  const data = await res.json();
  console.log('✅ Admin transactions endpoint successful');
  console.log(`   Found ${data.length} transactions`);

  if (data.length > 0) {
    const sample = data[0];
    console.log(`   Sample: ${sample.provider} - ${sample.currency} ${sample.amount / 100} - ${sample.status}`);
  } else {
    console.log('   ℹ️  No transactions in database yet');
  }

  return data;
}

/**
 * Test GET /api/payments/admin/transactions with filters
 * Should filter by status and provider
 */
async function testGetTransactionsWithFilters(token) {
  console.log('\n🔍 Testing GET /api/payments/admin/transactions with filters');
  
  // Test filter by status=COMPLETED
  const res = await fetch(`${API_BASE}/payments/admin/transactions?status=COMPLETED`, {
    method: 'GET',
    headers: { 
      'authorization': `Bearer ${token}`
    }
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`GET /admin/transactions?status=COMPLETED failed: ${res.status} - ${error}`);
  }

  const data = await res.json();
  console.log('✅ Filtered transactions endpoint successful');
  console.log(`   Found ${data.length} COMPLETED transactions`);

  return data;
}

/**
 * Test GET /api/payments/admin/revenue-stats
 * Should return revenue breakdown by provider, currency, status
 */
async function testGetRevenueStats(token) {
  console.log('\n📊 Testing GET /api/payments/admin/revenue-stats');
  
  const res = await fetch(`${API_BASE}/payments/admin/revenue-stats`, {
    method: 'GET',
    headers: { 
      'authorization': `Bearer ${token}`
    }
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`GET /admin/revenue-stats failed: ${res.status} - ${error}`);
  }

  const data = await res.json();
  console.log('✅ Revenue stats endpoint successful');
  console.log(`   Total Revenue: $${(data.totalRevenue / 100).toFixed(2)}`);
  
  if (data.byProvider && data.byProvider.length > 0) {
    console.log('   By Provider:');
    data.byProvider.forEach(stat => {
      console.log(`   - ${stat.provider}: $${(stat.revenue / 100).toFixed(2)} (${stat.transactionCount} txns, ${stat.percentage.toFixed(1)}%)`);
    });
  }

  if (data.byCurrency && data.byCurrency.length > 0) {
    console.log('   By Currency:');
    data.byCurrency.slice(0, 3).forEach(stat => {
      console.log(`   - ${stat.currency}: $${(stat.revenue / 100).toFixed(2)} (${stat.transactionCount} txns)`);
    });
  }

  return data;
}

/**
 * Test GET /api/payments/admin/export
 * Should return CSV data
 */
async function testExportTransactions(token) {
  console.log('\n📥 Testing GET /api/payments/admin/export');
  
  const res = await fetch(`${API_BASE}/payments/admin/export`, {
    method: 'GET',
    headers: { 
      'authorization': `Bearer ${token}`
    }
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`GET /admin/export failed: ${res.status} - ${error}`);
  }

  const csvData = await res.text();
  console.log('✅ Export endpoint successful');
  
  const lines = csvData.trim().split('\n');
  console.log(`   CSV contains ${lines.length} lines (including header)`);
  
  if (lines.length > 0) {
    console.log(`   Header: ${lines[0]}`);
  }
  
  if (lines.length > 1) {
    console.log(`   Sample row: ${lines[1].substring(0, 100)}...`);
  }

  return csvData;
}

/**
 * Test authentication requirement
 * Should return 401 without token
 */
async function testAuthenticationRequired() {
  console.log('\n🔒 Testing authentication requirement');
  
  const res = await fetch(`${API_BASE}/payments/gateways`, {
    method: 'GET',
    headers: {}  // No auth token
  });

  if (res.status === 401) {
    console.log('✅ Authentication correctly required (401 Unauthorized)');
    return true;
  } else {
    throw new Error(`Expected 401, got ${res.status}`);
  }
}

/**
 * Main test runner
 */
async function run() {
  console.log('🚀 Payment Gateway E2E Tests');
  console.log('=' .repeat(50));
  console.log(`API Base: ${API_BASE}\n`);

  try {
    // Test 1: Authentication
    await testAuthenticationRequired();

    // Login and get token
    const token = await login();

    // Test 2: List gateways
    const gateways = await testGetGateways(token);

    // Test 3: Get all transactions
    const transactions = await testGetAllTransactions(token);

    // Test 4: Get filtered transactions
    if (transactions.length > 0) {
      await testGetTransactionsWithFilters(token);
    } else {
      console.log('\n⚠️  Skipping filter test - no transactions to filter');
    }

    // Test 5: Get revenue stats
    const stats = await testGetRevenueStats(token);

    // Test 6: Export transactions
    await testExportTransactions(token);

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('✅ ALL TESTS PASSED');
    console.log('='.repeat(50));
    console.log('\nResults:');
    console.log(`- Configured Gateways: ${gateways.filter(g => g.configured).length}/${gateways.length}`);
    console.log(`- Total Transactions: ${transactions.length}`);
    console.log(`- Total Revenue: $${(stats.totalRevenue / 100).toFixed(2)}`);
    console.log(`- Providers with revenue: ${stats.byProvider.length}`);
    
  } catch (error) {
    console.error('\n❌ TEST FAILED');
    console.error('Error:', error.message);
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    process.exitCode = 1;
  }
}

// Run tests
run().catch(error => {
  console.error('Fatal error:', error);
  process.exitCode = 2;
});
