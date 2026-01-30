-- ============================================================================
-- Migration: 005_whatsapp_channels_schema.sql
-- Description: WhatsApp Channels for WAHA Integration
-- Author: RightFlow Team
-- Date: 2026-01-29
-- Dependencies: 001_initial_schema.sql
-- ============================================================================

-- ============================================================================
-- 1. WHATSAPP CHANNELS
-- ============================================================================

/**
 * WhatsApp channels table
 * Each channel represents a WAHA session (WhatsApp phone number)
 * scoped to an organization for multi-tenant isolation.
 */
CREATE TABLE whatsapp_channels (
  -- Identity
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id VARCHAR(255) NOT NULL,

  -- WAHA Session
  session_name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  phone_number TEXT,

  -- Status (mirrors WAHA session states)
  status VARCHAR(50) NOT NULL DEFAULT 'STOPPED',

  -- Health & Monitoring
  last_health_check_at TIMESTAMPTZ,
  last_error TEXT,
  messages_sent_count INTEGER DEFAULT 0,
  messages_failed_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT chk_wa_channel_status CHECK (
    status IN ('STOPPED', 'STARTING', 'SCAN_QR_CODE', 'WORKING', 'FAILED')
  )
);

-- Unique session name (active channels only)
CREATE UNIQUE INDEX idx_wa_channels_session_active
ON whatsapp_channels(session_name)
WHERE deleted_at IS NULL;

-- Organization lookup
CREATE INDEX idx_wa_channels_org
ON whatsapp_channels(organization_id)
WHERE deleted_at IS NULL;

-- Status filtering
CREATE INDEX idx_wa_channels_status
ON whatsapp_channels(status)
WHERE deleted_at IS NULL;

-- Trigger for updated_at
CREATE TRIGGER update_whatsapp_channels_updated_at
BEFORE UPDATE ON whatsapp_channels
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 2. WHATSAPP MESSAGE LOG (Audit Trail)
-- ============================================================================

/**
 * WhatsApp message log table
 * Audit trail of all messages sent via WhatsApp.
 * Stores metadata only (no message content) for privacy.
 */
CREATE TABLE whatsapp_message_log (
  -- Identity
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id VARCHAR(255) NOT NULL,
  channel_id UUID NOT NULL REFERENCES whatsapp_channels(id) ON DELETE CASCADE,

  -- Message Context
  form_id UUID,
  submission_id UUID,

  -- Delivery Info
  recipient_phone TEXT NOT NULL,
  message_type VARCHAR(50) NOT NULL DEFAULT 'link',
  content_ref TEXT,

  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  waha_message_id TEXT,
  error_message TEXT,
  attempts INTEGER DEFAULT 0,

  -- Timestamps
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT chk_wa_msg_type CHECK (message_type IN ('link', 'pdf')),
  CONSTRAINT chk_wa_msg_status CHECK (
    status IN ('pending', 'sent', 'delivered', 'failed')
  )
);

-- Indexes for whatsapp_message_log
CREATE INDEX idx_wa_msg_log_org
ON whatsapp_message_log(organization_id);

CREATE INDEX idx_wa_msg_log_channel
ON whatsapp_message_log(channel_id);

CREATE INDEX idx_wa_msg_log_form
ON whatsapp_message_log(form_id)
WHERE form_id IS NOT NULL;

CREATE INDEX idx_wa_msg_log_submission
ON whatsapp_message_log(submission_id)
WHERE submission_id IS NOT NULL;

CREATE INDEX idx_wa_msg_log_status
ON whatsapp_message_log(status)
WHERE status IN ('pending', 'sent');

CREATE INDEX idx_wa_msg_log_created
ON whatsapp_message_log(created_at DESC);

-- ============================================================================
-- 3. VERIFICATION
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'whatsapp_channels'
  ) THEN
    RAISE EXCEPTION 'Table whatsapp_channels was not created';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'whatsapp_message_log'
  ) THEN
    RAISE EXCEPTION 'Table whatsapp_message_log was not created';
  END IF;

  RAISE NOTICE 'Migration 005: WhatsApp channels schema created successfully';
END $$;

-- ============================================================================
-- 4. ROLLBACK (if needed)
-- ============================================================================

-- To rollback this migration:
-- DROP TABLE IF EXISTS whatsapp_message_log CASCADE;
-- DROP TABLE IF EXISTS whatsapp_channels CASCADE;
