"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type STB = {
  _id: string;
  stbId: string;
  amount: number;
  createdAt: string;
  note?: string;
  customerId: string;
  addedBy?: {
    name: string;
  };
  customer?: {
    name: string;
  };
};

export default function StbsPage() {
  const [stbs, setStbs] = useState<STB[]>([]);
  const [q, setQ] = useState("");

  const load = async () => {
    const res = await fetch("/api/stbs", { cache: "no-store" });
    setStbs(await res.json());
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const term = q.toLowerCase();
    return stbs.filter((s) =>
      s.stbId.toLowerCase().includes(term) ||
      (s.customer?.name || "").toLowerCase().includes(term)
    );
  }, [q, stbs]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">STB List</h1>
        <input placeholder="Search by STB ID or Customer" value={q} onChange={(e) => setQ(e.target.value)} className="border rounded px-3 py-2 bg-transparent dark:border-gray-600" />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-md shadow overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left bg-gray-50 dark:bg-gray-700">
              <th className="p-3">STB ID</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Date</th>
              <th className="p-3">Note</th>
              <th className="p-3">Added By</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s._id} className="border-t dark:border-gray-700">
                <td className="p-3">{s.stbId}</td>
                <td className="p-3">{s.customer?.name || "-"}</td>
                <td className="p-3">{Number(s.amount).toFixed(2)}</td>
                <td className="p-3">{new Date(s.createdAt).toLocaleString()}</td>
                <td className="p-3">{s.note}</td>
                <td className="p-3">{s.addedBy?.name}</td>
                <td className="p-3">
                  <Link className="underline" href={`/customers/${s.customerId}`}>View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


