import { Router, Request, Response, NextFunction } from 'express';
import { config } from '../../config/env';
import { updateStatusFromWebhook } from '../../services/whatsapp/channelService';
import logger from '../../utils/logger';

const router = Router();

/**
 * WAHA Webhook receiver.
 * Public endpoint (no JWT) - secured by API key validation.
 *
 * POST /api/v1/whatsapp/webhook
 */
router.post(
  '/webhook',
  async (req: Request, res: Response, _next: NextFunction) => {
    // Validate API key
    const apiKey = req.headers['x-api-key'] as string | undefined;
    const webhookSecret = config.WAHA_WEBHOOK_SECRET || config.WAHA_API_KEY;

    if (!webhookSecret || apiKey !== webhookSecret) {
      logger.warn('WhatsApp webhook rejected: invalid API key', {
        ip: req.ip,
      });
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const { event, session, payload } = req.body;

      logger.info('WhatsApp webhook received', {
        event,
        session,
      });

      switch (event) {
        case 'session.status': {
          const newStatus = payload?.status;
          const phoneId = payload?.me?.id;
          if (session && newStatus) {
            await updateStatusFromWebhook(session, newStatus, phoneId);
          }
          break;
        }

        case 'message.ack': {
          // Future: update message delivery status
          logger.debug('WhatsApp message ack received', {
            session,
            payload,
          });
          break;
        }

        default:
          logger.debug('WhatsApp webhook: unknown event', { event });
      }

      return res.json({ status: 'ok' });
    } catch (error) {
      logger.error('WhatsApp webhook processing error', {
        error: (error as Error).message,
      });
      // Always return 200 to prevent WAHA from retrying
      return res.json({ status: 'ok' });
    }
  },
);

export default router;
