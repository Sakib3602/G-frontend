"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";


import useAxiosDesigner from "@/uri/useAxiosDesigner";

// ─── Types ────────────────────────────────────────────────────

type Platform = "FACEBOOK" | "INSTAGRAM" | "LINKEDIN" | "YOUTUBE";

type ItemStatus =
  | "NEW"
  | "ACCEPTED"
  | "IN_PROGRESS"
  | "UNDER_REVIEW"
  | "PUBLISHED"
  | "NEED_CONTENT"
  | "PAUSED"
  | "DELIVERED"
  | "CANCELLED"
  | "SCHEDULED"
  | "ACCEPTED";

interface CalendarItem {
  _id: string;
  scheduleDate: string;
  contentDate?: string;
  deliveryDate?: string;
  creativeTeam?: string;
  postType?: string;
  postHeadline?: string;
  platforms?: Platform[];
  status: ItemStatus;
  deliveryLink?: string;
  notes?: string;
  clientId?: { _id: string; name: string } | string;
}

interface DashboardStats {
  running: number;
  dueThisMonth: number;
  missedLastMonth: number;
}

// ─── Constants ────────────────────────────────────────────────

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

const SAFE_STATUSES: ItemStatus[] = ["ACCEPTED", "PUBLISHED", "DELIVERED"];

const PLATFORM_SHORT: Record<Platform, string> = {
  FACEBOOK: "FB",
  INSTAGRAM: "IG",
  LINKEDIN: "LI",
  YOUTUBE: "YT",
};

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

// Matches the backend's overdue rule: deadline passed, no delivery
// link, and status isn't one of the safe/handled ones.
const isOverdue = (item: CalendarItem) => {
  if (!item.deliveryDate) return false;
  if (item.deliveryLink && item.deliveryLink.trim() !== "") return false;
  if (SAFE_STATUSES.includes(item.status) || item.status === "CANCELLED") return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deliveryDate = new Date(item.deliveryDate);
  deliveryDate.setHours(0, 0, 0, 0);

  return deliveryDate < today;
};

// ─── Stat Card ────────────────────────────────────────────────

const StatCard = ({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "slate" | "indigo" | "rose";
}) => {
  const toneStyles = {
    slate: "border-slate-200 bg-white/60 text-slate-900",
    indigo: "border-indigo-200 bg-indigo-50/60 text-indigo-900",
    rose: "border-rose-200 bg-rose-50/60 text-rose-900",
  }[tone];

  return (
    <div className={`rounded-xl border p-4 shadow-sm backdrop-blur-xl ${toneStyles}`}>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-60">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
};

// ─── Delivery Link Cell (the only editable field for designers) ──

const DeliveryLinkCell = ({
  itemId,
  value,
  onSave,
  saving,
}: {
  itemId: string;
  value: string;
  onSave: (id: string, val: string) => void;
  saving: boolean;
}) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const commit = () => {
    setEditing(false);
    if (draft !== value) onSave(itemId, draft);
  };

  if (editing) {
    return (
      <input
        autoFocus
        type="url"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") {
            setDraft(value);
            setEditing(false);
          }
        }}
        placeholder="Paste delivery link..."
        className="w-full rounded border border-indigo-400 bg-white px-2 py-1 text-xs text-slate-800 outline-none focus:ring-1 focus:ring-indigo-300"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        setDraft(value);
        setEditing(true);
      }}
      disabled={saving}
      className="block w-full truncate rounded px-2 py-1 text-left text-xs text-indigo-700 underline-offset-2 hover:bg-indigo-50 hover:underline disabled:opacity-50"
      title={value || "Click to add link"}
    >
      {saving ? "Saving..." : value || <span className="text-slate-400">Add link</span>}
    </button>
  );
};

// ─── Main ─────────────────────────────────────────────────────

const DesignerMyTasksContent = () => {
  const axiosDesigner = useAxiosDesigner();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<{ items: CalendarItem[]; stats: DashboardStats }>({
    queryKey: ["designerCalendarItems"],
    queryFn: async () => {
      const res = await axiosDesigner.get("/api/v1/designer/calendar-items");
      return res.data.data;
    },
  });

  const items = data?.items ?? [];
  const stats = data?.stats ?? { running: 0, dueThisMonth: 0, missedLastMonth: 0 };

  const updateLinkMutation = useMutation({
    mutationFn: async ({ id, deliveryLink }: { id: string; deliveryLink: string }) => {
      const res = await axiosDesigner.patch(`/api/v1/designer/calendar-item/${id}/delivery-link`, {
        deliveryLink,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["designerCalendarItems"] });
    },
    onError: (err) => {
      console.error("Failed to update delivery link:", err);
      alert("Link update করা যায়নি, আবার চেষ্টা করো।");
    },
  });

  const handleSaveLink = (id: string, link: string) => {
    updateLinkMutation.mutate({ id, deliveryLink: link });
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-slate-400">
        Loading your tasks...
      </div>
    );
  }

  return (
    <div className="min-h-full w-full px-6 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">
          My Tasks
        </h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Your assigned content items, sorted by delivery date.
        </p>
      </div>

      {/* Stat cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Running" value={stats.running} tone="indigo" />
        <StatCard label="Due This Month" value={stats.dueThisMonth} tone="slate" />
        <StatCard label="Missed Last Month" value={stats.missedLastMonth} tone="rose" />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-white/50 bg-white/30 shadow-xl backdrop-blur-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left" style={{ tableLayout: "fixed", minWidth: "950px" }}>
            <colgroup>
              <col style={{ width: "36px" }} />
              <col style={{ width: "120px" }} />
              <col style={{ width: "110px" }} />
              <col style={{ width: "110px" }} />
              <col style={{ width: "120px" }} />
              <col style={{ width: "200px" }} />
              <col style={{ width: "130px" }} />
              <col style={{ width: "110px" }} />
              <col style={{ width: "180px" }} />
            </colgroup>
            <thead className="bg-white/50">
              <tr className="border-b-2 border-slate-200">
                {[
                  "#",
                  "Client",
                  "Schedule Date",
                  "Delivery Date",
                  "Platforms",
                  "Post Headline",
                  "Post Type",
                  "Status",
                  "Delivery Link",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-3 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-400"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-sm text-slate-400">
                    কোনো task assign করা নাই।
                  </td>
                </tr>
              ) : (
                items.map((item, idx) => {
                  const overdue = isOverdue(item);
                  const clientName =
                    typeof item.clientId === "object" ? item.clientId?.name : "";

                  return (
                    <tr
                      key={item._id}
                      className={`border-b transition ${
                        overdue
                          ? "border-rose-200 bg-rose-50/70"
                          : "border-slate-100 hover:bg-indigo-50/20"
                      }`}
                    >
                      <td className="px-3 py-2.5 text-xs text-slate-400">{idx + 1}</td>
                      <td className="px-3 py-2.5 text-xs font-medium text-slate-700">
                        {clientName || "—"}
                      </td>
                      <td className="px-3 py-2.5 text-xs text-slate-600 whitespace-nowrap">
                        {fmt(item.scheduleDate)}
                      </td>
                      <td className="px-3 py-2.5 text-xs font-semibold text-slate-700 whitespace-nowrap">
                        {fmt(item.deliveryDate)}
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex flex-wrap gap-1">
                          {(item.platforms ?? []).map((p) => (
                            <span
                              key={p}
                              className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500"
                            >
                              {PLATFORM_SHORT[p]}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 truncate text-xs text-slate-700">
                        {item.postHeadline || <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-3 py-2.5 text-xs text-slate-600">
                        {item.postType || <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-3 py-2.5">
                        <span
                          className={`whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                            STATUS_STYLES[item.status] ?? "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <DeliveryLinkCell
                          itemId={item._id}
                          value={item.deliveryLink ?? ""}
                          onSave={handleSaveLink}
                          saving={
                            updateLinkMutation.isPending &&
                            updateLinkMutation.variables?.id === item._id
                          }
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DesignerMyTasksContent;