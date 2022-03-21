import { DeleteItemCommand, DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { ulid } from "ulid";
import { response } from "../../../response";

export const connect = async (event: any) => {
  try {
    const { connectionId } = event.requestContext ?? { };

    if (!connectionId) {
      return response(400);
    }

    const client = new DynamoDBClient({ });

    const websocketClientId = ulid();
    const command = new PutItemCommand({
      TableName: 'PartnerTable',
      Item: {
        pk: { 'S': `CLIENT#${connectionId}` },
        sk: { 'S': `WEBSOCKET#${websocketClientId}` },
      }
    });

    await client.send(command);

    return response(200, { connection: connectionId });
  } catch (error) {
    console.error(error);
    return response(500);
  }
}


export const disconnect = async (event: any) => {
  try {
    const { connectionId } = event.requestContext ?? { };

    if (!connectionId) {
      return response(400);
    }

    const client = new DynamoDBClient({ });
    const command = new DeleteItemCommand({
      TableName: 'PartnerTable',
      Key: {
        pk: { 'S': `WEBSOCKET#${connectionId}` },
        sk: { 'S': 'CONNECTED' },
      }
    });

      await client.send(command);

    return response(200);
  } catch (error) {
    console.error(error);
    return response(500);
  }
}