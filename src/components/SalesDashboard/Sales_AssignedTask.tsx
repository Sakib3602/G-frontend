import useAxiosSales from '@/uri/useAxiosSales';
import { useUserData } from './Sales_Hook/User_Data';
import { useQuery } from '@tanstack/react-query';

const Sales_AssignedTask = () => {
    const axiosSales = useAxiosSales()
    const {userData} = useUserData()
    const {data , isLoading} = useQuery({
        queryKey: ['assigned-tasks-sales', userData?._id],
        enabled: Boolean(userData?._id),
        queryFn: async()=>{
            const res = await axiosSales.get(`/api/v1/sales/tasks/${userData?._id}`)
            return res.data.tasks;
        }
    })

    const tasks = Array.isArray(data) ? data : [];

    const formatDate = (value: string) => {
        if (!value) {
            return 'N/A';
        }

        const parsedDate = new Date(value);

        if (Number.isNaN(parsedDate.getTime())) {
            return 'N/A';
        }

        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        }).format(parsedDate);
    };

    const getStatusStyles = (status?: string) => {
        switch (status?.toLowerCase()) {
            case 'completed':
                return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
            case 'in progress':
            case 'running':
                return 'bg-blue-50 text-blue-700 ring-blue-200';
            case 'pending':
                return 'bg-amber-50 text-amber-700 ring-amber-200';
            case 'overdue':
                return 'bg-red-50 text-red-700 ring-red-200';
            default:
                return 'bg-slate-100 text-slate-600 ring-slate-200';
        }
    };

    return (
        <div className="w-full">
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">Assigned Tasks</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Review the tasks assigned to your team and track progress in one place.
                    </p>
                </div>

                    <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm font-medium text-slate-600 shadow-sm ring-1 ring-slate-200">
                    <span className="h-2 w-2 rounded-full bg-[#99B562]" />
                    {tasks.length} task{tasks.length === 1 ? '' : 's'} loaded
                </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 bg-slate-50 px-5 py-3">
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                        Task Overview
                    </h2>
                </div>

                {isLoading ? (
                    <div className="p-5">
                        <div className="space-y-3 animate-pulse">
                            <div className="h-4 w-full rounded bg-slate-100" />
                            <div className="h-4 w-full rounded bg-slate-100" />
                            <div className="h-4 w-5/6 rounded bg-slate-100" />
                            <div className="h-4 w-full rounded bg-slate-100" />
                        </div>
                    </div>
                ) : tasks.length === 0 ? (
                    <div className="flex min-h-56 items-center justify-center px-5 py-10 text-center">
                        <div>
                            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#99B562]/10 text-[#99B562]">
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5h6m-7 4h8m-9 4h10m-11 4h12" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900">No assigned tasks yet</h3>
                            <p className="mt-2 text-sm text-slate-500">
                                Tasks assigned to this sales user will appear here once they are created in the system.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        Lead
                                    </th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        Lead Email
                                    </th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        Assigned Marketer
                                    </th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        Marketer Email
                                    </th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        Status
                                    </th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        Created At
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100 bg-white">
                                {tasks.map((task: any) => (
                                    <tr key={task?._id || `${task?.leadID?.email}-${task?.createdAt}`} className="transition-colors hover:bg-slate-50/70">
                                        <td className="px-5 py-3 align-top">
                                            <div className="font-semibold text-slate-900">
                                                {task?.leadID?.leadName || task?.leadName || 'Unknown lead'}
                                            </div>
                                            <div className="mt-1 text-xs text-slate-500">
                                                Task email: {task?.email || task?.leadID?.email || 'N/A'}
                                            </div>
                                        </td>

                                        <td className="px-5 py-3 align-top text-sm text-slate-600">
                                            {task?.leadID?.email || task?.email || 'N/A'}
                                        </td>

                                        <td className="px-5 py-3 align-top">
                                            <div className="font-medium text-slate-900">
                                                {task?.assignedToMarketer?.name || 'Unassigned'}
                                            </div>
                                            <div className="mt-1 text-xs text-slate-500">
                                                ID: {task?.assignedToMarketer?._id || 'N/A'}
                                            </div>
                                        </td>

                                        <td className="px-5 py-3 align-top text-sm text-slate-600">
                                            {task?.assignedToMarketer?.email || 'N/A'}
                                        </td>

                                        <td className="px-5 py-3 align-top">
                                            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${getStatusStyles(task?.taskStatus)}`}>
                                                {task?.taskStatus || 'unknown'}
                                            </span>
                                        </td>

                                        <td className="px-5 py-3 align-top text-sm text-slate-600">
                                            {formatDate(task?.createdAt)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Sales_AssignedTask;