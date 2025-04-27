/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { LoadingSpinner } from '@/components/loadiingspinner';
import { AnimatePresence, motion } from 'framer-motion';
import { Banknote, Building, CheckCircle, CreditCard, List, Save, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

interface ExpenseFormProps {
  initialData?: any;
  onCancel?: () => void;
  onSuccess?: () => void;
}

interface Organization {
  _id: string;
  name: string;
}

interface ExpenseCategory {
  _id: string;
  name: string;
  description?: string;
}

interface Transaction {
  _id: string;
  amount: number;
  type: string;
  transactionDate: string;
  description?: string;
}

interface PaymentMethod {
  _id: string;
  name: string;
}

export default function ExpenseForm({ initialData, onCancel, onSuccess }: ExpenseFormProps) {
  const [formData, setFormData] = useState({
    transactionId: initialData?.transactionId || '',
    expensecategoriesId: initialData?.expensecategoriesId || '',
    orgId: initialData?.orgId || '',
    paymentMethod: initialData?.paymentMethod || '',
  });

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoadingOrgs, setIsLoadingOrgs] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [isLoadingPaymentMethods, setIsLoadingPaymentMethods] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrganizations();
      fetchExpenseCategories();
      fetchExpenseTransactions();
      fetchPaymentMethods();
    }
  }, [isAuthenticated]);

  const fetchOrganizations = async () => {
    setIsLoadingOrgs(true);
    try {
      if (!isAuthenticated || !session) {
        setError('Authentication required to load organizations');
        setIsLoadingOrgs(false);
        return;
      }

      console.log('Fetching organizations, Session:', session, 'Status:', status);
      const response = await fetch('/api/organization', {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Ensure session cookie is sent
      });
      console.log('Organizations Response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched Organizations:', data);
        setOrganizations(data.organizations || []);
      } else {
        const errorData = await response.json();
        console.log('Organizations Error Response:', errorData);
        setError(errorData.error || `Failed to load organizations (Status: ${response.status})`);
      }
    } catch (err) {
      console.error('Network error fetching organizations:', err);
      setError('Failed to load organizations: Network error');
    } finally {
      setIsLoadingOrgs(false);
    }
  };

  const fetchExpenseCategories = async () => {
    setIsLoadingCategories(true);
    try {
      if (!isAuthenticated || !session) {
        setError('Authentication required to load expense categories');
        setIsLoadingCategories(false);
        return;
      }

      console.log('Fetching expense categories, Session:', session, 'Status:', status);
      const response = await fetch('/api/expenseCategories', {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Ensure session cookie is sent
      });
      console.log('Expense Categories Response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched Expense Categories:', data);
        setExpenseCategories(data.categories || []);
      } else {
        const errorData = await response.json();
        console.log('Expense Categories Error Response:', errorData);
        setError(errorData.error || `Failed to load expense categories (Status: ${response.status})`);
      }
    } catch (err) {
      console.error('Network error fetching expense categories:', err);
      setError('Failed to load expense categories: Network error');
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const fetchExpenseTransactions = async () => {
    setIsLoadingTransactions(true);
    try {
      if (!isAuthenticated || !session) {
        setError('Authentication required to load transactions');
        setIsLoadingTransactions(false);
        return;
      }

      console.log('Fetching transactions, Session:', session, 'Status:', status);
      const response = await fetch('/api/transactions?type=Expense', {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Ensure session cookie is sent
      });
      console.log('Transactions Response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched Transactions:', data);
        setTransactions(data.transactions || []);
      } else {
        const errorData = await response.json();
        console.log('Transactions Error Response:', errorData);
        setError(errorData.error || `Failed to load transactions (Status: ${response.status})`);
      }
    } catch (err) {
      console.error('Network error fetching transactions:', err);
      setError('Failed to load transactions: Network error');
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  const fetchPaymentMethods = async () => {
    setIsLoadingPaymentMethods(true);
    try {
      if (!isAuthenticated || !session) {
        setError('Authentication required to load payment methods');
        setIsLoadingPaymentMethods(false);
        return;
      }

      console.log('Fetching payment methods, Session:', session, 'Status:', status);
      const response = await fetch('/api/paymentmethods?forDropdown=true', {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Ensure session cookie is sent
      });
      console.log('Payment Methods Response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched Payment Methods:', data);
        if (data.length === 0) {
          setError('No payment methods found. Please add a payment method.');
        } else {
          setPaymentMethods(data);
        }
      } else {
        const errorData = await response.json();
        console.log('Payment Methods Error Response:', errorData);
        setError(errorData.error || `Failed to load payment methods (Status: ${response.status})`);
      }
    } catch (err) {
      console.error('Network error fetching payment methods:', err);
      setError('Failed to load payment methods: Network error');
    } finally {
      setIsLoadingPaymentMethods(false);
    }
  };

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
      const response = await fetch('/api/expenses', {
        method: initialData ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, _id: initialData?._id }),
      });

      if (response.ok) {
        const successMsg = initialData
          ? 'Expense Updated Successfully!'
          : 'Expense Created Successfully!';
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
            expensecategoriesId: '',
            orgId: '',
            paymentMethod: '',
          });
        }
      } else {
        setError('Failed to save expense. Please check the input data.');
      }
    } catch {
      setError('Failed to save expense');
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
          {initialData ? 'Update Expense' : 'Create New Expense'}
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
          {/* Transaction Field - Dropdown (Expense type only) */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 gap-2">
              <CreditCard className="w-4 h-4" />
              Transaction
            </label>
            {isLoadingTransactions ? (
              <div className="mt-1 block w-full rounded-xl border border-gray-300 px-3 py-2 shadow-sm bg-gray-100">
                <LoadingSpinner size="sm" />
              </div>
            ) : (
              <select
                required
                value={formData.transactionId}
                onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                className="mt-1 block w-full rounded-xl border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select an expense transaction</option>
                {transactions.map((transaction) => (
                  <option key={transaction._id} value={transaction._id}>
                    {transaction.type} -{' '}
                    {typeof transaction.amount === 'number' && transaction.amount >= 0
                      ? `${transaction.amount.toFixed(2)} PKR`
                      : '0.00 PKR'}{' '}
                    - {new Date(transaction.transactionDate).toLocaleDateString()}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Expense Category Field - Dropdown */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 gap-2">
              <List className="w-4 h-4" />
              Expense Category
            </label>
            {isLoadingCategories ? (
              <div className="mt-1 block w-full rounded-xl border border-gray-300 px-3 py-2 shadow-sm bg-gray-100">
                <LoadingSpinner size="sm" />
              </div>
            ) : (
              <select
                required
                value={formData.expensecategoriesId}
                onChange={(e) => setFormData({ ...formData, expensecategoriesId: e.target.value })}
                className="mt-1 block w-full rounded-xl border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select an expense category</option>
                {expenseCategories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name} {category.description && `- ${category.description}`}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Organization Field - Dropdown */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 gap-2">
              <Building className="w-4 h-4" />
              Organization
            </label>
            {isLoadingOrgs ? (
              <div className="mt-1 block w-full rounded-xl border border-gray-300 px-3 py-2 shadow-sm bg-gray-100">
                <LoadingSpinner size="sm" />
              </div>
            ) : (
              <select
                required
                value={formData.orgId}
                onChange={(e) => setFormData({ ...formData, orgId: e.target.value })}
                className="mt-1 block w-full rounded-xl border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select an organization</option>
                {organizations.map((org) => (
                  <option key={org._id} value={org._id}>
                    {org.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Payment Method Field - Dropdown */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 gap-2">
              <Banknote className="w-4 h-4" />
              Payment Method
            </label>
            {isLoadingPaymentMethods ? (
              <div className="mt-1 block w-full rounded-xl border border-gray-300 px-3 py-2 shadow-sm bg-gray-100">
                <LoadingSpinner size="sm" />
              </div>
            ) : (
              <select
                required
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="mt-1 block w-full rounded-xl border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select Payment Method</option>
                {paymentMethods.map((method) => (
                  <option key={method._id} value={method._id}>
                    {method.name}
                  </option>
                ))}
              </select>
            )}
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
            disabled={isSubmitting || isLoadingOrgs || isLoadingCategories || isLoadingTransactions || isLoadingPaymentMethods}
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