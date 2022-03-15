import fetch, { Response } from 'node-fetch';

import { apiKey } from '../../../../apiKey';
import { EmailAddress } from '../../types/email.types';
import { Worker } from '../../types/worker.types';

const API_ENDPOINT = 'https://app.staging.withlean.com/api';
const partnerApi = (path: string) => `${API_ENDPOINT}/${path}`;
const encodedCredentials = Buffer.from(`${apiKey}:`).toString('base64');

const parseResponse = async (response: Response) => {
    if (response.status >= 200 && response.status <= 300) {
        return await response.json();
    } else {
        throw new Error(await response.text());
    }
};

export const getCustomers = () => fetch(partnerApi(`customer`), {
    method: 'GET',
    headers: {
        Authorization: `Basic ${encodedCredentials}`
    }
}).then(parseResponse);

export const getCustomer = ({ partnerUserId }: { 
    partnerUserId: string 
}) =>  fetch(partnerApi(`customer/${partnerUserId}`), {
    method: 'GET',
    headers: {
        Authorization: `Basic ${encodedCredentials}`
    }
}).then(parseResponse);

export interface CreateCustomerProps {
    firstName: string,
    middleName?: string,
    lastName: string,
    birthday: string,
    phoneNumber: string,
    email: EmailAddress,
    street: string,
    street2?: string,
    city: string,
    state: string,
    postalCode: string,
    partnerUserId: string,
    registrationDate: string,
    invite: boolean,
};

export const createCustomer = ({ worker }: { 
    worker: Worker 
}) => fetch(partnerApi(`customer`), {
    method: 'POST',
    body: JSON.stringify(worker),
    headers: {
        authorization: `Basic ${encodedCredentials}`
    }
}).then(parseResponse);