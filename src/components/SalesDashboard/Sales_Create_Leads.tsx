import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Save, X } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import useAxiosSales from '@/uri/useAxiosSales';
import Notification from '../ui/toast';

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
};

const Sales_Create_leads = () => {
  const [showNotification, setShowNotification] = useState(false);
  // Form state holding all fields from the image + additional necessary fields
  const [formData, setFormData] = useState<LeadFormData>({
    leadName: '',
    owner: 'Sakib Sarkar', 
    status: 'New Lead',
    indications: '',
    companyName: '',
    leadScore: '1',
    email: '',
    phone: '', 
    title: '',
    specificRole: '',
    region: 'US',
    profileUrl: '', 
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('New Lead Data:', formData);
    MutationCreateLead.mutate(formData);
   
   
  };

  const axiosSales = useAxiosSales()
  const queryClient = useQueryClient();

  const MutationCreateLead = useMutation<unknown, Error, LeadFormData>({
    mutationFn: async (newLeadData: LeadFormData) => {
      const res = await axiosSales.post('api/v1/sales/create-lead', newLeadData);
      return res.data;
    },
    onSuccess: ()=>{
      setShowNotification(true);
      queryClient.invalidateQueries({ queryKey: ['all-sales-leads'] });
    }
  })

  // Dropdown Options
  const statusOptions = [
    'New Lead', 
    'Attempted to contact', 
    'Contacted', 
    'In Progress', 
    'Qualified', 
    'Unqualified'
  ];

  const titleOptions = [
    '', 
    'CEO / Founder',
    'VP (Vice President)',
    'Director',
    'Manager',
    'Team Lead',
    'Senior Contributor',
    'Team Member',
    'Consultant',
    'Intern'
  ];

  const regionOptions = ['US', 'ANZ', 'EMEA', 'APAC', 'LATAM', 'Global'];
  const scoreOptions = ['1', '2', '3', '4', '5'];

  return (
    <>
    <div className="fixed top-4 right-4 z-50">
      
          {showNotification && (
            <Notification
              type="success"
              title="Lead Created Successfully!"
              message="The new lead has been added to your pipeline."
              showIcon={true}
              duration={3000}
              onClose={() => {
                setShowNotification(false);
              }}
            />
          )}
        
      </div>
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create New Lead</h1>
        <p className="text-gray-500 text-sm mt-1">Fill in the information below to add a new lead to your pipeline.</p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 md:p-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* --- Personal Information --- */}
            <div className="md:col-span-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Personal Information</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lead Name *</label>
              <input
                type="text"
                name="leadName"
                required
                value={formData.leadName}
                onChange={handleChange}
                placeholder="e.g. Liam Smith"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7FA23B]/50 focus:border-[#7FA23B] outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="liam@email.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7FA23B]/50 focus:border-[#7FA23B] outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 000-0000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7FA23B]/50 focus:border-[#7FA23B] outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Any Profile</label>
              <input
                type="url"
                name="profileUrl"
                value={formData.profileUrl}
                onChange={handleChange}
                placeholder="https://XXXX.com/in/username"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7FA23B]/50 focus:border-[#7FA23B] outline-none transition-colors"
              />
            </div>

            {/* --- Company & Role Information --- */}
            <div className="md:col-span-2 mt-4 mb-2">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Company & Role</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
              <input
                type="text"
                name="companyName"
                required
                value={formData.companyName}
                onChange={handleChange}
                placeholder="e.g. Moon, Nita Tech"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7FA23B]/50 focus:border-[#7FA23B] outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
              <select
                name="region"
                value={formData.region}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7FA23B]/50 focus:border-[#7FA23B] outline-none bg-white transition-colors"
              >
                {regionOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title (Hierarchy) *</label>
              <select
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7FA23B]/50 focus:border-[#7FA23B] outline-none bg-white transition-colors"
              >
                {titleOptions.map((opt, idx) => (
                  <option key={idx} value={opt} disabled={opt === ''}>
                    {opt === '' ? 'Select a Title' : opt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Specific Role</label>
              <input
                type="text"
                name="specificRole"
                value={formData.specificRole}
                onChange={handleChange}
                placeholder="e.g. Senior Design Manager"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7FA23B]/50 focus:border-[#7FA23B] outline-none transition-colors"
              />
            </div>

            {/* --- Lead Status & Tracking --- */}
            <div className="md:col-span-2 mt-4 mb-2">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Lead Tracking</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7FA23B]/50 focus:border-[#7FA23B] outline-none bg-white transition-colors"
              >
                {statusOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lead Score (1-5)</label>
              <select
                name="leadScore"
                value={formData.leadScore}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7FA23B]/50 focus:border-[#7FA23B] outline-none bg-white transition-colors"
              >
                {scoreOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Indications</label>
              <input
                type="text"
                name="indications"
                value={formData.indications}
                onChange={handleChange}
                placeholder="e.g. Existing Account"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7FA23B]/50 focus:border-[#7FA23B] outline-none transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lead Owner</label>
              <input
                type="text"
                name="owner"
                value={formData.owner}
                disabled
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-end space-x-4">
            <button
              type="button"
              className="px-6 py-2.5 flex items-center text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 flex items-center text-white bg-[#7FA23B] rounded-lg hover:bg-[#6A8831] focus:ring-4 focus:ring-[#7FA23B]/30 transition-all font-medium"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Lead
            </button>
          </div>

        </form>
      </div>
    </div>
    </>
  );
};

export default Sales_Create_leads;