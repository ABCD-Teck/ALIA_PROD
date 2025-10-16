# CRM Web Application - Data Flow Diagram

## Application Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                   App.tsx                                      │
│                              (Main Container)                                  │
│                                                                                 │
│  State Management:                                                              │
│  ├── currentPage: PageType                                                     │
│  ├── language: Language ('en' | 'fr')                                          │
│  └── searchQuery: string                                                       │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
        ┌───────────────────────────────────────────────────────────────┐
        │                    Component Layer                            │
        └───────────────────────────────────────────────────────────────┘
                                        │
                ┌───────────────────────┼───────────────────────┐
                ▼                       ▼                       ▼
    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
    │    Sidebar      │    │     Navbar      │    │   Page Router   │
    │                 │    │                 │    │                 │
    │ Props:          │    │ Props:          │    │ Props:          │
    │ - currentPage   │    │ - currentPage   │    │ - searchQuery   │
    │ - onPageChange  │    │ - language      │    │ - language      │
    │ - language      │    │ - searchQuery   │    │                 │
    │                 │    │ - onLanguage    │    │ Renders:        │
    │ Events:         │    │ - onSearch      │    │ - Dashboard     │
    │ - Page changes  │    │                 │    │ - MarketInsights│
    └─────────────────┘    │ Features:       │    │ - CustomerInsig │
                           │ - Search bar    │    │ - Opportunities │
                           │ - Lang toggle   │    │ - Interactions  │
                           │ - User info     │    │ - TaskManager   │
                           └─────────────────┘    │ - Calendar      │
                                                  │ - Contacts      │
                                                  │ - Settings      │
                                                  └─────────────────┘
```

## Data Flow by Module

### 1. Dashboard Module
```
Dashboard Component
├── Input: searchQuery, language
├── Data Sources:
│   ├── KPI Metrics (Revenue, Leads, Customers, Conversion)
│   ├── Sales Trend Data (Monthly revenue & leads)
│   ├── Opportunity Pipeline Data
│   └── Recent Activities Log
├── Features:
│   ├── Real-time KPI cards with trend indicators
│   ├── Interactive charts (Line, Pie)
│   ├── Activity timeline
│   └── Search filtering on KPIs and customer names
└── Output: Visual dashboards and metrics
```

### 2. Market Insights Module
```
MarketInsights Component
├── Input: searchQuery, language
├── Data Sources:
│   ├── Market Segments (Enterprise, SMB, Startup, Government)
│   ├── Competitor Analysis Data
│   ├── Market Trends & Growth Metrics
│   └── Opportunity Distribution
├── Features:
│   ├── Segment analysis with growth indicators
│   ├── Competitor market share visualization
│   ├── Trend analysis charts
│   └── Search filtering on segments
└── Output: Market intelligence reports
```

### 3. Customer Insights Module
```
CustomerInsights Component
├── Input: searchQuery, language
├── Data Sources:
│   ├── Customer Profiles (Name, Industry, Tags)
│   ├── Contact Information
│   ├── Revenue Data
│   ├── Customer Scores (1-100)
│   └── Interaction History
├── Features:
│   ├── Customer cards with scores
│   ├── Industry categorization
│   ├── Tag-based filtering
│   └── Search by name, industry, tags
└── Output: Customer relationship overview
```

### 4. Opportunities Module
```
Opportunities Component
├── Input: searchQuery, language
├── Data Sources:
│   ├── Deal Information (Name, Value, Probability)
│   ├── Customer Association
│   ├── Sales Rep Assignment
│   ├── Stage Tracking (Qualification → Proposal → Negotiation → Closed)
│   └── Timeline Data
├── Features:
│   ├── Pipeline visualization
│   ├── Probability-based coloring
│   ├── Stage management
│   └── Search by name, customer, sales rep, status
└── Output: Sales pipeline management
```

### 5. Interactions Module
```
Interactions Component
├── Input: searchQuery, language
├── Data Sources:
│   ├── Communication Records (Email, Call, Meeting, Video)
│   ├── Customer & Contact Association
│   ├── Scheduling Information
│   ├── Status Tracking
│   └── Notes & Documentation
├── Features:
│   ├── Interaction timeline
│   ├── Multi-channel communication tracking
│   ├── Status management
│   └── Search by customer, date, type
└── Output: Communication history & planning
```

### 6. Task Manager Module
```
TaskManager Component
├── Input: searchQuery, language
├── Data Sources:
│   ├── Task Information (Title, Description, Progress)
│   ├── Assignment Data
│   ├── Priority Levels (High, Medium, Low)
│   ├── Status Tracking (Todo, In Progress, Done)
│   ├── Due Dates
│   └── Customer Association
├── Features:
│   ├── Task cards with progress bars
│   ├── Priority-based coloring
│   ├── Overdue detection
│   └── Search by subject, status, due date
└── Output: Task management & tracking
```

### 7. Calendar Module
```
Calendar Component
├── Input: searchQuery, language
├── Data Sources:
│   ├── Event Information (Title, Type, Description)
│   ├── Scheduling Data (Date, Time, Duration)
│   ├── Location Information
│   ├── Attendee Lists
│   └── Event Categories
├── Features:
│   ├── Daily event grouping
│   ├── Event type categorization
│   ├── Week navigation
│   └── Search by title, date, event type
└── Output: Schedule management
```

### 8. Contacts Module
```
Contacts Component
├── Input: searchQuery, language
├── Data Sources:
│   ├── Contact Information (Name, Email, Phone)
│   ├── Company Association
│   ├── Position/Role Data
│   ├── Contact Tags
│   └── Avatar Information
├── Features:
│   ├── Contact cards with avatars
│   ├── Company grouping
│   ├── Tag categorization
│   └── Search by name, phone, email, company, position
└── Output: Contact directory
```

### 9. Settings Module
```
Settings Component
├── Input: searchQuery, language
├── Data Sources:
│   ├── User Profile Data
│   ├── Notification Preferences
│   ├── Privacy Settings
│   └── Appearance Preferences
├── Features:
│   ├── Profile management
│   ├── Notification toggles
│   ├── Privacy controls
│   ├── Theme & language settings
│   └── Search within settings
└── Output: User configuration
```

## Search Flow Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Input    │    │  Search Query   │    │ Page-Specific   │
│   in Navbar     │───▶│   Processing    │───▶│   Filtering     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                 Contextual Search Results                      │
├─────────────────────────────────────────────────────────────────┤
│ Dashboard:    KPIs, customer names                              │
│ Market:       Segments, insights                                │
│ Customers:    Names, industries, tags                           │
│ Opportunities: Names, customers, sales reps, statuses          │
│ Interactions: Customers, dates, types                          │
│ Tasks:        Subjects, statuses, due dates                    │
│ Calendar:     Event titles, dates, types                       │
│ Contacts:     Names, phones, emails, companies                 │
│ Settings:     Setting categories and options                   │
└─────────────────────────────────────────────────────────────────┘
```

## Language Localization Flow

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Language       │    │   Translation   │    │  Component      │
│  Toggle (EN/FR) │───▶│   Content       │───▶│  Re-rendering   │
│  in Navbar      │    │   Selection     │    │  with New Text  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                    ┌─────────────────────┐
                    │  All Components     │
                    │  Receive Language   │
                    │  Prop & Update UI   │
                    └─────────────────────┘
```

## State Management Pattern

```
App.tsx (Central State)
├── currentPage ──┐
├── language ─────┤
└── searchQuery ──┤
                  │
                  ├─▶ Sidebar (Page navigation)
                  ├─▶ Navbar (Search & language toggle)
                  └─▶ Page Components (Content rendering)
                      ├─▶ Dashboard
                      ├─▶ MarketInsights
                      ├─▶ CustomerInsights
                      ├─▶ Opportunities
                      ├─▶ Interactions
                      ├─▶ TaskManager
                      ├─▶ Calendar
                      ├─▶ Contacts
                      └─▶ Settings
```

## Future Database Integration Points

For Supabase integration, the following data tables would be needed:

```
Database Schema (Suggested):
├── users (id, name, email, role, settings)
├── customers (id, name, industry, score, revenue, tags)
├── contacts (id, customer_id, name, email, phone, position)
├── opportunities (id, customer_id, name, value, stage, probability, assigned_to)
├── interactions (id, customer_id, contact_id, type, subject, date, notes)
├── tasks (id, assigned_to, customer_id, title, description, status, priority, due_date)
├── calendar_events (id, title, type, date, time, location, attendees)
└── market_data (id, segment, growth_rate, market_size, opportunities_count)
```

This data flow architecture ensures scalable, maintainable, and user-friendly CRM functionality with comprehensive search capabilities and internationalization support.