import { api } from "../lib/api";

/**
 * Fetch all leads assigned to logged-in employee
 */
export const fetchMyLeads = async () => {
  const res = await api.get("/leads/my");
  return res.data;
};

/**
 * Fetch single lead with activities
 */
export const fetchLeadById = async (leadId: string) => {
  if (!leadId) {
    throw new Error("leadId is required");
  }

  const { data } = await api.get(`/leads/${leadId}`);
  return data;
};

/**
 * Change lead status (NO call)
 * --------------------------------
 * Used when:
 * - Lead is opened first time
 * - Manual status updates
 */
export const changeLeadStatus = async (
  leadId: string,
  payload: {
    status: string;
    remark?: string;
  },
) => {
  if (!leadId) {
    throw new Error("leadId is required to change status");
  }

  if (!payload?.status) {
    throw new Error("status is required");
  }

  const body = {
    status: payload.status,
    remark: payload.remark?.trim() || null,
  };

  const { data } = await api.post(`/leads/${leadId}/status`, body);
  return data;
};

/**
 * Log a CALL activity
 * --------------------------------
 * HARD RULE:
 * - outcomeId is REQUIRED
 * - reason + remark are optional
 */
export const logCall = async (
  leadId: string,
  payload: {
    outcomeId?: string;
    outcomeReasonId?: string;
    remark?: string;
  },
) => {
  if (!leadId) {
    throw new Error("leadId is required to log call");
  }

  if (!payload?.outcomeId) {
    throw new Error("Call outcome is required");
  }

  const body = {
    outcomeId: payload.outcomeId,
    outcomeReasonId: payload.outcomeReasonId ?? null,
    remark: payload.remark?.trim() || null,
  };

  const { data } = await api.post(`/leads/${leadId}/call`, body);
  return data;
};
