import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { response } from "../response";

export const handler = async (event: any) => {
  try {
    const { id } = event.pathParameters ?? {};
    const { connectionId } = event.requestContext ?? {};

    if (!connectionId) {
      return response(400);
    }

    const client = new DynamoDBClient({});
    const command = new PutItemCommand({
      TableName: 'PartnerTable',
      Item: {
        pk: { 'S': `WORKER#${id}` },
        sk: { 'S': `WEBSOCKET#${connectionId}` },
        connectionId
      }
    });

    await client.send(command);
    return response(200, { connection: connectionId });
  } catch (error) {
    console.error(error);
    return response(500);
  }
}