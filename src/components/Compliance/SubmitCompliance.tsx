import { useState, type ElementType } from 'react';
import {
  MessageSquare,
  Lightbulb,
  Layers,
  CheckCircle,
  Send,
  Clock,
  Bug,
  Sparkles,
  Building2,
  AlertTriangle,
  MessageCircle,
  ChevronDown,
} from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import useAxiosPublic from '@/uri/useAxiosPublic';

type Category =
  | 'software_bug'
  | 'feature_idea'
  | 'company_suggestion'
  | 'management_feedback'
  | 'complaint'
  | 'other';

type SubmissionStatus = 'new' | 'reviewed';

interface Submission {
  _id: string;
  subject: string;
  body: string;
  category: Category;
  status: SubmissionStatus;
  createdAt: string;
}

type CategoryMeta = { label: string; icon: ElementType; color: string; bg: string };
const CATEGORY_META: Record<Category, CategoryMeta> = {
  software_bug: { label: 'Software Bug / Issue', icon: Bug, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' },
  feature_idea: { label: 'New Feature Idea', icon: Sparkles, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
  company_suggestion: { label: 'Company Suggestion', icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
  management_feedback: { label: 'Direct Management Feedback', icon: MessageCircle, color: 'text-[#5c7a3a]', bg: 'bg-[#99B562]/10 border-[#99B562]/30' },
  complaint: { label: 'Complaint / Concern', icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' },
  other: { label: 'Other', icon: MessageSquare, color: 'text-slate-600', bg: 'bg-slate-50 border-slate-200' },
};

const STATUS_META: Record<SubmissionStatus, { label: string; color: string }> = {
  new: { label: 'New', color: 'bg-amber-50 text-amber-600 border-amber-200' },
  reviewed: { label: 'Reviewed', color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
};

const formatRelative = (iso: string) => {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHrs < 1) return 'Just now';
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const MIN_BODY_LENGTH = 50;

const SubmitCompliance = () => {
  const axiosPublic = useAxiosPublic();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    subject: '',
    category: 'software_bug' as Category,
    body: '',
  });
  const [justSubmittedId, setJustSubmittedId] = useState<string | null>(null);
  const [formError, setFormError] = useState('');

  const { data, isLoading } = useQuery<{ success: boolean; data: Submission[] }>({
    queryKey: ['my-compliance'],
    queryFn: async () => {
      const res = await axiosPublic.get('/api/v1/my-compliance');
      return res.data;
    },
  });

  const submissions = data?.data || [];

  const mutationPost = useMutation({
    mutationFn: async (payload: { subject: string; body: string; category: Category }) => {
      const res = await axiosPublic.post('/api/v1/post-compliance', payload);
      return res.data;
    },
    onSuccess: (res) => {
      const newId = res?.data?._id;
      if (newId) {
        setJustSubmittedId(newId);
        setTimeout(() => setJustSubmittedId(null), 2500);
      }
      setFormData({ subject: '', category: 'software_bug', body: '' });
      setFormError('');
      queryClient.invalidateQueries({ queryKey: ['my-compliance'] });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || 'Something went wrong while submitting. Please try again.';
      setFormError(message);
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (formError) setFormError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.body.trim().length < MIN_BODY_LENGTH) {
      setFormError(`Description must be at least ${MIN_BODY_LENGTH} characters long.`);
      return;
    }

    mutationPost.mutate(formData);
  };

  const handleClear = () => {
    setFormData({ subject: '', category: 'software_bug', body: '' });
    setFormError('');
  };

  const bodyTooShort = formData.body.length > 0 && formData.body.length < MIN_BODY_LENGTH;

  return (
    <div className="min-h-screen w-full bg-slate-50 font-sans">
      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* Page header */}
        <div className="mb-8 flex items-center gap-4">
          <div className="rounded-xl border border-[#99B562]/20 bg-[#99B562]/15 p-3">
            <MessageSquare className="h-6 w-6 text-[#99B562]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Direct Management Channel
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Share an idea, report an issue, or send feedback directly to management.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          {/* ---------- LEFT: Form ---------- */}
          <div className="lg:col-span-3">
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm"
            >
              <h2 className="mb-6 text-sm font-bold uppercase tracking-wider text-slate-400">
                New Submission
              </h2>

              <div className="space-y-5">
                {/* Subject */}
                <div className="space-y-2">
                  <label
                    htmlFor="subject"
                    className="flex items-center gap-2 text-sm font-semibold text-slate-700"
                  >
                    <Lightbulb className="h-4 w-4 text-[#99B562]" />
                    Subject
                  </label>
                  <input
                    id="subject"
                    name="subject"
                    type="text"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Briefly summarize your message"
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#99B562] focus:ring-4 focus:ring-[#99B562]/15"
                    required
                  />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <label
                    htmlFor="category"
                    className="flex items-center gap-2 text-sm font-semibold text-slate-700"
                  >
                    <Layers className="h-4 w-4 text-[#99B562]" />
                    Message Category
                  </label>
                  <div className="relative">
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full cursor-pointer appearance-none rounded-lg border border-slate-300 bg-white px-4 py-2.5 pr-10 text-sm text-slate-800 outline-none transition focus:border-[#99B562] focus:ring-4 focus:ring-[#99B562]/15"
                    >
                      {(Object.keys(CATEGORY_META) as Category[]).map((key) => (
                        <option key={key} value={key}>
                          {CATEGORY_META[key].label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>

                {/* Body */}
                <div className="space-y-2">
                  <label
                    htmlFor="body"
                    className="flex items-center gap-2 text-sm font-semibold text-slate-700"
                  >
                    <CheckCircle className="h-4 w-4 text-[#99B562]" />
                    Detailed Description
                  </label>
                  <textarea
                    id="body"
                    name="body"
                    value={formData.body}
                    onChange={handleChange}
                    placeholder="Explain your idea, issue, or feedback in detail"
                    rows={7}
                    className={`w-full resize-y rounded-lg border bg-white px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:ring-4 ${
                      bodyTooShort
                        ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100'
                        : 'border-slate-300 focus:border-[#99B562] focus:ring-[#99B562]/15'
                    }`}
                    required
                  />
                  <p className={`text-xs ${bodyTooShort ? 'text-rose-500' : 'text-slate-400'}`}>
                    {formData.body.length}/{MIN_BODY_LENGTH} characters minimum
                  </p>
                </div>
              </div>

              {formError && (
                <p className="mt-4 text-sm text-rose-600">{formError}</p>
              )}

              {/* Footer actions */}
              <div className="mt-7 flex items-center justify-end gap-3 border-t border-slate-100 pt-6">
                <button
                  type="button"
                  onClick={handleClear}
                  className="rounded-lg px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                >
                  Clear
                </button>
                <button
                  type="submit"
                  disabled={mutationPost.isPending}
                  className="flex items-center gap-2 rounded-lg bg-[#99B562] px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#86a154] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Send className="h-4 w-4" />
                  {mutationPost.isPending ? 'Sending...' : 'Send to Management'}
                </button>
              </div>
            </form>
          </div>

          {/* ---------- RIGHT: Submission history ---------- */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                  Your Submissions
                </h2>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
                  {submissions.length}
                </span>
              </div>

              <div className="max-h-[640px] divide-y divide-slate-100 overflow-y-auto">
                {isLoading && (
                  <p className="px-6 py-10 text-center text-sm text-slate-400">Loading...</p>
                )}

                {!isLoading && submissions.length === 0 && (
                  <p className="px-6 py-10 text-center text-sm text-slate-400">
                    You haven't submitted anything yet.
                  </p>
                )}

                {!isLoading &&
                  submissions.map((s) => {
                    const meta = CATEGORY_META[s.category] || CATEGORY_META.other;
                    const Icon = meta.icon;
                    const statusMeta = STATUS_META[s.status] || STATUS_META.new;
                    const isNew = s._id === justSubmittedId;

                    return (
                      <div
                        key={s._id}
                        className={`px-6 py-4 transition-colors ${isNew ? 'bg-[#99B562]/10' : ''}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`mt-0.5 rounded-lg border p-1.5 ${meta.bg}`}>
                            <Icon className={`h-3.5 w-3.5 ${meta.color}`} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{s.subject}</p>
                            <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{s.body}</p>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <span
                            className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${statusMeta.color}`}
                          >
                            {statusMeta.label}
                          </span>
                          <span className="flex items-center gap-1 text-[11px] text-slate-400">
                            <Clock className="h-3 w-3" />
                            {formatRelative(s.createdAt)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmitCompliance;