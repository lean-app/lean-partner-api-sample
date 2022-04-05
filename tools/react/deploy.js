const path = require('path');
const fs = require('fs/promises');

const { command } = require('../cli');

(async () => {
  const { AwsSampleStack: {
    ReactAppDomainName, ReactAppBucketName
  } } = JSON.parse(await fs.readFile('./aws-app/cdk-outputs.json'));

  command(`aws s3 sync ${path.join(__dirname, '../../react-app')} s3://${ReactAppBucketName}`).subscribe({
    next: (buffer) => console.log(buffer.toString()),
    error: (err) => console.error(err),
    complete: () => [ console.log('Deployment complete'), console.log(`App Url ${ReactAppDomainName}`) ],
  });
})();