import { useUserDataDesigner } from "./HOOK/user_data_designer";
import TeamInProgressLeads from "@/components/Common/TeamInProgressLeads";


export default function DesignerTeamInProgress() {
  const { userData } = useUserDataDesigner();

  const title =
    userData?.role === "web" ? "Web — In Progress Leads" : "Design — In Progress Leads";
  const subtitle =
    userData?.role === "web"
      ? "Leads currently in progress that need Web/Software service."
      : "Leads currently in progress that need Graphic/Design service.";

  return <TeamInProgressLeads title={title} subtitle={subtitle} />;
}