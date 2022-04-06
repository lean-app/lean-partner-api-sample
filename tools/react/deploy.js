#!/usr/bin/env node

const path = require('path');
const fs = require('fs/promises');

const { concat } = require('rxjs');
const { tap } = require('rxjs/operators');

const { command } = require('../cli');
const { verbose = false, silent = false } = require('yargs').argv;


fs.readFile('./aws-app/cdk-outputs.json')
  .then((data) => JSON.parse(data))
  .then(({ 
    AwsSampleStack: {
      ReactAppDomainName, ReactAppBucketName
    } 
  }) => concat(
      command(`aws s3 rm s3://${ReactAppBucketName} --recursive`, {
        verbose
      }).pipe(
        tap(() => !silent && console.log('Bucket emptied')),
      ),
      command(`aws s3 sync ./build')} s3://${ReactAppBucketName}`, {
        cwd: path.join(__dirname, '../../react-app'),
      }).pipe(
        tap(() => !silent && console.log('Bucket synced')),
      ),
    ).pipe(
      take(1),
      tap(() => !silent && console.log('App url: https://' + ReactAppDomainName))
    ).subscribe({
      error: (err) => console.error(err),
      complete: () => !silent && console.log('React deployment complete')
    })
  );