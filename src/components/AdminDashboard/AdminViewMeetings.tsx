import { useParams, useNavigate } from "react-router";
import { useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import useAxiosAdmin from "@/uri/useAxiosAdmin";
import { FiArrowLeft, FiX, FiChevronDown, FiArrowUp, FiArrowDown } from "react-icons/fi";

interface Meeting {
  _id: string;
  title: string;
  leadId: string;
  clientName: string;
  clientEmail: string;
  meetingDate: string;
  meetingTime: string;
  meetingType: string;
  agenda?: string;
  notes?: string;
  status: string;
  createdAt: string;
}

interface MeetingsPage {
  success: boolean;
  data: Meeting[];
  nextCursor: string | null;
  hasMore: boolean;
  availableStatuses: string[];
  summary: {
    totalMeetings: number;
    meetingsByStatus: Record<string, number>;
  };
}

const PAGE_SIZE = 20;

const formatDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "-";

const statusColor = (status: string) => {
  const map: Record<string, string> = {
    completed: "bg-emerald-50 text-emerald-600 border border-emerald-200",
    pending: "bg-amber-50 text-amber-600 border border-amber-200",
    cancelled: "bg-rose-50 text-rose-600 border border-rose-200",
  };
  return map[status] || "bg-gray-100 text-gray-600 border border-gray-200";
};

const typeColor = (type: string) => {
  const map: Record<string, string> = {
    online: "bg-blue-50 text-blue-600 border border-blue-200",
    "in-person": "bg-purple-50 text-purple-600 border border-purple-200",
  };
  return map[type] || "bg-gray-100 text-gray-600 border border-gray-200";
};

const SummaryCard = ({ label, value }: { label: string; value: string }) => (
  <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
    <p className="text-[11px] font-bold uppercase text-gray-400 tracking-wider mb-2">{label}</p>
    <p className="text-xl font-bold text-[#1E293B]">{value}</p>
  </div>
);

// ✅ Component render এর বাইরে
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
      {sortBy === field &&
        (sortOrder === "asc" ? <FiArrowUp size={12} /> : <FiArrowDown size={12} />)}
    </span>
  </th>
);

const AdminViewMeetings = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const axiosAdmin = useAxiosAdmin();

  const [status, setStatus] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortBy, setSortBy] = useState("meetingDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery<MeetingsPage>({
    queryKey: ["meetings-by-salesman", id, status, startDate, endDate, sortBy, sortOrder],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams();
      params.set("status", status);
      params.set("sortBy", sortBy);
      params.set("sortOrder", sortOrder);
      params.set("limit", String(PAGE_SIZE));
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);
      if (pageParam) params.set("cursor", pageParam as string);

      const res = await axiosAdmin.get(`/meetings-by-salesman/${id}?${params.toString()}`);
      return res.data;
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
    enabled: !!id,
  });

  const meetings = data?.pages.flatMap((p) => p.data) || [];
  const summary = data?.pages[0]?.summary;
  const availableStatuses = data?.pages[0]?.availableStatuses || [];
  const hasDateFilter = !!(startDate || endDate);

  const clearDateFilter = () => {
    setStartDate("");
    setEndDate("");
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
      <button
        onClick={() => navigate(-1)}
        className="cursor-pointer flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-black mb-4"
      >
        <FiArrowLeft /> Back
      </button>

      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Meetings</h1>
          <p className="text-sm text-gray-500 mt-1">All meetings scheduled by this salesman.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg shadow-sm px-3 py-2 w-fit">
            <div className="flex flex-col">
              <label className="text-[9px] font-bold uppercase text-gray-400 tracking-wider">From</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                max={endDate || undefined}
                className="text-sm font-medium focus:outline-none w-[130px] cursor-pointer"
              />
            </div>
            <span className="text-gray-300">→</span>
            <div className="flex flex-col">
              <label className="text-[9px] font-bold uppercase text-gray-400 tracking-wider">To</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || undefined}
                className="text-sm font-medium focus:outline-none w-[130px] cursor-pointer"
              />
            </div>
            {hasDateFilter && (
              <button
                onClick={clearDateFilter}
                title="Clear date filter"
                className="text-gray-400 hover:text-rose-500 transition-colors ml-1"
              >
                <FiX size={16} />
              </button>
            )}
          </div>

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
          <SummaryCard label="Total Meetings" value={String(summary.totalMeetings)} />
          {Object.entries(summary.meetingsByStatus)
            .slice(0, 3)
            .map(([st, count]) => (
              <SummaryCard key={st} label={st} value={String(count)} />
            ))}
        </div>
      )}

      <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[960px]">
            <thead className="bg-gray-50/80">
              <tr>
                <th className="p-4 text-[11px] font-bold uppercase text-gray-400 tracking-wider">#</th>
                <th className="p-4 text-[11px] font-bold uppercase text-gray-400 tracking-wider">Title</th>
                <SortHeader field="clientName" label="Client" sortBy={sortBy} sortOrder={sortOrder} onSort={toggleSort} />
                <th className="p-4 text-[11px] font-bold uppercase text-gray-400 tracking-wider">Email</th>
                <SortHeader field="meetingDate" label="Date" sortBy={sortBy} sortOrder={sortOrder} onSort={toggleSort} />
                <th className="p-4 text-[11px] font-bold uppercase text-gray-400 tracking-wider">Time</th>
                <th className="p-4 text-[11px] font-bold uppercase text-gray-400 tracking-wider">Type</th>
                <th className="p-4 text-[11px] font-bold uppercase text-gray-400 tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 8 }).map((__, j) => (
                      <td key={j} className="p-4">
                        <div className="h-4 bg-gray-100 rounded w-3/4" />
                      </td>
                    ))}
                  </tr>
                ))}

              {!isLoading && meetings.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-sm text-gray-400">
                    No meetings found for this filter.
                  </td>
                </tr>
              )}

              {!isLoading &&
                meetings.map((m, idx) => (
                  <tr key={m._id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="p-4 text-sm font-medium text-gray-400">{idx + 1}</td>
                    <td className="p-4 text-sm font-semibold">{m.title}</td>
                    <td className="p-4 text-sm">{m.clientName}</td>
                    <td className="p-4 text-sm text-gray-500">{m.clientEmail}</td>
                    <td className="p-4 text-xs text-gray-500 whitespace-nowrap">{formatDate(m.meetingDate)}</td>
                    <td className="p-4 text-sm font-mono">{m.meetingTime}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full ${typeColor(m.meetingType)}`}>
                        {m.meetingType}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full ${statusColor(m.status)}`}>
                        {m.status}
                      </span>
                    </td>
                  </tr>
                ))}
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
    </div>
  );
};

export default AdminViewMeetings;