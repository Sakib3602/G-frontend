import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import useAxiosDesigner from "@/uri/useAxiosDesigner";
import { useUserDataDesigner } from "./HOOK/user_data_designer";
import Alert from "../MarketingDashboard/Alert/Alert";

// ─── Marketing Task Types ──────────────────────────────────────

type RemainingDate = {
    dueTimeWithDayAndHour?: string;
    isOverdue?: boolean;
    days?: number;
    hours?: number;
    minutes?: number;
};

type Campaign = {
    _id: string;
    campaignName?: string;
};

type Maker = {
    _id: string;
    name?: string;
};

type Task = {
    _id: string;
    title?: string;
    status?: string;
    priority?: string;
    description?: string;
    makerId?: Maker;
    campaignId?: Campaign;
    remainingDate?: RemainingDate;
};

// ─── Content Calendar Overdue Item Types ───────────────────────

type CalendarItemStatus =
  | "NEW"
  | "ACCEPTED"
  | "IN_PROGRESS"
  | "UNDER_REVIEW"
  | "PUBLISHED"
  | "NEED_CONTENT"
  | "PAUSED"
  | "DELIVERED"
  | "CANCELLED"
  | "SCHEDULED";

interface OverdueCalendarItem {
  _id: string;
  deliveryDate?: string;
  postType?: string;
  postHeadline?: string;
  status: CalendarItemStatus;
  deliveryLink?: string;
  clientId?: { _id: string; name: string } | string;
  creativeTeamId?: { _id: string; name: string; email?: string } | string;
  creativeTeam?: string;
}

const CALENDAR_STATUS_OPTIONS: CalendarItemStatus[] = [
  "NEW",
  "IN_PROGRESS",
  "UNDER_REVIEW",
  "PUBLISHED",
  "NEED_CONTENT",
  "PAUSED",
  "DELIVERED",
  "CANCELLED",
  "SCHEDULED",
];

const statusStyles: Record<string, string> = {
    pending: "bg-amber-400",
    in_progress: "bg-blue-500",
    completed: "bg-green-500",
};

function getInitials(name: string): string {
    return name
        .split(" ")
        .filter(Boolean)
        .map((word) => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
}

function statusLabel(status: string): string {
    if (status === "in_progress") return "In Progress";
    return status.charAt(0).toUpperCase() + status.slice(1);
}

// ─── Month grouping helpers (Content Calendar section) ─────────

const MONTH_LABEL_FORMAT: Intl.DateTimeFormatOptions = { month: "long", year: "numeric" };

const getMonthKey = (dateStr?: string) => {
  if (!dateStr) return "unknown";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "unknown";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const getMonthLabel = (monthKey: string) => {
  if (monthKey === "unknown") return "Date Unknown";
  const [year, month] = monthKey.split("-").map(Number);
  const d = new Date(year, month - 1, 1);
  return d.toLocaleDateString("en-GB", MONTH_LABEL_FORMAT);
};

// ─── Content Calendar Overdue Section (date-range filter + month grouping) ──

const CalendarOverdueSection = () => {
  const axiosDesigner = useAxiosDesigner();
  const queryClient = useQueryClient();
  const [linkDrafts, setLinkDrafts] = useState<Record<string, string>>({});
  const [openMonth, setOpenMonth] = useState<string | null>(null);
  const hasAutoOpened = useRef(false);

  // ─── NEW: From/To date range state ───
  // draft* হলো input বক্সের সাথে বাঁধা মান, appliedFrom/appliedTo হলো
  // যেটা দিয়ে আসলে API কল করা হয় — "Apply" চাপলেই শুধু নতুন কল হবে।
  const [draftFrom, setDraftFrom] = useState("");
  const [draftTo, setDraftTo] = useState("");
  const [appliedFrom, setAppliedFrom] = useState("");
  const [appliedTo, setAppliedTo] = useState("");

  const hasRange = !!(appliedFrom && appliedTo);
  const rangeInvalid = !!(draftFrom && draftTo && draftFrom > draftTo);

  const { data, isLoading, isFetching } = useQuery<{
    fullAccess: boolean;
    rangeApplied: boolean;
    data: OverdueCalendarItem[];
  }>({
    queryKey: ["designerOverdueCalendarItems", appliedFrom, appliedTo],
    queryFn: async () => {
      const res = await axiosDesigner.get("/api/v1/designer/overdue-calendar-items", {
        params: hasRange ? { from: appliedFrom, to: appliedTo } : undefined,
      });
      return res.data;
    },
  });

  const items = data?.data ?? [];
  const fullAccess = data?.fullAccess ?? false;

  const applyRange = () => {
    if (!draftFrom || !draftTo || rangeInvalid) return;
    setAppliedFrom(draftFrom);
    setAppliedTo(draftTo);
    // নতুন রেঞ্জ apply করলে auto-open লজিক আবার প্রথম মাসের জন্য চালাতে চাই।
    hasAutoOpened.current = false;
    setOpenMonth(null);
  };

  const clearRange = () => {
    setDraftFrom("");
    setDraftTo("");
    setAppliedFrom("");
    setAppliedTo("");
    hasAutoOpened.current = false;
    setOpenMonth(null);
  };

  // ─── Month-wise grouping ───
  const grouped = items.reduce<Record<string, OverdueCalendarItem[]>>((acc, item) => {
    const key = getMonthKey(item.deliveryDate);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  Object.values(grouped).forEach((group) => {
    group.sort((a, b) => {
      const da = a.deliveryDate ? new Date(a.deliveryDate).getTime() : 0;
      const db = b.deliveryDate ? new Date(b.deliveryDate).getTime() : 0;
      return da - db;
    });
  });

  const sortedMonthKeys = Object.keys(grouped).sort((a, b) => {
    if (a === "unknown") return 1;
    if (b === "unknown") return -1;
    return a.localeCompare(b);
  });

  useEffect(() => {
    if (!hasAutoOpened.current && sortedMonthKeys.length > 0) {
      setOpenMonth(sortedMonthKeys[0]);
      hasAutoOpened.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortedMonthKeys.length, appliedFrom, appliedTo]);

  const updateLinkMutation = useMutation({
    mutationFn: async ({ id, deliveryLink }: { id: string; deliveryLink: string }) => {
      const res = await axiosDesigner.patch(`/api/v1/designer/calendar-item/${id}/delivery-link`, {
        deliveryLink,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["designerOverdueCalendarItems"] });
      queryClient.invalidateQueries({ queryKey: ["designerCalendarItems"] });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await axiosDesigner.patch(`/api/v1/designer/calendar-item/${id}/full-access-fields`, {
        status,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["designerOverdueCalendarItems"] });
      queryClient.invalidateQueries({ queryKey: ["designerCalendarItems"] });
    },
  });

  return (
    <div className="mt-10">
      <div className="flex flex-col gap-4 mb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Content Calendar — Overdue Items</h2>
          <p className="text-sm text-slate-500">
            {hasRange
              ? "This is the overdue item list for the selected date range, grouped by month."
              : "This is the list of all overdue items, grouped by month, with the oldest months at the top."}
          </p>
        </div>
        <span className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-full px-3 py-1 self-start">
          {items.length} total {hasRange ? "in range" : "overdue"}
        </span>
      </div>

      {/* ─── NEW: Date range picker ─── */}
      <div className="mb-6 flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">From</label>
          <input
            type="date"
            value={draftFrom}
            onChange={(e) => setDraftFrom(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none focus:ring-1 focus:ring-indigo-300"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">To</label>
          <input
            type="date"
            value={draftTo}
            onChange={(e) => setDraftTo(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none focus:ring-1 focus:ring-indigo-300"
          />
        </div>
        <button
          type="button"
          onClick={applyRange}
          disabled={!draftFrom || !draftTo || rangeInvalid}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Search
        </button>
        {hasRange && (
          <button
            type="button"
            onClick={clearRange}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            Clear / Show current overdue
          </button>
        )}
        {rangeInvalid && (
          <p className="w-full text-xs font-medium text-rose-600">
            "From" date cannot be later than "To" date.
          </p>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[120px] text-sm text-gray-500">
          Loading content calendar items...
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
          {hasRange
            ? "There are no overdue calendar items in the selected date range."
            : "There are no overdue calendar items."
          }
        </div>
      ) : (
        <div className={`space-y-4 transition-opacity ${isFetching ? "opacity-50" : "opacity-100"}`}>
          {sortedMonthKeys.map((monthKey) => {
            const groupItems = grouped[monthKey];
            const isOpen = openMonth === monthKey;
            const isMostUrgent = monthKey === sortedMonthKeys[0];

            return (
              <div
                key={monthKey}
                className="overflow-hidden rounded-2xl border border-rose-200 bg-white shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => setOpenMonth(isOpen ? null : monthKey)}
                  className={`flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition ${
                    isOpen ? "bg-rose-50" : "hover:bg-rose-50/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <svg
                      className={`h-4 w-4 shrink-0 text-rose-500 transition-transform ${isOpen ? "rotate-90" : ""}`}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
                    </svg>
                    <h3 className="text-sm font-semibold text-slate-900">{getMonthLabel(monthKey)}</h3>
                    {isMostUrgent && !hasRange && (
                      <span className="rounded-full bg-rose-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                        Most Urgent
                      </span>
                    )}
                  </div>
                  <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">
                    {groupItems.length} item{groupItems.length === 1 ? "" : "s"}
                  </span>
                </button>

                {isOpen && (
                  <div className="border-t border-rose-100 bg-rose-50/30 p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {groupItems.map((item) => {
                        const clientName = typeof item.clientId === "object" ? item.clientId?.name : "—";
                        const creativeTeamName =
                          typeof item.creativeTeamId === "object"
                            ? item.creativeTeamId?.name ?? item.creativeTeam ?? "Unassigned"
                            : item.creativeTeam ?? "Unassigned";
                        const draft = linkDrafts[item._id] ?? item.deliveryLink ?? "";

                        return (
                          <div
                            key={item._id}
                            className="overflow-hidden rounded-2xl border border-rose-200 bg-white shadow-sm transition hover:border-rose-300"
                          >
                            <div className="h-1.5 bg-gradient-to-r from-rose-500 via-[#F16C65] to-amber-400" />
                            <div className="p-4 flex flex-col gap-3">
                              <div className="min-w-0">
                                <h4 className="text-sm font-semibold text-rose-900 leading-snug line-clamp-2">
                                  {item.postHeadline || "Untitled item"}
                                </h4>
                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                  <span className="inline-flex items-center rounded-full bg-slate-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600 border border-rose-100">
                                    {clientName}
                                  </span>
                                  <span className="inline-flex items-center rounded-full bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600 border border-rose-100">
                                    {item.postType || "—"}
                                  </span>
                                </div>
                              </div>

                              <div className="rounded-xl border border-rose-200 bg-rose-50/50 px-3 py-2">
                                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Delivery Date</div>
                                <div className="mt-1 text-sm font-semibold text-rose-700">
                                  {item.deliveryDate ? new Date(item.deliveryDate).toLocaleDateString("en-GB") : "N/A"}
                                </div>
                              </div>

                              <div className="text-xs text-slate-500">
                                Assigned to: <span className="font-medium text-slate-700">{creativeTeamName}</span>
                              </div>

                              {fullAccess ? (
                                <div>
                                  <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Status</label>
                                  <select
                                    value={item.status}
                                    onChange={(e) => updateStatusMutation.mutate({ id: item._id, status: e.target.value })}
                                    disabled={
                                      updateStatusMutation.isPending &&
                                      updateStatusMutation.variables?.id === item._id
                                    }
                                    className="mt-1 w-full rounded-lg border border-rose-300 bg-white px-2 py-1.5 text-xs text-slate-700 outline-none focus:ring-1 focus:ring-rose-300 disabled:opacity-50"
                                  >
                                    {CALENDAR_STATUS_OPTIONS.map((s) => (
                                      <option key={s} value={s}>
                                        {s}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              ) : (
                                <div>
                                  <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Delivery Link</label>
                                  <div className="mt-1 flex items-center gap-2">
                                    <input
                                      value={draft}
                                      onChange={(e) =>
                                        setLinkDrafts((prev) => ({ ...prev, [item._id]: e.target.value }))
                                      }
                                      placeholder="https://"
                                      className="w-full rounded-lg border border-rose-300 bg-white px-2 py-1.5 text-xs text-slate-700 outline-none focus:ring-1 focus:ring-rose-300"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => updateLinkMutation.mutate({ id: item._id, deliveryLink: draft })}
                                      disabled={
                                        updateLinkMutation.isPending &&
                                        updateLinkMutation.variables?.id === item._id
                                      }
                                      className="shrink-0 rounded-lg bg-[#F16C65] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#e4564f] disabled:opacity-50"
                                    >
                                      Save
                                    </button>
                                  </div>
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
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── Main Component ─────────────────────────────────────────────

const DesignerOverDueTasks = () => {
    const axiosDesigner = useAxiosDesigner();
    const { userData } = useUserDataDesigner();

    const { data: myTasks = [], isLoading, refetch } = useQuery<Task[]>({
        queryKey: ["designer-overdue", userData?._id],
        queryFn: async () => {
            const res = await axiosDesigner.get(`/api/v1/designer/overdue-tasks/${userData?._id}`);
            return res.data || [];
        },
        enabled: !!userData?._id,
    });

    const [showNotification, setShowNotification] = useState(false);
    const [notificationTitle, setNotificationTitle] = useState("Task Completed");
    const [notificationMessage, setNotificationMessage] = useState("Task marked as completed successfully!");
    const [doneTaskOpen, setDoneTaskOpen] = useState(false);
    const [doneTaskLink, setDoneTaskLink] = useState("");
    const [doneTaskTarget, setDoneTaskTarget] = useState<Task | null>(null);

    const mutationMarkComplete = useMutation({
        mutationFn: async ({ taskId, link }: { taskId: string; link: string }) => {
            const res = await axiosDesigner.post(`/api/v1/designer/complete-task/${taskId}`, { url: link });
            return res.data;
        },
        onSuccess: () => {
            setNotificationTitle("Task Completed");
            setNotificationMessage("Task marked as completed successfully!");
            setShowNotification(true);
            refetch();
        },
    });

    const overdueTasks = myTasks || [];

    return (
        <>
            {showNotification && (
                <Alert
                    title={notificationTitle}
                    message={notificationMessage}
                    onClose={() => setShowNotification(false)}
                />
            )}

            <div className="max-w-7xl mx-auto p-4">
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h2 className="text-xl font-semibold text-slate-900">Overdue Tasks</h2>
                        <p className="text-sm text-slate-500">Tasks that have passed their due time and need attention.</p>
                    </div>
                    <span className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-full px-3 py-1">
                        {overdueTasks.length} overdue
                    </span>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center min-h-[220px] text-sm text-gray-500">Loading overdue tasks...</div>
                ) : overdueTasks.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
                        No overdue tasks found.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {overdueTasks.map((task) => {
                            const makerName = task.makerId?.name || "Unknown maker";
                            const campaignName = task.campaignId?.campaignName || "No campaign";
                            const remainingLabel = task.remainingDate?.dueTimeWithDayAndHour || "N/A";
                            const isCompleted = task.status === "completed";
                            const canMarkDone = !isCompleted;

                            return (
                                <div
                                    key={task._id}
                                    className="overflow-hidden rounded-3xl border border-rose-200 bg-rose-50/70 shadow-sm transition hover:border-rose-300"
                                >
                                    <div className="h-1.5 bg-gradient-to-r from-rose-500 via-[#F16C65] to-amber-400" />
                                    <div className="p-4 flex flex-col gap-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0 flex-1">
                                                <h3 className="text-sm font-semibold text-rose-900 leading-snug line-clamp-2">
                                                    {task.title || "Untitled task"}
                                                </h3>
                                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                                    <span className="inline-flex items-center rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600 border border-rose-100">
                                                        Overdue
                                                    </span>
                                                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white ${statusStyles[task.status || ""] || "bg-slate-400"}`}>
                                                        {statusLabel(task.status || "pending")}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-end gap-1 shrink-0">
                                                <div className="w-9 h-9 rounded-full bg-white text-[#F16C65] flex items-center justify-center text-xs font-semibold border border-rose-200">
                                                    {getInitials(makerName)}
                                                </div>
                                                <span className="text-[11px] font-medium text-rose-700">{makerName}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 text-xs text-rose-700">
                                            <span className="rounded-full bg-white border border-rose-200 px-2.5 py-1 font-medium">
                                                {campaignName}
                                            </span>
                                        </div>

                                        <div className="rounded-2xl border border-rose-200 bg-white px-3 py-2">
                                            <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Due Time</div>
                                            <div className="mt-1 text-sm font-semibold text-rose-700">{remainingLabel}</div>
                                        </div>

                                        {task.description ? (
                                            <p className="text-xs leading-relaxed text-slate-600 line-clamp-3">{task.description}</p>
                                        ) : null}

                                        <div className="flex items-center justify-between gap-2 pt-1">
                                            <span className="text-xs text-slate-500">
                                                {task.remainingDate?.isOverdue ? "Needs immediate action" : "Monitor closely"}
                                            </span>
                                            {canMarkDone ? (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setDoneTaskTarget(task);
                                                        setDoneTaskLink("");
                                                        setDoneTaskOpen(true);
                                                    }}
                                                    className="inline-flex items-center gap-2 rounded-md bg-[#F16C65] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-[#e4564f]"
                                                >
                                                    Done Task
                                                </button>
                                            ) : null}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Content Calendar overdue items — date range + month-wise grouping */}
                <CalendarOverdueSection />
            </div>

            {doneTaskOpen && doneTaskTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <div
                        className="fixed inset-0 bg-black/50"
                        onClick={() => {
                            setDoneTaskOpen(false);
                            setDoneTaskTarget(null);
                        }}
                    />

                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="done-task-title"
                        className="relative z-10 w-full max-w-md mx-auto"
                    >
                        <div className="overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-100">
                            <header className="flex items-start justify-between gap-4 p-5 border-b border-slate-100">
                                <div>
                                    <div className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600">Done Task</div>
                                    <h3 id="done-task-title" className="mt-3 text-lg font-semibold text-slate-900">Submit completion link</h3>
                                    <p className="mt-1 text-xs text-slate-500">Paste the URL for the completed work.</p>
                                </div>
                                <button
                                    type="button"
                                    aria-label="Close done task modal"
                                    onClick={() => {
                                        setDoneTaskOpen(false);
                                        setDoneTaskTarget(null);
                                    }}
                                    className="rounded-md p-2 text-slate-500 hover:bg-slate-50"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </header>

                            <div className="p-5">
                                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 mb-4">
                                    <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Selected Task</div>
                                    <div className="mt-1 text-sm font-semibold text-slate-900">{doneTaskTarget.title || "Untitled task"}</div>
                                </div>

                                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Completion URL</label>
                                <div className="mt-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 focus-within:ring-2 focus-within:ring-indigo-100">
                                    <input
                                        value={doneTaskLink}
                                        onChange={(e) => setDoneTaskLink(e.target.value)}
                                        placeholder="https://"
                                        className="w-full border-0 p-0 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                                    />
                                </div>
                            </div>

                            <footer className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/60 px-5 py-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setDoneTaskOpen(false);
                                        setDoneTaskTarget(null);
                                    }}
                                    className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (!doneTaskTarget) return;
                                        mutationMarkComplete.mutate({ taskId: doneTaskTarget._id, link: doneTaskLink });
                                        setDoneTaskOpen(false);
                                        setDoneTaskTarget(null);
                                        setDoneTaskLink("");
                                    }}
                                    className="rounded-lg bg-[#F16C65] px-4 py-2 text-sm font-semibold text-white hover:bg-[#e4564f]"
                                >
                                    Submit
                                </button>
                            </footer>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default DesignerOverDueTasks;