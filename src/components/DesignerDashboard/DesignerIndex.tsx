import useAxiosDesigner from "@/uri/useAxiosDesigner";
import { useUserDataDesigner } from "./HOOK/user_data_designer";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
    ArrowUpRight,
    CalendarClock,
    CheckCircle2,
    CircleAlert,
    Clock3,
    ListTodo,
    ListChecks,
} from "lucide-react";

type DesignerCompletedTask = {
    _id: string;
    title?: string;
    priority?: string;
    updatedAt?: string;
    remainingDate?: {
        dueTimeWithDayAndHour?: string;
        isOverdue?: boolean;
    };
};

type DesignerDashboardResponse = {
    tasks?: {
        total?: number;
        pending?: number;
        inProgress?: number;
        overdue?: number;
    };
    completedData?: DesignerCompletedTask[];
};

// ─── Content Calendar (mine=true) response shape ───────────────
// NOTE: /api/v1/designer/calendar-items?mine=true সবসময় "আমাকে assign করা
// item" ফেরত দেয় — normal designer আর full-access (special) designer
// দুইজনের জন্যই একই রকম কাজ করে। তাই dashboard এ এইটা directly ব্যবহার
// করলেই "নিজে assign করা কাজ কয়টা" count হয়ে যাবে।
type CalendarItemsMineResponse = {
    items?: unknown[];
    stats?: {
        running?: number;
        dueThisMonth?: number;
        missedLastMonth?: number;
    };
    fullAccess?: boolean;
    mine?: boolean;
};

type MonthFilter = "thisMonth" | "lastMonth";

function isTaskInSelectedMonth(updatedAt?: string, monthFilter?: MonthFilter) {
    if (!updatedAt) return false;

    const taskDate = new Date(updatedAt);
    if (Number.isNaN(taskDate.getTime())) return false;

    const today = new Date();
    const targetMonth = monthFilter === "lastMonth" ? today.getMonth() - 1 : today.getMonth();
    const targetYear = monthFilter === "lastMonth" && today.getMonth() === 0 ? today.getFullYear() - 1 : today.getFullYear();

    return taskDate.getMonth() === (targetMonth + 12) % 12 && taskDate.getFullYear() === targetYear;
}


const DesignerIndex = () => {
    const axiosDesigner = useAxiosDesigner();
    const { userData } = useUserDataDesigner();
    const [monthFilter, setMonthFilter] = useState<MonthFilter>("thisMonth");

    const { data, isLoading } = useQuery<DesignerDashboardResponse>({
        queryKey: ["designer-dashboard", userData?._id],
        queryFn: async () => {
            const res = await axiosDesigner.get(`/api/v1/designer/dashboard/all/${userData?._id}`);
            return res.data?.data ?? res.data ?? {};
        },
        enabled: !!userData?._id,
    });

    // ─── NEW: Content Calendar work assigned to me ───
    const { data: calendarMine, isLoading: isCalendarLoading } = useQuery<CalendarItemsMineResponse>({
        queryKey: ["designer-calendar-items-mine", userData?._id],
        queryFn: async () => {
            const res = await axiosDesigner.get("/api/v1/designer/calendar-items", {
                params: { mine: "true" },
            });
            return res.data?.data ?? {};
        },
        enabled: !!userData?._id,
    });

    const summary = data?.tasks ?? { total: 0, pending: 0, inProgress: 0, overdue: 0 };
    const completedTasks = data?.completedData ?? [];
    const filteredCompletedTasks = completedTasks.filter((task) => isTaskInSelectedMonth(task.updatedAt, monthFilter));
    const overdueTrueCount = completedTasks.filter((task) => task.remainingDate?.isOverdue === true).length;
    const overdueFalseCount = completedTasks.filter((task) => task.remainingDate?.isOverdue === false).length;
    const totalTasks = summary.total ?? 0;

    const completionRate = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

    // Content Calendar stats (my assigned items)
    const totalCalendarItems = calendarMine?.items?.length ?? 0;
    const calendarRunning = calendarMine?.stats?.running ?? 0;
    const calendarDueThisMonth = calendarMine?.stats?.dueThisMonth ?? 0;
    const calendarMissedLastMonth = calendarMine?.stats?.missedLastMonth ?? 0;

    return (
        <div className="w-full px-4 py-6 sm:px-6 lg:px-8">

            <div className="rounded-[2rem] border border-slate-200/80 shadow-[0_24px_70px_-28px_rgba(15,23,42,0.14)]">
                <div className="border-b border-slate-100 px-6 py-7 sm:px-8">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-2xl">
                           
                            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                                Work summary for {userData?.name || "designer"}
                            </h1>
                            <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
                                Review workload status, spot overdue items quickly, and track completed output in one clean view.
                            </p>
                        </div>

                        <div className="grid min-w-[280px] gap-3 rounded-3xl border border-slate-200 p-4 shadow-sm sm:grid-cols-2">
                            <div className="rounded-2xl border border-slate-200 px-4 py-3">
                                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                    Completed
                                </div>
                                <div className="mt-2 text-2xl font-semibold text-slate-900">{completedTasks.length}</div>
                            </div>
                            <div className="rounded-2xl border border-slate-200 px-4 py-3">
                                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    <ArrowUpRight className="h-4 w-4 text-blue-500" />
                                    Completion rate
                                </div>
                                <div className="mt-2 text-2xl font-semibold text-slate-900">{completionRate}%</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-6 sm:px-8">
                    {isLoading ? (
                        <div className="flex min-h-[220px] items-center justify-center text-sm text-slate-500">
                            Loading designer tasks...
                        </div>
                    ) : (
                        <>
                            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                <div className="rounded-3xl border border-slate-200 p-5">
                                    <div className="flex items-center justify-between">
                                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total tasks</div>
                                        <div className="rounded-full border border-slate-200 p-2 text-slate-500"><ListTodo className="h-4 w-4" /></div>
                                    </div>
                                    <div className="mt-3 text-3xl font-semibold text-slate-900">{totalTasks}</div>
                                    <div className="mt-2 text-xs text-slate-500">All tasks in the current dataset</div>
                                </div>

                                <div className="rounded-3xl border border-slate-200 p-5">
                                    <div className="flex items-center justify-between">
                                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Pending</div>
                                        <div className="rounded-full border border-slate-200 p-2 text-amber-600"><Clock3 className="h-4 w-4" /></div>
                                    </div>
                                    <div className="mt-3 text-3xl font-semibold text-amber-600">{summary.pending}</div>
                                    <div className="mt-2 text-xs text-slate-500">Waiting to be started</div>
                                </div>

                                <div className="rounded-3xl border border-slate-200 p-5">
                                    <div className="flex items-center justify-between">
                                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">In progress</div>
                                        <div className="rounded-full border border-slate-200 p-2 text-blue-600"><ArrowUpRight className="h-4 w-4" /></div>
                                    </div>
                                    <div className="mt-3 text-3xl font-semibold text-blue-600">{summary.inProgress}</div>
                                    <div className="mt-2 text-xs text-slate-500">Currently being worked on</div>
                                </div>

                                <div className="rounded-3xl border border-slate-200 p-5">
                                    <div className="flex items-center justify-between">
                                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Overdue not completed</div>
                                        <div className="rounded-full border border-slate-200 p-2 text-rose-600"><CircleAlert className="h-4 w-4" /></div>
                                    </div>
                                    <div className="mt-3 text-3xl font-semibold text-rose-600">{summary.overdue}</div>
                                    <div className="mt-2 text-xs text-slate-500">Needs attention now</div>
                                </div>
                            </div>

                            {/* ─── NEW: Content Calendar Overview ───
                                normal designer এর নিজের assign করা item, অথবা
                                special/full-access designer নিজেকে assign করা item —
                                দুইটার জন্যই এখানে count দেখাবে। */}
                            <div className="mt-6">
                                <div className="mb-3 flex items-center justify-between">
                                    <h2 className="text-base font-semibold text-slate-900">Content Calendar Work</h2>
                                    {calendarMine?.fullAccess && (
                                        <span className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-[11px] font-semibold text-indigo-700">
                                            Special Access
                                        </span>
                                    )}
                                </div>

                                {isCalendarLoading ? (
                                    <div className="flex min-h-[100px] items-center justify-center text-sm text-slate-500">
                                        Loading content calendar work...
                                    </div>
                                ) : (
                                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                        <div className="rounded-3xl border border-slate-200 p-5">
                                            <div className="flex items-center justify-between">
                                                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                    My Content Items
                                                </div>
                                                <div className="rounded-full border border-slate-200 p-2 text-indigo-600">
                                                    <ListChecks className="h-4 w-4" />
                                                </div>
                                            </div>
                                            <div className="mt-3 text-3xl font-semibold text-indigo-600">{totalCalendarItems}</div>
                                            <div className="mt-2 text-xs text-slate-500">
                                                Total items assigned to you in Content Calendar
                                            </div>
                                        </div>

                                        <div className="rounded-3xl border border-slate-200 p-5">
                                            <div className="flex items-center justify-between">
                                                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Running</div>
                                                <div className="rounded-full border border-slate-200 p-2 text-blue-600">
                                                    <ArrowUpRight className="h-4 w-4" />
                                                </div>
                                            </div>
                                            <div className="mt-3 text-3xl font-semibold text-blue-600">{calendarRunning}</div>
                                            <div className="mt-2 text-xs text-slate-500">Not yet delivered / published</div>
                                        </div>

                                        <div className="rounded-3xl border border-slate-200 p-5">
                                            <div className="flex items-center justify-between">
                                                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                    Due This Month
                                                </div>
                                                <div className="rounded-full border border-slate-200 p-2 text-amber-600">
                                                    <CalendarClock className="h-4 w-4" />
                                                </div>
                                            </div>
                                            <div className="mt-3 text-3xl font-semibold text-amber-600">{calendarDueThisMonth}</div>
                                            <div className="mt-2 text-xs text-slate-500">Delivery date falls in this month</div>
                                        </div>

                                        <div className="rounded-3xl border border-slate-200 p-5">
                                            <div className="flex items-center justify-between">
                                                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                    Missed Last Month
                                                </div>
                                                <div className="rounded-full border border-slate-200 p-2 text-rose-600">
                                                    <CircleAlert className="h-4 w-4" />
                                                </div>
                                            </div>
                                            <div className="mt-3 text-3xl font-semibold text-rose-600">{calendarMissedLastMonth}</div>
                                            <div className="mt-2 text-xs text-slate-500">Missed deadline, last month</div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200">
                                <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
                                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <h2 className="text-lg font-semibold text-slate-900">Completed tasks</h2>
                                            <p className="mt-1 text-sm text-slate-500">Showing completedData from the API response.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-5 py-4 sm:px-6">
                                    <button
                                        type="button"
                                        onClick={() => setMonthFilter("thisMonth")}
                                        className={`rounded-full px-4 py-2 text-sm font-medium transition ${monthFilter === "thisMonth" ? "border border-slate-900 text-slate-900" : "border border-slate-200 text-slate-600 hover:border-slate-300"}`}
                                    >
                                        This month
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setMonthFilter("lastMonth")}
                                        className={`rounded-full px-4 py-2 text-sm font-medium transition ${monthFilter === "lastMonth" ? "border border-slate-900 text-slate-900" : "border border-slate-200 text-slate-600 hover:border-slate-300"}`}
                                    >
                                        Last month
                                    </button>
                                    <div className="ml-auto flex flex-wrap items-center gap-2">
                                        <span className="inline-flex items-center rounded-full border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-700">
                                            Overdue: {overdueTrueCount}
                                        </span>
                                        <span className="inline-flex items-center rounded-full border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700">
                                            On Time: {overdueFalseCount}
                                        </span>
                                        <span className="inline-flex items-center rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600">
                                            {filteredCompletedTasks.length} completed
                                        </span>
                                    </div>
                                </div>

                                {filteredCompletedTasks.length === 0 ? (
                                    <div className="px-6 py-10 text-center text-sm text-slate-500">
                                        No completed tasks found.
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-slate-200">
                                            <thead>
                                                <tr className="text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                                                    <th className="px-6 py-4">Title</th>
                                                    <th className="px-6 py-4">Priority</th>
                                                    <th className="px-6 py-4">Completed At</th>
                                                    <th className="px-6 py-4">Due</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {filteredCompletedTasks.map((task) => {
                                                    const updatedLabel = task.updatedAt ? new Date(task.updatedAt).toLocaleString() : "N/A";
                                                    const remainingLabel = task.remainingDate?.isOverdue
                                                        ? task.remainingDate?.dueTimeWithDayAndHour || "Overdue"
                                                        : task.remainingDate?.dueTimeWithDayAndHour || "On time";

                                                    return (
                                                        <tr key={task._id} className="align-top transition hover:bg-slate-50/70">
                                                            <td className="px-6 py-4 text-sm font-medium text-slate-900">{task.title || "Untitled task"}</td>
                                                            <td className="px-6 py-4 text-sm text-slate-600">
                                                                <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700">
                                                                    {task.priority || "N/A"}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 text-sm text-slate-600">{updatedLabel}</td>
                                                            <td className="px-6 py-4 text-sm">
                                                                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${task.remainingDate?.isOverdue ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}>
                                                                    {remainingLabel}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DesignerIndex;