import { APIGatewayProxyEvent } from "aws-lambda";

import { response } from '../../response';
import CustomerService, { GET_CUSTOMERS } from '../../services/customers.service';

export const handler = async (event: APIGatewayProxyEvent) => {
    try {
        const result = await CustomerService.perform({
            type: GET_CUSTOMERS
        });

        return response(200, result)
    } catch (error) {
        console.error(error);
        return response(500);
    } 
};