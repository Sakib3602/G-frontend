"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import useAxiosAdmin from "@/uri/useAxiosAdmin";

// ─── Types ────────────────────────────────────────────────────

interface ReportRow {
  _id: string;
  clientId?: { _id: string; name: string };
  creativeTeamId?: { _id: string; name: string; email: string };
  creativeTeamName?: string;
  snapshot?: {
    scheduleDate?: string;
    deliveryDate?: string;
    postHeadline?: string;
    status?: string;
  };
  createdAt: string;
}

interface MemberGroup {
  memberId: string;
  memberName: string;
  memberEmail: string;
  count: number;
  reports: ReportRow[];
}

interface MonthData {
  month: string;
  totalReports: number;
  byMember: MemberGroup[];
}

// ─── Helpers ──────────────────────────────────────────────────

const fmt = (d?: string) => {
  if (!d) return "—";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const fmtDateTime = (d?: string) => {
  if (!d) return "—";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

const monthLabel = (ym: string) => {
  const [y, m] = ym.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
};

const prevMonth = (ym: string) => {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(y, m - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const nextMonth = (ym: string) => {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(y, m, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const currentYM = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

const STATUS_STYLES: Record<string, string> = {
  NEW: "bg-slate-100 text-slate-600",
  IN_PROGRESS: "bg-amber-100 text-amber-700",
  UNDER_REVIEW: "bg-purple-100 text-purple-700",
  PUBLISHED: "bg-emerald-100 text-emerald-700",
  NEED_CONTENT: "bg-rose-100 text-rose-600",
  PAUSED: "bg-orange-100 text-orange-600",
  DELIVERED: "bg-blue-100 text-blue-700",
  CANCELLED: "bg-red-100 text-red-600",
  SCHEDULED: "bg-cyan-100 text-cyan-700",
  ACCEPTED: "bg-teal-100 text-teal-700",
};

function getInitials(name?: string) {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

// ─── Main ─────────────────────────────────────────────────────

const AdminEmReports = () => {
  const axiosAdmin = useAxiosAdmin();
  const [month, setMonth] = useState(currentYM());

  const { data, isLoading } = useQuery<MonthData>({
    queryKey: ["adminReportsByMonth", month],
    queryFn: async () => {
      const res = await axiosAdmin.get(`/reports/by-month?month=${month}`);
      return res.data?.data;
    },
  });

  const byMember = data?.byMember ?? [];
  const totalReports = data?.totalReports ?? 0;
  const isFuture = month > currentYM();

  let globalIdx = 0;

  return (
    <div className="min-h-full w-full px-6 py-8">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">
          Missed Delivery Reports
        </h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Monthly breakdown by creative team member.
        </p>
      </div>

      {/* Month picker + stats */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-1 rounded-xl border border-white/50 bg-white/40 px-1 py-1 shadow-sm backdrop-blur-xl">
          <button
            type="button"
            onClick={() => setMonth(prevMonth(month))}
            className="rounded-lg px-3 py-1.5 text-slate-600 transition hover:bg-white/60"
          >
            ←
          </button>
          <span className="min-w-[140px] text-center text-sm font-semibold text-slate-800">
            {monthLabel(month)}
          </span>
          <button
            type="button"
            onClick={() => setMonth(nextMonth(month))}
            disabled={isFuture}
            className="rounded-lg px-3 py-1.5 text-slate-600 transition hover:bg-white/60 disabled:opacity-30"
          >
            →
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">
            {totalReports} missed {totalReports === 1 ? "delivery" : "deliveries"}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {byMember.length} {byMember.length === 1 ? "member" : "members"} affected
          </span>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="py-20 text-center text-sm text-slate-400">Loading...</div>
      ) : byMember.length === 0 ? (
        <div className="rounded-2xl border border-white/50 bg-white/25 py-20 text-center shadow-xl backdrop-blur-2xl">
          <p className="text-sm text-slate-400">No missed deliveries in {monthLabel(month)}.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/50 bg-white/25 shadow-xl backdrop-blur-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left" style={{ minWidth: "860px" }}>
              <thead className="bg-white/40">
                <tr className="border-b-2 border-slate-200">
                  {["#", "Client", "Schedule Date", "Delivery Date", "Post Headline", "Status", "Reported At"].map((h) => (
                    <th key={h} className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {byMember.map((member) => (
                  <>
                    {/* ── Member group header ── */}
                    <tr key={`group-${member.memberId}`} className="bg-indigo-50/60 border-b border-indigo-100">
                      <td colSpan={7} className="px-4 py-2.5">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
                              {getInitials(member.memberName)}
                            </span>
                            <span className="text-sm font-semibold text-slate-800">
                              {member.memberName}
                            </span>
                            <span className="text-xs text-slate-500">{member.memberEmail}</span>
                          </span>
                          <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-[11px] font-semibold text-rose-700">
                            {member.count} missed
                          </span>
                        </div>
                      </td>
                    </tr>

                    {/* ── Member's report rows ── */}
                    {member.reports.map((report) => {
                      globalIdx += 1;
                      const status = report.snapshot?.status;
                      return (
                        <tr
                          key={report._id}
                          className="border-b border-slate-100 transition hover:bg-rose-50/30"
                        >
                          <td className="px-4 py-3 text-xs text-slate-400">{globalIdx}</td>

                          <td className="px-4 py-3 text-sm font-medium text-slate-900">
                            {report.clientId?.name ?? "—"}
                          </td>

                          <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">
                            {fmt(report.snapshot?.scheduleDate)}
                          </td>

                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="rounded-md bg-rose-50 px-2 py-0.5 text-sm font-medium text-rose-700">
                              {fmt(report.snapshot?.deliveryDate)}
                            </span>
                          </td>

                          <td className="px-4 py-3 max-w-[200px] truncate text-sm text-slate-700">
                            {report.snapshot?.postHeadline || (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>

                          <td className="px-4 py-3">
                            {status ? (
                              <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[status] ?? "bg-slate-100 text-slate-600"}`}>
                                {status}
                              </span>
                            ) : (
                              <span className="text-xs text-slate-300">—</span>
                            )}
                          </td>

                          <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                            {fmtDateTime(report.createdAt)}
                          </td>
                        </tr>
                      );
                    })}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEmReports;