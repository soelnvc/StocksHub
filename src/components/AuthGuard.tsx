import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSession } from "@/contexts/SessionContext";

const AuthGuard: React.FC = () => {
  const { session, isLoading } = useSession();

  if (isLoading) {
    return <div>Loading authentication...</div>; // Or a spinner component
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default AuthGuard;