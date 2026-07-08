import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import useAxiosAdmin from "@/uri/useAxiosAdmin";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import { FiArrowLeft, FiX } from "react-icons/fi";

interface Summary {
  totalLeads: number;
  totalMeetings: number;
  totalRevenue: number;
  avgLeadScore: number;
  proposalSentCount: number;
  proposalSentRate: number;
  leadsWithMeeting: number;
}

interface MonthlyTrend {
  month: string;
  leads: number;
  meetings: number;
  revenue: number;
  proposalsSent: number;
}

interface FunnelStage {
  stage: string;
  count: number;
}

interface SalesDetailsResponse {
  success: boolean;
  summary: Summary;
  leadsByStatus: Record<string, number>;
  leadsByService: Record<string, number>;
  meetingsByStatus: Record<string, number>;
  meetingsByType: Record<string, number>;
  funnel: FunnelStage[];
  monthlyTrend: MonthlyTrend[];
  leads: any[];
  meetings: any[];
}

const COLORS = ["#6366F1", "#22C55E", "#F59E0B", "#EF4444", "#06B6D4", "#EC4899", "#8B5CF6"];

const formatNumber = (n?: number) => new Intl.NumberFormat("en-BD").format(n || 0);

const toChartData = (obj: Record<string, number> = {}) =>
  Object.entries(obj).map(([name, value]) => ({ name, value }));

const SummaryCard = ({
  label,
  value,
  prefix = "",
  accent = "text-[#1E293B]",
}: {
  label: string;
  value: string;
  prefix?: string;
  accent?: string;
}) => (
  <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
    <p className="text-[11px] font-bold uppercase text-gray-400 tracking-wider mb-2">{label}</p>
    <p className={`text-xl font-bold ${accent}`}>
      {prefix}
      {value}
    </p>
  </div>
);

const ChartCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
    <h3 className="text-sm font-bold text-[#1E293B] mb-4">{title}</h3>
    <div className="h-72">{children}</div>
  </div>
);

const AdminSalesDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const axiosAdmin = useAxiosAdmin();

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data, isLoading } = useQuery<SalesDetailsResponse>({
    queryKey: ["salesman-details", id, startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);

      const res = await axiosAdmin.get(`/sales-details/${id}?${params.toString()}`);
      return res.data;
    },
    enabled: !!id,
  });

  const summary = data?.summary;
  const hasDateFilter = !!(startDate || endDate);

  const clearDateFilter = () => {
    setStartDate("");
    setEndDate("");
  };

  const leadsByStatusData = toChartData(data?.leadsByStatus);
  const leadsByServiceData = toChartData(data?.leadsByService);
  const meetingsByStatusData = toChartData(data?.meetingsByStatus);
  const funnelData = data?.funnel || [];
  const monthlyTrend = data?.monthlyTrend || [];

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen text-[#1E293B]">
      {/* Back + Header */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-black mb-4"
      >
        <FiArrowLeft /> Back to Sales List
      </button>

      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Salesman Performance</h1>
          <p className="text-sm text-gray-500 mt-1">
            Leads, meetings, and revenue overview for this salesman.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* View Leads / View Meetings */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/dashboard/admin/sales/${id}/leads`)}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#1E293B] shadow-sm transition hover:bg-gray-50 hover:border-gray-300"
            >
              View Leads
            </button>
            <button
              onClick={() => navigate(`/dashboard/admin/sales/${id}/meetings`)}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#1E293B] shadow-sm transition hover:bg-gray-50 hover:border-gray-300"
            >
              View Meetings
            </button>
          </div>

          {/* Date range filter */}
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg shadow-sm px-3 py-2 w-fit">
            <div className="flex flex-col">
              <label className="text-[9px] font-bold uppercase text-gray-400 tracking-wider">
                From
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                max={endDate || undefined}
                className="text-sm font-medium focus:outline-none w-[130px] cursor-pointer"
              />
            </div>
            <span className="text-gray-300">→</span>
            <div className="flex flex-col">
              <label className="text-[9px] font-bold uppercase text-gray-400 tracking-wider">
                To
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || undefined}
                className="text-sm font-medium focus:outline-none w-[130px] cursor-pointer"
              />
            </div>
            {hasDateFilter && (
              <button
                onClick={clearDateFilter}
                title="Clear date filter"
                className="text-gray-400 hover:text-rose-500 transition-colors ml-1"
              >
                <FiX size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {isLoading && <p className="text-sm text-gray-400">Loading data...</p>}

      {!isLoading && summary && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
            <SummaryCard label="Total Leads" value={formatNumber(summary.totalLeads)} />
            <SummaryCard label="Total Meetings" value={formatNumber(summary.totalMeetings)} />
            <SummaryCard
              label="Total Revenue"
              value={formatNumber(summary.totalRevenue)}
              prefix="$"
              accent="text-emerald-600"
            />
            <SummaryCard label="Avg Lead Score" value={formatNumber(summary.avgLeadScore)} />
            <SummaryCard
              label="Proposals Sent"
              value={formatNumber(summary.proposalSentCount)}
            />
            <SummaryCard
              label="Proposal Rate"
              value={`${summary.proposalSentRate}%`}
            />
            <SummaryCard
              label="Leads → Meeting"
              value={formatNumber(summary.leadsWithMeeting)}
            />
          </div>

          {/* Monthly trend - Area chart */}
          <div className="mb-6">
            <ChartCard title="Monthly Trend (Leads, Meetings & Revenue)">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="leads"
                    stroke="#6366F1"
                    fill="#6366F1"
                    fillOpacity={0.15}
                    name="Leads"
                  />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="meetings"
                    stroke="#22C55E"
                    fill="#22C55E"
                    fillOpacity={0.15}
                    name="Meetings"
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#F59E0B"
                    fill="#F59E0B"
                    fillOpacity={0.15}
                    name="Revenue ($)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Grid of smaller charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <ChartCard title="Leads by Status">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={leadsByStatusData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#6366F1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Meetings by Status">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={meetingsByStatusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label
                  >
                    {meetingsByStatusData.map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Leads by Service Need">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={leadsByServiceData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={80} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#06B6D4" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Conversion Funnel">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis dataKey="stage" type="category" tick={{ fontSize: 11 }} width={120} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                    {funnelData.map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </>
      )}

      {!isLoading && !summary && (
        <p className="text-sm text-gray-400 text-center py-10">No data found for this salesman.</p>
      )}
    </div>
  );
};

export default AdminSalesDetails;