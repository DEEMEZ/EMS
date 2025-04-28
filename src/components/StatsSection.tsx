/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { LoadingSpinner } from '@/components/loadiingspinner';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useState } from 'react';

const StatsSection = () => {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalInventoryValue: 0,
    averagePrice: 0,
    uniqueCategories: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Only fetch if authenticated
      if (status !== 'authenticated') return;
      
      const response = await fetch('/api/stats');
      
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }
      
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Failed to load statistics');
    } finally {
      setIsLoading(false);
    }
  }, [status]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats, status]);

  // Refresh stats when products change (you might want to call this from parent)
  const refreshStats = useCallback(() => {
    fetchStats();
  }, [fetchStats]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gray-100 p-4 rounded-lg shadow-md h-24 flex items-center justify-center">
            <LoadingSpinner size="sm" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg mb-6 flex items-center gap-3">
        <div className="text-red-700">{error}</div>
        <button 
          onClick={fetchStats}
          className="ml-auto px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {/* Total Products */}
      <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg shadow-sm">
        <h3 className="text-sm font-medium text-blue-800">Total Products</h3>
        <p className="text-2xl font-bold text-blue-600">{stats.totalProducts}</p>
      </div>

      {/* Total Inventory Value */}
      <div className="bg-green-50 border border-green-100 p-4 rounded-lg shadow-sm">
        <h3 className="text-sm font-medium text-green-800">Inventory Value</h3>
        <p className="text-2xl font-bold text-green-600">
          PKR{stats.totalInventoryValue.toFixed(2)}
        </p>
      </div>

      {/* Average Price */}
      <div className="bg-amber-50 border border-amber-100 p-4 rounded-lg shadow-sm">
        <h3 className="text-sm font-medium text-amber-800">Avg. Price</h3>
        <p className="text-2xl font-bold text-amber-600">
          PKR{stats.averagePrice.toFixed(2)}
        </p>
      </div>

      {/* Unique Categories */}
      <div className="bg-purple-50 border border-purple-100 p-4 rounded-lg shadow-sm">
        <h3 className="text-sm font-medium text-purple-800">Categories</h3>
        <p className="text-2xl font-bold text-purple-600">{stats.uniqueCategories}</p>
      </div>
    </div>
  );
};

export default StatsSection;