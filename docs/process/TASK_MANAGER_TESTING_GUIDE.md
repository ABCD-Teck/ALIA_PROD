# Task Manager - Test Data Generation & Verification Guide

## 🎯 Overview

This guide will help you generate test tasks in the database and verify that the Task Manager is working properly with the API.

---

## 📋 Method: Browser Console Script (RECOMMENDED)

This is the easiest method since you'll already be logged into the application.

### Step-by-Step Instructions:

#### 1. **Start the Application**

Make sure both servers are running:

```bash
# Backend should be running on port 3001
# Frontend should be running on port 3000
```

Check with:
```bash
netstat -ano | findstr :3001
netstat -ano | findstr :3000
```

If not running, start them:
```bash
# In terminal 1 - Backend
cd "C:\Users\N3BULA\Desktop\Alia_Web\server"
npm start

# In terminal 2 - Frontend
cd "C:\Users\N3BULA\Desktop\Alia_Web"
npm start
```

#### 2. **Open the Application**

- Open your browser
- Navigate to: `http://localhost:3000`
- Log in with your credentials

#### 3. **Open Developer Console**

- Press `F12` (or right-click → "Inspect")
- Click on the **"Console"** tab

#### 4. **Run the Test Data Script**

- Open the file: `C:\Users\N3BULA\Desktop\Alia_Web\CREATE_TEST_TASKS.js`
- Copy the entire contents
- Paste into the browser console
- Press `Enter`

#### 5. **Watch the Magic! ✨**

You should see output like:

```
🚀 Starting Task Creation Script
✓ Found access token
📝 Creating 20 test tasks...

[1/20] Creating: "Follow up on Q1 sales proposal"
  ✓ Success (ID: 123)
[2/20] Creating: "Prepare quarterly business review presentation"
  ✓ Success (ID: 124)
...

========================================
📊 Task Creation Summary
========================================
✓ Successfully created: 20
✗ Failed: 0
📝 Total: 20
========================================

📋 Fetching current tasks...
✓ Total active tasks: 20

By Status:
  Not Started: 14
  In Progress: 3
  Completed: 3

By Priority:
  High: 7
  Medium: 8
  Low: 5

✅ Done! Navigate to the Task Manager page to see your tasks.
```

#### 6. **Navigate to Task Manager**

- Click on "Tasks" in the navigation menu
- You should see all your newly created tasks!

---

## ✅ Verification Checklist

### **Active Tasks Panel**

Test the following features:

- [ ] **Tasks are displayed** - You can see all the active tasks
- [ ] **Loading spinner** - Shows while fetching data
- [ ] **Task count badge** - Shows correct number (e.g., "20 tasks")
- [ ] **Sorting works** - Click column headers to sort
- [ ] **Task details** - Subject, Priority, Status, Contact, Due Date visible

### **Task Operations**

- [ ] **Select tasks** - Checkbox selection works
- [ ] **Archive task** - Click archive button on a task
  - Task should disappear from active list
  - Task should appear in archived list below
- [ ] **Priority change** - Click priority badge dropdown
  - Change from "High" to "Medium" or vice versa
  - Changes should save to API
- [ ] **Status change** - Click status badge dropdown
  - Change from "Not Started" to "In Progress" or "Completed"
  - Changes should save to API
- [ ] **Edit subject** - Click on task subject
  - Text should become editable
  - Press Enter to save or Esc to cancel
- [ ] **Edit due date** - Click on due date
  - Text should become editable
  - Changes should save to API
- [ ] **Delete tasks** - Select multiple tasks and click delete
  - Tasks should be archived
  - Should disappear from active list

### **Archived Tasks Panel**

- [ ] **Archived tasks displayed** - Shows tasks you archived
- [ ] **Task count badge** - Shows correct count
- [ ] **Restore task** - Click restore button (green icon)
  - Task should disappear from archived list
  - Task should reappear in active list above
- [ ] **Permanent delete** - Click trash button (red icon)
  - Task should be permanently removed
  - Should disappear from archived list

### **Error Handling**

- [ ] **Error messages** - If API fails, red error banner appears
- [ ] **Loading states** - Spinners show during API calls
- [ ] **Empty states** - "No archived tasks" shows when list is empty

---

## 🔍 Test Scenarios

### Scenario 1: Archive and Restore Flow

1. Find a task in the active list (e.g., "Follow up on Q1 sales proposal")
2. Click the Archive button (📦 icon)
3. **Verify**: Task disappears from active list
4. **Verify**: Task appears in archived list below
5. In archived list, click the Restore button (↩️ icon)
6. **Verify**: Task disappears from archived list
7. **Verify**: Task reappears in active list

### Scenario 2: Update Task Details

1. Find a task with "Not Started" status
2. Click on the status badge dropdown
3. Change to "In Progress"
4. **Verify**: Badge color changes
5. **Verify**: Change is saved (refresh page to confirm)
6. Click on Priority badge
7. Change from "Medium" to "High"
8. **Verify**: Badge color changes to red
9. **Verify**: Change persists after page refresh

### Scenario 3: Bulk Operations

1. Select multiple tasks (3-5 tasks)
2. **Verify**: "Delete Task" button appears in header
3. Click "Delete Task"
4. **Verify**: All selected tasks are archived
5. **Verify**: Selected tasks appear in archived list
6. **Verify**: Task count updates correctly

### Scenario 4: Sorting and Filtering

1. Click on "Subject" column header
2. **Verify**: Tasks are sorted alphabetically
3. Click again to reverse sort
4. Click on "Due Date" column header
5. **Verify**: Tasks sorted by date (earliest first)
6. Click on "Priority" column header
7. **Verify**: Tasks sorted by priority (High → Medium → Low)

### Scenario 5: Permanent Delete

1. Archive at least one task
2. In archived list, find the task
3. Click the red Trash icon (🗑️)
4. **Verify**: Task is permanently removed
5. Try to restore it (you shouldn't be able to - it's gone forever!)

---

## 📊 Expected Test Data

The script creates **20 tasks** with the following distribution:

### By Status:
- **Not Started**: 14 tasks
- **In Progress**: 4 tasks
- **Completed**: 3 tasks (these are already past due date)

### By Priority:
- **High**: 7 tasks (red badges)
- **Medium**: 8 tasks (yellow badges)
- **Low**: 5 tasks (green badges)

### By Due Date:
- **Overdue**: 1 task (today)
- **Due soon** (1-3 days): 3 tasks
- **This week** (4-7 days): 3 tasks
- **Next two weeks**: 7 tasks
- **Later**: 6 tasks

---

## 🐛 Troubleshooting

### "Access token required" error

**Problem**: Script shows "Not logged in" error

**Solution**:
1. Make sure you're logged into the application
2. Run the script from the browser console while on the application page
3. Don't run it in a different tab or window

### Tasks not appearing

**Problem**: Script runs successfully but tasks don't show up

**Solutions**:
1. **Refresh the Task Manager page**
2. Check browser console for errors (F12 → Console)
3. Check Network tab (F12 → Network) for failed API requests
4. Verify backend server is running: `netstat -ano | findstr :3001`

### "Failed to create task" errors

**Problem**: Some tasks fail to create

**Solutions**:
1. Check backend console for error messages
2. Verify database connection in backend
3. Check that task table exists and has proper schema
4. Try creating a task manually through the UI

### Archived tasks not showing contact names

**Problem**: Contact names appear blank

**Solutions**:
1. This is expected - test tasks aren't linked to contacts
2. To test with real contact names, edit a task and select a contact
3. Or create tasks from the "New Task" form in the UI

### API timeout errors

**Problem**: Requests taking too long or timing out

**Solutions**:
1. Check database connection is stable
2. Verify no network issues
3. Check backend logs for slow queries
4. Try reducing the number of tasks to create (edit the script)

---

## 🎨 Visual Guide

### Active Tasks Panel:
```
┌─────────────────────────────────────────────────────┐
│ Your Tasks                           [20 tasks]      │
├─────────────────────────────────────────────────────┤
│ ☐ | Subject    | Priority | Status | Contact | Due  │
├─────────────────────────────────────────────────────┤
│ ☐ | Follow up  | [High]   | [Not   |         | Apr  │
│   | on Q1...   |          | Start] |         | 24   │
│   |            |          |        |         | 📦   │
└─────────────────────────────────────────────────────┘
```

### Archived Tasks Panel:
```
┌─────────────────────────────────────────────────────┐
│ Archived Tasks                        [5 tasks]      │
├─────────────────────────────────────────────────────┤
│   | Subject    | Priority | Status | Contact | Due  │
├─────────────────────────────────────────────────────┤
│   | Some       | [High]   | [Not   |         | Apr  │
│   | archived   |          | Start] |         | 24   │
│   | task       |          |        |         | ↩️🗑️ │
└─────────────────────────────────────────────────────┘
```

**Icons**:
- 📦 Archive button (moves task to archived)
- ↩️ Restore button (moves task back to active)
- 🗑️ Permanent delete button (deletes forever)

---

## ✅ Success Criteria

Your Task Manager implementation is working correctly if:

1. ✅ **All 20 test tasks are created** without errors
2. ✅ **Tasks display properly** with all columns visible
3. ✅ **Archive/Restore** workflow works smoothly
4. ✅ **Sorting** by any column functions correctly
5. ✅ **Editing** task fields saves to the API
6. ✅ **Bulk delete** removes multiple tasks
7. ✅ **Permanent delete** removes tasks from database
8. ✅ **Loading states** show spinners during API calls
9. ✅ **Error handling** displays user-friendly messages
10. ✅ **Data persistence** - changes survive page refresh

---

## 📝 Next Steps

After verifying everything works:

1. **Test with real data**: Create tasks linked to actual customers/contacts
2. **Test edge cases**: Very long task names, special characters, etc.
3. **Test performance**: Create 100+ tasks and verify pagination/loading
4. **Test mobile**: Check responsive layout on smaller screens
5. **Test permissions**: Verify users can only see/edit their own tasks

---

## 📞 Support

If you encounter issues:

1. Check the browser console (F12) for JavaScript errors
2. Check the backend console for API errors
3. Review the Network tab (F12 → Network) for failed requests
4. Check database logs for query errors
5. Verify all environment variables are set correctly

---

**Last Updated**: 2025-10-20
**Test Data**: 20 tasks with various priorities, statuses, and due dates
**Script Location**: `C:\Users\N3BULA\Desktop\Alia_Web\CREATE_TEST_TASKS.js`
