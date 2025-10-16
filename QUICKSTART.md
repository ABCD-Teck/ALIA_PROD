# 🚀 Quick Start Guide - Alia Web with Database

## Prerequisites
- Node.js installed
- Two terminal windows ready

## Step 1: Start the Backend Server
```bash
cd C:\Users\N3BULA\Desktop\Alia_Web
npm run server
```

You should see:
```
Server is running on port 3001
Connected to PostgreSQL database
```

## Step 2: Start the Frontend (in a NEW terminal)
```bash
cd C:\Users\N3BULA\Desktop\Alia_Web
npm run dev
```

You should see:
```
VITE v6.3.5  ready in XXX ms

➜  Local:   http://localhost:5173/
```

## Step 3: Open Your Browser
Navigate to: `http://localhost:5173`

## What to Test:

### ✅ Dashboard Page
- Shows real customer count (3 customers)
- Shows customers with contacts (1)
- Shows opportunities count
- Displays customer list from database
- Shows industry distribution chart

### ✅ Contacts Page
- Shows 6 real contacts from database
- Search functionality works
- Pagination works
- Delete button works (soft delete)
- Loading spinner appears while fetching

### ✅ API Endpoints (test in browser)
- Health: http://localhost:3001/api/health
- Contacts: http://localhost:3001/api/contacts
- Customers: http://localhost:3001/api/customers

## Troubleshooting

**"Cannot connect to database"**
- The .env file has the correct credentials already
- Make sure you're connected to the internet (AWS RDS is remote)

**"Port 3001 already in use"**
- Kill any process using port 3001
- Or change the port in server/index.js

**"CORS error in browser"**
- Make sure the backend is running first
- Check that .env.local has VITE_API_URL=http://localhost:3001/api

## Success Indicators

✅ Backend server shows "Connected to PostgreSQL database"
✅ Frontend shows real data (not hardcoded dummy data)
✅ Contact names like "Obi Wan" appear (from database)
✅ Customer "ABCDTeck Solutions GmbH" appears in Dashboard

## Documentation
- Full details: See `DATABASE_INTEGRATION.md`
- Summary: See `INTEGRATION_SUMMARY.md`
- Database investigation: Run `node investigate-db.js`

Happy coding! 🎉
