# Tenant Role Customization - Test Scenarios

## Test Plan for Phase 2 Implementation

### Test Environment Setup
```typescript
// Mock users for testing
const tenant_a_admin = { id: 'u1', tenantId: 'tenant_a', role: 'org_admin', ... };
const tenant_a_qm = { id: 'u2', tenantId: 'tenant_a', role: 'question_manager', ... };
const tenant_b_qm = { id: 'u3', tenantId: 'tenant_b', role: 'question_manager', ... };
const super_admin = { id: 'u4', tenantId: 'platform', role: 'super_admin', ... };
```

---

## Test Case 1: Grant Additional Permission

**Objective:** Verify org_admin can grant additional permissions to a role.

**Steps:**
1. Login as `tenant_a_admin`
2. Navigate to "Customize Roles"
3. Click "New Customization"
4. Select role: `question_manager`
5. Go to "Permissions" tab
6. Check `questions.delete` in "Grant Additional Permissions"
7. Click "Save Customization"

**Expected Result:**
- ✅ Customization saved successfully
- ✅ `tenant_a_qm` can now delete questions
- ✅ `tenant_b_qm` still cannot delete questions (unaffected)

**Validation Code:**
```typescript
// Before customization
hasPermission(tenant_a_qm, 'questions.delete') // → false

// Create customization
saveTenantRoleCustomization({
  tenantId: 'tenant_a',
  roleId: 'question_manager',
  customPermissions: { add: ['questions.delete'], remove: [] },
  customPages: { add: [], remove: [] },
  isActive: true,
  createdBy: tenant_a_admin.id
});

// After customization
hasPermission(tenant_a_qm, 'questions.delete') // → true ✅
hasPermission(tenant_b_qm, 'questions.delete') // → false ✅ (tenant isolation)
```

**Status:** ⬜ Not Tested

---

## Test Case 2: Revoke Base Permission

**Objective:** Verify org_admin can revoke base permissions from a role.

**Steps:**
1. Login as `tenant_a_admin`
2. Navigate to "Customize Roles"
3. Create new customization for `question_manager`
4. Go to "Permissions" tab
5. Check `questions.create` in "Revoke Base Permissions"
6. Click "Save Customization"

**Expected Result:**
- ✅ Customization saved successfully
- ✅ `tenant_a_qm` can no longer create questions
- ✅ `tenant_a_qm` can still read and update questions (other base permissions intact)

**Validation Code:**
```typescript
// Before customization
hasPermission(tenant_a_qm, 'questions.create') // → true

// Create customization
saveTenantRoleCustomization({
  tenantId: 'tenant_a',
  roleId: 'question_manager',
  customPermissions: { add: [], remove: ['questions.create'] },
  customPages: { add: [], remove: [] },
  isActive: true,
  createdBy: tenant_a_admin.id
});

// After customization
hasPermission(tenant_a_qm, 'questions.create') // → false ✅ (revoked)
hasPermission(tenant_a_qm, 'questions.read') // → true ✅ (still has base)
hasPermission(tenant_a_qm, 'questions.update') // → true ✅ (still has base)
```

**Status:** ⬜ Not Tested

---

## Test Case 3: Explicit Deny Precedence

**Objective:** Verify explicit deny (remove) takes precedence over grant (add).

**Steps:**
1. Create customization with same permission in both add and remove lists
2. Verify permission is denied

**Expected Result:**
- ✅ Permission is denied (remove wins over add)

**Validation Code:**
```typescript
// Conflicting customization
saveTenantRoleCustomization({
  tenantId: 'tenant_a',
  roleId: 'question_manager',
  customPermissions: { 
    add: ['questions.delete'],     // Grant
    remove: ['questions.delete']   // Deny (should win)
  },
  customPages: { add: [], remove: [] },
  isActive: true,
  createdBy: tenant_a_admin.id
});

// Check permission
hasPermission(tenant_a_qm, 'questions.delete') // → false ✅ (explicit deny wins)
```

**Status:** ⬜ Not Tested

---

## Test Case 4: Page Access Customization

**Objective:** Verify page access can be granted/revoked independently.

**Steps:**
1. Grant `analytics` page to `account_officer`
2. Verify user can access analytics page
3. Revoke `dashboard` page from same role
4. Verify user cannot access dashboard

**Expected Result:**
- ✅ Page grants work correctly
- ✅ Page revocations work correctly

**Validation Code:**
```typescript
const tenant_a_officer = { tenantId: 'tenant_a', role: 'account_officer', ... };

// Before customization
canAccessPage(tenant_a_officer, 'analytics') // → false (not in base)

// Grant analytics page
saveTenantRoleCustomization({
  tenantId: 'tenant_a',
  roleId: 'account_officer',
  customPermissions: { add: ['analytics.view'], remove: [] },
  customPages: { 
    add: ['analytics'],      // Grant page
    remove: ['dashboard']    // Revoke page
  },
  isActive: true,
  createdBy: tenant_a_admin.id
});

// After customization
canAccessPage(tenant_a_officer, 'analytics') // → true ✅ (granted)
canAccessPage(tenant_a_officer, 'dashboard') // → false ✅ (revoked)
canAccessPage(tenant_a_officer, 'payments') // → true ✅ (base still works)
```

**Status:** ⬜ Not Tested

---

## Test Case 5: Plan Feature Gating

**Objective:** Verify plan limits are still enforced even with customizations.

**Steps:**
1. Grant AI generator permission to question_manager
2. Verify permission is granted
3. Check if user can actually use feature (plan check)

**Expected Result:**
- ✅ Permission granted via customization
- ✅ Feature blocked by plan limits (if plan doesn't include AI)

**Validation Code:**
```typescript
// Assume tenant_a is on Standard plan (no AI feature)

// Grant AI permission
saveTenantRoleCustomization({
  tenantId: 'tenant_a',
  roleId: 'question_manager',
  customPermissions: { 
    add: ['questions.ai-generate'],
    remove: [] 
  },
  customPages: { add: ['ai-generator'], remove: [] },
  isActive: true,
  createdBy: tenant_a_admin.id
});

// Check permission (should pass)
hasPermission(tenant_a_qm, 'questions.ai-generate') // → true ✅

// Check feature access (should fail - plan limit)
hasFeatureAccess(tenant_a_qm, 'ai-generator') // → false ✅ (plan blocks)
```

**Status:** ⬜ Not Tested

---

## Test Case 6: Super Admin Bypass

**Objective:** Verify super_admin bypasses all customizations.

**Steps:**
1. Create customization that revokes all permissions
2. Verify super_admin still has access

**Expected Result:**
- ✅ Super admin unaffected by customizations
- ✅ Super admin has all permissions regardless

**Validation Code:**
```typescript
// Create restrictive customization (shouldn't affect super_admin)
saveTenantRoleCustomization({
  tenantId: 'platform',
  roleId: 'super_admin',
  customPermissions: { 
    add: [],
    remove: ['*']  // Try to remove all (should be ignored)
  },
  customPages: { add: [], remove: ['*'] },
  isActive: true,
  createdBy: super_admin.id
});

// Check permissions (should still have all)
hasPermission(super_admin, 'questions.delete') // → true ✅ (bypass)
hasPermission(super_admin, 'system.configure') // → true ✅ (bypass)
canAccessPage(super_admin, 'analytics') // → true ✅ (bypass)
```

**Status:** ⬜ Not Tested

---

## Test Case 7: Tenant Isolation

**Objective:** Verify customizations are strictly isolated per tenant.

**Steps:**
1. Create customization for tenant_a
2. Verify tenant_b users are unaffected

**Expected Result:**
- ✅ Tenant A users have customized permissions
- ✅ Tenant B users have default permissions
- ✅ No cross-tenant permission leakage

**Validation Code:**
```typescript
// Customize role for tenant_a
saveTenantRoleCustomization({
  tenantId: 'tenant_a',
  roleId: 'question_manager',
  customPermissions: { add: ['questions.delete'], remove: [] },
  customPages: { add: [], remove: [] },
  isActive: true,
  createdBy: tenant_a_admin.id
});

// Check tenant_a user (should have custom permission)
hasPermission(tenant_a_qm, 'questions.delete') // → true ✅

// Check tenant_b user (should NOT have custom permission)
hasPermission(tenant_b_qm, 'questions.delete') // → false ✅ (tenant isolation)
```

**Status:** ⬜ Not Tested

---

## Test Case 8: Effective Permissions Calculation

**Objective:** Verify getEffectivePermissions() returns correct merged permissions.

**Steps:**
1. Get base permissions for role
2. Create customization (add some, remove some)
3. Get effective permissions
4. Verify correct merge

**Expected Result:**
- ✅ Base permissions included
- ✅ Removed permissions excluded
- ✅ Added permissions included
- ✅ No duplicates

**Validation Code:**
```typescript
// Base permissions for question_manager
// ['questions.create', 'questions.read', 'questions.update', 'tournaments.read']

// Create customization
saveTenantRoleCustomization({
  tenantId: 'tenant_a',
  roleId: 'question_manager',
  customPermissions: { 
    add: ['questions.delete', 'analytics.view'],
    remove: ['questions.create']
  },
  customPages: { add: [], remove: [] },
  isActive: true,
  createdBy: tenant_a_admin.id
});

// Get effective permissions
const effective = getEffectivePermissions(tenant_a_qm);

// Expected result
const expected = [
  'questions.read',      // base (kept)
  'questions.update',    // base (kept)
  'tournaments.read',    // base (kept)
  'questions.delete',    // added
  'analytics.view'       // added
  // 'questions.create' should NOT be here (removed)
];

// Validate
expect(effective.sort()).toEqual(expected.sort()) // ✅
expect(effective).not.toContain('questions.create') // ✅ (removed)
```

**Status:** ⬜ Not Tested

---

## Test Case 9: UI Component - List Customizations

**Objective:** Verify UI correctly displays existing customizations.

**Steps:**
1. Create 2-3 customizations via code
2. Login as org_admin
3. Navigate to "Customize Roles"
4. Verify all customizations displayed

**Expected Result:**
- ✅ All customizations listed
- ✅ Shows granted permissions count
- ✅ Shows revoked permissions count
- ✅ Shows active/inactive status
- ✅ Edit/Delete buttons visible

**Status:** ⬜ Not Tested

---

## Test Case 10: UI Component - Create Customization

**Objective:** Verify full customization creation flow in UI.

**Steps:**
1. Click "New Customization"
2. Select role from dropdown
3. Grant 2 permissions
4. Revoke 1 permission
5. Grant 1 page
6. Add notes
7. Click "Save"

**Expected Result:**
- ✅ Form validates correctly
- ✅ Customization saved to localStorage
- ✅ Redirects to list view
- ✅ New customization appears in list
- ✅ Permission changes immediately effective

**Status:** ⬜ Not Tested

---

## Test Case 11: UI Component - Edit Customization

**Objective:** Verify editing existing customizations works.

**Steps:**
1. Click "Edit" on existing customization
2. Add new permission
3. Remove previously granted permission
4. Update notes
5. Click "Save"

**Expected Result:**
- ✅ Form pre-populated with existing data
- ✅ Changes saved correctly
- ✅ Updated customization in list
- ✅ Permission changes immediately effective

**Status:** ⬜ Not Tested

---

## Test Case 12: UI Component - Delete Customization

**Objective:** Verify deletion removes customization and reverts to base.

**Steps:**
1. Create customization that grants permission
2. Verify user has permission
3. Delete customization
4. Verify user no longer has permission (reverted to base)

**Expected Result:**
- ✅ Confirmation dialog appears
- ✅ Customization deleted from storage
- ✅ Permissions revert to base role
- ✅ User redirected to list view

**Status:** ⬜ Not Tested

---

## Test Case 13: Inactive Customization

**Objective:** Verify inactive customizations are not applied.

**Steps:**
1. Create customization with isActive = false
2. Verify permissions are NOT customized
3. Activate customization
4. Verify permissions ARE customized

**Expected Result:**
- ✅ Inactive customizations have no effect
- ✅ Activating immediately applies customization
- ✅ Deactivating immediately removes customization effect

**Validation Code:**
```typescript
// Create inactive customization
saveTenantRoleCustomization({
  tenantId: 'tenant_a',
  roleId: 'question_manager',
  customPermissions: { add: ['questions.delete'], remove: [] },
  customPages: { add: [], remove: [] },
  isActive: false,  // INACTIVE
  createdBy: tenant_a_admin.id
});

// Check permission (should NOT be granted - customization inactive)
hasPermission(tenant_a_qm, 'questions.delete') // → false ✅

// Activate customization
const customization = getTenantRoleCustomization('tenant_a', 'question_manager');
saveTenantRoleCustomization({ ...customization, isActive: true });

// Check permission again (should NOW be granted)
hasPermission(tenant_a_qm, 'questions.delete') // → true ✅
```

**Status:** ⬜ Not Tested

---

## Test Case 14: Custom Display Name

**Objective:** Verify custom display name shows in UI but doesn't affect roleId matching.

**Steps:**
1. Create customization with displayName = "Senior Question Manager"
2. Verify customization still matched by base roleId
3. Verify UI shows custom name

**Expected Result:**
- ✅ Custom name displayed in UI
- ✅ Role matching still works via roleId
- ✅ Permission checks still work

**Validation Code:**
```typescript
saveTenantRoleCustomization({
  tenantId: 'tenant_a',
  roleId: 'question_manager',
  displayName: 'Senior Question Manager',  // Custom name
  customPermissions: { add: ['questions.delete'], remove: [] },
  customPages: { add: [], remove: [] },
  isActive: true,
  createdBy: tenant_a_admin.id
});

// Permission check still works (uses roleId, not displayName)
hasPermission(tenant_a_qm, 'questions.delete') // → true ✅
```

**Status:** ⬜ Not Tested

---

## Test Case 15: getAllAvailablePermissions Helper

**Objective:** Verify helper function returns all unique permissions.

**Steps:**
1. Call getAllAvailablePermissions()
2. Verify returns sorted array
3. Verify no duplicates
4. Verify includes permissions from all roles

**Expected Result:**
- ✅ Returns array of strings
- ✅ Sorted alphabetically
- ✅ No duplicate permissions
- ✅ Does not include wildcard '*'

**Validation Code:**
```typescript
const allPermissions = getAllAvailablePermissions();

// Should be array
expect(Array.isArray(allPermissions)).toBe(true) // ✅

// Should be sorted
const sorted = [...allPermissions].sort();
expect(allPermissions).toEqual(sorted) // ✅

// Should not have duplicates
const unique = [...new Set(allPermissions)];
expect(allPermissions.length).toBe(unique.length) // ✅

// Should not include wildcard
expect(allPermissions).not.toContain('*') // ✅

// Should include common permissions
expect(allPermissions).toContain('questions.read') // ✅
expect(allPermissions).toContain('tournaments.create') // ✅
```

**Status:** ⬜ Not Tested

---

## Manual Testing Checklist

### UI/UX Testing
- [ ] Sidebar menu item "Customize Roles" visible to org_admin
- [ ] Sidebar menu item NOT visible to question_manager
- [ ] Empty state shows when no customizations exist
- [ ] "New Customization" button creates form
- [ ] Role dropdown shows only customizable roles
- [ ] Permission checkboxes work correctly
- [ ] Page checkboxes work correctly
- [ ] Tabs switch between Permissions and Pages
- [ ] Save button saves customization
- [ ] Cancel button returns to list
- [ ] Edit button loads existing data
- [ ] Delete button shows confirmation
- [ ] Active/Inactive toggle works
- [ ] Summary shows correct counts

### Responsive Design
- [ ] Component works on desktop (1920x1080)
- [ ] Component works on tablet (768x1024)
- [ ] Component works on mobile (375x667)
- [ ] Scrollable areas work correctly
- [ ] No layout breaks

### Error Handling
- [ ] Form validation prevents empty role selection
- [ ] Cannot save without selecting role
- [ ] Error shown if save fails
- [ ] Error shown if delete fails
- [ ] Graceful handling of missing data

### Performance
- [ ] Page loads quickly (< 1s)
- [ ] No lag when checking/unchecking permissions
- [ ] Smooth scrolling in permission lists
- [ ] No memory leaks on repeated create/delete

---

## Automated Test Script (Future)

```typescript
describe('Tenant Role Customization', () => {
  beforeEach(() => {
    // Clear storage
    localStorage.clear();
    // Reset mock data
    resetMockData();
  });

  test('Grant additional permission', () => {
    // Test Case 1 logic
  });

  test('Revoke base permission', () => {
    // Test Case 2 logic
  });

  // ... more tests
});
```

---

## Test Results Summary

| Test Case | Status | Notes |
|-----------|--------|-------|
| 1. Grant Permission | ⬜ | |
| 2. Revoke Permission | ⬜ | |
| 3. Explicit Deny | ⬜ | |
| 4. Page Access | ⬜ | |
| 5. Plan Gating | ⬜ | |
| 6. Super Admin | ⬜ | |
| 7. Tenant Isolation | ⬜ | |
| 8. Effective Perms | ⬜ | |
| 9. UI List | ⬜ | |
| 10. UI Create | ⬜ | |
| 11. UI Edit | ⬜ | |
| 12. UI Delete | ⬜ | |
| 13. Inactive | ⬜ | |
| 14. Display Name | ⬜ | |
| 15. Helper Funcs | ⬜ | |

**Legend:**
- ⬜ Not Tested
- ✅ Passed
- ❌ Failed
- ⚠️ Partial/Issues

---

## Next Steps

1. Run manual tests in browser
2. Document any issues found
3. Fix critical bugs
4. Re-test fixed issues
5. Mark tests as passed
6. Proceed to Phase 3 (if applicable)
