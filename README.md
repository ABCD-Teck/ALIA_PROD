# Alia Web – CRM Management Platform

Alia is an intelligent CRM platform that unifies customer relationship management, market insights, and internal productivity tooling for enterprise teams.

## Feature Highlights

- **Customer Insights** – analytics that surface actionable CRM signals
- **Market Analysis** – monitor market intelligence and competitive movement
- **Task Orchestration** – create, assign, and follow tasks across teams
- **Interaction History** – centralize communications with customers and partners
- **Opportunity Tracking** – manage pipeline stages and deal health
- **Bilingual UI** – full Chinese/English support across the interface

## Technology Stack

- **Frontend**: React 18 + Vite + TypeScript
- **Backend**: Node.js (Express)
- **Database**: PostgreSQL
- **UI Components**: Radix UI, Tailwind CSS, shadcn/ui primitives
- **Auth**: JWT (bcrypt hashed credentials)

## Prerequisites

- Node.js 18+ (LTS recommended)
- npm 9+ (bundled with Node.js)
- PostgreSQL access to both the CRM and market insights databases

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/CHENn3bula/Alia_Web.git
   cd Alia_Web
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**  
   Duplicate `.env.local` as `.env` (or create from scratch) and supply your credentials.
   ```env
   # Database targets
   PGHOST=localhost
   PGPORT=5432
   PGDATABASE_MIA=mia_insights
   PGDATABASE_ALIA=alia_crm
   PGUSER=postgres
   PGPASSWORD=postgres

   # Auth
   JWT_SECRET=super_secret_key

   # Optional: pipeline helpers
   MIA_PROJECT_PATH=path_to_mia_project
   PYTHON_VENV_PATH=.venv\Scripts\python
   CSV_PATH=./data/output/source_cleaned.csv
   ```

4. **Run the application** – start each service in its own terminal.
   ```bash
   npm run server   # Express API on http://localhost:3001
   npm run dev      # React/Vite UI on http://localhost:3000
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## Scripts & Tooling Overview

- `npm run dev` – Vite development server with hot module reload.
- `npm run server` – Node/Express API server.
- `npm run build` – Generate optimized frontend assets.
- Database and QA utilities now live under `scripts/`:
  - `scripts/database/migrations` – schema-changing scripts.
  - `scripts/database/seeding` – demo and fixture data loaders.
  - `scripts/database/checks` – schema/quality diagnostics.
  - `scripts/database/maintenance` – one-off data fixes.
  - `scripts/qa` – regression and smoke-test helpers.
  - `scripts/auth` – authentication helpers (e.g., user provisioning).

See [`docs/command-cheatsheet.md`](docs/command-cheatsheet.md) for the full catalog of CLI tasks.

## Project Structure

```
Alia_Web/
├── docs/                       # Project documentation
│   ├── command-cheatsheet.md   # Command reference (active)
│   └── process/                # Historical implementation notes
├── logs/                       # Runtime logs (e.g., server.log)
├── scripts/                    # Operational scripts grouped by purpose
│   ├── auth/
│   ├── database/
│   │   ├── checks/
│   │   ├── maintenance/
│   │   ├── migrations/
│   │   └── seeding/
│   └── qa/
├── server/                     # Express backend
├── src/                        # React frontend
├── build/                      # Production build artifacts
├── index.html                  # Vite entry point
├── package.json                # npm metadata
├── vite.config.ts              # Vite configuration
└── .env                        # Local environment variables (not committed)
```

## Database Access Checklist

- Confirm both `alia_crm` and `mia_insights` schemas are reachable.
- Ensure the `.env` credentials have read/write privileges.
- Use the `scripts/database/checks/` suite to validate schema drift before running migrations or seeders.

## Documentation

- [`docs/command-cheatsheet.md`](docs/command-cheatsheet.md) – operational commands and workflows.
- `docs/process/` – deep-dive implementation notes, QA reports, and troubleshooting logs.

## Contributing

1. Create a feature branch (`git checkout -b feature/my-change`).
2. Make your updates and run relevant QA scripts.
3. Commit with a descriptive message (`git commit -m "feat: add customer timeline widget"`).
4. Push and open a pull request (`git push origin feature/my-change`).

## Support

For questions or access requests, reach out to the Alia development team or open an issue in the repository.
# Auto-deployment configured
# Test deployment Mon, Oct 27, 2025  6:40:28 PM
# Deployment test 1761587221
