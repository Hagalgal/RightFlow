import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import axios from 'axios';
import { WahaClient } from '../wahaClient';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('WahaClient', () => {
  let client: WahaClient;
  let mockAxiosInstance: any;

  beforeEach(() => {
    mockAxiosInstance = {
      post: jest.fn(),
      get: jest.fn(),
      delete: jest.fn(),
    };
    mockedAxios.create.mockReturnValue(mockAxiosInstance as any);
    client = new WahaClient('https://waha.test', 'test-api-key');
  });

  // ── Session Management ──────────────────────────────────────────

  describe('createSession', () => {
    it('sends POST /api/sessions with session name', async () => {
      mockAxiosInstance.post.mockResolvedValue({ data: { name: 'rf_abc_123' } });

      await client.createSession('rf_abc_123');

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/api/sessions',
        { name: 'rf_abc_123' },
      );
    });
  });

  describe('startSession', () => {
    it('sends POST /api/sessions/{name}/start', async () => {
      mockAxiosInstance.post.mockResolvedValue({ data: {} });

      await client.startSession('rf_abc_123');

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/api/sessions/rf_abc_123/start',
      );
    });
  });

  describe('stopSession', () => {
    it('sends POST /api/sessions/{name}/stop', async () => {
      mockAxiosInstance.post.mockResolvedValue({ data: {} });

      await client.stopSession('rf_abc_123');

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/api/sessions/rf_abc_123/stop',
      );
    });
  });

  describe('deleteSession', () => {
    it('sends DELETE /api/sessions/{name}', async () => {
      mockAxiosInstance.delete.mockResolvedValue({ data: {} });

      await client.deleteSession('rf_abc_123');

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith(
        '/api/sessions/rf_abc_123',
      );
    });
  });

  describe('getSessionStatus', () => {
    it('returns parsed session status', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        data: {
          name: 'rf_abc_123',
          status: 'WORKING',
          me: { id: '972521234567@c.us' },
        },
      });

      const result = await client.getSessionStatus('rf_abc_123');

      expect(result.status).toBe('WORKING');
      expect(result.me?.id).toBe('972521234567@c.us');
      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/api/sessions/rf_abc_123',
      );
    });
  });

  describe('getQrCode', () => {
    it('returns base64 QR image', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        data: { mimetype: 'image/png', data: 'base64-qr-data' },
      });

      const result = await client.getQrCode('rf_abc_123');

      expect(result.data).toBe('base64-qr-data');
      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/api/rf_abc_123/auth/qr',
      );
    });
  });

  // ── Messaging ───────────────────────────────────────────────────

  describe('sendText', () => {
    it('sends POST /api/sendText with session, chatId, text', async () => {
      mockAxiosInstance.post.mockResolvedValue({
        data: { id: 'msg_123' },
      });

      const result = await client.sendText(
        'rf_abc_123',
        '972521234567@c.us',
        'Hello, fill this form: https://rightflow.co.il/f/abc',
      );

      expect(result.id).toBe('msg_123');
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/api/sendText',
        {
          session: 'rf_abc_123',
          chatId: '972521234567@c.us',
          text: 'Hello, fill this form: https://rightflow.co.il/f/abc',
        },
      );
    });
  });

  describe('sendFile', () => {
    it('sends POST /api/sendFile with file payload', async () => {
      mockAxiosInstance.post.mockResolvedValue({
        data: { id: 'msg_456' },
      });

      const result = await client.sendFile(
        'rf_abc_123',
        '972521234567@c.us',
        {
          data: 'base64-pdf-content',
          filename: 'form.pdf',
          mimetype: 'application/pdf',
        },
        'Your filled form',
      );

      expect(result.id).toBe('msg_456');
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/api/sendFile',
        {
          session: 'rf_abc_123',
          chatId: '972521234567@c.us',
          file: {
            data: 'base64-pdf-content',
            filename: 'form.pdf',
            mimetype: 'application/pdf',
          },
          caption: 'Your filled form',
        },
      );
    });

    it('sends without caption when not provided', async () => {
      mockAxiosInstance.post.mockResolvedValue({ data: { id: 'msg_789' } });

      await client.sendFile(
        'rf_abc_123',
        '972521234567@c.us',
        { data: 'pdf-data', filename: 'form.pdf', mimetype: 'application/pdf' },
      );

      const callArgs = mockAxiosInstance.post.mock.calls[0][1];
      expect(callArgs.caption).toBeUndefined();
    });
  });

  // ── Error Handling ──────────────────────────────────────────────

  describe('error handling', () => {
    it('throws on network error', async () => {
      mockAxiosInstance.post.mockRejectedValue(new Error('ECONNREFUSED'));

      await expect(
        client.createSession('rf_test'),
      ).rejects.toThrow();
    });

    it('throws on non-2xx response', async () => {
      const axiosError = {
        response: { status: 422, data: { message: 'Session already exists' } },
        isAxiosError: true,
      };
      mockAxiosInstance.post.mockRejectedValue(axiosError);

      await expect(
        client.createSession('rf_test'),
      ).rejects.toThrow();
    });
  });

  // ── Health ──────────────────────────────────────────────────────

  describe('checkHealth', () => {
    it('returns true on healthy instance', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: { status: 'ok' } });

      const result = await client.checkHealth();

      expect(result).toBe(true);
    });

    it('returns false on error', async () => {
      mockAxiosInstance.get.mockRejectedValue(new Error('timeout'));

      const result = await client.checkHealth();

      expect(result).toBe(false);
    });
  });
});
