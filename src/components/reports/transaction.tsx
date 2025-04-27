"use client";

import { LoadingSpinner } from '@/components/loadiingspinner';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { AlertCircle, LogIn } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Bar, BarChart, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface TransactionAnalysis {
  _id: string;
  type: string;
  totalAmount: number;
  count: number;
  transactions?: {
    _id: string;
    amount: number;
    transactionDate: string;
  }[];
}

const TransactionAnalysisTable = () => {
  const { status: authStatus } = useSession();
  const isAuthenticated = authStatus === "authenticated";
  const isAuthLoading = authStatus === "loading";

  const [data, setData] = useState<TransactionAnalysis[]>([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(new Date(new Date().setDate(1))); // First day of current month
  const [endDate, setEndDate] = useState<Date | null>(new Date()); // Today
  const [error, setError] = useState("");

  // Convert null to undefined for DatePicker props
  const safeStartDate = startDate ?? undefined;
  const safeEndDate = endDate ?? undefined;

  const fetchTransactions = useCallback(async () => {
    if (!isAuthenticated) {
      setError("Authentication required");
      return;
    }

    if (!startDate || !endDate) {
      setError("Please select both start and end dates");
      return;
    }

    if (startDate > endDate) {
      setError("Start date must be before end date");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const start = format(startDate, "yyyy-MM-dd");
      const end = format(endDate, "yyyy-MM-dd");

      const response = await fetch(`/api/reports/transaction?startDate=${start}&endDate=${end}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch transaction data");
      }

      const result = await response.json();
      const processedData = result.map((item: TransactionAnalysis, index: number) => ({
        ...item,
        _id: item._id || `temp-id-${index}-${Date.now()}`
      }));
      setData(processedData);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch transactions");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, startDate, endDate]);  

  useEffect(() => {
    if (isAuthenticated) {
      fetchTransactions();
    }
  }, [isAuthenticated, fetchTransactions]);  // Add fetchTransactions to dependencies

  const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#ffbb28"];

  // Generate stable unique keys for rendering
  const generateKey = (item: TransactionAnalysis, index: number) => {
    return `${item._id}-${item.type}-${index}`;
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-6 text-center">Transaction Analysis</h2>

      {!isAuthenticated && !isAuthLoading && (
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400" />
          <div className="flex-1">
            <p className="text-amber-700">You need to sign in to view transaction analysis</p>
          </div>
          <Link
            href="/auth/signin"
            className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors"
          >
            <LogIn className="w-4 h-4" />
            Sign In
          </Link>
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

      {isAuthenticated && !isAuthLoading && (
        <>
          <div className="flex flex-wrap gap-4 justify-center mb-6">
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Start Date</label>
              <DatePicker
                selected={safeStartDate}
                onChange={setStartDate}
                selectsStart
                startDate={safeStartDate}
                endDate={safeEndDate}
                className="border p-2 rounded-lg"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">End Date</label>
              <DatePicker
                selected={safeEndDate}
                onChange={setEndDate}
                selectsEnd
                startDate={safeStartDate}
                endDate={safeEndDate}
                minDate={safeStartDate}
                className="border p-2 rounded-lg"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={fetchTransactions} disabled={loading}>
                {loading ? "Loading..." : "Filter"}
              </Button>
            </div>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <div className="overflow-x-auto mb-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow key="loading-row">
                    <TableCell colSpan={3} className="text-center">
                      <LoadingSpinner size="sm" />
                    </TableCell>
                  </TableRow>
                ) : data.length > 0 ? (
                  data.map((transaction, index) => (
                    <TableRow key={generateKey(transaction, index)}>
                      <TableCell className="capitalize">{transaction.type || transaction._id}</TableCell>
                      <TableCell>
                        {typeof transaction.totalAmount === 'number'
                          ? `${transaction.totalAmount.toFixed(2)} PKR`
                          : 'N/A'}
                      </TableCell>
                      <TableCell>{transaction.count}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow key="no-data-row">
                    <TableCell colSpan={3} className="text-center">
                      No transaction data available for selected period
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {data.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-100 p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-center mb-2">Transaction Amounts</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data}>
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => {
                        const numValue = typeof value === 'number' ? value : 0;
                        return [`${numValue.toFixed(2)} PKR`, ""];
                      }}
                      labelFormatter={(label) => `Type: ${label}`}
                    />
                    <Legend />
                    <Bar dataKey="totalAmount" name="Total Amount">
                      {data.map((entry, index) => (
                        <Cell 
                          key={`bar-cell-${generateKey(entry, index)}`}
                          fill={colors[index % colors.length]} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-gray-100 p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-center mb-2">Transaction Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data}
                      dataKey="totalAmount"
                      nameKey="type"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    >
                      {data.map((entry, index) => (
                        <Cell 
                          key={`pie-cell-${generateKey(entry, index)}`}
                          fill={colors[index % colors.length]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => {
                        const numValue = typeof value === 'number' ? value : 0;
                        return [`${numValue.toFixed(2)} PKR`, ""];
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TransactionAnalysisTable;