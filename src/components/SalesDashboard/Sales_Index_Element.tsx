import React, { useContext, useState } from 'react';
import { AuthContext } from '../Authentication/AuthProvider/AuthProvider';
import useAxiosSales from '@/uri/useAxiosSales';
import { useQuery } from '@tanstack/react-query';

export default function Sales_Index_Element() {
  const auth = useContext(AuthContext);
  const person = auth?.person;
  const axiosSales = useAxiosSales();

  const { data: userData } = useQuery({
    queryKey: ["user-data", person?.email],
    enabled: Boolean(person?.email),
    queryFn: async () => {
      const res = await axiosSales.get(`/api/v1/user/${person?.email}`);
      return res.data.data;
    },
  });

  const { data: m, isLoading } = useQuery({
    queryKey: ["dashboard_data", userData?._id],
    enabled: Boolean(userData?._id),
    queryFn: async () => {
      const res = await axiosSales.get(`/api/v1/sales/dashboard/${userData?._id}`);
      return res.data;
    }
  });

  console.log("Fetched Metrics Data:", m);

  // Directly map fetched data with 0 as fallback
  const metrics = {
    newLeads: m?.newLeads ?? 0,
    attemptedToContact: m?.ActionRequiredCount ?? 0,
    contacted: m?.contactedLeads ?? 0,
    inProgressTotal: m?.inProgressLeads ?? 0,
    proposalSent: m?.ActionRequiredCount ?? 0,
    awaitingResponse: m?.AwaitResponseCount ?? 0,
    reminders: m?.reminders ?? 0,
    qualified: m?.qualifiedLeads ?? 0,
    unqualified: m?.unqualifiedLeads ?? 0,
    totalLeads: m?.totalLeads ?? 0,
    winRate: Number(m?.winRate) || 0,
  };

  const totalActiveLeads = metrics.totalLeads;
  const winRate = metrics.winRate;

  // --- Profile State ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    name: person?.name || 'Loading...',
    role: 'Sales Representative',
    phone: '',
    address: '',
    nid: '',
    avatar: '', 
  });

  // --- Form State ---
  const [formData, setFormData] = useState({ ...profileData });
  const [imageFile, setImageFile] = useState<File | null>(null);

  // --- Handlers ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Updated Profile Data:", {
      ...formData,
      profileImage: imageFile ? imageFile.name : "No new image uploaded"
    });
    setProfileData(formData);
    setIsEditModalOpen(false);
  };

  // ==========================================
  // SKELETON LOADER UI
  // ==========================================
  if (isLoading || !userData) {
    return (
      <div className="w-full bg-[#f8fafc] p-6 lg:p-10 min-h-screen">
        <div className="max-w-[1400px] mx-auto space-y-8 animate-pulse">
          
          {/* Skeleton Header */}
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="space-y-3">
              <div className="h-8 bg-slate-200 rounded w-64"></div>
              <div className="h-4 bg-slate-200 rounded w-96"></div>
            </div>
            <div className="h-10 bg-slate-200 rounded-xl w-36"></div>
          </div>

          {/* Skeleton Top Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100 flex items-center justify-between">
                <div className="space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-24"></div>
                  <div className="h-10 bg-slate-200 rounded w-16"></div>
                </div>
                <div className="w-14 h-14 rounded-full bg-slate-200"></div>
              </div>
            ))}
          </div>

          {/* Skeleton Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-100 p-6 space-y-8">
              <div className="h-6 bg-slate-200 rounded w-48 mb-6"></div>
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-100 rounded-xl"></div>)}
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[1, 2].map(i => <div key={i} className="h-24 bg-slate-100 rounded-xl"></div>)}
              </div>
            </div>

            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-100 h-48"></div>
              <div className="bg-white rounded-2xl border border-slate-100 h-64"></div>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // ==========================================
  // MAIN DASHBOARD UI
  // ==========================================
  return (
    <div className="w-full bg-[#f8fafc] p-6 lg:p-10 font-sans min-h-screen text-slate-800 relative">
      <div className="max-w-[1400px] mx-auto space-y-8">
        
        {/* --- Header --- */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Sales Overview</h1>
            <p className="text-sm text-slate-500 mt-1">Real-time metrics for your active pipeline and team performance.</p>
          </div>
          <div className="flex gap-3">
            <button className="bg-[#99B562] hover:bg-[#85a052] text-white font-medium py-2.5 px-4 rounded-xl transition-all text-sm shadow-sm flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
              Add New Lead
            </button>
          </div>
        </div>

        {/* --- Top Level: Core KPIs --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Active Leads</p>
              <h2 className="text-4xl font-bold text-slate-900">{totalActiveLeads}</h2>
            </div>
            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Win Rate</p>
              <h2 className="text-4xl font-bold text-slate-900">{winRate}%</h2>
            </div>
            <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-[#99B562]/30 shadow-sm flex items-center justify-between relative overflow-hidden">
            <div className="absolute right-0 top-0 w-24 h-24 bg-[#99B562]/5 rounded-bl-full"></div>
            <div className="relative z-10">
              <p className="text-sm font-semibold text-[#99B562] uppercase tracking-wider mb-1">Qualified Deals</p>
              <h2 className="text-4xl font-bold text-slate-900">{metrics.qualified}</h2>
            </div>
            <div className="w-14 h-14 rounded-full bg-[#99B562] flex items-center justify-center shadow-md relative z-10">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
            </div>
          </div>
        </div>

        {/* --- Main Layout Grid --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Full Pipeline Breakdown */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-800">Pipeline Distribution</h3>
            </div>
            
            <div className="p-6">
              <div className="space-y-6">
                
                {/* Discovery Phase */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">1. Discovery</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                      <p className="text-2xl font-bold text-slate-700">{metrics.newLeads}</p>
                      <p className="text-xs font-medium text-slate-500 mt-1">New Leads</p>
                    </div>
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                      <p className="text-2xl font-bold text-amber-700">{metrics.attemptedToContact}</p>
                      <p className="text-xs font-medium text-amber-600 mt-1">Attempted</p>
                    </div>
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                      <p className="text-2xl font-bold text-blue-700">{metrics.contacted}</p>
                      <p className="text-xs font-medium text-blue-600 mt-1">Contacted</p>
                    </div>
                  </div>
                </div>

                <div className="w-full h-px bg-slate-100"></div>

                {/* Negotiation Phase */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">2. In Progress</h4>
                    <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2.5 py-1 rounded-md">Total: {metrics.inProgressTotal}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border border-slate-200 rounded-xl p-4 flex items-center justify-between group hover:border-[#99B562]/40 transition-colors">
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase">Proposal Sent</p>
                        <p className="text-2xl font-bold text-slate-900 mt-1">{metrics.proposalSent}</p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-[#99B562] transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                      </div>
                    </div>
                    <div className="border border-slate-200 rounded-xl p-4 flex items-center justify-between group hover:border-[#99B562]/40 transition-colors">
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase">Awaiting Response</p>
                        <p className="text-2xl font-bold text-slate-900 mt-1">{metrics.awaitingResponse}</p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-[#99B562] transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="w-full h-px bg-slate-100"></div>

                {/* Outcome Phase */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">3. Outcomes</h4>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-red-800">Unqualified / Lost</p>
                        <p className="text-2xl font-bold text-red-600">{metrics.unqualified}</p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Right Column: Actions & Profile */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Reminders Block */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h3 className="font-bold text-slate-800">Action Center</h3>
                {metrics.reminders > 0 && (
                  <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                  </span>
                )}
              </div>
              <div className="p-6">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-amber-900 text-lg">Pending Reminders</h4>
                      <p className="text-sm text-amber-700 mt-0.5">Leads waiting for follow-up</p>
                    </div>
                  </div>
                  <div className="text-4xl font-black text-amber-600">{metrics.reminders}</div>
                </div>
              </div>
            </div>

            {/* --- SALES REPRESENTATIVE PROFILE CARD --- */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
               <div className="h-20 bg-gradient-to-r from-slate-800 to-slate-700"></div>
               <div className="px-6 pb-6 relative">
                 <div className="flex justify-between items-end mb-4">
                   <div className="w-20 h-20 rounded-full border-4 border-white bg-slate-100 -mt-10 flex items-center justify-center shadow-sm overflow-hidden text-2xl font-bold text-slate-400">
                     {profileData.avatar ? (
                       <img src={profileData.avatar} alt="Profile" className="w-full h-full object-cover" />
                     ) : (
                       profileData.name.charAt(0)
                     )}
                   </div>
                   <button 
                     onClick={() => {
                       setFormData(profileData); 
                       setIsEditModalOpen(true);
                     }}
                     className="text-xs font-bold text-[#99B562] bg-[#99B562]/10 hover:bg-[#99B562]/20 border border-[#99B562]/20 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                   >
                     <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                     Edit Profile
                   </button>
                 </div>
                 
                 <div>
                   <h3 className="text-xl font-bold text-slate-900">{profileData.name}</h3>
                   <p className="text-sm font-medium text-[#99B562] mb-5">{profileData.role}</p>
                   
                   <div className="space-y-3">
                     <div className="flex items-start gap-3">
                       <svg className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                       <div>
                         <p className="text-xs text-slate-500 font-medium leading-none">Phone</p>
                         <p className="text-sm text-slate-800 mt-0.5">{profileData.phone || 'Not set'}</p>
                       </div>
                     </div>
                     <div className="flex items-start gap-3">
                       <svg className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                       <div>
                         <p className="text-xs text-slate-500 font-medium leading-none">Address</p>
                         <p className="text-sm text-slate-800 mt-0.5">{profileData.address || 'Not set'}</p>
                       </div>
                     </div>
                     <div className="flex items-start gap-3">
                       <svg className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"></path></svg>
                       <div>
                         <p className="text-xs text-slate-500 font-medium leading-none">National ID (NID)</p>
                         <p className="text-sm text-slate-800 mt-0.5 font-mono">{profileData.nid || 'Not set'}</p>
                       </div>
                     </div>
                   </div>
                 </div>
               </div>
            </div>

          </div>
        </div>
      </div>

      {/* --- EDIT PROFILE MODAL --- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)}></div>
          
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-900">Edit Profile</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-700 hover:bg-slate-200 p-2 rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <form onSubmit={handleProfileSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Profile Image</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full border-2 border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                    {imageFile ? (
                      <img src={URL.createObjectURL(imageFile)} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    )}
                  </div>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageChange}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-[#99B562]/10 file:text-[#99B562] hover:file:bg-[#99B562]/20 file:transition-colors cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#99B562] focus:ring-2 focus:ring-[#99B562]/20 transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Phone Number</label>
                  <input 
                    type="tel" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#99B562] focus:ring-2 focus:ring-[#99B562]/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">National ID (NID)</label>
                  <input 
                    type="text" 
                    name="nid"
                    value={formData.nid}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#99B562] focus:ring-2 focus:ring-[#99B562]/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Address</label>
                <textarea 
                  name="address"
                  rows={3}
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#99B562] focus:ring-2 focus:ring-[#99B562]/20 transition-all resize-none"
                ></textarea>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2.5 text-sm font-bold text-white bg-[#99B562] hover:bg-[#85a052] rounded-lg shadow-sm transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}