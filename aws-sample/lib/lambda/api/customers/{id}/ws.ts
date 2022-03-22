import { DeleteItemCommand, DynamoDBClient, PutItemCommand, QueryCommand } from "@aws-sdk/client-dynamodb";
import { response } from "../../../response";

import { APIGatewayProxyEvent } from 'aws-lambda';
import { ApiGatewayManagementApiClient, PostToConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi";

export const trigger = async (event: APIGatewayProxyEvent) => {
  if (!event.body) {
    throw new Error('event body is missing');
  }

  try {
    const body = JSON.parse(event.body ?? '{ }') as { [key: string]: any };

    const connectionsQueryCommand = new QueryCommand({
      TableName: 'PartnerTable',
      KeyConditionExpression: `pk = :workerId AND begins_with(sk, :websocketConstant)`,
      ExpressionAttributeValues: {
        ':workerId': { 
          'S': `WORKER#${body.partnerUserId.toUpperCase()}` 
        },
        ':websocketConstant': {
          'S': 'WEBSOCKET'
        }
      },
      ProjectionExpression: 'connectionId'
    });

    const { Items = [] } = await new DynamoDBClient({ }).send(connectionsQueryCommand);
    console.log(Object.entries(Items));
    // Get connection ids
    const connectionIds = [''];

    const apigatewayManagementApi = new ApiGatewayManagementApiClient({ });
    const encoder = new TextEncoder();

    for (const connectionId of connectionIds) {
      try {
        const command = new PostToConnectionCommand({
          ConnectionId: connectionId,
          Data: encoder.encode(JSON.stringify(body))
        });

        apigatewayManagementApi.send(command);
      } catch (error: any) {
        if (error.statusCode === 410) {
          console.error(`Found stale connection, deleting ${connectionId}`);
          // delete stale connection

          continue;
        }

        console.error(error);
      }
    };

    return response(200);
  } catch (error) {
    console.error(error);
    return response(500);
  }

};

export const connect = async (event: any) => {
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


export const disconnect = async (event: any) => {
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