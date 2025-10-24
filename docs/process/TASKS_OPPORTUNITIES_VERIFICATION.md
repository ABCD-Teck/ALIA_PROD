# Tasks & Opportunities Verification and Archive Implementation

## Date: October 20, 2025

## Overview
Updated tasks module with archive functionality and verified that opportunities and tasks creation properly saves to the database.

---

## Tasks Completed

### 1. ✅ Opportunities Creation - Database Integration

**Verification**: Opportunities API already properly integrated

**API Endpoint**: `POST /api/opportunities`

**Implementation** (`server/routes/opportunities.js` lines 104-158):
```javascript
router.post('/', authenticateToken, async (req, res) => {
  const {
    customer_id, name, description, value, currency_id,
    stage, probability, expected_close_date, owner_user_id,
    source, priority, notes
  } = req.body;

  // Validates required fields
  if (!name || !customer_id) {
    return res.status(400).json({ error: 'Name and customer_id are required' });
  }

  // INSERT INTO opportunity table
  const query = `INSERT INTO opportunity (...) VALUES (...) RETURNING *`;
  const result = await pool.query(query, values);

  res.status(201).json(result.rows[0]);
});
```

**Database Table**: `opportunity`
- ✅ Saves to alia_crm database
- ✅ Returns created record
- ✅ Validates required fields
- ✅ Uses authenticated user ID

**Status**: ✅ Already working, no changes needed

---

### 2. ✅ Tasks Creation - Database Integration

**Verification**: Tasks API already properly integrated

**API Endpoint**: `POST /api/tasks`

**Implementation** (`server/routes/tasks.js` lines 66-118):
```javascript
router.post('/', authenticateToken, async (req, res) => {
  const {
    title, description, due_at, priority, status,
    customer_id, opportunity_id, contact_id, owner_user_id,
    notes, tags
  } = req.body;

  // Validates required fields
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  // INSERT INTO task table
  const query = `INSERT INTO task (...) VALUES (...) RETURNING *`;
  const result = await pool.query(query, values);

  res.status(201).json(result.rows[0]);
});
```

**Database Table**: `task`
- ✅ Saves to alia_crm database
- ✅ Returns created record
- ✅ Validates required fields
- ✅ Uses authenticated user ID
- ✅ Has `is_deleted` flag for soft delete

**Status**: ✅ Already working, no changes needed

---

### 3. ✅ Changed Delete to Archive

**Changes Made**:

#### A. Added Archive Endpoint (`/tasks/:id/archive`)
**File**: `server/routes/tasks.js` (lines 175-198)

```javascript
router.patch('/:id/archive', authenticateToken, async (req, res) => {
  const query = `
    UPDATE task
    SET is_deleted = true, updated_at = NOW()
    WHERE task_id = $1 AND is_deleted = false
    RETURNING *
  `;

  const result = await pool.query(query, [id]);
  res.json({ message: 'Task archived successfully', task: result.rows[0] });
});
```

**Features**:
- ✅ Soft delete (sets `is_deleted = true`)
- ✅ Only archives active tasks
- ✅ Returns archived task data
- ✅ Updates timestamp

#### B. Updated Legacy Delete Endpoint
**File**: `server/routes/tasks.js` (lines 287-310)

- Changed from permanent delete to archive
- Kept for backward compatibility
- Now performs soft delete

**Status**: ✅ Complete

---

### 4. ✅ Added Archived Tasks Endpoint

**New Endpoint**: `GET /api/tasks/archived/list`

**File**: `server/routes/tasks.js` (lines 200-233)

```javascript
router.get('/archived/list', authenticateToken, async (req, res) => {
  const { limit = 50, offset = 0 } = req.query;

  const query = `
    SELECT t.*, c.company_name
    FROM task t
    LEFT JOIN customer c ON t.customer_id = c.customer_id
    WHERE t.is_deleted = true
    ORDER BY t.updated_at DESC
    LIMIT $1 OFFSET $2
  `;

  const result = await pool.query(query, [limit, offset]);

  // Get total count
  const countQuery = `SELECT COUNT(*) FROM task WHERE is_deleted = true`;
  const countResult = await pool.query(countQuery);

  res.json({
    tasks: result.rows,
    total: totalCount,
    limit: parseInt(limit),
    offset: parseInt(offset)
  });
});
```

**Features**:
- ✅ Returns only archived tasks (`is_deleted = true`)
- ✅ Includes company name via JOIN
- ✅ Pagination support
- ✅ Total count included
- ✅ Sorted by archive date (newest first)

**Status**: ✅ Complete

---

### 5. ✅ Added Restore Functionality

**New Endpoint**: `PATCH /api/tasks/:id/restore`

**File**: `server/routes/tasks.js` (lines 235-258)

```javascript
router.patch('/:id/restore', authenticateToken, async (req, res) => {
  const query = `
    UPDATE task
    SET is_deleted = false, updated_at = NOW()
    WHERE task_id = $1 AND is_deleted = true
    RETURNING *
  `;

  const result = await pool.query(query, [id]);
  res.json({ message: 'Task restored successfully', task: result.rows[0] });
});
```

**Features**:
- ✅ Restores archived tasks
- ✅ Only restores archived tasks (`is_deleted = true`)
- ✅ Updates timestamp
- ✅ Returns restored task data

**Status**: ✅ Complete

---

### 6. ✅ Added Permanent Delete Functionality

**New Endpoint**: `DELETE /api/tasks/:id/permanent`

**File**: `server/routes/tasks.js` (lines 260-285)

```javascript
router.delete('/:id/permanent', authenticateToken, async (req, res) => {
  const { id } = req.params;

  // Only allow permanent delete of already archived tasks
  const checkQuery = `SELECT is_deleted FROM task WHERE task_id = $1`;
  const checkResult = await pool.query(checkQuery, [id]);

  if (checkResult.rows.length === 0) {
    return res.status(404).json({ error: 'Task not found' });
  }

  if (!checkResult.rows[0].is_deleted) {
    return res.status(400).json({
      error: 'Task must be archived before permanent deletion'
    });
  }

  const deleteQuery = `DELETE FROM task WHERE task_id = $1 RETURNING *`;
  const result = await pool.query(deleteQuery, [id]);

  res.json({ message: 'Task permanently deleted', task: result.rows[0] });
});
```

**Features**:
- ✅ Hard delete (removes from database)
- ✅ Safety check: only deletes archived tasks
- ✅ Returns error if task not archived
- ✅ Returns deleted task data
- ✅ Cannot be undone

**Safety Rules**:
1. Task must be archived first
2. Cannot directly permanent delete active tasks
3. Two-step deletion process prevents accidents

**Status**: ✅ Complete

---

### 7. ✅ Updated API Service

**File**: `src/services/api.ts` (lines 378-408)

Added new methods to `tasksApi`:

```typescript
export const tasksApi = {
  // ... existing methods ...

  archive: async (id: string) => {
    return fetchApi<any>(`/tasks/${id}/archive`, {
      method: 'PATCH',
    });
  },

  getArchived: async (params?: { limit?: number; offset?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const query = queryParams.toString();
    return fetchApi<{
      tasks: any[];
      total: number;
      limit: number;
      offset: number;
    }>(`/tasks/archived/list${query ? `?${query}` : ''}`);
  },

  restore: async (id: string) => {
    return fetchApi<any>(`/tasks/${id}/restore`, {
      method: 'PATCH',
    });
  },

  permanentDelete: async (id: string) => {
    return fetchApi<any>(`/tasks/${id}/permanent`, {
      method: 'DELETE',
    });
  },
};
```

**Status**: ✅ Complete

---

## API Endpoints Summary

### Tasks API

| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| GET | `/api/tasks` | Get all active tasks | ✅ Existing |
| GET | `/api/tasks/:id` | Get single task | ✅ Existing |
| POST | `/api/tasks` | Create new task | ✅ Existing |
| PUT | `/api/tasks/:id` | Update task | ✅ Existing |
| DELETE | `/api/tasks/:id` | Archive task (legacy) | ✅ Updated |
| **PATCH** | `/api/tasks/:id/archive` | **Archive task** | ✅ **NEW** |
| **GET** | `/api/tasks/archived/list` | **Get archived tasks** | ✅ **NEW** |
| **PATCH** | `/api/tasks/:id/restore` | **Restore archived task** | ✅ **NEW** |
| **DELETE** | `/api/tasks/:id/permanent` | **Permanently delete** | ✅ **NEW** |

### Opportunities API

| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| GET | `/api/opportunities` | Get all opportunities | ✅ Existing |
| GET | `/api/opportunities/:id` | Get single opportunity | ✅ Existing |
| POST | `/api/opportunities` | Create new opportunity | ✅ Existing |
| PUT | `/api/opportunities/:id` | Update opportunity | ✅ Existing |
| DELETE | `/api/opportunities/:id` | Delete opportunity | ✅ Existing |

---

## Task Lifecycle Flow

```
┌─────────────┐
│ Create Task │
└──────┬──────┘
       │
       ↓
┌─────────────┐
│ Active Task │ ←─────────────────┐
│ (is_deleted │                   │
│  = false)   │                   │
└──────┬──────┘                   │
       │                          │
       │ Archive                  │ Restore
       ↓                          │
┌──────────────┐                  │
│ Archived Task│──────────────────┘
│ (is_deleted  │
│  = true)     │
└──────┬───────┘
       │
       │ Permanent Delete
       ↓
┌──────────────┐
│   Deleted    │
│ (Removed from│
│  database)   │
└──────────────┘
```

**Key Points**:
1. ✅ Active tasks can be archived
2. ✅ Archived tasks can be restored
3. ✅ Only archived tasks can be permanently deleted
4. ✅ Two-step deletion prevents accidents

---

## Frontend Integration Requirements

### TaskManager Component Updates Needed

**Current State**: Uses mock data (`initialTasks`)

**Required Changes**:
1. Add state for database tasks
2. Add state for archived tasks
3. Fetch tasks from API on load
4. Replace delete with archive
5. Add archive panel below "Your Tasks"
6. Add restore button in archive panel
7. Add permanent delete button in archive panel

**Recommended Structure**:

```tsx
export function TaskManager({ searchQuery, language }: TaskManagerProps) {
  // State
  const [tasks, setTasks] = useState<any[]>([]);
  const [archivedTasks, setArchivedTasks] = useState<any[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [loadingArchived, setLoadingArchived] = useState(false);

  // Fetch active tasks
  useEffect(() => {
    const fetchTasks = async () => {
      setLoadingTasks(true);
      const response = await api.tasksApi.getAll({ limit: 100 });
      if (response.data?.tasks) {
        setTasks(response.data.tasks);
      }
      setLoadingTasks(false);
    };
    fetchTasks();
  }, []);

  // Fetch archived tasks
  useEffect(() => {
    const fetchArchived = async () => {
      setLoadingArchived(true);
      const response = await api.tasksApi.getArchived({ limit: 100 });
      if (response.data?.tasks) {
        setArchivedTasks(response.data.tasks);
      }
      setLoadingArchived(false);
    };
    fetchArchived();
  }, []);

  // Archive handler
  const handleArchive = async (taskId: string) => {
    await api.tasksApi.archive(taskId);
    // Refresh both lists
    // Move task from tasks to archivedTasks
  };

  // Restore handler
  const handleRestore = async (taskId: string) => {
    await api.tasksApi.restore(taskId);
    // Refresh both lists
    // Move task from archivedTasks to tasks
  };

  // Permanent delete handler
  const handlePermanentDelete = async (taskId: string) => {
    if (confirm('Permanently delete this task? This cannot be undone.')) {
      await api.tasksApi.permanentDelete(taskId);
      // Refresh archived list
      // Remove from archivedTasks
    }
  };

  return (
    <div>
      {/* Your Tasks Section */}
      <Card>
        <CardHeader>
          <CardTitle>{t.yourTasks}</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Task table with Archive button */}
        </CardContent>
      </Card>

      {/* Archived Tasks Section - NEW */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>{t.archivedTasks}</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Archived task table with Restore and Delete buttons */}
        </CardContent>
      </Card>
    </div>
  );
}
```

**Status**: ⚠️ Frontend update needed

---

## Testing Checklist

### Backend API Tests

#### Create Task
```bash
curl -X POST http://localhost:3001/api/tasks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Task",
    "description": "Testing task creation",
    "priority": "high",
    "status": "pending"
  }'
```
**Expected**: Task created, returns task object with `task_id`

#### Archive Task
```bash
curl -X PATCH http://localhost:3001/api/tasks/TASK_ID/archive \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected**: `{"message": "Task archived successfully", "task": {...}}`

#### Get Archived Tasks
```bash
curl -X GET http://localhost:3001/api/tasks/archived/list \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected**: `{"tasks": [...], "total": N, "limit": 50, "offset": 0}`

#### Restore Task
```bash
curl -X PATCH http://localhost:3001/api/tasks/TASK_ID/restore \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected**: `{"message": "Task restored successfully", "task": {...}}`

#### Permanent Delete (should fail if not archived)
```bash
curl -X DELETE http://localhost:3001/api/tasks/TASK_ID/permanent \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected**: `{"error": "Task must be archived before permanent deletion"}`

#### Permanent Delete (after archiving)
```bash
# First archive
curl -X PATCH http://localhost:3001/api/tasks/TASK_ID/archive \
  -H "Authorization: Bearer YOUR_TOKEN"

# Then permanent delete
curl -X DELETE http://localhost:3001/api/tasks/TASK_ID/permanent \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected**: `{"message": "Task permanently deleted", "task": {...}}`

### Frontend Tests (Once Integrated)

- [ ] Create task via UI
- [ ] Task appears in "Your Tasks"
- [ ] Archive task via button
- [ ] Task moves to "Archived Tasks"
- [ ] Restore task via button
- [ ] Task moves back to "Your Tasks"
- [ ] Permanent delete from archive
- [ ] Task removed from UI
- [ ] Cannot find task in database

---

## Database Schema

### task table

| Column | Type | Description |
|--------|------|-------------|
| task_id | UUID | Primary key |
| title | VARCHAR | Task title (required) |
| description | TEXT | Task description |
| due_at | TIMESTAMP | Due date/time |
| priority | VARCHAR | Priority level |
| status | VARCHAR | Task status |
| customer_id | UUID | Foreign key to customer |
| opportunity_id | UUID | Foreign key to opportunity |
| contact_id | UUID | Foreign key to contact |
| owner_user_id | UUID | Foreign key to user |
| notes | TEXT | Additional notes |
| tags | TEXT[] | Tags array |
| **is_deleted** | **BOOLEAN** | **Soft delete flag** |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

**Key Field**: `is_deleted`
- `false` = Active task (default)
- `true` = Archived task

---

## Security Considerations

### Authentication
- ✅ All endpoints require authentication
- ✅ Uses `authenticateToken` middleware
- ✅ Bearer token in Authorization header

### Authorization
- ✅ Current user ID used for `owner_user_id`
- ⚠️ May need role-based permissions
- ⚠️ Consider if users can delete others' tasks

### Data Safety
- ✅ Two-step deletion (archive → permanent)
- ✅ Cannot directly permanent delete active tasks
- ✅ Archived tasks clearly separated
- ✅ Restore functionality available

---

## Performance Considerations

### Indexes Recommended

```sql
-- Index for active tasks query
CREATE INDEX idx_task_is_deleted_due_at ON task(is_deleted, due_at);

-- Index for archived tasks query
CREATE INDEX idx_task_is_deleted_updated_at ON task(is_deleted, updated_at DESC);

-- Index for user's tasks
CREATE INDEX idx_task_owner_user_id ON task(owner_user_id) WHERE is_deleted = false;
```

### Query Optimization
- ✅ Filters on `is_deleted` in WHERE clause
- ✅ Efficient JOINs with customer table
- ✅ Pagination support reduces load
- ✅ Indexes on foreign keys

---

## Next Steps

### 1. Update TaskManager Frontend
- [ ] Replace mock data with API calls
- [ ] Add loading states
- [ ] Add error handling
- [ ] Add archive panel below "Your Tasks"
- [ ] Implement archive button
- [ ] Implement restore button
- [ ] Implement permanent delete button

### 2. Add UI Translations
- [ ] Add `archivedTasks` label
- [ ] Add `archive` button label
- [ ] Add `restore` button label
- [ ] Add `permanentDelete` button label
- [ ] Add confirmation dialogs

### 3. Test End-to-End
- [ ] Create task in UI
- [ ] Verify in database
- [ ] Archive task in UI
- [ ] Verify in archive panel
- [ ] Restore task
- [ ] Permanent delete
- [ ] Verify removed from database

---

## Conclusion

✅ **Backend Implementation Complete**

All backend API endpoints have been successfully implemented:
- ✅ Tasks creation saves to database
- ✅ Opportunities creation saves to database
- ✅ Delete changed to archive (soft delete)
- ✅ Archive endpoint added
- ✅ Get archived tasks endpoint added
- ✅ Restore endpoint added
- ✅ Permanent delete endpoint added
- ✅ API service updated with new methods

**Frontend Integration**: Requires TaskManager component updates to use database and display archive panel.

---

**Completed by**: Claude Code Assistant
**Date**: October 20, 2025
**Status**: ✅ Backend Complete | ⚠️ Frontend Integration Needed
