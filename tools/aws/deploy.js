#!/usr/bin/env node
const yargs = require('yargs');
const path = require('path');
const { of } = require('rxjs');
const { tap, switchMap } = require('rxjs/operators');

const { command } = require('../cli');

(async () => {
  const { verbose = false, silent = false } = yargs.argv ?? { };
  const awsAppFolderCommand = (input) => command(input, {
    cwd: path.join(__dirname, '../../aws-app'),
    verbose
  });

  of('AWS Deployment').pipe(
    tap((message) => !silent && console.log(message.toString())),
    switchMap(() => awsAppFolderCommand(`npm install`)),
    tap(() => !silent && console.log('Running CDK Bootstrap')),
    switchMap(() => awsAppFolderCommand(`cdk bootstrap`)),
    tap(() => !silent && console.log('Running CDK Deploy')),
    switchMap(() => awsAppFolderCommand(`cdk deploy --outputs-file ./cdk-outputs.json`)),
  ).subscribe({
    error: (err) => console.error({ error: err.toString() }),
    complete: () => !silent && console.log('AWS Deployment complete'),
  });
})();