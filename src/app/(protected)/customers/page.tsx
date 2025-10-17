"use client";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Search, X } from "lucide-react";

type Customer = {
  _id: string;
  name: string;
  phone: string;
  address: string;
  createdAt: string;
  balance?: number;
  totalSTB?: number;
  addedBy?: { _id: string; name: string };
};

type Pagination = {
  currentPage: number;
  totalPages: number;
  totalCustomers: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export default function CustomersPage() {
  const { data: session } = useSession();
  const user = session?.user;
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const load = async (page = currentPage) => {
    const res = await fetch(`/api/customers?page=${page}&limit=25`, { cache: "no-store" });
    const data = await res.json();
    setCustomers(data.customers);
    setPagination(data.pagination);
  };

  useEffect(() => {
    load();
  }, []);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    load(page);
  };

  const submit = async () => {
    setLoading(true);
    await fetch("/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    setAddModalOpen(false);
    setForm({ name: "", phone: "", address: "" });
    load();
  };

  const openEditModal = (customer: Customer) => {
    setCurrentCustomer(customer);
    setForm({ name: customer.name, phone: customer.phone, address: customer.address });
    setEditModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!currentCustomer) return;
    setLoading(true);
    await fetch(`/api/customers/${currentCustomer._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setLoading(false);
    setEditModalOpen(false);
    setCurrentCustomer(null);
    setForm({ name: "", phone: "", address: "" });
    load();
  };

  const deleteCustomer = async (id: string) => {
    if (confirm("Are you sure you want to delete this customer and all their data?")) {
      await fetch(`/api/customers/${id}`, { method: "DELETE" });
      load();
    }
  };

  // Filter customers based on search term
  const filteredCustomers = useMemo(() => {
    if (!searchTerm.trim()) return customers;
    
    const term = searchTerm.toLowerCase();
    return customers.filter(customer => 
      customer.name.toLowerCase().includes(term) ||
      customer.phone.toLowerCase().includes(term) ||
      customer.address.toLowerCase().includes(term) ||
      customer.addedBy?.name.toLowerCase().includes(term)
    );
  }, [customers, searchTerm]);

  const clearSearch = () => {
    setSearchTerm("");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Customers</h1>
        <button onClick={() => setAddModalOpen(true)} className="bg-[#203462] text-white px-3 py-2 rounded">Add Customer</button>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-md shadow p-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search customers by name, phone, address, or added by..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-[#203462] focus:border-transparent"
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {searchTerm && (
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredCustomers.length} of {customers.length} customers
          </div>
        )}
      </div>

      <div className="overflow-auto bg-white dark:bg-gray-800 rounded-md shadow">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left bg-gray-50 dark:bg-gray-700">
              <th className="p-3">Name</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Address</th>
              <th className="p-3">Total STB</th>
              <th className="p-3">Balance</th>
              <th className="p-3">Added By</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map((c) => (
              <tr key={c._id} className="border-t dark:border-gray-700">
                <td className="p-3">{c.name}</td>
                <td className="p-3">{c.phone}</td>
                <td className="p-3">{c.address}</td>
                <td className="p-3">{typeof c.totalSTB === 'number' ? c.totalSTB : '-'}</td>
                <td className="p-3">
                  <span className={Number(c.balance || 0) < 0 ? "text-red-600" : "text-green-600"}>
                    {Number(c.balance || 0).toFixed(2)}
                  </span>
                </td>
                <td className="p-3">{c.addedBy?.name}</td>
                <td className="p-3 space-x-2">
                  <Link className="underline" href={`/customers/${c._id}`}>View</Link>
                  {(user?.role === "ADMIN" || user?.id === c.addedBy?._id) && (
                    <>
                      <button onClick={() => openEditModal(c)} className="underline">Edit</button>
                      <button onClick={() => deleteCustomer(c._id)} className="underline text-red-500">Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {filteredCustomers.length === 0 && searchTerm && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-500 dark:text-gray-400">
                  No customers found matching "{searchTerm}"
                </td>
              </tr>
            )}
            {filteredCustomers.length === 0 && !searchTerm && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-500 dark:text-gray-400">
                  No customers found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-md shadow p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {((pagination.currentPage - 1) * 25) + 1} to {Math.min(pagination.currentPage * 25, pagination.totalCustomers)} of {pagination.totalCustomers} customers
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

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/40 grid place-items-center">
          <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-md p-4 space-y-3">
            <div className="text-lg font-semibold">Add Customer</div>
            <div className="space-y-1">
              <label className="text-sm">Name</label>
              <input className="w-full border rounded px-3 py-2 bg-transparent dark:border-gray-600" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-1">
              <label className="text-sm">Phone</label>
              <input className="w-full border rounded px-3 py-2 bg-transparent dark:border-gray-600" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="space-y-1">
              <label className="text-sm">Address</label>
              <input className="w-full border rounded px-3 py-2 bg-transparent dark:border-gray-600" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setAddModalOpen(false)} className="px-3 py-2">Cancel</button>
              <button disabled={loading} onClick={submit} className="bg-[#203462] text-white px-3 py-2 rounded">{loading ? "Saving..." : "Save"}</button>
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen && currentCustomer && (
        <div className="fixed inset-0 bg-black/40 grid place-items-center">
          <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-md p-4 space-y-3">
            <div className="text-lg font-semibold">Edit Customer</div>
            <div className="space-y-1">
              <label className="text-sm">Name</label>
              <input className="w-full border rounded px-3 py-2 bg-transparent dark:border-gray-600" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-1">
              <label className="text-sm">Phone</label>
              <input className="w-full border rounded px-3 py-2 bg-transparent dark:border-gray-600" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="space-y-1">
              <label className="text-sm">Address</label>
              <input className="w-full border rounded px-3 py-2 bg-transparent dark:border-gray-600" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setEditModalOpen(false)} className="px-3 py-2">Cancel</button>
              <button disabled={loading} onClick={handleUpdate} className="bg-[#203462] text-white px-3 py-2 rounded">{loading ? "Updating..." : "Update"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


