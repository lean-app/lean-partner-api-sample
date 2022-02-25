const fs = require('fs/promises');

const { APIGatewayClient, GetApiKeysCommand } = require("@aws-sdk/client-api-gateway"); // CommonJS import

const getApiKey = async (arn) => {
  const client = new APIGatewayClient({ });
  const command = new GetApiKeysCommand({
    includeValues: true,
    nameQuery: arn,
  });

  const response = await client.send(command);
  const [ apiKey ] = response.items ?? [];

  return apiKey?.value;
}

(async () => {
  const stackConfig = JSON.parse(await fs.readFile('./aws-app/cdk-outputs.json')).AwsSampleStack;
  const configFile = await fs.access('./react-app/src/config.ts').catch((err) => { });

  if (!configFile) {
    console.info('Creating config file');

    const [ endpoint ] = Object.entries(stackConfig)
      .filter(([key,]) => key.startsWith('InternalRestApiEndpoint'))
      .map(([, value]) => value);

    const apiKey = await getApiKey(stackConfig.InternalRestApiKeyArn);
    const config = `
      export const apiKey = '<API_KEY>';
      export const endpoint = '<ENDPOINT>';
    ` .replace('<API_KEY>', process.env.API_KEY ?? apiKey)
      .replace('<ENDPOINT>', process.env.ENDPOINT ?? endpoint)
      .trim();

    await fs.writeFile('./react-app/src/config.ts', config);
  }
})();