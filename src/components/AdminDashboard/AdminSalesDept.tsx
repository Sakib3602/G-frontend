import useAxiosAdmin from "@/uri/useAxiosAdmin";
import { useQuery } from "@tanstack/react-query";
import { FiUser, FiMail, FiPhone, FiMoreVertical } from "react-icons/fi";
import { useNavigate } from "react-router";

interface MarketingUser {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    role: string;
}

const AdminSalesDept = () => {
    const axiosAdmin = useAxiosAdmin();
    const navigate = useNavigate();

    const { data: users, isLoading } = useQuery<MarketingUser[]>({
        queryKey: ["sales-users"],
        queryFn: async () => {
            const res = await axiosAdmin.get("/specific-users?role=sales");
            return res.data?.data;
        },
    });

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#F8F9FA]">
                <div className="flex items-center gap-3 text-gray-500">
                    <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="font-medium">Loading records...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 bg-[#F8F9FA] min-h-screen">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Sales Access Control</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage sales personnel and user roles.</p>
                </div>
                <div className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg shadow-sm text-sm font-medium">
                    Total Users: <span className="font-bold text-blue-600">{users?.length || 0}</span>
                </div>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {users?.map((user) => (
                    <div
                        key={user._id}
                        className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col"
                    >
                        {/* Card Header */}
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                                    <FiUser className="text-blue-600" size={20} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 leading-tight">{user.name}</h3>
                                    <span className="inline-flex mt-1 items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-gray-100 text-gray-600 uppercase tracking-wider">
                                        {user.role}
                                    </span>
                                </div>
                            </div>
                            <button className="text-gray-400 hover:text-gray-700 transition-colors p-1.5 rounded-lg hover:bg-gray-100 -mr-2">
                                <FiMoreVertical size={18} />
                            </button>
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-3 mb-6 grow">
                            <div className="flex items-center gap-3 text-sm">
                                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100">
                                    <FiMail className="text-gray-500" size={14} />
                                </div>
                                <span className="text-gray-700 truncate font-medium">{user.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100">
                                    <FiPhone className="text-gray-500" size={14} />
                                </div>
                                <span className={`${user.phone ? "text-gray-700 font-medium" : "text-gray-400 italic"}`}>
                                    {user.phone || "No number provided"}
                                </span>
                            </div>
                        </div>

                        {/* Action Button */}
                        <button
                            onClick={() => navigate(`/dashboard/admin/sales/${user._id}`)}
                            className="w-full cursor-pointer text-sm font-semibold text-gray-700 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            View Full Record
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminSalesDept;