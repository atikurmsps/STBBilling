import { NextResponse, NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Customer } from "@/models/Customer";
import { STB } from "@/models/STB";
import { Transaction } from "@/models/Transaction";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const fromDate = searchParams.get('fromDate');
  const toDate = searchParams.get('toDate');

  if (!fromDate || !toDate) {
    return NextResponse.json({ error: "fromDate and toDate are required" }, { status: 400 });
  }

  await connectToDatabase();

  const startDate = new Date(fromDate);
  const endDate = new Date(toDate);
  endDate.setHours(23, 59, 59, 999); // Include the entire end date

  // Get date range filter
  const dateFilter = {
    createdAt: {
      $gte: startDate,
      $lte: endDate
    }
  };

  // Get summary data
  const [totalCustomers, totalSTBs, totalTransactions, totalCollected] = await Promise.all([
    Customer.countDocuments(dateFilter),
    STB.countDocuments(dateFilter),
    Transaction.countDocuments(dateFilter),
    Transaction.aggregate([
      { $match: { ...dateFilter, type: "AddFund" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ])
  ]);

  // Get detailed lists
  const [customers, stbs, transactions] = await Promise.all([
    Customer.find(dateFilter).populate("addedBy", "name").sort({ createdAt: -1 }).lean(),
    STB.find(dateFilter).populate("addedBy", "name").populate("customerId", "name").sort({ createdAt: -1 }).lean(),
    Transaction.find({ ...dateFilter, type: "AddFund" }).populate("addedBy", "name").populate("customerId", "name").sort({ createdAt: -1 }).lean()
  ]);

  // Calculate total bill generated (sum of all STB amounts in date range)
  const billGenerated = await STB.aggregate([
    { $match: dateFilter },
    { $group: { _id: null, total: { $sum: "$amount" } } }
  ]);

  const result = {
    summary: {
      totalNewCustomers: totalCustomers,
      totalSTBsAdded: totalSTBs,
      totalBillGenerated: billGenerated[0]?.total || 0,
      totalCollectedAmount: totalCollected[0]?.total || 0
    },
    details: {
      newCustomers: customers,
      stbs: stbs,
      transactions: transactions
    }
  };

  return NextResponse.json(result);
}
