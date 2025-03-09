/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { LoadingSpinner } from '@/components/loadiingspinner';
import TagsForm from '@/components/tags/tagsform/form';
import { ITags } from '@/types/tags';
import { AnimatePresence, motion } from 'framer-motion';
import _ from 'lodash';
import { AlertCircle, Edit, Plus, Search, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

export default function TagsList() {
  const [tags, setTags] = useState<ITags[]>([]);
  const [, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<ITags | null>(null);

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

  const fetchTags = async () => {
    try {
      setIsLoading(true);
      setError('');

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
      });

      const response = await fetch(`/api/tags?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch tags');

      const data = await response.json();
      setTags(data.tags);
      setTotalPages(data.pagination.totalPages);
    } catch (err) {
      setError('Failed to fetch tags');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (tagId: string) => {
    try {
      setIsDeleting(tagId);
      const response = await fetch(`/api/tags`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _id: tagId }),
      });
      if (!response.ok) throw new Error('Failed to delete tag');

      await fetchTags();
    } catch {
      setError('Failed to delete tag');
    } finally {
      setIsDeleting(null);
    }
  };

  const openModal = (tag?: ITags) => {
    setEditingTag(tag || null);
    setIsModalOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeModal = () => {
    setEditingTag(null);
    setIsModalOpen(false);
  };

  const handleSuccess = () => {
    closeModal();
    fetchTags();
  };

  useEffect(() => {
    fetchTags();
  }, [debouncedSearchTerm, page]);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-2xl p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Tags</h1>
            <p className="text-blue-100">Manage your tags</p>
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => openModal()}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-xl hover:bg-blue-50">
            <Plus className="w-5 h-5" />
            New Tag
          </motion.button>
        </div>
        <div className="relative mt-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300" />
          <input type="text" placeholder="Search tags..." value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200" />
        </div>
      </motion.div>
      {error && <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-lg flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-red-400" />
        <p className="text-red-700">{error}</p>
      </div>}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
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
              {tags.map((tag) => (
                <motion.tr key={tag._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4">{tag.name}</td>
                  <td className="px-6 py-4">{tag.description || 'N/A'}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openModal(tag)} className="p-2 text-blue-600 hover:bg-blue-50">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(tag._id!)} disabled={isDeleting === tag._id} className="p-2 text-red-600 hover:bg-red-50">
                        {isDeleting === tag._id ? <LoadingSpinner size="sm" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
{isModalOpen && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden"
    >
      {/* Modal Header */}
      <div className="flex justify-between items-center px-6 py-4 border-b">
        <h2 className="text-xl font-semibold">{editingTag ? 'Edit Tag' : 'New Tag'}</h2>
        <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Modal Content */}
      <div className="p-6">
        <TagsForm
          initialData={editingTag || undefined}
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
