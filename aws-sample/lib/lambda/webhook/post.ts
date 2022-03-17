import { APIGatewayProxyEvent } from "aws-lambda";
import { response } from "../response";

export const handler = (event: APIGatewayProxyEvent) => {
  return response(200);
};