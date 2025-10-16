import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Customer, ICustomer } from "@/models/Customer";
import { Transaction } from "@/models/Transaction";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth/config";
import { Types } from "mongoose";

export async function GET() {
  await connectToDatabase();
  const customers = await Customer.find().populate("addedBy", "name").lean();
  const customerIds = customers.map((c: ICustomer & { _id: Types.ObjectId }) => c._id);
  const txAgg: { _id: Types.ObjectId, balance: number }[] = await Transaction.aggregate([
    { $match: { customerId: { $in: customerIds } } },
    {
      $group: {
        _id: "$customerId",
        balance: {
          $sum: {
            $cond: [
              { $eq: ["$type", "AddFund"] },
              "$amount",
              { $multiply: ["$amount", 1] },
            ],
          },
        },
      },
    },
  ]);
  const idToBalance = new Map<string, number>();
  txAgg.forEach((a) => idToBalance.set(String(a._id), a.balance));
  const result = customers.map((c) => ({
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


