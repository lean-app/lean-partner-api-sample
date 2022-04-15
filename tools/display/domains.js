const fs = require('fs/promises');
const path = require('path');
const { from, map } = require('rxjs');

from(fs.readFile(path.join(__dirname, '../../aws-app/cdk-outputs.json'))).pipe(
  map((data) => JSON.parse(data)),
  map(({ AwsSampleStack }) => AwsSampleStack),
).subscribe({
  next: ({ ReactAppDomainName, WebhookEndpoint }) => console.table([{ 'React App Domain Name': ReactAppDomainName, 'Webhook Endpoint': WebhookEndpoint }]),
}) 