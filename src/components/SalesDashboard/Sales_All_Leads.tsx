import React, { useState, useMemo } from "react";
import useAxiosSales from "@/uri/useAxiosSales";
import { useQuery } from "@tanstack/react-query";

export interface LeadData {
  id: string;
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

const getTitleColor = (title: string) => {
  switch (title) {
    case 'Director': return 'bg-teal-400 text-white';
    case 'Manager': return 'bg-pink-500 text-white';
    case 'VP': return 'bg-indigo-500 text-white';
    case 'Team Member': return 'bg-blue-400 text-white';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getRegionColor = (region: string) => {
  switch (region) {
    case 'ANZ': return 'bg-purple-400 text-white';
    case 'US': return 'bg-blue-600 text-white';
    case 'EMEA': return 'bg-gray-400 text-white';
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

export default function Sales_All_Leads() {
    
  const axiosSales = useAxiosSales();

  // --- UI Control States ---
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortBy, setSortBy] = useState("Newest");

  // --- Data Fetching ---
  const { data = [], isLoading, isError } = useQuery<LeadData[]>({
    queryKey: ['all-sales-leads'],
    queryFn: async () => {
      const res = await axiosSales.get('/api/v1/sales/get-all-leads');
      return res.data.leads as LeadData[];
    }
  });

  // --- Search, Filter, and Sort Logic ---
  const processedLeads = useMemo(() => {
    if (!data) return [];
    let result = [...data];

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
  }, [data, searchQuery, filterStatus, sortBy]);

//   download as CSV
const downloadCSV = () => {
    if (!data || data.length === 0) return;

    // 1️⃣ Create CSV header
    const header = Object.keys(data[0]).join(",") + "\n";

    // 2️⃣ Map rows
    const rows = data
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
          <button className="px-4 py-2 bg-blue-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-sm">
            + Add New Lead
          </button>
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
              <option value="Newest">Newest First</option>
              <option value="Name (A-Z)">Name (A-Z)</option>
              <option value="Name (Z-A)">Name (Z-A)</option>
              <option value="Score (High to Low)">Score (High to Low)</option>
              <option value="Score (Low to High)">Score (Low to High)</option>
            </select>
          </div>
        </div>
      </div>

      {/* --- TABLE SECTION (Reverted strictly to original UI style) --- */}
      <div className="overflow-x-auto bg-white border border-gray-200 shadow-sm">
        <table className="min-w-full border-collapse border border-gray-200 text-sm text-center whitespace-nowrap">
          <thead className="bg-white border-b border-gray-200">
            <tr>
              <th className="p-3 border-r border-gray-200 font-medium text-gray-600 text-left">Lead</th>
              <th className="p-3 border-r border-gray-200 font-medium text-gray-600">Owner</th>
              <th className="p-3 border-r border-gray-200 font-medium text-gray-600 w-40">Status</th>
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
                
                <td className="p-2 border-r border-gray-200">
                  <div className="w-6 h-6 rounded-full border-2 border-gray-300 mx-auto flex items-center justify-center overflow-hidden bg-gray-100">
                    <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                  </div>
                </td>
                <td className={`p-2 border-r border-gray-200 ${getStatusColor(lead.status)}`}>
                  {lead.status}
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
                <td className={`p-2 border-r border-gray-200 ${getTitleColor(lead.title)}`}>
                  {lead.title}
                </td>
                <td className="p-2 border-r border-gray-200 text-gray-700">
                  {lead.specificRole}
                </td>
                <td className={`p-2 border-r border-gray-200 ${getRegionColor(lead.region)}`}>
                  {lead.region}
                </td>
              </tr>
            ))}
            
            {!isLoading && (
              <tr>
                <td colSpan={11} className="p-2 text-left text-gray-400 hover:text-gray-600 cursor-pointer">
                  + Add lead
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}