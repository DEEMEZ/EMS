/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import ExpenseCategoryForm from '@/components/expensecategories/expensecategoriesform/form';
import { LoadingSpinner } from '@/components/loadiingspinner';
import { IExpenseCategories } from '@/types/expensecategories';
import { AnimatePresence, motion } from 'framer-motion';
import _ from 'lodash';
import { AlertCircle, ChevronLeft, ChevronRight, Edit, LogIn, Plus, Search, Trash2, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';

export default function ExpenseCategoryList() {
  // Authentication state
  const { data: session, status: authStatus } = useSession();
  const isAuthenticated = authStatus === 'authenticated';
  const isAuthLoading = authStatus === 'loading';

  // Data state
  const [expenseCategories, setExpenseCategories] = useState<IExpenseCategories[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<IExpenseCategories | null>(null);

  const debouncedSearch = useMemo(
    () => _.debounce((value: string) => {
      setDebouncedSearchTerm(value);
      setPage(1);
    }, 500),
    []
  );

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    debouncedSearch(value);
  };

  const fetchExpenseCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');

      // Only fetch if authenticated
      if (!isAuthenticated) {
        setIsLoading(false);
        return;
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(debouncedSearchTerm && { search: debouncedSearchTerm })
      });
      
      const response = await fetch(`/api/expenseCategories?${params.toString()}`);
      
      if (!response.ok) {
        // Handle authentication errors
        if (response.status === 401) {
          setError('You must be signed in to view expense categories');
          return;
        }
        throw new Error('Failed To Fetch Expense Categories');
      }

      const data = await response.json();
      setExpenseCategories(data.categories || []);
      console.log('API Response:', data);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err) {
      setError('Failed To Fetch Expense Categories');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, page, debouncedSearchTerm]);

  const handleDelete = async (categoryId: string) => {
    try {
      // Check authentication first
      if (!isAuthenticated) {
        setError('You must be signed in to delete an expense category');
        return;
      }
      
      setIsDeleting(categoryId);
      const response = await fetch(`/api/expenseCategories`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ _id: categoryId })
      });

      if (!response.ok) {
        // Check for authentication or permission errors
        if (response.status === 401) {
          setError('You must be signed in to delete an expense category');
          return;
        }
        if (response.status === 403) {
          setError('You do not have permission to delete this expense category');
          return;
        }
        throw new Error('Failed To Delete Expense Category');
      }
      
      await fetchExpenseCategories();
    } catch (err) {
      setError('Failed To Delete Expense Category');
      console.error('Error:', err);
    } finally {
      setIsDeleting(null);
    }
  };

  const openModal = (category?: IExpenseCategories) => {
    // Check authentication first
    if (!isAuthenticated) {
      setError('You must be signed in to manage expense categories');
      return;
    }
    
    setEditingCategory(category || null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingCategory(null);
    setIsModalOpen(false);
  };

  const handleSuccess = () => {
    closeModal();
    fetchExpenseCategories();
  };

  useEffect(() => {
    if (authStatus === 'authenticated') {
      fetchExpenseCategories();
    } else if (authStatus === 'unauthenticated') {
      // Clear categories if user is not authenticated
      setExpenseCategories([]);
      setIsLoading(false);
    }
  }, [debouncedSearchTerm, page, authStatus, fetchExpenseCategories]);

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
            <p className="text-amber-700">You need to sign in to manage expense categories</p>
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

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-2xl p-6 mb-6"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Expense Categories</h1>
            <p className="text-blue-200">Manage your expense categories</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => openModal()}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-colors"
            disabled={!isAuthenticated}
          >
            <Plus className="w-5 h-5" />
            New Category
          </motion.button>
        </div>

        <div className="relative mt-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white-300" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/30"
            disabled={!isAuthenticated}
          />
        </div>
      </motion.div>

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

      {/* Categories Table - Only show when authenticated and not loading */}
      {isAuthenticated && !isLoading && !isAuthLoading && (
        <>
          {/* Instructions Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold mb-2 text-gray-800">How to Use This Page</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li><strong>Purpose:</strong> This page allows you to manage your expense categories.</li>
              <li><strong>Add a New Category:</strong> Click the "New Category" button, fill in the name and description (optional), then click "Save".</li>
              <li><strong>Edit a Category:</strong> Click the Edit (pencil) button in the Actions column to modify an existing category.</li>
              <li><strong>Delete a Category:</strong> Click the Delete (trash) button in the Actions column to remove a category.</li>
              <li><strong>Search Categories:</strong> Use the search bar to find categories by name.</li>
              <li><strong>Navigate Pages:</strong> Use the pagination controls at the bottom to navigate through pages of categories.</li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Description</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {expenseCategories.map((category, index) => (
                      <motion.tr
                        key={category._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.1 }}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="px-6 py-4">{category.name}</td>
                        <td className="px-6 py-4">{category.description}</td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => openModal(category)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(category._id!)}
                              disabled={isDeleting === category._id}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            >
                              {isDeleting === category._id ? (
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
            {expenseCategories.length === 0 && !isLoading && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="text-center">
                  <h3 className="text-lg font-medium text-gray-900">No Categories Found</h3>
                  <p className="text-gray-500 mt-1">Get started by creating a new expense category.</p>
                  <button
                    onClick={() => openModal()}
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="w-5 h-5" />
                    New Category
                  </button>
                </div>
              </div>
            )}

            {/* Pagination */}
            {expenseCategories.length > 0 && (
              <div className="flex items-center justify-between px-6 py-4 bg-gray-50">
                <div className="text-sm text-gray-500">
                  Showing {expenseCategories.length} Categories
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
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Sign in to Manage Categories</h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            You need to be signed in to view and manage your expense categories. Please sign in to continue.
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
                {editingCategory ? 'Edit Expense Category' : 'New Expense Category'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <ExpenseCategoryForm
                initialData={editingCategory || undefined}
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