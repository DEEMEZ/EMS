/* eslint-disable @typescript-eslint/no-explicit-any */
import Budget from '@/models/budget';
import ExpenseCategory from '@/models/expenseCategory';
import dbConnect from '@/utils/dbconnect';
import mongoose from 'mongoose';
import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const token = await getToken({ req: request });
    
    // Return empty data for unauthenticated users
    if (!token?.id && !token?.sub) {
      return NextResponse.json({
        budgets: [],
        pagination: { total: 0, page: 1, limit: 10, totalPages: 0 }
      });
    }
    
    const userId = token.id || token.sub;
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const expensecategoriesId = searchParams.get('expensecategoriesId') || '';
    const sortField = searchParams.get('sortField') || 'startDate';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build query with userId filter
    const query: any = { userId };
    
    if (search) {
      // Add search fields if needed
      // For budget, you might want to search by category name via aggregation
    }
    
    if (status) {
      query.status = status;
    }

    if (expensecategoriesId && mongoose.Types.ObjectId.isValid(expensecategoriesId)) {
      query.expensecategoriesId = new mongoose.Types.ObjectId(expensecategoriesId);
    }

    const skip = (page - 1) * limit;
    const budgets = await Budget.find(query)
      .populate('expensecategoriesId', 'name')
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
        totalPages: Math.ceil(total / limit)
      }
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
    const token = await getToken({ req: request });
    
    if (!token?.id && !token?.sub) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const userId = token.id || token.sub;
    const data = await request.json();
    
    const { expensecategoriesId, monthlyLimit, spentAmount, startDate, endDate } = data;

    // Validate required fields
    if (!expensecategoriesId || monthlyLimit === undefined || spentAmount === undefined || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'All fields are required (expensecategoriesId, monthlyLimit, spentAmount, startDate, endDate)' },
        { status: 400 }
      );
    }

    // Validate numeric fields
    if (typeof monthlyLimit !== 'number' || typeof spentAmount !== 'number') {
      return NextResponse.json(
        { error: 'monthlyLimit and spentAmount must be valid numbers' },
        { status: 400 }
      );
    }

    // Verify expense category exists
    if (!mongoose.Types.ObjectId.isValid(expensecategoriesId)) {
      return NextResponse.json(
        { error: 'Invalid Expense Category ID format' },
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
    
    // Calculate remaining budget
    const remainingBudget = monthlyLimit - spentAmount;

    // Create budget with userId from token
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
    }, { status: 201 });
    
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
    const token = await getToken({ req: request });
    
    if (!token?.id && !token?.sub) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const userId = token.id || token.sub;
    const data = await request.json();
    
    const { _id, expensecategoriesId, monthlyLimit, spentAmount, startDate, endDate } = data;

    // Validate required fields
    if (!_id || !expensecategoriesId || monthlyLimit === undefined || spentAmount === undefined || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'All fields are required (_id, expensecategoriesId, monthlyLimit, spentAmount, startDate, endDate)' },
        { status: 400 }
      );
    }
    
    // Validate numeric fields
    if (typeof monthlyLimit !== 'number' || typeof spentAmount !== 'number') {
      return NextResponse.json(
        { error: 'monthlyLimit and spentAmount must be valid numbers' },
        { status: 400 }
      );
    }

    // Find the budget first to check ownership
    const existingBudget = await Budget.findById(_id);
    
    if (!existingBudget) {
      return NextResponse.json(
        { error: 'Budget not found' },
        { status: 404 }
      );
    }
    
    // Check if the budget belongs to the current user
    if (existingBudget.userId.toString() !== userId.toString()) {
      return NextResponse.json(
        { error: 'You do not have permission to modify this budget' },
        { status: 403 }
      );
    }

    // Verify expense category exists
    if (!mongoose.Types.ObjectId.isValid(expensecategoriesId)) {
      return NextResponse.json(
        { error: 'Invalid Expense Category ID format' },
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

    // Calculate remaining budget
    const remainingBudget = monthlyLimit - spentAmount;

    // Update budget
    const budget = await Budget.findByIdAndUpdate(
      _id,
      {
        expensecategoriesId,
        monthlyLimit,
        spentAmount,
        remainingBudget,
        startDate,
        endDate,
        // userId remains the same, do not update it
      },
      { new: true, runValidators: true }
    );

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
    const token = await getToken({ req: request });
    
    if (!token?.id && !token?.sub) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const userId = token.id || token.sub;
    const data = await request.json();
    const { _id } = data;

    if (!_id) {
      return NextResponse.json(
        { error: 'Budget ID is required' },
        { status: 400 }
      );
    }

    // Find the budget first to check ownership
    const existingBudget = await Budget.findById(_id);
    
    if (!existingBudget) {
      return NextResponse.json(
        { error: 'Budget not found' },
        { status: 404 }
      );
    }
    
    // Check if the budget belongs to the current user
    if (existingBudget.userId.toString() !== userId.toString()) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this budget' },
        { status: 403 }
      );
    }

    // Delete the budget
    await Budget.findByIdAndDelete(_id);
    
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