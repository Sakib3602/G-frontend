import { useQuery } from "@tanstack/react-query";
import useAxiosSales from "@/uri/useAxiosSales";

interface NoteEntry {
  text: string;
  createdAt?: string;
  createdBy?: string;
}

interface RoleLead {
  _id: string;
  leadName: string;
  companyName?: string;
  ServiceNeed?: string;
  email?: string;
  phone?: string;
  region?: string;
  title?: string;
  specificRole?: string;
  leadScore?: number;
  owner?: string;
  indicationsHistory?: NoteEntry[];
  reminderAt?: string | null;
  reminderNote?: string;
  proposalSent?: boolean;
  createdAt?: string;
}

interface Props {
  title?: string;
  subtitle?: string;
}

// ── Web, Designer, Marketing — tin jaygatei ekhoi component import koro ──
// axios instance internally fixed (useAxiosSales, plain baseURL) karon
// /api/v1/team/in-progress-by-role route ta role-agnostic — backend
// nijei req.user.role dekhe filter kore deয়, tai useAxiosMarketing/
// useAxiosDesigner er prefixed baseURL ei route er sathe mele na.
export default function TeamInProgressLeads({
  title = "In-Progress Leads",
  subtitle = "Leads currently in progress that need your team's service.",
}: Props) {
  const axiosSales = useAxiosSales();

  const { data: leads = [], isLoading, isError } = useQuery<RoleLead[]>({
    queryKey: ["team-in-progress-by-role"],
    queryFn: async () => {
      const res = await axiosSales.get("/api/v1/team/in-progress-by-role");
      return res.data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[50vh] bg-white">
        <div className="w-5 h-5 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
        <span className="mt-3 text-xs tracking-wider text-slate-400 uppercase font-medium">
          Loading in-progress leads...
        </span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 max-w-md mx-auto mt-20 border border-red-100 rounded-lg text-center bg-white">
        <p className="text-sm font-semibold text-red-600">Sync Failure</p>
        <p className="text-xs text-slate-400 mt-1">Unable to fetch in-progress leads.</p>
      </div>
    );
  }

  return (
    <div className="w-full  px-6 py-10 lg:px-14 font-sans min-h-screen text-slate-900 antialiased">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 pb-6 border-b border-slate-100">
          <p className="text-[10px] tracking-widest text-slate-400 uppercase font-bold mb-1">
            Read-only Pipeline View
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
          <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
        </div>

        {leads.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-slate-300 rounded-xl bg-white">
            <p className="text-sm font-semibold text-slate-700">Nothing here yet</p>
            <p className="text-xs text-slate-400 mt-1">
              No in-progress leads currently match your team's service.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {leads.map((lead) => (
              <div key={lead._id} className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {lead.companyName || lead.leadName}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {lead.leadName} • {lead.title || "Executive"}
                    </p>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-amber-600 bg-amber-50 border border-amber-200/50 px-2 py-0.5 rounded-sm uppercase tracking-wide shrink-0">
                    Score {lead.leadScore ?? "-"}
                  </span>
                </div>

                <div className="flex gap-1.5 mt-2 flex-wrap">
                  {(lead.ServiceNeed || "")
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

                <div className="mt-3 space-y-1 font-mono text-xs text-slate-600">
                  <p>{lead.email || "—"}</p>
                  <p>{lead.phone || "—"}</p>
                  <p className="text-slate-400 font-sans">{lead.region || "—"}</p>
                </div>

                {lead.reminderAt && (
                  <div className="mt-2 text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-2 py-1 rounded inline-block">
                    Follow-up: {new Date(lead.reminderAt).toLocaleDateString()}
                    {lead.reminderNote ? ` — ${lead.reminderNote}` : ""}
                  </div>
                )}

                <div className="mt-3 pt-3 border-t border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">
                    Notes ({lead.indicationsHistory?.length || 0})
                  </p>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                    {!lead.indicationsHistory || lead.indicationsHistory.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No notes yet.</p>
                    ) : (
                      [...lead.indicationsHistory]
                        .sort(
                          (a, b) =>
                            new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime(),
                        )
                        .map((n, i) => (
                          <div key={i} className="text-xs text-slate-700 bg-slate-50 rounded p-2">
                            <p>{n.text}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              {n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}
                              {n.createdBy ? ` • ${n.createdBy}` : ""}
                            </p>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}