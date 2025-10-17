import { NextResponse, NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Transaction } from "@/models/Transaction";
import { Customer } from "@/models/Customer";
import { getSingleton } from "@/lib/settings";
import { sendSmsTo } from "@/lib/sms";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth/config";

export async function POST(req: NextRequest, context: { params: { id: string } }) {
  const { params } = context;
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
  // SMS notifications (best-effort, non-blocking)
  try {
    const settings = await getSingleton();
    if (settings?.smsEnabled) {
      const amountStr = Number(body.amount || 0).toFixed(2);
      const customerDoc = await Customer.findById(params.id).lean() as any;
      const customerPhone = customerDoc?.phone;
      const customerMsg = (settings.smsTemplates?.addFundCustomer || `Your account has been credited with [AMOUNT]. Thank you.`)
        .replaceAll('[AMOUNT]', amountStr)
        .replaceAll('[CUSTOMER_NAME]', customerDoc?.name || '')
        .replaceAll('[ADDED_BY]', session.user.name || '');
      const adminMsg = (settings.smsTemplates?.addFundAdmin || `AddFund: [AMOUNT] added for [CUSTOMER_NAME] by [ADDED_BY].`)
        .replaceAll('[AMOUNT]', amountStr)
        .replaceAll('[CUSTOMER_NAME]', customerDoc?.name || '')
        .replaceAll('[ADDED_BY]', session.user.name || '');
      
      // Send SMS to customer
      if (settings.smsFlags?.sendAddFundCustomer && customerPhone) {
        console.log(`Sending AddFund SMS to customer: ${customerPhone}`);
        const customerSmsResult = await sendSmsTo("", customerPhone, customerMsg);
        console.log("Customer SMS Result:", customerSmsResult);
      }
      
      // Send SMS to admin
      if (settings.smsFlags?.sendAddFundAdmin && settings.adminPhone) {
        console.log(`Sending AddFund SMS to admin: ${settings.adminPhone}`);
        const adminSmsResult = await sendSmsTo(settings.adminPhone, "", adminMsg);
        console.log("Admin SMS Result:", adminSmsResult);
      }
    }
  } catch (error) {
    console.error("SMS notification error:", error);
  }
  return NextResponse.json(tx);
}



