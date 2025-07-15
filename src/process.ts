import { ImageContainer } from './image-container';
import { MatrixGenerator } from './process/matrix-generator';
import { SpriteGenerator } from './process/sprite-generator';

const MAX_PRINT_CHARACTERS = 2048;
const MAX_FILE_CHARACTERS = 160000;

export interface ProcessOptions {
  filepath: string;
  frameIdx?: number;
  image: ImageContainer;
  width: number;
  height: number;
  scale?: number;
  withoutAlpha?: boolean;
}

export async function process({
  filepath,
  frameIdx,
  image,
  width,
  height,
  scale = 2,
  withoutAlpha = false
}: ProcessOptions) {
  const matrixGenerator = new MatrixGenerator({
    image,
    width,
    height,
    withoutAlpha
  });
  const { matrix, uncompressedMatrix } = await matrixGenerator.generate();
  const spriteGenerator = new SpriteGenerator(scale);
  const { output, characters } = spriteGenerator.generate({
    matrix,
    uncompressedMatrix
  });

  if (characters > MAX_PRINT_CHARACTERS) {
    if (frameIdx !== undefined) {
      console.warn(`Grey Hack only allows ${MAX_PRINT_CHARACTERS} characters per print output. Frame ${frameIdx} of the image ${filepath} exceeds that limit with ${characters} characters. Please decrease the size otherwise your image won't be shown correctly.`);
    } else {
      console.warn(`Grey Hack only allows ${MAX_PRINT_CHARACTERS} characters per print output. The image ${filepath} exceeds that limit with ${characters} characters. Please decrease the size otherwise your image won't be shown correctly.`);
    }
  }

  if (output.length > MAX_FILE_CHARACTERS) {
    if (frameIdx !== undefined) {
      throw new Error(`Grey Hack only allows ${MAX_FILE_CHARACTERS} characters per text file. Frame ${frameIdx} of the image ${filepath} exceeds that limit. Please decrease the image size.`);
    }

    throw new Error(`Grey Hack only allows ${MAX_FILE_CHARACTERS} characters per text file. The image ${filepath} exceeds that limit. Please decrease the image size.`);
  }

  return output;
}
