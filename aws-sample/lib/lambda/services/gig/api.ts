import fetch, { Response } from 'node-fetch';

import { apiKey } from '../../../../config';
import { Gig } from '../../types/gig.types';

const API_ENDPOINT = 'https://app.staging.withlean.com/api';
const partnerApi = (path: string) => `${API_ENDPOINT}/${path}`;
const encodedCredentials = Buffer.from(`${apiKey}:`).toString('base64');

export class GigApiError extends Error {
    status: number;

    constructor({ status, text }: {
        status: number,
        text: string
    }) {
        super(text);
        this.status = status;
    }
}

const parseResponse = async (response: Response) => {
    if (response.status >= 200 && response.status <= 300) {
        return await response.json();
    } else {
        throw new GigApiError({ 
            status: response.status, 
            text: await response.text() 
        });
    }
};

export const createGig = ({ gig }: { 
    gig: Gig 
}) => fetch(partnerApi(`gig`), {
    method: 'POST',
    body: JSON.stringify(gig, undefined, 2),
    headers: {
        'Authorization': `Basic ${encodedCredentials}`,
        'Content-Type': 'application/json'
    }
}).then(parseResponse);