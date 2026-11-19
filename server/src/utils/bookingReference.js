import { randomBytes } from 'node:crypto';

// No 0/O/1/I/L to keep references readable over the phone.
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

export function generateBookingReference(now = new Date()) {
  const day = now.toISOString().slice(0, 10).replace(/-/g, '');
  const suffix = Array.from(randomBytes(6), (b) => ALPHABET[b % ALPHABET.length]).join('');
  return `EH-${day}-${suffix}`;
}
