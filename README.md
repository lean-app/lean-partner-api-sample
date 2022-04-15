
Prerequisites
===
* [Docker](https://docs.docker.com/get-docker/)
* [NodeJS](https://nodejs.org/en/download/)
* [AWS CLI](https://aws.amazon.com/cli/)
* [AWS CDK](https://docs.aws.amazon.com/cdk/v2/guide/work-with.html)

Installation
===
1. Install and start Docker
2. Install NodeJS
3. Install the [AWS CLI](https://aws.amazon.com/cli/)
4. Install the [AWS CDK](https://docs.aws.amazon.com/cdk/v2/guide/work-with.html)
4. `npm run quickstart`

Available Scripts
===
Deploy the AWS application
> `npm run aws:deploy`

Generate the React App Config
> `npm run react:config:generate`

Build the React App
> `npm run react:build`

Deploy the React App
> `npm run react:deploy` 

Populate the API Key and Webhook Secret
> `npm run aws:secrets:populate`

Taking it down
> `npm run destroy`
