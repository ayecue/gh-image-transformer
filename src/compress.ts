export enum OptimizedCodes {
  White = '#$',
  Black = '#!',
  Invisible = '#?'
}

export function compress(hex: string): string {
  let output = '#';

  for (let i = 1; i < hex.length; i += 2) {
    output += String.fromCharCode(100 + parseInt(hex.substring(i, i + 2), 16));
  }

  return output;
}
