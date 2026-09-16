import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import theme from "./theme/index.jsx";
import { ThemeProvider } from "@mui/material";
import { SocketProvider } from "./context/SocketContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <SocketProvider>
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    </SocketProvider>
  </StrictMode>,
);
