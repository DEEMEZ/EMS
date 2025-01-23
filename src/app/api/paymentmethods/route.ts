import Paymentmethods from '@/models/paymentmethods';
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

    const Paymentmethods = await Paymentmethod.find(query)
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit);


    const total = await Paymentmethods.countDocuments(query);

    return NextResponse.json({
      sources: Paymentmethods,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error in GET /api/paymentmethods:', error);
    return NextResponse.json({ error: 'Failed to fetch payment methods' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const data = await request.json();

    const newPaymentmethod = await Paymentmethods.create(data);

    return NextResponse.json(newPaymentmethod, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/paymentmethods:', error);
    return NextResponse.json({ error: 'Failed to create payment methods' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    const data = await request.json();
    const { _id, ...updateData } = data;

    const updatedPaymentmethods = await Paymentmethods.findByIdAndUpdate(
      _id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedPaymentmethods) {
      return NextResponse.json({ error: 'Payment methods not found' }, { status: 404 });
    }

    return NextResponse.json(updatedPaymentmethods);
  } catch (error) {
    console.error('Error in PUT /api/paymentmethods:', error);
    return NextResponse.json({ error: 'Failed to update payment methods' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    const data = await request.json();
    const { _id } = data;

    if (!_id) {
      return NextResponse.json({ error: 'Payment methods ID is required' }, { status: 400 });
    }

    const deletedPaymentmethods = await Paymentmethods.findByIdAndDelete(_id);

    if (!deletedPaymentmethods) {
      return NextResponse.json({ error: 'Payment methods not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Payment methods deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/paymentmethods:', error);
    return NextResponse.json({ error: 'Failed to delete payment methods' }, { status: 500 });
  }
}
