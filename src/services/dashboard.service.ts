import { api } from "../lib/api";

export const fetchManagerDashboard = async (range: string) => {
  const { data } = await api.get(`/dashboard/manager?range=${range}`);
  return data;
};
