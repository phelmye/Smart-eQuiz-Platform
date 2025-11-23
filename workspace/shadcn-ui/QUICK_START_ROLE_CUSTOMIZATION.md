# Quick Start Guide: Role Customization

## For Organization Administrators

This guide will walk you through customizing role permissions for your organization in under 5 minutes.

---

## What is Role Customization?

Role customization allows you to tailor the permissions and page access for each role in your organization. For example:

- Allow your **question managers** to delete questions (normally they can only create/edit)
- Restrict **account officers** from certain analytics pages
- Grant **inspectors** access to advanced reporting features

All customizations apply **only to your organization** - other tenants are unaffected.

---

## Step-by-Step Tutorial

### Step 1: Navigate to Role Customization

1. Login to your Smart eQuiz Platform account as an **Organization Administrator**
2. Open the **sidebar menu** (click hamburger icon if collapsed)
3. Look for the **"User Management"** section
4. Click on **"Customize Roles"** (it has a "New" badge)

```
Sidebar Menu:
├── Dashboard
├── 📊 Analytics
├── 👥 User Management
│   ├── Manage Users
│   ├── Roles & Permissions
│   └── 🎯 Customize Roles ← Click here!
├── 🏆 Tournaments
└── ...
```

---

### Step 2: View Existing Customizations

You'll see one of two screens:

**A) Empty State (First Time)**
```
┌─────────────────────────────────────────┐
│  🛡️  No Customizations Yet              │
│                                          │
│  Create your first role customization   │
│  to tailor permissions for your org     │
│                                          │
│  [Create Customization]                 │
└─────────────────────────────────────────┘
```

**B) List of Customizations**
```
┌────────────────────┬────────────────────┐
│ Question Manager   │ Account Officer    │
├────────────────────┼────────────────────┤
│ ✅ 2 perms added   │ ✅ 1 perm added    │
│ ❌ 1 perm removed  │ ❌ 0 perms removed │
│ ✅ 0 pages added   │ ✅ 1 page added    │
│ ❌ 0 pages removed │ ❌ 1 page removed  │
│                    │                    │
│ [Edit] [Delete]    │ [Edit] [Delete]    │
└────────────────────┴────────────────────┘
```

---

### Step 3: Create New Customization

Click the **"New Customization"** button in the top-right corner.

#### 3.1 Select Base Role

```
┌──────────────────────────────────────────┐
│ Base Role *                               │
│ ┌──────────────────────────────────────┐ │
│ │ Select a role to customize ▼         │ │
│ └──────────────────────────────────────┘ │
│                                           │
│ Available roles:                          │
│ - Organization Administrator              │
│ - Question Manager                        │
│ - Account Officer                         │
│ - Quiz Participant                        │
│ - Quiz Inspector                          │
│ - Practice User                           │
│ - Spectator                               │
└───────────────────────────────────────────┘
```

**Select the role you want to customize.** For this example, let's choose **"Question Manager"**.

#### 3.2 (Optional) Custom Display Name

```
┌──────────────────────────────────────────┐
│ Custom Display Name (Optional)            │
│ ┌──────────────────────────────────────┐ │
│ │ Senior Question Manager              │ │
│ └──────────────────────────────────────┘ │
│ Custom name for this role in your org    │
└───────────────────────────────────────────┘
```

This is just a label - it doesn't affect functionality. You can use it to differentiate customized roles (e.g., "Junior QM" vs "Senior QM").

---

### Step 4: Customize Permissions

Click the **"Permissions"** tab.

#### 4.1 Grant Additional Permissions

```
┌────────────────────────────────────────────┐
│ ✅ Grant Additional Permissions            │
├────────────────────────────────────────────┤
│ Select permissions to ADD to this role:    │
│                                             │
│ ☐ analytics.view                           │
│ ☑ questions.delete      ← Checked          │
│ ☐ questions.ai-generate                    │
│ ☐ tournaments.create                       │
│ ☐ billing.manage                           │
│ ...                                         │
└────────────────────────────────────────────┘
```

**Check the boxes** for permissions you want to **add** to this role.

**Example:** Check `questions.delete` to allow Question Managers to delete questions.

#### 4.2 Revoke Base Permissions

```
┌────────────────────────────────────────────┐
│ ❌ Revoke Base Permissions                 │
├────────────────────────────────────────────┤
│ Select permissions to REMOVE from role:    │
│                                             │
│ ☐ questions.create                         │
│ ☐ questions.read                           │
│ ☑ questions.update      ← Checked          │
│ ☐ tournaments.read                         │
│ ...                                         │
└────────────────────────────────────────────┘
```

**Check the boxes** for permissions you want to **remove** from this role.

**Example:** Check `questions.update` to prevent Question Managers from editing existing questions.

---

### Step 5: Customize Page Access

Click the **"Page Access"** tab.

#### 5.1 Grant Additional Pages

```
┌────────────────────────────────────────────┐
│ ✅ Grant Additional Pages                  │
├────────────────────────────────────────────┤
│ Select pages to ADD to this role:          │
│                                             │
│ ☑ analytics          ← Checked             │
│ ☐ billing                                  │
│ ☐ payments                                 │
│ ☐ system-settings                          │
│ ...                                         │
└────────────────────────────────────────────┘
```

**Check the boxes** for pages you want to **grant access** to.

**Example:** Check `analytics` to allow Question Managers to view analytics.

#### 5.2 Revoke Base Pages

```
┌────────────────────────────────────────────┐
│ ❌ Revoke Base Pages                       │
├────────────────────────────────────────────┤
│ Select pages to REMOVE from role:          │
│                                             │
│ ☐ dashboard                                │
│ ☐ question-bank                            │
│ ☑ ai-generator       ← Checked             │
│ ☐ tournaments                              │
│ ...                                         │
└────────────────────────────────────────────┘
```

**Check the boxes** for pages you want to **revoke access** from.

**Example:** Check `ai-generator` to prevent Question Managers from using AI generation.

---

### Step 6: Add Notes (Recommended)

```
┌──────────────────────────────────────────┐
│ Notes (Optional)                          │
│ ┌──────────────────────────────────────┐ │
│ │ Allowing senior question managers    │ │
│ │ to delete outdated questions after   │ │
│ │ review process completion.           │ │
│ └──────────────────────────────────────┘ │
│ Why is this customization needed?         │
└───────────────────────────────────────────┘
```

**Add a note** explaining why you made this customization. This helps with:
- Future reference
- Team communication
- Audit compliance

---

### Step 7: Review Summary

Before saving, review the **Summary Box** at the bottom:

```
┌────────────────────────────────────────────┐
│ 📊 Summary                                  │
├────────────────────────────────────────────┤
│ ✅ Will have: 5 permissions                │
│   + 2 added (questions.delete, analytics)  │
│   - 1 removed (questions.update)           │
│                                             │
│ ✅ Will access: 7 pages                    │
│   + 1 added (analytics)                    │
│   - 1 removed (ai-generator)               │
└────────────────────────────────────────────┘
```

This shows the **final result** after your customizations are applied.

---

### Step 8: Save and Activate

1. Ensure the **"Active"** checkbox is checked ✅
   ```
   ☑ Active (customization is enforced)
   ```

2. Click the **"Save Customization"** button

3. You'll be redirected to the list view showing your new customization

---

## Real-World Examples

### Example 1: Junior Question Manager

**Scenario:** New hires should only review questions, not create or modify.

**Customization:**
- **Base Role:** Question Manager
- **Display Name:** "Junior Question Manager"
- **Revoke Permissions:**
  - ✅ questions.create
  - ✅ questions.update
  - ✅ questions.delete
- **Keep Permissions:**
  - questions.read (for review)
- **Notes:** "Junior QMs review only during 3-month probation"

**Result:** Can see questions but cannot change anything.

---

### Example 2: Senior Question Manager

**Scenario:** Experienced staff need full control including deletion.

**Customization:**
- **Base Role:** Question Manager
- **Display Name:** "Senior Question Manager"
- **Grant Permissions:**
  - ✅ questions.delete
  - ✅ analytics.view
- **Grant Pages:**
  - ✅ analytics
- **Notes:** "Senior QMs need analytics for performance tracking"

**Result:** Full question management + analytics access.

---

### Example 3: Finance-Focused Account Officer

**Scenario:** Finance department needs billing and analytics, not payments.

**Customization:**
- **Base Role:** Account Officer
- **Display Name:** "Finance Officer"
- **Grant Permissions:**
  - ✅ billing.manage
  - ✅ analytics.view.financial
- **Revoke Pages:**
  - ✅ payments (they don't process payments)
- **Notes:** "Finance team analyzes billing, doesn't process payments"

**Result:** Can manage billing and view analytics, but not process payments.

---

### Example 4: Read-Only Demo Account

**Scenario:** Demo tenant should only view, not modify.

**Customization:**
- **Base Role:** Question Manager
- **Display Name:** "Demo Question Viewer"
- **Revoke Permissions:**
  - ✅ questions.create
  - ✅ questions.update
  - ✅ questions.delete
- **Notes:** "Demo account for trial users - read-only access"

**Result:** Can browse questions but cannot make any changes.

---

## Editing Existing Customizations

1. Go to **"Customize Roles"** in sidebar
2. Find the customization card
3. Click **"Edit"** button
4. Make your changes
5. Click **"Save Customization"**

**Changes apply immediately** to all users with that role in your organization.

---

## Deleting Customizations

1. Go to **"Customize Roles"** in sidebar
2. Find the customization card
3. Click the **trash icon** (🗑️)
4. Confirm deletion in dialog
5. Users will **revert to base role permissions** immediately

---

## Temporarily Disabling Customizations

If you want to temporarily disable without deleting:

1. Click **"Edit"** on the customization
2. **Uncheck** the "Active" checkbox
3. Click **"Save"**

The customization is saved but not applied. You can re-enable anytime by checking "Active" again.

---

## FAQs

### Q: Can I customize the same role multiple times?
**A:** No, each role can only have one customization per tenant. Editing will update the existing customization.

### Q: Will this affect other tenants/organizations?
**A:** No, customizations are **strictly isolated** per tenant. Your changes only affect your organization.

### Q: Can I customize the Super Admin role?
**A:** No, system-critical roles like Super Admin cannot be customized for security reasons.

### Q: What if my subscription plan doesn't include a feature?
**A:** You can grant the permission, but users still cannot use features not included in your plan. Plan limits always apply.

### Q: How quickly do changes take effect?
**A:** **Immediately.** Users will see changed permissions on their next action (may need to refresh page).

### Q: Can I revert to defaults?
**A:** Yes, just delete the customization. Users will revert to base role permissions instantly.

### Q: Can I see what permissions a role will have?
**A:** Yes, the **Summary Box** at the bottom of the edit form shows the final result after customizations.

### Q: Who can see my customization notes?
**A:** Only organization administrators with access to the Role Customization page.

---

## Best Practices

✅ **DO:**
- Add descriptive notes explaining why customizations were made
- Use custom display names to differentiate role variations
- Review summary before saving
- Test with a single user before applying to all
- Document organizational policies around role customizations

❌ **DON'T:**
- Grant permissions users don't need (principle of least privilege)
- Revoke critical permissions without testing
- Forget to check "Active" when you want immediate enforcement
- Delete customizations without notifying affected users

---

## Troubleshooting

### Issue: I saved but users still can't access the feature

**Check:**
1. Is the customization marked as "Active"? ✅
2. Does your subscription plan include this feature? 💰
3. Did the user refresh their page? 🔄

### Issue: Changes aren't showing in the list

**Solution:**
- Refresh the page (Ctrl+R or Cmd+R)
- Check browser console for errors (F12)

### Issue: Can't find "Customize Roles" in sidebar

**Check:**
- Are you logged in as an **Organization Administrator**?
- Do you have **roles.manage** permission?
- Try expanding the User Management section

---

## Support

Need help? Contact your platform administrator or refer to:
- **Full Documentation:** `TENANT_ROLE_CUSTOMIZATION.md`
- **Technical Details:** `IMPLEMENTATION_SUMMARY_PHASE_1_2.md`

---

**Happy Customizing! 🎉**

*This feature gives you the flexibility to tailor roles to your organization's unique needs while maintaining security and compliance.*
