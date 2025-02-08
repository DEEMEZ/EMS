import { useEffect, useState } from "react";
import { IExpense } from "@/types/expense";

export default function ExpenseList() {
  const [expenses, setExpenses] = useState<IExpense[]>([]);

  useEffect(() => {
    fetch("/api/expenses")
      .then((res) => res.json())
      .then((data) => setExpenses(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h3>Expense List</h3>
      <table>
        <thead>
          <tr>
            <th>Transaction ID</th>
            <th>Category</th>
            <th>Organization</th>
            <th>Payment Method</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => (
            <tr key={expense.id}>
              <td>{expense.transactionId}</td>
              <td>{expense.expCatId}</td>
              <td>{expense.orgId}</td>
              <td>{expense.paymentMethod}</td>
              <td>{expense.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
