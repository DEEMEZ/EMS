// src/app/api/IncomeSourcess/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/utils/dbconnect';
import IncomeSources from '@/models/IncomeSources';

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
    const IncomeSources = await IncomeSources.find(query)
      .sort({ [sortField]: sortOrder === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v'); // Exclude version key

    const total = await IncomeSources.countDocuments(query);

    return NextResponse.json({
      IncomeSources,
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

    // Generate unique orgId if not provided
    // if (!data.orgId) {
    //   data.orgId = Math.floor(Math.random() * 1000000);
    // }
    
    const IncomeSources = await IncomeSources.create({
      ...data,
      modifiedBy: 'System', // Replace with actual user when auth is implemented
      modifiedDate: new Date(),
      status: data.status || 'Active'
    });

    return NextResponse.json({
      message: 'IncomeSources created successfully',
      IncomeSources
    }, { status: 201 });
  } catch (error: unknown) {
    console.error('Error in POST /api/IncomeSources:', error);
    
    // Handle duplicate orgId error
    // if (error.code === 11000) {
    //   return NextResponse.json(
    //     { error: 'An IncomeSources with this ID already exists' },
    //     { status: 409 }
    //   );
    // }

    return NextResponse.json(
      { error: (error as Error).message || 'Failed to create IncomeSources' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    const data = await request.json();
    const { _id, ...updateData } = data;

    // Remove orgId from update if it exists
    // delete updateData.orgId; // Prevent orgId modification

    const IncomeSources = await IncomeSources.findByIdAndUpdate(
      _id,
      {
        ...updateData,
        modifiedBy: 'System', // Replace with actual user when auth is implemented
        modifiedDate: new Date()
      },
      { new: true, runValidators: true }//ensures updated doc is returned and the the update is validated agains the schema
    );

    if (!IncomeSources) {
      return NextResponse.json(
        { error: 'IncomeSources not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'IncomeSources updated successfully',
      IncomeSources
    });
  } catch (error: unknown) {
    console.error('Error in PUT /api/IncomeSources:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to update IncomeSources' },
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
        { error: 'IncomeSources ID is required' },
        { status: 400 }
      );
    }

    const IncomeSources = await IncomeSources.findByIdAndDelete(_id);
    
    if (!IncomeSources) {
      return NextResponse.json(
        { error: 'IncomeSources not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'IncomeSources deleted successfully',
      success: true
    });
  } catch (error: unknown) {
    console.error('Error in DELETE /api/IncomeSources:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to delete IncomeSources' },
      { status: 500 }
    );
  }
}