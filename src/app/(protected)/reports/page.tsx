"use client";
import { useState, useEffect } from "react";
import Calendar from "@/components/Calendar";

type ReportData = {
  summary: {
    totalNewCustomers: number;
    totalSTBsAdded: number;
    totalBillGenerated: number;
    totalCollectedAmount: number;
  };
  details: {
    newCustomers: any[];
    stbs: any[];
    transactions: any[];
  };
};

export default function ReportsPage() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);

  // Set default dates (last 30 days)
  useEffect(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    setToDate(today.toISOString().split('T')[0]);
    setFromDate(thirtyDaysAgo.toISOString().split('T')[0]);
  }, []);

  const generateReport = async () => {
    if (!fromDate || !toDate) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/reports?fromDate=${fromDate}&toDate=${toDate}`);
      const data = await res.json();
      setReportData(data);
    } catch (error) {
      console.error("Error generating report:", error);
    }
    setLoading(false);
  };

  const SummaryCard = ({ title, value, color = "blue" }: { title: string; value: string; color?: string }) => (
    <div className={`bg-white dark:bg-gray-800 rounded-md shadow p-4 border-l-4 ${
      color === "green" ? "border-green-500" : 
      color === "red" ? "border-red-500" : 
      color === "yellow" ? "border-yellow-500" : 
      "border-blue-500"
    }`}>
      <div className="text-sm text-gray-600 dark:text-gray-400">{title}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Reports</h1>
      </div>

      {/* Date Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-md shadow p-4">
        <h2 className="text-lg font-semibold mb-4">Select Date Range</h2>
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">From Date</label>
            <Calendar
              value={fromDate}
              onChange={setFromDate}
              placeholder="Select start date"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">To Date</label>
            <Calendar
              value={toDate}
              onChange={setToDate}
              placeholder="Select end date"
            />
          </div>
          <button
            onClick={generateReport}
            disabled={loading}
            className="bg-[#203462] text-white px-6 py-2 rounded hover:bg-[#2a4580] disabled:opacity-50"
          >
            {loading ? "Generating..." : "Generate Report"}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {reportData && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <SummaryCard 
              title="Total New Customers" 
              value={reportData.summary.totalNewCustomers.toString()} 
              color="blue"
            />
            <SummaryCard 
              title="Total STBs Added" 
              value={reportData.summary.totalSTBsAdded.toString()} 
              color="yellow"
            />
            <SummaryCard 
              title="Total Bill Generated" 
              value={`$${reportData.summary.totalBillGenerated.toFixed(2)}`} 
              color="red"
            />
            <SummaryCard 
              title="Total Collected Amount" 
              value={`$${reportData.summary.totalCollectedAmount.toFixed(2)}`} 
              color="green"
            />
          </div>

          {/* Detailed Lists */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* New Customers */}
            <div className="bg-white dark:bg-gray-800 rounded-md shadow">
              <div className="p-4 border-b dark:border-gray-700">
                <h3 className="text-lg font-semibold">New Customers ({reportData.details.newCustomers.length})</h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {reportData.details.newCustomers.length === 0 ? (
                  <div className="p-4 text-gray-500 text-center">No customers found</div>
                ) : (
                  <div className="divide-y dark:divide-gray-700">
                    {reportData.details.newCustomers.map((customer: any) => (
                      <div key={customer._id} className="p-4">
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{customer.phone}</div>
                        <div className="text-xs text-gray-500">{new Date(customer.createdAt).toLocaleDateString()}</div>
                        <div className="text-xs text-gray-500">Added by: {customer.addedBy?.name}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* STBs Added */}
            <div className="bg-white dark:bg-gray-800 rounded-md shadow">
              <div className="p-4 border-b dark:border-gray-700">
                <h3 className="text-lg font-semibold">STBs Added ({reportData.details.stbs.length})</h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {reportData.details.stbs.length === 0 ? (
                  <div className="p-4 text-gray-500 text-center">No STBs found</div>
                ) : (
                  <div className="divide-y dark:divide-gray-700">
                    {reportData.details.stbs.map((stb: any) => (
                      <div key={stb._id} className="p-4">
                        <div className="font-medium">STB ID: {stb.stbId}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Customer: {stb.customerId?.name || 'Unknown'}
                        </div>
                        <div className="text-sm font-semibold text-green-600">
                          Amount: ${stb.amount.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500">{new Date(stb.createdAt).toLocaleDateString()}</div>
                        <div className="text-xs text-gray-500">Added by: {stb.addedBy?.name}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Transactions (AddFund only) */}
            <div className="bg-white dark:bg-gray-800 rounded-md shadow">
              <div className="p-4 border-b dark:border-gray-700">
                <h3 className="text-lg font-semibold">Collected Amount ({reportData.details.transactions.length})</h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {reportData.details.transactions.length === 0 ? (
                  <div className="p-4 text-gray-500 text-center">No transactions found</div>
                ) : (
                  <div className="divide-y dark:divide-gray-700">
                    {reportData.details.transactions.map((transaction: any) => (
                      <div key={transaction._id} className="p-4">
                        <div className="font-medium">
                          Customer: {transaction.customerId?.name || 'Unknown'}
                        </div>
                        <div className="text-sm font-semibold text-green-600">
                          Amount: ${transaction.amount.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {transaction.note || 'No note'}
                        </div>
                        <div className="text-xs text-gray-500">{new Date(transaction.createdAt).toLocaleDateString()}</div>
                        <div className="text-xs text-gray-500">Added by: {transaction.addedBy?.name}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
