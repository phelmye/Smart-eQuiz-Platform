// Quick Smoke Test - Run this in browser console after logging in
// Tests basic functionality to ensure implementation works

console.log('🚀 Starting Quick Smoke Test...\n');

// Test 1: Check if functions exist
console.log('Test 1: Verify functions exist');
const functionsExist = typeof saveTenantRoleCustomization === 'function' &&
                       typeof getTenantRoleCustomization === 'function' &&
                       typeof hasPermission === 'function' &&
                       typeof canAccessPage === 'function';
console.log(functionsExist ? '✅ All functions exist' : '❌ Missing functions');

// Test 2: Create a simple customization
console.log('\nTest 2: Create customization');
try {
  const result = saveTenantRoleCustomization({
    tenantId: 'smoke_test_tenant',
    roleId: 'question_manager',
    customPermissions: { add: ['questions.delete'], remove: [] },
    customPages: { add: [], remove: [] },
    isActive: true,
    createdBy: 'smoke_test',
    notes: 'Smoke test'
  });
  console.log('✅ Customization created:', result?.id ? 'ID=' + result.id : 'Success');
} catch (error) {
  console.error('❌ Failed to create:', error.message);
}

// Test 3: Retrieve customization
console.log('\nTest 3: Retrieve customization');
try {
  const retrieved = getTenantRoleCustomization('smoke_test_tenant', 'question_manager');
  console.log(retrieved ? '✅ Customization retrieved' : '❌ Not found');
} catch (error) {
  console.error('❌ Failed to retrieve:', error.message);
}

// Test 4: Test permission check
console.log('\nTest 4: Permission check');
try {
  const testUser = {
    id: 'test',
    tenantId: 'smoke_test_tenant',
    role: 'question_manager',
    email: 'test@test.com'
  };
  const hasDelete = hasPermission(testUser, 'questions.delete');
  console.log(hasDelete ? '✅ Permission granted (customization working)' : '⚠️ Permission not granted');
} catch (error) {
  console.error('❌ Permission check failed:', error.message);
}

// Test 5: Helper functions
console.log('\nTest 5: Helper functions');
try {
  const allPerms = getAllAvailablePermissions();
  const allPages = getAllAvailablePages();
  console.log(`✅ Helper functions work: ${allPerms.length} permissions, ${allPages.length} pages`);
} catch (error) {
  console.error('❌ Helper functions failed:', error.message);
}

// Cleanup
console.log('\nCleaning up test data...');
try {
  deleteTenantRoleCustomization('smoke_test_tenant', 'question_manager');
  console.log('✅ Cleanup complete');
} catch (error) {
  console.error('⚠️ Cleanup failed:', error.message);
}

console.log('\n🎉 Smoke Test Complete!\n');
console.log('Next: Run full test suite with runRoleCustomizationTests()');
