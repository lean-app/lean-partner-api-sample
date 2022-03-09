import { ulid } from "ulid";
import CustomerService, { CREATE_CUSTOMER } from "../../services/customers.service";

export const handler = async (event: any) => {
    try {
        const result = await CustomerService.perform({
            type: CREATE_CUSTOMER,
            params: {
                workers: {
                    firstName: "Jane",
                    lastName: "Doe",
                    birthday: "1980-12-31",
                    phoneNumber: "+14085008105",
                    email: `janedoe+${ulid()}@gmail.com`,
                    street: "700 Treehouse Drive",
                    city: "San Jose",
                    state: "CA",
                    postalCode: "95101",
                    partnerUserId: ulid(),
                    registrationDate: "2020-01-01",
                    invite: true
                }
            }
        });
        
        return ({ statusCode: 201, body: JSON.stringify(result), headers: {
            'Access-Control-Allow-Origins': 'http://localhost:3000',
            'Access-Control-Allow-Methods': 'POST',
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent'
        }});

    } catch (error) {
        console.error(error);
        return ({ statusCode: 500, body: 'Internal Server Error.' });
    }
}