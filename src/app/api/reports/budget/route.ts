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
        { error: "startDate and endDate are required query parameters" },
        { status: 400 }
      );
    }

    // Validate date format
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format. Please use ISO format (YYYY-MM-DD)" },
        { status: 400 }
      );
    }

    // Find budgets that overlap with the requested date range
    const budgets = await Budget.find({
      userId,
      startDate: { $lte: endDateObj },
      endDate: { $gte: startDateObj }
    })
    .populate({
      path: "expensecategoriesId",
      select: "name",
      model: "ExpenseCategory"
    })
    .lean();

    if (!budgets || budgets.length === 0) {
      return NextResponse.json([]);
    }

    // Calculate budget analysis with proper type checking
    const budgetAnalysis = budgets.map((budget) => {
      try {
        if (!budget || !budget._id) {
          throw new Error("Invalid budget document");
        }

        const spent = typeof budget.spentAmount === 'number' ? budget.spentAmount : 0;
        const limit = typeof budget.monthlyLimit === 'number' ? budget.monthlyLimit : 0;
        const remaining = limit - spent;

        // Safely handle populated category
        const categoryName = (budget.expensecategoriesId && typeof budget.expensecategoriesId === 'object' && 'name' in budget.expensecategoriesId)
          ? (budget.expensecategoriesId as { name: string }).name
          : "Uncategorized";

        return {
          _id: budget._id.toString(),
          category: categoryName,
          monthlyLimit: limit,
          totalSpent: spent,
          remainingBudget: remaining,
          startDate: budget.startDate?.toISOString().split('T')[0],
          endDate: budget.endDate?.toISOString().split('T')[0]
        };
      } catch (error) {
        console.error("Error processing budget:", budget, error);
        return null;
      }
    }).filter(Boolean); // Remove any null entries from failed processing

    return NextResponse.json(budgetAnalysis);
  } catch (error: unknown) {
    console.error("Error fetching budget analysis:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      { error: `Failed to fetch budget analysis: ${errorMessage}` },
      { status: 500 }
    );
  }
}