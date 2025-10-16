"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

type User = {
  _id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'EDITOR' | 'INACTIVE';
};

export default function UsersPage() {
  const { data } = useSession();
  const role = data?.user?.role;
  if (role !== "ADMIN") redirect("/");

  const [users, setUsers] = useState<User[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "EDITOR" });
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ _id: "", name: "", email: "", role: "EDITOR", password: "" });
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  const openEdit = (u: User) => {
    setEditForm({ _id: u._id, name: u.name, email: u.email, role: u.role, password: "" });
    setEditOpen(true);
  };

  const submitEdit = async () => {
    const body: any = { name: editForm.name, email: editForm.email, role: editForm.role };
    if (editForm.password) {
      body.password = editForm.password;
    }
    await fetch(`/api/users/${editForm._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setEditOpen(false);
    setEditForm({ _id: "", name: "", email: "", role: "EDITOR", password: "" });
    load();
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    await fetch(`/api/users/${deletingId}`, { method: "DELETE" });
    setDeletingId(null);
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
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-t dark:border-gray-700">
                <td className="p-3">{u.name}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3">{u.role}</td>
                <td className="p-3 space-x-2">
                  <button onClick={() => openEdit(u)} className="underline">Edit</button>
                  <button onClick={() => setDeletingId(u._id)} className="underline text-red-500">Delete</button>
                </td>
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
              <option value="INACTIVE">INACTIVE</option>
            </select>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setOpen(false)} className="px-3 py-2">Cancel</button>
              <button onClick={submit} className="bg-[#203462] text-white px-3 py-2 rounded">Save</button>
            </div>
          </div>
        </div>
      )}

      {editOpen && (
        <div className="fixed inset-0 bg-black/40 grid place-items-center">
          <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-md p-4 space-y-3">
            <div className="text-lg font-semibold">Edit User</div>
            <input placeholder="Name" className="w-full border rounded px-3 py-2 bg-transparent dark:border-gray-600" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
            <input placeholder="Email" type="email" className="w-full border rounded px-3 py-2 bg-transparent dark:border-gray-600" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
            <input placeholder="New password (leave blank to keep current)" type="password" className="w-full border rounded px-3 py-2 bg-transparent dark:border-gray-600" value={editForm.password} onChange={(e) => setEditForm({ ...editForm, password: e.target.value })} />
            <select className="w-full border rounded px-3 py-2 bg-transparent dark:border-gray-600" value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value as 'ADMIN' | 'EDITOR' | 'INACTIVE' })}>
              <option value="EDITOR">EDITOR</option>
              <option value="ADMIN">ADMIN</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setEditOpen(false)} className="px-3 py-2">Cancel</button>
              <button onClick={submitEdit} className="bg-[#203462] text-white px-3 py-2 rounded">Update</button>
            </div>
          </div>
        </div>
      )}

      {deletingId && (
        <div className="fixed inset-0 bg-black/40 grid place-items-center">
          <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-md p-4 space-y-3">
            <div className="text-lg font-semibold">Delete User</div>
            <div className="text-sm">Are you sure you want to delete this user?</div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setDeletingId(null)} className="px-3 py-2">Cancel</button>
              <button onClick={confirmDelete} className="bg-red-600 text-white px-3 py-2 rounded">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


