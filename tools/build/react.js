#!/usr/bin/env node
const path = require('path');

const { command } = require('../cli');
const { verbose = false, silent = false } = require('yargs').argv;

command(`npm run build`, {
  cwd: path.join(__dirname, '../../react-app'),
  verbose
}).subscribe({
  error: (err) => console.error({ error: err.toString() }),
  complete: () => !silent && console.log('React build complete'),
});