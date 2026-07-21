import React, { useState } from "react";
import type { IMeeting } from "./Sales_My_Leads";
import { useMutation, useQuery } from "@tanstack/react-query";
import useAxiosSales from "@/uri/useAxiosSales";

import Notification from "../ui/toast";
import Swal from "sweetalert2";
import { useUserData } from "./Sales_Hook/User_Data";

// --- 1. TYPES ---
export interface MeetingData extends IMeeting {
  _id?: string;
  id?: string;
  owner?: string;
}

const createEmptyForm = (): IMeeting => ({
  title: "",
  clientName: "",
  clientEmail: "",
  meetingDate: "",
  meetingTime: "",
  meetingType: "online",
  meetingLink: "",
  agenda: "",
  notes: "",
  status: "scheduled",
  schedulerId: "",
});

const normalizeMeetingStatus = (status?: string): MeetingData["status"] => {
  const normalized = status?.toLowerCase();

  if (normalized === "completed" || normalized === "cancelled") {
    return normalized as MeetingData["status"];
  }

  return "scheduled";
};

const normalizeMeetingsResponse = (response: unknown): MeetingData[] => {
  const payload = response as
    | MeetingData[]
    | {
        data?: MeetingData[];
        meetings?: MeetingData[];
        allMeetings?: MeetingData[];
      };

  const meetings = Array.isArray(payload)
    ? payload
    : (payload?.data ?? payload?.meetings ?? payload?.allMeetings ?? []);

  if (!Array.isArray(meetings)) {
    return [];
  }

  return meetings.map((meeting, index) => ({
    ...meeting,
    id:
      meeting.id ??
      meeting._id ??
      `${meeting.clientEmail}-${meeting.meetingDate}-${meeting.meetingTime}-${index}`,
    status: normalizeMeetingStatus(meeting.status),
  }));
};

// Converts a 24-hour "HH:mm" time string (from <input type="time">) into
// a 12-hour format with AM/PM, e.g. "13:00" -> "1:00 PM"
const formatTime = (time?: string) => {
  if (!time) return "";
  const [hourStr, minuteStr] = time.split(":");
  let hour = parseInt(hourStr, 10);
  if (Number.isNaN(hour)) return time;
  const minute = (minuteStr ?? "00").padStart(2, "0");
  const period = hour >= 12 ? "PM" : "AM";
  hour = hour % 12;
  if (hour === 0) hour = 12;
  return `${hour}:${minute} ${period}`;
};

export default function Sales_Meetings() {
  // --- UI & Modal States ---
  const [showNoti, setShowNoti] = useState(false);
  const [showNotiUpdate, setShowNotiUpdate] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<"scheduled" | "completed" | "cancelled">("scheduled");

  // New UI State for the detached layout
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMeetingId, setEditingMeetingId] = useState<string>("");
  const [editFormData, setEditFormData] = useState<IMeeting>(createEmptyForm());

  const axiosSales = useAxiosSales();
  const { userData } = useUserData();

  // --- Data Fetching ---
  const {
    data: meetings = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<MeetingData[]>({
    queryKey: ["meetings-single-sales", userData?._id],
    enabled: Boolean(userData?._id),
    queryFn: async () => {
      const res = await axiosSales.get(
        `/api/v1/sales/meetings/meetings/${userData?._id}`,
      );
      return normalizeMeetingsResponse(res.data);
    },
  });

  // --- Create Form Logic ---
  const [formData, setFormData] = useState<IMeeting>(createEmptyForm());

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      if (name === "meetingType") {
        return {
          ...prev,
          meetingType: value as IMeeting["meetingType"],
          meetingLink: value === "online" ? prev.meetingLink : "",
        };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newMeeting: MeetingData = {
      ...formData,
      schedulerId: userData?._id || "",
      owner: userData?.name || "Unknown User",
    };
    mutationUpformeeting.mutate(newMeeting);
    setFormData(createEmptyForm());
    setIsCreateModalOpen(false);
  };

  const mutationUpformeeting = useMutation({
    mutationFn: async (meetingData: IMeeting) => {
      const res = await axiosSales.post(
        "/api/v1/sales/meetings/create-meeting",
        meetingData,
      );
      return res.data;
    },
    onSuccess: () => {
      refetch();
      setShowNoti(true);
    },
  });

  // --- Actions Logic ---
  const handleCompleteMeeting = (meeting: MeetingData) => {
    Swal.fire({
      title: "Confirm Completion",
      text: "Mark this meeting as successfully completed?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#99B562",
      cancelButtonColor: "#94a3b8",
      confirmButtonText: "Yes, Complete",
    }).then((result) => {
      if (result.isConfirmed) {
        mutationUpStatusCNG.mutate({ id: meeting._id as string, status: "completed" });
        Swal.fire({ title: "Completed!", text: "Status updated.", icon: "success" });
      }
    });
  };

  const handleCancelMeeting = (meeting: MeetingData) => {
    Swal.fire({
      title: "Cancel Meeting?",
      text: "This will move the meeting to your cancelled log.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#94a3b8",
      cancelButtonText: "Keep it",
      confirmButtonText: "Yes, Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        mutationUpStatusCNG.mutate({ id: meeting._id as string, status: "cancelled" });
        Swal.fire({ title: "Cancelled!", text: "Meeting cancelled.", icon: "success" });
      }
    });
  };

  const handleDeleteMeeting = (meeting: MeetingData) => {
    Swal.fire({
      title: "Delete Record?",
      text: "This action cannot be undone.",
      icon: "error",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#94a3b8",
      confirmButtonText: "Yes, delete",
    }).then((result) => {
      if (result.isConfirmed) {
        mutationUpdelete.mutate(meeting?._id as string);
        Swal.fire({ title: "Deleted!", text: "Record wiped.", icon: "success" });
      }
    });
  };

  // --- Edit Logic ---
  const handleUpdateMeeting = (meeting: MeetingData) => {
    setEditingMeetingId(meeting._id ?? meeting.id ?? "");
    setEditFormData({
      title: meeting.title || "",
      clientName: meeting.clientName || "",
      clientEmail: meeting.clientEmail || "",
      meetingDate: meeting.meetingDate || "",
      meetingTime: meeting.meetingTime || "",
      meetingType: meeting.meetingType || "online",
      meetingLink: meeting.meetingLink || "",
      agenda: meeting.agenda || "",
      notes: meeting.notes || "",
      status: normalizeMeetingStatus(meeting.status),
      schedulerId: meeting.schedulerId || userData?._id || "",
    });
    setIsEditModalOpen(true);
  };

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setEditFormData((prev) => {
      if (name === "meetingType") {
        return {
          ...prev,
          meetingType: value as IMeeting["meetingType"],
          meetingLink: value === "online" ? prev.meetingLink : "",
        };
      }
      return { ...prev, [name]: value };
    });
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingMeetingId("");
    setEditFormData(createEmptyForm());
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutatuionUpdatemeeting.mutate({ id: editingMeetingId, updatedData: editFormData });
    closeEditModal();
  };

  // --- Mutations ---
  const mutatuionUpdatemeeting = useMutation({
    mutationFn: async ({ id, updatedData }: { id: string; updatedData: IMeeting }) => {
      const res = await axiosSales.put(`/api/v1/sales/meetings/update-full-meeting/${id}`, updatedData);
      return res.data;
    },
    onSuccess: () => {
      refetch();
      setShowNotiUpdate(true);
    },
  });

  const mutationUpStatusCNG = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await axiosSales.patch(`/api/v1/sales/meetings/update-meeting-status/${id}`, { status });
      return res.data;
    },
    onSuccess: () => {
      refetch();
    },
  });

  const mutationUpdelete = useMutation({
    mutationFn: async (id: string) => {
      const res = await axiosSales.delete(`/api/v1/sales/meetings/delete-meeting/${id}`);
      return res.data;
    },
    onSuccess: () => {
      refetch();
    },
  });

  // --- KPIs & Filtering ---
  const totalMeetings = meetings.length;
  const upcomingMeetings = meetings.filter((m) => m.status === "scheduled").length;
  const completedMeetings = meetings.filter((m) => m.status === "completed").length;
  const cancelledMeetings = meetings.filter((m) => m.status === "cancelled").length;
  const filteredMeetings = meetings.filter((m) => m.status === selectedStatus);

  return (
    <>
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {showNoti && (
          <Notification type="success" title="Schedule Confirmed" message="New meeting injected into timeline." showIcon={true} duration={3000} onClose={() => setShowNoti(false)} />
        )}
        {showNotiUpdate && (
          <Notification type="success" title="Record Updated" message="Meeting details synced successfully." showIcon={true} duration={3000} onClose={() => setShowNotiUpdate(false)} />
        )}
      </div>

      <div className="w-full bg-gradient-to-b from-[#f8fafc] to-[#f1f5f9] px-6 py-10 lg:px-14 font-sans min-h-screen text-slate-900 antialiased">
        <div className="max-w-[1400px] mx-auto">

          {/* --- HEADER --- */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 border-b border-slate-200 pb-6">
            <div>
              <p className="text-sm tracking-widest text-[#7a914e] uppercase font-bold mb-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#99B562]"></span>
                Timeline & Engagements
              </p>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">Meeting Calendar</h1>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-[#99B562] hover:bg-[#85a052] active:scale-[0.98] text-white px-6 py-3 rounded-xl text-base font-semibold transition-all shadow-md shadow-[#99B562]/25 hover:shadow-lg hover:shadow-[#99B562]/30 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
              Schedule Engagement
            </button>
          </div>

          {/* --- KPI METRICS --- */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <div className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
              <div>
                <p className="text-xs uppercase tracking-wider font-bold text-slate-500 mb-1">Total Logged</p>
                <p className="text-3xl font-bold text-slate-800">{totalMeetings}</p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              </div>
            </div>
            <div className="bg-white border border-[#99B562]/40 p-5 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#99B562] to-[#7a914e]"></div>
              <div className="pl-3">
                <p className="text-xs uppercase tracking-wider font-bold text-[#7a914e] mb-1">Upcoming</p>
                <p className="text-3xl font-bold text-slate-900">{upcomingMeetings}</p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-[#99B562]/10 flex items-center justify-center text-[#7a914e] border border-[#99B562]/20">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
            </div>
            <div className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
              <div>
                <p className="text-xs uppercase tracking-wider font-bold text-slate-500 mb-1">Completed</p>
                <p className="text-3xl font-bold text-slate-800">{completedMeetings}</p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              </div>
            </div>
            <div className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
              <div>
                <p className="text-xs uppercase tracking-wider font-bold text-slate-500 mb-1">Cancelled</p>
                <p className="text-3xl font-bold text-slate-800">{cancelledMeetings}</p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </div>
            </div>
          </div>

          {/* --- TABS --- */}
          <div className="flex gap-8 border-b border-slate-200 mb-8">
            {["scheduled", "completed", "cancelled"].map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status as any)}
                className={`pb-4 text-base font-semibold capitalize transition-colors relative ${
                  selectedStatus === status ? "text-[#7a914e]" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {status}
                {selectedStatus === status && (
                  <span className="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#99B562] to-[#7a914e] rounded-t-full"></span>
                )}
              </button>
            ))}
          </div>

          {/* --- MEETING GRID --- */}
          <div className="min-h-[400px]">
            {isLoading && (
              <div className="flex flex-col items-center justify-center pt-20">
                <div className="w-8 h-8 border-4 border-slate-200 border-t-[#99B562] rounded-full animate-spin"></div>
                <span className="mt-4 text-sm tracking-wider text-slate-500 uppercase font-bold">Syncing Timeline...</span>
              </div>
            )}

            {isError && !isLoading && (
              <div className="p-10 text-center border border-red-200 bg-red-50 rounded-xl mt-10 max-w-lg mx-auto">
                <p className="text-lg font-bold text-red-700">Sync Failure</p>
                <p className="text-sm text-red-600 mt-2">Unable to establish timeline connection.</p>
              </div>
            )}

            {!isLoading && !isError && filteredMeetings.length === 0 && (
              <div className="p-16 text-center border-2 border-dashed border-slate-300 bg-white rounded-2xl mt-10">
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Registry Empty</p>
                <p className="text-base text-slate-500 mt-2">No records match the <span className="font-semibold text-slate-700">{selectedStatus}</span> state.</p>
              </div>
            )}

            {!isLoading && !isError && filteredMeetings.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredMeetings.map((meeting) => (
                  <div key={meeting._id ?? meeting.id} className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col transition-all hover:border-[#99B562]/40 hover:shadow-lg hover:shadow-slate-200/60 hover:-translate-y-0.5 group">

                    {/* Card Header */}
                    <div className="flex justify-between items-start mb-6">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border ${
                        meeting.status === "scheduled" ? "bg-[#99B562]/10 text-[#7a914e] border-[#99B562]/20" :
                        meeting.status === "completed" ? "bg-slate-100 text-slate-700 border-slate-200" :
                        "bg-red-50 text-red-700 border-red-200"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          meeting.status === "scheduled" ? "bg-[#99B562]" :
                          meeting.status === "completed" ? "bg-slate-400" :
                          "bg-red-500"
                        }`}></span>
                        {meeting.status}
                      </span>
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-900">
                          {new Date(meeting.meetingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                        <p className="text-xs font-mono text-slate-500 mt-0.5">{formatTime(meeting.meetingTime)}</p>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-900 leading-tight mb-2 group-hover:text-[#5f7539] transition-colors">{meeting.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-slate-600 mb-5">
                        <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                        <span className="font-semibold text-slate-800">{meeting.clientName}</span>
                      </div>

                      {meeting.agenda && (
                        <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed mb-4">
                          <span className="font-bold text-slate-800">Agenda:</span> {meeting.agenda}
                        </p>
                      )}

                      {meeting.meetingType === 'online' && meeting.meetingLink && (
                         <div className="bg-[#99B562]/5 border border-[#99B562]/20 rounded-lg p-3 text-sm truncate">
                           <a href={meeting.meetingLink} target="_blank" rel="noreferrer" className="text-[#7a914e] font-mono font-medium hover:underline">
                             {meeting.meetingLink}
                           </a>
                         </div>
                      )}
                    </div>

                    {/* Actions Footer */}
                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex gap-3">
                        {meeting.status === "scheduled" && (
                          <>
                            <button onClick={() => handleCompleteMeeting(meeting)} className="text-xs font-bold text-slate-500 hover:text-[#7a914e] uppercase tracking-wider transition-colors">Complete</button>
                            <span className="text-slate-300">|</span>
                            <button onClick={() => handleCancelMeeting(meeting)} className="text-xs font-bold text-slate-500 hover:text-red-500 uppercase tracking-wider transition-colors">Cancel</button>
                          </>
                        )}
                      </div>
                      <div className="flex gap-3">
                        <button onClick={() => handleUpdateMeeting(meeting)} className="text-slate-500 hover:text-[#7a914e] bg-slate-50 hover:bg-[#99B562]/10 p-2 rounded-lg transition-colors" title="Edit">
                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                        </button>
                        <button onClick={() => handleDeleteMeeting(meeting)} className="text-slate-500 hover:text-red-600 bg-slate-50 hover:bg-red-50 p-2 rounded-lg transition-colors" title="Delete">
                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3M4 7h16"></path></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- SCHEDULE CREATE MODAL --- */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="absolute inset-0" onClick={() => setIsCreateModalOpen(false)}></div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-3xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-start bg-gradient-to-r from-[#99B562]/5 to-transparent">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Schedule Encounter</h2>
                <p className="text-sm text-slate-500 mt-1">Initialize a new meeting configuration block.</p>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-900 p-2 rounded-lg transition-colors bg-white border border-slate-200 hover:bg-slate-100">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
               <div className="sm:col-span-2">
                 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Event Header <span className="text-red-500">*</span></label>
                 <input type="text" name="title" required value={formData.title} onChange={handleChange} placeholder="e.g. Discovery & Sync" className="w-full px-4 py-3 border border-slate-300 rounded-xl text-base text-slate-900 focus:outline-none focus:border-[#99B562] focus:ring-2 focus:ring-[#99B562]/20 transition-all" />
               </div>

               <div>
                 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Target Client <span className="text-red-500">*</span></label>
                 <input type="text" name="clientName" required value={formData.clientName} onChange={handleChange} className="w-full px-4 py-3 border border-slate-300 rounded-xl text-base text-slate-900 focus:outline-none focus:border-[#99B562] focus:ring-2 focus:ring-[#99B562]/20 transition-all" />
               </div>

               <div>
                 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Contact Email <span className="text-red-500">*</span></label>
                 <input type="email" name="clientEmail"  value={formData.clientEmail} onChange={handleChange} className="w-full px-4 py-3 border border-slate-300 rounded-xl text-base text-slate-900 font-mono focus:outline-none focus:border-[#99B562] focus:ring-2 focus:ring-[#99B562]/20 transition-all" />
               </div>

               <div>
                 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Date <span className="text-red-500">*</span></label>
                 <input type="date" name="meetingDate" required value={formData.meetingDate} onChange={handleChange} className="w-full px-4 py-3 border border-slate-300 rounded-xl text-base text-slate-900 focus:outline-none focus:border-[#99B562] focus:ring-2 focus:ring-[#99B562]/20 transition-all" />
               </div>

               <div>
                 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Time <span className="text-red-500">*</span></label>
                 <input type="time" name="meetingTime" required value={formData.meetingTime} onChange={handleChange} className="w-full px-4 py-3 border border-slate-300 rounded-xl text-base text-slate-900 focus:outline-none focus:border-[#99B562] focus:ring-2 focus:ring-[#99B562]/20 transition-all" />
                 {formData.meetingTime && (
                   <p className="text-xs text-slate-400 mt-1.5 font-mono">Preview: {formatTime(formData.meetingTime)}</p>
                 )}
               </div>

               <div>
                 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Medium</label>
                 <select name="meetingType" value={formData.meetingType} onChange={handleChange} className="w-full px-4 py-3 border border-slate-300 rounded-xl text-base text-slate-900 focus:outline-none focus:border-[#99B562] focus:ring-2 focus:ring-[#99B562]/20 transition-all bg-white cursor-pointer">
                   <option value="online">Online</option>
                   <option value="offline">Offline</option>
                 </select>
               </div>

               {formData.meetingType === "online" && (
                 <div className="sm:col-span-2">
                   <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">URI Meeting Link</label>
                   <input type="text" name="meetingLink" value={formData.meetingLink || ""} onChange={handleChange} placeholder="https://meet.google.com/..." className="w-full px-4 py-3 border border-slate-300 rounded-xl text-base text-slate-900 font-mono focus:outline-none focus:border-[#99B562] focus:ring-2 focus:ring-[#99B562]/20 transition-all" />
                 </div>
               )}

               <div className="sm:col-span-2">
                 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Discussion Agenda</label>
                 <textarea name="agenda" rows={3} value={formData.agenda || ""} onChange={handleChange} className="w-full px-4 py-3 border border-slate-300 rounded-xl text-base text-slate-900 focus:outline-none focus:border-[#99B562] focus:ring-2 focus:ring-[#99B562]/20 resize-none transition-all" />
               </div>

               <div className="sm:col-span-2">
                 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Internal Notes</label>
                 <textarea name="notes" rows={2} value={formData.notes || ""} onChange={handleChange} className="w-full px-4 py-3 border border-slate-300 rounded-xl text-base text-slate-900 focus:outline-none focus:border-[#99B562] focus:ring-2 focus:ring-[#99B562]/20 resize-none transition-all" />
               </div>

               <div className="sm:col-span-2 pt-6 mt-2 border-t border-slate-200 flex justify-end gap-4">
                 <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-5 py-3 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors border border-transparent hover:border-slate-300 rounded-xl">Discard</button>
                 <button type="submit" className="px-6 py-3 rounded-xl text-base font-bold text-white bg-[#99B562] hover:bg-[#85a052] transition-all shadow-md shadow-[#99B562]/25 hover:shadow-lg hover:shadow-[#99B562]/30 active:scale-[0.98]">Commit Schedule</button>
               </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT MODAL --- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="absolute inset-0" onClick={closeEditModal}></div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-3xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-start bg-gradient-to-r from-[#99B562]/5 to-transparent">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Modify Encounter</h2>
                <p className="text-sm text-slate-500 mt-1">Edit attributes for the existing block.</p>
              </div>
              <button onClick={closeEditModal} className="text-slate-400 hover:text-slate-900 p-2 rounded-lg transition-colors bg-white border border-slate-200 hover:bg-slate-100">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="flex-1 overflow-y-auto p-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
               <div className="sm:col-span-2">
                 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Event Header <span className="text-red-500">*</span></label>
                 <input type="text" name="title" required value={editFormData.title} onChange={handleEditChange} className="w-full px-4 py-3 border border-slate-300 rounded-xl text-base text-slate-900 focus:outline-none focus:border-[#99B562] focus:ring-2 focus:ring-[#99B562]/20 transition-all" />
               </div>

               <div>
                 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Target Client <span className="text-red-500">*</span></label>
                 <input type="text" name="clientName" required value={editFormData.clientName} onChange={handleEditChange} className="w-full px-4 py-3 border border-slate-300 rounded-xl text-base text-slate-900 focus:outline-none focus:border-[#99B562] focus:ring-2 focus:ring-[#99B562]/20 transition-all" />
               </div>

               <div>
                 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Contact Email <span className="text-red-500">*</span></label>
                 <input type="email" name="clientEmail" required value={editFormData.clientEmail} onChange={handleEditChange} className="w-full px-4 py-3 border border-slate-300 rounded-xl text-base text-slate-900 font-mono focus:outline-none focus:border-[#99B562] focus:ring-2 focus:ring-[#99B562]/20 transition-all" />
               </div>

               <div>
                 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Date <span className="text-red-500">*</span></label>
                 <input type="date" name="meetingDate" required value={editFormData.meetingDate} onChange={handleEditChange} className="w-full px-4 py-3 border border-slate-300 rounded-xl text-base text-slate-900 focus:outline-none focus:border-[#99B562] focus:ring-2 focus:ring-[#99B562]/20 transition-all" />
               </div>

               <div>
                 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Time <span className="text-red-500">*</span></label>
                 <input type="time" name="meetingTime" required value={editFormData.meetingTime} onChange={handleEditChange} className="w-full px-4 py-3 border border-slate-300 rounded-xl text-base text-slate-900 focus:outline-none focus:border-[#99B562] focus:ring-2 focus:ring-[#99B562]/20 transition-all" />
                 {editFormData.meetingTime && (
                   <p className="text-xs text-slate-400 mt-1.5 font-mono">Preview: {formatTime(editFormData.meetingTime)}</p>
                 )}
               </div>

               <div>
                 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Medium</label>
                 <select name="meetingType" value={editFormData.meetingType} onChange={handleEditChange} className="w-full px-4 py-3 border border-slate-300 rounded-xl text-base text-slate-900 focus:outline-none focus:border-[#99B562] focus:ring-2 focus:ring-[#99B562]/20 transition-all bg-white cursor-pointer">
                   <option value="online">Virtual / Online</option>
                   <option value="offline">In-Person / Offline</option>
                 </select>
               </div>

               <div>
                 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Action State</label>
                 <select name="status" value={editFormData.status || "scheduled"} onChange={handleEditChange} className="w-full px-4 py-3 border border-slate-300 rounded-xl text-base text-slate-900 focus:outline-none focus:border-[#99B562] focus:ring-2 focus:ring-[#99B562]/20 transition-all bg-white cursor-pointer">
                   <option value="scheduled">Active Scheduled</option>
                   <option value="completed">Completed</option>
                   <option value="cancelled">Cancelled</option>
                 </select>
               </div>

               {editFormData.meetingType === "online" && (
                 <div className="sm:col-span-2">
                   <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">URI Meeting Link</label>
                   <input type="text" name="meetingLink" value={editFormData.meetingLink || ""} onChange={handleEditChange} className="w-full px-4 py-3 border border-slate-300 rounded-xl text-base text-slate-900 font-mono focus:outline-none focus:border-[#99B562] focus:ring-2 focus:ring-[#99B562]/20 transition-all" />
                 </div>
               )}

               <div className="sm:col-span-2">
                 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Discussion Agenda</label>
                 <textarea name="agenda" rows={3} value={editFormData.agenda || ""} onChange={handleEditChange} className="w-full px-4 py-3 border border-slate-300 rounded-xl text-base text-slate-900 focus:outline-none focus:border-[#99B562] focus:ring-2 focus:ring-[#99B562]/20 resize-none transition-all" />
               </div>

               <div className="sm:col-span-2">
                 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Internal Notes</label>
                 <textarea name="notes" rows={2} value={editFormData.notes || ""} onChange={handleEditChange} className="w-full px-4 py-3 border border-slate-300 rounded-xl text-base text-slate-900 focus:outline-none focus:border-[#99B562] focus:ring-2 focus:ring-[#99B562]/20 resize-none transition-all" />
               </div>

               <div className="sm:col-span-2 pt-6 mt-2 border-t border-slate-200 flex justify-end gap-4">
                 <button type="button" onClick={closeEditModal} className="px-5 py-3 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors border border-transparent hover:border-slate-300 rounded-xl">Discard Changes</button>
                 <button type="submit" className="px-6 py-3 rounded-xl text-base font-bold text-white bg-[#99B562] hover:bg-[#85a052] transition-all shadow-md shadow-[#99B562]/25 hover:shadow-lg hover:shadow-[#99B562]/30 active:scale-[0.98]">Update Block</button>
               </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}