import { getCustomer, getCustomers, createCustomer } from "./customers/api";

export const GET_CUSTOMERS = 'GetWorkers';
export const GET_CUSTOMER = 'GetWorker';
export const CREATE_CUSTOMER = 'CreateWorker';

const handlers: { [key: string]: Function } = {
    [GET_CUSTOMERS]: getCustomers,
    [GET_CUSTOMER]: getCustomer,
    [CREATE_CUSTOMER]: createCustomer,
};

const defaultLogger = {
    next: (value: any) => console.log(value),
    error: (value: any) => console.error(value)
};

export interface APIAction {
    type: string,
    params?: { [key: string]: any },
    options?: { [key: string]: any }
};

export interface Result {
    data?: any,
    error?: any
};


const perform = async ({ type, params, options }: APIAction, cb?: Function): Promise<Result> => {
    const { log = 'ERROR', logger: userLogger = defaultLogger } = options ?? {};
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
        const result = { data };

        if (log === 'ALL') {
            logger.next?.(result);
        }

        cb?.(result);
        return data;
    } catch (e: any) {
        const error = e instanceof Error ? e : new Error(e);

        if (log !== 'NONE') {
            logger.error?.({ type, params, error });
        }

        const result = { error };
        cb?.(result);

        throw error;
    }
};

export default {
    perform
};