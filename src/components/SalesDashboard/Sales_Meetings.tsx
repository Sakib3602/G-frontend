import React, { useContext, useState } from 'react';
import type { IMeeting } from './Sales_My_Leads';
import { useQuery } from '@tanstack/react-query';
import useAxiosSales from '@/uri/useAxiosSales';
import { AuthContext } from '../Authentication/AuthProvider/AuthProvider';

// --- 1. TYPES ---
export interface MeetingData extends IMeeting {
  _id?: string;
  id?: string;
}

const createEmptyForm = (): IMeeting => ({
  title: '',
  clientName: '',
  clientEmail: '',
  meetingDate: '',
  meetingTime: '',
  meetingType: 'online',
  meetingLink: '',
  agenda: '',
  notes: '',
  status: 'scheduled',
  schedulerId: '',
});

const normalizeMeetingStatus = (status?: string): MeetingData['status'] => {
  const normalized = status?.toLowerCase();

  if (normalized === 'completed' || normalized === 'cancelled' || normalized === 'one-more') {
    return normalized;
  }

  return 'scheduled';
};

const normalizeMeetingsResponse = (response: unknown): MeetingData[] => {
  const payload = response as
    | MeetingData[]
    | { data?: MeetingData[]; meetings?: MeetingData[]; allMeetings?: MeetingData[] };

  const meetings = Array.isArray(payload)
    ? payload
    : payload?.data ?? payload?.meetings ?? payload?.allMeetings ?? [];

  if (!Array.isArray(meetings)) {
    return [];
  }

  return meetings.map((meeting, index) => ({
    ...meeting,
    id: meeting.id ?? meeting._id ?? `${meeting.clientEmail}-${meeting.meetingDate}-${meeting.meetingTime}-${index}`,
    status: normalizeMeetingStatus(meeting.status),
  }));
};

export default function Sales_Meetings() {
  const axiosSales = useAxiosSales();
  const auth = useContext(AuthContext);
  const person = auth?.person;

  // fetch user data
  const { data: userData } = useQuery({
    queryKey: ["user-data", person?.email],
    enabled: Boolean(person?.email),
    queryFn: async () => {
      const res = await axiosSales.get(`/api/v1/user/${person?.email}`);
      return res.data.data;
    },
  });
  console.log('Fetched user data:', userData);

  // meetings data fetch
  const {
    data: meetings = [],
    isLoading,
    isError,
  } = useQuery<MeetingData[]>({
    queryKey: ['meetings-single-sales', userData?._id],
    enabled: Boolean(userData?._id),
    queryFn: async () => {
      const res = await axiosSales.get(`/api/v1/sales/meetings/meetings/${userData?._id}`);
      return normalizeMeetingsResponse(res.data);
    },
  });

  // Form State
  const [formData, setFormData] = useState<IMeeting>(createEmptyForm());

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      if (name === 'meetingType') {
        return { ...prev, meetingType: value as IMeeting['meetingType'], meetingLink: value === 'online' ? prev.meetingLink : '' };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newMeeting: MeetingData = {
 
      ...formData,
    };
    console.log('Meeting Submitted:', newMeeting);
   
    setFormData(createEmptyForm());
  };

  const handleSuccessMeeting = (meeting: MeetingData) => {
    console.log('Success Meeting:', { id: meeting.id, meeting });
  };

  const handleFailMeeting = (meeting: MeetingData) => {
    console.log('Fail Meeting:', { id: meeting.id, meeting });
  };

  const handleNeedAnotherMeeting = (meeting: MeetingData) => {
    console.log('Need Another Meeting:', { id: meeting.id, meeting });
  };

  const handleDeleteMeeting = (meeting: MeetingData) => {
    console.log('Delete Meeting:', { id: meeting._id ?? meeting.id, meeting });
   
  };

  // KPI Calculations
  const totalMeetings = meetings.length;
  const upcomingMeetings = meetings.filter(m => m.status === 'scheduled').length;
  const completedMeetings = meetings.filter(m => m.status === 'completed').length;

  return (
    <div className=" poppins-regular w-full bg-gray-50/50 p-4 sm:p-6 lg:p-8 font-sans min-h-screen">
      
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Meeting Center</h1>
            <p className="text-sm text-gray-500 mt-1">Manage your calendar and upcoming client calls.</p>
          </div>
        </div>

        {/* --- KPI WIDGETS --- */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-[#99B562]/10 flex items-center justify-center text-[#99B562]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Meetings</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{totalMeetings}</p>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Upcoming</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{upcomingMeetings}</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
              </div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Completed</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{completedMeetings}</p>
          </div>
        </div>

        {/* --- MEETING COMPONENT (Form + List) --- */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* Left: Schedule Form */}
          <div className="xl:col-span-4">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden sticky top-6">
              <div className="bg-white border-b border-gray-100 px-6 py-4">
                <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#99B562]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  Schedule Activity
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Meeting Title *</label>
                  <input type="text" name="title" required value={formData.title} onChange={handleChange} placeholder="e.g. Discovery Call" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#99B562]/40 focus:border-[#99B562] outline-none transition-colors" />
                </div>

                <div>
                  <label className="block font-medium text-gray-700 mb-1">Client Name *</label>
                  <input type="text" name="clientName" required value={formData.clientName} onChange={handleChange} placeholder="e.g. Liam Smith" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#99B562]/40 focus:border-[#99B562] outline-none transition-colors" />
                </div>

                <div>
                  <label className="block font-medium text-gray-700 mb-1">Client Email *</label>
                  <input type="email" name="clientEmail" required value={formData.clientEmail} onChange={handleChange} placeholder="e.g. client@example.com" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#99B562]/40 focus:border-[#99B562] outline-none transition-colors" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">Date *</label>
                    <input type="date" name="meetingDate" required value={formData.meetingDate} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#99B562]/40 focus:border-[#99B562] outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">Time *</label>
                    <input type="time" name="meetingTime" required value={formData.meetingTime} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#99B562]/40 focus:border-[#99B562] outline-none transition-colors" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">Meeting Type</label>
                    <select name="meetingType" value={formData.meetingType} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#99B562]/40 focus:border-[#99B562] outline-none bg-white transition-colors">
                      <option value="online">Online</option>
                      <option value="offline">Offline</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">Status</label>
                    <select name="status" value={formData.status || 'scheduled'} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#99B562]/40 focus:border-[#99B562] outline-none bg-white transition-colors">
                      <option value="scheduled">Scheduled</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="one-more">One More</option>
                    </select>
                  </div>
                </div>

                {formData.meetingType === 'online' && (
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">Meeting Link</label>
                    <input type="text" name="meetingLink" value={formData.meetingLink || ''} onChange={handleChange} placeholder="https://meet.google.com/..." className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#99B562]/40 focus:border-[#99B562] outline-none transition-colors" />
                  </div>
                )}

                <div>
                  <label className="block font-medium text-gray-700 mb-1">Agenda</label>
                  <textarea
                    name="agenda"
                    value={formData.agenda || ''}
                    onChange={handleChange}
                    rows={2}
                    placeholder="Outline what will be covered in this meeting."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#99B562]/40 focus:border-[#99B562] outline-none transition-colors resize-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes || ''}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Add internal notes or follow-up context."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#99B562]/40 focus:border-[#99B562] outline-none transition-colors resize-none"
                  />
                </div>

                <div className="pt-4 mt-2 border-t border-gray-100">
                  <button type="submit" className="w-full bg-[#99B562] hover:bg-[#8da857] text-white font-medium py-2.5 px-4 rounded-lg transition-colors shadow-sm">
                    Save Meeting
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right: Meeting List */}
          <div className="xl:col-span-8 mt-8 xl:mt-0">
            <div className="flex items-center justify-between mb-4">
               <h3 className="text-lg font-bold text-gray-900">Meeting Timeline</h3>
               <div className="flex gap-2">
                  <button className="text-sm px-3 py-1.5 border border-gray-200 bg-white rounded-md font-medium text-gray-600 hover:bg-gray-50">Filter</button>
                  <button className="text-sm px-3 py-1.5 border border-gray-200 bg-white rounded-md font-medium text-gray-600 hover:bg-gray-50">Sort</button>
               </div>
            </div>
            
            <div className="space-y-4">
              {isLoading && (
                <div className="text-center p-12 bg-white rounded-xl border border-dashed border-gray-300">
                  <p className="text-gray-500">Loading meetings...</p>
                </div>
              )}

              {isError && !isLoading && (
                <div className="text-center p-12 bg-white rounded-xl border border-dashed border-rose-300">
                  <p className="text-rose-500">Unable to load meetings from the database.</p>
                </div>
              )}

              {!isLoading && !isError && meetings.length === 0 ? (
                <div className="text-center p-12 bg-white rounded-xl border border-dashed border-gray-300">
                  <p className="text-gray-500">No meetings scheduled yet.</p>
                </div>
              ) : !isLoading && !isError ? (
                meetings.map((meeting) => (
                  <div key={meeting._id ?? meeting.id} className={`bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group ${meeting.status === 'completed' ? 'border-gray-200 bg-gray-50/50' : 'border-gray-200'}`}>
                    
                    {/* Dynamic Accent Line */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${meeting.status === 'scheduled' ? 'bg-[#99B562]' : 'bg-slate-300'}`}></div>

                    <div className="flex flex-col sm:flex-row justify-between sm:items-start pl-2 gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide border ${meeting.status === 'scheduled' ? 'bg-[#99B562]/10 text-[#7a914e] border-[#99B562]/20' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                            {meeting.status}
                          </span>
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                            • {meeting.meetingType}
                          </span>
                        </div>
                        
                        <h4 className="text-lg font-bold text-gray-900 leading-tight group-hover:text-[#99B562] transition-colors cursor-pointer">{meeting.title}</h4>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600">
                             {(meeting.clientName || 'NA').substring(0,2).toUpperCase()}
                          </div>
                          <p className="text-sm font-medium text-gray-600">
                            <span className="text-gray-900">{meeting.clientName}</span>
                            {meeting.clientEmail && <span className="text-gray-400 ml-2 text-xs">{meeting.clientEmail}</span>}
                          </p>
                        </div>
                        {meeting.agenda && (
                          <p className="text-xs text-gray-500 mt-1 max-w-2xl"><span className="font-semibold">Agenda:</span> {meeting.agenda}</p>
                        )}
                        {meeting.notes && (
                          <p className="text-sm text-gray-600 mt-1 max-w-2xl">{meeting.notes}</p>
                        )}
                      </div>

                      {/* Date Block */}
                      <div className="bg-white border border-gray-100 shadow-sm rounded-lg p-3 text-center min-w-[90px] shrink-0">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {new Date(meeting.meetingDate).toLocaleString('default', { month: 'short' })}
                        </p>
                        <p className="text-2xl font-black text-gray-800 leading-none my-1">
                          {new Date(meeting.meetingDate).getDate()}
                        </p>
                        <p className="text-[11px] font-bold text-gray-500">{meeting.meetingTime}</p>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-gray-50 pl-2 flex justify-between items-center">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                        {meeting.meetingLink ? (
                          meeting.meetingLink.startsWith('http') ? (
                            <a href={meeting.meetingLink} target="_blank" rel="noopener noreferrer" className="text-[#99B562] hover:underline font-medium truncate max-w-[200px] sm:max-w-xs block">
                              {meeting.meetingLink}
                            </a>
                          ) : (
                            <span>{meeting.meetingLink}</span>
                          )
                        ) : (
                          <span className="text-gray-400 italic">No link — offline meeting</span>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDeleteMeeting(meeting)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 rounded-md hover:bg-rose-50 transition-colors"
                          aria-label="Delete meeting"
                          title="Delete meeting"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3M4 7h16"></path></svg>
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 pl-2 flex flex-wrap gap-2">
                      <button
                        onClick={() => handleSuccessMeeting(meeting)}
                        className="text-xs px-3 py-1.5 rounded-md bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors font-medium"
                      >
                        Success Meeting
                      </button>
                      <button
                        onClick={() => handleFailMeeting(meeting)}
                        className="text-xs px-3 py-1.5 rounded-md bg-rose-100 text-rose-700 hover:bg-rose-200 transition-colors font-medium"
                      >
                        Fail Meeting
                      </button>
                      <button
                        onClick={() => handleNeedAnotherMeeting(meeting)}
                        className="text-xs px-3 py-1.5 rounded-md bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors font-medium"
                      >
                        Need Another Meeting
                      </button>
                    </div>

                  </div>
                ))
              ) : null}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}