import { query } from '../../config/database';
import { WahaClient } from './wahaClient';
import { config } from '../../config/env';
import logger from '../../utils/logger';
import {
  NotFoundError,
  OrganizationMismatchError,
} from '../../utils/errors';

// ── Types ─────────────────────────────────────────────────────────

export interface WhatsAppChannel {
  id: string;
  organizationId: string;
  sessionName: string;
  displayName: string;
  phoneNumber: string | null;
  status: string;
  lastHealthCheckAt: string | null;
  lastError: string | null;
  messagesSentCount: number;
  messagesFailedCount: number;
  createdAt: string;
  updatedAt: string;
}

interface CreateChannelInput {
  organizationId: string;
  displayName: string;
}

// ── Client Instance ───────────────────────────────────────────────

const wahaClient = new WahaClient(
  config.WAHA_API_URL,
  config.WAHA_API_KEY,
);

// ── Helpers ───────────────────────────────────────────────────────

function mapRowToChannel(row: any): WhatsAppChannel {
  return {
    id: row.id,
    organizationId: row.organization_id,
    sessionName: row.session_name,
    displayName: row.display_name,
    phoneNumber: row.phone_number || null,
    status: row.status,
    lastHealthCheckAt: row.last_health_check_at || null,
    lastError: row.last_error || null,
    messagesSentCount: row.messages_sent_count || 0,
    messagesFailedCount: row.messages_failed_count || 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function generateSessionName(orgId: string): string {
  const orgPrefix = orgId.replace(/[^a-zA-Z0-9]/g, '').substring(0, 8);
  return `rf_${orgPrefix}_${Date.now()}`;
}

// ── Service Functions ─────────────────────────────────────────────

export async function create(
  input: CreateChannelInput,
): Promise<WhatsAppChannel> {
  // WAHA Core (free version) only supports 'default' session
  // For WAHA PLUS, use: generateSessionName(input.organizationId)
  const sessionName = 'default';

  logger.info('Creating WhatsApp channel', {
    organizationId: input.organizationId,
    sessionName,
    displayName: input.displayName,
  });

  // Create and start WAHA session (or use existing one)
  try {
    await wahaClient.createSession(sessionName);
  } catch (error: any) {
    // Session already exists - that's fine, we'll just use it
    logger.debug('WAHA createSession error details', {
      status: error.response?.status,
      statusCode: error.response?.data?.statusCode,
      message: error.message,
    });

    const errorStatus = error.response?.status || error.response?.data?.statusCode;
    if (errorStatus !== 422) {
      throw error; // Re-throw if it's not a "session already exists" error
    }
    logger.info('WAHA session already exists, using existing session', { sessionName });
  }

  // Start session (or continue if already started)
  try {
    await wahaClient.startSession(sessionName);
  } catch (error: any) {
    const errorStatus = error.response?.status || error.response?.data?.statusCode;
    if (errorStatus !== 422) {
      throw error; // Re-throw if it's not a "session already started" error
    }
    logger.info('WAHA session already started, continuing', { sessionName });
  }

  // Insert DB record - cleanup WAHA on failure
  let rows;
  try {
    rows = await query(
      `INSERT INTO whatsapp_channels
        (organization_id, session_name, display_name, status)
       VALUES ($1, $2, $3, 'STARTING')
       RETURNING *`,
      [input.organizationId, sessionName, input.displayName],
    );
  } catch (dbError) {
    logger.error('DB insert failed after WAHA session created, cleaning up', {
      sessionName,
      error: (dbError as Error).message,
    });
    try {
      await wahaClient.stopSession(sessionName);
      await wahaClient.deleteSession(sessionName);
    } catch {
      // Best effort cleanup
    }
    throw dbError;
  }

  return mapRowToChannel(rows[0]);
}

export async function listForOrg(
  organizationId: string,
): Promise<WhatsAppChannel[]> {
  const rows = await query(
    `SELECT * FROM whatsapp_channels
     WHERE organization_id = $1 AND deleted_at IS NULL
     ORDER BY created_at DESC`,
    [organizationId],
  );

  return rows.map(mapRowToChannel);
}

export async function getByIdForOrg(
  channelId: string,
  organizationId: string,
): Promise<WhatsAppChannel> {
  const rows = await query(
    `SELECT * FROM whatsapp_channels
     WHERE id = $1 AND deleted_at IS NULL`,
    [channelId],
  );

  if (rows.length === 0) {
    throw new NotFoundError('WhatsApp Channel', channelId);
  }

  const channel = rows[0];
  if (channel.organization_id !== organizationId) {
    logger.warn('Cross-tenant WhatsApp channel access attempt blocked', {
      channelId,
      requestedByOrg: organizationId,
      actualOrg: channel.organization_id,
    });
    throw new OrganizationMismatchError();
  }

  return mapRowToChannel(channel);
}

export async function getQrCode(
  channelId: string,
  organizationId: string,
): Promise<{ mimetype: string; data: string }> {
  const channel = await getByIdForOrg(channelId, organizationId);

  const qr = await wahaClient.getQrCode(channel.sessionName);
  return qr;
}

export async function refreshStatus(
  channelId: string,
  organizationId: string,
): Promise<WhatsAppChannel> {
  const channel = await getByIdForOrg(channelId, organizationId);

  const wahaStatus = await wahaClient.getSessionStatus(channel.sessionName);
  const phoneNumber = wahaStatus.me?.id?.replace('@c.us', '') || null;

  await query(
    `UPDATE whatsapp_channels
     SET status = $1,
         phone_number = COALESCE($2, phone_number),
         last_health_check_at = NOW()
     WHERE id = $3`,
    [wahaStatus.status, phoneNumber, channelId],
  );

  const rows = await query(
    `SELECT * FROM whatsapp_channels WHERE id = $1`,
    [channelId],
  );

  return mapRowToChannel(rows[0]);
}

export async function disconnect(
  channelId: string,
  organizationId: string,
): Promise<void> {
  const channel = await getByIdForOrg(channelId, organizationId);

  logger.info('Disconnecting WhatsApp channel', {
    channelId,
    sessionName: channel.sessionName,
  });

  // Stop and delete WAHA session (ignore errors)
  try {
    await wahaClient.stopSession(channel.sessionName);
  } catch {
    logger.warn('Failed to stop WAHA session', {
      sessionName: channel.sessionName,
    });
  }

  try {
    await wahaClient.deleteSession(channel.sessionName);
  } catch {
    logger.warn('Failed to delete WAHA session', {
      sessionName: channel.sessionName,
    });
  }

  // Soft delete
  await query(
    `UPDATE whatsapp_channels
     SET deleted_at = NOW(), status = 'STOPPED'
     WHERE id = $1`,
    [channelId],
  );
}

export async function updateStatusFromWebhook(
  sessionName: string,
  newStatus: string,
  phoneId?: string,
): Promise<void> {
  const phoneNumber = phoneId?.replace('@c.us', '') || null;

  const rows = await query(
    `SELECT id, organization_id, session_name, status
     FROM whatsapp_channels
     WHERE session_name = $1 AND deleted_at IS NULL`,
    [sessionName],
  );

  if (rows.length === 0) {
    logger.warn('Webhook for unknown session', { sessionName, newStatus });
    return;
  }

  const channel = rows[0];

  logger.info('Updating channel status from webhook', {
    channelId: channel.id,
    sessionName,
    oldStatus: channel.status,
    newStatus,
  });

  if (newStatus === 'WORKING' && phoneNumber) {
    await query(
      `UPDATE whatsapp_channels
       SET status = $1, phone_number = $2, last_health_check_at = NOW()
       WHERE id = $3`,
      [newStatus, phoneNumber, channel.id],
    );
  } else {
    await query(
      `UPDATE whatsapp_channels
       SET status = $1, last_health_check_at = NOW(),
           last_error = CASE WHEN $1 = 'FAILED' THEN $2 ELSE last_error END
       WHERE id = $3`,
      [newStatus, `Status changed to ${newStatus}`, channel.id],
    );
  }
}
