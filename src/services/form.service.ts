import { api } from "../lib/api";
import { FormField } from "../types/form.type";

export const fetchActiveForm = async () => {
  const res = await api.get("/forms/active");
  return res.data;
};

export const saveForm = async (payload: {
  name: string;
  description?: string;
  schema: FormField[];
}) => {
  const res = await api.post("/forms", payload);
  return res.data;
};

export const fetchFormResponse = async (leadId: string) => {
  const { data } = await api.get(`/forms/response/${leadId}`);
  return data;
};

export const saveFormResponse = async (leadId: string, payload: unknown) => {
  const { data } = await api.post(`/forms/response/${leadId}`, payload);
  return data;
};
