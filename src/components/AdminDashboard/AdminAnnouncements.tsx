import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Notification from "../ui/toast";
import useAxiosAdmin from "@/uri/useAxiosAdmin";

const ROLE_OPTIONS = ["admin", "sales", "marketing", "designer", "web"];

interface IAnnouncement {
  _id: string;
  title: string;
  message: string;
  roles: string[];
  durationDays: number;
  expiresAt: string;
  isActive: boolean;
  createdByName?: string;
  createdAt: string;
}

interface IAnnouncementForm {
  title: string;
  message: string;
  roles: string[];
  durationDays: number;
}

const emptyForm: IAnnouncementForm = {
  title: "",
  message: "",
  roles: [],
  durationDays: 7,
};

export default function Admin_Announcements() {
  const axiosSecure = useAxiosAdmin();
  const queryClient = useQueryClient();

  const [showNoti, setShowNoti] = useState<{ title: string; message: string } | null>(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [form, setForm] = useState<IAnnouncementForm>(emptyForm);

  const [editTarget, setEditTarget] = useState<IAnnouncement | null>(null);
  const [editForm, setEditForm] = useState<IAnnouncementForm>(emptyForm);

  const [deleteTarget, setDeleteTarget] = useState<IAnnouncement | null>(null);

  // ─── Fetch all announcements ─────────────────────────────
  const { data, isLoading, isError } = useQuery<{ data: IAnnouncement[] }>({
    queryKey: ["admin-announcements"],
    queryFn: async () => {
      const res = await axiosSecure.get("/announcements");
      return res.data;
    },
  });

  const announcements = data?.data ?? [];

  const isExpired = (expiresAt: string) => new Date(expiresAt) < new Date();

  // ─── Create ──────────────────────────────────────────────
  const mutationCreate = useMutation({
    mutationFn: async (payload: IAnnouncementForm) => {
      const res = await axiosSecure.post("/announcements", payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-announcements"] });
      setShowCreateModal(false);
      setForm(emptyForm);
      setShowNoti({ title: "Announcement Created!", message: "It's now live for the selected roles." });
    },
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim() || form.roles.length === 0 || !form.durationDays) {
      return;
    }
    mutationCreate.mutate(form);
  };

  // ─── Edit ────────────────────────────────────────────────
  const openEditModal = (item: IAnnouncement) => {
    setEditTarget(item);
    setEditForm({
      title: item.title,
      message: item.message,
      roles: item.roles,
      durationDays: item.durationDays,
    });
  };

  const mutationUpdate = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<IAnnouncementForm> }) => {
      const res = await axiosSecure.patch(`/announcements/${id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-announcements"] });
      setEditTarget(null);
      setShowNoti({ title: "Updated!", message: "Announcement changes saved." });
    },
  });

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    if (!editForm.title.trim() || !editForm.message.trim() || editForm.roles.length === 0 || !editForm.durationDays) {
      return;
    }
    mutationUpdate.mutate({ id: editTarget._id, payload: editForm });
  };

  // ─── Toggle active ───────────────────────────────────────
  const mutationToggleActive = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const res = await axiosSecure.patch(`/announcements/${id}`, { isActive });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-announcements"] });
    },
  });

  // ─── Delete ──────────────────────────────────────────────
  const mutationDelete = useMutation({
    mutationFn: async (id: string) => {
      const res = await axiosSecure.delete(`/announcements/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-announcements"] });
      setDeleteTarget(null);
      setShowNoti({ title: "Deleted", message: "Announcement removed." });
    },
  });

  // ─── Role checkbox toggler (shared by create + edit forms) ─
  const toggleRole = (
    role: string,
    current: string[],
    setter: (roles: string[]) => void,
  ) => {
    if (role === "ALL") {
      setter(current.includes("ALL") ? [] : ["ALL"]);
      return;
    }
    // ALL এর সাথে অন্য কিছু select করলে ALL বাদ পড়ে যাবে
    const withoutAll = current.filter((r) => r !== "ALL");
    if (withoutAll.includes(role)) {
      setter(withoutAll.filter((r) => r !== role));
    } else {
      setter([...withoutAll, role]);
    }
  };

  const renderRoleCheckboxes = (
    selected: string[],
    setter: (roles: string[]) => void,
  ) => (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => toggleRole("ALL", selected, setter)}
        className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
          selected.includes("ALL")
            ? "bg-slate-900 text-white border-slate-900"
            : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
        }`}
      >
        All Roles
      </button>
      {ROLE_OPTIONS.map((role) => (
        <button
          key={role}
          type="button"
          onClick={() => toggleRole(role, selected, setter)}
          disabled={selected.includes("ALL")}
          className={`px-3 py-1.5 rounded-full text-xs font-bold border capitalize transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
            selected.includes(role)
              ? "bg-[#7FA23B] text-white border-[#7FA23B]"
              : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
          }`}
        >
          {role}
        </button>
      ))}
    </div>
  );

  return (
    <>
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {showNoti && (
          <Notification
            type="success"
            title={showNoti.title}
            message={showNoti.message}
            showIcon
            duration={3000}
            onClose={() => setShowNoti(null)}
          />
        )}
      </div>

      <div className="w-full min-h-screen bg-[#f8fafc] px-6 py-10 lg:px-14 font-sans text-slate-900 antialiased">
        <div className=" mx-auto">
          <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
            <div>
              <p className="text-[10px] tracking-widest text-[#7FA23B] uppercase font-bold mb-1">
                System Broadcast
              </p>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                Announcements
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Total:{" "}
                <span className="font-semibold text-slate-800">
                  {announcements.length}
                </span>
              </p>
            </div>
            <button
              onClick={() => {
                setForm(emptyForm);
                setShowCreateModal(true);
              }}
              className="px-4 py-2 bg-[#7FA23B] rounded text-xs font-semibold text-white hover:bg-[#6c8c31] transition-colors shadow-xs"
            >
              + New Announcement
            </button>
          </div>

          {isLoading && (
            <div className="flex flex-col justify-center items-center py-20">
              <div className="w-5 h-5 border-2 border-slate-200 border-t-[#7FA23B] rounded-full animate-spin"></div>
              <span className="mt-3 text-xs tracking-wider text-slate-400 uppercase font-medium">
                Loading...
              </span>
            </div>
          )}

          {isError && (
            <div className="p-8 max-w-md mx-auto mt-10 border border-red-100 rounded-lg text-center bg-white">
              <p className="text-sm font-semibold text-red-600">Connection Failed</p>
            </div>
          )}

          {!isLoading && !isError && (
            <div className="overflow-x-auto bg-white border border-slate-200 shadow-sm rounded-lg">
              <table className="min-w-full text-sm text-left whitespace-nowrap">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3 text-[10px] uppercase tracking-wider font-bold text-slate-500">
                      Title
                    </th>
                    <th className="px-5 py-3 text-[10px] uppercase tracking-wider font-bold text-slate-500">
                      Roles
                    </th>
                    <th className="px-5 py-3 text-[10px] uppercase tracking-wider font-bold text-slate-500">
                      Status
                    </th>
                    <th className="px-5 py-3 text-[10px] uppercase tracking-wider font-bold text-slate-500">
                      Expires
                    </th>
                    <th className="px-5 py-3 text-[10px] uppercase tracking-wider font-bold text-slate-500">
                      Created By
                    </th>
                    <th className="px-5 py-3 text-[10px] uppercase tracking-wider font-bold text-slate-500 w-[1%]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {announcements.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-5 py-10 text-center text-slate-400 text-xs">
                        No announcements yet.
                      </td>
                    </tr>
                  )}
                  {announcements.map((item) => {
                    const expired = isExpired(item.expiresAt);
                    return (
                      <tr key={item._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-3 max-w-xs">
                          <p className="font-semibold text-slate-800 truncate">{item.title}</p>
                          <p className="text-xs text-slate-500 truncate max-w-xs">{item.message}</p>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex flex-wrap gap-1">
                            {item.roles.map((r) => (
                              <span
                                key={r}
                                className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold uppercase"
                              >
                                {r}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          {expired ? (
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-1 rounded">
                              Expired
                            </span>
                          ) : item.isActive ? (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded">
                              Active
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-1 rounded">
                              Disabled
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-xs text-slate-600">
                          {new Date(item.expiresAt).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-5 py-3 text-xs text-slate-600">
                          {item.createdByName || "—"}
                        </td>
                        <td className="px-5 py-3 w-[1%]">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEditModal(item)}
                              className="px-3 py-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-[11px] font-bold transition-all"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() =>
                                mutationToggleActive.mutate({ id: item._id, isActive: !item.isActive })
                              }
                              disabled={mutationToggleActive.isPending}
                              className={`px-3 py-1.5 rounded border text-[11px] font-bold transition-all disabled:opacity-50 ${
                                item.isActive
                                  ? "border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-700"
                                  : "border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700"
                              }`}
                            >
                              {item.isActive ? "Disable" : "Enable"}
                            </button>
                            <button
                              onClick={() => setDeleteTarget(item)}
                              className="px-3 py-1.5 rounded border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 text-[11px] font-bold transition-all"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* --- CREATE MODAL --- */}
      {showCreateModal && (
        <div className="fixed inset-0 z-70 flex items-center justify-center bg-slate-900/30 backdrop-blur-xs p-4">
          <div className="absolute inset-0" onClick={() => setShowCreateModal(false)}></div>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden border border-slate-200 max-h-[90vh] flex flex-col">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-900">New Announcement</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-800 p-1 rounded transition-colors"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:outline-none focus:border-[#7FA23B]"
                  placeholder="e.g. Scheduled Maintenance"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:outline-none focus:border-[#7FA23B] resize-none"
                  placeholder="Details of the announcement..."
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                  Visible To <span className="text-red-500">*</span>
                </label>
                {renderRoleCheckboxes(form.roles, (roles) => setForm((p) => ({ ...p, roles })))}
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                  Duration (Days) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  value={form.durationDays}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, durationDays: Number(e.target.value) }))
                  }
                  className="w-28 px-3 py-2 border border-slate-200 rounded text-sm focus:outline-none focus:border-[#7FA23B]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    mutationCreate.isPending ||
                    !form.title.trim() ||
                    !form.message.trim() ||
                    form.roles.length === 0 ||
                    !form.durationDays
                  }
                  className="px-4 py-2 rounded bg-[#7FA23B] text-white text-xs font-bold hover:bg-[#6c8c31] disabled:opacity-40"
                >
                  {mutationCreate.isPending ? "Publishing..." : "Publish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT MODAL --- */}
      {editTarget && (
        <div className="fixed inset-0 z-70 flex items-center justify-center bg-slate-900/30 backdrop-blur-xs p-4">
          <div className="absolute inset-0" onClick={() => setEditTarget(null)}></div>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden border border-slate-200 max-h-[90vh] flex flex-col">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-900">Edit Announcement</h2>
              <button
                onClick={() => setEditTarget(null)}
                className="text-slate-400 hover:text-slate-800 p-1 rounded transition-colors"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:outline-none focus:border-[#7FA23B]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={editForm.message}
                  onChange={(e) => setEditForm((p) => ({ ...p, message: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:outline-none focus:border-[#7FA23B] resize-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                  Visible To <span className="text-red-500">*</span>
                </label>
                {renderRoleCheckboxes(editForm.roles, (roles) => setEditForm((p) => ({ ...p, roles })))}
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                  Duration (Days) — from today <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  value={editForm.durationDays}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, durationDays: Number(e.target.value) }))
                  }
                  className="w-28 px-3 py-2 border border-slate-200 rounded text-sm focus:outline-none focus:border-[#7FA23B]"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Note: changing this recalculates the expiry date from today.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditTarget(null)}
                  className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    mutationUpdate.isPending ||
                    !editForm.title.trim() ||
                    !editForm.message.trim() ||
                    editForm.roles.length === 0 ||
                    !editForm.durationDays
                  }
                  className="px-4 py-2 rounded bg-[#7FA23B] text-white text-xs font-bold hover:bg-[#6c8c31] disabled:opacity-40"
                >
                  {mutationUpdate.isPending ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- DELETE CONFIRM --- */}
      {deleteTarget && (
        <div className="fixed inset-0 z-70 flex items-center justify-center bg-slate-900/30 backdrop-blur-xs p-4">
          <div className="absolute inset-0" onClick={() => setDeleteTarget(null)}></div>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm relative z-10 overflow-hidden border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-2">Delete Announcement?</h2>
            <p className="text-sm text-slate-500 mb-6">
              "{deleteTarget.title}" — This action cannot be undone. Are you sure you want to delete this announcement?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => mutationDelete.mutate(deleteTarget._id)}
                disabled={mutationDelete.isPending}
                className="px-4 py-2 rounded bg-red-600 text-white text-xs font-bold hover:bg-red-700 disabled:opacity-40"
              >
                {mutationDelete.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}