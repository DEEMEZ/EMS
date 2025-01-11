'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Plus, Filter, Building2, Edit, Trash2,
  ChevronLeft, ChevronRight, AlertCircle, RefreshCw, X 
} from 'lucide-react';
import { LoadingSpinner } from '@/components/loadiingspinner';
import IncomeSourcesForm from '@/components/IncomeSources/Incsform/form';
import { IIncomeSources } from '@/types/IncomeSources';
import _ from 'lodash';

export default function OrganizationList() {
  // State Management
  const [IncomeSources, setIncomeSources] = useState<IIncomeSources[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

 
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIncomeSources, setEditingIncomeSources] = useState<IIncomeSources | null>(null);

  // Create debounced search function
  const debouncedSearch = useMemo(
    () => _.debounce((value: string) => {
      setDebouncedSearchTerm(value);
      setPage(1); // Reset to first page on new search
    }, 500),
    []
  );

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    debouncedSearch(value);
  };
  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    setPage(1); // Reset to first page when filter changes
    fetchIncomeSources(); // This will be called due to useEffect dependency
  };
  // Fetch Organizations
  const fetchIncomeSources = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
        ...(selectedStatus && { status: selectedStatus }) // Make sure status is included only if selected
      });
  
      const response = await fetch(`/api/IncomeSources?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch IncomeSources');
      
      const data = await response.json();
      setIncomeSources(data.IncomeSources);
      setTotalPages(data.pagination.totalPages);
    } catch (err) {
      setError('Failed to fetch IncomeSources');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);

    }
  };

  // Delete Organization
  const handleDelete = async (IncsId: string) => {
    try {
      setIsDeleting(IncsId);
      const response = await fetch(`/api/IncomeSources`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ _id: IncsId })
      });

      if (!response.ok) throw new Error('Failed to delete IncomeSources');
      
      await fetchIncomeSources();
    } catch  {
      setError('Failed to delete IncomeSources');
    } finally {
      setIsDeleting(null);
    }
  };

  // Modal Controls
  const openModal = (org?: IIncomeSources) => {
    setEditingIncomeSources(org || null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingIncomeSources(null);
    setIsModalOpen(false);
  };

  const handleSuccess = () => {
    closeModal();
    fetchIncomeSources();
  };

  // Effect Hooks
  useEffect(() => {
    fetchIncomeSources();
  }, [debouncedSearchTerm, selectedStatus, page]);
  

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  // if (isLoading && page === 1) {
  //   return <LoadingAnimation />;
  // }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-2xl p-6 mb-6"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Income Sources</h1>
            <p className="text-blue-100">Manage your IncomeSources listings</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => openModal()}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-colors"
          >
            <Plus className="w-5 h-5" />
            New IncomeSources
          </motion.button>
        </div>

        {/* Search and Filter Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300" />
            <input
              type="text"
              placeholder="Search IncomeSources..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300" />
            <select
              value={selectedStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-xl 
              text-white focus:outline-none focus:ring-2 focus:ring-white/30 appearance-none
              focus:bg-white focus:text-gray-900 transition-colors"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 0.5rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.5em 1.5em'
              }}
            >
              <option value="" className="bg-white text-gray-900">All Status</option>
              <option value="Active" className="bg-white text-gray-900">Active</option>
              <option value="Inactive" className="bg-white text-gray-900">Inactive</option>
              <option value="Pending" className="bg-white text-gray-900">Pending</option>
            </select>
          </div>

          <button
            onClick={fetchIncomeSources}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 text-white transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            Refresh
          </button>
        </div>
      </motion.div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-lg flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-700">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Organizations Table */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">IncomeSources</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Modified Date</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {IncomeSources.map((Incs, index) => (
                  <motion.tr
                    key={Incs._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{Incs.Name}</div>
                          <div className="text-sm text-gray-500">{Incs.Description}</div>
                        </div>
                      </div>
                    </td>
                    
                    
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openModal(Incs)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(Incs._id!)}
                          disabled={isDeleting === Incs._id}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {isDeleting === Incs._id ? (
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

        {/* Empty State */}
        {IncomeSources.length === 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-12"
          >
            <Building2 className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No IncomeSources Found</h3>
            <p className="text-gray-500 mt-1">Get started by creating a new IncomeSource.</p>
            <button
              onClick={() => openModal()}
              className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-5 h-5" />
              New IncomeSource
            </button>
          </motion.div>
        )}

        {/* Pagination */}
        {IncomeSources.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 bg-gray-50">
            <div className="text-sm text-gray-500">
              Showing {IncomeSources.length} IncomeSources
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="flex items-center px-3 py-1 text-sm font-medium text-gray-600">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden"
          >
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h2 className="text-xl font-semibold">
                {editingIncomeSources ? 'Edit IncomeSources' : 'New Organization'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <IncomeSourcesForm
                initialData={editingIncomeSources ? { 
                  ...editingIncomeSources, 
                  Description: editingIncomeSources.Description || '' 
                } : undefined}
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