import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchMyAttendance } from "../../../../../services/attendance.service";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../../components/ui/table";
import { Badge } from "../../../../../components/ui/badge";

export default function AttendanceHistoryTable() {
  const { data = [] } = useQuery({
    queryKey: ["attendance-history"],
    queryFn: fetchMyAttendance,
  });

  return (
    <div className="rounded-xl border bg-white p-6">
      <h3 className="font-semibold mb-1">Attendance History</h3>
      <p className="text-xs text-muted-foreground mb-4">
        Your attendance log for recent days
      </p>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Check In</TableHead>
            <TableHead>Check Out</TableHead>
            <TableHead>Hours Worked</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.map((row: any) => {
            const hours =
              row.clockOut &&
              (
                (new Date(row.clockOut).getTime() -
                  new Date(row.clockIn).getTime()) /
                3600000
              ).toFixed(2);

            return (
              <TableRow key={row.id}>
                <TableCell>{new Date(row.date).toDateString()}</TableCell>
                <TableCell>
                  {new Date(row.clockIn).toLocaleTimeString()}
                </TableCell>
                <TableCell>
                  {row.clockOut
                    ? new Date(row.clockOut).toLocaleTimeString()
                    : "-"}
                </TableCell>
                <TableCell>{hours ? `${hours} hours` : "-"}</TableCell>
                <TableCell>
                  <Badge className="bg-green-100 text-green-700">Present</Badge>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
