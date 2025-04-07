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

interface ExpenseAnalysis {
  _id: string;
  category: string;
  totalAmount: number;
  paymentMethods: string[];
  banksUsed: string[];
}

const ExpenseAnalysisTable = () => {
  const { status: authStatus } = useSession();
  const isAuthenticated = authStatus === "authenticated";
  const isAuthLoading = authStatus === "loading";

  const [data, setData] = useState<ExpenseAnalysis[]>([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [error, setError] = useState("");

  // Convert null to undefined for DatePicker props
  const safeStartDate = startDate ?? undefined;
  const safeEndDate = endDate ?? undefined;

 const fetchExpenses = useCallback(async () => {
  if (!isAuthenticated) {
    setError("Authentication required");
    return;
  }

  setLoading(true);
  setError("");

  try {
    const start = startDate ? format(startDate, "yyyy-MM-dd") : "";
    const end = endDate ? format(endDate, "yyyy-MM-dd") : "";

    const response = await fetch(`/api/reports/expense-analysis?startDate=${start}&endDate=${end}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to fetch expense analysis");
    }

    const result = await response.json();

    if (!Array.isArray(result)) {
      throw new Error("Invalid data format received from server");
    }

    setData(result.map(item => ({
      ...item,
      banksUsed: item.banksUsed || []
    })));
  } catch (error) {
    console.error("Error Fetching Expenses:", error);
    setError(error instanceof Error ? error.message : "Failed to fetch expense analysis. Please try again.");
    setData([]);
  } finally {
    setLoading(false);
  }
}, [isAuthenticated, startDate, endDate]);  // Include all dependencies

  useEffect(() => {
  if (isAuthenticated) {
    fetchExpenses();
  }
 }, [isAuthenticated, fetchExpenses]); 

  const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#ffbb28"];

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-6 text-center">Expense Analysis</h2>

      {!isAuthenticated && !isAuthLoading && (
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400" />
          <div className="flex-1">
            <p className="text-amber-700">You need to sign in to view expense analysis</p>
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
            <DatePicker
              selected={safeStartDate}
              onChange={setStartDate}
              selectsStart
              startDate={safeStartDate}
              endDate={safeEndDate}
              placeholderText="Start Date"
              className="border rounded p-2"
            />
            <DatePicker
              selected={safeEndDate}
              onChange={setEndDate}
              selectsEnd
              startDate={safeStartDate}
              endDate={safeEndDate}
              minDate={safeStartDate}
              placeholderText="End Date"
              className="border rounded p-2"
            />
            <Button onClick={fetchExpenses} disabled={loading}>
              {loading ? "Loading..." : "Filter"}
            </Button>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-red-700">{error}</p>
              <button
                onClick={fetchExpenses}
                className="ml-auto px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          <div className="overflow-x-auto mb-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Payment Methods</TableHead>
                  <TableHead>Banks Used</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      <LoadingSpinner size="sm" />
                    </TableCell>
                  </TableRow>
                ) : data.length > 0 ? (
                  data.map((expense) => (
                    <TableRow key={expense._id}>
                      <TableCell>{expense.category}</TableCell>
                      <TableCell>${expense.totalAmount.toFixed(2)}</TableCell>
                      <TableCell>{expense.paymentMethods.join(", ")}</TableCell>
                      <TableCell>
                        {expense.banksUsed.length > 0 ? expense.banksUsed.join(", ") : "N/A"}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      {error ? "Error loading data" : "No data available for selected period"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {data.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-100 p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-center mb-2">Expense Breakdown</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data}>
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, "Amount"]} />
                    <Legend />
                    <Bar dataKey="totalAmount" name="Amount" fill="#8884d8">
                      {data.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-gray-100 p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-center mb-2">Expense Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data}
                      dataKey="totalAmount"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {data.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`$${value}`, "Amount"]} />
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

export default ExpenseAnalysisTable;