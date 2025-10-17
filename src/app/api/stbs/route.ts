import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { STB } from "@/models/STB";
import { Customer } from "@/models/Customer";

export async function GET(req: Request) {
  await connectToDatabase();
  
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '25');
  const skip = (page - 1) * limit;
  
  // Get total count for pagination
  const totalSTBs = await STB.countDocuments();
  const totalPages = Math.ceil(totalSTBs / limit);
  
  // Get STBs with pagination, sorted by newest first
  const stbs = await STB.find()
    .sort({ createdAt: -1 })
    .populate("addedBy", "name")
    .skip(skip)
    .limit(limit)
    .lean();
    
  const customerIds = Array.from(new Set(stbs.map((s: any) => String(s.customerId))));
  const customers = await Customer.find({ _id: { $in: customerIds } }).lean();
  const idToCustomer = new Map(customers.map((c: any) => [String(c._id), c]));
  
  const result = stbs.map((s: any) => ({ ...s, customer: idToCustomer.get(String(s.customerId)) }));
  
  return NextResponse.json({
    stbs: result,
    pagination: {
      currentPage: page,
      totalPages,
      totalSTBs,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    }
  });
}


