import { EmailAddress } from "./email.types";

export enum WorkerStatus {
    Pending = 'PENDING',
    Created = 'CREATED',
    PendingRegistration = 'PENDING_REGISTRATION',
    Active = 'ACTIVE',
    Inactive = 'INACTIVE',
}

export interface Worker {
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
    status: WorkerStatus,
    partnerUserId: string,
    registrationDate: string,
    createdAt: string,
    updatedAt: string
}