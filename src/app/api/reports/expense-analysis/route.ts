import Expense from "@/models/expense";
import dbConnect from "@/utils/dbconnect";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const expensecategoriesId = searchParams.get("expensecategoriesId") || "";
    const paymentMethod = searchParams.get("paymentMethod") || "";
    const bankId = searchParams.get("bankId") || "";

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "startDate and endDate are required" },
        { status: 400 }
      );
    }

    console.log("Fetching expenses from", startDate, "to", endDate);

    const expenses = await Expense.aggregate([
      {
        $lookup: {
          from: "transactions",
          localField: "transactionId",
          foreignField: "_id",
          as: "transaction",
        },
      },
      { $unwind: "$transaction" },
      {
        $lookup: {
          from: "expensecategories",
          localField: "expensecategoriesId",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },
      {
        $lookup: {
          from: "banks",
          localField: "bankId",
          foreignField: "_id",
          as: "bank",
        },
      },
      { $unwind: { path: "$bank", preserveNullAndEmptyArrays: true } },
      {
        $match: {
          $expr: {
            $and: [
              { $gte: ["$transaction.transactionDate", new Date(startDate)] },
              { $lte: ["$transaction.transactionDate", new Date(endDate)] },
            ],
          },
          ...(expensecategoriesId && { expensecategoriesId }),
          ...(paymentMethod && { paymentMethod }),
          ...(bankId && { bankId }),
        },
      },
      {
        $group: {
          _id: "$expensecategoriesId",
          category: { $first: "$category.name" },
          totalAmount: { $sum: "$transaction.amount" },
          paymentMethods: { $addToSet: "$paymentMethod" },
          banksUsed: { $addToSet: "$bank.name" },
        },
      },
      { $sort: { totalAmount: -1 } },
    ]);

    console.log("Expense Analysis Data:", expenses);

    return NextResponse.json(expenses);
  } catch (error: unknown) {
    console.error("Error fetching expense analysis:", error);
    return NextResponse.json(
      { error: "Failed to fetch expense analysis" },
      { status: 500 }
    );
  }
}
