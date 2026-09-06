import { useParams, useNavigate } from "react-router";
import { useEffect, useRef, useState } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import useAxiosAdmin from "@/uri/useAxiosAdmin";
import { FiArrowLeft, FiX, FiChevronDown, FiArrowUp, FiArrowDown, FiClock } from "react-icons/fi";

interface INoteEntry {
  _id?: string;
  text: string;
  createdAt?: string;
  createdBy?: string;
  channel?: "call" | "whatsapp";
  callType?: "picked" | "missed";
  callMinutes?: number;
}

interface Lead {
  _id: string;
  leadName: string;
  owner?: string;
  status: string;
  indications?: string;
  indicationsHistory?: INoteEntry[];
  companyName?: string;
  leadScore: number;
  email?: string;
  phone?: string;
  title?: string;
  specificRole?: string;
  region?: string;
  profileUrl?: string;
  linkedin?: string;
  proposalSent: boolean;
  proposalLink?: string;
  ServiceNeed?: string;
  assignedToMarketer?: string;
  source?: string;
  dealmoney?: number;
  reminderAt?: string | null;
  reminderNote?: string;
  missedCallCount?: number;
  createdAt: string;
  updatedAt?: string;
}

interface LeadsPage {
  success: boolean;
  data: Lead[];
  nextCursor: string | null;
  hasMore: boolean;
  availableStatuses: string[];
  summary: {
    totalLeads: number;
    totalRevenue: number;
    proposalSentCount: number;
    avgLeadScore: number;
  };
}

interface TimelineEvent {
  type: "status_change" | "note" | "meeting";
  timestamp: string;
  data: any;
}

interface TimelineResponse {
  success: boolean;
  lead: { _id: string; leadName: string; status: string; createdAt: string };
  timeline: TimelineEvent[];
}

const PAGE_SIZE = 20;

const formatNumber = (n?: number) => new Intl.NumberFormat("en-BD").format(n || 0);
const formatDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "-";
const formatDateTime = (d?: string) =>
  d
    ? new Date(d).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

const msToDaysHours = (ms?: number | null) => {
  if (!ms || ms <= 0) return null;
  const totalHours = ms / (1000 * 60 * 60);
  const days = Math.floor(totalHours / 24);
  const hours = Math.round(totalHours % 24);
  if (days === 0) return `${hours}h`;
  return `${days}d ${hours}h`;
};

const statusColor = (status: string) => {
  const map: Record<string, string> = {
    "New Lead": "bg-blue-50 text-blue-600 border border-blue-200",
    Contacted: "bg-amber-50 text-amber-600 border border-amber-200",
    Qualified: "bg-emerald-50 text-emerald-600 border border-emerald-200",
    Lost: "bg-rose-50 text-rose-600 border border-rose-200",
  };
  return map[status] || "bg-gray-100 text-gray-600 border border-gray-200";
};

// ✅ নতুন — প্রতি lead-এর call/whatsapp/note activity বের করা
const getActivityStats = (lead: Lead) => {
  const history = lead.indicationsHistory || [];
  const whatsapp = history.filter((n) => n.channel === "whatsapp").length;
  const callsPicked = history.filter(
    (n) => (n.channel || "call") === "call" && (n.callType || "picked") === "picked",
  ).length;
  const callsMissed = lead.missedCallCount || history.filter((n) => n.callType === "missed").length;
  const totalMinutes = history.reduce((sum, n) => sum + (n.callMinutes || 0), 0);
  return { whatsapp, callsPicked, callsMissed, totalMinutes, notes: history.length };
};

const SummaryCard = ({ label, value, prefix = "" }: { label: string; value: string; prefix?: string }) => (
  <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
    <p className="text-[11px] font-bold uppercase text-gray-400 tracking-wider mb-2">{label}</p>
    <p className="text-xl font-bold text-[#1E293B]">
      {prefix}
      {value}
    </p>
  </div>
);

const SortHeader = ({
  field,
  label,
  sortBy,
  sortOrder,
  onSort,
}: {
  field: string;
  label: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSort: (field: string) => void;
}) => (
  <th
    onClick={() => onSort(field)}
    className="p-4 text-[11px] font-bold uppercase text-gray-400 tracking-wider cursor-pointer select-none hover:text-gray-600"
  >
    <span className="flex items-center gap-1">
      {label}
      {sortBy === field && (sortOrder === "asc" ? <FiArrowUp size={12} /> : <FiArrowDown size={12} />)}
    </span>
  </th>
);

// ✅ Full Details Modal (read-only)
const LeadDetailsModal = ({ lead, onClose }: { lead: Lead; onClose: () => void }) => {
  const [showNoteHistory, setShowNoteHistory] = useState(true);

  const sortedHistory = lead.indicationsHistory
    ? [...lead.indicationsHistory].sort(
        (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      )
    : [];

  const stats = getActivityStats(lead);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="absolute inset-0" onClick={onClose}></div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-2xl flex flex-col max-h-[88vh] relative z-10 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-start bg-white">
          <div>
            <h2 className="text-lg font-bold text-[#1E293B]">{lead.leadName}</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {lead.specificRole || lead.title || "Executive"}
              {lead.companyName ? ` • ${lead.companyName}` : ""}
            </p>
            <span className={`inline-block mt-2 px-2.5 py-1 text-[10px] font-bold uppercase rounded-full ${statusColor(lead.status)}`}>
              {lead.status}
            </span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900 p-1.5 rounded transition-colors">
            <FiX size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-gray-50/40 p-6 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Score</p>
              <p className="text-sm font-bold text-[#1E293B]">{lead.leadScore}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Deal Money</p>
              <p className="text-sm font-bold text-emerald-600">${formatNumber(lead.dealmoney)}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Proposal</p>
              <p className="text-sm font-bold text-[#1E293B]">{lead.proposalSent ? "Sent" : "Not Sent"}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Service</p>
              <p className="text-sm font-bold text-[#1E293B]">{lead.ServiceNeed || "—"}</p>
            </div>
          </div>

          {/* ✅ নতুন — Call/WhatsApp/Note activity summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Calls Picked</p>
              <p className="text-sm font-bold text-emerald-700">{stats.callsPicked}</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-1">Calls Missed</p>
              <p className="text-sm font-bold text-red-600">{stats.callsMissed}</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest mb-1">WhatsApp</p>
              <p className="text-sm font-bold text-green-700">{stats.whatsapp}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Call Minutes</p>
              <p className="text-sm font-bold text-[#1E293B]">{stats.totalMinutes}</p>
            </div>
          </div>

          {lead.proposalLink ? (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Proposal Link</p>
              <a
                href={lead.proposalLink}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-blue-600 hover:underline font-mono break-all"
              >
                {lead.proposalLink}
              </a>
            </div>
          ) : null}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">
                Contact Info
              </h3>
              <div>
                <p className="text-[10px] uppercase text-gray-400 font-bold mb-0.5">Email</p>
                <p className="text-sm text-[#1E293B] font-mono">{lead.email || "—"}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-gray-400 font-bold mb-0.5">Phone</p>
                <p className="text-sm text-[#1E293B] font-mono">{lead.phone || "—"}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-gray-400 font-bold mb-0.5">Profile URL</p>
                {lead.profileUrl ? (
                  <a href={lead.profileUrl} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline">
                    View Profile
                  </a>
                ) : (
                  <p className="text-sm text-[#1E293B]">—</p>
                )}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">
                Business Info
              </h3>
              <div>
                <p className="text-[10px] uppercase text-gray-400 font-bold mb-0.5">Territory / Region</p>
                <p className="text-sm text-[#1E293B]">{lead.region || "—"}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-gray-400 font-bold mb-0.5">Source</p>
                <p className="text-sm text-[#1E293B]">{lead.source || "—"}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-gray-400 font-bold mb-0.5">Created</p>
                <p className="text-sm text-[#1E293B]">{formatDateTime(lead.createdAt)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-gray-400 font-bold mb-0.5">Last Work</p>
                <p className="text-sm text-[#1E293B]">{formatDateTime(lead.updatedAt)}</p>
              </div>
            </div>
          </div>

          {lead.reminderAt ? (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h3 className="text-[10px] font-bold text-amber-700 uppercase tracking-widest mb-2">
                🔔 Follow-up Reminder
              </h3>
              <p className="text-sm text-amber-800 font-semibold">{formatDateTime(lead.reminderAt)}</p>
              {lead.reminderNote ? <p className="text-xs text-amber-700 mt-1">{lead.reminderNote}</p> : null}
            </div>
          ) : null}

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <button
              type="button"
              onClick={() => setShowNoteHistory((prev) => !prev)}
              className="w-full flex items-center justify-between border-b border-gray-100 pb-2 mb-3"
            >
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Follow-up History {lead.indicationsHistory?.length ? `(${lead.indicationsHistory.length})` : ""}
              </h3>
              <span className="text-gray-400 text-xs">{showNoteHistory ? "▲" : "▼"}</span>
            </button>

            {showNoteHistory ? (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {sortedHistory.length === 0 ? (
                  <p className="text-xs text-gray-400 italic py-2">
                    No follow-up notes added yet.
                    {lead.indications ? ` Previous note: "${lead.indications}"` : ""}
                  </p>
                ) : (
                  sortedHistory.map((entry, idx) => (
                    <div key={entry._id || idx} className="bg-gray-50 border border-gray-100 rounded-lg p-3">
                      <p className="text-xs text-[#1E293B]">{entry.text}</p>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="text-[10px] text-gray-400 font-mono">
                          {entry.createdAt ? formatDateTime(entry.createdAt) : ""}
                        </span>
                        {entry.createdBy ? (
                          <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-semibold">
                            {entry.createdBy}
                          </span>
                        ) : null}
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
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

// ✅ Timeline Modal
const eventStyle = (type: TimelineEvent["type"]) => {
  const map: Record<TimelineEvent["type"], { dot: string; label: string; badge: string }> = {
    status_change: { dot: "bg-indigo-500", label: "Status Change", badge: "bg-indigo-50 text-indigo-600 border-indigo-200" },
    note: { dot: "bg-emerald-500", label: "Note Added", badge: "bg-emerald-50 text-emerald-600 border-emerald-200" },
    meeting: { dot: "bg-amber-500", label: "Meeting Scheduled", badge: "bg-amber-50 text-amber-600 border-amber-200" },
  };
  return map[type];
};

const LeadTimelineModal = ({ leadId, leadName, onClose }: { leadId: string; leadName: string; onClose: () => void }) => {
  const axiosAdmin = useAxiosAdmin();

  const { data, isLoading, isError } = useQuery<TimelineResponse>({
    queryKey: ["lead-timeline", leadId],
    queryFn: async () => {
      const res = await axiosAdmin.get(`/lead-timeline/${leadId}`);
      return res.data;
    },
    enabled: !!leadId,
  });

  const timeline = data?.timeline || [];

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="absolute inset-0" onClick={onClose}></div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-xl flex flex-col max-h-[88vh] relative z-10 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-start bg-white">
          <div>
            <h2 className="text-lg font-bold text-[#1E293B] flex items-center gap-2">
              <FiClock className="text-gray-400" /> Activity Timeline
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">{leadName}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900 p-1.5 rounded transition-colors">
            <FiX size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-gray-50/40 p-6">
          {isLoading && <p className="text-sm text-gray-400 text-center py-10">Loading timeline...</p>}
          {isError && <p className="text-sm text-rose-500 text-center py-10">Failed to load timeline.</p>}

          {!isLoading && !isError && timeline.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-10">No activity recorded for this lead yet.</p>
          )}

          {!isLoading && !isError && timeline.length > 0 && (
            <div className="relative pl-6">
              <div className="absolute left-1.75 top-1 bottom-1 w-px bg-gray-200"></div>

              <div className="space-y-5">
                {timeline.map((event, idx) => {
                  const style = eventStyle(event.type);
                  return (
                    <div key={idx} className="relative">
                      <span
                        className={`absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 border-white shadow ${style.dot}`}
                      ></span>

                      <div className="bg-white border border-gray-200 rounded-lg p-3.5">
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${style.badge}`}
                          >
                            {style.label}
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono whitespace-nowrap">
                            {formatDateTime(event.timestamp)}
                          </span>
                        </div>

                        {event.type === "status_change" && (
                          <div>
                            <p className="text-sm text-[#1E293B]">
                              {event.data.fromStatus ? (
                                <>
                                  <span className="font-semibold">{event.data.fromStatus}</span>
                                  <span className="mx-1.5 text-gray-400">→</span>
                                  <span className="font-semibold">{event.data.toStatus}</span>
                                </>
                              ) : (
                                <>
                                  Lead created with status{" "}
                                  <span className="font-semibold">{event.data.toStatus}</span>
                                </>
                              )}
                            </p>
                            {event.data.durationMs ? (
                              <p className="text-[11px] text-gray-400 mt-1">
                                Spent{" "}
                                <span className="font-semibold text-gray-600">
                                  {msToDaysHours(event.data.durationMs)}
                                </span>{" "}
                                in previous status
                              </p>
                            ) : null}
                          </div>
                        )}

                        {event.type === "note" && (
                          <div>
                            <p className="text-sm text-[#1E293B]">{event.data.text}</p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              {event.data.createdBy ? (
                                <p className="text-[11px] text-gray-400">by {event.data.createdBy}</p>
                              ) : null}
                              {event.data.channel === "whatsapp" ? (
                                <span className="text-[10px] bg-green-50 text-green-600 border border-green-200 px-1.5 py-0.5 rounded font-semibold">
                                  💬 WhatsApp
                                </span>
                              ) : event.data.callType === "missed" ? (
                                <span className="text-[10px] bg-red-50 text-red-600 border border-red-200 px-1.5 py-0.5 rounded font-semibold">
                                  📞 Missed Call
                                </span>
                              ) : event.data.callMinutes ? (
                                <span className="text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-200 px-1.5 py-0.5 rounded font-semibold">
                                  📞 {event.data.callMinutes} min
                                </span>
                              ) : null}
                            </div>
                          </div>
                        )}

                        {event.type === "meeting" && (
                          <div>
                            <p className="text-sm text-[#1E293B] font-semibold">{event.data.title || "Meeting"}</p>
                            <p className="text-[11px] text-gray-500 mt-0.5">
                              {event.data.meetingDate} at {event.data.meetingTime} •{" "}
                              {event.data.meetingType === "online" ? "Virtual" : "In-Person"}
                            </p>
                            <span className="inline-block mt-1 text-[10px] font-bold uppercase text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                              {event.data.status || "scheduled"}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AdminViewLeads = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const axiosAdmin = useAxiosAdmin();

  const [status, setStatus] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // ✅ "Today's Work" টগল
  const [todayWork, setTodayWork] = useState(false);

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [timelineLead, setTimelineLead] = useState<{ id: string; name: string } | null>(null);

  // ✅ ফিক্সড বটম স্ক্রলবার — ref ও state
  const tableScrollRef = useRef<HTMLDivElement>(null);
  const bottomScrollRef = useRef<HTMLDivElement>(null);
  const [scrollWidth, setScrollWidth] = useState(0);
  const [barRect, setBarRect] = useState<{ left: number; width: number } | null>(null);

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery<LeadsPage>({
    queryKey: ["leads-by-salesman", id, status, startDate, endDate, sortBy, sortOrder, todayWork],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams();
      params.set("status", status);
      params.set("sortBy", sortBy);
      params.set("sortOrder", sortOrder);
      params.set("limit", String(PAGE_SIZE));

      if (todayWork) {
        params.set("todayWork", "true");
      } else {
        if (startDate) params.set("startDate", startDate);
        if (endDate) params.set("endDate", endDate);
      }

      if (pageParam) params.set("cursor", pageParam as string);

      const res = await axiosAdmin.get(`/leads-by-salesman/${id}?${params.toString()}`);
      return res.data;
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
    enabled: !!id,
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const leads = data?.pages.flatMap((p) => p.data) || [];
  const summary = data?.pages[0]?.summary;
  const availableStatuses = data?.pages[0]?.availableStatuses || [];
  const hasDateFilter = !!(startDate || endDate);

  useEffect(() => {
    const updateMeasurements = () => {
      if (tableScrollRef.current) {
        const rect = tableScrollRef.current.getBoundingClientRect();
        setBarRect({ left: rect.left, width: rect.width });
        setScrollWidth(tableScrollRef.current.scrollWidth);
      }
    };
    updateMeasurements();
    window.addEventListener("resize", updateMeasurements);
    const interval = setInterval(updateMeasurements, 500);
    return () => {
      window.removeEventListener("resize", updateMeasurements);
      clearInterval(interval);
    };
  }, [leads]);

  const syncFromBottomBar = (e: React.UIEvent<HTMLDivElement>) => {
    if (tableScrollRef.current) tableScrollRef.current.scrollLeft = e.currentTarget.scrollLeft;
  };
  const syncFromTable = (e: React.UIEvent<HTMLDivElement>) => {
    if (bottomScrollRef.current) bottomScrollRef.current.scrollLeft = e.currentTarget.scrollLeft;
  };

  const clearDateFilter = () => {
    setStartDate("");
    setEndDate("");
  };

  const toggleTodayWork = () => {
    setTodayWork((prev) => {
      const next = !prev;
      if (next) {
        setStartDate("");
        setEndDate("");
      }
      return next;
    });
  };

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen text-[#1E293B]">
      <style>{`
        .hidden-native-scrollbar::-webkit-scrollbar { display: none; }
        .hidden-native-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .thin-scrollbar::-webkit-scrollbar { height: 8px; }
        .thin-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .thin-scrollbar::-webkit-scrollbar-thumb { background: #94a3b8; border-radius: 9999px; }
        .thin-scrollbar::-webkit-scrollbar-thumb:hover { background: #64748b; }
        .thin-scrollbar { scrollbar-width: thin; scrollbar-color: #94a3b8 transparent; }
      `}</style>

      <button
        onClick={() => navigate(-1)}
        className="cursor-pointer flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-black mb-4"
      >
        <FiArrowLeft /> Back
      </button>

      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Leads</h1>
          <p className="text-sm text-gray-500 mt-1">All leads created by this salesman.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg shadow-sm px-3 py-2 w-fit">
            <div className="flex flex-col">
              <label className="text-[9px] font-bold uppercase text-gray-400 tracking-wider">From</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  if (todayWork) setTodayWork(false);
                }}
                max={endDate || undefined}
                disabled={todayWork}
                className="text-sm font-medium focus:outline-none w-32.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <span className="text-gray-300">→</span>
            <div className="flex flex-col">
              <label className="text-[9px] font-bold uppercase text-gray-400 tracking-wider">To</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  if (todayWork) setTodayWork(false);
                }}
                min={startDate || undefined}
                disabled={todayWork}
                className="text-sm font-medium focus:outline-none w-32.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            {hasDateFilter && !todayWork && (
              <button
                onClick={clearDateFilter}
                title="Clear date filter"
                className="text-gray-400 hover:text-rose-500 transition-colors ml-1"
              >
                <FiX size={16} />
              </button>
            )}
          </div>

          <button
            onClick={toggleTodayWork}
            className={`px-4 py-2.5 rounded-lg text-sm font-semibold shadow-sm border transition-colors whitespace-nowrap ${
              todayWork
                ? "bg-[#1E293B] text-white border-[#1E293B]"
                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
            }`}
          >
            {todayWork ? "✓ Today's Work" : "Today's Work"}
          </button>

          <div className="relative w-fit">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="appearance-none bg-white border border-gray-200 text-sm font-semibold px-4 py-2.5 pr-9 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-200 cursor-pointer"
            >
              <option value="all">All Status</option>
              {availableStatuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <FiChevronDown className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <SummaryCard label="Total Leads" value={formatNumber(summary.totalLeads)} />
          <SummaryCard label="Total Revenue" value={formatNumber(summary.totalRevenue)} prefix="$" />
          <SummaryCard label="Proposals Sent" value={formatNumber(summary.proposalSentCount)} />
          <SummaryCard label="Avg Lead Score" value={formatNumber(summary.avgLeadScore)} />
        </div>
      )}

      <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm bg-white">
        <div ref={tableScrollRef} onScroll={syncFromTable} className="overflow-x-auto hidden-native-scrollbar">
          <table className="w-full text-left border-collapse min-w-260">
            <thead className="bg-gray-50/80">
              <tr>
                <th className="p-4 text-[11px] font-bold uppercase text-gray-400 tracking-wider">#</th>
                <SortHeader field="leadName" label="Lead Name" sortBy={sortBy} sortOrder={sortOrder} onSort={toggleSort} />
                <SortHeader field="companyName" label="Company" sortBy={sortBy} sortOrder={sortOrder} onSort={toggleSort} />
                <th className="p-4 text-[11px] font-bold uppercase text-gray-400 tracking-wider">Service</th>
                <SortHeader field="leadScore" label="Score" sortBy={sortBy} sortOrder={sortOrder} onSort={toggleSort} />
                <th className="p-4 text-[11px] font-bold uppercase text-gray-400 tracking-wider">Proposal</th>
                <SortHeader field="updatedAt" label="Last Work" sortBy={sortBy} sortOrder={sortOrder} onSort={toggleSort} />
                <SortHeader field="createdAt" label="Created" sortBy={sortBy} sortOrder={sortOrder} onSort={toggleSort} />
                <th className="p-4 text-[11px] font-bold uppercase text-gray-400 tracking-wider">Status</th>
                <th className="p-4 text-[11px] font-bold uppercase text-gray-400 tracking-wider text-right">Timeline</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 10 }).map((__, j) => (
                      <td key={j} className="p-4">
                        <div className="h-4 bg-gray-100 rounded w-3/4" />
                      </td>
                    ))}
                  </tr>
                ))}

              {!isLoading && leads.length === 0 && (
                <tr>
                  <td colSpan={10} className="p-10 text-center text-sm text-gray-400">
                    No leads found for this filter.
                  </td>
                </tr>
              )}

              {!isLoading &&
                leads.map((l, idx) => {
                  const stats = getActivityStats(l);
                  return (
                    <tr
                      key={l._id}
                      onClick={() => setSelectedLead(l)}
                      className="hover:bg-gray-50/60 transition-colors cursor-pointer"
                    >
                      <td className="p-4 text-sm font-medium text-gray-400">{idx + 1}</td>
                      <td className="p-4 text-sm font-semibold">
                        {l.leadName}
                        {l.reminderAt && (
                          <span className="ml-2 text-[10px] font-mono font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                            🔔 {formatDate(l.reminderAt)}
                          </span>
                        )}
                        <div className="mt-1 flex flex-wrap gap-1">
                          {stats.callsPicked > 0 && (
                            <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                              📞 {stats.callsPicked} picked{stats.totalMinutes ? ` · ${stats.totalMinutes}m` : ""}
                            </span>
                          )}
                          {stats.callsMissed > 0 && (
                            <span className="text-[10px] font-mono font-bold text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">
                              📞 {stats.callsMissed} missed
                            </span>
                          )}
                          {stats.whatsapp > 0 && (
                            <span className="text-[10px] font-mono font-bold text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded">
                              💬 {stats.whatsapp}
                            </span>
                          )}
                          {stats.notes > 0 && (
                            <span className="text-[10px] font-mono font-bold text-slate-600 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
                              📝 {stats.notes} notes
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-sm">{l.companyName || "-"}</td>
                      <td className="p-4 text-sm">{l.ServiceNeed || "-"}</td>
                      <td className="p-4 text-sm font-mono">{l.leadScore}</td>
                      <td className="p-4 text-sm">
                        {l.proposalSent ? (
                          <span className="text-emerald-600 font-semibold">Yes</span>
                        ) : (
                          <span className="text-gray-400">No</span>
                        )}
                      </td>
                      <td className="p-4 text-xs text-gray-500 whitespace-nowrap">{formatDate(l.updatedAt)}</td>
                      <td className="p-4 text-xs text-gray-500 whitespace-nowrap">{formatDate(l.createdAt)}</td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full ${statusColor(l.status)}`}
                        >
                          {l.status}
                        </span>
                      </td>
                      <td className="p-4 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setTimelineLead({ id: l._id, name: l.leadName });
                          }}
                          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1"
                        >
                          <FiClock size={12} /> Timeline
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {hasNextPage && (
          <div className="flex justify-center py-4 border-t border-gray-100">
            <button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="rounded-lg border border-gray-200 bg-white px-6 py-2.5 text-sm font-semibold text-[#1E293B] shadow-sm transition hover:bg-gray-50 disabled:opacity-60"
            >
              {isFetchingNextPage ? "Loading..." : "Load More"}
            </button>
          </div>
        )}
      </div>

      {barRect && scrollWidth > barRect.width + 4 && (
        <div
          style={{ position: "fixed", bottom: 0, left: barRect.left, width: barRect.width, zIndex: 40 }}
          className="bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-[0_-2px_6px_rgba(0,0,0,0.04)]"
        >
          <div
            ref={bottomScrollRef}
            onScroll={syncFromBottomBar}
            className="overflow-x-auto thin-scrollbar"
            style={{ height: 14 }}
          >
            <div style={{ width: scrollWidth, height: 1 }} />
          </div>
        </div>
      )}

      {selectedLead && <LeadDetailsModal lead={selectedLead} onClose={() => setSelectedLead(null)} />}
      {timelineLead && (
        <LeadTimelineModal
          leadId={timelineLead.id}
          leadName={timelineLead.name}
          onClose={() => setTimelineLead(null)}
        />
      )}
    </div>
  );
};

export default AdminViewLeads;