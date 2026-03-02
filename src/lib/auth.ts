export type User = {
  id: string;
  role: "ADMIN" | "MANAGER" | "EMPLOYEE";
  name?: string;
};

export const getUserFromToken = (): User | null => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return {
      id: payload.id,
      role: payload.role,
      name: payload.name,
    };
  } catch {
    return null;
  }
};

export const logout = () => {
  localStorage.removeItem("token");
  window.location.href = "/login";
};
