import { useState } from "react";
import useAxiosSales from "@/uri/useAxiosSales";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Notification from "../ui/toast";
import { useUserData } from "./Sales_Hook/User_Data";

export interface INoteEntry {
  _id?: string;
  text: string;
  createdAt?: string;
  createdBy?: string;
  channel?: "call" | "whatsapp";
  callType?: "picked" | "missed";
  callMinutes?: number;
}

export interface LeadData {
  id: string;
  _id: string;
  leadName: string;
  status: string;
  indicationsHistory?: INoteEntry[];
  companyName: string;
  email: string;
  phone: string;
  ServiceNeed?: string;
  updatedAt?: string;
  missedCallCount?: number;
}

interface MissedCallLeadsResponse {
  data: LeadData[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

const PAGE_LIMIT = 30;

export default function Sales_Missed_Calls() {
  const axiosSales = useAxiosSales();
  const queryClient = useQueryClient();
  const { userData } = useUserData();

  const [page, setPage] = useState(1);

  const [showNoti, setShowNoti] = useState(false);

  // Notes modal state (একই রকম Call/WhatsApp ফিচার)
  const [noteLead, setNoteLead] = useState<LeadData | null>(null);
  const [newNoteText, setNewNoteText] = useState("");
  const [noteChannel, setNoteChannel] = useState<"call" | "whatsapp">("call");
  const [callMinutes, setCallMinutes] = useState("");

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const { data, isLoading, isError } = useQuery<MissedCallLeadsResponse>({
    queryKey: ["missed-call-leads", userData?._id, page],
    queryFn: async () => {
      const res = await axiosSales.get(
        `/api/v1/sales/get-missed-call-leads/${userData._id}`,
        { params: { page, limit: PAGE_LIMIT } },
      );
      return res.data;
    },
    enabled: !!userData?._id,
    placeholderData: (prev) => prev,
  });

  const leads = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;
  const totalCount = data?.totalCount ?? 0;

  const openNotePopup = (lead: LeadData) => {
    setNoteLead(lead);
    setNewNoteText("");
    setNoteChannel("call");
    setCallMinutes("");
  };

  const closeNotePopup = () => {
    setNoteLead(null);
    setNewNoteText("");
    setCallMinutes("");
  };

  const mutationAddNote = useMutation({
    mutationFn: async ({
      leadId,
      text,
      channel,
      callMinutes,
    }: {
      leadId: string;
      text: string;
      channel: "call" | "whatsapp";
      callMinutes?: string;
    }) => {
      const res = await axiosSales.post(`/api/v1/sales/add-note/${leadId}`, {
        text,
        createdBy: userData?.name || "Sales",
        channel,
        callMinutes: channel === "call" ? callMinutes : undefined,
        salesmanId: userData?._id,
      });
      return res.data;
    },
    onSuccess: () => {
  
      queryClient.invalidateQueries({ queryKey: ["missed-call-leads"] });
      queryClient.invalidateQueries({ queryKey: ["my-leads"] });
      setShowNoti(true);
      closeNotePopup();
    },
  });

  const mutationMissedCall = useMutation({
    mutationFn: async (leadId: string) => {
      const res = await axiosSales.put(
        `/api/v1/sales/log-missed-call/${leadId}`,
        {
          salesmanId: userData?._id,
          salesmanName: userData?.name,
        },
      );
      return res.data;
    },
    onSuccess: (resData) => {
      queryClient.invalidateQueries({ queryKey: ["missed-call-leads"] });
      queryClient.invalidateQueries({ queryKey: ["my-leads"] });
      if (resData?.lead) setNoteLead(resData.lead);
    },
  });

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteLead || !newNoteText.trim()) return;
    if (noteChannel === "call" && !callMinutes) return;
    const leadId = noteLead._id || noteLead.id;
    mutationAddNote.mutate({
      leadId,
      text: newNoteText.trim(),
      channel: noteChannel,
      callMinutes,
    });
  };

  const goToPage = (p: number) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
  };

  const pageNumbers = () => {
    const nums: number[] = [];
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, start + 4);
    for (let i = start; i <= end; i++) nums.push(i);
    return nums;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-white">
        <div className="w-5 h-5 border-2 border-slate-200 border-t-[#99B562] rounded-full animate-spin"></div>
        <span className="mt-3 text-xs tracking-wider text-slate-400 uppercase font-medium">
          Fetching Missed Calls...
        </span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 max-w-md mx-auto mt-20 border border-red-100 rounded-lg text-center bg-white">
        <p className="text-sm font-semibold text-red-600">Connection Failed</p>
        <p className="text-xs text-slate-400 mt-1">
          Unable to load missed call leads.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="poppins-regular fixed top-4 right-4 z-50 space-y-2">
        {showNoti && (
          <Notification
            type="success"
            title="Note Added!"
            message="Follow-up note saved successfully."
            showIcon
            duration={3000}
            onClose={() => setShowNoti(false)}
          />
        )}
      </div>

      <div className="poppins-regular w-full min-h-screen bg-[#f8fafc] px-6 py-10 lg:px-14 font-sans text-slate-900 antialiased">
        <div className=" mx-auto">
          <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
            <div>
              <p className="text-[10px] tracking-widest text-red-500 uppercase font-bold mb-1">
                CRM Directory
              </p>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                Didn't Pick — Missed Calls
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Total leads with missed calls:{" "}
                <span className="font-semibold text-slate-800">
                  {totalCount}
                </span>
              </p>
            </div>
          </div>

          <div className="overflow-x-auto bg-white border border-slate-200 shadow-sm rounded-lg">
            <table className="min-w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3 text-[10px] uppercase tracking-wider font-bold text-slate-500">
                    Lead Name
                  </th>
                  <th className="px-5 py-3 text-[10px] uppercase tracking-wider font-bold text-slate-500">
                    Missed Count
                  </th>
                  <th className="px-5 py-3 text-[10px] uppercase tracking-wider font-bold text-slate-500">
                    Last Activity
                  </th>
                  <th className="px-5 py-3 text-[10px] uppercase tracking-wider font-bold text-slate-500">
                    Contact No.
                  </th>
                  <th className="px-5 py-3 text-[10px] uppercase tracking-wider font-bold text-slate-500">
                    Email Address
                  </th>
                  <th className="px-5 py-3 text-[10px] uppercase tracking-wider font-bold text-slate-500">
                    Company
                  </th>
                  <th className="px-5 py-3 text-[10px] uppercase tracking-wider font-bold text-slate-500 w-[1%]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leads.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-10 text-center text-slate-400 text-xs"
                    >
                      No missed call leads found.
                    </td>
                  </tr>
                )}

                {leads.map((lead) => (
                  <tr
                    key={lead._id || lead.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="px-5 py-3 font-semibold text-slate-800">
                      {lead.leadName}
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-[10px] font-mono font-bold text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">
                        📞 {lead.missedCallCount || 0} missed
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-600 font-medium text-xs">
                      {formatDate(lead.updatedAt)}
                    </td>
                    <td className="px-5 py-3 text-slate-500 text-xs font-mono">
                      {lead.phone || "—"}
                    </td>
                    <td className="px-5 py-3">
                      <a
                        href={`mailto:${lead.email}`}
                        className="text-slate-500 hover:text-slate-900 text-xs font-mono transition-colors"
                      >
                        {lead.email || "—"}
                      </a>
                    </td>
                    <td className="px-5 py-3 text-slate-600 font-medium text-xs">
                      {lead.companyName || "—"}
                    </td>
                    <td className="px-5 py-3 w-[1%]">
                      <button
                        onClick={() => openNotePopup(lead)}
                        className="whitespace-nowrap px-3 py-1.5 rounded border border-[#99B562]/30 bg-[#99B562]/10 hover:bg-[#99B562]/15 text-[#6f8a3f] text-[11px] font-bold transition-all shadow-xs"
                      >
                        Notes{" "}
                        {lead.indicationsHistory?.length
                          ? `(${lead.indicationsHistory.length})`
                          : ""}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* --- PAGINATION (30 per page) --- */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-1.5 py-4 border-t border-slate-100">
                <button
                  onClick={() => goToPage(page - 1)}
                  disabled={!data?.hasPrevPage}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Prev
                </button>

                {pageNumbers()[0] > 1 && (
                  <>
                    <button
                      onClick={() => goToPage(1)}
                      className="px-3 py-1.5 rounded text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      1
                    </button>
                    <span className="text-slate-400 text-xs">...</span>
                  </>
                )}

                {pageNumbers().map((p) => (
                  <button
                    key={p}
                    onClick={() => goToPage(p)}
                    className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                      p === page
                        ? "bg-[#99B562] text-white"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {p}
                  </button>
                ))}

                {pageNumbers()[pageNumbers().length - 1] < totalPages && (
                  <>
                    <span className="text-slate-400 text-xs">...</span>
                    <button
                      onClick={() => goToPage(totalPages)}
                      className="px-3 py-1.5 rounded text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      {totalPages}
                    </button>
                  </>
                )}

                <button
                  onClick={() => goToPage(page + 1)}
                  disabled={!data?.hasNextPage}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- NOTE MODAL (Call/WhatsApp + Didn't Pick) --- */}
      {noteLead && (
        <div className="fixed inset-0 z-80 flex items-center justify-center bg-slate-900/30 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="absolute inset-0" onClick={closeNotePopup}></div>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl relative z-10 overflow-hidden border border-slate-200 max-h-[85vh] flex flex-col">
            <div className="px-6 py-5 flex justify-between items-start border-b border-slate-100 bg-slate-50/50">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Follow-up History
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  All conversations with{" "}
                  <span className="font-bold text-slate-800">
                    {noteLead.leadName}
                  </span>{" "}
                  so far.
                </p>
              </div>
              <button
                onClick={closeNotePopup}
                className="text-slate-400 hover:text-slate-800 p-1 rounded transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-slate-50/40">
              {!noteLead.indicationsHistory ||
              noteLead.indicationsHistory.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-8">
                  No follow-up notes added yet.
                </p>
              ) : (
                [...noteLead.indicationsHistory]
                  .sort(
                    (a, b) =>
                      new Date(b.createdAt || 0).getTime() -
                      new Date(a.createdAt || 0).getTime(),
                  )
                  .map((entry, idx) => (
                    <div
                      key={entry._id || idx}
                      className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs"
                    >
                      <p className="text-sm text-slate-800">{entry.text}</p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className="text-[10px] text-slate-400 font-mono">
                          {entry.createdAt
                            ? new Date(entry.createdAt).toLocaleString()
                            : ""}
                        </span>
                        {entry.createdBy && (
                          <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-semibold">
                            {entry.createdBy}
                          </span>
                        )}
                        {entry.channel === "whatsapp" ? (
                          <span className="text-[10px] bg-green-50 text-green-600 border border-green-200 px-1.5 py-0.5 rounded font-semibold">
                            💬 WhatsApp
                          </span>
                        ) : entry.callType === "missed" ? (
                          <span className="text-[10px] bg-red-50 text-red-600 border border-red-200 px-1.5 py-0.5 rounded font-semibold">
                            📞 Missed Call
                          </span>
                        ) : entry.callMinutes ? (
                          <span className="text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-200 px-1.5 py-0.5 rounded font-semibold">
                            📞 {entry.callMinutes} min
                          </span>
                        ) : null}
                      </div>
                    </div>
                  ))
              )}
            </div>

            <form
              onSubmit={handleAddNote}
              className="p-4 border-t border-slate-100 bg-white space-y-2"
            >
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setNoteChannel("call")}
                  className={`px-3 py-1 rounded text-[11px] font-bold border transition-colors ${
                    noteChannel === "call"
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
                  }`}
                >
                  📞 Call
                </button>
                <button
                  type="button"
                  onClick={() => setNoteChannel("whatsapp")}
                  className={`px-3 py-1 rounded text-[11px] font-bold border transition-colors ${
                    noteChannel === "whatsapp"
                      ? "bg-green-600 text-white border-green-600"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
                  }`}
                >
                  💬 WhatsApp
                </button>
              </div>

              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                    {noteChannel === "whatsapp"
                      ? "What was discussed on WhatsApp"
                      : "What was discussed on the call"}
                  </label>
                  <textarea
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    rows={2}
                    placeholder="Write what was discussed today..."
                    className="w-full px-3 py-2 border border-slate-200 rounded text-sm text-slate-800 focus:outline-none focus:border-[#99B562] transition-colors resize-none"
                  />
                </div>
                {noteChannel === "call" && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                      Min <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={callMinutes}
                      onChange={(e) => setCallMinutes(e.target.value)}
                      placeholder="e.g. 5"
                      className="w-20 px-2 py-2 border border-slate-200 rounded text-sm focus:outline-none focus:border-[#99B562]"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center pt-1">
                <button
                  type="button"
                  onClick={() =>
                    mutationMissedCall.mutate(noteLead._id || noteLead.id)
                  }
                  disabled={mutationMissedCall.isPending}
                  className="px-3 py-1.5 rounded border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 text-[11px] font-bold transition-all disabled:opacity-50"
                >
                  {mutationMissedCall.isPending
                    ? "Logging..."
                    : "Didn't Pick (+)"}
                </button>
                <button
                  type="submit"
                  disabled={
                    mutationAddNote.isPending ||
                    !newNoteText.trim() ||
                    (noteChannel === "call" && !callMinutes)
                  }
                  className="px-4 py-2 rounded bg-[#99B562] text-white text-xs font-bold hover:bg-[#85a052] transition-colors disabled:opacity-40 whitespace-nowrap"
                >
                  {mutationAddNote.isPending ? "Adding..." : "Add Note"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}