/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import IncomeForm from "@/components/income/incomeform/form";
import { LoadingSpinner } from "@/components/loadiingspinner";
import { AnimatePresence, motion } from "framer-motion";
import _ from "lodash";
import { AlertCircle, ChevronLeft, ChevronRight, Edit, LogIn, Plus, Search, Trash2, X } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";

// Define the IIncome interface to type the incomes data
interface IIncome {
  _id: string;
  transactionId?: {
    type: 'Income' | 'Expense';
    transactionDate: string;
    amount: number;
  };
  incomeSourceId?: { name: string };
  orgId?: { name: string };
  transactionAmount: number;
}

// Define the API response interface
interface IncomesResponse {
  incomes: IIncome[];
  pagination?: {
    totalPages: number;
  };
}

export default function IncomeList() {
  const { data: session, status: authStatus } = useSession();
  const isAuthenticated = authStatus === 'authenticated';
  const isAuthLoading = authStatus === 'loading';

  const [isMounted, setIsMounted] = useState(false);
  const [incomes, setIncomes] = useState<IIncome[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<IIncome | null>(null);
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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

  const fetchIncomes = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");

      if (!isAuthenticated) {
        setIsLoading(false);
        return;
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
      });

      const response = await fetch(`/api/incomes?${params.toString()}`);
      if (!response.ok) {
        if (response.status === 401) {
          setError("You must be signed in to view incomes");
          return;
        }
        const errorText = await response.text();
        setError(`Failed to fetch incomes (Status: ${response.status}) - ${errorText}`);
        return;
      }

      const data = await response.json() as IncomesResponse;
      const newIncomes = [...data.incomes] as IIncome[];
      console.log("Fetched Incomes Data:", newIncomes);
      setIncomes(newIncomes); // Remove deduplication for now, rely on API
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err: any) {
      setError("Failed to fetch incomes: Network error");
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, page, debouncedSearchTerm]);

  const debouncedFetchIncomes = useCallback(() => {
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }
    fetchTimeoutRef.current = setTimeout(() => {
      fetchIncomes();
    }, 100);
  }, [fetchIncomes]);

  const handleDelete = async (incomeId: string) => {
    try {
      if (!isAuthenticated) {
        setError("You must be signed in to delete an income");
        return;
      }

      setIsDeleting(incomeId);
      const response = await fetch(`/api/incomes`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ _id: incomeId }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError("You must be signed in to delete an income");
          return;
        }
        if (response.status === 403) {
          setError("You do not have permission to delete this income");
          return;
        }
        const errorText = await response.text();
        throw new Error(`Failed To Delete Income: ${response.status} - ${errorText}`);
      }

      debouncedFetchIncomes();
    } catch (err: any) {
      setError(`Failed To Delete Income: ${err.message}`);
      console.error("Error:", err);
    } finally {
      setIsDeleting(null);
    }
  };

  const openModal = (income?: IIncome) => {
    if (!isAuthenticated) {
      setError("You must be signed in to manage incomes");
      return;
    }

    setEditingIncome(income || null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingIncome(null);
    setIsModalOpen(false);
  };

  const handleSuccess = () => {
    closeModal();
    debouncedFetchIncomes();
  };

  useEffect(() => {
    if (authStatus === 'authenticated') {
      debouncedFetchIncomes();
    } else if (authStatus === 'unauthenticated') {
      setIncomes([]);
      setIsLoading(false);
    }
  }, [debouncedSearchTerm, page, authStatus, debouncedFetchIncomes]);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {!isAuthenticated && !isAuthLoading && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6 rounded-lg flex items-center gap-3"
        >
          <AlertCircle className="w-5 h-5 text-amber-400" />
          <div className="flex-1">
            <p className="text-amber-700">You need to sign in to manage incomes</p>
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

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-2xl p-6 mb-6"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Incomes</h1>
            <p className="text-blue-200">Manage Your Incomes</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => openModal()}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-colors"
            disabled={!isAuthenticated}
          >
            <Plus className="w-5 h-5" />
            New Income
          </motion.button>
        </div>

        <div className="relative mt-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white-300" />
          <input
            type="text"
            placeholder="Search Incomes..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/30"
            disabled={!isAuthenticated}
          />
        </div>
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-lg flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-700">{error}</p>
            <button onClick={() => setError("")} className="ml-auto p-1 text-red-400 hover:text-red-600">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {isAuthLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-500">Checking authentication...</p>
          </div>
        </div>
      )}

      {isAuthenticated && !isLoading && !isAuthLoading && (
        <div>
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 mb-6">
            <h2 className="text-sm font-semibold mb-2 text-gray-800">How to Use This Page</h2>
            <ul className="text-sm text-gray-600 list-disc list-inside leading-tight">
              <li><strong>Purpose:</strong> This page allows you to manage your incomes.</li>
              <li><strong>Add a New Income:</strong> Click the "New Income" button, fill in the transaction type, amount, transaction date, income source, and organization (optional), then click "Create".</li>
              <li><strong>Edit a Transaction:</strong> Click the Edit (pencil) button in the Actions column to modify an existing transaction.</li>
              <li><strong>Delete a Transaction:</strong> Click the Delete (trash) button in the Actions column to remove a transaction.</li>
              <li><strong>Search Transactions:</strong> Use the search bar to find transactions.</li>
              <li><strong>Navigate Pages:</strong> Use the "Previous" and "Next" buttons at the bottom to navigate through pages of transactions.</li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-8 py-5 text-left text-sm font-semibold text-gray-600">Transaction Type</th>
                    <th className="px-8 py-5 text-left text-sm font-semibold text-gray-600">Transaction Date</th>
                    <th className="px-8 py-5 text-left text-sm font-semibold text-gray-600">Amount</th>
                    <th className="px-8 py-5 text-left text-sm font-semibold text-gray-600">Income Source</th>
                    <th className="px-8 py-5 text-left text-sm font-semibold text-gray-600">Organization</th>
                    <th className="px-8 py-5 text-right text-sm font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {incomes.map((income: IIncome, index: number) => {
                      console.log("Rendering income item:", income);
                      return (
                        <motion.tr
                          key={income._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ delay: index * 0.1 }}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="px-8 py-5">{income.transactionId?.type ?? "Unknown"}</td>
                          <td className="px-8 py-5">
                            {income.transactionId?.transactionDate
                              ? new Date(income.transactionId.transactionDate).toLocaleDateString()
                              : "Unknown"}
                          </td>
                          <td className="px-8 py-5">
                            {typeof income.transactionAmount === "number"
                              ? `${income.transactionAmount.toFixed(2)} PKR`
                              : "N/A"}
                          </td>
                          <td className="px-8 py-5">{income.incomeSourceId?.name || "Unknown"}</td>
                          <td className="px-8 py-5">{income.orgId?.name || "Unknown"}</td>
                          <td className="px-8 py-5 flex justify-end gap-2">
                            <button
                              onClick={() => openModal(income)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(income._id)}
                              disabled={isDeleting === income._id}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            >
                              {isDeleting === income._id ? (
                                <LoadingSpinner size="sm" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {incomes.length === 0 && !isLoading && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="text-center">
                  <h3 className="text-lg font-medium text-gray-900">No Incomes Found</h3>
                  <p className="text-gray-500 mt-1">Get started by creating a new income.</p>
                  <button
                    onClick={() => openModal()}
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="w-5 h-5" />
                    New Income
                  </button>
                </div>
              </div>
            )}

            {incomes.length > 0 && (
              <div className="flex items-center justify-between px-6 py-4 bg-gray-50">
                <div className="text-sm text-gray-500">
                  Showing {incomes.length} Incomes
                </div>
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
        </div>
      )}

      {!isAuthenticated && !isAuthLoading && !isLoading && (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Sign in to Manage Incomes</h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            You need to be signed in to view and manage your incomes. Please sign in to continue.
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
                {editingIncome ? "Edit Income" : "New Income"}
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <IncomeForm
                initialData={editingIncome || undefined}
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