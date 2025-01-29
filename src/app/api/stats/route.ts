import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbconnect";
import Product from "@/models/product"; // Import your Product model

export async function GET() {
  try {
    await dbConnect(); // Connect to MongoDB

    // Fetch stats from MongoDB
    const totalProducts = await Product.countDocuments();
    const totalInventoryValue = await Product.aggregate([
      { $group: { _id: null, total: { $sum: { $multiply: ["$price", "$quantity"] } } } },
    ]);
    const averagePrice = await Product.aggregate([
      { $group: { _id: null, avgPrice: { $avg: "$price" } } },
    ]);
    const uniqueCategories = await Product.distinct("category");
    const productsAddedByMonth = await Product.aggregate([
        {
          $group: {
            _id: { $month: "$createdAt" },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);
      

      return NextResponse.json({
        totalProducts,
        totalInventoryValue: totalInventoryValue[0]?.total || 0,
        averagePrice: averagePrice[0]?.avgPrice || 0,
        uniqueCategories: uniqueCategories.length,
        productsAddedByMonth,
      });
      
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json({ error: "Error fetching stats" }, { status: 500 });
  }
}
