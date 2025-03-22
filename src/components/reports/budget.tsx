/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { LoadingSpinner } from '@/components/loadiingspinner';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { AlertCircle, LogIn } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Bar, BarChart, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface BudgetAnalysis {
  _id: string;
  category: string;
  monthlyLimit: number;
  totalSpent: number;
  remainingBudget: number;
}

const BudgetAnalysisTable = () => {
  const { data: session, status: authStatus } = useSession();
  const isAuthenticated = authStatus === "authenticated";
  const isAuthLoading = authStatus === "loading";

  const [data, setData] = useState<BudgetAnalysis[]>([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [error, setError] = useState("");

  const fetchBudgets = async () => {
    if (!isAuthenticated) {
      setError("Authentication required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const start = startDate ? format(startDate, "yyyy-MM-dd") : "";
      const end = endDate ? format(endDate, "yyyy-MM-dd") : "";

      const response = await fetch(`/api/reports/budget?startDate=${start}&endDate=${end}`);
      if (!response.ok) throw new Error("Failed to fetch budget analysis");

      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Error fetching budget analysis:", error);
      setError("Failed to fetch budget analysis. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchBudgets();
    }
  }, [isAuthenticated]);

  const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#ffbb28"];

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-6 text-center">Budget Analysis</h2>

      {/* Authentication Status Banner */}
      {!isAuthenticated && !isAuthLoading && (
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400" />
          <div className="flex-1">
            <p className="text-amber-700">You need to sign in to view budget analysis</p>
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

      {/* Loading State */}
      {isAuthLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-500">Checking authentication...</p>
          </div>
        </div>
      )}

      {/* Budget Analysis Content */}
      {isAuthenticated && !isAuthLoading && (
        <>
          <div className="flex flex-wrap gap-4 justify-center mb-6">
            <DatePicker selected={startDate} onChange={setStartDate} placeholderText="Start Date" />
            <DatePicker selected={endDate} onChange={setEndDate} placeholderText="End Date" />
            <Button onClick={fetchBudgets} disabled={loading}>
              Filter
            </Button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-red-700">{error}</p>
              <button
                onClick={fetchBudgets}
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
                  <TableHead>Monthly Limit</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead>Remaining Budget</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : data.length > 0 ? (
                  data.map((budget, index) => (
                    <TableRow key={budget._id}>
                      <TableCell>{budget.category}</TableCell>
                      <TableCell>${budget.monthlyLimit.toFixed(2)}</TableCell>
                      <TableCell>${budget.totalSpent.toFixed(2)}</TableCell>
                      <TableCell
                        className={budget.remainingBudget < 0 ? "text-red-500 font-bold" : "text-green-500 font-bold"}
                      >
                        ${budget.remainingBudget.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      No data available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {data.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-100 p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-center mb-2">Monthly Limit vs Total Spent (Bar Chart)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data}>
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="monthlyLimit" fill="#8884d8" name="Monthly Limit" />
                    <Bar dataKey="totalSpent" fill="#ff7f50" name="Total Spent" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-gray-100 p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-center mb-2">Budget Distribution (Pie Chart)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data}
                      dataKey="monthlyLimit"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#82ca9d"
                      label
                    >
                      {data.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
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

export default BudgetAnalysisTable;