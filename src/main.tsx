import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter, Routes, Route } from "react-router";
import MAIN_HOME_ROUTES from "./components/MAIN_HOME_ROUTES/MAIN_HOME_ROUTES.tsx";
import Services from "./components/BasicComponents/Services/Services.tsx";
import Registration from "./components/Authentication/Auth_Page/Registration.tsx";
import Login from "./components/Authentication/Auth_Page/Login.tsx";
import Reset from "./components/Authentication/Auth_Page/Reset.tsx";
import AuthProvider from "./components/Authentication/AuthProvider/AuthProvider.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Sales_Home from "./components/SalesDashboard/Sales_Home.tsx";
import Sales_Index_Element from "./components/SalesDashboard/Sales_Index_Element.tsx";
import Sales_Create_Leads from "./components/SalesDashboard/Sales_Create_Leads.tsx";
import Sales_My_Leads from "./components/SalesDashboard/Sales_My_Leads.tsx";
import Sales_Meetings from "./components/SalesDashboard/Sales_Meetings.tsx";
import Sales_In_Progress from "./components/SalesDashboard/Sales_In_Progress.tsx";
import SalesPrivateRoute from "./../src/components/SalesDashboard/SalesPrivateRoute.tsx"
import Sales_Remainder from "./components/SalesDashboard/Sales_Remainder.tsx";





const queryClient = new QueryClient();
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Routes>
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
          
          
          </Route>
          {/* sales dashboard end */}
        </Routes>
      </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
);
