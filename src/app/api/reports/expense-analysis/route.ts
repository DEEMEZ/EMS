/* eslint-disable @typescript-eslint/no-explicit-any */
import Expense from "@/models/expense";
import Transaction from "@/models/transaction";
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
      return NextResponse.json({ error: "startDate and endDate are required" }, { status: 400 });
    }

    console.log("🔎 Fetching Transactions From", startDate, "To", endDate);

    const transactions = await Transaction.find({
      transactionDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
      type: "Expense", 
    }).select("_id amount");

    if (transactions.length === 0) {
      console.log("❌ No transactions Found In The Given Date Range.");
      return NextResponse.json([]);
    }

    const transactionIds = transactions.map((txn) => txn._id);
    const transactionAmounts = new Map(transactions.map((txn) => [txn._id.toString(), txn.amount]));

    console.log("✅ Found", transactions.length, "Transactions. Fetching Expenses...");

    const expenses = await Expense.aggregate([
      {
        $match: {
          transactionId: { $in: transactionIds },
          ...(expensecategoriesId && { expensecategoriesId }),
          ...(paymentMethod && { paymentMethod }),
          ...(bankId && { bankId }),
        },
      },
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
        $group: {
          _id: "$expensecategoriesId", 
          category: { $first: "$category.name" },
          totalAmount: { $sum: "$transaction.amount" },
          paymentMethods: { $addToSet: "$paymentMethod" },
          banksUsed: { $addToSet: "$bank.name" },
          transactions: { 
            $push: { transactionId: "$transaction._id", amount: "$transaction.amount" } 
          },
        },
      },
      { $sort: { totalAmount: -1 } },
    ]);

    const updatedExpenses = expenses.map((expense) => ({
      _id: expense._id, 
      category: expense.category, 
      totalAmount: expense.totalAmount,
      paymentMethods: expense.paymentMethods,
      banksUsed: expense.banksUsed,
      transactions: expense.transactions.map((txn: { transactionId: { toString: () => any } }) => ({
        transactionId: txn.transactionId,
        amount: transactionAmounts.get(txn.transactionId.toString()) || 0,
      })),
    }));

    console.log("✅ Expense Analysis Data:", updatedExpenses);
    return NextResponse.json(updatedExpenses);

  } catch (error: unknown) {
    console.error("❌ Error Fetching Expense Analysis:", error);
    return NextResponse.json({ error: "Failed To Fetch Expense Analysis" }, { status: 500 });
  }
}
