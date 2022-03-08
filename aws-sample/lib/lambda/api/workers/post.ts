import { ulid } from "ulid";
import WorkersService, { CREATE_WORKER } from "../../lean-sdk/services/workers.service";

export const handler = async (event: any) => {
    const result = await WorkersService.perform({
        type: CREATE_WORKER,
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
    
    return ({ statusCode: 200, body: JSON.stringify(result) });
}