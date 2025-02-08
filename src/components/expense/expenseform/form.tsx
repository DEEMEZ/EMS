import { useState } from "react";
import { IExpense } from "@/types/expense";

export default function ExpenseForm() {
  const [expense, setExpense] = useState<Partial<IExpense>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(expense),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Add Expense</h3>
      <label>Transaction ID:</label>
      <input type="text" onChange={(e) => setExpense({ ...expense, transactionId: e.target.value })} />

      <label>Expense Category:</label>
      <input type="text" onChange={(e) => setExpense({ ...expense, expCatId: e.target.value })} />

      <label>Organization ID:</label>
      <input type="text" onChange={(e) => setExpense({ ...expense, orgId: e.target.value })} />

      <label>Payment Method:</label>
      <input type="text" onChange={(e) => setExpense({ ...expense, paymentMethod: e.target.value })} />

      <label>Amount:</label>
      <input type="number" onChange={(e) => setExpense({ ...expense, amount: parseFloat(e.target.value) })} />

      <button type="submit">Submit</button>
    </form>
  );
}
