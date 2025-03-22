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

interface OrganizationAnalysis {
  _id: {
    orgId: string;
    status: string;
    type: string;
  };
  orgName: string;
  status: string;
  type: string;
  totalAmount: number;
  count: number;
}

const OrganizationAnalysisTable = () => {
  const { data: session, status: authStatus } = useSession();
  const isAuthenticated = authStatus === "authenticated";
  const isAuthLoading = authStatus === "loading";

  const [data, setData] = useState<OrganizationAnalysis[]>([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [error, setError] = useState("");

  const fetchOrganizations = async () => {
    if (!isAuthenticated) {
      setError("Authentication required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const start = startDate ? format(startDate, "yyyy-MM-dd") : "";
      const end = endDate ? format(endDate, "yyyy-MM-dd") : "";

      const response = await fetch(`/api/reports/organization?startDate=${start}&endDate=${end}`);
      if (!response.ok) throw new Error("Failed to fetch organization analysis");

      const result = await response.json();
      if (!Array.isArray(result)) {
        console.error("Invalid API response:", result);
        setData([]);
      } else {
        setData(result);
      }
    } catch (error) {
      console.error("Error Fetching Organization Data:", error);
      setError("Failed to fetch organization analysis. Please try again.");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrganizations();
    }
  }, [isAuthenticated]);

  const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#ffbb28"];

  // Separate data for income & expenses
  const incomeData = data.filter((item) => item.type === "Income");
  const expenseData = data.filter((item) => item.type === "Expense");

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-6 text-center">Organization Analysis</h2>

      {/* Authentication Status Banner */}
      {!isAuthenticated && !isAuthLoading && (
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400" />
          <div className="flex-1">
            <p className="text-amber-700">You need to sign in to view organization analysis</p>
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

      {/* Organization Analysis Content */}
      {isAuthenticated && !isAuthLoading && (
        <>
          <div className="flex flex-wrap gap-4 justify-center mb-6">
            <DatePicker selected={startDate} onChange={setStartDate} placeholderText="Start Date" />
            <DatePicker selected={endDate} onChange={setEndDate} placeholderText="End Date" />
            <Button onClick={fetchOrganizations} disabled={loading}>
              {loading ? "Loading..." : "Filter"}
            </Button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-red-700">{error}</p>
              <button
                onClick={fetchOrganizations}
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
                  <TableHead>Organization</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Transaction Type</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Transaction Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : data.length > 0 ? (
                  data.map((org, index) => (
                    <TableRow key={`${org._id.orgId}-${index}`}>
                      <TableCell>{org.orgName}</TableCell>
                      <TableCell>{org.status}</TableCell>
                      <TableCell>{org.type}</TableCell>
                      <TableCell>${org.totalAmount.toFixed(2)}</TableCell>
                      <TableCell>{org.count}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No Data Available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {data.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Income Bar Chart */}
              <div className="bg-gray-100 p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-center mb-2">Income Breakdown (Bar Chart)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={incomeData}>
                    <XAxis dataKey="orgName" label={{ value: "", position: "insideBottom", offset: -5 }} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="totalAmount" fill="#4CAF50">
                      {incomeData.map((entry, index) => (
                        <Cell key={`bar-income-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Expense Bar Chart */}
              <div className="bg-gray-100 p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-center mb-2">Expense Breakdown (Bar Chart)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={expenseData}>
                    <XAxis dataKey="orgName" label={{ value: "", position: "insideBottom", offset: -5 }} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="totalAmount" fill="#82ca9d">
                      {expenseData.map((entry, index) => (
                        <Cell key={`bar-expense-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Income Pie Chart */}
              <div className="bg-gray-100 p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-center mb-2">Income Distribution (Pie Chart)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={incomeData}
                      dataKey="totalAmount"
                      nameKey="orgName"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#4CAF50"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
                    >
                      {incomeData.map((entry, index) => (
                        <Cell key={`pie-income-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Expense Pie Chart */}
              <div className="bg-gray-100 p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-center mb-2">Expense Distribution (Pie Chart)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={expenseData}
                      dataKey="totalAmount"
                      nameKey="orgName"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#F44336"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
                    >
                      {expenseData.map((entry, index) => (
                        <Cell key={`pie-expense-${index}`} fill={colors[index % colors.length]} />
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

export default OrganizationAnalysisTable;