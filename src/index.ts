import { readFileSync } from 'fs';
import { decode, GIF, Image } from 'imagescript';

import { StaticImageContainer } from './image-container';
import { process } from './process';
import { coreLibraryFactory } from './utils';

export interface TransformOptions {
  filepath: string;
  width: number;
  height: number;
  scale?: number;
  withoutAlpha?: boolean;
}

export async function transform({ filepath, ...options }: TransformOptions) {
  const image = await decode(readFileSync(filepath));

  if (image instanceof GIF) {
    return [
      coreLibraryFactory(),
      `print(${await process({
        image: new StaticImageContainer(image[0]),
        ...options
      })})`
    ].join(';');
  }

  return [
    coreLibraryFactory(),
    `print(${await process({
      image: new StaticImageContainer(image),
      ...options
    })})`
  ].join(';');
}

export interface TransformAnimationOptions extends TransformOptions {
  delay?: number;
}

export async function transformAnimation({
  filepath,
  delay = 0.2,
  ...options
}: TransformAnimationOptions) {
  const image = await decode(readFileSync(filepath));

  if (image instanceof Image) {
    throw new Error('Expected GIF for animation!');
  }

  const animationFrames: string[] = await Promise.all(
    Array.from(image).map(async (frame) => {
      const out = await process({
        image: new StaticImageContainer(frame),
        ...options
      });

      return out;
    })
  );

  const lines = [coreLibraryFactory(), 'frames=[]'];
  const frameFiles = [];
  const frameOutputMap: Record<string, string> = {};
  let frameFileBuffer = '';

  for (const animationFrame of animationFrames) {
    const frame = `;push(frames,${animationFrame})`;
    const next = frameFileBuffer + frame;

    if (next.length > 160000) {
      frameFiles.push(frameFileBuffer);
      frameFileBuffer = frame;
    } else {
      frameFileBuffer += frame;
    }
  }

  if (frameFileBuffer.length > 0) frameFiles.push(frameFileBuffer);

  for (let i = 0; i < frameFiles.length; i++) {
    const content = frameFiles[i];
    frameOutputMap[`frame${i}.src`] = content;
    lines.push(`import_code("./frame${i}.src")`);
  }

  lines.push(
    `i=0;while 1;print("",1);print(frames[i]);i=(i+1)%len(frames);wait(${delay});end while`
  );

  return {
    main: lines.join(';'),
    frames: frameOutputMap
  };
}
