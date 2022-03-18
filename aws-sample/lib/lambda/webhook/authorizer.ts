import { APIGatewayTokenAuthorizerEvent, APIGatewayTokenAuthorizerHandler} from 'aws-lambda';
import { createHmac } from 'crypto';
import { webhookSecret } from '../../../config';
import { policy } from '../policy';

export const handler: APIGatewayTokenAuthorizerHandler = async (event: APIGatewayTokenAuthorizerEvent) => {
  const signature = event.authorizationToken;
  const digest = createHmac('sha1', webhookSecret).digest('base64');
  const authorized = signature.localeCompare(digest);

  if (authorized !== 0) {
    return policy('lean', 'Deny', event.methodArn);
  }
  
  return policy('lean', 'Allow', event.methodArn);
}