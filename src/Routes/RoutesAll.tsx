
import App from "@/App";
import Login from "@/components/Authentication/Auth_Page/Login";
import Registration from "@/components/Authentication/Auth_Page/Registration";
import Reset from "@/components/Authentication/Auth_Page/Reset";
import Services from "@/components/BasicComponents/Services/Services";
import MAIN_HOME_ROUTES from "@/components/MAIN_HOME_ROUTES/MAIN_HOME_ROUTES";
import MarketingCreateCampaign from "@/components/MarketingDashboard/MarketingCreateCampaign";
import MarketingHome from "@/components/MarketingDashboard/MarketingHome";
import MarketingIndex from "@/components/MarketingDashboard/MarketingIndex";
import MarketingOnBoarding from "@/components/MarketingDashboard/MarketingOnBoarding";
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
import {Routes, Route } from "react-router";
const RoutesAll = () => {
    return <Routes>
              <Route path="/" element={<App />}>
                <Route index element={<MAIN_HOME_ROUTES />} />
                <Route path="/services" element={<Services />} />
                <Route path="/registration" element={<Registration />} />
                <Route path="/login" element={<Login />} />
                <Route path="/reset/password" element={<Reset />} />
              </Route>
              {/* sales dashboard start */}
              <Route path="/dashboard/sales" element={<SalesPrivateRoute><Sales_Home></Sales_Home></SalesPrivateRoute>} >
              <Route index element={<Sales_Index_Element />} />
              <Route path="/dashboard/sales/create-leads" element={<Sales_Create_Leads />} />
              <Route path="/dashboard/sales/all-leads" element={<Sales_My_Leads />} />
              <Route path="/dashboard/sales/meetings" element={<Sales_Meetings />} />
              <Route path="/dashboard/sales/in-progress" element={<Sales_In_Progress />} />
              <Route path="/dashboard/sales/remainder" element={<Sales_Remainder />} />
              <Route path="/dashboard/sales/qualified" element={<Sales_Qualified />} />
              <Route path="/dashboard/sales/unqualified" element={<Sales_Unqualified />} />
              </Route>
              {/* sales dashboard end */}
              {/* marketing dashboard start */}
              <Route path="/dashboard/marketing" element={<MarketingPrivateRoute><MarketingHome></MarketingHome></MarketingPrivateRoute>} >
              <Route index element={<MarketingIndex></MarketingIndex>} />
              <Route path="/dashboard/marketing/pending-signatures" element={<PendingSignature />} />
              <Route path="/dashboard/marketing/remainders-to-signatures" element={<MarketingRemainders />} />
              <Route path="/dashboard/marketing/on-boarding" element={<MarketingOnBoarding />} />
              <Route path="/dashboard/marketing/create-campaign" element={<MarketingCreateCampaign />} />
              </Route>
              {/* marketing dashboard end */}
            </Routes>
};

export default RoutesAll;