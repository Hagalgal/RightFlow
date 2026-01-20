import { Queue } from 'bullmq';
import { redisConnection } from '../config/redis';

// Webhook job data structure
export interface WebhookJob {
  webhookId: string;
  url: string;
  payload: {
    id: string;
    type: string;
    timestamp: string;
    organizationId: string;
    data: any;
  };
  signature: string;
}

// Create webhook delivery queue
export const webhookQueue = new Queue<WebhookJob>('webhook-delivery', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 5, // Retry up to 5 times
    backoff: {
      type: 'exponential',
      delay: 1000, // Start at 1 second, doubles each retry (1s, 2s, 4s, 8s, 16s)
    },
    removeOnComplete: 100, // Keep last 100 completed jobs for monitoring
    removeOnFail: 500, // Keep last 500 failed jobs for debugging
  },
});

// Queue event listeners (for monitoring)
webhookQueue.on('waiting', (job) => {
  // Job is waiting to be processed
});

webhookQueue.on('active', (job) => {
  // Job is being processed
});

webhookQueue.on('completed', (job) => {
  // Job completed successfully
});

webhookQueue.on('failed', (job, err) => {
  // Job failed after all retries
});

export default webhookQueue;
