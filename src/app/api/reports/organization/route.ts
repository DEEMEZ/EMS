import Organization from "@/models/organization";
import dbConnect from "@/utils/dbconnect";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const organizations = await Organization.find().select("name status modifiedDate");

    if (!organizations.length) {
      console.log("❌ No organizations found.");
      return NextResponse.json([]);
    }

    const statusCounts = organizations.reduce(
      (acc, org) => {
        acc[org.status] = (acc[org.status] || 0) + 1;
        return acc;
      },
      { Active: 0, Inactive: 0, Pending: 0 }
    );

    const organizationData = [
      { name: "Active", value: statusCounts.Active },
      { name: "Inactive", value: statusCounts.Inactive },
      { name: "Pending", value: statusCounts.Pending },
    ];

    return NextResponse.json(organizationData);
  } catch (error: unknown) {
    console.error("❌ Error fetching organization report:", error);
    return NextResponse.json({ error: "Failed to fetch organization report" }, { status: 500 });
  }
}
