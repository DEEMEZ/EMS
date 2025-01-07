'use client';

import { useState } from 'react';
import ProductForm from '@/components/productform';
import ProductList from '@/components/productlist';
import { div } from 'framer-motion/client';
import NavbarComponent from '@/components/navbar/navbar';

export default function Home() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleProductUpdate = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div>
      <NavbarComponent />
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Inventory Management System</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <ProductForm onProductUpdate={handleProductUpdate} />
        </div>
        <div>
          <ProductList refreshTrigger={refreshTrigger} />
        </div>
      </div>
    </main>
    </div>
  );
}