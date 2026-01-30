import { ValidationError } from '../../utils/errors';

/**
 * Israeli mobile prefixes (after stripping leading 0).
 * 50, 51, 52, 53, 54, 55, 56, 57, 58, 59
 */
const ISRAELI_MOBILE_PREFIXES = [
  '50', '51', '52', '53', '54', '55', '56', '57', '58', '59',
];

/**
 * Formats an Israeli phone number to WhatsApp chatId format.
 *
 * Accepts:
 *   0521234567, 052-1234567, 052-123-4567,
 *   +972521234567, +972-52-123-4567,
 *   972521234567, 972521234567@c.us
 *
 * Returns: 972XXXXXXXXX@c.us
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone || phone.trim().length === 0) {
    throw new ValidationError('מספר טלפון נדרש');
  }

  // Already formatted
  if (phone.endsWith('@c.us')) {
    return phone;
  }

  // Strip all non-digit characters
  const digits = phone.replace(/\D/g, '');

  if (digits.length === 0) {
    throw new ValidationError('מספר טלפון לא תקין');
  }

  let normalized: string;

  if (digits.startsWith('972')) {
    // International format: 972XXXXXXXXX
    normalized = digits;
  } else if (digits.startsWith('0')) {
    // Local format: 0XXXXXXXXX → 972XXXXXXXXX
    normalized = '972' + digits.substring(1);
  } else {
    throw new ValidationError(
      'מספר טלפון לא תקין - יש להזין מספר ישראלי',
    );
  }

  // Validate length: 972 (3) + 9 digits = 12
  if (normalized.length !== 12) {
    throw new ValidationError(
      'מספר טלפון לא תקין - אורך שגוי',
    );
  }

  // Validate Israeli mobile prefix (digits 4-5 after 972)
  const mobilePrefix = normalized.substring(3, 5);
  if (!ISRAELI_MOBILE_PREFIXES.includes(mobilePrefix)) {
    throw new ValidationError(
      'מספר טלפון לא תקין - קידומת לא מוכרת',
    );
  }

  return `${normalized}@c.us`;
}
