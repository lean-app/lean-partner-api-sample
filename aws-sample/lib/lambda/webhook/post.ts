import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { Temporal } from "@js-temporal/polyfill";
import { APIGatewayProxyEvent, Context } from "aws-lambda";
import { response } from "../response";

export const handler = async (event: APIGatewayProxyEvent, context: Context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const instant = Temporal.Now.instant();

  setTimeout(async () => {
    try {
      const { 
        event: eventType, 
        data 
      } = JSON.parse(event.body ?? '{ }') ?? { } as { [key: string]: any };

      const partition = instant.round('hour').epochMilliseconds.toString();
      const attributes: { [key: string]: { 'S': string } } = { };
      for (const key of Object.keys(data)) {
        attributes[key] = { 'S': JSON.stringify(data[key]) };
      }

      const client = new DynamoDBClient({ });
      const command = new PutItemCommand({
        TableName: 'PartnerTable',
        Item: {
          pk: {
            'S': `EVENT#${partition}`
          },
          sk: {
            'S': `LEAN#${eventType}#${event.requestContext.requestTimeEpoch}#${event.requestContext.requestId}`
          }, 
          ...attributes
        },
      });

      await client.send(command);
    } catch (error) {
      console.error(error);
    }
  }, 0);

  return response(201);
};