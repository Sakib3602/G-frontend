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
} from "lucide-react";

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

const COLORS = ["#6366F1", "#22C55E", "#F59E0B", "#EF4444", "#06B6D4", "#EC4899", "#8B5CF6", "#0EA5E9"];

const formatNumber = (n?: number) => new Intl.NumberFormat("en-US", { notation: "compact" }).format(n || 0);
const formatFull = (n?: number) => new Intl.NumberFormat("en-BD").format(n || 0);

const toChartData = (obj: Record<string, number> = {}) =>
  Object.entries(obj).map(([name, value]) => ({ name, value }));

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
  <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm transition hover:shadow-md">
    <div className="flex items-center justify-between">
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <div className={`rounded-lg p-2 ${iconBg}`}>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </div>
    </div>
    <p className={`mt-3 text-2xl font-extrabold tracking-tight ${accent}`}>{value}</p>
  </div>
);

const ChartCard = ({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) => (
  <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm">
    <div className="mb-5">
      <h3 className="text-sm font-bold text-slate-800">{title}</h3>
      {subtitle && <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>}
    </div>
    <div className="h-72">{children}</div>
  </div>
);

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

  const deliveryRadialData = summary
    ? [{ name: "On Time", value: summary.onTimeRate, fill: "#22C55E" }]
    : [];

  const taskRadialData = summary
    ? [{ name: "Completed", value: summary.taskCompletionRate, fill: "#6366F1" }]
    : [];

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-400">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-50 to-slate-100/50 p-6 md:p-8">
      <div className="mx-auto max-w-[1400px]">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Company Overview
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Real-time performance across marketing, sales, and delivery.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm w-fit">
            <div className="flex flex-col">
              <label className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">From</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                max={endDate || undefined}
                className="text-sm font-medium focus:outline-none w-[130px] cursor-pointer"
              />
            </div>
            <span className="text-slate-300">→</span>
            <div className="flex flex-col">
              <label className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">To</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || undefined}
                className="text-sm font-medium focus:outline-none w-[130px] cursor-pointer"
              />
            </div>
            {hasDateFilter && (
              <button onClick={clearDateFilter} className="ml-1 text-slate-400 hover:text-rose-500">
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {summary && (
          <>
            {/* KPI Row */}
            <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
              <KPICard
                icon={isProfit ? TrendingUp : TrendingDown}
                label="Total Revenue"
                value={`$${formatNumber(summary.totalRevenue)}`}
                accent="text-slate-900"
                iconBg="bg-emerald-50"
                iconColor="text-emerald-600"
              />
              <KPICard
                icon={isProfit ? TrendingUp : TrendingDown}
                label={isProfit ? "Profit" : "Loss"}
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
                iconBg="bg-indigo-50"
                iconColor="text-indigo-600"
              />
              <KPICard
                icon={CheckSquare}
                label="Task Completion"
                value={`${summary.taskCompletionRate}%`}
                iconBg="bg-violet-50"
                iconColor="text-violet-600"
              />
              <KPICard
                icon={Calendar}
                label="On-Time Delivery"
                value={`${summary.onTimeRate}%`}
                iconBg="bg-amber-50"
                iconColor="text-amber-600"
              />
            </div>

            {/* Main revenue trend */}
           {/* Delivery performance + Task completion + Campaign channels + Calendar status */}
<div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-4">
  <ChartCard title="On-Time Delivery" subtitle={`${summary.missedCount} missed out of ${summary.totalCalendarItems}`}>
    <ResponsiveContainer width="100%" height="100%">
      <RadialBarChart
        innerRadius="70%"
        outerRadius="100%"
        data={deliveryRadialData}
        startAngle={90}
        endAngle={-270}
      >
        <RadialBar background dataKey="value" cornerRadius={12} />
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-slate-800 text-2xl font-extrabold"
        >
          {summary.onTimeRate}%
        </text>
      </RadialBarChart>
    </ResponsiveContainer>
  </ChartCard>

  <ChartCard title="Task Completion" subtitle={`${summary.completedTasks} of ${summary.totalTasks} tasks`}>
    <ResponsiveContainer width="100%" height="100%">
      <RadialBarChart
        innerRadius="70%"
        outerRadius="100%"
        data={taskRadialData}
        startAngle={90}
        endAngle={-270}
      >
        <RadialBar background dataKey="value" cornerRadius={12} />
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-slate-800 text-2xl font-extrabold"
        >
          {summary.taskCompletionRate}%
        </text>
      </RadialBarChart>
    </ResponsiveContainer>
  </ChartCard>

  <ChartCard title="Campaigns by Channel">
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={campaignByChannelData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={85}
          label
        >
          {campaignByChannelData.map((_, idx) => (
            <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  </ChartCard>

  {/* ✅ নতুন চার্ট — calendarItemsByStatusData এখন ব্যবহার হচ্ছে */}
  <ChartCard title="Content Items by Status" subtitle={`${summary.totalCalendarItems} total items`}>
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={calendarItemsByStatusData} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis type="number" tick={{ fontSize: 12 }} />
        <YAxis dataKey="name" type="category" tick={{ fontSize: 9 }} width={90} />
        <Tooltip />
        <Bar dataKey="value" radius={[0, 6, 6, 0]}>
          {calendarItemsByStatusData.map((_, idx) => (
            <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </ChartCard>
</div>
            {/* Funnel + Leads/Meetings trend */}
            <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
              <ChartCard title="Sales Funnel" subtitle="Lead to signed deal conversion">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={funnelData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis dataKey="stage" type="category" tick={{ fontSize: 11 }} width={100} />
                    <Tooltip />
                    <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                      {funnelData.map((_, idx) => (
                        <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Leads & Meetings Volume" subtitle="Monthly activity">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="leads" fill="#6366F1" radius={[6, 6, 0, 0]} name="Leads" />
                    <Bar dataKey="meetings" fill="#06B6D4" radius={[6, 6, 0, 0]} name="Meetings" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            {/* Delivery performance + Task completion + Campaign channels */}
            <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
              <ChartCard title="On-Time Delivery" subtitle={`${summary.missedCount} missed out of ${summary.totalCalendarItems}`}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    innerRadius="70%"
                    outerRadius="100%"
                    data={deliveryRadialData}
                    startAngle={90}
                    endAngle={-270}
                  >
                    <RadialBar background dataKey="value" cornerRadius={12} />
                    <text
                      x="50%"
                      y="50%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="fill-slate-800 text-2xl font-extrabold"
                    >
                      {summary.onTimeRate}%
                    </text>
                  </RadialBarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Task Completion" subtitle={`${summary.completedTasks} of ${summary.totalTasks} tasks`}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    innerRadius="70%"
                    outerRadius="100%"
                    data={taskRadialData}
                    startAngle={90}
                    endAngle={-270}
                  >
                    <RadialBar background dataKey="value" cornerRadius={12} />
                    <text
                      x="50%"
                      y="50%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="fill-slate-800 text-2xl font-extrabold"
                    >
                      {summary.taskCompletionRate}%
                    </text>
                  </RadialBarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Campaigns by Channel">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={campaignByChannelData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={85}
                      label
                    >
                      {campaignByChannelData.map((_, idx) => (
                        <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            {/* Leads by status/service + Compliance */}
            <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
              <ChartCard title="Leads by Status">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={leadsByStatusData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={50} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#6366F1" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Leads by Service Need">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={leadsByServiceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} label>
                      {leadsByServiceData.map((_, idx) => (
                        <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Compliance Submissions" subtitle={`${summary.totalCompliance} total`}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={complianceByCategoryData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={110} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#EC4899" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            {/* Employee Leaderboard */}
            <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Top Performers</h3>
                  <p className="mt-0.5 text-xs text-slate-400">Ranked by revenue contribution</p>
                </div>
                <MessageSquare className="h-4 w-4 text-slate-300" />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[720px]">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="pb-3 text-[11px] font-bold uppercase text-slate-400">#</th>
                      <th className="pb-3 text-[11px] font-bold uppercase text-slate-400">Employee</th>
                      <th className="pb-3 text-[11px] font-bold uppercase text-slate-400">Role</th>
                      <th className="pb-3 text-[11px] font-bold uppercase text-slate-400">Revenue</th>
                      <th className="pb-3 text-[11px] font-bold uppercase text-slate-400">Leads</th>
                      <th className="pb-3 text-[11px] font-bold uppercase text-slate-400">Meetings</th>
                      <th className="pb-3 text-[11px] font-bold uppercase text-slate-400">Tasks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {leaderboard.map((emp, idx) => (
                      <tr key={emp.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 text-sm font-bold text-slate-300">{idx + 1}</td>
                        <td className="py-3">
                          <p className="text-sm font-semibold text-slate-800">{emp.name}</p>
                          <p className="text-xs text-slate-400">{emp.email}</p>
                        </td>
                        <td className="py-3">
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-500">
                            {emp.role}
                          </span>
                        </td>
                        <td className="py-3 text-sm font-mono font-semibold text-emerald-600">
                          ${formatFull(emp.revenue)}
                        </td>
                        <td className="py-3 text-sm">{emp.leadsCreated}</td>
                        <td className="py-3 text-sm">{emp.meetingsScheduled}</td>
                        <td className="py-3 text-sm">
                          {emp.tasksCompleted}/{emp.tasksTotal}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {leaderboard.length === 0 && (
                  <p className="py-10 text-center text-sm text-slate-400">No employee activity found for this range.</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminIndex;