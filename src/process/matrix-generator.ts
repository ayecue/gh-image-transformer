import { compress, OptimizedCodes } from '../compress';
import { ImageContainer } from '../image-container';
import { rgbToHex, rgbToHexWithAlpha } from '../utils';

export const ImageAutoSize = -1;

export interface MatrixGeneratorResult {
  matrix: string[][];
  uncompressedMatrix: string[][];
}

export interface MatrixGeneratorOptions {
  image: ImageContainer;
  width?: number;
  height?: number;
  withoutAlpha: boolean;
}

export class MatrixGenerator {
  private image: ImageContainer;
  private width: number;
  private height: number;
  private withoutAlpha: boolean;

  constructor({
    image,
    width = 16,
    height = ImageAutoSize,
    withoutAlpha
  }: MatrixGeneratorOptions) {
    this.image = image;
    this.width = width;
    this.height = height;
    this.withoutAlpha = withoutAlpha;
  }

  async generate(): Promise<MatrixGeneratorResult> {
    const originalWidth = this.image.width;
    const resizedImage = await this.image.resize(this.width, this.height);
    const chunks = new Array(resizedImage.height)
      .fill(undefined)
      .map(() => new Array(resizedImage.width));
    const uncompressed = new Array(resizedImage.height)
      .fill(undefined)
      .map(() => new Array(resizedImage.width));

    resizedImage.scan((x, y, rgba) => {
      const red = rgba[0];
      const green = rgba[1];
      const blue = rgba[2];
      const alpha = rgba[3];
      const hasNoAlpha = this.withoutAlpha || alpha === 255;
      let hex;
      let compressed;

      if (hasNoAlpha) {
        hex = rgbToHex(red, green, blue);
        if (hex === '#000000') hex = OptimizedCodes.Black;
        else if (hex === '#FFFFFF') hex = OptimizedCodes.White;
        else compressed = compress(hex);
      } else {
        hex = rgbToHexWithAlpha(red, green, blue, alpha);
        if (alpha === 0) hex = OptimizedCodes.Invisible;
        else compressed = compress(hex);
      }

      uncompressed[y][x] = hex;
      chunks[y][x] = compressed || hex;
    });

    return {
      matrix: chunks,
      uncompressedMatrix: uncompressed
    };
  }
}
