import useAxiosAdmin from "@/uri/useAxiosAdmin";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  AlertCircle,
  Users,
  ChevronDown
} from "lucide-react";

interface Employee {
  _id: string;
  NID: string | null;
  address: string | null;
  company: string;
  createdAt: string;
  department: string | null;
  email: string;
  hire_date: string | null;
  img: string | null;
  job_title: string | null;
  name: string;
  phone: string | null;
  role: string;
  updatedAt: string;
}

interface EmployeesResponse {
  success: boolean;
  data: Employee[];
}

const formatRoleLabel = (role: string): string =>
  role
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

const baseRoleOptions = ["marketing", "sales", "designer", "web", "admin", "user"];

const AdminEmployee = () => {
  const axiosAdmin = useAxiosAdmin();
  const queryClient = useQueryClient();

  const {
    data: employeesData,
    isLoading,
    isError,
  } = useQuery<EmployeesResponse>({
    queryKey: ["employees"],
    queryFn: async () => {
      const res = await axiosAdmin.get("/employees");
      return res.data;
    },
  });

  const employees = employeesData?.data ?? [];

  const roleOptions = useMemo<string[]>(() => {
    const roles = employees
      .map((emp) => emp.role?.trim().toLowerCase())
      .filter((role): role is string => Boolean(role));
    return Array.from(new Set([...baseRoleOptions, ...roles]));
  }, [employees]);

  const mutationRole = useMutation({
    mutationFn: async ({ id, newRole }: { id: string; newRole: string }) => {
      const normalizedRole = newRole.trim().toLowerCase();
      const res = await axiosAdmin.patch(`/role-change`, { id, role: normalizedRole });
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.setQueryData<EmployeesResponse | undefined>(
        ["employees"],
        (current) => {
          if (!current) return current;
          return {
            ...current,
            data: current.data.map((emp) =>
              emp._id === variables.id
                ? { ...emp, role: variables.newRole.trim().toLowerCase() }
                : emp,
            ),
          };
        },
      );
    },
  });

  const handleRoleChange = async (id: string, newRole: string) => {
    mutationRole.mutate({ id, newRole });
  };

  // --- Professional Skeleton Loading State ---
  if (isLoading) {
    return (
      <div className="flex flex-col rounded-md border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 p-6">
          <div className="h-6 w-48 animate-pulse bg-slate-200"></div>
          <div className="h-8 w-24 animate-pulse bg-slate-100"></div>
        </div>
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-slate-50">
              <tr>
                {[1, 2, 3, 4, 5].map((i) => (
                  <th key={i} className="px-6 py-4"><div className="h-4 w-20 animate-pulse bg-slate-200"></div></th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i}>
                  <td className="px-6 py-4 flex gap-4">
                    <div className="h-10 w-10 animate-pulse bg-slate-200 shrink-0"></div>
                    <div className="space-y-2 flex-1 mt-1">
                      <div className="h-4 w-32 animate-pulse bg-slate-200"></div>
                      <div className="h-3 w-40 animate-pulse bg-slate-100"></div>
                    </div>
                  </td>
                  <td className="px-6 py-4"><div className="h-4 w-24 animate-pulse bg-slate-100"></div></td>
                  <td className="px-6 py-4"><div className="h-4 w-28 animate-pulse bg-slate-100"></div></td>
                  <td className="px-6 py-4"><div className="h-4 w-36 animate-pulse bg-slate-100"></div></td>
                  <td className="px-6 py-4"><div className="h-9 w-32 animate-pulse bg-slate-100"></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // --- Error State ---
  if (isError) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-md border border-rose-200 bg-white p-8 text-center shadow-sm">
        <div className="mb-4 flex h-14 w-14 items-center justify-center bg-rose-50">
          <AlertCircle className="h-7 w-7 text-rose-500" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Failed to load directory</h3>
        <p className="mt-1 max-w-sm text-sm font-medium text-slate-500">There was a problem fetching the employee list. Please check your connection and try again.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col rounded-md border border-slate-200 bg-white shadow-sm overflow-hidden">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 bg-white p-5 gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Employee Management</h2>
          <p className="mt-1 text-sm font-medium text-slate-500">View and manage team member roles and permissions.</p>
        </div>
        <div className="flex items-center gap-2 border border-indigo-200 bg-indigo-50 px-4 py-2 rounded-sm">
          <Users className="h-4 w-4 text-indigo-700" />
          <span className="text-sm font-bold text-indigo-800">Total: {employees.length}</span>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full min-w-[1000px] text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">Employee</th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">Company</th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">Contact</th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">Address</th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">System Role</th>
            </tr>
          </thead>
          
          <tbody className="divide-y divide-slate-200">
            {employees.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-400">
                    <Users className="mb-2 h-8 w-8 opacity-20" />
                    <p className="text-sm font-medium">No employees found.</p>
                  </div>
                </td>
              </tr>
            ) : (
              employees.map((emp) => {
                const isUserRole = emp.role.trim().toLowerCase() === "user";

                return (
                  <tr
                    key={emp._id}
                    className={`group transition-colors ${
                      isUserRole ? "bg-rose-50/20 hover:bg-rose-50/50" : "hover:bg-slate-50"
                    }`}
                  >
                    {/* Employee Profile (Here we use border-l-4 for the red indicator instead of an extra <td>) */}
                    <td className={`px-6 py-4 whitespace-nowrap ${isUserRole ? 'border-l-4 border-rose-500' : 'border-l-4 border-transparent'}`}>
                      <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                          <img
                            src={emp?.img ? emp.img : `https://ui-avatars.com/api/?name=${emp.name}&background=F1F5F9&color=475569`}
                            alt={emp.name}
                            className={`w-10 h-10 object-cover border rounded-sm ${
                              isUserRole ? "border-rose-300" : "border-slate-200"
                            }`}
                          />
                        </div>
                        <div className="flex flex-col">
                          <p className={`text-sm font-bold ${isUserRole ? "text-rose-700" : "text-slate-800"}`}>
                            {emp.name}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1 text-xs font-medium text-slate-500">
                            <Mail className="w-3.5 h-3.5" />
                            <span>{emp.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Company */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                        <Building2 className="w-4 h-4 text-slate-400" />
                        <span>{emp.company || "—"}</span>
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                        <Phone className="w-4 h-4 text-slate-400" />
                        <span>{emp.phone || "—"}</span>
                      </div>
                    </td>

                    {/* Address */}
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-2 text-sm font-medium text-slate-700 max-w-[200px]">
                        <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <span className="truncate" title={emp.address || ""}>
                          {emp.address || "—"}
                        </span>
                      </div>
                    </td>

                    {/* Role Dropdown */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="relative flex items-center max-w-[150px]">
                        <select
                          value={emp.role.trim().toLowerCase()}
                          onChange={(e) => handleRoleChange(emp._id, e.target.value)}
                          disabled={mutationRole.isPending}
                          className={`w-full appearance-none text-xs font-bold tracking-wide rounded-sm pl-3 pr-8 py-2 outline-none transition-all cursor-pointer capitalize ${
                            isUserRole
                              ? "border border-rose-300 bg-rose-50 text-rose-700 focus:border-rose-500 hover:bg-rose-100"
                              : "border border-slate-300 bg-white text-slate-700 focus:border-indigo-500 hover:bg-slate-50"
                          } ${mutationRole.isPending ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          {roleOptions.map((role) => (
                            <option key={role} value={role} className="capitalize">
                              {formatRoleLabel(role)}
                            </option>
                          ))}
                        </select>
                        <div className={`absolute right-2.5 pointer-events-none ${isUserRole ? "text-rose-500" : "text-slate-500"}`}>
                          <ChevronDown className="w-4 h-4" />
                        </div>
                      </div>
                    </td>
                    
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminEmployee;