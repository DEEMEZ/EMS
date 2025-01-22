import IncomeSource from '@/models/incomesource';
import dbConnect from '@/utils/dbconnect';
import { NextRequest, NextResponse } from 'next/server';

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

    const incomeSources = await IncomeSource.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await IncomeSource.countDocuments(query);

    return NextResponse.json({
      sources: incomeSources,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error in GET /api/incomesources:', error);
    return NextResponse.json({ error: 'Failed to fetch income sources' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const data = await request.json();

    const newIncomeSource = await IncomeSource.create(data);

    return NextResponse.json(newIncomeSource, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/incomesources:', error);
    return NextResponse.json({ error: 'Failed to create income source' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    const data = await request.json();
    const { _id, ...updateData } = data;

    const updatedIncomeSource = await IncomeSource.findByIdAndUpdate(
      _id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedIncomeSource) {
      return NextResponse.json({ error: 'Income source not found' }, { status: 404 });
    }

    return NextResponse.json(updatedIncomeSource);
  } catch (error) {
    console.error('Error in PUT /api/incomesources:', error);
    return NextResponse.json({ error: 'Failed to update income source' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    const data = await request.json();
    const { _id } = data;

    if (!_id) {
      return NextResponse.json({ error: 'Income source ID is required' }, { status: 400 });
    }

    const deletedIncomeSource = await IncomeSource.findByIdAndDelete(_id);

    if (!deletedIncomeSource) {
      return NextResponse.json({ error: 'Income source not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Income source deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/incomesources:', error);
    return NextResponse.json({ error: 'Failed to delete income source' }, { status: 500 });
  }
}
