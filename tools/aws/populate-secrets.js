const fs = require('fs/promises');
const readline = require('readline');
const yargs = require('yargs');

const { Temporal } = require('@js-temporal/polyfill');
const { Observable, from, concat, zip } = require('rxjs');
const { map, switchMap, tap, filter } = require('rxjs/operators');

const { command } = require('../cli');

const { verbose = false, forceUpdate = false } = yargs.argv ?? {};

const prompt = (question) => new Observable((observer) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question(question, (answer) => {
    rl.close();
    observer.next(answer);
    observer.complete();
  });
})

prompt('Do you want to update any secrets? (y/n) ').pipe(
  filter((answer) => answer.toLowerCase().startsWith('y')),
  switchMap(() => from(fs.readFile('./aws-app/cdk-outputs.json', {
    encoding: 'utf8',
  }))),
  map((data) => JSON.parse(data).AwsSampleStack),
  switchMap(({ LeanApiKeySecretId, LeanWebhookSecretId }) => zip(
    command(`aws secretsmanager describe-secret --secret-id ${LeanApiKeySecretId}`, { verbose }),
    command(`aws secretsmanager describe-secret --secret-id ${LeanWebhookSecretId}`, { verbose }),
  ).pipe(
    map((results) => results
      .map(({ data }) => JSON.parse(data))
      .map((( {LastChangedDate }) => Temporal.Instant.from(LastChangedDate)))
    ),
    map(([apiKeyChangeInstant, webhookSecretChangeInstant]) => {
      const tenMinutesAgo = Temporal.Now.instant().add({ minutes: -10 });

      const calls = [];
      if (forceUpdate || Temporal.Instant.compare(apiKeyChangeInstant, tenMinutesAgo) < 0) {
        calls.push(
          prompt('Enter Lean API key:\n').pipe(
            switchMap((userInput) => command(`aws secretsmanager put-secret-value --secret-id ${LeanApiKeySecretId} --secret-string ${userInput}`, { verbose })),
            tap(() => console.log('Api Key updated\n'))
          )
        );
      } else {
        console.log('The Api Key has been updated within the past ten minutes (https://docs.aws.amazon.com/secretsmanager/latest/userguide/reference_limits.html)');
        console.log('Please update it in the AWS console or use the --forceUpdate flag.\n');
      }

      if (forceUpdate || Temporal.Instant.compare(webhookSecretChangeInstant, tenMinutesAgo) < 0) {
        calls.push(
          prompt('Enter Lean Webhook Secret:\n').pipe(
            switchMap((userInput) => command(`aws secretsmanager put-secret-value --secret-id ${LeanWebhookSecretId} --secret-string ${userInput}`, { verbose })),
            tap(() => console.log('Webhook Secret updated\n'))
          )
        );
      } else {
        console.log('The Webhook Secret has been updated within the past ten minutes (https://docs.aws.amazon.com/secretsmanager/latest/userguide/reference_limits.html)');
        console.log('Please update it in the AWS console or use the --forceUpdate flag.\n');
      }

      return calls;
    }),
    switchMap((calls) => concat(...calls)))
  )
).subscribe();