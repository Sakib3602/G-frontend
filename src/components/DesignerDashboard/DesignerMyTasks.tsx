import { useQuery } from "@tanstack/react-query";
import { useUserDataDesigner } from "./HOOK/user_data_designer";
import useAxiosDesigner from "@/uri/useAxiosDesigner";


const DesignerMyTasks = () => {
    const axiosDesigner = useAxiosDesigner();
    
     const { userData } = useUserDataDesigner();
     const {data : myTasks = []} = useQuery({
        queryKey: ["designer-tasks-individual", userData?._id],
        queryFn: async ()=>{
            const res = await axiosDesigner.get(`/api/v1/marketing/tasks/designer/my-tasks/${userData?._id}`);
            return res.data;
        }
     })
     console.log("My Tasks:", myTasks);
    return (
        <div>
            my tasks
        </div>
    );
};

export default DesignerMyTasks;