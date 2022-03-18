import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { Temporal } from "@js-temporal/polyfill";
import { APIGatewayProxyEventV2 } from "aws-lambda";
import { ulid } from "ulid";
import { response } from "../response";

export const handler = async (event: APIGatewayProxyEventV2) => {
  const instant = Temporal.Now.instant();
  const partition = instant.round('hour').epochMilliseconds.toString();

  if (!event.body) {
    return response(400);
  }

  try {
    const body = JSON.parse(event.body);
    const { 
      event: eventType, 
      data 
    } = (body as { [key: string]: any }) ?? { };

    if (typeof eventType !== 'string' || typeof data !== 'object') {
      return response(400);
    }

    const attributes: { [key: string]: { 'S': string } } = Object.entries(data)
      .reduce((attributes, [k, v]) => ({
        ...attributes,
        [k]: { 'S': JSON.stringify(v) }
      }), { });

    const client = new DynamoDBClient({ });
    const command = new PutItemCommand({
      TableName: 'PartnerTable',
      Item: {
        pk: {
          'S': `EVENT#${partition}`
        },
        sk: {
          'S': `${eventType}#${ulid()}`
        }, 
        ...attributes
      }
    });

    await client.send(command);
    return response(201);
  } catch (error) {
    console.log(error);
    return response(500);
  }
};