import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Save, X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosSales from "@/uri/useAxiosSales";
import Notification from "../ui/toast";

import { useUserData } from "./Sales_Hook/User_Data";
import Sales_import, { type LeadPayload } from "./Sales_import";

type LeadFormData = {
  leadName: string;
  owner: string;
  status: string;
  indications: string;
  companyName: string;
  leadScore: string;
  email: string;
  phone: string;
  title: string;
  specificRole: string;
  region: string;
  profileUrl: string;
  leadCreatedBy: string;
  ServiceNeed: string;
};

const Sales_Create_leads = () => {
  // get user data from custom hook
  const { userData } = useUserData();

  const [showNotification, setShowNotification] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Form state holding all fields from the image + additional necessary fields
  const [formData, setFormData] = useState<LeadFormData>({
    leadName: "",
    owner: userData?.name || "UnKnown User",
    status: "New Lead",
    indications: "",
    companyName: "",
    leadScore: "1",
    email: "",
    phone: "",
    title: "",
    specificRole: "",
    region: "BANGLADESH",
    profileUrl: "",
    leadCreatedBy: userData?._id || "",
    ServiceNeed: "Graphic",
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("New Lead Data:", formData);
    MutationCreateLead.mutate(formData);

    setFormData({
      leadName: "",
      owner: userData?.name || "UnKnown User",
      status: "New Lead",
      indications: "",
      companyName: "",
      leadScore: "1",
      email: "",
      phone: "",
      title: "",
      specificRole: "",
      region: "US",
      profileUrl: "",
      leadCreatedBy: userData?._id || "",
      ServiceNeed: "Graphic",
    });
  };

  const axiosSales = useAxiosSales();
  const queryClient = useQueryClient();

  const MutationImportLeads = useMutation<unknown, Error, LeadPayload[]>({
    mutationFn: async (newLeads: LeadPayload[]) => {
      const res = await axiosSales.post("api/v1/sales/create-lead", newLeads);
      return res.data;
    },
    onSuccess: () => {
      setShowNotification(true);
      queryClient.invalidateQueries({ queryKey: ["all-sales-leads"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard_data"] });
    },
  });

  const MutationCreateLead = useMutation<unknown, Error, LeadFormData>({
    mutationFn: async (newLeadData: LeadFormData) => {
      const res = await axiosSales.post(
        "api/v1/sales/create-lead",
        newLeadData,
      );
      return res.data;
    },
    onSuccess: () => {
      setShowNotification(true);
      queryClient.invalidateQueries({ queryKey: ["all-sales-leads"] });
    },
  });

  // Dropdown Options
  const statusOptions = [
    "New Lead",
    "Attempted to contact",
    "Contacted",
    "In Progress",
    
  ];

  const titleOptions = [
    "",
    "CEO / Founder",
    "VP (Vice President)",
    "Director",
    "Manager",
    "Team Lead",
    "Senior Contributor",
    "Team Member",
    "Consultant",
    "Intern",
  ];

  const regionOptions = ["Global", "BANGLADESH", "INDIA", "PAKISTAN", "SOUTH ASIA", "MIDDLE EAST", "AFRICA", "UK", "EUROPE", "US", "CANADA", "AUSTRALIA", "LATIN AMERICA"];
  const scoreOptions = ["1", "2", "3", "4", "5"];
  const serviceNeedOptions = ["Graphic", "Web", "Software", "Marketing", "SEO", "WEB & Graphic", "Other", "GRAPHIC & MARKETING",  "WEB & MARKETING",  "MARKETING & SOFTWARE", ,"App","WEB & SOFTWARE", "GRAPHIC & SOFTWARE", "WEB & GRAPHIC & SOFTWARE", "WEB & GRAPHIC & MARKETING", "WEB & GRAPHIC & MARKETING & SOFTWARE"];

  const CancelAll = () => {
    setFormData({
      leadName: "",
      owner: userData?.name || "UnKnown User",
      status: "New Lead",
      indications: "",
      companyName: "",
      leadScore: "1",
      email: "",
      phone: "",
      title: "",
      specificRole: "",
      region: "US",
      profileUrl: "",
      leadCreatedBy: userData?._id || "",
      ServiceNeed: "Graphic",
    });
  };

  return (
    <>
      <div className="fixed top-4 right-4 z-50">
        {showNotification && (
          <Notification
            type="success"
            title="Lead Created Successfully"
            message="The new lead has been pushed to the active pipeline."
            showIcon={true}
            duration={3000}
            onClose={() => {
              setShowNotification(false);
            }}
          />
        )}
      </div>

      <div className="w-full min-h-screen bg-[#f8fafc] px-6 py-10 lg:px-14 font-sans text-slate-900 antialiased flex justify-center">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="mb-8 border-b border-slate-200 pb-5">
            <p className="text-[10px] tracking-widest text-[#99B562] uppercase font-bold mb-1">
              Pipeline Operations
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Lead Registry Entry
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Input verified client coordinates to initialize a new tracking
              instance.
            </p>
          </div>
          <div className="w-full flex justify-center px-4 pb-8">
            <Sales_import
              onSave={async (leads) => {
                console.log("Submitting:", leads);
                await MutationImportLeads.mutateAsync(leads);
              }}
              isLoading={MutationImportLeads.isPending}
            />
          </div>

          {/* Form Card */}
          {/* Form Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <form onSubmit={handleSubmit} className="p-8">
              {/* --- Quick Add (সবসময় দেখাবে, দ্রুত এন্ট্রির জন্য) --- */}
              <div className="mb-2">
                <h3 className="text-[10px] font-bold text-[#99B562] uppercase tracking-widest border-b border-slate-100 pb-2 mb-4">
                  Quick Add — Fill the essential fields to create a new lead in the pipeline.
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                    Lead Name <span className="text-red-500"></span>
                  </label>
                  <input
                    type="text"
                    name="leadName"
                 
                    value={formData.leadName}
                    onChange={handleChange}
                    placeholder="e.g. Unknown User"
                    className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:border-[#99B562] focus:ring-1 focus:ring-[#99B562]/20 transition-all shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm text-slate-800 placeholder-slate-300 font-mono focus:outline-none focus:border-[#99B562] focus:ring-1 focus:ring-[#99B562]/20 transition-all shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="liam@enterprise.com"
                    className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm text-slate-800 placeholder-slate-300 font-mono focus:outline-none focus:border-[#99B562] focus:ring-1 focus:ring-[#99B562]/20 transition-all shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                    Target Service Need
                  </label>
                  <select
                    name="ServiceNeed"
                    value={formData.ServiceNeed}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm text-slate-800 focus:outline-none focus:border-[#99B562] focus:ring-1 focus:ring-[#99B562]/20 bg-white transition-all shadow-xs appearance-none cursor-pointer"
                  >
                    {serviceNeedOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                    Internal Lead Score
                  </label>
                  <select
                    name="leadScore"
                    value={formData.leadScore}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm text-slate-800 focus:outline-none focus:border-[#99B562] focus:ring-1 focus:ring-[#99B562]/20 bg-white transition-all shadow-xs appearance-none cursor-pointer font-mono"
                  >
                    {scoreOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        Level {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                    Pipeline Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm text-slate-800 focus:outline-none focus:border-[#99B562] focus:ring-1 focus:ring-[#99B562]/20 bg-white transition-all shadow-xs appearance-none cursor-pointer"
                  >
                    {statusOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* --- Advanced Toggle --- */}
              <button
                type="button"
                onClick={() => setShowAdvanced((prev) => !prev)}
                className="mt-6 text-xs font-bold text-[#6f8a3f] hover:text-[#4f6b2c] flex items-center gap-1.5"
              >
                {showAdvanced
                  ? "▲ Hide Extra Details"
                  : "▼ Add More Details (Company, Title, Region...)"}
              </button>

              {showAdvanced && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mt-5 pt-5 border-t border-slate-100">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                      Profile URI
                    </label>
                    <input
                      type="url"
                      name="profileUrl"
                      value={formData.profileUrl}
                      onChange={handleChange}
                      placeholder="https://linkedin.com/in/..."
                      className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm text-slate-800 placeholder-slate-300 font-mono focus:outline-none focus:border-[#99B562] focus:ring-1 focus:ring-[#99B562]/20 transition-all shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                      Company Name
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      placeholder="Enterprise Corp"
                      className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:border-[#99B562] focus:ring-1 focus:ring-[#99B562]/20 transition-all shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                      Territory / Region
                    </label>
                    <select
                      name="region"
                      value={formData.region}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm text-slate-800 focus:outline-none focus:border-[#99B562] focus:ring-1 focus:ring-[#99B562]/20 bg-white transition-all shadow-xs appearance-none cursor-pointer"
                    >
                      {regionOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                      Organizational Hierarchy
                    </label>
                    <select
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm text-slate-800 focus:outline-none focus:border-[#99B562] focus:ring-1 focus:ring-[#99B562]/20 bg-white transition-all shadow-xs appearance-none cursor-pointer"
                    >
                      {titleOptions.map((opt, idx) => (
                        <option key={idx} value={opt} disabled={opt === ""}>
                          {opt === "" ? "Assign Hierarchy Status..." : opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                      Specific Functional Role
                    </label>
                    <input
                      type="text"
                      name="specificRole"
                      value={formData.specificRole}
                      onChange={handleChange}
                      placeholder="e.g. Senior Director of IT"
                      className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:border-[#99B562] focus:ring-1 focus:ring-[#99B562]/20 transition-all shadow-xs"
                    />
                  </div>

                
                </div>
              )}

              {/* Form Actions */}
              <div className="mt-10 pt-5 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  onClick={CancelAll}
                  type="button"
                  className="px-4 py-2 flex items-center text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors bg-white rounded-md border border-transparent hover:border-slate-200"
                >
                  <X className="w-3.5 h-3.5 mr-1.5" />
                  Discard Entry
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 flex items-center text-xs font-bold text-white bg-[#99B562] rounded-md hover:bg-[#85a052] transition-colors shadow-xs"
                >
                  <Save className="w-3.5 h-3.5 mr-1.5" />
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sales_Create_leads;
