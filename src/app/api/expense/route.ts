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
    console.error('Error in GET /api/expenses:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to fetch expenses' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const data = await request.json();

    const expense = await Expense.create({
      ...data,
      modifiedBy: 'System', // Replace with actual user when auth is implemented
      modifiedDate: new Date()
    });

    return NextResponse.json({
      message: 'Expense created successfully',
      expense
    }, { status: 201 });
  } catch (error: unknown) {
    console.error('Error in POST /api/expenses:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to create expense' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    const data = await request.json();
    const { _id, ...updateData } = data;

    const expense = await Expense.findByIdAndUpdate(
      _id,
      {
        ...updateData,
        modifiedBy: 'System', // Replace with actual user when auth is implemented
        modifiedDate: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!expense) {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Expense updated successfully',
      expense
    });
  } catch (error: unknown) {
    console.error('Error in PUT /api/expenses:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to update expense' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    const data = await request.json();
    const { _id } = data;

    if (!_id) {
      return NextResponse.json(
        { error: 'Expense ID is required' },
        { status: 400 }
      );
    }

    const expense = await Expense.findByIdAndDelete(_id);
    
    if (!expense) {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Expense deleted successfully',
      success: true
    });
  } catch (error: unknown) {
    console.error('Error in DELETE /api/expenses:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to delete expense' },
      { status: 500 }
    );
  }
}
