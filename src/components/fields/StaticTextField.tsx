import { FieldDefinition } from '@/types/fields';

interface StaticTextFieldProps {
  field: FieldDefinition;
  scale: number;
  isSelected: boolean;
  onClick: (e: React.MouseEvent) => void;
}

export const StaticTextField = ({
  field,
  scale,
  isSelected,
  onClick,
}: StaticTextFieldProps) => {
  // BUG FIX: Check for undefined/null instead of truthiness to allow borderWidth = 0
  // Date: 2026-01-05
  // Issue: field.borderWidth && field.borderColor treats 0 as falsy
  // Fix: Use explicit undefined/null check to allow borderWidth = 0 (no border)
  // Prevention: Added explicit check (field.borderWidth !== undefined && field.borderWidth !== null)
  const borderStyle = isSelected
    ? '2px solid #2563eb'
    : field.borderWidth !== undefined && field.borderWidth !== null && field.borderColor
    ? `${field.borderWidth}px solid ${field.borderColor}`
    : '1px dashed #9ca3af';

  const style: React.CSSProperties = {
    position: 'absolute',
    left: `${field.x * scale}px`,
    bottom: `${field.y * scale}px`,
    width: `${field.width * scale}px`,
    height: `${field.height * scale}px`,
    border: borderStyle,
    backgroundColor: field.backgroundColor || (isSelected ? 'rgba(37, 99, 235, 0.1)' : 'rgba(255, 255, 255, 0.9)'),
    color: field.textColor || '#1f2937',
    cursor: 'pointer',
    pointerEvents: 'auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: field.textAlign === 'center' ? 'center' : field.textAlign === 'right' ? 'flex-end' : 'flex-start',
    padding: `${4 * scale}px ${8 * scale}px`,
    fontSize: `${(field.fontSize || 12) * scale}px`,
    fontFamily: field.font || 'inherit',
    fontWeight: field.fontWeight || 'normal',
    fontStyle: field.fontStyle || 'normal',
    direction: field.direction,
    textAlign: field.textAlign || (field.direction === 'rtl' ? 'right' : 'left'),
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
    overflow: 'hidden',
    boxSizing: 'border-box',
  };

  return (
    <div
      style={style}
      onClick={onClick}
      title={field.label || 'Static Text'}
    >
      {field.content || 'טקסט סטטי'}
    </div>
  );
};
