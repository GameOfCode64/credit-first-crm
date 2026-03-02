import { api } from "../lib/api";

export type DuplicateAction = "SKIP" | "UPDATE" | "KEEP_BOTH";

export const fetchDuplicatePreview = async (uploadId: string) => {
  const res = await api.get(`/uploads/${uploadId}/duplicates`);
  return res.data;
};

export const saveDuplicateRule = async (
  uploadId: string,
  payload: {
    field: string;
    action: DuplicateAction;
  },
) => {
  const res = await api.post(`/uploads/${uploadId}/duplicate-rules`, payload);
  return res.data;
};
