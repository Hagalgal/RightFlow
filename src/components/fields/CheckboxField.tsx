import { Rnd } from 'react-rnd';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { FieldDefinition } from '@/types/fields';
import { sanitizeUserInput } from '@/utils/inputSanitization';

interface CheckboxFieldProps {
  field: FieldDefinition;
  isSelected: boolean;
  scale: number;
  onSelect: (id: string) => void;
  onUpdate: (id: string, updates: Partial<FieldDefinition>) => void;
  onDelete: (id: string) => void;
}

export const CheckboxField = ({
  field,
  isSelected,
  scale,
  onSelect,
  onUpdate,
  onDelete,
}: CheckboxFieldProps) => {
  const handleDragStop = (_e: any, d: { x: number; y: number }) => {
    onUpdate(field.id, {
      x: d.x / scale,
      y: d.y / scale,
    });
  };

  return (
    <Rnd
      position={{
        x: field.x * scale,
        y: field.y * scale,
      }}
      size={{
        width: field.width * scale,
        height: field.height * scale,
      }}
      onDragStop={handleDragStop}
      disableResizing={true} // Checkboxes have fixed size
      bounds="parent"
      className={cn(
        'field-marker field-marker-checkbox',
        isSelected && 'field-marker-selected',
        'group flex items-center justify-center',
      )}
      style={{
        zIndex: isSelected ? 1000 : 100,
      }}
      onClick={(e: React.MouseEvent) => {
        e.stopPropagation();
        onSelect(field.id);
      }}
    >
      {/* Checkbox icon */}
      <div className="w-4 h-4 border-2 rounded-sm" style={{ borderColor: 'hsl(var(--field-checkbox))' }} />

      {/* Field label (if exists) */}
      {field.label && (
        <div
          className="absolute top-0 right-0 text-white text-xs px-2 py-0.5 rounded-tr whitespace-nowrap"
          style={{
            backgroundColor: 'hsl(var(--field-checkbox))',
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
        title="מחק תיבת סימון"
      >
        <X className="w-3 h-3" />
      </button>
    </Rnd>
  );
};
