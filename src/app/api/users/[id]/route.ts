import { NextResponse, NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth/config";
import bcrypt from "bcryptjs";

export async function PUT(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { params } = context;
  await connectToDatabase();
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const updateData: any = { 
    name: body.name, 
    email: body.email, 
    role: body.role === "ADMIN" ? "ADMIN" : body.role === "INACTIVE" ? "INACTIVE" : "EDITOR" 
  };
  
  if (body.password) {
    updateData.password = await bcrypt.hash(body.password, 10);
  }
  
  const updated = await User.findByIdAndUpdate(
    params.id,
    updateData,
    { new: true }
  ).select("-password");
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  context: { params: { id: string } }
) {
  const { params } = context;
  await connectToDatabase();
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await User.findByIdAndDelete(params.id);
  return NextResponse.json({ ok: true });
}


