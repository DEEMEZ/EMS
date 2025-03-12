'use client';

import PaymentmethodsForm from '@/components/paymentmethods/paymentform/form';
import { LoadingSpinner } from '@/components/loadiingspinner';
import { IPaymentmethods } from '@/types/paymentmethods';
import { AnimatePresence, motion } from 'framer-motion';
import _ from 'lodash';
import {
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    Edit,
    Plus,
    Search,
    Trash2,
    X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

export default function PaymentmethodsList() {
  const [Paymentmethods, setPaymentmethods] = useState<IPaymentmethods[]>([]);
  const [, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<IPaymentmethods | null>(null);

  const debouncedSearch = useMemo(
    () =>
      _.debounce((value: string) => {
        setDebouncedSearchTerm(value);
        setPage(1);
      }, 500),
    []
  );

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    debouncedSearch(value);
  };

  const fetchPaymentmethods = async () => {
    try {
      setIsLoading(true);
      setError('');

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
      });

      const response = await fetch(`/api/paymentmethods?${params.toString()}`);
      if (!response.ok) throw new Error('Failed To Fetch Payment Methods');

      const data = await response.json();
      setPaymentmethods(data.sources);
      setTotalPages(data.pagination.totalPages);
    } catch (err) {
      setError('Failed To Fetch Payment Methods');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (sourceId: string) => {
    try {
      setIsDeleting(sourceId);
      const response = await fetch(`/api/paymentmethods`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ _id: sourceId }),
      });

      if (!response.ok) throw new Error('Failed To Delete Payment Methods');

      await fetchPaymentmethods();
    } catch {
      setError('Failed To Delete Payment Methods');
    } finally {
      setIsDeleting(null);
    }
  };

  const openModal = (source?: IPaymentmethods) => {
    setEditingSource(source || null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingSource(null);
    setIsModalOpen(false);
  };

  const handleSuccess = () => {
    closeModal();
    fetchPaymentmethods();
  };

  useEffect(() => {
    fetchPaymentmethods();
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
        className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-2xl p-6 mb-6"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Payment Methods</h1>
            <p className="text-blue-100">Manage Your Payment Method Listings</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => openModal()}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Payment Method
          </motion.button>
        </div>

        <div className="relative mt-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300" />
          <input
            type="text"
            placeholder="Search Payment Methods..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/30"
          />
        </div>
      </motion.div>

      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Description</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {Paymentmethods.map((source, index) => (
                  <motion.tr
                    key={source._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">{source.name}</td>
                    <td className="px-6 py-4">{source.description}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openModal(source)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(source._id!)}
                          disabled={isDeleting === source._id}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {isDeleting === source._id ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {Paymentmethods.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 bg-gray-50">
            <div className="text-sm text-gray-500">Showing {Paymentmethods.length} Payment Methods</div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="flex items-center px-3 py-1 text-sm font-medium text-gray-600">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden"
          >
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h2 className="text-xl font-semibold">{editingSource ? 'Edit Income Source' : 'New Payment Method'}</h2>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <PaymentmethodsForm
                initialData={editingSource || undefined}
                onCancel={closeModal}
                onSuccess={handleSuccess}
              />
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
