import React from "react";
import useAxiosMarketing from "@/uri/useAxiosMarketing";
import { useUserDataMarketing } from "./HOOK/User_Data_Marketer";
import { useQuery } from "@tanstack/react-query";
import { 
  Wallet, TrendingUp, Target, Activity, 
  CheckCircle2, Clock, Users, Briefcase, 
  AlertCircle, DollarSign
} from "lucide-react";

type StatCardProps = {
  title: string;
  value: string | number;
  icon: React.ComponentType<any>;
  subtitle?: string;
  trend?: React.ReactNode;
};

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, subtitle, trend }) => (
  <div className="relative overflow-hidden bg-white border border-slate-100 rounded-2xl p-6 transition-all duration-300 hover:shadow-md group">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
        {subtitle && (
          <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
            {trend && <span className="text-[#F7941D]">{trend}</span>}
            {subtitle}
          </p>
        )}
      </div>
      <div className="p-3 bg-[#F7941D]/10 rounded-xl text-[#F7941D] group-hover:scale-110 transition-transform duration-300">
        <Icon size={24} strokeWidth={1.5} />
      </div>
    </div>
    <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-[#F7941D]/20 blur-2xl rounded-full"></div>
  </div>
);

const MarketingIndex = () => {
  const { userData } = useUserDataMarketing();
  const axiosMarketing = useAxiosMarketing();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard_for_marketer", userData?._id],
    queryFn: async () => {
      const res = await axiosMarketing.get(`/dashboard/${userData?._id}`);
      // Ensure we are returning the exact object, sometimes APIs wrap it in res.data.data
      return res.data?.data || res.data; 
    },
    enabled: !!userData?._id, 
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-red-600">
        Failed to load dashboard data.
      </div>
    );
  }

  // Safely destructure with default empty objects so it never crashes
  const { campaigns = {}, tasks = {}, qualified = {} } = data;

  const formatCurrency = (amount : number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6 md:p-8 font-sans">
      
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
          Marketing Overview
        </h1>
        <p className="text-slate-600">
          Welcome back. Here is what's happening with your campaigns today.
        </p>
      </div>

      <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <DollarSign size={18} className="text-[#F7941D]" /> Financials
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Added Optional Chaining here */}
          <StatCard 
            title="Total Budget" 
            value={formatCurrency(campaigns?.budget?.total)} 
            icon={Wallet} 
          />
          <StatCard 
            title="Total Revenue" 
            value={formatCurrency(campaigns?.budget?.revenue)} 
            icon={TrendingUp} 
          />
          <StatCard 
            title="Net Profit" 
            value={formatCurrency(campaigns?.budget?.profit)} 
            icon={Activity} 
            subtitle="Calculated from revenue - budget"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        <div>
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Target size={18} className="text-[#F7941D]" /> Campaigns ({campaigns?.total || 0})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StatCard 
              title="Active Campaigns" 
              value={campaigns?.active || 0} 
              icon={Activity} 
            />
            <StatCard 
              title="Pending Approval" 
              value={campaigns?.approvalStatus?.pending || 0} 
              icon={Clock} 
            />
            <StatCard 
              title="Approved" 
              value={campaigns?.approvalStatus?.approved || 0} 
              icon={CheckCircle2} 
            />
            <StatCard 
              title="Rejected" 
              value={campaigns?.approvalStatus?.rejected || 0} 
              icon={AlertCircle} 
            />
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Briefcase size={18} className="text-[#F7941D]" /> Task Management ({tasks?.total || 0})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                <p className="text-sm text-gray-400">Pending</p>
                <p className="text-xl font-bold mt-1 text-white">{tasks?.byStatus?.pending || 0}</p>
              </div> */}
              <div className="bg-white/5 border border-[#F7941D]/30 rounded-xl p-4 text-center">
                <p className="text-sm text-[#F7941D]">In Progress</p>
                <p className="text-xl font-bold mt-1 text-[#F7941D]">{tasks?.byStatus?.pending || 0}</p>
              </div>
              <div className="bg-white/5 border border-[#F7941D]/30 rounded-xl p-4 text-center">
                <p className="text-sm text-[#F7941D]">In Progress</p>
                <p className="text-xl font-bold mt-1 text-[#F7941D]">{tasks?.byStatus?.inProgress || 0}</p>
              </div>
              <div className="bg-white/5 border border-green-500/30 rounded-xl p-4 text-center">
                <p className="text-sm text-green-400">Completed</p>
                <p className="text-xl font-bold mt-1 text-green-400">{tasks?.byStatus?.completed || 0}</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Users size={18} className="text-[#F7941D]" /> Lead Qualification ({qualified?.total || 0})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <StatCard 
                title="Successfully Signed" 
                value={qualified?.signed || 0} 
                icon={CheckCircle2} 
              />
              <StatCard 
                title="Pending Signature" 
                value={qualified?.pendingSignature || 0} 
                icon={Clock} 
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MarketingIndex;