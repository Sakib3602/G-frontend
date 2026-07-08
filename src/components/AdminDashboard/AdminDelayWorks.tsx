"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import useAxiosAdmin from "@/uri/useAxiosAdmin";
import Swal from "sweetalert2";

// ─── Types ────────────────────────────────────────────────────

interface ReportSnapshot {
  scheduleDate?: string;
  deliveryDate?: string;
  postHeadline?: string;
  status?: string;
}

interface Report {
  _id: string;
  itemId: string;
  clientId?: { _id: string; name: string };
  creativeTeamId?: { _id: string; name: string; email: string };
  creativeTeamName?: string;
  reason: string;
  snapshot?: ReportSnapshot;
  createdAt: string;
}

// ─── Helpers ──────────────────────────────────────────────────

const fmt = (d?: string) => {
  if (!d) return "—";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const fmtDateTime = (d?: string) => {
  if (!d) return "—";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
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
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// ─── Main ─────────────────────────────────────────────────────

const AdminDekayWorks = () => {
  const axiosAdmin = useAxiosAdmin();
  const [clientFilter, setClientFilter] = useState("");
  const [teamFilter, setTeamFilter] = useState("");

  const {
    data: reports = [],
    isLoading,
    refetch,
  } = useQuery<Report[]>({
    queryKey: ["adminReports"],
    queryFn: async () => {
      const res = await axiosAdmin.get("/reports");
      return res.data?.data ?? [];
    },
  });

  console.log("Admin Delay Works - reports:", reports);

  const filtered = reports.filter((r) => {
    const clientMatch = (r.clientId?.name ?? "")
      .toLowerCase()
      .includes(clientFilter.toLowerCase());
    const teamName = r.creativeTeamId?.name ?? r.creativeTeamName ?? "";
    const teamMatch = teamName.toLowerCase().includes(teamFilter.toLowerCase());
    return clientMatch && teamMatch;
  });

  const mutationUpdateReport = useMutation({
    mutationFn: async (reportId: string) => {
      const res = await axiosAdmin.patch(`/reports/${reportId}`);
      return res.data;
    },
    onSuccess: () => {
      Swal.fire({
        title: "Success!",
        text: "Report status Updated Successfully.",
        icon: "success",
      });
      refetch();
    },
  });

  const reportUpdate = (reportId: string) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, I Review This!",
    }).then((result) => {
      if (result.isConfirmed) mutationUpdateReport.mutate(reportId);
    });
  };

  return (
    <div className="min-h-full w-full px-6 py-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">
            Missed Delivery Reports
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Items that passed their delivery deadline without a delivery link.
          </p>
        </div>
        <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">
          {filtered.length} report{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Filters */}
      <div className="mb-5 flex flex-wrap gap-3">
        <input
          type="text"
          value={clientFilter}
          onChange={(e) => setClientFilter(e.target.value)}
          placeholder="Filter by client..."
          className="w-52 rounded-lg border border-slate-300/70 bg-white/50 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-indigo-400 focus:bg-white/70 focus:ring-2 focus:ring-indigo-200"
        />
        <input
          type="text"
          value={teamFilter}
          onChange={(e) => setTeamFilter(e.target.value)}
          placeholder="Filter by creative team..."
          className="w-52 rounded-lg border border-slate-300/70 bg-white/50 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-indigo-400 focus:bg-white/70 focus:ring-2 focus:ring-indigo-200"
        />
        {(clientFilter || teamFilter) && (
          <button
            type="button"
            onClick={() => {
              setClientFilter("");
              setTeamFilter("");
            }}
            className="rounded-lg border border-slate-300/70 bg-white/60 px-3 py-2 text-sm text-slate-600 transition hover:border-slate-400"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-white/50 bg-white/25 shadow-xl backdrop-blur-2xl">
        {isLoading ? (
          <div className="py-16 text-center text-sm text-slate-400">
            Loading reports...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-slate-400">
              {reports.length === 0
                ? "No missed delivery reports yet."
                : "No reports match your filters."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left" style={{ minWidth: "900px" }}>
              <thead className="bg-white/40">
                <tr className="border-b-2 border-slate-200">
                  {[
                    "#",
                    "Client",
                    "Creative Team",
                    "Schedule Date",
                    "Delivery Date",
                    "Status at Report",
                    "Reported At",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-400"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((report, idx) => {
                  const teamName =
                    report.creativeTeamId?.name ??
                    report.creativeTeamName ??
                    "—";
                  const status = report.snapshot?.status;

                  return (
                    <tr
                      key={`${report._id}-${report.itemId}`}
                      className="border-b border-slate-100 transition hover:bg-rose-50/30"
                    >
                      {/* # */}
                      <td className="px-4 py-3 text-xs text-slate-400">
                        {idx + 1}
                      </td>

                      {/* Client */}
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-slate-900">
                          {report.clientId?.name ?? "—"}
                        </span>
                      </td>

                      {/* Creative Team */}
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-2">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-700">
                            {getInitials(
                              teamName !== "—" ? teamName : undefined,
                            )}
                          </span>
                          <span className="text-sm text-slate-700">
                            {teamName}
                          </span>
                        </span>
                      </td>

                      {/* Schedule Date */}
                      <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">
                        {fmt(report.snapshot?.scheduleDate)}
                      </td>

                      {/* Delivery Date */}
                      <td className="px-4 py-3">
                        <span className="whitespace-nowrap rounded-md bg-rose-50 px-2 py-0.5 text-sm font-medium text-rose-700">
                          {fmt(report.snapshot?.deliveryDate)}
                        </span>
                      </td>

                      {/* Status at report time */}
                      <td className="px-4 py-3">
                        {status ? (
                          <span
                            className={`whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                              STATUS_STYLES[status] ??
                              "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {status}
                          </span>
                        ) : (
                          <span className="text-slate-300 text-xs">—</span>
                        )}
                      </td>

                      {/* Reported At */}
                      <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                        {fmtDateTime(report.createdAt)}
                      </td>

                      {/* Review Now Button */}
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => reportUpdate(report._id)}
                          className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700 active:bg-red-800"
                        >
                          Review Now
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDekayWorks;
