"use client";

import useAxiosAdmin from "@/uri/useAxiosAdmin";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router";

// ─── Types ────────────────────────────────────────────────────

type ClientStatus = "running" | "done";

interface Creator {
  _id: string;
  name: string;
  email: string;
}

interface ClientAgreement {
  id: string;
  name: string;
  agreementDate: string;
  status: ClientStatus;
  creator?: Creator;
}

const formatDate = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// ─── Main ─────────────────────────────────────────────────────

const AdminContentCalenderClient = () => {
  const [runningSearch, setRunningSearch] = useState("");
  const [doneSearch, setDoneSearch] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);

  // ── NEW: Add Client form state ──────────────────────────────
  const [name, setName] = useState("");
  const [agreementDate, setAgreementDate] = useState("");
  const [formError, setFormError] = useState("");
  const [addSuccess, setAddSuccess] = useState(false);

  const STATUS_TO_BACKEND = { running: "ACTIVE", done: "DONE" };
  const CANCELLED_STATUS = "INACTIVE";

  const axiosAdmin = useAxiosAdmin();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: clientData = [], isLoading } = useQuery({
    queryKey: ["adminAllClients"],
    queryFn: async () => {
      const res = await axiosAdmin.get("/content-calendar/clients");
      return res.data?.data ?? [];
    },
  });

  const clients: ClientAgreement[] = (clientData || [])
    .map((item: any, index: number) => {
      const id =
        item._id ??
        item.id ??
        `${item.name ?? "client"}-${item.agreementDate ?? item.createdAt ?? "date"}-${index}`;
      const rawStatus = item.status;
      const status: ClientStatus | null =
        rawStatus === "ACTIVE"
          ? "running"
          : rawStatus === "DONE"
          ? "done"
          : null;

      return {
        id,
        name: item.name ?? "",
        agreementDate: item.agreementDate ?? item.createdAt ?? "",
        status,
        creator: item.creatorId ?? null,
      };
    })
    .filter((c: { status: ClientStatus | null }) => c.status !== null) as ClientAgreement[];

  // ── NEW: Add Client mutation ────────────────────────────────
  const mutationAddClient = useMutation({
    mutationFn: async (data: { name: string; agreementDate: string }) => {
      const res = await axiosAdmin.post("/content-calendar/client", data);
      return res.data;
    },
    onSuccess: () => {
      setName("");
      setAgreementDate("");
      setFormError("");
      setAddSuccess(true);
      queryClient.invalidateQueries({ queryKey: ["adminAllClients"] });
      setTimeout(() => setAddSuccess(false), 2500);
    },
    onError: () => {
      setFormError("Client add করা যায়নি। আবার চেষ্টা করুন।");
    },
  });

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!name.trim() || !agreementDate) {
      setFormError("Client name এবং agreement date দুটোই দিতে হবে।");
      return;
    }
    mutationAddClient.mutate({ name: name.trim(), agreementDate });
  };

  const mutationStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await axiosAdmin.patch(`/content-calendar/client/${id}`, { status });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminAllClients"] });
    },
    onError: () => {
      alert("Status update failed. Please try again.");
    },
  });

  const handleMarkDone = (id: string) => {
    mutationStatus.mutate({ id, status: STATUS_TO_BACKEND.done });
  };

  const handleCancel = (id: string) => {
    mutationStatus.mutate({ id, status: CANCELLED_STATUS });
  };

  const handleClientClick = (client: ClientAgreement) => {
    setActiveId(client.id);
    navigate(`/dashboard/admin/content-calendar/${client.id}`);
  };

  const runningClients = clients.filter(
    (c) =>
      c.status === "running" &&
      c.name.toLowerCase().includes(runningSearch.toLowerCase())
  );

  const doneClients = clients.filter(
    (c) =>
      c.status === "done" &&
      c.name.toLowerCase().includes(doneSearch.toLowerCase())
  );

  const renderTable = (
    title: string,
    list: ClientAgreement[],
    search: string,
    onSearch: (v: string) => void,
    emptyLabel: string,
    showActions?: boolean,
    dimmed?: boolean
  ) => (
    <div>
      <h2
        className={`text-xs font-semibold uppercase tracking-wider ${
          dimmed ? "text-slate-400" : "text-slate-500"
        }`}
      >
        {title} ({list.length})
      </h2>

      <input
        type="text"
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        placeholder="Search by name..."
        className={`mt-2 w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2 ${
          dimmed
            ? "border-slate-300/50 bg-white/30 text-slate-500 placeholder-slate-400/70 focus:border-slate-400 focus:bg-white/40 focus:ring-slate-200"
            : "border-slate-300/70 bg-white/50 text-slate-900 placeholder-slate-400 focus:border-indigo-400 focus:bg-white/70 focus:ring-indigo-200"
        }`}
      />

      <div
        className={`mt-3 overflow-hidden rounded-2xl border shadow-xl backdrop-blur-2xl backdrop-saturate-150 ${
          dimmed
            ? "border-white/30 bg-white/15 shadow-slate-900/5"
            : "border-white/50 bg-white/25 shadow-slate-900/10"
        }`}
      >
        {/* Table header */}
        <div
          className={`grid grid-cols-[1fr_auto_auto] items-center gap-4 border-b px-4 py-2.5 ${
            dimmed
              ? "border-slate-200/40 bg-white/10"
              : "border-slate-200/60 bg-white/20"
          }`}
        >
          <span className={`text-[11px] font-semibold uppercase tracking-wide ${dimmed ? "text-slate-400" : "text-slate-500"}`}>
            Client name
          </span>
          <span className={`text-[11px] font-semibold uppercase tracking-wide ${dimmed ? "text-slate-400" : "text-slate-500"}`}>
            Created by
          </span>
          <span className={`text-[11px] font-semibold uppercase tracking-wide ${dimmed ? "text-slate-400" : "text-slate-500"}`}>
            Agreement date
          </span>
        </div>

        {isLoading ? (
          <p className="px-4 py-6 text-center text-sm text-slate-400">Loading clients...</p>
        ) : list.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-slate-400">{emptyLabel}</p>
        ) : (
          <ul>
            {list.map((client, index) => (
              <li
                key={client.id}
                onClick={() => handleClientClick(client)}
                className={`grid grid-cols-[1fr_auto_auto] cursor-pointer items-center gap-4 px-4 py-3 transition ${
                  dimmed ? "hover:bg-white/20" : "hover:bg-white/30"
                } ${
                  index !== list.length - 1
                    ? dimmed
                      ? "border-b border-slate-200/40"
                      : "border-b border-slate-200/60"
                    : ""
                } ${
                  activeId === client.id
                    ? dimmed
                      ? "bg-white/25"
                      : "bg-white/40"
                    : ""
                }`}
              >
                {/* Client name */}
                <span
                  className={`text-sm font-medium truncate ${
                    dimmed ? "text-slate-500" : "text-slate-900"
                  }`}
                >
                  {client.name}
                </span>

                {/* Creator */}
                <span className="flex items-center gap-1.5 shrink-0">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-700">
                    {client.creator?.name?.[0]?.toUpperCase() ?? "?"}
                  </span>
                  <span className={`text-xs ${dimmed ? "text-slate-400" : "text-slate-500"}`}>
                    {client.creator?.name ?? "Unknown"}
                  </span>
                </span>

                {/* Date + actions */}
                <span className="flex items-center gap-2 shrink-0">
                  <span className={`text-sm ${dimmed ? "text-slate-400" : "text-slate-500"}`}>
                    {formatDate(client.agreementDate)}
                  </span>

                  {showActions && (
                    <>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkDone(client.id);
                        }}
                        className="rounded-md border border-slate-300/70 bg-white/60 px-2 py-1 text-[11px] font-medium text-slate-600 transition hover:border-indigo-400 hover:text-indigo-600"
                      >
                        Mark done
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancel(client.id);
                        }}
                        className="rounded-md border border-rose-300/70 bg-white/60 px-2 py-1 text-[11px] font-medium text-rose-500 transition hover:border-rose-400 hover:bg-rose-50"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-full w-full px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Content Calendar — All Clients
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Overview of every client across all marketing employees.
          </p>
        </div>

        {/* ── NEW: Add Client Form (Admin) ──────────────────── */}
        <form
          onSubmit={handleAddClient}
          className="mb-8 rounded-2xl border border-white/50 bg-white/25 p-5 shadow-xl shadow-slate-900/10 backdrop-blur-2xl backdrop-saturate-150"
        >
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Add New Client
            </p>
            {addSuccess && (
              <span className="text-xs font-medium text-emerald-600">
                ✓ Client added successfully
              </span>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="adminClientName"
                className="text-xs font-medium uppercase tracking-wide text-slate-600"
              >
                Client name
              </label>
              <input
                id="adminClientName"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sunrise Apparel Co."
                className="rounded-lg border border-slate-300/70 bg-white/50 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-indigo-400 focus:bg-white/70 focus:ring-2 focus:ring-indigo-200"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="adminAgreementDate"
                className="text-xs font-medium uppercase tracking-wide text-slate-600"
              >
                Agreement date
              </label>
              <input
                id="adminAgreementDate"
                type="date"
                value={agreementDate}
                onChange={(e) => setAgreementDate(e.target.value)}
                className="rounded-lg border border-slate-300/70 bg-white/50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white/70 focus:ring-2 focus:ring-indigo-200"
              />
            </div>
          </div>

          {formError && <p className="mt-3 text-sm text-rose-600">{formError}</p>}

          <button
            type="submit"
            disabled={mutationAddClient.isPending}
            className="mt-4 w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60 sm:w-auto"
          >
            {mutationAddClient.isPending ? "Adding..." : "Add client"}
          </button>
        </form>

        <div className="grid gap-6 sm:grid-cols-2">
          {renderTable(
            "Running clients",
            runningClients,
            runningSearch,
            setRunningSearch,
            "No running clients match your search.",
            true
          )}
          {renderTable(
            "Work done",
            doneClients,
            doneSearch,
            setDoneSearch,
            "No completed clients match your search.",
            false,
            true
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminContentCalenderClient;