import App from "@/App";
import Login from "@/components/Authentication/Auth_Page/Login";
import Registration from "@/components/Authentication/Auth_Page/Registration";
import Reset from "@/components/Authentication/Auth_Page/Reset";
import Services from "@/components/BasicComponents/Services/Services";
import DesignerHome from "@/components/DesignerDashboard/DesignerHome";
import DesignerMyTasks from "@/components/DesignerDashboard/DesignerMyTasks";
import DesignerOverDueTasks from "@/components/DesignerDashboard/DesignerOverDueTasks";
import DesignerPrivate from "@/components/DesignerDashboard/DesignerPrivate";
import MAIN_HOME_ROUTES from "@/components/MAIN_HOME_ROUTES/MAIN_HOME_ROUTES";
import MarketingAddTask from "@/components/MarketingDashboard/MarketingAddTask";
import MarketingAllCampaign from "@/components/MarketingDashboard/MarketingAllCampaign";
import MarketingCompleteTasks from "@/components/MarketingDashboard/MarketingCompleteTasks";
import MarketingCreateCampaign from "@/components/MarketingDashboard/MarketingCreateCampaign";
import MarketingEndCampaigns from "@/components/MarketingDashboard/MarketingEndCampaigns";
import MarketingHome from "@/components/MarketingDashboard/MarketingHome";
import MarketingIndex from "@/components/MarketingDashboard/MarketingIndex";
import MarketingPendingTask from "@/components/MarketingDashboard/MarketingPendingTask";
import MarketingPrivateRoute from "@/components/MarketingDashboard/MarketingPrivateRoute";
import MarketingRemainders from "@/components/MarketingDashboard/MarketingRemainders";
import PendingSignature from "@/components/MarketingDashboard/PendingSignature";
import Sales_Create_Leads from "@/components/SalesDashboard/Sales_Create_Leads";
import Sales_Home from "@/components/SalesDashboard/Sales_Home";
import Sales_In_Progress from "@/components/SalesDashboard/Sales_In_Progress";
import Sales_Index_Element from "@/components/SalesDashboard/Sales_Index_Element";
import Sales_Meetings from "@/components/SalesDashboard/Sales_Meetings";
import Sales_My_Leads from "@/components/SalesDashboard/Sales_My_Leads";
import Sales_Qualified from "@/components/SalesDashboard/Sales_Qualified";
import Sales_Remainder from "@/components/SalesDashboard/Sales_Remainder";
import Sales_Unqualified from "@/components/SalesDashboard/Sales_Unqualified";
import SalesPrivateRoute from "@/components/SalesDashboard/SalesPrivateRoute";
import { Routes, Route } from "react-router";
import DesignerRunningWorks from "@/components/DesignerDashboard/DesignerRunningWorks";
import AdminHome from "@/components/AdminDashboard/AdminHome";
import Sales_AssignedTask from "@/components/SalesDashboard/Sales_AssignedTask";
import DesignerIndex from "@/components/DesignerDashboard/DesignerIndex";
import Whatsapp from "@/components/SalesDashboard/WhatsApp";
import Sales_Emails from "@/components/SalesDashboard/Sales_Emails";
import ContentCalenderClient from "@/components/MarketingDashboard/ContentCalenderClient";
import ContentCalMain from "@/components/MarketingDashboard/ContentCalMain";
import DesignerMyTasksContent from "@/components/DesignerDashboard/DesignerMyTasksContent";
import AdminIndex from "@/components/AdminDashboard/AdminIndex";
import AdminPrivate from "@/components/AdminDashboard/AdminPrivate";
import AdminEmployee from "@/components/AdminDashboard/AdminEmployee";
import AdminContentCalenderClient from "@/components/AdminDashboard/AdminContentCalenderClient";
import AdminContentCalMain from "@/components/AdminDashboard/AdminContentCalMain";
import AdminDelayWorks from "@/components/AdminDashboard/AdminDelayWorks";
import AdminEmReports from "@/components/AdminDashboard/AdminEmReports";
import AdminCampaigns from "@/components/AdminDashboard/AdminCampaigns";
import AdminAddTask from "@/components/AdminDashboard/AdminAddTask";
import AdminMarketing from "@/components/AdminDashboard/AdminMarketing";
import AdminMarketingDetails from "@/components/AdminDashboard/AdminMarketingDetails";
import TaskAD from "@/components/MarketingDashboard/TaskAD";
import SalesTaskAD from "@/components/SalesDashboard/SalesTaskAD";
import AdminSalesDept from "@/components/AdminDashboard/AdminSalesDept";
import AdminSalesDetails from "@/components/AdminDashboard/AdminSalesDetails";
import AdminVIewLeads from "@/components/AdminDashboard/AdminVIewLeads";
import AdminViewMeetings from "@/components/AdminDashboard/AdminViewMeetings";
import SubmitCompliance from "@/components/Compliance/SubmitCompliance";
import ViewCompliance from "@/components/Compliance/ViewCompliance";
import ClientCalendarView from "@/components/PublicClient/ClientCalendarView";
import NotFound from "@/components/BasicComponents/notFound/NotFound";
import AdminPendingAssignments from "@/components/AdminDashboard/AdminPendingAssignments";
import TeamInProgressLeads from "@/components/Common/TeamInProgressLeads";
import DesignerTeamInProgress from "@/components/DesignerDashboard/DesignerTeamInProgress";
import TeamAssignedLeads from "@/components/Common/TeamAssignedLeads";
import DesignerAssignedLeads from "@/components/DesignerDashboard/DesignerAssignedLeads";
import AdminMissingFollowups from "@/components/AdminDashboard/AdminMissingFollowups";
import AdminLeadTransfers from "@/components/AdminDashboard/AdminLeadTransfers";

const RoutesAll = () => {
  return (
    <Routes>
      <Route path="/" element={<App />}>
        <Route index element={<MAIN_HOME_ROUTES />} />
        <Route path="/services" element={<Services />} />
        <Route path="/registration" element={<Registration />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset/password" element={<Reset />} />
        <Route path="/view/calendar/:token" element={<ClientCalendarView />} />
      </Route>
      {/* sales dashboard start */}
      <Route
        path="/dashboard/sales"
        element={
          <SalesPrivateRoute>
            <Sales_Home></Sales_Home>
          </SalesPrivateRoute>
        }
      >
        <Route index element={<Sales_Index_Element />} />
        <Route
          path="/dashboard/sales/create-leads"
          element={<Sales_Create_Leads />}
        />
        <Route path="/dashboard/sales/all-leads" element={<Sales_My_Leads />} />
        <Route path="/dashboard/sales/meetings" element={<Sales_Meetings />} />
        <Route
          path="/dashboard/sales/in-progress"
          element={<Sales_In_Progress />}
        />
        <Route
          path="/dashboard/sales/remainder"
          element={<Sales_Remainder />}
        />
        <Route
          path="/dashboard/sales/qualified"
          element={<Sales_Qualified />}
        />
        <Route
          path="/dashboard/sales/unqualified"
          element={<Sales_Unqualified />}
        />
        <Route
          path="/dashboard/sales/assigned"
          element={<Sales_AssignedTask />}
        />
        <Route path="/dashboard/sales/whatsapp" element={<Whatsapp />} />
        <Route path="/dashboard/sales/emails" element={<Sales_Emails />} />
        <Route path="/dashboard/sales/tasks" element={<SalesTaskAD />} />
        <Route
          path="/dashboard/sales/complaints"
          element={<SubmitCompliance />}
        />
      </Route>
      {/* sales dashboard end */}
      {/* marketing dashboard start */}
      <Route
        path="/dashboard/marketing"
        element={
          <MarketingPrivateRoute>
            <MarketingHome></MarketingHome>
          </MarketingPrivateRoute>
        }
      >
        <Route index element={<MarketingIndex></MarketingIndex>} />
        <Route
          path="/dashboard/marketing/pending-signatures"
          element={<PendingSignature />}
        />
        <Route
          path="/dashboard/marketing/remainders-to-signatures"
          element={<MarketingRemainders />}
        />
        <Route
          path="/dashboard/marketing/in-progress"
          element={
            <TeamInProgressLeads title="Marketing — In Progress Leads" />
          }
        />

        <Route
          path="/dashboard/marketing/create-campaign"
          element={<MarketingCreateCampaign />}
        />
        <Route
          path="/dashboard/marketing/all-campaigns"
          element={<MarketingAllCampaign />}
        />
        <Route
          path="/dashboard/marketing/end-campaigns"
          element={<MarketingEndCampaigns />}
        />
        <Route
          path="/dashboard/marketing/add-task"
          element={<MarketingAddTask />}
        />
        <Route
          path="/dashboard/marketing/my-assigned-leads"
          element={<TeamAssignedLeads title="My Assigned Leads (Marketing)" />}
        />
        <Route
          path="/dashboard/marketing/assigned-tasks"
          element={<MarketingPendingTask />}
        />
        <Route
          path="/dashboard/marketing/complete-tasks"
          element={<MarketingCompleteTasks />}
        />
        <Route
          path="/dashboard/marketing/content-calendar"
          element={<ContentCalenderClient />}
        />
        <Route
          path="/dashboard/marketing/content-calendar-main/:id"
          element={<ContentCalMain />}
        />
        <Route path="/dashboard/marketing/tasks" element={<TaskAD />} />
        <Route path="/dashboard/marketing/tasks" element={<TaskAD />} />
        <Route
          path="/dashboard/marketing/compliance"
          element={<SubmitCompliance />}
        />
      </Route>
      {/* marketing dashboard end */}
      {/* designer dashboard start */}
      <Route
        path="/dashboard/designer"
        element={
          <DesignerPrivate>
            <DesignerHome></DesignerHome>
          </DesignerPrivate>
        }
      >
        <Route index element={<DesignerIndex />} />
        <Route
          path="/dashboard/designer/my-tasks"
          element={<DesignerMyTasks />}
        />
        <Route
          path="/dashboard/designer/in-progress-tasks"
          element={<DesignerRunningWorks />}
        />
        <Route
          path="/dashboard/designer/assigned-leads"
          element={<DesignerAssignedLeads />}
        />
        <Route
          path="/dashboard/designer/in-progress"
          element={<DesignerTeamInProgress />}
        />
        <Route
          path="/dashboard/designer/overdue-tasks"
          element={<DesignerOverDueTasks />}
        />
        <Route
          path="/dashboard/designer/content-tasks"
          element={<DesignerMyTasksContent />}
        />
        <Route
          path="/dashboard/designer/compliance"
          element={<SubmitCompliance />}
        />
      </Route>
      {/* designer dashboard end */}
      {/* Admin dashboard start */}

      <Route
        path="/dashboard/admin"
        element={
          <AdminPrivate>
            <AdminHome></AdminHome>
          </AdminPrivate>
        }
      >
        <Route index element={<AdminIndex />} />
        <Route path="/dashboard/admin/employees" element={<AdminEmployee />} />
        <Route
          path="/dashboard/admin/content-calendar"
          element={<AdminContentCalenderClient />}
        />
        <Route
          path="/dashboard/admin/content-calendar/:id"
          element={<AdminContentCalMain />}
        />
        <Route
          path="/dashboard/admin/delay-works"
          element={<AdminDelayWorks />}
        />
        <Route
          path="/dashboard/admin/em-reports"
          element={<AdminEmReports />}
        />
        <Route path="/dashboard/admin/campaigns" element={<AdminCampaigns />} />
        <Route path="/dashboard/admin/marketing" element={<AdminMarketing />} />
        <Route
          path="/dashboard/admin/marketing/:id"
          element={<AdminMarketingDetails />}
        />
        <Route path="/dashboard/admin/add-task" element={<AdminAddTask />} />
        <Route path="/dashboard/admin/sales" element={<AdminSalesDept />} />
        <Route
          path="/dashboard/admin/sales/:id"
          element={<AdminSalesDetails />}
        />
        <Route
          path="/dashboard/admin/leads/:id/view"
          element={<AdminVIewLeads />}
        />
        <Route
          path="/dashboard/admin/meetings/:id/view"
          element={<AdminViewMeetings />}
        />
        <Route
          path="/dashboard/admin/compliance"
          element={<ViewCompliance />}
        />
        <Route
          path="pending-assignments"
          element={<AdminPendingAssignments />}
        />
        <Route
          path="/dashboard/admin/missed-followups/:id/view"
          element={<AdminMissingFollowups />}
        />
        <Route path="lead-transfers" element={<AdminLeadTransfers />} />
       
      </Route>

      {/* Admin dashboard end */}

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default RoutesAll;
