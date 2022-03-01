import cloneDeep from 'lodash/cloneDeep';

const customerData = [
    {
        name: 'Nolan Sykes',
        id: '1',
        paymentMethod: 'lean',
    },
    {
        name: 'Zach Jobe',
        id: '2',
        paymentMethod: 'bank_account',
    }
];

const API_ENDPOINT = 'https://app.sandbox.withlean.com/api';
const partnerApi = (...pathParts: string[]) => `${API_ENDPOINT}/${pathParts.join('/')}`;

const getWorkersDefaultError = new Error('Failed to retrieve customer data.');
export const getWorkers = ({ throwError, error }: { throwError?: boolean, error?: Error } = { }) => new Promise((resolve, reject) => setTimeout(() => {
    if (throwError) {
        const errorToThrow = error instanceof Error ? error : getWorkersDefaultError;
        reject(errorToThrow);
    }
    
    return resolve(cloneDeep(customerData));
}, 100 * Math.random()));

export const getWorker = async (partnerUserId: string) => customerData.filter(({ id }) => id === partnerUserId);