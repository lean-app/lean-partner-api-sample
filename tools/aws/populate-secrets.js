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
});

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
    map((results) => results.map(({ data }) => JSON.parse(data))),
    switchMap(([apiKeySecret, webhookSecret]) => concat(...[
      getSecretUpdatePrompt('Lean API Key', apiKeySecret, { forceUpdate }),
      getSecretUpdatePrompt('Lean Webhook Secret', webhookSecret, { forceUpdate }),
    ].filter((call) => !!call))),
  ))
).subscribe();