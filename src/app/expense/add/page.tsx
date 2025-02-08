import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/utils/dbconnect';
import Expense from '@/models/expense';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const data = await request.json();

    const expense = await Expense.create({
      ...data,
      modifiedBy: 'System', // Replace with actual user when authentication is implemented
      modifiedDate: new Date()
    });

    return NextResponse.json({
      message: 'Expense added successfully',
      expense
    }, { status: 201 });
  } catch (error: unknown) {
    console.error('Error in POST /api/expenses/add:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to add expense' },
      { status: 500 }
    );
  }
}
