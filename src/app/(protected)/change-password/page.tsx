"use client";
import { useState } from "react";

export default function ChangePasswordPage() {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    setMsg(null);
    setErr(null);
    if (form.newPassword !== form.confirmPassword) {
      setErr("New passwords do not match");
      setLoading(false);
      return;
    }
    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) setErr(data.error || "Failed to change password");
    else setMsg("Password updated successfully");
    setLoading(false);
    setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  return (
    <div className="max-w-md space-y-4">
      <h1 className="text-xl font-semibold">Change Password</h1>
      <div className="bg-white dark:bg-gray-800 rounded-md shadow p-4 space-y-3">
        <input placeholder="Current password" type="password" className="w-full border rounded px-3 py-2 bg-transparent dark:border-gray-600" value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} />
        <input placeholder="New password" type="password" className="w-full border rounded px-3 py-2 bg-transparent dark:border-gray-600" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} />
        <input placeholder="Confirm new password" type="password" className="w-full border rounded px-3 py-2 bg-transparent dark:border-gray-600" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} />
        {err && <div className="text-red-600 text-sm">{err}</div>}
        {msg && <div className="text-emerald-600 text-sm">{msg}</div>}
        <div className="flex justify-end">
          <button disabled={loading} onClick={submit} className="bg-[#203462] text-white px-3 py-2 rounded">{loading ? "Updating..." : "Update Password"}</button>
        </div>
      </div>
    </div>
  );
}


