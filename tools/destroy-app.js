const { exec } = require('child_process');

const call = async (command) =>  (new Promise ((resolve, reject) => {
  exec(command, (error, stdout, stderr) => {
    if (error || stderr) {
      console.error(error || stderr);
      return reject(error || stderr);
    }

    resolve(stdout.trim());
  })
}));

(async () => {
  const bucketName = await call(`grep -o '"ReactAppBucketName": "[^"]*' ${path.join(__dirname, '../aws-app/cdk-outputs.json')} | grep -o '[^"]*$'`);

  await call(`aws s3 rm s3://${bucketName.trim()} --recursive`);
  await call(`cd ./aws-app && cdk destroy`);
})();