import { APIGatewayAuthorizerResult, APIGatewayTokenAuthorizerEvent, APIGatewayTokenAuthorizerHandler } from 'aws-lambda';
import { createHmac } from 'crypto';
import { map, split } from 'lodash';

import { webhookSecret } from '../../../config';

const generatePolicy = (principalId: string, effect: string, resource: string): APIGatewayAuthorizerResult => {
  if (effect && resource) {
      const policyDocument = {
        Version: '2012-10-17',
        Statement: [{
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: resource,
        }],
      };

      return {
        principalId,
        policyDocument
      };
  }

  return { 
    principalId, 
    policyDocument: {
      Version: '2012-10-17',
      Statement: []
    }
  };
}

export const handler: APIGatewayTokenAuthorizerHandler = async (event: APIGatewayTokenAuthorizerEvent) => {
  try {
    const signature = `${event.authorizationToken}`.split('');
    const hmac = createHmac('sha1', webhookSecret);
    const digest = hmac.digest('base64').split('');
    
    const authorized = signature
      .map((sigChar, idx) => [sigChar, digest[idx]])
      .reduce((isEqual, [sigChar, digestChar]) => {
        if (!isEqual) {
          return isEqual;
        }

        console.log(sigChar.localeCompare(digestChar), { sigChar, digestChar });
        return sigChar === digestChar;
      }, true);
      
      if (authorized) {
        return generatePolicy('lean', 'Allow', event.methodArn);
      }
    } catch (error) {
      console.error(error);
    }
    
    return generatePolicy('lean', 'Deny', event.methodArn);
}