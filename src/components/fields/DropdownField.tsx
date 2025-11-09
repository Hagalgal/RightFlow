import { useState } from 'react';
import { Rnd } from 'react-rnd';
import { X, ChevronDown } from 'lucide-react';
import { cn } from '@/utils/cn';
import { FieldDefinition } from '@/types/fields';
import { sanitizeUserInput } from '@/utils/inputSanitization';
import { FieldContextMenu } from './FieldContextMenu';

interface DropdownFieldProps {
  field: FieldDefinition;
  isSelected: boolean;
  scale: number;
  onSelect: (id: string) => void;
  onUpdate: (id: string, updates: Partial<FieldDefinition>) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}

export const DropdownField = ({
  field,
  isSelected,
  scale,
  onSelect,
  onUpdate,
  onDelete,
  onDuplicate,
}: DropdownFieldProps) => {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  const handleDragStop = (_e: any, d: { x: number; y: number }) => {
    onUpdate(field.id, {
      x: d.x / scale,
      y: d.y / scale,
    });
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY });
    onSelect(field.id);
  };

  const handleResizeStop = (
    _e: any,
    _direction: any,
    ref: HTMLElement,
    _delta: any,
    position: { x: number; y: number },
  ) => {
    onUpdate(field.id, {
      width: parseInt(ref.style.width) / scale,
      height: parseInt(ref.style.height) / scale,
      x: position.x / scale,
      y: position.y / scale,
    });
  };

  return (
    <>
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
        onResizeStop={handleResizeStop}
        minWidth={80 * scale}
        minHeight={25 * scale}
        bounds="parent"
        className={cn(
          'field-marker field-marker-dropdown',
          isSelected && 'field-marker-selected',
          'group flex items-center',
        )}
        style={{
          zIndex: isSelected ? 1000 : 100,
        }}
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation();
          onSelect(field.id);
        }}
        onContextMenu={handleContextMenu}
      >
      {/* Dropdown preview */}
      <div className="w-full h-full flex items-center justify-between px-2 text-xs" dir="rtl">
        <span className="truncate">{field.options?.[0] || 'בחר אפשרות'}</span>
        <ChevronDown className="w-3 h-3 flex-shrink-0" style={{ color: 'hsl(var(--field-dropdown))' }} />
      </div>

      {/* Field label */}
      <div
        className="absolute top-0 right-0 text-white text-xs px-2 py-0.5 rounded-tr whitespace-nowrap"
        style={{ backgroundColor: 'hsl(var(--field-dropdown))' }}
        dir="rtl"
      >
        {sanitizeUserInput(field.label || field.name) || 'רשימה נפתחת'}
      </div>

      {/* Delete button */}
      <button
        className="absolute top-0 left-0 bg-destructive text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-destructive/90 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ transform: 'translate(-50%, -50%)' }}
        onClick={(e) => {
          e.stopPropagation();
          onDelete(field.id);
        }}
        title="מחק רשימה נפתחת"
      >
        <X className="w-3 h-3" />
      </button>
    </Rnd>

    {/* Context Menu */}
    {contextMenu && (
      <FieldContextMenu
        x={contextMenu.x}
        y={contextMenu.y}
        onDuplicate={() => onDuplicate(field.id)}
        onDelete={() => onDelete(field.id)}
        onClose={() => setContextMenu(null)}
      />
    )}
    </>
  );
};
