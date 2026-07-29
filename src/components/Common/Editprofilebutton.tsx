"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosInstance } from "axios";
import { FiEdit2, FiX } from "react-icons/fi";

// ─── Types ────────────────────────────────────────────────────

interface ProfileData {
  _id: string;
  name: string;
  email: string;
  img?: string | null;
  phone?: string | null;
  address?: string | null;
  NID?: string | null;
  role?: string;
}

interface EditProfileButtonProps {
  // Role onujayi tomar nijer axios hook theke ei prop e pass korbe:
  // e.g. <EditProfileButton axiosInstance={useAxiosAdmin()} />
  //      <EditProfileButton axiosInstance={useAxiosSales()} />
  axiosInstance: AxiosInstance;
  // ⚠️ Different axios hook-er baseURL alada hote pare — kono hook e
  // "/api/v1" already baseURL e boshano (tokhon "/profile/me" e hobe),
  // kono hook e root URL (tokhon "/api/v1/profile/me" dite hobe).
  // Default "/profile/me" — na mile override koro.
  profileEndpoint?: string;
  buttonClassName?: string;
  buttonLabel?: string;
}

// ─── Main ─────────────────────────────────────────────────────

const EditProfileButton = ({
  axiosInstance,
  profileEndpoint = "/profile/me",
  buttonClassName,
  buttonLabel = "Edit Profile",
}: EditProfileButtonProps) => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [nid, setNid] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [formError, setFormError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const { data: profile, isLoading } = useQuery<ProfileData>({
    queryKey: ["myProfile"],
    queryFn: async () => {
      const res = await axiosInstance.get(profileEndpoint);
      return res.data?.data;
    },
    enabled: open, // modal khulle e fetch hobe, age hobe na
  });

  // Profile data ashle form fields prefill kora
  useEffect(() => {
    if (profile) {
      setName(profile.name ?? "");
      setPhone(profile.phone ?? "");
      setAddress(profile.address ?? "");
      setNid(profile.NID ?? "");
  
    }
  }, [profile]);




  const mutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("phone", phone);
      formData.append("address", address);
      formData.append("NID", nid);
      if (imageFile) {
        formData.append("profileImage", imageFile);
      }

      const res = await axiosInstance.patch(profileEndpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: () => {
      setFormError("");
      setSuccessMsg("Profile updated successfully ✓");
      queryClient.invalidateQueries({ queryKey: ["user-data"] });
      setImageFile(null);
      setTimeout(() => setSuccessMsg(""), 2500);
      setOpen(false);
    },
    onError: (err: any) => {
      setFormError(
        err?.response?.data?.message ||
          "Profile update failed. Please try again.",
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!name.trim()) {
      setFormError("Name field is required.");
      return;
    }
    mutation.mutate();
  };

  const closeModal = () => {
    setOpen(false);
    setImageFile(null);
    setFormError("");
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          buttonClassName ??
          "flex items-center gap-2 rounded-lg border border-slate-300 bg-white/70 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-indigo-400 hover:text-indigo-600"
        }
      >
        <FiEdit2 className="h-4 w-4" />
        {buttonLabel}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={closeModal}
        >
          <div
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">
                Edit Profile
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            {isLoading ? (
              <p className="py-8 text-center text-sm text-slate-400">
                Loading profile...
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Image */}
                

                {/* Name */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                  />
                </div>

                {/* Email — read only, this route can't change it */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profile?.email ?? ""}
                    disabled
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400"
                  />
                </div>

                {/* Phone */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                  />
                </div>

                {/* Address */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Address
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                  />
                </div>

                {/* NID */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    NID
                  </label>
                  <input
                    type="text"
                    value={nid}
                    onChange={(e) => setNid(e.target.value)}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                  />
                </div>

                {formError && (
                  <p className="text-sm text-rose-600">{formError}</p>
                )}
                {successMsg && (
                  <p className="text-sm text-emerald-600">{successMsg}</p>
                )}

                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-50"
                >
                  {mutation.isPending ? "Saving..." : "Save changes"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default EditProfileButton;