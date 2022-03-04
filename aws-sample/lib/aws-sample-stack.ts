import * as path from 'path';

import { CfnOutput, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { AuthorizationType, LambdaIntegration, LambdaIntegrationOptions, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { NodejsFunction, SourceMapMode } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { StaticWebsiteStack } from './stacks/StaticWebsite';

const createLambdaIntegration = (scope: Construct, { function: functionOptions, integration: integrationOptions = { } }: {
  function: {
    name: string,
    path: string
  }, 
  integration?: LambdaIntegrationOptions
}) => new LambdaIntegration(new NodejsFunction(scope, functionOptions.name, {
    entry: path.join(__dirname, functionOptions.path),
    handler: 'handler',
    bundling: {
      sourceMap: true,
      sourceMapMode: SourceMapMode.INLINE
    }
  }), integrationOptions);

export class AwsSampleStack extends Stack {
  api: RestApi;
  client: StaticWebsiteStack;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    
    this.client = new StaticWebsiteStack(this, 'LeanPartnerReactClient', { 
      removalPolicy: RemovalPolicy.DESTROY 
    });

    /* API and Stack */
    this.api = new RestApi(this, 'InternalRestApi', { });
    this.api.root.addResource('workers', {
      defaultCorsPreflightOptions: {
        allowOrigins: [ 'localhost:3000' ],
        allowMethods: [ 'GET' ]
      }
    });

    this.api.root.getResource('workers')?.addMethod('GET', createLambdaIntegration(this, {
      function: {
        name: 'GetWorkersHandler',
        path: '/lambda/api/workers/get.ts',
      }
    }));

    this.api.root.getResource('workers')?.addMethod('POST', createLambdaIntegration(this, {
      function: {
        name: 'PostWorkersHandler',
        path: '/lambda/api/workers/post.ts',
      }
    }));

    new CfnOutput(this, 'ReactAppDomainName', {
      value: `${this.client.distribution.distributionDomainName}`
    });
  }
}
