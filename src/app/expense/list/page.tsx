import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/utils/dbconnect';
import Expense from '@/models/expense';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const sortField = searchParams.get('sortField') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build query
    const query: { paymentMethod?: { $regex: string, $options: string } } = {};
    if (search) {
      query.paymentMethod = { $regex: search, $options: 'i' };
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const expenses = await Expense.find(query)
      .populate('expCatId') // Fetch related expense category details
      .populate('orgId') // Fetch related organization details
      .sort({ [sortField]: sortOrder === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v'); // Exclude version key

    const total = await Expense.countDocuments(query);

    return NextResponse.json({
      expenses,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error: unknown) {
    console.error('Error in GET /api/expenses/list:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to fetch expenses' },
      { status: 500 }
    );
  }
}
