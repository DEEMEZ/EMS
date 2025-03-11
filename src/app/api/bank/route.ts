import Bank from '@/models/bank';
import dbConnect from '@/utils/dbconnect';
import { NextRequest, NextResponse } from 'next/server';

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

    const query: { name?: { $regex: string, $options: string }, status?: string } = {};
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
    const data = await request.json();

    const bank = await Bank.create({
      ...data,
      modifiedBy: 'System', 
      modifiedDate: new Date(),
      status: data.status || 'Active'
    });

    return NextResponse.json({
      message: 'Bank Created Successfully',
      bank
    }, { status: 201 });
  } catch (error: unknown) {
    console.error('Error in POST /api/banks:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed To Create Bank' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    const data = await request.json();
    const { _id, ...updateData } = data;

    const bank = await Bank.findByIdAndUpdate(
      _id,
      {
        ...updateData,
        modifiedBy: 'System',
        modifiedDate: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!bank) {
      return NextResponse.json(
        { error: 'Bank Not Found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Bank Updated Successfully',
      bank
    });
  } catch (error: unknown) {
    console.error('Error in PUT /api/banks:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed To Update Bank' },
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
        { error: 'Bank ID Is Required' },
        { status: 400 }
      );
    }

    const bank = await Bank.findByIdAndDelete(_id);

    if (!bank) {
      return NextResponse.json(
        { error: 'Bank Not Found' },
        { status: 404 }
      );
    }

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
