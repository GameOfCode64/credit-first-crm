import { loginApi } from "../features/auth/api/auth.api";
import { api } from "../lib/api";

interface LoginPayload {
  email?: string; // present when user typed an email
  username?: string; // present when user typed a username
  password: string;
  role?: string;
  rememberMe?: boolean;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export const loginUser = async (payload: LoginPayload) => {
  // Use whichever identifier was provided
  const identifier = payload.email ?? payload.username ?? "";
  return loginApi(identifier, payload.password);
};

export const createUser = async (payload: CreateUserPayload) => {
  const { data } = await api.post("/auth/create", {
    ...payload,
    role: "EMPLOYEE",
  });

  return data;
};
