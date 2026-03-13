import  { useState, useMemo } from "react";
import useAxiosSales from "@/uri/useAxiosSales";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import Notification from "../ui/toast";

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
}

// Utility functions for dynamic cell colors
const getStatusColor = (status: string) => {
  switch (status) {
    case 'Contacted': return 'bg-orange-400 text-white';
    case 'New Lead': return 'bg-blue-500 text-white';
    case 'Attempted to contact': return 'bg-pink-400 text-white';
    case 'In Progress': return 'bg-purple-500 text-white';
    case 'Qualified': return 'bg-emerald-500 text-white';
    case 'Unqualified': return 'bg-red-500 text-white';
    default: return 'bg-gray-100 text-gray-800';
  }
};





const getScoreColor = (score: string) => {
  switch (score) {
    case '3': return 'bg-green-100 text-gray-800';
    case '2': return 'bg-orange-100 text-gray-800';
    case '1': return 'bg-yellow-100 text-gray-800';
    default: return 'bg-white text-gray-800';
  }
};

// Standard Status Options for the dropdown
const statusOptions = [
  "New Lead",
  "Attempted to contact",
  "Contacted",
  "In Progress",
  "Qualified",
  "Unqualified",
];

export default function Sales_My_Leads() {
  const axiosSales = useAxiosSales();

  // --- UI Control States ---
  const [showNoti, setShowNoti] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortBy, setSortBy] = useState("Newest");
  const [meetingLead, setMeetingLead] = useState<LeadData | null>(null);
  const [meetingForm, setMeetingForm] = useState({ date: "", time: "", note: "", meetingWay: "Zoom" });

  // --- Data Fetching ---
  const { data: leadsData = [], isLoading, isError } = useQuery<LeadData[]>({
    queryKey: ['all-sales-leads'],
    queryFn: async () => {
      const res = await axiosSales.get('/api/v1/sales/get-my-leads');
      return res.data.leads as LeadData[];
    }
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
          lead.email?.toLowerCase().includes(lowerQuery)
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

  //  download as CSV
  const downloadCSV = () => {
    if (!leadsData || leadsData.length === 0) return;

    // 1️⃣ Create CSV header
    const header = Object.keys(leadsData[0]).join(",") + "\n";

    // 2️⃣ Map rows
    const rows = leadsData
      .map(row =>
        Object.values(row)
          .map(value => `"${value}"`) // wrap values in quotes
          .join(",")
      )
      .join("\n");

    // 3️⃣ Combine header + rows
    const csvContent = header + rows;

    // 4️⃣ Create blob and trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "export.csv"; 
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Handle Meeting Submit ---
  const handleMeetingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Meeting scheduled:", {
      lead: meetingLead,
      leadId: meetingLead?._id || meetingLead?.id,
      ...meetingForm,
    });
    // TODO: API call to save meeting
    setMeetingLead(null);
    setMeetingForm({ date: "", time: "", note: "", meetingWay: "Zoom" });
   
    setShowNoti(true)
  };

  const openMeetingPopup = (lead: LeadData, source: "fix" | "confirm") => {
    console.log("Meeting popup opened:", { source, lead });
    setMeetingLead(lead);
    setMeetingForm({ date: "", time: "", note: "", meetingWay: "Zoom" });
  };


  const handleInlineStatusChange = (leadId: string, newStatus: string) => {
    console.log(`Lead ID: ${leadId} | New Status: ${newStatus}`);

  };

  // --- Loading / Error States ---
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600 font-medium">Loading leads...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 mt-10 max-w-lg mx-auto bg-red-50 border border-red-200 rounded-lg text-center text-red-600">
        <p className="font-semibold">Error fetching leads data.</p>
        <p className="text-sm mt-1">Please check your connection and try again.</p>
      </div>
    );
  }

  return (
    <>
    <div className="fixed top-4 right-4 z-50">
          
              {showNoti && (
                <Notification
                  type="success"
                  title="Meeting Scheduled!"
                  message="Your meeting has been scheduled successfully."
                  showIcon={true}
                  duration={3000}
                  onClose={() => {
                    setShowNoti(false);
                 
                  }}
                />
              )}
            
          </div>

  
    <div className="w-full min-h-screen bg-gray-50/50 p-6 font-sans">
      
      {/* --- HEADER SECTION --- */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Sales Leads</h1>
          <p className="text-sm text-gray-500 mt-1">Manage, filter, and track your potential clients.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={downloadCSV} className="cursor-pointer px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm">
            Export CSV
          </button>
          <Link to={"/dashboard/sales/create-leads"}>
          <button className="px-4 py-2 bg-blue-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-sm">
            + Add New Lead
          </button>
          </Link>
        </div>
      </div>

      {/* --- CONTROLS SECTION (Search, Filter, Sort) --- */}
      <div className="mb-6 p-4 bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col lg:flex-row gap-4 justify-between items-center">
        
        {/* Search Bar */}
        <div className="relative w-full lg:max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
            placeholder="Search leads by name, company, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter & Sort Dropdowns */}
        <div className="flex w-full lg:w-auto gap-3">
          {/* Filter */}
          <div className="flex items-center gap-2 flex-1 lg:flex-none">
            <label className="text-sm font-medium text-gray-600 hidden sm:block">Status:</label>
            <select
              className="w-full block pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg bg-gray-50 hover:bg-white cursor-pointer transition-colors"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="New Lead">New Lead</option>
              <option value="Attempted to contact">Attempted to contact</option>
              <option value="Contacted">Contacted</option>
              <option value="In Progress">In Progress</option>
              <option value="Qualified">Qualified</option>
              <option value="Unqualified">Unqualified</option>
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2 flex-1 lg:flex-none">
            <label className="text-sm font-medium text-gray-600 hidden sm:block">Sort:</label>
            <select
              className="w-full block pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg bg-gray-50 hover:bg-white cursor-pointer transition-colors"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="Newest">All</option>
              <option value="Name (A-Z)">Name (A-Z)</option>
              <option value="Name (Z-A)">Name (Z-A)</option>
              <option value="Score (High to Low)">Score (High to Low)</option>
              <option value="Score (Low to High)">Score (Low to High)</option>
            </select>
          </div>
        </div>
      </div>

      {/* --- TABLE SECTION --- */}
      <div className="overflow-x-auto bg-white border border-gray-200 shadow-sm">
        <table className="min-w-full border-collapse border border-gray-200 text-sm text-center whitespace-nowrap">
          <thead className="bg-white border-b border-gray-200">
            <tr>
              <th className="p-3 border-r border-gray-200 font-medium text-gray-600 text-left">Lead</th>
              <th className="p-3 border-r border-gray-200 font-medium text-gray-600 w-[1%] whitespace-nowrap">Fix Meeting</th>
              <th className="p-3 border-r border-gray-200 font-medium text-gray-600 w-40 ">Status</th>
              <th className="p-3 border-r border-gray-200 font-medium text-gray-600 w-40">Indications</th>
              <th className="p-3 border-r border-gray-200 font-medium text-gray-600">Company Name</th>
              <th className="p-3 border-r border-gray-200 font-medium text-gray-600 w-24">Lead score</th>
              <th className="p-3 border-r border-gray-200 font-medium text-gray-600">Email</th>
              <th className="p-3 border-r border-gray-200 font-medium text-gray-600">Phone</th>
              <th className="p-3 border-r border-gray-200 font-medium text-gray-600 w-32">Title</th>
              <th className="p-3 border-r border-gray-200 font-medium text-gray-600">Specific role</th>
              <th className="p-3 border-r border-gray-200 font-medium text-gray-600 w-24">Region</th>
            </tr>
          </thead>
          <tbody>
            {processedLeads.length === 0 && !isLoading && (
              <tr>
                <td colSpan={11} className="p-8 text-center text-gray-500 border-r border-gray-200">
                  No leads found matching your criteria.
                </td>
              </tr>
            )}

            {processedLeads.map((lead) => (
              <tr key={lead.id} className="border-b border-gray-200 hover:bg-gray-50 group">
                
                <td className="p-2 border-r border-gray-200 text-left">
                  <div className="flex items-center justify-between">
                    <a href={lead.profileUrl} className="text-gray-800 hover:underline">{lead.leadName}</a>
                    <button className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </button>
                  </div>
                </td>
                
                <td className="p-1 border-r border-gray-200 w-[1%] whitespace-nowrap">
                  <div className="flex items-center justify-center">
                    
                    <button
                      onClick={() => openMeetingPopup(lead, "confirm")}
                      className="inline-flex w-fit whitespace-nowrap px-2.5 py-1.5 rounded-md bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors"
                    >
                      Confirm
                    </button>
                  </div>
                </td>
                
                {/* --- CHANGED: Status is now an invisible dropdown filling the colored cell --- */}
                <td className={`p-0 border-r border-gray-200 w-40 min-w-[10rem] max-w-[10rem] ${getStatusColor(lead.status)} relative`}>
                  <select
                    value={lead.status}
                    onChange={(e) => handleInlineStatusChange(lead._id, e.target.value)}
                    className={`w-full h-full min-h-[40px] appearance-none bg-transparent outline-none cursor-pointer text-center font-medium pr-6 px-2 ${getStatusColor(lead.status)}`}
                  >
                    {statusOptions.map((opt) => (
                      <option key={opt} value={opt} className="bg-white text-gray-800 text-left">
                        {opt}
                      </option>
                    ))}
                  </select>
                  {/* Small absolute icon to indicate it's a dropdown, styling respects text color */}
                  <div className="pointer-events-none absolute inset-y-0 right-1 flex items-center px-1">
                     <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </td>

                <td className={`p-2 border-r border-gray-200 ${lead.indications === 'Existing Account' ? 'bg-green-100' : 'bg-white'} text-gray-700`}>
                  {lead.indications}
                </td>
                <td className="p-2 border-r border-gray-200 text-gray-700">
                  {lead.companyName}
                </td>
                <td className={`p-2 border-r border-gray-200 ${getScoreColor(lead.leadScore)} font-medium`}>
                  {lead.leadScore}
                </td>
                <td className="p-2 border-r border-gray-200">
                  <a href={`mailto:${lead.email}`} className="text-blue-500 hover:underline">{lead.email}</a>
                </td>
                <td className="p-2 border-r border-gray-200 text-gray-600">
                  {lead.phone}
                </td>
                <td className={`p-2 border-r border-gray-200 bg-teal-400 text-white`}>
                  {lead.title}
                </td>
                <td className="p-2 border-r border-gray-200 text-gray-700">
                  {lead.specificRole}
                </td>
                <td className={`p-2 border-r border-gray-200 bg-purple-400 text-white`}>
                  {lead.region}
                </td>
              </tr>
            ))}
            
            {!isLoading && (
              <tr>
                <td colSpan={11} className="p-0 border-t border-gray-200">
                  <Link 
                    to={"/dashboard/sales/create-leads"} 
                    className="block w-full p-2 text-left text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    + Add lead
                  </Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>

      {/* --- FIX MEETING MODAL --- */}
      {meetingLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-500"></div>
            <div className="px-6 pt-6 pb-4 flex justify-between items-start">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Fix Meeting</h2>
                <p className="text-sm text-gray-500 mt-0.5">Schedule a meeting with <span className="font-medium text-gray-800">{meetingLead.leadName}</span></p>
              </div>
              <button
                onClick={() => {
                  setMeetingLead(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleMeetingSubmit} className="px-6 pb-6 space-y-4">
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Important Lead Data</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p className="text-gray-600"><span className="font-medium text-gray-800">Company:</span> {meetingLead.companyName}</p>
                  <p className="text-gray-600"><span className="font-medium text-gray-800">Owner:</span> {meetingLead.owner || "N/A"}</p>
                  <p className="text-gray-600"><span className="font-medium text-gray-800">Status:</span> {meetingLead.status}</p>
                  <p className="text-gray-600"><span className="font-medium text-gray-800">Score:</span> {meetingLead.leadScore}</p>
                  <p className="text-gray-600"><span className="font-medium text-gray-800">Region:</span> {meetingLead.region}</p>
                  <p className="text-gray-600"><span className="font-medium text-gray-800">Title:</span> {meetingLead.title}</p>
                </div>
                <div className="mt-2 text-sm">
                  <p className="text-gray-600"><span className="font-medium text-gray-800">Email:</span> {meetingLead.email}</p>
                  <p className="text-gray-600"><span className="font-medium text-gray-800">Phone:</span> {meetingLead.phone}</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Lead ID</label>
                <input
                  type="text"
                  readOnly
                  value={meetingLead._id || meetingLead.id}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-400 cursor-not-allowed"
                />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={meetingForm.date}
                    onChange={(e) => setMeetingForm(f => ({ ...f, date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Time</label>
                  <input
                    type="time"
                    required
                    value={meetingForm.time}
                    onChange={(e) => setMeetingForm(f => ({ ...f, time: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Meeting Way</label>
                <select
                  value={meetingForm.meetingWay}
                  onChange={(e) => setMeetingForm(f => ({ ...f, meetingWay: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white cursor-pointer"
                >
                  <option value="Zoom">Zoom</option>
                  <option value="Meet">Meet</option>
                  <option value="Face to Face">Face to Face</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Note</label>
                <textarea
                  rows={3}
                  placeholder="Add any notes about this meeting..."
                  value={meetingForm.note}
                  onChange={(e) => setMeetingForm(f => ({ ...f, note: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setMeetingLead(null);
                  }}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-blue-600 rounded-xl text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Confirm Meeting
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}