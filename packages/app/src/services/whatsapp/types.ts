export interface WhatsAppChannel {
  id: string;
  organizationId: string;
  sessionName: string;
  displayName: string;
  phoneNumber: string | null;
  status: WhatsAppChannelStatus;
  lastHealthCheckAt: string | null;
  lastError: string | null;
  messagesSentCount: number;
  messagesFailedCount: number;
  createdAt: string;
  updatedAt: string;
}

export type WhatsAppChannelStatus =
  | 'STOPPED'
  | 'STARTING'
  | 'SCAN_QR_CODE'
  | 'WORKING'
  | 'FAILED';

export interface WhatsAppQrCode {
  mimetype: string;
  data: string;
}

export interface SendFormLinkPayload {
  channelId: string;
  formId: string;
  recipientPhone: string;
  formUrl: string;
  caption?: string;
}

export interface MessageLogEntry {
  id: string;
  organizationId: string;
  channelId: string;
  formId: string | null;
  submissionId: string | null;
  recipientPhone: string;
  messageType: 'link' | 'pdf';
  contentRef: string | null;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  wahaMessageId: string | null;
  errorMessage: string | null;
  attempts: number;
  sentAt: string | null;
  deliveredAt: string | null;
  createdAt: string;
}

export interface MessageLogFilters {
  channelId?: string;
  formId?: string;
  status?: string;
  limit?: number;
  offset?: number;
}
