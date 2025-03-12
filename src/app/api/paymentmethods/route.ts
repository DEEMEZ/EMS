import Paymentmethods from '@/models/paymentmethods';
import dbConnect from '@/utils/dbconnect';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const search = searchParams.get('search') || '';

    const query = search
      ? { name: { $regex: search, $options: 'i' } }
      : {};

    const skip = (page - 1) * limit;

    const paymentMethods = await Paymentmethods.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Paymentmethods.countDocuments(query);

    return NextResponse.json({
      sources: paymentMethods,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error in GET /api/paymentmethods:', error.message, error.stack);
    } else {
      console.error('Unexpected error in GET /api/paymentmethods:', error);
    }
    return NextResponse.json(
      { error: 'Failed To Fetch Payment Methods' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const data = await request.json();

    const newPaymentMethod = await Paymentmethods.create(data);

    return NextResponse.json(newPaymentMethod, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error in POST /api/paymentmethods:', error.message, error.stack);
    } else {
      console.error('Unexpected error in POST /api/paymentmethods:', error);
    }
    return NextResponse.json(
      { error: 'Failed To Create Payment Method' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();

    const data = await request.json();
    const { _id, ...updateData } = data;

    const updatedPaymentMethod = await Paymentmethods.findByIdAndUpdate(
      _id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedPaymentMethod) {
      return NextResponse.json(
        { error: 'Payment Method Not Found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedPaymentMethod);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error in PUT /api/paymentmethods:', error.message, error.stack);
    } else {
      console.error('Unexpected error in PUT /api/paymentmethods:', error);
    }
    return NextResponse.json(
      { error: 'Failed To Update Payment Method' },
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
        { error: 'Payment Method ID Is Required' },
        { status: 400 }
      );
    }

    const deletedPaymentMethod = await Paymentmethods.findByIdAndDelete(_id);

    if (!deletedPaymentMethod) {
      return NextResponse.json(
        { error: 'Payment Method Not Found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Payment Method Deleted Successfully' });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error in DELETE /api/paymentmethods:', error.message, error.stack);
    } else {
      console.error('Unexpected error in DELETE /api/paymentmethods:', error);
    }
    return NextResponse.json(
      { error: 'Failed To Delete Payment Method' },
      { status: 500 }
    );
  }
}
