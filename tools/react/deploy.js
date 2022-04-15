#!/usr/bin/env node

const path = require('path');
const fs = require('fs/promises');

const { concat, from } = require('rxjs');
const { tap, map, switchMap } = require('rxjs/operators');

const { command } = require('../cli');
const { verbose = false, silent = false } = require('yargs').argv;

from(fs.readFile(path.join(__dirname, '../../aws-app/cdk-outputs.json'), {
  encoding: 'utf8',
})).pipe(
  map((data) => JSON.parse(data).AwsSampleStack),
  switchMap(({ ReactAppDomainName, ReactAppBucketName }) => concat(
    command(`aws s3 rm s3://${ReactAppBucketName} --recursive`, { verbose })
      .pipe(
        tap(() => !silent && [
          console.log('Bucket emptied'), 
          console.log(ReactAppBucketName)
        ]),
      ),
    command(`aws s3 sync ./build s3://${ReactAppBucketName}`, {
      cwd: path.join(__dirname, '../../react-app'),
    }).pipe(
        tap(() => !silent && console.log('Bucket synced')),
        tap(() => !silent && console.log('App url: https://' + ReactAppDomainName))
      )
  ))
).subscribe({
  error: (err) => console.error(err),
  complete: () => !silent && console.log('React deployment complete')
})
