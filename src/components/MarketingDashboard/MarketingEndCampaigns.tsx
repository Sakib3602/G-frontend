import useAxiosMarketing from "@/uri/useAxiosMarketing";
import { useUserDataMarketing } from "./HOOK/User_Data_Marketer";
import type { Campaign } from "./MarketingAllCampaign";
import { useQuery } from "@tanstack/react-query";


const MarketingEndCampaigns = () => {
      const {userData}  = useUserDataMarketing()
    
      const axiosMarketing = useAxiosMarketing()

       const {
    data: campaigns = [],
    isLoading,   
  } = useQuery<Campaign[]>({
    queryKey: ["allCampaigns", userData?._id],
    enabled: Boolean(userData?._id),
    queryFn: async () => {
      const res = await axiosMarketing.get(`/campaigns/completed-campaigns/${userData?._id}`);
      return res.data;
    },
  });
console.log("End Campaigns Data:", campaigns);
    return (
        <div>
            end campaigns
        </div>
    );
};

export default MarketingEndCampaigns;