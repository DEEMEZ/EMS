import Budget from '@/models/budgets';
import User from '@/models/user';
import dbConnect from '@/utils/dbconnect';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const userId = searchParams.get('userId') || '';
    const type = searchParams.get('type') || '';
    const sortField = searchParams.get('sortField') || 'budgetDate';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const query: { userId?: string; type?: string } = {};
    if (userId) query.userId = userId;
    if (type) query.type = type;

    const skip = (page - 1) * limit;
    const budgets = await Budget.find(query)
      .populate('userId', 'fullname email') // 🌟 Add this line to fetch user details
      .sort({ [sortField]: sortOrder === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v');

    const total = await Budget.countDocuments(query);

    return NextResponse.json({
      budgets,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    console.error('Error in GET /api/budgets:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to fetch budgets' },
      { status: 500 }
    );
  }
}


export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const data = await request.json();
    const { userId, id, expensecategoriesid, montlyLimit, startDate, endDate } = data;

    const userExists = await User.findById(userId);
    if (!userExists) {
      return NextResponse.json(
        { error: 'Invalid User ID. No such user exists.' },
        { status: 400 }
      );
    }

    const budget = await Budget.create({ userId, id, expensecategoriesid, monthlyLimit,  startDate, endDate });

    return NextResponse.json(
      {
        message: 'Budget created successfully',
        budget,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Error in POST /api/budgets:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to create budget' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    const data = await request.json();
    const { _id, userId, ...updateData } = data;

    const userExists = await User.findById(userId);
    if (!userExists) {
      return NextResponse.json(
        { error: 'Invalid User ID. No such user exists.' },
        { status: 400 }
      );
    }

    const budget = await Budget.findByIdAndUpdate(
      _id,
      { userId, ...updateData },
      { new: true, runValidators: true }
    );

    if (!budget) {
      return NextResponse.json(
        { error: 'Budget not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Budget updated successfully',
      budget,
    });
  } catch (error: unknown) {
    console.error('Error in PUT /api/budgets:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to update budget' },
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
        { error: 'Budget ID is required' },
        { status: 400 }
      );
    }

    const budget = await Budget.findByIdAndDelete(_id);

    if (!budget) {
      return NextResponse.json(
        { error: 'Budget not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Budget deleted successfully',
      success: true,
    });
  } catch (error: unknown) {
    console.error('Error in DELETE /api/budgets:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to delete budget' },
      { status: 500 }
    );
  }
}
