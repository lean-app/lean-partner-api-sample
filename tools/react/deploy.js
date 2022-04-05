const path = require('path');
const fs = require('fs/promises');
const { concat } = require('rxjs');
const { tap, map, toArray } = require('rxjs/operators');

const { command } = require('../cli');

(async () => {
  const { AwsSampleStack: {
    ReactAppDomainName, ReactAppBucketName
  } } = JSON.parse(await fs.readFile('./aws-app/cdk-outputs.json'));

  concat(
    command(`aws s3 rm s3://${ReactAppBucketName} --recursive`).pipe(
      toArray(),
      map(() => 'Bucket emptied'),
    ),
    command(`aws s3 sync ${path.join(__dirname, '../../react-app/build')} s3://${ReactAppBucketName}`).pipe(
      tap((buffer) => console.log(buffer.toString())),
      toArray(),
      map(() => 'Bucket synced'),
    ),
  ).subscribe({
    next: (message) => console.log(message),
    error: (err) => console.error(err),
    complete: () => [ console.log('Deployment complete'), console.log(`App Url ${ReactAppDomainName}`) ],
  });
})();