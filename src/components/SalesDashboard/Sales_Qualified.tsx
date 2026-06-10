import { useUserData } from './Sales_Hook/User_Data';
import { useQuery } from '@tanstack/react-query';
import useAxiosSales from '@/uri/useAxiosSales';
import { useState } from 'react';

// --- 1. Your Lead Data Interface ---
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

export default function Sales_Qualified() {
  const axiosSales = useAxiosSales();
  const { userData } = useUserData();
  const [monthFilter, setMonthFilter] = useState<'thisMonth' | 'lastMonth'>('thisMonth');

  const { data: wonLeads = [], isLoading, isError } = useQuery<LeadData[]>({
    queryKey: ["qualified-leads-sales", userData?._id],
    enabled: Boolean(userData?._id),
    queryFn: async () => {
      const res = await axiosSales.get(`/api/v1/sales/get-qualified-leads/${userData?._id}`);
      return res.data.leads as LeadData[];
    }
  });

  const currentDate = new Date();
  const thisMonthIndex = currentDate.getMonth();
  const thisYear = currentDate.getFullYear();
  const lastMonthDate = new Date(thisYear, thisMonthIndex - 1, 1);
  const lastMonthIndex = lastMonthDate.getMonth();
  const lastMonthYear = lastMonthDate.getFullYear();

  const isDateInMonth = (value: string | undefined, year: number, month: number) => {
    if (!value) return false;
    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) return false;
    return parsedDate.getFullYear() === year && parsedDate.getMonth() === month;
  };

  const thisMonthWonLeads = wonLeads.filter((lead) => isDateInMonth((lead as any)?.updatedAt, thisYear, thisMonthIndex));
  const lastMonthWonLeads = wonLeads.filter((lead) => isDateInMonth((lead as any)?.updatedAt, lastMonthYear, lastMonthIndex));

  const visibleWonLeads = monthFilter === 'thisMonth' ? thisMonthWonLeads : lastMonthWonLeads;

  const getMonthLabel = (filter: 'thisMonth' | 'lastMonth') => {
    if (filter === 'thisMonth') {
      return currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    }
    return lastMonthDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  };

  // --- UI States ---
  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-[#f8fafc]">
        <div className="w-6 h-6 border-2 border-slate-200 border-t-[#99B562] rounded-full animate-spin"></div>
        <span className="mt-3 text-xs tracking-widest text-slate-500 uppercase font-medium">Syncing Records...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 max-w-md mx-auto mt-20 border border-red-200 rounded-lg text-center bg-red-50">
        <p className="text-base font-bold text-red-700">Retrieval Error</p>
        <p className="text-sm text-red-600 mt-1">Unable to connect to the qualified pipeline ledger.</p>
      </div>
    );
  }

  // --- CRM UI Metrics ---
  const totalWon = wonLeads.length;

  return (
    <div className="w-full bg-[#f8fafc] px-6 py-10 lg:px-14 font-sans min-h-screen text-slate-900 antialiased">
      <div className="max-w-[1200px] mx-auto">
        
        {/* --- Header Section --- */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-[#99B562]/10 text-[#7a914e] text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                Closed Won Pipeline
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Qualified Deals</h1>
            <p className="text-sm text-slate-500 mt-1">
              Successfully converted leads transitioning into active accounts.
            </p>
          </div>
        </div>

        {/* --- Success Metrics Dashboard --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Historic Won</p>
            <p className="text-3xl font-bold text-slate-900">{totalWon}</p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-[#99B562]/40 shadow-sm flex flex-col justify-center relative overflow-hidden hidden sm:flex">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#99B562]"></div>
            <div className="pl-3">
              <p className="text-[10px] font-bold text-[#7a914e] uppercase tracking-widest mb-1">Won This Month</p>
              <p className="text-3xl font-bold text-slate-900">{thisMonthWonLeads.length}</p>
            </div>
          </div>
        </div>

        {/* --- Data Controls --- */}
        <div className="mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-slate-800">Timeline Filter</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Displaying records for <span className="font-semibold text-slate-700">{getMonthLabel(monthFilter)}</span>.
            </p>
          </div>

          {/* Segmented Control */}
          <div className="inline-flex rounded-lg bg-slate-200/50 p-1 shadow-inner">
            <button
              onClick={() => setMonthFilter('thisMonth')}
              className={`rounded px-4 py-2 text-xs font-medium transition-all duration-200 ${
                monthFilter === 'thisMonth' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
              }`}
            >
              This Month ({thisMonthWonLeads.length})
            </button>
            <button
              onClick={() => setMonthFilter('lastMonth')}
              className={`rounded px-4 py-2 text-xs font-medium transition-all duration-200 ${
                monthFilter === 'lastMonth' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
              }`}
            >
              Last Month ({lastMonthWonLeads.length})
            </button>
          </div>
        </div>

        {/* --- Won Deals Grid --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleWonLeads.length === 0 ? (
            <div className="col-span-full text-center p-12 bg-white border border-dashed border-slate-300 rounded-xl">
              <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-200">
                <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
              </div>
              <h3 className="text-sm font-semibold text-slate-800">No Qualified Deals Found</h3>
              <p className="text-xs text-slate-500 mt-1">There are no closed accounts for the selected timeframe.</p>
            </div>
          ) : (
            visibleWonLeads.map((deal) => (
              <div key={deal._id || deal.id || `${deal.leadName}-${deal.email || 'no-email'}`} className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-slate-300 transition-all flex flex-col h-full overflow-hidden group">
                
                {/* Card Top: Company / Account Info */}
                <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-lg bg-[#99B562] text-white flex items-center justify-center font-bold text-lg shadow-sm">
                      {deal.companyName ? deal.companyName.charAt(0) : deal.leadName.charAt(0)}
                    </div>
                    <span className="bg-[#99B562]/10 text-[#7a914e] text-[9px] font-bold px-2 py-1 rounded uppercase tracking-wider flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                      Qualified
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-900 leading-tight mb-2 truncate">
                    {deal.companyName || 'Individual Account'}
                  </h3>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className={`w-3.5 h-3.5 ${i < deal.leadScore ? 'text-[#99B562]' : 'text-slate-200'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                      ))}
                    </div>
                    <span className="hidden sm:block text-slate-300">|</span>
                    <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">{deal.region || 'Global'}</span>
                  </div>
                  
                  {(deal as any)?.updatedAt && (
                    <p className="mt-3 text-xs font-medium text-slate-500">
                      Closed: <span className="text-slate-700">{new Date((deal as any).updatedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}</span>
                    </p>
                  )}
                </div>

                {/* Card Bottom: Primary Contact */}
                <div className="p-5 flex-1 bg-white">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Primary Client</p>
                  <p className="text-sm font-semibold text-slate-800 mb-0.5">{deal.leadName}</p>
                  <p className="text-xs text-slate-500 mb-4">{deal.title || 'Decision Maker'}</p>

                  <div className="space-y-3 bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                      <span className="truncate font-mono text-xs text-slate-600">{deal.email || 'No email associated'}</span>
                    </div>
                    {deal.phone && (
                      <div className="flex items-center gap-2.5">
                        <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                        <span className="font-mono text-xs text-slate-600">{deal.phone}</span>
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