/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Bar, BarChart, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface TransactionAnalysis {
  _id: string;
  type: string;
  totalAmount: number;
  count: number;
}

const TransactionAnalysisTable = () => {
  const [data, setData] = useState<TransactionAnalysis[]>([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const start = startDate ? format(startDate, "yyyy-MM-dd") : "";
      const end = endDate ? format(endDate, "yyyy-MM-dd") : "";

      const response = await fetch(`/api/reports/transaction?startDate=${start}&endDate=${end}`);
      const result = await response.json();

      if (!Array.isArray(result)) {
        console.error("Invalid API response:", result);
        setData([]);
      } else {
        setData(result);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const colors = ["#8884d8", "#82ca9d"];

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-6 text-center">Transaction Analysis</h2>

      <div className="flex flex-wrap gap-4 justify-center mb-6">
        <DatePicker selected={startDate} onChange={setStartDate} placeholderText="Start Date" />
        <DatePicker selected={endDate} onChange={setEndDate} placeholderText="End Date" />
        <Button onClick={fetchTransactions} disabled={loading}>
          {loading ? "Loading..." : "Filter"}
        </Button>
      </div>

      <div className="overflow-x-auto mb-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaction Type</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead>Transaction Count</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center">Loading...</TableCell>
              </TableRow>
            ) : data.length > 0 ? (
              data.map((transaction, index) => (
                <TableRow key={`${transaction._id}-${index}`}>
<TableCell>{transaction.type || transaction._id || "Unknown"}</TableCell>
                  <TableCell>${transaction.totalAmount.toFixed(2)}</TableCell>
                  <TableCell>{transaction.count}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center">No data available</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {data.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-100 p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-center mb-2">Transaction Breakdown (Bar Chart)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data}>
<XAxis dataKey="_id" label={{ value: "", position: "insideBottom", offset: -5 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="totalAmount" fill="#8884d8">
                  {data.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-center mb-2">Transaction Distribution (Pie Chart)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data}
                  dataKey="totalAmount"
                  nameKey="_id"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#82ca9d"
                  label
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
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

export default TransactionAnalysisTable;
