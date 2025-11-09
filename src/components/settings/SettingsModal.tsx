import { useState } from 'react';
import { X, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useSettingsStore } from '@/store/settingsStore';
import { sanitizeUserInput } from '@/utils/inputSanitization';
import { cn } from '@/utils/cn';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsTab = 'text' | 'checkbox' | 'radio' | 'dropdown';

export const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('text');
  const {
    settings,
    updateTextFieldSettings,
    updateCheckboxFieldSettings,
    updateRadioFieldSettings,
    updateDropdownFieldSettings,
    resetSettings,
  } = useSettingsStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-background rounded-lg shadow-xl w-[600px] max-h-[80vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">הגדרות ברירת מחדל לשדות</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            className={cn(
              'flex-1 px-4 py-3 text-sm font-medium transition-colors',
              activeTab === 'text'
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted'
            )}
            onClick={() => setActiveTab('text')}
          >
            שדה טקסט
          </button>
          <button
            className={cn(
              'flex-1 px-4 py-3 text-sm font-medium transition-colors',
              activeTab === 'checkbox'
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted'
            )}
            onClick={() => setActiveTab('checkbox')}
          >
            תיבת סימון
          </button>
          <button
            className={cn(
              'flex-1 px-4 py-3 text-sm font-medium transition-colors',
              activeTab === 'radio'
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted'
            )}
            onClick={() => setActiveTab('radio')}
          >
            כפתורי רדיו
          </button>
          <button
            className={cn(
              'flex-1 px-4 py-3 text-sm font-medium transition-colors',
              activeTab === 'dropdown'
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted'
            )}
            onClick={() => setActiveTab('dropdown')}
          >
            רשימה נפתחת
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'text' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">הגדרות שדה טקסט</h3>

              {/* Font Selection */}
              <div className="space-y-2">
                <Label htmlFor="text-font">גופן ברירת מחדל</Label>
                <Select
                  id="text-font"
                  value={settings.textField.font}
                  onChange={(e) => updateTextFieldSettings({ font: e.target.value })}
                >
                  <option value="NotoSansHebrew">Noto Sans Hebrew (עברית)</option>
                  <option value="Arial">Arial</option>
                </Select>
              </div>

              {/* Font Size */}
              <div className="space-y-2">
                <Label htmlFor="text-font-size">גודל גופן (pt)</Label>
                <Input
                  id="text-font-size"
                  type="number"
                  min="8"
                  max="24"
                  value={settings.textField.fontSize}
                  onChange={(e) => {
                    const sanitized = sanitizeUserInput(e.target.value);
                    const value = parseInt(sanitized) || 12;
                    updateTextFieldSettings({ fontSize: value });
                  }}
                  dir="ltr"
                  className="text-left"
                />
              </div>

              {/* Text Direction */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="text-direction">כיוון טקסט RTL (מימין לשמאל)</Label>
                  <p className="text-xs text-muted-foreground">
                    מופעל: עברית | כבוי: אנגלית
                  </p>
                </div>
                <Switch
                  id="text-direction"
                  checked={settings.textField.direction === 'rtl'}
                  onCheckedChange={(checked) =>
                    updateTextFieldSettings({ direction: checked ? 'rtl' : 'ltr' })
                  }
                />
              </div>
            </div>
          )}

          {activeTab === 'checkbox' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">הגדרות תיבת סימון</h3>

              {/* Checkbox Style */}
              <div className="space-y-2">
                <Label htmlFor="checkbox-style">סוג סימון</Label>
                <Select
                  id="checkbox-style"
                  value={settings.checkboxField.style}
                  onChange={(e) =>
                    updateCheckboxFieldSettings({ style: e.target.value as 'x' | 'check' })
                  }
                >
                  <option value="check">סימון V (✓)</option>
                  <option value="x">סימון X (✗)</option>
                </Select>
                <p className="text-xs text-muted-foreground">
                  קובע את סגנון הסימון שיופיע בתיבת הסימון
                </p>
              </div>
            </div>
          )}

          {activeTab === 'radio' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">הגדרות כפתורי רדיו</h3>

              {/* Orientation */}
              <div className="space-y-2">
                <Label htmlFor="radio-orientation">סידור כפתורים</Label>
                <Select
                  id="radio-orientation"
                  value={settings.radioField.orientation}
                  onChange={(e) =>
                    updateRadioFieldSettings({
                      orientation: e.target.value as 'vertical' | 'horizontal',
                    })
                  }
                >
                  <option value="vertical">אנכי (אחד מתחת לשני)</option>
                  <option value="horizontal">אופקי (אחד ליד השני)</option>
                </Select>
              </div>

              {/* Default Button Count */}
              <div className="space-y-2">
                <Label htmlFor="radio-count">מספר כפתורים ברירת מחדל</Label>
                <Input
                  id="radio-count"
                  type="number"
                  min="2"
                  max="10"
                  value={settings.radioField.defaultButtonCount}
                  onChange={(e) => {
                    const sanitized = sanitizeUserInput(e.target.value);
                    const value = parseInt(sanitized) || 3;
                    updateRadioFieldSettings({ defaultButtonCount: value });
                  }}
                  dir="ltr"
                  className="text-left"
                />
                <p className="text-xs text-muted-foreground">
                  מספר הכפתורים שייווצרו בקבוצה חדשה (2-10)
                </p>
              </div>

              {/* Spacing */}
              <div className="space-y-2">
                <Label htmlFor="radio-spacing">מרווח בין כפתורים (pt)</Label>
                <Input
                  id="radio-spacing"
                  type="number"
                  min="10"
                  max="100"
                  value={settings.radioField.spacing}
                  onChange={(e) => {
                    const sanitized = sanitizeUserInput(e.target.value);
                    const value = parseInt(sanitized) || 30;
                    updateRadioFieldSettings({ spacing: value });
                  }}
                  dir="ltr"
                  className="text-left"
                />
                <p className="text-xs text-muted-foreground">
                  מרווח אנכי/אופקי בין כפתורים (10-100)
                </p>
              </div>
            </div>
          )}

          {activeTab === 'dropdown' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">הגדרות רשימה נפתחת</h3>

              {/* Font Selection */}
              <div className="space-y-2">
                <Label htmlFor="dropdown-font">גופן ברירת מחדל</Label>
                <Select
                  id="dropdown-font"
                  value={settings.dropdownField.font}
                  onChange={(e) => updateDropdownFieldSettings({ font: e.target.value })}
                >
                  <option value="NotoSansHebrew">Noto Sans Hebrew (עברית)</option>
                  <option value="Arial">Arial</option>
                </Select>
              </div>

              {/* Text Direction */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="dropdown-direction">כיוון טקסט RTL (מימין לשמאל)</Label>
                  <p className="text-xs text-muted-foreground">
                    מופעל: עברית | כבוי: אנגלית
                  </p>
                </div>
                <Switch
                  id="dropdown-direction"
                  checked={settings.dropdownField.direction === 'rtl'}
                  onCheckedChange={(checked) =>
                    updateDropdownFieldSettings({ direction: checked ? 'rtl' : 'ltr' })
                  }
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t">
          <Button variant="outline" onClick={resetSettings}>
            <RotateCcw className="w-4 h-4 ml-2" />
            איפוס להגדרות ברירת מחדל
          </Button>
          <Button onClick={onClose}>סגור</Button>
        </div>
      </div>
    </div>
  );
};
