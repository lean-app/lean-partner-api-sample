
import { APIGatewayProxyEvent } from 'aws-lambda';
import { ApiGatewayManagementApiClient, PostToConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi";
import { response } from '../response';
import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb';

const _partitions: { [key: string]: (data: any) => ({ 'S': string }) } = {
  'account.provisioned': ({ partnerUserId }: { partnerUserId: string }) => ({ 
    'S': `WORKER#${partnerUserId.toUpperCase()}` 
  })
};

const partition = (eventType: string, data: any) => {
  return _partitions[eventType]?.(data);
};

export const trigger = async (event: APIGatewayProxyEvent) => {
  if (!event.body) {
    throw new Error('event body is missing');
  }

  try {const { 
    event: eventType, 
    data 
  } = JSON.parse(event.body ?? '{ }') ?? { } as { [key: string]: any };

    const connectionsQueryCommand = new QueryCommand({
      TableName: 'PartnerTable',
      KeyConditionExpression: `pk = :partition AND begins_with(sk, :websocketConstant)`,
      ExpressionAttributeValues: {
        ':partition': partition(eventType, data),
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
