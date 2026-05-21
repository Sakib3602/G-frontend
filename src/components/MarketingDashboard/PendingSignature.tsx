
import { Check, ArrowUpRight, Trash2, X } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import useAxiosMarketing from '@/uri/useAxiosMarketing';
import { useState, type FormEvent } from 'react';
import Notification from '../ui/toast';
import { useUserDataMarketing } from './HOOK/User_Data_Marketer';

// Type definitions for Deal
interface LeadDetails {
  _id?: string;
  leadName: string;
  ServiceNeed: string;
  email: string;
  phone: string;
}

interface Creator {
  _id?: string;
  name: string;
}

interface Deal {
  _id: string;
  leadId: LeadDetails;
  dealFinalLink?: string;
  createdBy: Creator;
  signature: boolean;
}

type TeamMemberApi = {
  _id: string;
  name: string;
  role: string;
};

type TaskPriority = 'Low' | 'Medium' | 'High';

type TaskFormState = {
  title: string;
  description: string;
  dueDate: string;
  dueTime: string;
  priority: TaskPriority;
  assignedTo: string;
};

const PendingSignature = () => {
    const [showNotification, setShowNotification] = useState(false);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
    const [selectedEmployeeName, setSelectedEmployeeName] = useState('');
    const [taskForm, setTaskForm] = useState<TaskFormState>({
      title: '',
      description: '',
      dueDate: '',
      dueTime: '',
      priority: 'Medium',
      assignedTo: '',
    });
  const axiosMarketing = useAxiosMarketing();
  const { userData } = useUserDataMarketing();

  const { data: teamMembers = [] } = useQuery<TeamMemberApi[]>({
    queryKey: ['marketing-task-team-members', userData?._id],
    enabled: Boolean(userData?._id),
    queryFn: async () => {
      const res = await axiosMarketing.get(`/tasks/all-team-members/${userData?._id}`);
      const payload = (res.data?.data ?? res.data) as TeamMemberApi[];
      return Array.isArray(payload) ? payload : [];
    },
  });

  const { data: deals = [], isLoading, refetch } = useQuery({
    queryKey: ['pendingSignature', userData?.email],
    queryFn: async () => {
      const res = await axiosMarketing.get(`/qualified-leads/${userData?._id}`);
      return res.data as Deal[];
    },
    enabled: !!userData?._id, 
  });

  
  const handleSignDone = async (dealId: string): Promise<void> => {
    try {
     
      
      mutationForUpdateStatus.mutate(dealId);
     
    } catch (error) {
      console.error("Error updating signature:", error);
    }
  };

  const handleDelete = (dealId: string): void => {
   
    console.log('🗑️ Delete clicked with ID:', dealId);
    // Add delete logic here
  };

  const openTaskModal = (deal: Deal): void => {
    setSelectedDeal(deal);
    setSelectedEmployeeName('');
    setTaskForm({
      title: `Follow up with ${deal.leadId?.leadName || 'deal'}`,
      description: '',
      dueDate: '',
      dueTime: '',
      priority: 'Medium',
      assignedTo: '',
    });
    setShowTaskModal(true);
  };

  const closeTaskModal = (): void => {
    setShowTaskModal(false);
    setSelectedDeal(null);
    setSelectedEmployeeName('');
  };

  const updateTaskField = <K extends keyof TaskFormState>(field: K, value: TaskFormState[K]) => {
    setTaskForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const selectEmployee = (member: TeamMemberApi) => {
    setSelectedEmployeeName(member.name);
    updateTaskField('assignedTo', member._id);
  };

  const handleTaskSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    const payload = {
      ...taskForm,
      createdBy: userData?._id,
      dealId: selectedDeal?._id,
      leadName: selectedDeal?.leadId?.leadName,
      leadEmail: selectedDeal?.leadId?.email,
      employeeName: selectedEmployeeName,
    };

    console.log('Pending signature task submit:', payload);
    closeTaskModal();
  };

  const mutationForUpdateStatus = useMutation({
    mutationFn: async (dealId: string): Promise<any> => {
       const res = await axiosMarketing.put(`/update-signature/${dealId}`);
       return res.data;
    },
    onSuccess: () => {
        setShowNotification(true);
        refetch();
    }
  })

  if (isLoading) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 py-10 font-sans">
  {/* Header Section - Kept static as it usually renders immediately */}
  <div className="mb-10">
    <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
      Pending Signatures
    </h1>
    <p className="text-slate-500 mt-2 text-sm max-w-2xl">
      Review and finalize deals. Once signed, mark them as complete to update the pipeline.
    </p>
  </div>

  {/* Skeleton Table Container */}
  <div className="w-full">
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="border-b border-slate-200">
          <th className="pb-4 pr-6 text-sm font-medium text-slate-400 w-1/4">Lead details</th>
          <th className="pb-4 px-6 text-sm font-medium text-slate-400">Contact</th>
          <th className="pb-4 px-6 text-sm font-medium text-slate-400">Deal Link</th>
          <th className="pb-4 px-6 text-sm font-medium text-slate-400">Creator</th>
          <th className="pb-4 pl-6 text-sm font-medium text-slate-400 text-right">Status</th>
        </tr>
      </thead>
      
      <tbody className="divide-y divide-slate-100">
        {/* Map through an array of 5 items to generate skeleton rows */}
        {[1, 2, 3, 4, 5].map((index) => (
          <tr key={index} className="animate-pulse">
            
            {/* Lead Name & Service Skeleton */}
            <td className="py-5 pr-6 align-top">
              <div className="flex flex-col gap-2.5 mt-1">
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-3 bg-slate-200 rounded w-1/2"></div>
              </div>
            </td>

            {/* Contact Skeleton */}
            <td className="py-5 px-6 align-top">
              <div className="flex flex-col gap-2.5 mt-1">
                <div className="h-3.5 bg-slate-200 rounded w-full max-w-[160px]"></div>
                <div className="h-3.5 bg-slate-200 rounded w-3/4 max-w-[120px]"></div>
              </div>
            </td>

            {/* Deal Link Skeleton */}
            <td className="py-5 px-6 align-top">
              <div className="h-4 bg-slate-200 rounded w-28 mt-1"></div>
            </td>

            {/* Created By Skeleton */}
            <td className="py-5 px-6 align-top">
              <div className="h-4 bg-slate-200 rounded w-24 mt-1"></div>
            </td>

            {/* Status Skeleton */}
            <td className="py-5 px-6 align-top text-center">
              <div className="inline-block h-6 w-16 bg-slate-200 rounded"></div>
            </td>

            {/* Action - Buttons Skeleton */}
            <td className="py-5 pl-6 align-top text-right">
              <div className="inline-flex gap-2">
                <div className="h-9 w-24 bg-slate-200 rounded-full"></div>
                <div className="h-9 w-9 bg-slate-200 rounded"></div>
              </div>
            </td>

          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>
    );
  }

  return (
    <>
    <div className="fixed top-4 right-4 z-50">
        {showNotification && (
          <Notification
            type="success"
            title="Signature Updated!"
            message="The signature has been updated successfully."
            showIcon={true}
            duration={3000}
            onClose={() => {
              setShowNotification(false);
            }}
          />
        )}
      </div>


       
      <div className="min-h-screen w-full relative">
      {/* Dashed Center Fade Grid */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, #e7e5e4 1px, transparent 1px),
            linear-gradient(to bottom, #e7e5e4 1px, transparent 1px)
          `,
          backgroundSize: "20px 20px",
          backgroundPosition: "0 0, 0 0",
          maskImage: `
          repeating-linear-gradient(
                  to right,
                  black 0px,
                  black 3px,
                  transparent 3px,
                  transparent 8px
                ),
                repeating-linear-gradient(
                  to bottom,
                  black 0px,
                  black 3px,
                  transparent 3px,
                  transparent 8px
                ),
              radial-gradient(ellipse 60% 60% at 50% 50%, #000 30%, transparent 70%)
          `,
          WebkitMaskImage: `
    repeating-linear-gradient(
                  to right,
                  black 0px,
                  black 3px,
                  transparent 3px,
                  transparent 8px
                ),
                repeating-linear-gradient(
                  to bottom,
                  black 0px,
                  black 3px,
                  transparent 3px,
                  transparent 8px
                ),
              radial-gradient(ellipse 60% 60% at 50% 50%, #000 30%, transparent 70%)
          `,
          maskComposite: "intersect",
          WebkitMaskComposite: "source-in",
        }}
      />
    {/* Your Content/Components */}
    <div className="max-w-350 mx-auto px-6 py-10 font-sans relative z-10">
        
        {/* Header Section - Clean & Minimal */}
        <div className="mb-10">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            Pending Signatures
          </h1>
          <p className="text-slate-500 mt-2 text-sm max-w-2xl">
            Review and finalize deals. Once signed, mark them as complete to update the pipeline.
          </p>
        </div>

        {/* Table Container - No heavy outer borders */}
        <div className="w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="pb-4 pr-6 text-sm font-medium text-slate-400 w-1/4">Lead details</th>
                <th className="pb-4 px-6 text-sm font-medium text-slate-400">Contact</th>
                <th className="pb-4 px-6 text-sm font-medium text-slate-400">Deal Link</th>
                <th className="pb-4 px-6 text-sm font-medium text-slate-400">Creator</th>
                <th className="pb-4 px-6 text-sm font-medium text-slate-400 text-center">Status</th>
                <th className="pb-4 pl-6 text-sm font-medium text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-slate-100">
              {deals.map((deal ) => (
                <tr 
                  key={deal._id} 
                  className="group transition-colors hover:bg-slate-50/60"
                >
                  
                  {/* Lead Name & Service */}
                  <td className="py-5 pr-6 align-top">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900 text-base">
                        {deal.leadId?.leadName || 'Unnamed Lead'}
                      </span>
                      <span className="text-sm text-[#C9A646] font-medium mt-0.5">
                        {deal.leadId?.ServiceNeed || 'General Service'}
                      </span>
                    </div>
                  </td>

                  {/* Contact - Clean Typography instead of icons */}
                  <td className="py-5 px-6 align-top">
                    <div className="flex flex-col">
                      <span className="text-slate-700 text-sm">
                        {deal.leadId?.email || 'No email provided'}
                      </span>
                      <span className="text-slate-500 text-sm mt-0.5">
                        {deal.leadId?.phone || 'No phone provided'}
                      </span>
                    </div>
                  </td>

                  {/* Deal Final Link */}
                  <td className="py-5 px-6 align-top">
                    {deal.dealFinalLink ? (
                      <a 
                        href={deal.dealFinalLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-[#C9A646] transition-colors font-medium group/link"
                      >
                        View Document
                        <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover/link:text-[#C9A646]" />
                      </a>
                    ) : (
                      <span className="text-slate-400 text-sm italic">-</span>
                    )}
                  </td>

                  {/* Created By */}
                  <td className="py-5 px-6 align-top">
                    <span className="text-slate-700 text-sm">
                      {deal.createdBy?.name || 'Unknown'}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-5 px-6 align-top text-center">
                    {deal.signature ? (
                      <div className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500">
                        <Check className="w-4 h-4 text-[#C9A646]" />
                        Signed
                      </div>
                    ) : (
                      <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">Pending</span>
                    )}
                  </td>

                  {/* Actions - Sign & Delete Buttons */}
                  <td className="py-5 pl-6 align-top text-right">
                    <div className="inline-flex items-center gap-2">
                      {deal.signature && (
                        <button
                          onClick={() => openTaskModal(deal)}
                          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-full hover:bg-slate-50 hover:border-[#C9A646]/40 transition-all duration-200 cursor-pointer"
                          type="button"
                        >
                          Add Task
                        </button>
                      )}

                      {!deal.signature && (
                        <button
                          onClick={() => handleSignDone(deal._id)}
                        className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-[#C9A646] bg-white border border-[#C9A646]/30 rounded-full hover:bg-[#C9A646] hover:text-white transition-all duration-200 cursor-pointer"
                        type="button"
                        >
                          Sign Done
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(deal._id)}
                        className="inline-flex items-center justify-center p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-all duration-200 cursor-pointer"
                        title="Delete"
                        type="button"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>

          {/* Minimal Empty State */}
          {deals.length === 0 && !isLoading && (
            <div className="py-16 text-center">
              <p className="text-slate-400 text-sm">No pending signatures at the moment.</p>
            </div>
          )}
        </div>
      </div>
      {showTaskModal && selectedDeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl ring-1 ring-black/5">
            <div className="flex items-start justify-between border-b border-slate-100 px-5 py-3.5">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Create task for signed deal</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Add task details for {selectedDeal.leadId?.leadName || 'this deal'}.
                </p>
              </div>
              <button
                type="button"
                onClick={closeTaskModal}
                className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleTaskSubmit} className="space-y-3.5 px-5 py-4.5">
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Title</label>
                  <input
                    type="text"
                    value={taskForm.title}
                    onChange={(event) => updateTaskField('title', event.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-[#C9A646] focus:ring-2 focus:ring-[#C9A646]/20"
                    placeholder="Enter task title"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Due Date</label>
                  <input
                    type="date"
                    value={taskForm.dueDate}
                    onChange={(event) => updateTaskField('dueDate', event.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-[#C9A646] focus:ring-2 focus:ring-[#C9A646]/20"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Due Time</label>
                  <input
                    type="time"
                    value={taskForm.dueTime}
                    onChange={(event) => updateTaskField('dueTime', event.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-[#C9A646] focus:ring-2 focus:ring-[#C9A646]/20"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Description</label>
                <textarea
                  value={taskForm.description}
                  onChange={(event) => updateTaskField('description', event.target.value)}
                  className="min-h-24 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-[#C9A646] focus:ring-2 focus:ring-[#C9A646]/20"
                  placeholder="Write task details here"
                  required
                />
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Priority</label>
                  <select
                    value={taskForm.priority}
                    onChange={(event) => updateTaskField('priority', event.target.value as TaskPriority)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-[#C9A646] focus:ring-2 focus:ring-[#C9A646]/20"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label className="block text-sm font-medium text-slate-700">Employees</label>
                  <span className="text-xs text-slate-500">Click a name to assign their ID</span>
                </div>
                <div className="grid max-h-44 grid-cols-1 gap-2 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-2.5 sm:grid-cols-2">
                  {teamMembers.map((member) => (
                    <button
                      key={member._id}
                      type="button"
                      onClick={() => selectEmployee(member)}
                      className={`flex items-start justify-between rounded-xl border px-3 py-2.5 text-left transition ${
                        taskForm.assignedTo === member._id
                          ? 'border-[#C9A646] bg-[#C9A646]/10'
                          : 'border-slate-200 bg-white hover:border-[#C9A646]/40 hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{member.name}</p>
                        <p className="mt-0.5 text-xs text-slate-500">{member.role}</p>
                      </div>
                      <span className="ml-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        {taskForm.assignedTo === member._id ? 'Selected' : 'Select'}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="mt-2 text-xs text-slate-500">
                  Selected employee ID: <span className="font-medium text-slate-700">{taskForm.assignedTo || 'None'}</span>
                  {selectedEmployeeName ? <span className="ml-2">({selectedEmployeeName})</span> : null}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={closeTaskModal}
                  className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-[#C9A646] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#b89434]"
                >
                  Submit Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

</div>

   
   
     </>
  );
};

export default PendingSignature;