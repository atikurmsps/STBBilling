"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type SmsFlags = {
  sendAddFundCustomer: boolean;
  sendAddFundAdmin: boolean;
  sendAddStbCustomer: boolean;
  sendAddStbAdmin: boolean;
};

const initialSmsFlags: SmsFlags = {
  sendAddFundCustomer: false,
  sendAddFundAdmin: false,
  sendAddStbCustomer: false,
  sendAddStbAdmin: false,
};

const initialSmsTemplates = {
  addFundCustomer: "আপনার একাউন্টে [AMOUNT] টাকা জমা হয়েছে। ধন্যবাদ।",
  addFundAdmin: "AddFund: [AMOUNT] যোগ হয়েছে [CUSTOMER_NAME] এর জন্য।",
  addStbCustomer: "আপনার নামে নতুন STB যোগ হয়েছে। চার্জ: [AMOUNT]。",
  addStbAdmin: "STB Added: [STB_ID] for [CUSTOMER_NAME]. Charge: [AMOUNT].",
};

export default function SettingsPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user.role === "ADMIN";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Individual states for all settings
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [smsUrlTemplate, setSmsUrlTemplate] = useState("");
  const [adminPhone, setAdminPhone] = useState("");
  const [smsFlags, setSmsFlags] = useState<SmsFlags>(initialSmsFlags);
  const [smsTemplates, setSmsTemplates] = useState(initialSmsTemplates);

  useEffect(() => {
    if (isAdmin) {
      setLoading(true);
      fetch("/api/settings", { cache: "no-store" })
        .then((res) => res.json())
        .then((data) => {
          setSmsEnabled(data.smsEnabled ?? false);
          setSmsUrlTemplate(data.smsUrlTemplate ?? "");
          setAdminPhone(data.adminPhone ?? "");
          setSmsFlags(data.smsFlags ?? initialSmsFlags);
          // Use nullish coalescing (??) to correctly handle empty strings
          setSmsTemplates({
             addFundCustomer: data.smsTemplates?.addFundCustomer ?? initialSmsTemplates.addFundCustomer,
             addFundAdmin: data.smsTemplates?.addFundAdmin ?? initialSmsTemplates.addFundAdmin,
             addStbCustomer: data.smsTemplates?.addStbCustomer ?? initialSmsTemplates.addStbCustomer,
             addStbAdmin: data.smsTemplates?.addStbAdmin ?? initialSmsTemplates.addStbAdmin,
          });
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [isAdmin]);

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      smsEnabled,
      smsUrlTemplate,
      adminPhone,
      smsFlags,
      smsTemplates,
    };
    
    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const error = await response.json();
        console.error("API Error:", error);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
    }
    
    setSaving(false);
  };

  if (!isAdmin) {
    return (
      <div className="p-6 text-sm text-gray-600 dark:text-gray-300">
        You do not have permission to view this page.
      </div>
    );
  }

  if (loading) {
    return <div className="p-6 text-sm text-gray-600 dark:text-gray-300">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Settings</h1>

      <div className="bg-white dark:bg-gray-800 rounded-md shadow p-4 space-y-6">
        <div>
          <label className="font-medium">SMS Mode</label>
          <div className="mt-2">
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={smsEnabled} onChange={(e) => setSmsEnabled(e.target.checked)} />
              <span>Enable</span>
            </label>
          </div>
        </div>

        <div className="space-y-2">
          <label className="font-medium">API URL Template</label>
          <input
            className="w-full border rounded px-3 py-2 bg-transparent dark:border-gray-600"
            value={smsUrlTemplate}
            onChange={(e) => setSmsUrlTemplate(e.target.value)}
            placeholder="https://...&to=[ADMIN_NUMBER],[CUSTOMER_NUMBER]&text=[MESSAGE_BODY]"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Use placeholders: [ADMIN_NUMBER], [CUSTOMER_NUMBER], [MESSAGE_BODY]
          </p>
        </div>

        <div className="space-y-2">
          <label className="font-medium">Admin Phone Number</label>
          <input
            className="w-full border rounded px-3 py-2 bg-transparent dark:border-gray-600"
            value={adminPhone}
            onChange={(e) => setAdminPhone(e.target.value)}
            placeholder="8801XXXXXXXXX"
          />
        </div>

        <div>
          <label className="font-medium">SMS Settings</label>
          <div className="mt-2 grid gap-3">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={smsFlags.sendAddFundCustomer}
                onChange={(e) => setSmsFlags({ ...smsFlags, sendAddFundCustomer: e.target.checked })}
              />
              <span>Send Add Funds SMS to Customers</span>
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={smsFlags.sendAddFundAdmin}
                onChange={(e) => setSmsFlags({ ...smsFlags, sendAddFundAdmin: e.target.checked })}
              />
              <span>Send Add Funds SMS to Admin</span>
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={smsFlags.sendAddStbCustomer}
                onChange={(e) => setSmsFlags({ ...smsFlags, sendAddStbCustomer: e.target.checked })}
              />
              <span>Send Add STB Box SMS to Customers</span>
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={smsFlags.sendAddStbAdmin}
                onChange={(e) => setSmsFlags({ ...smsFlags, sendAddStbAdmin: e.target.checked })}
              />
              <span>Send Add STB Box SMS to Admin</span>
            </label>
          </div>
        </div>

        <div className="space-y-3">
          <label className="font-medium">SMS Message Templates</label>
          <div className="grid gap-3">
            <div>
              <div className="text-sm mb-1">Add Funds (Customer)</div>
              <textarea
                className="w-full border rounded px-3 py-2 bg-transparent dark:border-gray-600"
                rows={2}
                value={smsTemplates.addFundCustomer}
                onChange={(e) => setSmsTemplates({ ...smsTemplates, addFundCustomer: e.target.value })}
              />
            </div>
            <div>
              <div className="text-sm mb-1">Add Funds (Admin)</div>
              <textarea
                className="w-full border rounded px-3 py-2 bg-transparent dark:border-gray-600"
                rows={2}
                value={smsTemplates.addFundAdmin}
                onChange={(e) => setSmsTemplates({ ...smsTemplates, addFundAdmin: e.target.value })}
              />
            </div>
            <div>
              <div className="text-sm mb-1">Add STB (Customer)</div>
              <textarea
                className="w-full border rounded px-3 py-2 bg-transparent dark:border-gray-600"
                rows={2}
                value={smsTemplates.addStbCustomer}
                onChange={(e) => setSmsTemplates({ ...smsTemplates, addStbCustomer: e.target.value })}
              />
            </div>
            <div>
              <div className="text-sm mb-1">Add STB (Admin)</div>
              <textarea
                className="w-full border rounded px-3 py-2 bg-transparent dark:border-gray-600"
                rows={2}
                value={smsTemplates.addStbAdmin}
                onChange={(e) => setSmsTemplates({ ...smsTemplates, addStbAdmin: e.target.value })}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Placeholders: [AMOUNT], [CUSTOMER_NAME], [STB_ID], [ADDED_BY]
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <button onClick={handleSave} disabled={saving} className="bg-[#203462] text-white px-4 py-2 rounded disabled:opacity-50">
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}


