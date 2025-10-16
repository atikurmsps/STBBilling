import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { STB, ISTB } from "@/models/STB";
import { Customer, ICustomer } from "@/models/Customer";
import { Types } from "mongoose";

export async function GET() {
  await connectToDatabase();
  const stbs = await STB.find().sort({ createdAt: -1 }).populate("addedBy", "name").lean();
  const customerIds = Array.from(new Set(stbs.map((s: ISTB) => String(s.customerId))));
  const customers = await Customer.find({ _id: { $in: customerIds } }).lean();
  const idToCustomer = new Map(customers.map((c: ICustomer & {_id: Types.ObjectId}) => [String(c._id), c]));
  const result = stbs.map((s) => ({ ...s, customer: idToCustomer.get(String(s.customerId)) }));
  return NextResponse.json(result);
}


