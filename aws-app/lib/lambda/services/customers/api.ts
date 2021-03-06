import fetch, { Response } from 'node-fetch';

import { EmailAddress } from '../../types/email.types';
import { Customer } from '../../types/customer.types';
import { getSecret } from '../secretsmanager.service';

const API_ENDPOINT = 'https://app.sandbox.withlean.com/api';
const partnerApi = (path: string) => `${API_ENDPOINT}/${path}`;

const authorizationHeader = async () => `Basic ${Buffer.from(`${await getSecret(process.env.LEAN_API_KEY_SECRET_ID)}:`).toString('base64')}`;
export class CustomerApiError extends Error {
  status: number;

  constructor({ status, text }: {
    status: number,
    text: string
  }) {
    super(text);
    this.status = status;
  }
}

const parseResponse = async (response: Response) => {
  if (response.status >= 200 && response.status <= 300) {
    return await response.json();
  } else {
    throw new CustomerApiError({
      status: response.status,
      text: await response.text()
    });
  }
};

export const getCustomers = async () => await fetch(partnerApi(`customer`), {
  method: 'GET',
  headers: {
    Authorization: await authorizationHeader(),
  }
}).then(parseResponse);

export const getCustomer = async ({ partnerUserId }: {
  partnerUserId: string
}) => await fetch(partnerApi(`customer/${partnerUserId}`), {
  method: 'GET',
  headers: {
    Authorization: await authorizationHeader(),
  }
}).then(parseResponse);

export interface CreateCustomerProps {
  firstName: string,
  middleName?: string,
  lastName: string,
  birthday: string,
  phoneNumber: string,
  email: EmailAddress,
  street: string,
  street2?: string,
  city: string,
  state: string,
  postalCode: string,
  partnerUserId: string,
  registrationDate: string,
  invite: boolean,
};

export const createCustomer = async ({ customer }: {
  customer: Customer
}) => {
  console.log(`Customer ${JSON.stringify(customer, undefined, 2)}`);
  return await fetch(partnerApi(`customer`), {
    method: 'POST',
    body: JSON.stringify(customer, undefined, 2),
    headers: {
      Authorization: await authorizationHeader(),
      'Content-Type': 'application/json'
    }
  }).then(parseResponse);
}