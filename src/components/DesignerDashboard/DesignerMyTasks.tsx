import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useUserDataDesigner } from "./HOOK/user_data_designer";
import useAxiosDesigner from "@/uri/useAxiosDesigner";

interface RemainingDate {
    days?: number;
    hours?: number;
    minutes?: number;
    dueTimeWithDayAndHour?: string;
    isOverdue?: boolean;
}

interface Campaign {
    _id: string;
    campaignName?: string;
}

interface Maker {
    _id: string;
    name?: string;
}

interface Task {
    _id: string;
    title?: string;
    makerId?: Maker;
    status?: "pending" | "in_progress" | "completed" | string;
    priority?: "Low" | "Medium" | "High" | string;
    campaignId?: Campaign;
    remainingDate?: RemainingDate;
    percentageCompleted?: number;
    description?: string;
    dueDate?: string;
    dueTime?: string;
}

const priorityStyles: Record<string, string> = {
    High: "bg-red-50 text-red-700 border border-red-200",
    Medium: "bg-amber-50 text-amber-700 border border-amber-200",
    Low: "bg-green-50 text-green-700 border border-green-200",
};

const statusStyles: Record<string, string> = {
    pending: "bg-amber-400",
    in_progress: "bg-blue-500",
    completed: "bg-green-500",
};

function getInitials(name: string): string {
    return name
        .split(" ")
        .filter(Boolean)
        .map((word) => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
}

function statusLabel(status: string): string {
    if (status === "in_progress") return "In Progress";
    return status.charAt(0).toUpperCase() + status.slice(1);
}

const DesignerMyTasks = () => {
    const axiosDesigner = useAxiosDesigner();
    const { userData } = useUserDataDesigner();

    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data: myTasks = [], isLoading ,refetch} = useQuery<Task[]>({
        queryKey: ["designer-tasks-individual", userData?._id],
        queryFn: async () => {
            const res = await axiosDesigner.get(`/api/v1/designer/my-tasks/${userData?._id}`);
            return res.data || [];
        },
        enabled: !!userData?._id,
    });

    const mutationforstatuscng = useMutation({
        mutationFn: async (taskId: string) => {
            const res = await axiosDesigner.post(`/api/v1/designer/change-status/${taskId}`, {
                status: "in_progress",
            });
            return res.data;
        },
        onSuccess: ()=>{
            alert("Status changed to in_progress");
            refetch();
        }
    })

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[240px] text-sm text-gray-500">
                Loading tasks...
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between py-4">
                <h2 className="text-lg font-medium text-gray-900">My Tasks</h2>
                <span className="text-xs text-gray-500 bg-gray-100 rounded-full px-3 py-1">
                    {myTasks.length} tasks
                </span>
            </div>

            {myTasks.length === 0 ? (
                <div className="rounded-xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
                    No tasks assigned yet.
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {myTasks.map((task) => {
                        const makerName = task.makerId?.name || "Unknown maker";
                        const campaignName = task.campaignId?.campaignName || "No campaign";
                        const remainingLabel = task.remainingDate?.dueTimeWithDayAndHour || "N/A";
                        const progress = typeof task.percentageCompleted === "number" ? task.percentageCompleted : 0;
                        const isOverdue = task.remainingDate?.isOverdue ?? false;

                        return (
                            <div
                                key={task._id}
                                className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-3 hover:border-gray-300 transition-colors cursor-pointer"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <span className="text-sm font-medium text-gray-900 leading-snug flex-1">
                                        {task.title || "Untitled task"}
                                    </span>
                                    <span className={`text-xs font-medium px-2 py-1 rounded-full shrink-0 ${priorityStyles[task.priority || ""] || "bg-gray-50 text-gray-700 border border-gray-200"}`}>
                                        {task.priority || "Unknown"}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-[#F16C65]/15 text-[#F16C65] flex items-center justify-center text-xs font-medium shrink-0">
                                        {getInitials(makerName)}
                                    </div>
                                    <span className="text-xs font-medium text-[#F16C65]">{makerName}</span>
                                </div>

                                <hr className="border-gray-100" />

                                <div className="flex items-center gap-2 flex-wrap">
                                    <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-full px-2.5 py-1">
                                        <span className={`w-2 h-2 rounded-full ${statusStyles[task.status || ""] || "bg-gray-400"}`} />
                                        {statusLabel(task.status || "pending")}
                                    </div>
                                    <span className="text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-full px-2.5 py-1">
                                        {campaignName}
                                    </span>
                                </div>

                                <div className="flex items-center gap-1.5">
                                    <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 16 16" fill="none">
                                        <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1" />
                                        <path d="M8 5v3.5l2 1.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                                    </svg>
                                    <span className={`text-xs ${isOverdue ? "text-red-600" : "text-gray-500"}`}>
                                        {remainingLabel} remaining
                                    </span>
                                </div>

                                {task.description ? (
                                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{task.description}</p>
                                ) : null}

                                <div className="h-1 rounded-full bg-gray-100 overflow-hidden">
                                    <div
                                        className="h-full bg-teal-500 rounded-full"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-xs text-gray-400">{progress}% complete</span>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedTask(task);
                                                setIsModalOpen(true);
                                            }}
                                            className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-white text-gray-700 border border-gray-200 rounded-md hover:bg-gray-50"
                                        >
                                            View Details
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => mutationforstatuscng.mutate(task._id)}
                                            className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100"
                                        >
                                            Start Work
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
                        {isModalOpen && selectedTask && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                                <div
                                    className="fixed inset-0 bg-black/50"
                                    onClick={() => { setIsModalOpen(false); setSelectedTask(null); }}
                                />

                                <div
                                    role="dialog"
                                    aria-modal="true"
                                    aria-labelledby="task-modal-title"
                                    className="relative z-10 w-full max-w-2xl mx-auto"
                                >
                                    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100">
                                        <header className="flex items-center justify-between p-5 border-b border-slate-100">
                                            <div>
                                                <h3 id="task-modal-title" className="text-lg font-semibold text-slate-900">{selectedTask.title || 'Task Details'}</h3>
                                                <p className="text-xs text-slate-500 mt-1">Detailed information about this task</p>
                                            </div>
                                            <button
                                                aria-label="Close details"
                                                onClick={() => { setIsModalOpen(false); setSelectedTask(null); }}
                                                className="rounded-md p-2 text-slate-500 hover:bg-slate-50"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </header>

                                        <div className="p-6">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-700">
                                                <div className="space-y-2">
                                                    <div className="text-xs text-slate-500">Maker</div>
                                                    <div className="font-medium text-slate-900">{selectedTask.makerId?.name || 'Unknown'}</div>
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="text-xs text-slate-500">Campaign</div>
                                                    <div className="font-medium text-slate-900">{selectedTask.campaignId?.campaignName || 'No campaign'}</div>
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="text-xs text-slate-500">Status</div>
                                                    <div className="font-medium text-slate-900">{selectedTask.status || '-'}</div>
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="text-xs text-slate-500">Priority</div>
                                                    <div className="font-medium text-slate-900">{selectedTask.priority || '-'}</div>
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="text-xs text-slate-500">Due</div>
                                                    <div className="font-medium text-slate-900">{selectedTask.dueDate || 'N/A'}{selectedTask.dueTime ? ` · ${selectedTask.dueTime}` : ''}</div>
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="text-xs text-slate-500">Remaining</div>
                                                    <div className="font-medium text-slate-900">{selectedTask.remainingDate?.dueTimeWithDayAndHour ?? 'N/A'}</div>
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="text-xs text-slate-500">Days</div>
                                                    <div className="font-medium text-slate-900">{selectedTask.remainingDate?.days ?? '-'}</div>
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="text-xs text-slate-500">Hours</div>
                                                    <div className="font-medium text-slate-900">{selectedTask.remainingDate?.hours ?? '-'}</div>
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="text-xs text-slate-500">Minutes</div>
                                                    <div className="font-medium text-slate-900">{selectedTask.remainingDate?.minutes ?? '-'}</div>
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="text-xs text-slate-500">Overdue</div>
                                                    <div className="font-medium text-slate-900">{selectedTask.remainingDate?.isOverdue ? 'Yes' : 'No'}</div>
                                                </div>
                                            </div>

                                            {selectedTask.description ? (
                                                <div className="mt-6">
                                                    <div className="text-xs text-slate-500">Description</div>
                                                    <div className="mt-2 text-sm text-slate-700 bg-slate-50 p-3 rounded-md">{selectedTask.description}</div>
                                                </div>
                                            ) : null}
                                        </div>

                                        <footer className="flex items-center justify-end gap-2 p-4 border-t border-slate-100">
                                            <button
                                                type="button"
                                                onClick={() => { setIsModalOpen(false); setSelectedTask(null); }}
                                                className="px-3 py-2 text-sm rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                                            >
                                                Close
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => { console.log(selectedTask._id); setIsModalOpen(false); setSelectedTask(null); }}
                                                className="px-3 py-2 text-sm rounded-md bg-[#F16C65] text-white hover:bg-[#e4564f]"
                                            >
                                                Start Work
                                            </button>
                                        </footer>
                                    </div>
                                </div>
                            </div>
                        )}
        </div>
    );
};

export default DesignerMyTasks;