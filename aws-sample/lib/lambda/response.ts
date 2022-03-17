import { Cors } from "aws-cdk-lib/aws-apigateway";

const defaultResponses: { [key: number]: { message: string } } = {
  200: ({ message: 'Success' }),
  400: ({ message: 'Bad Request' }),
  404: ({ message: 'Not Found' }),
  500: ({ message: 'Internal Server Error' }),
};

const defaultBody = (statusCode: number) => defaultResponses[statusCode] ?? '';

export interface Response { 
  statusCode: number, 
  body: string, 
  headers: { [key: string]: string }, 
  isBase64Encoded: boolean 
};

export interface ResponseOptions {
  minify?: boolean,
  log?: boolean | ((value: Response) => void)
}


export const response = (statusCode: number, body?: any, options?: ResponseOptions): Response => {
  const responseBody = typeof body === 'undefined' ?  defaultBody(statusCode) : body;
  const responseBodyValue = options?.minify ? JSON.stringify(responseBody) : JSON.stringify(responseBody, null, 2);
  
  const response = {
    statusCode,
    body: responseBodyValue,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': Cors.ALL_METHODS.join(','),
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Headers': [ "Authorization", "Content-Type", "Referrer", "X-Amz-Date", "X-Api-Key", "X-Amz-Security-Token", "X-Amz-User-Agent", "X-Lean-Signature" ].join(',')
    },
    isBase64Encoded: false,
  };

  if (options?.log) {
    if (typeof options?.log === 'function') {
      options.log(response);
    }  else {
      console.log(response);
    }
  }

  return response;
};