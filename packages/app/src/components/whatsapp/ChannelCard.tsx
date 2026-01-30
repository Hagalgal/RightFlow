import { RefreshCw, Unplug, QrCode, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/i18n';
import type { WhatsAppChannel, WhatsAppChannelStatus } from
  '@/services/whatsapp/types';

interface ChannelCardProps {
  channel: WhatsAppChannel;
  onRefresh: (id: string) => void;
  onDisconnect: (id: string) => void;
  onShowQr: (id: string) => void;
  isRefreshing?: boolean;
}

const statusConfig: Record<WhatsAppChannelStatus, {
  color: string;
  dotColor: string;
}> = {
  WORKING: {
    color: 'bg-green-100 text-green-800',
    dotColor: 'bg-green-500',
  },
  SCAN_QR_CODE: {
    color: 'bg-amber-100 text-amber-800',
    dotColor: 'bg-amber-500',
  },
  STARTING: {
    color: 'bg-blue-100 text-blue-800',
    dotColor: 'bg-blue-500',
  },
  FAILED: {
    color: 'bg-red-100 text-red-800',
    dotColor: 'bg-red-500',
  },
  STOPPED: {
    color: 'bg-gray-100 text-gray-600',
    dotColor: 'bg-gray-400',
  },
};

function getStatusLabel(
  status: WhatsAppChannelStatus,
  t: ReturnType<typeof useTranslation>,
): string {
  switch (status) {
    case 'WORKING': return t.statusWorking;
    case 'SCAN_QR_CODE': return t.statusScanQr;
    case 'STARTING': return t.statusStarting;
    case 'FAILED': return t.statusFailed;
    case 'STOPPED': return t.statusStopped;
    default: return status;
  }
}

export function ChannelCard({
  channel,
  onRefresh,
  onDisconnect,
  onShowQr,
  isRefreshing,
}: ChannelCardProps) {
  const t = useTranslation();
  const config = statusConfig[channel.status] || statusConfig.STOPPED;

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${config.dotColor}`} />
          <div>
            <h3 className="font-semibold text-lg">
              {channel.displayName}
            </h3>
            {channel.phoneNumber && (
              <div className="flex items-center gap-1 text-sm
                text-gray-500 mt-1">
                <Phone className="w-3 h-3" />
                <span dir="ltr">{channel.phoneNumber}</span>
              </div>
            )}
          </div>
        </div>

        <Badge className={config.color}>
          {getStatusLabel(channel.status, t)}
        </Badge>
      </div>

      {channel.lastError && channel.status === 'FAILED' && (
        <p className="mt-2 text-sm text-red-600 bg-red-50
          rounded p-2">
          {channel.lastError}
        </p>
      )}

      <div className="flex items-center justify-between mt-4">
        <span className="text-sm text-gray-500">
          {channel.messagesSentCount} {t.messagesSentLabel}
        </span>

        <div className="flex gap-2">
          {channel.status === 'SCAN_QR_CODE' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onShowQr(channel.id)}
            >
              <QrCode className="w-4 h-4 me-1" />
              {t.scanQrCode}
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => onRefresh(channel.id)}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 me-1
              ${isRefreshing ? 'animate-spin' : ''}`}
            />
            {t.refreshStatus}
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="text-red-600 hover:text-red-700
              hover:bg-red-50"
            onClick={() => onDisconnect(channel.id)}
          >
            <Unplug className="w-4 h-4 me-1" />
            {t.disconnectChannel}
          </Button>
        </div>
      </div>
    </div>
  );
}
