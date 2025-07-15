import { ImageContainer } from './image-container';
import { MatrixGenerator } from './process/matrix-generator';
import { SpriteGenerator } from './process/sprite-generator';

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

  if (characters > 2048) {
    if (frameIdx !== undefined) {
      console.warn(`Grey Hack only allows 2048 characters per print output. Frame ${frameIdx} of the image ${filepath} exceeds that limit with ${characters} characters. Please decrease the image size.`);
    } else {
      console.warn(`Grey Hack only allows 2048 characters per print output. The image ${filepath} exceeds that limit with ${characters} characters. Please decrease the image size.`);
    }
  }

  if (output.length > 160000) {
    if (frameIdx !== undefined) {
      throw new Error(`Grey Hack only allows 160000 characters per text file. Frame ${frameIdx} of the image ${filepath} exceeds that limit. Please decrease the image size.`);
    }

    throw new Error(`Grey Hack only allows 160000 characters per text file. The image ${filepath} exceeds that limit. Please decrease the image size.`);
  }

  return output;
}
