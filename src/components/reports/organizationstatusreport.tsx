/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
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
  const [data, setData] = useState<OrganizationAnalysis[]>([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());

  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const start = startDate ? format(startDate, "yyyy-MM-dd") : "";
      const end = endDate ? format(endDate, "yyyy-MM-dd") : "";

      const response = await fetch(`/api/reports/organization?startDate=${start}&endDate=${end}`);
      const result = await response.json();

      if (!Array.isArray(result)) {
        console.error("Invalid API response:", result);
        setData([]);
      } else {
        setData(result);
      }
    } catch (error) {
      console.error("Error fetching organization data:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const colors = ["#8884d8", "#82ca9d", "#8884d8", "#82ca9d", "#8884d8"];

  // Separate data for income & expenses
  const incomeData = data.filter((item) => item.type === "Income");
  const expenseData = data.filter((item) => item.type === "Expense");

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-6 text-center">Organization Analysis</h2>

      <div className="flex flex-wrap gap-4 justify-center mb-6">
        <DatePicker selected={startDate} onChange={setStartDate} placeholderText="Start Date" />
        <DatePicker selected={endDate} onChange={setEndDate} placeholderText="End Date" />
        <Button onClick={fetchOrganizations} disabled={loading}>
          {loading ? "Loading..." : "Filter"}
        </Button>
      </div>

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
                <TableCell colSpan={5} className="text-center">Loading...</TableCell>
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
                <TableCell colSpan={5} className="text-center">No data available</TableCell>
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
    </div>
  );
};

export default OrganizationAnalysisTable;
