import Budget from '@/models/budget';
import ExpenseCategory from '@/models/expenseCategory';
import User from '@/models/user';
import dbConnect from '@/utils/dbconnect';
import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    if (!ExpenseCategory) {
      throw new Error('ExpenseCategory model is not registered.');
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const userId = searchParams.get('userId') || '';
    const expensecategoriesId = searchParams.get('expensecategoriesId') || '';
    const sortField = searchParams.get('sortField') || 'startDate';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const query: { userId?: string; expensecategoriesId?: string } = {};
    if (userId) {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return NextResponse.json(
          { error: 'Invalid User ID' },
          { status: 400 }
        );
      }
      query.userId = userId;
    }
    if (expensecategoriesId) {
      if (!mongoose.Types.ObjectId.isValid(expensecategoriesId)) {
        return NextResponse.json(
          { error: 'Invalid Expense Category ID' },
          { status: 400 }
        );
      }
      query.expensecategoriesId = expensecategoriesId;
    }

    const skip = (page - 1) * limit;
    const budgets = await Budget.find(query)
      .populate('userId', 'fullname email')
      .populate('expensecategoriesId', 'name')
      .sort({ [sortField]: sortOrder === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v');

    console.log('Fetched Budgets:', JSON.stringify(budgets, null, 2));

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
    console.log('Incoming POST Payload:', JSON.stringify(data, null, 2)); 

    const { userId, expensecategoriesId, monthlyLimit, spentAmount, startDate, endDate } = data;

    if (!userId || !expensecategoriesId || !monthlyLimit || spentAmount === undefined || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'All fields are required (userId, expensecategoriesId, monthlyLimit, spentAmount, startDate, endDate)' },
        { status: 400 }
      );
    }

    if (typeof monthlyLimit !== 'number' || typeof spentAmount !== 'number') {
      return NextResponse.json(
        { error: 'monthlyLimit and spentAmount must be valid numbers' },
        { status: 400 }
      );
    }

    const userExists = await User.findById(userId);
    if (!userExists) {
      return NextResponse.json(
        { error: 'Invalid User ID. No such user exists.' },
        { status: 400 }
      );
    }

    const expenseCategoryExists = await ExpenseCategory.findById(expensecategoriesId);
    if (!expenseCategoryExists) {
      return NextResponse.json(
        { error: 'Invalid Expense Category ID. No such category exists.' },
        { status: 400 }
      );
    }

    const remainingBudget = monthlyLimit - spentAmount;

    const budget = await Budget.create({
      userId,
      expensecategoriesId,
      monthlyLimit,
      spentAmount,
      remainingBudget,
      startDate,
      endDate,
    });

    return NextResponse.json({
      message: 'Budget created successfully',
      budget,
    });
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
    console.log('Incoming PUT Payload:', JSON.stringify(data, null, 2)); 

    const { _id, userId, expensecategoriesId, monthlyLimit, spentAmount, startDate, endDate } = data;

    if (!_id || !userId || !expensecategoriesId || !monthlyLimit || spentAmount === undefined || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'All fields are required (_id, userId, expensecategoriesId, monthlyLimit, spentAmount, startDate, endDate)' },
        { status: 400 }
      );
    }

    if (typeof monthlyLimit !== 'number' || typeof spentAmount !== 'number') {
      return NextResponse.json(
        { error: 'monthlyLimit and spentAmount must be valid numbers' },
        { status: 400 }
      );
    }

    const userExists = await User.findById(userId);
    if (!userExists) {
      return NextResponse.json(
        { error: 'Invalid User ID. No such user exists.' },
        { status: 400 }
      );
    }

    const expenseCategoryExists = await ExpenseCategory.findById(expensecategoriesId);
    if (!expenseCategoryExists) {
      return NextResponse.json(
        { error: 'Invalid Expense Category ID. No such category exists.' },
        { status: 400 }
      );
    }

    const remainingBudget = monthlyLimit - spentAmount;

    const budget = await Budget.findByIdAndUpdate(
      _id,
      { userId, expensecategoriesId, monthlyLimit, spentAmount, remainingBudget, startDate, endDate },
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