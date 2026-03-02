import { api } from "../lib/api";

export const completeLead = async (payload: {
  leadId: string;
  outcomeId: string;
  outcomeReasonId?: string;
  remark?: string;
  formValues: Record<string, unknown>;
}) => {
  const { data } = await api.post(`/leads/${payload.leadId}/complete`, {
    outcomeId: payload.outcomeId,
    outcomeReasonId: payload.outcomeReasonId,
    remark: payload.remark,
    formValues: payload.formValues,
  });
  return data;
};
