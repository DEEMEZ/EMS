'use client';

import { LoadingSpinner } from '@/components/loadiingspinner';
import { IExpenseCategories } from '@/types/expensecategories';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, Save, X } from 'lucide-react';
import { useState } from 'react';
import { useSession } from 'next-auth/react';

interface ExpenseCategoryFormProps {
  initialData?: IExpenseCategories;
  onCancel?: () => void;
  onSuccess?: () => void;
}

export default function ExpenseCategoryForm({
  initialData,
  onCancel,
  onSuccess,
}: ExpenseCategoryFormProps) {
  const { status } = useSession();
  const isAuthenticated = status === 'authenticated';
  
  const [formData, setFormData] = useState<IExpenseCategories>({
    name: initialData?.name || '',
    description: initialData?.description || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user is authenticated
    if (!isAuthenticated) {
      setError('You must be signed in to create or update expense categories');
      return;
    }
    
    setError('');
    setIsSubmitting(true);
    setSuccessMessage('');

    try {
      const response = await fetch('/api/expensecategories', {
        method: initialData?._id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, _id: initialData?._id }),
      });

      if (response.ok) {
        const successMsg = initialData?._id
          ? 'Expense Category Updated Successfully!'
          : 'Expense Category Created Successfully!';
        setSuccessMessage(successMsg);

        setTimeout(() => setSuccessMessage(''), 3000);

        if (onSuccess) {
          setTimeout(() => {
            onSuccess();
          }, 1000);
        }

        if (!initialData) {
          setFormData({
            name: '',
            description: '',
          });
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed To Save Expense Category');
      }
    } catch (error) {
      setError('Failed To Save Expense Category');
      console.error('Error:', error);
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
          {initialData?._id ? 'Update Expense Category' : 'Create New Expense Category'}
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
          <div>
            <label className="text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full rounded-xl border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter Expense Category Name"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="mt-1 block w-full rounded-xl border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter Expense Category Description (Optional)"
            />
          </div>
        </div>

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
                {initialData?._id ? 'Update' : 'Create'}
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}