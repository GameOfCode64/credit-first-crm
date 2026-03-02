import { api } from "../lib/api";

export const exportLeadsExcel = async (payload: {
  from: string;
  to: string;
  outcomeNames: string[];
}) => {
  const res = await api.post("/reports/leads/export", payload, {
    responseType: "blob",
  });

  return res.data;
};

export const exportAttendanceExcel = async (payload: {
  from: string;
  to: string;
}) => {
  const res = await api.post("/reports/attendance/export", payload, {
    responseType: "blob",
  });
  return res.data;
};
