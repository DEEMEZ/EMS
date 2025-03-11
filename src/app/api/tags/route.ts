import Tags from '@/models/tags';
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

    const data = await request.json();
    const newTag = await Tags.create(data);

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

    const data = await request.json();
    const { _id, ...updateData } = data;

    const updatedTag = await Tags.findByIdAndUpdate(
      _id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedTag) {
      return NextResponse.json(
        { error: 'Tag Not Found' },
        { status: 404 }
      );
    }

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

    const data = await request.json();
    const { _id } = data;

    if (!_id) {
      return NextResponse.json(
        { error: 'Tag ID Is Required' },
        { status: 400 }
      );
    }

    const deletedTag = await Tags.findByIdAndDelete(_id);

    if (!deletedTag) {
      return NextResponse.json(
        { error: 'Tag Not Found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Tag Deleted Successfully' });
  } catch (error: unknown) {
    console.error('❌ Error in DELETE /api/tags:', error);
    return NextResponse.json(
      { error: 'Failed To Delete Tag' },
      { status: 500 }
    );
  }
}
