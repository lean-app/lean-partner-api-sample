import { APIGatewayProxyEvent } from "aws-lambda";
import { response } from "../response";

const rand = Math.random().toString(36);

export const handler = (event: APIGatewayProxyEvent) => {
  return response(200, { message: rand });
};