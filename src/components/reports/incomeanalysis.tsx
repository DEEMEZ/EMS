"use client";

import { LoadingSpinner } from '@/components/loadiingspinner';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { debounce } from 'lodash';
import { AlertCircle, LogIn } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Bar, BarChart, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface IncomeAnalysis {
  _id: string;
  incomeSource: string;
  totalAmount: number;
  organizations: string[];
}

const IncomeAnalysisTable = () => {
  const { status: authStatus } = useSession();
  const isAuthenticated = authStatus === "authenticated";
  const isAuthLoading = authStatus === "loading";

  const [data, setData] = useState<IncomeAnalysis[]>([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [error, setError] = useState("");

  // Convert null to undefined for DatePicker props
  const safeStartDate = startDate ?? undefined;
  const safeEndDate = endDate ?? undefined;

  // Create a debounced function using useMemo
  const debouncedFetchIncomes = useMemo(() => {
    return debounce(async (start: Date | null, end: Date | null) => {
      if (!isAuthenticated) {
        setError("Authentication required");
        return;
      }

      setLoading(true);
      setError("");

      try {
        const startStr = start ? format(start, "yyyy-MM-dd") : "";
        const endStr = end ? format(end, "yyyy-MM-dd") : "";

        const response = await fetch(
          `/api/reports/income-analysis?startDate=${startStr}&endDate=${endStr}`
        );
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to fetch income analysis");
        }

        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Error Fetching Incomes:", error);
        setError(error instanceof Error ? error.message : "Failed to fetch income analysis. Please try again.");
        setData([]);
      } finally {
        setLoading(false);
      }
    }, 500);
  }, [isAuthenticated]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedFetchIncomes.cancel();
    };
  }, [debouncedFetchIncomes]);

  useEffect(() => {
    if (isAuthenticated) {
      debouncedFetchIncomes(startDate, endDate);
    }
  }, [isAuthenticated, startDate, endDate, debouncedFetchIncomes]);

  const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#ffbb28"];

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-6 text-center">Income Analysis</h2>

      {!isAuthenticated && !isAuthLoading && (
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400" />
          <div className="flex-1">
            <p className="text-amber-700">You need to sign in to view income analysis</p>
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
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold mb-2 text-gray-800">How to Use This Page</h2>
            <ul className="text-gray-600 list-disc list-inside">
              <li><strong>Purpose:</strong> This page allows you to analyze your income by source and organizations.</li>
              <li><strong>Select Date Range:</strong> Use the date pickers to select a start and end date for the analysis period, then click "Filter" to view the report.</li>
              <li><strong>View Table Data:</strong> Review the table to see total amounts per income source, along with associated organizations.</li>
              <li><strong>Interpret Charts:</strong> Use the bar chart to compare income amounts across sources and the pie chart to see the distribution of income.</li>
              <li><strong>Handle Errors:</strong> If an error occurs, click the "Retry" button to attempt fetching the data again.</li>
            </ul>
          </div>

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
            <Button onClick={() => debouncedFetchIncomes(startDate, endDate)} disabled={loading}>
              {loading ? "Loading..." : "Filter"}
            </Button>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-red-700">{error}</p>
              <button
                onClick={() => debouncedFetchIncomes(startDate, endDate)}
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
                  <TableHead>Income Source</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Organizations</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">
                      <LoadingSpinner size="sm" />
                    </TableCell>
                  </TableRow>
                ) : data.length > 0 ? (
                  data.map((income) => (
                    <TableRow key={income._id}>
                      <TableCell>{income.incomeSource}</TableCell>
                      <TableCell>
                        {typeof income.totalAmount === 'number'
                          ? `${income.totalAmount.toFixed(2)} PKR`
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {income.organizations.length > 0 ? income.organizations.join(", ") : "N/A"}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">
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
                <h3 className="text-lg font-semibold text-center mb-2">Income Breakdown</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data}>
                    <XAxis dataKey="incomeSource" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} PKR`, "Amount"]} />
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
                <h3 className="text-lg font-semibold text-center mb-2">Income Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data}
                      dataKey="totalAmount"
                      nameKey="incomeSource"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {data.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} PKR`, "Amount"]} />
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

export default IncomeAnalysisTable;