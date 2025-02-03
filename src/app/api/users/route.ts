import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/utils/dbconnect";
import User from "@/models/user";

// GET: Fetch users with pagination, searching, filtering, and sorting
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "";
    const sortField = searchParams.get("sortField") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const query: { fullName?: { $regex: string; $options: string }; role?: string } = {};
    if (search) {
      query.fullName = { $regex: search, $options: "i" };
    }
    if (role) {
      query.role = role;
    }

    const skip = (page - 1) * limit;
    const users = await User.find(query)
      .sort({ [sortField]: sortOrder === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(limit)
      .select("-password -__v");
    const total = await User.countDocuments(query);

    return NextResponse.json({
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    console.error("Error in GET /api/users:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// POST: Create a new user
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const data = await request.json();

    const user = await User.create({
      ...data,
      modifiedBy: "System",
      modifiedDate: new Date(),
    });

    return NextResponse.json(
      {
        message: "User created successfully",
        user,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Error in POST /api/users:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to create user" },
      { status: 500 }
    );
  }
}

// PUT: Update an existing user
export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    const data = await request.json();
    const { _id, ...updateData } = data;

    const user = await User.findByIdAndUpdate(
      _id,
      {
        ...updateData,
        modifiedBy: "System",
        modifiedDate: new Date(),
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "User updated successfully",
      user,
    });
  } catch (error: unknown) {
    console.error("Error in PUT /api/users:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to update user" },
      { status: 500 }
    );
  }
}

// DELETE: Remove a user
export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    const data = await request.json();
    const { _id } = data;

    if (!_id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const user = await User.findByIdAndDelete(_id);

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "User deleted successfully",
      success: true,
    });
  } catch (error: unknown) {
    console.error("Error in DELETE /api/users:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to delete user" },
      { status: 500 }
    );
  }
}
