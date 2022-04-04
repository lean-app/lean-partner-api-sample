const { exec } = require('child_process');

const call = async (command) =>  (new Promise ((resolve, reject) => {
  exec(command, (error, stdout, stderr) => {
    if (error || stderr) {
      console.error(error || stderr);
      return reject(error || stderr);
    }

    resolve(stdout);
  })
}));

(async () => {
  const bucketName = await call(`grep -o '"ReactAppBucketName": "[^"]*' ./aws-app/cdk-outputs.json | grep -o '[^"]*$'`);
  const result = await call(`aws s3 sync ./react-app/build s3://${bucketName}`);
})();