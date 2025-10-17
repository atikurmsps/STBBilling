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

type Pagination = {
  currentPage: number;
  totalPages: number;
  totalTransactions: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export default function TransactionsPage() {
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const load = async (page = currentPage) => {
    const res = await fetch(`/api/transactions?page=${page}&limit=25`, { cache: "no-store" });
    const data = await res.json();
    setTxs(data.transactions);
    setPagination(data.pagination);
  };

  useEffect(() => {
    load();
  }, []);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    load(page);
  };

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

      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-md shadow p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {((pagination.currentPage - 1) * 25) + 1} to {Math.min(pagination.currentPage * 25, pagination.totalTransactions)} of {pagination.totalTransactions} transactions
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


