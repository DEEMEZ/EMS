'use client';

import { LoadingSpinner } from '@/components/loadiingspinner';
import TransactionForm from '@/components/transactions/transactionform/form';
import { ITransaction } from '@/types/transaction';
import { AnimatePresence, motion } from 'framer-motion';
import _ from 'lodash';
import {
    AlertCircle,
    Edit,
    Plus,
    Search,
    Trash2
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

export default function TransactionList() {
  const [transactions, setTransactions] = useState<ITransaction[]>([]);
  const [, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [, setTotalPages] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<ITransaction | null>(null);

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

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      setError('');

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
      });

      const response = await fetch(`/api/transactions?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch transactions');

      const data = await response.json();
      setTransactions(data.transactions);
      setTotalPages(data.pagination.totalPages);
    } catch (err) {
      setError('Failed to fetch transactions');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (transactionId: string) => {
    try {
      setIsDeleting(transactionId);
      const response = await fetch(`/api/transactions`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ _id: transactionId }),
      });

      if (!response.ok) throw new Error('Failed to delete transaction');

      await fetchTransactions();
    } catch {
      setError('Failed to delete transaction');
    } finally {
      setIsDeleting(null);
    }
  };

  const openModal = (transaction?: ITransaction) => {
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
    fetchTransactions();
  }, [debouncedSearchTerm, page]);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-2xl p-6 mb-6"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Transactions</h1>
            <p className="text-blue-200">Manage your transactions</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => openModal()}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-colors"
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
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">User ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Type</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Description</th>
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
                    <td className="px-6 py-4">{transaction.userId}</td>
                    <td className="px-6 py-4">{transaction.type}</td>
                    <td className="px-6 py-4">{new Date(transaction.transactionDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4">{transaction.description}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openModal(transaction)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(transaction._id!)}
                          disabled={isDeleting === transaction._id}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
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
      </div>

      {isModalOpen && (
        <TransactionForm initialData={editingTransaction || undefined} onCancel={closeModal} onSuccess={handleSuccess} />
      )}
    </div>
  );
}
