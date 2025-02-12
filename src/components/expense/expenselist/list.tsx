/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import ExpenseForm from '@/components/expense/expenseform/form';
import { LoadingSpinner } from '@/components/loadiingspinner';
import { AnimatePresence, motion } from 'framer-motion';
import _ from 'lodash';
import { AlertCircle, Edit, Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

export default function ExpenseList() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any | null>(null);

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

  const fetchExpenses = async () => {
    try {
      setIsLoading(true);
      setError('');

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
      });

      const response = await fetch(`/api/expenses?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch expenses');

      const data = await response.json();
      setExpenses(data.expenses);
      setTotalPages(data.pagination.totalPages);
    } catch (err) {
      setError('Failed to fetch expenses');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (expenseId: string) => {
    try {
      setIsDeleting(expenseId);
      const response = await fetch(`/api/expenses`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ _id: expenseId }),
      });

      if (!response.ok) throw new Error('Failed to delete expense');
      await fetchExpenses();
    } catch {
      setError('Failed to delete expense');
    } finally {
      setIsDeleting(null);
    }
  };

  const openModal = (expense?: any) => {
    setEditingExpense(expense || null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingExpense(null);
    setIsModalOpen(false);
  };

  const handleSuccess = () => {
    closeModal();
    fetchExpenses();
  };

  useEffect(() => {
    fetchExpenses();
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
            <h1 className="text-2xl font-bold text-white">Expenses</h1>
            <p className="text-blue-200">Manage your expenses</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => openModal()}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Expense
          </motion.button>
        </div>
      </motion.div>

      {error && (
        <div className="mb-6 bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-blue-400" />
          <p className="text-blue-700">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Transaction Type</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Transaction Date</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Expense Category</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Organization</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Payment Method</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Bank</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {expenses.map((expense, index) => (
                <motion.tr
                  key={expense._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-6 py-4">{expense.transactionId?.type || 'Unknown'}</td>
                  <td className="px-6 py-4">{expense.transactionId?.transactionDate || 'Unknown'}</td>                  
                  <td className="px-6 py-4">{expense.expensecategoriesId?.name || 'Unknown'}</td>
                  <td className="px-6 py-4">{expense.orgId?.name || 'Unknown'}</td>
                  <td className="px-6 py-4">{expense.paymentMethod || 'Unknown'}</td>
                  <td className="px-6 py-4">{expense.bankId?.name || 'N/A'}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openModal(expense)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(expense._id)} disabled={isDeleting === expense._id} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                        {isDeleting === expense._id ? <LoadingSpinner size="sm" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {isModalOpen && <ExpenseForm initialData={editingExpense || undefined} onCancel={closeModal} onSuccess={handleSuccess} />}
    </div>
  );
}
