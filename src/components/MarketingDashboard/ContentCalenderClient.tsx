"use client";

import useAxiosMarketing from "@/uri/useAxiosMarketing";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router";
import { useUserDataMarketing } from "./HOOK/User_Data_Marketer";
import Alert from "./Alert/Alert";

type ClientStatus = "running" | "done";

interface ClientAgreement {
  id: string;
  name: string;
  agreementDate: string;
  status: ClientStatus;
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

const ContentCalenderClient = () => {
  const [name, setName] = useState("");
  const [agreementDate, setAgreementDate] = useState("");
  const [error, setError] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);

  const [runningSearch, setRunningSearch] = useState("");
  const [doneSearch, setDoneSearch] = useState("");

  const STATUS_TO_BACKEND: Record<ClientStatus, string> = {
    running: "ACTIVE",
    done: "DONE",
  };
  const CANCELLED_STATUS = "INACTIVE";

  const axiosMarketing = useAxiosMarketing();
  const { userData } = useUserDataMarketing();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: clientData = [], isLoading } = useQuery({
    queryKey: ["getAllClients", userData?._id],
    queryFn: async () => {
      const res = await axiosMarketing.get(`/getClients/${userData?._id}`);
      const payload = res?.data?.data?.data ?? res?.data?.data ?? res?.data ?? [];
      return Array.isArray(payload) ? payload : [];
    },
    enabled: !!userData?._id,
  });

  const clients: ClientAgreement[] = (clientData || [])
    .map((item: any) => {
      const id = item._id ?? item.id ?? String(Math.random());
      const rawStatus = item.status;
      const status: ClientStatus | null =
        rawStatus === STATUS_TO_BACKEND.running
          ? "running"
          : rawStatus === STATUS_TO_BACKEND.done
          ? "done"
          : null;

      return {
        id,
        name: item.name ?? "",
        agreementDate: item.agreementDate ?? item.createdAt ?? "",
        status,
      };
    })
    .filter((client: { status: ClientStatus | null }) => client.status !== null) as ClientAgreement[];

  const [add, setAdd] = useState(false);
  const mutationAdd = useMutation({
    mutationFn: async (data: { name: string; agreementDate: string }) => {
      const res = await axiosMarketing.post(`/create-client/${userData?._id}`, data);
      return res.data;
    },
    onSuccess: () => {
      setAdd(true);
      queryClient.invalidateQueries({ queryKey: ["getAllClients", userData?._id] });
    },
  });

  const [statusCNG, setStatusCNG] = useState(false);

  const mutationStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await axiosMarketing.patch(`/update-client/${id}`, { status });
      return res.data;
    },
    onSuccess: () => {
      setStatusCNG(true);
      queryClient.invalidateQueries({ queryKey: ["getAllClients", userData?._id] });
    },
    onError: (err) => {
      console.error("Status change failed:", err);
      alert("Couldn't update status. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !agreementDate) {
      setError("Please fill in both the client name and agreement date.");
      return;
    }

    mutationAdd.mutate({ name: name.trim(), agreementDate });

    setName("");
    setAgreementDate("");
    setError("");
  };

  // Clicking a client row navigates to the client detail page, carrying
  // the specific client id in the route.
  const handleClientClick = (client: ClientAgreement) => {
    setActiveId(client.id);
    navigate(`/dashboard/marketing/content-calendar-main/${client.id}`);
  };

  const handleMarkDone = (id: string) => {
    mutationStatus.mutate({ id, status: STATUS_TO_BACKEND.done });
  };

  const handleCancel = (id: string) => {
    mutationStatus.mutate({ id, status: CANCELLED_STATUS });
  };

  const runningClients = clients.filter(
    (client) =>
      client.status === "running" &&
      client.name.toLowerCase().includes(runningSearch.toLowerCase())
  );

  const doneClients = clients.filter(
    (client) =>
      client.status === "done" &&
      client.name.toLowerCase().includes(doneSearch.toLowerCase())
  );

  const renderTable = (
    title: string,
    count: number,
    list: ClientAgreement[],
    search: string,
    onSearch: (value: string) => void,
    emptyLabel: string,
    showMarkDone?: boolean,
    dimmed?: boolean
  ) => (
    <div>
      <div className="flex items-center justify-between">
        <h2
          className={`text-xs font-semibold uppercase tracking-wider ${
            dimmed ? "text-slate-400" : "text-slate-500"
          }`}
        >
          {title} ({count})
        </h2>
      </div>

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
        <div
          className={`flex items-center justify-between border-b px-4 py-2.5 ${
            dimmed
              ? "border-slate-200/40 bg-white/10"
              : "border-slate-200/60 bg-white/20"
          }`}
        >
          <span
            className={`text-[11px] font-semibold uppercase tracking-wide ${
              dimmed ? "text-slate-400" : "text-slate-500"
            }`}
          >
            Client name
          </span>
          <span
            className={`text-[11px] font-semibold uppercase tracking-wide ${
              dimmed ? "text-slate-400" : "text-slate-500"
            }`}
          >
            Agreement date
          </span>
        </div>

        {isLoading ? (
          <p className="px-4 py-6 text-center text-sm text-slate-400">
            Loading clients...
          </p>
        ) : list.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-slate-400">
            {emptyLabel}
          </p>
        ) : (
          <ul>
            {list.map((client, index) => (
              <li
                key={client.id}
                onClick={() => handleClientClick(client)}
                className={`flex cursor-pointer items-center justify-between gap-3 px-4 py-3 transition ${
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
                <span
                  className={`text-sm font-medium ${
                    dimmed ? "text-slate-500" : "text-slate-900"
                  }`}
                >
                  {client.name}
                </span>

                <span className="flex items-center gap-2">
                  <span
                    className={`text-sm ${
                      dimmed ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    {formatDate(client.agreementDate)}
                  </span>

                  {showMarkDone && (
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
    <>
      {statusCNG && (
        <Alert
          title="Status Changed"
          message="Client status has been updated."
          onClose={() => setStatusCNG(false)}
        ></Alert>
      )}
      {add && (
        <Alert
          title="Client Added"
          message="New client has been added successfully."
          onClose={() => setAdd(false)}
        ></Alert>
      )}

      <div className="min-h-full w-full px-4 py-10">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Content Calendar
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Log a new client agreement, then track them through running and
              completed work.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-white/50 bg-white/25 p-5 shadow-xl shadow-slate-900/10 backdrop-blur-2xl backdrop-saturate-150"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="clientName"
                  className="text-xs font-medium uppercase tracking-wide text-slate-600"
                >
                  Client name
                </label>
                <input
                  id="clientName"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sunrise Apparel Co."
                  className="rounded-lg border border-slate-300/70 bg-white/50 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-indigo-400 focus:bg-white/70 focus:ring-2 focus:ring-indigo-200"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="agreementDate"
                  className="text-xs font-medium uppercase tracking-wide text-slate-600"
                >
                  Agreement date
                </label>
                <input
                  id="agreementDate"
                  type="date"
                  value={agreementDate}
                  onChange={(e) => setAgreementDate(e.target.value)}
                  className="rounded-lg border border-slate-300/70 bg-white/50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white/70 focus:ring-2 focus:ring-indigo-200"
                />
              </div>
            </div>

            {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}

            <button
              type="submit"
              disabled={mutationAdd.isPending}
              className="mt-4 w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60 sm:w-auto"
            >
              {mutationAdd.isPending ? "Adding..." : "Add client"}
            </button>
          </form>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {renderTable(
              "Running clients",
              runningClients.length,
              runningClients,
              runningSearch,
              setRunningSearch,
              "No running clients match your search.",
              true
            )}

            {renderTable(
              "Work done",
              doneClients.length,
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
    </>
  );
};

export default ContentCalenderClient;