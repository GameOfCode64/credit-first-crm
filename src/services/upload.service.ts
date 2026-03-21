import { api } from "../lib/api";

export type DuplicateAction = "SKIP" | "UPDATE" | "KEEP_BOTH";

/* ================= TYPES ================= */

export interface UploadSession {
  id: string;
  fileName: string;
  status: string;
  headers?: string[];
  sampleRows?: Record<string, any>[];
  sheets?: string[]; // sheet names returned for multi-sheet Excel files
  stats?: {
    totalRows: number;
    duplicateCount: number;
    uniqueCount: number;
  };
  duplicateRule?: { action: string };
}

/* ================= UPLOAD FLOW ================= */

export const createUpload = async (file: File): Promise<UploadSession> => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await api.post("/uploads", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
};

export const getUploadSession = async (id: string): Promise<UploadSession> => {
  const res = await api.get(`/uploads/${id}`);
  return res.data;
};

// POST /uploads/:id/select-sheet
// Called when user picks a sheet from a multi-sheet Excel file.
// Backend re-parses the file using only that sheet and updates
// headers + sampleRows on the UploadSession.
export const selectSheet = async (
  id: string,
  sheetName: string,
): Promise<UploadSession> => {
  const res = await api.post(`/uploads/${id}/select-sheet`, { sheetName });
  return res.data;
};

export const saveMappings = async (
  id: string,
  mappings: { excelColumn: string; targetField: string }[],
) => {
  const res = await api.post(`/uploads/${id}/mappings`, { mappings });
  return res.data;
};

export const saveDuplicateRules = async (
  id: string,
  payload: { field: string; action: DuplicateAction },
) => {
  const res = await api.post(`/uploads/${id}/duplicates`, payload);
  return res.data;
};

export const assignCampaign = async (
  id: string,
  payload:
    | { type: "existing"; campaignId: string }
    | { type: "new"; name: string },
) => {
  const res = await api.post(`/uploads/${id}/campaign`, payload);
  return res.data;
};

export const confirmUpload = async (id: string) => {
  const res = await api.post(`/uploads/${id}/confirm`);
  return res.data;
};
