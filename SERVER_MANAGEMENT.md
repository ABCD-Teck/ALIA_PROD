# Server Management - Command Cheatsheet

## Current Server Status

### Backend Server
- **Port**: 3001
- **PID**: 31972 (currently running)
- **Directory**: `C:\Users\N3BULA\Desktop\Alia_Web\server`

### Frontend Server
- **Port**: 3000
- **PID**: 2880 (currently running)
- **Directory**: `C:\Users\N3BULA\Desktop\Alia_Web`

---

## Stop Running Servers

### Method 1: Kill by Port (Recommended)

**Stop Backend (Port 3001)**:
```bash
# Find process using port 3001
netstat -ano | findstr :3001

# Kill the process (replace PID with actual process ID)
taskkill /PID 31972 /F
```

**Stop Frontend (Port 3000)**:
```bash
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID with actual process ID)
taskkill /PID 2880 /F
```

### Method 2: Kill All Node Processes (Nuclear Option)

**⚠️ WARNING**: This will kill ALL Node.js processes on your system!

```bash
# Kill all node processes
taskkill /IM node.exe /F
```

### Method 3: Using PowerShell (More Selective)

**Stop Backend**:
```powershell
# Get process on port 3001
Get-Process -Id (Get-NetTCPConnection -LocalPort 3001).OwningProcess | Stop-Process -Force
```

**Stop Frontend**:
```powershell
# Get process on port 3000
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force
```

### Method 4: Using CTRL+C in Terminal

If you have the terminal window where the server is running:
1. Click in the terminal window
2. Press `CTRL + C`
3. Wait for graceful shutdown

---

## Start Servers Fresh

### Start Backend Server

```bash
cd "C:\Users\N3BULA\Desktop\Alia_Web\server"
npm start
```

The backend should start on **http://localhost:3001**

**Check backend is running**:
```bash
curl http://localhost:3001/api/health
```

Expected response:
```json
{"status":"ok","message":"Server is running"}
```

### Start Frontend Server

```bash
cd "C:\Users\N3BULA\Desktop\Alia_Web"
npm start
```

The frontend should start on **http://localhost:3000** and automatically open in your browser.

---

## Restart Servers (Complete Refresh)

### Quick Restart Script (Copy-paste all at once)

**Backend Restart**:
```bash
# Stop backend
taskkill /PID 31972 /F

# Wait 2 seconds
timeout /t 2 /nobreak

# Start backend
cd "C:\Users\N3BULA\Desktop\Alia_Web\server" && npm start
```

**Frontend Restart**:
```bash
# Stop frontend
taskkill /PID 2880 /F

# Wait 2 seconds
timeout /t 2 /nobreak

# Start frontend
cd "C:\Users\N3BULA\Desktop\Alia_Web" && npm start
```

### Restart Both Servers

```bash
# Stop both servers
taskkill /PID 31972 /F
taskkill /PID 2880 /F

# Wait for clean shutdown
timeout /t 3 /nobreak

# Start backend in new terminal
start cmd /k "cd /d C:\Users\N3BULA\Desktop\Alia_Web\server && npm start"

# Wait for backend to be ready
timeout /t 5 /nobreak

# Start frontend in new terminal
start cmd /k "cd /d C:\Users\N3BULA\Desktop\Alia_Web && npm start"
```

---

## Check Server Status

### Check if Ports are in Use

```bash
# Check backend port
netstat -ano | findstr :3001

# Check frontend port
netstat -ano | findstr :3000
```

### Check Server Health

**Backend Health Check**:
```bash
curl http://localhost:3001/api/health
```

**Frontend Health Check**:
Open browser: http://localhost:3000

---

## Testing the Chinese Translation Fix

### Before Testing - Ensure Fresh Start

1. **Stop both servers**:
   ```bash
   taskkill /PID 31972 /F && taskkill /PID 2880 /F
   ```

2. **Clear browser cache** (or open incognito/private window)

3. **Start servers in order**:
   ```bash
   # Start backend first
   start cmd /k "cd /d C:\Users\N3BULA\Desktop\Alia_Web\server && npm start"

   # Wait 5 seconds
   timeout /t 5 /nobreak

   # Start frontend
   start cmd /k "cd /d C:\Users\N3BULA\Desktop\Alia_Web && npm start"
   ```

### Testing Steps

1. **Open application**: http://localhost:3000

2. **Log in**:
   - Email: `n3bula.chen@gmail.com`
   - Password: `Poqw1029!`

3. **Navigate to Market Insights**

4. **Open Browser Console** (F12):
   - Check for debug logs starting with `[Load]`, `[Proactive]`, `[Content]`
   - Look for translation progress messages

5. **Switch Language to Chinese**:
   - Click language toggle (usually in header)
   - Select "中文" or "zh"

6. **Observe Article Display**:
   - Articles with Chinese summaries should show Chinese immediately
   - Articles without should show "[翻译中...]" briefly
   - Chinese translations should progressively appear
   - Check browser console for translation logs

### Expected Console Output

```
[Market Insights] Returning 20 articles: 14 with Chinese, 6 without
[Load] Starting proactive translation...
[Proactive] Starting translation for 20 articles
[Proactive] Article 123 already has Chinese content
[Proactive] Article 456 needs content translation (content_zh length: 0)
[Content 456] content_zh length: 0 cached: false translating: true
[Content 456] Translation in progress
[Content 456] Using cached translation
```

### What to Check

- ✅ **Backend console**: Should show article count with/without Chinese
- ✅ **Frontend console**: Should show translation logs
- ✅ **Network tab** (F12 → Network): Look for `/api/translate` POST requests
- ✅ **UI**: Chinese text should appear within 2-5 seconds for articles without native Chinese

---

## Troubleshooting

### Port Already in Use

```bash
# Find what's using the port
netstat -ano | findstr :<port>

# Kill that process
taskkill /PID <PID> /F
```

### Server Won't Start

1. **Check node_modules installed**:
   ```bash
   cd "C:\Users\N3BULA\Desktop\Alia_Web\server"
   npm install

   cd "C:\Users\N3BULA\Desktop\Alia_Web"
   npm install
   ```

2. **Check .env file exists**:
   ```bash
   # Backend
   dir "C:\Users\N3BULA\Desktop\Alia_Web\server\.env"

   # Should contain database credentials and OpenAI key
   ```

3. **Check database connection**:
   ```bash
   # Test PostgreSQL connection
   psql -h <PGHOST> -p <PGPORT> -U <PGUSER> -d <PGDATABASE>
   ```

### Translation Not Working

1. **Check OpenAI API Key**:
   - File: `C:\Users\N3BULA\Desktop\Alia_Web\server\routes\translate.js`
   - Line 10: Should have valid OpenAI key

2. **Check network requests**:
   - Open F12 → Network tab
   - Filter by "translate"
   - Look for 200 OK responses

3. **Check console for errors**:
   - Backend console: Translation API errors
   - Frontend console: React state update errors

### Database Issues

**Check database has Chinese summaries**:
```sql
-- Connect to database
psql -h localhost -p 5432 -U postgres -d mia

-- Count articles with Chinese
SELECT
  COUNT(*) as total,
  COUNT(summary_zh) as with_chinese,
  COUNT(*) - COUNT(summary_zh) as without_chinese
FROM news_article;
```

---

## Quick Reference

| Action | Command |
|--------|---------|
| Stop Backend | `taskkill /PID 31972 /F` |
| Stop Frontend | `taskkill /PID 2880 /F` |
| Stop All Node | `taskkill /IM node.exe /F` |
| Check Backend Port | `netstat -ano \| findstr :3001` |
| Check Frontend Port | `netstat -ano \| findstr :3000` |
| Start Backend | `cd C:\Users\N3BULA\Desktop\Alia_Web\server && npm start` |
| Start Frontend | `cd C:\Users\N3BULA\Desktop\Alia_Web && npm start` |
| Backend Health | `curl http://localhost:3001/api/health` |
| Frontend URL | http://localhost:3000 |

---

## Recent Changes Made

### Files Modified for Chinese Translation Fix

1. **MarketInsights.tsx** (line 585-604):
   - Fixed proactive translation logic
   - Added comprehensive debug logging
   - Reordered state updates for immediate UI display

2. **marketInsights.js** (line 204-207):
   - Added debug logging for Chinese content availability

3. **translate.js** (entire file):
   - Integrated OpenAI GPT-3.5-turbo as primary translator
   - Added MyMemory as fallback
   - Added translation cache support

### Database Schema Changes

- Added `summary_zh` column to `news_article` table
- 812 out of 1153 articles have Chinese summaries (70.4%)

---

## Support

If servers are still not working after following this guide:

1. **Check all prerequisites**:
   - Node.js installed (`node --version`)
   - npm installed (`npm --version`)
   - PostgreSQL running
   - Database accessible

2. **Look for error messages** in:
   - Backend console
   - Frontend console
   - Browser console (F12)
   - Network tab (F12)

3. **Common issues**:
   - Missing `.env` file
   - Wrong database credentials
   - Missing `node_modules` (run `npm install`)
   - Port conflicts (kill existing processes)
   - OpenAI API key invalid or missing

---

**Last Updated**: 2025-10-16
**Current PIDs**: Backend=31972, Frontend=2880
