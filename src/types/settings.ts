/**
 * Settings type definitions for field defaults
 */

export type CheckboxStyle = 'x' | 'check';
export type RadioOrientation = 'vertical' | 'horizontal';

export interface TextFieldSettings {
  font: string;
  fontSize: number;
  direction: 'ltr' | 'rtl';
}

export interface CheckboxFieldSettings {
  style: CheckboxStyle; // X or checkmark
}

export interface RadioFieldSettings {
  orientation: RadioOrientation;
  defaultButtonCount: number;
  spacing: number;
}

export interface DropdownFieldSettings {
  font: string;
  direction: 'ltr' | 'rtl';
}

export interface AppSettings {
  textField: TextFieldSettings;
  checkboxField: CheckboxFieldSettings;
  radioField: RadioFieldSettings;
  dropdownField: DropdownFieldSettings;
}

export const DEFAULT_SETTINGS: AppSettings = {
  textField: {
    font: 'NotoSansHebrew',
    fontSize: 12,
    direction: 'rtl',
  },
  checkboxField: {
    style: 'check',
  },
  radioField: {
    orientation: 'vertical',
    defaultButtonCount: 3,
    spacing: 30,
  },
  dropdownField: {
    font: 'NotoSansHebrew',
    direction: 'rtl',
  },
};
