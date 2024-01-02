#!/usr/bin/env -S node --no-warnings

const { transform, parseMeasurement } = require('../dist/index.js')
const [t, w, h] = process.argv.slice(2);

if (t === '--help' || t === '-h') {
  console.log(`gh-image-transformer <image> [width] [height]`);
  process.exit(0);
}

const sanatizedWidth = parseMeasurement(w, 128);
const sanatizedHeight = parseMeasurement(h);

transform(t, sanatizedWidth, sanatizedHeight);