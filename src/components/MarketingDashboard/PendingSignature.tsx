import React from 'react';
import { Loader2, ExternalLink, Check, ArrowUpRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import useAxiosMarketing from '@/uri/useAxiosMarketing';
import { useUserData } from '../SalesDashboard/Sales_Hook/User_Data';

const PendingSignature = () => {
  const axiosMarketing = useAxiosMarketing();
  const { userData } = useUserData();

  const { data: deals = [], isLoading, refetch } = useQuery({
    queryKey: ['pendingSignature', userData?.email],
    queryFn: async () => {
      const res = await axiosMarketing.get(`/qualified-leads/${userData?._id}`);
      return res.data;
    },
    enabled: !!userData?._id, 
  });

  const handleSignDone = async (dealId : string) => {
    try {
      console.log(`Updating signature for deal: ${dealId}`);
      // await axiosMarketing.patch(`/update-signature/${dealId}`, { signature: true });
      refetch();
    } catch (error) {
      console.error("Error updating signature:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-[#6B8932] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-10 font-sans">
      
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
              <th className="pb-4 pl-6 text-sm font-medium text-slate-400 text-right">Status</th>
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
                    <span className="text-sm text-[#6B8932] font-medium mt-0.5">
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
                      className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-[#6B8932] transition-colors font-medium group/link"
                    >
                      View Document
                      <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover/link:text-[#6B8932]" />
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

                {/* Action - Sleek Buttons */}
                <td className="py-5 pl-6 align-top text-right">
                  {deal.signature ? (
                    <div className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500">
                      <Check className="w-4 h-4 text-[#6B8932]" />
                      Signed
                    </div>
                  ) : (
                    <button
                      onClick={() => handleSignDone(deal._id)}
                      className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-[#6B8932] bg-white border border-[#6B8932]/30 rounded-full hover:bg-[#6B8932] hover:text-white transition-all duration-200"
                    >
                      Sign Done
                    </button>
                  )}
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
  );
};

export default PendingSignature;