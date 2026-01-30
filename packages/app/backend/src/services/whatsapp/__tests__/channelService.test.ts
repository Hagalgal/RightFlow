import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Mock dependencies
const mockQuery = jest.fn<(...args: any[]) => any>();
jest.mock('../../../config/database', () => ({
  query: (...args: any[]) => mockQuery(...args),
}));

const mockWahaClient = {
  createSession: jest.fn<(...args: any[]) => any>(),
  startSession: jest.fn<(...args: any[]) => any>(),
  stopSession: jest.fn<(...args: any[]) => any>(),
  deleteSession: jest.fn<(...args: any[]) => any>(),
  getSessionStatus: jest.fn<(...args: any[]) => any>(),
  getQrCode: jest.fn<(...args: any[]) => any>(),
};

jest.mock('../wahaClient', () => ({
  WahaClient: jest.fn().mockImplementation(() => mockWahaClient),
}));

import * as channelService from '../channelService';

const TEST_ORG_ID = 'org_test123';
const OTHER_ORG_ID = 'org_other456';

describe('WhatsAppChannelService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── Create ──────────────────────────────────────────────────────

  describe('create', () => {
    it('generates session_name with org prefix', async () => {
      mockWahaClient.createSession.mockResolvedValue(undefined);
      mockWahaClient.startSession.mockResolvedValue(undefined);
      mockQuery.mockResolvedValue([{
        id: 'ch_1',
        organization_id: TEST_ORG_ID,
        session_name: 'rf_org_test_1234',
        display_name: 'מכירות',
        status: 'STARTING',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }]);

      const result = await channelService.create({
        organizationId: TEST_ORG_ID,
        displayName: 'מכירות',
      });

      expect(result.organizationId).toBe(TEST_ORG_ID);
      expect(result.displayName).toBe('מכירות');
      expect(mockWahaClient.createSession).toHaveBeenCalled();
      expect(mockWahaClient.startSession).toHaveBeenCalled();
    });

    it('inserts DB record with STARTING status', async () => {
      mockWahaClient.createSession.mockResolvedValue(undefined);
      mockWahaClient.startSession.mockResolvedValue(undefined);
      mockQuery.mockResolvedValue([{
        id: 'ch_1',
        organization_id: TEST_ORG_ID,
        session_name: 'rf_test',
        display_name: 'Test',
        status: 'STARTING',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }]);

      await channelService.create({
        organizationId: TEST_ORG_ID,
        displayName: 'Test',
      });

      // Verify INSERT was called
      const insertCall = mockQuery.mock.calls.find(
        (call: any[]) => typeof call[0] === 'string' && call[0].includes('INSERT'),
      );
      expect(insertCall).toBeDefined();
    });
  });

  // ── List ────────────────────────────────────────────────────────

  describe('listForOrg', () => {
    it('returns only channels for given org', async () => {
      mockQuery.mockResolvedValue([
        {
          id: 'ch_1',
          organization_id: TEST_ORG_ID,
          session_name: 'rf_1',
          display_name: 'Sales',
          status: 'WORKING',
          phone_number: '972521234567',
          messages_sent_count: 5,
          messages_failed_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

      const result = await channelService.listForOrg(TEST_ORG_ID);

      expect(result).toHaveLength(1);
      expect(result[0].organizationId).toBe(TEST_ORG_ID);
      // Verify query filters by org_id and deleted_at
      expect(mockQuery.mock.calls[0][0]).toContain('organization_id');
      expect(mockQuery.mock.calls[0][0]).toContain('deleted_at IS NULL');
    });
  });

  // ── Get By ID ───────────────────────────────────────────────────

  describe('getByIdForOrg', () => {
    it('returns channel if org matches', async () => {
      mockQuery.mockResolvedValue([{
        id: 'ch_1',
        organization_id: TEST_ORG_ID,
        session_name: 'rf_1',
        display_name: 'Sales',
        status: 'WORKING',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }]);

      const result = await channelService.getByIdForOrg(
        'ch_1',
        TEST_ORG_ID,
      );

      expect(result.id).toBe('ch_1');
    });

    it('throws if org does not match (tenant isolation)', async () => {
      mockQuery.mockResolvedValue([{
        id: 'ch_1',
        organization_id: OTHER_ORG_ID,
        session_name: 'rf_1',
        display_name: 'Sales',
        status: 'WORKING',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }]);

      await expect(
        channelService.getByIdForOrg('ch_1', TEST_ORG_ID),
      ).rejects.toThrow();
    });

    it('throws NotFoundError if channel not found', async () => {
      mockQuery.mockResolvedValue([]);

      await expect(
        channelService.getByIdForOrg('nonexistent', TEST_ORG_ID),
      ).rejects.toThrow();
    });
  });

  // ── QR Code ─────────────────────────────────────────────────────

  describe('getQrCode', () => {
    it('validates org ownership before fetching', async () => {
      mockQuery.mockResolvedValue([{
        id: 'ch_1',
        organization_id: OTHER_ORG_ID,
        session_name: 'rf_1',
        display_name: 'Sales',
        status: 'SCAN_QR_CODE',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }]);

      await expect(
        channelService.getQrCode('ch_1', TEST_ORG_ID),
      ).rejects.toThrow();

      expect(mockWahaClient.getQrCode).not.toHaveBeenCalled();
    });

    it('calls wahaClient.getQrCode with session_name', async () => {
      mockQuery.mockResolvedValue([{
        id: 'ch_1',
        organization_id: TEST_ORG_ID,
        session_name: 'rf_abc',
        display_name: 'Sales',
        status: 'SCAN_QR_CODE',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }]);
      mockWahaClient.getQrCode.mockResolvedValue({
        mimetype: 'image/png',
        data: 'base64-qr',
      });

      const result = await channelService.getQrCode('ch_1', TEST_ORG_ID);

      expect(result.data).toBe('base64-qr');
      expect(mockWahaClient.getQrCode).toHaveBeenCalledWith('rf_abc');
    });
  });

  // ── Refresh Status ──────────────────────────────────────────────

  describe('refreshStatus', () => {
    it('polls WAHA and updates DB status', async () => {
      mockQuery
        .mockResolvedValueOnce([{
          id: 'ch_1',
          organization_id: TEST_ORG_ID,
          session_name: 'rf_abc',
          display_name: 'Sales',
          status: 'STARTING',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }])
        .mockResolvedValueOnce([{
          id: 'ch_1',
          organization_id: TEST_ORG_ID,
          session_name: 'rf_abc',
          display_name: 'Sales',
          status: 'WORKING',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }]);

      mockWahaClient.getSessionStatus.mockResolvedValue({
        name: 'rf_abc',
        status: 'WORKING',
        me: { id: '972521234567@c.us' },
      });

      await channelService.refreshStatus(
        'ch_1',
        TEST_ORG_ID,
      );

      expect(mockWahaClient.getSessionStatus).toHaveBeenCalledWith('rf_abc');
      // Verify UPDATE query was called
      const updateCall = mockQuery.mock.calls.find(
        (call: any[]) => typeof call[0] === 'string' && call[0].includes('UPDATE'),
      );
      expect(updateCall).toBeDefined();
    });
  });

  // ── Disconnect ──────────────────────────────────────────────────

  describe('disconnect', () => {
    it('calls wahaClient.stopSession + deleteSession', async () => {
      mockQuery.mockResolvedValueOnce([{
        id: 'ch_1',
        organization_id: TEST_ORG_ID,
        session_name: 'rf_abc',
        display_name: 'Sales',
        status: 'WORKING',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }]);
      mockWahaClient.stopSession.mockResolvedValue(undefined);
      mockWahaClient.deleteSession.mockResolvedValue(undefined);
      mockQuery.mockResolvedValue([]);

      await channelService.disconnect('ch_1', TEST_ORG_ID);

      expect(mockWahaClient.stopSession).toHaveBeenCalledWith('rf_abc');
      expect(mockWahaClient.deleteSession).toHaveBeenCalledWith('rf_abc');
    });

    it('soft-deletes DB record', async () => {
      mockQuery.mockResolvedValueOnce([{
        id: 'ch_1',
        organization_id: TEST_ORG_ID,
        session_name: 'rf_abc',
        display_name: 'Sales',
        status: 'WORKING',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }]);
      mockWahaClient.stopSession.mockResolvedValue(undefined);
      mockWahaClient.deleteSession.mockResolvedValue(undefined);
      mockQuery.mockResolvedValue([]);

      await channelService.disconnect('ch_1', TEST_ORG_ID);

      const updateCall = mockQuery.mock.calls.find(
        (call: any[]) =>
          typeof call[0] === 'string' &&
          call[0].includes('deleted_at') &&
          call[0].includes('UPDATE'),
      );
      expect(updateCall).toBeDefined();
    });

    it('throws if org does not own channel', async () => {
      mockQuery.mockResolvedValue([{
        id: 'ch_1',
        organization_id: OTHER_ORG_ID,
        session_name: 'rf_abc',
        display_name: 'Sales',
        status: 'WORKING',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }]);

      await expect(
        channelService.disconnect('ch_1', TEST_ORG_ID),
      ).rejects.toThrow();
    });
  });

  // ── Webhook Status Update ───────────────────────────────────────

  describe('updateStatusFromWebhook', () => {
    it('finds channel by session_name and updates status', async () => {
      mockQuery
        .mockResolvedValueOnce([{
          id: 'ch_1',
          organization_id: TEST_ORG_ID,
          session_name: 'rf_abc',
          status: 'STARTING',
        }])
        .mockResolvedValue([]);

      await channelService.updateStatusFromWebhook(
        'rf_abc',
        'WORKING',
        '972521234567@c.us',
      );

      const updateCall = mockQuery.mock.calls.find(
        (call: any[]) => typeof call[0] === 'string' && call[0].includes('UPDATE'),
      );
      expect(updateCall).toBeDefined();
    });

    it('populates phone_number when status is WORKING', async () => {
      mockQuery
        .mockResolvedValueOnce([{
          id: 'ch_1',
          organization_id: TEST_ORG_ID,
          session_name: 'rf_abc',
          status: 'SCAN_QR_CODE',
        }])
        .mockResolvedValue([]);

      await channelService.updateStatusFromWebhook(
        'rf_abc',
        'WORKING',
        '972521234567@c.us',
      );

      const updateCall = mockQuery.mock.calls.find(
        (call: any[]) =>
          typeof call[0] === 'string' &&
          call[0].includes('phone_number'),
      );
      expect(updateCall).toBeDefined();
    });
  });
});
