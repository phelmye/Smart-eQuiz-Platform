/**
 * Tenant Role Customization - Test Validation Script
 * Run this in the browser console to validate backend functionality
 */

// Import mock data functions (if in browser, these should already be available)
// Otherwise, copy relevant functions from mockData.ts

console.log('🧪 Starting Tenant Role Customization Tests...\n');

// Test Setup
const TEST_TENANT_A = 'tenant_a';
const TEST_TENANT_B = 'tenant_b';
const TEST_ROLE = 'question_manager';

let passedTests = 0;
let failedTests = 0;
const results = [];

function assert(condition, testName, expected, actual) {
  if (condition) {
    console.log(`✅ PASS: ${testName}`);
    results.push({ test: testName, status: 'PASS', expected, actual });
    passedTests++;
    return true;
  } else {
    console.error(`❌ FAIL: ${testName}`);
    console.error(`   Expected: ${JSON.stringify(expected)}`);
    console.error(`   Actual: ${JSON.stringify(actual)}`);
    results.push({ test: testName, status: 'FAIL', expected, actual });
    failedTests++;
    return false;
  }
}

// Clean up any existing test data
function cleanupTestData() {
  console.log('\n🧹 Cleaning up test data...');
  try {
    const customizations = JSON.parse(localStorage.getItem('equiz_tenant_role_customizations') || '[]');
    const filtered = customizations.filter(c => 
      c.tenantId !== TEST_TENANT_A && c.tenantId !== TEST_TENANT_B
    );
    localStorage.setItem('equiz_tenant_role_customizations', JSON.stringify(filtered));
    console.log('✓ Test data cleaned up\n');
  } catch (error) {
    console.error('⚠️ Error cleaning up:', error);
  }
}

// Test Case 1: Grant Additional Permission
function testGrantPermission() {
  console.log('\n📝 Test 1: Grant Additional Permission');
  
  const testUser = {
    id: 'test_user_1',
    tenantId: TEST_TENANT_A,
    role: TEST_ROLE,
    email: 'test@tenant_a.com'
  };
  
  // Before customization - should NOT have delete
  const beforeHasDelete = hasPermission(testUser, 'questions.delete');
  assert(beforeHasDelete === false, 'Before: question_manager should NOT have questions.delete', false, beforeHasDelete);
  
  // Create customization
  saveTenantRoleCustomization({
    tenantId: TEST_TENANT_A,
    roleId: TEST_ROLE,
    customPermissions: {
      add: ['questions.delete'],
      remove: []
    },
    customPages: { add: [], remove: [] },
    isActive: true,
    createdBy: 'test_admin',
    notes: 'Test: Grant delete permission'
  });
  
  // After customization - should have delete
  const afterHasDelete = hasPermission(testUser, 'questions.delete');
  assert(afterHasDelete === true, 'After: question_manager SHOULD have questions.delete', true, afterHasDelete);
  
  return afterHasDelete;
}

// Test Case 2: Revoke Base Permission
function testRevokePermission() {
  console.log('\n📝 Test 2: Revoke Base Permission');
  
  const testUser = {
    id: 'test_user_2',
    tenantId: TEST_TENANT_A,
    role: TEST_ROLE,
    email: 'test2@tenant_a.com'
  };
  
  // Before customization - should have create
  const beforeHasCreate = hasPermission(testUser, 'questions.create');
  assert(beforeHasCreate === true, 'Before: question_manager SHOULD have questions.create', true, beforeHasCreate);
  
  // Update customization to revoke create
  saveTenantRoleCustomization({
    tenantId: TEST_TENANT_A,
    roleId: TEST_ROLE,
    customPermissions: {
      add: ['questions.delete'],
      remove: ['questions.create']  // Revoke create
    },
    customPages: { add: [], remove: [] },
    isActive: true,
    createdBy: 'test_admin',
    notes: 'Test: Revoke create permission'
  });
  
  // After customization - should NOT have create
  const afterHasCreate = hasPermission(testUser, 'questions.create');
  assert(afterHasCreate === false, 'After: question_manager should NOT have questions.create', false, afterHasCreate);
  
  // Should still have read (not revoked)
  const hasRead = hasPermission(testUser, 'questions.read');
  assert(hasRead === true, 'Should still have questions.read', true, hasRead);
  
  return !afterHasCreate && hasRead;
}

// Test Case 3: Explicit Deny Precedence
function testExplicitDeny() {
  console.log('\n📝 Test 3: Explicit Deny Precedence');
  
  const testUser = {
    id: 'test_user_3',
    tenantId: TEST_TENANT_B,
    role: TEST_ROLE,
    email: 'test@tenant_b.com'
  };
  
  // Create conflicting customization (both add and remove same permission)
  saveTenantRoleCustomization({
    tenantId: TEST_TENANT_B,
    roleId: TEST_ROLE,
    customPermissions: {
      add: ['questions.delete'],
      remove: ['questions.delete']  // Explicit deny should win
    },
    customPages: { add: [], remove: [] },
    isActive: true,
    createdBy: 'test_admin',
    notes: 'Test: Explicit deny precedence'
  });
  
  // Should be denied (remove wins over add)
  const hasDelete = hasPermission(testUser, 'questions.delete');
  assert(hasDelete === false, 'Explicit deny should take precedence', false, hasDelete);
  
  return !hasDelete;
}

// Test Case 4: Tenant Isolation
function testTenantIsolation() {
  console.log('\n📝 Test 4: Tenant Isolation');
  
  const tenantAUser = {
    id: 'test_user_4a',
    tenantId: TEST_TENANT_A,
    role: TEST_ROLE,
    email: 'test@tenant_a.com'
  };
  
  const tenantBUser = {
    id: 'test_user_4b',
    tenantId: TEST_TENANT_B,
    role: TEST_ROLE,
    email: 'test@tenant_b.com'
  };
  
  // Tenant A customization already grants questions.delete
  const tenantAHasDelete = hasPermission(tenantAUser, 'questions.delete');
  assert(tenantAHasDelete === true, 'Tenant A: Should have questions.delete', true, tenantAHasDelete);
  
  // Tenant B customization denies questions.delete
  const tenantBHasDelete = hasPermission(tenantBUser, 'questions.delete');
  assert(tenantBHasDelete === false, 'Tenant B: Should NOT have questions.delete', false, tenantBHasDelete);
  
  return tenantAHasDelete && !tenantBHasDelete;
}

// Test Case 5: Super Admin Bypass
function testSuperAdminBypass() {
  console.log('\n📝 Test 5: Super Admin Bypass');
  
  const superAdminUser = {
    id: 'super_admin_1',
    tenantId: 'platform',
    role: 'super_admin',
    email: 'admin@platform.com'
  };
  
  // Super admin should have all permissions regardless of customizations
  const hasDelete = hasPermission(superAdminUser, 'questions.delete');
  const hasCreate = hasPermission(superAdminUser, 'questions.create');
  const hasSystemConfig = hasPermission(superAdminUser, 'system.configure');
  
  assert(hasDelete === true, 'Super admin: Should have questions.delete', true, hasDelete);
  assert(hasCreate === true, 'Super admin: Should have questions.create', true, hasCreate);
  assert(hasSystemConfig === true, 'Super admin: Should have system.configure', true, hasSystemConfig);
  
  return hasDelete && hasCreate && hasSystemConfig;
}

// Test Case 6: Page Access Customization
function testPageAccess() {
  console.log('\n📝 Test 6: Page Access Customization');
  
  const testUser = {
    id: 'test_user_6',
    tenantId: TEST_TENANT_A,
    role: 'account_officer',
    email: 'test@tenant_a.com'
  };
  
  // Before - should NOT have analytics page
  const beforeHasAnalytics = canAccessPage(testUser, 'analytics');
  assert(beforeHasAnalytics === false, 'Before: account_officer should NOT have analytics', false, beforeHasAnalytics);
  
  // Grant analytics page
  saveTenantRoleCustomization({
    tenantId: TEST_TENANT_A,
    roleId: 'account_officer',
    customPermissions: {
      add: ['analytics.view'],
      remove: []
    },
    customPages: {
      add: ['analytics'],
      remove: []
    },
    isActive: true,
    createdBy: 'test_admin',
    notes: 'Test: Grant analytics page'
  });
  
  // After - should have analytics page
  const afterHasAnalytics = canAccessPage(testUser, 'analytics');
  assert(afterHasAnalytics === true, 'After: account_officer SHOULD have analytics', true, afterHasAnalytics);
  
  // Should still have base pages
  const hasDashboard = canAccessPage(testUser, 'dashboard');
  assert(hasDashboard === true, 'Should still have dashboard', true, hasDashboard);
  
  return afterHasAnalytics && hasDashboard;
}

// Test Case 7: Inactive Customization
function testInactiveCustomization() {
  console.log('\n📝 Test 7: Inactive Customization');
  
  const testUser = {
    id: 'test_user_7',
    tenantId: 'tenant_c',
    role: TEST_ROLE,
    email: 'test@tenant_c.com'
  };
  
  // Create INACTIVE customization
  saveTenantRoleCustomization({
    tenantId: 'tenant_c',
    roleId: TEST_ROLE,
    customPermissions: {
      add: ['questions.delete'],
      remove: []
    },
    customPages: { add: [], remove: [] },
    isActive: false,  // INACTIVE
    createdBy: 'test_admin',
    notes: 'Test: Inactive customization'
  });
  
  // Should NOT have delete (customization is inactive)
  const hasDelete = hasPermission(testUser, 'questions.delete');
  assert(hasDelete === false, 'Inactive customization should have no effect', false, hasDelete);
  
  return !hasDelete;
}

// Test Case 8: Effective Permissions
function testEffectivePermissions() {
  console.log('\n📝 Test 8: Effective Permissions Calculation');
  
  const testUser = {
    id: 'test_user_8',
    tenantId: TEST_TENANT_A,
    role: TEST_ROLE,
    email: 'test@tenant_a.com'
  };
  
  // Get effective permissions
  const effective = getEffectivePermissions(testUser);
  
  // Should include base permissions (minus removed, plus added)
  const hasRead = effective.includes('questions.read');
  const hasUpdate = effective.includes('questions.update');
  const hasDelete = effective.includes('questions.delete'); // Added
  const hasCreate = effective.includes('questions.create'); // Removed
  
  assert(hasRead === true, 'Effective: Should include questions.read', true, hasRead);
  assert(hasUpdate === true, 'Effective: Should include questions.update', true, hasUpdate);
  assert(hasDelete === true, 'Effective: Should include questions.delete (added)', true, hasDelete);
  assert(hasCreate === false, 'Effective: Should NOT include questions.create (removed)', false, hasCreate);
  
  console.log(`   Total effective permissions: ${effective.length}`);
  
  return hasRead && hasUpdate && hasDelete && !hasCreate;
}

// Test Case 9: Helper Functions
function testHelperFunctions() {
  console.log('\n📝 Test 9: Helper Functions');
  
  // Test getAllAvailablePermissions
  const allPermissions = getAllAvailablePermissions();
  const isArray = Array.isArray(allPermissions);
  const hasLength = allPermissions.length > 0;
  const isSorted = allPermissions.every((val, i, arr) => i === 0 || arr[i-1] <= val);
  const noDuplicates = new Set(allPermissions).size === allPermissions.length;
  
  assert(isArray === true, 'getAllAvailablePermissions: Should return array', true, isArray);
  assert(hasLength === true, 'getAllAvailablePermissions: Should have permissions', true, hasLength);
  assert(isSorted === true, 'getAllAvailablePermissions: Should be sorted', true, isSorted);
  assert(noDuplicates === true, 'getAllAvailablePermissions: Should have no duplicates', true, noDuplicates);
  
  // Test getAllAvailablePages
  const allPages = getAllAvailablePages();
  const pagesIsArray = Array.isArray(allPages);
  const pagesHasLength = allPages.length > 0;
  
  assert(pagesIsArray === true, 'getAllAvailablePages: Should return array', true, pagesIsArray);
  assert(pagesHasLength === true, 'getAllAvailablePages: Should have pages', true, pagesHasLength);
  
  console.log(`   Total available permissions: ${allPermissions.length}`);
  console.log(`   Total available pages: ${allPages.length}`);
  
  return isArray && hasLength && isSorted && noDuplicates && pagesIsArray && pagesHasLength;
}

// Test Case 10: CRUD Operations
function testCRUDOperations() {
  console.log('\n📝 Test 10: CRUD Operations');
  
  const testTenantId = 'tenant_crud_test';
  const testRoleId = 'participant';
  
  // CREATE
  const created = saveTenantRoleCustomization({
    tenantId: testTenantId,
    roleId: testRoleId,
    customPermissions: { add: ['tournaments.create'], remove: [] },
    customPages: { add: [], remove: [] },
    isActive: true,
    createdBy: 'test_admin',
    notes: 'Test CRUD'
  });
  
  assert(created && created.id, 'CREATE: Should create with auto-generated ID', true, !!created?.id);
  
  // READ
  const retrieved = getTenantRoleCustomization(testTenantId, testRoleId);
  assert(retrieved && retrieved.roleId === testRoleId, 'READ: Should retrieve customization', testRoleId, retrieved?.roleId);
  
  // UPDATE
  const updated = saveTenantRoleCustomization({
    ...retrieved,
    notes: 'Updated notes'
  });
  const retrievedUpdated = getTenantRoleCustomization(testTenantId, testRoleId);
  assert(retrievedUpdated.notes === 'Updated notes', 'UPDATE: Should update customization', 'Updated notes', retrievedUpdated?.notes);
  
  // DELETE
  deleteTenantRoleCustomization(testTenantId, testRoleId);
  const retrievedAfterDelete = getTenantRoleCustomization(testTenantId, testRoleId);
  assert(retrievedAfterDelete === undefined, 'DELETE: Should delete customization', undefined, retrievedAfterDelete);
  
  return true;
}

// Run all tests
async function runAllTests() {
  console.log('=' .repeat(60));
  console.log('🧪 TENANT ROLE CUSTOMIZATION TEST SUITE');
  console.log('=' .repeat(60));
  
  cleanupTestData();
  
  try {
    testGrantPermission();
    testRevokePermission();
    testExplicitDeny();
    testTenantIsolation();
    testSuperAdminBypass();
    testPageAccess();
    testInactiveCustomization();
    testEffectivePermissions();
    testHelperFunctions();
    testCRUDOperations();
    
    console.log('\n' + '=' .repeat(60));
    console.log('📊 TEST RESULTS');
    console.log('=' .repeat(60));
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log(`📈 Success Rate: ${((passedTests / (passedTests + failedTests)) * 100).toFixed(1)}%`);
    console.log('=' .repeat(60));
    
    if (failedTests === 0) {
      console.log('\n🎉 ALL TESTS PASSED! 🎉\n');
    } else {
      console.log('\n⚠️ SOME TESTS FAILED - Review errors above\n');
    }
    
    // Clean up after tests
    cleanupTestData();
    
    return {
      passed: passedTests,
      failed: failedTests,
      results: results
    };
    
  } catch (error) {
    console.error('\n💥 TEST SUITE ERROR:', error);
    console.error(error.stack);
    cleanupTestData();
    throw error;
  }
}

// Export for browser console
if (typeof window !== 'undefined') {
  window.runRoleCustomizationTests = runAllTests;
  console.log('\n💡 Run tests with: runRoleCustomizationTests()');
}

// Auto-run if in Node environment
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runAllTests };
}
