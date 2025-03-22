'use client';

import { LoadingSpinner } from '@/components/loadiingspinner';
import TransactionForm from '@/components/transactions/transactionform/form';
import { ITransaction } from '@/types/transaction';
import { AnimatePresence, motion } from 'framer-motion';
import _ from 'lodash';
import { AlertCircle, Edit, LogIn, Plus, Search, Trash2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

export default function TransactionList() {
  // Authentication state
  const { data: session, status: authStatus } = useSession();
  const isAuthenticated = authStatus === 'authenticated';
  const isAuthLoading = authStatus === 'loading';

  // Data state
  const [transactions, setTransactions] = useState<ITransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<ITransaction | null>(null);

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

  const fetchTransactions = async () => {
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
        ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
      });

      const response = await fetch(`/api/transactions?${params.toString()}`);
      if (!response.ok) throw new Error('Failed To Fetch Transactions');

      const data = await response.json();
      setTransactions(data.transactions);
      setTotalPages(data.pagination.totalPages);
    } catch (err) {
      setError('Failed To Fetch Transactions. Please Try Again.');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (transactionId: string) => {
    try {
      // Check authentication first
      if (!isAuthenticated) {
        setError('You must be signed in to delete a transaction');
        return;
      }

      setIsDeleting(transactionId);
      const response = await fetch(`/api/transactions`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ _id: transactionId }),
      });

      if (!response.ok) throw new Error('Failed To Delete Transaction');

      await fetchTransactions();
    } catch (err) {
      setError('Failed To Delete Transaction');
      console.error('Error:', err);
    } finally {
      setIsDeleting(null);
    }
  };

  const openModal = (transaction?: ITransaction) => {
    // Check authentication first
    if (!isAuthenticated) {
      setError('You must be signed in to manage transactions');
      return;
    }

    setEditingTransaction(transaction || null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingTransaction(null);
    setIsModalOpen(false);
  };

  const handleSuccess = () => {
    closeModal();
    fetchTransactions();
  };

  useEffect(() => {
    if (authStatus === 'authenticated') {
      fetchTransactions();
    } else if (authStatus === 'unauthenticated') {
      // Clear transactions if user is not authenticated
      setTransactions([]);
      setIsLoading(false);
    }
  }, [debouncedSearchTerm, page, authStatus]);

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
            <p className="text-amber-700">You need to sign in to manage transactions</p>
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
            <h1 className="text-2xl font-bold text-white">Transactions</h1>
            <p className="text-blue-200">Manage Your Transactions</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => openModal()}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-colors"
            disabled={!isAuthenticated}
          >
            <Plus className="w-5 h-5" />
            New Transaction
          </motion.button>
        </div>

        <div className="relative mt-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white-300" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/30"
            disabled={!isAuthenticated}
          />
        </div>
      </motion.div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <p className="text-red-700">{error}</p>
          <button
            onClick={fetchTransactions}
            className="ml-auto px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center h-64">
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

      {/* Transactions Table - Only show when authenticated and not loading */}
      {isAuthenticated && !isLoading && !isAuthLoading && (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">User</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Description</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Amount</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {transactions.map((transaction, index) => (
                    <motion.tr
                      key={transaction._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        {transaction.userId && typeof transaction.userId === 'object' ? (
                          <div>
                            <p className="font-semibold">{transaction.userId.fullname || 'Unknown User'}</p>
                            <p className="text-sm text-gray-500">{transaction.userId.email || 'No email'}</p>
                          </div>
                        ) : (
                          'Unknown User'
                        )}
                      </td>
                      <td className="px-6 py-4">{transaction.type}</td>
                      <td className="px-6 py-4">{new Date(transaction.transactionDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4">{transaction.description}</td>
                      <td className="px-6 py-4 font-semibold">
                        ${typeof transaction.amount === 'number' ? transaction.amount.toFixed(2) : '0.00'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openModal(transaction)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            aria-label="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(transaction._id!)}
                            disabled={isDeleting === transaction._id}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            aria-label="Delete"
                          >
                            {isDeleting === transaction._id ? <LoadingSpinner size="sm" /> : <Trash2 className="w-4 h-4" />}
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
          {transactions.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900">No Transactions Found</h3>
                <p className="text-gray-500 mt-1">Get started by creating a new transaction.</p>
                <button
                  onClick={() => openModal()}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-5 h-5" />
                  New Transaction
                </button>
              </div>
            </div>
          )}

          {/* Pagination */}
          {transactions.length > 0 && (
            <div className="flex justify-between items-center p-4 border-t border-gray-100">
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                Next
              </button>
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
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Sign in to Manage Transactions</h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            You need to be signed in to view and manage your transactions. Please sign in to continue.
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

      {/* Transaction Form Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <TransactionForm
            initialData={editingTransaction || undefined}
            onSuccess={handleSuccess}
            onCancel={closeModal}
          />
        )}
      </AnimatePresence>
    </div>
  );
}