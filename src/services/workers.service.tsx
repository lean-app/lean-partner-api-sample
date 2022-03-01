import { getWorkers, getWorker, createWorker } from "./workers/api";

export const GET_WORKERS = 'GetWorkers';
export const GET_WORKER = 'GetWorker';
export const CREATE_WORKER = 'CreateWorker';

const handlers: { [key: string]: Function } = {
    [GET_WORKERS]: getWorkers,
    [GET_WORKER]: getWorker,
    [CREATE_WORKER]: createWorker,
};

const logHandler = (data: any, logger: any ) => {
    if (typeof logger === 'function') {
        logger(`WorkerService: ${data}`);
    }
};

const defaultLogger = { next: console.log, error: console.error };

export interface APIAction { 
    type: string, 
    params?: { [key: string]: any },
    options?: { [key: string]: any }
};

export interface Result {
    data?: any,
    error?: any
};

export const perform = async ({ type, params, options }: APIAction, cb?: Function): Promise<Result> => {
  const { log = false, logger = defaultLogger } = options ?? { };
  const handler: Function = handlers[type];

  try {
    const data = await handler?.(params);
    const result = { data };

    if (log) {
        logHandler(result, logger.next);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    
    }

    cb?.(result);
    return result;
  } catch (error: any) {
    const result = { 
        error: error instanceof Error ? error : new Error(error)
    };

    if (log) {
        logHandler(result, logger.error);
    }

    cb?.(result);  
    return result;
  }
};