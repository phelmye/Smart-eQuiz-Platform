# Registration Enhancement Summary

**Date:** November 16, 2025  
**Feature:** Parish/Organization Selection with Search

---

## ✅ What Was Done

### Understanding the Data Model

**Important Clarification:**
- **Tenant** = Diocese/Organization (the account holder) - **COMPLETE ISOLATION BOUNDARY**
- **Parish** = Individual church/parish **WITHIN A TENANT** - tenant-specific
- **User's Parish** = The specific church the participant belongs to (used for team grouping)
- **User's Tenant** = The organization they registered under (determines ALL data visibility)

**Key Principle: Complete Tenant Isolation**
- Users registered under "Diocese A" can ONLY see data from "Diocese A"
- Users registered under "Diocese B" can ONLY see data from "Diocese B"  
- **Parishes are tenant-specific** - Diocese A and Diocese B each have their own parish lists
- All data (users, tournaments, parishes) is completely isolated per tenant

**Example:**
```
Diocese A (Catholic Diocese of Lagos):
├─ Parishes (only visible to Diocese A users):
│  ├─ St. Mary Cathedral (Lagos)
│  ├─ Holy Cross Church (Ikeja)
│  └─ St. John's Parish (Victoria Island)
├─ Users:
│  ├─ John (belongs to "St. Mary Cathedral")
│  └─ Mary (belongs to "Holy Cross Church")
└─ Tournament: Lagos Championship
    └─ Only Diocese A users/parishes

Diocese B (Anglican Diocese of Abuja):
├─ Parishes (only visible to Diocese B users):
│  ├─ St. Mary Cathedral (Abuja) ← Same name, different tenant!
│  ├─ Grace Assembly
│  └─ Trinity Church
├─ Users:
│  ├─ Peter (belongs to "St. Mary Cathedral" in Abuja)
│  └─ Sarah (belongs to "Grace Assembly")
└─ Tournament: Abuja Cup
    └─ Only Diocese B users/parishes

✅ Complete isolation - Diocese A never sees Diocese B data
✅ Each tenant manages their own parishes independently
```

### 1. Located Existing Parish Registration Form
**Found:** `apps/tenant-app/src/components/AddParishForm.tsx`

This form was already created and includes:
- Parish basic information (name, phone, email, image)
- Parish authority/leader information
- Contact person details
- Location information with map integration
- Full validation
- Submission to mock data storage

**Updated:** Now accepts optional `tenantId` prop for use during registration (before user is authenticated)

### 2. Updated User Interface
**File:** `apps/tenant-app/src/lib/mockData.ts`

Added `parishId` field to User interface:
```typescript
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  tenantId: string;
  parishId?: string; // NEW: Parish/Organization the user belongs to
  // ... other fields
}
```

### 3. Enhanced Registration Form
**File:** `apps/tenant-app/src/components/AuthSystem.tsx`

#### Added New State Variables:
```typescript
const [selectedParishId, setSelectedParishId] = useState<string>('');
const [parishSearchQuery, setParishSearchQuery] = useState('');
const [showAddParishForm, setShowAddParishForm] = useState(false);
```

#### Updated RegisterData Interface:
```typescript
interface RegisterData {
  email: string;
  password: string;
  name: string;
  tenantId: string;
  parishId?: string; // NEW
  role: 'org_admin' | 'inspector';
}
```

#### New Features in Registration UI:

1. **Two-Step Selection Process:**
   - First, user selects their Organization/Diocese
   - Then, parish selection appears with search functionality

2. **Parish Search with Live Results:**
   - Real-time search as user types
   - Displays matching parishes from the database
   - Shows parish name and location
   - Visual indicator for verified parishes
   - Click to select a parish

3. **Selected Parish Indication:**
   - Highlights selected parish with blue background
   - Shows selected parish name below the list
   - Disables submit button until parish is selected

4. **Register New Parish Option:**
   - Button: "+ Register New Parish"
   - Opens `AddParishForm` component inline
   - After successful registration, automatically selects the new parish
   - Returns to registration form with success message

5. **Validation:**
   - Ensures parish is selected before registration
   - Shows error message if user tries to register without selecting parish

### 4. Updated Registration Logic
**File:** `apps/tenant-app/src/components/AuthSystem.tsx`

Modified `register()` function to:
- Accept `parishId` from form data
- Store `parishId` with the new user
- Validate parish selection before creating account

Modified `handleRegister()` function to:
- Include `parishId` in registration data
- Validate parish selection
- Show appropriate error messages

---

## 🎯 User Flow

### Registration Process:

1. **User clicks "Register" tab**
   - Sees standard registration fields (Name, Email, Password)

2. **User selects Organization/Diocese (Tenant)**
   - Dropdown shows all available dioceses/organizations
   - Example: "Catholic Diocese of Lagos"
   - Helper text: "Select the organization you're registering under. Your data will only be visible within this organization."
   - **CRITICAL:** This determines which organization's data the user can access

3. **Parish selection appears**
   - Label: "Parish *" (or custom label like "Church", "Congregation")
   - Helper text: "Select your home parish. This will be used for team grouping in tournaments."
   - Search box: "Search for your parish..."
   - **Searches ALL parishes globally** (not filtered by tenant)
   - User can select ANY parish from ANY location

4. **Search results display**
   - Shows matching parishes **from across ALL organizations**
   - Each result shows:
     - Parish name (bold)
     - Location address (gray text)
     - "Verified" badge if applicable
   - Click any parish to select it
   - **Note:** Two users from different tenants can select the same parish

5. **If parish not found:**
   - Message: "No parish found matching [search term]"
   - Helper text: "Start typing to search for your parish, or register it if not found"
   - Button: "+ Register New Parish"
   - New parish becomes globally available immediately

6. **Parish registration (if needed):**
   - User fills out complete parish information
   - Parish is created and stored with tenantId (for audit/reference)
   - Parish becomes **globally accessible** to all users
   - Returns to registration with parish pre-selected

7. **Complete registration:**
   - User account created with:
     - tenantId: Determines data access boundary
     - parishId: Used for tournament team grouping
   - User can only access data from their tenant
   - User's tournament participation grouped by parish

---

## 📋 Database Schema

### User Model (Updated):
```typescript
{
  id: string;
  name: string;
  email: string;
  role: UserRole;
  tenantId: string;        // Organization/Diocese
  parishId?: string;       // Specific Parish (NEW)
  // ... other fields
}
```

### Parish Model (Already Exists):
```typescript
{
  id: string;
  name: string;
  tenantId: string;
  authority: ParishAuthority;
  contactPerson: ParishContactPerson;
  location: ParishLocation;
  parishPhoneNumber: string;
  parishEmailAddress: string;
  parishImage?: string;
  isActive: boolean;
  isVerified: boolean;      // Admin verification required
  verifiedBy?: string;
  verifiedAt?: string;
  createdBy: string;
  createdAt: string;
}
```

---

## 🔍 How Parish Data Works

### Available Functions (from mockData.ts):

1. **`getParishesByTenant(tenantId: string)`**
   - Returns all parishes for a specific organization
   - Used to populate the parish list

2. **`searchParishes(query: string, tenantId?: string)`**
   - Searches parishes by name or location
   - Can be scoped to specific tenant
   - Used for real-time search

3. **`addParish(parishData)`**
   - Creates new parish
   - Returns parish ID on success
   - Used by AddParishForm component

4. **`getParishById(parishId: string)`**
   - Retrieves specific parish details
   - Can be used to display parish info in user profile

---

## 🎨 UI Components Used

1. **Input** - Search box for parish search
2. **Select** - Organization/Diocese dropdown
3. **Badge** - Shows "Verified" status on parishes
4. **Alert** - Error messages and success notifications
5. **Button** - "Register New Parish" action
6. **Custom Parish List** - Scrollable, clickable list of parishes

---

## ✅ Testing Checklist

### Test Scenarios:

- [ ] Select organization → Parish search appears
- [ ] Type in search box → Results filter in real-time
- [ ] Click a parish → It becomes selected (blue highlight)
- [ ] Selected parish name displays below list
- [ ] Submit button disabled without parish selection
- [ ] Click "Register New Parish" → AddParishForm opens
- [ ] Complete parish registration → Returns to main form
- [ ] Newly registered parish auto-selected
- [ ] Complete user registration → Account created with parishId
- [ ] Login → User profile shows associated parish

---

## 📦 Files Modified

1. **`apps/tenant-app/src/components/AuthSystem.tsx`** (Modified)
   - Added parish selection UI
   - Added search functionality
   - Integrated AddParishForm
   - Updated registration logic

2. **`apps/tenant-app/src/lib/mockData.ts`** (Modified)
   - Added `parishId` to User interface

3. **`apps/tenant-app/src/components/AddParishForm.tsx`** (Already Exists)
   - No changes needed
   - Successfully integrated

---

## 🚀 Next Steps

### Immediate Enhancements:

1. **Backend Integration:**
   - Connect parish search to actual API
   - Implement real-time search with debouncing
   - Add parish verification workflow

2. **User Profile:**
   - Display parish information in user profile
   - Allow users to change their parish (with approval)
   - Show parish-specific leaderboards

3. **Admin Features:**
   - Parish approval dashboard
   - Bulk parish import
   - Parish analytics

4. **Additional Features:**
   - Parish logo/image display in search results
   - Parish statistics (member count)
   - Parish contact information display
   - Map view for parish location

### Data Migration:

For existing users without `parishId`:
```typescript
// Migration script needed
const users = getAllUsers();
users.forEach(user => {
  if (!user.parishId) {
    // Assign to default parish or prompt user to select
    user.parishId = 'default_parish_id';
  }
});
saveUsers(users);
```

---

## 📝 Notes

### Design Decisions:

1. **Tenant = Data Isolation Boundary:**
   - User's tenantId determines what data they can access
   - Users in "Diocese A" can NEVER see users/tournaments from "Diocese B"
   - All queries (tournaments, users, leaderboards) must filter by tenantId
   - **Example:**
     - Diocese Lagos creates "Lagos Championship" tournament
     - Only users with tenantId="diocese_lagos" can see/join this tournament
     - Diocese Abuja users cannot see this tournament at all

2. **Parishes = Global Master List:**
   - Parishes are NOT restricted per tenant
   - Any user from any tenant can select any parish
   - Same parish can be selected by users from different tenants
   - tenantId stored with parish is for audit/reference only
   - **Example:**
     - "St. Mary Cathedral" exists once globally
     - User John (Diocese Lagos) can select it
     - User Peter (Diocese Abuja) can also select it
     - John and Peter NEVER see each other's data despite sharing a parish

3. **Parish Use Case - Team Grouping:**
   - Within a tenant's tournament, participants are grouped by parish
   - Forms teams like "St. Mary Team", "Holy Cross Team"
   - Parish-based leaderboards within each tenant
   - **Example within Diocese Lagos tournament:**
     - St. Mary Team: John, Mary, David (all from Diocese Lagos)
     - Holy Cross Team: Sarah, Michael (all from Diocese Lagos)
     - Even if there's a "Peter" from Diocese Abuja at St. Mary, he won't appear

4. **Search Instead of Dropdown:**
   - Better UX for large global parish lists (could be 1000+ parishes)
   - Easier to find specific parish
   - Real-time filtering

5. **Inline Parish Registration:**
   - Seamless user experience
   - New parish immediately available globally
   - No navigation away from registration

6. **Parish Verification Flag:**
   - Prevents spam/fake parishes
   - Admin can verify legitimate parishes
   - Verified badge builds trust

### Security Considerations:

- Parish creation requires authentication
- New parishes start as unverified
- Admin approval required for verification
- Parish association stored with user account
- Cannot register for parishes outside tenant

---

## 🎯 Success Metrics

Track these metrics after deployment:

1. **Registration Completion Rate:**
   - Before: Users without parish association
   - After: Users with valid parish

2. **Parish Registration:**
   - Number of new parishes registered
   - Time to register new parish
   - Admin verification time

3. **Search Effectiveness:**
   - Search queries vs. "Register New" clicks
   - Most searched parish names
   - Average time to find parish

4. **User Satisfaction:**
   - Drop-off rate at parish selection step
   - Support tickets about parish selection
   - User feedback on registration process

---

**Implementation Status:** ✅ Complete  
**Testing Status:** 🟡 Pending  
**Deployment:** 🔴 Not deployed

**Last Updated:** November 16, 2025
