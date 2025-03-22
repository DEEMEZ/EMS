/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { LoadingSpinner } from '@/components/loadiingspinner';
import { AnimatePresence, motion } from 'framer-motion';
import { Building, CheckCircle, CreditCard, List, Save, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useState } from 'react';

interface IncomeFormProps {
  initialData?: any;
  onCancel?: () => void;
  onSuccess?: () => void;
}

export default function IncomeForm({ initialData, onCancel, onSuccess }: IncomeFormProps) {
  const [formData, setFormData] = useState({
    transactionId: initialData?.transactionId || '',
    incomeSourceId: initialData?.incomeSourceId || '',
    orgId: initialData?.orgId || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    setSuccessMessage('');

    if (!isAuthenticated) {
      setError('Authentication required');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/incomes', {
        method: initialData ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, _id: initialData?._id }),
      });

      if (response.ok) {
        const successMsg = initialData
          ? 'Income Updated Successfully!'
          : 'Income Created Successfully!';
        setSuccessMessage(successMsg);

        setTimeout(() => setSuccessMessage(''), 3000);

        if (onSuccess) {
          setTimeout(() => {
            onSuccess();
          }, 1000);
        }

        if (!initialData) {
          setFormData({
            transactionId: '',
            incomeSourceId: '',
            orgId: '',
          });
        }
      } else {
        setError('Failed to save income. Please check the input data.');
      }
    } catch {
      setError('Failed to save income');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-200"
    >
      <div className="bg-gradient-to-r from-blue-600 to-blue-400 px-6 py-4 rounded-t-2xl">
        <h2 className="text-xl font-semibold text-white">
          {initialData ? 'Update Income' : 'Create New Income'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md"
            >
              <p className="text-red-700">{error}</p>
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

        <div className="space-y-4">
          {/* Transaction ID Field */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 gap-2">
              <CreditCard className="w-4 h-4" />
              Transaction ID
            </label>
            <input
              type="text"
              required
              value={formData.transactionId}
              onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
              className="mt-1 block w-full rounded-xl border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter Transaction ID"
            />
          </div>

          {/* Income Source ID Field */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 gap-2">
              <List className="w-4 h-4" />
              Income Source ID
            </label>
            <input
              type="text"
              required
              value={formData.incomeSourceId}
              onChange={(e) => setFormData({ ...formData, incomeSourceId: e.target.value })}
              className="mt-1 block w-full rounded-xl border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter Income Source ID"
            />
          </div>

          {/* Organization ID Field */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 gap-2">
              <Building className="w-4 h-4" />
              Organization ID
            </label>
            <input
              type="text"
              required
              value={formData.orgId}
              onChange={(e) => setFormData({ ...formData, orgId: e.target.value })}
              className="mt-1 block w-full rounded-xl border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter Organization ID"
            />
          </div>
        </div>

        {/* Form Actions */}
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
  );
}