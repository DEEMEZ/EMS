'use client';

import { IExpense } from '@/types/expense';
import { IExpenseCategories } from '@/types/expensecategories';
import { IOrganization } from '@/types/organization';
import { LoadingSpinner } from '@/components/loadiingspinner';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ExpenseList() {
  const [expenses, setExpenses] = useState<IExpense[]>([]);
  const [categories, setCategories] = useState<IExpenseCategories[]>([]);
  const [organizations, setOrganizations] = useState<IOrganization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [expensesRes, categoriesRes, organizationsRes] = await Promise.all([
          fetch('/api/expense'), // Correct API for expenses
          fetch('/api/expensecategories'), // Correct API for expense categories
          fetch('/api/organization'), // Correct API for organizations
        ]);

        if (!expensesRes.ok || !categoriesRes.ok || !organizationsRes.ok) {
          throw new Error(
            `API Error: 
            Expense (${expensesRes.status}), 
            Categories (${categoriesRes.status}), 
            Organization (${organizationsRes.status})`
          );
        }

        const [expensesData, categoriesData, organizationsData] = await Promise.all([
          expensesRes.json(),
          categoriesRes.json(),
          organizationsRes.json(),
        ]);

        // Validate expected structure (checking for 'data' property)
        if (!expensesData?.data || !categoriesData?.data || !organizationsData?.data) {
          throw new Error('Invalid API response format');
        }

        setExpenses(expensesData.data);
        setCategories(categoriesData.data);
        setOrganizations(organizationsData.data);
      } catch (err: unknown) {
        setError(`Failed to load data: ${(err as Error).message}`);
        console.error('Error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-6">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-semibold mb-4">Expense List</h2>

      {expenses.length === 0 ? (
        <div className="text-gray-500 text-center py-4">No expenses found.</div>
      ) : (
        <table className="min-w-full table-auto border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100 text-gray-700 border-b">
              <th className="px-4 py-2 text-left">Transaction ID</th>
              <th className="px-4 py-2 text-left">Expense Category</th>
              <th className="px-4 py-2 text-left">Organization</th>
              <th className="px-4 py-2 text-left">Payment Method</th>
              <th className="px-4 py-2 text-left">Amount</th>
              <th className="px-4 py-2 text-left">Created At</th>
              <th className="px-4 py-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => (
              <tr key={expense.id} className="border-b">
                <td className="px-4 py-2">{expense.transactionId}</td>
                <td className="px-4 py-2">{categories.find((category) => category._id === expense.expCatId)?.name}</td>
                <td className="px-4 py-2">{organizations.find((org) => org._id === expense.orgId)?.name}</td>
                <td className="px-4 py-2">{expense.paymentMethod}</td>
                <td className="px-4 py-2">{expense.amount}</td>
                <td className="px-4 py-2">{new Date(expense.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-2">
                  <button className="text-red-600 hover:text-red-800">
                    <X size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
