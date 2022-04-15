# Lean Partner Sample
This sample repository sets up barebones partner infrastructure to integrate with the Lean Sandbox Partner API. A quickstart command is available that will spin up the app automatically after installing the prerequesite packages.
## Prerequisites
* [Docker](https://docs.docker.com/get-docker/)
* [NodeJS](https://nodejs.org/en/download/)
* [AWS CLI](https://aws.amazon.com/cli/)
* [AWS CDK](https://docs.aws.amazon.com/cdk/v2/guide/work-with.html)

## Installation
1. Install and start Docker
2. Install NodeJS
3. Install the [AWS CLI](https://aws.amazon.com/cli/)
4. Install the [AWS CDK](https://docs.aws.amazon.com/cdk/v2/guide/work-with.html)
5. `npm run quickstart`

> To complete integration you must create an API Key and set up your Webhook.
> 
> 1. Sign into your Lean Admin Portal (https://admin.sandbox.withlean.com). 
> 2. Navigate to the Developers tab.
> 3. Create an API Key and store it somewhere safe.
> 4. Click Create Endpoint
> 5. Enter your Webhook Endpoint URL.
> 6. Store the webhook secret somewhere safe.

## Teardown
`npm run destroy`