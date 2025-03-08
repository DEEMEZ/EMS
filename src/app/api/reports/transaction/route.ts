import Transaction from '@/models/transaction';
import dbConnect from '@/utils/dbconnect';
import { NextRequest, NextResponse } from 'next/server';

interface TransactionQuery {
  userId?: string;
  type?: string;
  transactionDate?: {
    $gte?: Date;
    $lte?: Date;
  };
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const fromDate = searchParams.get('fromDate') || '';
    const toDate = searchParams.get('toDate') || '';
    const userId = searchParams.get('userId') || '';
    const type = searchParams.get('type') || '';

    const query: TransactionQuery = {};
    
    if (userId) query.userId = userId;
    
    if (type) query.type = type;
    
    if (fromDate || toDate) {
      query.transactionDate = {};
      if (fromDate) query.transactionDate.$gte = new Date(fromDate);
      if (toDate) {
        const endDate = new Date(toDate);
        endDate.setHours(23, 59, 59, 999); 
        query.transactionDate.$lte = endDate;
      }
    }

    // Get transactions based on filters
    const transactions = await Transaction.find(query)
      .populate('userId', 'fullname email')
      .sort({ transactionDate: -1 })
      .select('-__v');

    // Calculate totals
    const totalAmount = transactions.reduce(
      (sum, transaction) => sum + transaction.amount, 
      0
    );

    return NextResponse.json({
      success: true,
      filters: {
        fromDate,
        toDate,
        userId,
        type
      },
      count: transactions.length,
      totalAmount,
      transactions
    });
  } catch (error: unknown) {
    console.error('Error in GET /api/reports:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to generate report' },
      { status: 500 }
    );
  }
}