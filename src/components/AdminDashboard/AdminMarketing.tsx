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

const AdminMarketing = () => {
    const axiosAdmin = useAxiosAdmin();
    const navigate = useNavigate();

    const { data: users, isLoading } = useQuery<MarketingUser[]>({
        queryKey: ["marketing-users"],
        queryFn: async () => {
            const res = await axiosAdmin.get("/specific-users?role=marketing");
            return res.data?.data;
        },
    });

    if (isLoading) return <div className="p-10 text-center font-mono text-sm">Loading System Records...</div>;

    return (
        <div className="p-8 bg-[#F8F9FA] min-h-screen">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-black uppercase tracking-tight">Marketing Access Control</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage marketing personnel and user roles.</p>
                </div>
                <div className="text-xs font-bold bg-black text-white px-4 py-2">
                    TOTAL USERS: {users?.length || 0}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {users?.map((user) => (
                    <div
                        key={user._id}
                        className="bg-white border border-gray-200 p-5 hover:border-black transition-colors duration-200"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-100 flex items-center justify-center">
                                    <FiUser className="text-gray-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-sm text-black">{user.name}</h3>
                                    <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400">{user.role}</p>
                                </div>
                            </div>
                            <button className="text-gray-400 hover:text-black">
                                <FiMoreVertical size={18} />
                            </button>
                        </div>

                        <div className="space-y-3 bg-gray-50 p-4 border border-gray-100">
                            <div className="flex items-center gap-3 text-xs">
                                <FiMail className="text-gray-400" />
                                <span className="text-gray-700 truncate">{user.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs">
                                <FiPhone className="text-gray-400" />
                                <span className="text-gray-700">{user.phone || "No number provided"}</span>
                            </div>
                        </div>

                        <button
                            onClick={() => navigate(`/dashboard/admin/marketing/${user._id}`)}
                            className="mt-4 w-full text-[10px] font-bold uppercase py-2 border border-black hover:bg-black hover:text-white transition-all"
                        >
                            View Full Record
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminMarketing;