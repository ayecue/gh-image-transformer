import { OptimizedCodes } from "../compress";
import { MatrixGeneratorResult } from "./matrix-generator";

export interface SpriteGeneratorResult {
  output: string;
  characters: number;
}

export class SpriteGenerator {
  private scale: number;

  constructor(scale: number = 2) {
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
        default:
          characters += 17 + charVal.length; // "<sprite=0 color=>";
          break;
      }
    }

    return characters;
  }

  generate({ matrix, uncompressedMatrix }: MatrixGeneratorResult): SpriteGeneratorResult {
    let rowIndex = 0;
    let output = `"<scale=${this.scale}><size=${this.scale}><mspace=${this.scale * 1.1}>"`;
    let characters = output.length;

    for (let i = matrix.length - 1; i >= 1; i--) {
      const vposition = this.scale * rowIndex;
      const content = matrix[i].join('');
      output += `+¶(${vposition},"${content}")`;
      characters += this.calculateRowCharacters(vposition, uncompressedMatrix[i]);
      rowIndex++;
    }

    return {
      output,
      characters
    };
  }
}