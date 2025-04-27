/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { LoadingSpinner } from '@/components/loadiingspinner';
import { AnimatePresence, motion } from 'framer-motion';
import { Building, CheckCircle, CreditCard, List, Save, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

interface IncomeFormProps {
  initialData?: any;
  onCancel?: () => void;
  onSuccess?: () => void;
}

interface Organization {
  _id: string;
  name: string;
}

interface IncomeSource {
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

export default function IncomeForm({ initialData, onCancel, onSuccess }: IncomeFormProps) {
  const [formData, setFormData] = useState({
    transactionId: initialData?.transactionId || '',
    incomeSourceId: initialData?.incomeSourceId || '',
    orgId: initialData?.orgId || '',
  });

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [incomeSources, setIncomeSources] = useState<IncomeSource[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingOrgs, setIsLoadingOrgs] = useState(false);
  const [isLoadingIncomeSources, setIsLoadingIncomeSources] = useState(false);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrganizations();
      fetchIncomeSources();
      fetchIncomeTransactions();
    }
  }, [isAuthenticated]);

  const fetchOrganizations = async () => {
    setIsLoadingOrgs(true);
    try {
      const response = await fetch('/api/organization');
      if (response.ok) {
        const data = await response.json();
        setOrganizations(data.organizations);
      } else {
        setError('Failed to load organizations');
      }
    } catch (err) {
      setError('Failed to load organizations');
    } finally {
      setIsLoadingOrgs(false);
    }
  };

  const fetchIncomeSources = async () => {
    setIsLoadingIncomeSources(true);
    try {
      const response = await fetch('/api/incomesources');
      if (response.ok) {
        const data = await response.json();
        setIncomeSources(data.sources || []);
      } else {
        setError('Failed to load income sources');
      }
    } catch (err) {
      setError('Failed to load income sources');
    } finally {
      setIsLoadingIncomeSources(false);
    }
  };

  const fetchIncomeTransactions = async () => {
    setIsLoadingTransactions(true);
    try {
      const response = await fetch('/api/transactions?type=Income');
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions || []);
      } else {
        setError('Failed to load transactions');
      }
    } catch (err) {
      setError('Failed to load transactions');
    } finally {
      setIsLoadingTransactions(false);
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
          {/* Transaction Field - Dropdown */}
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
                <option value="">Select a transaction</option>
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

          {/* Income Source Field - Dropdown */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 gap-2">
              <List className="w-4 h-4" />
              Income Source
            </label>
            {isLoadingIncomeSources ? (
              <div className="mt-1 block w-full rounded-xl border border-gray-300 px-3 py-2 shadow-sm bg-gray-100">
                <LoadingSpinner size="sm" />
              </div>
            ) : (
              <select
                required
                value={formData.incomeSourceId}
                onChange={(e) => setFormData({ ...formData, incomeSourceId: e.target.value })}
                className="mt-1 block w-full rounded-xl border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select an income source</option>
                {incomeSources.map((source) => (
                  <option key={source._id} value={source._id}>
                    {source.name}
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
            disabled={isSubmitting || isLoadingOrgs || isLoadingIncomeSources || isLoadingTransactions}
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