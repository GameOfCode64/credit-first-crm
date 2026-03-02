import { api } from "../lib/api";
import { Team, PerformanceData } from "../types/team.types";

/**
 * 1️⃣ Fetch team list (NO users)
 */
export const fetchTeams = async (): Promise<Team[]> => {
  const { data } = await api.get("/teams");
  return data;
};

/**
 * 2️⃣ Fetch single team with users
 */
export const fetchTeamById = async (teamId: string): Promise<Team> => {
  const { data } = await api.get(`/teams/${teamId}`);
  return data;
};

/**
 * 3️⃣ Employee performance analytics
 */
export const fetchEmployeePerformance = async (
  employeeId: string,
  range: "today" | "week" | "month",
): Promise<PerformanceData> => {
  const { data } = await api.get(`/teams/employees/${employeeId}/performance`, {
    params: { range },
  });
  return data;
};

/**
 * 4️⃣ (Future) Team-level analytics
 */
export const fetchTeamAnalytics = async (teamId: string) => {
  const { data } = await api.get(`/teams/${teamId}/analytics`);
  return data;
};
