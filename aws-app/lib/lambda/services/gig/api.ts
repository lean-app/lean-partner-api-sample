import fetch, { Response } from 'node-fetch';

import { Gig } from '../../types/gig.types';
import { getSecret } from '../secretsmanager.service';

const API_ENDPOINT = 'https://app.staging.withlean.com/api';
const partnerApi = (path: string) => `${API_ENDPOINT}/${path}`;
const authorizationHeader = async () => `Basic ${Buffer.from(`${await getSecret(process.env.LEAN_API_KEY_SECRET_ID)}:`).toString('base64')}`;

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

export const createGig = async (gig: Gig) => await fetch(partnerApi(`gig`), {
    method: 'POST',
    body: JSON.stringify(gig, undefined, 2),
    headers: {
        'Authorization': await authorizationHeader(),
        'Content-Type': 'application/json'
    }
}).then(parseResponse);