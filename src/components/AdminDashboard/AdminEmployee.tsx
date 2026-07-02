import useAxiosAdmin from "@/uri/useAxiosAdmin";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

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

  const handleDelete = async (id: string) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this employee?");

    if (!isConfirmed) return;

    console.log("Deleting employee id:", id);

    mutationDelete.mutate({ id });
  };

  const mutationDelete = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const res = await axiosAdmin.delete(`/delete-employee/${id}`);
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.setQueryData<EmployeesResponse | undefined>(
        ["employees"],
        (current) => {
          if (!current) return current;
          return {
            ...current,
            data: current.data.filter((emp) => emp._id !== variables.id),
          };
        },
      );
    },
    onError: (error, variables) => {
      alert(`Failed to delete employee id: ${variables.id}. Please try again.`);
      console.log("Delete failed for id:", variables.id, error);
    },
  });



  const handleRoleChange = async (id: string, newRole: string) => {
    console.log("Changing role for employee id:", id);
    mutationRole.mutate({ id, newRole });
  };

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
    onError: (error, variables) => {
      alert(`Failed to change role for employee id: ${variables.id}.  Please try again.`);
      console.log("Role change failed for id:", variables.id, error);
    },
  });

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <p className="text-gray-500">Loading employees...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <p className="text-red-500">Failed to load employees.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-xl font-bold text-gray-800 mb-6">
        Employee Management
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-400 text-sm uppercase tracking-wider border-b border-gray-100">
              <th className="pb-4 font-medium">Employee</th>
              <th className="pb-4 font-medium">Company</th>
              <th className="pb-4 font-medium">Phone</th>
              <th className="pb-4 font-medium">Address</th>
              <th className="pb-4 font-medium">Role</th>
              <th className="pb-4 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {employees.map((emp) => (
              (() => {
                const isUserRole = emp.role.trim().toLowerCase() === "user";

                return (
              <tr
                key={emp._id}
                className={`group transition-colors hover:bg-gray-50 ${
                  isUserRole ? "bg-red-50" : ""
                }`}
              >
                <td
                  className={`py-4 flex items-center gap-3 whitespace-nowrap ${
                    isUserRole ? "text-red-700" : ""
                  }`}
                >
                  <img
                    src={
                      emp?.img
                        ? emp.img
                        : "https://www.shutterstock.com/image-vector/avatar-gender-neutral-silhouette-vector-260nw-2470054311.jpg"
                    }
                    alt={emp.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p
                      className={`text-sm font-semibold ${
                        isUserRole ? "text-red-700" : "text-gray-800"
                      }`}
                    >
                      {emp.name}
                    </p>
                    <p className={`text-xs ${isUserRole ? "text-red-500" : "text-gray-500"}`}>
                      {emp.email}
                    </p>
                  </div>
                </td>

                <td
                  className={`py-4 text-sm whitespace-nowrap ${
                    isUserRole ? "text-red-700" : "text-gray-600"
                  }`}
                >
                  {emp.company || "—"}
                </td>

                <td
                  className={`py-4 text-sm whitespace-nowrap ${
                    isUserRole ? "text-red-700" : "text-gray-600"
                  }`}
                >
                  {emp.phone || "—"}
                </td>

                <td
                  className={`py-4 text-sm whitespace-nowrap max-w-[160px] truncate ${
                    isUserRole ? "text-red-700" : "text-gray-600"
                  }`}
                >
                  {emp.address || "—"}
                </td>

                <td className="py-4">
                  <select
                    value={emp.role.trim().toLowerCase()}
                    onChange={(e) => handleRoleChange(emp._id, e.target.value)}
                    className={`text-sm border rounded-lg px-2 py-1 outline-none focus:border-[#F7941D] transition-colors capitalize ${
                      isUserRole
                        ? "border-red-300 bg-red-50 text-red-700"
                        : "border-gray-200"
                    }`}
                  >
                    {roleOptions.map((role) => (
                      <option key={role} value={role} className="capitalize">
                        {formatRoleLabel(role)}
                      </option>
                    ))}
                  </select>
                </td>

                <td className="py-4">
                  <button
                    onClick={() => handleDelete(emp._id)}
                    className={`px-3 py-1 rounded-lg text-sm transition-colors whitespace-nowrap ${
                      isUserRole
                        ? "text-red-700 hover:text-red-900 hover:bg-red-100"
                        : "text-red-500 hover:text-red-700 hover:bg-red-50"
                    }`}
                  >
                    Delete
                  </button>
                </td>
              </tr>
                );
              })()
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminEmployee;