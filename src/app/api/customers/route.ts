import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Customer } from "@/models/Customer";
import { STB } from "@/models/STB";
import { Transaction } from "@/models/Transaction";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth/config";

export async function GET(req: Request) {
  await connectToDatabase();
  
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '25');
  const skip = (page - 1) * limit;
  
  // Get total count for pagination
  const totalCustomers = await Customer.countDocuments();
  const totalPages = Math.ceil(totalCustomers / limit);
  
  // Get customers with pagination, sorted by newest first
  const customers = await Customer.find()
    .populate("addedBy", "name")
    .sort({ createdAt: -1 }) // Newest first
    .skip(skip)
    .limit(limit)
    .lean();
    
  const customerIds = customers.map((c: any) => c._id);
  
  // STB counts per customer
  const stbAgg = await STB.aggregate([
    { $match: { customerId: { $in: customerIds } } },
    { $group: { _id: "$customerId", count: { $sum: 1 } } },
  ]);
  
  const txAgg = await Transaction.aggregate([
    { $match: { customerId: { $in: customerIds } } },
    {
      $group: {
        _id: "$customerId",
        balance: {
          $sum: "$amount",
        },
      },
    },
  ]);
  
  const idToBalance = new Map<string, number>();
  txAgg.forEach((a: any) => idToBalance.set(String(a._id), a.balance));
  const idToStbCount = new Map<string, number>();
  stbAgg.forEach((a: any) => idToStbCount.set(String(a._id), a.count));
  
  const result = customers.map((c: any) => ({
    ...c,
    balance: idToBalance.get(String(c._id)) || 0,
    totalSTB: idToStbCount.get(String(c._id)) || 0,
  }));
  
  return NextResponse.json({
    customers: result,
    pagination: {
      currentPage: page,
      totalPages,
      totalCustomers,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    }
  });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  await connectToDatabase();
  const created = await Customer.create({
    name: body.name,
    phone: body.phone,
    address: body.address,
    addedBy: session.user.id,
  });
  return NextResponse.json(created);
}


