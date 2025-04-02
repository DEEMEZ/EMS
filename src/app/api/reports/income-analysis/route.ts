import Income from "@/models/income";
import Transaction from "@/models/transaction";
import dbConnect from "@/utils/dbconnect";
import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from "next/server";

interface IncomeAnalysisResult {
  _id: string;
  incomeSource: string;
  totalAmount: number;
  organizations: string[];
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    console.log('✅ Database connected');

    // Verify authentication
    const token = await getToken({ req: request });
    console.log('🔑 User token:', token?.id || token?.sub);
    
    if (!token?.id && !token?.sub) {
      console.log('❌ No user token found');
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const userId = token.id || token.sub;
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    console.log('📅 Date range:', { startDate, endDate });

    if (!startDate || !endDate) {
      console.log('❌ Missing date parameters');
      return NextResponse.json({ error: "startDate and endDate are required" }, { status: 400 });
    }

    // 1. First find transactions in date range
    const transactionQuery = {
      transactionDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
      type: "Income",
      userTokenId: userId, // Match the string ID used in transactions
    };
    
    console.log('🔍 Transaction query:', JSON.stringify(transactionQuery, null, 2));

    const transactions = await Transaction.find(transactionQuery)
      .select("_id amount transactionDate")
      .lean();
    
    console.log('📊 Transactions found:', transactions.length);
    console.log('Sample transactions:', transactions.slice(0, 3));

    if (transactions.length === 0) {
      console.log('❌ No transactions found - checking if any exist without date filter...');
      const anyTransactions = await Transaction.find({ userTokenId: userId, type: "Income" }).limit(5);
      console.log('Any income transactions:', anyTransactions);
      return NextResponse.json([]);
    }

    const transactionIds = transactions.map(t => t._id);

    // 2. Find incomes linked to these transactions
    const incomeQuery = {
      transactionId: { $in: transactionIds },
      userId, // Match the string ID used in incomes
    };
    
    console.log('🔍 Income query:', JSON.stringify(incomeQuery, null, 2));

    const incomes = await Income.aggregate<IncomeAnalysisResult>([
      { $match: incomeQuery },
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
      { $unwind: { path: "$organization", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: "$incomeSourceId",
          incomeSource: { $first: "$incomeSource.name" },
          totalAmount: { $sum: "$transaction.amount" },
          organizations: { $addToSet: "$organization.name" },
        },
      },
      {
        $addFields: {
          organizations: {
            $filter: {
              input: "$organizations",
              as: "org",
              cond: { $ne: ["$$org", null] }
            }
          }
        }
      },
      { $sort: { totalAmount: -1 } },
    ]);

    console.log('✅ Income analysis results:', incomes);
    return NextResponse.json(incomes, {
      headers: {
        'Cache-Control': 'public, max-age=300' // 5 minute cache
      }
    });
  } catch (error: unknown) {
    console.error('❌ Full error:', error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to fetch income analysis" },
      { status: 500 }
    );
  }
}