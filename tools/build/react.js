#!/usr/bin/env node
const path = require('path');
const { switchMap } = require('rxjs');

const { command } = require('../cli');
const { verbose = false, silent = false } = require('yargs').argv;

command(`npm install`, {
  cwd: path.join(__dirname, '../../react-app'),
  verbose
}).pipe(
  switchMap(() => command(`npm run build`, {
    cwd: path.join(__dirname, '../../react-app'),
    verbose
  }))
).subscribe({
  error: (err) => console.error({ error: err.toString() }),
  complete: () => !silent && console.log('React build complete'),
});