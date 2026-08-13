import useAxiosAdmin from "@/uri/useAxiosAdmin";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  AlertCircle,
  Loader2
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

const baseRoleOptions = ["marketing", "sales", "designer", "web"];

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

  // Professional Loading State
  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
          <h2 className="text-xl font-bold text-gray-800">Loading Employees...</h2>
        </div>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-gray-50 rounded-xl w-full"></div>
          ))}
        </div>
      </div>
    );
  }

  // Professional Error State
  if (isError) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-red-100 flex flex-col items-center justify-center text-center">
        <div className="bg-red-50 p-3 rounded-full mb-4">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Failed to load data</h3>
        <p className="text-gray-500 mt-1">There was a problem fetching the employee list. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header Section */}
      <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Employee Management</h2>
          <p className="text-sm text-gray-500 mt-1">Manage your team members and their roles</p>
        </div>
        <div className="bg-blue-50 text-blue-700 text-sm font-semibold px-3 py-1.5 rounded-lg">
          Total: {employees.length}
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/80 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
              <th className="px-6 py-4 font-semibold">Employee</th>
              <th className="px-6 py-4 font-semibold">Company</th>
              <th className="px-6 py-4 font-semibold">Contact</th>
              <th className="px-6 py-4 font-semibold">Address</th>
              <th className="px-6 py-4 font-semibold">Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {employees.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  No employees found.
                </td>
              </tr>
            ) : (
              employees.map((emp) => {
                const isUserRole = emp.role.trim().toLowerCase() === "user";

                return (
                  <tr
                    key={emp._id}
                    className={`group transition-all hover:bg-gray-50 ${
                      isUserRole ? "bg-red-50/30 hover:bg-red-50/60" : ""
                    }`}
                  >
                    {/* Employee Profile */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <img
                            src={
                              emp?.img
                                ? emp.img
                                : "https://ui-avatars.com/api/?name=" + emp.name + "&background=random"
                            }
                            alt={emp.name}
                            className={`w-11 h-11 rounded-full object-cover border-2 ${
                              isUserRole ? "border-red-200" : "border-gray-100"
                            }`}
                          />
                          {isUserRole && (
                            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-red-500 border-2 border-white rounded-full" title="Action Required"></span>
                          )}
                        </div>
                        <div>
                          <p
                            className={`text-sm font-semibold ${
                              isUserRole ? "text-red-700" : "text-gray-900"
                            }`}
                          >
                            {emp.name}
                          </p>
                          <div className="flex items-center gap-1 mt-0.5 text-xs text-gray-500">
                            <Mail className="w-3 h-3" />
                            <span>{emp.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Company */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{emp.company || "—"}</span>
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{emp.phone || "—"}</span>
                      </div>
                    </td>

                    {/* Address */}
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-2 text-sm text-gray-600 max-w-50">
                        <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                        <span className="truncate" title={emp.address || ""}>
                          {emp.address || "—"}
                        </span>
                      </div>
                    </td>

                    {/* Role Action */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="relative flex items-center">
                        <select
                          value={emp.role.trim().toLowerCase()}
                          onChange={(e) => handleRoleChange(emp._id, e.target.value)}
                          disabled={mutationRole.isPending}
                          className={`appearance-none text-sm font-medium border rounded-lg pl-3 pr-8 py-2 outline-none transition-all cursor-pointer shadow-sm capitalize w-32 ${
                            isUserRole
                              ? "border-red-200 bg-red-50 text-red-700 focus:border-red-400 focus:ring-2 focus:ring-red-100 hover:bg-red-100"
                              : "border-gray-200 bg-white text-gray-700 focus:border-[#F7941D] focus:ring-2 focus:ring-[#F7941D]/20 hover:bg-gray-50"
                          } ${mutationRole.isPending ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          {roleOptions.map((role) => (
                            <option key={role} value={role} className="capitalize">
                              {formatRoleLabel(role)}
                            </option>
                          ))}
                        </select>
                        {/* Custom Dropdown Arrow */}
                        <div className="absolute right-3 pointer-events-none text-gray-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
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