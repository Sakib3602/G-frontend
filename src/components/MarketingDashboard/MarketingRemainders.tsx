import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import useAxiosMarketing from "@/uri/useAxiosMarketing";
import { useUserData } from "../SalesDashboard/Sales_Hook/User_Data";
import { 
  Loader2, 
  Send, 
  Trash2, 
  ArrowUpRight, 
  CheckCircle2 
} from "lucide-react";

type Reminder = {
  _id: string;
  dealFinalLink?: string;
  leadId?: {
    leadName?: string;
    email?: string;
    phone?: string;
  };
  createdBy?: {
    name?: string;
  };
};

const MarketingRemainders = () => {
  const [showNotification, setShowNotification] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [selectedReminderId, setSelectedReminderId] = useState<string | null>(null);
  const [selectedReminderEmail, setSelectedReminderEmail] = useState<string>("");
  const [selectedReminderName, setSelectedReminderName] = useState<string>("");
  const [signLink, setSignLink] = useState("");
  const [modalError, setModalError] = useState("");
  const axiosMarketing = useAxiosMarketing();
  const { userData } = useUserData();

  const { data: reminders = [], isLoading, refetch } = useQuery<Reminder[]>({
    queryKey: ['reminders-marketing', userData?.email],
    queryFn: async () => {
      const res = await axiosMarketing.get(`/remainder-to-sign/${userData?._id}`);
      return res.data;
    },
    enabled: !!userData?._id, 
  });

  const handleSendReminder = (id: string, email?: string, name?: string) => {
    if (!email) {
      setModalError("No email found for this lead.");
      return;
    }

    setSelectedReminderId(id);
    setSelectedReminderEmail(email);
    setSelectedReminderName(name ?? "");
    setSignLink("");
    setModalError("");
    setIsSendModalOpen(true);
  };

  const mutationSendReminder = useMutation({
    mutationFn: async ({ email, signLink, name }: { email: string; signLink: string; name?: string }) => {
        const res = await axiosMarketing.post(`/emailservice/send-proposal-email/${email}`, { signLink, name });
        return res.data;
    },
    onError: (error) => {
        console.error("Failed to send reminder:", error);
    }
  });

  const mutationForUpdateStatus = useMutation({
    mutationFn: async (id : string) => {
        const res = await axiosMarketing.put(`/updateTime-Marketing/${id}`);
        return res.data;
    },
    onSuccess: ()=>{
        refetch();
    }
  });

  const handleModalSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedLink = signLink.trim();

    if (!selectedReminderId || !selectedReminderEmail) {
      setModalError("Missing reminder details. Please try again.");
      return;
    }

    if (!trimmedLink) {
      setModalError("Please enter a document URL.");
      return;
    }

    try {
      await mutationSendReminder.mutateAsync({
        email: selectedReminderEmail,
        signLink: trimmedLink,
        name: selectedReminderName,
      });
      await mutationForUpdateStatus.mutateAsync(selectedReminderId);

      setIsSendModalOpen(false);
      setSelectedReminderId(null);
      setSelectedReminderEmail("");
      setSelectedReminderName("");
      setSignLink("");
      setModalError("");
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    } catch (error) {
      console.error("Failed to send reminder:", error);
      setModalError("Failed to send reminder. Please try again.");
    }
  };

  const handleDelete = async (id : string) => {
    try {
      console.log(`Deleting reminder: ${id}`);
      // API call to delete reminder
      // await axiosMarketing.delete(`/reminder/${id}`);
      // refetch();
    } catch (error) {
      console.error("Failed to delete reminder:", error);
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
    <div className="w-full relative">
      
      {/* Toast Notification */}
      {showNotification && (
  <div className="fixed bottom-8 right-8 bg-[#0F172A] border border-slate-800 text-white p-5 rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] flex items-start gap-4 animate-in fade-in slide-in-from-bottom-8 duration-300 z-50 min-w-[340px]">
    
    {/* Icon with soft background glow effect */}
    <div className="bg-[#6B8932]/20 p-2 rounded-full flex-shrink-0 mt-0.5">
      <CheckCircle2 className="w-6 h-6 text-[#6B8932]" />
    </div>
    
    {/* Text Content */}
    <div className="flex flex-col">
      <span className="text-base font-semibold tracking-wide text-slate-50">
        Reminder Sent
      </span>
      <span className="text-sm text-slate-400 mt-1 leading-relaxed">
        The follow-up email has been successfully delivered.
      </span>
    </div>

  </div>
)}

      {isSendModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
          <form
            onSubmit={handleModalSubmit}
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200"
          >
            <h2 className="text-lg font-semibold text-slate-900">Send Reminder</h2>
            <p className="mt-1 text-sm text-slate-500">
              Paste the signing URL. This value will be sent as signLink.
            </p>

            <div className="mt-4">
              <label htmlFor="signLink" className="mb-1 block text-sm font-medium text-slate-700">
                Signing URL
              </label>
              <input
                id="signLink"
                type="url"
                value={signLink}
                onChange={(e) => setSignLink(e.target.value)}
                placeholder="https://example.com/sign/123"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#6B8932]"
                required
              />
            </div>

            {modalError && (
              <p className="mt-3 text-sm text-red-600">{modalError}</p>
            )}

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsSendModalOpen(false);
                  setModalError("");
                  setSelectedReminderName("");
                  setSignLink("");
                }}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={mutationSendReminder.isPending || mutationForUpdateStatus.isPending}
                className="inline-flex items-center gap-2 rounded-lg bg-[#6B8932] px-4 py-2 text-sm font-medium text-white hover:bg-[#5d792b] disabled:opacity-60"
              >
                {(mutationSendReminder.isPending || mutationForUpdateStatus.isPending) && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Submit
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
         Reminders
        </h1>
        <p className="text-slate-500 mt-1.5 text-sm">
          Follow up with leads who haven't signed their documents yet.
        </p>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="py-4 pl-6 pr-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-1/3">Lead & Contact</th>
                <th className="py-4 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Document Link</th>
                <th className="py-4 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Created By</th>
                <th className="py-4 pr-6 pl-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-slate-100">
              {reminders.map((reminder) => (
                <tr 
                  key={reminder._id} 
                  className="group hover:bg-slate-50/30 transition-colors duration-200"
                >
                  
                  {/* Lead & Contact Details (Combined) */}
                  <td className="py-4 pl-6 pr-4 align-top">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900">
                        {reminder.leadId?.leadName || 'Unnamed Lead'}
                      </span>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-1">
                        <span className="text-[13px] text-slate-500">
                          {reminder.leadId?.email || 'No email'}
                        </span>
                        <span className="hidden sm:block text-slate-300">•</span>
                        <span className="text-[13px] text-slate-500">
                          {reminder.leadId?.phone || 'No phone'}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Deal Final Link */}
                  <td className="py-4 px-4 align-top">
                    {reminder.dealFinalLink ? (
                      <a 
                        href={reminder.dealFinalLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[13px] text-slate-600 hover:text-[#6B8932] transition-colors font-medium bg-slate-100 hover:bg-[#6B8932]/10 px-3 py-1.5 rounded-lg"
                      >
                        View Deal
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <span className="text-slate-400 text-sm italic">Not generated</span>
                    )}
                  </td>

                  {/* Created By */}
                  <td className="py-4 px-4 align-top">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#6B8932]/10 flex items-center justify-center text-[#6B8932] text-xs font-bold">
                        {reminder.createdBy?.name?.charAt(0) || '?'}
                      </div>
                      <span className="text-sm text-slate-700">
                        {reminder.createdBy?.name || 'Unknown'}
                      </span>
                    </div>
                  </td>

                  {/* Actions (Send & Delete) */}
                  <td className="py-4 pr-6 pl-4 align-top text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleSendReminder(reminder._id, reminder.leadId?.email, reminder.leadId?.leadName)}
                        disabled={!reminder.leadId?.email}
                        title={reminder.leadId?.email ? "Send Reminder" : "No email found"}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium text-[#6B8932] bg-white border border-[#6B8932]/30 rounded-lg hover:bg-[#6B8932] hover:text-white transition-all duration-200 shadow-sm"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Send
                      </button>
                      
                      <button
                        onClick={() => handleDelete(reminder._id)}
                        title="Delete Reminder"
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>

          {/* Empty State */}
          {reminders.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-base font-medium text-slate-900">No reminders needed</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-sm">
                All assigned leads have signed their documents or there are no pending deals in your queue.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarketingRemainders;