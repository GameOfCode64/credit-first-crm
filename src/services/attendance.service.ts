import { api } from "../lib/api";

export interface AttendanceRecord {
  id: string;
  date: string;
  clockIn: string | null;
  clockOut: string | null;
}

export interface TodayAttendance {
  id?: string;
  date?: string;
  clockIn: string | null;
  clockOut: string | null;
}

/** GET /users/me/attendance — today's record only */
export const fetchMyAttendance = async (): Promise<TodayAttendance> => {
  const res = await api.get("/users/me/attendance");
  return res.data;
};

/** GET /users/me/attendance/history — last 30 days */
export const fetchMyAttendanceHistory = async (): Promise<
  AttendanceRecord[]
> => {
  const res = await api.get("/users/me/attendance/history");
  return res.data;
};

/** POST /users/me/clock-in */
export const clockIn = async (): Promise<AttendanceRecord> => {
  const res = await api.post("/users/me/clock-in");
  return res.data;
};

/** POST /users/me/clock-out */
export const clockOut = async (): Promise<AttendanceRecord> => {
  const res = await api.post("/users/me/clock-out");
  return res.data;
};
