import { Image } from 'imagescript';

export enum ImageSize {
  Auto = -1
}

export interface ImageObject {
  bitmap: Uint8ClampedArray;
  get width(): number;
  get height(): number;
}

export abstract class ImageContainer {
  public ref: ImageObject;

  constructor(obj: ImageObject) {
    this.ref = obj;
  }

  abstract resize(w: number, h: number): ImageContainer;
  abstract scan(
    f: (
      this: ImageObject,
      x: number,
      y: number,
      rgba: Uint8ClampedArray
    ) => void
  ): void;

  get bitmap() {
    return this.ref.bitmap;
  }

  get width() {
    return this.ref.width;
  }

  get height() {
    return this.ref.height;
  }
}

export class StaticImageContainer extends ImageContainer {
  public ref: Image;

  constructor(obj: Image) {
    super(obj);
    this.ref = obj;
  }

  resize(w: number, h: number) {
    return new StaticImageContainer(this.ref.resize(w, h));
  }

  scan(
    f: (
      this: ImageObject,
      x: number,
      y: number,
      rgba: Uint8ClampedArray
    ) => void
  ) {
    for (let y = 1; y < this.ref.height; y++) {
      for (let x = 1; x < this.ref.width; x++) {
        const rgba = this.ref.getRGBAAt(x, y);
        f.call(this.ref, x, y, rgba);
      }
    }
  }
}
