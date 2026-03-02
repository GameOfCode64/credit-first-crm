import { api } from "../lib/api";

export const fetchLeaderboard = async (range: "today" | "week" | "month") => {
  const res = await api.get(`/leaderboard/${range}`);
  return res.data;
};
