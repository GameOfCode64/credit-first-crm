import { loginApi } from "../features/auth/api/auth.api";
import { api } from "../lib/api";

interface LoginPayload {
  email: string;
  password: string;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export const loginUser = async (payload: LoginPayload) => {
  return loginApi(payload.email, payload.password);
};

export const createUser = async (payload: CreateUserPayload) => {
  const { data } = await api.post("/auth/create", {
    ...payload,
    role: "EMPLOYEE",
  });

  return data;
};
