"use client";

import useAxiosMarketing from "@/uri/useAxiosMarketing";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useUserDataMarketing } from "./HOOK/User_Data_Marketer";

type ClientStatus = "running" | "done";

interface ClientAgreement {
  id: string;
  name: string;
  agreementDate: string;
  status: ClientStatus;
}

const initialClients: ClientAgreement[] = [
  { id: "1", name: "Sunrise Apparel Co.", agreementDate: "2026-01-12", status: "running" },
  { id: "2", name: "Bluewave Tech", agreementDate: "2026-01-20", status: "running" },
  { id: "3", name: "Greenfield Organics", agreementDate: "2026-02-03", status: "running" },
  { id: "4", name: "Nova Fitness Studio", agreementDate: "2026-02-15", status: "running" },
  { id: "5", name: "Maple & Co. Bakery", agreementDate: "2026-02-28", status: "running" },
  { id: "6", name: "Pixel Forge Studios", agreementDate: "2026-03-05", status: "running" },
  { id: "7", name: "Harbor Real Estate", agreementDate: "2026-03-18", status: "done" },
  { id: "8", name: "Crimson Coffee House", agreementDate: "2026-03-30", status: "done" },
  { id: "9", name: "Lunar Skincare", agreementDate: "2026-04-09", status: "done" },
  { id: "10", name: "Atlas Logistics", agreementDate: "2026-04-22", status: "done" },
  { id: "11", name: "Velvet & Vine Florists", agreementDate: "2026-05-02", status: "done" },
  { id: "12", name: "Northstar Consulting", agreementDate: "2026-05-14", status: "done" },
];

const formatDate = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const ContentCalenderClient = () => {
  const [clients, setClients] = useState<ClientAgreement[]>(initialClients);
  const [name, setName] = useState("");
  const [agreementDate, setAgreementDate] = useState("");
  const [error, setError] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);

  const [runningSearch, setRunningSearch] = useState("");
  const [doneSearch, setDoneSearch] = useState("");

  const axiosMarketing = useAxiosMarketing();

  const { userData } = useUserDataMarketing();
  

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !agreementDate) {
      setError("Please fill in both the client name and agreement date.");
      return;
    }

    const newClient: ClientAgreement = {
      id: Date.now().toString(),
      name: name.trim(),
      agreementDate,
      status: "running",
    };

    mutationAdd.mutate({ name: newClient.name, agreementDate: newClient.agreementDate });

    setClients((prev) => [newClient, ...prev]);
    setName("");
    setAgreementDate("");
    setError("");
  };

  const mutationAdd = useMutation({
    mutationFn: async (data: { name: string; agreementDate: string }) => {
      const res = await axiosMarketing.post(`/create-client/${userData?._id}`, data);
      return res.data;
    },
    onSuccess: () => {
        alert("Client added successfully!");
    } 
  })

  const handleClientClick = (client: ClientAgreement) => {
    console.log(client.id);
    setActiveId(client.id);
  };

  const toggleStatus = (id: string) => {
    setClients((prev) =>
      prev.map((client) =>
        client.id === id
          ? { ...client, status: client.status === "running" ? "done" : "running" }
          : client
      )
    );
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
    actionLabel?: string,
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

        {list.length === 0 ? (
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

                <span className="flex items-center gap-3">
                  <span
                    className={`text-sm ${
                      dimmed ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    {formatDate(client.agreementDate)}
                  </span>
                  {actionLabel && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStatus(client.id);
                      }}
                      className="rounded-md border border-slate-300/70 bg-white/60 px-2 py-1 text-[11px] font-medium text-slate-600 transition hover:border-indigo-400 hover:text-indigo-600"
                    >
                      {actionLabel}
                    </button>
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
            className="mt-4 w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 sm:w-auto"
          >
            Add client
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
            "Mark done"
          )}

          {renderTable(
            "Work done",
            doneClients.length,
            doneClients,
            doneSearch,
            setDoneSearch,
            "No completed clients match your search.",
            undefined,
            true
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentCalenderClient;