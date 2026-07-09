import { useState, type ElementType } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAxiosAdmin from '@/uri/useAxiosAdmin';
import {
  Search,
  ChevronDown,
  Clock,
  Bug,
  Sparkles,
  Building2,
  AlertTriangle,
  MessageCircle,
  MessageSquare,
  CheckCircle2,
  Mail,
  X,
} from 'lucide-react';

type Category =
  | 'software_bug'
  | 'feature_idea'
  | 'company_suggestion'
  | 'management_feedback'
  | 'complaint'
  | 'other';

type SubmissionStatus = 'new' | 'reviewed';

interface Maker {
  _id: string;
  name: string;
  email: string;
}

interface Submission {
  _id: string;
  subject: string;
  body: string;
  category: Category;
  status: SubmissionStatus;
  makerId: Maker | string;
  createdAt: string;
}

interface CompliancesResponse {
  success: boolean;
  data: Submission[];
  summary: {
    totalCount: number;
    newCount: number;
    reviewedCount: number;
  };
}

type CategoryMeta = { label: string; icon: ElementType; color: string; bg: string };
const CATEGORY_META: Record<Category, CategoryMeta> = {
  software_bug: { label: 'Software Bug', icon: Bug, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' },
  feature_idea: { label: 'Feature Idea', icon: Sparkles, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
  company_suggestion: { label: 'Company Suggestion', icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
  management_feedback: { label: 'Management Feedback', icon: MessageCircle, color: 'text-[#5c7a3a]', bg: 'bg-[#99B562]/10 border-[#99B562]/30' },
  complaint: { label: 'Complaint', icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' },
  other: { label: 'Other', icon: MessageSquare, color: 'text-slate-600', bg: 'bg-slate-50 border-slate-200' },
};

const STATUS_META: Record<SubmissionStatus, { label: string; color: string }> = {
  new: { label: 'New', color: 'bg-amber-50 text-amber-600 border-amber-200' },
  reviewed: { label: 'Reviewed', color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

const formatRelative = (iso: string) => {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHrs < 1) return 'Just now';
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(iso);
};

const SummaryCard = ({
  label,
  value,
  accent = 'text-slate-900',
}: {
  label: string;
  value: string;
  accent?: string;
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
    <p className={`text-2xl font-bold ${accent}`}>{value}</p>
  </div>
);

const ViewCompliance = () => {
  const axiosAdmin = useAxiosAdmin();
  const queryClient = useQueryClient();

  const [status, setStatus] = useState('all');
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Submission | null>(null);

  const { data, isLoading } = useQuery<CompliancesResponse>({
    queryKey: ['all-compliance', status, category, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status !== 'all') params.set('status', status);
      if (category !== 'all') params.set('category', category);
      if (search) params.set('search', search);

      const res = await axiosAdmin.get(`/all-compliance?${params.toString()}`);
      return res.data;
    },
  });

  const mutationStatus = useMutation({
    mutationFn: async ({ id, newStatus }: { id: string; newStatus: SubmissionStatus }) => {
      const res = await axiosAdmin.patch(`/compliance-status/${id}`, { status: newStatus });
      return res.data;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['all-compliance'] });
      if (selected) setSelected({ ...selected, status: res.data.status });
    },
  });

  const submissions = data?.data || [];
  const summary = data?.summary;

  const getMakerInfo = (makerId: Maker | string) =>
    typeof makerId === 'object' ? makerId : { name: 'Unknown', email: '-' };

  return (
    <div className="min-h-screen w-full bg-slate-50 p-6 font-sans md:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Compliance & Feedback
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Review submissions sent directly to management.
          </p>
        </div>

        {/* Summary cards */}
        {summary && (
          <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3">
            <SummaryCard label="Total Submissions" value={String(summary.totalCount)} />
            <SummaryCard label="New" value={String(summary.newCount)} accent="text-amber-600" />
            <SummaryCard label="Reviewed" value={String(summary.reviewedCount)} accent="text-emerald-600" />
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by subject..."
              className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#99B562] focus:ring-4 focus:ring-[#99B562]/15"
            />
          </div>

          {/* Status filter */}
          <div className="relative w-fit">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="appearance-none rounded-lg border border-slate-200 bg-white px-4 py-2.5 pr-9 text-sm font-semibold text-slate-800 shadow-sm outline-none transition focus:ring-4 focus:ring-slate-100"
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="reviewed">Reviewed</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-400" />
          </div>

          {/* Category filter */}
          <div className="relative w-fit">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="appearance-none rounded-lg border border-slate-200 bg-white px-4 py-2.5 pr-9 text-sm font-semibold text-slate-800 shadow-sm outline-none transition focus:ring-4 focus:ring-slate-100"
            >
              <option value="all">All Categories</option>
              {(Object.keys(CATEGORY_META) as Category[]).map((key) => (
                <option key={key} value={key}>
                  {CATEGORY_META[key].label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-400" />
          </div>
        </div>

        {/* List */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          {isLoading && (
            <div className="divide-y divide-slate-100">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse px-6 py-5">
                  <div className="h-4 w-1/3 rounded bg-slate-100" />
                  <div className="mt-2 h-3 w-2/3 rounded bg-slate-100" />
                </div>
              ))}
            </div>
          )}

          {!isLoading && submissions.length === 0 && (
            <p className="px-6 py-16 text-center text-sm text-slate-400">
              No submissions match this filter.
            </p>
          )}

          {!isLoading && submissions.length > 0 && (
            <div className="divide-y divide-slate-100">
              {submissions.map((s) => {
                const meta = CATEGORY_META[s.category] || CATEGORY_META.other;
                const Icon = meta.icon;
                const statusMeta = STATUS_META[s.status] || STATUS_META.new;
                const maker = getMakerInfo(s.makerId);

                return (
                  <button
                    key={s._id}
                    onClick={() => setSelected(s)}
                    className="flex w-full items-start gap-4 px-6 py-5 text-left transition hover:bg-slate-50"
                  >
                    <div className={`mt-0.5 rounded-lg border p-2 ${meta.bg}`}>
                      <Icon className={`h-4 w-4 ${meta.color}`} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <p className="truncate text-sm font-semibold text-slate-800">{s.subject}</p>
                        <span
                          className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${statusMeta.color}`}
                        >
                          {statusMeta.label}
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-1 text-xs text-slate-500">{s.body}</p>
                      <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-400">
                        <span>{maker.name}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatRelative(s.createdAt)}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Detail modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
              <div className="flex items-start gap-3">
                {(() => {
                  const meta = CATEGORY_META[selected.category] || CATEGORY_META.other;
                  const Icon = meta.icon;
                  return (
                    <div className={`mt-0.5 rounded-lg border p-2 ${meta.bg}`}>
                      <Icon className={`h-4 w-4 ${meta.color}`} />
                    </div>
                  );
                })()}
                <div>
                  <p className="text-base font-bold text-slate-900">{selected.subject}</p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {CATEGORY_META[selected.category]?.label || 'Other'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="px-6 py-5">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                {selected.body}
              </p>

              <div className="mt-5 flex items-center gap-2 rounded-lg bg-slate-50 px-4 py-3">
                <Mail className="h-4 w-4 text-slate-400" />
                <div className="text-xs text-slate-600">
                  <p className="font-semibold">{getMakerInfo(selected.makerId).name}</p>
                  <p className="text-slate-400">{getMakerInfo(selected.makerId).email}</p>
                </div>
                <span className="ml-auto text-xs text-slate-400">{formatDate(selected.createdAt)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-6 py-4">
              <span
                className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase ${
                  STATUS_META[selected.status].color
                }`}
              >
                {STATUS_META[selected.status].label}
              </span>

              {selected.status === 'new' ? (
                <button
                  onClick={() =>
                    mutationStatus.mutate({ id: selected._id, newStatus: 'reviewed' })
                  }
                  disabled={mutationStatus.isPending}
                  className="flex items-center gap-2 rounded-lg bg-[#99B562] px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-[#86a154] disabled:opacity-60"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {mutationStatus.isPending ? 'Updating...' : 'Mark as Reviewed'}
                </button>
              ) : (
                <button
                  onClick={() =>
                    mutationStatus.mutate({ id: selected._id, newStatus: 'new' })
                  }
                  disabled={mutationStatus.isPending}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
                >
                  {mutationStatus.isPending ? 'Updating...' : 'Mark as New'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewCompliance;