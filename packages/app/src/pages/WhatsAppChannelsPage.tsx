import { useState, useEffect, useCallback } from 'react';
import { Plus, MessageSquare, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useTranslation, useDirection } from '@/i18n';
import { apiClient } from '@/api/client';
import { whatsappService } from
  '@/services/whatsapp/whatsappService';
import { ChannelCard } from
  '@/components/whatsapp/ChannelCard';
import { QrCodeDialog } from
  '@/components/whatsapp/QrCodeDialog';
import { CreateChannelDialog } from
  '@/components/whatsapp/CreateChannelDialog';
import type { WhatsAppChannel } from
  '@/services/whatsapp/types';

export default function WhatsAppChannelsPage() {
  const t = useTranslation();
  const dir = useDirection();
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const [channels, setChannels] = useState<WhatsAppChannel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshingId, setRefreshingId] = useState<string | null>(
    null,
  );

  // Dialog states
  const [showCreate, setShowCreate] = useState(false);
  const [qrChannelId, setQrChannelId] = useState<string | null>(
    null,
  );

  const loadChannels = useCallback(async () => {
    try {
      // Set auth token before API call
      const token = await getToken();
      apiClient.setAuthToken(token);

      const list = await whatsappService.listChannels();
      setChannels(list);
    } catch {
      // silently fail
    } finally {
      setIsLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    loadChannels();
  }, [loadChannels]);

  const handleRefresh = async (id: string) => {
    setRefreshingId(id);
    try {
      const token = await getToken();
      apiClient.setAuthToken(token);

      const updated = await whatsappService.refreshStatus(id);
      setChannels((prev) =>
        prev.map((ch) => (ch.id === id ? updated : ch)),
      );
    } catch {
      // silently fail
    } finally {
      setRefreshingId(null);
    }
  };

  const handleDisconnect = async (id: string) => {
    const confirmed = window.confirm(t.disconnectConfirm);
    if (!confirmed) return;

    try {
      const token = await getToken();
      apiClient.setAuthToken(token);

      await whatsappService.deleteChannel(id);
      setChannels((prev) => prev.filter((ch) => ch.id !== id));
    } catch {
      // silently fail
    }
  };

  const handleCreated = (channelId: string) => {
    // Reload channels and show QR dialog
    loadChannels();
    setQrChannelId(channelId);
  };

  const handleConnected = () => {
    loadChannels();
  };

  return (
    <div className="max-w-3xl mx-auto p-6" dir={dir}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/organization')}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowRight className="w-4 h-4 me-2" />
            {t.backToSettings}
          </Button>
          <MessageSquare className="w-6 h-6 text-green-600" />
          <h1 className="text-2xl font-bold">
            {t.whatsappChannels}
          </h1>
        </div>

        <Button onClick={() => setShowCreate(true)}>
          <Plus className="w-4 h-4 me-2" />
          {t.connectNewWhatsapp}
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : channels.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <MessageSquare className="w-12 h-12 mx-auto
            text-gray-300 mb-3" />
          <p className="text-gray-500">
            {t.noChannelsConnected}
          </p>
          <Button
            className="mt-4"
            onClick={() => setShowCreate(true)}
          >
            <Plus className="w-4 h-4 me-2" />
            {t.connectNewWhatsapp}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {channels.map((channel) => (
            <ChannelCard
              key={channel.id}
              channel={channel}
              onRefresh={handleRefresh}
              onDisconnect={handleDisconnect}
              onShowQr={setQrChannelId}
              isRefreshing={refreshingId === channel.id}
            />
          ))}
        </div>
      )}

      {/* Dialogs */}
      <CreateChannelDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        onCreated={handleCreated}
      />

      <QrCodeDialog
        channelId={qrChannelId}
        open={!!qrChannelId}
        onOpenChange={(open) => {
          if (!open) setQrChannelId(null);
        }}
        onConnected={handleConnected}
      />
    </div>
  );
}
