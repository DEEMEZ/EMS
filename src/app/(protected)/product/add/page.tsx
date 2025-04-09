'use client';

import ProductForm from "@/components/product/productform/form";

export default function AddProduct() {
  return (
    <div>
      {/* <NavbarComponent /> */}
      <div className="container mx-auto px-4 py-8">
        <ProductForm />
      </div>
    </div>
  );
}