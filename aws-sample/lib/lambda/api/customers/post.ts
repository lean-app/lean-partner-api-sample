import { APIGatewayProxyEvent } from "aws-lambda";

import { response } from "../../response";
import CustomerService, { CREATE_CUSTOMER } from "../../services/customers.service";

export const handler = async (event: APIGatewayProxyEvent) => {
    if (!event.body) {
        return response(400);
    }

    console.log(event.body);
    
    try {
        const { 
            partnerUserId,
            firstName,
            middleName,
            lastName,
            email,
            street,
            city,
            state,
            postalCode,
            phoneNumber,
            birthday
        } = JSON.parse(event.body) as { [key: string]: any };

        const params = {
            customer: {
                partnerUserId,
                invite: true,

                firstName,
                middleName,
                lastName,
                email,
                street,
                city,
                state,
                postalCode,
                phoneNumber,
                birthday,
                registrationDate: (new Date()).toISOString().split('T')[0]
            }
        };

        const result = await CustomerService.perform({
            type: CREATE_CUSTOMER,
            params
        });
        
        return response(201, result);

    } catch (error) {
        console.error(error);
        return response(500);
    }
}