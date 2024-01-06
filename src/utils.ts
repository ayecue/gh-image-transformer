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
      return b[floor(z/16)]+b[z%16]
    end function
    l=function(c)
      if c=="${OptimizedCodes.White}" then
        return "#FFFFFF"
      else if c=="${OptimizedCodes.Black}" then
        return "#000000"
      else if c=="${OptimizedCodes.Invisible}" then
        return "#00000000"
      end if
      j=@code
      r=q(j(c[1])-100)
      g=q(j(c[2])-100)
      b=q(j(c[3])-100)
      if len(c)==5 then
        a=q(j(c[4])-100)
        return "#"+r+g+b+a
      end if
      return "#"+r+g+b
    end function
    o=""
    i=indexOf(p,"#")
    n=null
    while i!=null
      n=indexOf(p,"#",i)
      o=o+"<sprite=0 color="+l(p[i:n])+">"
      i=n
    end while
    if n!=null then o=o+"<sprite=0 color="+l(p[n:])+">"
    return "<pos=0><voffset="+v+">"+o
  end function`
    .split('\n')
    .map((s) => s.trim())
    .join(';');
}
