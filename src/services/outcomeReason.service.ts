import { api } from "../lib/api";

export const fetchOutcomeReasons = async () => {
  const res = await api.get("/leads/outcome-reasons");
  return res.data;
};

export const createOutcomeReason = async (payload: {
  outcome: string;
  label: string;
}) => {
  return api.post("/leads/outcome-reasons", payload);
};

export const updateOutcomeReason = async (
  id: string,
  payload: { label?: string; isActive?: boolean },
) => {
  return api.patch(`/leads/outcome-reasons/${id}`, payload);
};
