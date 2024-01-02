import { writeFileSync } from 'fs';
import Jimp from 'jimp';
import path from 'path';

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

async function generateMatrix(image: Jimp, width: number = 64, height: number = Jimp.AUTO): Promise<string[][]> {
  const resizedImage = await image.resize(width, height);
  const chunks = (new Array(resizedImage.bitmap.height)).fill(undefined).map(() => new Array(resizedImage.bitmap.width));

  resizedImage.scan(0, 0, resizedImage.bitmap.width, resizedImage.bitmap.height, function (x, y, idx) {
    const red = this.bitmap.data[idx + 0];
    const green = this.bitmap.data[idx + 1];
    const blue = this.bitmap.data[idx + 2];
    const hex = rgbToHex(red, green, blue);
    chunks[y][x] = hex;
  });

  return chunks;
}

function generateSprites(matrix: string[][], scale: number): string {
  let rowIndex = 0;
  let output = `<scale=${scale}><size=${scale}><mspace=${scale * 1.1}>`;

  for (let i = matrix.length - 1; i >= 0; i--) {
    let line = `<pos=0><voffset=${scale * rowIndex}>`;

    for (const column of matrix[i]) {
      line += `<sprite=0 color=${column}>`
    }

    output += line;
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
}

export async function transform({
  filepath,
  width,
  height,
  outputDirectory = process.cwd(),
  scale = 2
}: TransformOptions) {
  const image = await Jimp.read(filepath);
  const matrix = await generateMatrix(image, width, height);
  const output = `print("${generateSprites(matrix, scale)}")`;
  const outputPath = path.resolve(outputDirectory, 'image.src');

  writeFileSync(outputPath, output);
  console.log(`Created file at ${outputPath}!`);
}