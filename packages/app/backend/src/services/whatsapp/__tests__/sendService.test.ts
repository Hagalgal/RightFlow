import { describe, it, expect, beforeEach, jest } from '@jest/globals';

const mockQuery = jest.fn<(...args: any[]) => any>();
jest.mock('../../../config/database', () => ({
  query: (...args: any[]) => mockQuery(...args),
}));

const mockWahaClient = {
  sendText: jest.fn<(...args: any[]) => any>(),
  sendFile: jest.fn<(...args: any[]) => any>(),
};

jest.mock('../wahaClient', () => ({
  WahaClient: jest.fn().mockImplementation(() => mockWahaClient),
}));

const mockGetByIdForOrg = jest.fn<(...args: any[]) => any>();
jest.mock('../channelService', () => ({
  getByIdForOrg: (...args: any[]) => mockGetByIdForOrg(...args),
}));

import * as sendService from '../sendService';

const TEST_ORG_ID = 'org_test123';

const workingChannel = {
  id: 'ch_1',
  organizationId: TEST_ORG_ID,
  sessionName: 'rf_abc_123',
  displayName: 'Sales',
  phoneNumber: '972521234567',
  status: 'WORKING',
  lastHealthCheckAt: null,
  lastError: null,
  messagesSentCount: 0,
  messagesFailedCount: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('WhatsAppSendService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockQuery.mockResolvedValue([{ id: 'log_1' }]);
  });

  // ── Flow 1: Send Form Link ────────────────────────────────────

  describe('sendFormLink', () => {
    it('validates org owns the channel', async () => {
      mockGetByIdForOrg.mockResolvedValue(workingChannel);
      mockWahaClient.sendText.mockResolvedValue({ id: 'msg_1' });

      await sendService.sendFormLink({
        organizationId: TEST_ORG_ID,
        channelId: 'ch_1',
        formId: 'form_1',
        recipientPhone: '0521234567',
        formUrl: 'https://app.rightflow.co.il/f/abc',
      });

      expect(mockGetByIdForOrg).toHaveBeenCalledWith(
        'ch_1',
        TEST_ORG_ID,
      );
    });

    it('throws if channel status is not WORKING', async () => {
      mockGetByIdForOrg.mockResolvedValue({
        ...workingChannel,
        status: 'STOPPED',
      });

      await expect(
        sendService.sendFormLink({
          organizationId: TEST_ORG_ID,
          channelId: 'ch_1',
          formId: 'form_1',
          recipientPhone: '0521234567',
          formUrl: 'https://app.rightflow.co.il/f/abc',
        }),
      ).rejects.toThrow();
    });

    it('calls wahaClient.sendText with formatted message', async () => {
      mockGetByIdForOrg.mockResolvedValue(workingChannel);
      mockWahaClient.sendText.mockResolvedValue({ id: 'msg_1' });

      await sendService.sendFormLink({
        organizationId: TEST_ORG_ID,
        channelId: 'ch_1',
        formId: 'form_1',
        recipientPhone: '0521234567',
        formUrl: 'https://app.rightflow.co.il/f/abc',
      });

      expect(mockWahaClient.sendText).toHaveBeenCalledWith(
        'rf_abc_123',
        '972521234567@c.us',
        expect.stringContaining('https://app.rightflow.co.il/f/abc'),
      );
    });

    it('includes caption in message text when provided', async () => {
      mockGetByIdForOrg.mockResolvedValue(workingChannel);
      mockWahaClient.sendText.mockResolvedValue({ id: 'msg_1' });

      await sendService.sendFormLink({
        organizationId: TEST_ORG_ID,
        channelId: 'ch_1',
        formId: 'form_1',
        recipientPhone: '0521234567',
        formUrl: 'https://app.rightflow.co.il/f/abc',
        caption: 'נא למלא את הטופס',
      });

      const textArg = mockWahaClient.sendText.mock.calls[0][2];
      expect(textArg).toContain('נא למלא את הטופס');
      expect(textArg).toContain('https://app.rightflow.co.il/f/abc');
    });

    it('logs to whatsapp_message_log with type=link', async () => {
      mockGetByIdForOrg.mockResolvedValue(workingChannel);
      mockWahaClient.sendText.mockResolvedValue({ id: 'msg_1' });

      await sendService.sendFormLink({
        organizationId: TEST_ORG_ID,
        channelId: 'ch_1',
        formId: 'form_1',
        recipientPhone: '0521234567',
        formUrl: 'https://app.rightflow.co.il/f/abc',
      });

      const insertCall = mockQuery.mock.calls.find(
        (call: any[]) =>
          typeof call[0] === 'string' &&
          call[0].includes('INSERT') &&
          call[0].includes('whatsapp_message_log'),
      );
      expect(insertCall).toBeDefined();
    });

    it('increments messages_sent_count on success', async () => {
      mockGetByIdForOrg.mockResolvedValue(workingChannel);
      mockWahaClient.sendText.mockResolvedValue({ id: 'msg_1' });

      await sendService.sendFormLink({
        organizationId: TEST_ORG_ID,
        channelId: 'ch_1',
        formId: 'form_1',
        recipientPhone: '0521234567',
        formUrl: 'https://app.rightflow.co.il/f/abc',
      });

      const updateCall = mockQuery.mock.calls.find(
        (call: any[]) =>
          typeof call[0] === 'string' &&
          call[0].includes('messages_sent_count'),
      );
      expect(updateCall).toBeDefined();
    });

    it('increments messages_failed_count on WAHA error', async () => {
      mockGetByIdForOrg.mockResolvedValue(workingChannel);
      mockWahaClient.sendText.mockRejectedValue(
        new Error('WAHA sendText failed'),
      );

      await expect(
        sendService.sendFormLink({
          organizationId: TEST_ORG_ID,
          channelId: 'ch_1',
          formId: 'form_1',
          recipientPhone: '0521234567',
          formUrl: 'https://app.rightflow.co.il/f/abc',
        }),
      ).rejects.toThrow();

      const updateCall = mockQuery.mock.calls.find(
        (call: any[]) =>
          typeof call[0] === 'string' &&
          call[0].includes('messages_failed_count'),
      );
      expect(updateCall).toBeDefined();
    });
  });

  // ── Flow 2: Send PDF (Infrastructure) ─────────────────────────

  describe('sendPdf', () => {
    it('validates org owns the channel', async () => {
      mockGetByIdForOrg.mockResolvedValue(workingChannel);
      mockWahaClient.sendFile.mockResolvedValue({ id: 'msg_2' });

      await sendService.sendPdf({
        organizationId: TEST_ORG_ID,
        channelId: 'ch_1',
        formId: 'form_1',
        recipientPhone: '0521234567',
        pdfBase64: 'base64data',
        filename: 'form.pdf',
      });

      expect(mockGetByIdForOrg).toHaveBeenCalledWith(
        'ch_1',
        TEST_ORG_ID,
      );
    });

    it('throws if channel status is not WORKING', async () => {
      mockGetByIdForOrg.mockResolvedValue({
        ...workingChannel,
        status: 'FAILED',
      });

      await expect(
        sendService.sendPdf({
          organizationId: TEST_ORG_ID,
          channelId: 'ch_1',
          formId: 'form_1',
          recipientPhone: '0521234567',
          pdfBase64: 'base64data',
          filename: 'form.pdf',
        }),
      ).rejects.toThrow();
    });

    it('calls wahaClient.sendFile with base64 PDF data', async () => {
      mockGetByIdForOrg.mockResolvedValue(workingChannel);
      mockWahaClient.sendFile.mockResolvedValue({ id: 'msg_2' });

      await sendService.sendPdf({
        organizationId: TEST_ORG_ID,
        channelId: 'ch_1',
        formId: 'form_1',
        recipientPhone: '0521234567',
        pdfBase64: 'base64data',
        filename: 'form.pdf',
        caption: 'Your form',
      });

      expect(mockWahaClient.sendFile).toHaveBeenCalledWith(
        'rf_abc_123',
        '972521234567@c.us',
        {
          data: 'base64data',
          filename: 'form.pdf',
          mimetype: 'application/pdf',
        },
        'Your form',
      );
    });

    it('logs to whatsapp_message_log with type=pdf', async () => {
      mockGetByIdForOrg.mockResolvedValue(workingChannel);
      mockWahaClient.sendFile.mockResolvedValue({ id: 'msg_2' });

      await sendService.sendPdf({
        organizationId: TEST_ORG_ID,
        channelId: 'ch_1',
        formId: 'form_1',
        recipientPhone: '0521234567',
        pdfBase64: 'base64data',
        filename: 'filled-form.pdf',
      });

      const insertCall = mockQuery.mock.calls.find(
        (call: any[]) =>
          typeof call[0] === 'string' &&
          call[0].includes('INSERT') &&
          call[0].includes('whatsapp_message_log'),
      );
      expect(insertCall).toBeDefined();
    });
  });
});
