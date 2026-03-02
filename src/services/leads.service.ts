import { api } from "../lib/api";
import { LeadsResponse, FetchLeadsParams } from "../types/leads.types";

// FetchLeadsParams is imported from types — do NOT redefine it here
// It matches the backend exactly:
// search, statuses (comma-string), assignees (comma-string), campaignId, page, limit

export const fetchLeads = async (
  params: FetchLeadsParams = {},
): Promise<LeadsResponse> => {
  const res = await api.get("/leads", {
    params: {
      search: params.search,
      statuses: params.statuses, // comma-separated string e.g. "FRESH,ASSIGNED"
      assignees: params.assignees, // comma-separated employee IDs
      campaignId: params.campaignId, // single campaign ID
      page: params.page ?? 1,
      limit: params.limit ?? 100000,
    },
  });

  return res.data;
};

export const fetchEmployees = async () => {
  const res = await api.get("/users/employees");
  return res.data;
};

export const assignLeads = async (payload: {
  leadIds: string[];
  employeeIds: string[];
}) => {
  const res = await api.post("/leads/reassign", payload);
  return res.data;
};
