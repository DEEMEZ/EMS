import ExpenseCategory from "@/models/expenseCategory";
import dbConnect from "@/utils/dbconnect";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from 'next-auth/jwt';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const token = await getToken({ req: request });
    
    // Return empty data for unauthenticated users
    if (!token?.id && !token?.sub) {
      return NextResponse.json({
        categories: [],
        pagination: { total: 0, page: 1, limit: 10, totalPages: 0 }
      });
    }
    
    const userId = token.id || token.sub;
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    
    // Build query with userId filter
    const query: any = { userId };
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const skip = (page - 1) * limit;
    const expenseCategories = await ExpenseCategory.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
      
    const total = await ExpenseCategory.countDocuments(query);
    console.log('GET - Using userId:', userId);
    console.log('GET - Query:', query);
    return NextResponse.json({
      categories: expenseCategories,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error: unknown) {
    console.error('Error in GET /api/expensecategories:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed To Fetch Expense Categories' },
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
    
    console.log('POST Request Data:', data);
    console.log('User ID from token:', userId);
    
    // Create with proper error handling and validation
    let category;
    try {
      category = await ExpenseCategory.create({
        name: data.name,
        description: data.description,
        userId: userId.toString()  // Explicitly set this
      });
      console.log('Category created:', category);
    } catch (createError) {
      console.error('Error creating category:', createError);
      // Return detailed error to help debugging
      return NextResponse.json({
        error: 'Failed to create category',
        details: (createError as Error).message
      }, { status: 500 });
    }
    console.log('POST - Using userId:', userId);
    // Double-check the category was created
    const savedCategory = await ExpenseCategory.findById(category._id);
    if (!savedCategory) {
      console.error('Category created but not found on verification check');
      return NextResponse.json({
        error: 'Category appeared to create but could not be verified'
      }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Expense Category Created Successfully',
      category: savedCategory
    }, { status: 201 });
  } catch (error: unknown) {
    console.error('Error in POST /api/expensecategories:', error);
    
    // Handle duplicate key error
    if ((error as any).code === 11000) {
      return NextResponse.json(
        { error: 'An expense category with this name already exists for your account' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: (error as Error).message || 'Failed To Create Expense Category' },
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

    // Find the category first to check ownership
    const existingCategory = await ExpenseCategory.findById(_id);
    
    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Expense Category Not Found' },
        { status: 404 }
      );
    }
    
    // Check if the category belongs to the current user
    if (existingCategory.userId && existingCategory.userId.toString() !== userId.toString()) {
      return NextResponse.json(
        { error: 'You do not have permission to modify this category' },
        { status: 403 }
      );
    }

    const category = await ExpenseCategory.findByIdAndUpdate(
      _id,
      {
        ...updateData,
        userId // Ensure userId is updated to current user
      },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      message: 'Expense Category Updated Successfully',
      category
    });
  } catch (error: unknown) {
    console.error('Error in PUT /api/expensecategories:', error);
    
    // Handle duplicate key error
    if ((error as any).code === 11000) {
      return NextResponse.json(
        { error: 'An expense category with this name already exists for your account' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: (error as Error).message || 'Failed To Update Expense Category' },
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
        { error: 'Expense Category ID Is Required' },
        { status: 400 }
      );
    }
    
    // Find the category first to check ownership
    const existingCategory = await ExpenseCategory.findById(_id);
    
    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Expense Category Not Found' },
        { status: 404 }
      );
    }
    
    // Check if the category belongs to the current user
    if (existingCategory.userId && existingCategory.userId.toString() !== userId.toString()) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this category' },
        { status: 403 }
      );
    }

    await ExpenseCategory.findByIdAndDelete(_id);
    
    return NextResponse.json({
      message: 'Expense Category Deleted Successfully',
      success: true
    });
  } catch (error: unknown) {
    console.error('Error in DELETE /api/expensecategories:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed To Delete Expense Category' },
      { status: 500 }
    );
  }
}