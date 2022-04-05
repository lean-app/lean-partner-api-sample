const call = require('../cli');

(async () => {
  const websiteUrl = await call(`grep -o '"ReactAppDomainName": "[^"]*' ./aws-app/cdk-outputs.json | grep -o '[^"]*$'`);
  const bucketName = await call(`grep -o '"ReactAppBucketName": "[^"]*' ./aws-app/cdk-outputs.json | grep -o '[^"]*$'`);
  await call(`aws s3 sync ./react-app/build s3://${bucketName}`, {
    silent: true
  });

  console.log(`App Url: ${websiteUrl}`);
})();