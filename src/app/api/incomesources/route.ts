import IncomeSource from '@/models/incomesource';
import dbConnect from '@/utils/dbconnect';
import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Check authentication
    const token = await getToken({ req: request });
    if (!token?.id && !token?.sub) {
      return NextResponse.json({
        sources: [],
        pagination: { total: 0, page: 1, totalPages: 0 },
      });
    }

    const userId = token.id || token.sub;

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    // Filter income sources by userId
    const query: any = { userId };
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
  } catch (error) {
    console.error('Error in GET /api/incomesources:', error);
    return NextResponse.json(
      { error: 'Failed To Fetch Income Sources' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // Check authentication
    const token = await getToken({ req: request });
    if (!token?.id && !token?.sub) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = token.id || token.sub;
    const data = await request.json();

    // Create income source with userId
    const newIncomeSource = await IncomeSource.create({
      ...data,
      userId, // Associate income source with the user
    });

    return NextResponse.json(newIncomeSource, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/incomesources:', error);
    return NextResponse.json(
      { error: 'Failed To Create Income Source' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();

    // Check authentication
    const token = await getToken({ req: request });
    if (!token?.id && !token?.sub) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = token.id || token.sub;
    const data = await request.json();
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
    if (existingIncomeSource.userId.toString() !== userId.toString()) {
      return NextResponse.json(
        { error: 'You do not have permission to modify this income source' },
        { status: 403 }
      );
    }

    // Update the income source
    const updatedIncomeSource = await IncomeSource.findByIdAndUpdate(
      _id,
      { ...updateData, userId }, // Ensure userId is updated to current user
      { new: true, runValidators: true }
    );

    return NextResponse.json(updatedIncomeSource);
  } catch (error) {
    console.error('Error in PUT /api/incomesources:', error);
    return NextResponse.json(
      { error: 'Failed To Update Income Source' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();

    // Check authentication
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
    if (existingIncomeSource.userId.toString() !== userId.toString()) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this income source' },
        { status: 403 }
      );
    }

    // Delete the income source
    await IncomeSource.findByIdAndDelete(_id);

    return NextResponse.json({ message: 'Income Source Deleted Successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/incomesources:', error);
    return NextResponse.json(
      { error: 'Failed To Delete Income Source' },
      { status: 500 }
    );
  }
}