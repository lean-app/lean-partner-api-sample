import * as path from 'path';

import { CfnOutput, Duration, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { IApiKey, Cors, LambdaIntegration, LambdaIntegrationOptions, RestApi, TokenAuthorizer, UsagePlan, IdentitySource } from 'aws-cdk-lib/aws-apigateway';
import { NodejsFunction, SourceMapMode } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { StaticWebsiteStack } from './stacks/StaticWebsite';

const createLambdaIntegration = (scope: Construct, { function: functionOptions, integration: integrationOptions }: {
  function: {
    name: string,
    path: string,
  }, 
  integration?: LambdaIntegrationOptions
}) => new LambdaIntegration(new NodejsFunction(scope, functionOptions.name, {
    entry: path.join(__dirname, functionOptions.path),
    handler: 'handler',
    bundling: {
      sourceMap: true,
      sourceMapMode: SourceMapMode.INLINE
    },
    timeout: Duration.seconds(10),
  }), integrationOptions);

export class AwsSampleStack extends Stack {
  api: RestApi;
  apiKey: IApiKey;
  apiUsagePlan: UsagePlan;

  webhookApi: RestApi;
  webhookApiKey: IApiKey;
  webhookApiUsagePlan: UsagePlan;

  client: StaticWebsiteStack;
  outputs: CfnOutput[] = [];

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    this.createStaticWebsite();
    this.createAPI();
    this.createWebHook();
    this.createOutputs();
  }

  createStaticWebsite() {
    this.client = new StaticWebsiteStack(this, 'LeanPartnerReactClient', { 
      removalPolicy: RemovalPolicy.DESTROY 
    });
  }

  createAPI() {
    /* API and Stack */
    this.api = new RestApi(this, 'InternalRestApi', { 
      defaultCorsPreflightOptions: {
        allowHeaders: Cors.DEFAULT_HEADERS,
        allowCredentials: true,
        allowOrigins: Cors.ALL_ORIGINS,
        allowMethods: Cors.ALL_METHODS
      },
    });

    this.api.root.addResource('customers');
    this.api.root.getResource('customers')?.addMethod('GET', createLambdaIntegration(this, {
      function: {
        name: 'GetCustomersHandler',
        path: '/lambda/api/customers/get.ts',
      }
    }), {
      apiKeyRequired: true
    });

    this.api.root.getResource('customers')?.addResource('{id}')
    this.api.root.getResource('customers')?.getResource('{id}')?.addMethod('GET', createLambdaIntegration(this, {
      function: {
        name: 'GetCustomerHandler',
        path: '/lambda/api/customers/{id}/get.ts',
      }
    }), {
      apiKeyRequired: true 
    });

    this.api.root.getResource('customers')?.addMethod('POST', createLambdaIntegration(this, {
      function: {
        name: 'PostCustomerHandler',
        path: '/lambda/api/customers/post.ts',
      }
    }), {
      apiKeyRequired: true 
    });

    this.apiUsagePlan = this.api.addUsagePlan('SampleAppUsagePlan', {
      throttle: {
        rateLimit: 10,
        burstLimit: 2
      }
    });

    this.apiKey = this.api.addApiKey('SampleAppApiKey');
    this.apiUsagePlan.addApiKey(this.apiKey);
    this.apiUsagePlan.addApiStage({
      api: this.api,
      stage: this.api.deploymentStage,
    });

    this.apiKey.applyRemovalPolicy(RemovalPolicy.DESTROY);
    this.apiUsagePlan.applyRemovalPolicy(RemovalPolicy.DESTROY);
    this.api.applyRemovalPolicy(RemovalPolicy.DESTROY);
  }

  createWebHook() {
    this.webhookApi = new RestApi(this, 'WebhookRestApi', { });
    this.webhookApi.root.addMethod('POST', createLambdaIntegration(this, {
      function: {
        name: 'PostWebhook',
        path: '/lambda/webhook/post.ts',
      }
    }), {
      authorizer: new TokenAuthorizer(this, 'WebhookTokenAuthorizer', {
        handler: new NodejsFunction(this, 'LeanWebhookTokenAuthorizer', {
            entry: path.join(__dirname, '/lambda/webhook/authorizer.ts'),
            handler: 'handler',
            bundling: {
              sourceMap: true,
              sourceMapMode: SourceMapMode.INLINE
            }
        }),
        identitySource: IdentitySource.header('Authorization')
      })
    });

    this.webhookApiUsagePlan = this.api.addUsagePlan('SampleAppWebhookUsagePlan', {
      throttle: {
        rateLimit: 10,
        burstLimit: 2
      }
    });

    this.webhookApiUsagePlan.addApiStage({
      api: this.webhookApi,
      stage: this.webhookApi.deploymentStage,
    });

    this.webhookApiUsagePlan.applyRemovalPolicy(RemovalPolicy.DESTROY);
    this.webhookApi.applyRemovalPolicy(RemovalPolicy.DESTROY);
  }

  createOutputs() {
    this.outputs = [
      new CfnOutput(this, 'ReactAppDomainName', {
        value: `${this.client.distribution.distributionDomainName}`
      })
    ];
  }
}
