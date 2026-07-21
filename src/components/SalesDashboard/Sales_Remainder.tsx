import { useState } from "react";
import useAxiosSales from "@/uri/useAxiosSales";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Notification from "../ui/toast";
import { useUserData } from "./Sales_Hook/User_Data";

export interface INoteEntry {
  _id?: string;
  text: string;
  createdAt?: string;
  createdBy?: string;
}

export interface LeadData {
  id: string;
  _id?: string;
  leadName: string;
  owner: string;
  status: string;
  indications?: string;
  indicationsHistory?: INoteEntry[]; // ✅ নতুন
  companyName?: string;
  leadScore: number;
  email?: string;
  phone?: string;
  title?: string;
  specificRole?: string;
  region?: string;
  profileUrl?: string;
  ServiceNeed?: string;
  reminderAt: string;
  reminderNote?: string;
}

export default function Sales_Remainder() {
  const [showNotiEmailSent, setShowNotiEmailSent] = useState(false);
  const [showNotiDone, setShowNotiDone] = useState(false);
  const [showNotiSaved, setShowNotiSaved] = useState(false);
  const [activeRescheduleId, setActiveRescheduleId] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [rescheduleNote, setRescheduleNote] = useState("");

  // Details modal state (edit-able)
  const [selectedLeadDetails, setSelectedLeadDetails] = useState<LeadData | null>(null);
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [editForm, setEditForm] = useState<Partial<LeadData>>({});

  // ✅ নতুন — Note history state
  const [newNoteText, setNewNoteText] = useState("");
  const [showNoteHistory, setShowNoteHistory] = useState(true);

  const axiosSales = useAxiosSales();
  const { userData } = useUserData();
  const queryClient = useQueryClient();

  const {
    data: reminderLeads = [],
    isLoading,
    isError,
  } = useQuery<LeadData[]>({
    queryKey: ["rem", userData?._id],
    enabled: Boolean(userData?._id),
    queryFn: async () => {
      const res = await axiosSales.get(`/api/v1/sales/rem/${userData?._id}`);
      return res.data.data;
    },
  });

  const getLeadId = (lead: LeadData) => lead._id || lead.id;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isOverdue = (dateStr: string) => {
    const d = new Date(dateStr);
    d.setHours(0, 0, 0, 0);
    return d.getTime() < today.getTime();
  };

  const isDueToday = (dateStr: string) => {
    const d = new Date(dateStr);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === today.getTime();
  };

  const mutationSendEmail = useMutation({
    mutationFn: async (email: string) => {
      const res = await axiosSales.post(`/api/v1/sales/emailservice/send-reminder-email/${email}`);
      return res.data;
    },
    onSuccess: () => setShowNotiEmailSent(true),
  });

  const mutationClearReminder = useMutation({
    mutationFn: async (leadId: string) => {
      const res = await axiosSales.put(`/api/v1/sales/clear-reminder/${leadId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rem"] });
      setShowNotiDone(true);
    },
  });

  const mutationReschedule = useMutation({
    mutationFn: async ({ leadId, reminderAt, reminderNote }: { leadId: string; reminderAt: string; reminderNote?: string }) => {
      const res = await axiosSales.put(`/api/v1/sales/set-reminder/${leadId}`, { reminderAt, reminderNote });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rem"] });
      setActiveRescheduleId(null);
      setRescheduleDate("");
      setRescheduleTime("");
      setRescheduleNote("");
    },
  });

  const openReschedule = (lead: LeadData) => {
    setActiveRescheduleId(getLeadId(lead));
    const d = new Date(lead.reminderAt);
    setRescheduleDate(d.toISOString().split("T")[0]);
    setRescheduleTime(d.toTimeString().slice(0, 5));
    setRescheduleNote(lead.reminderNote || "");
  };

  const handleReschedule = (e: React.FormEvent, leadId: string) => {
    e.preventDefault();
    if (!rescheduleDate) return;
    const isoDateTime = new Date(`${rescheduleDate}T${rescheduleTime || "09:00"}:00`).toISOString();
    mutationReschedule.mutate({ leadId, reminderAt: isoDateTime, reminderNote: rescheduleNote.trim() });
  };

  // Details modal open + edit logic
  const openDetailsModal = (lead: LeadData) => {
    setSelectedLeadDetails(lead);
    setIsEditingDetails(false);
    setEditForm(lead);
    setNewNoteText("");
    setShowNoteHistory(true);
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const mutationUpdateDetails = useMutation({
    mutationFn: async ({ leadId, payload }: { leadId: string; payload: Partial<LeadData> }) => {
      const res = await axiosSales.patch(`/api/v1/sales/update-lead-details/${leadId}`, payload);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["rem"] });
      if (data?.lead) {
        setSelectedLeadDetails(data.lead);
      }
      setIsEditingDetails(false);
      setShowNotiSaved(true);
    },
  });

  const handleSaveDetails = () => {
    if (!selectedLeadDetails) return;
    const leadId = getLeadId(selectedLeadDetails);
    mutationUpdateDetails.mutate({ leadId, payload: editForm });
  };

  // ✅ নতুন — Note push mutation (পুরানো মুছবে না)
  const mutationAddNote = useMutation({
    mutationFn: async ({ leadId, text }: { leadId: string; text: string }) => {
      const res = await axiosSales.post(`/api/v1/sales/add-note/${leadId}`, {
        text,
        createdBy: userData?.name || "Sales",
      });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["rem"] });
      if (data?.lead) {
        setSelectedLeadDetails(data.lead);
      }
      setNewNoteText("");
    },
  });

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeadDetails || !newNoteText.trim()) return;
    const leadId = getLeadId(selectedLeadDetails);
    mutationAddNote.mutate({ leadId, text: newNoteText.trim() });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#99B562]"></div>
        <span className="ml-3 text-sm text-slate-500 font-medium">Loading reminders...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 mt-10 max-w-lg mx-auto bg-red-50 border border-red-200 rounded-lg text-center text-red-600">
        <p className="font-semibold">Error fetching reminders.</p>
      </div>
    );
  }

  return (
    <>
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {showNotiEmailSent && (
          <Notification type="success" title="Reminder Email Sent!" message="Follow-up reminder email has been sent successfully." showIcon duration={3000} onClose={() => setShowNotiEmailSent(false)} />
        )}
        {showNotiDone && (
          <Notification type="success" title="Follow-up Completed!" message="This reminder has been cleared from the list." showIcon duration={3000} onClose={() => setShowNotiDone(false)} />
        )}
        {showNotiSaved && (
          <Notification type="success" title="Lead Updated!" message="Lead details have been saved successfully." showIcon duration={3000} onClose={() => setShowNotiSaved(false)} />
        )}
      </div>

      <div className="w-full bg-[#f8fafc] px-6 py-10 lg:px-14 font-sans min-h-screen text-slate-900 antialiased">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 border-b border-slate-200 pb-6">
            <p className="text-[10px] tracking-widest text-[#99B562] uppercase font-bold mb-1">Follow-up Calendar</p>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Reminders</h1>
            <p className="text-sm text-slate-500 mt-1">
              Overdue and today's follow-ups. Click a row to view full lead details. Missed ones stay here until you complete or reschedule them.
            </p>
          </div>

          <div className="bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex justify-between items-center">
              <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pending Follow-ups</h2>
              <span className="text-xs font-mono font-bold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded">
                {reminderLeads.length}
              </span>
            </div>

            {reminderLeads.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-sm text-slate-400">No pending follow-ups right now.</p>
              </div>
            ) : (
              <table className="min-w-full text-sm text-left">
                <thead className="border-b border-slate-100 bg-slate-50/50">
                  <tr>
                    <th className="px-5 py-2.5 text-[10px] uppercase tracking-wider font-bold text-slate-500">Lead</th>
                    <th className="px-5 py-2.5 text-[10px] uppercase tracking-wider font-bold text-slate-500">Contact</th>
                    <th className="px-5 py-2.5 text-[10px] uppercase tracking-wider font-bold text-slate-500">Follow-up Time</th>
                    <th className="px-5 py-2.5 text-[10px] uppercase tracking-wider font-bold text-slate-500">Note</th>
                    <th className="px-5 py-2.5 text-[10px] uppercase tracking-wider font-bold text-slate-500 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reminderLeads.map((lead) => {
                    const leadId = getLeadId(lead);
                    const overdue = isOverdue(lead.reminderAt);
                    const dueToday = isDueToday(lead.reminderAt);
                    const isRescheduling = activeRescheduleId === leadId;

                    return (
                      <>
                        <tr
                          key={leadId}
                          onClick={() => openDetailsModal(lead)}
                          className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                        >
                          <td className="px-5 py-3">
                            <p className="font-semibold text-slate-800 hover:text-[#99B562] transition-colors">{lead.leadName}</p>
                            <p className="text-xs text-slate-400">{lead.title || "—"} {lead.companyName && `• ${lead.companyName}`}</p>
                          </td>
                          <td className="px-5 py-3 text-xs text-slate-500 font-mono">
                            <p>{lead.email || "—"}</p>
                            <p>{lead.phone || "—"}</p>
                          </td>
                          <td className="px-5 py-3">
                            <span className={`text-xs font-mono font-bold px-2 py-1 rounded border ${
                              overdue ? "bg-red-50 text-red-700 border-red-200" : dueToday ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-slate-50 text-slate-600 border-slate-200"
                            }`}>
                              {overdue ? "Overdue • " : dueToday ? "Today • " : ""}
                              {new Date(lead.reminderAt).toLocaleDateString([], { day: "2-digit", month: "short" })}{" "}
                              {new Date(lead.reminderAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-xs text-slate-600 italic max-w-[220px] truncate">
                            {lead.reminderNote || "—"}
                          </td>
                          <td className="px-5 py-3" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => lead.email && mutationSendEmail.mutate(lead.email)}
                                disabled={!lead.email || mutationSendEmail.isPending}
                                className="px-3 py-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-[11px] font-bold transition-all disabled:opacity-40"
                              >
                                Send Email
                              </button>
                              <button
                                onClick={() => (isRescheduling ? setActiveRescheduleId(null) : openReschedule(lead))}
                                className="px-3 py-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-[11px] font-bold transition-all"
                              >
                                Reschedule
                              </button>
                              <button
                                onClick={() => mutationClearReminder.mutate(leadId)}
                                disabled={mutationClearReminder.isPending}
                                className="px-3 py-1.5 rounded bg-[#99B562] text-white hover:bg-[#85a052] text-[11px] font-bold transition-all disabled:opacity-50"
                              >
                                Done
                              </button>
                            </div>
                          </td>
                        </tr>

                        {isRescheduling && (
                          <tr key={`${leadId}-reschedule`} className="bg-slate-50/60">
                            <td colSpan={5} className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                              <form onSubmit={(e) => handleReschedule(e, leadId)} className="flex flex-col sm:flex-row items-end gap-3">
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Date *</label>
                                  <input type="date" required value={rescheduleDate} onChange={(e) => setRescheduleDate(e.target.value)} className="px-3 py-1.5 border border-slate-200 rounded text-xs focus:outline-none focus:border-[#99B562]" />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Time (optional)</label>
                                  <input type="time" value={rescheduleTime} onChange={(e) => setRescheduleTime(e.target.value)} className="px-3 py-1.5 border border-slate-200 rounded text-xs focus:outline-none focus:border-[#99B562]" />
                                </div>
                                <div className="flex-1 w-full">
                                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Note (optional)</label>
                                  <input type="text" value={rescheduleNote} onChange={(e) => setRescheduleNote(e.target.value)} placeholder="e.g. Client asked to call next week" className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs focus:outline-none focus:border-[#99B562]" />
                                </div>
                                <div className="flex gap-2">
                                  <button type="button" onClick={() => setActiveRescheduleId(null)} className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800">Cancel</button>
                                  <button type="submit" disabled={mutationReschedule.isPending || !rescheduleDate} className="px-4 py-1.5 rounded bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 disabled:opacity-40">
                                    {mutationReschedule.isPending ? "Saving..." : "Save"}
                                  </button>
                                </div>
                              </form>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* LEAD DETAILS MODAL (Edit-able + Notes) */}
      {selectedLeadDetails && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="absolute inset-0"
            onClick={() => {
              setSelectedLeadDetails(null);
              setIsEditingDetails(false);
            }}
          ></div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-start">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{selectedLeadDetails.leadName}</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedLeadDetails.title || "Executive"} {selectedLeadDetails.companyName && `at ${selectedLeadDetails.companyName}`}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedLeadDetails(null);
                  setIsEditingDetails(false);
                }}
                className="text-slate-400 hover:text-slate-900 p-1 rounded transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
              {/* Top Meta Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-lg p-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
                  <p className="text-xs font-semibold text-slate-800">{selectedLeadDetails.status}</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-lg p-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Score</p>
                  <p className="text-xs font-semibold text-slate-800">{selectedLeadDetails.leadScore}</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-lg p-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Territory</p>
                  <p className="text-xs font-semibold text-slate-800">{selectedLeadDetails.region || "—"}</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-lg p-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Owner</p>
                  <p className="text-xs font-semibold text-slate-800">{selectedLeadDetails.owner || "—"}</p>
                </div>
              </div>

              {/* Follow-up Info */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest mb-1">Scheduled Follow-up</p>
                <p className="text-sm text-amber-900 font-semibold">
                  {new Date(selectedLeadDetails.reminderAt).toLocaleDateString([], { day: "2-digit", month: "short", year: "numeric" })}{" "}
                  at {new Date(selectedLeadDetails.reminderAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
                {selectedLeadDetails.reminderNote && (
                  <p className="text-xs text-amber-700 italic mt-1">"{selectedLeadDetails.reminderNote}"</p>
                )}
              </div>

              {/* Extended Details Grids (editable) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200 pb-2">Contact Profile</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-[10px] uppercase text-slate-400 font-bold mb-1">Email Address</p>
                      {isEditingDetails ? (
                        <input
                          name="email"
                          value={editForm.email || ""}
                          onChange={handleEditFormChange}
                          className="w-full px-2 py-1.5 border border-slate-200 rounded text-sm font-mono focus:outline-none focus:border-[#99B562]"
                        />
                      ) : (
                        <p className="text-sm text-slate-800 font-mono">{selectedLeadDetails.email || "—"}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-slate-400 font-bold mb-1">Phone Number</p>
                      {isEditingDetails ? (
                        <input
                          name="phone"
                          value={editForm.phone || ""}
                          onChange={handleEditFormChange}
                          className="w-full px-2 py-1.5 border border-slate-200 rounded text-sm font-mono focus:outline-none focus:border-[#99B562]"
                        />
                      ) : (
                        <p className="text-sm text-slate-800 font-mono">{selectedLeadDetails.phone || "—"}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-slate-400 font-bold mb-1">LinkedIn / Profile URL</p>
                      {isEditingDetails ? (
                        <input
                          name="profileUrl"
                          value={editForm.profileUrl || ""}
                          onChange={handleEditFormChange}
                          className="w-full px-2 py-1.5 border border-slate-200 rounded text-sm font-mono focus:outline-none focus:border-[#99B562]"
                        />
                      ) : selectedLeadDetails.profileUrl ? (
                        <a href={selectedLeadDetails.profileUrl} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline">
                          View Profile
                        </a>
                      ) : (
                        <p className="text-sm text-slate-800">—</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200 pb-2">Business Context</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-[10px] uppercase text-slate-400 font-bold mb-1">Company Name</p>
                      {isEditingDetails ? (
                        <input
                          name="companyName"
                          value={editForm.companyName || ""}
                          onChange={handleEditFormChange}
                          className="w-full px-2 py-1.5 border border-slate-200 rounded text-sm focus:outline-none focus:border-[#99B562]"
                        />
                      ) : (
                        <p className="text-sm text-slate-800">{selectedLeadDetails.companyName || "—"}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-slate-400 font-bold mb-1">Specific Role</p>
                      {isEditingDetails ? (
                        <input
                          name="specificRole"
                          value={editForm.specificRole || ""}
                          onChange={handleEditFormChange}
                          className="w-full px-2 py-1.5 border border-slate-200 rounded text-sm focus:outline-none focus:border-[#99B562]"
                        />
                      ) : (
                        <p className="text-sm text-slate-800">{selectedLeadDetails.specificRole || "—"}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-slate-400 font-bold mb-1">Service Need</p>
                      {isEditingDetails ? (
                        <select
                          name="ServiceNeed"
                          value={editForm.ServiceNeed || "Graphic"}
                          onChange={handleEditFormChange}
                          className="w-full px-2 py-1.5 border border-slate-200 rounded text-sm bg-white focus:outline-none focus:border-[#99B562]"
                        >
                          {["Graphic", "Web", "Software", "Marketing", "SEO"].map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : (
                        <p className="text-sm text-slate-800">{selectedLeadDetails.ServiceNeed || "—"}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-slate-400 font-bold mb-1">Region</p>
                      {isEditingDetails ? (
                        <select
                          name="region"
                          value={editForm.region || "US"}
                          onChange={handleEditFormChange}
                          className="w-full px-2 py-1.5 border border-slate-200 rounded text-sm bg-white focus:outline-none focus:border-[#99B562]"
                        >
                          {["US", "ANZ", "EMEA", "APAC", "LATAM", "Global"].map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : (
                        <p className="text-sm text-slate-800">{selectedLeadDetails.region || "—"}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Save / Edit controls */}
              <div className="flex justify-end gap-3 pt-2 border-t border-slate-200">
                {isEditingDetails ? (
                  <>
                    <button
                      onClick={() => {
                        setIsEditingDetails(false);
                        setEditForm(selectedLeadDetails);
                      }}
                      className="px-4 py-2 rounded border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveDetails}
                      disabled={mutationUpdateDetails.isPending}
                      className="px-4 py-2 rounded bg-[#99B562] text-white text-xs font-bold hover:bg-[#85a052] disabled:opacity-50"
                    >
                      {mutationUpdateDetails.isPending ? "Saving..." : "Save Changes"}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditingDetails(true)}
                    className="px-4 py-2 rounded bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
                  >
                    ✎ Edit Details
                  </button>
                )}
              </div>

              {/* ✅ নতুন — Follow-up Note History সেকশন */}
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowNoteHistory((prev) => !prev)}
                  className="w-full flex items-center justify-between"
                >
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Follow-up History{" "}
                    {selectedLeadDetails.indicationsHistory?.length ? `(${selectedLeadDetails.indicationsHistory.length})` : ""}
                  </h3>
                  <span className="text-slate-400 text-xs">{showNoteHistory ? "▲" : "▼"}</span>
                </button>

                {showNoteHistory && (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {!selectedLeadDetails.indicationsHistory || selectedLeadDetails.indicationsHistory.length === 0 ? (
                      <p className="text-xs text-slate-400 italic py-2">
                        No follow-up notes added yet. {selectedLeadDetails.indications && `Previous note: "${selectedLeadDetails.indications}"`}
                      </p>
                    ) : (
                      [...selectedLeadDetails.indicationsHistory]
                        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
                        .map((entry, idx) => (
                          <div key={entry._id || idx} className="bg-white border border-slate-200 rounded-lg p-3">
                            <p className="text-sm text-slate-800">{entry.text}</p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="text-[10px] text-slate-400 font-mono">
                                {entry.createdAt ? new Date(entry.createdAt).toLocaleString() : ""}
                              </span>
                              {entry.createdBy && (
                                <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-semibold">
                                  {entry.createdBy}
                                </span>
                              )}
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                )}

                <form onSubmit={handleAddNote} className="flex items-end gap-2 pt-1">
                  <textarea
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    rows={2}
                    placeholder="Write what was discussed today..."
                    className="flex-1 px-3 py-2 border border-slate-200 rounded text-sm text-slate-800 focus:outline-none focus:border-[#99B562] resize-none transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={mutationAddNote.isPending || !newNoteText.trim()}
                    className="px-4 py-2 rounded bg-[#99B562] text-white text-xs font-bold hover:bg-[#85a052] disabled:opacity-40 whitespace-nowrap transition-colors"
                  >
                    {mutationAddNote.isPending ? "Adding..." : "+ Add Note"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}