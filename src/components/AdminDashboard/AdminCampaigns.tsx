import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import useAxiosAdmin from "@/uri/useAxiosAdmin";
import { Bounce, ToastContainer, toast } from "react-toastify";

// আপনার ডেটা অনুযায়ী ইন্টারফেস
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
      // এখানে কনসোল লগ দিয়ে দেখুন ডেটা স্ট্রাকচার ঠিক আছে কি না
      const res = await axiosAdmin.get(`/campaigns?status=${status}`);
      return res.data?.data;
    },
  });

  console.log("Fetched Campaigns Data:", campaignsData); // ডেটা কনসোল লগে দেখুন

  const handleStatusChange = (id: string, newStatus: string) => {
    console.log(`Campaign ID: ${id}, New Status: ${newStatus}`);
    // এখানে আপনার API Patch কল হবে
    mutationUpdateStatus.mutate({ id, newStatus });
  };

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
      toast("Status updated successfully!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
      refetch();
    },
  });

  return (
    <div className="p-6">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Bounce}
      />
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">
          Campaign Management
        </h2>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            refetch();
          }}
          className="border border-gray-300 rounded-lg px-4 py-2 bg-white shadow-sm"
        >
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="overflow-x-auto shadow-md rounded-lg border border-gray-200">
        <table className="min-w-full bg-white text-left">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="px-6 py-4">Campaign Name</th>
              <th className="px-6 py-4">Channel</th>
              <th className="px-6 py-4">Marketer</th>
              <th className="px-6 py-4">Budget</th>
              <th className="px-6 py-4">Admin Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="text-center py-10">
                  Loading...
                </td>
              </tr>
            ) : Array.isArray(campaignsData) && campaignsData.length > 0 ? (
              campaignsData.map((item: CampaignData) => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{item.campaignName}</td>
                  <td className="px-6 py-4">{item.channel}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      {item.marketerId?.name || "N/A"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {item.marketerId?.email || ""}
                    </div>
                  </td>
                  <td className="px-6 py-4">{item.totalBudget} BDT</td>
                  <td className="px-6 py-4">
                    <select
                      defaultValue={item.adminApproval}
                      onChange={(e) =>
                        handleStatusChange(item._id, e.target.value)
                      }
                      className="border rounded px-3 py-1 text-sm bg-gray-50 cursor-pointer"
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-10 text-gray-500">
                  No campaigns found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCampaigns;
