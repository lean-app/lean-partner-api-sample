import * as path from 'path';
import { WebSocketLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import { WebSocketApi } from '@aws-cdk/aws-apigatewayv2-alpha';

import { CfnOutput, Duration, Fn, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { IApiKey, Cors, LambdaIntegration, LambdaIntegrationOptions, RestApi, TokenAuthorizer, UsagePlan, IdentitySource, RequestAuthorizer, AuthorizationType, IAuthorizer, Model, JsonSchemaType, RequestValidator } from 'aws-cdk-lib/aws-apigateway';
import { NodejsFunction, SourceMapMode } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { StaticWebsiteStack } from './stacks/StaticWebsite';
import { AttributeType, Table } from 'aws-cdk-lib/aws-dynamodb';

interface NodeJsFunctionOptions {
  name: string,
  entry: string,
  handler?: string,
  process?: (fn: NodejsFunction) => any,
};

const createNodeJsFunction = (scope: Construct, options: NodeJsFunctionOptions) => {
  const { name, entry, handler = 'handler', process } = options;

  const fn = new NodejsFunction(scope, name, {
    entry: path.join(__dirname, entry),
    handler,
    bundling: {
      sourceMap: true,
      sourceMapMode: SourceMapMode.INLINE
    },
    timeout: Duration.seconds(10),
  });

  process?.(fn);

  return fn;
};

const createLambdaIntegration = (scope: Construct, { function: functionOptions, integration: integrationOptions }: {
  function: NodeJsFunctionOptions, 
  integration?: LambdaIntegrationOptions
}) => {
  const fn = createNodeJsFunction(scope, functionOptions);
  return new LambdaIntegration(fn, integrationOptions);
};

export class AwsSampleStack extends Stack {
  leanApi: RestApi;
  leanApiKey: IApiKey;
  leanApiUsagePlan: UsagePlan;

  webhookApi: RestApi;
  webhookApiKey: IApiKey;
  webhookApiUsagePlan: UsagePlan;
  webhookAuthorizer: RequestAuthorizer;

  webSocketApi: WebSocketApi;

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
    this.createCustomerApi();
    this.createWebHook();
    this.createOutputs();
  }

  createStaticWebsite() {
    this.client = new StaticWebsiteStack(this, 'LeanPartnerReactClient', { 
      removalPolicy: RemovalPolicy.DESTROY 
    });
  }

  createDynamoTable() {
    const table = new Table(this, 'PartnerTable', {
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
    
    table.applyRemovalPolicy(RemovalPolicy.DESTROY);
    this._table = table;
  }

  createCustomerApi() {
    /* API and Stack */
    this.leanApi = new RestApi(this, 'LeanApi', { 
      defaultCorsPreflightOptions: {
        allowHeaders: Cors.DEFAULT_HEADERS,
        allowCredentials: true,
        allowOrigins: Cors.ALL_ORIGINS,
        allowMethods: Cors.ALL_METHODS
      },
    });

    this.leanApi.root.addResource('customers');
    this.leanApi.root.getResource('customers')?.addMethod('GET', createLambdaIntegration(this, {
      function: {
        name: 'GetCustomersHandler',
        entry: '/lambda/api/customers/get.ts',
      }
    }), {
      apiKeyRequired: true
    });

    this.leanApi.root.getResource('customers')?.addResource('{id}')
    this.leanApi.root.getResource('customers')?.getResource('{id}')?.addMethod('GET', createLambdaIntegration(this, {
      function: {
        name: 'GetCustomerHandler',
        entry: '/lambda/api/customers/{id}/get.ts',
      }
    }), {
      apiKeyRequired: true 
    });

    this.leanApi.root.getResource('customers')?.addMethod('POST', createLambdaIntegration(this, {
      function: {
        name: 'PostCustomerHandler',
        entry: '/lambda/api/customers/post.ts',
      }
    }), {
      apiKeyRequired: true,
      requestValidator: new RequestValidator(this, 'PostCustomerRequestValidator', {
        restApi: this.leanApi,
        validateRequestBody: true
      }), 
      requestModels: {
        'application/json': new Model(this, 'PostCustomerJSONEventModel', {
          contentType: 'application/json',
          restApi: this.leanApi,
          schema: {
            type: JsonSchemaType.OBJECT,
            properties: {
              partnerUserId: {
                type: JsonSchemaType.STRING,
              },
              firstName: {
                type: JsonSchemaType.STRING,
              },
              middleName: {
                type: JsonSchemaType.STRING,
              },
              lastName: {
                type: JsonSchemaType.STRING,
              },
              email: {
                type: JsonSchemaType.STRING,
              },
              street: {
                type: JsonSchemaType.STRING,
              },
              city: {
                type: JsonSchemaType.STRING,
              },
              state: {
                type: JsonSchemaType.STRING,
              },
              postalCode: {
                type: JsonSchemaType.STRING,
              },
              phoneNumber: {
                type: JsonSchemaType.STRING,
              },
              birthday: {
                type: JsonSchemaType.STRING,
              },
            },
            required: [
              'firstName',
              'lastName',
              'email',
              'street',
              'city',
              'state',
              'postalCode',
              'phoneNumber',
              'birthday',
            ]
          }
        })
      }
    });

    /** Gig Api -- Split into microservice, proxy routes to external api */
    this.leanApi.root.addResource('gig');
    this.leanApi.root.getResource('gig')?.addMethod('POST', createLambdaIntegration(this, {
      function: {
        name: 'PostGigHandler',
        entry: '/lambda/api/gig/post.ts',
      }
    }), {
      apiKeyRequired: true
    });

    this.leanApiUsagePlan = this.leanApi.addUsagePlan('SampleAppUsagePlan', {
      throttle: {
        rateLimit: 10,
        burstLimit: 2
      }
    });

    this.leanApiKey = this.leanApi.addApiKey('SampleAppApiKey');
    this.leanApiUsagePlan.addApiKey(this.leanApiKey);
    this.leanApiUsagePlan.addApiStage({
      api: this.leanApi,
      stage: this.leanApi.deploymentStage,
    });

    this.leanApiKey.applyRemovalPolicy(RemovalPolicy.DESTROY);
    this.leanApiUsagePlan.applyRemovalPolicy(RemovalPolicy.DESTROY);
    this.leanApi.applyRemovalPolicy(RemovalPolicy.DESTROY);
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
        entry: '/lambda/webhook/post.ts',
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

    this.webhookApiUsagePlan = this.leanApi.addUsagePlan('SampleAppWebhookUsagePlan', {
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
      }),
      new CfnOutput(this, 'ReactAppBucketName', {
        value: `${this.client.bucket.bucketName}`
      }),
      new CfnOutput(this, 'InternalRestApiKeyId', {
        value: `${this.leanApiKey.keyId}`
      }),
      new CfnOutput(this, 'InternalRestApiEndpoint', {
        value: `${this.leanApi.url}`
      })
    ];
  }
}
