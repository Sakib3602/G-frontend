
import { ArrowUpRight, CheckCircle2, Clock3, LayoutGrid, Trash2 } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import useAxiosMarketing from '@/uri/useAxiosMarketing';
import { useState } from 'react';
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

const PendingSignature = () => {
    const [showNotification, setShowNotification] = useState(false);
  const axiosMarketing = useAxiosMarketing();
  const { userData } = useUserDataMarketing();

  const { data: deals = [], isLoading, refetch } = useQuery({
    queryKey: ['pendingSignature', userData?.email],
    queryFn: async () => {
      const res = await axiosMarketing.get(`/qualified-leads/${userData?._id}`);
      return res.data as Deal[];
    },
    enabled: !!userData?._id, 
  });

  const workPendingDeals = deals.filter((deal) => !deal.signature);
  const doneDeals = deals.filter((deal) => deal.signature);
  const totalDeals = deals.length;

  
  const handleSignDone = async (dealId: string): Promise<void> => {
    try {
     
      
      mutationForUpdateStatus.mutate(dealId);
     
    } catch (error) {
      console.error("Error updating signature:", error);
    }
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
      <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              <LayoutGrid className="h-3.5 w-3.5" />
              Work overview
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Work Board</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              Review work items, move them to done, and keep the board clear.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-500">
                Total work
                <LayoutGrid className="h-4 w-4 text-slate-400" />
              </div>
              <div className="mt-3 text-3xl font-semibold text-slate-900">{totalDeals}</div>
            </div>
            <div className="rounded-3xl border border-amber-200 bg-amber-50/70 p-5">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-amber-700">
                Work pending
                <Clock3 className="h-4 w-4 text-amber-600" />
              </div>
              <div className="mt-3 text-3xl font-semibold text-amber-700">{workPendingDeals.length}</div>
            </div>
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50/70 p-5">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-emerald-700">
                Done work
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="mt-3 text-3xl font-semibold text-emerald-700">{doneDeals.length}</div>
            </div>
          </div>

          <div className="mt-8 space-y-6">
            <div className="w-full animate-pulse rounded-3xl border border-slate-200 bg-white p-5">
              <div className="mb-5 h-5 w-44 rounded bg-slate-200" />
              <div className="space-y-3">
                {[1, 2, 3].map((index) => (
                  <div key={index} className="grid gap-3 rounded-2xl border border-slate-100 p-4 sm:grid-cols-5">
                    <div className="h-4 rounded bg-slate-200 sm:col-span-1" />
                    <div className="h-4 rounded bg-slate-200 sm:col-span-1" />
                    <div className="h-4 rounded bg-slate-200 sm:col-span-1" />
                    <div className="h-4 rounded bg-slate-200 sm:col-span-1" />
                    <div className="h-4 rounded bg-slate-200 sm:col-span-1" />
                  </div>
                ))}
              </div>
            </div>
          </div>
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
            title="Work Status Updated!"
            message="The work status has been updated successfully."
            showIcon={true}
            duration={3000}
            onClose={() => {
              setShowNotification(false);
            }}
          />
        )}
      </div>


       
      <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      {/* Your Content/Components */}
    <div className="mx-auto max-w-7xl rounded-[2rem] border border-slate-200 bg-white p-6 font-sans shadow-sm sm:p-8">
        
        {/* Header Section - Clean & Minimal */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            <LayoutGrid className="h-3.5 w-3.5" />
            Work overview
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Work Board</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            Review work items, move them to done, and keep the board clear.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-500">
              Total work
              <LayoutGrid className="h-4 w-4 text-slate-400" />
            </div>
            <div className="mt-3 text-3xl font-semibold text-slate-900">{totalDeals}</div>
          </div>
          <div className="rounded-3xl border border-amber-200 bg-amber-50/70 p-5">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-amber-700">
              Work pending
              <Clock3 className="h-4 w-4 text-amber-600" />
            </div>
            <div className="mt-3 text-3xl font-semibold text-amber-700">{workPendingDeals.length}</div>
          </div>
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50/70 p-5">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-emerald-700">
              Done work
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="mt-3 text-3xl font-semibold text-emerald-700">{doneDeals.length}</div>
          </div>
        </div>

        {/* Work Pending */}
        <div className="mt-8 w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Work Pending</h2>
                <p className="mt-1 text-sm text-slate-500">Items that still need to be marked as done.</p>
              </div>
              <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                {workPendingDeals.length} items
              </span>
            </div>
          </div>

          <div className="w-full overflow-x-auto px-5">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-4 pr-6 text-sm font-medium text-slate-400 w-1/4">Lead details</th>
                  <th className="py-4 px-6 text-sm font-medium text-slate-400">Contact</th>
                  <th className="py-4 px-6 text-sm font-medium text-slate-400">Deal Link</th>
                  <th className="py-4 px-6 text-sm font-medium text-slate-400">Creator</th>
                  <th className="py-4 pl-6 text-sm font-medium text-slate-400 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {workPendingDeals.map((deal) => (
                  <tr key={deal._id} className="group transition-colors hover:bg-slate-50/70">
                    <td className="py-4 pr-6 align-top">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-900 text-base">{deal.leadId?.leadName || 'Unnamed Lead'}</span>
                        <span className="text-sm text-[#C9A646] font-medium mt-0.5">{deal.leadId?.ServiceNeed || 'General Service'}</span>
                      </div>
                    </td>

                    <td className="py-4 px-6 align-top">
                      <div className="flex flex-col">
                        <span className="text-slate-700 text-sm">{deal.leadId?.email || 'No email provided'}</span>
                        <span className="text-slate-500 text-sm mt-0.5">{deal.leadId?.phone || 'No phone provided'}</span>
                      </div>
                    </td>

                    <td className="py-4 px-6 align-top">
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

                    <td className="py-4 px-6 align-top">
                      <span className="text-slate-700 text-sm">{deal.createdBy?.name || 'Unknown'}</span>
                    </td>

                    <td className="py-4 pl-6 align-top text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => handleSignDone(deal._id)}
                          className="inline-flex items-center justify-center rounded-full border border-[#C9A646]/30 bg-white px-4 py-2 text-sm font-medium text-[#C9A646] transition-all duration-200 hover:bg-[#C9A646] hover:text-white cursor-pointer"
                          type="button"
                        >
                          Done Work
                        </button>
                        
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {workPendingDeals.length === 0 && (
              <div className="py-16 text-center">
                <p className="text-sm text-slate-400">No work pending at the moment.</p>
              </div>
            )}
          </div>
        </div>

        {/* Done */}
        <div className="mt-6 w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Done</h2>
                <p className="mt-1 text-sm text-slate-500">Items that have already been completed.</p>
              </div>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                {doneDeals.length} items
              </span>
            </div>
          </div>

          <div className="w-full overflow-x-auto px-5">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-4 pr-6 text-sm font-medium text-slate-400 w-1/4">Lead details</th>
                  <th className="py-4 px-6 text-sm font-medium text-slate-400">Contact</th>
                  <th className="py-4 px-6 text-sm font-medium text-slate-400">Deal Link</th>
                  <th className="py-4 px-6 text-sm font-medium text-slate-400">Creator</th>
                  
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {doneDeals.map((deal) => (
                  <tr key={deal._id} className="group transition-colors hover:bg-slate-50/70">
                    <td className="py-4 pr-6 align-top">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-900 text-base">{deal.leadId?.leadName || 'Unnamed Lead'}</span>
                        <span className="text-sm text-[#C9A646] font-medium mt-0.5">{deal.leadId?.ServiceNeed || 'General Service'}</span>
                      </div>
                    </td>

                    <td className="py-4 px-6 align-top">
                      <div className="flex flex-col">
                        <span className="text-slate-700 text-sm">{deal.leadId?.email || 'No email provided'}</span>
                        <span className="text-slate-500 text-sm mt-0.5">{deal.leadId?.phone || 'No phone provided'}</span>
                      </div>
                    </td>

                    <td className="py-4 px-6 align-top">
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

                    <td className="py-4 px-6 align-top">
                      <span className="text-slate-700 text-sm">{deal.createdBy?.name || 'Unknown'}</span>
                    </td>

                    
                  </tr>
                ))}
              </tbody>
            </table>

            {doneDeals.length === 0 && (
              <div className="py-16 text-center">
                <p className="text-sm text-slate-400">No done work yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

</div>

   
   
     </>
  );
};

export default PendingSignature;