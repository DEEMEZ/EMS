/* eslint-disable @typescript-eslint/no-explicit-any */
import Expense from '@/models/expense';
import ExpenseCategories from '@/models/expenseCategory';
import Organization from '@/models/organization';
import Transaction from '@/models/transaction';
import dbConnect from '@/utils/dbconnect';
import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

interface TokenPayload {
  id?: string;
  sub?: string;
  name?: string;
  email?: string;
}

interface ExpenseDocument {
  _id: string;
  userId: string;
  transactionId: string;
  expensecategoriesId: string;
  orgId: string;
  paymentMethod: string;
  transactionAmount: number;
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const token = await getToken({ req: request }) as TokenPayload;

    if (!token?.id && !token?.sub) {
      return NextResponse.json({
        expenses: [],
        pagination: { total: 0, page: 1, limit: 10, totalPages: 0 }
      });
    }

    const userId = token.id || token.sub;
    if (!userId) {
      return NextResponse.json({
        expenses: [],
        pagination: { total: 0, page: 1, limit: 10, totalPages: 0 }
      });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const transactionId = searchParams.get('transactionId') || '';
    const expensecategoriesId = searchParams.get('expensecategoriesId') || '';
    const orgId = searchParams.get('orgId') || '';
    const paymentMethod = searchParams.get('paymentMethod') || '';
    const sortField = searchParams.get('sortField') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const query: any = { userId };
    if (transactionId) query.transactionId = transactionId;
    if (expensecategoriesId) query.expensecategoriesId = expensecategoriesId;
    if (orgId) query.orgId = orgId;
    if (paymentMethod) query.paymentMethod = paymentMethod;

    const skip = (page - 1) * limit;
    const expenses = await Expense.find(query)
      .populate({
        path: 'transactionId',
        select: 'amount type transactionDate'
      })
      .populate('expensecategoriesId', 'name')
      .populate('orgId', 'name')
      .populate('paymentMethod', 'name') // Added this line to populate paymentMethod name
      .sort({ [sortField]: sortOrder === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v');

    const expensesWithAmount = expenses.map(expense => ({
      ...expense.toObject(),
      transactionAmount: expense.transactionId?.amount || 0
    }));

    const total = await Expense.countDocuments(query);

    return NextResponse.json({
      expenses: expensesWithAmount,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
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
    const token = await getToken({ req: request }) as TokenPayload;

    if (!token?.id && !token?.sub) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = token.id || token.sub;
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { transactionId, expensecategoriesId, orgId, paymentMethod } = data;

    const transactionExists = await Transaction.findById(transactionId);
    if (!transactionExists) {
      return NextResponse.json({ error: 'Invalid Transaction ID.' }, { status: 400 });
    }

    const expenseCategoryExists = await ExpenseCategories.findById(expensecategoriesId);
    if (!expenseCategoryExists) {
      return NextResponse.json({ error: 'Invalid Expense Category ID.' }, { status: 400 });
    }

    const orgExists = await Organization.findById(orgId);
    if (!orgExists) {
      return NextResponse.json({ error: 'Invalid Organization ID.' }, { status: 400 });
    }

    const transactionAmount = transactionExists.amount;

    const expense = await Expense.create({
      transactionId,
      expensecategoriesId,
      orgId,
      paymentMethod,
      transactionAmount,
      userId,
    });

    return NextResponse.json({ message: 'Expense created successfully', expense });
  } catch (error) {
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
    const token = await getToken({ req: request }) as TokenPayload;

    if (!token?.id && !token?.sub) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = token.id || token.sub;
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { _id, transactionId, expensecategoriesId, orgId, paymentMethod } = data;

    const expense = await Expense.findById(_id).lean<ExpenseDocument>();
    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    if (expense.userId.toString() !== userId) {
      return NextResponse.json(
        { error: 'You do not have permission to modify this expense' },
        { status: 403 }
      );
    }

    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return NextResponse.json({ error: 'Invalid Transaction ID.' }, { status: 400 });
    }
    const transactionAmount = transaction.amount;

    const updatedExpense = await Expense.findByIdAndUpdate(
      _id,
      {
        transactionId,
        expensecategoriesId,
        orgId,
        paymentMethod,
        transactionAmount,
        userId,
      },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      message: 'Expense updated successfully',
      updatedExpense,
    });
  } catch (error) {
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
    const token = await getToken({ req: request }) as TokenPayload;

    if (!token?.id && !token?.sub) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = token.id || token.sub;
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { _id } = data;

    if (!_id) {
      return NextResponse.json({ error: 'Expense ID is required' }, { status: 400 });
    }

    const expense = await Expense.findById(_id).lean<ExpenseDocument>();
    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    if (expense.userId.toString() !== userId) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this expense' },
        { status: 403 }
      );
    }

    await Expense.findByIdAndDelete(_id);

    return NextResponse.json({
      message: 'Expense deleted successfully',
      success: true,
    });
  } catch (error) {
    console.error('Error in DELETE /api/expenses:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to delete expense' },
      { status: 500 }
    );
  }
}