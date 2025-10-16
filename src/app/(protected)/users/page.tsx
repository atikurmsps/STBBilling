"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export default function UsersPage() {
  const { data } = useSession();
  const role = (data?.user as any)?.role;
  if (role !== "ADMIN") redirect("/");

  const [users, setUsers] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "EDITOR" });

  const load = async () => {
    const res = await fetch("/api/users", { cache: "no-store" });
    setUsers(await res.json());
  };
  useEffect(() => { load(); }, []);

  const submit = async () => {
    await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setOpen(false);
    setForm({ name: "", email: "", password: "", role: "EDITOR" });
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Users</h1>
        <button onClick={() => setOpen(true)} className="bg-[#203462] text-white px-3 py-2 rounded">Add User</button>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-md shadow overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left bg-gray-50 dark:bg-gray-700">
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-t dark:border-gray-700">
                <td className="p-3">{u.name}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3">{u.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/40 grid place-items-center">
          <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-md p-4 space-y-3">
            <div className="text-lg font-semibold">Add User</div>
            <input placeholder="Name" className="w-full border rounded px-3 py-2 bg-transparent dark:border-gray-600" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input placeholder="Email" type="email" className="w-full border rounded px-3 py-2 bg-transparent dark:border-gray-600" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input placeholder="Password" type="password" className="w-full border rounded px-3 py-2 bg-transparent dark:border-gray-600" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <select className="w-full border rounded px-3 py-2 bg-transparent dark:border-gray-600" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="EDITOR">EDITOR</option>
              <option value="ADMIN">ADMIN</option>
            </select>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setOpen(false)} className="px-3 py-2">Cancel</button>
              <button onClick={submit} className="bg-[#203462] text-white px-3 py-2 rounded">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


