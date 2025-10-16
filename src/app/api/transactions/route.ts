import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Transaction } from "@/models/Transaction";
import { Customer } from "@/models/Customer";

export async function GET() {
  await connectToDatabase();
  const txs = await Transaction.find().sort({ createdAt: -1 }).populate("addedBy", "name").lean();
  const customerIds = Array.from(new Set(txs.map((t: any) => String(t.customerId))));
  const customers = await Customer.find({ _id: { $in: customerIds } }).lean();
  const idToCustomer = new Map(customers.map((c: any) => [String(c._id), c]));
  const result = txs.map((t: any) => ({ ...t, customer: idToCustomer.get(String(t.customerId)) }));
  return NextResponse.json(result);
}


