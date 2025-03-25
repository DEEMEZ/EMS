import Transaction from "@/models/transaction";
import dbConnect from "@/utils/dbconnect";
import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "startDate and endDate are required" },
        { status: 400 }
      );
    }

    // Aggregate transactions by type
    const transactionAnalysis = await Transaction.aggregate([
      {
        $match: {
          userTokenId: userId,
          transactionDate: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        }
      },
      {
        $group: {
          _id: "$type",
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
          transactions: {
            $push: {
              _id: "$_id",
              amount: "$amount",
              transactionDate: "$transactionDate"
            }
          }
        }
      },
      {
        $project: {
          type: "$_id",
          totalAmount: 1,
          count: 1,
          transactions: 1,
          _id: 0
        }
      },
      {
        $sort: { totalAmount: -1 }
      }
    ]);

    return NextResponse.json(transactionAnalysis);
  } catch (error: unknown) {
    console.error("Error fetching transaction analysis:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch transaction analysis" },
      { status: 500 }
    );
  }
}