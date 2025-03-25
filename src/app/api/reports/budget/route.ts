import Budget from "@/models/budget";
import "@/models/expenseCategory";
import "@/models/user";
import dbConnect from "@/utils/dbconnect";
import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Verify authentication
    const token = await getToken({ req: request });
    if (!token?.id && !token?.sub) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = token.id || token.sub;

    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Validate date range
    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "startDate and endDate are required" },
        { status: 400 }
      );
    }

    // Find budgets that overlap with the requested date range
    const budgets = await Budget.find({
      userId,
      startDate: { $lte: new Date(endDate) },
      endDate: { $gte: new Date(startDate) }
    })
    .populate("expensecategoriesId", "name")
    .lean();

    if (!budgets || budgets.length === 0) {
      return NextResponse.json([]);
    }

    // Calculate budget analysis
    const budgetAnalysis = budgets.map((budget) => {
      const spent = budget.spentAmount || 0;
      const limit = budget.monthlyLimit || 0;
      const remaining = limit - spent;

      return {
        _id: budget._id.toString(),
        category: budget.expensecategoriesId?.name || "Uncategorized",
        monthlyLimit: limit,
        totalSpent: spent,
        remainingBudget: remaining
      };
    });

    return NextResponse.json(budgetAnalysis);
  } catch (error: unknown) {
    console.error("Error fetching budget analysis:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to fetch budget analysis" },
      { status: 500 }
    );
  }
}