import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Megaphone } from "lucide-react";

interface AnnouncementApi {
  _id: string;
  title: string;
  message: string;
  createdByName?: string;
  createdAt: string;
}

interface AnnouncementPopupProps {
  axiosInstance: any;
  basePath?: string; // default full path; marketing dashboard e "/announcements" pass koro
}

const AnnouncementPopup = ({ axiosInstance, basePath = "/api/v1/announcements" }: AnnouncementPopupProps) => {
  const queryClient = useQueryClient();
  const [queue, setQueue] = useState<AnnouncementApi[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data } = useQuery<AnnouncementApi[]>({
    queryKey: ["active-announcements"],
    queryFn: async () => {
      const res = await axiosInstance.get(`${basePath}/active`);
      return res.data?.data ?? [];
    },
    staleTime: 0,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (data && data.length > 0) {
      setQueue(data);
      setCurrentIndex(0);
    }
  }, [data]);

  const mutationDismiss = useMutation({
    mutationFn: async (id: string) => {
      const res = await axiosInstance.patch(`${basePath}/${id}/dismiss`);
      return res.data;
    },
  });

  const current = queue[currentIndex];

  const advance = () => {
    if (currentIndex + 1 < queue.length) {
      setCurrentIndex((i) => i + 1);
    } else {
      setQueue([]);
      setCurrentIndex(0);
      queryClient.invalidateQueries({ queryKey: ["active-announcements"] });
    }
  };

  const handleGotIt = () => {
    if (!current) return;
    mutationDismiss.mutate(current._id);
    advance();
  };

  if (!current) return null;

  const formattedDate = current.createdAt
    ? new Date(current.createdAt).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "";

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-950/55 px-4">
      <div className="flex w-full max-w-xl overflow-hidden bg-white shadow-[0_25px_70px_rgba(0,0,0,0.35)]">
        {/* Left icon panel */}
        <div className="flex w-28 shrink-0 flex-col items-center justify-center bg-slate-900 py-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
            <Megaphone className="h-6 w-6 text-amber-400" strokeWidth={1.75} />
          </div>
          {queue.length > 1 && (
            <span className="mt-4 text-[10px] font-semibold tracking-widest text-slate-400">
              {currentIndex + 1}/{queue.length}
            </span>
          )}
        </div>

        {/* Right content panel */}
        <div className="flex flex-1 flex-col p-7">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-600">
            Announcement
          </p>
          <h3 className="mt-2 text-xl font-semibold leading-snug text-slate-900">
            {current.title}
          </h3>

          <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600 whitespace-pre-wrap">
            {current.message}
          </p>

          <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
            <div className="text-xs text-slate-400">
              {current.createdByName && (
                <span className="font-medium text-slate-500">{current.createdByName}</span>
              )}
              {current.createdByName && formattedDate && <span className="mx-1.5">·</span>}
              {formattedDate}
            </div>

            <button
              onClick={handleGotIt}
              disabled={mutationDismiss.isPending}
              className="bg-slate-900 px-5 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-800 disabled:opacity-50"
            >
              {mutationDismiss.isPending ? "..." : "Got it"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementPopup;