import axios from 'axios';

// Define the Product type
export interface Product {
  _id: string;
  name: string;
  quantity: number;
  price: number;
  category: string;
  createdAt?: string; // Optional
}

// Fetch product data with proper typing
const fetchProducts = async (): Promise<Product[]> => {
  try {
    const response = await axios.get<Product[]>('/api/products');
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

export default fetchProducts;
