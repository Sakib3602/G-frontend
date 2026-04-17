import React, { useMemo, useState } from "react";
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  BarChart3,
  DollarSign,
  X,
  Wallet,
  Loader2,
} from "lucide-react";
import { useUserDataMarketing } from "./HOOK/User_Data_Marketer";
import { useQuery } from "@tanstack/react-query";
import useAxiosMarketing from "@/uri/useAxiosMarketing";

// TypeScript Interfaces
export interface Campaign {
  id: string;
  campaignName: string;
  channel: string;
  startDate: string;
  endDate: string;
  perDayCost: number;
  targetLeads: number;
  totalBudget: number;
  revenue?: number;
  adminApproval?: "pending" | "approved" | "rejected";
}

type ApiCampaign = Partial<Campaign> & {
  _id?: string;
  id?: string;
  totalRevenue?: number;
};

type CampaignStatusFilter = "all" | "approved" | "pending" | "rejected";

const normalizeStatus = (status?: string): Campaign["adminApproval"] => {
  if (status === "approved" || status === "pending" || status === "rejected") {
    return status;
  }
  return "pending";
};

const mapCampaign = (campaign: ApiCampaign): Campaign => {
  const parsedStatus = String(campaign.adminApproval ?? "pending").toLowerCase();
  return {
    id: String(campaign.id ?? campaign._id ?? ""),
    campaignName: String(campaign.campaignName ?? "Untitled Campaign"),
    channel: String(campaign.channel ?? "Unknown"),
    startDate: String(campaign.startDate ?? ""),
    endDate: String(campaign.endDate ?? ""),
    perDayCost: Number(campaign.perDayCost ?? 0),
    targetLeads: Number(campaign.targetLeads ?? 0),
    totalBudget: Number(campaign.totalBudget ?? 0),
    revenue: Number(campaign.revenue ?? campaign.totalRevenue ?? 0),
    adminApproval: normalizeStatus(parsedStatus),
  };
};

const formatDate = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString();
};

const MarketingAllCampaign = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<CampaignStatusFilter>("all");
  const [isRevenueModalOpen, setIsRevenueModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [revenueAmount, setRevenueAmount] = useState("");
  const { userData } = useUserDataMarketing();
  const axiosMarketing = useAxiosMarketing();

  const {
    data: campaigns = [],
    isLoading,
    isError,
    error,
  } = useQuery<Campaign[]>({
    queryKey: ["allCampaigns", userData?._id],
    enabled: Boolean(userData?._id),
    queryFn: async () => {
      const res = await axiosMarketing.get(`/campaigns/all-campaigns/${userData?._id}`);
      const payload = (res.data?.data ?? res.data) as ApiCampaign[];
      if (!Array.isArray(payload)) return [];
      return payload.map(mapCampaign);
    },
  });

  // Summary cards
  const approvedCount = campaigns.filter((c) => c.adminApproval === "approved").length;
  const pendingCount = campaigns.filter((c) => c.adminApproval === "pending").length;
  const rejectedCount = campaigns.filter((c) => c.adminApproval === "rejected").length;

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((campaign) => {
      const isStatusMatched = filterStatus === "all" ? true : campaign.adminApproval === filterStatus;
      const query = searchTerm.trim().toLowerCase();
      const isSearchMatched =
        campaign.campaignName.toLowerCase().includes(query) || campaign.channel.toLowerCase().includes(query);

      return isStatusMatched && isSearchMatched;
    });
  }, [campaigns, filterStatus, searchTerm]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
  };

  const handleFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as CampaignStatusFilter;
    setFilterStatus(value);
  };

  const openRevenueModal = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setRevenueAmount("");
    setIsRevenueModalOpen(true);
  };

  const closeRevenueModal = () => {
    setIsRevenueModalOpen(false);
    setSelectedCampaign(null);
    setRevenueAmount("");
  };

  const handleRevenueSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const parsedAmount = Number(revenueAmount);
    if (!selectedCampaign || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return;
    }

    console.log("Revenue submitted:", {
      campaignId: selectedCampaign.id,
      campaignName: selectedCampaign.campaignName,
      revenue: parsedAmount,
    });

    closeRevenueModal();
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[45vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
        Failed to load campaigns. {error instanceof Error ? error.message : "Please try again."}
      </div>
    );
  }

  // স্ট্যাটাস অনুযায়ী ব্যাজের কালার দেওয়ার ফাংশন
  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium  text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Approved
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" /> Pending
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" /> Rejected
          </span>
        );
      default:
        return <span className="text-slate-400">-</span>;
    }
  };

  return (
    <div className="mx-auto min-h-screen max-w-7xl space-y-6 p-6">
      
      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Campaign Management</h1>
          <p className="mt-1 text-sm text-slate-500">Monitor status, performance, and revenue updates in one place.</p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200/70 bg-slate-50/60 px-3 py-1 text-xs font-medium text-slate-600 backdrop-blur-md">
          <Wallet className="h-3.5 w-3.5 text-slate-500" />
          Total Campaigns: {campaigns.length}
        </span>
      </div>

      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="flex items-center justify-between rounded-2xl border border-slate-200/60 bg-slate-50/60 p-5 shadow-sm backdrop-blur-md">
          <div>
            <p className="text-sm font-medium text-slate-500">Approved Campaigns</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{approvedCount}</p>
          </div>
          <div className="rounded-xl bg-emerald-100/65 p-3 text-emerald-600 backdrop-blur-sm">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-slate-200/60 bg-slate-50/60 p-5 shadow-sm backdrop-blur-md">
          <div>
            <p className="text-sm font-medium text-slate-500">Pending Approval</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{pendingCount}</p>
          </div>
          <div className="rounded-xl bg-amber-100/65 p-3 text-amber-600 backdrop-blur-sm">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-slate-200/60 bg-slate-50/60 p-5 shadow-sm backdrop-blur-md">
          <div>
            <p className="text-sm font-medium text-slate-500">Rejected</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{rejectedCount}</p>
          </div>
          <div className="rounded-xl bg-rose-100/65 p-3 text-rose-600 backdrop-blur-sm">
            <XCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Action Bar (Search & Filter) */}
      <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-200/60 bg-slate-50/60 p-4 shadow-sm backdrop-blur-md sm:flex-row">
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search campaigns..."
            className="w-full rounded-xl border border-slate-200/70 bg-slate-50/60 py-2 pl-10 pr-4 text-sm transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="relative w-full sm:w-auto flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={filterStatus}
            onChange={handleFilter}
            className="w-full cursor-pointer rounded-xl border border-slate-200/70 bg-slate-50/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:w-48"
          >
            <option value="all">All Status</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-slate-50/60 shadow-sm backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/70 bg-slate-50/60">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Campaign Name</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Channel</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Budget</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Target Leads</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Revenue</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCampaigns.map((campaign) => (
                <tr key={campaign.id} className="transition-colors hover:bg-slate-50/30">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900">{campaign.campaignName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="rounded-md border border-slate-200/70 bg-slate-50/60 px-2.5 py-1 text-sm text-slate-600 backdrop-blur-sm">{campaign.channel}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900">{formatDate(campaign.startDate)}</div>
                    <div className="text-xs text-slate-500">to {formatDate(campaign.endDate)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900">${campaign.totalBudget}</div>
                    <div className="text-xs text-slate-500">${campaign.perDayCost} / day</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-sm text-slate-600">
                      <BarChart3 className="w-4 h-4 text-slate-400" />
                      {campaign.targetLeads}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-slate-700">
                      <DollarSign className="h-4 w-4 text-slate-500" />
                      {campaign.revenue && campaign.revenue > 0 ? `$${campaign.revenue.toLocaleString()}` : "--"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(campaign.adminApproval)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {campaign.adminApproval === "approved" ? (
                      <button
                        type="button"
                        onClick={() => openRevenueModal(campaign)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200/80 bg-emerald-50/65 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100/80"
                      >
                        <DollarSign className="h-3.5 w-3.5" />
                        Add Revenue
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400">Not available</span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredCampaigns.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-6 py-10 text-center text-sm text-slate-500">
                    No campaigns found for your current search/filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Revenue Modal */}
      {isRevenueModalOpen && selectedCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-[1px]">
          <div className="w-full max-w-md rounded-2xl border border-slate-200/80 bg-slate-50/60 p-5 shadow-xl backdrop-blur-md">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Add Campaign Revenue</h2>
                <p className="mt-1 text-sm text-slate-500">{selectedCampaign.campaignName}</p>
              </div>
              <button
                type="button"
                onClick={closeRevenueModal}
                className="rounded-md p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleRevenueSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Revenue Amount
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">$</span>
                  <input
                    type="number"
                    min={1}
                    step="0.01"
                    value={revenueAmount}
                    onChange={(e) => setRevenueAmount(e.target.value)}
                    placeholder="Enter revenue"
                    required
                    className="w-full rounded-xl border border-slate-200/80 bg-slate-50/60 py-2 pl-8 pr-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={closeRevenueModal}
                  className="rounded-lg border border-slate-300/90 bg-slate-50/60 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Submit Revenue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default MarketingAllCampaign;