import { Rnd } from 'react-rnd';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { FieldDefinition } from '@/types/fields';
import { sanitizeUserInput } from '@/utils/inputSanitization';

interface RadioFieldProps {
  field: FieldDefinition;
  isSelected: boolean;
  scale: number;
  onSelect: (id: string) => void;
  onUpdate: (id: string, updates: Partial<FieldDefinition>) => void;
  onDelete: (id: string) => void;
}

export const RadioField = ({
  field,
  isSelected,
  scale,
  onSelect,
  onUpdate,
  onDelete,
}: RadioFieldProps) => {
  const handleDragStop = (_e: any, d: { x: number; y: number }) => {
    onUpdate(field.id, {
      x: d.x / scale,
      y: d.y / scale,
    });
  };

  const options = field.options || ['אפשרות 1'];
  const spacing = field.spacing || 30;
  const orientation = field.orientation || 'vertical';

  // Calculate container dimensions based on orientation
  const containerWidth =
    orientation === 'horizontal'
      ? options.length * field.width + (options.length - 1) * spacing
      : field.width;
  const containerHeight =
    orientation === 'vertical'
      ? options.length * field.height + (options.length - 1) * spacing
      : field.height;

  return (
    <Rnd
      position={{
        x: field.x * scale,
        y: field.y * scale,
      }}
      size={{
        width: containerWidth * scale,
        height: containerHeight * scale,
      }}
      onDragStop={handleDragStop}
      disableResizing={true}
      bounds="parent"
      className={cn(
        'field-marker field-marker-radio',
        isSelected && 'field-marker-selected',
        'group',
      )}
      style={{
        zIndex: isSelected ? 1000 : 100,
      }}
      onClick={(e: React.MouseEvent) => {
        e.stopPropagation();
        onSelect(field.id);
      }}
    >
      {/* Radio buttons - display all options based on orientation */}
      <div
        className={cn('flex gap-0', orientation === 'vertical' ? 'flex-col' : 'flex-row')}
        style={{ gap: `${spacing * scale}px` }}
      >
        {options.map((option, index) => (
          <div key={index} className="flex items-center gap-2" dir="rtl">
            <div
              className="border-2 rounded-full flex-shrink-0"
              style={{
                borderColor: 'hsl(var(--field-radio))',
                width: `${field.width * scale}px`,
                height: `${field.height * scale}px`,
              }}
            />
            <span
              className="text-xs overflow-hidden text-ellipsis"
              style={{
                color: 'hsl(var(--field-radio))',
                maxWidth: orientation === 'horizontal' ? '100px' : '150px',
                whiteSpace: 'nowrap'
              }}
            >
              {sanitizeUserInput(option)}
            </span>
          </div>
        ))}
      </div>

      {/* Field label (group name) */}
      {field.label && (
        <div
          className="absolute top-0 right-0 text-white text-xs px-2 py-0.5 rounded-tr whitespace-nowrap"
          style={{
            backgroundColor: 'hsl(var(--field-radio))',
            transform: 'translateX(100%)',
          }}
          dir="rtl"
        >
          {sanitizeUserInput(field.label)}
        </div>
      )}

      {/* Delete button */}
      <button
        className="absolute top-0 left-0 bg-destructive text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-destructive/90 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ transform: 'translate(-50%, -50%)' }}
        onClick={(e) => {
          e.stopPropagation();
          onDelete(field.id);
        }}
        title="מחק קבוצת כפתורי רדיו"
      >
        <X className="w-3 h-3" />
      </button>
    </Rnd>
  );
};
