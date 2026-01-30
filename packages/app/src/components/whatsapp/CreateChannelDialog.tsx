import { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useTranslation } from '@/i18n';
import { apiClient } from '@/api/client';
import { whatsappService } from
  '@/services/whatsapp/whatsappService';

interface CreateChannelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (channelId: string) => void;
}

export function CreateChannelDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateChannelDialogProps) {
  const t = useTranslation();
  const { getToken } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!displayName.trim()) return;

    setIsCreating(true);
    setError(null);

    try {
      const token = await getToken();
      apiClient.setAuthToken(token);

      const channel = await whatsappService.createChannel(
        displayName.trim(),
      );
      setDisplayName('');
      onOpenChange(false);
      onCreated(channel.id);
    } catch (err: any) {
      setError(err.message || 'Failed to create channel');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t.connectNewWhatsapp}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="channelName">{t.channelName}</Label>
            <Input
              id="channelName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={t.channelNamePlaceholder}
              disabled={isCreating}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreate();
              }}
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isCreating}
          >
            {t.cancel}
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!displayName.trim() || isCreating}
          >
            {isCreating && (
              <Loader2 className="w-4 h-4 me-2 animate-spin" />
            )}
            {t.connectNewWhatsapp}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
