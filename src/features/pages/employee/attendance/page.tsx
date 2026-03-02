import React from "react";
import AttendanceCalendarCard from "./_components/AttendanceCalendarCard";
import AttendanceHistoryTable from "./_components/AttendanceHistoryTable";
import TodayAttendanceCard from "./_components/TodayAttendanceCard";

const EmployeeAttendance = () => {
  return (
    <div className="px-6 py-8 space-y-3.5">
      <div className="flex flex-col">
        <h1 className="text-xl font-bold">Attendance</h1>
        <p className="text-sm text-gray-500">
          Track your daily check-in and check-out
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TodayAttendanceCard />
        <AttendanceCalendarCard />
      </div>
      <AttendanceHistoryTable />
    </div>
  );
};

export default EmployeeAttendance;
