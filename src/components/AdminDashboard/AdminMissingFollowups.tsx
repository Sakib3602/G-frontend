import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosAdmin from "@/uri/useAxiosAdmin";
import { FiArrowLeft, FiX, FiClock, FiMail, FiPhone } from "react-icons/fi";

interface MissedReminder {
  _id: string;
  leadId: string;
  leadName?: string;
  companyName?: string;
  email?: string;
  phone?: string;
  status?: string;
  reminderAt: string;
  reminderNote?: string;
}

interface DayGroup {
  date: string;
  count: number;
  reminders: MissedReminder[];
}

interface MissedFollowupsResponse {
  groupedByDay: DayGroup[];
  summary: { totalMissed: number };
}

const formatDayLabel = (dateStr: string) => {
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);

  const diffDays = Math.round((today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";

  return date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" });
};

const getStatusColor = (status?: string) => {
  switch (status) {
    case "Contacted":
      return "bg-orange-50 text-orange-700 border-orange-200";
    case "New Lead":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "In Progress":
      return "bg-purple-50 text-purple-700 border-purple-200";
    case "Qualified":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "Unqualified":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
};

const AdminMissingFollowups = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const axiosAdmin = useAxiosAdmin();
  const queryClient = useQueryClient();

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const hasDateFilter = !!(startDate || endDate);
  const clearDateFilter = () => {
    setStartDate("");
    setEndDate("");
  };

  const { data, isLoading, isError } = useQuery<MissedFollowupsResponse>({
    queryKey: ["missed-followups", id, startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);

      const res = await axiosAdmin.get(`/missed-followups/${id}?${params.toString()}`);
      return res.data;
    },
    enabled: !!id,
  });

  const mutationClearReminder = useMutation({
    mutationFn: async (reportId: string) => {
      const res = await axiosAdmin.put(`/clear-reminder/${reportId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["missed-followups", id] });
    },
  });

  const groupedByDay = data?.groupedByDay ?? [];
  const totalMissed = data?.summary.totalMissed ?? 0;

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen text-[#1E293B]">
      <button
        onClick={() => navigate(-1)}
        className="cursor-pointer flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-black mb-4"
      >
        <FiArrowLeft /> Back to Salesman Details
      </button>

      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Missed Follow-ups</h1>
          <p className="text-sm text-gray-500 mt-1">
            Reminders that passed their deadline without follow-up.{" "}
            <span className="font-semibold text-rose-600">{totalMissed} total</span>
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg shadow-sm px-3 py-2 w-fit">
          <div className="flex flex-col">
            <label className="text-[9px] font-bold uppercase text-gray-400 tracking-wider">From</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              max={endDate || undefined}
              className="text-sm font-medium focus:outline-none w-32.5 cursor-pointer"
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
              className="text-sm font-medium focus:outline-none w-32.5 cursor-pointer"
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
      </div>

      {isLoading && <p className="text-sm text-gray-400">Loading missed follow-ups...</p>}

      {isError && (
        <div className="p-10 text-center border border-red-200 bg-red-50 rounded-xl mt-6 max-w-lg mx-auto">
          <p className="text-sm font-bold text-red-700">Unable to load data</p>
        </div>
      )}

      {!isLoading && !isError && groupedByDay.length === 0 && (
        <div className="p-16 text-center border-2 border-dashed border-slate-300 bg-white rounded-2xl mt-6">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">All Clear</p>
          <p className="text-base text-slate-500 mt-2">No missed follow-ups in the selected range.</p>
        </div>
      )}

      {!isLoading && !isError && groupedByDay.length > 0 && (
        <div className="space-y-8">
          {groupedByDay.map((group) => (
            <div key={group.date}>
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-sm font-bold text-slate-800">{formatDayLabel(group.date)}</h2>
                <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                  {group.count} missed
                </span>
                <span className="flex-1 h-px bg-slate-200"></span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.reminders.map((reminder) => (
                  <div
                    key={reminder._id}
                    className="bg-white border border-rose-100 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-rose-200 transition-all"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-slate-900 text-sm">{reminder.leadName || "Unknown Lead"}</h3>
                      {reminder.status && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusColor(reminder.status)}`}>
                          {reminder.status}
                        </span>
                      )}
                    </div>

                    {reminder.companyName && (
                      <p className="text-xs text-slate-500 mb-2">{reminder.companyName}</p>
                    )}

                    <div className="flex items-center gap-1.5 text-[11px] text-rose-600 font-semibold mb-2">
                      <FiClock size={12} />
                      Reminder was set for{" "}
                      {new Date(reminder.reminderAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>

                    {reminder.reminderNote && (
                      <p className="text-xs text-slate-600 bg-slate-50 border border-slate-100 rounded-lg p-2 mb-2">
                        {reminder.reminderNote}
                      </p>
                    )}

                    <div className="flex flex-col gap-1 pt-2 border-t border-slate-100 mt-2">
                      {reminder.email && (
                        <a href={`mailto:${reminder.email}`} className="flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-slate-800 font-mono">
                          <FiMail size={11} /> {reminder.email}
                        </a>
                      )}
                      {reminder.phone && (
                        <span className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
                          <FiPhone size={11} /> {reminder.phone}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => mutationClearReminder.mutate(reminder._id)}
                      disabled={mutationClearReminder.isPending}
                      className="w-full mt-3 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold hover:bg-emerald-100 transition-colors disabled:opacity-50"
                    >
                      ✓ Mark as Followed Up
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminMissingFollowups;