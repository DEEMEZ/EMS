/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import IncomeForm from '@/components/income/incomeform/form';
import { LoadingSpinner } from '@/components/loadiingspinner';
import { AnimatePresence, motion } from 'framer-motion';
import _ from 'lodash';
import { AlertCircle, Edit, Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

export default function IncomeList() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [incomes, setIncomes] = useState<any[]>([]);
  const [, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [, setTotalPages] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<any | null>(null);

  const debouncedSearch = useMemo(
    () => _.debounce((value: string) => {
      setDebouncedSearchTerm(value);
      setPage(1);
    }, 500),
    []
  );

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    debouncedSearch(value);
  };

  const fetchIncomes = async () => {
    try {
      setIsLoading(true);
      setError('');

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
      });

      const response = await fetch(`/api/incomes?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch incomes');

      const data = await response.json();
      setIncomes(data.incomes);
      setTotalPages(data.pagination.totalPages);
    } catch (err) {
      setError('Failed to fetch incomes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (incomeId: string) => {
    try {
      setIsDeleting(incomeId);
      const response = await fetch(`/api/incomes`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ _id: incomeId }),
      });

      if (!response.ok) throw new Error('Failed to delete income');
      await fetchIncomes();
    } catch {
      setError('Failed to delete income');
    } finally {
      setIsDeleting(null);
    }
  };

  const openModal = (income?: any) => {
    setEditingIncome(income || null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingIncome(null);
    setIsModalOpen(false);
  };

  const handleSuccess = () => {
    closeModal();
    fetchIncomes();
  };

  useEffect(() => {
    fetchIncomes();
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
        className="bg-gradient-to-r from-green-600 to-green-400 rounded-2xl p-6 mb-6"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Incomes</h1>
            <p className="text-green-200">Manage your incomes</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => openModal()}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white text-green-600 rounded-xl hover:bg-green-50 transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Income
          </motion.button>
        </div>
      </motion.div>

      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Transaction Type</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Transaction Date</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Income Source</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Organization</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {incomes.map((income, index) => (
                <motion.tr
                  key={income._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-6 py-4">{income.transactionId?.type || 'Unknown'}</td>
                  <td className="px-6 py-4">{income.transactionId?.transactionDate || 'Unknown'}</td>                  
                  <td className="px-6 py-4">{income.incomeSourceId?.name || 'Unknown'}</td>
                  <td className="px-6 py-4">{income.orgId?.name || 'Unknown'}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openModal(income)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(income._id)} disabled={isDeleting === income._id} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                        {isDeleting === income._id ? <LoadingSpinner size="sm" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {isModalOpen && <IncomeForm initialData={editingIncome || undefined} onCancel={closeModal} onSuccess={handleSuccess} />}
    </div>
  );
}
