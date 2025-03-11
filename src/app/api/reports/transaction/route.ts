/* eslint-disable @typescript-eslint/no-explicit-any */
import Transaction from "@/models/transaction";
import dbConnect from "@/utils/dbconnect";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const userId = searchParams.get("userId") || "";
    const type = searchParams.get("type") || "";

    if (!startDate || !endDate) {
      return NextResponse.json({ error: "startDate and endDate are required" }, { status: 400 });
    }

    console.log("🔎 Fetching Transactions From", startDate, "To", endDate);

    const query: any = {
      transactionDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    };

    if (userId) query.userId = userId;
    if (type) query.type = type;

    const transactions = await Transaction.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$type",
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
          transactions: { 
            $push: { _id: "$_id", amount: "$amount", transactionDate: "$transactionDate" } 
          }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);

    console.log("✅ Transaction Analysis Data:", transactions);
    return NextResponse.json(transactions);

  } catch (error: unknown) {
    console.error("❌ Error Fetching Transaction Analysis:", error);
    return NextResponse.json({ error: "Failed To Fetch Transaction Analysis" }, { status: 500 });
  }
}
