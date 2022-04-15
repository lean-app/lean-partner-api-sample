const fs = require('fs/promises');
const yargs = require('yargs');

const { Temporal } = require('@js-temporal/polyfill');
const { from, concat, zip } = require('rxjs');
const { map, switchMap, tap, filter } = require('rxjs/operators');

const { command, prompt } = require('./cli');

const { verbose = false, forceUpdate = false } = yargs.argv ?? {};


const tenMinutesAgo = Temporal.Now.instant().subtract({ minutes: 10 });
const getSecretUpdatePrompt = (label, secret, { forceUpdate }) => {
  const changeInstant = Temporal.Instant.from(secret.LastChangedDate);
  if (!forceUpdate && !Temporal.Instant.compare(changeInstant, tenMinutesAgo) < 0) {
    return;
  }

  return prompt(`${label}: `).pipe(
    switchMap((userInput) => command(`aws secretsmanager put-secret-value --secret-id ${secret.ARN} --secret-string ${userInput}`, { verbose })),
    tap(() => console.log(`${label} updated\n`)),
  );
};

const instructions = `
To complete integration you must create an API Key and set up your Webhook.

1. Sign into your Lean Admin Portal (https://admin.sandbox.withlean.com). 
2. Navigate to the Developers tab.
3. Create an API Key and store it somewhere safe.
4. Click Create Endpoint
5. Enter your Webhook Endpoint URL.
6. Store the webhook secret somewhere safe.

Press Return to continue...
`.trim();

prompt(instructions).pipe(
  switchMap(() => prompt('Do you want to update any secrets? (y/n) ')),
  filter((answer) => answer.toLowerCase().startsWith('y')),
  switchMap(() => from(fs.readFile('./aws-app/cdk-outputs.json', {
    encoding: 'utf8',
  }))),
  map((data) => JSON.parse(data).AwsSampleStack),
  switchMap(({ LeanApiKeySecretId, LeanWebhookSecretId }) => zip(
    command(`aws secretsmanager describe-secret --secret-id ${LeanApiKeySecretId}`, { verbose }),
    command(`aws secretsmanager describe-secret --secret-id ${LeanWebhookSecretId}`, { verbose }),
  ).pipe(
    map((results) => results.map(({ data }) => JSON.parse(data))),
    switchMap(([apiKeySecret, webhookSecret]) => concat(...[
      getSecretUpdatePrompt('Lean API Key', apiKeySecret, { forceUpdate }),
      getSecretUpdatePrompt('Lean Webhook Secret', webhookSecret, { forceUpdate }),
    ].filter((call) => !!call))),
  ))
).subscribe();