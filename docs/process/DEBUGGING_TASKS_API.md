# Debugging "Failed to fetch tasks" Error

## Possible Causes

### 1. **Not Logged In or Session Expired**
This is the most common cause. The API requires authentication.

**How to Check:**
1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Type: `localStorage.getItem('accessToken')`
4. If it returns `null`, you need to log in

**Solution:**
- Log out (if you see any UI)
- Go to http://localhost:3000
- Log in again with your credentials

---

### 2. **Token Expired**
If you see the token but still getting error, it might be expired.

**Solution:**
1. Clear local storage:
   ```javascript
   // In browser console (F12):
   localStorage.clear()
   ```
2. Refresh page (Ctrl+R)
3. Log in again

---

### 3. **Backend Not Running or Connection Issue**

**How to Check:**
1. Backend should be on port 3001
2. Run this command:
   ```bash
   netstat -ano | findstr ":3001"
   ```
3. Should see `LISTENING` status

**Solution:**
```bash
cd "C:\Users\N3BULA\Desktop\Alia_Web\server"
npm start
```

---

### 4. **Database Connection Issue**

**How to Check Backend Logs:**
Look at the terminal where backend is running for errors like:
- `Error fetching tasks`
- `Connection refused`
- `Database error`

**Solution:**
Check database credentials in `server/.env`

---

## Quick Diagnosis Steps

### Step 1: Check Browser Console
1. Open http://localhost:3000
2. Press **F12** to open DevTools
3. Go to **Console** tab
4. Look for red error messages
5. Take a screenshot and share if needed

### Step 2: Check Network Tab
1. In DevTools, go to **Network** tab
2. Reload the page
3. Look for `/api/tasks` request
4. Click on it
5. Check:
   - **Status**: Should be 200 (if successful)
   - **Response**: What error message do you see?
   - **Headers** > **Request Headers**: Is there an `Authorization: Bearer ...` header?

### Step 3: Verify Login Status
Run in browser console:
```javascript
console.log('Access Token:', localStorage.getItem('accessToken'));
console.log('Refresh Token:', localStorage.getItem('refreshToken'));
console.log('User:', localStorage.getItem('user'));
```

If all three return `null`, you're not logged in.

---

## Most Likely Solution (Try This First!)

**You probably just need to log in:**

1. Go to http://localhost:3000
2. If you see a login page, log in
3. If you're already on the app:
   - Sign out (look for sign out button)
   - Sign back in
4. Navigate to Task Manager
5. Tasks should load

---

## Still Not Working?

**Get Detailed Error Info:**

1. Open browser console (F12)
2. Go to Task Manager page
3. Run this:
   ```javascript
   fetch('/api/tasks', {
     headers: {
       'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
     }
   })
   .then(r => r.json())
   .then(data => console.log('Response:', data))
   .catch(err => console.error('Error:', err))
   ```
4. Share the output

---

## Quick Test Script

Run this in browser console to test authentication:

```javascript
// Test authentication and tasks API
(async () => {
  const token = localStorage.getItem('accessToken');
  console.log('🔐 Token present:', !!token);

  if (!token) {
    console.log('❌ No token found - You need to log in!');
    return;
  }

  try {
    const response = await fetch('/api/tasks', {
      headers: {
        'Authorization': 'Bearer ' + token
      }
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ API working! Tasks:', data.tasks.length);
      console.log('Sample task:', data.tasks[0]);
    } else {
      console.log('❌ API error:', data);
      if (response.status === 401) {
        console.log('Token is invalid or expired - Log out and log back in!');
      }
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
  }
})();
```

---

## Expected Successful Output

When working correctly, browser Network tab should show:
- **Request URL**: `http://localhost:3000/api/tasks` (proxied to 3001)
- **Status**: 200 OK
- **Response**:
  ```json
  {
    "tasks": [...],
    "limit": 50,
    "offset": 0
  }
  ```

---

Last Updated: 2025-10-20
