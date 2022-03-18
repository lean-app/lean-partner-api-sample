import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { Temporal } from "@js-temporal/polyfill";
import { APIGatewayProxyEvent, Context } from "aws-lambda";
import { response } from "../response";

export const handler = async (event: APIGatewayProxyEvent, context: Context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  const instant = Temporal.Now.instant();
  const partition = instant.round('hour').epochMilliseconds.toString();

  try {
    const { 
      event: eventType, 
      data 
    } = JSON.parse(event.body ?? '{ }') ?? { } as { [key: string]: any };

    if (typeof eventType !== 'string' || typeof data !== 'object') {
      return response(400);
    }

    const attributes: { [key: string]: { 'S': string } } = { };
    for (const k of Object.keys(data)) {
      attributes[k] = { 'S': JSON.stringify(data[k]) };
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

    client.send(command);
    return response(201);
  } catch (error) {
    console.log(error);
    return response(500);
  }
};