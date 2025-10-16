import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST() {
  await connectToDatabase();
  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@example.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "admin123";

  const existing = await User.findOne({ email: adminEmail });
  if (existing) {
    return NextResponse.json({ ok: true, created: false, email: adminEmail });
  }

  const passwordHash = await bcrypt.hash(adminPassword, 10);
  await User.create({
    name: "Admin",
    email: adminEmail,
    password: passwordHash,
    role: "ADMIN",
  });

  return NextResponse.json({ ok: true, created: true, email: adminEmail });
}


