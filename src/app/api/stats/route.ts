import Product from '@/models/product';
import dbConnect from '@/utils/dbconnect';
import mongoose from 'mongoose';
import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

interface TokenPayload {
  id?: string;
  sub?: string;
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const token = await getToken({ req: request }) as TokenPayload;

    // If no user is authenticated, return empty stats
    if (!token?.id && !token?.sub) {
      return NextResponse.json({
        totalProducts: 0,
        totalInventoryValue: 0,
        averagePrice: 0,
        uniqueCategories: 0,
      });
    }

    const userId = token.id || token.sub;

    // Get all stats in a single aggregation pipeline for efficiency
    const stats = await Product.aggregate([
      // Match only products for this user
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      
      // Calculate inventory value for each product
      { $addFields: { productValue: { $multiply: ["$price", "$quantity"] } } },
      
      // Group to calculate all stats
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalInventoryValue: { $sum: "$productValue" },
          averagePrice: { $avg: "$price" },
          categories: { $addToSet: "$category" }
        }
      },
      
      // Project to format the output
      {
        $project: {
          _id: 0,
          totalProducts: 1,
          totalInventoryValue: { $round: ["$totalInventoryValue", 2] },
          averagePrice: { $round: ["$averagePrice", 2] },
          uniqueCategories: { $size: "$categories" }
        }
      }
    ]);

    // If no products exist, return default values
    if (stats.length === 0) {
      return NextResponse.json({
        totalProducts: 0,
        totalInventoryValue: 0,
        averagePrice: 0,
        uniqueCategories: 0,
      });
    }

    return NextResponse.json(stats[0]);
  } catch (error: unknown) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      {
        totalProducts: 0,
        totalInventoryValue: 0,
        averagePrice: 0,
        uniqueCategories: 0,
      },
      { status: 500 }
    );
  }
}