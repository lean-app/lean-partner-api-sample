import { APIGatewayProxyEvent } from "aws-lambda";

import { response } from "../../response";
import CustomerService, { CREATE_CUSTOMER } from "../../services/customers.service";

export const handler = async (event: APIGatewayProxyEvent) => {
    if (!event.body) {
        return response(400);
    }

    console.log(event.body);
    
    try {
        const { partnerUserId } = JSON.parse(event.body) as { [key: string]: any };

        const result = await CustomerService.perform({
            type: CREATE_CUSTOMER,
            params: {
                customer: {
                    firstName: "Jane",
                    lastName: "Doe",
                    birthday: "1980-12-31",
                    phoneNumber: "+14085008105",
                    email: `janedoe+${partnerUserId}@gmail.com`,
                    street: "700 Treehouse Drive",
                    city: "San Jose",
                    state: "CA",
                    postalCode: "95101",
                    partnerUserId,
                    registrationDate: "2020-01-01",
                    invite: true
                }
            }
        });
        
        return response(201, result);

    } catch (error) {
        console.error(error);
        return response(500);
    }
}