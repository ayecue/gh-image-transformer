# gh-image-transformer

This CLI does not only transform images into TextMesh Pro Rich-Text tags for Grey Hack but also creates animation frames out of GIFs which are usable in Grey Hack.

# Install

```bash
npm install -g gh-image-transformer
```

# Usage

##  Image transformer

```
Usage: gh-image-transformer [options] <filepath> [width] [height]

Transform images to TextMesh Rich-Tags output for Grey Hack.

Arguments:
  filepath                                  image to transform
  width                                     output width of image
  height                                    output height of image

Options:
  -V, --version                             output the version number
  -o, --output-directory <outputDirectory>  output directory
  -s, --scale <number>                      scale of output
  -wa, --without-alpha                      ignore alpha channel
  -h, --help                                display help for command
```

##  Animation transformer

```
Usage: gh-animation-transformer [options] <filepath> [width] [height]

Transform GIFs to TextMesh Rich-Tags output animation frames for Grey Hack.

Arguments:
  filepath                                  image to transform
  width                                     output width of image
  height                                    output height of image

Options:
  -V, --version                             output the version number
  -o, --output-directory <outputDirectory>  output directory
  -s, --scale <number>                      scale of output
  -wa, --without-alpha                      ignore alpha channel
  -d, --delay <number>                      delay between frames
  -h, --help                                display help for command
```

# How to

## Static Image

Static images can be simply transformed into TextMesh Pro Rich-Text tags by using:
```bash
gh-image-transformer path/to/image.png
```

Optionally you can also select the width and height. By default, it will resize the image by a width of `64px`. If you want to resize the image by height just place a `-1` at the spot of the `width`.

~~Keep in mind that the images should be kept below 100px since Grey Hack has a limit of `160000` characters for each print line.~~ :warning: **Recently Grey Hack changed to character limit of tags per print line to `2048`. Anything above that causes the image to be displayed incorrectly. So unfortunately for now images have to be very small.**

Associated changelog for this:
> \- Fixed bug that could cause a crash and an unexpected game shutdown when using certain tags in scripting within an infinite loop.

Introduced via version **v0.9.5683** (public) and **v0.9.5905E** (nightly).


Via the additional options, you can also change the scale of each pixel by default that value is `2`. It is not recommended to go lower since that will cause vertical space between lines.

## GIF

GIFs can be transformed into TextMesh Pro Rich-Text tags animation frames by using:
```bash
gh-animation-transformer path/to/image.gif
```

The options of the animation transformer are the same as the ones from the normal image transformer. There is only one additional option which is about the delay between each frame.

**Note**: It is <u>highly recommended</u> to use either [greybel-js](https://github.com/ayecue/greybel-js) or [greybel-vs](https://github.com/ayecue/greybel-vs) to import animations otherwise you end up with a lot of copy paste depending on how many frames the GIF got.

In case you are using greybel-js you just need to execute `greybel path/to/image.src`. It is recommended to use the `--create-ingame` flag to avoid copy-pasting all the files.

If you are using greybel-vs you just need to right click on the `image.src` and select `build`. To make it more convenient please make sure to activate the `create-ingame` option.

# Example output

![Example output](/assets/example.png?raw=true "Example image")

![Example animation output](/assets/animation.gif?raw=true "Example animation")