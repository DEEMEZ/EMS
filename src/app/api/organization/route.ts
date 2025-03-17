// src/app/api/organization/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/utils/dbconnect';
import Organization from '@/models/organization';
import { getToken } from 'next-auth/jwt';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    // Get the token to find the current user ID
    const token = await getToken({ req: request });
    
    if (!token?.id && !token?.sub) {
      return NextResponse.json({
        organizations: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0
        }
      });
    }
    
    const userId = token.id || token.sub;
    
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const sortField = searchParams.get('sortField') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build query with userId filter
    const query: any = { userId };
    
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
    console.error('Error in GET /api/organization:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to fetch organizations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    // Get the token to find the current user ID
    const token = await getToken({ req: request });
    
    if (!token?.id && !token?.sub) {
      return NextResponse.json(
        { error: 'You must be signed in to create an organization' },
        { status: 401 }
      );
    }
    
    const userId = token.id || token.sub;
    
    const data = await request.json();
    
    // Create organization with the current user ID
    const organization = await Organization.create({
      ...data,
      userId, // Add user ID
      modifiedBy: token.name || 'System',
      modifiedDate: new Date(),
      status: data.status || 'Active'
    });

    return NextResponse.json({
      message: 'Organization created successfully',
      organization
    }, { status: 201 });
  } catch (error: unknown) {
    console.error('Error in POST /api/organization:', error);
    
    // Handle duplicate organization name for this user
    if ((error as any).code === 11000) {
      return NextResponse.json(
        { error: 'An organization with this name already exists for your account' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: (error as Error).message || 'Failed to create organization' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    
    // Get the token to find the current user ID
    const token = await getToken({ req: request });
    
    if (!token?.id && !token?.sub) {
      return NextResponse.json(
        { error: 'You must be signed in to update an organization' },
        { status: 401 }
      );
    }
    
    const userId = token.id || token.sub;
    
    const data = await request.json();
    const { _id, ...updateData } = data;

    // Find the organization first to check ownership
    const existingOrg = await Organization.findById(_id);
    
    if (!existingOrg) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }
    
    // Check if the organization belongs to the current user
    if (existingOrg.userId && userId && existingOrg.userId.toString() !== userId.toString()) {
      return NextResponse.json(
        { error: 'You do not have permission to modify this organization' },
        { status: 403 }
      );
    }

    const organization = await Organization.findByIdAndUpdate(
      _id,
      {
        ...updateData,
        userId, // Ensure userId is updated to current user
        modifiedBy: token.name || 'System',
        modifiedDate: new Date()
      },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      message: 'Organization updated successfully',
      organization
    });
  } catch (error: unknown) {
    console.error('Error in PUT /api/organization:', error);
    
    // Handle duplicate organization name
    if ((error as any).code === 11000) {
      return NextResponse.json(
        { error: 'An organization with this name already exists for your account' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to update organization' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    
    // Get the token to find the current user ID
    const token = await getToken({ req: request });
    
    if (!token?.id && !token?.sub) {
      return NextResponse.json(
        { error: 'You must be signed in to delete an organization' },
        { status: 401 }
      );
    }
    
    const userId = token.id || token.sub;
    
    const data = await request.json();
    const { _id } = data;

    if (!_id) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      );
    }
    
    // Find the organization first to check ownership
    const existingOrg = await Organization.findById(_id);
    
    if (!existingOrg) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }
    
    // Check if the organization belongs to the current user
    if (existingOrg.userId && userId && existingOrg.userId.toString() !== userId.toString()) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this organization' },
        { status: 403 }
      );
    }

    await Organization.findByIdAndDelete(_id);
    
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