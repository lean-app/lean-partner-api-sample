import { apiEndpoint } from '../config';

export const INVITE_WORKER = 'InviteWorker';

export const GET_WORKERS = 'GetWorkers';
export const GET_WORKER = 'GetWorker';

const request = (method: string, path: string, options?: {
    body?: string
}) => fetch(`${apiEndpoint}${path}`, {
    mode: 'cors',
    ...options,
    method,
}).then(response => response.json())

const handlers: { [key: string]: Function } = {
    [GET_WORKERS]: () => request('GET', '/workers'),
    [GET_WORKER]: ({ workerId }: { 
        workerId: string 
    }) => request('GET', `/worker/${workerId}`),
    [INVITE_WORKER]: ({ workerId }: {
        workerId: string
    }) => request('POST', `/worker`, {
        body: JSON.stringify({ workerId })
    })
}

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
    const result = { data };

    if (log === 'ALL') {
        logger.next?.(result);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    
    }

    cb?.(result);
    return result;
  } catch (e: any) {
    const error = e instanceof Error ? e : new Error(e);

    if (log !== 'NONE') {
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