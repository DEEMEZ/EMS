'use client';

import { LoadingSpinner } from '@/components/loadiingspinner';
import { IBudget } from '@/types/budget';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, Save, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface BudgetFormProps {
  initialData?: IBudget;
  onCancel?: () => void;
  onSuccess?: () => void;
}

export default function BudgetForm({ initialData, onCancel, onSuccess }: BudgetFormProps) {
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';
  
  const [formData, setFormData] = useState<IBudget>({
    expensecategoriesId: initialData?.expensecategoriesId || '',
    monthlyLimit: initialData?.monthlyLimit || 0,
    spentAmount: initialData?.spentAmount || 0, 
    startDate: initialData?.startDate || new Date(),
    endDate: initialData?.endDate || new Date(),
    remainingBudget: 0
  });

  const [categories, setCategories] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch expense categories when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/expense-categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data.categories || []);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user is authenticated
    if (!isAuthenticated) {
      setError('You must be signed in to create or update budgets');
      return;
    }
    
    setError('');
    setIsSubmitting(true);
    setSuccessMessage('');

    try {
      const response = await fetch('/api/budgets', {
        method: initialData?._id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          _id: initialData?._id,
          // We don't send userId - it will be set from the session token on the server
        }),
      });

      if (response.ok) {
        const successMsg = initialData?._id
          ? 'Budget updated successfully!'
          : 'Budget created successfully!';
        setSuccessMessage(successMsg);

        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);

        if (onSuccess) {
          setTimeout(() => {
            onSuccess();
          }, 1000);
        }

        if (!initialData) {
          setFormData({
            expensecategoriesId: '',
            monthlyLimit: 0,
            spentAmount: 0,
            startDate: new Date(),
            endDate: new Date(),
            remainingBudget: 0
          });
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to save budget');
      }
    } catch (error) {
      setError('Failed to save budget');
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format date for input fields
  const formatDateForInput = (date: Date | string) => {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };

  return (
    <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="max-w-4xl w-full bg-white rounded-2xl shadow-xl border border-gray-200"
      >
        <div className="bg-gradient-to-r from-blue-600 to-blue-400 px-6 py-4 rounded-t-2xl flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white">
            {initialData?._id ? 'Update Budget' : 'Create New Budget'}
          </h2>
          {onCancel && (
            <button onClick={onCancel} className="text-white hover:text-gray-200 transition-colors">
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
              <label className="text-sm font-medium text-gray-700">Expense Category</label>
              <select
                required
                value={formData.expensecategoriesId as string}
                onChange={(e) => setFormData({ ...formData, expensecategoriesId: e.target.value })}
                className="mt-1 block w-full rounded-xl border px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select a Category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Monthly Limit</label>
              <input
                type="number"
                required
                value={formData.monthlyLimit}
                onChange={(e) =>
                  setFormData({ ...formData, monthlyLimit: parseFloat(e.target.value) || 0 })
                }
                className="mt-1 block w-full rounded-xl border px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter monthly limit"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Spent Amount</label>
              <input
                type="number"
                required
                value={formData.spentAmount}
                onChange={(e) =>
                  setFormData({ ...formData, spentAmount: parseFloat(e.target.value) || 0 })
                }
                className="mt-1 block w-full rounded-xl border px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter spent amount"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="date"
                required
                value={formatDateForInput(formData.startDate)}
                onChange={(e) => setFormData({ ...formData, startDate: new Date(e.target.value) })}
                className="mt-1 block w-full rounded-xl border px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">End Date</label>
              <input
                type="date"
                required
                value={formatDateForInput(formData.endDate)}
                onChange={(e) => setFormData({ ...formData, endDate: new Date(e.target.value) })}
                className="mt-1 block w-full rounded-xl border px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
                  {initialData?._id ? 'Update' : 'Create'}
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}