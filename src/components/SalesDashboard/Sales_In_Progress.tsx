import React, { useState } from 'react';

// --- 1. Interface ---
export interface LeadData {
  id: string;
  leadName: string;
  owner: string;
  status: string;
  indications?: string;
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
}

// --- 2. Mock Data ---
const initialLeads: LeadData[] = [
  {
    id: '1',
    leadName: 'David Johnson',
    owner: 'Sakib Sarkar',
    status: 'In Progress',
    companyName: 'Nita Tech',
    title: 'Manager',
    specificRole: 'Senior Design Manager',
    email: 'david@nitatech.com',
    phone: '+1 555-0101',
    leadScore: 2,
    region: 'US',
    linkedin: 'linkedin.com/in/davidj',
    leadCreatedBy: 'user_992',
    proposalSent: false,
  },
  {
    id: '2',
    leadName: 'Emma Watson',
    owner: 'Sakib Sarkar',
    status: 'In Progress',
    indications: 'High Priority',
    companyName: 'CloudSync',
    title: 'VP',
    email: 'emma@cloudsync.io',
    leadScore: 4,
    leadCreatedBy: 'user_992',
    proposalSent: false,
  },
  {
    id: '3',
    leadName: 'Liam Smith',
    owner: 'Sakib Sarkar',
    status: 'In Progress',
    companyName: 'Moon',
    title: 'Director',
    specificRole: 'Sales Director',
    email: 'liam@moon.com',
    phone: '+1 555-0100',
    leadScore: 5,
    region: 'ANZ',
    profileUrl: 'moon.com/team/liam',
    leadCreatedBy: 'user_992',
    proposalSent: true,
  },
  {
    id: '4',
    leadName: 'Donna Sege',
    owner: 'Sakib Sarkar',
    status: 'In Progress',
    companyName: 'Solutions Craft',
    title: 'Team Member',
    email: 'donna@solutionscraft.com',
    leadScore: 1,
    leadCreatedBy: 'user_992',
    proposalSent: true,
  }
];

export default function Sales_In_Progress() {
  const [leads, setLeads] = useState<LeadData[]>(initialLeads);
  
  // Modal State
  const [selectedLead, setSelectedLead] = useState<LeadData | null>(null);
  const [isComposing, setIsComposing] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Email Form State
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");

  // Split leads
  const needsProposal = leads.filter(lead => !lead.proposalSent);
  const proposalSent = leads.filter(lead => lead.proposalSent);

  // Open Modal Handler
  const openModal = (lead: LeadData) => {
    setSelectedLead(lead);
    setIsComposing(false);
    setEmailSubject(`Proposal for ${lead.companyName || lead.leadName}`);
    setEmailBody(`Hi ${lead.leadName.split(' ')[0]},\n\nFollowing up on our recent conversation...`);
  };

  // Close Modal Handler
  const closeModal = () => {
    setSelectedLead(null);
    setIsComposing(false);
  };

  // Handle Send Proposal
  const handleSendProposal = () => {
    if (!selectedLead) return;
    setIsSending(true);

    // Simulate API delay
    setTimeout(() => {
      setLeads(prevLeads => 
        prevLeads.map(l => l.id === selectedLead.id ? { ...l, proposalSent: true } : l)
      );
      setIsSending(false);
      closeModal();
    }, 1200);
  };

  return (
    <div className="w-full bg-slate-50 p-4 sm:p-6 lg:p-10 font-sans min-h-screen relative text-slate-900">
      <div className="max-w-7xl mx-auto">
        
        {/* --- Header --- */}
        <div className="mb-10 flex flex-col sm:flex-row justify-between sm:items-end gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#99B562] animate-pulse"></span>
              <span className="text-[#99B562] text-xs font-bold uppercase tracking-widest">Active Pipeline</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">In Progress Leads</h1>
            <p className="text-sm text-slate-500 mt-1">Manage ongoing negotiations and send outstanding proposals.</p>
          </div>
        </div>

        {/* --- Two Column Layout --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          
          {/* COLUMN 1: Needs Proposal */}
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-4 px-1">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                Action Required
                <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  {needsProposal.length}
                </span>
              </h2>
            </div>

            <div className="bg-slate-100/50 rounded-2xl p-4 border border-slate-200/60 flex-1 space-y-4">
              {needsProposal.length === 0 ? (
                <div className="text-center p-10 border-2 border-dashed border-slate-300 rounded-xl">
                  <p className="text-sm text-slate-500 font-medium">All caught up! No pending proposals.</p>
                </div>
              ) : (
                needsProposal.map(lead => (
                  <div 
                    key={lead.id} 
                    onClick={() => openModal(lead)}
                    className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 hover:border-[#99B562]/50 hover:shadow-md transition-all relative overflow-hidden group cursor-pointer"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400 group-hover:bg-[#99B562] transition-colors"></div>
                    <div className="pl-2">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="text-[17px] font-bold text-slate-900 leading-tight group-hover:text-[#99B562] transition-colors">{lead.leadName}</h3>
                        <div className="bg-slate-50 text-slate-600 text-[11px] font-bold px-2 py-1 rounded border border-slate-200">
                          Score: {lead.leadScore}
                        </div>
                      </div>
                      <p className="text-sm font-medium text-slate-500 mb-4">
                        {lead.title || 'No Title'} {lead.companyName && <span>at <span className="text-slate-800">{lead.companyName}</span></span>}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                        <span className="truncate">{lead.email || 'No email'}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* COLUMN 2: Proposal Sent */}
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-4 px-1">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                Awaiting Response
                <span className="bg-[#99B562]/10 text-[#7a914e] text-xs font-bold px-2 py-0.5 rounded-full border border-[#99B562]/20">
                  {proposalSent.length}
                </span>
              </h2>
            </div>

            <div className="bg-slate-100/50 rounded-2xl p-4 border border-slate-200/60 flex-1 space-y-4">
              {proposalSent.length === 0 ? (
                <div className="text-center p-10 border-2 border-dashed border-slate-300 rounded-xl">
                  <p className="text-sm text-slate-500 font-medium">No proposals sent yet.</p>
                </div>
              ) : (
                proposalSent.map(lead => (
                  <div 
                    key={lead.id} 
                    onClick={() => openModal(lead)}
                    className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 hover:border-[#99B562]/50 hover:shadow-md transition-all relative overflow-hidden group cursor-pointer"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#99B562]"></div>
                    <div className="pl-2">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="text-[17px] font-bold text-slate-900 leading-tight group-hover:text-[#99B562] transition-colors">{lead.leadName}</h3>
                        <div className="bg-[#99B562]/10 text-[#7a914e] text-xs font-bold px-2 py-1 rounded border border-[#99B562]/20 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                          Sent
                        </div>
                      </div>
                      <p className="text-sm font-medium text-slate-500 mb-4">
                        {lead.title || 'No Title'} {lead.companyName && <span>at <span className="text-slate-800">{lead.companyName}</span></span>}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                        <span className="truncate">{lead.email || 'No email'}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>

      {/* --- PREMIUM MODAL POPUP --- */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={closeModal}></div>
          
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh] relative z-10 overflow-hidden border border-slate-200">
            
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-start bg-white">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 border border-slate-200 flex items-center justify-center font-bold text-xl shadow-sm">
                  {selectedLead.leadName.charAt(0)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 leading-none mb-1">{selectedLead.leadName}</h2>
                  <p className="text-sm text-slate-500 font-medium">
                    {selectedLead.specificRole || selectedLead.title} {selectedLead.companyName && `• ${selectedLead.companyName}`}
                  </p>
                </div>
              </div>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-2 rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            {/* Modal Body: Transitions between Details and Composer */}
            <div className="flex-1 overflow-y-auto bg-slate-50/50">
              
              {!isComposing ? (
                /* --- VIEW: LEAD DETAILS --- */
                <div className="p-6 sm:p-8">
                  {/* Status Banner */}
                  {!selectedLead.proposalSent ? (
                    <div className="mb-8 bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <h4 className="text-sm font-bold text-amber-800 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                          Proposal Pending
                        </h4>
                        <p className="text-xs text-amber-700 mt-1">This lead is currently waiting for a formal proposal document.</p>
                      </div>
                      <button 
                        onClick={() => setIsComposing(true)}
                        className="bg-[#99B562] hover:bg-[#85a052] text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-colors whitespace-nowrap flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                        Draft Proposal
                      </button>
                    </div>
                  ) : (
                    <div className="mb-8 bg-[#99B562]/10 border border-[#99B562]/20 rounded-xl p-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#99B562] text-white flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#7a914e]">Proposal Sent Successfully</h4>
                        <p className="text-xs text-[#99B562] mt-0.5">Awaiting response from the client.</p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column: Contact Data */}
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Contact Details</h3>
                        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4 shadow-sm">
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Email Address</p>
                            <p className="text-sm font-medium text-slate-900">{selectedLead.email || '—'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Phone Number</p>
                            <p className="text-sm font-medium text-slate-900">{selectedLead.phone || '—'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Region</p>
                            <p className="text-sm font-medium text-slate-900">{selectedLead.region || '—'}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: CRM Data */}
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Lead Insights</h3>
                        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4 shadow-sm">
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Lead Score</p>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map(star => (
                                <svg key={star} className={`w-4 h-4 ${star <= selectedLead.leadScore ? 'text-[#99B562]' : 'text-slate-200'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Indications</p>
                            <p className="text-sm font-medium text-slate-900">{selectedLead.indications || 'None recorded'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Assigned Owner</p>
                            <p className="text-sm font-medium text-slate-900 flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px] font-bold">{selectedLead.owner.charAt(0)}</span>
                              {selectedLead.owner}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* --- VIEW: EMAIL COMPOSER --- */
                <div className="p-6 sm:p-8 animate-in slide-in-from-bottom-4 duration-300">
                  <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    {/* Composer Header */}
                    <div className="bg-slate-50 px-5 py-3 border-b border-slate-200">
                      <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                        Compose Proposal Email
                      </h3>
                    </div>
                    
                    {/* Composer Form */}
                    <div className="p-5 space-y-4">
                      {/* To Field */}
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">To</label>
                        <input 
                          type="text" 
                          disabled 
                          value={selectedLead.email || 'No email provided'} 
                          className="w-full bg-slate-50 border border-slate-200 text-slate-600 rounded-lg px-3 py-2 text-sm cursor-not-allowed"
                        />
                      </div>
                      
                      {/* Subject Field */}
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Subject</label>
                        <input 
                          type="text" 
                          value={emailSubject}
                          onChange={(e) => setEmailSubject(e.target.value)}
                          className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#99B562] focus:ring-2 focus:ring-[#99B562]/20 transition-all"
                        />
                      </div>

                      {/* Body Textarea */}
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Message</label>
                        <textarea 
                          rows={8}
                          value={emailBody}
                          onChange={(e) => setEmailBody(e.target.value)}
                          className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg px-3 py-3 text-sm focus:outline-none focus:border-[#99B562] focus:ring-2 focus:ring-[#99B562]/20 transition-all resize-none"
                        ></textarea>
                      </div>
                    </div>

                    {/* Composer Actions */}
                    <div className="bg-slate-50 px-5 py-4 border-t border-slate-200 flex justify-end gap-3">
                      <button 
                        onClick={() => setIsComposing(false)}
                        disabled={isSending}
                        className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleSendProposal}
                        disabled={isSending || !selectedLead.email}
                        className="px-5 py-2 text-sm font-bold text-white bg-[#99B562] hover:bg-[#85a052] rounded-lg shadow-sm transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isSending ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Sending...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                            Send Proposal
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
}