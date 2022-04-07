import { APIGatewayTokenAuthorizerEvent, APIGatewayTokenAuthorizerHandler} from 'aws-lambda';
import { createHmac } from 'crypto';

import { policy } from '../policy';
import { getSecret } from '../services/secretsmanager.service';

export const handler: APIGatewayTokenAuthorizerHandler = async (event: APIGatewayTokenAuthorizerEvent) => {
  const signature = event.authorizationToken;
  const digest = createHmac('sha1', await getSecret(process.env.LEAN_WEBHOOK_SECRET_ID)).digest('base64');
  const authorized = signature.localeCompare(digest);

  if (authorized !== 0) {
    return policy('lean', 'Deny', event.methodArn);
  }
  
  return policy('lean', 'Allow', event.methodArn);
}