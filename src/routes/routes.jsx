import { Outlet } from "react-router-dom";

export const ProtectedLayout = () => {
  return <Outlet />;
};

export const AuthProtectedLayout = () => {
  return <Outlet />;
};