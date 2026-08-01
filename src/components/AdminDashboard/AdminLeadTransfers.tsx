import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAxiosAdmin from "@/uri/useAxiosAdmin";
import Notification from "../ui/toast";

interface TransferRequest {
  _id: string;
  leadId: string;
  leadName: string;
  fromSalesmanId: string;
  fromSalesmanName: string;
  toSalesmanId: string;
  toSalesmanName: string;
  note?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  resolvedAt?: string;
}

export default function AdminLeadTransfers() {
  const axiosAdmin = useAxiosAdmin();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"pending" | "history">("pending");
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const { data: pending, isLoading: loadingPending } = useQuery<{ data: TransferRequest[] }>({
    queryKey: ["admin-transfer-pending"],
    queryFn: async () => (await axiosAdmin.get("/transfer-requests/pending")).data,
    enabled: tab === "pending",
  });

  const { data: history, isLoading: loadingHistory } = useQuery<{ data: TransferRequest[] }>({
    queryKey: ["admin-transfer-history"],
    queryFn: async () => (await axiosAdmin.get("/transfer-requests/history")).data,
    enabled: tab === "history",
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => (await axiosAdmin.put(`/transfer-requests/${id}/approve`)).data,
    onSuccess: () => {
      setToast({ type: "success", message: "Lead transferred successfully." });
      queryClient.invalidateQueries({ queryKey: ["admin-transfer-pending"] });
      queryClient.invalidateQueries({ queryKey: ["admin-transfer-history"] });
    },
    onError: () => setToast({ type: "error", message: "Failed to approve transfer." }),
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: string) => (await axiosAdmin.put(`/transfer-requests/${id}/reject`)).data,
    onSuccess: () => {
      setToast({ type: "success", message: "Transfer request rejected." });
      queryClient.invalidateQueries({ queryKey: ["admin-transfer-pending"] });
      queryClient.invalidateQueries({ queryKey: ["admin-transfer-history"] });
    },
    onError: () => setToast({ type: "error", message: "Failed to reject transfer." }),
  });

  const rows = tab === "pending" ? pending?.data ?? [] : history?.data ?? [];
  const isLoading = tab === "pending" ? loadingPending : loadingHistory;

  const statusColor = (status: string) =>
    status === "approved"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : status === "rejected"
        ? "bg-red-50 text-red-700 border-red-200"
        : "bg-amber-50 text-amber-700 border-amber-200";

  return (
    <div className="max-w-350 mx-auto">
      {toast && (
        <div className="fixed top-4 right-4 z-50">
          <Notification
            type={toast.type}
            title={toast.type === "success" ? "Success" : "Error"}
            message={toast.message}
            showIcon
            duration={3000}
            onClose={() => setToast(null)}
          />
        </div>
      )}

      <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Lead Transfers</h1>
          <p className="text-sm text-slate-500 mt-1">
            Sales team-এর মধ্যে lead transfer request গুলো approve / reject করুন।
          </p>
        </div>
        <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setTab("pending")}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-colors ${
              tab === "pending" ? "bg-white shadow-xs text-slate-900" : "text-slate-500"
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setTab("history")}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-colors ${
              tab === "history" ? "bg-white shadow-xs text-slate-900" : "text-slate-500"
            }`}
          >
            History
          </button>
        </div>
      </div>

      <div className="overflow-x-auto bg-white border border-slate-200 shadow-sm rounded-lg">
        <table className="min-w-full text-sm text-left whitespace-nowrap">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-5 py-3 text-[10px] uppercase tracking-wider font-bold text-slate-500">Lead</th>
              <th className="px-5 py-3 text-[10px] uppercase tracking-wider font-bold text-slate-500">From</th>
              <th className="px-5 py-3 text-[10px] uppercase tracking-wider font-bold text-slate-500">To</th>
              <th className="px-5 py-3 text-[10px] uppercase tracking-wider font-bold text-slate-500">Note</th>
              <th className="px-5 py-3 text-[10px] uppercase tracking-wider font-bold text-slate-500">Requested</th>
              <th className="px-5 py-3 text-[10px] uppercase tracking-wider font-bold text-slate-500">Status</th>
              {tab === "pending" && (
                <th className="px-5 py-3 text-[10px] uppercase tracking-wider font-bold text-slate-500">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading && (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-slate-400 text-xs">Loading...</td>
              </tr>
            )}
            {!isLoading && rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-slate-400 text-xs">No records found.</td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r._id} className="hover:bg-slate-50/80">
                <td className="px-5 py-3 font-semibold text-slate-800">{r.leadName}</td>
                <td className="px-5 py-3 text-slate-600">{r.fromSalesmanName}</td>
                <td className="px-5 py-3 text-slate-600">{r.toSalesmanName}</td>
                <td className="px-5 py-3 text-slate-500 max-w-xs truncate">{r.note || "—"}</td>
                <td className="px-5 py-3 text-slate-500 text-xs">
                  {new Date(r.createdAt).toLocaleString()}
                </td>
                <td className="px-5 py-3">
                  <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded border ${statusColor(r.status)}`}>
                    {r.status}
                  </span>
                </td>
                {tab === "pending" && (
                  <td className="px-5 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => approveMutation.mutate(r._id)}
                        disabled={approveMutation.isPending}
                        className="px-3 py-1.5 rounded bg-emerald-600 text-white text-[11px] font-bold hover:bg-emerald-700 disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => rejectMutation.mutate(r._id)}
                        disabled={rejectMutation.isPending}
                        className="px-3 py-1.5 rounded border border-red-200 text-red-600 text-[11px] font-bold hover:bg-red-50 disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}