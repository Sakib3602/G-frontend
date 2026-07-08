import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import useAxiosAdmin from "@/uri/useAxiosAdmin";
import { Bounce, ToastContainer, toast } from "react-toastify";

// আপনার ডেটা অনুযায়ী ইন্টারফেস
interface CampaignData {
  _id: string;
  campaignName: string;
  channel: string;
  startDate: string;
  endDate: string;
  perDayCost: number;
  targetLeads: number;
  totalBudget: number;
  adminApproval: "pending" | "approved" | "rejected";
  marketerId: {
    name: string;
    email: string;
  };
  revenue?: number;
}

const AdminCampaigns = () => {
  const axiosAdmin = useAxiosAdmin();
  const [status, setStatus] = useState("pending");

  const {
    data: campaignsData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["campaigns-admin", status],
    queryFn: async () => {
      const res = await axiosAdmin.get(`/campaigns?status=${status}`);
      return res.data?.data;
    },
  });

  const mutationUpdateStatus = useMutation({
    mutationFn: async ({
      id,
      newStatus,
    }: {
      id: string;
      newStatus: string;
    }) => {
      const res = await axiosAdmin.patch(`/campaigns/${id}`, {
        adminApproval: newStatus,
      });

      return res.data;
    },

    onSuccess: () => {
      // Toastify কে একটু ক্লিন করা হয়েছে
      toast.success("Status updated successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
        transition: Bounce,
      });
      refetch();
    },
  });

  const handleStatusChange = (id: string, newStatus: string) => {
    mutationUpdateStatus.mutate({ id, newStatus });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <ToastContainer />
      
      {/* Header Section */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Campaign Management
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage and update the status of your marketing campaigns.
          </p>
        </div>
        
        {/* Modern Select Dropdown */}
        <div className="relative inline-block w-full sm:w-auto">
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              refetch();
            }}
            className="appearance-none w-full border border-gray-300 rounded-lg pl-4 pr-10 py-2.5 bg-white text-sm font-medium text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer"
          >
            <option value="pending">⏳ Pending Campaigns</option>
            <option value="approved">✅ Approved Campaigns</option>
            <option value="rejected">❌ Rejected Campaigns</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left border-collapse">
            {/* কাঙ্ক্ষিত #F3F6FE ব্যাকগ্রাউন্ড কালার */}
            <thead className="bg-[#F3F6FE] text-gray-700 text-sm uppercase tracking-wider font-semibold border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 whitespace-nowrap">Campaign Name</th>
                <th className="px-6 py-4 whitespace-nowrap">Channel</th>
                <th className="px-6 py-4 whitespace-nowrap">Marketer</th>
                <th className="px-6 py-4 whitespace-nowrap">Budget</th>
                <th className="px-6 py-4 whitespace-nowrap text-center">Admin Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12">
                    {/* একটি প্রফেশনাল লোডিং স্পিনার */}
                    <div className="flex justify-center items-center gap-3 text-gray-500">
                      <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="font-medium">Loading campaigns...</span>
                    </div>
                  </td>
                </tr>
              ) : Array.isArray(campaignsData) && campaignsData.length > 0 ? (
                campaignsData.map((item: CampaignData) => (
                  <tr key={item._id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                      {item.campaignName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="bg-gray-100 text-gray-600 border border-gray-200 px-2.5 py-1 rounded-md text-xs font-medium">
                        {item.channel}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {item.marketerId?.name || "N/A"}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {item.marketerId?.email || ""}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                      ${item.totalBudget.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {/* স্ট্যাটাস অনুযায়ী ডাইনামিক কালার */}
                      <select
                        value={item.adminApproval}
                        onChange={(e) =>
                          handleStatusChange(item._id, e.target.value)
                        }
                        className={`border rounded-lg px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer shadow-sm
                          ${
                            item.adminApproval === 'approved' 
                              ? 'bg-green-50 text-green-700 border-green-200' 
                              : item.adminApproval === 'rejected' 
                              ? 'bg-red-50 text-red-700 border-red-200' 
                              : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                          }`}
                      >
                        <option value="pending" className="text-gray-700 bg-white">Pending</option>
                        <option value="approved" className="text-gray-700 bg-white">Approved</option>
                        <option value="rejected" className="text-gray-700 bg-white">Rejected</option>
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
                      <p className="text-base font-medium text-gray-900">No campaigns found</p>
                      <p className="text-sm mt-1">Try changing the status filter to see other campaigns.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminCampaigns;