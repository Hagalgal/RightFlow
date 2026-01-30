import { describe, it, expect } from '@jest/globals';
import { formatPhoneNumber } from '../phoneUtils';

describe('formatPhoneNumber', () => {
  // ── Valid Israeli formats ─────────────────────────────────────

  it('formats 0521234567 → 972521234567@c.us', () => {
    expect(formatPhoneNumber('0521234567')).toBe('972521234567@c.us');
  });

  it('formats 052-1234567 → 972521234567@c.us', () => {
    expect(formatPhoneNumber('052-1234567')).toBe('972521234567@c.us');
  });

  it('formats 052-123-4567 → 972521234567@c.us', () => {
    expect(formatPhoneNumber('052-123-4567')).toBe('972521234567@c.us');
  });

  it('formats +972521234567 → 972521234567@c.us', () => {
    expect(formatPhoneNumber('+972521234567')).toBe('972521234567@c.us');
  });

  it('formats +972-52-123-4567 → 972521234567@c.us', () => {
    expect(formatPhoneNumber('+972-52-123-4567')).toBe('972521234567@c.us');
  });

  it('formats 972521234567 → 972521234567@c.us', () => {
    expect(formatPhoneNumber('972521234567')).toBe('972521234567@c.us');
  });

  it('formats with spaces 052 123 4567 → 972521234567@c.us', () => {
    expect(formatPhoneNumber('052 123 4567')).toBe('972521234567@c.us');
  });

  it('passes through already formatted 972521234567@c.us', () => {
    expect(formatPhoneNumber('972521234567@c.us'))
      .toBe('972521234567@c.us');
  });

  // ── Different Israeli prefixes ────────────────────────────────

  it('formats 0501234567 (050 prefix)', () => {
    expect(formatPhoneNumber('0501234567')).toBe('972501234567@c.us');
  });

  it('formats 0531234567 (053 prefix)', () => {
    expect(formatPhoneNumber('0531234567')).toBe('972531234567@c.us');
  });

  it('formats 0541234567 (054 prefix)', () => {
    expect(formatPhoneNumber('0541234567')).toBe('972541234567@c.us');
  });

  it('formats 0581234567 (058 prefix)', () => {
    expect(formatPhoneNumber('0581234567')).toBe('972581234567@c.us');
  });

  // ── Invalid inputs ────────────────────────────────────────────

  it('throws on too short number', () => {
    expect(() => formatPhoneNumber('05212')).toThrow();
  });

  it('throws on empty string', () => {
    expect(() => formatPhoneNumber('')).toThrow();
  });

  it('throws on non-digit input', () => {
    expect(() => formatPhoneNumber('abcdefghij')).toThrow();
  });

  it('throws on non-Israeli mobile prefix', () => {
    expect(() => formatPhoneNumber('0211234567')).toThrow();
  });
});
