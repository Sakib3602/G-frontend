"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useParams } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAxiosMarketing from "@/uri/useAxiosMarketing";

// ─── Types ────────────────────────────────────────────────────

type Platform = "FACEBOOK" | "INSTAGRAM" | "LINKEDIN" | "YOUTUBE";

type ItemStatus =
  | "NEW"
  | "IN_PROGRESS"
  | "UNDER_REVIEW"
  | "PUBLISHED"
  | "NEED_CONTENT"
  | "PAUSED"
  | "DELIVERED"
  | "CANCELLED"
  | "SCHEDULED"
  | "NO POST";

interface CalendarItem {
  _id: string;
  scheduleDate: string;
  contentDate?: string;
  deliveryDate?: string;
  creativeTeam?: string;
  creativeTeamId?: string;
  postType?: string;
  postHeadline?: string;
  platforms?: Platform[];
  status: ItemStatus;
  deliveryLink?: string;
  notes?: string;
  reportSent?: boolean;
}

interface CalendarDoc {
  _id: string;
  title: string;
  startDate: string;
  endDate: string;
}

interface UserOption {
  _id: string;
  name: string;
}

// ─── Constants ────────────────────────────────────────────────

const POST_TYPES = [
  "Static",
  "Reel",
  "Motion Graphics",
  "Memes (Static)",
  "No Post",
  "Cover Photo",
];

const ITEM_STATUSES: { value: ItemStatus; label: string }[] = [
  { value: "NEW", label: "New" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "UNDER_REVIEW", label: "Under Review" },
  { value: "PUBLISHED", label: "Published" },
  { value: "NEED_CONTENT", label: "Need Content" },
  { value: "PAUSED", label: "Paused" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "SCHEDULED", label: "Scheduled" },
 { value: "NO POST", label: "No Post" },
];

const STATUS_STYLES: Record<ItemStatus, string> = {
  NEW: "bg-slate-100 text-slate-600",
  IN_PROGRESS: "bg-amber-100 text-amber-700",
  UNDER_REVIEW: "bg-purple-100 text-purple-700",
  PUBLISHED: "bg-emerald-100 text-emerald-700",
  NEED_CONTENT: "bg-rose-100 text-rose-600",
  PAUSED: "bg-orange-100 text-orange-600",
  DELIVERED: "bg-blue-100 text-blue-700",
  CANCELLED: "bg-red-100 text-red-600",
  SCHEDULED: "bg-cyan-100 text-cyan-700",
  "NO POST": "bg-gray-100 text-gray-600",
};

// Statuses that should NOT be flagged as "missed delivery" even if the
// delivery date has passed without a delivery link.
const EXCLUDED_FROM_OVERDUE_CHECK: ItemStatus[] = [
  "DELIVERED",
  "CANCELLED",
  "PUBLISHED",
   "NO POST",
];

const PLATFORMS: Platform[] = ["FACEBOOK", "INSTAGRAM", "LINKEDIN", "YOUTUBE"];

const PLATFORM_SHORT: Record<Platform, string> = {
  FACEBOOK: "FB",
  INSTAGRAM: "IG",
  LINKEDIN: "LI",
  YOUTUBE: "YT",
};

const PLATFORM_COLORS: Record<Platform, string> = {
  FACEBOOK: "bg-blue-600",
  INSTAGRAM: "bg-pink-500",
  LINKEDIN: "bg-sky-700",
  YOUTUBE: "bg-red-600",
};

// ─── Helpers ──────────────────────────────────────────────────

const fmt = (d?: string) => {
  if (!d) return "";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const fmtInput = (d?: string) => {
  if (!d) return "";
  return new Date(d).toISOString().slice(0, 10);
};

// Live/dynamic check — used only to decide WHEN to fire the report
// mutation in the first place. Once item.reportSent is true on the
// server, the row stays red regardless of what this returns afterwards.
const isOverdueMissingDelivery = (item: CalendarItem) => {
  if (!item.deliveryDate) return false;
  if (item.deliveryLink && item.deliveryLink.trim() !== "") return false;
  if (EXCLUDED_FROM_OVERDUE_CHECK.includes(item.status)) return false;

  // "No Post" items have nothing to deliver — skip report entirely
  if (item.postType === "No Post") return false;
  if ((item.status as string) === "NO_POST") return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const deliveryDate = new Date(item.deliveryDate);
  deliveryDate.setHours(0, 0, 0, 0);

  return deliveryDate < today;
};

const WEEK_SIZE = 6;

// ─── Dropdown Portal ────────────────────────────────────────────
// Renders dropdown content into document.body via a portal, positioned
// with `position: fixed` based on the trigger button's bounding rect.
// This avoids clipping caused by the table's `overflow-x-auto` wrapper
// (which was hiding dropdowns opened from the last rows). Automatically
// flips to open upward when there isn't enough space below.

interface DropdownPortalProps {
  buttonRef: React.RefObject<HTMLButtonElement | null>;
  open: boolean;
  onClose: () => void;
  width?: number;
  children: React.ReactNode;
}

const DropdownPortal = ({
  buttonRef,
  open,
  onClose,
  width = 176,
  children,
}: DropdownPortalProps) => {
  const [style, setStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (!open || !buttonRef.current) return;

    const updatePosition = () => {
      if (!buttonRef.current) return;
      const rect = buttonRef.current.getBoundingClientRect();
      const dropdownMaxHeight = 224; // matches max-h-56
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUp = spaceBelow < dropdownMaxHeight && rect.top > spaceBelow;

      setStyle({
        position: "fixed",
        left: rect.left,
        width,
        ...(openUp
          ? { bottom: window.innerHeight - rect.top + 4 }
          : { top: rect.bottom + 4 }),
      });
    };

    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open, buttonRef, width]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        style={style}
        className="z-50 max-h-56 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-xl"
      >
        {children}
      </div>
    </>,
    document.body,
  );
};

// ─── Editable Cell ────────────────────────────────────────────

interface EditableCellProps {
  value: string;
  onSave: (val: string) => void;
  type?: "text" | "date" | "url";
  placeholder?: string;
  width?: string;
}

const EditableCell = ({
  value,
  onSave,
  type = "text",
  placeholder = "—",
  width = "w-full",
}: EditableCellProps) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const commit = () => {
    setEditing(false);
    if (draft !== value) onSave(draft);
  };

  if (editing) {
    return (
      <input
        autoFocus
        type={type}
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
        className={`${width} rounded border border-indigo-400 bg-white px-1.5 py-0.5 text-xs text-slate-800 outline-none focus:ring-1 focus:ring-indigo-300`}
      />
    );
  }

  return (
    <span
      onClick={() => {
        setDraft(value);
        setEditing(true);
      }}
      className="block cursor-pointer truncate rounded px-1 py-0.5 text-xs text-slate-700 hover:bg-indigo-50 hover:text-indigo-700"
      title={value || placeholder}
    >
      {(type === "date" ? fmt(value) : value) || (
        <span className="text-slate-300">{placeholder}</span>
      )}
    </span>
  );
};

// ─── Post Type Dropdown ───────────────────────────────────────

const PostTypeCell = ({
  value,
  onSave,
}: {
  value: string;
  onSave: (v: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-1 rounded border border-slate-200 bg-white/80 px-1.5 py-0.5 text-xs text-slate-700 hover:border-indigo-300"
      >
        <span className="truncate">
          {value || <span className="text-slate-300">Type</span>}
        </span>
        <span className="shrink-0 text-slate-400">▾</span>
      </button>
      <DropdownPortal
        buttonRef={buttonRef}
        open={open}
        onClose={() => setOpen(false)}
        width={176}
      >
        {POST_TYPES.map((pt) => (
          <button
            key={pt}
            type="button"
            onClick={() => {
              onSave(pt);
              setOpen(false);
            }}
            className={`block w-full px-3 py-1.5 text-left text-xs transition hover:bg-indigo-50 ${
              pt === value ? "font-semibold text-indigo-600" : "text-slate-700"
            }`}
          >
            {pt}
          </button>
        ))}
      </DropdownPortal>
    </div>
  );
};

// ─── Creative Team Dropdown (now backed by real users from the API) ──

const TeamCell = ({
  value,
  users,
  onSave,
}: {
  value: string;
  users: UserOption[];
  onSave: (user: UserOption) => void;
}) => {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-1 rounded border border-slate-200 bg-white/80 px-1.5 py-0.5 text-xs text-slate-700 hover:border-indigo-300"
      >
        <span className="truncate">
          {value || <span className="text-slate-300">Team</span>}
        </span>
        <span className="shrink-0 text-slate-400">▾</span>
      </button>
      <DropdownPortal
        buttonRef={buttonRef}
        open={open}
        onClose={() => setOpen(false)}
        width={176}
      >
        {users.length === 0 ? (
          <p className="px-3 py-2 text-xs text-slate-400">No users found</p>
        ) : (
          users.map((user) => (
            <button
              key={user._id}
              type="button"
              onClick={() => {
                onSave(user);
                setOpen(false);
              }}
              className={`block w-full px-3 py-1.5 text-left text-xs transition hover:bg-indigo-50 ${
                user.name === value
                  ? "font-semibold text-indigo-600"
                  : "text-slate-700"
              }`}
            >
              {user.name}
            </button>
          ))
        )}
      </DropdownPortal>
    </div>
  );
};

// ─── Platform Toggle Cell (compact) ──────────────────────────

const PlatformCell = ({
  selected,
  onSave,
}: {
  selected: Platform[];
  onSave: (p: Platform[]) => void;
}) => {
  const toggle = (p: Platform) => {
    const next = selected.includes(p)
      ? selected.filter((x) => x !== p)
      : [...selected, p];
    onSave(next);
  };

  return (
    <div className="flex gap-1">
      {PLATFORMS.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => toggle(p)}
          title={p}
          className={`h-6 w-7 rounded text-[10px] font-bold transition ${
            selected.includes(p)
              ? `${PLATFORM_COLORS[p]} text-white`
              : "bg-slate-100 text-slate-400 hover:bg-slate-200"
          }`}
        >
          {PLATFORM_SHORT[p]}
        </button>
      ))}
    </div>
  );
};

// ─── Status Dropdown ──────────────────────────────────────────

const StatusCell = ({
  status,
  onSave,
}: {
  status: ItemStatus;
  onSave: (s: ItemStatus) => void;
}) => {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const label = ITEM_STATUSES.find((s) => s.value === status)?.label ?? status;

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[status]}`}
      >
        {label}
      </button>
      <DropdownPortal
        buttonRef={buttonRef}
        open={open}
        onClose={() => setOpen(false)}
        width={160}
      >
        {ITEM_STATUSES.map((s) => (
          <button
            key={s.value}
            type="button"
            onClick={() => {
              onSave(s.value);
              setOpen(false);
            }}
            className={`block w-full px-3 py-1.5 text-left text-xs transition hover:bg-slate-50 ${
              s.value === status
                ? "font-semibold text-indigo-600"
                : "text-slate-700"
            }`}
          >
            {s.label}
          </button>
        ))}
      </DropdownPortal>
    </div>
  );
};

// ─── Week Separator ───────────────────────────────────────────

const WeekRow = ({ week }: { week: number }) => (
  <tr className="bg-slate-50">
    <td colSpan={11} className="px-3 py-1.5">
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
        ── Week {week}
      </span>
    </td>
  </tr>
);

// ─── Main ─────────────────────────────────────────────────────

const ContentCalMain = () => {
  const { id } = useParams();
  const axiosMarketing = useAxiosMarketing();
  const axiosUser = useAxiosMarketing();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dateError, setDateError] = useState("");
  const [selectedCalendar, setSelectedCalendar] = useState<CalendarDoc | null>(
    null,
  );

  // Extra in-session guard so we don't fire the mutation twice for the
  // same item while waiting for the refetch to land (item.reportSent is
  // the permanent source of truth; this is just a short-lived safety net).
  const pendingReportIdsRef = useRef<Set<string>>(new Set());

  const { data: client, isLoading: clientLoading } = useQuery({
    queryKey: ["client", id],
    queryFn: async () => {
      const res = await axiosMarketing.get(`/client/${id}`);
      return res.data.data;
    },
  });

  const { data: calendars = [] } = useQuery<CalendarDoc[]>({
    queryKey: ["calendars", id],
    queryFn: async () => {
      const res = await axiosMarketing.get(`/calendars/${id}`);
      return res.data.data;
    },
  });

  const { data: items = [], isLoading: itemsLoading } = useQuery<
    CalendarItem[]
  >({
    queryKey: ["calendarItems", selectedCalendar?._id],
    queryFn: async () => {
      const res = await axiosMarketing.get(
        `/calendar-items/${selectedCalendar!._id}`,
      );
      return res.data.data;
    },
    enabled: !!selectedCalendar,
  });

  // NEW — real users for the Creative Team dropdown, from /api/v1/users.
  // Adjust the response-shape access (res.data.data vs res.data) to
  // match what that endpoint actually returns.
  const { data: users = [] } = useQuery<UserOption[]>({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await axiosUser.get("/users");
      return res.data?.data ?? res.data ?? [];
    },
  });

  const createCalendarMutation = useMutation({
    mutationFn: async () => {
      const res = await axiosMarketing.post("/create-calendar", {
        creatorId: client?.creatorId,
        clientId: id,
        title,
        startDate,
        endDate,
      });
      return res.data;
    },
    onSuccess: () => {
      setTitle("");
      setStartDate("");
      setEndDate("");
      setDateError("");
      queryClient.invalidateQueries({ queryKey: ["calendars", id] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      itemId,
      patch,
    }: {
      itemId: string;
      patch: Partial<CalendarItem>;
    }) => {
      const res = await axiosMarketing.patch(`/calendar-item/${itemId}`, patch);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["calendarItems", selectedCalendar?._id],
      });
    },
  });

  // Backend now reads clientId/calendarId/creativeTeam straight off the
  // item itself, so no body is needed here anymore.
  const reportMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const res = await axiosMarketing.post(`/generate-report/${itemId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["calendarItems", selectedCalendar?._id],
      });
    },
    onError: (err) => {
      console.error("Failed to trigger missed-delivery report:", err);
    },
  });

  // Fire the report mutation once per item — guarded by both the
  // permanent server flag (reportSent) and the short-lived in-session ref.
  useEffect(() => {
    items.forEach((item) => {
      const alreadyHandled =
        item.reportSent || pendingReportIdsRef.current.has(item._id);
      if (isOverdueMissingDelivery(item) && !alreadyHandled) {
        pendingReportIdsRef.current.add(item._id);
        reportMutation.mutate(item._id);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  const update = (itemId: string, patch: Partial<CalendarItem>) => {
    updateMutation.mutate({ itemId, patch });
  };

  const handleCreateCalendar = (e: React.FormEvent) => {
    e.preventDefault();
    setDateError("");
    if (!title || !startDate || !endDate) {
      setDateError("সব field পূরণ করুন।");
      return;
    }
    if (new Date(endDate) <= new Date(startDate)) {
      setDateError("End date অবশ্যই start date এর পরে হতে হবে।");
      return;
    }
    createCalendarMutation.mutate();
  };

  if (clientLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-slate-400">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-full w-full ">
      {/* ── Top section with padding ───────────────────────── */}
      <div className="px-8 pt-8 pb-4 ">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">
            {client?.name}
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Agreement date: {fmt(client?.agreementDate)}
          </p>
        </div>

        {/* Create Calendar Form */}
        <div className="mb-6 rounded-xl border border-white/50 bg-white/60 p-4 shadow-md backdrop-blur-xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
            New Calendar
          </p>
          <form
            onSubmit={handleCreateCalendar}
            className="flex flex-wrap gap-2"
          >
            <input
              type="text"
              placeholder="e.g. June–July 2026"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-56 rounded-lg border border-slate-300/70 bg-white/70 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
            />
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setDateError("");
              }}
              className="rounded-lg border border-slate-300/70 bg-white/70 px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
            />
            <input
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(e) => {
                setEndDate(e.target.value);
                setDateError("");
              }}
              className={`rounded-lg border bg-white/70 px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 ${
                dateError && endDate && new Date(endDate) <= new Date(startDate)
                  ? "border-rose-400 focus:border-rose-400 focus:ring-rose-200"
                  : "border-slate-300/70 focus:border-indigo-400 focus:ring-indigo-200"
              }`}
            />
            <button
              type="submit"
              disabled={createCalendarMutation.isPending}
              className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-50"
            >
              {createCalendarMutation.isPending
                ? "Creating..."
                : "Create Calendar"}
            </button>
          </form>
          {dateError && (
            <p className="mt-2 text-xs text-rose-500">{dateError}</p>
          )}
        </div>

        {/* Calendar Tabs */}
        {calendars.length > 0 && (
          <div className="mb-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Calendars
            </p>
            <div className="flex flex-wrap gap-2">
              {calendars.map((cal) => (
                <button
                  key={cal._id}
                  type="button"
                  onClick={() => setSelectedCalendar(cal)}
                  className={`rounded-full border px-4 py-1 text-sm font-medium transition ${
                    selectedCalendar?._id === cal._id
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-300 bg-white/60 text-slate-600 hover:border-slate-500 hover:text-slate-900"
                  }`}
                >
                  {cal.title}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Table — full width, no side padding ───────────── */}
      {selectedCalendar && (
        <div className=" border-t border-slate-200/60 bg-white/30 backdrop-blur-xl">
          {/* Table meta bar */}
          <div className="flex items-center justify-between px-8 py-2.5 border-b border-slate-200/60 bg-white/50">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-slate-800">
                {selectedCalendar.title}
              </span>
              <span className="text-xs text-slate-400">
                {fmt(selectedCalendar.startDate)} →{" "}
                {fmt(selectedCalendar.endDate)}
              </span>
            </div>
            <span className="text-xs text-slate-400">
              {items.length} working days
            </span>
          </div>

          {itemsLoading ? (
            <div className="py-12 text-center text-sm text-slate-400">
              Loading rows...
            </div>
          ) : (
            <div className="overflow-x-auto px-4">
              <table
                className="w-full text-left"
                style={{ tableLayout: "fixed", minWidth: "1100px" }}
              >
                <colgroup>
                  <col style={{ width: "36px" }} />
                  <col style={{ width: "110px" }} />
                  <col style={{ width: "100px" }} />
                  <col style={{ width: "100px" }} />
                  <col style={{ width: "110px" }} />
                  <col style={{ width: "140px" }} />
                  <col style={{ width: "180px" }} />
                  <col style={{ width: "148px" }} />
                  <col style={{ width: "120px" }} />
                  <col style={{ width: "120px" }} />
                  <col style={{ width: "150px" }} />
                </colgroup>

                <thead className="sticky top-0 z-10 bg-white/90 backdrop-blur">
                  <tr className="border-b-2 border-slate-200">
                    {[
                      "#",
                      "Schedule Date",
                      "Delivery Date- CT",
                      "Caption Date",
                      "Creative Team",
                      "Post Type",
                      "Post Headline",
                      "Platforms",
                      "Status",
                      "Delivery Link",
                      "Notes",
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
                  {items.map((item, idx) => {
                    const weekNumber = Math.floor(idx / WEEK_SIZE) + 1;
                    const isWeekStart = idx % WEEK_SIZE === 0;

                    // Permanently red once reportSent is true on the
                    // server — falls back to the live check only before
                    // that flag has been set (e.g. on the very first
                    // render before the mutation lands).
                    const overdue =
                      item.reportSent || isOverdueMissingDelivery(item);

                    return (
                      <>
                        {isWeekStart && (
                          <WeekRow key={`w-${weekNumber}`} week={weekNumber} />
                        )}

                        <tr
                          key={item._id}
                          className={`border-b transition ${
                            overdue
                              ? "border-rose-200 bg-rose-50/70 hover:bg-rose-100/70"
                              : "border-slate-100 hover:bg-indigo-50/30"
                          }`}
                        >
                          <td className="px-3 py-2.5 text-xs text-slate-400">
                            {idx + 1}
                          </td>

                          <td className="px-3 py-2.5">
                            <EditableCell
                              type="date"
                              value={fmtInput(item.scheduleDate)}
                              onSave={(v) =>
                                update(item._id, {
                                  scheduleDate: v || undefined,
                                })
                              }
                              placeholder="Set date"
                            />
                          </td>
                          <td className="px-3 py-2.5">
                            <EditableCell
                              type="date"
                              value={fmtInput(item.deliveryDate)}
                              onSave={(v) =>
                                update(item._id, {
                                  deliveryDate: v || undefined,
                                })
                              }
                              placeholder="Set date"
                            />
                          </td>

                          <td className="px-3 py-2.5">
                            <EditableCell
                              type="date"
                              value={fmtInput(item.contentDate)}
                              onSave={(v) =>
                                update(item._id, {
                                  contentDate: v || undefined,
                                })
                              }
                              placeholder="Set date"
                            />
                          </td>

                          <td className="px-3 py-2.5">
                            <TeamCell
                              value={item.creativeTeam ?? ""}
                              users={users}
                              onSave={(user) =>
                                update(item._id, {
                                  creativeTeam: user.name,
                                  creativeTeamId: user._id,
                                })
                              }
                            />
                          </td>

                          <td className="px-3 py-2.5">
                            <PostTypeCell
                              value={item.postType ?? ""}
                              onSave={(v) => update(item._id, { postType: v })}
                            />
                          </td>

                          <td className="px-3 py-2.5">
                            <EditableCell
                              value={item.postHeadline ?? ""}
                              onSave={(v) =>
                                update(item._id, { postHeadline: v })
                              }
                              placeholder="Headline"
                            />
                          </td>

                          <td className="px-3 py-2.5">
                            <PlatformCell
                              selected={item.platforms ?? []}
                              onSave={(p) => update(item._id, { platforms: p })}
                            />
                          </td>

                          <td className="px-3 py-2.5">
                            <StatusCell
                              status={item.status}
                              onSave={(s) => update(item._id, { status: s })}
                            />
                          </td>

                          <td className="px-3 py-2.5">
                            <EditableCell
                              type="url"
                              value={item.deliveryLink ?? ""}
                              onSave={(v) =>
                                update(item._id, { deliveryLink: v })
                              }
                              placeholder="Link"
                            />
                          </td>

                          <td className="px-3 py-2.5">
                            <EditableCell
                              value={item.notes ?? ""}
                              onSave={(v) => update(item._id, { notes: v })}
                              placeholder="Notes"
                            />
                          </td>
                        </tr>
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Empty states */}
      {calendars.length === 0 && (
        <div className="px-6 py-16 text-center">
          <p className="text-sm text-slate-400">
            No calendars yet. Create one above.
          </p>
        </div>
      )}
      {calendars.length > 0 && !selectedCalendar && (
        <div className="px-6 py-16 text-center">
          <p className="text-sm text-slate-400">
            Select a calendar above to view content rows.
          </p>
        </div>
      )}
    </div>
  );
};

export default ContentCalMain;
