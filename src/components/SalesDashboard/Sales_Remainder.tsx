import useAxiosSales from '@/uri/useAxiosSales';

import  {  useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Notification from '../ui/toast';
import { useUserData } from './Sales_Hook/User_Data';

// --- 1. Your Lead Data Interface ---
export interface LeadData {
  id: string;
  _id?: string;
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

export default function Sales_Remainder() {
  const [showNotiStatusUpdate, setShowNotiStatusUpdate] = useState(false);

  const axiosSales = useAxiosSales();
  const {userData} = useUserData()


  const {
    data: reminderLeads = [],
    isLoading: isReminderLoading,
    isError: isReminderError,
  } = useQuery<LeadData[]>({
    queryKey: ["rem", userData?._id],
    enabled: Boolean(userData?._id),
    queryFn : async() => {
      const res = await axiosSales.get(`/api/v1/sales/rem/${userData?._id}`);
      return res.data.data;
    }
  });


  // --- Console Log Function ---
  const getLeadId = (lead: LeadData) => lead._id || lead.id;

  const handleFollowUpClick = (lead: LeadData) => {
    const leadId = getLeadId(lead);
    if (lead.email) {
      console.log(`Follow-up initiated for: ${lead.leadName} | Email: ${lead.email} | Lead ID: ${leadId}`);
    } else {
      console.log(`Follow-up initiated for: ${lead.leadName} | No email on file. | Lead ID: ${leadId}`);
    }
  };

  const handleMarkAsFollowedUp = (lead: LeadData) => {
    const leadId = getLeadId(lead);
    // console.log(`Marked as followed up | Lead ID: ${leadId} | Lead Name: ${lead.leadName}`);
    mutationMark.mutate({ leadId });
  };

  const queryClient = useQueryClient();
  const mutationMark = useMutation({
    mutationFn: async ({ leadId }: { leadId: string }) => {
      const res = await axiosSales.put(`/api/v1/sales/update-at-time/${leadId}`);
      return res.data;
    },
    onSuccess: ()=>{
      queryClient.invalidateQueries({ queryKey: ["rem"] });
      setShowNotiStatusUpdate(true);
    }
  })

  if (isReminderLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600 font-medium">Loading reminders...</span>
      </div>
    );
  }

  if (isReminderError) {
    return (
      <div className="p-6 mt-10 max-w-lg mx-auto bg-red-50 border border-red-200 rounded-lg text-center text-red-600">
        <p className="font-semibold">Error fetching reminder leads.</p>
        <p className="text-sm mt-1">Please check your connection and try again.</p>
      </div>
    );
  }

  return (
    <>
    <div className="fixed top-4 right-4 z-50">
            {showNotiStatusUpdate && (
              <Notification
                type="success"
                title="Marked as Followed Up!"
                message="This lead has been marked as followed up successfully."
                showIcon={true}
                duration={3000}
                onClose={() => {
                  setShowNotiStatusUpdate(false);
                }}
              />
            )}
            {/* {showNotiStatusUpdateYo && (
              <Notification
                type="success"
                title="Proposal Sent!"
                message="Proposal has been sent to the lead successfully."
                showIcon={true}
                duration={3000}
                onClose={() => {
                  setShowNotiStatusUpdateYo(false);
                }}
              />
            )}
             */}
          </div>
    <div className="poppins-regular w-full bg-slate-50 p-4 sm:p-6 lg:p-10 font-sans min-h-screen text-slate-900">
      <div className="max-w-4xl mx-auto">
        
        {/* --- Header Section --- */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
            <span className="text-amber-600 text-xs font-bold uppercase tracking-widest">Action Required</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Follow-Up Reminders</h1>
          <p className="text-sm text-slate-500 mt-1">
            Proposals have been sent to these leads, but they are awaiting a follow-up response.
          </p>
        </div>

        {/* --- List Section --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          
          {/* List Header */}
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex justify-between items-center">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              Pending Responses
            </h2>
            <span className="bg-white text-slate-600 text-xs font-bold px-3 py-1 rounded-full border border-slate-200 shadow-sm">
              {reminderLeads.length} Leads
            </span>
          </div>

          {/* List Body */}
          <div className="divide-y divide-slate-100">
            {reminderLeads.length === 0 ? (
              <div className="text-center p-12">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <p className="text-slate-500 font-medium">No pending follow-ups right now!</p>
              </div>
            ) : (
              reminderLeads.map((lead) => (
                <div key={lead.id} className="p-6 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-6 group">
                  
                  {/* Left Side: Lead Info */}
                  <div className="flex items-start gap-4">
                    {/* Avatar Profile */}
                    <div className="w-12 h-12 rounded-full bg-[#99B562]/10 text-[#7a914e] border border-[#99B562]/20 flex items-center justify-center font-bold text-lg shrink-0">
                      {lead.leadName.charAt(0)}
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#99B562] transition-colors">
                          {lead.leadName}
                        </h3>
                        <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                          Needs Follow-Up
                        </span>
                      </div>
                      
                      <p className="text-sm font-medium text-slate-500 mb-2">
                        {lead.title || 'No Title'} {lead.companyName && <span>at <span className="text-slate-800">{lead.companyName}</span></span>}
                      </p>
                      
                      {/* Contact Badges */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1 rounded-md shadow-sm">
                          <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                          <span className="font-medium">{lead.email || 'No email'}</span>
                        </div>
                        {lead.phone && (
                          <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1 rounded-md shadow-sm">
                            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                            <span className="font-medium">{lead.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Action Buttons */}
                  <div className="shrink-0 flex sm:flex-col items-center justify-end gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                    <button 
                      onClick={() => handleFollowUpClick(lead)}
                      className="w-full sm:w-auto bg-[#99B562] hover:bg-[#85a052] text-white font-bold py-2.5 px-5 rounded-lg transition-all shadow-sm flex items-center justify-center gap-2 active:scale-95"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                      Send Follow-Up
                    </button>

                    <button
                      onClick={() => handleMarkAsFollowedUp(lead)}
                      className="w-full sm:w-auto bg-white hover:bg-slate-100 text-slate-700 font-bold py-2.5 px-5 rounded-lg transition-all border border-slate-300 shadow-sm flex items-center justify-center gap-2 active:scale-95"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                      Mark as Followed Up
                    </button>
                  </div>

                </div>
              ))
            )}
          </div>
        </div>
        
      </div>
    </div>
    </>
  );
}