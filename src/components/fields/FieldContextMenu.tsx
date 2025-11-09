import { useEffect, useRef } from 'react';
import { Copy, Trash2 } from 'lucide-react';
import { cn } from '@/utils/cn';

interface FieldContextMenuProps {
  x: number;
  y: number;
  onDuplicate: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export const FieldContextMenu = ({
  x,
  y,
  onDuplicate,
  onDelete,
  onClose,
}: FieldContextMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Close menu on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className={cn(
        'fixed z-[3000] bg-background border border-border rounded-md shadow-lg py-1 min-w-[160px]',
        'animate-in fade-in-0 zoom-in-95 duration-100',
      )}
      style={{
        left: `${x}px`,
        top: `${y}px`,
      }}
      dir="rtl"
    >
      {/* Duplicate Option */}
      <button
        onClick={() => {
          onDuplicate();
          onClose();
        }}
        className={cn(
          'w-full px-3 py-2 text-sm flex items-center gap-2',
          'hover:bg-accent hover:text-accent-foreground',
          'transition-colors cursor-pointer',
        )}
      >
        <Copy className="w-4 h-4" />
        <span>שכפל שדה</span>
      </button>

      {/* Separator */}
      <div className="h-px bg-border my-1" />

      {/* Delete Option */}
      <button
        onClick={() => {
          onDelete();
          onClose();
        }}
        className={cn(
          'w-full px-3 py-2 text-sm flex items-center gap-2',
          'hover:bg-destructive hover:text-destructive-foreground',
          'transition-colors cursor-pointer',
        )}
      >
        <Trash2 className="w-4 h-4" />
        <span>מחק שדה</span>
      </button>
    </div>
  );
};
