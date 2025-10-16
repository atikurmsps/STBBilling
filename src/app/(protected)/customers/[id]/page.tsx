"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";

export default function CustomerProfilePage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { data: session } = useSession();
  const user = session?.user;
  const [data, setData] = useState<any>(null);
  const [openSTB, setOpenSTB] = useState(false);
  const [openFund, setOpenFund] = useState(false);
  const [openEditSTB, setOpenEditSTB] = useState(false);
  const [openEditTx, setOpenEditTx] = useState(false);
  const [currentSTB, setCurrentSTB] = useState<any>(null);
  const [currentTx, setCurrentTx] = useState<any>(null);
  const [stbForm, setStbForm] = useState({ stbId: "", amount: "", note: "", customerCode: "" });
  const [fundForm, setFundForm] = useState({ amount: "", note: "" });
  const [txForm, setTxForm] = useState({ amount: "", note: "" });

  const load = async () => {
    const res = await fetch(`/api/customers/${id}`, { cache: "no-store" });
    setData(await res.json());
  };

  useEffect(() => {
    if (id) load();
  }, [id]);

  const addSTB = async () => {
    await fetch(`/api/customers/${id}/add-stb`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(stbForm),
    });
    setOpenSTB(false);
    setStbForm({ stbId: "", amount: "", note: "", customerCode: "" });
    load();
  };

  const openEditSTBModal = (stb: any) => {
    setCurrentSTB(stb);
    setStbForm({
      stbId: stb.stbId,
      amount: stb.amount,
      note: stb.note,
      customerCode: stb.customerCode,
    });
    setOpenEditSTB(true);
  };

  const handleUpdateSTB = async () => {
    if (!currentSTB) return;
    await fetch(`/api/stbs/${currentSTB._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(stbForm),
    });
    setOpenEditSTB(false);
    setCurrentSTB(null);
    setStbForm({ stbId: "", amount: "", note: "", customerCode: "" });
    load();
  };

  const deleteSTB = async (stbId: string) => {
    if (confirm("Are you sure you want to delete this STB? This will also delete the associated charge.")) {
      await fetch(`/api/stbs/${stbId}`, { method: 'DELETE' });
      load();
    }
  };

  const openEditTxModal = (tx: any) => {
    if (tx.stbId) {
      alert("This is a charge for an STB. Please edit the STB directly to change the amount.");
      return;
    }
    setCurrentTx(tx);
    setTxForm({ amount: tx.amount, note: tx.note });
    setOpenEditTx(true);
  };

  const handleUpdateTx = async () => {
    if (!currentTx) return;
    await fetch(`/api/transactions/${currentTx._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(txForm),
    });
    setOpenEditTx(false);
    setCurrentTx(null);
    setTxForm({ amount: "", note: "" });
    load();
  };

  const deleteTx = async (tx: any) => {
    if (tx.stbId) {
      alert("This is a charge for an STB. Please delete the STB instead to remove this charge.");
      return;
    }
    if (confirm("Are you sure you want to delete this transaction?")) {
      await fetch(`/api/transactions/${tx._id}`, { method: 'DELETE' });
      load();
    }
  };

  const addFund = async () => {
    await fetch(`/api/customers/${id}/add-fund`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fundForm),
    });
    setOpenFund(false);
    setFundForm({ amount: "", note: "" });
    load();
  };

  if (!data) return null;
  const { customer, stbs, transactions, balance } = data;

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-md shadow p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="text-lg font-semibold">{customer.name}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{customer.phone} • {customer.address}</div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`px-3 py-2 rounded ${balance < 0 ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
              Balance: {Number(balance).toFixed(2)}
            </div>
            <button onClick={() => setOpenSTB(true)} className="bg-[#203462] text-white px-3 py-2 rounded">+ Add STB</button>
            <button onClick={() => setOpenFund(true)} className="bg-emerald-600 text-white px-3 py-2 rounded">+ Add Funds</button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-md shadow overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left bg-gray-50 dark:bg-gray-700">
              <th className="p-3">STB ID</th>
              <th className="p-3">Customer Code</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Note</th>
              <th className="p-3">Date</th>
              <th className="p-3">Added By</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {stbs.map((s: any) => (
              <tr key={s._id} className="border-t dark:border-gray-700">
                <td className="p-3">{s.stbId}</td>
                <td className="p-3">{s.customerCode}</td>
                <td className="p-3">{Number(s.amount).toFixed(2)}</td>
                <td className="p-3">{s.note}</td>
                <td className="p-3">{new Date(s.createdAt).toLocaleString()}</td>
                <td className="p-3">{s.addedBy?.name}</td>
                <td className="p-3 space-x-2">
                  {(user?.role === "ADMIN" || user?.id === s.addedBy?._id) && (
                    <>
                      <button onClick={() => openEditSTBModal(s)} className="underline">Edit</button>
                      <button onClick={() => deleteSTB(s._id)} className="underline text-red-500">Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-md shadow overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left bg-gray-50 dark:bg-gray-700">
              <th className="p-3">Date</th>
              <th className="p-3">Type</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Note</th>
              <th className="p-3">Added By</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t: any) => (
              <tr key={t._id} className="border-t dark:border-gray-700">
                <td className="p-3">{new Date(t.createdAt).toLocaleString()}</td>
                <td className="p-3">{t.type}</td>
                <td className={`p-3 ${t.amount < 0 ? "text-red-600" : "text-green-600"}`}>{Number(t.amount).toFixed(2)}</td>
                <td className="p-3">{t.note}</td>
                <td className="p-3">{t.addedBy?.name}</td>
                <td className="p-3 space-x-2">
                  {(user?.role === "ADMIN" || user?.id === t.addedBy?._id) && (
                    <>
                      <button onClick={() => openEditTxModal(t)} className="underline">Edit</button>
                      <button onClick={() => deleteTx(t)} className="underline text-red-500">Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {openSTB && (
        <div className="fixed inset-0 bg-black/40 grid place-items-center">
          <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-md p-4 space-y-3">
            <div className="text-lg font-semibold">Add STB</div>
            <input placeholder="STB ID" className="w-full border rounded px-3 py-2 bg-transparent dark:border-gray-600" value={stbForm.stbId} onChange={(e) => setStbForm({ ...stbForm, stbId: e.target.value })} />
            <input placeholder="Customer Code (optional)" className="w-full border rounded px-3 py-2 bg-transparent dark:border-gray-600" value={stbForm.customerCode} onChange={(e) => setStbForm({ ...stbForm, customerCode: e.target.value })} />
            <input placeholder="Amount" type="number" className="w-full border rounded px-3 py-2 bg-transparent dark:border-gray-600" value={stbForm.amount} onChange={(e) => setStbForm({ ...stbForm, amount: e.target.value })} />
            <input placeholder="Note" className="w-full border rounded px-3 py-2 bg-transparent dark:border-gray-600" value={stbForm.note} onChange={(e) => setStbForm({ ...stbForm, note: e.target.value })} />
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setOpenSTB(false)} className="px-3 py-2">Cancel</button>
              <button onClick={addSTB} className="bg-[#203462] text-white px-3 py-2 rounded">Save</button>
            </div>
          </div>
        </div>
      )}
      
      {openEditSTB && (
        <div className="fixed inset-0 bg-black/40 grid place-items-center">
          <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-md p-4 space-y-3">
            <div className="text-lg font-semibold">Edit STB</div>
            <input placeholder="STB ID" className="w-full border rounded px-3 py-2 bg-transparent dark:border-gray-600" value={stbForm.stbId} onChange={(e) => setStbForm({ ...stbForm, stbId: e.target.value })} />
            <input placeholder="Customer Code (optional)" className="w-full border rounded px-3 py-2 bg-transparent dark:border-gray-600" value={stbForm.customerCode} onChange={(e) => setStbForm({ ...stbForm, customerCode: e.target.value })} />
            <input placeholder="Amount" type="number" className="w-full border rounded px-3 py-2 bg-transparent dark:border-gray-600" value={stbForm.amount} onChange={(e) => setStbForm({ ...stbForm, amount: e.target.value })} />
            <input placeholder="Note" className="w-full border rounded px-3 py-2 bg-transparent dark:border-gray-600" value={stbForm.note} onChange={(e) => setStbForm({ ...stbForm, note: e.target.value })} />
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setOpenEditSTB(false)} className="px-3 py-2">Cancel</button>
              <button onClick={handleUpdateSTB} className="bg-[#203462] text-white px-3 py-2 rounded">Update</button>
            </div>
          </div>
        </div>
      )}

      {openFund && (
        <div className="fixed inset-0 bg-black/40 grid place-items-center">
          <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-md p-4 space-y-3">
            <div className="text-lg font-semibold">Add Funds</div>
            <input placeholder="Amount" type="number" className="w-full border rounded px-3 py-2 bg-transparent dark:border-gray-600" value={fundForm.amount} onChange={(e) => setFundForm({ ...fundForm, amount: e.target.value })} />
            <input placeholder="Note" className="w-full border rounded px-3 py-2 bg-transparent dark:border-gray-600" value={fundForm.note} onChange={(e) => setFundForm({ ...fundForm, note: e.target.value })} />
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setOpenFund(false)} className="px-3 py-2">Cancel</button>
              <button onClick={addFund} className="bg-emerald-600 text-white px-3 py-2 rounded">Save</button>
            </div>
          </div>
        </div>
      )}

      {openEditTx && (
        <div className="fixed inset-0 bg-black/40 grid place-items-center">
          <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-md p-4 space-y-3">
            <div className="text-lg font-semibold">Edit Transaction</div>
            <input placeholder="Amount" type="number" className="w-full border rounded px-3 py-2 bg-transparent dark:border-gray-600" value={txForm.amount} onChange={(e) => setTxForm({ ...txForm, amount: e.target.value })} />
            <input placeholder="Note" className="w-full border rounded px-3 py-2 bg-transparent dark:border-gray-600" value={txForm.note} onChange={(e) => setTxForm({ ...txForm, note: e.target.value })} />
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setOpenEditTx(false)} className="px-3 py-2">Cancel</button>
              <button onClick={handleUpdateTx} className="bg-[#203462] text-white px-3 py-2 rounded">Update</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


