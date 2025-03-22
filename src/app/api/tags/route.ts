import Tags from '@/models/tags';
import dbConnect from '@/utils/dbconnect';
import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Verify authentication
    const token = await getToken({ req: request });
    if (!token?.id && !token?.sub) {
      return NextResponse.json({
        tags: [],
        pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
      });
    }

    const userId = token.id || token.sub;

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const search = searchParams.get('search') || '';

    // Build query with userId filter
    const query: any = { userId };
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const skip = (page - 1) * limit;

    const tags = await Tags.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Tags.countDocuments(query);

    return NextResponse.json({
      tags,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    console.error('❌ Error in GET /api/tags:', error);
    return NextResponse.json(
      { error: 'Failed To Fetch Tags' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // Verify authentication
    const token = await getToken({ req: request });
    if (!token?.id && !token?.sub) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = token.id || token.sub;
    const data = await request.json();

    // Add userId to the tag data
    const newTag = await Tags.create({
      ...data,
      userId,
      modifiedBy: token.name || 'System',
      modifiedDate: new Date(),
    });

    return NextResponse.json(newTag, { status: 201 });
  } catch (error: unknown) {
    console.error('❌ Error in POST /api/tags:', error);
    return NextResponse.json(
      { error: 'Failed To Create Tag' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();

    // Verify authentication
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

    // Find the tag first to check ownership
    const existingTag = await Tags.findById(_id);
    if (!existingTag) {
      return NextResponse.json(
        { error: 'Tag Not Found' },
        { status: 404 }
      );
    }

    // Check if the tag belongs to the current user
    if (existingTag.userId && existingTag.userId.toString() !== userId.toString()) {
      return NextResponse.json(
        { error: 'You do not have permission to modify this tag' },
        { status: 403 }
      );
    }

    const updatedTag = await Tags.findByIdAndUpdate(
      _id,
      {
        ...updateData,
        userId, // Ensure userId is updated to current user
        modifiedBy: token.name || 'System',
        modifiedDate: new Date(),
      },
      { new: true, runValidators: true }
    );

    return NextResponse.json(updatedTag);
  } catch (error: unknown) {
    console.error('❌ Error in PUT /api/tags:', error);
    return NextResponse.json(
      { error: 'Failed To Update Tag' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();

    // Verify authentication
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
        { error: 'Tag ID Is Required' },
        { status: 400 }
      );
    }

    // Find the tag first to check ownership
    const existingTag = await Tags.findById(_id);
    if (!existingTag) {
      return NextResponse.json(
        { error: 'Tag Not Found' },
        { status: 404 }
      );
    }

    // Check if the tag belongs to the current user
    if (existingTag.userId && existingTag.userId.toString() !== userId.toString()) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this tag' },
        { status: 403 }
      );
    }

    const deletedTag = await Tags.findByIdAndDelete(_id);

    return NextResponse.json({ message: 'Tag Deleted Successfully' });
  } catch (error: unknown) {
    console.error('❌ Error in DELETE /api/tags:', error);
    return NextResponse.json(
      { error: 'Failed To Delete Tag' },
      { status: 500 }
    );
  }
}