import { apiKey } from '../../../apiKey.tsx';

const API_ENDPOINT = 'https://app.sandbox.withlean.com/api';
const partnerApi = (path: string) => `${API_ENDPOINT}/${path}`;

export { getWorkers } from './api.mock';
export const getWorker = async (partnerUserId: string) => fetch(partnerApi(`customer/${partnerUserId}`));

export const createWorker = async (worker: Worker) => fetch(partnerApi(`customer`), {
    method: 'POST',
    body: JSON.stringify(worker),
    headers: {
        'Authorization': `Basic ${apiKey}`
    }
});