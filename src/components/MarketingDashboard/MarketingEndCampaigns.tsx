import { useState } from "react";
import { BarChart3, CalendarDays, CheckCircle2, Clock3, Filter, Loader2, Search, Sparkles, Target, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import useAxiosMarketing from "@/uri/useAxiosMarketing";
import { useUserDataMarketing } from "./HOOK/User_Data_Marketer";
import type { Campaign } from "./MarketingAllCampaign";

type CompletedCampaignApi = Partial<Campaign> & {
  _id?: string;
  id?: string;
  name?: string;
  title?: string;
  campaign?: string;
};

const formatDate = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString();
};

const formatCurrency = (value?: number) => {
  if (!value || value <= 0) return "--";
  return `$${value.toLocaleString()}`;
};

const mapCompletedCampaign = (campaign: CompletedCampaignApi): Campaign => {
  return {
    id: String(campaign.id ?? campaign._id ?? ""),
    campaignName: String(campaign.campaignName ?? campaign.name ?? campaign.title ?? campaign.campaign ?? "Untitled Campaign"),
    channel: String(campaign.channel ?? "Unknown"),
    startDate: String(campaign.startDate ?? ""),
    endDate: String(campaign.endDate ?? ""),
    perDayCost: Number(campaign.perDayCost ?? 0),
    targetLeads: Number(campaign.targetLeads ?? 0),
    totalBudget: Number(campaign.totalBudget ?? 0),
    revenue: Number(campaign.revenue ?? 0),
    adminApproval: campaign.adminApproval,
  };
};

const MarketingEndCampaigns = () => {
  const { userData } = useUserDataMarketing();
  const axiosMarketing = useAxiosMarketing();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "revenue" | "budget">("recent");
  const [isRevenueModalOpen, setIsRevenueModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [revenueInput, setRevenueInput] = useState("");

  const {
    data: campaigns = [],
    isLoading,
    isError,
    error,
  } = useQuery<Campaign[]>({
    queryKey: ["completedCampaigns", userData?._id],
    enabled: Boolean(userData?._id),
    queryFn: async () => {
      const res = await axiosMarketing.get(`/campaigns/completed-campaigns/${userData?._id}`);
      const payload = (res.data?.data ?? res.data) as CompletedCampaignApi[];
      return Array.isArray(payload) ? payload.map(mapCompletedCampaign) : [];
    },
  });

  console.log("Completed campaigns:", campaigns);

  const completedCount = campaigns.length;
  const totalRevenue = campaigns.reduce((sum, campaign) => sum + Number(campaign.revenue ?? 0), 0);

  const featuredCampaign = campaigns.length === 0 ? null : [...campaigns].sort((a, b) => Number(b.totalBudget ?? 0) - Number(a.totalBudget ?? 0))[0];

  const featuredCampaignName = featuredCampaign?.campaignName ?? "No completed campaign yet";

  const query = searchTerm.trim().toLowerCase();
  const filtered = campaigns.filter((campaign) => {
    const nameMatched = campaign.campaignName.toLowerCase().includes(query);
    const channelMatched = campaign.channel.toLowerCase().includes(query);
    return nameMatched || channelMatched;
  });

  const filteredCampaigns = [...filtered].sort((a, b) => {
    if (sortBy === "revenue") {
      return Number(b.revenue ?? 0) - Number(a.revenue ?? 0);
    }

    if (sortBy === "budget") {
      return Number(b.totalBudget ?? 0) - Number(a.totalBudget ?? 0);
    }

    return new Date(b.endDate ?? 0).getTime() - new Date(a.endDate ?? 0).getTime();
  });

  const openRevenueModal = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setRevenueInput("");
    setIsRevenueModalOpen(true);
  };

  const closeRevenueModal = () => {
    setIsRevenueModalOpen(false);
    setSelectedCampaign(null);
    setRevenueInput("");
  };

  const handleRevenueSubmit = () => {
    const parsedRevenue = Number(revenueInput);

    if (!selectedCampaign || Number.isNaN(parsedRevenue) || parsedRevenue < 0) {
      return;
    }

    console.log("Add total revenue submit:", {
      campaignId: selectedCampaign.id,
      campaignName: selectedCampaign.campaignName,
      totalRevenue: parsedRevenue,
    });

    closeRevenueModal();
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[45vh] items-center justify-center rounded-3xl border border-slate-200/60 bg-slate-50/60 shadow-sm backdrop-blur-md">
        <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
        Failed to load completed campaigns. {error instanceof Error ? error.message : "Please try again."}
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-transparent">

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col gap-6 p-6 sm:p-8">
        <section className="overflow-hidden rounded-[2rem] border border-slate-200/70 bg-slate-50/65 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-md sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-emerald-50/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                <Sparkles className="h-3.5 w-3.5" />
                Completed campaigns archive
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                Every finished campaign, presented with a cleaner post-launch energy.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                Track what completed, how it performed, and which campaigns carried the most weight. This view is tuned to feel more cinematic than the main list while staying easy to scan.
              </p>
            </div>

            <div className="grid w-full gap-3 sm:grid-cols-2 lg:w-auto lg:grid-cols-1">
              <div className="rounded-2xl border border-slate-200/70 bg-white/70 px-4 py-3 shadow-sm backdrop-blur-sm">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">Completed campaigns</p>
                <div className="mt-2 flex items-end justify-between gap-4">
                  <span className="text-2xl font-semibold text-slate-900">{completedCount}</span>
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200/70 bg-white/70 px-4 py-3 shadow-sm backdrop-blur-sm">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">Total revenue</p>
                <div className="mt-2 flex items-end justify-between gap-4">
                  <span className="text-2xl font-semibold text-slate-900">{formatCurrency(totalRevenue)}</span>
                  <TrendingUp className="h-5 w-5 text-sky-500" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
            <div className="rounded-[1.5rem] border border-slate-200/70 bg-slate-900 px-5 py-5 text-slate-50 shadow-lg shadow-slate-900/10">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Featured finish</p>
                  <h2 className="mt-2 text-xl font-semibold sm:text-2xl">{featuredCampaignName}</h2>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-slate-100">
                  <Target className="h-3.5 w-3.5" />
                  Highest budget campaign
                </span>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-white/8 px-4 py-4 ring-1 ring-white/10">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-300">Total budget</p>
                  <p className="mt-2 text-lg font-semibold">{formatCurrency(featuredCampaign?.totalBudget)}</p>
                </div>
                <div className="rounded-2xl bg-white/8 px-4 py-4 ring-1 ring-white/10">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-300">Avg target leads</p>
                  <p className="mt-2 text-lg font-semibold">{Number(featuredCampaign?.targetLeads ?? 0).toLocaleString()}</p>
                </div>
                <div className="rounded-2xl bg-white/8 px-4 py-4 ring-1 ring-white/10">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-300">Latest close</p>
                  <p className="mt-2 text-lg font-semibold">{featuredCampaign?.endDate ? formatDate(featuredCampaign.endDate) : "-"}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-slate-200/70 bg-white/75 p-5 shadow-sm backdrop-blur-sm">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Clock3 className="h-4 w-4 text-amber-500" />
                Campaign rhythm
              </div>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50/80 px-3 py-3">
                  <span className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-slate-400" />
                    Last completed campaign
                  </span>
                  <span className="font-medium text-slate-900">{featuredCampaign?.endDate ? formatDate(featuredCampaign.endDate) : "-"}</span>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50/80 px-3 py-3">
                  <span className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-slate-400" />
                    Highest budget run
                  </span>
                  <span className="font-medium text-slate-900">{formatCurrency(featuredCampaign?.totalBudget)}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-4 rounded-3xl border border-slate-200/70 bg-slate-50/65 p-4 shadow-sm backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-lg">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search completed campaigns or channels..."
              className="w-full rounded-2xl border border-slate-200/80 bg-white/75 py-3 pl-10 pr-4 text-sm text-slate-700 shadow-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-slate-900/10"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Filter className="h-4 w-4" />
              Sort by
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="rounded-2xl border border-slate-200/80 bg-white/75 px-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-slate-900/10"
            >
              <option value="recent">Most recent</option>
              <option value="revenue">Highest revenue</option>
              <option value="budget">Highest budget</option>
            </select>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredCampaigns.map((campaign) => {
            const netImpact = Number(campaign.revenue ?? 0) - Number(campaign.totalBudget ?? 0);
            const isPositive = netImpact >= 0;

            return (
              <article
                key={campaign.id}
                className="group relative overflow-hidden rounded-[1.9rem] border border-slate-200/80 bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.07)] transition duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_20px_45px_rgba(15,23,42,0.12)]"
              >
                <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-slate-100/90 blur-2xl" />
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Completed</p>
                    <h3 className="mt-2 text-xl font-semibold leading-tight text-slate-900">{campaign.campaignName}</h3>
                  </div>
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-600 shadow-sm">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">
                    {campaign.channel}
                  </span>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">
                    Closed {campaign.endDate ? formatDate(campaign.endDate) : "-"}
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Revenue</p>
                    <p className="mt-2 text-base font-semibold text-slate-900">{formatCurrency(campaign.revenue)}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Budget</p>
                    <p className="mt-2 text-base font-semibold text-slate-900">{formatCurrency(campaign.totalBudget)}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Target leads</p>
                    <p className="mt-2 text-base font-semibold text-slate-900">{Number(campaign.targetLeads ?? 0).toLocaleString()}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Net impact</p>
                    <p className={`mt-2 text-base font-semibold ${isPositive ? "text-emerald-600" : "text-rose-600"}`}>
                      {isPositive ? "+" : "-"}
                      {formatCurrency(Math.abs(netImpact))}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-slate-200/80 pt-4 text-sm text-slate-500">
                  <span className="inline-flex items-center gap-2">
                    <Target className="h-4 w-4 text-slate-400" />
                    Finished on {campaign.endDate ? formatDate(campaign.endDate) : "-"}
                  </span>
                  {Number(campaign.revenue ?? 0) === 0 ? (
                    <button
                      type="button"
                      onClick={() => openRevenueModal(campaign)}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-slate-900 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-slate-800"
                    >
                      <TrendingUp className="h-3.5 w-3.5" />
                      Add total revenue
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-2 font-medium text-slate-700">
                      <TrendingUp className="h-4 w-4 text-slate-400" />
                      {campaign.totalBudget ? `${Math.round(((Number(campaign.revenue ?? 0) / Number(campaign.totalBudget)) || 0) * 100)}%` : "0%"}
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </section>

        {filteredCampaigns.length === 0 && (
          <div className="rounded-[1.75rem] border border-dashed border-slate-300/80 bg-slate-50/70 p-10 text-center shadow-sm backdrop-blur-md">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-slate-50">
              <Sparkles className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-slate-900">No completed campaigns found</h2>
            <p className="mt-2 text-sm text-slate-500">Try a different search term or wait for campaigns to finish and appear here.</p>
          </div>
        )}

        {isRevenueModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
              <h2 className="text-lg font-semibold text-slate-900">Add total revenue</h2>
              <p className="mt-1 text-sm text-slate-600">
                {selectedCampaign ? `Campaign: ${selectedCampaign.campaignName}` : "Campaign not selected"}
              </p>

              <div className="mt-4">
                <label htmlFor="totalRevenueInput" className="mb-2 block text-sm font-medium text-slate-700">
                  Revenue amount
                </label>
                <input
                  id="totalRevenueInput"
                  type="number"
                  min="0"
                  step="0.01"
                  value={revenueInput}
                  onChange={(e) => setRevenueInput(e.target.value)}
                  placeholder="Enter total revenue"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-transparent focus:ring-2 focus:ring-slate-900/20"
                />
              </div>

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeRevenueModal}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRevenueSubmit}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-slate-50 transition hover:bg-slate-800"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketingEndCampaigns;