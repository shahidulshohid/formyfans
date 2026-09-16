import { Navigate, Outlet, useLocation } from "react-router-dom";
import useUserStore from "../zustand/userUserStore";

export const ProtectedLayout = () => {
  const user = useUserStore((state) => state.user);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (user.moveToSubscription && location.pathname !== "/subscription-plans") {
    return <Navigate to="/subscription-plans" replace />;
  }

  return <Outlet />;
};

export const AuthProtectedLayout = () => {
  const user = useUserStore((state) => state.user);

  if (user) {
    return (
      <Navigate
        to={user.moveToSubscription ? "/subscription-plans" : "/home"}
        replace
      />
    );
  }

  return <Outlet />;
};