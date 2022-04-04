import { APIGatewayAuthorizerResult } from "aws-lambda";

export const policy = (principalId: string, effect: string, resource: string): APIGatewayAuthorizerResult => ({
  principalId,
  policyDocument: {
    Version: '2012-10-17',
    Statement: (effect && resource) ? [
      {
      Action: 'execute-api:Invoke',
      Effect: effect,
      Resource: resource,
    }] : [],
  }
});