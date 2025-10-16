import { NextResponse, NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { STB } from "@/models/STB";
import { Transaction } from "@/models/Transaction";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth/config";

export async function PUT(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { params } = context;
  await connectToDatabase();
  const { id } = params;
  const body = await req.json();

  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (session.user.role === "EDITOR") {
    const stb = await STB.findById(id);
    if (stb && stb.addedBy.toString() !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const updated = await STB.findByIdAndUpdate(id, {
    stbId: body.stbId,
    customerCode: body.customerCode,
    amount: body.amount,
    note: body.note,
  });

  // Update associated transaction
  await Transaction.findOneAndUpdate(
    { stbId: id },
    {
      amount: -Math.abs(Number(body.amount || 0)),
      note: body.note || `STB ${body.stbId}`,
    }
  );

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  context: { params: { id: string } }
) {
  const { params } = context;
  await connectToDatabase();
  const { id } = params;

  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (session.user.role === "EDITOR") {
    const stb = await STB.findById(id);
    if (stb && stb.addedBy.toString() !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  await Transaction.deleteOne({ stbId: id });
  await STB.findByIdAndDelete(id);

  return NextResponse.json({ ok: true });
}
