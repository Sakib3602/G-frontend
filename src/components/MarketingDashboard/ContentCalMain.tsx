"use client";

import { useState } from "react";
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
  | "SCHEDULED";

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
}

interface CalendarDoc {
  _id: string;
  title: string;
  startDate: string;
  endDate: string;
}

// ─── Constants ────────────────────────────────────────────────

const POST_TYPES = [
  "Carousel Static",
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
};

const PLATFORMS: Platform[] = ["FACEBOOK", "INSTAGRAM", "LINKEDIN", "YOUTUBE"];

// single letter short labels for compact display
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

const WEEK_SIZE = 6;

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

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-1 rounded border border-slate-200 bg-white/80 px-1.5 py-0.5 text-xs text-slate-700 hover:border-indigo-300"
      >
        <span className="truncate">{value || <span className="text-slate-300">Type</span>}</span>
        <span className="shrink-0 text-slate-400">▾</span>
      </button>
      {open && (
        <div className="absolute left-0 top-7 z-40 w-44 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl">
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
        </div>
      )}
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
  const label = ITEM_STATUSES.find((s) => s.value === status)?.label ?? status;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[status]}`}
      >
        {label}
      </button>
      {open && (
        <div className="absolute left-0 top-7 z-40 w-40 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl">
          {ITEM_STATUSES.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => {
                onSave(s.value);
                setOpen(false);
              }}
              className={`block w-full px-3 py-1.5 text-left text-xs transition hover:bg-slate-50 ${
                s.value === status ? "font-semibold text-indigo-600" : "text-slate-700"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}
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
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dateError, setDateError] = useState("");
  const [selectedCalendar, setSelectedCalendar] = useState<CalendarDoc | null>(null);

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

  const { data: items = [], isLoading: itemsLoading } = useQuery<CalendarItem[]>({
    queryKey: ["calendarItems", selectedCalendar?._id],
    queryFn: async () => {
      const res = await axiosMarketing.get(`/calendar-items/${selectedCalendar!._id}`);
      return res.data.data;
    },
    enabled: !!selectedCalendar,
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
      queryClient.invalidateQueries({ queryKey: ["calendarItems", selectedCalendar?._id] });
    },
  });

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
    <div className="min-h-full w-full">

      {/* ── Top section with padding ───────────────────────── */}
      <div className="px-8 pt-8 pb-4">

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
          <form onSubmit={handleCreateCalendar} className="flex flex-wrap gap-2">
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
              onChange={(e) => { setStartDate(e.target.value); setDateError(""); }}
              className="rounded-lg border border-slate-300/70 bg-white/70 px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
            />
            <input
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(e) => { setEndDate(e.target.value); setDateError(""); }}
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
              {createCalendarMutation.isPending ? "Creating..." : "Create Calendar"}
            </button>
          </form>
          {dateError && <p className="mt-2 text-xs text-rose-500">{dateError}</p>}
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
        <div className="border-t border-slate-200/60 bg-white/30 backdrop-blur-xl">

          {/* Table meta bar */}
          <div className="flex items-center justify-between px-8 py-2.5 border-b border-slate-200/60 bg-white/50">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-slate-800">
                {selectedCalendar.title}
              </span>
              <span className="text-xs text-slate-400">
                {fmt(selectedCalendar.startDate)} → {fmt(selectedCalendar.endDate)}
              </span>
            </div>
            <span className="text-xs text-slate-400">{items.length} working days</span>
          </div>

          {itemsLoading ? (
            <div className="py-12 text-center text-sm text-slate-400">Loading rows...</div>
          ) : (
            <div className="overflow-x-auto px-4">
              <table className="w-full text-left" style={{ tableLayout: "fixed", minWidth: "1100px" }}>
                <colgroup>
                  <col style={{ width: "36px" }} />   {/* # */}
                  <col style={{ width: "110px" }} />  {/* Schedule Date */}
                  <col style={{ width: "100px" }} />  {/* Content Date */}
                  <col style={{ width: "100px" }} />  {/* Delivery Date */}
                  <col style={{ width: "110px" }} />  {/* Creative Team */}
                  <col style={{ width: "140px" }} />  {/* Post Type */}
                  <col style={{ width: "180px" }} />  {/* Post Headline */}
                  <col style={{ width: "148px" }} />  {/* Platforms — 4×(28+4)=128 +20pad */}
                  <col style={{ width: "120px" }} />  {/* Status */}
                  <col style={{ width: "120px" }} />  {/* Delivery Link */}
                  <col style={{ width: "150px" }} />  {/* Notes */}
                </colgroup>

                <thead className="sticky top-0 z-10 bg-white/90 backdrop-blur">
                  <tr className="border-b-2 border-slate-200">
                    {[
                      "#",
                      "Schedule Date",
                      "Content Date",
                      "Delivery Date",
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

                    return (
                      <>
                        {isWeekStart && <WeekRow key={`w-${weekNumber}`} week={weekNumber} />}

                        <tr
                          key={item._id}
                          className="border-b border-slate-100 transition hover:bg-indigo-50/30"
                        >
                          <td className="px-3 py-2.5 text-xs text-slate-400">{idx + 1}</td>

                          <td className="px-3 py-2.5 text-xs font-semibold text-slate-700 whitespace-nowrap">
                            {fmt(item.scheduleDate)}
                          </td>

                          <td className="px-3 py-2.5">
                            <EditableCell
                              type="date"
                              value={fmtInput(item.contentDate)}
                              onSave={(v) => update(item._id, { contentDate: v || undefined })}
                              placeholder="Set date"
                            />
                          </td>

                          <td className="px-3 py-2.5">
                            <EditableCell
                              type="date"
                              value={fmtInput(item.deliveryDate)}
                              onSave={(v) => update(item._id, { deliveryDate: v || undefined })}
                              placeholder="Set date"
                            />
                          </td>

                          <td className="px-3 py-2.5">
                            <EditableCell
                              value={item.creativeTeam ?? ""}
                              onSave={(v) => update(item._id, { creativeTeam: v })}
                              placeholder="Team"
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
                              onSave={(v) => update(item._id, { postHeadline: v })}
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
                              onSave={(v) => update(item._id, { deliveryLink: v })}
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
          <p className="text-sm text-slate-400">No calendars yet. Create one above.</p>
        </div>
      )}
      {calendars.length > 0 && !selectedCalendar && (
        <div className="px-6 py-16 text-center">
          <p className="text-sm text-slate-400">Select a calendar above to view content rows.</p>
        </div>
      )}
    </div>
  );
};

export default ContentCalMain;