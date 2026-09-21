"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import useAxiosAdmin from "@/uri/useAxiosAdmin";
import { 
  ChevronDown, 
  ChevronUp, 
  Trophy, 
  AlertCircle, 
  Calendar, 
  TrendingUp,
  User,
  Inbox
} from "lucide-react";

interface LeaderboardRow {
  creativeTeamId: string;
  name: string;
  totalPoints: number;
  awards: number;
  penalties: number;
}

interface HistoryEntry {
  _id: string;
  postType: string;
  points: number;
  type: "AWARD" | "PENALTY";
  clientId?: { name: string };
  deliveryDate?: string;
}

const currentMonthValue = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

const fmt = (d?: string) => {
  if (!d) return "—";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const AdminKpiDashboard = () => {
  const axiosAdmin = useAxiosAdmin();
  const [month, setMonth] = useState(currentMonthValue());
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: leaderboard = [], isLoading } = useQuery<LeaderboardRow[]>({
    queryKey: ["kpi-leaderboard", month],
    queryFn: async () => {
      const res = await axiosAdmin.get("/kpi/leaderboard", { params: { month } });
      return res.data?.data ?? [];
    },
  });

  const { data: history = [], isLoading: historyLoading } = useQuery<HistoryEntry[]>({
    queryKey: ["kpi-history", expandedId, month],
    queryFn: async () => {
      const res = await axiosAdmin.get(`/kpi/history/${expandedId}`, { params: { month } });
      return res.data?.data ?? [];
    },
    enabled: !!expandedId,
  });

  return (
    <div className="min-h-full w-full bg-slate-50/50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto ">
        {/* Header Section */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">KPI Leaderboard</h1>
            <p className="mt-1.5 text-sm text-slate-500">
              Track creative team delivery performance, awards, and penalties.
            </p>
          </div>
          
          <div className="relative group">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Calendar className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            </div>
            <input
              type="month"
              value={month}
              onChange={(e) => {
                setMonth(e.target.value);
                setExpandedId(null); // Close expanded row on month change
              }}
              className="block w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 shadow-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 sm:w-auto"
            />
          </div>
        </div>

        {/* Leaderboard Card */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Table Header */}
          <div className="hidden sm:grid grid-cols-[1fr_100px_100px_120px_40px] gap-4 border-b border-slate-200 bg-slate-50/80 px-6 py-3.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Team Member</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 text-center">Awards</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 text-center">Penalties</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">Total Points</span>
            <span></span> {/* Spacer for chevron */}
          </div>

          {isLoading ? (
            <div className="flex flex-col gap-3 p-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-14 w-full animate-pulse rounded-xl bg-slate-100" />
              ))}
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 mb-4">
                <Inbox className="h-6 w-6 text-slate-400" />
              </div>
              <h3 className="text-sm font-medium text-slate-900">No data available</h3>
              <p className="mt-1 text-sm text-slate-500">There are no KPI records for the selected month.</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {leaderboard.map((row) => {
                const isExpanded = expandedId === row.creativeTeamId;
                return (
                  <li key={row.creativeTeamId} className="group transition-colors bg-white hover:bg-slate-50/80">
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : row.creativeTeamId)}
                      className="grid w-full grid-cols-1 sm:grid-cols-[1fr_100px_100px_120px_40px] items-center gap-4 px-6 py-4 text-left focus:outline-none"
                    >
                      {/* Name Column */}
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600">
                          <User className="h-5 w-5" />
                        </div>
                        <span className="font-medium text-slate-900">{row.name}</span>
                      </div>

                      {/* Awards Column */}
                      <div className="flex items-center justify-between sm:justify-center">
                        <span className="sm:hidden text-xs text-slate-500">Awards:</span>
                        <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">
                          <Trophy className="h-3.5 w-3.5" />
                          <span className="text-sm font-medium">{row.awards}</span>
                        </div>
                      </div>

                      {/* Penalties Column */}
                      <div className="flex items-center justify-between sm:justify-center">
                        <span className="sm:hidden text-xs text-slate-500">Penalties:</span>
                        <div className="flex items-center gap-1.5 text-rose-600 bg-rose-50 px-2.5 py-1 rounded-md">
                          <AlertCircle className="h-3.5 w-3.5" />
                          <span className="text-sm font-medium">{row.penalties}</span>
                        </div>
                      </div>

                      {/* Total Points Column */}
                      <div className="flex items-center justify-between sm:justify-end">
                        <span className="sm:hidden text-xs text-slate-500">Total Points:</span>
                        <div className="flex items-center gap-1.5">
                          {row.totalPoints > 0 && <TrendingUp className="h-4 w-4 text-emerald-500" />}
                          <span className={`text-base font-bold ${row.totalPoints >= 0 ? "text-slate-900" : "text-rose-600"}`}>
                            {row.totalPoints > 0 ? `+${row.totalPoints}` : row.totalPoints}
                          </span>
                        </div>
                      </div>

                      {/* Chevron Column (Hidden on mobile for cleaner look) */}
                      <div className="hidden sm:flex justify-end text-slate-400 group-hover:text-indigo-500 transition-colors">
                        {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                      </div>
                    </button>

                    {/* Expandable History Section */}
                    {isExpanded && (
                      <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-5 shadow-inner">
                        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Activity History
                        </h4>
                        
                        {historyLoading ? (
                          <div className="flex items-center justify-center py-6">
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600" />
                          </div>
                        ) : history.length === 0 ? (
                          <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center">
                            <p className="text-sm text-slate-500">No activity recorded for this period.</p>
                          </div>
                        ) : (
                          <ul className="space-y-2">
                            {history.map((h) => (
                              <li 
                                key={h._id} 
                                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-200/60 bg-white p-3.5 shadow-sm transition hover:border-slate-300"
                              >
                                <div className="flex flex-col gap-1">
                                  <div className="flex items-center gap-2">
                                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase ${
                                      h.type === "AWARD" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                                    }`}>
                                      {h.type}
                                    </span>
                                    <span className="text-sm font-medium text-slate-900">
                                      {h.clientId?.name ?? "Unknown Client"}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <span>{h.postType}</span>
                                    <span>•</span>
                                    <span>Delivered {fmt(h.deliveryDate)}</span>
                                  </div>
                                </div>
                                <div className={`flex items-center justify-end text-sm font-bold ${
                                  h.type === "AWARD" ? "text-emerald-600" : "text-rose-600"
                                }`}>
                                  {h.points > 0 ? `+${h.points}` : h.points} pts
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminKpiDashboard;