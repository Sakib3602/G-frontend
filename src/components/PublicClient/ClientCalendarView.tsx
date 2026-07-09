"use client";

import useAxiosPublic from "@/uri/useAxiosPublic";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";

interface CalendarItemPublic {
  _id: string;
  scheduleDate: string;
  postType?: string;
  postHeadline?: string;
  platforms?: string[];
  status: string;
  deliveryLink?: string;
}

const formatDate = (dateString?: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const statusColors: Record<string, string> = {
  NEW: "bg-slate-100 text-slate-600",
  IN_PROGRESS: "bg-amber-100 text-amber-700",
  UNDER_REVIEW: "bg-blue-100 text-blue-700",
  SCHEDULED: "bg-indigo-100 text-indigo-700",
  PUBLISHED: "bg-emerald-100 text-emerald-700",
  DELIVERED: "bg-emerald-100 text-emerald-700",
  NEED_CONTENT: "bg-rose-100 text-rose-700",
  PAUSED: "bg-slate-200 text-slate-500",
  CANCELLED: "bg-rose-100 text-rose-500",
  ACCEPTED: "bg-teal-100 text-teal-700",
};

const ClientCalendarView = () => {
  const { token } = useParams();
  const axiosPublic = useAxiosPublic();

  const { data, isLoading, error } = useQuery({
    queryKey: ["publicClientCalendar", token],
    queryFn: async () => {
      const res = await axiosPublic.get(`/api/v1/public/calendar/${token}`);
      return res.data?.data;
    },
    enabled: !!token,
    retry: false,
  });

  const isExpired = (error as any)?.response?.data?.expired;
  const errorMessage = (error as any)?.response?.data?.message;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-400">Loading calendar...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center">
          <h2 className="text-lg font-semibold text-rose-700">
            {isExpired ? "Link Expired" : "Access Unavailable"}
          </h2>
          <p className="mt-2 text-sm text-rose-600">
            {errorMessage ||
              "This link is invalid or no longer active. Please contact your account manager."}
          </p>
        </div>
      </div>
    );
  }

  const items: CalendarItemPublic[] = data?.items ?? [];

  return (
    <div className="min-h-screen w-full bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            {data?.clientName ? `${data.clientName} — ` : ""}
            {data?.title ?? "Content Calendar"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {formatDate(data?.startDate)} → {formatDate(data?.endDate)}
          </p>
          {data?.expiresAt && (
            <p className="mt-1 text-xs text-slate-400">
              This view is available until {formatDate(data.expiresAt)}
            </p>
          )}
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="grid grid-cols-[80px_120px_1fr_1fr_140px_120px] gap-2 border-b border-slate-200 bg-slate-50 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            <span>#</span>
            <span>Schedule Date</span>
            <span>Post Type</span>
            <span>Headline</span>
            <span>Platforms</span>
            <span>Status</span>
          </div>

          {items.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-slate-400">
              No content scheduled yet.
            </p>
          ) : (
            <ul>
              {items.map((item, index) => (
                <li
                  key={item._id}
                  className={`grid grid-cols-[80px_120px_1fr_1fr_140px_120px] gap-2 px-4 py-3 text-sm ${
                    index !== items.length - 1 ? "border-b border-slate-100" : ""
                  }`}
                >
                  <span className="text-slate-400">{index + 1}</span>
                  <span className="font-medium text-slate-800">
                    {formatDate(item.scheduleDate)}
                  </span>
                  <span className="text-slate-600">{item.postType || "—"}</span>
                  <span className="text-slate-600">{item.postHeadline || "—"}</span>
                  <span className="flex flex-wrap gap-1">
                    {(item.platforms ?? []).map((p) => (
                      <span
                        key={p}
                        className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500"
                      >
                        {p}
                      </span>
                    ))}
                  </span>
                  <span
                    className={`w-fit rounded-full px-2.5 py-1 text-[11px] font-medium ${
                      statusColors[item.status] ?? "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {item.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientCalendarView;