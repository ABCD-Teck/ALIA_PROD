# Alia Web Command Cheatsheet

Your at-a-glance reference for the commands used most often while working on the Alia Web project. Commands assume you are running them from the repository root unless noted otherwise.

## Quick Start

```bash
# Install dependencies
npm install

# start the React/Vite dev server (http://localhost:3000)
npm run dev

# start the Express API (http://localhost:3001)
npm run server

# build static assets for production
npm run build
```

Keep `.env` filled with your local credentials before running any database scripts.

## Database Operations

All database utilities now live under `scripts/database/` and are grouped by intent.

### Migrations (`scripts/database/migrations`)

```bash
# add archive flag to interactions
node scripts/database/migrations/add_archive_column.js

# add Chinese title support
node scripts/database/migrations/add_title_zh_column.js

# align stock-related columns
node scripts/database/migrations/migrate_stock_columns.js

# sync annotation schema changes
node scripts/database/migrations/update_annotation_schema.js
```

### Data Seeding (`scripts/database/seeding`)

```bash
# generate sample interactions & opportunities
node scripts/database/seeding/create_sample_interactions.js
node scripts/database/seeding/create_opportunities.js

# back-fill future-dated interactions
node scripts/database/seeding/add_future_interactions.js

# populate auxiliary lookup data
node scripts/database/seeding/populate_industries.js
node scripts/database/seeding/seed_byd_data.js

# prepare end-to-end demo task data
node scripts/database/seeding/CREATE_TEST_TASKS.js
```

### Diagnostics & Checks (`scripts/database/checks`)

```bash
# verify schema alignment across databases
node scripts/database/checks/check_schema.js
node scripts/database/checks/check_db_structure.js

# validate downstream feature expectations
node scripts/database/checks/check-interaction-schema.js
node scripts/database/checks/check_opportunity_schema.js
node scripts/database/checks/check_news_schema.js
node scripts/database/checks/check_customer_schema.js

# inspect supporting reference/lookup tables
node scripts/database/checks/check_reference_tables.js
node scripts/database/checks/check_reference_tables2.js
node scripts/database/checks/check_industries.js
node scripts/database/checks/check_updated_by_column.js

# investigate data quality issues
node scripts/database/checks/investigate-db.js
node scripts/database/checks/investigate-mia.js
```

### Maintenance (`scripts/database/maintenance`)

```bash
# normalize legacy customer type/status values
node scripts/database/maintenance/fix_customer_type_status.js
```

## QA & Verification

Quality assurance scripts now live under `scripts/qa/`.

```bash
# smoke test API endpoints
node scripts/qa/test_api_functionality.js

# regression suites
node scripts/qa/comprehensive_test.js
node scripts/qa/test_opportunities_and_interactions.js
node scripts/qa/test_opportunities_direct.js

# targeted validations
node scripts/qa/test-customer-data.js
node scripts/qa/test-task-query.js
node scripts/qa/test-login.js              # uses scripts/qa/data/test-login.json
node scripts/qa/create-test-interaction.js
node scripts/qa/verify_translations.js
```

## Auth Utilities

```bash
# create a new user with hashed password credentials
node scripts/auth/create-user.js
```

## Git Workflow Shortlist

```bash
# view current status
git status

# stage and commit changes
git add .
git commit -m "feat: describe the change"

# update local branch
git pull --rebase origin main

# push work to GitHub
git push origin main
```

## Housekeeping

```bash
# remove transient build output
Remove-Item -Path build -Recurse -Force

# clear the server log between debugging sessions
Remove-Item logs/server.log

# find large files (>5 MB) if the repo starts to bloat
Get-ChildItem -Path . -Recurse -File | Where-Object {$_.Length -gt 5MB}
```

Refer to `docs/process/` for historical implementation notes and troubleshooting guides.
```bash
npm run dev          # Start development server (Vite)
npm run build        # Build for production
```

### Backend Commands
```bash
npm run server       # Start backend server
npm start           # Alternative to npm run server
node server/index.js # Direct server start
```

## 🌐 Server Access URLs

### Local Access
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

### Network Access (for friends)
- **Frontend**:
  - http://192.168.1.80:3000 (primary)
  - http://26.68.163.98:3000
  - http://172.18.176.1:3000

- **Backend API**:
  - http://192.168.1.80:3001
  - http://26.68.163.98:3001
  - http://172.18.176.1:3001

## 🔧 Server Management

### Start Servers
```bash
# Start frontend only
npm run dev

# Start backend only
npm run server

# Start both (use two terminals)
# Terminal 1:
npm run dev
# Terminal 2:
npm run server
```

### Stop Servers
```bash
# Windows: Kill all Node.js processes
taskkill /F /IM node.exe

# Or use Ctrl+C in the terminal running the server
```

### Free Occupied Ports
```powershell
# Windows PowerShell: free up ports 3000 + 3001
Get-NetTCPConnection -LocalPort 3000,3001 -ErrorAction SilentlyContinue |
  Select-Object -ExpandProperty OwningProcess |
  Sort-Object -Unique |
  ForEach-Object { Stop-Process -Id $_ -Force }
```

```bash
# macOS / Linux: free up ports 3000 + 3001
lsof -ti:3000 -sTCP:LISTEN | xargs -r kill -9
lsof -ti:3001 -sTCP:LISTEN | xargs -r kill -9
```

### Check Server Status
```bash
# Test frontend
curl http://localhost:3000

# Test backend health
curl http://localhost:3001/api/health

# Test market insights API
curl "http://localhost:3001/api/market-insights/articles?limit=5"
```

## 📊 API Endpoints

### Market Insights
```bash
# Get articles
GET /api/market-insights/articles?limit=20&offset=0

# Search articles
GET /api/market-insights/articles?search=bank&limit=10

# Get buckets/categories
GET /api/market-insights/buckets

# Get specific article
GET /api/market-insights/article/{id}

# Get companies
GET /api/market-insights/companies?limit=50

# Filter by bucket
GET /api/market-insights/articles?bucket=Banking%20%26%20Regulation

# Filter by region
GET /api/market-insights/articles?region=EMEA

# Filter by importance
GET /api/market-insights/articles?importance=4
```

### Authentication APIs
```bash
# Login (POST)
POST /api/auth/login
Body: { "email": "user@example.com", "password": "your_password" }

# Register (POST)
POST /api/auth/register
Body: { "email": "user@example.com", "password": "password", "first_name": "First", "last_name": "Last" }

# Get current user (GET - requires auth token)
GET /api/auth/me
Header: Authorization: Bearer <access_token>

# Refresh token (POST)
POST /api/auth/refresh
Body: { "refreshToken": "your_refresh_token" }
```

### Other APIs
```bash
# Health check
GET /api/health

# Customer management
GET /api/customers
POST /api/customers

# Opportunities
GET /api/opportunities
POST /api/opportunities

# Translation
POST /api/translate

# MIA Pipeline
GET /api/mia-pipeline/status
POST /api/mia-pipeline/trigger
```

## 🔍 Testing Commands

### Authentication Testing
```bash
# Test login with curl
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"n3bula.chen@gmail.com\",\"password\":\"Poqw1209!\"}"

# Test login with Node.js script
node test-login.js

# Test registration
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"new@example.com\",\"password\":\"password123\",\"first_name\":\"John\",\"last_name\":\"Doe\"}"

# Test authenticated endpoint (replace TOKEN with actual token)
curl http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer TOKEN"
```

### Using curl
```bash
# Test articles endpoint
curl -s "http://localhost:3001/api/market-insights/articles?limit=2"

# Test with search
curl -s "http://localhost:3001/api/market-insights/articles?search=technology&limit=5"

# Test buckets
curl -s "http://localhost:3001/api/market-insights/buckets"

# Pretty print JSON (if jq is installed)
curl -s "http://localhost:3001/api/market-insights/articles?limit=2" | jq
```

### Using PowerShell
```powershell
# Test endpoint
Invoke-RestMethod -Uri "http://localhost:3001/api/market-insights/articles?limit=2"

# Test with headers
Invoke-RestMethod -Uri "http://localhost:3001/api/health" -Method GET
```

## 🗄️ Database Information

### Connection Details
- **Host**: abcdteck-ce.cdggcuqweof7.eu-central-1.rds.amazonaws.com
- **Port**: 5432
- **MIA Database**: mia_insights
- **ALIA Database**: alia_crm

### Environment Variables
```bash
PGHOST=abcdteck-ce.cdggcuqweof7.eu-central-1.rds.amazonaws.com
PGPORT=5432
PGDATABASE_MIA=mia_insights
PGDATABASE_ALIA=alia_crm
PGUSER=postgres
PGPASSWORD=ABCDTeck2025
```

## 🛠️ Troubleshooting

### Common Issues

#### Server won't start
```bash
# Check if port is in use
netstat -ano | findstr :3000
netstat -ano | findstr :3002

# Kill processes using the port
taskkill /F /PID <process_id>
```

#### Database connection issues
```bash
# Test database connectivity
node -e "const pool = require('./server/db-mia'); pool.query('SELECT NOW()').then(r => console.log(r.rows[0]))"
```

#### Login issues
```bash
# Ensure server is running
curl http://localhost:3001/api/health

# Test login with test credentials
node test-login.js

# Check if user exists in database (requires db connection)
# Verify email and password in .env file (line 13)

# Common login errors:
# - 401: Invalid credentials (wrong email/password)
# - 500: Server error (check server logs)
# - Connection refused: Server not running (run: npm run server)
```

#### API returns errors
```bash
# Check server logs in the terminal
# Look for error messages

# Test basic health endpoint
curl http://localhost:3001/api/health
```

#### Frontend can't connect to backend
- Ensure CORS is enabled (already configured)
- Check that backend is running on port 3001
- Verify API URLs in frontend code

### Port Configuration
- Frontend default: 3000
- Backend default: 3001
- Can be changed in:
  - Frontend: `vite.config.ts` → `server.port`
  - Backend: `server/index.js` → `PORT` variable or `.env` file

## 📱 Network Sharing

### Firewall Setup (if needed)
1. Open Windows Defender Firewall
2. Click "Allow an app or feature through Windows Defender Firewall"
3. Allow Node.js through both Private and Public networks

### Find Your IP Address
```bash
ipconfig | findstr "IPv4"
```

## 🎯 Development Workflow

### Typical Development Session
```bash
# 1. Navigate to project
cd "C:\Users\N3BULA\Desktop\Alia_Web"

# 2. Start backend (Terminal 1)
npm run server

# 3. Start frontend (Terminal 2)
npm run dev

# 4. Access application
# Local: http://localhost:3000
# Network: http://192.168.1.80:3000
```

### Making Changes
- Frontend changes: Auto-reload with Vite
- Backend changes: Restart server manually
- Database schema changes: May require code updates

## 📚 Quick Reference

### File Structure
```
Alia_Web/
├── server/           # Backend Express.js server
│   ├── index.js     # Main server file
│   ├── routes/      # API routes
│   ├── db.js        # Database connection
│   └── db-mia.js    # MIA database connection
├── src/             # Frontend React source
├── package.json     # Dependencies and scripts
├── vite.config.ts   # Vite configuration
└── .env            # Environment variables
```

### Key Files
- `server/index.js` - Main backend server
- `server/routes/marketInsights.js` - Market insights API
- `vite.config.ts` - Frontend server configuration
- `.env` - Database credentials and configuration

---

*Last updated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")*
