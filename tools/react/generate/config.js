const fs = require('fs/promises');

const { APIGatewayClient, GetApiKeyCommand } = require("@aws-sdk/client-api-gateway"); // CommonJS import

const getApiKey = async (apiKey) => {
  const client = new APIGatewayClient({ });
  const command = new GetApiKeyCommand({
    includeValue: true,
    apiKey
  });

  const response = await client.send(command);
  return response?.value;
}

(async () => {
  const stackConfig = JSON.parse(await fs.readFile('./aws-app/cdk-outputs.json')).AwsSampleStack;

  console.info('Creating config file');

  const endpoint = stackConfig.InternalRestApiEndpoint;
  const apiKey = await getApiKey(stackConfig.InternalRestApiKeyId);
  const apiKeyLine = `export const apiKey = '<API_KEY>';\n`
      .replace('<API_KEY>', apiKey);

  const endpointLine = `export const endpoint = '<ENDPOINT>';\n`
      .replace('<ENDPOINT>', endpoint);

  await fs.writeFile('./react-app/src/config.ts', '');
  await fs.appendFile('./react-app/src/config.ts', apiKeyLine);
  await fs.appendFile('./react-app/src/config.ts', endpointLine);
  await fs.appendFile('./react-app/src/config.ts', '\n');
})();