/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { LoadingSpinner } from '@/components/loadiingspinner';
import { ITransaction } from '@/types/transaction';
import { IUser } from '@/types/user';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, Save, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

interface TransactionFormProps {
  initialData?: ITransaction;
  onCancel?: () => void;
  onSuccess?: () => void;
}

export default function TransactionForm({ initialData, onCancel, onSuccess }: TransactionFormProps) {
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const isAuthLoading = status === 'loading';

  // Helper function to extract user ID from either string or IUser object
  const getUserId = (userId: string | IUser | undefined): string => {
    if (!userId) return '';
    if (typeof userId === 'string') return userId;
    return userId._id || '';
  };

  const [formData, setFormData] = useState<ITransaction>({
    userId: getUserId(initialData?.userId) || (isAuthenticated ? session?.user?.id : ''),
    amount: initialData?.amount || 0,
    type: initialData?.type || 'Income',
    transactionDate: initialData?.transactionDate || new Date(),
    description: initialData?.description || '',
  });

  // Get the string version of userId for the input field
  const userIdString = getUserId(formData.userId);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Update form data when session changes
  useEffect(() => {
    if (isAuthenticated && session?.user?.id) {
      setFormData(prev => ({
        ...prev,
        userId: session.user.id
      }));
    }
  }, [isAuthenticated, session]);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!userIdString) {
      errors.userId = 'User ID Is Required.';
    }

    if (typeof formData.amount !== 'number' || formData.amount <= 0) {
      errors.amount = 'Amount Must Be A Positive Number.';
    }

    if (!formData.transactionDate) {
      errors.transactionDate = 'Transaction Date Is Required.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setValidationErrors({});

    if (!isAuthenticated) {
      setError('Authentication required');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        _id: initialData?._id,
        // Ensure we always send the string ID
        userId: session?.user?.id,
        // Include userTokenId as required by your model
        userTokenId: session?.user?.id
      };

      const response = await fetch('/api/transactions', {
        method: initialData ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setSuccessMessage(initialData ? 'Transaction Updated Successfully!' : 'Transaction Created Successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
        if (onSuccess) setTimeout(onSuccess, 1000);
        if (!initialData) {
          setFormData({ 
            userId: session?.user?.id || '', 
            amount: 0, 
            type: 'Income', 
            transactionDate: new Date(), 
            description: '' 
          });
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed To Save Transaction.');
      }
    } catch (err) {
      setError('Failed To Save Transaction. Please Try Again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-700">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
          <h2 className="text-xl font-semibold text-gray-800">Authentication Required</h2>
          <p className="mt-2 text-gray-600">You need to sign in to create or update transactions.</p>
          <a
            href="/auth/signin"
            className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

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
                value={userIdString}  
                readOnly
                className="mt-1 block w-full rounded-xl border px-3 py-2 shadow-sm bg-gray-100 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Amount</label>
              <input
                type="number"
                required
                min="0.01"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                className="mt-1 block w-full rounded-xl border px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter Transaction Amount"
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
                placeholder="Enter Description"
                rows={3}
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
              disabled={isSubmitting || !isAuthenticated}
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