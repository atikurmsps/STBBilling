import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Customer } from "@/models/Customer";
import { Transaction } from "@/models/Transaction";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth/config";

export async function GET() {
  await connectToDatabase();
  const customers = await Customer.find().populate("addedBy", "name").lean();
  const customerIds = customers.map((c: any) => c._id);
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
  const result = customers.map((c: any) => ({
    ...c,
    balance: idToBalance.get(String(c._id)) || 0,
  }));
  return NextResponse.json(result);
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


