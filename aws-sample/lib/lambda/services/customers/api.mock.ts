import cloneDeep from 'lodash/cloneDeep';

const customerData = [
    {
        name: 'Nolan Sykes',
        id: '1',
        paymentMethod: 'bank_account',
    },
    {
        name: 'Zach Jobe',
        id: '2',
        paymentMethod: 'bank_account',
    }
];

const API_ENDPOINT = 'https://app.sandbox.withlean.com/api';
const partnerApi = (...pathParts: string[]) => `${API_ENDPOINT}/${pathParts.join('/')}`;

const getCustomersDefaultError = new Error('Failed to retrieve customer data.');
export const getCustomers = ({ throwError, error }: { throwError?: boolean, error?: Error } = { }) => new Promise((resolve, reject) => setTimeout(() => {
    if (throwError) {
        const errorToThrow = error instanceof Error ? error : getCustomersDefaultError;
        reject(errorToThrow);
    }
    
    return resolve(cloneDeep(customerData));
}, 100 * Math.random()));

export const getCustomer = async (partnerUserId: string) => customerData.filter(({ id }) => id === partnerUserId);

type Customer = { [key: string]: any };
export const createCustomer = ({ customer }: { customer: Customer }) => {
    console.log(customer);   
    return { };
};