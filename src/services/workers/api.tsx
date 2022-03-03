import { apiKey } from '../../apiKey';

const API_ENDPOINT = 'http://localhost:8000/proxy/api';
const partnerApi = (path: string) => `${API_ENDPOINT}/${path}`;

export { getWorkers } from './api.mock';
export const getWorker = ({ partnerUserId }: { partnerUserId: string }) => fetch(partnerApi(`customer/${partnerUserId}`));

type Worker = { [key: string]: any };
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