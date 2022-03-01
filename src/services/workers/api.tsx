import { apiKey } from '../../apiKey';

const API_ENDPOINT = 'https://app.sandbox.withlean.com/api';
const partnerApi = (path: string) => `${API_ENDPOINT}/${path}`;

export { getWorkers } from './api.mock';
export const getWorker = async ({ partnerUserId }: { partnerUserId: string }) => fetch(partnerApi(`customer/${partnerUserId}`));

type Worker = { [key: string]: any };
export const createWorker = async ({ worker }: { worker: Worker }) => await fetch(partnerApi(`customer`), {
    method: 'POST',
    body: JSON.stringify(worker),
    headers: {
        'Authorization': `Basic ${apiKey}`
    }
});