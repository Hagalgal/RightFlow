import { useEffect, useRef } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { FieldDefinition } from '@/types/fields';
import { cn } from '@/utils/cn';
import { sanitizeUserInput, validateFieldName, sanitizeFontSize } from '@/utils/inputSanitization';

interface FieldPropertiesPanelProps {
  field: FieldDefinition;
  onUpdate: (updates: Partial<FieldDefinition>) => void;
  onClose: () => void;
}

export const FieldPropertiesPanel = ({
  field,
  onUpdate,
  onClose,
}: FieldPropertiesPanelProps) => {
  const labelInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus label input when panel opens for a new field (fixes bug e)
  useEffect(() => {
    // Check if this is a newly created field (name matches pattern field_timestamp)
    const isNewField = field.name.startsWith('field_') && !field.label;

    if (isNewField && labelInputRef.current) {
      // Small delay to ensure the panel is fully rendered
      setTimeout(() => {
        labelInputRef.current?.focus();
        labelInputRef.current?.select(); // Select any existing text
      }, 100);
    }
  }, [field.id, field.name, field.label]); // Run when field changes
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const validation = validateFieldName(e.target.value);
    if (validation.isValid) {
      onUpdate({ name: validation.sanitized });
    } else {
      // Show error but don't update (could add toast notification here)
      console.warn('Invalid field name:', validation.error);
    }
  };

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizeUserInput(e.target.value);
    onUpdate({ label: sanitized });
  };

  const handleDefaultValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizeUserInput(e.target.value);
    onUpdate({ defaultValue: sanitized });
  };

  const handleRequiredToggle = (checked: boolean) => {
    onUpdate({ required: checked });
  };

  const handleDirectionToggle = (checked: boolean) => {
    onUpdate({ direction: checked ? 'rtl' : 'ltr' });
  };

  const handleFontChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdate({ font: e.target.value });
  };

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizeFontSize(e.target.value);
    onUpdate({ fontSize: sanitized });
  };

  return (
    <div
      className={cn(
        'fixed right-4 top-20 w-80 bg-background border border-border rounded-lg shadow-lg p-4 z-[2000]',
        'animate-in slide-in-from-right duration-200',
      )}
      dir="rtl"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">
          {field.type === 'text' && 'מאפייני שדה טקסט'}
          {field.type === 'checkbox' && 'מאפייני תיבת סימון'}
          {field.type === 'radio' && 'מאפייני כפתור רדיו'}
          {field.type === 'dropdown' && 'מאפייני רשימה נפתחת'}
        </h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-6 w-6"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Field Properties */}
      <div className="space-y-4">
        {/* Field Name */}
        <div className="space-y-2">
          <Label htmlFor="field-name">שם שדה (באנגלית)</Label>
          <Input
            id="field-name"
            value={field.name}
            onChange={handleNameChange}
            placeholder="field_name"
            dir="ltr"
            className="text-left"
          />
          <p className="text-xs text-muted-foreground">
            שם ייחודי לשדה (רק אותיות אנגליות, מספרים וקו תחתון)
          </p>
        </div>

        {/* Field Label */}
        <div className="space-y-2">
          <Label htmlFor="field-label">תווית (כותרת)</Label>
          <Input
            ref={labelInputRef}
            id="field-label"
            value={field.label || ''}
            onChange={handleLabelChange}
            placeholder="תווית השדה"
            dir="rtl"
          />
          <p className="text-xs text-muted-foreground">
            טקסט שיוצג ליד השדה
          </p>
        </div>

        {/* Default Value (text fields only) */}
        {field.type === 'text' && (
          <div className="space-y-2">
            <Label htmlFor="field-default">ערך ברירת מחדל</Label>
            <Input
              id="field-default"
              value={field.defaultValue || ''}
              onChange={handleDefaultValueChange}
              placeholder="טקסט ברירת מחדל"
              dir={field.direction}
            />
            <p className="text-xs text-muted-foreground">
              הטקסט שיופיע בשדה כברירת מחדל
            </p>
          </div>
        )}

        {/* Radio Group Options (radio fields only) */}
        {field.type === 'radio' && (
          <>
            {/* Radio Orientation */}
            <div className="space-y-2">
              <Label htmlFor="radio-orientation">כיוון סידור כפתורים</Label>
              <Select
                id="radio-orientation"
                value={field.orientation || 'vertical'}
                onChange={(e) => onUpdate({ orientation: e.target.value as 'vertical' | 'horizontal' })}
              >
                <option value="vertical">אנכי (↓)</option>
                <option value="horizontal">אופקי (→)</option>
              </Select>
              <p className="text-xs text-muted-foreground">
                אנכי - כפתורים מסודרים למטה | אופקי - כפתורים מסודרים לצד
              </p>
            </div>

            {/* Radio Spacing */}
            <div className="space-y-2">
              <Label htmlFor="radio-spacing">מרווח בין כפתורים (pt)</Label>
              <Input
                id="radio-spacing"
                type="number"
                min="10"
                max="100"
                value={field.spacing || 30}
                onChange={(e) => onUpdate({ spacing: parseInt(e.target.value) || 30 })}
                dir="ltr"
                className="text-left"
              />
              <p className="text-xs text-muted-foreground">
                המרחק בין כל כפתור לשכנו (10-100 נקודות)
              </p>
            </div>

            {/* Radio Options */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>אפשרויות כפתורי רדיו</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const currentOptions = field.options || [];
                    const newOptions = [...currentOptions, `אפשרות ${currentOptions.length + 1}`];
                    onUpdate({ options: newOptions });
                  }}
                  className="h-7 px-2"
                >
                  <Plus className="w-3 h-3 ml-1" />
                  הוסף
                </Button>
              </div>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {(field.options || []).map((option, index) => (
                  <div key={index} className="flex gap-1">
                    <Input
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...(field.options || [])];
                        newOptions[index] = sanitizeUserInput(e.target.value);
                        onUpdate({ options: newOptions });
                      }}
                      placeholder={`אפשרות ${index + 1}`}
                      dir="rtl"
                      className="text-sm h-8"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const newOptions = (field.options || []).filter((_, i) => i !== index);
                        // Don't allow removing all options - keep at least 1
                        if (newOptions.length > 0) {
                          onUpdate({ options: newOptions });
                        }
                      }}
                      disabled={(field.options || []).length <= 1}
                      className="h-8 w-8 flex-shrink-0"
                      title="הסר אפשרות"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                כפתורי רדיו מאפשרים בחירת אפשרות אחת בלבד מהרשימה
              </p>
            </div>
          </>
        )}

        {/* Dropdown Options (dropdown fields only) */}
        {field.type === 'dropdown' && (
          <div className="space-y-2">
            <Label htmlFor="field-options">אפשרויות (אחת בכל שורה)</Label>
            <textarea
              id="field-options"
              value={field.options?.join('\n') || ''}
              onChange={(e) => {
                const options = e.target.value.split('\n').map(opt => sanitizeUserInput(opt)).filter(opt => opt.length > 0);
                onUpdate({ options });
              }}
              placeholder="אפשרות 1&#10;אפשרות 2&#10;אפשרות 3"
              dir="rtl"
              rows={5}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm resize-none"
            />
            <p className="text-xs text-muted-foreground">
              כל שורה היא אפשרות נפרדת ברשימה
            </p>
          </div>
        )}

        {/* Required Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="field-required">שדה חובה</Label>
            <p className="text-xs text-muted-foreground">
              האם יש חובה למלא שדה זה
            </p>
          </div>
          <Switch
            id="field-required"
            checked={field.required}
            onCheckedChange={handleRequiredToggle}
          />
        </div>

        {/* Direction Toggle (text fields only) */}
        {field.type === 'text' && (
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="field-direction">כיוון טקסט מימין לשמאל</Label>
              <p className="text-xs text-muted-foreground">
                RTL עבור עברית, LTR עבור אנגלית
              </p>
            </div>
            <Switch
              id="field-direction"
              checked={field.direction === 'rtl'}
              onCheckedChange={handleDirectionToggle}
            />
          </div>
        )}

        {/* Font Selection (text fields only) */}
        {field.type === 'text' && (
          <div className="space-y-2">
            <Label htmlFor="field-font">גופן</Label>
            <Select
              id="field-font"
              value={field.font || 'NotoSansHebrew'}
              onChange={handleFontChange}
            >
              <option value="NotoSansHebrew">Noto Sans Hebrew (עברית)</option>
              <option value="Arial">Arial</option>
            </Select>
            <p className="text-xs text-muted-foreground">
              בחר Noto Sans Hebrew לטקסט עברי
            </p>
          </div>
        )}

        {/* Font Size (text fields only) */}
        {field.type === 'text' && (
          <div className="space-y-2">
            <Label htmlFor="field-font-size">גודל גופן (pt)</Label>
            <Input
              id="field-font-size"
              type="number"
              min="8"
              max="24"
              value={field.fontSize || 12}
              onChange={handleFontSizeChange}
              dir="ltr"
              className="text-left"
            />
            <p className="text-xs text-muted-foreground">
              טווח: 8-24 נקודות (pt)
            </p>
          </div>
        )}

        {/* Field Info */}
        <div className="pt-4 border-t border-border">
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div>
              <span className="font-medium">עמוד:</span> {field.pageNumber}
            </div>
            <div>
              <span className="font-medium">סוג:</span>{' '}
              {field.type === 'text' && 'טקסט'}
              {field.type === 'checkbox' && 'תיבת סימון'}
              {field.type === 'radio' && 'כפתור רדיו'}
              {field.type === 'dropdown' && 'רשימה נפתחת'}
            </div>
            <div>
              <span className="font-medium">רוחב:</span> {Math.round(field.width)}pt
            </div>
            <div>
              <span className="font-medium">גובה:</span> {Math.round(field.height)}pt
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
