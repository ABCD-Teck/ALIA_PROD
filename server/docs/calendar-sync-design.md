# Calendar Sync Design Document

## Phase 1 - Analysis Summary

### Current Backend Architecture
- **Framework**: Node.js with Express
- **Database**: PostgreSQL (AWS RDS)
- **ORM**: None (using `pg` pool directly)
- **Database**: `alia_crm`

### Existing Tables

#### Interaction Table (Source)
The `interaction` table contains customer interaction records with the following relevant fields:

| Field | Type | Nullable | Default | Notes |
|-------|------|----------|---------|-------|
| interaction_id | uuid | NO | uuid_generate_v4() | Primary key |
| interaction_type | varchar(20) | NO | - | e.g., 'visit', 'phone', 'meeting' |
| subject | varchar(255) | NO | - | Event title |
| interaction_date | timestamp with time zone | NO | - | **KEY**: Date and time of interaction |
| customer_id | uuid | YES | - | Foreign key to customer |
| contact_id | uuid | YES | - | Foreign key to contact |
| opportunity_id | uuid | YES | - | Foreign key to opportunity |
| location | varchar(255) | YES | - | Physical or virtual location |
| description | text | YES | - | Detailed description |
| duration_minutes | integer | YES | - | Duration in minutes |
| direction | varchar(20) | YES | - | 'outbound' or 'inbound' |
| medium | varchar(50) | YES | - | 'in-person', 'phone', 'video', etc. |
| outcome | varchar(100) | YES | - | Result of interaction |
| sentiment | varchar(20) | YES | - | 'positive', 'neutral', 'negative' |
| importance | integer | YES | - | 1-5 scale |
| private_notes | varchar | YES | - | Internal notes |
| created_by | uuid | NO | - | User who created |
| updated_by | uuid | YES | - | Last user who updated |
| created_at | timestamp with time zone | YES | now() | Creation timestamp |
| updated_at | timestamp with time zone | YES | now() | Last update timestamp |
| archived | boolean | YES | false | Soft delete flag |

#### Calendar Events Table (To Be Created)
**Status**: Does NOT exist yet - needs to be created

---

## Phase 2 - Field Mapping Contract

### Calendar Events Table Schema Design

```sql
CREATE TABLE calendar_events (
  -- Primary Key
  event_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Event Core Fields
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  start_time TIME,
  end_time TIME,
  all_day BOOLEAN DEFAULT FALSE,

  -- Type and Classification
  event_type VARCHAR(50) NOT NULL, -- 'interaction', 'task', 'meeting', 'reminder'
  event_status VARCHAR(20) DEFAULT 'scheduled', -- 'scheduled', 'completed', 'cancelled'

  -- Related Record Tracking (for sync)
  related_table VARCHAR(50), -- 'interaction', 'task', etc.
  related_id UUID, -- Foreign key to source record

  -- Location and Participants
  location VARCHAR(255),
  participants TEXT[], -- Array of participant names/emails

  -- Metadata
  created_by UUID NOT NULL,
  updated_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Audit Field for Sync
  synced_from VARCHAR(50), -- Source of sync: 'interaction', 'manual', etc.
  last_synced_at TIMESTAMP WITH TIME ZONE,

  -- Constraints
  UNIQUE(related_table, related_id), -- Prevent duplicate events from same source
  FOREIGN KEY (created_by) REFERENCES users(user_id),
  FOREIGN KEY (updated_by) REFERENCES users(user_id)
);

-- Indexes for performance
CREATE INDEX idx_calendar_events_date ON calendar_events(event_date);
CREATE INDEX idx_calendar_events_related ON calendar_events(related_table, related_id);
CREATE INDEX idx_calendar_events_created_by ON calendar_events(created_by);
CREATE INDEX idx_calendar_events_status ON calendar_events(event_status);
```

### Field Mapping: Interaction → Calendar Event

| Calendar Event Field | Interaction Field | Transformation Logic |
|---------------------|-------------------|----------------------|
| event_id | - | Generated (UUID) |
| title | subject | Direct copy |
| description | description | Direct copy (nullable) |
| event_date | interaction_date | Direct copy (timestamp) |
| start_time | interaction_date | Extract time component |
| end_time | interaction_date + duration_minutes | Calculate: start_time + duration_minutes |
| all_day | duration_minutes | `duration_minutes IS NULL OR duration_minutes = 0` |
| event_type | interaction_type | Map to 'interaction' or use interaction_type value |
| event_status | archived | Map: archived=true → 'cancelled', archived=false → 'scheduled' |
| related_table | - | Fixed value: 'interaction' |
| related_id | interaction_id | Direct copy |
| location | location | Direct copy (nullable) |
| participants | - | Derive from customer_id, contact_id (query names) |
| created_by | created_by | Direct copy |
| updated_by | updated_by | Direct copy |
| created_at | created_at | Direct copy |
| updated_at | updated_at | Direct copy |
| synced_from | - | Fixed value: 'interaction' |
| last_synced_at | - | Current timestamp when sync occurs |

### Sync Trigger Conditions

An interaction should be synced to calendar when:
1. ✅ **Has a valid date**: `interaction_date IS NOT NULL`
2. ✅ **Is future or recent**: `interaction_date >= NOW() - INTERVAL '30 days'`
3. ✅ **Not archived**: `archived = FALSE`
4. ✅ **Has required fields**: `subject IS NOT NULL`

### Sync Behavior Rules

#### CREATE Interaction → CREATE Calendar Event
- When: New interaction is created AND meets sync conditions
- Action: Insert new record into `calendar_events`
- Idempotency: Use `(related_table, related_id)` UNIQUE constraint

#### UPDATE Interaction → UPDATE Calendar Event
- When: Interaction is updated AND meets sync conditions
- Action: Update existing calendar event OR create if missing
- Fields to sync: title, description, event_date, start_time, end_time, location, participants
- Idempotency: Use `related_id` to find existing event

#### ARCHIVE Interaction → CANCEL Calendar Event
- When: Interaction `archived` changes from FALSE to TRUE
- Action: Update `event_status = 'cancelled'` (do NOT delete)
- Keep event for audit trail

#### DELETE Interaction → DELETE Calendar Event
- When: Interaction is permanently deleted
- Action: Delete corresponding calendar event
- Cascade delete based on `related_id`

### Additional Supporting Tables

#### Sync Audit Log Table
```sql
CREATE TABLE calendar_sync_log (
  log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  interaction_id UUID NOT NULL,
  event_id UUID,
  action VARCHAR(20) NOT NULL, -- 'create', 'update', 'delete', 'cancel'
  status VARCHAR(20) NOT NULL, -- 'success', 'failed', 'retry'
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID NOT NULL
);
```

#### Sync Failures Queue Table
```sql
CREATE TABLE calendar_sync_failures (
  failure_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  interaction_id UUID NOT NULL,
  action VARCHAR(20) NOT NULL,
  error_message TEXT NOT NULL,
  error_stack TEXT,
  retry_count INTEGER DEFAULT 0,
  last_retry_at TIMESTAMP WITH TIME ZONE,
  next_retry_at TIMESTAMP WITH TIME ZONE,
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  FOREIGN KEY (interaction_id) REFERENCES interaction(interaction_id) ON DELETE CASCADE
);
```

#### Interaction Table Enhancement
```sql
-- Add sync tracking field to interaction table
ALTER TABLE interaction
ADD COLUMN calendar_synced_at TIMESTAMP WITH TIME ZONE;

-- Index for querying unsynced interactions
CREATE INDEX idx_interaction_synced_at ON interaction(calendar_synced_at);
```

---

## Implementation Notes

### Participant Derivation Logic
When creating/updating a calendar event, participants should be populated by querying related records:
1. Query customer name from `customer` table using `customer_id`
2. Query contact name from `contact` table using `contact_id`
3. Combine into array: `[customer_name, contact_name]`

### End Time Calculation
```javascript
function calculateEndTime(startDate, durationMinutes) {
  if (!durationMinutes || durationMinutes === 0) {
    return null; // All-day event
  }
  const endDate = new Date(startDate);
  endDate.setMinutes(endDate.getMinutes() + durationMinutes);
  return endDate.toTimeString().split(' ')[0]; // HH:MM:SS format
}
```

### Idempotency Strategy
- Use `UNIQUE (related_table, related_id)` constraint
- Use `INSERT ... ON CONFLICT (related_table, related_id) DO UPDATE` for upserts
- Check `calendar_synced_at` timestamp to avoid re-syncing unchanged records

---

## Next Steps (Phase 2)
1. Create DB migration scripts for new tables
2. Implement sync module functions
3. Add sync hooks to interaction CRUD endpoints
4. Implement retry and error handling logic
