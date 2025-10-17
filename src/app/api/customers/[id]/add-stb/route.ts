import { NextResponse, NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { STB } from "@/models/STB";
import { Transaction } from "@/models/Transaction";
import { Customer } from "@/models/Customer";
import { Settings } from "@/models/Settings";
import { sendSmsTo } from "@/lib/sms";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth/config";

export async function POST(req: NextRequest, context: { params: { id: string } }) {
  const { params } = context;
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
  // SMS notifications (best-effort)
  try {
    const settings = await Settings.findOne().lean();
    if (settings?.smsEnabled) {
      const amountStr = Number(body.amount || 0).toFixed(2);
      const customerDoc = await Customer.findById(params.id).lean();
      const customerPhone = customerDoc?.phone;
      const customerMsg = (settings.smsTemplates?.addStbCustomer || `A new STB has been added. Charge: [AMOUNT].`)
        .replaceAll('[AMOUNT]', amountStr)
        .replaceAll('[CUSTOMER_NAME]', customerDoc?.name || '')
        .replaceAll('[STB_ID]', body.stbId || '')
        .replaceAll('[ADDED_BY]', session.user.name || '');
      const adminMsg = (settings.smsTemplates?.addStbAdmin || `STB Added: [STB_ID] for [CUSTOMER_NAME] by [ADDED_BY]. Charge: [AMOUNT].`)
        .replaceAll('[AMOUNT]', amountStr)
        .replaceAll('[CUSTOMER_NAME]', customerDoc?.name || '')
        .replaceAll('[STB_ID]', body.stbId || '')
        .replaceAll('[ADDED_BY]', session.user.name || '');
      
      // Send SMS to customer
      if (settings.smsFlags?.sendAddStbCustomer && customerPhone) {
        console.log(`Sending AddSTB SMS to customer: ${customerPhone}`);
        const customerSmsResult = await sendSmsTo("", customerPhone, customerMsg);
        console.log("Customer SMS Result:", customerSmsResult);
      }
      
      // Send SMS to admin
      if (settings.smsFlags?.sendAddStbAdmin && settings.adminPhone) {
        console.log(`Sending AddSTB SMS to admin: ${settings.adminPhone}`);
        const adminSmsResult = await sendSmsTo(settings.adminPhone, "", adminMsg);
        console.log("Admin SMS Result:", adminSmsResult);
      }
    }
  } catch (error) {
    console.error("SMS notification error:", error);
  }
  return NextResponse.json(stb);
}



