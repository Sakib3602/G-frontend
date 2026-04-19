import React from "react";
import { useForm } from "react-hook-form";
import { Calendar, User, AlignLeft, Briefcase } from "lucide-react";
import { useUserDataMarketing } from "./HOOK/User_Data_Marketer";
import useAxiosMarketing from "@/uri/useAxiosMarketing";
import { useQuery } from "@tanstack/react-query";

// TypeScript Interface
type TaskFormData = {
  title: string;
  description: string;
  campaignId: string;
  assignedTo: string[]; // একাধিক ইউজারের জন্য Array
  dueDate: string;
  dueTime: string;
  priority: "Low" | "Medium" | "High";
};

type TaskCampaignApi = {
  _id: string;
  campaignName: string;
 
};
type TeamMemberApi = {
  _id: string;
  name: string;
  role: string;
};

// Mock Data (ডেটাবেস থেকে এগুলো আসবে)
// const mockCampaigns = [
//   { id: "c1", name: "Black Friday Sale 2026" },
//   { id: "c2", name: "Q1 B2B Lead Gen" },
// ];

// const teamMembers = [
//   { id: "u1", name: "John Doe", role: "Graphic Designer" },
//   { id: "u2", name: "Jane Smith", role: "Content Writer" },
//   { id: "u3", name: "Mike Ross", role: "Media Buyer" },
//   { id: "u4", name: "Sarah Khan", role: "Marketing Strategist" },
//   { id: "u5", name: "Ariana Roy", role: "SEO Specialist" },
//   { id: "u6", name: "Imran Hossain", role: "Video Editor" },
//   { id: "u7", name: "Nusrat Jahan", role: "Social Media Manager" },
//   { id: "u8", name: "Omar Faruk", role: "Performance Analyst" },
//   { id: "u9", name: "Tanvir Ahmed", role: "Copywriter" },
//   { id: "u10", name: "Nabila Noor", role: "UI/UX Designer" },
// ];

const MarketingAddTask: React.FC = () => {

    const {userData} = useUserDataMarketing()
    const axiosMarketing = useAxiosMarketing();


    const { data: mockCampaigns = [], isLoading: isCampaignsLoading } = useQuery<TaskCampaignApi[]>({
        queryKey : ["marketing-campaigns-task"],
      enabled: Boolean(userData?._id),
        queryFn : async () => {
            const res = await axiosMarketing.get(`/tasks/all-campaigns/${userData?._id}`);
        const payload = (res.data?.data ?? res.data) as TaskCampaignApi[];
        return Array.isArray(payload) ? payload : [];
        }
    })
    const { data: teamMembersApi = [], isLoading: isTeamMembersLoading } = useQuery<TeamMemberApi[]>({
        queryKey : ["marketing-campaigns-all-employee"],
      enabled: Boolean(userData?._id),
        queryFn : async () => {
        const res = await axiosMarketing.get(`/tasks/all-team-members/${userData?._id}`);
        const payload = (res.data?.data ?? res.data) as TeamMemberApi[];
        return Array.isArray(payload) ? payload : [];
        }
    })

  const campaignOptions = mockCampaigns.map((camp) => ({ id: camp._id, name: camp.campaignName }));

  const teamMembers = teamMembersApi.map((member) => ({ id: member._id, name: member.name, role: member.role }));









  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TaskFormData>({
    defaultValues: {
      assignedTo: [], // ডিফল্ট খালি অ্যারে
      priority: "Medium",
      dueTime: "",
    },
  });

  const onSubmit = (data: TaskFormData) => {
    console.log("Task Submitted:", data);
    alert("Task Created Successfully!");
    reset(); // ফর্ম সাবমিট হওয়ার পর খালি করে দেবে
  };

  return (
    <div className="mx-auto mt-8 max-w-4xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_20px_60px_-20px_rgba(15,23,42,0.18)]">
      <div className="bg-[linear-gradient(135deg,_rgba(201,166,70,0.16),_rgba(248,250,252,1)_60%)] px-6 py-6 sm:px-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#C9A646]/20 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9A7A22] shadow-sm">
          <span className="h-2 w-2 rounded-full bg-[#C9A646]" />
          Marketing task studio
        </div>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Create a new task</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Assign work, define timing, and keep the task details clear for the team.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 px-6 py-6 sm:px-8">
        <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Task title *</label>
              <input
                type="text"
                placeholder="e.g., Design 3 ad banners for Facebook"
                className={`w-full rounded-2xl border bg-slate-50 px-4 py-3 text-sm outline-none transition focus:bg-white focus:ring-2 focus:ring-[#C9A646]/20 ${
                  errors.title ? "border-rose-500" : "border-slate-200 focus:border-[#C9A646]"
                }`}
                {...register("title", { required: "Task title is required" })}
              />
              {errors.title && <p className="mt-1.5 text-xs text-rose-500">{errors.title.message}</p>}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Priority</label>
                <select
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#C9A646] focus:bg-white focus:ring-2 focus:ring-[#C9A646]/20"
                  {...register("priority")}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                  <Calendar className="h-4 w-4 text-[#C9A646]" /> Due date *
                </label>
                <input
                  type="date"
                  className={`w-full rounded-2xl border bg-slate-50 px-4 py-3 text-sm outline-none transition focus:bg-white focus:ring-2 focus:ring-[#C9A646]/20 ${
                    errors.dueDate ? "border-rose-500" : "border-slate-200 focus:border-[#C9A646]"
                  }`}
                  {...register("dueDate", { required: "Due date is required" })}
                />
                {errors.dueDate && <p className="mt-1.5 text-xs text-rose-500">{errors.dueDate.message}</p>}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Due time</label>
                <input
                  type="time"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#C9A646] focus:bg-white focus:ring-2 focus:ring-[#C9A646]/20"
                  {...register("dueTime")}
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                <Briefcase className="h-4 w-4 text-[#C9A646]" /> Related campaign
              </label>
              <select
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#C9A646] focus:bg-white focus:ring-2 focus:ring-[#C9A646]/20"
                {...register("campaignId")}
              >
                <option value="">No specific campaign (General task)</option>
                {isCampaignsLoading && <option value="" disabled>Loading campaigns...</option>}
                {campaignOptions.map((camp) => (
                  <option key={camp.id} value={camp.id}>
                    {camp.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#C9A646]/15 text-[#9A7A22]">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Assignment</h3>
                <p className="text-xs text-slate-500">Choose one or more team members</p>
              </div>
            </div>

            <div className="max-h-[300px] space-y-2.5 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
              {isTeamMembersLoading && <p className="px-1 text-xs text-slate-500">Loading team members...</p>}
              {teamMembers.map((member) => (
                <label
                  key={member.id}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3.5 py-3 transition hover:border-[#C9A646]/40 hover:shadow-sm has-[:checked]:border-[#C9A646] has-[:checked]:bg-[#C9A646]/5"
                >
                  <input
                    type="checkbox"
                    value={member.id}
                    className="h-4 w-4 rounded border-slate-300 text-[#C9A646] focus:ring-[#C9A646]"
                    {...register("assignedTo", { required: "Please assign at least one team member" })}
                  />
                  <div className="flex min-w-0 flex-col">
                    <span className="text-sm font-medium text-slate-800">{member.name}</span>
                    <span className="truncate text-xs text-slate-500">{member.role}</span>
                  </div>
                </label>
              ))}
            </div>
            {errors.assignedTo && <p className="mt-1.5 text-xs text-rose-500">{errors.assignedTo.message}</p>}
          </div>
        </div>

        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-slate-700">
            <AlignLeft className="h-4 w-4 text-[#C9A646]" /> Description
          </label>
          <textarea
            rows={4}
            placeholder="Write detailed instructions for the task..."
            className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#C9A646] focus:bg-white focus:ring-2 focus:ring-[#C9A646]/20"
            {...register("description")}
          ></textarea>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-full bg-[#C9A646] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(201,166,70,0.24)] transition hover:bg-[#b89434] focus:outline-none focus:ring-2 focus:ring-[#C9A646]/30"
          >
            Create Task
          </button>
        </div>

      </form>
    </div>
  );
};

export default MarketingAddTask;