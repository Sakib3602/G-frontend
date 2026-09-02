import React, { useContext, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Calendar,
  User,
  AlignLeft,
  Briefcase,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  MessageSquare,
  Send,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
} from "lucide-react";
import useAxiosAdmin from "@/uri/useAxiosAdmin";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Alert from "../MarketingDashboard/Alert/Alert";
import { AuthContext } from "../Authentication/AuthProvider/AuthProvider";
import useAxiosPublic from "@/uri/useAxiosPublic";

// ---------- Types ----------
type EmployeeApi = { _id: string; name: string; email: string; role: string };
type CampaignApi = { _id: string; campaignName: string };

type RemainingDatePending = {
  isOverdue: boolean;
  days: number;
  hours: number;
  minutes: number;
  dueTimeWithDayAndHour: string;
};

type RemainingDateCompleted = {
  isOverdue: boolean;
  overdueHours: number;
};

type CommentApi = {
  _id: string;
  text: string;
  commentBy: { _id: string; name: string; email: string } | string;
  commentByName: string;
  createdAt: string;
};

type TaskApi = {
  _id: string;
  title: string;
  description?: string;
  status: "pending" | "in-progress" | "completed";
  priority: "Low" | "Medium" | "High";
  dueDate: string;
  dueTime?: string;
  assignedTo?: { _id: string; name: string; email: string };
  campaignId?: { _id: string; campaignName: string };
  makerId?: { _id: string; name: string };
  remainingDate: RemainingDatePending | RemainingDateCompleted;
  url?: string;
  comments?: CommentApi[];
};

type TaskFormData = {
  title: string;
  description: string;
  campaignId: string;
  assignedTo: string;
  dueDate: string;
  dueTime: string;
  priority: "Low" | "Medium" | "High";
  makerId: string;
};

type PaginatedResponse = {
  data: TaskApi[];
  meta: { totalPages: number; currentPage: number; totalTasks: number; limit: number };
};

const priorityStyles: Record<TaskFormData["priority"], string> = {
  Low: "bg-slate-100 text-slate-600",
  Medium: "bg-amber-100 text-amber-700",
  High: "bg-rose-100 text-rose-700",
};

// Type guard to check if remaining date is pending
function isPendingRemaining(
  r: RemainingDatePending | RemainingDateCompleted
): r is RemainingDatePending {
  return r && "dueTimeWithDayAndHour" in r;
}

const AdminAddTask: React.FC = () => {
  const auth = useContext(AuthContext);
  const person = auth?.person;
  const axiosAdmin = useAxiosAdmin();
  const axiosPub = useAxiosPublic();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<"pending" | "completed">("pending");
  const [showForm, setShowForm] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  // ---------- Pagination & Sorting State ----------
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("dueDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const limit = 20;

  // ---------- Comments UI state ----------
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [commentDraft, setCommentDraft] = useState<Record<string, string>>({});

  const { data: userData, isLoading: isUserLoading } = useQuery({
    queryKey: ["user-data", person?.email],
    enabled: Boolean(person?.email),
    staleTime: Infinity,
    queryFn: async () => {
      const res = await axiosPub.get(`/api/v1/user/${person?.email}`);
      return res.data.data;
    },
  });

  const { data: employees = [], isLoading: isEmployeesLoading } = useQuery<EmployeeApi[]>({
    queryKey: ["admin-marketing-employees"],
    queryFn: async () => {
      const res = await axiosAdmin.get(`/employees`); // Removed duplicate /admin
      return Array.isArray(res.data?.data ?? res.data) ? (res.data?.data ?? res.data) : [];
    },
  });

  const { data: campaigns = [], isLoading: isCampaignsLoading } = useQuery<CampaignApi[]>({
    queryKey: ["admin-marketing-campaigns"],
    queryFn: async () => {
      const res = await axiosAdmin.get(`/campaigns`); // Removed duplicate /admin
      return Array.isArray(res.data?.data ?? res.data) ? (res.data?.data ?? res.data) : [];
    },
  });

  // ---------- Dynamic Task Query ----------
  const { data: paginatedTasks, isLoading: isTasksLoading } = useQuery<PaginatedResponse>({
    queryKey: ["admin-marketing-tasks", activeTab, page, sortBy, sortOrder],
    queryFn: async () => {
      const res = await axiosAdmin.get(`/tasks`, {
        params: { status: activeTab, page, limit, sortBy, sortOrder },
      });
      return res.data;
    },
  });

  const tasks = paginatedTasks?.data ?? [];
  const meta = paginatedTasks?.meta ?? { totalPages: 1, currentPage: 1, totalTasks: 0, limit: 20 };

  const overdueCount = useMemo(
    () => tasks.filter((t) => isPendingRemaining(t.remainingDate) && t.remainingDate.isOverdue).length,
    [tasks]
  );

  const handleTabChange = (tab: "pending" | "completed") => {
    setActiveTab(tab);
    setPage(1); // Reset page on tab switch
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<TaskFormData>({
    defaultValues: {
      title: "",
      description: "",
      campaignId: "",
      assignedTo: "",
      dueDate: "",
      dueTime: "",
      priority: "Medium",
      makerId: "",
    },
  });

  React.useEffect(() => {
    if (userData?._id) setValue("makerId", userData._id, { shouldDirty: false, shouldValidate: true });
  }, [setValue, userData?._id]);

  const todayDateISO = new Date().toISOString().split("T")[0];

  const mutationCreateTask = useMutation({
    mutationFn: async (taskData: TaskFormData) => {
      const response = await axiosAdmin.post(`/tasks/create`, {
        ...taskData,
        campaignId: taskData.campaignId || null,
      });
      return response.data;
    },
    onSuccess: () => {
      setShowNotification(true);
      reset({
        title: "",
        description: "",
        campaignId: "",
        assignedTo: "",
        dueDate: "",
        dueTime: "",
        priority: "Medium",
        makerId: userData?._id ?? "",
      });
      alert("Task assigned successfully!");
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ["admin-marketing-tasks"] });
    },
  });

  const onSubmit = (data: TaskFormData) => {
    if (!mutationCreateTask.isPending) mutationCreateTask.mutate(data);
  };

  const mutationAddComment = useMutation({
    mutationFn: async ({ taskId, text }: { taskId: string; text: string }) => {
      const res = await axiosAdmin.post(`/tasks/${taskId}/comment`, { text }); // Corrected path
      return res.data;
    },
    onSuccess: (_data, variables) => {
      setCommentDraft((prev) => ({ ...prev, [variables.taskId]: "" }));
      queryClient.invalidateQueries({ queryKey: ["admin-marketing-tasks"] });
    },
  });

  const mutationDeleteComment = useMutation({
    mutationFn: async ({ taskId, commentId }: { taskId: string; commentId: string }) => {
      const res = await axiosAdmin.delete(`/tasks/${taskId}/comment/${commentId}`); // Corrected path
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-marketing-tasks"] }),
  });

  const handleAddComment = (taskId: string) => {
    const text = commentDraft[taskId]?.trim();
    if (text && !mutationAddComment.isPending) mutationAddComment.mutate({ taskId, text });
  };

  const handleDeleteComment = (taskId: string, commentId: string) => {
    if (!mutationDeleteComment.isPending) mutationDeleteComment.mutate({ taskId, commentId });
  };

  if (isUserLoading) return <div className="flex items-center justify-center h-screen">Loading....</div>;

  return (
    <>
      {showNotification && (
        <Alert
          title="Task assigned!"
          message="The task has been created and assigned."
          onClose={() => setShowNotification(false)}
        />
      )}

      <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        {/* Header */}
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-[linear-gradient(135deg,rgba(201,166,70,0.16),rgba(248,250,252,1)_60%)] px-6 py-8 sm:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#C9A646]/20 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9A7A22] shadow-sm">
            <span className="h-2 w-2 rounded-full bg-[#C9A646]" /> Admin task control
          </div>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                Team task overview
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                See every marketing team member's tasks in one place, and assign new work to anyone.
              </p>
            </div>
            <button
              onClick={() => setShowForm((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#C9A646] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(201,166,70,0.24)] transition hover:bg-[#b89434]"
            >
              <Plus className="h-4 w-4" /> {showForm ? "Close form" : "Assign a task"}
            </button>
          </div>
        </div>

        {/* Create Form */}
        {showForm && (
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 sm:p-6">
            <h3 className="mb-4 text-base font-semibold text-slate-900">Assign a new task</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <input type="hidden" {...register("makerId", { required: true })} />

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Task title *</label>
                <input
                  type="text"
                  placeholder="e.g., Prepare Q3 ad creative brief"
                  className={`w-full rounded-2xl border bg-slate-50 px-4 py-3 text-sm outline-none transition focus:bg-white focus:ring-2 focus:ring-[#C9A646]/20 ${
                    errors.title ? "border-rose-500" : "border-slate-200 focus:border-[#C9A646]"
                  }`}
                  {...register("title", { required: "Task title is required" })}
                />
                {errors.title && <p className="mt-1.5 text-xs text-rose-500">{errors.title.message}</p>}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                    <User className="h-4 w-4 text-[#C9A646]" /> Assign to *
                  </label>
                  <select
                    className={`w-full rounded-2xl border bg-slate-50 px-4 py-3 text-sm outline-none transition focus:bg-white focus:ring-2 focus:ring-[#C9A646]/20 ${
                      errors.assignedTo ? "border-rose-500" : "border-slate-200 focus:border-[#C9A646]"
                    }`}
                    {...register("assignedTo", { required: "Please select a team member" })}
                  >
                    <option value="">Select a team member</option>
                    {isEmployeesLoading && (
                      <option value="" disabled>
                        Loading team members...
                      </option>
                    )}
                    {employees.map((emp) => (
                      <option key={emp._id} value={emp._id}>
                        {emp.name}
                      </option>
                    ))}
                  </select>
                  {errors.assignedTo && (
                    <p className="mt-1.5 text-xs text-rose-500">{errors.assignedTo.message}</p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                    <Briefcase className="h-4 w-4 text-[#C9A646]" /> Related campaign
                  </label>
                  <select
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#C9A646] focus:bg-white focus:ring-2 focus:ring-[#C9A646]/20"
                    {...register("campaignId")}
                  >
                    <option value="">No campaign</option>
                    {isCampaignsLoading && (
                      <option value="" disabled>
                        Loading campaigns...
                      </option>
                    )}
                    {campaigns.map((camp) => (
                      <option key={camp._id} value={camp._id}>
                        {camp.campaignName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">Priority</label>
                  <select
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#C9A646] focus:bg-white focus:ring-2 focus:ring-[#C9A646]/20"
                    {...register("priority")}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                    <Calendar className="h-4 w-4 text-[#C9A646]" /> Due date *
                  </label>
                  <input
                    type="date"
                    min={todayDateISO}
                    className={`w-full rounded-2xl border bg-slate-50 px-4 py-3 text-sm outline-none transition focus:bg-white focus:ring-2 focus:ring-[#C9A646]/20 ${
                      errors.dueDate ? "border-rose-500" : "border-slate-200 focus:border-[#C9A646]"
                    }`}
                    {...register("dueDate", {
                      required: "Due date is required",
                      validate: (value) => value >= todayDateISO || "Due date cannot be before today",
                    })}
                  />
                  {errors.dueDate && <p className="mt-1.5 text-xs text-rose-500">{errors.dueDate.message}</p>}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">Due time *</label>
                  <input
                    type="time"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#C9A646] focus:bg-white focus:ring-2 focus:ring-[#C9A646]/20"
                    {...register("dueTime")}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                  <AlignLeft className="h-4 w-4 text-[#C9A646]" /> Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Write detailed instructions for the task..."
                  className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#C9A646] focus:bg-white focus:ring-2 focus:ring-[#C9A646]/20"
                  {...register("description")}
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="submit"
                  disabled={mutationCreateTask.isPending}
                  className="inline-flex items-center justify-center rounded-full bg-[#C9A646] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#b89434] disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {mutationCreateTask.isPending ? "Assigning..." : "Assign task"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tasks List */}
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex rounded-full bg-slate-100 p-1">
              <button
                onClick={() => handleTabChange("pending")}
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  activeTab === "pending" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                }`}
              >
                <Clock className="h-4 w-4" /> Active
              </button>
              <button
                onClick={() => handleTabChange("completed")}
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  activeTab === "completed" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                }`}
              >
                <CheckCircle2 className="h-4 w-4" /> Completed
              </button>
            </div>

            <div className="flex items-center gap-4">
              {activeTab === "pending" && overdueCount > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600">
                  <AlertTriangle className="h-3.5 w-3.5" /> {overdueCount} overdue
                </span>
              )}
              {/* Sorting Controls */}
              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4 text-slate-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs outline-none focus:border-[#C9A646]"
                >
                  <option value="dueDate">Due Date</option>
                  <option value="priority">Priority</option>
                  <option value="title">Title</option>
                </select>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs outline-none focus:border-[#C9A646]"
                >
                  <option value="asc">Asc</option>
                  <option value="desc">Desc</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {isTasksLoading && <p className="text-sm text-slate-500">Loading tasks...</p>}
            {!isTasksLoading && tasks.length === 0 && (
              <p className="text-sm text-slate-500">No tasks here yet.</p>
            )}
            {tasks.map((task) => {
              const remaining = task.remainingDate;
              const overdue = remaining && "isOverdue" in remaining ? remaining.isOverdue : false;
              const isExpanded = expandedTaskId === task._id;
              const commentCount = task.comments?.length ?? 0;

              return (
                <div
                  key={task._id}
                  className={`rounded-2xl border px-4 py-3.5 transition ${
                    overdue ? "border-rose-200 bg-rose-50/50" : "border-slate-200 bg-slate-50/60"
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-sm font-semibold text-slate-900">{task.title}</h4>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                            priorityStyles[task.priority]
                          }`}
                        >
                          {task.priority}
                        </span>
                      </div>
                      <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <User className="h-3 w-3" /> {task.assignedTo?.name ?? "Unassigned"}
                        </span>
                        {task.campaignId?.campaignName && (
                          <span className="inline-flex items-center gap-1">
                            <Briefcase className="h-3 w-3" /> {task.campaignId.campaignName}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3 w-3" />{" "}
                          {new Date(task.dueDate).toLocaleDateString()} {task.dueTime ?? ""}
                        </span>
                      </p>
                      {task.url && (
                        <p className="mt-1.5 text-xs leading-5 text-slate-600">URL: {task.url}</p>
                      )}
                      {task.description && (
                        <p className="mt-1.5 text-xs leading-5 text-slate-600">{task.description}</p>
                      )}
                    </div>

                    <div className="text-right">
                      {isPendingRemaining(remaining) ? (
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                            overdue ? "bg-rose-100 text-rose-700" : "bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          {overdue
                            ? `${remaining.dueTimeWithDayAndHour} overdue`
                            : `${remaining.dueTimeWithDayAndHour} left`}
                        </span>
                      ) : (
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                            overdue ? "bg-rose-100 text-rose-700" : "bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          {overdue
                            ? `Finished ${remaining.overdueHours}h late`
                            : "Finished on time"}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Comments section toggle */}
                  <button
                    onClick={() => setExpandedTaskId(isExpanded ? null : task._id)}
                    className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold text-[#9A7A22] hover:underline"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />{" "}
                    {isExpanded ? "Hide comments" : `Comments (${commentCount})`}
                  </button>

                  {/* Comments Panel */}
                  {isExpanded && (
                    <div className="mt-2.5 space-y-2 rounded-2xl border border-slate-200 bg-white p-3">
                      {commentCount === 0 && (
                        <p className="text-xs text-slate-400">No comments yet. Be the first to add one.</p>
                      )}

                      <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                        {(task.comments ?? []).map((c) => (
                          <div
                            key={c._id}
                            className="group relative rounded-xl bg-slate-50 px-3 py-2"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-semibold text-slate-700">
                                {c.commentByName}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-slate-400">
                                  {new Date(c.createdAt).toLocaleString()}
                                </span>
                                <button
                                  onClick={() => handleDeleteComment(task._id, c._id)}
                                  className="text-slate-300 opacity-0 transition hover:text-rose-500 group-hover:opacity-100"
                                  title="Delete comment"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                            <p className="mt-0.5 whitespace-pre-wrap text-xs leading-5 text-slate-600">
                              {c.text}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="text"
                          value={commentDraft[task._id] ?? ""}
                          onChange={(e) =>
                            setCommentDraft((prev) => ({ ...prev, [task._id]: e.target.value }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddComment(task._id);
                            }
                          }}
                          placeholder="Write a comment..."
                          className="w-full rounded-full border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs outline-none transition focus:border-[#C9A646] focus:bg-white focus:ring-2 focus:ring-[#C9A646]/20"
                        />
                        <button
                          onClick={() => handleAddComment(task._id)}
                          disabled={mutationAddComment.isPending || !commentDraft[task._id]?.trim()}
                          className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#C9A646] px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-[#b89434] disabled:cursor-not-allowed disabled:bg-slate-300"
                        >
                          <Send className="h-3.5 w-3.5" />
                          {mutationAddComment.isPending ? "Sending..." : "Send"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {meta.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
              <span className="text-xs text-slate-500">
                Showing {(page - 1) * limit + 1} to {Math.min(page * limit, meta.totalTasks)} of{" "}
                {meta.totalTasks} tasks
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 disabled:opacity-50"
                >
                  <ChevronLeft className="h-3.5 w-3.5" /> Prev
                </button>
                <button
                  disabled={page === meta.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 disabled:opacity-50"
                >
                  Next <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminAddTask;