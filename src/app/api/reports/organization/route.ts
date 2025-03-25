import Expense from "@/models/expense";
import Income from "@/models/income";
import dbConnect from "@/utils/dbconnect";
import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

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

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "startDate and endDate are required" },
        { status: 400 }
      );
    }

    // Common match stage for both expenses and incomes
    const dateMatch = {
      "transaction.transactionDate": {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      },
      userId
    };

    // Fetch expenses with organization details
    const expenses = await Expense.aggregate([
      {
        $lookup: {
          from: "transactions",
          localField: "transactionId",
          foreignField: "_id",
          as: "transaction"
        }
      },
      { $unwind: "$transaction" },
      { $match: dateMatch },
      {
        $lookup: {
          from: "organizations",
          localField: "orgId",
          foreignField: "_id",
          as: "organization"
        }
      },
      { $unwind: { path: "$organization", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: {
            orgId: "$orgId",
            type: "Expense"
          },
          orgName: { 
            $first: { 
              $ifNull: ["$organization.name", "Uncategorized"] 
            } 
          },
          status: { 
            $first: { 
              $ifNull: ["$organization.status", "Unknown"] 
            } 
          },
          type: { $first: "Expense" },
          totalAmount: { $sum: "$transactionAmount" },
          count: { $sum: 1 }
        }
      }
    ]);

    // Fetch incomes with organization details
    const incomes = await Income.aggregate([
      {
        $lookup: {
          from: "transactions",
          localField: "transactionId",
          foreignField: "_id",
          as: "transaction"
        }
      },
      { $unwind: "$transaction" },
      { $match: dateMatch },
      {
        $lookup: {
          from: "organizations",
          localField: "orgId",
          foreignField: "_id",
          as: "organization"
        }
      },
      { $unwind: { path: "$organization", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: {
            orgId: "$orgId",
            type: "Income"
          },
          orgName: { 
            $first: { 
              $ifNull: ["$organization.name", "Uncategorized"] 
            } 
          },
          status: { 
            $first: { 
              $ifNull: ["$organization.status", "Unknown"] 
            } 
          },
          type: { $first: "Income" },
          totalAmount: { $sum: "$transactionAmount" },
          count: { $sum: 1 }
        }
      }
    ]);

    // Combine and format results
    const result = [...expenses, ...incomes].map(item => ({
      ...item,
      _id: {
        orgId: item._id.orgId?.toString() || "uncategorized",
        type: item._id.type,
        status: item.status
      }
    }));

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("Error in organization analysis:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch organization analysis" },
      { status: 500 }
    );
  }
}