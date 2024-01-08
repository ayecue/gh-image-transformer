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
  return `¶=function(v,p)
    b="0123456789abcdef"
    q=function(z)
      o=""
      for k in z
        d=code(k)-100
        s=""
        for x in range(2)
          s=b[d%16]+s
          d=floor(d/16)
        end for
        o=o+s
      end for
      return o
    end function
    l=function()
      c=p[i]
      if c=="${OptimizedCodes.Black}" then
        return "#000000"
      else if c=="${OptimizedCodes.Invisible}" then
        return "#00000000"
      end if
      j=q(p[i:i+3])
      r=j[0]+j[1]
      g=j[2]+j[3]
      b=j[4]+j[5]
      a=j[6]+j[7]
      outer.i=i+2
      if a=="FF" then
        return "#"+r+g+b
      end if
      return "#"+r+g+b+a
    end function
    o=""
    i=0
    t=len(p)
    while i<t
      if p[i]=="${OptimizedCodes.White}" then
        o=o+"<sprite=0>"
      else
        o=o+"<sprite=0 color="+l+">"
      end if
      i=i+1
    end while
    return "<pos=0><voffset="+v+">"+o
  end function`
    .split('\n')
    .map((s) => s.trim())
    .join(';');
}
