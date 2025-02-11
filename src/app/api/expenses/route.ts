import Bank from '@/models/bank';
import Expense from '@/models/expense';
import ExpenseCategories from '@/models/expenseCategory';
import Organization from '@/models/organization';
import Transaction from '@/models/transaction';
import dbConnect from '@/utils/dbconnect';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const transactionId = searchParams.get('transactionId') || '';
    const expensecategoriesId = searchParams.get('expensecategoriesId') || '';
    const orgId = searchParams.get('orgId') || '';
    const paymentMethod = searchParams.get('paymentMethod') || '';
    const sortField = searchParams.get('sortField') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};
    if (transactionId) query.transactionId = transactionId;
    if (expensecategoriesId) query.expensecategoriesId = expensecategoriesId;
    if (orgId) query.orgId = orgId;
    if (paymentMethod) query.paymentMethod = paymentMethod;

    const skip = (page - 1) * limit;
    const expenses = await Expense.find(query)
      .populate('transactionId', 'type transactionDate')
      .populate('expensecategoriesId', 'name')
      .populate('orgId', 'name')
      .populate('bankId', 'name')
      .sort({ [sortField]: sortOrder === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v');

    const total = await Expense.countDocuments(query);

    return NextResponse.json({
      expenses,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
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
    const { transactionId, expensecategoriesId, orgId, paymentMethod, bankId } = data;

    const transactionExists = await Transaction.findById(transactionId);
    if (!transactionExists) {
      return NextResponse.json(
        { error: 'Invalid Transaction ID. No such transaction exists.' },
        { status: 400 }
      );
    }

    const expenseCategoryExists = await ExpenseCategories.findById(expensecategoriesId);
    if (!expenseCategoryExists) {
      return NextResponse.json(
        { error: 'Invalid Expense Category ID. No such category exists.' },
        { status: 400 }
      );
    }

    const orgExists = await Organization.findById(orgId);
    if (!orgExists) {
      return NextResponse.json(
        { error: 'Invalid Organization ID. No such organization exists.' },
        { status: 400 }
      );
    }

    if (paymentMethod === 'Transfer' && !bankId) {
      return NextResponse.json(
        { error: 'bankId is required when paymentMethod is Transfer.' },
        { status: 400 }
      );
    }

    if (bankId) {
      const bankExists = await Bank.findById(bankId);
      if (!bankExists) {
        return NextResponse.json(
          { error: 'Invalid Bank ID. No such bank exists.' },
          { status: 400 }
        );
      }
    }

    const expense = await Expense.create({
      transactionId,
      expensecategoriesId,
      orgId,
      paymentMethod,
      bankId: paymentMethod === 'Transfer' ? bankId : null,
    });

    return NextResponse.json({
      message: 'Expense created successfully',
      expense,
    });
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
    const { _id, transactionId, expensecategoriesId, orgId, paymentMethod, bankId } = data;

    const expense = await Expense.findById(_id);
    if (!expense) {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      );
    }

    if (paymentMethod === 'Transfer' && !bankId) {
      return NextResponse.json(
        { error: 'bankId is required when paymentMethod is Transfer.' },
        { status: 400 }
      );
    }

    const updatedExpense = await Expense.findByIdAndUpdate(
      _id,
      {
        transactionId,
        expensecategoriesId,
        orgId,
        paymentMethod,
        bankId: paymentMethod === 'Transfer' ? bankId : null,
      },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      message: 'Expense updated successfully',
      updatedExpense,
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
      success: true,
    });
  } catch (error: unknown) {
    console.error('Error in DELETE /api/expenses:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to delete expense' },
      { status: 500 }
    );
  }
}
