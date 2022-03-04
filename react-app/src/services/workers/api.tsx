import { apiKey } from '../../apiKey';
import { EmailAddress } from '../../types/email.types';
import { Worker } from '../../types/worker.types';

const API_ENDPOINT = 'http://localhost:8000/proxy/api';
const partnerApi = (path: string) => `${API_ENDPOINT}/${path}`;

export { getWorkers } from './api.mock';
export const getWorker = ({ partnerUserId }: { partnerUserId: string }) => fetch(partnerApi(`customer/${partnerUserId}`));

export interface CreateWorkerProps {
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

export const createWorker = ({ worker }: { 
    worker: Worker 
}) => fetch(partnerApi(`customer`), {
    method: 'POST',
    body: JSON.stringify(worker),
    headers: {
        authorization: `${apiKey}:`
    },
    mode: 'cors',
    credentials: 'include',
}).then((response) => response.json());