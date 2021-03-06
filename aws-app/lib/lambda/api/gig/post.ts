import { APIGatewayProxyEvent } from "aws-lambda";

import { response } from "../../response";
import GigService, { CREATE_GIG } from "../../services/gig.service";
import { CustomerApiError } from "../../services/customers/api";
import { ulid } from "ulid";

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