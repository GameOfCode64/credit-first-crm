import { exportLeadsExcel } from "../services/reports.service";

export const downloadExcel = async (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
};

export const exportLeads = async (payload: {
  from: string;
  to: string;
  outcomeNames: string[];
}) => {
  const blob = await exportLeadsExcel(payload);
  await downloadExcel(blob, `leads_${payload.from}_to_${payload.to}.xlsx`);
};
