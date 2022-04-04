import { DeleteItemCommand, DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { response } from "../response";

export const handler = async (event: any) => {
  try {
    const { id } = event.pathParameters ?? { };
    const { connectionId } = event.requestContext ?? { };

    if (!connectionId) {
      return response(400);
    }

    const client = new DynamoDBClient({});
    const command = new DeleteItemCommand({
      TableName: 'PartnerTable',
      Key: {
        pk: { 'S': `WORKER#${id}` },
        sk: { 'S': `WEBSOCKET#${connectionId}` }
      }
    });

    await client.send(command);

    return response(200);
  } catch (error) {
    console.error(error);
    return response(500);
  }
}