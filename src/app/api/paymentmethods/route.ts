import Paymentmethods from '@/models/paymentmethods';
import dbConnect from '@/utils/dbconnect';
import { Types, isValidObjectId } from 'mongoose';
import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

interface TokenPayload {
  id?: string;
  sub?: string;
  name?: string;
  email?: string;
}

interface PaymentMethodDocument {
  _id: Types.ObjectId;
  userId: string;
  name: string;
  description?: string;
  modifiedBy?: string;
  modifiedDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// Helper function to ensure we have a valid user ID
function getValidUserId(token: TokenPayload): string {
  const userId = token.id || token.sub;
  if (!userId) {
    throw new Error('Authentication required');
  }
  return userId;
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const token = await getToken({ req: request }) as TokenPayload;

    if (!token?.id && !token?.sub) {
      return NextResponse.json({
        sources: [],
        pagination: { total: 0, page: 1, limit: 10, totalPages: 0 }
      });
    }

    const userId = getValidUserId(token);
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const search = searchParams.get('search') || '';

    const query = search
      ? { 
          userId,
          name: { $regex: search, $options: 'i' } 
        }
      : { userId };

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
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error in GET /api/paymentmethods:', error.message, error.stack);
      return NextResponse.json(
        { error: error.message || 'Failed To Fetch Payment Methods' },
        { status: error.message === 'Authentication required' ? 401 : 500 }
      );
    }
    console.error('Unexpected error in GET /api/paymentmethods:', error);
    return NextResponse.json(
      { error: 'Failed To Fetch Payment Methods' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const token = await getToken({ req: request }) as TokenPayload;
    const userId = getValidUserId(token);
    const data = await request.json();

    if (!data.name) {
      return NextResponse.json(
        { error: 'Payment method name is required' },
        { status: 400 }
      );
    }

    const newPaymentMethod = await Paymentmethods.create({
      ...data,
      userId,
      modifiedBy: token.name || 'System',
      modifiedDate: new Date()
    });

    return NextResponse.json(newPaymentMethod, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error in POST /api/paymentmethods:', error.message, error.stack);
      return NextResponse.json(
        { error: error.message || 'Failed To Create Payment Method' },
        { status: error.message === 'Authentication required' ? 401 : 500 }
      );
    }
    console.error('Unexpected error in POST /api/paymentmethods:', error);
    return NextResponse.json(
      { error: 'Failed To Create Payment Method' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    const token = await getToken({ req: request }) as TokenPayload;
    const userId = getValidUserId(token);
    const data = await request.json();
    const { _id, ...updateData } = data;

    if (!_id) {
      return NextResponse.json(
        { error: 'Payment Method ID is required' },
        { status: 400 }
      );
    }

    if (!isValidObjectId(_id)) {
      return NextResponse.json(
        { error: 'Invalid Payment Method ID' },
        { status: 400 }
      );
    }

    const existingPaymentMethod = await Paymentmethods.findById(_id).lean<PaymentMethodDocument>();

    if (!existingPaymentMethod) {
      return NextResponse.json(
        { error: 'Payment Method Not Found' },
        { status: 404 }
      );
    }

    if (existingPaymentMethod.userId !== userId) {
      return NextResponse.json(
        { error: 'You do not have permission to modify this payment method' },
        { status: 403 }
      );
    }

    const updatedPaymentMethod = await Paymentmethods.findByIdAndUpdate(
      _id,
      {
        ...updateData,
        modifiedBy: token.name || 'System',
        modifiedDate: new Date()
      },
      { new: true, runValidators: true }
    );

    return NextResponse.json(updatedPaymentMethod);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error in PUT /api/paymentmethods:', error.message, error.stack);
      return NextResponse.json(
        { error: error.message || 'Failed To Update Payment Method' },
        { status: error.message === 'Authentication required' ? 401 : 500 }
      );
    }
    console.error('Unexpected error in PUT /api/paymentmethods:', error);
    return NextResponse.json(
      { error: 'Failed To Update Payment Method' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    const token = await getToken({ req: request }) as TokenPayload;
    const userId = getValidUserId(token);
    const searchParams = request.nextUrl.searchParams;
    const _id = searchParams.get('id');

    if (!_id) {
      return NextResponse.json(
        { error: 'Payment Method ID is required' },
        { status: 400 }
      );
    }

    if (!isValidObjectId(_id)) {
      return NextResponse.json(
        { error: 'Invalid Payment Method ID' },
        { status: 400 }
      );
    }

    const existingPaymentMethod = await Paymentmethods.findById(_id).lean<PaymentMethodDocument>();

    if (!existingPaymentMethod) {
      return NextResponse.json(
        { error: 'Payment Method Not Found' },
        { status: 404 }
      );
    }

    if (existingPaymentMethod.userId !== userId) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this payment method' },
        { status: 403 }
      );
    }

    await Paymentmethods.findByIdAndDelete(_id);

    return NextResponse.json({ 
      success: true,
      message: 'Payment Method Deleted Successfully' 
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error in DELETE /api/paymentmethods:', error.message, error.stack);
      return NextResponse.json(
        { error: error.message || 'Failed To Delete Payment Method' },
        { status: error.message === 'Authentication required' ? 401 : 500 }
      );
    }
    console.error('Unexpected error in DELETE /api/paymentmethods:', error);
    return NextResponse.json(
      { error: 'Failed To Delete Payment Method' },
      { status: 500 }
    );
  }
}