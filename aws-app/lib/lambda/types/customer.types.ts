import { EmailAddress } from "./email.types";

export enum CustomerStatus {
    Pending = 'PENDING',
    Created = 'CREATED',
    PendingRegistration = 'PENDING_REGISTRATION',
    Active = 'ACTIVE',
    Inactive = 'INACTIVE',
}

export interface Customer {
    firstName: string,
    middleName: string,
    lastName: string,
    birthday: string,
    phoneNumber: string,
    email: EmailAddress,
    street: string,
    street2: string,
    city: string,
    state: string,
    postalCode: string,
    status: CustomerStatus,
    partnerUserId: string,
    registrationDate: string,
    createdAt: string,
    updatedAt: string
}