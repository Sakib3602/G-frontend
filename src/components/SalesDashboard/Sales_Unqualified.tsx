import React from 'react';
import { useUserData } from './Sales_Hook/User_Data';
import { useQuery } from '@tanstack/react-query';
import useAxiosSales from '@/uri/useAxiosSales';

export interface LeadData {
  id?: string;
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

export default function Sales_Unqualified() {
  const axiosSales = useAxiosSales();
  const { userData } = useUserData();

  // --- Fetch Unqualified Leads ---
  const { data: lostLeads = [], isLoading, isError } = useQuery<LeadData[]>({
    queryKey: ["unqualified-leads-sales", userData?._id],
    enabled: Boolean(userData?._id),
    queryFn: async () => {
      // Adjusted the endpoint to fetch unqualified leads
      const res = await axiosSales.get(`/api/v1/sales/get-unqualified-leads/${userData?._id}`);
      return res.data.leads as LeadData[];
    }
  });

  console.log("Unqualified Leads from API:", lostLeads);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600"></div>
        <span className="ml-3 text-slate-600 font-medium">Loading archived leads...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 mt-10 max-w-lg mx-auto bg-rose-50 border border-rose-200 rounded-lg text-center text-rose-600">
        <p className="font-semibold">Error fetching unqualified leads.</p>
        <p className="text-sm mt-1">Please check your connection and try again.</p>
      </div>
    );
  }

  const totalLost = lostLeads.length;

  return (
    <div className="w-full bg-slate-50 p-4 sm:p-6 lg:p-10 font-sans min-h-screen text-slate-900">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* --- Header Section --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2.5 py-1 rounded border border-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>
                Archive
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Unqualified Deals</h1>
            <p className="text-sm text-slate-500 mt-1">
              Leads that did not convert or were disqualified. Retained for historical reference.
            </p>
          </div>
        </div>

        {/* --- Archive Metrics --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Total Archived</p>
              <p className="text-4xl font-black text-slate-900">{totalLost}</p>
            </div>
            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Status</p>
              <p className="text-lg font-bold text-slate-800 mt-2">Inactive Pipeline</p>
            </div>
            <div className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center text-rose-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path></svg>
            </div>
          </div>
        </div>

        {/* --- Unqualified Leads List View --- */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/80 flex justify-between items-center">
            <h3 className="font-bold text-slate-700">Archived Records</h3>
          </div>

          <div className="divide-y divide-slate-100">
            {lostLeads.length === 0 ? (
              <div className="text-center p-16">
                <div className="w-16 h-16 bg-slate-50 border border-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900">No unqualified leads</h3>
                <p className="text-slate-500 mt-1">Your archive is currently empty.</p>
              </div>
            ) : (
              lostLeads.map((lead) => (
                <div 
                  key={lead._id || lead.id || lead.email} 
                  className="p-5 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-6 group opacity-90 hover:opacity-100"
                >
                  
                  {/* Left: Lead Identity */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 border border-slate-200 flex items-center justify-center font-bold text-lg shrink-0 grayscale">
                      {lead.leadName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-slate-700 line-through decoration-slate-300">
                          {lead.leadName}
                        </h3>
                        <span className="bg-rose-50 text-rose-600 text-[10px] font-bold px-2 py-0.5 rounded-md border border-rose-100 uppercase tracking-wide">
                          Unqualified
                        </span>
                      </div>
                      <p className="text-sm font-medium text-slate-500">
                        {lead.title || 'No Title'} {lead.companyName && <span>at <span className="text-slate-600">{lead.companyName}</span></span>}
                      </p>
                    </div>
                  </div>

                  {/* Middle: Contact Info (Muted) */}
                  <div className="flex flex-col gap-1.5 text-sm text-slate-400 md:w-64">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                      <span className="truncate">{lead.email || 'No email provided'}</span>
                    </div>
                    {lead.phone && (
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                        <span>{lead.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Right: Score & Actions */}
                  <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto mt-2 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Final Score</p>
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-slate-600">{lead.leadScore}</span>
                        <span className="text-slate-300">/5</span>
                      </div>
                    </div>
                    
                    
                  </div>

                </div>
              ))
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
}