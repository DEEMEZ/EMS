// src/app/api/organizations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/utils/dbconnect';
import Organization from '@/models/organization';

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
    const organizations = await Organization.find(query)
      .sort({ [sortField]: sortOrder === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v'); // Exclude version key

    const total = await Organization.countDocuments(query);

    return NextResponse.json({
      organizations,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error: unknown) {
    console.error('Error in GET /api/organizations:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to fetch organizations' },
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
    
    const organization = await Organization.create({
      ...data,
      modifiedBy: 'System', // Replace with actual user when auth is implemented
      modifiedDate: new Date(),
      status: data.status || 'Active'
    });

    return NextResponse.json({
      message: 'Organization created successfully',
      organization
    }, { status: 201 });
  } catch (error: unknown) {
    console.error('Error in POST /api/organizations:', error);
    
    // Handle duplicate orgId error
    // if (error.code === 11000) {
    //   return NextResponse.json(
    //     { error: 'An organization with this ID already exists' },
    //     { status: 409 }
    //   );
    // }

    return NextResponse.json(
      { error: (error as Error).message || 'Failed to create organization' },
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

    const organization = await Organization.findByIdAndUpdate(
      _id,
      {
        ...updateData,
        modifiedBy: 'System', // Replace with actual user when auth is implemented
        modifiedDate: new Date()
      },
      { new: true, runValidators: true }//ensures updated doc is returned and the the update is validated agains the schema
    );

    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Organization updated successfully',
      organization
    });
  } catch (error: unknown) {
    console.error('Error in PUT /api/organizations:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to update organization' },
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
        { error: 'Organization ID is required' },
        { status: 400 }
      );
    }

    const organization = await Organization.findByIdAndDelete(_id);
    
    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Organization deleted successfully',
      success: true
    });
  } catch (error: unknown) {
    console.error('Error in DELETE /api/organization:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to delete organization' },
      { status: 500 }
    );
  }
}