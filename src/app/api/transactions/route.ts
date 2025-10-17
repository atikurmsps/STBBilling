import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Transaction } from "@/models/Transaction";
import { Customer } from "@/models/Customer";

export async function GET(req: Request) {
  await connectToDatabase();
  
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '25');
  const skip = (page - 1) * limit;
  
  // Get total count for pagination
  const totalTransactions = await Transaction.countDocuments();
  const totalPages = Math.ceil(totalTransactions / limit);
  
  // Get transactions with pagination, sorted by newest first
  const txs = await Transaction.find()
    .sort({ createdAt: -1 })
    .populate("addedBy", "name")
    .skip(skip)
    .limit(limit)
    .lean();
    
  const customerIds = Array.from(new Set(txs.map((t: any) => String(t.customerId))));
  const customers = await Customer.find({ _id: { $in: customerIds } }).lean();
  const idToCustomer = new Map(customers.map((c: any) => [String(c._id), c]));
  
  const result = txs.map((t: any) => {
    const customer = idToCustomer.get(String(t.customerId));
    return { ...t, customer: customer ? { _id: customer._id, name: customer.name } : undefined };
  });
  
  return NextResponse.json({
    transactions: result,
    pagination: {
      currentPage: page,
      totalPages,
      totalTransactions,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    }
  });
}


