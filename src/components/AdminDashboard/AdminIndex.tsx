import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import useAxiosAdmin from "@/uri/useAxiosAdmin";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  CheckSquare,
  Calendar,
  MessageSquare,
  X,
  Calendar as CalendarIcon,
} from "lucide-react";

// --- Interfaces ---
interface Summary {
  totalRevenue: number;
  totalBudget: number;
  profitOrLoss: number;
  totalLeads: number;
  totalMeetings: number;
  totalQualified: number;
  signedCount: number;
  proposalSentCount: number;
  totalTasks: number;
  completedTasks: number;
  taskCompletionRate: number;
  totalCalendarItems: number;
  deliveredOnTime: number;
  missedCount: number;
  onTimeRate: number;
  totalCompliance: number;
  totalEmployees: number;
}

interface MonthlyTrend {
  month: string;
  revenue: number;
  budget: number;
  profit: number;
  leads: number;
  meetings: number;
}

interface FunnelStage {
  stage: string;
  count: number;
}

interface EmployeeStat {
  id: string;
  name: string;
  email: string;
  role: string;
  revenue: number;
  leadsCreated: number;
  meetingsScheduled: number;
  tasksCompleted: number;
  tasksTotal: number;
  calendarItemsHandled: number;
}

interface DashboardResponse {
  success: boolean;
  summary: Summary;
  campaignByChannel: Record<string, number>;
  campaignByStatus: Record<string, number>;
  leadsByStatus: Record<string, number>;
  leadsByService: Record<string, number>;
  meetingsByStatus: Record<string, number>;
  marketingTaskByStatus: Record<string, number>;
  calendarItemsByStatus: Record<string, number>;
  reportsByReason: Record<string, number>;
  complianceByCategory: Record<string, number>;
  complianceByStatus: Record<string, number>;
  funnel: FunnelStage[];
  monthlyTrend: MonthlyTrend[];
  leaderboard: EmployeeStat[];
}

// --- Constants & Helpers ---
const COLORS = ["#4F46E5", "#10B981", "#F59E0B", "#F43F5E", "#0EA5E9", "#8B5CF6", "#EC4899", "#14B8A6"];

const formatNumber = (n?: number) => new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n || 0);
const formatFull = (n?: number) => new Intl.NumberFormat("en-US").format(n || 0);

const toChartData = (obj: Record<string, number> = {}) =>
  Object.entries(obj).map(([name, value]) => ({ name, value }));

// --- UI Components ---
const KPICard = ({
  icon: Icon,
  label,
  value,
  accent = "text-slate-900",
  iconBg = "bg-slate-100",
  iconColor = "text-slate-500",
}: {
  icon: any;
  label: string;
  value: string;
  accent?: string;
  iconBg?: string;
  iconColor?: string;
}) => (
  <div className="poppins-regular group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all hover:border-slate-300 hover:shadow-md">
    <div className="flex items-center justify-between">
      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">{label}</p>
      <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconBg} transition-transform group-hover:scale-110`}>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </div>
    </div>
    <p className={`mt-4 text-3xl font-black tracking-tight ${accent}`}>{value}</p>
  </div>
);

const ChartCard = ({ title, subtitle, children, className = "" }: { title: string; subtitle?: string; children: React.ReactNode, className?: string }) => (
  <div className={`flex flex-col rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] ${className}`}>
    <div className="mb-6">
      <h3 className="text-base font-bold text-slate-900">{title}</h3>
      {subtitle && <p className="mt-1 text-xs font-medium text-slate-500">{subtitle}</p>}
    </div>
    <div className="min-h-[260px] flex-1">{children}</div>
  </div>
);

// --- Main Page Component ---
const AdminIndex = () => {
  const axiosAdmin = useAxiosAdmin();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data, isLoading } = useQuery<DashboardResponse>({
    queryKey: ["admin-dashboard", startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);
      const res = await axiosAdmin.get(`/dashboard-overview?${params.toString()}`);
      return res.data;
    },
  });

  const summary = data?.summary;
  const isProfit = (summary?.profitOrLoss ?? 0) >= 0;
  const hasDateFilter = !!(startDate || endDate);

  const clearDateFilter = () => {
    setStartDate("");
    setEndDate("");
  };

  const campaignByChannelData = toChartData(data?.campaignByChannel);
  const leadsByStatusData = toChartData(data?.leadsByStatus);
  const leadsByServiceData = toChartData(data?.leadsByService);
  const calendarItemsByStatusData = toChartData(data?.calendarItemsByStatus);
  const complianceByCategoryData = toChartData(data?.complianceByCategory);
  const funnelData = data?.funnel || [];
  const monthlyTrend = data?.monthlyTrend || [];
  const leaderboard = (data?.leaderboard || []).slice(0, 10);

  const deliveryRadialData = summary ? [{ name: "On Time", value: summary.onTimeRate, fill: "#10B981" }] : [];
  const taskRadialData = summary ? [{ name: "Completed", value: summary.taskCompletionRate, fill: "#4F46E5" }] : [];

  if (isLoading) {
    return (
      <div className="poppins-regular flex min-h-screen flex-col items-center justify-center bg-slate-50 gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
        <p className="text-sm font-semibold text-slate-500">Compiling analytics...</p>
      </div>
    );
  }

  return (
    <div className=" poppins-regular min-h-screen w-full bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-[1600px]">
        
        {/* --- Page Header & Controls --- */}
        <div className="mb-8 flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Company Overview
            </h1>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Real-time performance across marketing, sales, and delivery operations.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-1.5 shadow-inner">
            <div className="flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 shadow-sm border border-slate-100">
              <CalendarIcon className="h-4 w-4 text-slate-400" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                max={endDate || undefined}
                className="text-xs font-semibold text-slate-700 focus:outline-none bg-transparent cursor-pointer w-[110px]"
              />
            </div>
            <span className="text-xs font-bold text-slate-300 uppercase">To</span>
            <div className="flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 shadow-sm border border-slate-100">
              <CalendarIcon className="h-4 w-4 text-slate-400" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || undefined}
                className="text-xs font-semibold text-slate-700 focus:outline-none bg-transparent cursor-pointer w-[110px]"
              />
            </div>
            {hasDateFilter && (
              <button onClick={clearDateFilter} className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-colors border border-slate-100 shadow-sm">
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {summary && (
          <div className="space-y-6">
            {/* --- Row 1: KPI Cards --- */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
              <KPICard
                icon={TrendingUp}
                label="Total Revenue"
                value={`$${formatNumber(summary.totalRevenue)}`}
                iconBg="bg-indigo-50"
                iconColor="text-indigo-600"
              />
              <KPICard
                icon={isProfit ? TrendingUp : TrendingDown}
                label={isProfit ? "Net Profit" : "Net Loss"}
                value={`$${formatNumber(Math.abs(summary.profitOrLoss))}`}
                accent={isProfit ? "text-emerald-600" : "text-rose-600"}
                iconBg={isProfit ? "bg-emerald-50" : "bg-rose-50"}
                iconColor={isProfit ? "text-emerald-600" : "text-rose-600"}
              />
              <KPICard
                icon={Target}
                label="Total Leads"
                value={formatFull(summary.totalLeads)}
                iconBg="bg-blue-50"
                iconColor="text-blue-600"
              />
              <KPICard
                icon={Users}
                label="Meetings"
                value={formatFull(summary.totalMeetings)}
                iconBg="bg-amber-50"
                iconColor="text-amber-600"
              />
              <KPICard
                icon={CheckSquare}
                label="Task Success"
                value={`${summary.taskCompletionRate}%`}
                iconBg="bg-purple-50"
                iconColor="text-purple-600"
              />
              <KPICard
                icon={Calendar}
                label="On-Time Rate"
                value={`${summary.onTimeRate}%`}
                iconBg="bg-teal-50"
                iconColor="text-teal-600"
              />
            </div>

            {/* --- Row 2: Wide Analytical Charts --- */}
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <ChartCard title="Leads & Meetings Volume" subtitle="Monthly acquisition and scheduling activity">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
                    <YAxis tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: '#F8FAFC' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '13px', fontWeight: 500 }} />
                    <Bar dataKey="leads" fill="#4F46E5" radius={[4, 4, 0, 0]} name="Leads Generated" maxBarSize={40} />
                    <Bar dataKey="meetings" fill="#0EA5E9" radius={[4, 4, 0, 0]} name="Meetings Booked" maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Pipeline Conversion Funnel" subtitle="Lead drop-off across critical stages">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={funnelData} layout="vertical" margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                    <XAxis type="number" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis dataKey="stage" type="category" tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} width={120} />
                    <Tooltip cursor={{ fill: '#F8FAFC' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={32}>
                      {funnelData.map((_, idx) => (
                        <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            {/* --- Row 3: Radials & Donuts --- */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
              <ChartCard title="On-Time Delivery" subtitle={`${summary.missedCount} missed of ${summary.totalCalendarItems}`}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart innerRadius="75%" outerRadius="100%" data={deliveryRadialData} startAngle={90} endAngle={-270}>
                    <RadialBar background={{ fill: '#F1F5F9' }} dataKey="value" cornerRadius={12} />
                    <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-slate-900 text-3xl font-black">
                      {summary.onTimeRate}%
                    </text>
                  </RadialBarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Task Completion" subtitle={`${summary.completedTasks} completed of ${summary.totalTasks}`}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart innerRadius="75%" outerRadius="100%" data={taskRadialData} startAngle={90} endAngle={-270}>
                    <RadialBar background={{ fill: '#F1F5F9' }} dataKey="value" cornerRadius={12} />
                    <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-slate-900 text-3xl font-black">
                      {summary.taskCompletionRate}%
                    </text>
                  </RadialBarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Campaigns by Channel" subtitle="Active distribution networks">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={campaignByChannelData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={2}>
                      {campaignByChannelData.map((_, idx) => (
                        <Cell key={idx} fill={COLORS[idx % COLORS.length]} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Leads by Service" subtitle="Requested product categories">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={leadsByServiceData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={2}>
                      {leadsByServiceData.map((_, idx) => (
                        <Cell key={idx} fill={COLORS[(idx + 2) % COLORS.length]} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            {/* --- Row 4: Status Breakdown Bars --- */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <ChartCard title="Leads by Status">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={leadsByStatusData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" tick={{ fill: '#64748B', fontSize: 10 }} interval={0} angle={-25} textAnchor="end" axisLine={false} tickLine={false} dy={10} />
                    <YAxis tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: '#F8FAFC' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="value" fill="#8B5CF6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Content Items" subtitle="By publication status">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={calendarItemsByStatusData} layout="vertical" margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                    <XAxis type="number" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis dataKey="name" type="category" tick={{ fill: '#475569', fontSize: 11, fontWeight: 500 }} width={90} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: '#F8FAFC' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="value" fill="#0EA5E9" radius={[0, 4, 4, 0]} maxBarSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Compliance Log" subtitle={`${summary.totalCompliance} total records submitted`}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={complianceByCategoryData} layout="vertical" margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                    <XAxis type="number" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis dataKey="name" type="category" tick={{ fill: '#475569', fontSize: 11, fontWeight: 500 }} width={110} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: '#F8FAFC' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="value" fill="#F43F5E" radius={[0, 4, 4, 0]} maxBarSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            {/* --- Row 5: Employee Leaderboard --- */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Top Performers</h3>
                  <p className="mt-1 text-sm font-medium text-slate-500">Employee activity ranked by revenue contribution</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 border border-slate-100">
                  <MessageSquare className="h-5 w-5 text-slate-400" />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/50">
                      <th className="py-4 pl-4 text-xs font-bold uppercase tracking-wider text-slate-500">Rank</th>
                      <th className="py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Employee Details</th>
                      <th className="py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Department</th>
                      <th className="py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Generated Revenue</th>
                      <th className="py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Acquisition</th>
                      <th className="py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Task Completion</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {leaderboard.map((emp, idx) => (
                      <tr key={emp.id} className="group transition-colors hover:bg-slate-50/70">
                        <td className="py-4 pl-4">
                          <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${idx < 3 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                            #{idx + 1}
                          </span>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-sm font-bold text-indigo-600 border border-indigo-100">
                              {emp.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{emp.name}</p>
                              <p className="text-xs font-medium text-slate-500">{emp.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4">
                          <span className="rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-600">
                            {emp.role}
                          </span>
                        </td>
                        <td className="py-4">
                          <span className="text-sm font-bold text-emerald-600">
                            ${formatFull(emp.revenue)}
                          </span>
                        </td>
                        <td className="py-4">
                          <div className="flex gap-4">
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-slate-900">{emp.leadsCreated}</span>
                              <span className="text-[10px] uppercase text-slate-400 font-semibold">Leads</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-slate-900">{emp.meetingsScheduled}</span>
                              <span className="text-[10px] uppercase text-slate-400 font-semibold">Meetings</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 pr-4">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 overflow-hidden rounded-full bg-slate-100 h-2">
                              <div 
                                className="h-full rounded-full bg-indigo-500" 
                                style={{ width: `${emp.tasksTotal > 0 ? (emp.tasksCompleted / emp.tasksTotal) * 100 : 0}%` }}
                              />
                            </div>
                            <span className="text-xs font-bold text-slate-700 w-10 text-right">
                              {emp.tasksCompleted}/{emp.tasksTotal}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {leaderboard.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                    <Users className="mb-2 h-8 w-8 opacity-20" />
                    <p className="text-sm font-medium">No employee activity found for this time range.</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default AdminIndex;