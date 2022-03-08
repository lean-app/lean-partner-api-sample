import { getWorkers, getWorker, createWorker } from "./workers/api";

export const GET_WORKERS = 'GetWorkers';
export const GET_WORKER = 'GetWorker';
export const CREATE_WORKER = 'CreateWorker';

const handlers: { [key: string]: Function } = {
    [GET_WORKERS]: getWorkers,
    [GET_WORKER]: getWorker,
    [CREATE_WORKER]: createWorker,
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
  const { log = true, logger: userLogger = defaultLogger } = options ?? { };
  const logger = {
      next: undefined,
      error: undefined,
      ...userLogger
  };

  const handler: Function = handlers[type];

  try {
    const data = await handler(params);
    const result = { data };

    if (log) {
        logger.next?.(result);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    
    }

    cb?.(result);
    return result;
  } catch (e: any) {
    const error = e instanceof Error ? e : new Error(e);

    if (log) {
        logger.error?.({ type, params, error });
    }

    const result = { error };
    cb?.(result);  
    
    return result;
  }
};

export default {
    perform
};