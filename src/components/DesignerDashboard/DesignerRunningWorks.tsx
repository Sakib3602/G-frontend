import useAxiosDesigner from "@/uri/useAxiosDesigner";
import { useUserDataDesigner } from "./HOOK/user_data_designer";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import Alert from "../MarketingDashboard/Alert/Alert";

type RemainingDate = {
    days?: number;
    hours?: number;
    minutes?: number;
    dueTimeWithDayAndHour?: string;
    isOverdue?: boolean;
};

type Campaign = { _id: string; campaignName?: string };
type Maker = { _id: string; name?: string };

type Task = {
    _id: string;
    title?: string;
    makerId?: Maker;
    status?: string;
    priority?: string;
    campaignId?: Campaign;
    remainingDate?: RemainingDate;
    percentageCompleted?: number;
    description?: string;
    dueDate?: string;
    dueTime?: string;
};

const DesignerRunningWorks = () => {
    const axiosDesigner = useAxiosDesigner();
    const { userData } = useUserDataDesigner();

    const { data: myTasks = [], isLoading , refetch} = useQuery<Task[]>({
        queryKey: ["designer-running-tasks", userData?._id],
        queryFn: async () => {
            const res = await axiosDesigner.get(`/api/v1/designer/my-works/${userData?._id}`);
            return res.data || [];
        },
        enabled: !!userData?._id,
    });
  

    // Local UI state
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [linkTask, setLinkTask] = useState<Task | null>(null);
    const [isLinkOpen, setIsLinkOpen] = useState(false);
    const [linkValue, setLinkValue] = useState("");

    // Keep a local progress map to allow UI-only increments
    const initialProgress = useMemo(() => {
        const map: Record<string, number> = {};
        (myTasks || []).forEach((t) => {
            map[t._id] = typeof t.percentageCompleted === "number" ? t.percentageCompleted : 0;
        });
        return map;
    }, [myTasks]);

    const [localProgress, setLocalProgress] = useState<Record<string, number>>(initialProgress);

    // sync when tasks change
    if (Object.keys(localProgress).length === 0 && Object.keys(initialProgress).length > 0) {
        setLocalProgress(initialProgress);
    }

    const incrementProgress = (taskId: string) => {
        setLocalProgress((prev) => {
            const current = prev[taskId] ?? 0;
            const next = Math.min(100, current + 10);
            const nextMap = { ...prev, [taskId]: next };
            // console.log("Incremented progress", { taskId, from: current, to: next });
            mutationUpdateProgress.mutate({ taskId, progress: next });
            return nextMap;
        });
    };

    const [showNotification, setShowNotification] = useState(false);
    const [showNotificationn, setShowNotificationn] = useState(false);
    const mutationUpdateProgress = useMutation({
        mutationFn: async ({ taskId, progress }: { taskId: string; progress: number }) => {
            const data = await axiosDesigner.post(`/api/v1/designer/update-progress/${taskId}`, { percentageCompleted: progress });
            return data;
        },
        onSuccess: ()=>{
            setShowNotification(true);
        }
    });

    const openLinkModal = (task: Task) => {
        setLinkTask(task);
        setLinkValue("");
        setIsLinkOpen(true);
    };

    const submitLink = () => {
        if (!linkTask) return;
        console.log("Done task link submitted", { taskId: linkTask._id, link: linkValue });
        mutationDoneTask.mutate({ taskId: linkTask._id, link: linkValue });
        setIsLinkOpen(false);
        setLinkTask(null);
        setLinkValue("");
    };
    const mutationDoneTask = useMutation({
        mutationFn: async ({ taskId, link }: { taskId: string; link: string }) => {
            const data = await axiosDesigner.post(`/api/v1/designer/complete-task/${taskId}`, { url: link });
            return data;
        },
         onSuccess: ()=>{
            refetch();
            setShowNotificationn(true);
        }
    })

    const makerName = (t: Task) => t.makerId?.name || "Unknown maker";

    return (
        <>
        {
            showNotification && <Alert title="Progress Updated" message="Working Progress Updated!" onClose={() => setShowNotification(false)}></Alert>
        }
        {
            showNotificationn && <Alert title="Task Completed" message="Task marked as completed!" onClose={() => setShowNotificationn(false)}></Alert>
        }
        <div className="max-w-7xl mx-auto p-4">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-slate-900">Running Works</h2>
                <p className="text-sm text-slate-500">In-progress tasks assigned to you</p>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center min-h-50 text-sm text-gray-500">Loading...</div>
            ) : myTasks.length === 0 ? (
                <div className="rounded-xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-500">No running works.</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {myTasks.map((task) => {
                        const overdue = task.remainingDate?.isOverdue ?? false;
                        const progress = localProgress[task._id] ?? (typeof task.percentageCompleted === "number" ? task.percentageCompleted : 0);
                        const remainingLabel = task.remainingDate?.dueTimeWithDayAndHour ?? (typeof task.remainingDate?.days === 'number' ? `${task.remainingDate?.days} day${task.remainingDate?.days === 1 ? '' : 's'}` : 'N/A');

                        return (
                            <div key={task._id} className={`rounded-2xl border p-4 shadow-sm transition ${overdue ? 'bg-red-50 border-red-300' : 'bg-white border-slate-200 hover:shadow-md'}`}>
                                <div className="flex items-start justify-between gap-2 mb-3">
                                    <div className="flex-1">
                                        <h3 className={`text-sm font-semibold ${overdue ? 'text-red-800' : 'text-slate-900'}`}>{task.title || 'Untitled'}</h3>
                                        <div className="mt-2 flex items-center gap-2">
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${task.priority === 'High' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'}`}>{task.priority || 'Normal'}</span>
                                            <span className="text-xs text-slate-500">{task.status || 'in_progress'}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <div className="w-8 h-8 rounded-full bg-[#F16C65]/15 text-[#F16C65] flex items-center justify-center font-medium text-xs">{makerName(task).split(' ').map(s => s[0]).slice(0,2).join('')}</div>
                                        <div className="text-xs text-slate-500">{makerName(task)}</div>
                                    </div>
                                </div>

                                <div className="text-xs text-slate-500 mb-2">{task.campaignId?.campaignName || 'No campaign'}</div>

                                <div className={`mb-3 text-sm font-medium ${overdue ? 'text-red-700' : 'text-slate-600'}`}>Remaining: {remainingLabel}</div>

                                <div className="mb-3">
                                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-2 bg-indigo-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
                                        <span>{progress}%</span>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => incrementProgress(task._id)} className="text-xs px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md">+10%</button>
                                            <button onClick={() => { setSelectedTask(task); setIsDetailsOpen(true); }} className="text-xs px-2 py-1 bg-white border border-slate-200 rounded-md">View Details</button>
                                            <button onClick={() => openLinkModal(task)} className="text-xs px-2 py-1 bg-[#F16C65] text-white rounded-md">Done Task</button>
                                        </div>
                                    </div>
                                </div>

                                {/* description is shown only in modal now */}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Details modal */}
            {isDetailsOpen && selectedTask && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <div className="fixed inset-0 bg-slate-950/55 backdrop-blur-sm" onClick={() => { setIsDetailsOpen(false); setSelectedTask(null); }} />
                    <div role="dialog" aria-modal="true" aria-labelledby="task-details-title" className="relative z-10 w-full max-w-2xl mx-auto">
                        <div className="overflow-hidden rounded-3xl bg-white shadow-[0_25px_80px_rgba(15,23,42,0.25)] border border-white/60">
                            <div className="h-2 bg-linear-to-r from-[#F16C65] via-rose-500 to-indigo-500" />
                            <div className="flex items-start justify-between gap-4 p-6 border-b border-slate-100">
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 uppercase tracking-wide">Task Details</span>
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${selectedTask.remainingDate?.isOverdue ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                            {selectedTask.remainingDate?.isOverdue ? 'Overdue' : 'On Track'}
                                        </span>
                                    </div>
                                    <h3 id="task-details-title" className="truncate text-2xl font-semibold text-slate-900">{selectedTask.title || 'Untitled task'}</h3>
                                    <p className="mt-1 text-sm text-slate-500">Full task details and metadata</p>
                                </div>
                                <button onClick={() => { setIsDetailsOpen(false); setSelectedTask(null); }} className="rounded-full border border-slate-200 bg-white p-2.5 text-slate-500 transition hover:border-slate-300 hover:bg-slate-50">
                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="p-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                                        <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Maker</div>
                                        <div className="mt-1 text-sm font-semibold text-slate-900">{selectedTask.makerId?.name || 'Unknown'}</div>
                                    </div>
                                    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                                        <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Campaign</div>
                                        <div className="mt-1 text-sm font-semibold text-slate-900">{selectedTask.campaignId?.campaignName || 'No campaign'}</div>
                                    </div>
                                    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                                        <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Status</div>
                                        <div className="mt-1 text-sm font-semibold text-slate-900">{selectedTask.status || '-'}</div>
                                    </div>
                                    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                                        <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Priority</div>
                                        <div className="mt-1 text-sm font-semibold text-slate-900">{selectedTask.priority || '-'}</div>
                                    </div>
                                </div>

                                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                                        <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Remaining</div>
                                        <div className={`mt-1 text-sm font-semibold ${selectedTask.remainingDate?.isOverdue ? 'text-rose-700' : 'text-slate-900'}`}>{selectedTask.remainingDate?.dueTimeWithDayAndHour || 'N/A'}</div>
                                    </div>
                                    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                                        <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Days</div>
                                        <div className="mt-1 text-sm font-semibold text-slate-900">{selectedTask.remainingDate?.days ?? '-'}</div>
                                    </div>
                                    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                                        <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Progress</div>
                                        <div className="mt-1 text-sm font-semibold text-slate-900">{selectedTask.percentageCompleted ?? 0}%</div>
                                    </div>
                                </div>

                                {selectedTask.description ? (
                                    <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                                        <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Description</div>
                                        <div className="mt-2 text-sm leading-6 text-slate-700">{selectedTask.description}</div>
                                    </div>
                                ) : null}
                            </div>

                            <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/60 px-6 py-4">
                                <button onClick={() => { setIsDetailsOpen(false); setSelectedTask(null); }} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50">Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Done task link modal */}
            {isLinkOpen && linkTask && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <div className="fixed inset-0 bg-slate-950/55 backdrop-blur-sm" onClick={() => { setIsLinkOpen(false); setLinkTask(null); }} />
                    <div role="dialog" aria-modal="true" aria-labelledby="done-link-title" className="relative z-10 w-full max-w-md mx-auto">
                        <div className="overflow-hidden rounded-3xl bg-white shadow-[0_25px_80px_rgba(15,23,42,0.25)] border border-white/60">
                            <div className="h-2 bg-linear-to-r from-[#F16C65] via-rose-500 to-indigo-500" />
                            <header className="flex items-start justify-between gap-4 p-6 border-b border-slate-100">
                                <div>
                                    <div className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600">Done Task</div>
                                    <h3 id="done-link-title" className="mt-3 text-2xl font-semibold text-slate-900">Submit completion link</h3>
                                    <p className="mt-1 text-sm text-slate-500">Share a public link so the task can be reviewed and verified.</p>
                                </div>
                                <button aria-label="Close" onClick={() => { setIsLinkOpen(false); setLinkTask(null); }} className="rounded-full border border-slate-200 bg-white p-2.5 text-slate-500 transition hover:border-slate-300 hover:bg-slate-50">
                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </header>

                            <div className="p-6">
                                <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 mb-5">
                                    <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Selected Task</div>
                                    <div className="mt-1 text-sm font-semibold text-slate-900">{linkTask.title || 'Untitled task'}</div>
                                    <div className="mt-1 text-xs text-slate-500">{linkTask.campaignId?.campaignName || 'No campaign'}</div>
                                </div>

                                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Completion link</label>
                                <div className="mt-2 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm focus-within:ring-2 focus-within:ring-indigo-100">
                                    <input
                                        value={linkValue}
                                        onChange={(e) => setLinkValue(e.target.value)}
                                        placeholder="https://"
                                        className="w-full border-0 p-0 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                                    />
                                </div>
                                <p className="mt-2 text-xs text-slate-400">Paste a Figma, Google Drive, or other public review link.</p>
                            </div>

                            <footer className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/60 px-6 py-4">
                                <button onClick={() => { setIsLinkOpen(false); setLinkTask(null); }} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50">Cancel</button>
                                <button onClick={submitLink} className="rounded-xl bg-[#F16C65] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#e4564f]">Submit</button>
                            </footer>
                        </div>
                    </div>
                </div>
            )}
        </div>
        </>
    );
};

export default DesignerRunningWorks;