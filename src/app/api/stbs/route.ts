import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { STB } from "@/models/STB";
import { Customer } from "@/models/Customer";

export async function GET() {
  await connectToDatabase();
  const stbs = await STB.find().sort({ createdAt: -1 }).populate("addedBy", "name").lean();
  const customerIds = Array.from(new Set(stbs.map((s: any) => String(s.customerId))));
  const customers = await Customer.find({ _id: { $in: customerIds } }).lean();
  const idToCustomer = new Map(customers.map((c: any) => [String(c._id), c]));
  const result = stbs.map((s: any) => ({ ...s, customer: idToCustomer.get(String(s.customerId)) }));
  return NextResponse.json(result);
}


