import useAxiosMarketing from "@/uri/useAxiosMarketing";
import { useQuery } from "@tanstack/react-query";
import { useUserData } from "../SalesDashboard/Sales_Hook/User_Data";


const MarketingOnBoarding = () => {
    const {userData} = useUserData();
    const axiosMarketing = useAxiosMarketing();

    const {data: data = []} = useQuery({
        queryKey: ["all-onboarding-data", userData?._id],
        queryFn: async()=>{
            const res = await axiosMarketing.get(`/all-onboarding-leads/${userData?._id}`);
            return res.data;
        }
    })
    console.log("onBoarding data : ",data);

    // const {data}
    return (
        <div>
            on boarding element
        </div>
    );
};

export default MarketingOnBoarding;