#!/usr/bin/env node
const path = require('path');
const fs = require('fs/promises');
const { concat } = require('rxjs');
const { tap, map, toArray } = require('rxjs/operators');

const { command } = require('../cli');

const yargs = require('yargs');

(async () => {
  const { verbose = false, silent = false } = yargs.argv ?? { };
  const { AwsSampleStack: {
    ReactAppDomainName, ReactAppBucketName
  } } = JSON.parse(await fs.readFile('./aws-app/cdk-outputs.json'));

  concat(
    command(`aws s3 rm s3://${ReactAppBucketName} --recursive`).pipe(
      tap((buffer) => silent || (verbose && console.log(buffer.toString()))),
      toArray(),
      map(() => 'Bucket emptied'),
    ),
    command(`aws s3 sync ${path.join(__dirname, '../../react-app/build')} s3://${ReactAppBucketName}`).pipe(
      tap((buffer) => silent || (verbose && console.log(buffer.toString()))),
      toArray(),
      map(() => 'Bucket synced'),
    ),
  ).subscribe({
    next: (message) => !silent && console.log(message),
    error: (err) => console.error(err),
    complete: () => !silent && [ 
      console.log('Deployment complete'), 
      console.log(`App Url ${ReactAppDomainName}`) 
    ],
  });
})();