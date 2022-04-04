
import { APIGatewayProxyEvent } from 'aws-lambda';
import { ApiGatewayManagementApiClient, PostToConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi";
import { response } from '../response';
import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb';

const _partitions: { [key: string]: (data: any) => ({ 'S': string }) } = {
  'account': ({ partnerUserId }: { partnerUserId: string }) => ({ 
    'S': `WORKER#${partnerUserId.toUpperCase()}` 
  }),
  'customer': ({ partnerUserId }: { partnerUserId: string }) => ({ 
    'S': `WORKER#${partnerUserId.toUpperCase()}` 
  }),
  'gig': ({ gigId }: { gigId: string }) => ({ 
    'S': `GIG#${gigId.toUpperCase()}` 
  }),
  'specialpayment': ({ specialPaymentId }: { specialPaymentId: string }) => ({
    'S': `PAYMENT#${specialPaymentId.toUpperCase()}`
  })
};

const partition = ({ object, type, data }: { object: string, type?: string, data: any}) => {
  let pk: { 'S': string };

  if (type) {
    pk = _partitions[`${object}.${type}`]?.(data);
  } else {
    pk = _partitions[object]?.(data);
  }

  return pk;
};

export const trigger = async (event: APIGatewayProxyEvent) => {
  if (!event.body) {
    throw new Error('event body is missing');
  }

  try {const { 
    event: eventType, 
    data 
  } = JSON.parse(event.body ?? '{ }') ?? { } as { [key: string]: any };
    const [object, type] = eventType.split('.');
    const connectionsQueryCommand = new QueryCommand({
      TableName: 'PartnerTable',
      KeyConditionExpression: `pk = :partition AND begins_with(sk, :sort)`,
      ExpressionAttributeValues: {
        ':partition': partition({ object, type, data }),
        ':sort': {
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
