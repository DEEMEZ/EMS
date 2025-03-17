'use client';

import BudgetForm from '@/components/budgets/budgetform/form';
import { LoadingSpinner } from '@/components/loadiingspinner';
import { IBudget } from '@/types/budget';
import { AnimatePresence, motion } from 'framer-motion';
import _ from 'lodash';
import { AlertCircle, ChevronLeft, ChevronRight, Edit, LogIn, Plus, Search, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function BudgetList() {
  // Authentication state
  const { data: session, status: authStatus } = useSession();
  const isAuthenticated = authStatus === 'authenticated';
  const isAuthLoading = authStatus === 'loading';

  // Data state
  const [budgets, setBudgets] = useState<IBudget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<IBudget | null>(null);

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

  const fetchBudgets = async () => {
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

      const response = await fetch(`/api/budgets?${params.toString()}`);
      
      if (!response.ok) {
        // Handle authentication errors
        if (response.status === 401) {
          setError('You must be signed in to view budgets');
          return;
        }
        throw new Error('Failed to fetch budgets');
      }

      const data = await response.json();
      setBudgets(data.budgets || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err) {
      setError('Failed to fetch budgets');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (budgetId: string) => {
    try {
      // Check authentication first
      if (!isAuthenticated) {
        setError('You must be signed in to delete a budget');
        return;
      }
      
      setIsDeleting(budgetId);
      const response = await fetch(`/api/budgets`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ _id: budgetId })
      });

      if (!response.ok) {
        // Check for authentication or permission errors
        if (response.status === 401) {
          setError('You must be signed in to delete a budget');
          return;
        }
        if (response.status === 403) {
          setError('You do not have permission to delete this budget');
          return;
        }
        throw new Error('Failed to delete budget');
      }
      
      await fetchBudgets();
    } catch (err) {
      setError('Failed to delete budget');
      console.error('Error:', err);
    } finally {
      setIsDeleting(null);
    }
  };

  const openModal = (budget?: IBudget) => {
    // Check authentication first
    if (!isAuthenticated) {
      setError('You must be signed in to manage budgets');
      return;
    }
    
    setEditingBudget(budget || null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingBudget(null);
    setIsModalOpen(false);
  };

  const handleSuccess = () => {
    closeModal();
    fetchBudgets();
  };

  useEffect(() => {
    if (authStatus === 'authenticated') {
      fetchBudgets();
    } else if (authStatus === 'unauthenticated') {
      // Clear budgets if user is not authenticated
      setBudgets([]);
      setIsLoading(false);
    }
  }, [debouncedSearchTerm, page, authStatus]);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  // Format date for display
  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString();
  };

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
            <p className="text-amber-700">You need to sign in to manage budgets</p>
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
            <h1 className="text-2xl font-bold text-white">Budgets</h1>
            <p className="text-blue-200">Manage your monthly budgets</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => openModal()}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-colors"
            disabled={!isAuthenticated}
          >
            <Plus className="w-5 h-5" />
            New Budget
          </motion.button>
        </div>

        <div className="relative mt-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white-300" />
          <input
            type="text"
            placeholder="Search budgets..."
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

      {/* Budgets Table - Only show when authenticated and not loading */}
      {isAuthenticated && !isLoading && !isAuthLoading && (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Monthly Limit</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Spent</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Remaining</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Start Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">End Date</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {budgets.map((budget, index) => (
                    <motion.tr
                      key={budget._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        {typeof budget.expensecategoriesId === 'object' 
                          ? budget.expensecategoriesId.name 
                          : 'Unknown Category'}
                      </td>
                      <td className="px-6 py-4">${budget.monthlyLimit.toFixed(2)}</td>
                      <td className="px-6 py-4">${budget.spentAmount.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className={budget.remainingBudget < 0 ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
                          ${budget.remainingBudget.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4">{formatDate(budget.startDate)}</td>
                      <td className="px-6 py-4">{formatDate(budget.endDate)}</td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openModal(budget)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(budget._id!)}
                            disabled={isDeleting === budget._id}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          >
                            {isDeleting === budget._id ? (
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
          {budgets.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900">No Budgets Found</h3>
                <p className="text-gray-500 mt-1">Get started by creating a new budget.</p>
                <button
                  onClick={() => openModal()}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-5 h-5" />
                  New Budget
                </button>
              </div>
            </div>
          )}

          {/* Pagination */}
          {budgets.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4 bg-gray-50">
              <div className="text-sm text-gray-500">
                Showing {budgets.length} Budgets
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
      )}

      {/* Not Authenticated State */}
      {!isAuthenticated && !isAuthLoading && !isLoading && (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Sign in to Manage Budgets</h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            You need to be signed in to view and manage your budgets. Please sign in to continue.
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
        <BudgetForm 
          initialData={editingBudget || undefined} 
          onCancel={closeModal} 
          onSuccess={handleSuccess} 
        />
      )}
    </div>
  );
}