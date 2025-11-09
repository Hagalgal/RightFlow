import { TextField } from './TextField';
import { CheckboxField } from './CheckboxField';
import { RadioField } from './RadioField';
import { DropdownField } from './DropdownField';
import { FieldDefinition } from '@/types/fields';

interface FieldOverlayProps {
  fields: FieldDefinition[];
  selectedFieldId: string | null;
  scale: number;
  onFieldSelect: (id: string) => void;
  onFieldUpdate: (id: string, updates: Partial<FieldDefinition>) => void;
  onFieldDelete: (id: string) => void;
  onFieldDuplicate: (id: string) => void;
}

export const FieldOverlay = ({
  fields,
  selectedFieldId,
  scale,
  onFieldSelect,
  onFieldUpdate,
  onFieldDelete,
  onFieldDuplicate,
}: FieldOverlayProps) => {
  // Scale factor for converting between PDF points and pixels
  const scaleFactor = scale / 100;

  return (
    <div className="absolute inset-0 pointer-events-none">
      <div className="relative w-full h-full pointer-events-auto">
        {fields.map((field) => {
          const isSelected = field.id === selectedFieldId;

          if (field.type === 'text') {
            return (
              <TextField
                key={field.id}
                field={field}
                isSelected={isSelected}
                scale={scaleFactor}
                onSelect={onFieldSelect}
                onUpdate={onFieldUpdate}
                onDelete={onFieldDelete}
                onDuplicate={onFieldDuplicate}
              />
            );
          } else if (field.type === 'checkbox') {
            return (
              <CheckboxField
                key={field.id}
                field={field}
                isSelected={isSelected}
                scale={scaleFactor}
                onSelect={onFieldSelect}
                onUpdate={onFieldUpdate}
                onDelete={onFieldDelete}
                onDuplicate={onFieldDuplicate}
              />
            );
          } else if (field.type === 'radio') {
            return (
              <RadioField
                key={field.id}
                field={field}
                isSelected={isSelected}
                scale={scaleFactor}
                onSelect={onFieldSelect}
                onUpdate={onFieldUpdate}
                onDelete={onFieldDelete}
                onDuplicate={onFieldDuplicate}
              />
            );
          } else if (field.type === 'dropdown') {
            return (
              <DropdownField
                key={field.id}
                field={field}
                isSelected={isSelected}
                scale={scaleFactor}
                onSelect={onFieldSelect}
                onUpdate={onFieldUpdate}
                onDelete={onFieldDelete}
                onDuplicate={onFieldDuplicate}
              />
            );
          }

          return null;
        })}
      </div>
    </div>
  );
};
