
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
  | "SCHEDULED";

interface CreativeTeamRef {
  _id: string;
  name: string;
  email?: string;
}

interface CalendarItem {
  _id: string;
  scheduleDate: string;
  contentDate?: string;
  deliveryDate?: string;
  creativeTeam?: string;
  creativeTeamId?: CreativeTeamRef | string;
  postType?: string;
  postHeadline?: string;
  platforms?: Platform[];
  status: ItemStatus;
  deliveryLink?: string;
  notes?: string;
  clientId?: { _id: string; name: string } | string;
  reportSent?: boolean;
}

interface DesignerOption {
  _id: string;
  name: string;
  email: string;
}

interface ClientOption {
  _id: string;
  name: string;
  status?: string;
  agreementDate?: string;
  itemCount: number;
}

interface DashboardStats {
  running: number;
  dueThisMonth: number;
  missedLastMonth: number;
}

interface CalendarItemsResponse {
  items: CalendarItem[];
  stats: DashboardStats;
  fullAccess: boolean;
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

const CLIENT_STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700",
  PAUSED: "bg-orange-100 text-orange-600",
  INACTIVE: "bg-slate-100 text-slate-500",
};

const SAFE_STATUSES: ItemStatus[] = ["ACCEPTED", "PUBLISHED", "DELIVERED"];

const PLATFORM_SHORT: Record<Platform, string> = {
  FACEBOOK: "FB",
  INSTAGRAM: "IG",
  LINKEDIN: "LI",
  YOUTUBE: "YT",
};

// ব্যাকএন্ডের POST_TYPE_OPTIONS এর সাথে হুবহু মিলিয়ে রাখো — নাহলে
// dropdown এ পাঠানো value backend এ invalid বলে reject হবে।
const POST_TYPE_OPTIONS = [
   "Static",
  "Reel",
  "Motion Graphics",
  "Memes (Static)",
  "No Post",
  "Cover Photo",
];

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

const isOverdueLive = (item: CalendarItem) => {
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

// ─── Delivery Link Cell (editable only for normal designers) ──

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

// ─── Creative Team Cell (editable only for full-access designer) ──

const CreativeTeamCell = ({
  itemId,
  currentId,
  currentName,
  designers,
  onSave,
  saving,
}: {
  itemId: string;
  currentId: string;
  currentName: string;
  designers: DesignerOption[];
  onSave: (id: string, creativeTeamId: string) => void;
  saving: boolean;
}) => {
  return (
    <select
      value={currentId}
      disabled={saving}
      onChange={(e) => {
        const next = e.target.value;
        if (next && next !== currentId) onSave(itemId, next);
      }}
      className="w-full rounded border border-indigo-300 bg-white px-2 py-1 text-xs text-slate-700 outline-none focus:ring-1 focus:ring-indigo-300 disabled:opacity-50"
    >
      <option value="" disabled>
        {currentName || "Unassigned"}
      </option>
      {designers.map((d) => (
        <option key={d._id} value={d._id}>
          {d.name}
        </option>
      ))}
    </select>
  );
};

// ─── Post Type Cell (editable only for full-access designer) ──

const PostTypeCell = ({
  itemId,
  currentValue,
  onSave,
  saving,
}: {
  itemId: string;
  currentValue: string;
  onSave: (id: string, postType: string) => void;
  saving: boolean;
}) => {
  return (
    <select
      value={currentValue || ""}
      disabled={saving}
      onChange={(e) => {
        const next = e.target.value;
        if (next && next !== currentValue) onSave(itemId, next);
      }}
      className="w-full rounded border border-indigo-300 bg-white px-2 py-1 text-xs text-slate-700 outline-none focus:ring-1 focus:ring-indigo-300 disabled:opacity-50"
    >
      <option value="" disabled>
        {currentValue || "Select type"}
      </option>
      {POST_TYPE_OPTIONS.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
};

// ─── Client Card (grid item on the client-list screen) ─────────

const ClientCard = ({
  client,
  onClick,
}: {
  client: ClientOption;
  onClick: () => void;
}) => {
  const statusStyle =
    CLIENT_STATUS_STYLES[client.status ?? ""] ?? "bg-slate-100 text-slate-500";

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-start gap-2 rounded-xl border border-white/50 bg-white/40 p-4 text-left shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/60 hover:shadow-md"
    >
      <div className="flex w-full items-start justify-between gap-2">
        <p className="text-sm font-semibold text-slate-800">{client.name}</p>
        {client.status && (
          <span
            className={`whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusStyle}`}
          >
            {client.status}
          </span>
        )}
      </div>
      <p className="text-xs text-slate-500">
        {client.itemCount} calendar item{client.itemCount === 1 ? "" : "s"}
      </p>
      {client.agreementDate && (
        <p className="text-[11px] text-slate-400">
          Agreement: {fmt(client.agreementDate)}
        </p>
      )}
    </button>
  );
};

// ─── Client List Screen (full-access designer, before picking a client) ──

const ClientListScreen = ({
  onSelectClient,
}: {
  onSelectClient: (client: ClientOption) => void;
}) => {
  const axiosDesigner = useAxiosDesigner();

  const { data, isLoading } = useQuery<ClientOption[]>({
    queryKey: ["designerClientsList"],
    queryFn: async () => {
      const res = await axiosDesigner.get("/api/v1/designer/clients-list");
      return res.data.data;
    },
  });

  const clients = data ?? [];

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-slate-400">
        Loading clients...
      </div>
    );
  }

  return (
    <div className="min-h-full w-full px-6 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">
          All Clients
        </h1>
        <p className="mt-0.5 text-sm text-slate-500">
          একটা client এ click করে তার পুরো calendar দেখো।
        </p>
      </div>

      {clients.length === 0 ? (
        <div className="rounded-xl border border-white/50 bg-white/30 p-10 text-center text-sm text-slate-400">
          কোনো client পাওয়া যায়নি।
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {clients.map((client) => (
            <ClientCard
              key={client._id}
              client={client}
              onClick={() => onSelectClient(client)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Calendar Table (shared by normal designer + client-detail view) ──

const CalendarTable = ({
  clientId,
  clientName,
  fullAccessOverride,
  onBack,
}: {
  // clientId থাকলে শুধু ওই client এর item আসবে (full-access flow)
  clientId?: string;
  clientName?: string;
  // fullAccessOverride true মানে আমরা জানি এইটা full-access designer এর
  // client-detail view, তাই creativeTeam dropdown দেখাতে হবে।
  fullAccessOverride?: boolean;
  onBack?: () => void;
}) => {
  const axiosDesigner = useAxiosDesigner();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<CalendarItemsResponse>({
    queryKey: ["designerCalendarItems", clientId ?? "own"],
    queryFn: async () => {
      const res = await axiosDesigner.get("/api/v1/designer/calendar-items", {
        params: clientId ? { clientId } : undefined,
      });
      return res.data.data;
    },
  });

  const items = data?.items ?? [];
  const stats = data?.stats ?? { running: 0, dueThisMonth: 0, missedLastMonth: 0 };
  const fullAccess = fullAccessOverride ?? data?.fullAccess ?? false;

  const { data: designersData } = useQuery<DesignerOption[]>({
    queryKey: ["designersList"],
    queryFn: async () => {
      const res = await axiosDesigner.get("/api/v1/designer/designers-list");
      return res.data.data;
    },
    enabled: fullAccess,
  });

  const designers = designersData ?? [];

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

  // Creative Team ও Post Type — দুইটাই এই একই endpoint দিয়ে আপডেট হয়,
  // প্রতিটা কল এ যেকোনো একটা field পাঠানো হয়।
  const updateFullAccessFieldsMutation = useMutation({
    mutationFn: async ({
      id,
      creativeTeamId,
      postType,
    }: {
      id: string;
      creativeTeamId?: string;
      postType?: string;
    }) => {
      const res = await axiosDesigner.patch(
        `/api/v1/designer/calendar-item/${id}/full-access-fields`,
        { creativeTeamId, postType },
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["designerCalendarItems"] });
      queryClient.invalidateQueries({ queryKey: ["designerClientsList"] });
    },
    onError: (err) => {
      console.error("Failed to update calendar item:", err);
      alert("Update করা যায়নি, আবার চেষ্টা করো।");
    },
  });

  const handleSaveLink = (id: string, link: string) => {
    updateLinkMutation.mutate({ id, deliveryLink: link });
  };

  const handleSaveCreativeTeam = (id: string, creativeTeamId: string) => {
    updateFullAccessFieldsMutation.mutate({ id, creativeTeamId });
  };

  const handleSavePostType = (id: string, postType: string) => {
    updateFullAccessFieldsMutation.mutate({ id, postType });
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-slate-400">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-full w-full px-6 py-8">
      <div className="mb-6">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="mb-3 inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:underline"
          >
            ← All Clients
          </button>
        )}
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">
          {clientName ?? "My Tasks"}
        </h1>
        <p className="mt-0.5 text-sm text-slate-500">
          {fullAccess
            ? "শুধু Creative Team assignment বদলাতে পারবে, বাকি সব read-only।"
            : "Your assigned content items, sorted by delivery date."}
        </p>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Running" value={stats.running} tone="indigo" />
        <StatCard label="Due This Month" value={stats.dueThisMonth} tone="slate" />
        <StatCard label="Missed Last Month" value={stats.missedLastMonth} tone="rose" />
      </div>

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
                  fullAccess ? "Creative Team" : "Delivery Link",
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
                    no content items found.
                  </td>
                </tr>
              ) : (
                items.map((item, idx) => {
                  const overdue = item.reportSent || isOverdueLive(item);
                  const clientNameCell =
                    typeof item.clientId === "object" ? item.clientId?.name : "";

                  const creativeTeamId =
                    typeof item.creativeTeamId === "object"
                      ? item.creativeTeamId?._id ?? ""
                      : item.creativeTeamId ?? "";
                  const creativeTeamName =
                    typeof item.creativeTeamId === "object"
                      ? item.creativeTeamId?.name ?? item.creativeTeam ?? ""
                      : item.creativeTeam ?? "";

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
                        {clientNameCell || "—"}
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
                        {fullAccess ? (
                          <PostTypeCell
                            itemId={item._id}
                            currentValue={item.postType ?? ""}
                            onSave={handleSavePostType}
                            saving={
                              updateFullAccessFieldsMutation.isPending &&
                              updateFullAccessFieldsMutation.variables?.id === item._id &&
                              updateFullAccessFieldsMutation.variables?.postType !== undefined
                            }
                          />
                        ) : (
                          item.postType || <span className="text-slate-300">—</span>
                        )}
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
                        {fullAccess ? (
                          <CreativeTeamCell
                            itemId={item._id}
                            currentId={creativeTeamId}
                            currentName={creativeTeamName}
                            designers={designers}
                            onSave={handleSaveCreativeTeam}
                            saving={
                              updateFullAccessFieldsMutation.isPending &&
                              updateFullAccessFieldsMutation.variables?.id === item._id &&
                              updateFullAccessFieldsMutation.variables?.creativeTeamId !== undefined
                            }
                          />
                        ) : (
                          <DeliveryLinkCell
                            itemId={item._id}
                            value={item.deliveryLink ?? ""}
                            onSave={handleSaveLink}
                            saving={
                              updateLinkMutation.isPending &&
                              updateLinkMutation.variables?.id === item._id
                            }
                          />
                        )}
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

// ─── Main ─────────────────────────────────────────────────────

const DesignerMyTasksContent = () => {
  const axiosDesigner = useAxiosDesigner();
  const [selectedClient, setSelectedClient] = useState<ClientOption | null>(null);

  // fullAccess কিনা সেটা বোঝার জন্য /clients-list কল করে দেখি — 403
  // এলে normal designer, 200 এলে full-access designer।
  const { data: accessInfo, isLoading: accessLoading } = useQuery<{
    fullAccess: boolean;
  }>({
    queryKey: ["designerFullAccessCheck"],
    queryFn: async () => {
      try {
        await axiosDesigner.get("/api/v1/designer/clients-list");
        return { fullAccess: true };
      } catch (err: any) {
        if (err?.response?.status === 403) {
          return { fullAccess: false };
        }
        throw err;
      }
    },
  });

  if (accessLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-slate-400">
        Loading...
      </div>
    );
  }

  const fullAccess = accessInfo?.fullAccess ?? false;

  // Normal designer — আগের মতোই flat "My Tasks" view, client list নাই।
  if (!fullAccess) {
    return <CalendarTable fullAccessOverride={false} />;
  }

  // Full-access designer, কোনো client select করা হয়নি — client grid দেখাও।
  if (!selectedClient) {
    return <ClientListScreen onSelectClient={setSelectedClient} />;
  }

  // Full-access designer, client select করা হয়েছে — সেই client এর
  // calendar দেখাও, শুধু Creative Team dropdown editable।
  return (
    <CalendarTable
      clientId={selectedClient._id}
      clientName={selectedClient.name}
      fullAccessOverride={true}
      onBack={() => setSelectedClient(null)}
    />
  );
};

export default DesignerMyTasksContent;