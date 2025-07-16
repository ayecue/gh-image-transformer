import { OptimizedCodes } from '../compress';
import { roundNumber } from '../utils';
import { MatrixGeneratorResult } from './matrix-generator';

export interface SpriteGeneratorResult {
  output: string;
  characters: number;
}

export class SpriteGenerator {
  private static DEFAULT_PIXEL_SIZE = 10;
  private static SPRITE_WIDTH = 6;

  private scale: number;

  constructor(scale: number = 1) {
    this.scale = scale;
  }

  private calculateRowCharacters(vposition: number, row: string[]): number {
    let characters = 17 + String(vposition).length; // "<pos=0><voffset=" + vposition + ">"

    for (let i = 0; i < row.length; i++) {
      const charVal = row[i];

      switch (charVal) {
        case OptimizedCodes.White:
          characters += 10; // "<sprite=0>";
          break;
        case OptimizedCodes.Black:
          characters += 24; // "<sprite=0 color=#000000>";
          break;
        case OptimizedCodes.Invisible:
          characters += 26; // "<sprite=0 color=#00000000>";
          break;
        default: // "<sprite=0 color=>";
          characters += 17 + charVal.length;
          break;
      }
    }

    return characters;
  }

  getSpriteWidth(): number {
    return roundNumber(SpriteGenerator.SPRITE_WIDTH * this.scale, 2);
  }

  getPixelSize(): number {
    return roundNumber(SpriteGenerator.DEFAULT_PIXEL_SIZE * this.scale, 2);
  }

  generate({
    matrix,
    uncompressedMatrix
  }: MatrixGeneratorResult): SpriteGeneratorResult {
    const width = this.getSpriteWidth();
    let output = `"<size=${this.getPixelSize()}><mspace=${width}>"`;
    let characters = output.length;
    let vposition = 0;

    for (let i = matrix.length - 1; i >= 1; i--) {
      const content = matrix[i].join('');
      output += `+¶(${vposition},"${content}")`;
      characters += this.calculateRowCharacters(
        vposition,
        uncompressedMatrix[i]
      );
      vposition = roundNumber(vposition + width, 2);
    }

    output += `+"</mspace></size>"`;
    characters += 16; // "</mspace></size>"

    return {
      output,
      characters
    };
  }
}
