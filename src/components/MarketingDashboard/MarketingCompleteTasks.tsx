import useAxiosMarketing from "@/uri/useAxiosMarketing";
import { useUserDataMarketing } from "./HOOK/User_Data_Marketer";
import { useQuery } from "@tanstack/react-query";

type PersonRef = {
    _id: string;
    name?: string;
    email?: string;
};

type CampaignRef = {
    _id: string;
    campaignName?: string;
};

type RemainingDateInfo = {
    dueTimeWithDayAndHour?: string;
    isOverdue?: boolean;
    overdueHours?: number | string;
};

type Task = {
    _id: string;
    title?: string;
    description?: string;
    status?: string;
    priority?: string;
    dueDate?: string;
    dueTime?: string;
    percentageCompleted?: number;
    assignedTo?: PersonRef | string | null;
    makerId?: PersonRef | string | null;
    campaignId?: CampaignRef | string | null;
    remainingDate?: RemainingDateInfo;
    updatedAt?: string;
    createdAt?: string;
};

function getReferenceName(reference?: PersonRef | CampaignRef | string | null, fallback = "Not assigned") {
    if (!reference) return fallback;
    if (typeof reference === "string") {
        return /^[a-f\d]{24}$/i.test(reference) ? fallback : reference;
    }
    if ("campaignName" in reference && reference.campaignName) return reference.campaignName;
    if ("name" in reference && reference.name) return reference.name;
    return fallback;
}

function formatDateTime(value?: string) {
    if (!value) return "N/A";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "N/A";
    return parsed.toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function statusColor(status: string) {
    switch (status.toLowerCase()) {
        case "completed":
            return "bg-emerald-50 text-emerald-700 border-emerald-100";
        case "in_progress":
        case "in-progress":
            return "bg-blue-50 text-blue-700 border-blue-100";
        case "pending":
            return "bg-amber-50 text-amber-700 border-amber-100";
        default:
            return "bg-slate-100 text-slate-700 border-slate-200";
    }
}

function priorityColor(priority: string) {
    switch (priority) {
        case "High":
            return "bg-rose-50 text-rose-700 border-rose-100";
        case "Medium":
            return "bg-amber-50 text-amber-700 border-amber-100";
        case "Low":
            return "bg-emerald-50 text-emerald-700 border-emerald-100";
        default:
            return "bg-slate-100 text-slate-700 border-slate-200";
    }
}

function formatDuration(value?: number | string) {
    if (value === null || value === undefined) return "N/A";
    const num = typeof value === "number" ? value : parseFloat(String(value));
    if (!Number.isFinite(num)) return "N/A";
    const abs = Math.abs(num);
    const days = Math.floor(abs / 24);
    const hours = Math.floor(abs % 24);
    const parts: string[] = [];
    if (days > 0) parts.push(`${days} day${days === 1 ? "" : "s"}`);
    if (hours > 0) parts.push(`${hours} hour${hours === 1 ? "" : "s"}`);
    if (parts.length === 0) return "Less than 1 hour";
    return parts.join(" ");
}

const MarketingCompleteTasks = () => {
    const { userData } = useUserDataMarketing();
    const axiosMarketing = useAxiosMarketing();
    const { data: tasks = [], isLoading } = useQuery<Task[]>({
        queryKey: ["marketing-complete-tasks", userData?._id],
        queryFn: async () => {
            const res = await axiosMarketing.get(`/tasks/completed-tasks/${userData?._id}`);
            return res.data || [];
        },
        enabled: !!userData?._id,
    });
    console.log("Fetched completed tasks:", tasks);

    return (
        <div className="max-w-7xl mx-auto p-6 min-h-screen">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Completed Tasks</h1>
                    <p className="text-sm text-slate-500 mt-1">A table view of all finished marketing tasks.</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 shadow-sm">
                    <p className="text-xs font-medium text-slate-500">Total Completed</p>
                    <p className="text-lg font-semibold text-emerald-600">{tasks.length}</p>
                </div>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center min-h-[280px] text-sm text-slate-500">
                    Loading completed tasks...
                </div>
            ) : tasks.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
                    No completed tasks found.
                </div>
            ) : (
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Task</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Campaign</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Maker</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Priority</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Link</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Completed At</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {tasks.map((task) => {
                                    const status = task.status || "completed";
                                    const priority = task.priority || "Normal";

                                    return (
                                        <tr key={task._id} className="hover:bg-slate-50/70 transition-colors">
                                            <td className="px-4 py-4 align-top">
                                                <div className="max-w-[260px]">
                                                    <div className="text-sm font-semibold text-slate-900 line-clamp-2">
                                                        {task.title || "Untitled task"}
                                                    </div>
                                                    {task.description ? (
                                                        <div className="mt-1 text-xs text-slate-500 line-clamp-2">
                                                            {task.description}
                                                        </div>
                                                    ) : null}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 align-top text-sm text-slate-700">
                                                {getReferenceName(task.campaignId, "No campaign")}
                                            </td>
                                            <td className="px-4 py-4 align-top text-sm text-slate-700">
                                                {getReferenceName(task.makerId, "Not assigned")}
                                            </td>
                                            <td className="px-4 py-4 align-top">
                                                <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${priorityColor(priority)}`}>
                                                    {priority}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 align-top">
                                                <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${statusColor(status)}`}>
                                                    {status === "in_progress" ? "In Progress" : status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 align-top text-sm font-medium text-rose-700">
                                                <div className="max-w-[200px]">
                                                    <a
                                                        href={`/tasks/${task._id}`}
                                                        className="text-sm font-medium text-indigo-600 hover:underline"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        Open
                                                    </a>
                                                    <div className="mt-1 text-xs">
                                                        {task.remainingDate?.isOverdue ? (
                                                            <span className="text-rose-600 font-medium">Overdue by {formatDuration(task.remainingDate?.overdueHours)}</span>
                                                        ) : (
                                                            <span className="text-emerald-600 font-medium">Not overdue</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 align-top text-sm text-slate-600">
                                                {formatDateTime(task.updatedAt || task.createdAt)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MarketingCompleteTasks;