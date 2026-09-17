import { Dialog } from "@mui/material";
import { styled } from "@mui/material/styles";

const BootstrapDialog = styled(Dialog)(({ theme, fullWidth, maxWidth }) => ({
  "& .MuiDialog-paper": {
    maxWidth: maxWidth || "600px",
    width: fullWidth ? "100%" : "600px",
    borderRadius: "25px",
    boxShadow: "0px 4px 20px 0px rgba(0, 0, 0, 0.08)",
  },
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),

  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));

export const DialogBox = ({ children, ...props }) => {
  return <BootstrapDialog {...props}>{children}</BootstrapDialog>;
};
