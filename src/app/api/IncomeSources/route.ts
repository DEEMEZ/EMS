// src/app/api/IncomeSources/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/utils/dbconnect';
import IncomeSourcesModel from '@/models/IncomeSources'; // Renamed to avoid naming conflict

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const sortField = searchParams.get('sortField') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build query
    const query: { name?: { $regex: string, $options: string }, status?: string } = {};
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    if (status) {
      query.status = status;
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const incomeSources = await IncomeSourcesModel.find(query)
      .sort({ [sortField]: sortOrder === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v'); // Exclude version key

    const total = await IncomeSourcesModel.countDocuments(query);

    return NextResponse.json({
      incomeSources,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error: unknown) {
    console.error('Error in GET /api/IncomeSources:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to fetch IncomeSources' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const data = await request.json();

    const incomeSource = await IncomeSourcesModel.create({
      ...data,
      modifiedBy: 'System', // Replace with actual user when auth is implemented
      modifiedDate: new Date(),
      status: data.status || 'Active'
    });

    return NextResponse.json({
      message: 'IncomeSource created successfully',
      incomeSource
    }, { status: 201 });
  } catch (error: unknown) {
    console.error('Error in POST /api/IncomeSources:', error);

    return NextResponse.json(
      { error: (error as Error).message || 'Failed to create IncomeSource' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    const data = await request.json();
    const { _id, ...updateData } = data;

    const incomeSource = await IncomeSourcesModel.findByIdAndUpdate(
      _id,
      {
        ...updateData,
        modifiedBy: 'System', // Replace with actual user when auth is implemented
        modifiedDate: new Date()
      },
      { new: true, runValidators: true } // Ensures updated doc is returned and the update is validated
    );

    if (!incomeSource) {
      return NextResponse.json(
        { error: 'IncomeSource not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'IncomeSource updated successfully',
      incomeSource
    });
  } catch (error: unknown) {
    console.error('Error in PUT /api/IncomeSources:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to update IncomeSource' },
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
        { error: 'IncomeSource ID is required' },
        { status: 400 }
      );
    }

    const incomeSource = await IncomeSourcesModel.findByIdAndDelete(_id);
    
    if (!incomeSource) {
      return NextResponse.json(
        { error: 'IncomeSource not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'IncomeSource deleted successfully',
      success: true
    });
  } catch (error: unknown) {
    console.error('Error in DELETE /api/IncomeSources:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to delete IncomeSource' },
      { status: 500 }
    );
  }
}
