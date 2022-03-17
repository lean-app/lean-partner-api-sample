import { apiKey, endpoint } from '../config';

export const INVITE_CUSTOMER = 'InviteCustomer';

export const GET_CUSTOMERS = 'GetCustomers';
export const GET_CUSTOMER = 'GetCustomer';

const request = (method: string, path: string, options?: {
    body?: string,
    headers?: { [key: string]: string }
}) => fetch(`${endpoint}${path}`, {
    mode: 'cors',
    ...options,
    headers: {
        'X-API-Key': apiKey,
        ...(options?.headers ?? { })
    },
    method,
}).then(response => response.json())

const handlers: { [key: string]: Function } = {
    [GET_CUSTOMERS]: () => request('GET', '/customers'),
    [GET_CUSTOMER]: (customerId: string) => request('GET', `/customers/${customerId}`),
    [INVITE_CUSTOMER]: (customer: any) => request('POST', `/customers`, {
        body: JSON.stringify(customer)
    })
}

const defaultLogger = { 
    next: (value: any) => console.log(value), 
    error: (value: any) => console.error(value) 
};

export interface APIAction { 
    type: string, 
    params?: any,
    options?: { [key: string]: any }
};

export interface Result {
    data?: any,
    error?: any
};

const perform = async ({ type, params, options }: APIAction, cb?: Function) => {
  const { log = 'ERROR', logger: userLogger = defaultLogger } = options ?? { };
  const logger = {
      next: undefined,
      error: undefined,
      ...userLogger
  };

  const handler: Function = handlers[type];

  if (!handler) {
      logger.error?.('Handler not implemented.');
      return { error: 'Handler not implemented.' };
  }

  try {
    const data = await handler(params);

    if (log === 'ALL') {
        logger.next?.(data);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    
    }

    cb?.({ data });
    return data;
  } catch (e: any) {
    const error = e instanceof Error ? e : new Error(e);

    if (log !== 'NONE') {
        logger.error?.({ type, params, error });
    }

    cb?.({ error });  
    throw error;
  }
};

export default {
    perform
};