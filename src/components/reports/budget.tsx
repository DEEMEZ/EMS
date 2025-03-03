/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Bar, BarChart, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface BudgetAnalysis {
  _id: string;
  category: string;
  monthlyLimit: number;
  totalBudgeted: number;
  totalSpent: number;
  remainingBudget: number;
}

const BudgetAnalysisTable = () => {
  const [data, setData] = useState<BudgetAnalysis[]>([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const start = startDate ? format(startDate, "yyyy-MM-dd") : "";
      const end = endDate ? format(endDate, "yyyy-MM-dd") : "";

      const response = await fetch(`/api/reports/budget?startDate=${start}&endDate=${end}`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Error fetching budget analysis:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#ffbb28"];

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-6 text-center">Budget Analysis</h2>
      
      <div className="flex flex-wrap gap-4 justify-center mb-6">
        <DatePicker selected={startDate} onChange={setStartDate} placeholderText="Start Date" />
        <DatePicker selected={endDate} onChange={setEndDate} placeholderText="End Date" />
        <Button onClick={fetchBudgets} disabled={loading}>Filter</Button>
      </div>

      <div className="overflow-x-auto mb-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>Monthly Limit</TableHead>
              <TableHead>Total Budgeted</TableHead>
              <TableHead>Total Spent</TableHead>
              <TableHead>Remaining Budget</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">Loading...</TableCell>
              </TableRow>
            ) : data.length > 0 ? (
              data.map((budget, index) => (
                <TableRow key={budget._id}>
                  <TableCell>{budget.category}</TableCell>
                  <TableCell>${budget.monthlyLimit.toFixed(2)}</TableCell>
                  <TableCell>${budget.totalBudgeted.toFixed(2)}</TableCell>
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
                <TableCell colSpan={5} className="text-center">No data available</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {data.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-100 p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-center mb-2">Budget vs Expense (Bar Chart)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data}>
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="totalBudgeted" fill="#8884d8" name="Budgeted Amount" />
                <Bar dataKey="totalSpent" fill="#ff7f50" name="Spent Amount" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-center mb-2">Budget Distribution (Pie Chart)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data}
                  dataKey="totalBudgeted"
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
    </div>
  );
};

export default BudgetAnalysisTable;
