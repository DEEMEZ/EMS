/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { LoadingSpinner } from '@/components/loadiingspinner';
import OrganizationForm from '@/components/organization/orgform/form';
import { IOrganization } from '@/types/organization';
import { AnimatePresence, motion } from 'framer-motion';
import _ from 'lodash';
import {
  AlertCircle,
  Building2,
  ChevronLeft, ChevronRight,
  Edit,
  Filter,
  LogIn,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

export default function OrganizationList() {
  // Authentication state
  const { data: session, status: authStatus } = useSession();
  
  // State Management
  const [organizations, setOrganizations] = useState<IOrganization[]>([]);
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
  const [editingOrganization, setEditingOrganization] = useState<IOrganization | null>(null);

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
    fetchOrganizations(); // This will be called due to useEffect dependency
  };
  
  // Fetch Organizations
  const fetchOrganizations = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Only fetch data if the user is authenticated
      if (authStatus !== 'authenticated') {
        setIsLoading(false);
        return;
      }
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
        ...(selectedStatus && { status: selectedStatus })
      });
  
      const response = await fetch(`/api/organization?${params.toString()}`);
      
      // Handle response
      if (!response.ok) {
        // Check if it's an unauthorized error
        if (response.status === 401) {
          console.log("Authentication required. Redirecting to login...");
          // Let the session handling take care of the redirect
          return;
        }
        throw new Error('Failed to fetch organizations');
      }
      
      const data = await response.json();
      setOrganizations(data.organizations || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to fetch organizations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete Organization
  const handleDelete = async (orgId: string) => {
    try {
      setIsDeleting(orgId);
      
      // Only proceed if the user is authenticated
      if (authStatus !== 'authenticated') {
        setError('You must be logged in to delete an organization');
        return;
      }
      
      const response = await fetch(`/api/organization`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ _id: orgId })
      });

      if (!response.ok) {
        // Check if it's an unauthorized error
        if (response.status === 401) {
          setError('You must be logged in to delete an organization');
          return;
        }
        throw new Error('Failed to delete organization');
      }
      
      await fetchOrganizations();
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to delete organization. Please try again.');
    } finally {
      setIsDeleting(null);
    }
  };

  // Modal Controls
  const openModal = (org?: IOrganization) => {
    // Only open modal if user is authenticated
    if (authStatus !== 'authenticated') {
      setError('You must be logged in to manage organizations');
      return;
    }
    
    setEditingOrganization(org || null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingOrganization(null);
    setIsModalOpen(false);
  };

  const handleSuccess = () => {
    closeModal();
    fetchOrganizations();
  };

  // Effect Hooks
  useEffect(() => {
    if (authStatus === 'authenticated') {
      fetchOrganizations();
    } else if (authStatus === 'unauthenticated') {
      // Clear organizations if user is not authenticated
      setOrganizations([]);
      setIsLoading(false);
    }
  }, [debouncedSearchTerm, selectedStatus, page, authStatus]);
  
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  // Authentication check for UI
  const isAuthenticated = authStatus === 'authenticated';
  const isAuthLoading = authStatus === 'loading';

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Authentication Status Banner */}
      {!isAuthenticated && !isAuthLoading && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6 rounded-lg flex items-center gap-3"
        >
          <AlertCircle className="w-5 h-5 text-amber-400" />
          <div className="flex-1">
            <p className="text-amber-700">You need to sign in to manage organizations</p>
          </div>
          <Link
            href="/auth/signin"
            className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors"
          >
            <LogIn className="w-4 h-4" />
            Sign In
          </Link>
        </motion.div>
      )}

      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-2xl p-6 mb-6"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Organizations</h1>
            <p className="text-blue-100">Manage your organization listings</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => openModal()}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-colors"
            disabled={!isAuthenticated}
          >
            <Plus className="w-5 h-5" />
            New Organization
          </motion.button>
        </div>

        {/* Search and Filter Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300" />
            <input
              type="text"
              placeholder="Search organizations..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/30"
              disabled={!isAuthenticated}
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
              disabled={!isAuthenticated}
            >
              <option value="" className="bg-white text-gray-900">All Status</option>
              <option value="Active" className="bg-white text-gray-900">Active</option>
              <option value="Inactive" className="bg-white text-gray-900">Inactive</option>
              <option value="Pending" className="bg-white text-gray-900">Pending</option>
            </select>
          </div>

          <button
            onClick={fetchOrganizations}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 text-white transition-colors"
            disabled={!isAuthenticated}
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
            <button 
              onClick={() => setError('')}
              className="ml-auto p-1 text-red-400 hover:text-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Authentication Loading State */}
      {isAuthLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-500">Checking authentication...</p>
          </div>
        </div>
      )}

      {/* Organizations Table - Only show when authenticated and not loading */}
      {isAuthenticated && !isLoading && !isAuthLoading && (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Organization</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Modified Date</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {organizations.map((org, index) => (
                    <motion.tr
                      key={org._id}
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
                            <div className="font-medium text-gray-900">{org.name}</div>
                            <div className="text-sm text-gray-500">{org.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                          ${org.status === 'Active' ? 'bg-green-100 text-green-800' : ''}
                          ${org.status === 'Inactive' ? 'bg-gray-100 text-gray-800' : ''}
                          ${org.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                        `}>
                          {org.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(org.modifiedDate!).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openModal(org)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(org._id!)}
                            disabled={isDeleting === org._id}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          >
                            {isDeleting === org._id ? (
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

          {/* Empty State - Only when authenticated but no organizations */}
          {organizations.length === 0 && !isLoading && isAuthenticated && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-12"
            >
              <Building2 className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No Organizations Found</h3>
              <p className="text-gray-500 mt-1">Get started by creating a new organization.</p>
              <button
                onClick={() => openModal()}
                className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-5 h-5" />
                New Organization
              </button>
            </motion.div>
          )}

          {/* Pagination - Only show when there are organizations */}
          {organizations.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4 bg-gray-50">
              <div className="text-sm text-gray-500">
                Showing {organizations.length} organizations
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
      )}

      {/* Not Authenticated State */}
      {!isAuthenticated && !isAuthLoading && !isLoading && (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 text-center">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Sign in to Manage Organizations</h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            You need to be signed in to view and manage your organizations. Please sign in to continue.
          </p>
          <Link
            href="/auth/signin"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            <LogIn className="w-5 h-5" />
            Sign In
          </Link>
        </div>
      )}

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
                {editingOrganization ? 'Edit Organization' : 'New Organization'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <OrganizationForm
                initialData={editingOrganization ? { 
                  ...editingOrganization, 
                  description: editingOrganization.description || '' 
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