import { NextResponse, NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Transaction } from "@/models/Transaction";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth/config";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  await connectToDatabase();
  const tx = await Transaction.create({
    customerId: params.id,
    type: "AddFund",
    amount: Math.abs(Number(body.amount || 0)),
    note: body.note,
    addedBy: session.user.id,
  });
  return NextResponse.json(tx);
}


