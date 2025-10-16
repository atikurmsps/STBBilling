import Link from "next/link";
import { Suspense } from "react";
import { connectToDatabase } from "@/lib/db";
import { Customer } from "@/models/Customer";
import { STB } from "@/models/STB";
import { Transaction } from "@/models/Transaction";

async function getMetrics() {
  await connectToDatabase();
  const [totalCustomers, totalSTB, sums] = await Promise.all([
    Customer.countDocuments(),
    STB.countDocuments(),
    Transaction.aggregate([
      {
        $group: {
          _id: null,
          totalDue: { $sum: { $cond: [{ $lt: ["$amount", 0] }, "$amount", 0] } },
          totalCollected: { $sum: { $cond: [{ $eq: ["$type", "AddFund"] }, "$amount", 0] } },
        },
      },
    ]),
  ]);
  const agg: { totalDue: number, totalCollected: number } = (sums as any[])[0] || { totalDue: 0, totalCollected: 0 };
  return {
    totalCustomers,
    totalSTB,
    totalDue: agg.totalDue || 0,
    totalCollected: agg.totalCollected || 0,
  };
}

export default async function Home() {
  const metrics = await getMetrics();
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card title="Total Customers" value={String(metrics.totalCustomers)} />
      <Card title="Total STB" value={String(metrics.totalSTB)} />
      <Card title="Total Due" value={String(metrics.totalDue.toFixed(2))} />
      <Card title="Total Collected" value={String(metrics.totalCollected.toFixed(2))} />
      <div className="col-span-full text-sm text-gray-500">
        <Suspense>
          <span>
            Jump to: <Link className="underline" href="/customers">Customers</Link>
            <Link className="underline ml-2" href="/stbs">STB List</Link>
            <Link className="underline ml-2" href="/transactions">Transactions</Link>
          </span>
        </Suspense>
      </div>
    </div>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-md shadow p-4">
      <div className="text-sm text-gray-600 dark:text-gray-400">{title}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}
