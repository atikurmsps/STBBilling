"use client";
import { useEffect, useState } from "react";

type Transaction = {
  _id: string;
  createdAt: string;
  type: 'Charge' | 'AddFund';
  amount: number;
  note?: string;
  addedBy?: {
    name: string;
  };
  customer?: {
    name: string;
    _id?: string;
  };
};

export default function TransactionsPage() {
  const [txs, setTxs] = useState<Transaction[]>([]);

  const load = async () => {
    const res = await fetch("/api/transactions", { cache: "no-store" });
    setTxs(await res.json());
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Transactions</h1>
      <div className="bg-white dark:bg-gray-800 rounded-md shadow overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left bg-gray-50 dark:bg-gray-700">
              <th className="p-3">Date</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Type</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Note</th>
              <th className="p-3">Added By</th>
              <th className="p-3">View</th>
            </tr>
          </thead>
          <tbody>
            {txs.map((t) => (
              <tr key={t._id} className="border-t dark:border-gray-700">
                <td className="p-3">{new Date(t.createdAt).toLocaleString()}</td>
                <td className="p-3">{t.customer?.name || '-'}</td>
                <td className="p-3">{t.type}</td>
                <td className={`p-3 ${t.type === 'Charge' ? 'text-red-600' : 'text-green-600'}`}>{Number(t.amount).toFixed(2)}</td>
                <td className="p-3">{t.note}</td>
                <td className="p-3">{t.addedBy?.name}</td>
                <td className="p-3">
                  {t.customer?._id ? (
                    <a className="underline" href={`/customers/${t.customer._id}`}>View</a>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


