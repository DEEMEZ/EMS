/* eslint-disable @typescript-eslint/no-explicit-any */
import Expense from "@/models/expense";
import Income from "@/models/income";
import dbConnect from "@/utils/dbconnect";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!startDate || !endDate) {
      return NextResponse.json({ error: "startDate and endDate are required" }, { status: 400 });
    }

    console.log("🔎 Fetching organization analysis from", startDate, "to", endDate);

    // 🔹 Fetch Expenses and Link to Transactions & Organizations
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
        $match: {
          "transaction.transactionDate": {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          },
        },
      },
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
          _id: { orgId: "$organization._id", status: "$organization.status", type: "Expense" },
          orgName: { $first: "$organization.name" },
          status: { $first: "$organization.status" },
          type: { $first: "Expense" },
          totalAmount: { $sum: "$transactionAmount" },
          count: { $sum: 1 },
        },
      },
    ]);

    // 🔹 Fetch Incomes and Link to Transactions & Organizations
    const incomes = await Income.aggregate([
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
        $match: {
          "transaction.transactionDate": {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          },
        },
      },
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
          _id: { orgId: "$organization._id", status: "$organization.status", type: "Income" },
          orgName: { $first: "$organization.name" },
          status: { $first: "$organization.status" },
          type: { $first: "Income" },
          totalAmount: { $sum: "$transactionAmount" },
          count: { $sum: 1 },
        },
      },
    ]);

    const organizationAnalysis = [...expenses, ...incomes];

    console.log("✅ Organization Analysis Data:", organizationAnalysis);
    return NextResponse.json(organizationAnalysis);

  } catch (error: unknown) {
    console.error("❌ Error fetching organization analysis:", error);
    return NextResponse.json({ error: "Failed to fetch organization analysis" }, { status: 500 });
  }
}
