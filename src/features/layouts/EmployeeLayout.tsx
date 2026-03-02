import React from "react";
import { Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AppSidebar } from "../../components/global/AppSidebar";
import Topbar from "../../components/global/Topbar";

const EmployeeLayout: React.FC<{ children?: React.ReactNode }> = () => {
  return (
    <div className="flex h-screen w-full">
      {/* FIXED SIDEBAR */}
      <div className="h-screen shrink-0">
        <AppSidebar role="employee" />
      </div>

      {/* CONTENT AREA */}
      <div className="flex flex-1 flex-col">
        <Topbar />

        {/* ONLY THIS SCROLLS */}
        <main className="flex-1 overflow-y-auto bg-[#fafafa]">
          <Toaster position="top-center" reverseOrder={false} />
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default EmployeeLayout;
