#!/usr/bin/env -S node --no-warnings

const version = require('../package.json').version;
const program = require('commander')
const { transform, parseMeasurement } = require('../dist/index.js')

let options = {};

program.version(version);
program
  .arguments('<filepath>')
  .arguments('[width]')
  .arguments('[height]')
  .description('Transform images to TextMesh Rich-Tags output for Grey Hack.', {
    filepath: 'Image to transform',
    width: 'Output width of image',
    height: 'Output height of image'
  })
  .action(function (filepath, width, height) {
    console.log(filepath);
    options.filepath = filepath;
    options.width = parseMeasurement(width, 64);
    options.height = parseMeasurement(height);
  })
  .option('-o, --output-directory <outputDirectory>', 'Output directory')
  .option('-s, --scale <number>', 'Scale of output');

program.parse(process.argv);

options = Object.assign(options, program.opts());

transform(options);