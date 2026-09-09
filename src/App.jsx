import { useContext, useEffect } from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
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

function App() {
  // Socket Context
  const socket = useContext(SocketContext);
  // User Store
  const { user, token } = useUserStore();
  // Conversation Store
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
      fetchConversations();
    }
  }, [user]);

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
    };

    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("online", handleOnline);
    };
  }, [fetchConversations]);

  return (
    <>
      <ToastContainer />
      <InterestDialog />
      <Router basename={`/${PATH_BASENAME}`}>
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
      </Router>
    </>
  );
}

export default App;
