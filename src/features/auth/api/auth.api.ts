import { api } from "@/lib/api";

export const loginApi = async (identifier: string, password: string) => {
  const isEmail = identifier.includes("@");

  const payload = isEmail
    ? { email: identifier, password }
    : { username: identifier, password };

  const res = await api.post("/auth/login", payload);
  return res.data;
};
