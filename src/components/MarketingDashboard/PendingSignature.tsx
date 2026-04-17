
import {   Check, ArrowUpRight, Trash2 } from 'lucide-react';
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
</div>

   
   
     </>
  );
};

export default PendingSignature;