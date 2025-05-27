/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import StatsSection from '@/components/StatsSection';
import { LoadingSpinner } from '@/components/loadiingspinner';
import ProductForm from '@/components/product/productform/form';
import { IProduct } from '@/types';
import { AnimatePresence, motion } from 'framer-motion';
import _ from 'lodash';
import { AlertCircle, ChevronLeft, ChevronRight, Edit, LogIn, Package, Plus, Search, Trash2, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';

export default function ProductList() {
  // Authentication state
  const { data: session, status: authStatus } = useSession();
  const isAuthenticated = authStatus === 'authenticated';
  const isAuthLoading = authStatus === 'loading';

  // Data state
  const [products, setProducts] = useState<IProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState<string[]>([]);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<IProduct | null>(null);

  // Create debounced search function
  const debouncedSearch = useMemo(
    () => _.debounce((value: string) => {
      setDebouncedSearchTerm(value);
      setPage(1); // Reset to first page on new search
    }, 500),
    []
  );

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    debouncedSearch(value);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setPage(1); // Reset to first page when filter changes
  };

  // Fetch Products
  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Only fetch data if the user is authenticated
      if (authStatus !== 'authenticated') {
        setIsLoading(false);
        return;
      }
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
        ...(selectedCategory && { category: selectedCategory })
      });

      const response = await fetch(`/api/products?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      const data = await response.json();
      setProducts(data.products || []);
      setTotalPages(data.pagination?.totalPages || 1);

      // Extract unique categories with proper typing
      if (data.products?.length > 0) {
        const productCategories = data.products.map((p: IProduct) => p.category);
        const uniqueCategories = [...new Set(productCategories)] as string[];
        setCategories(uniqueCategories);
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to fetch products. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [authStatus, page, debouncedSearchTerm, selectedCategory]);

  // Delete Product
  const handleDelete = async (productId: string) => {
    try {
      setIsDeleting(productId);
      
      // Only proceed if the user is authenticated
      if (authStatus !== 'authenticated') {
        setError('You must be logged in to delete a product');
        return;
      }
      
      const response = await fetch(`/api/products?id=${productId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }
      
      await fetchProducts();
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to delete product. Please try again.');
    } finally {
      setIsDeleting(null);
    }
  };

  // Modal Controls
  const openModal = (product?: IProduct) => {
    // Only open modal if user is authenticated
    if (authStatus !== 'authenticated') {
      setError('You must be logged in to manage products');
      return;
    }
    
    setEditingProduct(product || null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingProduct(null);
    setIsModalOpen(false);
  };

  const handleSuccess = () => {
    closeModal();
    fetchProducts();
  };

  // Effect Hooks
  useEffect(() => {
    if (authStatus === 'authenticated') {
      fetchProducts();
    } else if (authStatus === 'unauthenticated') {
      // Clear products if user is not authenticated
      setProducts([]);
      setIsLoading(false);
    }
  }, [fetchProducts, authStatus]);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Authentication Status Banner */}
      {!isAuthenticated && !isAuthLoading && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6 rounded-lg flex items-center gap-3"
        >
          <AlertCircle className="w-5 h-5 text-amber-400" />
          <div className="flex-1">
            <p className="text-amber-700">You need to sign in to manage products</p>
          </div>
          <Link
            href="/auth/signin"
            className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors"
          >
            <LogIn className="w-4 h-4" />
            Sign In
          </Link>
        </motion.div>
      )}

      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-2xl p-6 mb-6"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Products</h1>
            <p className="text-blue-100">Manage your product inventory</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => openModal()}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-colors"
            disabled={!isAuthenticated}
          >
            <Plus className="w-5 h-5" />
            New Product
          </motion.button>
        </div>

        {/* Search and Filter Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/30"
              disabled={!isAuthenticated}
            />
          </div>
          
          <div className="relative">
            <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300" />
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-xl 
              text-white focus:outline-none focus:ring-2 focus:ring-white/30 appearance-none
              focus:bg-white focus:text-gray-900 transition-colors"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 0.5rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.5em 1.5em'
              }}
              disabled={!isAuthenticated || categories.length === 0}
            >
              <option value="" className="bg-white text-gray-900">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category} className="bg-white text-gray-900">
                  {category}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => fetchProducts()}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 text-white transition-colors"
            disabled={!isAuthenticated}
          >
            <Search className="w-5 h-5" />
            Refresh
          </button>
        </div>
      </motion.div>

      {/* Add StatsSection here */}
      {isAuthenticated && !isLoading && <StatsSection />}

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-lg flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-700">{error}</p>
            <button 
              onClick={() => setError('')}
              className="ml-auto p-1 text-red-400 hover:text-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Authentication Loading State */}
      {isAuthLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-500">Checking authentication...</p>
          </div>
        </div>
      )}

      {/* Products Table - Only show when authenticated and not loading */}
      {isAuthenticated && !isLoading && !isAuthLoading && (
        <>
          {/* Instructions Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold mb-2 text-gray-800">How to Use This Page</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li><strong>Purpose:</strong> This page allows you to manage your product inventory.</li>
              <li><strong>Add a New Product:</strong> Click the "New Product" button, fill in the product name, quantity, price, and category, then click "Save".</li>
              <li><strong>Edit a Product:</strong> Click the Edit (pencil) button in the Actions column to modify an existing product.</li>
              <li><strong>Delete a Product:</strong> Click the Delete (trash) button in the Actions column to remove a product.</li>
              <li><strong>Search Products:</strong> Use the search bar to find products by name.</li>
              <li><strong>Filter by Category:</strong> Use the category dropdown to filter products.</li>
              <li><strong>Navigate Pages:</strong> Use the pagination controls at the bottom to navigate through pages of products.</li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Product</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Category</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Quantity</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Price</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {products.map((product, index) => (
                      <motion.tr
                        key={product._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.1 }}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                              <Package className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{product.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                            {product.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">{product.quantity}</td>
                        <td className="px-6 py-4 font-medium">${product.price.toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => openModal(product)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(product._id!)}
                              disabled={isDeleting === product._id}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            >
                              {isDeleting === product._id ? (
                                <LoadingSpinner size="sm" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {products.length === 0 && !isLoading && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="text-center">
                  <h3 className="text-lg font-medium text-gray-900">No Products Found</h3>
                  <p className="text-gray-500 mt-1">Get started by creating a new product.</p>
                  <button
                    onClick={() => openModal()}
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="w-5 h-5" />
                    New Product
                  </button>
                </div>
              </div>
            )}

            {/* Pagination */}
            {products.length > 0 && (
              <div className="flex items-center justify-between px-6 py-4 bg-gray-50">
                <div className="text-sm text-gray-500">
                  Showing {products.length} Products
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="flex items-center px-3 py-1 text-sm font-medium text-gray-600">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={page === totalPages}
                    className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Not Authenticated State */}
      {!isAuthenticated && !isAuthLoading && !isLoading && (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Sign in to Manage Products</h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            You need to be signed in to view and manage your products. Please sign in to continue.
          </p>
          <Link
            href="/auth/signin"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            <LogIn className="w-5 h-5" />
            Sign In
          </Link>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden"
          >
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h2 className="text-xl font-semibold">
                {editingProduct ? 'Edit Product' : 'New Product'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <ProductForm
                initialData={editingProduct || undefined}
                onCancel={closeModal}
                onSuccess={handleSuccess}
              />
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}