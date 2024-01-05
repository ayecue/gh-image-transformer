import { writeFileSync } from 'fs';
import Jimp from 'jimp';
import path from 'path';

export enum OptimizedCodes {
  White = '#$',
  Black = '#!',
  Invisible = '#?'
}

export function parseMeasurement(
  arg: string,
  defaultValue: number = Jimp.AUTO
): number {
  if (arg === undefined || arg === '') return defaultValue;

  const num = Number(arg);

  if (isNaN(num)) {
    return defaultValue;
  }

  return num;
}

function rbgValueToHexValue(item: number) {
  const hex = item.toString(16);
  return `0${hex}`.slice(-2);
}

function rgbToHex(r: number, g: number, b: number) {
  return `#${rbgValueToHexValue(r)}${rbgValueToHexValue(g)}${rbgValueToHexValue(
    b
  )}`;
}

function rgbToHexWithAlpha(r: number, g: number, b: number, a: number) {
  return `${rgbToHex(r, g, b)}${rbgValueToHexValue(a)}`;
}

function compress(hex: string): string {
  let output = '#';

  for (let i = 1; i < hex.length; i += 2) {
    output += String.fromCharCode(100 + parseInt(hex.substring(i, i + 2), 16));
  }

  return output;
}

async function generateMatrix(
  image: Jimp,
  width: number = 64,
  height: number = Jimp.AUTO,
  withoutAlpha: boolean
): Promise<string[][]> {
  const resizedImage = await image.resize(width, height);
  const chunks = new Array(resizedImage.bitmap.height)
    .fill(undefined)
    .map(() => new Array(resizedImage.bitmap.width));

  resizedImage.scan(
    0,
    0,
    resizedImage.bitmap.width,
    resizedImage.bitmap.height,
    function (x, y, idx) {
      const red = this.bitmap.data[idx + 0];
      const green = this.bitmap.data[idx + 1];
      const blue = this.bitmap.data[idx + 2];
      const alpha = this.bitmap.data[idx + 3];
      const hasNoAlpha = withoutAlpha || alpha === 255;
      let hex;

      if (hasNoAlpha) {
        hex = rgbToHex(red, green, blue);
        if (hex === '#000000') hex = OptimizedCodes.Black;
        else if (hex === '#FFFFFF') hex = OptimizedCodes.White;
        else hex = compress(hex);
      } else {
        hex = rgbToHexWithAlpha(red, green, blue, alpha);
        if (alpha === 0) hex = OptimizedCodes.Invisible;
        else hex = compress(hex);
      }

      chunks[y][x] = hex;
    }
  );

  return chunks;
}

function generateSprites(matrix: string[][], scale: number): string {
  let rowIndex = 0;
  let output = `"<scale=${scale}><size=${scale}><mspace=${scale * 1.1}>"`;

  for (let i = matrix.length - 1; i >= 0; i--) {
    output += `+¶(${scale * rowIndex},"${matrix[i].join('')}")`;
    rowIndex++;
  }

  return output;
}

export interface TransformOptions {
  filepath: string;
  width: number;
  height: number;
  outputDirectory?: string;
  scale?: number;
  withoutAlpha?: boolean;
}

export async function transform({
  filepath,
  width,
  height,
  outputDirectory = process.cwd(),
  scale = 2,
  withoutAlpha = false
}: TransformOptions) {
  const image = await Jimp.read(filepath);
  const matrix = await generateMatrix(image, width, height, withoutAlpha);
  const output =
    `
  ¶=function(v,p)
    b="0123456789abcdef"
    q=function(z)
      return b[floor(z/16)]+b[z%16]
    end function
    l=function(c)
      if c=="${OptimizedCodes.White}" then
        return "#FFFFFF"
      else if c=="${OptimizedCodes.Black}" then
        return "#000000"
      else if c=="${OptimizedCodes.Invisible}" then
        return "#00000000"
      end if
      j=@code
      r=q(j(c[1])-100)
      g=q(j(c[2])-100)
      b=q(j(c[3])-100)
      if len(c)==5 then
        a=q(j(c[4])-100)
        return "#"+r+g+b+a
      end if
      return "#"+r+g+b
    end function
    o=""
    i=indexOf(p,"#")
    n=null
    while i!=null
      n=indexOf(p,"#",i)
      o=o+"<sprite=0 color="+l(p[i:n])+">"
      i=n
    end while
    if n!=null then o=o+"<sprite=0 color="+l(p[n:])+">"
    return "<pos=0><voffset="+v+">"+o
  end function`
      .split('\n')
      .map((s) => s.trim())
      .join(';') + `;print(${generateSprites(matrix, scale)})`;
  const outputPath = path.resolve(outputDirectory, 'image.src');

  if (output.length > 160000) {
    console.warn('Output file contains more than 160000 chars.');
  }

  writeFileSync(outputPath, output);
  console.log(`Created file at ${outputPath}!`);
}
