import IncomeSource from '@/models/incomesource';
import dbConnect from '@/utils/dbconnect';
import { Types } from 'mongoose';
import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

interface TokenPayload {
  id?: string;
  sub?: string;
  name?: string;
  email?: string;
}

interface QueryParams {
  page?: string;
  limit?: string;
  search?: string;
}

interface IncomeSourceQuery {
  userId: Types.ObjectId | string;
  name?: {
    $regex: string;
    $options: string;
  };
}

interface IncomeSourceData {
  name: string;
  amount?: number;
  frequency?: string;
  description?: string;
}

interface UpdateIncomeSourceData extends IncomeSourceData {
  _id: string;
}

interface DeleteRequestData {
  _id: string;
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Check authentication with type assertion
    const token = await getToken({ req: request }) as TokenPayload;
    if (!token?.id && !token?.sub) {
      return NextResponse.json({
        sources: [],
        pagination: { total: 0, page: 1, totalPages: 0 },
      });
    }

    const userId = token.id || token.sub;
    if (!userId) {
      return NextResponse.json({
        sources: [],
        pagination: { total: 0, page: 1, totalPages: 0 },
      });
    }

    const searchParams = request.nextUrl.searchParams;
    const params = Object.fromEntries(searchParams.entries()) as QueryParams;
    const page = parseInt(params.page || '1');
    const limit = parseInt(params.limit || '10');
    const search = params.search || '';

    // Filter income sources by userId
    const query: IncomeSourceQuery = { userId };
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

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
  } catch (error: unknown) {
    console.error('Error in GET /api/incomesources:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed To Fetch Income Sources' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // Check authentication with type assertion
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

    const data = await request.json() as IncomeSourceData;

    // Create income source with userId
    const newIncomeSource = await IncomeSource.create({
      ...data,
      userId,
    });

    return NextResponse.json(newIncomeSource, { status: 201 });
  } catch (error: unknown) {
    console.error('Error in POST /api/incomesources:', error);
    
    // Handle duplicate key error
    if ((error as { code?: number }).code === 11000) {
      return NextResponse.json(
        { error: 'An income source with this name already exists for your account' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: (error as Error).message || 'Failed To Create Income Source' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();

    // Check authentication with type assertion
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

    const data = await request.json() as UpdateIncomeSourceData;
    const { _id, ...updateData } = data;

    // Find the income source first to check ownership
    const existingIncomeSource = await IncomeSource.findById(_id);
    if (!existingIncomeSource) {
      return NextResponse.json(
        { error: 'Income Source Not Found' },
        { status: 404 }
      );
    }

    // Check if the income source belongs to the current user
    if (!existingIncomeSource.userId || existingIncomeSource.userId.toString() !== userId) {
      return NextResponse.json(
        { error: 'You do not have permission to modify this income source' },
        { status: 403 }
      );
    }

    // Update the income source
    const updatedIncomeSource = await IncomeSource.findByIdAndUpdate(
      _id,
      { ...updateData, userId },
      { new: true, runValidators: true }
    );

    return NextResponse.json(updatedIncomeSource);
  } catch (error: unknown) {
    console.error('Error in PUT /api/incomesources:', error);

    // Handle duplicate key error
    if ((error as { code?: number }).code === 11000) {
      return NextResponse.json(
        { error: 'An income source with this name already exists for your account' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: (error as Error).message || 'Failed To Update Income Source' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();

    // Check authentication with type assertion
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

    const data = await request.json() as DeleteRequestData;
    const { _id } = data;

    if (!_id) {
      return NextResponse.json(
        { error: 'Income Source ID Is Required' },
        { status: 400 }
      );
    }

    // Find the income source first to check ownership
    const existingIncomeSource = await IncomeSource.findById(_id);
    if (!existingIncomeSource) {
      return NextResponse.json(
        { error: 'Income Source Not Found' },
        { status: 404 }
      );
    }

    // Check if the income source belongs to the current user
    if (!existingIncomeSource.userId || existingIncomeSource.userId.toString() !== userId) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this income source' },
        { status: 403 }
      );
    }

    // Delete the income source
    await IncomeSource.findByIdAndDelete(_id);

    return NextResponse.json({ message: 'Income Source Deleted Successfully' });
  } catch (error: unknown) {
    console.error('Error in DELETE /api/incomesources:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed To Delete Income Source' },
      { status: 500 }
    );
  }
}