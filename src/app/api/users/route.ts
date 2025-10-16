import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import bcrypt from "bcrypt";

export async function GET() {
  await connectToDatabase();
  const users = await User.find({}, { password: 0 }).lean();
  return NextResponse.json(users);
}

export async function POST(req: Request) {
  await connectToDatabase();
  const body = await req.json();
  const passwordHash = await bcrypt.hash(body.password, 10);
  const created = await User.create({
    name: body.name,
    email: body.email,
    password: passwordHash,
    role: body.role === "ADMIN" ? "ADMIN" : "EDITOR",
  });
  return NextResponse.json({
    _id: created._id,
    name: created.name,
    email: created.email,
    role: created.role,
    createdAt: created.createdAt,
  });
}


