
## Prerequisites
(Docker)[https://docs.docker.com/get-docker/]
(NodeJS)[https://nodejs.org/en/download/]
(AWS CDK)[https://docs.aws.amazon.com/cdk/v2/guide/work-with.html]
## Installation
### Quick Start
1. Add you Lean API Key and Webhook Secret to `./aws-app/config.ts`
2. `npm run quickstart`

### Step by Step
These steps allow you to execute each step of a deployment individually

1. Add you Lean API Key and Webhook Secret to `./aws-app/config.ts`
2. `npm run aws:deploy`
3. `npm run react:generate:config`
4. `npm react:build`
5. `npm react:deploy`

## Taking it down
1. `npm run destroy`