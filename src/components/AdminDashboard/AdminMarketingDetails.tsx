import { useState } from "react";
import useAxiosAdmin from "@/uri/useAxiosAdmin";
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router";
import { FiChevronDown, FiArrowLeft, FiTrendingUp, FiTrendingDown, FiX } from "react-icons/fi";

interface Marketer {
    _id: string;
    name: string;
    email: string;
}

interface Campaign {
    _id: string;
    campaignName: string;
    channel: string;
    startDate: string;
    endDate: string;
    perDayCost: number;
    targetLeads: number;
    totalBudget: number;
    adminApproval: "approved" | "running" | "ended" | string;
    marketerId: Marketer | string;
    revenue: number;
    leadGenerated: number;
    createdAt: string;
    updatedAt: string;
}

interface Summary {
    totalBudget: number;
    totalTargetLeads: number;
    totalLeadGenerated: number;
    totalRevenue: number;
    profitOrLoss: number;
    status: "profit" | "loss";
}

interface ApiResponse {
    success: boolean;
    data: Campaign[];
    summary: Summary;
}

const statusStyles: Record<string, string> = {
    approved: "bg-emerald-50 text-emerald-600 border border-emerald-200",
    running: "bg-blue-50 text-blue-600 border border-blue-200",
    ended: "bg-gray-100 text-gray-600 border border-gray-200",
};

const formatCurrency = (n?: number) => new Intl.NumberFormat("en-BD").format(n || 0);
const formatDate = (d?: string) =>
    d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "-";

const SummaryCard = ({ label, value, prefix = "" }: { label: string; value: string; prefix?: string }) => (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
        <p className="text-[11px] font-bold uppercase text-gray-400 tracking-wider mb-2">{label}</p>
        <p className="text-xl font-bold text-[#1E293B]">{prefix}{value}</p>
    </div>
);

const AdminMarketingDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [statusFilter, setStatusFilter] = useState("all");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const axiosAdmin = useAxiosAdmin();

    const { data, isLoading } = useQuery<ApiResponse>({
        queryKey: ["campaign-details", id, statusFilter, startDate, endDate],
        queryFn: async () => {
            const params = new URLSearchParams();
            params.set("status", statusFilter);
            if (startDate) params.set("startDate", startDate);
            if (endDate) params.set("endDate", endDate);

            const res = await axiosAdmin.get(`/specific-users/${id}?${params.toString()}`);
            return res.data;
        },
        enabled: !!id,
    });

    const campaigns = data?.data || [];
    const summary = data?.summary;
    const isProfit = (summary?.profitOrLoss ?? 0) >= 0;
    const hasDateFilter = !!(startDate || endDate);

    const marketer =
        campaigns.length > 0 && typeof campaigns[0].marketerId === "object"
            ? (campaigns[0].marketerId as Marketer)
            : null;

    const clearDateFilter = () => {
        setStartDate("");
        setEndDate("");
    };

    return (
        <div className="p-6 md:p-8 bg-gray-50 min-h-screen text-[#1E293B]">
            {/* Back + Header */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-black mb-4"
            >
                <FiArrowLeft /> Back to Marketing List
            </button>

            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        {marketer ? marketer.name : "Campaign Details"}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {marketer ? marketer.email : "Performance overview for this marketer."}
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    {/* Date range filter */}
                    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg shadow-sm px-3 py-2">
                        <div className="flex flex-col">
                            <label className="text-[9px] font-bold uppercase text-gray-400 tracking-wider">From</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                max={endDate || undefined}
                                className="text-sm font-medium text-[#1E293B] focus:outline-none w-[120px] cursor-pointer"
                            />
                        </div>
                        <span className="text-gray-300">→</span>
                        <div className="flex flex-col">
                            <label className="text-[9px] font-bold uppercase text-gray-400 tracking-wider">To</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                min={startDate || undefined}
                                className="text-sm font-medium text-[#1E293B] focus:outline-none w-[120px] cursor-pointer"
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

                    {/* Status filter */}
                    <div className="relative w-fit">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="appearance-none bg-white border border-gray-200 text-sm font-semibold px-4 py-2.5 pr-9 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-200 cursor-pointer"
                        >
                            <option value="all">All Status</option>
                            <option value="approved">Approved</option>
                            <option value="running">Running</option>
                            <option value="ended">Ended</option>
                        </select>
                        <FiChevronDown className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            {hasDateFilter && (
                <p className="text-xs text-gray-500 mb-4 -mt-2">
                    Showing campaigns starting {startDate ? formatDate(startDate) : "the beginning"}
                    {" "}to{" "}
                    {endDate ? formatDate(endDate) : "now"}
                </p>
            )}

            {/* Summary Cards */}
            {summary && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                    <SummaryCard label="Total Budget" value={formatCurrency(summary.totalBudget)} prefix="$" />
                    <SummaryCard label="Target Leads" value={formatCurrency(summary.totalTargetLeads)} />
                    <SummaryCard label="Leads Generated" value={formatCurrency(summary.totalLeadGenerated)} />
                    <SummaryCard label="Total Revenue" value={formatCurrency(summary.totalRevenue)} prefix="$" />
                    <div
                        className={`rounded-2xl p-5 shadow-sm border flex flex-col justify-between ${
                            isProfit ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200"
                        }`}
                    >
                        <p className="text-[11px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
                            {isProfit ? (
                                <FiTrendingUp className="text-emerald-600" />
                            ) : (
                                <FiTrendingDown className="text-rose-600" />
                            )}
                            <span className={isProfit ? "text-emerald-600" : "text-rose-600"}>
                                {isProfit ? "Profit" : "Loss"}
                            </span>
                        </p>
                        <p className={`text-xl font-bold ${isProfit ? "text-emerald-700" : "text-rose-700"}`}>
                            ${formatCurrency(Math.abs(summary.profitOrLoss))}
                        </p>
                    </div>
                </div>
            )}

            {/* Campaign Table */}
            <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm bg-white">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[860px]">
                        <thead className="bg-gray-50/80">
                            <tr>
                                <th className="p-4 text-[11px] font-bold uppercase text-gray-400 tracking-wider">#</th>
                                <th className="p-4 text-[11px] font-bold uppercase text-gray-400 tracking-wider">Campaign</th>
                                <th className="p-4 text-[11px] font-bold uppercase text-gray-400 tracking-wider">Channel</th>
                                <th className="p-4 text-[11px] font-bold uppercase text-gray-400 tracking-wider">Duration</th>
                                <th className="p-4 text-[11px] font-bold uppercase text-gray-400 tracking-wider">Budget/Day</th>
                                <th className="p-4 text-[11px] font-bold uppercase text-gray-400 tracking-wider">Total Budget</th>
                                <th className="p-4 text-[11px] font-bold uppercase text-gray-400 tracking-wider">Leads</th>
                                <th className="p-4 text-[11px] font-bold uppercase text-gray-400 tracking-wider">Revenue</th>
                                <th className="p-4 text-[11px] font-bold uppercase text-gray-400 tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading &&
                                Array.from({ length: 4 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        {Array.from({ length: 9 }).map((__, j) => (
                                            <td key={j} className="p-4">
                                                <div className="h-4 bg-gray-100 rounded w-3/4" />
                                            </td>
                                        ))}
                                    </tr>
                                ))}

                            {!isLoading && campaigns.length === 0 && (
                                <tr>
                                    <td colSpan={9} className="p-10 text-center text-sm text-gray-400">
                                        No campaigns found for this filter.
                                    </td>
                                </tr>
                            )}

                            {!isLoading &&
                                campaigns.map((c, idx) => (
                                    <tr key={c._id} className="hover:bg-gray-50/60 transition-colors">
                                        <td className="p-4 text-sm font-medium text-gray-400">{idx + 1}</td>
                                        <td className="p-4 text-sm font-semibold">{c.campaignName}</td>
                                        <td className="p-4 text-sm">{c.channel}</td>
                                        <td className="p-4 text-xs text-gray-500 whitespace-nowrap">
                                            {formatDate(c.startDate)} → {formatDate(c.endDate)}
                                        </td>
                                        <td className="p-4 text-sm font-mono">${formatCurrency(c.perDayCost)}</td>
                                        <td className="p-4 text-sm font-mono">${formatCurrency(c.totalBudget)}</td>
                                        <td className="p-4 text-sm">
                                            {formatCurrency(c.leadGenerated)}
                                            <span className="text-gray-400"> / {formatCurrency(c.targetLeads)}</span>
                                        </td>
                                        <td className="p-4 text-sm font-mono">${formatCurrency(c.revenue)}</td>
                                        <td className="p-4">
                                            <span
                                                className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full ${
                                                    statusStyles[c.adminApproval] ||
                                                    "bg-gray-100 text-gray-600 border border-gray-200"
                                                }`}
                                            >
                                                {c.adminApproval}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminMarketingDetails;