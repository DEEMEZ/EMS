import ExpenseCategory from "@/models/expenseCategory";
import dbConnect from "@/utils/dbconnect";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    const query = search
      ? { name: { $regex: search, $options: 'i' } }
      : {};

    const skip = (page - 1) * limit;

    const expenseCategories = await ExpenseCategory.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await ExpenseCategory.countDocuments(query);

    return NextResponse.json({
      categories: expenseCategories,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error in GET /api/expensecategories:', error);
    return NextResponse.json({ error: 'Failed to fetch expense categories' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const data = await request.json();

    const newExpenseCategory = await ExpenseCategory.create(data);

    return NextResponse.json(newExpenseCategory, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/expensecategories:', error);
    return NextResponse.json({ error: 'Failed to create expense category' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    const data = await request.json();
    const { _id, ...updateData } = data;

    const updatedExpenseCategory = await ExpenseCategory.findByIdAndUpdate(
      _id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedExpenseCategory) {
      return NextResponse.json({ error: 'Expense category not found' }, { status: 404 });
    }

    return NextResponse.json(updatedExpenseCategory);
  } catch (error) {
    console.error('Error in PUT /api/expensecategories:', error);
    return NextResponse.json({ error: 'Failed to update expense category' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    const data = await request.json();
    const { _id } = data;

    if (!_id) {
      return NextResponse.json({ error: 'Expense category ID is required' }, { status: 400 });
    }

    const deletedExpenseCategory = await ExpenseCategory.findByIdAndDelete(_id);

    if (!deletedExpenseCategory) {
      return NextResponse.json({ error: 'Expense category not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Expense category deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/expensecategories:', error);
    return NextResponse.json({ error: 'Failed to delete expense category' }, { status: 500 });
  }
}
