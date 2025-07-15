import chalk from 'chalk';
import { ImageContainer } from './image-container';
import { MatrixGenerator } from './process/matrix-generator';
import { SpriteGenerator } from './process/sprite-generator';

const MAX_PRINT_CHARACTERS = 2048;
const MAX_PRINT_CHARACTERS_WITH_PLUGIN = 160000;
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

  if (frameIdx !== undefined) {
    console.log(chalk.cyan(`Frame ${frameIdx} of the image ${filepath} got processed! The calculated output is going to be ${characters} characters.`));
  } else {
    console.log(chalk.cyan(`The image ${filepath} got processed! The calculated output is going to be ${characters} characters.`));
  }

  if (characters > MAX_PRINT_CHARACTERS) {
    console.log(chalk.bold(chalk.yellow(`Grey Hack only allows ${MAX_PRINT_CHARACTERS} characters of tags per print output. Please decrease the size otherwise your image won't be displayed correctly.`)));
    console.log(chalk.bold(chalk.yellow(`In case you already installed greyhack-customizable-output Grey Hack will allow you to print more than ${MAX_PRINT_CHARACTERS} characters. (Maximum is ${MAX_PRINT_CHARACTERS_WITH_PLUGIN} characters)`)));
    console.log(chalk.bold(chalk.yellow(`If you want to increase the output size feel free to download: https://github.com/ayecue/greyhack-customizable-output`)));
  }

  if (output.length > MAX_FILE_CHARACTERS) {
    console.log(chalk.red(`Grey Hack only allows ${MAX_FILE_CHARACTERS} characters per text file. Please decrease the image size.`));
  }

  return output;
}
