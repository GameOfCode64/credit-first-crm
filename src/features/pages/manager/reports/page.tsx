import React from "react";
import AttendanceExportCard from "./_components/AttendanceExportCard";
import LeadExportCard from "./_components/LeadExportCard";

const ManagerReports = () => {
  return (
    <div className="flex flex-col space-y-3.5 px-6 py-8 space-x-8">
      <div className="flex flex-col">
        <h3 className="text-lg font-bold">Download Reports</h3>
        <p className=" font-semibold text-gray-500">
          Download Antecedence & Leads Reports
        </p>
      </div>
      <AttendanceExportCard />
      <LeadExportCard />
    </div>
  );
};

export default ManagerReports;
