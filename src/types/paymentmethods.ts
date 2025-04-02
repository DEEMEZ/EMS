import { Types } from 'mongoose';

export interface IPaymentMethod {
  _id?: Types.ObjectId | string;
  userId: string;
  name: string;
  description?: string;
  modifiedBy?: string;
  modifiedDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// For API request/response typing
export interface IPaymentMethodInput {
  _id?: string;
  name: string;
  description?: string;
}

export interface IPaymentMethodResponse {
  _id: string;
  userId: string;
  name: string;
  description?: string;
  modifiedBy?: string;
  modifiedDate?: string;
  createdAt?: string;
  updatedAt?: string;
}