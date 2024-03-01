'use strict';

const path = require('path');

const PATHS = {
  src: path.resolve(__dirname, '../src'),
  injectSrc: path.resolve(__dirname, '../src/js_inject'),
  build: path.resolve(__dirname, '../build'),
};

module.exports = PATHS;
