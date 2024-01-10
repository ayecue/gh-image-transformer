import { compress, OptimizedCodes } from './compress';
import { ImageContainer } from './image-container';
import { rgbToHex, rgbToHexWithAlpha } from './utils';

export const ImageAutoSize = -1;

async function generateMatrix(
  image: ImageContainer,
  width: number = 64,
  height: number = ImageAutoSize,
  withoutAlpha: boolean
): Promise<string[][]> {
  const resizedImage = await image.resize(width, height);
  const chunks = new Array(resizedImage.height)
    .fill(undefined)
    .map(() => new Array(resizedImage.width));

  resizedImage.scan(function (x, y, rgba) {
    const red = rgba[0];
    const green = rgba[1];
    const blue = rgba[2];
    const alpha = rgba[3];
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
  });

  return chunks;
}

function generateSprites(matrix: string[][], scale: number): string {
  let rowIndex = 0;
  let output = `"<scale=${scale}><size=${scale}><mspace=${scale * 1.1}>"`;

  for (let i = matrix.length - 1; i >= 1; i--) {
    output += `+¶(${scale * rowIndex},"${matrix[i].join('')}")`;
    rowIndex++;
  }

  return output;
}

export interface ProcessOptions {
  image: ImageContainer;
  width: number;
  height: number;
  scale?: number;
  withoutAlpha?: boolean;
}

export async function process({
  image,
  width,
  height,
  scale = 2,
  withoutAlpha = false
}: ProcessOptions) {
  const matrix = await generateMatrix(image, width, height, withoutAlpha);
  const output = generateSprites(matrix, scale);

  if (output.length > 160000) {
    console.warn('Output file contains more than 160000 chars.');
  }

  return output;
}
