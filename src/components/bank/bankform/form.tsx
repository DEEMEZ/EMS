/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { LoadingSpinner } from '@/components/loadiingspinner';
import { IBank } from '@/types/bank';
import { AnimatePresence, motion } from 'framer-motion';
import { Banknote, CheckCircle, Save, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useState } from 'react';

interface BankFormProps {
  initialData?: IBank;
  onCancel?: () => void;
  onSuccess?: () => void;
}

export default function BankForm({ initialData, onCancel, onSuccess }: BankFormProps) {
  const [formData, setFormData] = useState<IBank>({
    name: initialData?.name || '',
    accountNumber: initialData?.accountNumber || '',
    branch: initialData?.branch || '',
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

    try {
      const response = await fetch('/api/bank', {
        method: initialData ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, _id: initialData?._id }),
      });

      if (response.ok) {
        const successMsg = initialData
          ? 'Bank Updated Successfully!'
          : 'Bank Created Successfully!';
        setSuccessMessage(successMsg);

        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);

        if (onSuccess) {
          setTimeout(() => {
            onSuccess();
          }, 1000); // Short delay to show success message
        }

        if (!initialData) {
          setFormData({
            name: '',
            accountNumber: '',
            branch: '',
          });
        }
      } else {
        setError('Failed To Save Bank');
      }
    } catch {
      setError('Failed To Save Bank');
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
          {initialData ? 'Update Bank' : 'Create New Bank'}
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
          {/* Name Field */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 gap-2">
              <Banknote className="w-4 h-4" />
              Bank Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full rounded-xl border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:ring-green-500"
              placeholder="Enter Bank Name"
            />
          </div>

          {/* Account Number Field */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 gap-2">
              Account Number
            </label>
            <input
              type="text"
              required
              value={formData.accountNumber}
              onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
              className="mt-1 block w-full rounded-xl border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:ring-green-500"
              placeholder="Enter Account Number"
            />
          </div>

          {/* Branch Field */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 gap-2">
              Branch
            </label>
            <input
              type="text"
              required
              value={formData.branch}
              onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
              className="mt-1 block w-full rounded-xl border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:ring-green-500"
              placeholder="Enter Branch Name"
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
