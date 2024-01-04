import { writeFileSync } from 'fs';
import Jimp from 'jimp';
import path from 'path';

export enum OptimizedCodes {
  White = '#$',
  Black = '#!',
  Invisible = '#?'
}

export function parseMeasurement(arg: string, defaultValue: number = Jimp.AUTO): number {
  if (arg === undefined || arg === '') return defaultValue;

  const num = Number(arg);

  if (isNaN(num)) {
    return defaultValue;
  }

  return num;
}

function rbgValueToHexValue(item: number) {
  var hex = item.toString(16);
  return `0${hex}`.slice(-2);
}

function rgbToHex(r: number, g: number, b: number) {
  return `#${rbgValueToHexValue(r)}${rbgValueToHexValue(g)}${rbgValueToHexValue(b)}`;
}

function rgbToHexWithAlpha(r: number, g: number, b: number, a: number) {
  return `${rgbToHex(r, g, b)}${rbgValueToHexValue(a)}`;
}

async function generateMatrix(image: Jimp, width: number = 64, height: number = Jimp.AUTO, withoutAlpha: boolean): Promise<string[][]> {
  const resizedImage = await image.resize(width, height);
  const chunks = (new Array(resizedImage.bitmap.height)).fill(undefined).map(() => new Array(resizedImage.bitmap.width));

  resizedImage.scan(0, 0, resizedImage.bitmap.width, resizedImage.bitmap.height, function (x, y, idx) {
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
      else if (hex.charAt(1) === hex.charAt(2) && hex.charAt(3) === hex.charAt(4) && hex.charAt(5) === hex.charAt(6)) hex = `#${hex.charAt(1) + hex.charAt(3) + hex.charAt(5)}`;
    } else {
      hex = rgbToHexWithAlpha(red, green, blue, alpha);
      if (alpha === 0) hex = OptimizedCodes.Invisible;
      else if (hex.charAt(1) === hex.charAt(2) && hex.charAt(3) === hex.charAt(4) && hex.charAt(5) === hex.charAt(6) && hex.charAt(7) === hex.charAt(8)) hex = `#${hex.charAt(1) + hex.charAt(3) + hex.charAt(5) + hex.charAt(7)}`;
    }

    chunks[y][x] = hex;
  });

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
  const output = `
  ¶=function(v,p)
    l=function(c)
      if c=="${OptimizedCodes.White}" then
        return "#FFFFFF"
      else if c=="${OptimizedCodes.Black}" then
        return "#000000"
      else if c=="${OptimizedCodes.Invisible}" then
        return "#00000000"
      else if len(c)==4 then
        return "#"+c[1]+c[1]+c[2]+c[2]+c[3]+c[3]
      else if len(c)==5 then
        return "#"+c[1]+c[1]+c[2]+c[2]+c[3]+c[3]+c[4]+c[4]
      end if
      return c
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