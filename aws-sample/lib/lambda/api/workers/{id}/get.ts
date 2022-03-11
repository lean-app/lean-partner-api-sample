import CustomerService, { GET_CUSTOMER } from '../../../services/customers.service';

export const handler = async (event: any) => {
    const { id } = event.pathParameters;

    if (!id) {
        return ({ status: 400, body: 'Bad Request' });
    }
    
    try {
        const result = await CustomerService.perform({
            type: GET_CUSTOMER,
            params: {
                partnerUserId: id
            }
        });

        return ({ statusCode: 200, body: JSON.stringify(result), headers: {
            'Access-Control-Allow-Origin': 'http://localhost:3000',
            'Access-Control-Allow-Methods': 'OPTIONS,GET,PUT,POST,DELETE,PATCH,HEAD',
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent'
        } });
    } catch (error) {
        console.error(error);
        return ({ status: 500, body: JSON.stringify(error)});
    }
};