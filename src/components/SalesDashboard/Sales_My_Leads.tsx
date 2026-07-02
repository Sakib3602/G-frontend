import { useState, useMemo } from "react";
import useAxiosSales from "@/uri/useAxiosSales";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router";
import Notification from "../ui/toast";

import { useUserData } from "./Sales_Hook/User_Data";

export interface LeadData {
  id: string;
  _id: string;
  leadName: string;
  owner: string;
  status: string;
  indications: string;
  companyName: string;
  leadScore: string;
  email: string;
  phone: string;
  title: string;
  specificRole: string;
  region: string;
  profileUrl: string;
  ServiceNeed?: string;
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

// Utility functions for dynamic cell colors
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

// Standard Status Options for the dropdown
const statusOptions = [
  "New Lead",
  "Attempted to contact",
  "Contacted",
  "In Progress",
  "Unqualified",
];

// form
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

  // --- UI Control States ---
  const [showNoti, setShowNoti] = useState(false);
  const [showNotiStatusUpdate, setShowNotiStatusUpdate] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortBy, setSortBy] = useState("Newest");
  
  // Meeting Modal State
  const [meetingLead, setMeetingLead] = useState<LeadData | null>(null);
  const [meetingForm, setMeetingForm] = useState<IMeeting>(createMeetingForm());
  const [meetingError, setMeetingError] = useState<string | null>(null);
  const [isMeetingConflict, setIsMeetingConflict] = useState(false);

  // Note Modal State
  const [noteLead, setNoteLead] = useState<LeadData | null>(null);
  const [noteText, setNoteText] = useState("");

  // Details Modal State
  const [selectedLeadDetails, setSelectedLeadDetails] = useState<LeadData | null>(null);

  const queryClient = useQueryClient();
  const { userData } = useUserData();

  // --- Data Fetching ---
  const {
    data: leadsData = [],
    isLoading,
    isError,
  } = useQuery<LeadData[]>({
    queryKey: ["all-sales-leads"],
    queryFn: async () => {
      const res = await axiosSales.get(`/api/v1/sales/get-my-leads/${userData._id}`);
      return res.data.leads as LeadData[];
    },
  });

  // --- Search, Filter, and Sort Logic ---
  const processedLeads = useMemo(() => {
    if (!leadsData) return [];
    let result = [...leadsData];

    // 1. Apply Search
    if (searchQuery.trim() !== "") {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(
        (lead) =>
          lead.leadName?.toLowerCase().includes(lowerQuery) ||
          lead.companyName?.toLowerCase().includes(lowerQuery) ||
          lead.email?.toLowerCase().includes(lowerQuery),
      );
    }

    // 2. Apply Filter
    if (filterStatus !== "All") {
      result = result.filter((lead) => lead.status === filterStatus);
    }

    // 3. Apply Sorting
    switch (sortBy) {
      case "Name (A-Z)":
        result.sort((a, b) => a.leadName.localeCompare(b.leadName));
        break;
      case "Name (Z-A)":
        result.sort((a, b) => b.leadName.localeCompare(a.leadName));
        break;
      case "Score (High to Low)":
        result.sort((a, b) => Number(b.leadScore) - Number(a.leadScore));
        break;
      case "Score (Low to High)":
        result.sort((a, b) => Number(a.leadScore) - Number(b.leadScore));
        break;
      default:
        break;
    }

    return result;
  }, [leadsData, searchQuery, filterStatus, sortBy]);

  // download as CSV
  const downloadCSV = () => {
    if (!leadsData || leadsData.length === 0) return;
    const header = Object.keys(leadsData[0]).join(",") + "\n";
    const rows = leadsData
      .map((row) => Object.values(row).map((value) => `"${value}"`).join(","))
      .join("\n");
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

  // --- Handle Meeting Submit ---
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
      queryClient.invalidateQueries({ queryKey: ["all-sales-leads"] });
    },
  });

  const handleMeetingFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setMeetingForm((prev) => {
      if (name === "meetingType") {
        return {
          ...prev,
          meetingType: value as IMeeting["meetingType"],
          meetingLink: value === "online" ? prev.meetingLink : "",
        };
      }
      if (name === "status") {
        return {
          ...prev,
          status: value as IMeeting["status"],
        };
      }
      return {
        ...prev,
        [name]: value,
      };
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
    setNoteText(lead.indications || "");

  };

  // /update-indications
  const mutationUpForNote = useMutation({
  mutationFn: async ({ leadId, indications }: { leadId: string; indications: string }) => {
    const res = await axiosSales.patch(`/api/v1/sales/update-indications/${leadId}`, { indications });
    return res.data;
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["all-sales-leads"] });
  },
});

  const handleNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!noteLead || !noteText.trim()) return;

    const leadId = noteLead._id || noteLead.id;
    const nextIndications = noteText.trim();

    mutationUpForNote.mutate(
      {
        leadId,
        indications: nextIndications,
      },
      {
        onSuccess: () => {
          console.log(nextIndications);
          setNoteLead(null);
          setNoteText("");
        },
      },
    );
  };

  const MutationForCkMeeting = useMutation({
    mutationFn: async (leadId: string) => {
      const res = await axiosSales.get(`/api/v1/sales/meetings/check-meeting/${leadId}`);
      return res.data;
    },
    onSuccess: (data) => {
      setIsMeetingConflict(data.meeting);
    },
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
      queryClient.invalidateQueries({ queryKey: ["all-sales-leads"] });
    }
  });

  // --- Loading / Error States ---
  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-white">
        <div className="w-5 h-5 border-2 border-slate-200 border-t-[#99B562] rounded-full animate-spin"></div>
        <span className="mt-3 text-xs tracking-wider text-slate-400 uppercase font-medium">Fetching Directory...</span>
      </div>
    );
  }

  if (isError) {
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
          <Notification
            type="success"
            title="Meeting Scheduled!"
            message="Your meeting has been scheduled successfully."
            showIcon={true}
            duration={3000}
            onClose={() => setShowNoti(false)}
          />
        )}
        {showNotiStatusUpdate && (
          <Notification
            type="success"
            title="Status Updated!"
            message="Lead operational status has synced cleanly."
            showIcon={true}
            duration={3000}
            onClose={() => setShowNotiStatusUpdate(false)}
          />
        )}
      </div>

      <div className="w-full min-h-screen bg-[#f8fafc] px-6 py-10 lg:px-14 font-sans text-slate-900 antialiased">
        <div className="max-w-[1400px] mx-auto">
          
          {/* --- MINIMAL HEADER --- */}
          <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
            <div>
              <p className="text-[10px] tracking-widest text-[#99B562] uppercase font-bold mb-1">CRM Directory</p>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Assigned Leads</h1>
              <p className="text-sm text-slate-500 mt-1">Total active entries: <span className="font-semibold text-slate-800">{leadsData.length}</span></p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={downloadCSV}
                className="px-4 py-2 bg-white border border-slate-200 rounded text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-xs"
              >
                Export CSV Data
              </button>
              <Link to={"/dashboard/sales/create-leads"}>
                <button className="px-4 py-2 bg-[#99B562] rounded text-xs font-semibold text-white hover:bg-[#85a052] transition-colors shadow-xs flex items-center gap-2">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"></path></svg>
                  New Lead Entry
                </button>
              </Link>
            </div>
          </div>

          {/* --- CONTROLS SECTION --- */}
          <div className="mb-6 flex flex-col lg:flex-row gap-4 justify-between items-center">
            {/* Search Bar */}
            <div className="relative w-full lg:max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <input
                type="text"
                className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-md text-sm bg-white placeholder-slate-400 focus:outline-none focus:border-[#99B562] focus:ring-1 focus:ring-[#99B562]/20 transition-all shadow-xs"
                placeholder="Search queries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filter & Sort Dropdowns */}
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

              <select
                className="block w-full lg:w-auto pl-3 pr-8 py-2 text-sm border border-slate-200 rounded-md bg-white text-slate-700 focus:outline-none focus:border-[#99B562] focus:ring-1 focus:ring-[#99B562]/20 shadow-xs cursor-pointer appearance-none"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="Newest">Sort: Default</option>
                <option value="Name (A-Z)">Name (A-Z)</option>
                <option value="Name (Z-A)">Name (Z-A)</option>
                <option value="Score (High to Low)">Score: Highest</option>
                <option value="Score (Low to High)">Score: Lowest</option>
              </select>
            </div>
          </div>

          {/* --- MINIMAL TABLE SECTION --- */}
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
                {processedLeads.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-slate-400 text-xs">No records matched your search parameters.</td>
                  </tr>
                )}

                {processedLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-5 py-3">
                      <button 
                        onClick={() => setSelectedLeadDetails(lead)}
                        className="font-semibold text-slate-800 hover:text-[#99B562] transition-colors focus:outline-none flex items-center gap-2"
                      >
                        {lead.leadName}
                        <svg className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-[#99B562]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                      </button>
                    </td>

                    <td className="px-5 py-3 w-[1%]">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openMeetingPopup(lead)}
                          className="whitespace-nowrap px-3 py-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-[11px] font-bold transition-all shadow-xs"
                        >
                          Schedule
                        </button>
                        <button
                          onClick={() => openNotePopup(lead)}
                          className="whitespace-nowrap px-3 py-1.5 rounded border border-[#99B562]/30 bg-[#99B562]/10 hover:bg-[#99B562]/15 text-[#6f8a3f] text-[11px] font-bold transition-all shadow-xs"
                        >
                          Add Note
                        </button>
                      </div>
                    </td>

                    <td className="px-5 py-3 w-44">
                      <div className={`relative w-full rounded border px-2 py-1 flex items-center ${getStatusColor(lead.status)}`}>
                        <select
                          value={lead.status}
                          onChange={(e) => handleInlineStatusChange(lead._id, e.target.value)}
                          className="w-full appearance-none bg-transparent outline-none cursor-pointer text-xs font-semibold pr-4"
                        >
                          {statusOptions.map((opt) => (
                            <option key={opt} value={opt} className="bg-white text-slate-800">{opt}</option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                          <svg className="fill-current h-3 w-3 opacity-60" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3 text-slate-600 font-medium text-xs">{lead.companyName || '—'}</td>
                    
                    <td className="px-5 py-3">
                      <a href={`mailto:${lead.email}`} className="text-slate-500 hover:text-slate-900 text-xs font-mono transition-colors">
                        {lead.email || '—'}
                      </a>
                    </td>
                    
                    <td className="px-5 py-3 text-slate-500 text-xs font-mono">{lead.phone || '—'}</td>
                    
                    <td className="px-5 py-3">
                      <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider">
                        {lead.ServiceNeed || "General"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- LEAD DETAILS MODAL --- */}
      {selectedLeadDetails && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="absolute inset-0" onClick={() => setSelectedLeadDetails(null)}></div>
          
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden flex flex-col max-h-[85vh]">
            
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-start">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{selectedLeadDetails.leadName}</h2>
                <p className="text-xs text-slate-500 mt-0.5">{selectedLeadDetails.title || 'Executive'} {selectedLeadDetails.companyName && `at ${selectedLeadDetails.companyName}`}</p>
              </div>
              <button onClick={() => setSelectedLeadDetails(null)} className="text-slate-400 hover:text-slate-900 p-1 rounded transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
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
                    <p className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                      {selectedLeadDetails.leadScore}
                      <svg className="w-3 h-3 text-amber-400 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                    </p>
                 </div>
                 <div className="bg-white border border-slate-200 rounded-lg p-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Territory</p>
                    <p className="text-xs font-semibold text-slate-800">{selectedLeadDetails.region || '—'}</p>
                 </div>
                 <div className="bg-white border border-slate-200 rounded-lg p-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Owner</p>
                    <p className="text-xs font-semibold text-slate-800">{selectedLeadDetails.owner || '—'}</p>
                 </div>
              </div>

              {/* Extended Details Grids */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200 pb-2">Contact Profile</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-[10px] uppercase text-slate-400 font-bold">Email Address</p>
                      <p className="text-sm text-slate-800 font-mono">{selectedLeadDetails.email || '—'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-slate-400 font-bold">Phone Number</p>
                      <p className="text-sm text-slate-800 font-mono">{selectedLeadDetails.phone || '—'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-slate-400 font-bold">LinkedIn / Profile URL</p>
                      {selectedLeadDetails.profileUrl ? (
                        <a href={selectedLeadDetails.profileUrl} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline">View Profile</a>
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
                      <p className="text-[10px] uppercase text-slate-400 font-bold">Specific Role</p>
                      <p className="text-sm text-slate-800">{selectedLeadDetails.specificRole || '—'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-slate-400 font-bold">Service Need</p>
                      <p className="text-sm text-slate-800">{selectedLeadDetails.ServiceNeed || '—'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-slate-400 font-bold">Indications / Notes</p>
                      <p className="text-sm text-slate-600 italic bg-white border border-slate-200 p-2 rounded mt-1">{selectedLeadDetails.indications || 'No descriptive entries.'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- FIX MEETING MODAL --- */}
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
                
                {/* Left Meta Side */}
                <aside className="lg:col-span-4 space-y-4">
                  <div className="border border-slate-200 rounded-lg p-4 bg-white">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3 border-b border-slate-100 pb-2">Target Meta</p>
                    <div className="space-y-3 text-xs">
                      <p><span className="text-slate-400 font-bold block mb-0.5">Enterprise</span> <span className="font-medium text-slate-800">{meetingLead.companyName || '—'}</span></p>
                      <p><span className="text-slate-400 font-bold block mb-0.5">Title</span> <span className="font-medium text-slate-800">{meetingLead.title || '—'}</span></p>
                      <p><span className="text-slate-400 font-bold block mb-0.5">Email</span> <span className="font-mono text-slate-800">{meetingLead.email || '—'}</span></p>
                    </div>
                  </div>

                  {isMeetingConflict && (
                    <div className="border border-amber-200 rounded-lg p-4 bg-amber-50">
                      <h3 className="text-[10px] font-bold text-amber-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                        Schedule Conflict
                      </h3>
                      <p className="text-xs text-amber-700">A prior engagement is already logged for this pipeline target.</p>
                    </div>
                  )}
                </aside>

                {/* Right Form Side */}
                <div className="lg:col-span-8 space-y-4">
                  {meetingError && (
                    <div className="border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 rounded">
                      {meetingError}
                    </div>
                  )}

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
                <button type="button" onClick={() => { setMeetingError(null); setMeetingLead(null); }} className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors">
                  Abort
                </button>
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
          <div className="absolute inset-0" onClick={() => { setNoteLead(null); setNoteText(""); }}></div>

          <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl relative z-10 overflow-hidden border border-slate-200">
            <div className="px-6 py-5 flex justify-between items-start border-b border-slate-100 bg-slate-50/50">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Add Indication / Note</h2>
                <p className="text-xs text-slate-500 mt-1">Leave a note for <span className="font-bold text-slate-800">{noteLead.leadName}</span>.</p>
              </div>
              <button onClick={() => { setNoteLead(null); setNoteText(""); }} className="text-slate-400 hover:text-slate-800 p-1 rounded transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <form onSubmit={handleNoteSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Note</label>
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  rows={5}
                  placeholder="Add indication / note here..."
                  className="w-full px-3 py-2 border border-slate-200 rounded text-sm text-slate-800 focus:outline-none focus:border-[#99B562] transition-colors resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setNoteLead(null); setNoteText(""); }}
                  className="px-4 py-2 rounded border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-[#99B562] text-white text-xs font-bold hover:bg-[#85a052] transition-colors"
                >
                  Submit Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}