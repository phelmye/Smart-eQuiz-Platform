# Testing Guide - How to Test Tenant Role Customization

## Quick Start

### Prerequisites
- Dev server running on http://localhost:5173
- Browser with DevTools (Chrome/Edge/Firefox)
- Logged in as org_admin

---

## 🚀 Option 1: Quick Smoke Test (5 minutes)

**Best for:** Quick validation that basic functionality works

### Steps:
1. Open http://localhost:5173 in browser
2. Login as org_admin (use mock auth if needed)
3. Press F12 to open DevTools
4. Go to Console tab
5. Copy and paste contents of `smoke-test.js`
6. Press Enter

### Expected Output:
```
🚀 Starting Quick Smoke Test...

Test 1: Verify functions exist
✅ All functions exist

Test 2: Create customization
✅ Customization created: ID=xxxxx

Test 3: Retrieve customization
✅ Customization retrieved

Test 4: Permission check
✅ Permission granted (customization working)

Test 5: Helper functions
✅ Helper functions work: 45 permissions, 23 pages

Cleaning up test data...
✅ Cleanup complete

🎉 Smoke Test Complete!
```

**If all ✅:** Basic functionality works! Proceed to full test suite.  
**If any ❌:** Check console errors and review implementation.

---

## 🧪 Option 2: Full Automated Test Suite (15 minutes)

**Best for:** Comprehensive validation of all backend logic

### Steps:
1. Open http://localhost:5173 in browser
2. Login as org_admin
3. Press F12 to open DevTools
4. Go to Console tab
5. Copy and paste contents of `test-role-customization.js`
6. Press Enter (this loads the functions)
7. Run: `runRoleCustomizationTests()`
8. Wait for tests to complete (~30 seconds)

### Expected Output:
```
============================================================
🧪 TENANT ROLE CUSTOMIZATION TEST SUITE
============================================================

🧹 Cleaning up test data...
✓ Test data cleaned up

📝 Test 1: Grant Additional Permission
✅ PASS: Before: question_manager should NOT have questions.delete
✅ PASS: After: question_manager SHOULD have questions.delete

📝 Test 2: Revoke Base Permission
✅ PASS: Before: question_manager SHOULD have questions.create
✅ PASS: After: question_manager should NOT have questions.create
✅ PASS: Should still have questions.read

... (more tests)

============================================================
📊 TEST RESULTS
============================================================
✅ Passed: 30
❌ Failed: 0
📈 Success Rate: 100.0%
============================================================

🎉 ALL TESTS PASSED! 🎉
```

### Interpreting Results:
- **100% Pass:** Implementation is correct! ✅
- **Partial Pass:** Review failed tests, fix issues, re-run
- **All Fail:** Check browser console for errors

---

## 👁️ Option 3: Manual UI Testing (30 minutes)

**Best for:** Validating user experience and visual elements

### Test 3.1: Navigate to Feature

1. Login as org_admin
2. Open sidebar menu (hamburger icon)
3. Look for "User Management" section
4. Click "Customize Roles" (should have "New" badge)

**Expected:**
- ✅ Menu item visible to org_admin
- ✅ Clicking opens Role Customization page
- ✅ Page loads without errors

---

### Test 3.2: Empty State

**If no customizations exist:**

**Expected:**
- ✅ Empty state card displays
- ✅ Shows icon and message
- ✅ "Create Customization" button visible

---

### Test 3.3: Create Customization

1. Click "New Customization" button
2. Select role from dropdown (e.g., "Question Manager")
3. (Optional) Enter custom display name
4. Go to **Permissions** tab
5. In "Grant Additional Permissions" section:
   - ✅ Check `questions.delete`
   - ✅ Check `analytics.view`
6. In "Revoke Base Permissions" section:
   - ✅ Check `questions.create`
7. Go to **Pages** tab
8. In "Grant Additional Pages" section:
   - ✅ Check `analytics`
9. Scroll down to Notes
10. Enter: "Test customization for senior question managers"
11. Verify "Active" checkbox is checked ✅
12. Review summary box at bottom
13. Click "Save Customization"

**Expected:**
- ✅ Form validates (prevents save without role selection)
- ✅ Tabs switch smoothly
- ✅ Checkboxes toggle correctly
- ✅ Summary shows:
  - "Will have: X permissions"
  - "+ 2 added"
  - "- 1 removed"
- ✅ Save redirects to list view
- ✅ New customization appears in list

---

### Test 3.4: View Customization Card

**Expected card content:**
- ✅ Role name (or custom display name)
- ✅ "2 permissions added"
- ✅ "1 permission removed"
- ✅ "1 page added"
- ✅ "0 pages removed"
- ✅ Notes preview (if space allows)
- ✅ Edit button
- ✅ Delete button (trash icon)

---

### Test 3.5: Edit Customization

1. Click "Edit" button on customization
2. Form loads with existing data pre-filled
3. Go to Permissions tab
4. Uncheck one of the previously added permissions
5. Add a new permission
6. Update notes
7. Click "Save Customization"

**Expected:**
- ✅ Form pre-populated correctly
- ✅ Changes saved
- ✅ Redirects to list
- ✅ Card shows updated counts

---

### Test 3.6: Delete Customization

1. Click delete icon (trash) on customization
2. Confirmation dialog appears
3. Click "Cancel" - dialog closes, customization remains
4. Click delete icon again
5. Click "Delete" in dialog

**Expected:**
- ✅ Confirmation dialog prevents accidental deletion
- ✅ Cancel works correctly
- ✅ Delete removes customization
- ✅ Card disappears from list
- ✅ If no more customizations, empty state shows

---

### Test 3.7: Validate Permission Changes

1. Create customization granting `questions.delete` to `question_manager`
2. Login as a user with `question_manager` role in same tenant
3. Navigate to Question Bank
4. Try to delete a question

**Expected:**
- ✅ Delete button/action is available (permission granted)
- ✅ User can delete question

5. Login as `question_manager` in **different tenant**
6. Try to delete a question

**Expected:**
- ✅ Delete button/action is NOT available (tenant isolation)
- ✅ Permission denied

---

## 📊 Test Result Tracking

### Update TEST_EXECUTION_REPORT.md

After each test, update the report:

1. Change status from ⏳ PENDING to:
   - ✅ PASSED (if test passed)
   - ❌ FAILED (if test failed)
2. Document actual results
3. Add screenshots if needed
4. Note any issues found

Example:
```markdown
### ✅ Test 1: Grant Additional Permission
**Status:** ✅ PASSED
**Expected Result:** Permission granted after customization
**Actual Result:** Permission granted successfully. Tested with tenant_a and tenant_b.
**Notes:** Works as expected. Tenant isolation confirmed.
```

---

## 🐛 If You Find Bugs

### Document the Bug

1. **Test Case:** Which test failed?
2. **Steps to Reproduce:** Exact steps
3. **Expected Result:** What should happen
4. **Actual Result:** What actually happened
5. **Screenshots:** If UI issue
6. **Console Errors:** Copy any errors from DevTools
7. **Environment:** Browser, OS, etc.

### Example Bug Report:
```markdown
**Bug:** Customization not applying to users

**Test:** Test 3.7 - Validate Permission Changes

**Steps:**
1. Created customization granting questions.delete
2. Logged in as question_manager
3. Tried to delete question

**Expected:** Delete button visible
**Actual:** Delete button not visible

**Console Error:** 
TypeError: Cannot read property 'customPermissions' of undefined
  at hasPermission (mockData.ts:2545)

**Browser:** Chrome 119
**OS:** Windows 11
```

---

## 🎯 Test Completion Checklist

Use this checklist to track your progress:

### Automated Tests
- [ ] Smoke test passed (all 5 checks)
- [ ] Full test suite passed (all 10 tests)
- [ ] No console errors during tests
- [ ] Test cleanup successful

### UI Tests
- [ ] Navigation to feature works
- [ ] Empty state displays correctly
- [ ] Create customization works
- [ ] Edit customization works
- [ ] Delete customization works
- [ ] Permission changes apply correctly
- [ ] Tenant isolation verified

### Security Tests
- [ ] Explicit deny precedence verified
- [ ] Tenant isolation validated
- [ ] Super admin bypass works
- [ ] Plan limits enforced

### Performance Tests
- [ ] Page loads in < 1 second
- [ ] No lag when checking permissions
- [ ] Smooth scrolling in lists

### Cross-Browser
- [ ] Chrome/Edge tested
- [ ] Firefox tested (optional)
- [ ] Safari tested (optional)

### Documentation
- [ ] TEST_EXECUTION_REPORT.md updated
- [ ] Screenshots captured
- [ ] Bugs documented

---

## 📞 Need Help?

### Common Issues

**Issue:** Functions not defined in console
- **Solution:** Refresh page, ensure logged in, check imports in mockData.ts

**Issue:** Tests fail with "undefined"
- **Solution:** Check localStorage, verify user is logged in with correct role

**Issue:** UI not showing menu item
- **Solution:** Verify logged in as org_admin, check AdminSidebar.tsx permissions

**Issue:** Permission not applying
- **Solution:** Check customization isActive=true, verify tenantId matches user

### Debug Commands

Run these in browser console:

```javascript
// Check current user
console.log(JSON.parse(localStorage.getItem('equiz_current_user')));

// Check customizations
console.log(JSON.parse(localStorage.getItem('equiz_tenant_role_customizations')));

// Test permission manually
hasPermission({ tenantId: 'xxx', role: 'yyy' }, 'questions.delete');

// Get effective permissions
getEffectivePermissions({ tenantId: 'xxx', role: 'yyy' });
```

---

## ✅ When Testing is Complete

1. **Update TEST_EXECUTION_REPORT.md** with all results
2. **Commit test results** to repository
3. **Create bug reports** for any issues found
4. **Update TODO list** - mark testing complete
5. **Proceed to bug fixes** (if any)
6. **Schedule UAT** with actual users

---

**Happy Testing! 🧪**

If all tests pass, congratulations! The implementation is production-ready. 🎉
