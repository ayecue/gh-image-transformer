import { OptimizedCodes } from './compress';
import { ImageSize } from './image-container';

export function parseMeasurement(
  arg: string,
  defaultValue: number = ImageSize.Auto
): number {
  if (arg === undefined || arg === '') return defaultValue;

  const num = Number(arg);

  if (isNaN(num)) {
    return defaultValue;
  }

  return num;
}

export function rbgValueToHexValue(item: number) {
  const hex = item.toString(16);
  return `0${hex}`.slice(-2);
}

export function rgbToHex(r: number, g: number, b: number) {
  return `#${rbgValueToHexValue(r)}${rbgValueToHexValue(g)}${rbgValueToHexValue(
    b
  )}`;
}

export function rgbToHexWithAlpha(r: number, g: number, b: number, a: number) {
  return `${rgbToHex(r, g, b)}${rbgValueToHexValue(a)}`;
}

export function coreLibraryFactory() {
  return `¶=function(vposition, content)
    CHARACTERS="0123456789abcdef"
    decompress=function(segment)
      out=""
      for item in segment
        val = code(item) - 100
        temp = ""
        for i in range(2)
          temp = CHARACTERS[val % 16] + temp
          val = floor(val / 16)
        end for
        out = out + temp
      end for
      return out
    end function
    next=function()
      decompressed = decompress(content[index : index+3])
      r = decompressed[0] + decompressed[1]
      g = decompressed[2] + decompressed[3]
      b = decompressed[4] + decompressed[5]
      a = decompressed[7] + decompressed[8]
      if upper(a)=="FF" then
        return "#"+r+g+b
      end if
      return "#"+r+g+b+a
    end function
    line = ""
    index = 0
    max = len(content)
    while index < max
      charVal = content[index]
      if charVal == "${OptimizedCodes.White}" then
        line = line + "<sprite=0>"
      else if charVal == "${OptimizedCodes.Black}" then
        line = line + "<sprite=0 color=#000000>"
      else if charVal == "${OptimizedCodes.Invisible}" then
        line = line + "<sprite=0 color=#00000000>"
      else
        line = line + "<sprite=0 color=" + next + ">"
        index = index + 2
      end if
      index = index + 1
    end while
    return "<pos=0><voffset=" + vposition + ">" + line
  end function`
    .split('\n')
    .map((s) => s.trim())
    .join(';');
}
