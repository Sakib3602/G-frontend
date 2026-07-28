import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAxiosSales from "@/uri/useAxiosSales";

interface AssignedLead {
  _id: string;
  dealFinalLink: string;
  dealmoney?: number;
  signature: boolean;
  myRole: string;
  assignedAt?: string;
  taskStatus: "pending" | "completed";
  taskUpdatedAt?: string;
  leadId: {
    _id: string;
    leadName: string;
    companyName?: string;
    ServiceNeed?: string;
    email?: string;
    phone?: string;
    region?: string;
    leadScore?: number;
    status?: string;
  };
}

interface Props {
  title?: string;
  subtitle?: string;
}

// Web / Designer / Marketing — tin jaygatei ekই component, backend
// req.user.id diye filter kore dey, tai role-specific logic frontend-e lagbe na.
export default function TeamAssignedLeads({
  title = "My Assigned Leads",
  subtitle = "Qualified leads that admin has assigned to you.",
}: Props) {
  const axiosSales = useAxiosSales();
  const queryClient = useQueryClient();

  const { data: leads = [], isLoading, isError } = useQuery<AssignedLead[]>({
    queryKey: ["team-my-assigned-leads"],
    queryFn: async () => {
      const res = await axiosSales.get("/api/v1/team/my-assigned-leads");
      return res.data.data;
    },
  });

  const completeMutation = useMutation({
    mutationFn: async (leadId: string) => {
      const res = await axiosSales.put(`/api/v1/team/my-assigned-leads/${leadId}/complete`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-my-assigned-leads"] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[50vh] bg-white">
        <div className="w-5 h-5 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
        <span className="mt-3 text-xs tracking-wider text-slate-400 uppercase font-medium">
          Loading your assigned leads...
        </span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 max-w-md mx-auto mt-20 border border-red-100 rounded-lg text-center bg-white">
        <p className="text-sm font-semibold text-red-600">Sync Failure</p>
        <p className="text-xs text-slate-400 mt-1">Unable to fetch your assigned leads.</p>
      </div>
    );
  }

  const pending = leads.filter((l) => l.taskStatus === "pending");
  const completed = leads.filter((l) => l.taskStatus === "completed");

  return (
    <div className="w-full  px-6 py-10 lg:px-14 font-sans min-h-screen text-slate-900 antialiased">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 pb-6 border-b border-slate-100">
          <p className="text-[10px] tracking-widest text-slate-400 uppercase font-bold mb-1">
            Assigned To You
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
          <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
        </div>

        {leads.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-slate-300 rounded-xl bg-white">
            <p className="text-sm font-semibold text-slate-700">Nothing assigned yet</p>
            <p className="text-xs text-slate-400 mt-1">Admin hasn't assigned any qualified lead to you.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {pending.length > 0 && (
              <div>
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">
                  In Progress ({pending.length})
                </h2>
                <div className="space-y-3">
                  {pending.map((l) => (
                    <div key={l._id} className="bg-white border border-slate-200 rounded-xl p-5">
                      <div className="flex justify-between items-start gap-4 flex-wrap">
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">
                            {l.leadId?.companyName || l.leadId?.leadName}
                          </h3>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {l.leadId?.leadName} • {l.leadId?.email || "—"} • {l.leadId?.phone || "—"}
                          </p>
                          <div className="flex gap-1.5 mt-2 flex-wrap items-center">
                            {(l.leadId?.ServiceNeed || "")
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
                            <span className="text-[10px] font-bold uppercase tracking-wide bg-[#99B562]/10 text-[#7a914e] px-2 py-0.5 rounded">
                              your role: {l.myRole}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wide">
                            Deal Value
                          </p>
                          <p className="text-sm font-bold text-slate-900">
                            ${l.dealmoney?.toLocaleString() ?? 0}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
                        <button
                          onClick={() => completeMutation.mutate(l.leadId._id)}
                          disabled={completeMutation.isPending}
                          className="px-4 py-1.5 text-xs font-bold text-white bg-[#99B562] hover:bg-[#85a052] rounded disabled:opacity-50"
                        >
                          {completeMutation.isPending ? "Saving..." : "Mark as Completed"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {completed.length > 0 && (
              <div>
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">
                  Completed ({completed.length})
                </h2>
                <div className="space-y-3">
                  {completed.map((l) => (
                    <div
                      key={l._id}
                      className="bg-slate-50 border border-slate-200 rounded-xl p-5 opacity-80"
                    >
                      <div className="flex justify-between items-start gap-4 flex-wrap">
                        <div>
                          <h3 className="text-sm font-bold text-slate-700">
                            {l.leadId?.companyName || l.leadId?.leadName}
                          </h3>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {l.leadId?.leadName} • your role: {l.myRole}
                          </p>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wide bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded">
                          ✓ Completed
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}