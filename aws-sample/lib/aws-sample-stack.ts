import * as path from 'path';

import { CfnOutput, Duration, Fn, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { IApiKey, Cors, LambdaIntegration, LambdaIntegrationOptions, RestApi, TokenAuthorizer, UsagePlan, IdentitySource, RequestAuthorizer, AuthorizationType, IAuthorizer, Model, JsonSchemaType, RequestValidator } from 'aws-cdk-lib/aws-apigateway';
import { NodejsFunction, SourceMapMode } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { StaticWebsiteStack } from './stacks/StaticWebsite';
import { AttributeType, Table } from 'aws-cdk-lib/aws-dynamodb';
import { throws } from 'assert';

const createLambdaIntegration = (scope: Construct, { function: functionOptions, integration: integrationOptions }: {
  function: {
    name: string,
    path: string,
    process?: (fn: NodejsFunction) => any
  }, 
  integration?: LambdaIntegrationOptions
}) => {
  const fn = new NodejsFunction(scope, functionOptions.name, {
    entry: path.join(__dirname, functionOptions.path),
    handler: 'handler',
    bundling: {
      sourceMap: true,
      sourceMapMode: SourceMapMode.INLINE
    },
    timeout: Duration.seconds(10),
  });

  functionOptions.process?.(fn);

  return new LambdaIntegration(fn, integrationOptions);
};

export class AwsSampleStack extends Stack {
  api: RestApi;
  apiKey: IApiKey;
  apiUsagePlan: UsagePlan;

  webhookApi: RestApi;
  webhookApiKey: IApiKey;
  webhookApiUsagePlan: UsagePlan;
  webhookAuthorizer: RequestAuthorizer;

  client: StaticWebsiteStack;
  outputs: CfnOutput[] = [];

  _table: Table;
  get table(): Table {
    if (this._table instanceof Table) {
      return this._table;
    }
    
    this.createDynamoTable();
    return this._table;
  };

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

  createDynamoTable() {
    this._table = new Table(this, 'PartnerTable', {
      tableName: 'PartnerTable',
      partitionKey: {
        name: 'pk',
        type: AttributeType.STRING
      },
      sortKey: {
        name: 'sk',
        type: AttributeType.STRING
      }
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

    this.webhookAuthorizer = new TokenAuthorizer(this, 'WebhookTokenAuthorizer', {
      handler: new NodejsFunction(this, 'LeanWebhookAuthorizerFunction', {
          entry: path.join(__dirname, '/lambda/webhook/authorizer.ts'),
          handler: 'handler',
          bundling: {
            sourceMap: true,
            sourceMapMode: SourceMapMode.INLINE
          },
      }),
      identitySource: IdentitySource.header('x-lean-signature'),
      resultsCacheTtl: Duration.minutes(0),
    });


    this.webhookApi.root.addMethod('POST', createLambdaIntegration(this, {
      function: {
        name: 'PostWebhook',
        path: '/lambda/webhook/post.ts',
        process: (fn: NodejsFunction) => this.table.grantWriteData(fn)
      }
    }), {
      authorizer: this.webhookAuthorizer,
      authorizationType: AuthorizationType.CUSTOM,
      requestValidator: new RequestValidator(this, 'WebhookRequestValidator', {
        restApi: this.webhookApi,
        validateRequestBody: true
      }), 
      requestModels: {
        'application/json': new Model(this, 'WebhookJSONEventModel', {
          contentType: 'application/json',
          restApi: this.webhookApi,
          schema: {
            type: JsonSchemaType.OBJECT,
            properties: {
              event: {
                type: JsonSchemaType.STRING,
                pattern: '.+\\..+'
              },
              data: {
                type: JsonSchemaType.OBJECT
              }
            }
          }
        })
      }
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
    this.webhookAuthorizer.applyRemovalPolicy(RemovalPolicy.DESTROY);
  }

  createOutputs() {
    this.outputs = [
      new CfnOutput(this, 'ReactAppDomainName', {
        value: `${this.client.distribution.distributionDomainName}`
      })
    ];
  }
}
