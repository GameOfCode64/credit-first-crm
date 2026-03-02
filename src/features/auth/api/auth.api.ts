import { api } from "../../../lib/api";

export const loginApi = async (email: string, password: string) => {
  const res = await api.post("/auth/login", { email, password });
  return res.data;
};
