"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarIcon, Download } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

import { api } from "@/lib/api";

const AttendanceExportCard = () => {
  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>();
  const [employeeId, setEmployeeId] = useState<string>("all");
  const [formatType, setFormatType] = useState<string>("excel");
  const [loading, setLoading] = useState(false);

  /* ================= FETCH EMPLOYEES ================= */

  const { data: employees } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => (await api.get("/users/employees")).data,
  });

  /* ================= EXPORT HANDLER ================= */

  const handleExport = async () => {
    if (!fromDate || !toDate) return;

    try {
      setLoading(true);

      const res = await api.post(
        "/reports/attendance/export",
        {
          from: format(fromDate, "yyyy-MM-dd"),
          to: format(toDate, "yyyy-MM-dd"),
          employeeIds: employeeId === "all" ? [] : [employeeId],
        },
        {
          responseType: "blob",
        },
      );

      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `attendance-${format(
        fromDate,
        "yyyyMMdd",
      )}-${format(toDate, "yyyyMMdd")}.xlsx`;

      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed", error);
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */

  return (
    <Card className="shadow-sm border">
      <CardHeader>
        <CardTitle className="text-lg">Export Attendance</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* DATE RANGE */}
        <div className="grid grid-cols-2 gap-4">
          {/* FROM */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="justify-between">
                {fromDate ? format(fromDate, "PPP") : "From Date"}
                <CalendarIcon className="ml-2 h-4 w-4 opacity-60" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={fromDate}
                onSelect={setFromDate}
              />
            </PopoverContent>
          </Popover>

          {/* TO */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="justify-between">
                {toDate ? format(toDate, "PPP") : "To Date"}
                <CalendarIcon className="ml-2 h-4 w-4 opacity-60" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={toDate} onSelect={setToDate} />
            </PopoverContent>
          </Popover>
        </div>

        {/* EMPLOYEE SELECT */}
        <div>
          <Select value={employeeId} onValueChange={setEmployeeId}>
            <SelectTrigger>
              <SelectValue placeholder="Select Employee" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">All Employees</SelectItem>
              {employees?.map((emp: any) => (
                <SelectItem key={emp.id} value={emp.id}>
                  {emp.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* FORMAT SELECT */}
        <div>
          <Select value={formatType} onValueChange={setFormatType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="excel">Excel (.xlsx)</SelectItem>
              <SelectItem value="csv">CSV (.csv)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* EXPORT BUTTON */}
        <Button
          onClick={handleExport}
          disabled={!fromDate || !toDate || loading}
          className=" bg-[#b98b08] hover:bg-[#a47a07] flex gap-2"
        >
          <Download className="h-4 w-4" />
          {loading ? "Exporting..." : "Export Attendance"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AttendanceExportCard;
