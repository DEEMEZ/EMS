import { Document, Types } from 'mongoose';

// Base interface matching your Mongoose schema
export interface IProduct extends Document {
  _id: Types.ObjectId;
  name: string;
  quantity: number;
  price: number;
  category: string;
  userId: Types.ObjectId;
  modifiedBy: string;
  modifiedDate: Date;
  createdAt: Date;
}

// Client-side friendly version with string IDs
export interface NormalizedProduct {
  _id: string;
  name: string;
  quantity: number;
  price: number;
  category: string;
  userId: string;
  modifiedBy: string;
  modifiedDate: Date;
  createdAt: Date;
}

// Utility function to convert IProduct to NormalizedProduct
export function normalizeProduct(product: IProduct): NormalizedProduct {
  return {
    ...product.toObject(),
    _id: product._id.toString(),
    userId: product.userId.toString()
  };
}

// For form inputs (optional)
export type ProductInput = Omit<NormalizedProduct, '_id' | 'createdAt' | 'modifiedDate' | 'modifiedBy'> & {
  _id?: string; // Optional for updates
};