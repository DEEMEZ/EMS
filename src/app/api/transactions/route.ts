import Transaction from '@/models/transaction';
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
    const sortField = searchParams.get('sortField') || 'transactionDate';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const query: { userId?: string; type?: string } = {};
    if (userId) query.userId = userId;
    if (type) query.type = type;

    const skip = (page - 1) * limit;
    const transactions = await Transaction.find(query)
      .sort({ [sortField]: sortOrder === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v');

    const total = await Transaction.countDocuments(query);

    return NextResponse.json({
      transactions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    console.error('Error in GET /api/transactions:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const data = await request.json();
    const { userId, type, transactionDate, description } = data;

    const userExists = await User.findById(userId);
    if (!userExists) {
      return NextResponse.json(
        { error: 'Invalid User ID. No such user exists.' },
        { status: 400 }
      );
    }

    const transaction = await Transaction.create({ userId, type, transactionDate, description });

    return NextResponse.json(
      {
        message: 'Transaction created successfully',
        transaction,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Error in POST /api/transactions:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to create transaction' },
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

    const transaction = await Transaction.findByIdAndUpdate(
      _id,
      { userId, ...updateData },
      { new: true, runValidators: true }
    );

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Transaction updated successfully',
      transaction,
    });
  } catch (error: unknown) {
    console.error('Error in PUT /api/transactions:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to update transaction' },
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
        { error: 'Transaction ID is required' },
        { status: 400 }
      );
    }

    const transaction = await Transaction.findByIdAndDelete(_id);

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Transaction deleted successfully',
      success: true,
    });
  } catch (error: unknown) {
    console.error('Error in DELETE /api/transactions:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to delete transaction' },
      { status: 500 }
    );
  }
}
