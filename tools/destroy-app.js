const fs = require('fs/promises')
const path = require('path');
const { map, switchMap, from, tap, concat } = require('rxjs');
const { command } = require('./cli');


from(fs.readFile(path.join(__dirname, '../aws-app/cdk-outputs.json'))).pipe(
  map((data) => JSON.parse(data)),
  map(({ AwsSampleStack }) => AwsSampleStack.ReactAppBucketName),
  switchMap((bucketName) => concat(
    command(`aws s3 rm s3://${bucketName.trim()} --recursive`),
    command('cdk destroy', { 
      cwd: path.join(__dirname, '../aws-app'),
      verbose: true
    })
  ))
).subscribe({
  next: (value) => console.log(value),
  error: (value) => console.error(value),
  complete: () => console.log('Destroy complete'),
});
