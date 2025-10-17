import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Settings } from "@/models/Settings";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth/config";
import { getSingleton } from "@/lib/settings";


export async function GET() {
  const doc = await getSingleton();
  if (!doc) {
    return NextResponse.json({ error: "Settings not found" }, { status: 404 });
  }
  const obj = doc.toObject();

  // Handle backward compatibility for smsApiUrl -> smsUrlTemplate
  if (!obj.smsUrlTemplate && obj.smsApiUrl) {
    obj.smsUrlTemplate = obj.smsApiUrl;
  }

  // Ensure nested objects exist to prevent client-side errors
  obj.smsFlags = obj.smsFlags || {};
  obj.smsTemplates = obj.smsTemplates || {};
  return NextResponse.json(obj);
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const doc = await getSingleton();
  if (!doc) {
     return NextResponse.json({ error: "Settings document could not be found or created." }, { status: 500 });
  }

  const body = await req.json();

  const updatePayload = {
    $set: {
      smsEnabled: body.smsEnabled,
      smsUrlTemplate: body.smsUrlTemplate,
      adminPhone: body.adminPhone,
      smsFlags: body.smsFlags,
      smsTemplates: body.smsTemplates,
      updatedAt: new Date(),
    },
    $unset: {
      smsApiUrl: "" // Ensure the old field is removed
    }
  };

  const updatedDoc = await Settings.findByIdAndUpdate(
    doc._id,
    updatePayload,
    { new: true, lean: true }
  );

  return NextResponse.json(updatedDoc);
}


