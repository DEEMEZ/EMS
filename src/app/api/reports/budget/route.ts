/* eslint-disable @typescript-eslint/no-explicit-any */
import Budget from "@/models/budget";
import Expense from "@/models/expense";
import ExpenseCategory from "@/models/expenseCategory";
import dbConnect from "@/utils/dbconnect";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Debugging: Ensure ExpenseCategory is registered
    console.log("📌 Registered Mongoose Models:", JSON.stringify(Budget.modelName), JSON.stringify(ExpenseCategory.modelName));

    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const expensecategoriesId = searchParams.get("expensecategoriesId") || "";
    const userId = searchParams.get("userId") || "";

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "startDate and endDate are required" },
        { status: 400 }
      );
    }

    console.log("🔎 Fetching budgets from", startDate, "to", endDate);

    const budgets = await Budget.find({
      startDate: { $lte: new Date(endDate) },
      endDate: { $gte: new Date(startDate) },
      ...(expensecategoriesId && { expensecategoriesId }),
      ...(userId && { userId }),
    }).populate("expensecategoriesId", "name");

    if (budgets.length === 0) {
      console.log("❌ No Budgets Found In The Given Date Range.");
      return NextResponse.json([]);
    }

    console.log("✅ Found", budgets.length, "Budgets. Fetching Expenses...");

    const expenses = await Expense.aggregate([
      {
        $match: {
          transactionDate: { $gte: new Date(startDate), $lte: new Date(endDate) },
        },
      },
      {
        $group: {
          _id: "$expensecategoriesId",
          totalExpense: { $sum: "$transactionAmount" },
        },
      },
    ]);

    const expenseMap = new Map(
      expenses.map((expense) => [expense._id?.toString(), expense.totalExpense])
    );

    const budgetAnalysis = budgets.map((budget) => ({
      _id: budget._id,
      category: budget.expensecategoriesId?.name || "Unknown",
      monthlyLimit: budget.monthlyLimit,
      totalBudgeted: budget.amount,
      totalSpent: expenseMap.get(budget.expensecategoriesId?._id?.toString()) || 0,
      remainingBudget:
        budget.amount - (expenseMap.get(budget.expensecategoriesId?._id?.toString()) || 0),
    }));

    console.log("✅ Budget Analysis Data:", budgetAnalysis);

    return NextResponse.json(budgetAnalysis);
  } catch (error: unknown) {
    console.error("❌ Error Fetching Budget Analysis:", error);
    return NextResponse.json({ error: "Failed To Fetch Budget Analysis" }, { status: 500 });
  }
}
