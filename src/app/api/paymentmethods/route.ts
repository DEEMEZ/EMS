import Paymentmethods from '@/models/paymentmethods';
import dbConnect from '@/utils/dbconnect';
import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    console.log('Database connected successfully');
    const token = await getToken({ req: request });

    console.log('Token:', token);
    console.log('Token ID:', token?.id, 'Token Sub:', token?.sub);

    if (!token?.id && !token?.sub) {
      console.log('No valid token found, returning empty response');
      return NextResponse.json({
        sources: [],
        pagination: { total: 0, page: 1, limit: 10, totalPages: 0 }
      });
    }

    const userId = token.id || token.sub;
    if (!userId) {
      console.log('userId is undefined, returning error response');
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 401 }
      );
    }

    console.log('Fetching payment methods for userId:', userId);

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const search = searchParams.get('search') || '';
    const forDropdown = searchParams.get('forDropdown') === 'true';

    if (forDropdown) {
      try {
        const paymentMethods = await Paymentmethods.find({ userId })
          .sort({ createdAt: -1 })
          .select('_id name');

        console.log('Payment Methods for Dropdown (before transform):', paymentMethods);
        const transformedPaymentMethods = paymentMethods.map(method => method.toJSON());
        console.log('Payment Methods for Dropdown (after transform):', transformedPaymentMethods);
        return NextResponse.json(transformedPaymentMethods);
      } catch (queryError) {
        console.error('Error querying payment methods:', queryError);
        return NextResponse.json(
          { error: 'Failed to query payment methods' },
          { status: 500 }
        );
      }
    }

    const query = search
      ? { userId, name: { $regex: search, $options: 'i' } }
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
    const token = await getToken({ req: request });

    if (!token?.id && !token?.sub) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = token.id || token.sub;
    if (!userId) {
      console.log('userId is undefined, returning error response');
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 401 }
      );
    }

    const data = await request.json();

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
    const token = await getToken({ req: request });

    if (!token?.id && !token?.sub) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = token.id || token.sub;
    if (!userId) {
      console.log('userId is undefined, returning error response');
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { _id, ...updateData } = data;

    const existingPaymentMethod = await Paymentmethods.findById(_id);

    if (!existingPaymentMethod) {
      return NextResponse.json(
        { error: 'Payment Method Not Found' },
        { status: 404 }
      );
    }

    if (existingPaymentMethod.userId && existingPaymentMethod.userId.toString() !== userId.toString()) {
      return NextResponse.json(
        { error: 'You do not have permission to modify this payment method' },
        { status: 403 }
      );
    }

    const updatedPaymentMethod = await Paymentmethods.findByIdAndUpdate(
      _id,
      {
        ...updateData,
        userId,
        modifiedBy: token.name || 'System',
        modifiedDate: new Date()
      },
      { new: true, runValidators: true }
    );

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
    const token = await getToken({ req: request });

    if (!token?.id && !token?.sub) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = token.id || token.sub;
    if (!userId) {
      console.log('userId is undefined, returning error response');
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { _id } = data;

    if (!_id) {
      return NextResponse.json(
        { error: 'Payment Method ID Is Required' },
        { status: 400 }
      );
    }

    const existingPaymentMethod = await Paymentmethods.findById(_id);

    if (!existingPaymentMethod) {
      return NextResponse.json(
        { error: 'Payment Method Not Found' },
        { status: 404 }
      );
    }

    if (existingPaymentMethod.userId && existingPaymentMethod.userId.toString() !== userId.toString()) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this payment method' },
        { status: 403 }
      );
    }

    await Paymentmethods.findByIdAndDelete(_id);

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