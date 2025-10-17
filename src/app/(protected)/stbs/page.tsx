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

type Pagination = {
  currentPage: number;
  totalPages: number;
  totalSTBs: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export default function StbsPage() {
  const [stbs, setStbs] = useState<STB[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [q, setQ] = useState("");

  const load = async (page = currentPage) => {
    const res = await fetch(`/api/stbs?page=${page}&limit=25`, { cache: "no-store" });
    const data = await res.json();
    setStbs(data.stbs);
    setPagination(data.pagination);
  };

  useEffect(() => {
    load();
  }, []);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    load(page);
  };

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

      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-md shadow p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {((pagination.currentPage - 1) * 25) + 1} to {Math.min(pagination.currentPage * 25, pagination.totalSTBs)} of {pagination.totalSTBs} STBs
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPrevPage}
              className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Previous
            </button>
            
            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const startPage = Math.max(1, pagination.currentPage - 2);
                const pageNum = startPage + i;
                if (pageNum > pagination.totalPages) return null;
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-1 border rounded ${
                      pageNum === pagination.currentPage
                        ? 'bg-[#203462] text-white border-[#203462]'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNextPage}
              className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


