/* eslint-disable @typescript-eslint/no-explicit-any */
import Budget from "@/models/budget";
import "@/models/expenseCategory";
import "@/models/user";
import dbConnect from "@/utils/dbconnect";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
console.log("Registered Models:", mongoose.modelNames());
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

    if (userId && !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { error: "Invalid User ID" },
        { status: 400 }
      );
    }

    if (expensecategoriesId && !mongoose.Types.ObjectId.isValid(expensecategoriesId)) {
      return NextResponse.json(
        { error: "Invalid Expense Category ID" },
        { status: 400 }
      );
    }

    console.log("🔎 Fetching budgets from", startDate, "to", endDate);

    const query: { startDate: any; endDate: any; expensecategoriesId?: string; userId?: string } = {
      startDate: { $lte: new Date(endDate) },
      endDate: { $gte: new Date(startDate) },
    };

    if (expensecategoriesId) {
      query.expensecategoriesId = expensecategoriesId;
    }

    if (userId) {
      query.userId = userId;
    }

    const budgets = await Budget.find(query)
      .populate("expensecategoriesId", "name")
      .populate("userId", "fullname email");

    if (budgets.length === 0) {
      console.log("❌ No budgets found in the given date range.");
      return NextResponse.json([]);
    }

    console.log("✅ Found", budgets.length, "budgets.");

    const budgetAnalysis = budgets.map((budget) => ({
      _id: budget._id,
      category: budget.expensecategoriesId?.name || "Unknown",
      monthlyLimit: budget.monthlyLimit,
      totalSpent: budget.spentAmount || 0, 
      remainingBudget: budget.remainingBudget || 0, 
    }));

    console.log("✅ Budget Analysis Data:", budgetAnalysis);

    return NextResponse.json(budgetAnalysis);
  } catch (error: unknown) {
    console.error("❌ Error fetching budget analysis:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to fetch budget analysis" },
      { status: 500 }
    );
  }
}