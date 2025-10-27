/**
 * Calendar Sync Service
 *
 * Handles automatic synchronization of customer interactions to calendar events
 * Provides idempotent sync operations with comprehensive error handling and logging
 */

const pool = require('../db');

const LOG_SOURCE = 'CalendarSync';

/**
 * Emit structured log payloads with consistent shape
 * @param {'info'|'warn'|'error'|'debug'} level
 * @param {string} message
 * @param {Object} context
 */
function emitLog(level, message, context = {}) {
  const payload = {
    timestamp: new Date().toISOString(),
    level,
    source: LOG_SOURCE,
    message,
    ...context
  };

  const serialized = JSON.stringify(payload);

  switch (level) {
    case 'error':
      console.error(serialized);
      break;
    case 'warn':
      console.warn(serialized);
      break;
    case 'debug':
      if (process.env.DEBUG_CALENDAR_SYNC === 'true') {
        console.debug(serialized);
      }
      break;
    default:
      console.log(serialized);
  }
}

/**
 * Logger utility for structured sync logging
 */
const logger = {
  info: (message, context = {}) => emitLog('info', message, context),
  error: (message, context = {}) => emitLog('error', message, context),
  warn: (message, context = {}) => emitLog('warn', message, context),
  debug: (message, context = {}) => emitLog('debug', message, context)
};

const TRANSIENT_PG_ERRORS = new Set([
  '40001', // serialization_failure
  '40P01', // deadlock_detected
  '53300', // too_many_connections
  '57P03', // cannot_connect_now
  '55P03', // lock_not_available
  '08006', // connection_failure
  '08003', // connection_does_not_exist
  '58000'  // system_error
]);

const wait = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

function isTransientError(error) {
  if (!error) {
    return false;
  }

  if (error.code && TRANSIENT_PG_ERRORS.has(error.code)) {
    return true;
  }

  const message = error.message || '';
  return /timeout/i.test(message) || /deadlock/i.test(message) || /connection/i.test(message);
}

async function runWithRetry(operation, options = {}) {
  const {
    maxAttempts = 3,
    baseDelayMs = 200,
    backoffFactor = 2,
    context = {}
  } = options;

  let attempt = 0;
  let lastError;

  while (attempt < maxAttempts) {
    attempt += 1;
    try {
      if (attempt > 1) {
        logger.info('Retrying calendar sync operation', {
          attempt,
          maxAttempts,
          ...context
        });
      }
      return await operation(attempt);
    } catch (error) {
      lastError = error;

      if (!isTransientError(error) || attempt >= maxAttempts) {
        throw error;
      }

      const delay = baseDelayMs * Math.pow(backoffFactor, attempt - 1);
      logger.warn('Transient calendar sync error encountered, will retry', {
        attempt,
        maxAttempts,
        delay_ms: delay,
        error_code: error.code,
        error_message: error.message,
        ...context
      });
      await wait(delay);
    }
  }

  throw lastError;
}

/**
 * Check if an interaction should be synced to calendar
 *
 * @param {Object} interaction - The interaction record
 * @returns {boolean} - True if should be synced
 */
function shouldSyncInteraction(interaction) {
  // Must have required fields
  if (!interaction.subject || !interaction.interaction_date) {
    logger.debug('Interaction missing required fields for sync', {
      interaction_id: interaction.interaction_id,
      has_subject: !!interaction.subject,
      has_date: !!interaction.interaction_date
    });
    return false;
  }

  // Must not be archived
  if (interaction.archived) {
    logger.debug('Interaction is archived, skipping sync', {
      interaction_id: interaction.interaction_id
    });
    return false;
  }

  // Check if date is within reasonable range (not too far in past)
  const interactionDate = new Date(interaction.interaction_date);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  if (interactionDate < thirtyDaysAgo) {
    logger.debug('Interaction date too old for calendar sync', {
      interaction_id: interaction.interaction_id,
      interaction_date: interaction.interaction_date
    });
    return false;
  }

  return true;
}

/**
 * Calculate end time based on start date and duration
 *
 * @param {Date|string} startDate - The start date/time
 * @param {number} durationMinutes - Duration in minutes
 * @returns {string|null} - End time in HH:MM:SS format, or null for all-day
 */
function calculateEndTime(startDate, durationMinutes) {
  if (!durationMinutes || durationMinutes === 0) {
    return null; // All-day event
  }

  const start = new Date(startDate);
  const end = new Date(start.getTime() + durationMinutes * 60000); // Add milliseconds

  // Format as HH:MM:SS
  const hours = String(end.getHours()).padStart(2, '0');
  const minutes = String(end.getMinutes()).padStart(2, '0');
  const seconds = String(end.getSeconds()).padStart(2, '0');

  return `${hours}:${minutes}:${seconds}`;
}

/**
 * Get participants for a calendar event from related records
 *
 * @param {Object} interaction - The interaction record
 * @param {Object} client - PostgreSQL client (for transaction)
 * @returns {Promise<string[]>} - Array of participant names
 */
async function getParticipants(interaction, client = pool) {
  const participants = [];

  try {
    // Get customer name if exists
    if (interaction.customer_id) {
      const customerQuery = 'SELECT company_name FROM customer WHERE customer_id = $1';
      const customerResult = await client.query(customerQuery, [interaction.customer_id]);
      if (customerResult.rows.length > 0 && customerResult.rows[0].company_name) {
        participants.push(customerResult.rows[0].company_name);
      }
    }

    // Get contact name if exists
    if (interaction.contact_id) {
      const contactQuery = `
        SELECT first_name || ' ' || last_name as full_name
        FROM contact
        WHERE contact_id = $1
      `;
      const contactResult = await client.query(contactQuery, [interaction.contact_id]);
      if (contactResult.rows.length > 0 && contactResult.rows[0].full_name) {
        participants.push(contactResult.rows[0].full_name);
      }
    }
  } catch (error) {
    logger.warn('Failed to fetch participants, continuing with empty list', {
      interaction_id: interaction.interaction_id,
      error: error.message
    });
  }

  return participants;
}

/**
 * Log sync action to audit log
 *
 * @param {string} interactionId - UUID of interaction
 * @param {string} eventId - UUID of calendar event (nullable)
 * @param {string} action - Action performed ('create', 'update', 'delete', 'cancel')
 * @param {string} status - Status of action ('success', 'failed', 'retry')
 * @param {string} errorMessage - Error message if failed (nullable)
 * @param {string} userId - UUID of user performing action
 * @param {Object} client - PostgreSQL client (for transaction)
 */
async function logSyncAction(interactionId, eventId, action, status, errorMessage, userId, client = pool) {
  try {
    const query = `
      INSERT INTO calendar_sync_log (interaction_id, event_id, action, status, error_message, created_by)
      VALUES ($1, $2, $3, $4, $5, $6)
    `;
    await client.query(query, [interactionId, eventId, action, status, errorMessage, userId]);
  } catch (error) {
    // Log but don't fail the operation if audit log fails
    logger.error('Failed to write sync audit log', {
      interaction_id: interactionId,
      event_id: eventId,
      action,
      status,
      error: error.message
    });
  }
}

/**
 * Record a sync failure for retry processing
 *
 * @param {string} interactionId - UUID of interaction
 * @param {string} action - Action that failed
 * @param {Error} error - The error that occurred
 * @param {Object} client - PostgreSQL client (for transaction)
 */
async function recordSyncFailure(interactionId, action, error, client = pool) {
  try {
    const query = `
      INSERT INTO calendar_sync_failures (interaction_id, action, error_message, error_stack, next_retry_at)
      VALUES ($1, $2, $3, $4, NOW() + INTERVAL '5 minutes')
      ON CONFLICT (interaction_id, action)
      WHERE resolved = FALSE
      DO UPDATE SET
        retry_count = calendar_sync_failures.retry_count + 1,
        error_message = EXCLUDED.error_message,
        error_stack = EXCLUDED.error_stack,
        last_retry_at = NOW(),
        next_retry_at = NOW() + (INTERVAL '5 minutes' * POWER(2, calendar_sync_failures.retry_count + 1))
    `;
    await client.query(query, [
      interactionId,
      action,
      error.message,
      error.stack
    ]);

    logger.info('Sync failure recorded for retry', {
      interaction_id: interactionId,
      action,
      error: error.message
    });
  } catch (logError) {
    logger.error('Failed to record sync failure', {
      interaction_id: interactionId,
      original_error: error.message,
      log_error: logError.message
    });
  }
}

/**
 * Mark previously recorded failures as resolved
 *
 * @param {string} interactionId
 * @param {string} action
 * @param {Object} client
 */
async function resolveSyncFailure(interactionId, action, client = pool) {
  try {
    const query = `
      UPDATE calendar_sync_failures
      SET resolved = TRUE,
          resolved_at = NOW()
      WHERE interaction_id = $1
        AND action = $2
        AND resolved = FALSE
    `;
    await client.query(query, [interactionId, action]);
  } catch (error) {
    logger.warn('Failed to mark sync failure as resolved', {
      interaction_id: interactionId,
      action,
      error: error.message
    });
  }
}

/**
 * Sync an interaction to calendar (Create or Update)
 * IDEMPOTENT: Safe to call multiple times for the same interaction
 *
 * @param {Object} interaction - The interaction record (must include interaction_id)
 * @param {string} userId - UUID of user triggering the sync
 * @returns {Promise<Object>} - Result object with success status and event details
 */
async function performInteractionSync(interaction, userId, attempt) {
  const startTime = Date.now();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const startDate = new Date(interaction.interaction_date);
    const startTimeStr = startDate.toTimeString().split(' ')[0]; // HH:MM:SS
    const endTimeStr = calculateEndTime(interaction.interaction_date, interaction.duration_minutes);
    const isAllDay = !interaction.duration_minutes || interaction.duration_minutes === 0;
    const participants = await getParticipants(interaction, client);

    const eventData = {
      title: interaction.subject,
      description: interaction.description || null,
      event_date: interaction.interaction_date,
      start_time: startTimeStr,
      end_time: endTimeStr,
      all_day: isAllDay,
      event_type: interaction.interaction_type || 'interaction',
      event_status: 'scheduled',
      related_table: 'interaction',
      related_id: interaction.interaction_id,
      location: interaction.location || null,
      participants,
      created_by: userId,
      updated_by: userId,
      synced_from: 'interaction',
      last_synced_at: new Date()
    };

    const upsertQuery = `
      INSERT INTO calendar_events (
        title, description, event_date, start_time, end_time, all_day,
        event_type, event_status, related_table, related_id, location, participants,
        created_by, updated_by, synced_from, last_synced_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      ON CONFLICT (related_table, related_id)
      DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        event_date = EXCLUDED.event_date,
        start_time = EXCLUDED.start_time,
        end_time = EXCLUDED.end_time,
        all_day = EXCLUDED.all_day,
        event_type = EXCLUDED.event_type,
        location = EXCLUDED.location,
        participants = EXCLUDED.participants,
        updated_by = EXCLUDED.updated_by,
        updated_at = NOW(),
        last_synced_at = EXCLUDED.last_synced_at
      RETURNING event_id, (xmax = 0) AS was_inserted
    `;

    const values = [
      eventData.title,
      eventData.description,
      eventData.event_date,
      eventData.start_time,
      eventData.end_time,
      eventData.all_day,
      eventData.event_type,
      eventData.event_status,
      eventData.related_table,
      eventData.related_id,
      eventData.location,
      eventData.participants,
      eventData.created_by,
      eventData.updated_by,
      eventData.synced_from,
      eventData.last_synced_at
    ];

    const result = await client.query(upsertQuery, values);
    const eventId = result.rows[0].event_id;
    const wasInserted = result.rows[0].was_inserted;
    const action = wasInserted ? 'create' : 'update';

    await client.query(
      'UPDATE interaction SET calendar_synced_at = NOW() WHERE interaction_id = $1',
      [interaction.interaction_id]
    );

    await resolveSyncFailure(interaction.interaction_id, 'sync', client);
    await logSyncAction(interaction.interaction_id, eventId, action, 'success', null, userId, client);

    await client.query('COMMIT');

    const duration = Date.now() - startTime;
    logger.info(`Calendar sync completed successfully (${action})`, {
      interaction_id: interaction.interaction_id,
      event_id: eventId,
      action,
      duration_ms: duration,
      attempt
    });

    return {
      success: true,
      event_id: eventId,
      action,
      duration_ms: duration
    };
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      logger.warn('Rollback failed during calendar sync attempt', {
        interaction_id: interaction.interaction_id,
        rollback_error: rollbackError.message
      });
    }

    logger.error('Calendar sync attempt failed', {
      interaction_id: interaction.interaction_id,
      user_id: userId,
      attempt,
      error: error.message
    });
    throw error;
  } finally {
    client.release();
  }
}

async function syncInteractionToCalendar(interaction, userId) {
  logger.info('Starting calendar sync for interaction', {
    interaction_id: interaction.interaction_id,
    user_id: userId
  });

  if (!shouldSyncInteraction(interaction)) {
    logger.info('Interaction does not meet sync criteria, skipping', {
      interaction_id: interaction.interaction_id
    });
    return {
      success: true,
      skipped: true,
      reason: 'Does not meet sync criteria'
    };
  }

  try {
    const result = await runWithRetry(
      (attempt) => performInteractionSync(interaction, userId, attempt),
      {
        context: {
          interaction_id: interaction.interaction_id,
          user_id: userId,
          operation: 'sync_interaction'
        }
      }
    );

    return result;
  } catch (error) {
    logger.error('Calendar sync failed after retries', {
      interaction_id: interaction.interaction_id,
      user_id: userId,
      error: error.message
    });

    await recordSyncFailure(interaction.interaction_id, 'sync', error, pool);
    await logSyncAction(
      interaction.interaction_id,
      null,
      'create_or_update',
      'failed',
      error.message,
      userId
    );

    return {
      success: false,
      error: error.message,
      stack: error.stack
    };
  }
}

/**
 * Remove calendar event for an interaction
 * IDEMPOTENT: Safe to call multiple times
 *
 * @param {string} interactionId - UUID of interaction
 * @param {string} userId - UUID of user triggering the removal
 * @param {string} reason - Reason for removal ('archived' or 'deleted')
 * @returns {Promise<Object>} - Result object with success status
 */
async function performInteractionRemoval(interactionId, userId, reason, attempt) {
  const startTime = Date.now();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const shouldCancel = reason === 'archived' || reason === 'unscheduled';

    if (shouldCancel) {
      const updateQuery = `
        UPDATE calendar_events
        SET event_status = 'cancelled', updated_by = $1, updated_at = NOW()
        WHERE related_table = 'interaction' AND related_id = $2
        RETURNING event_id
      `;
      const result = await client.query(updateQuery, [userId, interactionId]);

      if (result.rows.length > 0) {
        const eventId = result.rows[0].event_id;
        await resolveSyncFailure(interactionId, 'remove', client);
        await logSyncAction(interactionId, eventId, 'cancel', 'success', null, userId, client);
        await client.query('COMMIT');

        const duration = Date.now() - startTime;
        logger.info('Calendar event cancelled successfully', {
          interaction_id: interactionId,
          event_id: eventId,
          duration_ms: duration,
          attempt
        });

        return {
          success: true,
          event_id: eventId,
          action: 'cancelled',
          duration_ms: duration
        };
      } else {
        await client.query('COMMIT');
        logger.info('No calendar event found to cancel', {
          interaction_id: interactionId,
          attempt
        });

        return {
          success: true,
          action: 'none',
          reason: 'No calendar event found'
        };
      }
    } else {
      const deleteQuery = `
        DELETE FROM calendar_events
        WHERE related_table = 'interaction' AND related_id = $1
        RETURNING event_id
      `;
      const result = await client.query(deleteQuery, [interactionId]);

      if (result.rows.length > 0) {
        const eventId = result.rows[0].event_id;
        await resolveSyncFailure(interactionId, 'remove', client);
        await logSyncAction(interactionId, eventId, 'delete', 'success', null, userId, client);
        await client.query('COMMIT');

        const duration = Date.now() - startTime;
        logger.info('Calendar event deleted successfully', {
          interaction_id: interactionId,
          event_id: eventId,
          duration_ms: duration,
          attempt
        });

        return {
          success: true,
          event_id: eventId,
          action: 'deleted',
          duration_ms: duration
        };
      } else {
        await client.query('COMMIT');
        logger.info('No calendar event found to delete', {
          interaction_id: interactionId,
          attempt
        });

        return {
          success: true,
          action: 'none',
          reason: 'No calendar event found'
        };
      }
    }
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      logger.warn('Rollback failed during calendar event removal', {
        interaction_id: interactionId,
        rollback_error: rollbackError.message
      });
    }

    logger.error('Calendar event removal attempt failed', {
      interaction_id: interactionId,
      user_id: userId,
      reason,
      attempt,
      error: error.message
    });
    throw error;
  } finally {
    client.release();
  }
}

async function removeInteractionCalendar(interactionId, userId, reason = 'deleted') {
  logger.info('Removing calendar event for interaction', {
    interaction_id: interactionId,
    user_id: userId,
    reason
  });

  try {
    const result = await runWithRetry(
      (attempt) => performInteractionRemoval(interactionId, userId, reason, attempt),
      {
        context: {
          interaction_id: interactionId,
          user_id: userId,
          operation: 'remove_interaction_calendar',
          reason
        }
      }
    );

    return result;
  } catch (error) {
    logger.error('Calendar event removal failed after retries', {
      interaction_id: interactionId,
      user_id: userId,
      reason,
      error: error.message
    });

    await recordSyncFailure(interactionId, 'remove', error, pool);
    await logSyncAction(
      interactionId,
      null,
      reason === 'archived' || reason === 'unscheduled' ? 'cancel' : 'delete',
      'failed',
      error.message,
      userId
    );

    return {
      success: false,
      error: error.message,
      stack: error.stack
    };
  }
}

module.exports = {
  syncInteractionToCalendar,
  removeInteractionCalendar,
  shouldSyncInteraction,
  calculateEndTime,
  getParticipants
};
