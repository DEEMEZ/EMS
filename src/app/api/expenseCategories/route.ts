import ExpenseCategory from "@/models/expenseCategory";
import dbConnect from "@/utils/dbconnect";
import { NextRequest, NextResponse } from "next/server";

// GET: Fetch expense categories with pagination, filtering, and sorting
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const sortField = searchParams.get("sortField") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const query: { name?: { $regex: string; $options: string }; status?: string } = {};
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;
    const categories = await ExpenseCategory.find(query)
      .sort({ [sortField]: sortOrder === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(limit)
      .select("-__v");
    const total = await ExpenseCategory.countDocuments(query);

    return NextResponse.json({
      categories,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    console.error("Error in GET /api/expensecategories:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to fetch expense categories" },
      { status: 500 }
    );
  }
}

// POST: Create a new expense category
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const data = await request.json();

    const category = await ExpenseCategory.create({
      ...data,
      modifiedBy: "System",
      modifiedDate: new Date(),
      status: data.status || "Active",
    });

    return NextResponse.json(
      {
        message: "Expense category created successfully",
        category,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Error in POST /api/expensecategories:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to create expense category" },
      { status: 500 }
    );
  }
}

// PUT: Update an existing expense category
export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    const data = await request.json();
    const { _id, ...updateData } = data;

    const category = await ExpenseCategory.findByIdAndUpdate(
      _id,
      {
        ...updateData,
        modifiedBy: "System",
        modifiedDate: new Date(),
      },
      { new: true, runValidators: true }
    );

    if (!category) {
      return NextResponse.json(
        { error: "Expense category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Expense category updated successfully",
      category,
    });
  } catch (error: unknown) {
    console.error("Error in PUT /api/expensecategories:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to update expense category" },
      { status: 500 }
    );
  }
}

// DELETE: Remove an expense category
export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    const data = await request.json();
    const { _id } = data;

    if (!_id) {
      return NextResponse.json(
        { error: "Expense category ID is required" },
        { status: 400 }
      );
    }

    const category = await ExpenseCategory.findByIdAndDelete(_id);

    if (!category) {
      return NextResponse.json(
        { error: "Expense category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Expense category deleted successfully",
      success: true,
    });
  } catch (error: unknown) {
    console.error("Error in DELETE /api/expensecategories:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to delete expense category" },
      { status: 500 }
    );
  }
}
