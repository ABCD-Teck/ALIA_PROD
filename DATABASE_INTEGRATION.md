# Alia Web - Database Integration Setup

This document explains the database integration setup for Alia Web CRM application.

## Database Structure

The application connects to a PostgreSQL database (`alia_crm`) hosted on AWS RDS with the following main tables:

### Core Tables:
- **customer** - Customer/Company information
- **contact** - Individual contacts associated with customers
- **opportunity** - Sales opportunities
- **interaction** - Customer interactions (meetings, calls, visits)
- **task** - Task management
- **financial_statement** - Financial data for customers
- **document** - Document management
- **calendar_event** - Calendar events
- **note** - Notes attached to various entities

### Supporting Tables:
- **user** - User management
- **industry** - Industry classification
- **currency** - Currency reference
- **region** - Geographic regions

## Architecture

### Backend (Node.js/Express)
Location: `/server/`

- **server/index.js** - Main Express server
- **server/db.js** - PostgreSQL connection pool
- **server/routes/** - API route handlers
  - `contacts.js` - Contact CRUD operations
  - `customers.js` - Customer CRUD operations
  - `opportunities.js` - Opportunity operations
  - `interactions.js` - Interaction operations
  - `tasks.js` - Task operations
  - `financialStatements.js` - Financial data operations

### Frontend (React/TypeScript/Vite)
Location: `/src/`

- **src/services/api.ts** - API service layer with typed functions
- **src/components/pages/Contacts.tsx** - Contacts page (database-connected)
- **src/components/pages/Dashboard.tsx** - Dashboard page (database-connected)

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
The `.env` file already contains the database credentials:
```
PGHOST=abcdteck-ce.cdggcuqweof7.eu-central-1.rds.amazonaws.com
PGPORT=5432
PGDATABASE_ALIA=alia_crm
PGUSER=postgres
PGPASSWORD=ABCDTeck2025
```

For the frontend API URL, a `.env.local` file has been created:
```
VITE_API_URL=http://localhost:3001/api
```

### 3. Running the Application

You need to run both the backend and frontend simultaneously.

**Terminal 1 - Backend Server:**
```bash
npm run server
```
This starts the Express server on port 3001.

**Terminal 2 - Frontend Development Server:**
```bash
npm run dev
```
This starts the Vite development server (usually on port 5173).

### 4. Testing the Integration

1. Open your browser to `http://localhost:5173` (or the port shown by Vite)
2. Navigate to the **Contacts** page to see real database data
3. Navigate to the **Dashboard** to see customer statistics and data
4. Try the search functionality to filter data
5. Try deleting a contact (soft delete)

## API Endpoints

### Contacts
- `GET /api/contacts` - Get all contacts (with pagination and search)
- `GET /api/contacts/:id` - Get single contact
- `POST /api/contacts` - Create new contact
- `PUT /api/contacts/:id` - Update contact
- `DELETE /api/contacts/:id` - Delete contact (soft delete)

### Customers
- `GET /api/customers` - Get all customers (with pagination and search)
- `GET /api/customers/:id` - Get single customer
- `POST /api/customers` - Create new customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer (soft delete)

### Opportunities
- `GET /api/opportunities` - Get all opportunities
- `GET /api/opportunities/:id` - Get single opportunity

### Interactions
- `GET /api/interactions` - Get all interactions

### Tasks
- `GET /api/tasks` - Get all tasks

### Financial Statements
- `GET /api/financial-statements/customer/:customerId` - Get financial statements for a customer

## Current Database Data

As of the investigation:
- **6 Contacts** in the database
- **3 Customers** (ABCDTeck Solutions GmbH, Direct DB Test, 最终测试公司)
- **5 Financial Statements**
- **3 Interactions**
- **2 Documents**

## Features Implemented

✅ Backend Express server with PostgreSQL connection
✅ RESTful API endpoints for core entities
✅ Frontend API service layer with TypeScript
✅ Database-connected Contacts page with search, pagination, and delete
✅ Database-connected Dashboard with real-time statistics
✅ Loading states and error handling
✅ CORS enabled for frontend-backend communication

## Next Steps

To complete the integration for other pages:
1. Update **Opportunities** page to use `opportunitiesApi.getAll()`
2. Update **Interactions** page to use `interactionsApi.getAll()`
3. Update **Task Manager** page to use `tasksApi.getAll()`
4. Implement create/edit forms to use the API
5. Add authentication and user context

## Troubleshooting

### Backend won't start
- Check if port 3001 is already in use
- Verify database credentials in `.env`
- Check database connectivity to AWS RDS

### Frontend can't connect to backend
- Ensure backend is running on port 3001
- Check `.env.local` has correct `VITE_API_URL`
- Check browser console for CORS errors

### Database connection issues
- Verify AWS RDS security group allows your IP
- Check database credentials
- Ensure PostgreSQL service is running

## Database Investigation Script

A script `investigate-db.js` is included to explore the database structure:
```bash
node investigate-db.js
```

This will show all tables, columns, and sample data.
