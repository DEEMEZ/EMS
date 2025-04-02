import Transaction from '@/models/transaction';
import User from '@/models/user';
import dbConnect from '@/utils/dbconnect';
import { Types } from 'mongoose';
import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

interface TransactionQuery {
  userTokenId: string;
  type?: string;
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Verify authentication with proper type narrowing
    const token = await getToken({ req: request });
    const userTokenId = token?.id || token?.sub;
    
    if (!userTokenId) {
      return NextResponse.json({
        transactions: [],
        pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
      });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const type = searchParams.get('type') || '';
    const sortField = searchParams.get('sortField') || 'transactionDate';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build query with userId filter
    const query: TransactionQuery = { userTokenId };
    if (type) query.type = type;

    const skip = (page - 1) * limit;
    const transactions = await Transaction.find(query)
      .populate('userId', 'fullname email')
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

interface TransactionData {
  type: string;
  transactionDate: string;
  description?: string;
  amount: number;
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // Verify authentication with proper type narrowing
    const token = await getToken({ req: request });
    const userTokenId = token?.id || token?.sub;
    
    if (!userTokenId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const data = await request.json() as TransactionData;
    const { type, transactionDate, description, amount } = data;

    // Validate required fields
    if (!type || !transactionDate || typeof amount !== 'number' || isNaN(amount)) {
      return NextResponse.json(
        { error: 'Missing or invalid required fields (type, transactionDate, amount)' },
        { status: 400 }
      );
    }

    // Check if user exists with proper ObjectId conversion
    const userExists = await User.findOne({ _id: new Types.ObjectId(userTokenId) });
    if (!userExists) {
      return NextResponse.json(
        { error: 'Invalid User ID. No such user exists.' },
        { status: 400 }
      );
    }

    // Create transaction with proper types
    const transaction = await Transaction.create({
      userId: userExists._id,
      userTokenId,
      type,
      transactionDate: new Date(transactionDate),
      description,
      amount,
      modifiedBy: token?.name || 'System',
      modifiedDate: new Date(),
    });

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

interface UpdateTransactionData extends TransactionData {
  _id: string;
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();

    // Verify authentication with proper type narrowing
    const token = await getToken({ req: request });
    const userTokenId = token?.id || token?.sub;
    
    if (!userTokenId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const data = await request.json() as UpdateTransactionData;
    const { _id, ...updateData } = data;

    // Validate required fields
    if (!_id) {
      return NextResponse.json(
        { error: 'Transaction ID is required' },
        { status: 400 }
      );
    }

    // Check if transaction exists
    const transaction = await Transaction.findById(_id);
    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Safe comparison with null check
    if (!transaction.userTokenId || transaction.userTokenId.toString() !== userTokenId.toString()) {
      return NextResponse.json(
        { error: 'You do not have permission to modify this transaction' },
        { status: 403 }
      );
    }

    // Update transaction with proper types
    const updatedTransaction = await Transaction.findByIdAndUpdate(
      _id,
      {
        ...updateData,
        transactionDate: updateData.transactionDate ? new Date(updateData.transactionDate) : undefined,
        modifiedBy: token?.name || 'System',
        modifiedDate: new Date(),
      },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      message: 'Transaction updated successfully',
      transaction: updatedTransaction,
    });
  } catch (error: unknown) {
    console.error('Error in PUT /api/transactions:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to update transaction' },
      { status: 500 }
    );
  }
}

interface DeleteRequestData {
  _id: string;
}

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();

    // Verify authentication with proper type narrowing
    const token = await getToken({ req: request });
    const userTokenId = token?.id || token?.sub;
    
    if (!userTokenId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const data = await request.json() as DeleteRequestData;
    const { _id } = data;

    // Validate required fields
    if (!_id) {
      return NextResponse.json(
        { error: 'Transaction ID is required' },
        { status: 400 }
      );
    }

    // Check if transaction exists
    const transaction = await Transaction.findById(_id);
    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Safe comparison with null check
    if (!transaction.userTokenId || transaction.userTokenId.toString() !== userTokenId.toString()) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this transaction' },
        { status: 403 }
      );
    }

    // Delete transaction
    await Transaction.findByIdAndDelete(_id);

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