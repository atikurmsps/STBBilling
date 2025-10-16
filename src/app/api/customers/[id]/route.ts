import { NextResponse, NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Customer } from "@/models/Customer";
import { STB } from "@/models/STB";
import { Transaction, ITransaction } from "@/models/Transaction";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth/config";

export async function GET(
  _req: NextRequest,
  context: { params: { id: string } }
) {
  const { params } = context;
  await connectToDatabase();
  const customer = await Customer.findById(params.id).lean();
  if (!customer) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const stbs = await STB.find({ customerId: params.id }).populate("addedBy", "name").lean();
  const transactions = await Transaction.find({ customerId: params.id })
    .sort({ createdAt: -1 })
    .populate("addedBy", "name")
    .lean();

  const balance = transactions.reduce((acc: number, t: ITransaction) => acc + (t.type === 'AddFund' ? t.amount : -t.amount), 0);
  return NextResponse.json({ customer, stbs, transactions, balance });
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
    const customer = await Customer.findById(id);
    if (customer && customer.addedBy.toString() !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  await Transaction.deleteMany({ customerId: id });
  await STB.deleteMany({ customerId: id });
  await Customer.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}

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
    const customer = await Customer.findById(id);
    if (customer && customer.addedBy.toString() !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const updated = await Customer.findByIdAndUpdate(id, {
    name: body.name,
    phone: body.phone,
    address: body.address,
  });
  return NextResponse.json(updated);
}


