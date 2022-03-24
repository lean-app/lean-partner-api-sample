import { createGig } from "./gig/api";

export const CREATE_GIG = 'CreateGig';

const handlers: { [key: string]: Function } = {
    [CREATE_GIG]: async (params: any) => createGig(params),
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

const perform = async (typeOrAction: string | APIAction, cb?: Function): Promise<Result> => {
    let handler: Function;
    let action: APIAction;

    if (typeof typeOrAction === 'string') {
        handler = handlers[typeOrAction];
        action = { type: typeOrAction };
    } else {
        action = typeOrAction;
        handler = handlers[action.type];
    }

    const { log = 'ALL', logger: userLogger = defaultLogger } = action.options ?? { };
    const logger = {
        next: undefined,
        error: undefined,
        ...userLogger
    };

    if (!handler) {
        logger.error?.('Handler not implemented.');
        return { error: 'Handler not implemented.' };
    }

    try {
        const data = await handler(action.params);
        const result = { data };

        if (log === 'ALL') {
            logger.next?.({ action, data });
        }

        cb?.(result);
        return data;
    } catch (e: any) {
        const error = e instanceof Error ? e : new Error(e);

        if (log !== 'NONE') {
            logger.error?.({ action, error });
        }

        const result = { error };
        cb?.(result);

        throw error;
    }
};

export default {
    perform
};