import React from "react";
import { AppSidebar } from "../../components/global/AppSidebar";
import Topbar from "../../components/global/Topbar";
import { Toaster } from "react-hot-toast";

import { Outlet } from "react-router-dom";

const ManagerLayout = () => {
  return (
    <div className="flex h-screen w-full">
      {/* FIXED SIDEBAR */}
      <div className="h-screen shrink-0">
        <AppSidebar role="manager" />
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

export default ManagerLayout;
