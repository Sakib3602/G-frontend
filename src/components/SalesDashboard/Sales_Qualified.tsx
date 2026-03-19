import React, { useState } from 'react';

// --- 1. Your Lead Data Interface ---
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
const qualifiedMockData: LeadData[] = [
  {
    id: '1',
    leadName: 'Sarah Jenkins',
    owner: 'Sakib Sarkar',
    status: 'Qualified',
    companyName: 'CloudSync',
    title: 'VP of Operations',
    email: 'sarah@cloudsync.io',
    phone: '+1 555-0199',
    leadScore: 5,
    region: 'US',
    leadCreatedBy: 'user_992',
    proposalSent: true,
  },
  {
    id: '2',
    leadName: 'Marcus Chen',
    owner: 'Sakib Sarkar',
    status: 'Qualified',
    companyName: 'Apex Financial',
    title: 'Director',
    specificRole: 'Procurement Director',
    email: 'm.chen@apexfin.com',
    leadScore: 4,
    region: 'APAC',
    leadCreatedBy: 'user_992',
    proposalSent: true,
  },
  {
    id: '3',
    leadName: 'Elena Rodriguez',
    owner: 'Sakib Sarkar',
    status: 'Qualified',
    companyName: 'Stellar Tech',
    title: 'CEO / Founder',
    email: 'elena@stellar.tech',
    phone: '+44 20 7123 4567',
    leadScore: 5,
    region: 'EMEA',
    leadCreatedBy: 'user_992',
    proposalSent: true,
  }
];

export default function Sales_Qualified() {
  const [wonLeads] = useState<LeadData[]>(qualifiedMockData);

  // --- CRM UI Metrics ---
  const totalWon = wonLeads.length;

  return (
    <div className="w-full bg-slate-50 p-4 sm:p-6 lg:p-10 font-sans min-h-screen text-slate-900">
      <div className="max-w-7xl mx-auto">
        
        {/* --- Header Section --- */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-[#99B562]/10 text-[#7a914e] text-xs font-bold px-2.5 py-1 rounded border border-[#99B562]/20 uppercase tracking-wider flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path></svg>
                Closed Won
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Qualified Deals</h1>
            <p className="text-sm text-slate-500 mt-1">
              Successfully converted leads that are now active accounts.
            </p>
          </div>
        </div>

        {/* --- Success Metrics Dashboard --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute right-0 top-0 w-24 h-24 bg-[#99B562]/5 rounded-bl-full -z-0"></div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1 relative z-10">Total Won</p>
            <p className="text-4xl font-black text-slate-900 relative z-10">{totalWon}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden hidden sm:block">
            <div className="absolute right-0 top-0 w-24 h-24 bg-[#99B562]/5 rounded-bl-full -z-0"></div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1 relative z-10">Recent Activity</p>
            <p className="text-lg font-bold text-slate-800 relative z-10 mt-2 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#99B562]"></span>
              {wonLeads[0]?.companyName || wonLeads[0]?.leadName || 'No recent deals'} closed
            </p>
          </div>
        </div>

        {/* --- Won Deals Grid --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wonLeads.length === 0 ? (
            <div className="col-span-full text-center p-16 bg-white border border-dashed border-slate-300 rounded-2xl">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900">No qualified deals yet</h3>
              <p className="text-slate-500 mt-1">Keep pushing! Your successfully closed accounts will appear here.</p>
            </div>
          ) : (
            wonLeads.map((deal) => (
              <div key={deal.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-[#99B562]/40 transition-all group flex flex-col h-full overflow-hidden">
                
                {/* Card Top: Company / Account Info */}
                <div className="p-6 border-b border-slate-100 bg-gradient-to-b from-slate-50/50 to-white">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-xl bg-[#99B562] text-white flex items-center justify-center font-bold text-xl shadow-sm">
                      {deal.companyName ? deal.companyName.charAt(0) : deal.leadName.charAt(0)}
                    </div>
                    <span className="bg-[#99B562]/10 text-[#7a914e] text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                      Qualified
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-900 leading-tight group-hover:text-[#99B562] transition-colors">
                    {deal.companyName || 'Individual Account'}
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className={`w-3.5 h-3.5 ${i < deal.leadScore ? 'text-[#99B562]' : 'text-slate-200'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                      ))}
                    </div>
                    <span className="text-xs text-slate-400 font-medium">• {deal.region || 'Global'}</span>
                  </div>
                </div>

                {/* Card Bottom: Primary Contact */}
                <div className="p-6 flex-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Primary Contact</p>
                  <p className="text-base font-bold text-slate-800">{deal.leadName}</p>
                  <p className="text-sm text-slate-500 mb-4">{deal.title || 'Decision Maker'}</p>

                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                      <span className="truncate">{deal.email || 'No email'}</span>
                    </div>
                    {deal.phone && (
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                        <span>{deal.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            ))
          )}
        </div>
        
      </div>
    </div>
  );
}