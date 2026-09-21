"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import useAxiosDesigner from "@/uri/useAxiosDesigner";

interface KpiEntry {
  _id: string;
  postType: string;
  points: number;
  type: "AWARD" | "PENALTY";
  clientId?: { name: string };
  itemId?: { postHeadline?: string };
  createdAt: string;
}

const fmt = (d?: string) => {
  if (!d) return "—";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const currentMonthValue = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

const DesignerMyKpi = () => {
  const axiosDesigner = useAxiosDesigner();
  const [month, setMonth] = useState(currentMonthValue());

  const { data, isLoading } = useQuery<{
    summary: { totalPoints: number; awards: number; penalties: number };
    data: KpiEntry[];
  }>({
    queryKey: ["my-kpi", month],
    queryFn: async () => {
      const res = await axiosDesigner.get("/api/v1/designer/kpi/my", { params: { month } });
      return res.data;
    },
  });

  const entries = data?.data ?? [];
  const summary = data?.summary ?? { totalPoints: 0, awards: 0, penalties: 0 };

  return (
    <div className="min-h-full w-full px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">My KPI</h1>
          <p className="mt-0.5 text-sm text-slate-500">Delivery-based performance points, month by month.</p>
        </div>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
        />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white/60 p-4 shadow-sm backdrop-blur-xl">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Total Points</p>
          <p className={`mt-1 text-2xl font-bold ${summary.totalPoints >= 0 ? "text-slate-900" : "text-rose-600"}`}>
            {summary.totalPoints}
          </p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 shadow-sm backdrop-blur-xl">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700/70">Awards</p>
          <p className="mt-1 text-2xl font-bold text-emerald-900">{summary.awards}</p>
        </div>
        <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-4 shadow-sm backdrop-blur-xl">
          <p className="text-xs font-semibold uppercase tracking-wide text-rose-700/70">Penalties</p>
          <p className="mt-1 text-2xl font-bold text-rose-900">{summary.penalties}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/50 bg-white/30 shadow-xl backdrop-blur-2xl">
        <div className="grid grid-cols-[110px_1fr_140px_110px_90px] gap-3 border-b border-slate-200/60 bg-white/50 px-4 py-2.5">
          {["Date", "Client / Post", "Post Type", "Type", "Points"].map((h) => (
            <span key={h} className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              {h}
            </span>
          ))}
        </div>

        {isLoading ? (
          <p className="px-4 py-6 text-center text-sm text-slate-400">Loading...</p>
        ) : entries.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-slate-400">No KPI entries this month yet.</p>
        ) : (
          <ul>
            {entries.map((e) => (
              <li
                key={e._id}
                className="grid grid-cols-[110px_1fr_140px_110px_90px] gap-3 border-b border-slate-100 px-4 py-2.5 text-xs last:border-0"
              >
                <span className="text-slate-500">{fmt(e.createdAt)}</span>
                <span className="truncate text-slate-700">
                  {e.clientId?.name ?? "—"}
                  {e.itemId?.postHeadline ? ` · ${e.itemId.postHeadline}` : ""}
                </span>
                <span className="text-slate-500">{e.postType}</span>
                <span className={e.type === "AWARD" ? "font-medium text-emerald-600" : "font-medium text-rose-600"}>
                  {e.type === "AWARD" ? "Award" : "Penalty"}
                </span>
                <span className={`font-semibold ${e.points > 0 ? "text-emerald-600" : "text-rose-600"}`}>
                  {e.points > 0 ? `+${e.points}` : e.points}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default DesignerMyKpi;