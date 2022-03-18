import { APIGatewayAuthorizerResult, APIGatewayRequestAuthorizerEvent, APIGatewayRequestAuthorizerHandler, APIGatewayTokenAuthorizerEvent, APIGatewayTokenAuthorizerHandler} from 'aws-lambda';
import { createHmac } from 'crypto';
import { webhookSecret } from '../../../config';

const generatePolicy = (principalId: string, effect: string, resource: string): APIGatewayAuthorizerResult => ({
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
})

export const handler: APIGatewayTokenAuthorizerHandler = async (event: APIGatewayTokenAuthorizerEvent) => {
  try {
    const signature = `${event.authorizationToken}`;
    const hmac = createHmac('sha1', webhookSecret);
    const digest = hmac.digest('base64');
    const authorized = signature.localeCompare(digest);

    if (authorized === 0) {
      return generatePolicy('lean', 'Allow', event.methodArn);
    }
  } catch (error) {
    console.error(error);
  }
  
  return generatePolicy('lean', 'Deny', event.methodArn);
}