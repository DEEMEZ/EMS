import Expense from '@/models/expense';
import Transaction from '@/models/transaction';
import dbConnect from '@/utils/dbconnect';
import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

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

    const userTokenId = token.id || token.sub;
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
      type: { $regex: /^expense$/i }, // Case-insensitive match
      userTokenId, // Match the string ID used in transactions
    };
    
    console.log('🔍 Transaction query:', JSON.stringify(transactionQuery, null, 2));

    const transactions = await Transaction.find(transactionQuery)
      .select("_id amount transactionDate")
      .lean();
    
    console.log('📊 Transactions found:', transactions.length);
    console.log('Sample transactions:', transactions.slice(0, 3));

    if (transactions.length === 0) {
      console.log('❌ No transactions found - checking if any exist without date filter...');
      const anyTransactions = await Transaction.find({ userTokenId }).limit(5);
      console.log('Any user transactions:', anyTransactions);
      return NextResponse.json([]);
    }

    const transactionIds = transactions.map(t => t._id);

    // 2. Find expenses linked to these transactions and use transaction amount directly
    const expenseQuery = {
      transactionId: { $in: transactionIds },
      userId: userTokenId, // Match the string ID used in expenses
    };
    
    console.log('🔍 Expense query:', JSON.stringify(expenseQuery, null, 2));

    const expenses = await Expense.aggregate([
      { $match: expenseQuery },
      // Lookup the transaction to get the current amount
      {
        $lookup: {
          from: "transactions",
          localField: "transactionId",
          foreignField: "_id",
          as: "transaction",
        },
      },
      { $unwind: "$transaction" },
      // Lookup category information
      {
        $lookup: {
          from: "expensecategories",
          localField: "expensecategoriesId",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },
      // Lookup bank information
      {
        $lookup: {
          from: "banks",
          localField: "bankId",
          foreignField: "_id",
          as: "bank",
        },
      },
      { $unwind: { path: "$bank", preserveNullAndEmptyArrays: true } },
      // Group by category and sum amounts from transactions
      {
        $group: {
          _id: "$expensecategoriesId",
          category: { $first: "$category.name" },
          totalAmount: { $sum: "$transaction.amount" }, // Using transaction amount here
          paymentMethods: { $addToSet: "$paymentMethod" },
          banksUsed: { 
            $addToSet: {
              $cond: [
                { $ifNull: ["$bank", false] },
                "$bank.name",
                null
              ]
            }
          },
        },
      },
      // Filter out null banks
      {
        $addFields: {
          banksUsed: {
            $filter: {
              input: "$banksUsed",
              as: "bank",
              cond: { $ne: ["$$bank", null] }
            }
          }
        }
      },
      // Sort by highest amount first
      { $sort: { totalAmount: -1 } },
    ]);

    console.log('✅ Expense analysis results:', expenses);
    return NextResponse.json(expenses);
  } catch (error: unknown) {
    console.error('❌ Full error:', error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to fetch expense analysis" },
      { status: 500 }
    );
  }
}