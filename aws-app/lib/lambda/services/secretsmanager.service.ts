import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

export const getSecret = async (secretId = '') => {
  const client = new SecretsManagerClient({ });
  const command = new GetSecretValueCommand({
    SecretId: secretId
  });

  const result = await client.send(command);
  return result?.SecretString ?? '';
};