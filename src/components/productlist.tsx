'use client';

import { useState, useEffect } from 'react';
import { IProduct } from '@/types';

interface ProductListProps {
  refreshTrigger: number;
}

export default function ProductList({ refreshTrigger }: ProductListProps) {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<IProduct | null>(null);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [refreshTrigger]);

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/products?id=${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchProducts();
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleEdit = (product: IProduct) => {
    setEditingId(product._id!);
    setEditForm(product);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm) return;

    try {
      const response = await fetch('/api/products', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        setEditingId(null);
        setEditForm(null);
        fetchProducts();
      }
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Product List</h2>
      <div className="space-y-4">
        {products.map((product) => (
          <div key={product._id} className="border p-4 rounded-md">
            {editingId === product._id ? (
              <form onSubmit={handleUpdate} className="space-y-4">
                <input
                  type="text"
                  value={editForm?.name}
                  onChange={(e) => setEditForm({ ...editForm!, name: e.target.value })}
                  className="block w-full rounded-md border-gray-300"
                />
                <input
                  type="number"
                  value={editForm?.quantity}
                  onChange={(e) => setEditForm({ ...editForm!, quantity: Number(e.target.value) })}
                  className="block w-full rounded-md border-gray-300"
                />
                <input
                  type="number"
                  step="0.01"
                  value={editForm?.price}
                  onChange={(e) => setEditForm({ ...editForm!, price: Number(e.target.value) })}
                  className="block w-full rounded-md border-gray-300"
                />
                <input
                  type="text"
                  value={editForm?.category}
                  onChange={(e) => setEditForm({ ...editForm!, category: e.target.value })}
                  className="block w-full rounded-md border-gray-300"
                />
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setEditForm(null);
                    }}
                    className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{product.name}</h3>
                  <p className="text-sm text-gray-600">Quantity: {product.quantity}</p>
                  <p className="text-sm text-gray-600">Price: ${product.price.toFixed(2)}</p>
                  <p className="text-sm text-gray-600">Category: {product.category}</p>
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product._id!)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}