import { NextResponse, NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Transaction } from "@/models/Transaction";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth/config";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectToDatabase();
  const { id } = params;
  const body = await req.json();

  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const transaction = await Transaction.findById(id);

  if (session.user.role === "EDITOR") {
    if (transaction && transaction.addedBy.toString() !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  if (transaction && transaction.type === "Charge" && transaction.stbId) {
    return NextResponse.json(
      { error: "Cannot edit a charge associated with an STB. Please edit the STB instead." },
      { status: 400 }
    );
  }

  const updated = await Transaction.findByIdAndUpdate(id, {
    amount: body.amount,
    note: body.note,
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectToDatabase();
  const { id } = params;

  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const transaction = await Transaction.findById(id);

  if (session.user.role === "EDITOR") {
    if (transaction && transaction.addedBy.toString() !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  if (transaction && transaction.type === "Charge" && transaction.stbId) {
    return NextResponse.json(
      { error: "Cannot delete a charge associated with an STB. Please delete the STB instead." },
      { status: 400 }
    );
  }

  await Transaction.findByIdAndDelete(id);

  return NextResponse.json({ ok: true });
}
