import { LoadingSpinner } from '@/components/loadiingspinner';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, Link, Save, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

interface BudgetData {
  _id?: string;
  userId?: string;
  expensecategoriesId: string;
  monthlyLimit: number | string;
  spentAmount: number;
  startDate: string;
  endDate: string;
}

interface ExpenseCategory {
  _id: string;
  name: string;
  description?: string;
  userId: string;
}

interface BudgetFormProps {
  initialData?: BudgetData;
  onCancel?: () => void;
  onSuccess?: () => void;
}

export default function BudgetForm({ initialData, onCancel, onSuccess }: BudgetFormProps) {
  const { data: session, status: authStatus } = useSession();
  const isAuthenticated = authStatus === 'authenticated';
  const isAuthLoading = authStatus === 'loading';

  const [formData, setFormData] = useState<BudgetData>({
    userId: initialData?.userId || (isAuthenticated ? session?.user?.id : ''),
    expensecategoriesId: initialData?.expensecategoriesId || '',
    monthlyLimit: initialData?.monthlyLimit || '',
    spentAmount: initialData?.spentAmount || 0,
    startDate: initialData?.startDate || '',
    endDate: initialData?.endDate || '',
  });

  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [categoriesError, setCategoriesError] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchExpenseCategories = async () => {
      if (!isAuthenticated) return;
      
      setIsLoadingCategories(true);
      setCategoriesError('');
      try {
        const response = await fetch('/api/expensecategories');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.categories || !Array.isArray(data.categories)) {
          throw new Error('Invalid data format received');
        }
        
        setExpenseCategories(data.categories);
      } catch (error) {
        console.error('Error fetching expense categories:', error);
        setCategoriesError('Failed to load expense categories. Please try again later.');
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchExpenseCategories();
  }, [isAuthenticated, retryCount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);
    setSuccessMessage('');

    if (!isAuthenticated) {
      setErrorMessage('Authentication required. Please sign in.');
      setIsSubmitting(false);
      return;
    }

    // Validate numeric fields
    const monthlyLimitNum = typeof formData.monthlyLimit === 'string' 
      ? parseFloat(formData.monthlyLimit) 
      : formData.monthlyLimit;
    
    if (isNaN(monthlyLimitNum)) {
      setErrorMessage('Please enter a valid number for monthly limit');
      setIsSubmitting(false);
      return;
    }

    if (isNaN(formData.spentAmount)) {
      setErrorMessage('Please enter a valid number for spent amount');
      setIsSubmitting(false);
      return;
    }

    try {
      const remainingBudget = monthlyLimitNum - formData.spentAmount;

      const response = await fetch('/api/budgets', {
        method: initialData ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          monthlyLimit: monthlyLimitNum,
          remainingBudget,
          _id: initialData?._id,
        }),
      });

      if (response.ok) {
        setSuccessMessage(initialData ? 'Budget updated successfully!' : 'Budget created successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
        if (onSuccess) setTimeout(onSuccess, 1000);
        if (!initialData) {
          setFormData({
            userId: session?.user?.id || '',
            expensecategoriesId: '',
            monthlyLimit: '',
            spentAmount: 0,
            startDate: '',
            endDate: '',
          });
        }
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.error || 'Error saving budget. Please check the input data.');
      }
    } catch (error) {
      console.error('Error saving budget:', error);
      setErrorMessage('Failed to save budget. Please try again.');
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
          <p className="mt-2 text-gray-600">You need to sign in to create or update budgets.</p>
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
    <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="max-w-4xl w-full bg-white rounded-2xl shadow-xl border border-gray-200"
      >
        <div className="bg-gradient-to-r from-blue-600 to-blue-400 px-6 py-4 rounded-t-2xl flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white">
            {initialData ? 'Update Budget' : 'Create New Budget'}
          </h2>
          {onCancel && (
            <button onClick={onCancel} className="text-white hover:text-gray-200 transition-colors">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <AnimatePresence>
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md text-red-700"
              >
                {errorMessage}
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
              <label className="text-sm font-medium text-gray-700">User ID</label>
              <input
                type="text"
                value={formData.userId}
                readOnly
                className="mt-1 block w-full rounded-xl border px-3 py-2 shadow-sm bg-gray-100 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Expense Category</label>
              {isLoadingCategories ? (
                <div className="mt-1 block w-full rounded-xl border px-3 py-2 shadow-sm bg-gray-100">
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Loading categories...</span>
                </div>
              ) : categoriesError ? (
                <div className="mt-1 p-2 text-red-500 text-sm bg-red-50 rounded-md">
                  {categoriesError}
                  <button
                    onClick={() => setRetryCount(retryCount + 1)}
                    className="ml-2 text-blue-600 hover:text-blue-800 underline"
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <select
                  required
                  value={formData.expensecategoriesId}
                  onChange={(e) => setFormData({ ...formData, expensecategoriesId: e.target.value })}
                  className="mt-1 block w-full rounded-xl border px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Select an expense category</option>
                  {expenseCategories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Monthly Limit</label>
              <input
                type="number"
                required
                value={formData.monthlyLimit === '' ? '' : formData.monthlyLimit}
                onChange={(e) => setFormData({ ...formData, monthlyLimit: e.target.value })}
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
                value={isNaN(formData.spentAmount) ? '' : formData.spentAmount}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  setFormData({ ...formData, spentAmount: isNaN(value) ? 0 : value });
                }}
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
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="mt-1 block w-full rounded-xl border px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">End Date</label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="mt-1 block w-full rounded-xl border px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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