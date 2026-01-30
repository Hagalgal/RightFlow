import { apiClient } from '../../api/client';
import type {
  WhatsAppChannel,
  WhatsAppQrCode,
  SendFormLinkPayload,
  MessageLogEntry,
  MessageLogFilters,
} from './types';

const BASE = '/whatsapp'; // apiClient already adds /api/v1

export const whatsappService = {
  // ── Channels ──────────────────────────────────────────────────

  async listChannels(): Promise<WhatsAppChannel[]> {
    const response = await apiClient.get<WhatsAppChannel[]>(
      `${BASE}/channels`,
    );
    return response.data;
  },

  async createChannel(displayName: string): Promise<WhatsAppChannel> {
    const response = await apiClient.post<WhatsAppChannel>(
      `${BASE}/channels`,
      { displayName },
    );
    return response.data;
  },

  async getChannel(id: string): Promise<WhatsAppChannel> {
    const response = await apiClient.get<WhatsAppChannel>(
      `${BASE}/channels/${id}`,
    );
    return response.data;
  },

  async deleteChannel(id: string): Promise<void> {
    await apiClient.delete(`${BASE}/channels/${id}`);
  },

  async getQrCode(id: string): Promise<WhatsAppQrCode> {
    const response = await apiClient.post<WhatsAppQrCode>(
      `${BASE}/channels/${id}/qr`,
    );
    return response.data;
  },

  async refreshStatus(id: string): Promise<WhatsAppChannel> {
    const response = await apiClient.post<WhatsAppChannel>(
      `${BASE}/channels/${id}/refresh`,
    );
    return response.data;
  },

  // ── Send ──────────────────────────────────────────────────────

  async sendFormLink(
    payload: SendFormLinkPayload,
  ): Promise<{ id: string }> {
    const response = await apiClient.post<{ id: string }>(
      `${BASE}/send-link`,
      payload,
    );
    return response.data;
  },

  // ── Message Log ───────────────────────────────────────────────

  async getMessageLog(
    filters?: MessageLogFilters,
  ): Promise<MessageLogEntry[]> {
    const params = new URLSearchParams();
    if (filters?.channelId) params.set('channelId', filters.channelId);
    if (filters?.formId) params.set('formId', filters.formId);
    if (filters?.status) params.set('status', filters.status);
    if (filters?.limit) params.set('limit', String(filters.limit));
    if (filters?.offset) params.set('offset', String(filters.offset));

    const query = params.toString();
    const url = query ? `${BASE}/messages?${query}` : `${BASE}/messages`;

    const response = await apiClient.get<MessageLogEntry[]>(url);
    return response.data;
  },
};
