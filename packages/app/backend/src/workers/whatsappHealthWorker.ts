import { query } from '../config/database';
import { WahaClient } from '../services/whatsapp/wahaClient';
import { config } from '../config/env';
import logger from '../utils/logger';

const POLL_INTERVAL_MS = 60_000; // 60 seconds

const wahaClient = new WahaClient(
  config.WAHA_API_URL,
  config.WAHA_API_KEY,
);

async function pollChannelHealth(): Promise<void> {
  try {
    const rows = await query(
      `SELECT id, session_name, status
       FROM whatsapp_channels
       WHERE status != 'STOPPED' AND deleted_at IS NULL`,
    );

    if (rows.length === 0) return;

    for (const row of rows) {
      try {
        const wahaStatus = await wahaClient.getSessionStatus(
          row.session_name,
        );

        const newStatus = wahaStatus.status;
        const phoneNumber =
          wahaStatus.me?.id?.replace('@c.us', '') || null;

        if (newStatus !== row.status) {
          logger.info('WhatsApp channel status changed', {
            channelId: row.id,
            sessionName: row.session_name,
            oldStatus: row.status,
            newStatus,
          });
        }

        await query(
          `UPDATE whatsapp_channels
           SET status = $1::VARCHAR,
               phone_number = COALESCE($2, phone_number),
               last_health_check_at = NOW(),
               last_error = CASE
                 WHEN $1::VARCHAR = 'FAILED' THEN 'Session failed'
                 ELSE NULL
               END
           WHERE id = $3`,
          [newStatus, phoneNumber, row.id],
        );
      } catch (error) {
        logger.warn('Failed to poll WhatsApp channel', {
          channelId: row.id,
          sessionName: row.session_name,
          error: (error as Error).message,
        });

        await query(
          `UPDATE whatsapp_channels
           SET last_health_check_at = NOW(),
               last_error = $1
           WHERE id = $2`,
          [(error as Error).message, row.id],
        );
      }
    }
  } catch (error) {
    logger.error('WhatsApp health worker cycle failed', {
      error: (error as Error).message,
    });
  }
}

// Start polling
const intervalId = setInterval(pollChannelHealth, POLL_INTERVAL_MS);

// Clean shutdown
process.on('SIGTERM', () => clearInterval(intervalId));
process.on('SIGINT', () => clearInterval(intervalId));

logger.info('WhatsApp health worker started', {
  intervalMs: POLL_INTERVAL_MS,
});

export { pollChannelHealth, intervalId };
