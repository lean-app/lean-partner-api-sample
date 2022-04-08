import { APIGatewayProxyEvent } from "aws-lambda";

import { response } from "../../response";
import GigService, { CREATE_GIG } from "../../services/gig.service";
import { CustomerApiError } from "../../services/customers/api";
import { ulid } from "ulid";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { Temporal } from "@js-temporal/polyfill";

const putGig = async (gig: {
  partnerUserId: string,
  gigId: string,
  totalAmount: string,
  type: string,
  description: string,
  startTime: string,
  endTime: string,
  tips: string,
  expenses: string,
  userData: string
}, instant: Temporal.Instant) => {
  const partition = instant.round('hour').epochMilliseconds.toString();
  const attributes: { [key: string]: { 'S': string } } = {};
  for (const [ key, value ] of Object.entries(gig)) {
    attributes[key] = { 'S': JSON.stringify(value) };
  }

  const client = new DynamoDBClient({});
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
  try {
    const {
      partnerUserId,

      totalAmount,
      type,
      description,
      startTime,
      endTime,
      tips,
      expenses,
      userData
    } = JSON.parse(event.body ?? '{ }') as { [key: string]: any };

    const gig = {
      partnerUserId,
      gigId: ulid(),

      totalAmount,
      type,
      description,
      startTime,
      endTime,
      tips,
      expenses,
      userData
    };

    const result = await GigService.perform({
      type: CREATE_GIG,
      params: gig
    });

    return response(201, result);
  } catch (error: any) {
    console.error(error);
    if (error instanceof CustomerApiError) {
      return response(error.status, { message: error.message })
    }

    return response(500);
  }
}