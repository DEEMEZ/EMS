/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { LoadingSpinner } from '@/components/loadiingspinner';
import { IOrganization } from '@/types/organization';
import { AnimatePresence, motion } from 'framer-motion';
import { Activity, AlertCircle, Building2, CheckCircle, FileText, Save, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useState } from 'react';

interface OrganizationFormProps {
  initialData?: IOrganization;
  onCancel?: () => void;
  onSuccess?: () => void;
}

export default function OrganizationForm({ initialData, onCancel, onSuccess }: OrganizationFormProps) {
  // Authentication state
  const { status: authStatus } = useSession();
  const isAuthenticated = authStatus === 'authenticated';
  
  const [formData, setFormData] = useState<IOrganization>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    status: initialData?.status || 'Active'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user is authenticated
    if (!isAuthenticated) {
      setError('You must be signed in to save an organization');
      return;
    }
    
    setError('');
    setIsSubmitting(true);
    setSuccessMessage('');

    try {
      const response = await fetch('/api/organization', {
        method: initialData ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, _id: initialData?._id }),
      });

      // Handle unauthorized error
      if (response.status === 401) {
        setError('You must be signed in to save an organization');
        return;
      }

      if (response.ok) {
        const successMsg = initialData 
          ? 'Organization updated successfully!' 
          : 'Organization created successfully!';
        setSuccessMessage(successMsg);
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);

        // Call onSuccess callback
        if (onSuccess) {
          setTimeout(() => {
            onSuccess();
          }, 1000); // Short delay to show success message
        }

        if (initialData) {
          setFormData((prevData) => ({
            ...prevData,
            _id: initialData._id,
          }));
        } else {
          setFormData({
            name: '',
            description: '',
            status: 'Active',
          });
        }
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to save organization');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to save organization. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Not authenticated state
  if (!isAuthenticated) {
    return (
      <div className="text-center py-6">
        <AlertCircle className="w-16 h-16 text-amber-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Authentication Required</h2>
        <p className="text-gray-600 mb-4">
          You need to be signed in to create or edit organizations.
        </p>
        <div className="flex justify-center gap-3">
          <Link 
            href="/auth/signin"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </Link>
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
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
          {/* Name Field */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 gap-2">
              <Building2 className="w-4 h-4" />
              Organization Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full rounded-xl border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter organization name"
            />
          </div>

          {/* Description Field */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 gap-2">
              <FileText className="w-4 h-4" />
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="mt-1 block w-full rounded-xl border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter organization description"
            />
          </div>

          {/* Status Field */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 gap-2">
              <Activity className="w-4 h-4" />
              Status
            </label>
            <div className="mt-1 grid grid-cols-3 gap-4">
              {['Active', 'Inactive', 'Pending'].map((status) => (
                <label
                  key={status}
                  className={`
                    flex items-center justify-center px-4 py-2 rounded-xl border cursor-pointer
                    ${formData.status === status 
                      ? 'border-blue-500 bg-blue-50 text-blue-600' 
                      : 'border-gray-300 hover:border-blue-200'}
                  `}
                >
                  <input
                    type="radio"
                    name="status"
                    value={status}
                    checked={formData.status === status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as IOrganization['status'] })}
                    className="sr-only"
                  />
                  {status}
                </label>
              ))}
            </div>
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
  );
}