import { api } from "../lib/api";

/**
 * Fetch all employees
 */
export const fetchEmployees = async () => {
  const res = await api.get("/users/employees");
  return res.data;
};

/**
 * Fetch all users
 */
export const fetchUsers = async () => {
  const res = await api.get("/users");
  return res.data;
};
