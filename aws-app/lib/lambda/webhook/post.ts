import { Temporal } from "@js-temporal/polyfill";

import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { APIGatewayProxyEvent } from "aws-lambda";

import { response } from "../response";

const putEvent = async (event: APIGatewayProxyEvent, instant: Temporal.Instant) => {
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
};

export const handler = async (event: APIGatewayProxyEvent) => {
  const instant = Temporal.Now.instant();

  try {
    await putEvent(event, instant);
    return response(200);
  } catch (error) {
    console.error(error);
    return response(500);
  }
};