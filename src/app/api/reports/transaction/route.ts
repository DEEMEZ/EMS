/* eslint-disable @typescript-eslint/no-explicit-any */
import Transaction from "@/models/transaction";
import dbConnect from "@/utils/dbconnect";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Verify authentication
    const token = await getToken({ req: request });
    if (!token?.id && !token?.sub) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const userId = token.id || token.sub; // Extract userId from the token

    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const type = searchParams.get("type") || "";

    // Validate startDate and endDate
    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "startDate and endDate are required query parameters" },
        { status: 400 }
      );
    }

    // Parse dates and validate
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);

    if (isNaN(startDateObj.getTime())) {
      return NextResponse.json(
        { error: "Invalid startDate format. Please use a valid date string." },
        { status: 400 }
      );
    }

    if (isNaN(endDateObj.getTime())) {
      return NextResponse.json(
        { error: "Invalid endDate format. Please use a valid date string." },
        { status: 400 }
      );
    }

    if (startDateObj > endDateObj) {
      return NextResponse.json(
        { error: "startDate must be before or equal to endDate" },
        { status: 400 }
      );
    }

    console.log("🔎 Fetching Transactions From", startDate, "To", endDate);

    const query: any = {
      transactionDate: {
        $gte: startDateObj,
        $lte: endDateObj,
      },
      userId, // Ensure only transactions for the authenticated user are fetched
    };

    if (type) query.type = type;

    console.log("Query:", query); // Log the query being executed

    const transactions = await Transaction.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$type",
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
          transactions: {
            $push: { _id: "$_id", amount: "$amount", transactionDate: "$transactionDate" },
          },
        },
      },
      { $sort: { totalAmount: -1 } },
    ]);

    console.log("✅ Transaction Analysis Data:", transactions);
    return NextResponse.json(transactions);
  } catch (error: unknown) {
    console.error("❌ Error Fetching Transaction Analysis:", error);
    return NextResponse.json(
      { error: "Failed To Fetch Transaction Analysis" },
      { status: 500 }
    );
  }
}