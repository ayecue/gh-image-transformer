export const OptimizedCodes = {
  White: String.fromCharCode(28),
  Black: String.fromCharCode(29),
  Invisible: String.fromCharCode(30)
} as const;

export const DEFAULT_ALPHA = 'FF0';

export function compress(hex: string): string {
  hex = hex.slice(1);
  if (hex.length < 6)
    throw new Error('Hex value cannot be less than 6 characters');

  const segments = [hex.slice(0, 3), hex.slice(3, 6)];

  if (hex.length === 6) {
    segments.push(DEFAULT_ALPHA);
  } else {
    if (hex.length < 8)
      throw new Error('Hex value with alpha cannot be less than 8 characters');
    segments.push(`${hex.slice(6, 8)}0`);
  }

  let output = '';

  for (const segment of segments) {
    output += String.fromCharCode(100 + parseInt(segment, 16));
  }

  return output;
}
