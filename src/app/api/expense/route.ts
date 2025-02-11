import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/utils/dbconnect';
import Expense from '@/models/expense';

/**
 * GET: Fetch Expenses with Pagination, Search, and Sorting
 */
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const search = searchParams.get('search') || '';
    const sortField = searchParams.get('sortField') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;

    // Query Construction
    const query: Record<string, any> = {};
    if (search) {
      query.paymentMethod = { $regex: search, $options: 'i' };
    }

    // Pagination Logic
    const skip = (page - 1) * limit;

    const expenses = await Expense.find(query)
      .populate('expCatId')  // Ensure that this reference is set up in your Expense model
      .populate('orgId')  // Ensure that this reference is set up in your Expense model
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit)
      .select('-__v');

    const total = await Expense.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: expenses,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (error: unknown) {
    console.error('GET /api/expenses Error:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || 'Failed to fetch expenses' },
      { status: 500 }
    );
  }
}

/**
 * POST: Create a New Expense
 */
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // Validate JSON Request
    if (!request.headers.get('content-type')?.includes('application/json')) {
      return NextResponse.json({ success: false, error: 'Invalid Content-Type' }, { status: 400 });
    }

    const data = await request.json();

    // Ensure required fields exist
    if (!data.amount || !data.expCatId || !data.orgId || !data.paymentMethod) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const expense = await Expense.create({
      ...data,
      modifiedBy: 'System',
      modifiedDate: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: 'Expense created successfully',
      data: expense,
    }, { status: 201 });

  } catch (error: unknown) {
    console.error('POST /api/expenses Error:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || 'Failed to create expense' },
      { status: 500 }
    );
  }
}

/**
 * PUT: Update an Expense
 */
export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    const data = await request.json();
    
    if (!data._id) {
      return NextResponse.json({ success: false, error: 'Expense ID is required' }, { status: 400 });
    }

    const updatedExpense = await Expense.findByIdAndUpdate(
      data._id,
      { 
        ...data, 
        modifiedBy: 'System', 
        modifiedDate: new Date() 
      },
      { new: true, runValidators: true }
    );

    if (!updatedExpense) {
      return NextResponse.json({ success: false, error: 'Expense not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Expense updated successfully',
      data: updatedExpense,
    });

  } catch (error: unknown) {
    console.error('PUT /api/expenses Error:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || 'Failed to update expense' },
      { status: 500 }
    );
  }
}

/**
 * DELETE: Remove an Expense
 */
export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    const data = await request.json();

    if (!data._id) {
      return NextResponse.json({ success: false, error: 'Expense ID is required' }, { status: 400 });
    }

    const deletedExpense = await Expense.findByIdAndDelete(data._id);

    if (!deletedExpense) {
      return NextResponse.json({ success: false, error: 'Expense not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Expense deleted successfully',
    });

  } catch (error: unknown) {
    console.error('DELETE /api/expenses Error:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || 'Failed to delete expense' },
      { status: 500 }
    );
  }
}
