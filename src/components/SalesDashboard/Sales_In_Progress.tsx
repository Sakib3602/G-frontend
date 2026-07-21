import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import useAxiosSales from "@/uri/useAxiosSales";
import Notification from "../ui/toast";
import { useUserData } from "./Sales_Hook/User_Data";

// --- 1. Interface ---
export interface INoteEntry {
  _id?: string;
  text: string;
  createdAt?: string;
  createdBy?: string;
}

export interface LeadData {
  id?: string;
  _id?: string;
  leadName: string;
  owner: string;
  status: string;
  indications?: string;
  indicationsHistory?: INoteEntry[]; 
  companyName?: string;
  leadScore: number;
  email?: string;
  phone?: string;
  title?: string;
  specificRole?: string;
  region?: string;
  profileUrl?: string;
  linkedin?: string;
  leadCreatedBy: string;
  proposalSent?: boolean;
   reminderAt?: string | null; 
  reminderNote?: string;   
}

type QualificationStatus = "Qualified" | "Unqualified";

interface ProposalEmailPayload {
  to?: string;
  subject: string;
  message: string;
  proposalLink: string;
  leadInfo: {
    leadId: string;
    name: string;
    company?: string;
    email?: string;
    phone?: string;
    title?: string;
    region?: string;
    leadScore: number;
    status: string;
  };
  timestamp: string;
}

export default function Sales_In_Progress() {
  const [showNotiStatusUpdate, setShowNotiStatusUpdate] = useState(false);
  const [showNotiStatusUpdateYo, setShowNotiStatusUpdateYo] = useState(false);
  const [showNotiStatusUpdateEmail, setShowNotiStatusUpdateEmail] = useState(false);
  const [showReminderBox, setShowReminderBox] = useState(false);
const [reminderDate, setReminderDate] = useState("");
const [reminderTime, setReminderTime] = useState("");
const [reminderNoteText, setReminderNoteText] = useState("");

  const axiosSales = useAxiosSales();
  const { userData } = useUserData();

  const {
    data: leadsData = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<LeadData[]>({
    queryKey: ["all-in-progress-leads", userData?._id],
    enabled: Boolean(userData?._id),
    queryFn: async () => {
      const res = await axiosSales.get(
        `/api/v1/sales/get-in-progress-leads/${userData?._id}`
      );
      return res.data.leads as LeadData[];
    },
  });

  const leads = leadsData;

  // Modal State
  const [selectedLead, setSelectedLead] = useState<LeadData | null>(null);
  const [isComposing, setIsComposing] = useState(false);

  // Email Form State
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [proposalLink, setProposalLink] = useState("");

  // Awaiting Response Status State
  const [responseStatus, setResponseStatus] = useState<QualificationStatus | null>(null);
  const [pendingQualification, setPendingQualification] = useState<QualificationStatus | null>(null);
  const [dealDocLink, setDealDocLink] = useState("");
  const [dealPrice, setDealPrice] = useState("");

  // ✅ নতুন — Note (follow-up history) state
  const [newNoteText, setNewNoteText] = useState("");
  const [showNoteHistory, setShowNoteHistory] = useState(true);

  // ✅ নতুন — Lead Score edit state
  const [isEditingScore, setIsEditingScore] = useState(false);
  const [scoreValue, setScoreValue] = useState<string>("1");

  // Split leads
  const needsProposal = leads.filter((lead) => !lead.proposalSent);
  const proposalSent = leads.filter((lead) => lead.proposalSent);

  const getLeadId = (lead: LeadData | null) => lead?.id || lead?._id || "";

  // Open Modal Handler
  const openModal = (lead: LeadData) => {
    setSelectedLead(lead);
    setIsComposing(false);
    setEmailSubject(`Proposal for ${lead.companyName || lead.leadName}`);
    setEmailBody(
      `Hi ${lead.leadName.split(" ")[0]},\n\nFollowing up on our recent conversation...`
    );
    setProposalLink("");
    setNewNoteText("");
    setIsEditingScore(false);
    setScoreValue(String(lead.leadScore || 1));

     setShowReminderBox(false);
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

  // Close Modal Handler
  const closeModal = () => {
    setSelectedLead(null);
    setIsComposing(false);
    setResponseStatus(null);
    setPendingQualification(null);
    setDealDocLink("");
    setDealPrice("");
    setNewNoteText("");
    setIsEditingScore(false);
  };

  const handleMarkProposalSend = () => {
    if (!selectedLead) return;

    mutationUPProposalSent.mutate({
      leadId: getLeadId(selectedLead),
      showNotification: true,
    });
  };

  const mutationUPProposalSent = useMutation({
    mutationFn: async ({
      leadId,
    }: {
      leadId: string;
      showNotification?: boolean;
    }) => {
      const res = await axiosSales.put(
        `/api/v1/sales/mark-proposal-sent/${leadId}`
      );
      return res.data;
    },
    onSuccess: (_, variables) => {
      refetch();
      if (variables?.showNotification !== false) {
        setShowNotiStatusUpdateYo(true);
      }
      setSelectedLead(null);
      setIsComposing(false);
    },
    onError: (e) => {
      console.error("Error marking proposal sent:", e);
    },
  });

  // Handle Send Proposal
  const handleSendProposal = () => {
    if (!selectedLead) return;

    const proposalData = {
      to: selectedLead.email,
      subject: emailSubject,
      message: emailBody,
      proposalLink: proposalLink,
      leadInfo: {
        leadId: getLeadId(selectedLead),
        name: selectedLead.leadName,
        company: selectedLead.companyName,
        email: selectedLead.email,
        phone: selectedLead.phone,
        title: selectedLead.title,
        region: selectedLead.region,
        leadScore: selectedLead.leadScore,
        status: selectedLead.status,
      },
      timestamp: new Date().toISOString(),
    };

    mutationForEmail.mutate(proposalData);
  };

  // Handle Qualified/Unqualified Response
  const handleQualificationResponse = (qualification: QualificationStatus) => {
    if (!selectedLead) return;

    if (qualification === "Qualified") {
      setPendingQualification(qualification);
      return;
    }

    const leadId = getLeadId(selectedLead);

    MutationUpForStatusUpdate.mutate({
      leadId,
      status: qualification,
    });

    setResponseStatus(qualification);
    setPendingQualification(null);
    setDealDocLink("");
    setDealPrice("");
  };

  const handleSubmitQualification = () => {
    if (!selectedLead || !pendingQualification || !dealDocLink.trim() || !dealPrice.trim()) return;

    const leadId = getLeadId(selectedLead);

    MutationUpForStatusUpdate.mutate({
      leadId,
      status: pendingQualification,
      dealDocLink: dealDocLink.trim(),
      dealmoney: dealPrice.trim(),
    });

    setResponseStatus(pendingQualification);
    setPendingQualification(null);
    setDealDocLink("");
    setDealPrice("");
  };

  const MutationUpForStatusUpdate = useMutation({
    mutationFn: async ({
      leadId,
      status,
      dealDocLink,
      dealmoney,
    }: {
      leadId: string;
      status: QualificationStatus;
      dealDocLink?: string;
      dealmoney?: string;
    }) => {
      const payload: any = { status };
      if (dealDocLink) payload.dealDocLink = dealDocLink;
      if (dealmoney) payload.dealmoney = dealmoney;

      const res = await axiosSales.put(
        `/api/v1/sales/update-lead-status/${leadId}`,
        payload
      );
      return res.data;
    },
    onSuccess: () => {
      refetch();
      setShowNotiStatusUpdate(true);
      setSelectedLead(null);
      setIsComposing(false);
    },
  });

  const mutationForEmail = useMutation({
    mutationFn: async (proposalData: ProposalEmailPayload) => {
      const res = await axiosSales.post(
        "/api/v1/sales/emailservice/send-proposal-email",
        proposalData
      );
      return res.data;
    },
    onSuccess: () => {
      mutationUPProposalSent.mutate({
        leadId: getLeadId(selectedLead),
        showNotification: false,
      });
      setShowNotiStatusUpdateYo(false);
      refetch();
      setSelectedLead(null);
      setIsComposing(false);
      setShowNotiStatusUpdateEmail(true);
    },
  });

  const mutationSetReminder = useMutation({
  mutationFn: async ({ leadId, reminderAt, reminderNote }: { leadId: string; reminderAt: string; reminderNote?: string }) => {
    const res = await axiosSales.put(`/api/v1/sales/set-reminder/${leadId}`, { reminderAt, reminderNote });
    return res.data;
  },
  onSuccess: (data) => {
    refetch();
    if (data?.lead) setSelectedLead(data.lead);
    setShowReminderBox(false);
  },
});

const mutationClearReminder = useMutation({
  mutationFn: async (leadId: string) => {
    const res = await axiosSales.put(`/api/v1/sales/clear-reminder/${leadId}`);
    return res.data;
  },
  onSuccess: (data) => {
    refetch();
    if (data?.lead) setSelectedLead(data.lead);
    setReminderDate("");
    setReminderTime("");
    setReminderNoteText("");
  },
});

const handleSetReminder = (e: React.FormEvent) => {
  e.preventDefault();
  if (!selectedLead || !reminderDate) return;
  const leadId = getLeadId(selectedLead);
  const isoDateTime = new Date(`${reminderDate}T${reminderTime || "09:00"}:00`).toISOString();
  mutationSetReminder.mutate({ leadId, reminderAt: isoDateTime, reminderNote: reminderNoteText.trim() });
};

  const isSending = mutationForEmail.isPending;

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
      refetch();
      if (data?.lead) {
        setSelectedLead(data.lead);
      }
      setNewNoteText("");
    },
  });

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead || !newNoteText.trim()) return;
    const leadId = getLeadId(selectedLead);
    mutationAddNote.mutate({ leadId, text: newNoteText.trim() });
  };

  // ✅ নতুন — Lead Score আপডেট মিউটেশন
  const mutationUpdateScore = useMutation({
    mutationFn: async ({ leadId, leadScore }: { leadId: string; leadScore: string }) => {
      const res = await axiosSales.patch(`/api/v1/sales/update-lead-details/${leadId}`, {
        leadScore,
      });
      return res.data;
    },
    onSuccess: (data) => {
      refetch();
      if (data?.lead) {
        setSelectedLead(data.lead);
      }
      setIsEditingScore(false);
    },
  });

  const handleSaveScore = () => {
    if (!selectedLead) return;
    const leadId = getLeadId(selectedLead);
    mutationUpdateScore.mutate({ leadId, leadScore: scoreValue });
  };

  // --- Loading / Error States ---
  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-white">
        <div className="w-5 h-5 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
        <span className="mt-3 text-xs tracking-wider text-slate-400 uppercase font-medium">
          Fetching active ledger...
        </span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 max-w-md mx-auto mt-20 border border-red-100 rounded-lg text-center bg-white">
        <p className="text-sm font-semibold text-red-600">Sync Failure</p>
        <p className="text-xs text-slate-400 mt-1">
          Unable to interface with core ledger pipeline.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {showNotiStatusUpdate && (
          <Notification
            type="success"
            title="Update Finalized"
            message="Lead operational status has synced cleanly."
            showIcon={true}
            duration={3000}
            onClose={() => setShowNotiStatusUpdate(false)}
          />
        )}
        {showNotiStatusUpdateEmail && (
          <Notification
            type="success"
            title="Dispatch Complete"
            message="Proposal outbound delivery verified."
            showIcon={true}
            duration={3000}
            onClose={() => setShowNotiStatusUpdateEmail(false)}
          />
        )}
        {showNotiStatusUpdateYo && (
          <Notification
            type="success"
            title="State Modified"
            message="Lead flagged safely under active proposal state."
            showIcon={true}
            duration={3000}
            onClose={() => setShowNotiStatusUpdateYo(false)}
          />
        )}
      </div>

      <div className="w-full bg-white px-6 py-10 lg:px-14 font-sans min-h-screen text-slate-900 antialiased">
        <div className="max-w-6xl mx-auto">
          {/* --- Minimalist Header --- */}
          <div className="mb-12 pb-6 border-b border-slate-100">
            <p className="text-[10px] tracking-widest text-slate-400 uppercase font-bold mb-1">
              Pipeline Distribution System
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              In-Progress Ledger
            </h1>
          </div>

          {/* --- Pure Grid Columns Layout --- */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* COLUMN 1: Action Required */}
            <div className="space-y-6">
              <div className="flex items-baseline justify-between border-b border-slate-100 pb-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Action Required
                </h2>
                <span className="text-xs font-mono font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200/60">
                  {needsProposal.length} outstanding
                </span>
              </div>

              <div className="space-y-3">
                {needsProposal.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl">
                    <p className="text-xs text-slate-400">
                      Pipeline empty. No actions pending.
                    </p>
                  </div>
                ) : (
                  needsProposal.map((lead) => (
                    <div
                      key={getLeadId(lead) || `${lead.leadName}-${lead.email || "no-email"}`}
                      onClick={() => openModal(lead)}
                      className="group bg-white border border-slate-200 hover:border-slate-400 rounded-xl p-5 transition-all duration-200 cursor-pointer shadow-xs hover:shadow-sm"
                    >
                      <div className="flex justify-between items-start gap-4 mb-1">
                        <h3 className="text-sm font-semibold text-slate-900 group-hover:text-slate-600 transition-colors">
                          {lead.leadName}
                        </h3>
                        <span className="text-[10px] font-mono font-bold text-amber-600 bg-amber-50 border border-amber-200/50 px-2 py-0.5 rounded-sm uppercase tracking-wide">
                          Score {lead.leadScore}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mb-4 font-medium">
                        {lead.title || "Executive"}{" "}
                        {lead.companyName && (
                          <span>
                            @{" "}
                            <span className="text-slate-800 font-semibold">
                              {lead.companyName}
                            </span>
                          </span>
                        )}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <svg className="w-3.5 h-3.5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                        </svg>
                        <span className="truncate tracking-tight">
                          {lead.email || "—"}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* COLUMN 2: Awaiting Response */}
            <div className="space-y-6">
              <div className="flex items-baseline justify-between border-b border-slate-100 pb-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Awaiting Response
                </h2>
                <span className="text-xs font-mono font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200/60">
                  {proposalSent.length} deployed
                </span>
              </div>

              <div className="space-y-3">
                {proposalSent.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl">
                    <p className="text-xs text-slate-400">
                      No proposals currently deployed on file.
                    </p>
                  </div>
                ) : (
                  proposalSent.map((lead) => (
                    <div
                      key={getLeadId(lead) || `${lead.leadName}-${lead.email || "no-email"}`}
                      onClick={() => openModal(lead)}
                      className="group bg-white border border-slate-200 hover:border-slate-400 rounded-xl p-5 transition-all duration-200 cursor-pointer shadow-xs"
                    >
                      <div className="flex justify-between items-start gap-4 mb-1">
                        <h3 className="text-sm font-semibold text-slate-900 group-hover:text-slate-600 transition-colors">
                          {lead.leadName}
                        </h3>
                        <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-sm uppercase tracking-wider">
                          Sent
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mb-4 font-medium">
                        {lead.title || "Executive"}{" "}
                        {lead.companyName && (
                          <span>
                            @{" "}
                            <span className="text-slate-800 font-semibold">
                              {lead.companyName}
                            </span>
                          </span>
                        )}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <svg className="w-3.5 h-3.5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                        </svg>
                        <span className="truncate tracking-tight">
                          {lead.email || "—"}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- MINIMALIST BACKDROP COMPONENT MODAL --- */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/10 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="absolute inset-0" onClick={closeModal}></div>

          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xl w-full max-w-2xl flex flex-col max-h-[85vh] relative z-10 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-start bg-white">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  {selectedLead.leadName}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {selectedLead.specificRole || selectedLead.title}{" "}
                  {selectedLead.companyName && `• ${selectedLead.companyName}`}
                </p>
              </div>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-900 p-1.5 rounded transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-white">
              {!isComposing ? (
                <div className="p-6 space-y-6">
                  {!selectedLead.proposalSent ? (
                    <div className="p-4 border border-slate-200 rounded-lg bg-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                          Document Missing
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          No proposal document configuration detected on file.
                        </p>
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto">
                        <button
                          onClick={handleMarkProposalSend}
                          className="flex-1 bg-white border border-slate-200 hover:border-slate-400 text-slate-700 px-3 py-1.5 rounded text-xs font-semibold transition-colors whitespace-nowrap"
                        >
                          Flag Sent Manually
                        </button>
                        <button
                          onClick={() => setIsComposing(true)}
                          className="flex-1 bg-slate-900 hover:bg-slate-800 text-white px-4 py-1.5 rounded text-xs font-semibold transition-colors whitespace-nowrap"
                        >
                          Draft Outbound
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 border border-slate-200 rounded-lg bg-slate-50 space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#99B562]"></span>
                        <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                          Proposal Asset Sent • Awaiting Client Action
                        </p>
                      </div>

                      <div className="flex gap-3 pt-2 border-t border-slate-200/60">
                        <button
                          onClick={() => handleQualificationResponse("Qualified")}
                          className={`flex-1 px-3 py-2 rounded text-xs font-semibold border transition-all ${
                            responseStatus === "Qualified"
                              ? "bg-[#99B562] border-[#99B562] text-white"
                              : "bg-white border-slate-200 hover:border-slate-400 text-slate-700"
                          }`}
                        >
                          Approve Qualification
                        </button>
                        <button
                          onClick={() => handleQualificationResponse("Unqualified")}
                          className={`flex-1 px-3 py-2 rounded text-xs font-semibold border transition-all ${
                            responseStatus === "Unqualified"
                              ? "bg-red-600 border-red-600 text-white"
                              : "bg-white border-slate-200 hover:border-slate-400 text-red-600"
                          }`}
                        >
                          Drop Lead Status
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Contact Ledger
                      </h3>
                      <div className="space-y-3 font-mono text-xs border border-slate-100 rounded-lg p-4">
                        <div>
                          <p className="text-slate-400 text-[10px] uppercase font-sans mb-0.5">Email</p>
                          <p className="text-slate-800">{selectedLead.email || "—"}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-[10px] uppercase font-sans mb-0.5">Phone</p>
                          <p className="text-slate-800">{selectedLead.phone || "—"}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-[10px] uppercase font-sans mb-0.5">Territory</p>
                          <p className="text-slate-800 font-sans">{selectedLead.region || "—"}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Internal Metadata
                      </h3>
                      <div className="space-y-3 text-xs border border-slate-100 rounded-lg p-4">
                        {/* ✅ Lead Score — এখন এডিটেবল */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-slate-400 text-[10px] uppercase font-bold">Lead Matrix Quality</p>
                            {!isEditingScore && (
                              <button
                                onClick={() => setIsEditingScore(true)}
                                className="text-[10px] font-bold text-[#6f8a3f] hover:text-[#4f6b2c]"
                              >
                                ✎ Edit
                              </button>
                            )}
                          </div>

                          {isEditingScore ? (
                            <div className="flex items-center gap-2">
                              <select
                                value={scoreValue}
                                onChange={(e) => setScoreValue(e.target.value)}
                                className="border border-slate-200 rounded px-2 py-1 text-xs bg-white focus:outline-none focus:border-[#99B562]"
                              >
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <option key={s} value={s}>Level {s}</option>
                                ))}
                              </select>
                              <button
                                onClick={handleSaveScore}
                                disabled={mutationUpdateScore.isPending}
                                className="px-2 py-1 rounded bg-[#99B562] text-white text-[10px] font-bold hover:bg-[#85a052] disabled:opacity-50"
                              >
                                {mutationUpdateScore.isPending ? "Saving..." : "Save"}
                              </button>
                              <button
                                onClick={() => {
                                  setIsEditingScore(false);
                                  setScoreValue(String(selectedLead.leadScore || 1));
                                }}
                                className="text-[10px] text-slate-400 hover:text-slate-700"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-0.5 text-[#99B562]">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <svg
                                  key={star}
                                  className={`w-3.5 h-3.5 ${star <= selectedLead.leadScore ? "fill-current" : "text-slate-200 fill-none"}`}
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                                </svg>
                              ))}
                            </div>
                          )}
                        </div>

                        <div>
                          <p className="text-slate-400 text-[10px] uppercase font-bold mb-0.5">Assigned Auditor</p>
                          <p className="text-slate-800 font-semibold">{selectedLead.owner}</p>
                        </div>
                      </div>
                    </div>
                  </div>


                  {/* ✅ Reminder Section */}
<div className="space-y-3 border-t border-slate-100 pt-4">
  <button type="button" onClick={() => setShowReminderBox((prev) => !prev)} className="w-full flex items-center justify-between">
    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
      🔔 Follow-up Reminder
      {selectedLead.reminderAt && (
        <span className="normal-case bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded text-[10px] font-semibold">
          {new Date(selectedLead.reminderAt).toLocaleDateString([], { day: "2-digit", month: "short" })} {new Date(selectedLead.reminderAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      )}
    </h3>
    <span className="text-slate-400 text-xs">{showReminderBox ? "▲" : "▼"}</span>
  </button>

  {showReminderBox && (
    <form onSubmit={handleSetReminder} className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Date *</label>
          <input type="date" required value={reminderDate} onChange={(e) => setReminderDate(e.target.value)} className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs focus:outline-none focus:border-[#99B562]" />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Time (optional)</label>
          <input type="time" value={reminderTime} onChange={(e) => setReminderTime(e.target.value)} className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs focus:outline-none focus:border-[#99B562]" />
        </div>
      </div>
      <div>
        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Note (optional)</label>
        <input type="text" value={reminderNoteText} onChange={(e) => setReminderNoteText(e.target.value)} placeholder="e.g. Discuss pricing again" className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs focus:outline-none focus:border-[#99B562]" />
      </div>
      <div className="flex justify-end gap-2">
        {selectedLead.reminderAt && (
          <button type="button" onClick={() => mutationClearReminder.mutate(getLeadId(selectedLead))} disabled={mutationClearReminder.isPending} className="px-3 py-1.5 rounded border border-red-200 text-red-600 text-xs font-bold hover:bg-red-50 disabled:opacity-50">
            Clear
          </button>
        )}
        <button type="submit" disabled={mutationSetReminder.isPending || !reminderDate} className="px-4 py-1.5 rounded bg-[#99B562] text-white text-xs font-bold hover:bg-[#85a052] disabled:opacity-40">
          {mutationSetReminder.isPending ? "Saving..." : "Set Follow-up"}
        </button>
      </div>
    </form>
  )}
</div>

                  {/* ✅ নতুন — Follow-up Note History সেকশন */}
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => setShowNoteHistory((prev) => !prev)}
                      className="w-full flex items-center justify-between border-b border-slate-100 pb-2"
                    >
                      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Follow-up History{" "}
                        {selectedLead.indicationsHistory?.length ? `(${selectedLead.indicationsHistory.length})` : ""}
                      </h3>
                      <span className="text-slate-400 text-xs">{showNoteHistory ? "▲" : "▼"}</span>
                    </button>

                    {showNoteHistory && (
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {!selectedLead.indicationsHistory || selectedLead.indicationsHistory.length === 0 ? (
                          <p className="text-xs text-slate-400 italic py-2">
                            No follow-up notes added yet. {selectedLead.indications && `Previous note: "${selectedLead.indications}"`}
                          </p>
                        ) : (
                          [...selectedLead.indicationsHistory]
                            .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
                            .map((entry, idx) => (
                              <div key={entry._id || idx} className="bg-slate-50 border border-slate-100 rounded-lg p-3">
                                <p className="text-xs text-slate-800">{entry.text}</p>
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
                        placeholder="Write a follow-up note..."
                        className="flex-1 px-3 py-2 border border-slate-200 rounded text-xs text-slate-800 focus:outline-none focus:border-[#99B562] resize-none transition-colors"
                      />
                      <button
                        type="submit"
                        disabled={mutationAddNote.isPending || !newNoteText.trim()}
                        className="px-3 py-2 rounded bg-[#99B562] text-white text-[11px] font-bold hover:bg-[#85a052] disabled:opacity-40 whitespace-nowrap transition-colors"
                      >
                        {mutationAddNote.isPending ? "..." : "+ Add Note"}
                      </button>
                    </form>
                  </div>
                </div>
              ) : (
                <div className="p-6 space-y-4 border-t border-slate-100">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Outbound Destination</label>
                        <input
                          type="text"
                          disabled
                          value={selectedLead.email || ""}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-500 rounded px-3 py-1.5 text-xs font-mono cursor-not-allowed focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Subject Header</label>
                        <input
                          type="text"
                          value={emailSubject}
                          onChange={(e) => setEmailSubject(e.target.value)}
                          className="w-full bg-white border border-slate-200 text-slate-800 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-slate-900 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Proposal URI Resource Path</label>
                        <input
                          type="url"
                          value={proposalLink}
                          onChange={(e) => setProposalLink(e.target.value)}
                          placeholder="https://secure.ledger.path/asset"
                          className="w-full bg-white border border-slate-200 text-slate-800 rounded px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-slate-900 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Outbound Payload Message Body</label>
                        <textarea
                          rows={5}
                          value={emailBody}
                          onChange={(e) => setEmailBody(e.target.value)}
                          className="w-full bg-white border border-slate-200 text-slate-800 rounded px-3 py-2 text-xs focus:outline-none focus:border-slate-900 transition-all resize-none font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                    <button
                      onClick={() => setIsComposing(false)}
                      disabled={isSending}
                      className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors disabled:opacity-50"
                    >
                      Revert Back
                    </button>
                    <button
                      onClick={handleSendProposal}
                      disabled={isSending || !selectedLead.email}
                      className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded tracking-tight disabled:opacity-50 flex items-center gap-2 transition-colors"
                    >
                      {isSending ? (
                        <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        "Dispatch Pipeline Send"
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- PREMIUM SUB-MODAL DEEP LINK ATTACHMENT --- */}
      {selectedLead && pendingQualification && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-xs animate-in fade-in duration-100">
          <div
            className="absolute inset-0"
            onClick={() => {
              setPendingQualification(null);
              setDealDocLink("");
              setDealPrice("");
            }}
          ></div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl w-full max-w-md relative z-10 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Resource Registry Insertion
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Link absolute transaction documentation and price prior to switching status to{" "}
                <span className="font-bold text-slate-900">
                  {pendingQualification}
                </span>.
              </p>
            </div>

            {/* Inputs Container */}
            <div className="p-5 space-y-4">
              {/* URL Input */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                  Deal Document URI
                </label>
                <input
                  type="url"
                  required
                  value={dealDocLink}
                  onChange={(e) => setDealDocLink(e.target.value)}
                  placeholder="https://resource.cloud/doc-id"
                  className="w-full bg-white border border-slate-200 text-slate-900 rounded px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-slate-900 transition-all"
                />
              </div>

              {/* Deal Price Input */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                  Deal Price ($)
                </label>
                <input
                  type="number"
                  required
                  value={dealPrice}
                  onChange={(e) => setDealPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-white border border-slate-200 text-slate-900 rounded px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-slate-900 transition-all"
                />
              </div>
            </div>

            <div className="px-5 py-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => {
                  setPendingQualification(null);
                  setDealDocLink("");
                  setDealPrice("");
                }}
                className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
              >
                Abort
              </button>
              <button
                onClick={handleSubmitQualification}
                disabled={
                  !dealDocLink.trim() ||
                  !dealPrice.trim() ||
                  MutationUpForStatusUpdate.isPending
                }
                className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded disabled:opacity-40 transition-colors"
              >
                {MutationUpForStatusUpdate.isPending ? "Syncing..." : "Commit Change"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}