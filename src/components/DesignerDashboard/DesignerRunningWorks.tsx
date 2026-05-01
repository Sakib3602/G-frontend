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

    const { data: myTasks = [], isLoading } = useQuery<Task[]>({
        queryKey: ["designer-running-tasks", userData?._id],
        queryFn: async () => {
            const res = await axiosDesigner.get(`/api/v1/designer/my-tasks/${userData?._id}`);
            return res.data || [];
        },
        enabled: !!userData?._id,
    });
    console.log("Fetched tasks", myTasks );

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
        setIsLinkOpen(false);
        setLinkTask(null);
        setLinkValue("");
    };

    const makerName = (t: Task) => t.makerId?.name || "Unknown maker";

    return (
        <>
        {
            showNotification && <Alert title="Progress Updated" message="Working Progress Updated!" onClose={() => setShowNotification(false)}></Alert>
        }
        <div className="max-w-7xl mx-auto p-4">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-slate-900">Running Works</h2>
                <p className="text-sm text-slate-500">In-progress tasks assigned to you</p>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center min-h-[200px] text-sm text-gray-500">Loading...</div>
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
                    <div className="fixed inset-0 bg-black/40" onClick={() => { setIsDetailsOpen(false); setSelectedTask(null); }} />
                    <div className="relative z-10 w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-auto max-h-[85vh]">
                        <div className="flex items-center justify-between p-5 border-b">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900">{selectedTask.title}</h3>
                                <p className="text-xs text-slate-500 mt-1">Full task details</p>
                            </div>
                            <button onClick={() => { setIsDetailsOpen(false); setSelectedTask(null); }} className="text-slate-500 p-2 rounded-md hover:bg-slate-50">Close</button>
                        </div>
                        <div className="p-6 text-sm text-slate-700">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <div className="text-xs text-slate-500">Maker</div>
                                    <div className="font-medium text-slate-900">{selectedTask.makerId?.name || 'Unknown'}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-slate-500">Campaign</div>
                                    <div className="font-medium text-slate-900">{selectedTask.campaignId?.campaignName || 'No campaign'}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-slate-500">Status</div>
                                    <div className="font-medium text-slate-900">{selectedTask.status || '-'}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-slate-500">Priority</div>
                                    <div className="font-medium text-slate-900">{selectedTask.priority || '-'}</div>
                                </div>
                            </div>

                            {selectedTask.description ? (
                                <div className="mt-6">
                                    <div className="text-xs text-slate-500">Description</div>
                                    <div className="mt-2 text-sm text-slate-700 bg-slate-50 p-3 rounded-md">{selectedTask.description}</div>
                                </div>
                            ) : null}
                        </div>
                        <div className="flex items-center justify-end gap-2 p-4 border-t">
                            <button onClick={() => { setIsDetailsOpen(false); setSelectedTask(null); }} className="px-3 py-2 bg-white border rounded-md">Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Done task link modal */}
            {isLinkOpen && linkTask && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                        <div className="fixed inset-0 bg-black/40" onClick={() => { setIsLinkOpen(false); setLinkTask(null); }} />
                        <div role="dialog" aria-modal="true" aria-labelledby="done-link-title" className="relative z-10 w-full max-w-md mx-auto">
                            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100">
                                <header className="flex items-start justify-between p-5 border-b">
                                    <div>
                                        <h3 id="done-link-title" className="text-lg font-semibold text-slate-900">Submit completion link</h3>
                                        <p className="text-xs text-slate-500 mt-1">Provide a public link to verify the completed work (Figma, Drive, etc.).</p>
                                    </div>
                                    <button aria-label="Close" onClick={() => { setIsLinkOpen(false); setLinkTask(null); }} className="text-slate-500 p-2 rounded-md hover:bg-slate-50">✕</button>
                                </header>
                                <div className="p-6">
                                    <label className="text-xs text-slate-500">Link</label>
                                    <input
                                        value={linkValue}
                                        onChange={(e) => setLinkValue(e.target.value)}
                                        placeholder="https://"
                                        className="mt-2 w-full border border-slate-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                                    />
                                    <div className="text-xs text-slate-400 mt-2">You can paste a Figma file, Drive link, or any public URL for review.</div>
                                </div>
                                <footer className="flex items-center justify-end gap-2 p-4 border-t">
                                    <button onClick={() => { setIsLinkOpen(false); setLinkTask(null); }} className="px-3 py-2 text-sm rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-slate-50">Cancel</button>
                                    <button onClick={submitLink} className="px-3 py-2 text-sm rounded-md bg-[#F16C65] text-white hover:bg-[#e4564f]">Submit</button>
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