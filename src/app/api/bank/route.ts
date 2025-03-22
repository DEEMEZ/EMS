/* eslint-disable @typescript-eslint/no-explicit-any */
import Bank from '@/models/bank';
import dbConnect from '@/utils/dbconnect';
import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const token = await getToken({ req: request });
    
    if (!token?.id && !token?.sub) {
      return NextResponse.json({
        banks: [],
        pagination: { total: 0, page: 1, limit: 10, totalPages: 0 }
      });
    }
    
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const sortField = searchParams.get('sortField') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const userId = token.id || token.sub;
    
    // Build query with userId filter
    const query: any = { userId };
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;
    const banks = await Bank.find(query)
      .sort({ [sortField]: sortOrder === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v'); 
      
    const total = await Bank.countDocuments(query);

    return NextResponse.json({
      banks,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error: unknown) {
    console.error('Error in GET /api/banks:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed To Fetch Banks' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const token = await getToken({ req: request });
    
    if (!token?.id && !token?.sub) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const userId = token.id || token.sub;
    const data = await request.json();
    
    // Add userId to the bank data
    const bank = await Bank.create({
      ...data,
      userId, // Add the userId field
      modifiedBy: token.name || 'System', 
      modifiedDate: new Date()
    });

    return NextResponse.json({
      message: 'Bank Created Successfully',
      bank
    }, { status: 201 });
  } catch (error: unknown) {
    console.error('Error in POST /api/banks:', error);
    
    // Handle duplicate key error
    if ((error as any).code === 11000) {
      return NextResponse.json(
        { error: 'A bank with this name already exists for your account' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: (error as Error).message || 'Failed To Create Bank' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
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

    // Find the bank first to check ownership
    const existingBank = await Bank.findById(_id);
    
    if (!existingBank) {
      return NextResponse.json(
        { error: 'Bank Not Found' },
        { status: 404 }
      );
    }
    
    // Check if the bank belongs to the current user
    if (existingBank.userId && existingBank.userId.toString() !== userId.toString()) {
      return NextResponse.json(
        { error: 'You do not have permission to modify this bank' },
        { status: 403 }
      );
    }

    const bank = await Bank.findByIdAndUpdate(
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
      message: 'Bank Updated Successfully',
      bank
    });
  } catch (error: unknown) {
    console.error('Error in PUT /api/banks:', error);
    
    // Handle duplicate key error
    if ((error as any).code === 11000) {
      return NextResponse.json(
        { error: 'A bank with this name already exists for your account' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: (error as Error).message || 'Failed To Update Bank' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
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
        { error: 'Bank ID Is Required' },
        { status: 400 }
      );
    }
    
    // Find the bank first to check ownership
    const existingBank = await Bank.findById(_id);
    
    if (!existingBank) {
      return NextResponse.json(
        { error: 'Bank Not Found' },
        { status: 404 }
      );
    }
    
    // Check if the bank belongs to the current user
    if (existingBank.userId && existingBank.userId.toString() !== userId.toString()) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this bank' },
        { status: 403 }
      );
    }

    await Bank.findByIdAndDelete(_id);
    
    return NextResponse.json({
      message: 'Bank Deleted Successfully',
      success: true
    });
  } catch (error: unknown) {
    console.error('Error in DELETE /api/banks:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed To Delete Bank' },
      { status: 500 }
    );
  }
}