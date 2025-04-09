/* eslint-disable @typescript-eslint/no-explicit-any */
import Product from '@/models/product';
import dbConnect from '@/utils/dbconnect';
import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

interface TokenPayload {
  id?: string;
  sub?: string;
  name?: string;
  email?: string;
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
        products: [],
        pagination: { total: 0, page: 1, limit: 10, totalPages: 0 }
      });
    }

    const userId = getValidUserId(token);
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const sortField = searchParams.get('sortField') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build query with userId filter
    const query: any = { userId };
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    if (category) {
      query.category = category;
    }

    const skip = (page - 1) * limit;
    const products = await Product.find(query)
      .sort({ [sortField]: sortOrder === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v');

    const total = await Product.countDocuments(query);

    return NextResponse.json({
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error in GET /api/products:', error.message, error.stack);
      return NextResponse.json(
        { error: error.message || 'Failed to fetch products' },
        { status: error.message === 'Authentication required' ? 401 : 500 }
      );
    }
    console.error('Unexpected error in GET /api/products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
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

    // Validate required fields
    if (!data.name || !data.quantity || !data.price || !data.category) {
      return NextResponse.json(
        { error: 'All fields (name, quantity, price, category) are required' },
        { status: 400 }
      );
    }

    // Validate numeric fields
    if (isNaN(data.quantity)) {
      return NextResponse.json(
        { error: 'Quantity must be a number' },
        { status: 400 }
      );
    }

    if (isNaN(data.price)) {
      return NextResponse.json(
        { error: 'Price must be a number' },
        { status: 400 }
      );
    }

    const newProduct = await Product.create({
      ...data,
      userId,
      modifiedBy: token.name || 'System',
      modifiedDate: new Date()
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error in POST /api/products:', error.message, error.stack);
      
      if (error.message.includes('duplicate key error')) {
        return NextResponse.json(
          { error: 'A product with this name already exists for your account' },
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { error: error.message || 'Failed to create product' },
        { status: error.message === 'Authentication required' ? 401 : 500 }
      );
    }
    console.error('Unexpected error in POST /api/products:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
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
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Validate numeric fields if they exist in update
    if (updateData.quantity && isNaN(updateData.quantity)) {
      return NextResponse.json(
        { error: 'Quantity must be a number' },
        { status: 400 }
      );
    }

    if (updateData.price && isNaN(updateData.price)) {
      return NextResponse.json(
        { error: 'Price must be a number' },
        { status: 400 }
      );
    }

    // Find the product first to check ownership
    const existingProduct = await Product.findById(_id);

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    if (existingProduct.userId.toString() !== userId) {
      return NextResponse.json(
        { error: 'You do not have permission to modify this product' },
        { status: 403 }
      );
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      _id,
      {
        ...updateData,
        modifiedBy: token.name || 'System',
        modifiedDate: new Date()
      },
      { new: true, runValidators: true }
    );

    return NextResponse.json(updatedProduct);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error in PUT /api/products:', error.message, error.stack);
      
      if (error.message.includes('duplicate key error')) {
        return NextResponse.json(
          { error: 'A product with this name already exists for your account' },
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { error: error.message || 'Failed to update product' },
        { status: error.message === 'Authentication required' ? 401 : 500 }
      );
    }
    console.error('Unexpected error in PUT /api/products:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    const token = await getToken({ req: request }) as TokenPayload;
    const userId = getValidUserId(token);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Find the product first to check ownership
    const existingProduct = await Product.findById(id);

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    if (existingProduct.userId.toString() !== userId) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this product' },
        { status: 403 }
      );
    }

    await Product.findByIdAndDelete(id);

    return NextResponse.json({ 
      success: true,
      message: 'Product deleted successfully' 
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error in DELETE /api/products:', error.message, error.stack);
      return NextResponse.json(
        { error: error.message || 'Failed to delete product' },
        { status: error.message === 'Authentication required' ? 401 : 500 }
      );
    }
    console.error('Unexpected error in DELETE /api/products:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}