import { api } from "../lib/api";

export const fetchMyAttendance = async () => {
  const res = await api.get("/attendance/me");
  return res.data;
};

export const clockIn = async () => {
  const res = await api.post("/attendance/clock-in");
  return res.data;
};

export const clockOut = async () => {
  const res = await api.post("/attendance/clock-out");
  return res.data;
};
