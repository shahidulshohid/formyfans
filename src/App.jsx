import { useContext, useEffect } from "react";
import { Route, BrowserRouter as Router, Routes, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import { SocketContext } from "./context/SocketContext";
import { APP_LAYOUT, AUTH_LAYOUT } from "./routes";
import { AuthProtectedLayout, ProtectedLayout } from "./routes/routes";
import { InterestDialog, ProfileIncompleteDialog } from "./components/dialogs";
import useConversationStore from "./zustand/conversationStore";
import useUserStore from "./zustand/userUserStore";
import { syncUserFromServer } from "./utils/syncUser";
import { PATH_BASENAME } from "./constants/common";
import useNotificationStore from "./zustand/notificationStore";

function AppContent() {
  const navigate = useNavigate();
  const socket = useContext(SocketContext);
  const { user, token, clearUserData } = useUserStore();
  const { fetchNotifications } = useNotificationStore();
  const {
    addNewConversation,
    resetUnreadMessagesCount,
    updateConversation,
    fetchConversations,
  } = useConversationStore();

  useEffect(() => {
    if (token) {
      syncUserFromServer();
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchConversations();
    }
  }, [user]);

  // Force logout via Socket.IO
  useEffect(() => {
    if (socket && user) {
      const handleForceLogout = (data) => {
        toast.error(data?.message || "Your session has been terminated");
        clearUserData();
        navigate("/", { replace: true });
      };

      socket.on("force_logout", handleForceLogout);
      return () => {
        socket.off("force_logout", handleForceLogout);
      };
    }
  }, [user, socket, navigate, clearUserData]);


  useEffect(() => {
    if (!user?.isAdminCreator || !user?.freeMonthsExpireAt) return;

    const expiresAt = new Date(user.freeMonthsExpireAt).getTime();
    const MAX_TIMEOUT_MS = 2147483647;
    let timerId;

    const scheduleCheck = () => {
      const msUntilExpiry = expiresAt - Date.now();
      if (msUntilExpiry <= 0) {
        toast.error("Your free access has expired");
        clearUserData();
        navigate("/", { replace: true });
        return;
      }
      timerId = setTimeout(scheduleCheck, Math.min(msUntilExpiry, MAX_TIMEOUT_MS));
    };

    scheduleCheck();
    return () => clearTimeout(timerId);
  }, [user?.isAdminCreator, user?.freeMonthsExpireAt, navigate, clearUserData]);

  useEffect(() => {
    if (socket && user) {
      socket.emit("user_connected", { userId: user?._id });

      const handleEmitNewConversation = (data) => {
        addNewConversation(data);
      };

      const handleEmitUpdateConversation = (data) => {
        updateConversation(data);
      };

      const handleEmitResetUnreadMessagesCount = (data) => {
        resetUnreadMessagesCount(data);
      };

      socket.on("new_conversation", handleEmitNewConversation);

      socket.on("update_conversation", handleEmitUpdateConversation);

      socket.on(
        "reset_unread_messages_count",
        handleEmitResetUnreadMessagesCount,
      );

      return () => {
        socket.off("new_conversation");
        socket.off("update_conversation");
        socket.off("reset_unread_messages_count");
      };
    }
  }, [user, socket]);

  useEffect(() => {
    const handleOnline = () => {
      syncUserFromServer();
      fetchConversations();
      fetchNotifications();
    };

    const handleOffline = () => {};

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [fetchConversations]);

  return (
    <>
      <ProfileIncompleteDialog />
      <Routes>
        <Route element={<AuthProtectedLayout />}>
          {AUTH_LAYOUT?.map((route) => (
            <Route
              key={route.id}
              path={route.path}
              element={route.component}
            />
          ))}
        </Route>

        <Route element={<ProtectedLayout />}>
          {APP_LAYOUT?.map((route) => (
            <Route
              key={route.id}
              path={route.path}
              element={route.component}
            />
          ))}
        </Route>
      </Routes>
    </>
  );
}

function App() {
  return (
    <>
      <ToastContainer />
      <InterestDialog />
      <Router basename={`/${PATH_BASENAME}`}>
        <AppContent />
      </Router>
    </>
  );
}

export default App;
