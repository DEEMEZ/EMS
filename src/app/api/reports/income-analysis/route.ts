/* eslint-disable @typescript-eslint/no-explicit-any */
import Income from "@/models/income";
import Transaction from "@/models/transaction";
import dbConnect from "@/utils/dbconnect";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const incomeSourceId = searchParams.get("incomeSourceId") || "";
    const orgId = searchParams.get("orgId") || "";

    if (!startDate || !endDate) {
      return NextResponse.json({ error: "startDate and endDate are required" }, { status: 400 });
    }

    console.log("🔎 Fetching Transactions From", startDate, "To", endDate);

    const transactions = await Transaction.find({
      transactionDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
      type: "Income",
    }).select("_id amount");

    if (transactions.length === 0) {
      console.log("❌ No Transactions Found In The Given Date Range.");
      return NextResponse.json([]);
    }

    const transactionIds = transactions.map((txn) => txn._id);
    const transactionAmounts = new Map(transactions.map((txn) => [txn._id.toString(), txn.amount]));

    console.log("✅ Found", transactions.length, "Transactions. Fetching Incomes...");

    const incomes = await Income.aggregate([
      {
        $match: {
          transactionId: { $in: transactionIds },
          ...(incomeSourceId && { incomeSourceId }),
          ...(orgId && { orgId }),
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
          from: "incomesources",
          localField: "incomeSourceId",
          foreignField: "_id",
          as: "incomeSource",
        },
      },
      { $unwind: "$incomeSource" },
      {
        $lookup: {
          from: "organizations",
          localField: "orgId",
          foreignField: "_id",
          as: "organization",
        },
      },
      { $unwind: "$organization" },
      {
        $group: {
          _id: "$incomeSourceId",
          incomeSource: { $first: "$incomeSource.name" },
          totalAmount: { $sum: "$transaction.amount" },
          organizations: { $addToSet: "$organization.name" },
          transactions: { 
            $push: { transactionId: "$transaction._id", amount: "$transaction.amount" } 
          },
        },
      },
      { $sort: { totalAmount: -1 } },
    ]);

    if (incomes.length === 0) {
      console.log("❌ No Incomes Found Matching Transactions.");
    }

    const updatedIncomes = incomes.map((income) => ({
      _id: income._id,
      incomeSource: income.incomeSource,
      totalAmount: income.totalAmount,
      organizations: income.organizations,
      transactions: income.transactions.map((txn: { transactionId: { toString: () => any } }) => ({
        transactionId: txn.transactionId,
        amount: transactionAmounts.get(txn.transactionId.toString()) || 0,
      })),
    }));

    console.log("✅ Income Analysis Data:", updatedIncomes);
    return NextResponse.json(updatedIncomes);

  } catch (error: unknown) {
    console.error("❌ Error Fetching Income Analysis:", error);
    return NextResponse.json({ error: "Failed To Fetch Income Analysis" }, { status: 500 });
  }
}
