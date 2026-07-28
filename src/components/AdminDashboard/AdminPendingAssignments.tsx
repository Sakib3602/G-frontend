import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAxiosAdmin from "@/uri/useAxiosAdmin";

interface SuggestedUser {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface AssignmentProgress {
  userId: string;
  userName: string;
  userEmail: string;
  role: string;
  assignedAt: string;
  taskStatus: "pending" | "completed";
}

interface QualifiedWithAssignments {
  _id: string;
  dealFinalLink: string;
  dealmoney?: number;
  eligibleRoles: string[];
  missingRoles: string[];
  assignments: AssignmentProgress[];
  suggestedUsers: SuggestedUser[];
  fullyAssigned: boolean;
  leadId: {
    _id: string;
    leadName: string;
    companyName?: string;
    ServiceNeed?: string;
    email?: string;
    phone?: string;
    region?: string;
    leadScore?: number;
  };
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export default function AdminPendingAssignments() {
  const axiosAdmin = useAxiosAdmin();
  const queryClient = useQueryClient();
  const [pickerFor, setPickerFor] = useState<string | null>(null);
  const [tab, setTab] = useState<"needsAssignment" | "fullyAssigned">("needsAssignment");

  const { data: leads = [], isLoading, isError } = useQuery<QualifiedWithAssignments[]>({
    queryKey: ["admin-qualified-assignments"],
    queryFn: async () => {
      const res = await axiosAdmin.get("/qualified/all-with-assignments");
      return res.data.data;
    },
  });

  const assignMutation = useMutation({
    mutationFn: async ({ id, userId, role }: { id: string; userId: string; role: string }) => {
      const res = await axiosAdmin.put(`/qualified/${id}/assign`, { userId, role });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-qualified-assignments"] });
      setPickerFor(null);
    },
  });

  const unassignMutation = useMutation({
    mutationFn: async ({ id, userId }: { id: string; userId: string }) => {
      const res = await axiosAdmin.put(`/qualified/${id}/unassign`, { userId });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-qualified-assignments"] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[50vh] bg-white">
        <div className="w-5 h-5 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
        <span className="mt-3 text-xs tracking-wider text-slate-400 uppercase font-medium">
          Loading assignment queue...
        </span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 max-w-md mx-auto mt-20 border border-red-100 rounded-lg text-center bg-white">
        <p className="text-sm font-semibold text-red-600">Sync Failure</p>
        <p className="text-xs text-slate-400 mt-1">Unable to fetch qualified leads.</p>
      </div>
    );
  }

  const needsAssignment = leads.filter((l) => !l.fullyAssigned);
  const fullyAssigned = leads.filter((l) => l.fullyAssigned);
  const activeList = tab === "needsAssignment" ? needsAssignment : fullyAssigned;

  return (
    <div className="w-full bg-white px-6 py-10 lg:px-14 font-sans min-h-screen text-slate-900 antialiased">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 pb-6 border-b border-slate-100">
          <p className="text-[10px] tracking-widest text-slate-400 uppercase font-bold mb-1">
            Assignment Queue
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Qualified Lead Assignments
          </h1>
        </div>

        <div className="flex items-center gap-1 border-b border-slate-100 mb-6">
          <button
            onClick={() => setTab("needsAssignment")}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 -mb-px transition-colors ${
              tab === "needsAssignment"
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            Needs Assignment
            <span className="ml-2 text-[10px] font-mono font-medium text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200/60">
              {needsAssignment.length}
            </span>
          </button>
          <button
            onClick={() => setTab("fullyAssigned")}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 -mb-px transition-colors ${
              tab === "fullyAssigned"
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            Fully Assigned
            <span className="ml-2 text-[10px] font-mono font-medium text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200/60">
              {fullyAssigned.length}
            </span>
          </button>
        </div>

        {activeList.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-slate-300 rounded-xl bg-white">
            <p className="text-sm font-semibold text-slate-700">
              {tab === "needsAssignment" ? "All caught up" : "Nothing assigned yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeList.map((q) => (
              <div key={q._id} className="bg-white border border-slate-200 rounded-xl p-5">
                <div className="flex justify-between items-start gap-4 flex-wrap">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {q.leadId?.companyName || q.leadId?.leadName}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {q.leadId?.leadName} • {q.leadId?.email || "—"} • {q.leadId?.phone || "—"}
                    </p>
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      {(q.leadId?.ServiceNeed || "")
                        .split("&")
                        .map((s) => s.trim())
                        .filter(Boolean)
                        .map((s) => (
                          <span
                            key={s}
                            className="text-[10px] font-bold uppercase tracking-wide bg-slate-100 text-slate-600 px-2 py-0.5 rounded"
                          >
                            {s}
                          </span>
                        ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wide">Deal Value</p>
                    <p className="text-sm font-bold text-slate-900">
                      ${q.dealmoney?.toLocaleString() ?? 0}
                    </p>
                  </div>
                </div>

                {/* ── Assigned people + progress ── */}
                {q.assignments.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                      Assigned ({q.assignments.length})
                    </p>
                    {q.assignments.map((a) => (
                      <div
                        key={a.userId}
                        className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-lg px-3 py-2"
                      >
                        <div>
                          <p className="text-xs font-semibold text-slate-800">
                            {a.userName}{" "}
                            <span className="text-[10px] font-normal text-slate-400 uppercase">
                              ({a.role})
                            </span>
                          </p>
                          <p className="text-[10px] text-slate-400">{a.userEmail}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded border ${STATUS_STYLES[a.taskStatus]}`}
                          >
                            {a.taskStatus === "completed" ? "✓ Completed" : "In Progress"}
                          </span>
                          <button
                            onClick={() => unassignMutation.mutate({ id: q._id, userId: a.userId })}
                            disabled={unassignMutation.isPending}
                            className="text-[10px] text-red-500 hover:text-red-700 font-semibold"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* ── Missing role slots — assign more people ── */}
                {q.missingRoles.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wide mb-2">
                      Still needs: {q.missingRoles.join(", ")}
                    </p>
                    {pickerFor === q._id ? (
                      <div className="flex items-center gap-2 flex-wrap">
                        <select
                          className="border border-slate-200 rounded px-2 py-1.5 text-xs flex-1 min-w-55 bg-white"
                          defaultValue=""
                          disabled={assignMutation.isPending}
                          onChange={(e) => {
                            const [userId, role] = e.target.value.split("::");
                            if (userId && role) {
                              assignMutation.mutate({ id: q._id, userId, role });
                            }
                          }}
                        >
                          <option value="" disabled>
                            Select a person + role…
                          </option>
                          {q.missingRoles.map((role) =>
                            q.suggestedUsers
                              .filter((u) => !q.assignments.some((a) => a.userId === u._id))
                              .map((u) => (
                                <option key={`${role}-${u._id}`} value={`${u._id}::${role}`}>
                                  {u.name} ({u.role}) — assign as "{role}"
                                  {u.role === role ? " ★" : ""}
                                </option>
                              )),
                          )}
                        </select>
                        <button
                          onClick={() => setPickerFor(null)}
                          disabled={assignMutation.isPending}
                          className="text-xs text-slate-400 hover:text-slate-700"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setPickerFor(q._id)}
                        className="px-4 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded"
                      >
                        + Assign
                      </button>
                    )}
                  </div>
                )}

                {q.eligibleRoles.length === 0 && q.assignments.length === 0 && (
                  <p className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-400 italic">
                    No matching team role for this lead's service — manual assignment only.
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}