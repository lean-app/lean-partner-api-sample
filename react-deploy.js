const { exec } = require('child_process');

const call = async (command, { silent = false } = { }) =>  (new Promise ((resolve, reject) => {
  exec(command, (error, stdout, stderr) => {
    if (error || stderr) {
      console.error(error.trim() || stderr.trim());
      return reject(error.trim() || stderr.trim());
    }

    return resolve(silent ? '' : stdout.trim());
  })
}));

(async () => {
  const websiteUrl = await call(`grep -o '"ReactAppDomainName": "[^"]*' ./aws-app/cdk-outputs.json | grep -o '[^"]*$'`);
  const bucketName = await call(`grep -o '"ReactAppBucketName": "[^"]*' ./aws-app/cdk-outputs.json | grep -o '[^"]*$'`);
  await call(`aws s3 sync ./react-app/build s3://${bucketName}`, {
    silent: true
  });

  console.log(`App Url: ${websiteUrl}`);
})();