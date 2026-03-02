import React from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./features/pages/auth/LoginPage";
import RoleRoute from "./components/global/RoleRoute";
import Unauthorized from "./components/global/Unauthorized";
import EmployeeLayout from "./features/layouts/EmployeeLayout";
import AdminLayout from "./features/layouts/AdminLayout";
import ManagerLayout from "./features/layouts/ManagerLayout";
import ManagerDashboard from "./features/pages/manager/dashboard/page";
import ManagerLeadsPage from "./features/pages/manager/leads/ViewLeadsPage";
import UploadLeadsPage from "./features/pages/manager/uploads/UploadsLeads";
import SealsPipeline from "./features/pages/manager/pipeline/page";
import SalesForm from "./features/pages/manager/form/page";
import ManagerReports from "./features/pages/manager/reports/page";
import ManagerLeaderboard from "./features/pages/manager/leaderboard/page";
import AssignLeadsPage from "./features/pages/manager/campaign-dashboard/[id]/page";
import ShowCallingDataDashboard from "./features/pages/employee/dashboard/page";
import EmployeeLeaderboard from "./features/pages/employee/leaderboard/page";
import EmployeeAttendance from "./features/pages/employee/attendance/page";
import CampaignLeadIdPage from "./features/pages/manager/leads/[id]/CampaignLeadIdPage";
import ManagerIntegrations from "./features/pages/manager/integrations/page";
import ViewAllCampaignReport from "./features/pages/manager/campaign-dashboard/page";
import CampaignDashboardPage from "./features/pages/manager/campaign-dashboard/[id]/page";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route
          path="/admin/*"
          element={
            <RoleRoute allowed={["admin"]}>
              <AdminLayout />
            </RoleRoute>
          }
        >
          {/*  */}
        </Route>

        <Route
          path="/manager/*"
          element={
            <RoleRoute allowed={["manager", "admin"]}>
              <ManagerLayout />
            </RoleRoute>
          }
        >
          {/*  */}
          <Route path="dashboard" element={<ManagerDashboard />} />
          <Route path="leads" element={<ManagerLeadsPage />} />
          <Route path="leads/:id" element={<CampaignLeadIdPage />} />
          <Route path="uploads" element={<UploadLeadsPage />} />
          <Route path="pipeline" element={<SealsPipeline />} />
          <Route path="form" element={<SalesForm />} />
          <Route path="reports" element={<ManagerReports />} />
          <Route path="leaderboard" element={<ManagerLeaderboard />} />
          <Route
            path="campaign-dashboard/"
            element={<ViewAllCampaignReport />}
          />
          <Route
            path="campaign-dashboard/:id"
            element={<CampaignDashboardPage />}
          />
          <Route path="integrations" element={<ManagerIntegrations />} />
        </Route>

        <Route
          path="/employee/*"
          element={
            <RoleRoute allowed={["employee", "manager", "admin"]}>
              <EmployeeLayout />
            </RoleRoute>
          }
        >
          {/*  */}
          <Route path="dashboard" element={<ShowCallingDataDashboard />} />
          <Route path="attendance" element={<EmployeeAttendance />} />
          <Route path="leaderboard" element={<EmployeeLeaderboard />} />
        </Route>
      </Routes>
    </Router>
  );
}
