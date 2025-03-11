/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { useEffect, useState } from "react";
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
  const [data, setData] = useState<ExpenseAnalysis[]>([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const start = startDate ? format(startDate, "yyyy-MM-dd") : "";
      const end = endDate ? format(endDate, "yyyy-MM-dd") : "";

      const response = await fetch(`/api/reports/expense-analysis?startDate=${start}&endDate=${end}`);
      const result = await response.json();

      if (!Array.isArray(result)) {
        console.error("Invalid API response:", result);
        setData([]);
      } else {
        setData(result);
      }
    } catch (error) {
      console.error("Error Fetching Expenses:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#ffbb28"];

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-6 text-center">Expense Analysis</h2>

      <div className="flex flex-wrap gap-4 justify-center mb-6">
        <DatePicker selected={startDate} onChange={setStartDate} placeholderText="Start Date" />
        <DatePicker selected={endDate} onChange={setEndDate} placeholderText="End Date" />
        <Button onClick={fetchExpenses} disabled={loading}>
          {loading ? "Loading..." : "Filter"}
        </Button>
      </div>

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
      <TableCell colSpan={4} className="text-center">Loading...</TableCell>
    </TableRow>
  ) : data.length > 0 ? (
    data.map((expense, index) => (
      <TableRow key={`${expense._id}-${index}`}>
        <TableCell>{expense.category}</TableCell>
        <TableCell>${expense.totalAmount.toFixed(2)}</TableCell>
        <TableCell>{expense.paymentMethods.join(", ")}</TableCell>
        <TableCell>{expense.banksUsed.length > 0 ? expense.banksUsed.join(", ") : "N/A"}</TableCell>
      </TableRow>
    ))
  ) : (
    <TableRow>
      <TableCell colSpan={4} className="text-center">No Data Available</TableCell>
    </TableRow>
  )}
</TableBody>

        </Table>
      </div>

      {data.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-100 p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-center mb-2">Expense Breakdown (Bar Chart)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data}>
                <XAxis dataKey="category" />
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
            <h3 className="text-lg font-semibold text-center mb-2">Expense Distribution (Pie Chart)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data}
                  dataKey="totalAmount"
                  nameKey="category"
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

export default ExpenseAnalysisTable;
