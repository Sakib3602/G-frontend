import TeamAssignedLeads from "@/components/Common/TeamAssignedLeads";
import { useUserDataDesigner } from "./HOOK/user_data_designer";

export default function DesignerAssignedLeads() {
  const { userData } = useUserDataDesigner();
  const title = userData?.role === "web" ? "My Assigned Leads (Web)" : "My Assigned Leads (Design)";
  return <TeamAssignedLeads title={title} />;
}