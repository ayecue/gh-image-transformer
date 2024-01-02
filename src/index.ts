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

async function generateMatrix(image: Jimp, width: number = 128, height: number = Jimp.AUTO): Promise<string[][]> {
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

function generateSprites(matrix: string[][]): string {
  let rowIndex = 0;
  let output = '<scale=1.77><size=5><mspace=5.75>';

  for (let i = matrix.length - 1; i >= 0; i--) {
    let line = `<pos=0><voffset=${5 * rowIndex}>`;

    for (const column of matrix[i]) {
      line += `<sprite=0 color=${column}>`
    }

    output += line;
    rowIndex++;
  }

  return output;
}

export async function transform(target: string, width: number, height: number) {
  const image = await Jimp.read(target);
  const matrix = await generateMatrix(image, width, height);
  const output = `print("${generateSprites(matrix)}")`;
  const outputPath = path.resolve(process.cwd(), 'image.src');

  writeFileSync(outputPath, output);
  console.log(`Created file at ${outputPath}!`);
}