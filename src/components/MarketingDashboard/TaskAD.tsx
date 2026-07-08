import useAxiosMarketing from "@/uri/useAxiosMarketing";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Swal from "sweetalert2"; // SweetAlert ইম্পোর্ট করা হলো

// টাস্কের ডেটা স্ট্রাকচার
interface Task {
  _id: string;
  title: string;
  description: string;
  priority: string;
  assignedTo?: string;
  campaignId?: string;
  status?: string;
}

const TaskAD = () => {
  const axiosMar = useAxiosMarketing();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [workUrl, setWorkUrl] = useState<string>("");

  const { data: taskData = [], isLoading } = useQuery<Task[]>({
    queryKey: ["marketing-tasks"],
    queryFn: async () => {
      const res = await axiosMar.get("/tasks/marketing-tasks");
      return res.data;
    },
  });

  // Done বাটনের জন্য SweetAlert Confirmation
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

        mutationDoneWork.mutate({ id, url : "" });

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
      const res = await axiosMar.patch(`/tasks/task-done/${id}`, {
        url,
      });

      return res.data;
    },

    onSuccess: () => {
      Swal.fire({
        title: "Completed!",
        text: "Your task has been marked as done.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    },
  });

  if (isLoading) return <div className="text-center p-10">Loading...</div>;

  return (
    <div className="p-6 bg-slate-50 min-h-screen rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        My Marketing Tasks
      </h2>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {taskData.map((task) => (
          <div
            key={task._id}
            className="border p-5 rounded-lg shadow-sm bg-white flex flex-col justify-between"
          >
            <div>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">
                {task.title}
              </h3>
              <p className="text-sm text-gray-700 mb-2">{task.description}</p>
              <p className="text-xs text-gray-500">
                Priority:{" "}
                <span
                  className={`font-medium ${task.priority === "High" ? "text-red-600" : "text-blue-600"}`}
                >
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
          </div>
        ))}
      </div>

      {/* Modal - Dark Blurry Overlay and Popup */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300">
          <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md transform scale-100 opacity-100 transition-transform duration-300">
            <h3 className="text-xl font-bold mb-4 text-gray-900">
              Submit Your Work URL
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Please provide the URL where the work is complete for
              verification.
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
                onClick={() => {
                  setIsModalOpen(false);
                  setWorkUrl(""); // Cancel করলে ফিল্ড রিসেট হবে
                }}
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
