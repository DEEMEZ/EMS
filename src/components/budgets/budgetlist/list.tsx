/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import BudgetForm from '@/components/budgets/budgetform/form';
import { LoadingSpinner } from '@/components/loadiingspinner';
import { AnimatePresence, motion } from 'framer-motion';
import _ from 'lodash';
import { AlertCircle, Edit, Plus, Search, Trash2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

export default function BudgetList() {
  const { data: session, status: authStatus } = useSession();
  const isAuthenticated = authStatus === 'authenticated';
  const isAuthLoading = authStatus === 'loading';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [budgets, setBudgets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editingBudget, setEditingBudget] = useState<any | null>(null);

  const debouncedSearch = useMemo(
    () =>
      _.debounce((value: string) => {
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
    if (!isAuthenticated) {
      setBudgets([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
      });

      const response = await fetch(`/api/budgets?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch budgets');

      const data = await response.json();
      setBudgets(data.budgets);
      setTotalPages(data.pagination.totalPages);
    } catch (err) {
      setError('Failed to fetch budgets');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (budgetId: string) => {
    try {
      setIsDeleting(budgetId);
      const response = await fetch(`/api/budgets`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ _id: budgetId }),
      });

      if (!response.ok) throw new Error('Failed to delete budget');

      await fetchBudgets();
    } catch {
      setError('Failed to delete budget');
    } finally {
      setIsDeleting(null);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const openModal = (budget?: any) => {
    if (!isAuthenticated) {
      setError('Authentication required. Please sign in.');
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
    if (isAuthenticated) {
      fetchBudgets();
    }
  }, [debouncedSearchTerm, page, isAuthenticated]);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  if (isAuthLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-center items-center h-screen">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-700">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
          <h2 className="text-xl font-semibold text-gray-800">Authentication Required</h2>
          <p className="mt-2 text-gray-600">You need to sign in to view budgets.</p>
          <Link
            href="/auth/signin"
            className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-2xl p-6 mb-6"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Budgets</h1>
            <p className="text-blue-200">Manage your budgets</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => openModal()}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-colors"
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
          />
        </div>
      </motion.div>

      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">User</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Expense Category</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Monthly Limit</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Spent Amount</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Remaining Budget</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Start Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">End Date</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>

            <tbody>
              <AnimatePresence>
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                      <LoadingSpinner size="lg" />
                    </td>
                  </tr>
                ) : budgets.length > 0 ? (
                  budgets.map((budget, index) => (
                    <motion.tr
                      key={budget._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">{budget.userId?.fullname || 'Unknown User'}</td>
                      <td className="px-6 py-4">{budget.expensecategoriesId?.name || 'Unknown Category'}</td>
                      <td className="px-6 py-4">{budget.monthlyLimit}</td>
                      <td className="px-6 py-4">{budget.spentAmount}</td>
                      <td className="px-6 py-4">{budget.remainingBudget}</td>
                      <td className="px-6 py-4">{new Date(budget.startDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4">{new Date(budget.endDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openModal(budget)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(budget._id)}
                            disabled={isDeleting === budget._id}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          >
                            {isDeleting === budget._id ? <LoadingSpinner size="sm" /> : <Trash2 className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                      No budgets found.
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && <BudgetForm initialData={editingBudget || undefined} onCancel={closeModal} onSuccess={handleSuccess} />}
    </div>
  );
}