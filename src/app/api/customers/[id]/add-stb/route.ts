import { NextResponse, NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { STB } from "@/models/STB";
import { Transaction } from "@/models/Transaction";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth/config";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  await connectToDatabase();
  const stb = await STB.create({
    stbId: body.stbId,
    customerId: params.id,
    customerCode: body.customerCode,
    amount: body.amount,
    note: body.note,
    addedBy: session.user.id,
  });
  // Charge transaction (negative amount)
  await Transaction.create({
    customerId: params.id,
    stbId: stb._id,
    type: "Charge",
    amount: -Math.abs(Number(body.amount || 0)),
    note: body.note || `STB ${body.stbId}`,
    addedBy: session.user.id,
  });
  return NextResponse.json(stb);
}


