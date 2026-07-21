import { useState, useMemo, useEffect } from "react";
import useAxiosSales from "@/uri/useAxiosSales";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router";
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
  _id: string;
  leadName: string;
  owner: string;
  status: string;
  indications: string;
  indicationsHistory?: INoteEntry[];
  companyName: string;
  leadScore: string;
  email: string;
  phone: string;
  title: string;
  specificRole: string;
  region: string;
  profileUrl: string;
  ServiceNeed?: string;
  reminderAt?: string | null; // ✅ নতুন
  reminderNote?: string;      // ✅ নতুন
}

export interface IMeeting {
  title: string;
  leadId?: string;
  clientName: string;
  clientEmail: string;
  meetingDate: string;
  meetingTime: string;
  meetingType: "online" | "offline";
  meetingLink?: string;
  agenda?: string;
  notes?: string;
  status?: "scheduled" | "completed" | "cancelled";
  schedulerId: string;
}

interface LeadsPage {
  data: LeadData[];
  nextCursor: string | null;
  hasMore: boolean;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "Contacted":
      return "bg-orange-50 text-orange-700 border-orange-200";
    case "New Lead":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "Attempted to contact":
      return "bg-pink-50 text-pink-700 border-pink-200";
    case "In Progress":
      return "bg-purple-50 text-purple-700 border-purple-200";
    case "Qualified":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "Unqualified":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
};

const statusOptions = ["New Lead", "Attempted to contact", "Contacted", "In Progress", "Unqualified"];

const createMeetingForm = (lead?: LeadData | null): IMeeting => ({
  title: "",
  leadId: lead?._id || lead?.id,
  clientName: lead?.leadName || "",
  clientEmail: lead?.email || "",
  meetingDate: "",
  meetingTime: "",
  meetingType: "online",
  meetingLink: "",
  agenda: "",
  notes: "",
  status: "scheduled",
  schedulerId: "",
});

export default function Sales_My_Leads() {
  const axiosSales = useAxiosSales();

  const [showNoti, setShowNoti] = useState(false);
  const [showNotiStatusUpdate, setShowNotiStatusUpdate] = useState(false);
  const [showNotiReminder, setShowNotiReminder] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const [meetingLead, setMeetingLead] = useState<LeadData | null>(null);
  const [meetingForm, setMeetingForm] = useState<IMeeting>(createMeetingForm());
  const [meetingError, setMeetingError] = useState<string | null>(null);
  const [isMeetingConflict, setIsMeetingConflict] = useState(false);

  const [noteLead, setNoteLead] = useState<LeadData | null>(null);
  const [newNoteText, setNewNoteText] = useState("");

  const [selectedLeadDetails, setSelectedLeadDetails] = useState<LeadData | null>(null);
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [editForm, setEditForm] = useState<Partial<LeadData>>({});

  // ✅ নতুন — Follow-up / Reminder Modal State
  const [reminderLead, setReminderLead] = useState<LeadData | null>(null);
  const [reminderDate, setReminderDate] = useState("");
  const [reminderTime, setReminderTime] = useState("");
  const [reminderNoteText, setReminderNoteText] = useState("");

  const queryClient = useQueryClient();
  const { userData } = useUserData();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const isSearchMode = debouncedSearch.length > 0;

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery<LeadsPage>({
    queryKey: ["my-leads", userData?._id],
    queryFn: async ({ pageParam }) => {
      const res = await axiosSales.get(`/api/v1/sales/get-my-leads/${userData._id}?status=new`, {
        params: { cursor: pageParam, limit: 20 },
      });
      return res.data;
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: !!userData?._id && !isSearchMode,
  });

  const {
    data: searchResults,
    isLoading: isSearchLoading,
    isError: isSearchError,
  } = useQuery<{ data: LeadData[] }>({
    queryKey: ["search-my-leads", userData?._id, debouncedSearch],
    queryFn: async () => {
      const res = await axiosSales.get(`/api/v1/sales/search-leads/${userData._id}`, {
        params: { query: debouncedSearch },
      });
      return res.data;
    },
    enabled: !!userData?._id && isSearchMode,
  });

  const leadsData: LeadData[] = useMemo(() => data?.pages.flatMap((page) => page.data) ?? [], [data]);
  const activeDataset: LeadData[] = isSearchMode ? (searchResults?.data ?? []) : leadsData;

  const processedLeads = useMemo(() => {
    if (!activeDataset.length) return [];
    let result = [...activeDataset];
    if (filterStatus !== "All") {
      result = result.filter((lead) => lead.status === filterStatus);
    }
    return result;
  }, [activeDataset, filterStatus]);

  const currentIsLoading = isSearchMode ? isSearchLoading : isLoading;
  const currentIsError = isSearchMode ? isSearchError : isError;

  const downloadCSV = () => {
    if (!leadsData || leadsData.length === 0) return;
    const header = Object.keys(leadsData[0]).join(",") + "\n";
    const rows = leadsData.map((row) => Object.values(row).map((value) => `"${value}"`).join(",")).join("\n");
    const csvContent = header + rows;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `My-leads-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleMeetingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !meetingForm.title.trim() ||
      !meetingForm.clientName.trim() ||
      !meetingForm.clientEmail.trim() ||
      !meetingForm.meetingDate ||
      !meetingForm.meetingTime
    ) {
      setMeetingError("Please complete the required fields before submitting the meeting.");
      return;
    }

    const resolvedLeadId = meetingLead?._id || meetingLead?.id;
    const payload: IMeeting = {
      ...meetingForm,
      leadId: resolvedLeadId,
      meetingLink: meetingForm.meetingType === "online" ? meetingForm.meetingLink?.trim() || undefined : undefined,
      agenda: meetingForm.agenda?.trim() || undefined,
      notes: meetingForm.notes?.trim() || undefined,
      status: meetingForm.status || "scheduled",
      schedulerId: userData?._id || "unknown",
    };

    setMeetingError(null);
    mutationUpformeeting.mutate(payload);
    setMeetingLead(null);
    setMeetingForm(createMeetingForm());
  };

  const mutationUpformeeting = useMutation({
    mutationFn: async (meetingData: IMeeting) => {
      const res = await axiosSales.post("/api/v1/sales/meetings/create-meeting", meetingData);
      return res.data;
    },
    onSuccess: () => {
      setShowNoti(true);
      queryClient.invalidateQueries({ queryKey: ["my-leads"] });
      queryClient.invalidateQueries({ queryKey: ["search-my-leads"] });
    },
  });

  const handleMeetingFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setMeetingForm((prev) => {
      if (name === "meetingType") {
        return { ...prev, meetingType: value as IMeeting["meetingType"], meetingLink: value === "online" ? prev.meetingLink : "" };
      }
      if (name === "status") {
        return { ...prev, status: value as IMeeting["status"] };
      }
      return { ...prev, [name]: value };
    });
  };

  const openMeetingPopup = (lead: LeadData) => {
    MutationForCkMeeting.mutate(lead._id || lead.id);
    setMeetingError(null);
    setMeetingLead(lead);
    setMeetingForm(createMeetingForm(lead));
  };

  const openNotePopup = (lead: LeadData) => {
    setNoteLead(lead);
    setNewNoteText("");
  };

  const mutationAddNote = useMutation({
    mutationFn: async ({ leadId, text }: { leadId: string; text: string }) => {
      const res = await axiosSales.post(`/api/v1/sales/add-note/${leadId}`, { text, createdBy: userData?.name || "Sales" });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["my-leads"] });
      queryClient.invalidateQueries({ queryKey: ["search-my-leads"] });
      if (data?.lead) setNoteLead(data.lead);
      setNewNoteText("");
    },
  });

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteLead || !newNoteText.trim()) return;
    const leadId = noteLead._id || noteLead.id;
    mutationAddNote.mutate({ leadId, text: newNoteText.trim() });
  };

  const MutationForCkMeeting = useMutation({
    mutationFn: async (leadId: string) => {
      const res = await axiosSales.get(`/api/v1/sales/meetings/check-meeting/${leadId}`);
      return res.data;
    },
    onSuccess: (data) => setIsMeetingConflict(data.meeting),
  });

  const handleInlineStatusChange = (leadId: string, newStatus: string) => {
    MutationUpForStatusUpdate.mutate({ leadId, status: newStatus });
  };

  const MutationUpForStatusUpdate = useMutation({
    mutationFn: async ({ leadId, status }: { leadId: string; status: string }) => {
      const res = await axiosSales.put(`/api/v1/sales/update-lead-status/${leadId}`, { status });
      return res.data;
    },
    onSuccess: () => {
      setShowNotiStatusUpdate(true);
      queryClient.invalidateQueries({ queryKey: ["my-leads"] });
      queryClient.invalidateQueries({ queryKey: ["search-my-leads"] });
    },
  });

  const openDetailsModal = (lead: LeadData) => {
    setSelectedLeadDetails(lead);
    setIsEditingDetails(false);
    setEditForm(lead);
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
      queryClient.invalidateQueries({ queryKey: ["my-leads"] });
      queryClient.invalidateQueries({ queryKey: ["search-my-leads"] });
      if (data?.lead) setSelectedLeadDetails(data.lead);
      setIsEditingDetails(false);
    },
  });

  const handleSaveDetails = () => {
    if (!selectedLeadDetails) return;
    const leadId = selectedLeadDetails._id || selectedLeadDetails.id;
    mutationUpdateDetails.mutate({ leadId, payload: editForm });
  };

  // ✅ নতুন — Follow-up / Reminder Logic
  const openReminderPopup = (lead: LeadData) => {
    setReminderLead(lead);
    if (lead.reminderAt) {
      const d = new Date(lead.reminderAt);
      setReminderDate(d.toISOString().split("T")[0]);
      setReminderTime(d.toTimeString().slice(0, 5));
    } else {
      setReminderDate("");
      setReminderTime("");
    }
    setReminderNoteText(lead.reminderNote || "");
  };

  const mutationSetReminder = useMutation({
    mutationFn: async ({ leadId, reminderAt, reminderNote }: { leadId: string; reminderAt: string; reminderNote?: string }) => {
      const res = await axiosSales.put(`/api/v1/sales/set-reminder/${leadId}`, { reminderAt, reminderNote });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-leads"] });
      queryClient.invalidateQueries({ queryKey: ["search-my-leads"] });
      setShowNotiReminder(true);
      setReminderLead(null);
    },
  });

  const mutationClearReminder = useMutation({
    mutationFn: async (leadId: string) => {
      const res = await axiosSales.put(`/api/v1/sales/clear-reminder/${leadId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-leads"] });
      queryClient.invalidateQueries({ queryKey: ["search-my-leads"] });
      setReminderLead(null);
    },
  });

  const handleSetReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reminderLead || !reminderDate) return;
    const leadId = reminderLead._id || reminderLead.id;
    const isoDateTime = new Date(`${reminderDate}T${reminderTime || "09:00"}:00`).toISOString();
    mutationSetReminder.mutate({ leadId, reminderAt: isoDateTime, reminderNote: reminderNoteText.trim() });
  };

  if (currentIsLoading && !isSearchMode) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-white">
        <div className="w-5 h-5 border-2 border-slate-200 border-t-[#99B562] rounded-full animate-spin"></div>
        <span className="mt-3 text-xs tracking-wider text-slate-400 uppercase font-medium">Fetching Directory...</span>
      </div>
    );
  }

  if (currentIsError) {
    return (
      <div className="p-8 max-w-md mx-auto mt-20 border border-red-100 rounded-lg text-center bg-white">
        <p className="text-sm font-semibold text-red-600">Connection Failed</p>
        <p className="text-xs text-slate-400 mt-1">Unable to interface with the ledger backend.</p>
      </div>
    );
  }

  return (
    <>
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {showNoti && (
          <Notification type="success" title="Meeting Scheduled!" message="Your meeting has been scheduled successfully." showIcon duration={3000} onClose={() => setShowNoti(false)} />
        )}
        {showNotiStatusUpdate && (
          <Notification type="success" title="Status Updated!" message="Lead operational status has synced cleanly." showIcon duration={3000} onClose={() => setShowNotiStatusUpdate(false)} />
        )}
        {showNotiReminder && (
          <Notification type="success" title="Follow-up Set!" message="Reminder saved. It will appear on the Reminders page." showIcon duration={3000} onClose={() => setShowNotiReminder(false)} />
        )}
      </div>

      <div className="w-full min-h-screen bg-[#f8fafc] px-6 py-10 lg:px-14 font-sans text-slate-900 antialiased">
        <div className="max-w-[1400px] mx-auto">
          <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
            <div>
              <p className="text-[10px] tracking-widest text-[#99B562] uppercase font-bold mb-1">CRM Directory</p>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Assigned Leads</h1>
              <p className="text-sm text-slate-500 mt-1">
                {isSearchMode ? (
                  <>Search results: <span className="font-semibold text-slate-800">{processedLeads.length}</span></>
                ) : (
                  <>Total loaded entries: <span className="font-semibold text-slate-800">{leadsData.length}</span></>
                )}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={downloadCSV} className="px-4 py-2 bg-white border border-slate-200 rounded text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-xs">
                Export CSV Data
              </button>
              <Link to={"/dashboard/sales/create-leads"}>
                <button className="px-4 py-2 bg-[#99B562] rounded text-xs font-semibold text-white hover:bg-[#85a052] transition-colors shadow-xs flex items-center gap-2">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"></path>
                  </svg>
                  New Lead Entry
                </button>
              </Link>
            </div>
          </div>

          <div className="mb-6 flex flex-col lg:flex-row gap-4 justify-between items-center">
            <div className="relative w-full lg:max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                className="block w-full pl-9 pr-9 py-2 border border-slate-200 rounded-md text-sm bg-white placeholder-slate-400 focus:outline-none focus:border-[#99B562] focus:ring-1 focus:ring-[#99B562]/20 transition-all shadow-xs"
                placeholder="Search by name, email, phone, company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              )}
              {isSearchMode && isSearchLoading && (
                <p className="absolute -bottom-5 left-0 text-[10px] text-slate-400">Searching entire database...</p>
              )}
            </div>

            <div className="flex w-full lg:w-auto gap-3">
              <select
                className="block w-full lg:w-auto pl-3 pr-8 py-2 text-sm border border-slate-200 rounded-md bg-white text-slate-700 focus:outline-none focus:border-[#99B562] focus:ring-1 focus:ring-[#99B562]/20 shadow-xs cursor-pointer appearance-none"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="All">Filter: All Statuses</option>
                <option value="New Lead">New Lead</option>
                <option value="Attempted to contact">Attempted</option>
                <option value="Contacted">Contacted</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto bg-white border border-slate-200 shadow-sm rounded-lg">
            <table className="min-w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3 text-[10px] uppercase tracking-wider font-bold text-slate-500">Lead Registry</th>
                  <th className="px-5 py-3 text-[10px] uppercase tracking-wider font-bold text-slate-500 w-[1%]">Operations</th>
                  <th className="px-5 py-3 text-[10px] uppercase tracking-wider font-bold text-slate-500 w-44">Pipeline Status</th>
                  <th className="px-5 py-3 text-[10px] uppercase tracking-wider font-bold text-slate-500">Enterprise</th>
                  <th className="px-5 py-3 text-[10px] uppercase tracking-wider font-bold text-slate-500">Email Address</th>
                  <th className="px-5 py-3 text-[10px] uppercase tracking-wider font-bold text-slate-500">Contact No.</th>
                  <th className="px-5 py-3 text-[10px] uppercase tracking-wider font-bold text-slate-500">Service Category</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isSearchMode && isSearchLoading && (
                  <tr><td colSpan={7} className="px-5 py-10 text-center text-slate-400 text-xs">Searching database...</td></tr>
                )}

                {!isSearchLoading && processedLeads.length === 0 && (
                  <tr><td colSpan={7} className="px-5 py-10 text-center text-slate-400 text-xs">{isSearchMode ? "No leads found." : "No records matched your search parameters."}</td></tr>
                )}

                {processedLeads.map((lead) => (
                  <tr key={lead._id || lead.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-5 py-3">
                      <button onClick={() => openDetailsModal(lead)} className="font-semibold text-slate-800 hover:text-[#99B562] transition-colors focus:outline-none flex items-center gap-2">
                        {lead.leadName}
                        <svg className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-[#99B562]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                        </svg>
                      </button>
                      {lead.reminderAt && (
                        <div className="mt-1">
                          <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                            🔔 {new Date(lead.reminderAt).toLocaleDateString([], { day: "2-digit", month: "short" })} {new Date(lead.reminderAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      )}
                    </td>

                    <td className="px-5 py-3 w-[1%]">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openMeetingPopup(lead)} className="whitespace-nowrap px-3 py-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-[11px] font-bold transition-all shadow-xs">
                          Schedule
                        </button>
                        <button onClick={() => openNotePopup(lead)} className="whitespace-nowrap px-3 py-1.5 rounded border border-[#99B562]/30 bg-[#99B562]/10 hover:bg-[#99B562]/15 text-[#6f8a3f] text-[11px] font-bold transition-all shadow-xs">
                          Notes {lead.indicationsHistory?.length ? `(${lead.indicationsHistory.length})` : ""}
                        </button>
                        {/* ✅ নতুন — ৩য় বাটন */}
                        <button onClick={() => openReminderPopup(lead)} className="whitespace-nowrap px-3 py-1.5 rounded border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-700 text-[11px] font-bold transition-all shadow-xs">
                          Follow-up
                        </button>
                      </div>
                    </td>

                    <td className="px-5 py-3 w-44">
                      <div className={`relative w-full rounded border px-2 py-1 flex items-center ${getStatusColor(lead.status)}`}>
                        <select value={lead.status} onChange={(e) => handleInlineStatusChange(lead._id, e.target.value)} className="w-full appearance-none bg-transparent outline-none cursor-pointer text-xs font-semibold pr-4">
                          {statusOptions.map((opt) => (
                            <option key={opt} value={opt} className="bg-white text-slate-800">{opt}</option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                          <svg className="fill-current h-3 w-3 opacity-60" viewBox="0 0 20 20">
                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                          </svg>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3 text-slate-600 font-medium text-xs">{lead.companyName || "—"}</td>
                    <td className="px-5 py-3">
                      <a href={`mailto:${lead.email}`} className="text-slate-500 hover:text-slate-900 text-xs font-mono transition-colors">{lead.email || "—"}</a>
                    </td>
                    <td className="px-5 py-3 text-slate-500 text-xs font-mono">{lead.phone || "—"}</td>
                    <td className="px-5 py-3">
                      <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider">{lead.ServiceNeed || "General"}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!isSearchMode && hasNextPage && (
              <div className="flex justify-center py-4 border-t border-slate-100">
                <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage} className="px-4 py-2 bg-white border border-slate-200 rounded text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-xs disabled:opacity-50 disabled:cursor-not-allowed">
                  {isFetchingNextPage ? "Loading..." : "Load More"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- LEAD DETAILS MODAL (Edit-able) --- */}
      {selectedLeadDetails && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="absolute inset-0" onClick={() => { setSelectedLeadDetails(null); setIsEditingDetails(false); }}></div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-start">
  <div className="flex-1">
    {isEditingDetails ? (
      <input
        name="leadName"
        value={editForm.leadName || ""}
        onChange={handleEditFormChange}
        className="text-lg font-bold text-slate-900 border border-slate-200 rounded px-2 py-1 focus:outline-none focus:border-[#99B562] w-full max-w-sm"
      />
    ) : (
      <h2 className="text-lg font-bold text-slate-900">{selectedLeadDetails.leadName}</h2>
    )}
    <p className="text-xs text-slate-500 mt-0.5">{selectedLeadDetails.title || "Executive"} {selectedLeadDetails.companyName && `at ${selectedLeadDetails.companyName}`}</p>
  </div>
  <button onClick={() => { setSelectedLeadDetails(null); setIsEditingDetails(false); }} className="text-slate-400 hover:text-slate-900 p-1 rounded transition-colors">
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
  </button>
</div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200 pb-2">Contact Profile</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-[10px] uppercase text-slate-400 font-bold mb-1">Email Address</p>
                      {isEditingDetails ? (
                        <input name="email" value={editForm.email || ""} onChange={handleEditFormChange} className="w-full px-2 py-1.5 border border-slate-200 rounded text-sm font-mono focus:outline-none focus:border-[#99B562]" />
                      ) : (<p className="text-sm text-slate-800 font-mono">{selectedLeadDetails.email || "—"}</p>)}
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-slate-400 font-bold mb-1">Phone Number</p>
                      {isEditingDetails ? (
                        <input name="phone" value={editForm.phone || ""} onChange={handleEditFormChange} className="w-full px-2 py-1.5 border border-slate-200 rounded text-sm font-mono focus:outline-none focus:border-[#99B562]" />
                      ) : (<p className="text-sm text-slate-800 font-mono">{selectedLeadDetails.phone || "—"}</p>)}
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-slate-400 font-bold mb-1">LinkedIn / Profile URL</p>
                      {isEditingDetails ? (
                        <input name="profileUrl" value={editForm.profileUrl || ""} onChange={handleEditFormChange} className="w-full px-2 py-1.5 border border-slate-200 rounded text-sm font-mono focus:outline-none focus:border-[#99B562]" />
                      ) : selectedLeadDetails.profileUrl ? (
                        <a href={selectedLeadDetails.profileUrl} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline">View Profile</a>
                      ) : (<p className="text-sm text-slate-800">—</p>)}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200 pb-2">Business Context</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-[10px] uppercase text-slate-400 font-bold mb-1">Company Name</p>
                      {isEditingDetails ? (
                        <input name="companyName" value={editForm.companyName || ""} onChange={handleEditFormChange} className="w-full px-2 py-1.5 border border-slate-200 rounded text-sm focus:outline-none focus:border-[#99B562]" />
                      ) : (<p className="text-sm text-slate-800">{selectedLeadDetails.companyName || "—"}</p>)}
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-slate-400 font-bold mb-1">Specific Role</p>
                      {isEditingDetails ? (
                        <input name="specificRole" value={editForm.specificRole || ""} onChange={handleEditFormChange} className="w-full px-2 py-1.5 border border-slate-200 rounded text-sm focus:outline-none focus:border-[#99B562]" />
                      ) : (<p className="text-sm text-slate-800">{selectedLeadDetails.specificRole || "—"}</p>)}
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-slate-400 font-bold mb-1">Service Need</p>
                      {isEditingDetails ? (
                        <select name="ServiceNeed" value={editForm.ServiceNeed || "Graphic"} onChange={handleEditFormChange} className="w-full px-2 py-1.5 border border-slate-200 rounded text-sm bg-white focus:outline-none focus:border-[#99B562]">
                          {["Graphic", "Web", "Software", "Marketing", "SEO"].map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
                        </select>
                      ) : (<p className="text-sm text-slate-800">{selectedLeadDetails.ServiceNeed || "—"}</p>)}
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-slate-400 font-bold mb-1">Region</p>
                      {isEditingDetails ? (
                        <select name="region" value={editForm.region || "US"} onChange={handleEditFormChange} className="w-full px-2 py-1.5 border border-slate-200 rounded text-sm bg-white focus:outline-none focus:border-[#99B562]">
                          {["US", "ANZ", "EMEA", "APAC", "LATAM", "Global"].map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
                        </select>
                      ) : (<p className="text-sm text-slate-800">{selectedLeadDetails.region || "—"}</p>)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-slate-200">
                {isEditingDetails ? (
                  <>
                    <button onClick={() => { setIsEditingDetails(false); setEditForm(selectedLeadDetails); }} className="px-4 py-2 rounded border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50">Cancel</button>
                    <button onClick={handleSaveDetails} disabled={mutationUpdateDetails.isPending} className="px-4 py-2 rounded bg-[#99B562] text-white text-xs font-bold hover:bg-[#85a052] disabled:opacity-50">
                      {mutationUpdateDetails.isPending ? "Saving..." : "Save Changes"}
                    </button>
                  </>
                ) : (
                  <button onClick={() => setIsEditingDetails(true)} className="px-4 py-2 rounded bg-slate-900 text-white text-xs font-bold hover:bg-slate-800">✎ Edit Details</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MEETING MODAL --- */}
      {meetingLead && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/30 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl relative overflow-hidden border border-slate-200 max-h-[92vh] flex flex-col">
            <div className="px-6 py-5 flex justify-between items-start border-b border-slate-100 bg-slate-50/50">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Schedule Encounter</h2>
                <p className="text-xs text-slate-500 mt-1">Configuring calendar parameters for <span className="font-bold text-slate-800">{meetingLead.leadName}</span>.</p>
              </div>
              <button onClick={() => { setMeetingError(null); setMeetingLead(null); }} className="text-slate-400 hover:text-slate-800 p-1 rounded transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <form onSubmit={handleMeetingSubmit} className="flex-1 overflow-y-auto" noValidate>
              <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
                <aside className="lg:col-span-4 space-y-4">
                  <div className="border border-slate-200 rounded-lg p-4 bg-white">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3 border-b border-slate-100 pb-2">Target Meta</p>
                    <div className="space-y-3 text-xs">
                      <p><span className="text-slate-400 font-bold block mb-0.5">Enterprise</span> <span className="font-medium text-slate-800">{meetingLead.companyName || "—"}</span></p>
                      <p><span className="text-slate-400 font-bold block mb-0.5">Title</span> <span className="font-medium text-slate-800">{meetingLead.title || "—"}</span></p>
                      <p><span className="text-slate-400 font-bold block mb-0.5">Email</span> <span className="font-mono text-slate-800">{meetingLead.email || "—"}</span></p>
                    </div>
                  </div>

                  {isMeetingConflict && (
                    <div className="border border-amber-200 rounded-lg p-4 bg-amber-50">
                      <h3 className="text-[10px] font-bold text-amber-800 uppercase tracking-wider mb-1">Schedule Conflict</h3>
                      <p className="text-xs text-amber-700">A prior engagement is already logged for this pipeline target.</p>
                    </div>
                  )}
                </aside>

                <div className="lg:col-span-8 space-y-4">
                  {meetingError && (<div className="border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 rounded">{meetingError}</div>)}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Event Header</label>
                      <input type="text" name="title" value={meetingForm.title} onChange={handleMeetingFormChange} placeholder="e.g. Discovery & Sync" className="w-full px-3 py-2 border border-slate-200 rounded text-sm text-slate-800 focus:outline-none focus:border-[#99B562] transition-colors" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Host/Client Full Name</label>
                      <input type="text" name="clientName" value={meetingForm.clientName} onChange={handleMeetingFormChange} className="w-full px-3 py-2 border border-slate-200 rounded text-sm text-slate-800 focus:outline-none focus:border-[#99B562] transition-colors" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Notification Email</label>
                      <input type="text" name="clientEmail" value={meetingForm.clientEmail} onChange={handleMeetingFormChange} className="w-full px-3 py-2 border border-slate-200 rounded text-sm text-slate-800 font-mono focus:outline-none focus:border-[#99B562] transition-colors" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Target Date</label>
                      <input type="date" name="meetingDate" value={meetingForm.meetingDate} onChange={handleMeetingFormChange} className="w-full px-3 py-2 border border-slate-200 rounded text-sm text-slate-800 focus:outline-none focus:border-[#99B562] transition-colors" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Timestamp</label>
                      <input type="time" name="meetingTime" value={meetingForm.meetingTime} onChange={handleMeetingFormChange} className="w-full px-3 py-2 border border-slate-200 rounded text-sm text-slate-800 focus:outline-none focus:border-[#99B562] transition-colors" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Medium</label>
                      <select name="meetingType" value={meetingForm.meetingType} onChange={handleMeetingFormChange} className="w-full px-3 py-2 border border-slate-200 rounded text-sm text-slate-800 focus:outline-none focus:border-[#99B562] transition-colors bg-white">
                        <option value="online">Virtual / Online</option>
                        <option value="offline">In-Person / Offline</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Action State</label>
                      <select name="status" value={meetingForm.status || "scheduled"} onChange={handleMeetingFormChange} className="w-full px-3 py-2 border border-slate-200 rounded text-sm text-slate-800 focus:outline-none focus:border-[#99B562] transition-colors bg-white">
                        <option value="scheduled">Active Scheduled</option>
                        <option value="completed">Mark Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    {meetingForm.meetingType === "online" && (
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">URI Meeting Link</label>
                        <input type="text" name="meetingLink" value={meetingForm.meetingLink || ""} onChange={handleMeetingFormChange} placeholder="https://meet..." className="w-full px-3 py-2 border border-slate-200 rounded text-sm text-slate-800 font-mono focus:outline-none focus:border-[#99B562] transition-colors" />
                      </div>
                    )}
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Discussion Agenda</label>
                      <textarea name="agenda" rows={3} value={meetingForm.agenda || ""} onChange={handleMeetingFormChange} className="w-full px-3 py-2 border border-slate-200 rounded text-sm text-slate-800 focus:outline-none focus:border-[#99B562] resize-none transition-colors" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Internal Notes</label>
                      <textarea name="notes" rows={2} value={meetingForm.notes || ""} onChange={handleMeetingFormChange} className="w-full px-3 py-2 border border-slate-200 rounded text-sm text-slate-800 focus:outline-none focus:border-[#99B562] resize-none transition-colors" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 sticky bottom-0">
                <button type="button" onClick={() => { setMeetingError(null); setMeetingLead(null); }} className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors">Abort</button>
                <button type="submit" className={`px-5 py-2 rounded text-xs font-bold text-white transition-colors shadow-xs ${isMeetingConflict ? "bg-amber-500 hover:bg-amber-600" : "bg-slate-900 hover:bg-slate-800"}`}>
                  {isMeetingConflict ? "Force Additional Meeting" : "Commit Schedule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- NOTE MODAL --- */}
      {noteLead && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/30 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="absolute inset-0" onClick={() => { setNoteLead(null); setNewNoteText(""); }}></div>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl relative z-10 overflow-hidden border border-slate-200 max-h-[85vh] flex flex-col">
            <div className="px-6 py-5 flex justify-between items-start border-b border-slate-100 bg-slate-50/50">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Follow-up History</h2>
                <p className="text-xs text-slate-500 mt-1">All conversations with <span className="font-bold text-slate-800">{noteLead.leadName}</span> so far.</p>
              </div>
              <button onClick={() => { setNoteLead(null); setNewNoteText(""); }} className="text-slate-400 hover:text-slate-800 p-1 rounded transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-slate-50/40">
              {!noteLead.indicationsHistory || noteLead.indicationsHistory.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-8">No follow-up notes added yet.</p>
              ) : (
                [...noteLead.indicationsHistory]
                  .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
                  .map((entry, idx) => (
                    <div key={entry._id || idx} className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs">
                      <p className="text-sm text-slate-800">{entry.text}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] text-slate-400 font-mono">{entry.createdAt ? new Date(entry.createdAt).toLocaleString() : ""}</span>
                        {entry.createdBy && (<span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-semibold">{entry.createdBy}</span>)}
                      </div>
                    </div>
                  ))
              )}
            </div>

            <form onSubmit={handleAddNote} className="p-4 border-t border-slate-100 bg-white flex items-end gap-3">
              <div className="flex-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">New Follow-up Note</label>
                <textarea value={newNoteText} onChange={(e) => setNewNoteText(e.target.value)} rows={2} placeholder="Write what was discussed today..." className="w-full px-3 py-2 border border-slate-200 rounded text-sm text-slate-800 focus:outline-none focus:border-[#99B562] transition-colors resize-none" />
              </div>
              <button type="submit" disabled={mutationAddNote.isPending || !newNoteText.trim()} className="px-4 py-2 rounded bg-[#99B562] text-white text-xs font-bold hover:bg-[#85a052] transition-colors disabled:opacity-40 whitespace-nowrap">
                {mutationAddNote.isPending ? "Adding..." : "Add Note"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- ✅ নতুন — FOLLOW-UP / REMINDER MODAL --- */}
      {reminderLead && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/30 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="absolute inset-0" onClick={() => setReminderLead(null)}></div>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden border border-slate-200">
            <div className="px-6 py-5 flex justify-between items-start border-b border-slate-100 bg-slate-50/50">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Set Follow-up</h2>
                <p className="text-xs text-slate-500 mt-1">
                  For <span className="font-bold text-slate-800">{reminderLead.leadName}</span> — appears on the Reminders page.
                </p>
              </div>
              <button onClick={() => setReminderLead(null)} className="text-slate-400 hover:text-slate-800 p-1 rounded transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <form onSubmit={handleSetReminder} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Date <span className="text-red-500">*</span></label>
                  <input type="date" required value={reminderDate} onChange={(e) => setReminderDate(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:outline-none focus:border-[#99B562]" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Time (optional)</label>
                  <input type="time" value={reminderTime} onChange={(e) => setReminderTime(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:outline-none focus:border-[#99B562]" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Note (optional)</label>
                <textarea value={reminderNoteText} onChange={(e) => setReminderNoteText(e.target.value)} rows={2} placeholder="e.g. Discuss pricing again" className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:outline-none focus:border-[#99B562] resize-none" />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                {reminderLead.reminderAt && (
                  <button
                    type="button"
                    onClick={() => mutationClearReminder.mutate(reminderLead._id || reminderLead.id)}
                    disabled={mutationClearReminder.isPending}
                    className="px-3 py-2 rounded border border-red-200 text-red-600 text-xs font-bold hover:bg-red-50 disabled:opacity-50"
                  >
                    Clear
                  </button>
                )}
                <button type="button" onClick={() => setReminderLead(null)} className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800">Cancel</button>
                <button type="submit" disabled={mutationSetReminder.isPending || !reminderDate} className="px-4 py-2 rounded bg-[#99B562] text-white text-xs font-bold hover:bg-[#85a052] disabled:opacity-40">
                  {mutationSetReminder.isPending ? "Saving..." : "Set Follow-up"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}