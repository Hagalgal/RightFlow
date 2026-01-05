import { FieldDefinition } from '@/types/fields';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useTranslation } from '@/i18n';
import { sanitizeUserInput, sanitizeHexColor } from '@/utils/inputSanitization';

interface StaticTextPropertiesPanelProps {
  field: FieldDefinition;
  onUpdate: (updates: Partial<FieldDefinition>) => void;
  onDelete: () => void;
}

export const StaticTextPropertiesPanel = ({
  field,
  onUpdate,
  onDelete,
}: StaticTextPropertiesPanelProps) => {
  const t = useTranslation();

  // Security: Sanitize content input to prevent XSS attacks
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const sanitized = sanitizeUserInput(e.target.value);
    onUpdate({ content: sanitized });
  };

  // Security: Validate hex color format to prevent injection attacks
  const handleTextColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizeHexColor(e.target.value, field.textColor || '#1f2937');
    onUpdate({ textColor: sanitized });
  };

  // Security: Validate hex color format to prevent injection attacks
  const handleBackgroundColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizeHexColor(e.target.value, field.backgroundColor || '#ffffff');
    onUpdate({ backgroundColor: sanitized });
  };

  // Security: Sanitize section name to prevent XSS attacks
  const handleSectionNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizeUserInput(e.target.value);
    onUpdate({ sectionName: sanitized });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{t.staticTextProperties || 'Static Text Properties'}</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="space-y-2">
        <Label htmlFor="static-content">{t.content || 'Content'}</Label>
        <textarea
          id="static-content"
          className="w-full min-h-[80px] px-3 py-2 text-sm border border-input rounded-md bg-background"
          value={field.content || ''}
          onChange={handleContentChange}
          placeholder={t.enterStaticText || 'Enter static text...'}
          dir={field.direction}
        />
      </div>

      {/* Text Alignment */}
      <div className="space-y-2">
        <Label htmlFor="text-align">{t.textAlignment || 'Text Alignment'}</Label>
        <Select
          id="text-align"
          value={field.textAlign || 'left'}
          onChange={(e) => onUpdate({ textAlign: e.target.value as 'left' | 'center' | 'right' })}
        >
          <option value="left">{t.alignLeft || 'Left'}</option>
          <option value="center">{t.alignCenter || 'Center'}</option>
          <option value="right">{t.alignRight || 'Right'}</option>
        </Select>
      </div>

      {/* Font Size */}
      <div className="space-y-2">
        <Label htmlFor="font-size">{t.fontSize}</Label>
        <Input
          id="font-size"
          type="number"
          min="8"
          max="72"
          value={field.fontSize || 12}
          onChange={(e) => onUpdate({ fontSize: parseInt(e.target.value) || 12 })}
          dir="ltr"
          className="text-left"
        />
      </div>

      {/* Font Weight */}
      <div className="space-y-2">
        <Label htmlFor="font-weight">{t.fontWeight || 'Font Weight'}</Label>
        <Select
          id="font-weight"
          value={field.fontWeight || 'normal'}
          onChange={(e) => onUpdate({ fontWeight: e.target.value as 'normal' | 'bold' })}
        >
          <option value="normal">{t.normal || 'Normal'}</option>
          <option value="bold">{t.bold || 'Bold'}</option>
        </Select>
      </div>

      {/* Font Style */}
      <div className="space-y-2">
        <Label htmlFor="font-style">{t.fontStyle || 'Font Style'}</Label>
        <Select
          id="font-style"
          value={field.fontStyle || 'normal'}
          onChange={(e) => onUpdate({ fontStyle: e.target.value as 'normal' | 'italic' })}
        >
          <option value="normal">{t.normal || 'Normal'}</option>
          <option value="italic">{t.italic || 'Italic'}</option>
        </Select>
      </div>

      {/* Text Color */}
      <div className="space-y-2">
        <Label htmlFor="text-color">{t.textColor || 'Text Color'}</Label>
        <div className="flex gap-2">
          <Input
            id="text-color"
            type="color"
            value={field.textColor || '#1f2937'}
            onChange={(e) => onUpdate({ textColor: e.target.value })}
            className="w-20 h-10"
          />
          <Input
            type="text"
            value={field.textColor || '#1f2937'}
            onChange={handleTextColorChange}
            placeholder="#1f2937"
            className="flex-1"
          />
        </div>
      </div>

      {/* Background Color */}
      <div className="space-y-2">
        <Label htmlFor="bg-color">{t.backgroundColor || 'Background Color'}</Label>
        <div className="flex gap-2">
          <Input
            id="bg-color"
            type="color"
            value={field.backgroundColor || '#ffffff'}
            onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
            className="w-20 h-10"
          />
          <Input
            type="text"
            value={field.backgroundColor || '#ffffff'}
            onChange={handleBackgroundColorChange}
            placeholder="#ffffff"
            className="flex-1"
          />
        </div>
      </div>

      {/* Border */}
      <div className="space-y-2">
        <Label>{t.border || 'Border'}</Label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="border-width" className="text-xs">{t.width || 'Width'}</Label>
            <Input
              id="border-width"
              type="number"
              min="0"
              max="10"
              value={field.borderWidth || 0}
              onChange={(e) => onUpdate({ borderWidth: parseInt(e.target.value) || 0 })}
              dir="ltr"
            />
          </div>
          <div>
            <Label htmlFor="border-color" className="text-xs">{t.color || 'Color'}</Label>
            <Input
              id="border-color"
              type="color"
              value={field.borderColor || '#000000'}
              onChange={(e) => onUpdate({ borderColor: e.target.value })}
              className="h-10"
            />
          </div>
        </div>
      </div>

      {/* Section Name */}
      <div className="space-y-2">
        <Label htmlFor="section-name">{t.sectionName}</Label>
        <Input
          id="section-name"
          type="text"
          value={field.sectionName || ''}
          onChange={handleSectionNameChange}
          placeholder={t.sectionNamePlaceholder || 'e.g., Instructions'}
          dir={field.direction}
        />
      </div>
    </div>
  );
};
