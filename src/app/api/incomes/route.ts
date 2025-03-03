/* eslint-disable @typescript-eslint/no-explicit-any */
import Income from '@/models/income';
import IncomeSources from '@/models/incomesource';
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
    const incomeSourceId = searchParams.get('incomeSourceId') || '';
    const orgId = searchParams.get('orgId') || '';
    const sortField = searchParams.get('sortField') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const query: any = {};
    if (transactionId) query.transactionId = transactionId;
    if (incomeSourceId) query.incomeSourceId = incomeSourceId;
    if (orgId) query.orgId = orgId;

    const skip = (page - 1) * limit;
    const incomes = await Income.find(query)
      .populate('transactionId', 'amount type transactionDate')
      .populate('incomeSourceId', 'name')
      .populate('orgId', 'name')
      .sort({ [sortField]: sortOrder === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v');

    const incomesWithAmount = incomes.map(income => ({
      ...income.toObject(),
      transactionAmount: income.transactionId?.amount || 0 
    }));

    const total = await Income.countDocuments(query);

    return NextResponse.json({
      incomes: incomesWithAmount,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error in GET /api/incomes:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to fetch incomes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const data = await request.json();
    const { transactionId, incomeSourceId, orgId } = data;

    const transactionExists = await Transaction.findById(transactionId);
    if (!transactionExists) {
      return NextResponse.json({ error: 'Invalid Transaction ID.' }, { status: 400 });
    }

    const incomeSourceExists = await IncomeSources.findById(incomeSourceId);
    if (!incomeSourceExists) {
      return NextResponse.json({ error: 'Invalid Income Source ID.' }, { status: 400 });
    }

    const orgExists = await Organization.findById(orgId);
    if (!orgExists) {
      return NextResponse.json({ error: 'Invalid Organization ID.' }, { status: 400 });
    }

    const transactionAmount = transactionExists.amount;

    const income = await Income.create({
      transactionId,
      incomeSourceId,
      orgId,
      transactionAmount, 
    });

    return NextResponse.json(
      {
        message: 'Income created successfully',
        income,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/incomes:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to create income' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    const data = await request.json();
    const { _id, transactionId, incomeSourceId, orgId } = data;

    const income = await Income.findById(_id);
    if (!income) {
      return NextResponse.json({ error: 'Income not found' }, { status: 404 });
    }

    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return NextResponse.json({ error: 'Invalid Transaction ID.' }, { status: 400 });
    }
    const transactionAmount = transaction.amount;

    const updatedIncome = await Income.findByIdAndUpdate(
      _id,
      { transactionId, incomeSourceId, orgId, transactionAmount },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      message: 'Income updated successfully',
      updatedIncome,
    });
  } catch (error) {
    console.error('Error in PUT /api/incomes:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to update income' },
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
      return NextResponse.json({ error: 'Income ID is required' }, { status: 400 });
    }

    const income = await Income.findByIdAndDelete(_id);

    if (!income) {
      return NextResponse.json({ error: 'Income not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Income deleted successfully',
      success: true,
    });
  } catch (error) {
    console.error('Error in DELETE /api/incomes:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to delete income' },
      { status: 500 }
    );
  }
}
