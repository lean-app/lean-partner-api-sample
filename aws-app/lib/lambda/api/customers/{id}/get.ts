import { APIGatewayProxyEvent } from "aws-lambda";

import { response } from '../../../response';
import CustomerService, { GET_CUSTOMER } from '../../../services/customers.service';

export const handler = async (event: APIGatewayProxyEvent) => {
    const { id } = event.pathParameters ?? { };

    if (!id) {
        return response(400);
    }
    
    try {
        const result = await CustomerService.perform({
            type: GET_CUSTOMER,
            params: {
                partnerUserId: id
            }
        });

        return response(200, result);
    } catch (error) {
        console.error(error);
        return response(500);
    }
};