// src/types/organization.ts
import { IUser } from "./user"; // Import the User type

export interface IOrganization {
    _id?: string;
    name: string;
    description?: string;
    status: 'Active' | 'Inactive' | 'Pending';
    userId?: string | IUser; // Add userId field
    modifiedBy?: string;
    modifiedDate?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}