
import useAxiosMarketing from "@/uri/useAxiosMarketing";
import { useUserDataMarketing } from "./HOOK/User_Data_Marketer";
import { useQuery } from "@tanstack/react-query";
import {
  Clock,
  Calendar,
  Loader2,
  CheckSquare,
  UserRound,
  FolderKanban,
  AlertTriangle,
} from "lucide-react";

type PersonRef = {
  _id: string;
  name?: string;
};

type CampaignRef = {
  _id: string;
  campaignName?: string;
};

type RemainingDateInfo = {
  days?: number;
  hours?: number;
  minutes?: number;
  milliseconds?: number;
  dueDateTime?: string;
  dueTimeWithDayAndHour?: string;
  isOverdue?: boolean;
};

type Task = {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  dueTime: string;
  status: string;
  priority: "High" | "Medium" | "Low";
  percentageCompleted: number;
  assignedTo?: PersonRef | string | null;
  makerId?: PersonRef | string | null;
  campaignId?: CampaignRef | string | null;
  createdAt?: string;
  updatedAt?: string;
  remainingDate?: RemainingDateInfo;
};

const MarketingPendingTask = () => {
  const axiosMarketing = useAxiosMarketing();
  const { userData } = useUserDataMarketing();

  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ["pendingTasks", userData?._id],
    queryFn: async () => {
      const response = await axiosMarketing.get(`/tasks/all-tasks/${userData?._id}`);
      return response.data?.filter((task: Task) => task.status === "pending") || [];
    },
    enabled: !!userData?._id, 
  });
  const formatDate = (date?: string) => {
    if (!date) return "Not set";

    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return "Not set";

    return parsed.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (date?: string) => {
    if (!date) return "Not available";

    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return "Not available";

    return parsed.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRemainingDate = (dueDate?: string) => {
    if (!dueDate) return "N/A";

    const due = new Date(dueDate);
    if (Number.isNaN(due.getTime())) return "N/A";

    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const dueStart = new Date(due.getFullYear(), due.getMonth(), due.getDate());

    const dayDiff = Math.ceil((dueStart.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24));

    if (dayDiff > 0) return `${dayDiff} day${dayDiff === 1 ? "" : "s"} left`;
    if (dayDiff === 0) return "Due today";

    const overdueDays = Math.abs(dayDiff);
    return `Overdue by ${overdueDays} day${overdueDays === 1 ? "" : "s"}`;
  };

  const isZeroDayTask = (task: Task) => task.remainingDate?.days === 0;

  const getRemainingSummary = (task: Task) => {
    if (isZeroDayTask(task) && task.remainingDate?.dueTimeWithDayAndHour) {
      return task.remainingDate.dueTimeWithDayAndHour;
    }
    return getRemainingDate(task.dueDate);
  };

  const getDueDateTimeText = (task: Task) => {
    if (task.remainingDate?.dueDateTime) {
      return formatDateTime(task.remainingDate.dueDateTime);
    }
    return formatDateTime(task.dueDate);
  };

  const getReferenceName = (
    reference?: PersonRef | CampaignRef | string | null,
    fallback = "Not assigned"
  ) => {
    if (!reference) return fallback;

    if (typeof reference === "string") {
      // Avoid exposing raw database IDs in the UI.
      return /^[a-f\d]{24}$/i.test(reference) ? fallback : reference;
    }

    if ("campaignName" in reference && reference.campaignName) {
      return reference.campaignName;
    }

    if ("name" in reference && reference.name) {
      return reference.name;
    }

    return fallback;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-rose-50 text-rose-700 border-rose-100";
      case "Medium":
        return "bg-amber-50 text-amber-700 border-amber-100";
      case "Low":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "in-progress":
        return "bg-blue-50 text-blue-700 border-blue-100";
      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-100";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const isOverdue = (task: Task) => {
    if (!task.dueDate) return false;
    const due = new Date(task.dueDate);
    const now = new Date();
    return due.getTime() < now.getTime() && task.status.toLowerCase() !== "completed";
  };

  const overdueCount = tasks?.filter((task) => isOverdue(task)).length || 0;
  const highPriorityCount = tasks?.filter((task) => task.priority === "High").length || 0;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
        <p className="text-sm text-slate-500 font-medium">Loading pending tasks...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-slate-50 min-h-screen">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-indigo-600" /> My Pending Tasks
          </h1>
          <p className="text-sm text-slate-500">Tasks that need your attention</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full sm:w-auto">
          <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-medium text-slate-500">Total Pending</p>
            <p className="text-lg font-semibold text-indigo-600">{tasks?.length || 0}</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-medium text-slate-500">Overdue</p>
            <p className="text-lg font-semibold text-rose-600">{overdueCount}</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-medium text-slate-500">High Priority</p>
            <p className="text-lg font-semibold text-amber-600">{highPriorityCount}</p>
          </div>
        </div>
      </div>

      {!tasks || tasks.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
          <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckSquare className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">All Caught Up!</h3>
          <p className="text-sm text-slate-500 mt-1">You have no pending tasks right now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {tasks.map((task) => {
            const isUrgent = isZeroDayTask(task);

            return (
            <div
              key={task._id}
              className={`p-5 rounded-2xl border shadow-sm hover:shadow-md transition-all duration-200 group ${
                isUrgent
                  ? "bg-red-50 border-red-300"
                  : "bg-white border-slate-200"
              }`}
            >
              <div className="flex flex-wrap justify-between items-start gap-2 mb-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${getPriorityColor(task.priority)}`}>
                    {task.priority} Priority
                  </span>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-md border capitalize ${getStatusColor(task.status)}`}>
                    {task.status}
                  </span>
                </div>
                {isOverdue(task) && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-md bg-rose-50 border border-rose-100 text-rose-700">
                    <AlertTriangle className="w-3.5 h-3.5" /> Overdue
                  </span>
                )}
              </div>

              <div className="mb-5">
                <h3 className={`text-base font-bold leading-snug transition-colors line-clamp-1 ${
                  isUrgent ? "text-red-800 group-hover:text-red-900" : "text-slate-900 group-hover:text-indigo-600"
                }`}>
                  {task.title}
                </h3>
                <p className={`text-sm mt-1.5 line-clamp-2 ${isUrgent ? "text-red-700/80" : "text-slate-500"}`}>
                  {task.description}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mb-5">
                <div className={`rounded-lg border p-2.5 ${
                  isUrgent ? "border-red-200 bg-red-100/60" : "border-slate-100 bg-slate-50/70"
                }`}>
                  <p className={isUrgent ? "text-red-500" : "text-slate-400"}>Campaign</p>
                  <p className={`font-semibold truncate inline-flex items-center gap-1.5 ${isUrgent ? "text-red-800" : "text-slate-700"}`}>
                    <FolderKanban className="w-3.5 h-3.5" />
                    {getReferenceName(task.campaignId, "No campaign")}
                  </p>
                </div>
                <div className={`rounded-lg border p-2.5 ${
                  isUrgent ? "border-red-200 bg-red-100/60" : "border-slate-100 bg-slate-50/70"
                }`}>
                  <p className={isUrgent ? "text-red-500" : "text-slate-400"}>Assigned To</p>
                  <p className={`font-semibold truncate inline-flex items-center gap-1.5 ${isUrgent ? "text-red-800" : "text-slate-700"}`}>
                    <UserRound className="w-3.5 h-3.5" />
                    {getReferenceName(task.assignedTo)}
                  </p>
                </div>
                <div className={`rounded-lg border p-2.5 sm:col-span-2 ${
                  isUrgent ? "border-red-200 bg-red-100/60" : "border-slate-100 bg-slate-50/70"
                }`}>
                  <p className={isUrgent ? "text-red-500" : "text-slate-400"}>Created By</p>
                  <p className={`font-semibold truncate inline-flex items-center gap-1.5 ${isUrgent ? "text-red-800" : "text-slate-700"}`}>
                    <UserRound className="w-3.5 h-3.5" />
                    {getReferenceName(task.makerId, "Unknown maker")}
                  </p>
                </div>
              </div>

              <div className="mb-5">
                <div className="flex justify-between text-xs font-medium mb-1.5">
                  <span className={isUrgent ? "text-red-600" : "text-slate-500"}>Progress</span>
                  <span className={isUrgent ? "text-red-800" : "text-slate-700"}>{task.percentageCompleted}%</span>
                </div>
                <div className={`w-full h-1.5 rounded-full overflow-hidden ${isUrgent ? "bg-red-200" : "bg-slate-100"}`}>
                  <div
                    className={`h-1.5 rounded-full transition-all duration-500 ${isUrgent ? "bg-red-600" : "bg-indigo-500"}`}
                    style={{ width: `${task.percentageCompleted}%` }}
                  ></div>
                </div>
              </div>

              <div className={`pt-4 space-y-2 ${isUrgent ? "border-t border-red-200" : "border-t border-slate-100"}`}>
                <div className="flex flex-wrap items-center gap-3">
                  <div className={`flex items-center gap-1.5 text-xs ${isUrgent ? "text-red-700" : "text-slate-500"}`}>
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatDate(task.dueDate)}</span>
                  </div>
                  <div className={`flex items-center gap-1.5 text-xs ${isUrgent ? "text-red-700" : "text-slate-500"}`}>
                    <Clock className="w-3.5 h-3.5" />
                    <span>{task.dueTime || "Not set"}</span>
                  </div>
                </div>

                <p className="text-sm font-bold text-red-600">
                  Remaining Date: {getRemainingSummary(task)}
                </p>

                {isZeroDayTask(task) && (
                  <p className="text-xs font-semibold text-red-700">
                    Due Time Window: {task.remainingDate?.dueTimeWithDayAndHour || "N/A"}
                  </p>
                )}

                {isZeroDayTask(task) && (
                  <p className="text-xs font-semibold text-red-700">
                    Due Date Time: {getDueDateTimeText(task)}
                  </p>
                )}

                <div className={`grid grid-cols-1 gap-1 text-[11px] ${isUrgent ? "text-red-700" : "text-slate-500"}`}>
                  <div>
                    Created: <span className={`font-medium ${isUrgent ? "text-red-800" : "text-slate-700"}`}>{formatDateTime(task.createdAt)}</span>
                  </div>
                
                </div>
              </div>
            </div>
          )})}
        </div>
      )}
    </div>
  );
};

export default MarketingPendingTask;