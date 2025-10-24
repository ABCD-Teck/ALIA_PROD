# ALIA Web - Complete Testing & Fixes Guide

## Summary of All Fixes

### 1. Backend API Fixes

#### Opportunities Routes (`server/routes/opportunities.js`)
- **Fixed field name mismatch**: Changed `value` to `amount` to match database schema
- **Added audit fields**: Added `created_by` and `updated_by` fields
- **Fixed default values**: Changed defaults to match DB (e.g., `'PROSPECT'` instead of `'prospecting'`, `'MEDIUM'` instead of `'medium'`)
- **Added detailed error logging**: All errors now include database-specific details
- **Accepts both field names**: Backend now accepts both `value` and `amount` for backwards compatibility

#### Interactions Routes (`server/routes/interactions.js`)
- **Fixed importance field**: Converts string ('low'/'medium'/'high') to integer (1/2/3)
- **Added required audit fields**: Added `created_by` and `updated_by` to satisfy NOT NULL constraints
- **Added detailed error logging**: Shows exact database constraint violations

### 2. Frontend Fixes

#### Opportunities Page (`src/components/pages/Opportunities.tsx`)
- **Fixed field names**: Changed all references from `value` to `amount`, `status` to `stage`
- **Fixed ID references**: Changed `opp.id` to `opp.opportunity_id` throughout
- **Table structure completely rebuilt**: Removed mock data references, using only API fields
- **Fixed calculations**: `calculateTotalValue()` and `calculateWonRevenue()` now use correct fields
- **Inline editing now persists**: All edit handlers now save to backend via API
- **Added error details**: Error messages now show full response including database errors

#### Interactions Page (`src/components/pages/Interactions.tsx`)
- **Added edit/delete UI**: Dialog for editing, confirmation for deleting
- **Fixed error handling**: Shows detailed error messages from backend

#### CreateOpportunity Page
- **Enhanced error display**: Shows detailed validation and database errors

### 3. Database Schema Documentation

#### Opportunity Table Key Fields:
```
- opportunity_id: uuid (PK)
- customer_id: uuid (NOT NULL)
- name: varchar (NOT NULL)
- amount: numeric (nullable) ← NOTE: "amount" NOT "value"
- priority: varchar (NOT NULL, default: 'MEDIUM')
- stage: varchar (NOT NULL, default: 'PROSPECT')
- owner_user_id: uuid (NOT NULL)
- created_by: uuid (nullable)
- updated_by: uuid (nullable)
```

#### Interaction Table Key Fields:
```
- interaction_id: uuid (PK)
- interaction_type: varchar (NOT NULL)
- subject: varchar (NOT NULL)
- interaction_date: timestamptz (NOT NULL)
- customer_id: uuid (nullable)
- importance: integer (nullable) ← NOTE: INTEGER not VARCHAR
- created_by: uuid (NOT NULL) ← NOTE: Required field!
- updated_by: uuid (nullable)
```

---

## How to Test

### Prerequisites

1. **Start Backend Server:**
   ```bash
   cd C:\Users\N3BULA\Desktop\Alia_Web
   npm run server
   ```

   Server should start on `http://localhost:3001`

2. **Open Application:**
   - Open browser to `http://localhost:3001`
   - Or build frontend and access through server

3. **Login Credentials:**
   - Email: `n3bula.chen@gmail.com`
   - Password: `Poqw1209!`

---

## Test Cases

### Test 1: Create New Opportunity

**Steps:**
1. Navigate to Opportunities page
2. Click "Create Opportunity" or "New Opportunity" button
3. Fill in the form:
   - **Customer**: Select any customer from dropdown
   - **Opportunity Name**: "Test Opportunity - [Your Name]"
   - **Description**: "Testing opportunity creation"
   - **Amount**: 50000
   - **Currency**: USD
   - **Priority**: High
   - **Stage/Status**: Prospect
   - **Notes**: "Created for testing"
4. Click "Save"

**Expected Result:**
- ✅ Success message appears
- ✅ Redirected back to opportunities list
- ✅ New opportunity appears in the list

**If Error Occurs:**
- Check browser console (F12 → Console tab)
- Check server logs
- Error message should now show specific details like:
  - "Name and customer_id are required"
  - Or specific database constraint violations

---

###Test 2: Edit Opportunity (Inline)

**Steps:**
1. On Opportunities page, find any opportunity
2. Click on the **Name** field
3. Change the text
4. Press Enter or click outside

**Expected Result:**
- ✅ Field shows loading/saving state
- ✅ Success (no error alert)
- ✅ Field updates with new value
- ✅ Page refreshes data from server

**If Error Occurs:**
- Alert will show detailed error including database message
- Check console for full response object

---

### Test 3: Change Opportunity Priority

**Steps:**
1. On Opportunities page, find any opportunity
2. Click the **Priority dropdown** (shows as colored badge)
3. Select different priority (High/Medium/Low)

**Expected Result:**
- ✅ Dropdown closes
- ✅ Badge color updates immediately
- ✅ Change is saved to database

**If Error Occurs:**
- Alert shows: "Failed to update priority: [error details]"
- Check if field name mismatch or authentication issue

---

### Test 4: Change Opportunity Stage/Status

**Steps:**
1. On Opportunities page, find any opportunity
2. Click the **Stage dropdown** (shows as colored badge)
3. Select different stage

**Expected Result:**
- ✅ Badge updates
- ✅ Change persists after page refresh

**Test Values:**
- PROSPECT
- Proposal
- Negotiation
- Won (closed_won)
- Lost (closed_lost)

---

### Test 5: Create New Interaction

**Steps:**
1. Navigate to Interactions page
2. Click "Create Interaction" or similar button
3. Fill in the form:
   - **Type**: Meeting
   - **Subject**: "Test Meeting - [Your Name]"
   - **Description**: "Testing interaction creation"
   - **Date**: Today's date
   - **Customer**: Select any customer
   - **Location**: "Office"
   - **Importance**: Select High/Medium/Low (will be converted to 3/2/1)
4. Click "Save"

**Expected Result:**
- ✅ Success message
- ✅ New interaction appears in list

**Common Errors:**
- "created_by violates not-null constraint" → Backend needs restart to load new code
- "invalid input syntax for type integer" → Importance field issue (should be fixed now)

---

### Test 6: Edit Interaction

**Steps:**
1. On Interactions page, find interaction with Edit button
2. Click **Edit** button
3. Dialog opens with interaction details
4. Modify:
   - Subject
   - Description
   - Date
   - Location
5. Click "Save"

**Expected Result:**
- ✅ Dialog closes
- ✅ Success alert
- ✅ Changes reflected in list

---

### Test 7: Delete Interaction

**Steps:**
1. On Interactions page, find interaction
2. Click **Delete** button
3. Confirm deletion in popup

**Expected Result:**
- ✅ Interaction removed from list
- ✅ Success message

---

## Troubleshooting

### Error: "column 'value' does not exist"

**Solution:**
- Backend code wasn't reloaded
- Stop server (Ctrl+C) and restart: `npm run server`
- Code fix: Changed all `value` references to `amount` in backend

### Error: "created_by violates not-null constraint"

**Solution:**
- Backend code not updated
- Restart server to load new code with `created_by` field

### Error: "invalid input syntax for type integer: 'high'"

**Solution:**
- Backend now converts string importance to integer
- Restart server if still occurring
- Can also send integer directly (1/2/3)

### Error: "Failed to update status"

**Check:**
1. Browser console for full error
2. Server logs for database error
3. Ensure using valid stage values: PROSPECT, Proposal, Negotiation, closed_won, closed_lost

### Nothing saves / Changes don't persist

**Check:**
1. Are you logged in? (Token might have expired)
2. Check Network tab in DevTools - are requests reaching server?
3. Check server logs - are requests being received?
4. Is server actually running on port 3001?

---

## API Endpoints Reference

### Opportunities
- `GET /api/opportunities` - List all
- `POST /api/opportunities` - Create new
- `PUT /api/opportunities/:id` - Update
- `DELETE /api/opportunities/:id` - Delete

### Interactions
- `GET /api/interactions` - List all
- `POST /api/interactions` - Create new
- `PUT /api/interactions/:id` - Update
- `DELETE /api/interactions/:id` - Delete

---

## Files Modified

### Backend
- `server/routes/opportunities.js` - Complete rewrite of CREATE and UPDATE
- `server/routes/interactions.js` - Added created_by, importance conversion

### Frontend
- `src/components/pages/Opportunities.tsx` - Fixed all field names, rebuilt table
- `src/components/pages/Interactions.tsx` - Added edit/delete UI
- `src/components/pages/CreateOpportunity.tsx` - Enhanced error display

---

## Next Steps

1. **Restart all servers** to ensure latest code is loaded
2. **Test each scenario** above and document results
3. **Report any errors** with:
   - Screenshot of error message
   - Browser console output
   - Server console output
   - Steps to reproduce

All functionality should now work correctly!
