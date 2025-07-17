#!/usr/bin/env -S node --no-warnings

const version = require('../package.json').version;
const program = require('commander')
const { parseMeasurement } = require('../dist/utils.js');
const { transformAnimation } = require('../dist/index.js');
const { writeFileSync } = require('fs');
const path = require('path');
const chalk = require('chalk');

let options = {};

program.version(version);
program
  .arguments('<filepath>')
  .arguments('[width]')
  .arguments('[height]')
  .description('Transform GIFs to TextMesh Rich-Tags output animation frames for Grey Hack.', {
    filepath: 'image to transform',
    width: 'output width of image',
    height: 'output height of image'
  })
  .action(function (filepath, width, height) {
    options.filepath = filepath;
    options.width = parseMeasurement(width, 16);
    options.height = parseMeasurement(height);
  })
  .option('-o, --output-directory <outputDirectory>', 'output directory')
  .option('-s, --scale <number>', 'scale of output')
  .option('-wa, --without-alpha', 'ignore alpha channel')
  .option('-d, --delay <number>', 'delay between frames');

program.parse(process.argv);

options = Object.assign(options, program.opts());

async function main() {
  const output = await transformAnimation(options);
  const outputDirectory = options.outputDirectory ?? process.cwd();

  for (const [filename, content] of Object.entries(output.frames)) {
    const outputPath = path.resolve(outputDirectory, filename);
    writeFileSync(outputPath, content);
    console.log(chalk.green(`Created file at ${outputPath}!`));
  }

  const outputPath = path.resolve(outputDirectory, 'image.src');

  writeFileSync(outputPath, output.main);
  console.log(chalk.green(`Created file at ${outputPath}!`));
}

main();