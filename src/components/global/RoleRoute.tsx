import React from "react";
import { Navigate } from "react-router-dom";
const RoleRoute: React.FC<{ allowed: string[]; children: React.ReactNode }> = ({
  allowed,
  children,
}) => {
  const token = localStorage.getItem("accessToken");
  const role = (localStorage.getItem("role") || "").toLowerCase();

  if (!token) return <Navigate to="/" />;
  if (!allowed.map((a) => a.toLowerCase()).includes(role))
    return <Navigate to="/unauthorized" />;

  return <>{children}</>;
};

export default RoleRoute;
