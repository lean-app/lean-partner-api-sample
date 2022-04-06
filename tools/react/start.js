#!/usr/bin/env node
const path = require('path');

const { command } = require('../cli');
const { verbose = false, silent = false } = require('yargs').argv;

command(`npm start`, {
  cwd: path.join(__dirname, '../../react-app'),
  verbose, silent
}).subscribe({
  error: (err) => console.error({ error: err.toString() }),
});