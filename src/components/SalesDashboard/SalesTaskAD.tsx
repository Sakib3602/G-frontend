import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import Swal from "sweetalert2";
import {
  MessageSquare,
  Send,
  CheckCircle,
  Link as LinkIcon,
  ListTodo,
  Inbox,
  X,
} from "lucide-react";
import useAxiosSales from "@/uri/useAxiosSales";

interface CommentApi {
  _id: string;
  text: string;
  commentByName: string;
  createdAt: string;
}

interface Task {
  _id: string;
  title: string;
  description: string;
  priority: string;
  assignedTo?: string;
  campaignId?: string;
  status?: string;
  comments?: CommentApi[];
}

const SalesTaskAD = () => {
  const axiosMar = useAxiosSales();
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [workUrl, setWorkUrl] = useState<string>("");

  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({});
  const [commentDraft, setCommentDraft] = useState<Record<string, string>>({});

  const { data: taskData = [], isLoading, refetch } = useQuery<Task[]>({
    queryKey: ["sales-tasks"],
    queryFn: async () => {
      const res = await axiosMar.get("/api/v1/sales/tasks-all");
      return res.data;
    },
  });

  const handleDone = (id: string) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to mark this task as complete?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#16a34a", 
      cancelButtonColor: "#dc2626", 
      confirmButtonText: "Yes, Done!",
      customClass: { popup: "rounded-lg" },
    }).then((result) => {
      if (result.isConfirmed) {
        mutationDoneWork.mutate({ id, url: "" });
      }
    });
  };

  const openModal = (id: string) => {
    setSelectedTaskId(id);
    setIsModalOpen(true);
  };

  const handleSubmitWork = () => {
    if (!workUrl.trim()) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Please enter a valid URL before submitting!",
        customClass: { popup: "rounded-lg" },
      });
      return;
    }
    const url = workUrl.trim();
    mutationDoneWork.mutate({ id: selectedTaskId!, url });
    setIsModalOpen(false);
    setWorkUrl("");
  };

  const mutationDoneWork = useMutation({
    mutationFn: async ({ id, url }: { id: string; url: string }) => {
      const res = await axiosMar.patch(`/api/v1/sales/task-done/${id}`, { url });
      return res.data;
    },
    onSuccess: () => {
      refetch();
      Swal.fire({
        title: "Completed!",
        text: "Your task has been marked as done.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
        customClass: { popup: "rounded-lg" },
      });
    },
  });

  // ---------- Comments ----------
  const mutationAddComment = useMutation({
    mutationFn: async ({ taskId, text }: { taskId: string; text: string }) => {
      const res = await axiosMar.post(`/api/v1/sales/tasks/${taskId}/comment`, { text });
      return res.data;
    },
    onSuccess: (_data, variables) => {
      setCommentDraft((prev) => ({ ...prev, [variables.taskId]: "" }));
      queryClient.invalidateQueries({ queryKey: ["sales-tasks"] });
    },
  });

  const handleAddComment = (taskId: string) => {
    const text = commentDraft[taskId]?.trim();
    if (!text || mutationAddComment.isPending) return;
    mutationAddComment.mutate({ taskId, text });
  };

  const toggleComments = (taskId: string) => {
    setExpandedTasks((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "bg-red-50 text-red-700 border-red-200";
      case "medium":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "low":
        return "bg-gray-50 text-gray-700 border-gray-200";
      default:
        return "bg-blue-50 text-blue-700 border-blue-200";
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
          <p className="text-sm font-medium text-gray-500">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header Section */}
        <div className="mb-8 border-b border-gray-200 pb-5">
          <div className="mb-3 inline-flex items-center gap-2 rounded bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-700 shadow-sm border border-blue-100">
            <ListTodo className="h-4 w-4" />
            <span>Sales Operations</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
            My Active Tasks
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Review your assigned tasks, submit progress URLs, or mark them as completed.
          </p>
        </div>

        {/* Task Grid - Added "items-start" to prevent vertical stretching */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 items-start">
          {taskData.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white py-16 shadow-sm text-center">
              <div className="mb-4 rounded-full bg-gray-50 p-4">
                <Inbox className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">No tasks assigned</h3>
              <p className="mt-1 text-sm text-gray-500">
                You're all caught up! Check back later for new assignments.
              </p>
            </div>
          ) : (
            taskData.map((task) => {
              const isExpanded = !!expandedTasks[task._id];
              const commentCount = task.comments?.length ?? 0;

              return (
                <div
                  key={task._id}
                  className="group flex flex-col justify-between rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-all"
                >
                  {/* Card Content */}
                  <div>
                    <div className="mb-4 flex items-start justify-between gap-3 border-b border-gray-100 pb-3">
                      <h3 className="font-semibold leading-tight text-gray-800">{task.title}</h3>
                      <span
                        className={`whitespace-nowrap rounded border px-2.5 py-1 text-xs font-medium ${getPriorityStyle(
                          task.priority
                        )}`}
                      >
                        {task.priority || "Normal"}
                      </span>
                    </div>
                    <p className="mb-4 text-sm leading-relaxed text-gray-600">{task.description}</p>
                  </div>

                  {/* Card Actions & Footer */}
                  <div className="mt-auto pt-4">
                    <div className="flex flex-wrap items-center gap-3 border-t border-gray-100 pt-4">
                      <button
                        onClick={() => handleDone(task._id)}
                        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded bg-green-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Done
                      </button>
                      <button
                        onClick={() => openModal(task._id)}
                        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded bg-[#f59e0b] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[#d97706]"
                      >
                        <LinkIcon className="h-4 w-4" />
                        Submit Work
                      </button>
                    </div>

                    {/* Comments Toggle Button */}
                    <button
                      onClick={() => toggleComments(task._id)}
                      className="mt-4 flex w-full items-center justify-center gap-1.5 rounded bg-gray-50 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 border border-gray-200"
                    >
                      <MessageSquare className="h-4 w-4" />
                      {isExpanded ? "Hide Comments" : `Comments (${commentCount})`}
                    </button>

                    {/* Comments Section (Scrollable) */}
                    {isExpanded && (
                      <div className="mt-3 overflow-hidden rounded border border-gray-200 bg-gray-50">
                        {commentCount === 0 && (
                          <p className="py-3 text-center text-sm text-gray-400">
                            No comments yet.
                          </p>
                        )}

                        {/* Comment List (Scrollable Area) */}
                        <div className="max-h-[240px] overflow-y-auto p-3 space-y-3 custom-scrollbar">
                          {(task.comments ?? [])
                            .slice()
                            .sort(
                              (a, b) =>
                                new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                            )
                            .map((c) => (
                              <div
                                key={c._id}
                                className="rounded border border-gray-100 bg-white p-3 shadow-sm"
                              >
                                <div className="mb-1.5 flex items-center justify-between gap-2 border-b border-gray-50 pb-1.5">
                                  <span className="text-sm font-semibold text-gray-800">
                                    {c.commentByName}
                                  </span>
                                  <span className="text-xs text-gray-400">
                                    {new Date(c.createdAt).toLocaleString()}
                                  </span>
                                </div>
                                <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-600">
                                  {c.text}
                                </p>
                              </div>
                            ))}
                        </div>

                        {/* Comment Input Field */}
                        <div className="flex items-center gap-2 border-t border-gray-200 bg-white p-3">
                          <input
                            type="text"
                            value={commentDraft[task._id] ?? ""}
                            onChange={(e) =>
                              setCommentDraft((prev) => ({ ...prev, [task._id]: e.target.value }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddComment(task._id);
                              }
                            }}
                            placeholder="Type a comment..."
                            className="w-full rounded border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none transition focus:border-blue-400 focus:bg-white"
                          />
                          <button
                            onClick={() => handleAddComment(task._id)}
                            disabled={mutationAddComment.isPending || !commentDraft[task._id]?.trim()}
                            className="inline-flex shrink-0 items-center justify-center rounded bg-gray-700 px-4 py-2 text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
                          >
                            <Send className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* URL Submit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
          <div
            className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          ></div>

          <div className="relative w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl">
            <div className="mb-5 flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded bg-blue-50 text-blue-600 border border-blue-100">
                  <LinkIcon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Submit Work URL</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mb-4 text-sm text-gray-500">
              Please provide the direct link where your completed work can be verified.
            </p>

            <div className="mb-6">
              <input
                type="url"
                placeholder="https://..."
                className="w-full rounded border border-gray-200 bg-gray-50 p-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
                value={workUrl}
                onChange={(e) => setWorkUrl(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setWorkUrl("");
                }}
                className="rounded border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitWork}
                className="inline-flex items-center gap-1.5 rounded bg-blue-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                Submit URL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesTaskAD;