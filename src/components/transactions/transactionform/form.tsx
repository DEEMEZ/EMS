/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { LoadingSpinner } from '@/components/loadiingspinner';
import { ITransaction } from '@/types/transaction';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, Save, X } from 'lucide-react';
import { useState } from 'react';

interface TransactionFormProps {
  initialData?: ITransaction;
  onCancel?: () => void;
  onSuccess?: () => void;
}

export default function TransactionForm({ initialData, onCancel, onSuccess }: TransactionFormProps) {
  const [formData, setFormData] = useState<ITransaction>({
    userId: initialData?.userId || '',
    amount: initialData?.amount || 0,
    type: initialData?.type || 'Income',
    transactionDate: initialData?.transactionDate || new Date(),
    description: initialData?.description || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.userId) {
      errors.userId = 'User ID is required.';
    }

    if (typeof formData.amount !== 'number' || formData.amount < 0) {
      errors.amount = 'Amount must be a positive number.';
    }

    if (!formData.transactionDate) {
      errors.transactionDate = 'Transaction date is required.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setValidationErrors({});

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/transactions', {
        method: initialData ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, _id: initialData?._id }),
      });

      if (response.ok) {
        setSuccessMessage(initialData ? 'Transaction updated successfully!' : 'Transaction created successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
        if (onSuccess) setTimeout(onSuccess, 1000);
        if (!initialData) {
          setFormData({ userId: '', amount: 0, type: 'Income', transactionDate: new Date(), description: '' });
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to save transaction.');
      }
    } catch (err) {
      setError('Failed to save transaction. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="max-w-4xl w-full bg-white rounded-2xl shadow-xl border border-gray-200"
      >
        {/* Header with Close Button */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-400 px-6 py-4 rounded-t-2xl flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white">
            {initialData ? 'Update Transaction' : 'Create New Transaction'}
          </h2>
          {onCancel && (
            <button
              onClick={onCancel}
              className="text-white hover:text-gray-200 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md text-red-700"
              >
                {error}
              </motion.div>
            )}
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2"
              >
                <CheckCircle className="h-5 w-5 text-green-600" />
                <p className="text-green-700">{successMessage}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">User ID</label>
              <input
                type="text"
                required
                value={typeof formData.userId === 'object' ? formData.userId._id : formData.userId || ''}
                onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                className="mt-1 block w-full rounded-xl border px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter user ID"
                aria-describedby="userIdError"
              />
              {validationErrors.userId && (
                <p id="userIdError" className="text-sm text-red-600 mt-1">
                  {validationErrors.userId}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Amount</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                className="mt-1 block w-full rounded-xl border px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter transaction amount"
                aria-describedby="amountError"
              />
              {validationErrors.amount && (
                <p id="amountError" className="text-sm text-red-600 mt-1">
                  {validationErrors.amount}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Transaction Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'Income' | 'Expense' })}
                className="mt-1 block w-full rounded-xl border px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="Income">Income</option>
                <option value="Expense">Expense</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Transaction Date</label>
              <input
                type="date"
                required
                value={new Date(formData.transactionDate).toISOString().split('T')[0]}
                onChange={(e) => setFormData({ ...formData, transactionDate: new Date(e.target.value) })}
                className="mt-1 block w-full rounded-xl border px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                aria-describedby="transactionDateError"
              />
              {validationErrors.transactionDate && (
                <p id="transactionDateError" className="text-sm text-red-600 mt-1">
                  {validationErrors.transactionDate}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1 block w-full rounded-xl border px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter description"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end items-center gap-3 pt-6 border-t">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="flex items-center gap-2 px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {initialData ? 'Update' : 'Create'}
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}