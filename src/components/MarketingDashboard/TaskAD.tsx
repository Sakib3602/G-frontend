import useAxiosMarketing from "@/uri/useAxiosMarketing";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import Swal from "sweetalert2";
import { MessageSquare, Send } from "lucide-react";

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

const TaskAD = () => {
  const axiosMar = useAxiosMarketing();
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [workUrl, setWorkUrl] = useState<string>("");

  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [commentDraft, setCommentDraft] = useState<Record<string, string>>({});

  const { data: taskData = [], isLoading, refetch } = useQuery<Task[]>({
    queryKey: ["marketing-tasks"],
    queryFn: async () => {
      const res = await axiosMar.get("/tasks/marketing-tasks");
      return res.data;
    },
  });

  const handleDone = (id: string) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to mark this task as complete?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#22c55e",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Done!",
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
      Swal.fire({ icon: "error", title: "Oops...", text: "Please enter a valid URL before submitting!" });
      return;
    }
    const url = workUrl.trim();
    mutationDoneWork.mutate({ id: selectedTaskId!, url });
    setIsModalOpen(false);
    setWorkUrl("");
  };

  const mutationDoneWork = useMutation({
    mutationFn: async ({ id, url }: { id: string; url: string }) => {
      const res = await axiosMar.patch(`/tasks/task-done/${id}`, { url });
      return res.data;
    },
    onSuccess: () => {
      refetch();
      Swal.fire({ title: "Completed!", text: "Your task has been marked as done.", icon: "success", timer: 1500, showConfirmButton: false });
    },
  });

  // ---------- Comments ----------
  const mutationAddComment = useMutation({
    mutationFn: async ({ taskId, text }: { taskId: string; text: string }) => {
      const res = await axiosMar.post(`/tasks/${taskId}/comment`, { text });
      return res.data;
    },
    onSuccess: (_data, variables) => {
      setCommentDraft((prev) => ({ ...prev, [variables.taskId]: "" }));
      queryClient.invalidateQueries({ queryKey: ["marketing-tasks"] });
    },
  });

  

  const handleAddComment = (taskId: string) => {
    const text = commentDraft[taskId]?.trim();
    if (!text || mutationAddComment.isPending) return;
    mutationAddComment.mutate({ taskId, text });
  };


  if (isLoading) return <div className="text-center p-10">Loading...</div>;

  return (
    <div className="p-6 bg-slate-50 min-h-screen rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">My Marketing Tasks</h2>
      <hr />

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {taskData.length === 0 && (
          <div className="col-span-full text-center text-gray-500 mt-10">No tasks available.</div>
        )}
        {taskData.map((task) => {
          const isExpanded = expandedTaskId === task._id;
          const commentCount = task.comments?.length ?? 0;

          return (
            <div key={task._id} className="border p-5 rounded-lg shadow-sm bg-white flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">{task.title}</h3>
                <p className="text-sm text-gray-700 mb-2">{task.description}</p>
                <p className="text-xs text-gray-500">
                  Priority:{" "}
                  <span className={`font-medium ${task.priority === "High" ? "text-red-600" : "text-blue-600"}`}>
                    {task.priority}
                  </span>
                </p>
              </div>

              <div className="mt-5 flex gap-3">
                <button
                  onClick={() => handleDone(task._id)}
                  className="bg-green-500 cursor-pointer hover:bg-green-600 text-white px-4 py-2 rounded-md font-medium text-sm w-full md:w-auto transition-colors"
                >
                  Done
                </button>
                <button
                  onClick={() => openModal(task._id)}
                  className="bg-[#EAC564] hover:bg-[#d6b255] cursor-pointer text-white px-4 py-2 rounded-md font-medium text-sm w-full md:w-auto transition-colors"
                >
                  Submit Work
                </button>
              </div>

              {/* Comments toggle */}
              <button
                onClick={() => setExpandedTaskId(isExpanded ? null : task._id)}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#9A7A22] hover:text-[#7d641b] hover:underline"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                {isExpanded ? "Hide comments" : `Comments (${commentCount})`}
              </button>

              {isExpanded && (
                <div className="mt-2.5 space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  {commentCount === 0 && (
                    <p className="text-xs text-slate-400">No comments yet. Be the first to add one.</p>
                  )}

                  <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
                    {(task.comments ?? [])
                      .slice()
                      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                      .map((c) => (
                        <div key={c._id} className="group relative rounded-xl bg-white px-3 py-2 border border-slate-100">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold text-slate-700">{c.commentByName}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-slate-400">
                                {new Date(c.createdAt).toLocaleString()}
                              </span>
                             
                            </div>
                          </div>
                          <p className="mt-0.5 whitespace-pre-wrap text-xs leading-5 text-slate-600">{c.text}</p>
                        </div>
                      ))}
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      value={commentDraft[task._id] ?? ""}
                      onChange={(e) => setCommentDraft((prev) => ({ ...prev, [task._id]: e.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddComment(task._id);
                        }
                      }}
                      placeholder="Write a comment..."
                      className="w-full rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs outline-none transition focus:border-[#EAC564] focus:ring-2 focus:ring-[#EAC564]/20"
                    />
                    <button
                      onClick={() => handleAddComment(task._id)}
                      disabled={mutationAddComment.isPending || !commentDraft[task._id]?.trim()}
                      className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#EAC564] px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-[#d6b255] disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      <Send className="h-3.5 w-3.5" />
                      {mutationAddComment.isPending ? "Sending..." : "Send"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300">
          <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md transform scale-100 opacity-100 transition-transform duration-300">
            <h3 className="text-xl font-bold mb-4 text-gray-900">Submit Your Work URL</h3>
            <p className="text-sm text-gray-600 mb-6">
              Please provide the URL where the work is complete for verification.
            </p>
            <input
              type="url"
              placeholder="https://example.com/your-submission"
              className="border border-gray-300 w-full p-3 rounded-md mb-6 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={workUrl}
              onChange={(e) => setWorkUrl(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setIsModalOpen(false); setWorkUrl(""); }}
                className="px-5 py-2 cursor-pointer text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitWork}
                className="bg-blue-600 cursor-pointer hover:bg-blue-700 text-white px-5 py-2 rounded-md font-medium transition-colors"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskAD;